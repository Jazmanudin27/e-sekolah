const GuruModel = require('../models/guru.model');
const KelasModel = require('../models/kelas.model');
const MapelModel = require('../models/mapel.model');
const PresensiModel = require('../models/presensi.model');
const { sendSuccess } = require('../utils/response.util');
const { getTodayString } = require('../utils/date.util');

async function getDashboardSummary(req, res, next) {
  try {
    const today = getTodayString();

    const [totalGuru, totalKelas, totalMapel, totalPresensiHariIni] = await Promise.all([
      GuruModel.countActive(),
      KelasModel.countAll(),
      MapelModel.countAll(),
      PresensiModel.countToday(today)
    ]);

    sendSuccess(res, 'Ringkasan data dashboard berhasil diambil.', {
      total_guru: totalGuru,
      total_kelas: totalKelas,
      total_mapel: totalMapel,
      total_presensi_hari_ini: totalPresensiHariIni,
      tanggal: today
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getDashboardSummary
};
