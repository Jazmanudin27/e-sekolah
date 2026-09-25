const { query } = require('../config/database');

class MapelModel {
  static async findAll() {
    return await query('SELECT kode_mapel, nama_mapel, kkm FROM mapel ORDER BY nama_mapel ASC');
  }

  static async countAll() {
    const rows = await query('SELECT COUNT(*) AS total FROM mapel');
    return rows[0].total || 0;
  }
}

module.exports = MapelModel;
