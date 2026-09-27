const MapelModel = require('../models/mapel.model');
const { sendSuccess } = require('../utils/response.util');

async function getAllMapel(req, res, next) {
  try {
    const subjects = await MapelModel.findAll();
    sendSuccess(res, 'Data mata pelajaran berhasil diambil.', subjects, 200, { count: subjects.length });
  } catch (error) {
    next(error);
  }
}

async function createMapel(req, res, next) {
  try {
    const id = await MapelModel.create(req.body);
    sendSuccess(res, 'Data mapel berhasil ditambahkan.', { kode_mapel: id }, 201);
  } catch (error) {
    next(error);
  }
}

async function updateMapel(req, res, next) {
  try {
    const { id } = req.params;
    await MapelModel.update(id, req.body);
    sendSuccess(res, 'Data mapel berhasil diperbarui.', { kode_mapel: id });
  } catch (error) {
    next(error);
  }
}

async function deleteMapel(req, res, next) {
  try {
    const { id } = req.params;
    await MapelModel.delete(id);
    sendSuccess(res, 'Data mapel berhasil dihapus.');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllMapel,
  createMapel,
  updateMapel,
  deleteMapel
};
