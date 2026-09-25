const AbsensiMapelModel = require('../models/absensiMapel.model');
const { sendSuccess, sendError } = require('../utils/response.util');

async function getAbsensiMapel(req, res, next) {
  try {
    const { tanggal, kode_kelas, kode_mapel, kode_guru } = req.query;
    const records = await AbsensiMapelModel.findAll({ tanggal, kode_kelas, kode_mapel, kode_guru });
    sendSuccess(res, 'Data absensi mata pelajaran berhasil diambil.', records, 200, { count: records.length });
  } catch (error) {
    next(error);
  }
}

async function saveAbsensiMapel(req, res, next) {
  try {
    const { tanggal, kode_kelas, kode_guru, kode_mapel, list_absensi } = req.body;

    if (!tanggal || !kode_kelas || !kode_guru || !kode_mapel || !Array.isArray(list_absensi)) {
      return sendError(res, 'Data tanggal, kode_kelas, kode_guru, kode_mapel, dan list_absensi wajib diisi.', 400);
    }

    const savedRecords = [];

    for (const item of list_absensi) {
      const { kode_siswa, status } = item;
      if (!kode_siswa || !status) continue;

      const existing = await AbsensiMapelModel.findExisting({
        tanggal,
        kode_kelas,
        kode_guru,
        kode_mapel,
        kode_siswa
      });

      if (existing) {
        await AbsensiMapelModel.updateStatus(existing.id, status);
        savedRecords.push({ id: existing.id, kode_siswa, status, action: 'updated' });
      } else {
        const id = await AbsensiMapelModel.create({
          tanggal,
          kode_kelas,
          kode_guru,
          kode_mapel,
          kode_siswa,
          status
        });
        savedRecords.push({ id, kode_siswa, status, action: 'inserted' });
      }
    }

    sendSuccess(res, 'Absensi mata pelajaran berhasil disimpan.', savedRecords, 200, { count: savedRecords.length });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAbsensiMapel,
  saveAbsensiMapel
};
