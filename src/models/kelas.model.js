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

  static async countAll() {
    const rows = await query('SELECT COUNT(*) AS total FROM kelas');
    return rows[0].total || 0;
  }
}

module.exports = KelasModel;
