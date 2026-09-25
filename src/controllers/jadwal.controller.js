const JadwalModel = require('../models/jadwal.model');
const { sendSuccess } = require('../utils/response.util');

async function getJadwal(req, res, next) {
  try {
    const { hari, kode_kelas, kode_guru } = req.query;
    const schedules = await JadwalModel.findSchedules({ hari, kode_kelas, kode_guru });
    sendSuccess(res, 'Data jadwal pelajaran berhasil diambil.', schedules, 200, { count: schedules.length });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getJadwal
};
