const SiswaModel = require('../models/siswa.model');
const { sendSuccess, sendError } = require('../utils/response.util');

async function getSiswaByKelas(req, res, next) {
  try {
    const { kode_kelas } = req.query;
    if (!kode_kelas) {
      return sendError(res, 'Parameter kode_kelas wajib diisi.', 400);
    }

    const students = await SiswaModel.findByKelas(kode_kelas);
    sendSuccess(res, 'Data siswa berhasil diambil dari database.', students, 200, { count: students.length });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getSiswaByKelas
};
