const IzinModel = require('../models/izin.model');
const { query } = require('../config/database');
const { sendSuccess, sendError } = require('../utils/response.util');

async function getKodeMemberFromReq(req) {
  let km = req.user?.kode_member || req.query?.kode_member || req.body?.kode_member;
  if (km) return km;

  if (req.user) {
    if (req.user.type === 'Guru' || req.user.kode_guru) {
      try {
        const rows = await query(
          'SELECT kode_member FROM guru WHERE kode_guru = ? OR username = ? LIMIT 1',
          [req.user.kode_guru || '', req.user.username || '']
        );
        if (rows && rows[0]?.kode_member) return rows[0].kode_member;
      } catch (e) {}
    }

    if (req.user.type === 'Admin' || req.user.id || req.user.username) {
      try {
        const rows = await query(
          'SELECT kode_member FROM users WHERE id = ? OR username = ? LIMIT 1',
          [req.user.id || 0, req.user.username || '']
        );
        if (rows && rows[0]?.kode_member) return rows[0].kode_member;
      } catch (e) {}
    }
  }

  return null;
}

async function getIzin(req, res, next) {
  try {
    const kode_member = await getKodeMemberFromReq(req);
    const records = await IzinModel.findAll(kode_member);
    sendSuccess(res, 'Data pengajuan izin berhasil diambil dari database.', records, 200, { count: records.length });
  } catch (error) {
    next(error);
  }
}

async function createIzin(req, res, next) {
  try {
    const { jenis, jenis_izin, kode_guru, nama_guru, nama_pengaju, tanggal_mulai, tanggal_selesai, keterangan, status } = req.body;

    if (!tanggal_mulai) {
      return sendError(res, 'Tanggal mulai wajib diisi.', 400);
    }

    const kode_member = await getKodeMemberFromReq(req);
    const user_id = kode_guru || req.user?.kode_guru || req.user?.id || null;
    let pengaju = nama_guru || nama_pengaju || req.user?.nama_guru || req.user?.name || req.user?.username;

    if (user_id && (!pengaju || !isNaN(pengaju) || pengaju === 'Guru Pengajar' || pengaju === 'Guru / Pegawai')) {
      try {
        const gRows = await query('SELECT nama_guru FROM guru WHERE kode_guru = ? LIMIT 1', [user_id]);
        if (gRows && gRows[0]?.nama_guru) {
          pengaju = gRows[0].nama_guru;
        }
      } catch (e) {}
    }
    if (!pengaju) pengaju = req.user?.nama_guru || req.user?.name || req.user?.username || 'Guru Pengajar';

    const finalJenis = jenis || jenis_izin || 'Sakit';

    let durasi = '1 Hari';
    if (tanggal_selesai && tanggal_selesai !== tanggal_mulai) {
      durasi = 'Multi Hari';
    }

    const insertId = await IzinModel.create({
      kode_member,
      user_id,
      nama_pengaju: pengaju,
      jenis: finalJenis,
      tanggal_mulai,
      tanggal_selesai: tanggal_selesai || tanggal_mulai,
      durasi,
      keterangan: keterangan || 'Pengajuan Izin',
      status: status || 'Menunggu'
    });

    sendSuccess(res, 'Surat izin berhasil ditambahkan ke database.', { id: insertId }, 201);
  } catch (error) {
    next(error);
  }
}

async function updateIzin(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await IzinModel.findById(id);

    if (!existing) {
      return sendError(res, 'Data pengajuan izin tidak ditemukan.', 404);
    }

    const { jenis, jenis_izin, kode_guru, nama_guru, nama_pengaju, tanggal_mulai, tanggal_selesai, keterangan, status } = req.body;

    const kode_member = await getKodeMemberFromReq(req) || existing.kode_member;
    const user_id = kode_guru !== undefined ? kode_guru : existing.user_id;
    let pengaju = nama_guru || nama_pengaju || existing.nama_pengaju;

    if (user_id && (!pengaju || !isNaN(pengaju) || pengaju === 'Guru Pengajar' || pengaju === 'Guru / Pegawai')) {
      try {
        const gRows = await query('SELECT nama_guru FROM guru WHERE kode_guru = ? LIMIT 1', [user_id]);
        if (gRows && gRows[0]?.nama_guru) {
          pengaju = gRows[0].nama_guru;
        }
      } catch (e) {}
    }

    const finalJenis = jenis || jenis_izin || existing.jenis;
    const tglMulai = tanggal_mulai || existing.tanggal_mulai;
    const tglSelesai = tanggal_selesai || existing.tanggal_selesai || tglMulai;

    let durasi = '1 Hari';
    if (tglSelesai && tglSelesai !== tglMulai) {
      durasi = 'Multi Hari';
    }

    const updatedData = await IzinModel.update(id, {
      kode_member,
      user_id,
      nama_pengaju: pengaju,
      jenis: finalJenis,
      tanggal_mulai: tglMulai,
      tanggal_selesai: tglSelesai,
      durasi,
      keterangan: keterangan !== undefined ? keterangan : existing.keterangan,
      status: status !== undefined ? status : existing.status,
      disetujui_oleh: status === 'Disetujui' ? 'Administrator' : existing.disetujui_oleh
    });

    sendSuccess(res, 'Data pengajuan izin berhasil diperbarui.', updatedData);
  } catch (error) {
    next(error);
  }
}

async function deleteIzin(req, res, next) {
  try {
    const { id } = req.params;
    const existing = await IzinModel.findById(id);

    if (!existing) {
      return sendError(res, 'Data pengajuan izin tidak ditemukan.', 404);
    }

    if (existing.status === 'Disetujui' || existing.status === 'APPROVED') {
      return sendError(res, 'Pengajuan izin yang sudah disetujui tidak dapat dihapus.', 400);
    }

    await IzinModel.delete(id);
    sendSuccess(res, 'Pengajuan izin berhasil dihapus.', { id });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getIzin,
  createIzin,
  updateIzin,
  deleteIzin
};
