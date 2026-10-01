const AbsensiSiswaModel = require('../models/absensiSiswa.model');
const { sendSuccess, sendError } = require('../utils/response.util');

async function getAbsensiSiswa(req, res, next) {
  try {
    const { tanggal, kode_kelas } = req.query;
    const effectiveKodeKelas = (req.user && req.user.type === 'Kelas' && req.user.kode_kelas) 
      ? req.user.kode_kelas 
      : kode_kelas;

    const records = await AbsensiSiswaModel.findAll({ tanggal, kode_kelas: effectiveKodeKelas });
    sendSuccess(res, 'Data absensi siswa berhasil diambil.', records, 200, { count: records.length });
  } catch (error) {
    next(error);
  }
}

async function saveAbsensiSiswa(req, res, next) {
  try {
    const { tanggal, kode_kelas, list_absensi, records } = req.body;
    const effectiveKodeKelas = (req.user && req.user.type === 'Kelas' && req.user.kode_kelas) 
      ? req.user.kode_kelas 
      : kode_kelas;

    const items = Array.isArray(list_absensi) ? list_absensi : Array.isArray(records) ? records : [];

    if (!tanggal || !effectiveKodeKelas || items.length === 0) {
      return sendError(res, 'Data tanggal, kode_kelas, dan list_absensi (array) wajib diisi.', 400);
    }

    const savedRecords = [];

    for (const item of items) {
      const kode_siswa = item.kode_siswa || item.nisn || item.nis_nisn || item.id;
      const status = item.status || 'H';
      if (!kode_siswa) continue;

      const existing = await AbsensiSiswaModel.findExisting(tanggal, effectiveKodeKelas, kode_siswa);

      if (existing) {
        await AbsensiSiswaModel.updateStatus(existing.id, status);
        savedRecords.push({ id: existing.id, kode_siswa, status, action: 'updated' });
      } else {
        const id = await AbsensiSiswaModel.create({ tanggal, kode_kelas: effectiveKodeKelas, kode_siswa, status });
        savedRecords.push({ id, kode_siswa, status, action: 'inserted' });
      }
    }

    sendSuccess(res, 'Data absensi siswa berhasil disimpan.', savedRecords, 200, { count: savedRecords.length });
  } catch (error) {
    next(error);
  }
}

async function getAbsensiRaporSummary(req, res, next) {
  try {
    const { kode_siswa, kode_kelas, tahun_ajaran, semester } = req.query;
    if (!kode_siswa) {
      return sendError(res, 'Parameter kode_siswa wajib diisi.', 400);
    }
    const data = await AbsensiSiswaModel.getAbsensiRaporSummary({ kode_siswa, kode_kelas, tahun_ajaran, semester });
    sendSuccess(res, 'Summary absensi rapor berhasil diambil.', data);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAbsensiSiswa,
  saveAbsensiSiswa,
  getAbsensiRaporSummary
};
