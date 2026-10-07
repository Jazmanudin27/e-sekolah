const KelasModel = require('../models/kelas.model');
const { sendSuccess, sendError } = require('../utils/response.util');

async function getAllKelas(req, res, next) {
  try {
    const kode_member = req.user?.kode_member || req.query?.kode_member;
    const classes = await KelasModel.findAll(kode_member);
    sendSuccess(res, 'Data kelas berhasil diambil.', classes, 200, { count: classes.length });
  } catch (error) {
    next(error);
  }
}

async function getKelasById(req, res, next) {
  try {
    const { id } = req.params;
    const kelasData = await KelasModel.findById(id);

    if (!kelasData) {
      return sendError(res, 'Kelas tidak ditemukan.', 404);
    }
    sendSuccess(res, 'Detail kelas berhasil diambil.', kelasData);
  } catch (error) {
    next(error);
  }
}

async function createKelas(req, res, next) {
  try {
    const kode_member = req.user?.kode_member || req.body?.kode_member || req.query?.kode_member || null;
    const id = await KelasModel.create({ ...req.body, kode_member });
    sendSuccess(res, 'Data kelas berhasil ditambahkan.', { kode_kelas: id }, 201);
  } catch (error) {
    next(error);
  }
}

async function updateKelas(req, res, next) {
  try {
    const { id } = req.params;
    const kode_member = req.user?.kode_member || req.body?.kode_member || req.query?.kode_member;
    const updateData = { ...req.body };
    if (kode_member && updateData.kode_member === undefined) {
      updateData.kode_member = kode_member;
    }
    await KelasModel.update(id, updateData);
    sendSuccess(res, 'Data kelas berhasil diperbarui.', { kode_kelas: id });
  } catch (error) {
    next(error);
  }
}

async function deleteKelas(req, res, next) {
  try {
    const { id } = req.params;
    await KelasModel.delete(id);
    sendSuccess(res, 'Data kelas berhasil dihapus.');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllKelas,
  getKelasById,
  createKelas,
  updateKelas,
  deleteKelas
};
