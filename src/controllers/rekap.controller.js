const RekapModel = require('../models/rekap.model');
const { sendSuccess, sendError } = require('../utils/response.util');

async function getRekapSiswa(req, res, next) {
  try {
    const { bulan, tahun, kode_kelas } = req.query;
    const kode_member = req.user?.kode_member || req.query?.kode_member;
    const effectiveKodeKelas = (req.user && req.user.type === 'Kelas' && req.user.kode_kelas) 
      ? req.user.kode_kelas 
      : kode_kelas;

    const records = await RekapModel.getRekapSiswa({ bulan, tahun, kode_kelas: effectiveKodeKelas, kode_member });
    sendSuccess(res, 'Laporan rekap absensi siswa berhasil diambil.', records, 200, { count: records.length });
  } catch (error) {
    next(error);
  }
}

async function getRekapMapel(req, res, next) {
  try {
    const { bulan, tahun, kode_kelas, kode_mapel } = req.query;
    const kode_member = req.user?.kode_member || req.query?.kode_member;
    const effectiveKodeKelas = (req.user && req.user.type === 'Kelas' && req.user.kode_kelas) 
      ? req.user.kode_kelas 
      : kode_kelas;

    const records = await RekapModel.getRekapMapel({ bulan, tahun, kode_kelas: effectiveKodeKelas, kode_mapel, kode_member });
    sendSuccess(res, 'Laporan rekap absensi mata pelajaran berhasil diambil.', records, 200, { count: records.length });
  } catch (error) {
    next(error);
  }
}

async function getRekapGuru(req, res, next) {
  try {
    const { bulan, tahun, kode_guru } = req.query;
    const kode_member = req.user?.kode_member || req.query?.kode_member;
    let records = await RekapModel.getRekapGuru({ bulan, tahun, kode_member });

    const userRole = String(req.user?.role || req.user?.level || '').toLowerCase();
    const isFullAccess = ['admin', 'superadmin', 'kepala sekolah', 'kepala_sekolah', 'kepsek', 'tu', 'operator'].includes(userRole);

    if (!isFullAccess && (req.user?.kode_guru || req.user?.nama_guru)) {
      const myGuruId = String(req.user.kode_guru || '');
      const myNama = String(req.user.nama_guru || req.user.name || '').toLowerCase();

      records = records.filter(r =>
        (r.kode_guru && String(r.kode_guru) === myGuruId) ||
        (r.nama_guru && String(r.nama_guru).toLowerCase() === myNama)
      );
    } else if (kode_guru) {
      records = records.filter(r => String(r.kode_guru) === String(kode_guru));
    }

    sendSuccess(res, 'Laporan kehadiran presensi guru berhasil diambil.', records, 200, { count: records.length });
  } catch (error) {
    next(error);
  }
}

async function getDetailSiswa(req, res, next) {
  try {
    const { kode_siswa, bulan, tahun } = req.query;
    if (!kode_siswa) {
      return sendError(res, 'kode_siswa wajib diisi.', 400);
    }
    const records = await RekapModel.getDetailSiswa({ kode_siswa, bulan, tahun });
    sendSuccess(res, 'Detail absensi siswa berhasil diambil.', records, 200, { count: records.length });
  } catch (error) {
    next(error);
  }
}

async function getDetailMapel(req, res, next) {
  try {
    const { kode_siswa, kode_mapel, bulan, tahun } = req.query;
    if (!kode_siswa) {
      return sendError(res, 'kode_siswa wajib diisi.', 400);
    }
    const records = await RekapModel.getDetailMapel({ kode_siswa, kode_mapel, bulan, tahun });
    sendSuccess(res, 'Detail absensi mapel siswa berhasil diambil.', records, 200, { count: records.length });
  } catch (error) {
    next(error);
  }
}

async function getDetailGuru(req, res, next) {
  try {
    const { bulan, tahun } = req.query;
    const targetKodeGuru = req.query.kode_guru || req.user?.kode_guru;

    if (!targetKodeGuru) {
      return sendError(res, 'kode_guru wajib diisi.', 400);
    }

    const records = await RekapModel.getDetailGuru({ kode_guru: targetKodeGuru, bulan, tahun });
    sendSuccess(res, 'Detail presensi guru berhasil diambil.', records, 200, { count: records.length });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getRekapSiswa,
  getRekapMapel,
  getRekapGuru,
  getDetailSiswa,
  getDetailMapel,
  getDetailGuru
};
