const PelanggaranModel = require('../models/pelanggaran.model');
const SiswaModel = require('../models/siswa.model');
const SekolahModel = require('../models/sekolah.model');
const { query } = require('../config/database');
const { sendSuccess, sendError } = require('../utils/response.util');
const {
  formatPhoneNumber,
  getWhatsAppWebUrl,
  sendWhatsAppMessage,
  buildPelanggaranWAMessage
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

exports.getPelanggaran = async (req, res, next) => {
  try {
    const kode_member = await getKodeMember(req);
    const { kode_kelas, kode_siswa, tanggal_mulai, tanggal_selesai, kategori, search } = req.query;

    const list = await PelanggaranModel.findAll({
      kode_kelas,
      kode_siswa,
      tanggal_mulai,
      tanggal_selesai,
      kategori,
      search,
      kode_member
    });

    sendSuccess(res, 'Data pelanggaran berhasil diambil.', list, 200, { count: list.length });
  } catch (error) {
    next(error);
  }
};

exports.getPelanggaranById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const item = await PelanggaranModel.findById(id);
    if (!item) {
      return sendError(res, 'Data pelanggaran tidak ditemukan.', 404);
    }
    sendSuccess(res, 'Detail pelanggaran berhasil diambil.', item);
  } catch (error) {
    next(error);
  }
};

exports.createPelanggaran = async (req, res, next) => {
  try {
    const kode_member = await getKodeMember(req);
    const {
      kode_siswa,
      kode_kelas,
      tanggal,
      jam,
      jenis_pelanggaran,
      kategori,
      poin,
      tindakan_sanksi,
      catatan,
      pelapor,
      send_wa = true
    } = req.body;

    if (!kode_siswa || !jenis_pelanggaran) {
      return sendError(res, 'Kode siswa dan jenis pelanggaran wajib diisi.', 400);
    }

    const newId = await PelanggaranModel.create({
      kode_siswa,
      kode_kelas,
      tanggal,
      jam,
      jenis_pelanggaran,
      kategori,
      poin,
      tindakan_sanksi,
      catatan,
      pelapor,
      wa_status: 'pending',
      kode_member
    });

    // Check WhatsApp notification settings
    const sekolahConfig = await SekolahModel.get(kode_member);
    const shouldSendWA = Boolean(send_wa && (sekolahConfig?.wa_auto_pelanggaran ?? 1));

    let waResult = { sent: false, message: 'Notifikasi WA tidak diaktifkan' };

    if (shouldSendWA) {
      const detail = await PelanggaranModel.findById(newId);
      if (detail && detail.no_wa_ortu) {
        const messageText = buildPelanggaranWAMessage({
          nama_sekolah: sekolahConfig.nama_sekolah,
          nama_siswa: detail.nama_siswa || detail.kode_siswa,
          nis: detail.nis,
          nama_kelas: detail.nama_kelas,
          tanggal: detail.tanggal,
          jam: detail.jam,
          jenis_pelanggaran: detail.jenis_pelanggaran,
          kategori: detail.kategori,
          poin: detail.poin,
          tindakan_sanksi: detail.tindakan_sanksi,
          catatan: detail.catatan,
          pelapor: detail.pelapor
        });

        const sendRes = await sendWhatsAppMessage({
          target: detail.no_wa_ortu,
          message: messageText,
          config: sekolahConfig
        });

        if (sendRes.success) {
          await PelanggaranModel.updateWAStatus(newId, 'sent');
          waResult = { sent: true, message: 'Notifikasi WA berhasil terkirim ke orang tua.' };
        } else {
          await PelanggaranModel.updateWAStatus(newId, 'failed');
          waResult = { sent: false, message: `Gagal kirim WA: ${sendRes.message}` };
        }
      } else {
        await PelanggaranModel.updateWAStatus(newId, 'skipped_no_phone');
        waResult = { sent: false, message: 'Nomor WhatsApp orang tua belum terdaftar pada data siswa ini.' };
      }
    }

    sendSuccess(res, 'Data pelanggaran berhasil dicatat.', { id: newId, wa: waResult }, 201);
  } catch (error) {
    next(error);
  }
};

exports.updatePelanggaran = async (req, res, next) => {
  try {
    const { id } = req.params;
    await PelanggaranModel.update(id, req.body);
    sendSuccess(res, 'Data pelanggaran berhasil diperbarui.', { id });
  } catch (error) {
    next(error);
  }
};

exports.deletePelanggaran = async (req, res, next) => {
  try {
    const { id } = req.params;
    await PelanggaranModel.delete(id);
    sendSuccess(res, 'Data pelanggaran berhasil dihapus.');
  } catch (error) {
    next(error);
  }
};

exports.sendWAPelanggaran = async (req, res, next) => {
  try {
    const { id } = req.params;
    const kode_member = await getKodeMember(req);
    const detail = await PelanggaranModel.findById(id);

    if (!detail) {
      return sendError(res, 'Data pelanggaran tidak ditemukan.', 404);
    }

    const sekolahConfig = await SekolahModel.get(kode_member);

    const messageText = buildPelanggaranWAMessage({
      nama_sekolah: sekolahConfig.nama_sekolah,
      nama_siswa: detail.nama_siswa || detail.kode_siswa,
      nis: detail.nis,
      nama_kelas: detail.nama_kelas,
      tanggal: detail.tanggal,
      jam: detail.jam,
      jenis_pelanggaran: detail.jenis_pelanggaran,
      kategori: detail.kategori,
      poin: detail.poin,
      tindakan_sanksi: detail.tindakan_sanksi,
      catatan: detail.catatan,
      pelapor: detail.pelapor
    });

    const targetPhone = req.body.phone || detail.no_wa_ortu;
    const waUrl = getWhatsAppWebUrl(targetPhone, messageText);

    if (!targetPhone) {
      return res.json({
        success: false,
        message: 'Nomor WhatsApp orang tua belum terdaftar.',
        data: { messageText, waUrl }
      });
    }

    // Try sending via Gateway
    const sendRes = await sendWhatsAppMessage({
      target: targetPhone,
      message: messageText,
      config: sekolahConfig
    });

    if (sendRes.success) {
      await PelanggaranModel.updateWAStatus(id, 'sent');
      return sendSuccess(res, 'Notifikasi WA berhasil dikirim ke orang tua.', {
        sent: true,
        gateway: sendRes.message,
        waUrl
      });
    } else {
      await PelanggaranModel.updateWAStatus(id, 'failed');
      return res.json({
        success: false,
        message: sendRes.message,
        data: {
          sent: false,
          error: sendRes.message,
          waUrl,
          messageText
        }
      });
    }
  } catch (error) {
    next(error);
  }
};

exports.getRekapPoin = async (req, res, next) => {
  try {
    const kode_member = await getKodeMember(req);
    const { kode_kelas } = req.query;
    const rekap = await PelanggaranModel.getRekapPoin({ kode_kelas, kode_member });
    sendSuccess(res, 'Rekap poin pelanggaran siswa berhasil diambil.', rekap, 200, { count: rekap.length });
  } catch (error) {
    next(error);
  }
};

exports.getStats = async (req, res, next) => {
  try {
    const kode_member = await getKodeMember(req);
    const stats = await PelanggaranModel.getStats({ kode_member });
    sendSuccess(res, 'Statistik pelanggaran berhasil diambil.', stats);
  } catch (error) {
    next(error);
  }
};
