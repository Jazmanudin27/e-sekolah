const SiswaModel = require('../models/siswa.model');
const { sendSuccess, sendError } = require('../utils/response.util');

async function getSiswaByKelas(req, res, next) {
  try {
    const { kode_kelas } = req.query;
    const effectiveKodeKelas = (req.user && req.user.type === 'Kelas' && req.user.kode_kelas) 
      ? req.user.kode_kelas 
      : kode_kelas;

    const students = await SiswaModel.findAll(effectiveKodeKelas || null);
    sendSuccess(res, 'Data siswa berhasil diambil dari database.', students, 200, { count: students.length });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getSiswaByKelas
};
