const { query } = require('../config/database');

class SiswaModel {
  static async findAll(kode_kelas = null) {
    try {
      let sql = `
        SELECT 
          s.*,
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
      if (rows && rows.length > 0) {
        return rows.map(r => ({
          ...r,
          nis_nisn: r.nis_nisn || r.nis || r.nisn || r.nis_siswa || r.nisn_siswa || `NIS-${r.kode_siswa}`
        }));
      }
    } catch (e) {
      console.warn('[SiswaModel] Error querying siswa table with JOIN:', e.message);
    }

    // Try SELECT * FROM siswa if JOIN fails
    try {
      let sql = 'SELECT * FROM siswa';
      const params = [];
      if (kode_kelas) {
        sql += ' WHERE kode_kelas = ?';
        params.push(kode_kelas);
      }
      sql += ' ORDER BY nama_siswa ASC';
      const rows = await query(sql, params);
      if (rows && rows.length > 0) {
        return rows.map(r => ({
          ...r,
          nis_nisn: r.nis_nisn || r.nis || r.nisn || r.nis_siswa || r.nisn_siswa || `NIS-${r.kode_siswa}`
        }));
      }
    } catch (e) {
      console.warn('[SiswaModel] Fallback SELECT * failed:', e.message);
    }

    return [];
  }

  static async findByKelas(kode_kelas) {
    return this.findAll(kode_kelas);
  }
}

module.exports = SiswaModel;
