const AbsensiSiswaModel = require('../models/absensiSiswa.model');
const SekolahModel = require('../models/sekolah.model');
const { query } = require('../config/database');
const { sendSuccess, sendError } = require('../utils/response.util');
const {
  formatPhoneNumber,
  getWhatsAppWebUrl,
  sendWhatsAppMessage,
  buildAbsensiWAMessage
} = require('../utils/whatsapp.util');

async function getKodeMember(req) {
  let km = req.user?.kode_member || req.query?.kode_member || req.body?.kode_member;
  if (km) return km;

  if (req.user?.username) {
    try {
      const rows = await query('SELECT kode_member FROM users WHERE username = ? LIMIT 1', [req.user.username]);
      if (rows && rows[0]?.kode_member) return rows[0].kode_member;
    } catch (e) {}
  }
  return null;
}

async function getAbsensiSiswa(req, res, next) {
  try {
    let { tanggal, kode_kelas, siswa_id, kode_siswa } = req.query;
    if (req.user && (req.user.type === 'Siswa' || req.user.type === 'Ortu')) {
      kode_siswa = req.user.kode_siswa;
    }
    const effectiveKodeSiswa = kode_siswa || siswa_id;
    const effectiveKodeKelas = (req.user && req.user.type === 'Kelas' && req.user.kode_kelas) 
      ? req.user.kode_kelas 
      : kode_kelas;

    const records = await AbsensiSiswaModel.findAll({
      tanggal,
      kode_kelas: effectiveKodeKelas,
      kode_siswa: effectiveKodeSiswa
    });
    sendSuccess(res, 'Data absensi harian siswa berhasil diambil.', records, 200, { count: records.length });
  } catch (error) {
    next(error);
  }
}

async function saveAbsensiSiswa(req, res, next) {
  try {
    const { tanggal, kode_kelas, list_absensi, records, send_wa = true } = req.body;
    const effectiveKodeKelas = (req.user && req.user.type === 'Kelas' && req.user.kode_kelas) 
      ? req.user.kode_kelas 
      : kode_kelas;

    const items = Array.isArray(list_absensi) ? list_absensi : Array.isArray(records) ? records : [];

    if (!tanggal || !effectiveKodeKelas || items.length === 0) {
      return sendError(res, 'Data tanggal, kode_kelas, dan list_absensi (array) wajib diisi.', 400);
    }

    const savedRecords = [];
    const absentItems = []; // To notify via WA

    for (const item of items) {
      const kode_siswa = item.kode_siswa || item.nisn || item.nis_nisn || item.id;
      const status = item.status || 'H';
      if (!kode_siswa) continue;

      const existing = await AbsensiSiswaModel.findExisting(tanggal, effectiveKodeKelas, kode_siswa);

      if (existing) {
        await AbsensiSiswaModel.updateStatus(existing.id, status);
        savedRecords.push({ id: existing.id, kode_siswa, status, action: 'updated' });
      } else {
        const id = await AbsensiSiswaModel.create({ tanggal, kode_kelas: effectiveKodeKelas, kode_siswa, status });
        savedRecords.push({ id, kode_siswa, status, action: 'inserted' });
      }

      // Check if status is Absent: A (Alpa), S (Sakit), I (Izin)
      const stUpper = String(status).toUpperCase();
      if (['A', 'S', 'I', 'ALPHA', 'ALPA', 'SAKIT', 'IZIN'].includes(stUpper)) {
        absentItems.push({ kode_siswa, status, catatan: item.catatan || '' });
      }
    }

    // Process WhatsApp notifications if enabled
    let waSummary = { enabled: false, sent: 0, failed: 0, skipped: 0 };
    const kode_member = await getKodeMember(req);
    const sekolahConfig = await SekolahModel.get(kode_member);

    if (send_wa && (sekolahConfig?.wa_auto_absen ?? 1) && absentItems.length > 0) {
      waSummary.enabled = true;

      for (const item of absentItems) {
        try {
          const studentRows = await query(
            `SELECT s.nama_siswa, COALESCE(s.nis, s.kode_siswa) AS nis, s.no_wa_ortu, s.nama_ortu, k.nama_kelas 
             FROM siswa s 
             LEFT JOIN kelas k ON (s.kode_kelas = k.kode_kelas OR s.kode_kelas = k.id)
             WHERE (CONVERT(s.kode_siswa USING utf8mb4) = CONVERT(? USING utf8mb4) OR CONVERT(s.nis USING utf8mb4) = CONVERT(? USING utf8mb4))
             LIMIT 1`,
            [item.kode_siswa, item.kode_siswa]
          );

          if (studentRows && studentRows.length > 0) {
            const st = studentRows[0];
            if (st.no_wa_ortu) {
              const message = buildAbsensiWAMessage({
                nama_sekolah: sekolahConfig.nama_sekolah,
                nama_siswa: st.nama_siswa,
                nis: st.nis,
                nama_kelas: st.nama_kelas || effectiveKodeKelas,
                tanggal,
                status: item.status,
                catatan: item.catatan
              });

              const sendRes = await sendWhatsAppMessage({
                target: st.no_wa_ortu,
                message,
                config: sekolahConfig
              });

              if (sendRes.success) {
                waSummary.sent++;
              } else {
                waSummary.failed++;
              }
            } else {
              waSummary.skipped++;
            }
          } else {
            waSummary.skipped++;
          }
        } catch (err) {
          console.error('[saveAbsensiSiswa.sendWA] Error:', err.message);
          waSummary.failed++;
        }
      }
    }

    sendSuccess(res, 'Data absensi siswa berhasil disimpan.', savedRecords, 200, {
      count: savedRecords.length,
      wa_notifications: waSummary
    });
  } catch (error) {
    next(error);
  }
}

