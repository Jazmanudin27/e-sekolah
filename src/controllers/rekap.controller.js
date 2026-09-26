const RekapModel = require('../models/rekap.model');
const { sendSuccess, sendError } = require('../utils/response.util');

async function getRekapSiswa(req, res, next) {
  try {
    const { bulan, tahun, kode_kelas } = req.query;
    const records = await RekapModel.getRekapSiswa({ bulan, tahun, kode_kelas });
    sendSuccess(res, 'Laporan rekap absensi siswa berhasil diambil.', records, 200, { count: records.length });
  } catch (error) {
    next(error);
  }
}

async function getRekapMapel(req, res, next) {
  try {
    const { bulan, tahun, kode_kelas, kode_mapel } = req.query;
    const records = await RekapModel.getRekapMapel({ bulan, tahun, kode_kelas, kode_mapel });
    sendSuccess(res, 'Laporan rekap absensi mata pelajaran berhasil diambil.', records, 200, { count: records.length });
  } catch (error) {
    next(error);
  }
}

async function getRekapGuru(req, res, next) {
  try {
    const { bulan, tahun } = req.query;
    const records = await RekapModel.getRekapGuru({ bulan, tahun });
    sendSuccess(res, 'Laporan kehadiran presensi guru berhasil diambil.', records, 200, { count: records.length });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getRekapSiswa,
  getRekapMapel,
  getRekapGuru
};
