const { query } = require('../config/database');

class SiswaModel {
  static async findAll(kode_kelas = null) {
    try {
      let sql = `
        SELECT 
          s.kode_siswa, 
          s.nis_nisn, 
          s.nama_siswa, 
          s.jk, 
          s.kode_kelas,
          k.nama_kelas, 
          k.jurusan
        FROM siswa s
        LEFT JOIN kelas k ON s.kode_kelas = k.kode_kelas
      `;
      const params = [];

      if (kode_kelas) {
        sql += ' WHERE s.kode_kelas = ?';
        params.push(kode_kelas);
      }

      sql += ' ORDER BY k.nama_kelas ASC, s.nama_siswa ASC';

      const rows = await query(sql, params);
      if (rows && rows.length > 0) return rows;
    } catch (e) {
      console.warn('[SiswaModel] Error querying siswa table:', e.message);
    }

    // Try simple query if JOIN fails
    try {
      let sql = 'SELECT kode_siswa, nis_nisn, nama_siswa, jk, kode_kelas FROM siswa';
      const params = [];
      if (kode_kelas) {
        sql += ' WHERE kode_kelas = ?';
        params.push(kode_kelas);
      }
      sql += ' ORDER BY nama_siswa ASC';
      const rows = await query(sql, params);
      if (rows && rows.length > 0) return rows;
    } catch (e) {
      console.warn('[SiswaModel] Fallback failed:', e.message);
    }

    return [];
  }

  static async findByKelas(kode_kelas) {
    return this.findAll(kode_kelas);
  }
}

module.exports = SiswaModel;
