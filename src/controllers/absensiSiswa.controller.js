const AbsensiSiswaModel = require('../models/absensiSiswa.model');
const { sendSuccess, sendError } = require('../utils/response.util');

async function getAbsensiSiswa(req, res, next) {
  try {
    const { tanggal, kode_kelas } = req.query;
    const records = await AbsensiSiswaModel.findAll({ tanggal, kode_kelas });
    sendSuccess(res, 'Data absensi siswa berhasil diambil.', records, 200, { count: records.length });
  } catch (error) {
    next(error);
  }
}

async function saveAbsensiSiswa(req, res, next) {
  try {
    const { tanggal, kode_kelas, list_absensi } = req.body;

    if (!tanggal || !kode_kelas || !Array.isArray(list_absensi) || list_absensi.length === 0) {
      return sendError(res, 'Data tanggal, kode_kelas, dan list_absensi (array) wajib diisi.', 400);
    }

    const savedRecords = [];

    for (const item of list_absensi) {
      const { kode_siswa, status } = item;
      if (!kode_siswa || !status) continue;

      const existing = await AbsensiSiswaModel.findExisting(tanggal, kode_kelas, kode_siswa);

      if (existing) {
        await AbsensiSiswaModel.updateStatus(existing.id, status);
        savedRecords.push({ id: existing.id, kode_siswa, status, action: 'updated' });
      } else {
        const id = await AbsensiSiswaModel.create({ tanggal, kode_kelas, kode_siswa, status });
        savedRecords.push({ id, kode_siswa, status, action: 'inserted' });
      }
    }

    sendSuccess(res, 'Data absensi siswa berhasil disimpan.', savedRecords, 200, { count: savedRecords.length });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAbsensiSiswa,
  saveAbsensiSiswa
};
