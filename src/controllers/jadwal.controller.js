const JadwalModel = require('../models/jadwal.model');
const { sendSuccess, sendError } = require('../utils/response.util');

async function getJadwal(req, res, next) {
  try {
    const { hari, kode_kelas, kode_guru } = req.query;
    const kode_member = req.user?.kode_member || req.query?.kode_member;
    const schedules = await JadwalModel.findSchedules({ hari, kode_kelas, kode_guru, kode_member });
    sendSuccess(res, 'Data jadwal pelajaran berhasil diambil.', schedules, 200, { count: schedules.length });
  } catch (error) {
    next(error);
  }
}

async function saveJadwal(req, res, next) {
  try {
    const { schedules, hari, kode_jam, kode_kelas, kode_guru, kode_mapel } = req.body;
    if (Array.isArray(schedules)) {
      await JadwalModel.saveBatchSchedules(schedules);
      return sendSuccess(res, 'Batch jadwal pelajaran berhasil disimpan.', null);
    }
    if (hari && kode_jam && kode_kelas) {
      await JadwalModel.saveSchedule({ hari, kode_jam, kode_kelas, kode_guru, kode_mapel });
      return sendSuccess(res, 'Jadwal pelajaran berhasil diperbarui.', null);
    }
    return sendError(res, 'Parameter jadwal tidak lengkap', 400);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getJadwal,
  saveJadwal
};
