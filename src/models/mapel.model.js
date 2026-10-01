const { query } = require('../config/database');

class MapelModel {
  static async ensureColumns() {
    try {
      await query("ALTER TABLE mapel ADD COLUMN singkatan VARCHAR(50) DEFAULT NULL");
    } catch (e) {}
    try {
      await query("ALTER TABLE mapel ADD COLUMN kelompok VARCHAR(100) DEFAULT 'Kelompok A (Umum)'");
    } catch (e) {}
  }

  static async findAll() {
    await this.ensureColumns();
    return await query('SELECT kode_mapel, nama_mapel, singkatan, kkm, kelompok FROM mapel ORDER BY nama_mapel ASC');
  }

  static async countAll() {
    const rows = await query('SELECT COUNT(*) AS total FROM mapel');
    return rows[0].total || 0;
  }

  static async create({ nama_mapel, singkatan = '', kkm = 75, kelompok = 'Kelompok A (Umum)' }) {
    await this.ensureColumns();
    const res = await query(
      'INSERT INTO mapel (nama_mapel, singkatan, kkm, kelompok) VALUES (?, ?, ?, ?)',
      [nama_mapel, singkatan, kkm, kelompok]
    );
    return res.insertId;
  }

  static async update(id, data) {
    await this.ensureColumns();
    const fields = [];
    const params = [];
    if (data.nama_mapel !== undefined) {
      fields.push('nama_mapel = ?');
      params.push(data.nama_mapel);
    }
    if (data.singkatan !== undefined) {
      fields.push('singkatan = ?');
      params.push(data.singkatan);
    }
    if (data.kkm !== undefined) {
      fields.push('kkm = ?');
      params.push(data.kkm);
    }
    if (data.kelompok !== undefined) {
      fields.push('kelompok = ?');
      params.push(data.kelompok);
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
