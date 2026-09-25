const { query } = require('../config/database');

class SiswaModel {
  static async findByKelas(kode_kelas) {
    try {
      // Query real siswa table
      const rows = await query(
        'SELECT kode_siswa, nis_nisn, nama_siswa, jk FROM siswa WHERE kode_kelas = ? ORDER BY nama_siswa ASC',
        [kode_kelas]
      );
      if (rows && rows.length > 0) return rows;
    } catch (e) {
      console.warn('[SiswaModel] Table siswa fallback or different schema:', e.message);
    }

    // Fallback try selecting from absensi_siswa distinct student IDs if table schema differs
    try {
      const rows = await query(
        'SELECT DISTINCT kode_siswa FROM absensi_siswa WHERE kode_kelas = ?',
        [kode_kelas]
      );
      if (rows && rows.length > 0) {
        return rows.map(r => ({
          kode_siswa: r.kode_siswa,
          nis_nisn: `NIS-${r.kode_siswa}`,
          nama_siswa: `Siswa ID #${r.kode_siswa}`
        }));
      }
    } catch (e) {
      console.warn(e.message);
    }

    return [];
  }
}

module.exports = SiswaModel;
