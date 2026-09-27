const { query } = require('../config/database');

class KelasModel {
  static async findAll() {
    return await query(`
      SELECT k.kode_kelas, k.nama_kelas, k.jurusan, k.kode_guru, g.nama_guru AS wali_kelas
      FROM kelas k
      LEFT JOIN guru g ON k.kode_guru = g.kode_guru
      ORDER BY k.nama_kelas ASC
    `);
  }

  static async findById(id) {
    const rows = await query(`
      SELECT k.kode_kelas, k.nama_kelas, k.jurusan, k.kode_guru, g.nama_guru AS wali_kelas
      FROM kelas k
      LEFT JOIN guru g ON k.kode_guru = g.kode_guru
      WHERE k.kode_kelas = ?
    `, [id]);
    return rows[0] || null;
  }

  static async findByUsername(username) {
    try {
      const rows = await query(
        'SELECT * FROM kelas WHERE (username = ? OR nama_kelas = ?) LIMIT 1',
        [username, username]
      );
      return rows[0] || null;
    } catch (e) {
      console.warn('[KelasModel.findByUsername]', e.message);
      return null;
    }
  }

  static async countAll() {
    const rows = await query('SELECT COUNT(*) AS total FROM kelas');
    return rows[0].total || 0;
  }

  static async create({ nama_kelas, jurusan, kode_guru, username, password }) {
    const res = await query(
      'INSERT INTO kelas (nama_kelas, jurusan, kode_guru, username, password) VALUES (?, ?, ?, ?, ?)',
      [nama_kelas, jurusan || '-', kode_guru || null, username || nama_kelas.toLowerCase().replace(/\s+/g, ''), password || '123456']
    );
    return res.insertId;
  }

  static async update(id, data) {
    const fields = [];
    const params = [];
    if (data.nama_kelas !== undefined) {
      fields.push('nama_kelas = ?');
      params.push(data.nama_kelas);
    }
    if (data.jurusan !== undefined) {
      fields.push('jurusan = ?');
      params.push(data.jurusan);
    }
    if (data.kode_guru !== undefined) {
      fields.push('kode_guru = ?');
      params.push(data.kode_guru);
    }
    if (data.username !== undefined) {
      fields.push('username = ?');
      params.push(data.username);
    }
    if (data.password !== undefined) {
      fields.push('password = ?');
      params.push(data.password);
    }
    if (fields.length === 0) return;
    params.push(id);
    await query(`UPDATE kelas SET ${fields.join(', ')} WHERE kode_kelas = ?`, params);
  }

  static async delete(id) {
    await query('DELETE FROM kelas WHERE kode_kelas = ?', [id]);
  }
}

module.exports = KelasModel;
