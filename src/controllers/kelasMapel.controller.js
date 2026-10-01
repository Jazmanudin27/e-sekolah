const KelasMapelModel = require('../models/kelasMapel.model');
const { sendSuccess, sendError } = require('../utils/response.util');

/**
 * GET /api/kelas/:id/mapel
 * Returns all mapel assigned to a given kelas
 */
async function getMapelByKelas(req, res, next) {
  try {
    const { id } = req.params;
    const mapelList = await KelasMapelModel.getByKelas(id);
    sendSuccess(res, 'Data mapel kelas berhasil diambil.', mapelList, 200, { count: mapelList.length });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/kelas/:id/mapel
 * Sync (replace) the mapel assignments for a kelas
 * Body: { mapel_ids: [1, 2, 3, ...] }
 */
async function syncMapelKelas(req, res, next) {
  try {
    const { id } = req.params;
    const { mapel_ids } = req.body;

    if (!Array.isArray(mapel_ids)) {
      return sendError(res, 'mapel_ids harus berupa array.', 400);
    }

    await KelasMapelModel.syncKelas(id, mapel_ids);
    sendSuccess(res, 'Setting mapel kelas berhasil disimpan.', { kelas_id: id, mapel_count: mapel_ids.length });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getMapelByKelas,
  syncMapelKelas
};
