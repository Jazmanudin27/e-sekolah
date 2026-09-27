const { query } = require('../config/database');

class MapelModel {
  static async findAll() {
    return await query('SELECT kode_mapel, nama_mapel, kkm FROM mapel ORDER BY nama_mapel ASC');
  }

  static async countAll() {
    const rows = await query('SELECT COUNT(*) AS total FROM mapel');
    return rows[0].total || 0;
  }

  static async create({ nama_mapel, kkm = 75 }) {
    const res = await query(
      'INSERT INTO mapel (nama_mapel, kkm) VALUES (?, ?)',
      [nama_mapel, kkm]
    );
    return res.insertId;
  }

  static async update(id, data) {
    const fields = [];
    const params = [];
    if (data.nama_mapel !== undefined) {
      fields.push('nama_mapel = ?');
      params.push(data.nama_mapel);
    }
    if (data.kkm !== undefined) {
      fields.push('kkm = ?');
      params.push(data.kkm);
    }
    if (fields.length === 0) return;
    params.push(id);
    await query(`UPDATE mapel SET ${fields.join(', ')} WHERE kode_mapel = ?`, params);
  }

  static async delete(id) {
    await query('DELETE FROM mapel WHERE kode_mapel = ?', [id]);
  }
}

module.exports = MapelModel;
