const KelasModel = require('../models/kelas.model');
const { sendSuccess, sendError } = require('../utils/response.util');

async function getAllKelas(req, res, next) {
  try {
    const classes = await KelasModel.findAll();
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

module.exports = {
  getAllKelas,
  getKelasById
};
