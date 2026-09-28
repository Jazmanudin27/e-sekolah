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
    const { nama_mapel, singkatan, kkm } = req.body;
    const id = await MapelModel.create({
      nama_mapel: nama_mapel ? String(nama_mapel).trim() : '',
      singkatan: singkatan ? String(singkatan).trim() : '',
      kkm: kkm !== undefined ? parseInt(kkm, 10) : 75
    });
    sendSuccess(res, 'Data mapel berhasil ditambahkan.', { kode_mapel: id }, 201);
  } catch (error) {
    next(error);
  }
}

async function updateMapel(req, res, next) {
  try {
    const { id } = req.params;
    const { nama_mapel, singkatan, kkm } = req.body;
    const updateData = {};
    if (nama_mapel !== undefined) updateData.nama_mapel = String(nama_mapel).trim();
    if (singkatan !== undefined) updateData.singkatan = String(singkatan).trim();
    if (kkm !== undefined) updateData.kkm = parseInt(kkm, 10);

    await MapelModel.update(id, updateData);
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
