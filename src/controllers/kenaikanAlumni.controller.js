const KenaikanAlumniModel = require('../models/kenaikanAlumni.model');
const { sendSuccess, sendError } = require('../utils/response.util');

async function prosesKenaikan(req, res, next) {
  try {
    const { siswa_ids, kelas_asal_id, kelas_tujuan_id, tahun_ajaran, keterangan } = req.body;
    if (!siswa_ids || !Array.isArray(siswa_ids) || siswa_ids.length === 0) {
      return sendError(res, 'Pilih minimal satu siswa untuk dinaikkan kelasnya.', 400);
    }
    if (!kelas_tujuan_id) {
      return sendError(res, 'Kelas tujuan harus dipilih.', 400);
    }

    const result = await KenaikanAlumniModel.prosesKenaikanKelas({
      siswa_ids,
      kelas_asal_id,
      kelas_tujuan_id,
      tahun_ajaran,
      keterangan
    });

    sendSuccess(res, `Berhasil memproses kenaikan ${result.total_siswa} siswa ke ${result.kelas_tujuan}.`, result);
  } catch (error) {
    next(error);
  }
}

async function prosesKelulusan(req, res, next) {
  try {
    const { siswa_ids, kelas_asal_id, tahun_lulus, catatan } = req.body;
    if (!siswa_ids || !Array.isArray(siswa_ids) || siswa_ids.length === 0) {
      return sendError(res, 'Pilih minimal satu siswa untuk diluluskan.', 400);
    }
    if (!tahun_lulus) {
      return sendError(res, 'Tahun kelulusan wajib ditentukan.', 400);
    }

    const result = await KenaikanAlumniModel.prosesKelulusan({
      siswa_ids,
      kelas_asal_id,
      tahun_lulus,
      catatan
    });

    sendSuccess(res, `Berhasil meluluskan ${result.total_siswa} siswa (Tahun Lulus: ${result.tahun_lulus}).`, result);
  } catch (error) {
    next(error);
  }
}

async function batalAlumni(req, res, next) {
  try {
    const { id } = req.params;
    const { kode_kelas_tujuan, keterangan } = req.body;

    const result = await KenaikanAlumniModel.batalAlumni({
      kode_siswa: id,
      kode_kelas_tujuan,
      keterangan
    });

    sendSuccess(res, `Status alumni siswa ${result.nama_siswa} berhasil dibatalkan dan dikembalikan ke siswa aktif.`, result);
  } catch (error) {
    next(error);
  }
}

async function getAlumniList(req, res, next) {
  try {
    const { search, tahun_lulus, limit, offset } = req.query;
    const data = await KenaikanAlumniModel.getAlumniList({
      search,
      tahun_lulus,
      limit: limit ? Number(limit) : 100,
      offset: offset ? Number(offset) : 0
    });
    sendSuccess(res, 'Data alumni berhasil diambil.', data);
  } catch (error) {
    next(error);
  }
}

async function getTahunLulus(req, res, next) {
  try {
    const options = await KenaikanAlumniModel.getTahunLulusOptions();
    sendSuccess(res, 'Opsi tahun kelulusan berhasil diambil.', options);
  } catch (error) {
    next(error);
  }
}

async function getRiwayat(req, res, next) {
  try {
    const limit = req.query.limit ? Number(req.query.limit) : 100;
    const logs = await KenaikanAlumniModel.getRiwayat(limit);
    sendSuccess(res, 'Riwayat kenaikan dan kelulusan berhasil diambil.', logs);
  } catch (error) {
    next(error);
  }
}

async function getStats(req, res, next) {
  try {
    const stats = await KenaikanAlumniModel.getStatistik();
    sendSuccess(res, 'Statistik siswa dan alumni berhasil diambil.', stats);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  prosesKenaikan,
  prosesKelulusan,
  batalAlumni,
  getAlumniList,
  getTahunLulus,
  getRiwayat,
  getStats
};
