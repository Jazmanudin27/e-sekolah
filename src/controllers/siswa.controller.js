const SiswaModel = require('../models/siswa.model');
const { sendSuccess, sendError } = require('../utils/response.util');

async function getSiswaByKelas(req, res, next) {
  try {
    const { kode_kelas } = req.query;

    const students = await SiswaModel.findAll(kode_kelas || null);
    sendSuccess(res, 'Data siswa berhasil diambil dari database.', students, 200, { count: students.length });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getSiswaByKelas
};
