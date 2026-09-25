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

module.exports = {
  getAllMapel
};
