const EkskulModel = require('../models/ekskul.model');
const { sendSuccess, sendError } = require('../utils/response.util');

// ============ MASTER EKSKUL ============

async function getAllEkskul(req, res, next) {
  try {
    const kode_member = req.user?.kode_member || req.query?.kode_member;
    const list = await EkskulModel.findAll(kode_member);
    sendSuccess(res, 'Data ekstrakurikuler berhasil diambil.', list, 200, { count: list.length });
  } catch (error) {
    next(error);
  }
}

async function createEkskul(req, res, next) {
  try {
    const { nama_ekskul, pembina } = req.body;
    if (!nama_ekskul) return sendError(res, 'Nama ekskul wajib diisi.', 400);
    const kode_member = req.user?.kode_member || req.body?.kode_member;
    const id = await EkskulModel.create({ nama_ekskul, pembina, kode_member });
    sendSuccess(res, 'Ekstrakurikuler berhasil ditambahkan.', { id }, 201);
  } catch (error) {
    next(error);
  }
}

async function updateEkskul(req, res, next) {
  try {
    const { id } = req.params;
    await EkskulModel.update(id, req.body);
    sendSuccess(res, 'Ekstrakurikuler berhasil diperbarui.', { id });
  } catch (error) {
    next(error);
  }
}

async function deleteEkskul(req, res, next) {
  try {
    const { id } = req.params;
    await EkskulModel.delete(id);
    sendSuccess(res, 'Ekstrakurikuler berhasil dihapus.');
  } catch (error) {
    next(error);
  }
}

// ============ ANGGOTA EKSKUL ============

async function getAnggota(req, res, next) {
  try {
    const { id } = req.params;
    const { kelas_id, tahun_ajaran, semester } = req.query;
    const list = await EkskulModel.getAnggota(id, { kelas_id, tahun_ajaran, semester });
    sendSuccess(res, 'Data anggota ekskul berhasil diambil.', list, 200, { count: list.length });
  } catch (error) {
    next(error);
  }
}

async function syncAnggota(req, res, next) {
  try {
    const { id } = req.params;
    const { kelas_id, tahun_ajaran, semester, siswa_list } = req.body;
    if (!kelas_id || !tahun_ajaran || !semester) {
      return sendError(res, 'kelas_id, tahun_ajaran, dan semester wajib diisi.', 400);
    }
    await EkskulModel.syncAnggota(id, kelas_id, tahun_ajaran, semester, siswa_list || []);
    sendSuccess(res, 'Anggota ekskul berhasil disimpan.');
  } catch (error) {
    next(error);
  }
}

async function updateAnggota(req, res, next) {
  try {
    const { anggotaId } = req.params;
    await EkskulModel.updateAnggota(anggotaId, req.body);
    sendSuccess(res, 'Data anggota berhasil diperbarui.');
  } catch (error) {
    next(error);
  }
}

async function removeAnggota(req, res, next) {
  try {
    const { anggotaId } = req.params;
    await EkskulModel.removeAnggota(anggotaId);
    sendSuccess(res, 'Anggota berhasil dihapus dari ekskul.');
  } catch (error) {
    next(error);
  }
}

// ============ RAPOR ENDPOINT ============

async function getRaporSiswa(req, res, next) {
  try {
    const { siswa_id, kelas_id, tahun_ajaran, semester } = req.query;
    if (!siswa_id || !kelas_id) {
      return sendError(res, 'siswa_id dan kelas_id wajib diisi.', 400);
    }
    const list = await EkskulModel.getRaporSiswa(
      siswa_id, kelas_id,
      tahun_ajaran || '2025/2026',
      semester || '1'
    );
    sendSuccess(res, 'Data ekskul rapor berhasil diambil.', list);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAllEkskul,
  createEkskul,
  updateEkskul,
  deleteEkskul,
  getAnggota,
  syncAnggota,
  updateAnggota,
  removeAnggota,
  getRaporSiswa
};
