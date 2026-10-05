const MapelModel = require('../models/mapel.model');
const { sendSuccess } = require('../utils/response.util');

async function getAllMapel(req, res, next) {
  try {
    const kode_member = req.user?.kode_member || req.query?.kode_member;
    const subjects = await MapelModel.findAll(kode_member);
    sendSuccess(res, 'Data mata pelajaran berhasil diambil.', subjects, 200, { count: subjects.length });
  } catch (error) {
    next(error);
  }
}

async function createMapel(req, res, next) {
  try {
    const { nama_mapel, singkatan, kkm, kelompok } = req.body;
    const id = await MapelModel.create({
      nama_mapel: nama_mapel ? String(nama_mapel).trim() : '',
      singkatan: singkatan ? String(singkatan).trim() : '',
      kkm: kkm !== undefined ? parseInt(kkm, 10) : 75,
      kelompok: kelompok ? String(kelompok).trim() : 'Kelompok A (Umum)'
    });
    sendSuccess(res, 'Data mapel berhasil ditambahkan.', { kode_mapel: id }, 201);
  } catch (error) {
    next(error);
  }
}

async function updateMapel(req, res, next) {
  try {
    const { id } = req.params;
    const { nama_mapel, singkatan, kkm, kelompok } = req.body;
    const updateData = {};
    if (nama_mapel !== undefined) updateData.nama_mapel = String(nama_mapel).trim();
    if (singkatan !== undefined) updateData.singkatan = String(singkatan).trim();
    if (kkm !== undefined) updateData.kkm = parseInt(kkm, 10);
    if (kelompok !== undefined) updateData.kelompok = String(kelompok).trim();

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
