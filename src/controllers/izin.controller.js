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
    const { jenis, tanggal_mulai, tanggal_selesai, keterangan } = req.body;

    if (!tanggal_mulai || !keterangan) {
      return sendError(res, 'Tanggal mulai dan keterangan wajib diisi.', 400);
    }

    const nama_pengaju = req.user?.nama_guru || req.user?.username || 'Citra Dewi, S.Pd.';
    const user_id = req.user?.id || null;

    let durasi = '1 Hari';
    if (tanggal_selesai && tanggal_selesai !== tanggal_mulai) {
      durasi = 'Multi Hari';
    }

    const insertId = await IzinModel.create({
      user_id,
      nama_pengaju,
      jenis,
      tanggal_mulai,
      tanggal_selesai,
      durasi,
      keterangan
    });

    sendSuccess(res, 'Pengajuan izin berhasil disimpan ke database.', { id: insertId }, 201);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getIzin,
  createIzin
};
