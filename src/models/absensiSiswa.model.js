const { query } = require('../config/database');

class AbsensiSiswaModel {
  static async findAll({ tanggal, kode_kelas }) {
    let sql = 'SELECT * FROM absensi_siswa WHERE 1=1';
    const params = [];

    if (tanggal) {
      sql += ' AND (DATE(tanggal) = DATE(?) OR tanggal = ?)';
      params.push(tanggal, tanggal);
    }
    if (kode_kelas) {
      sql += ' AND kode_kelas = ?';
      params.push(kode_kelas);
    }

    sql += ' ORDER BY id ASC';
    return await query(sql, params);
  }

  static async findExisting(tanggal, kode_kelas, kode_siswa) {
    const rows = await query(
      `SELECT id FROM absensi_siswa 
       WHERE (DATE(tanggal) = DATE(?) OR tanggal = ?) AND kode_kelas = ? 
         AND (CONVERT(kode_siswa USING utf8mb4) = CONVERT(? USING utf8mb4))
       LIMIT 1`,
      [tanggal, tanggal, kode_kelas, kode_siswa]
    );
    return rows[0] || null;
  }

  static async updateStatus(id, status) {
    await query('UPDATE absensi_siswa SET status = ? WHERE id = ?', [status, id]);
  }

  static async create({ tanggal, kode_kelas, kode_siswa, status }) {
    const res = await query(
      'INSERT INTO absensi_siswa (tanggal, kode_kelas, kode_siswa, status) VALUES (?, ?, ?, ?)',
      [tanggal, kode_kelas, kode_siswa, status]
    );
    return res.insertId;
  }

  static async getAbsensiRaporSummary({ kode_siswa, kode_kelas, tahun_ajaran, semester }) {
    try {
      let dateWhere = '';
      const params = [kode_siswa, kode_siswa, kode_siswa];

      if (tahun_ajaran && tahun_ajaran.includes('/')) {
        const parts = tahun_ajaran.split('/');
        const y1 = parts[0].trim();
        const y2 = parts[1].trim();
        const sem = String(semester || '1').toLowerCase();
        if (sem === '1' || sem.includes('ganjil')) {
          dateWhere = ' AND (DATE(tanggal) BETWEEN ? AND ? OR MONTH(tanggal) BETWEEN 7 AND 12)';
          params.push(`${y1}-07-01`, `${y1}-12-31`);
        } else {
          dateWhere = ' AND (DATE(tanggal) BETWEEN ? AND ? OR MONTH(tanggal) BETWEEN 1 AND 6)';
          params.push(`${y2}-01-01`, `${y2}-06-30`);
        }
      }

      if (kode_kelas) {
        dateWhere += ' AND (kode_kelas = ? OR kode_kelas = 0 OR kode_kelas IS NULL)';
        params.push(kode_kelas);
      }

      const sql = `
        SELECT 
          COUNT(CASE WHEN UPPER(status) IN ('S', 'SAKIT') THEN 1 END) AS sakit,
          COUNT(CASE WHEN UPPER(status) IN ('I', 'IZIN') THEN 1 END) AS izin,
          COUNT(CASE WHEN UPPER(status) IN ('A', 'ALPHA', 'TANPA KETERANGAN') THEN 1 END) AS alpha
        FROM absensi_siswa
        WHERE (
          CONVERT(kode_siswa USING utf8mb4) = CONVERT(? USING utf8mb4) 
          OR CONVERT(kode_siswa USING utf8mb4) IN (
            SELECT CONVERT(nis USING utf8mb4) FROM siswa WHERE CONVERT(kode_siswa USING utf8mb4) = CONVERT(? USING utf8mb4)
            UNION
            SELECT CONVERT(nisn USING utf8mb4) FROM siswa WHERE CONVERT(kode_siswa USING utf8mb4) = CONVERT(? USING utf8mb4)
          )
        )
        ${dateWhere}
      `;

      const rows = await query(sql, params);
      if (rows && rows.length > 0) {
        return {
          sakit: parseInt(rows[0].sakit || 0, 10),
          izin: parseInt(rows[0].izin || 0, 10),
          alpha: parseInt(rows[0].alpha || 0, 10)
        };
      }
      return { sakit: 0, izin: 0, alpha: 0 };
    } catch (e) {
      console.error('[AbsensiSiswaModel.getAbsensiRaporSummary] Error:', e.message);
      return { sakit: 0, izin: 0, alpha: 0 };
    }
  }
}

module.exports = AbsensiSiswaModel;
