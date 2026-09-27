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

async function createSiswa(req, res, next) {
  try {
    const id = await SiswaModel.create(req.body);
    sendSuccess(res, 'Data siswa berhasil ditambahkan.', { kode_siswa: id }, 201);
  } catch (error) {
    next(error);
  }
}

async function updateSiswa(req, res, next) {
  try {
    const { id } = req.params;
    await SiswaModel.update(id, req.body);
    sendSuccess(res, 'Data siswa berhasil diperbarui.', { kode_siswa: id });
  } catch (error) {
    next(error);
  }
}

async function deleteSiswa(req, res, next) {
  try {
    const { id } = req.params;
    await SiswaModel.delete(id);
    sendSuccess(res, 'Data siswa berhasil dihapus.');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getSiswaByKelas,
  createSiswa,
  updateSiswa,
  deleteSiswa
};
