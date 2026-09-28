const GuruModel = require('../models/guru.model');
const { sendSuccess, sendError } = require('../utils/response.util');

async function getAllGuru(req, res, next) {
  try {
    const { search, status } = req.query;
    const kode_member = req.user?.kode_member || req.query?.kode_member;
    const teachers = await GuruModel.findAll({ status, search, kode_member });
    sendSuccess(res, 'Data guru berhasil diambil.', teachers, 200, { count: teachers.length });
  } catch (error) {
    next(error);
  }
}

async function getGuruById(req, res, next) {
  try {
    const { id } = req.params;
    const teacher = await GuruModel.findById(id);
    if (!teacher) {
      return sendError(res, 'Guru tidak ditemukan.', 404);
    }
    sendSuccess(res, 'Detail guru berhasil diambil.', teacher);
  } catch (error) {
    next(error);
  }
}

async function createGuru(req, res, next) {
  try {
    const kode_member = req.user?.kode_member || req.body?.kode_member;
    const id = await GuruModel.create({ ...req.body, kode_member });
    sendSuccess(res, 'Data guru berhasil ditambahkan.', { kode_guru: id }, 201);
  } catch (error) {
    next(error);
  }
}

async function updateGuru(req, res, next) {
  try {
    const { id } = req.params;
    await GuruModel.update(id, req.body);
    sendSuccess(res, 'Data guru berhasil diperbarui.', { kode_guru: id });
  } catch (error) {
    next(error);
  }
}

async function deleteGuru(req, res, next) {
  try {
    const { id } = req.params;
    await GuruModel.delete(id);
    sendSuccess(res, 'Data guru berhasil dihapus.');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllGuru,
  getGuruById,
  createGuru,
  updateGuru,
  deleteGuru
};
