const SiswaModel = require('../models/siswa.model');
const { sendSuccess, sendError } = require('../utils/response.util');

async function getSiswaByKelas(req, res, next) {
  try {
    const targetKelas = req.query.kode_kelas || req.query.kelas_id;
    const kode_member = req.user?.kode_member || req.query?.kode_member;
    const effectiveKodeKelas = (req.user && req.user.type === 'Kelas' && req.user.kode_kelas) 
      ? req.user.kode_kelas 
      : targetKelas;

    const status = req.query.status || null;
    const students = await SiswaModel.findAll(effectiveKodeKelas || null, kode_member || null, status);
    sendSuccess(res, 'Data siswa berhasil diambil dari database.', students, 200, { count: students.length });
  } catch (error) {
    next(error);
  }
}

async function createSiswa(req, res, next) {
  try {
    const kode_member = req.user?.kode_member || req.body?.kode_member || req.query?.kode_member || null;
    const id = await SiswaModel.create({ ...req.body, kode_member });
    sendSuccess(res, 'Data siswa berhasil ditambahkan.', { kode_siswa: id }, 201);
  } catch (error) {
    next(error);
  }
}

async function updateSiswa(req, res, next) {
  try {
    const { id } = req.params;
    const kode_member = req.user?.kode_member || req.body?.kode_member || req.query?.kode_member;
    const updateData = { ...req.body };
    if (kode_member && updateData.kode_member === undefined) {
      updateData.kode_member = kode_member;
    }
    await SiswaModel.update(id, updateData);
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
