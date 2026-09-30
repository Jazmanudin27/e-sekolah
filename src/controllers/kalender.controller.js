const KalenderModel = require('../models/kalender.model');
const { sendSuccess, sendError } = require('../utils/response.util');

async function getKalender(req, res, next) {
  try {
    const { tahun_ajaran, semester, bulan, tahun, kategori } = req.query;
    const events = await KalenderModel.getAll({ tahun_ajaran, semester, bulan, tahun, kategori });
    sendSuccess(res, 'Data kalender pendidikan berhasil diambil.', events, 200, { total: events.length });
  } catch (error) {
    next(error);
  }
}

async function getKalenderById(req, res, next) {
  try {
    const { id } = req.params;
    const item = await KalenderModel.getById(id);
    if (!item) {
      return sendError(res, 'Agenda kalender tidak ditemukan.', 404);
    }
    sendSuccess(res, 'Detail kalender berhasil diambil.', item);
  } catch (error) {
    next(error);
  }
}

async function createKalender(req, res, next) {
  try {
    const { nama_kegiatan, tanggal_mulai } = req.body;
    if (!nama_kegiatan || !tanggal_mulai) {
      return sendError(res, 'Nama kegiatan dan tanggal mulai wajib diisi.', 400);
    }
    const id = await KalenderModel.create(req.body);
    sendSuccess(res, 'Agenda kalender berhasil ditambahkan.', { id, ...req.body }, 201);
  } catch (error) {
    next(error);
  }
}

async function updateKalender(req, res, next) {
  try {
    const { id } = req.params;
    await KalenderModel.update(id, req.body);
    sendSuccess(res, 'Agenda kalender berhasil diperbarui.', { id });
  } catch (error) {
    next(error);
  }
}

async function deleteKalender(req, res, next) {
  try {
    const { id } = req.params;
    await KalenderModel.delete(id);
    sendSuccess(res, 'Agenda kalender berhasil dihapus.');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getKalender,
  getKalenderById,
  createKalender,
  updateKalender,
  deleteKalender
};
