const { query } = require('../config/database');

class MapelModel {
  static async findAll() {
    try {
      return await query('SELECT kode_mapel, nama_mapel, singkatan, kkm FROM mapel ORDER BY nama_mapel ASC');
    } catch (err) {
      if (err.code === 'ER_BAD_FIELD_ERROR' || (err.message && err.message.includes('singkatan'))) {
        await query('ALTER TABLE mapel ADD COLUMN singkatan VARCHAR(50) DEFAULT NULL');
        return await query('SELECT kode_mapel, nama_mapel, singkatan, kkm FROM mapel ORDER BY nama_mapel ASC');
      }
      throw err;
    }
  }

  static async countAll() {
    const rows = await query('SELECT COUNT(*) AS total FROM mapel');
    return rows[0].total || 0;
  }

  static async create({ nama_mapel, singkatan = '', kkm = 75 }) {
    try {
      const res = await query(
        'INSERT INTO mapel (nama_mapel, singkatan, kkm) VALUES (?, ?, ?)',
        [nama_mapel, singkatan, kkm]
      );
      return res.insertId;
    } catch (err) {
      if (err.code === 'ER_BAD_FIELD_ERROR' || (err.message && err.message.includes('singkatan'))) {
        await query('ALTER TABLE mapel ADD COLUMN singkatan VARCHAR(50) DEFAULT NULL');
        const res = await query(
          'INSERT INTO mapel (nama_mapel, singkatan, kkm) VALUES (?, ?, ?)',
          [nama_mapel, singkatan, kkm]
        );
        return res.insertId;
      }
      throw err;
    }
  }

  static async update(id, data) {
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
    if (fields.length === 0) return;
    params.push(id);
    
    try {
      await query(`UPDATE mapel SET ${fields.join(', ')} WHERE kode_mapel = ?`, params);
    } catch (err) {
      if (err.code === 'ER_BAD_FIELD_ERROR' || (err.message && err.message.includes('singkatan'))) {
        await query('ALTER TABLE mapel ADD COLUMN singkatan VARCHAR(50) DEFAULT NULL');
        await query(`UPDATE mapel SET ${fields.join(', ')} WHERE kode_mapel = ?`, params);
      } else {
        throw err;
      }
    }
  }

  static async delete(id) {
    await query('DELETE FROM mapel WHERE kode_mapel = ?', [id]);
  }
}

module.exports = MapelModel;
