const IzinModel = require('../models/izin.model');
const { sendSuccess, sendError } = require('../utils/response.util');

async function getIzin(req, res, next) {
  try {
    const records = await IzinModel.findAll();
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

    const pengaju = nama_guru || nama_pengaju || req.user?.nama_guru || req.user?.name || req.user?.username || 'Guru / Pegawai';
    const user_id = kode_guru || req.user?.id || null;
    const finalJenis = jenis || jenis_izin || 'Sakit';

    let durasi = '1 Hari';
    if (tanggal_selesai && tanggal_selesai !== tanggal_mulai) {
      durasi = 'Multi Hari';
    }

    const insertId = await IzinModel.create({
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
  deleteIzin
};