async function sendSingleAbsensiWA(req, res, next) {
  try {
    const { kode_siswa, tanggal, status, catatan, phone } = req.body;
    const kode_member = await getKodeMember(req);
    const sekolahConfig = await SekolahModel.get(kode_member);

    const studentRows = await query(
      `SELECT s.nama_siswa, COALESCE(s.nis, s.kode_siswa) AS nis, s.no_wa_ortu, s.nama_ortu, k.nama_kelas 
       FROM siswa s 
       LEFT JOIN kelas k ON (s.kode_kelas = k.kode_kelas OR s.kode_kelas = k.id)
       WHERE (CONVERT(s.kode_siswa USING utf8mb4) = CONVERT(? USING utf8mb4) OR CONVERT(s.nis USING utf8mb4) = CONVERT(? USING utf8mb4))
       LIMIT 1`,
      [kode_siswa, kode_siswa]
    );

    const st = studentRows[0] || {};
    const targetPhone = phone || st.no_wa_ortu;

    const message = buildAbsensiWAMessage({
      nama_sekolah: sekolahConfig.nama_sekolah,
      nama_siswa: st.nama_siswa || kode_siswa,
      nis: st.nis,
      nama_kelas: st.nama_kelas,
      tanggal: tanggal || new Date().toISOString().split('T')[0],
      status: status || 'A',
      catatan
    });

    const waUrl = getWhatsAppWebUrl(targetPhone, message);

    if (!targetPhone) {
      return res.json({
        success: false,
        message: 'Nomor WhatsApp orang tua belum terdaftar.',
        data: { message, waUrl }
      });
    }

    const sendRes = await sendWhatsAppMessage({
      target: targetPhone,
      message,
      config: sekolahConfig
    });

    if (sendRes.success) {
      return sendSuccess(res, 'Notifikasi WA berhasil dikirim ke orang tua.', {
        sent: true,
        gateway: sendRes.message,
        waUrl
      });
    } else {
      return res.json({
        success: false,
        message: sendRes.message,
        data: {
          sent: false,
          error: sendRes.message,
          waUrl,
          message
        }
      });
    }
  } catch (error) {
    next(error);
  }
}

async function getAbsensiRaporSummary(req, res, next) {
  try {
    const { kode_siswa, kode_kelas, tahun_ajaran, semester } = req.query;
    if (!kode_siswa) {
      return sendError(res, 'Parameter kode_siswa wajib diisi.', 400);
    }
    const data = await AbsensiSiswaModel.getAbsensiRaporSummary({ kode_siswa, kode_kelas, tahun_ajaran, semester });
    sendSuccess(res, 'Summary absensi rapor berhasil diambil.', data);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAbsensiSiswa,
  saveAbsensiSiswa,
  sendSingleAbsensiWA,
  getAbsensiRaporSummary
};

