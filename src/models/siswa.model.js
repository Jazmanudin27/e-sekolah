const { query } = require('../config/database');

class SiswaModel {
  static async findAll(kode_kelas = null, kode_member = null, status = null) {
    try {
      let sql = `
        SELECT 
          s.*,
          k.nama_kelas, 
          k.jurusan
        FROM siswa s
        LEFT JOIN kelas k ON s.kode_kelas = k.kode_kelas
        WHERE 1=1
      `;
      const params = [];

      if (kode_member) {
        sql += ' AND (s.kode_member = ? OR s.kode_member IS NULL)';
        params.push(kode_member);
      }

      if (kode_kelas) {
        sql += ` AND (
          CONVERT(s.kode_kelas USING utf8mb4) = CONVERT(? USING utf8mb4)
          OR s.kode_kelas IN (SELECT kode_kelas FROM kelas WHERE id = ? OR kode_kelas = ? OR nama_kelas = ?)
        )`;
        params.push(kode_kelas, kode_kelas, kode_kelas, kode_kelas);
      }

      if (status && status !== 'ALL') {
        sql += ' AND s.status = ?';
        params.push(status);
      } else if (!status && kode_kelas) {
        // Default saat memfilter per kelas untuk presensi/rapor: hanya tampilkan siswa aktif
        sql += " AND (s.status = 'Aktif' OR s.status IS NULL OR s.status = '')";
      }

      sql += ' ORDER BY k.nama_kelas ASC, s.nama_siswa ASC';

      const rows = await query(sql, params);
      if (rows && rows.length > 0) {
        return rows.map(r => ({
          ...r,
          status: r.status || 'Aktif',
          nis_nisn: r.nis_nisn || r.nis || r.nisn || r.nis_siswa || r.nisn_siswa || `NIS-${r.kode_siswa}`
        }));
      }
    } catch (e) {
      console.warn('[SiswaModel] Error querying siswa table with JOIN:', e.message);
    }

    // Try SELECT * FROM siswa if JOIN fails
    try {
      let sql = 'SELECT * FROM siswa WHERE 1=1';
      const params = [];
      if (kode_member) {
        sql += ' AND (kode_member = ? OR kode_member IS NULL)';
        params.push(kode_member);
      }
      if (kode_kelas) {
        sql += ' AND kode_kelas = ?';
        params.push(kode_kelas);
      }
      if (status && status !== 'ALL') {
        sql += ' AND status = ?';
        params.push(status);
      }
      sql += ' ORDER BY nama_siswa ASC';
      const rows = await query(sql, params);
      if (rows && rows.length > 0) {
        return rows.map(r => ({
          ...r,
          status: r.status || 'Aktif',
          nis_nisn: r.nis_nisn || r.nis || r.nisn || r.nis_siswa || r.nisn_siswa || `NIS-${r.kode_siswa}`
        }));
      }
    } catch (e) {
      console.warn('[SiswaModel] Fallback SELECT * failed:', e.message);
    }

    return [];
  }

  static async findByKelas(kode_kelas, kode_member = null) {
    return this.findAll(kode_kelas, kode_member);
  }

  static async countAll(kode_member = null) {
    try {
      let sql = 'SELECT COUNT(*) AS total FROM siswa WHERE 1=1';
      const params = [];
      if (kode_member) {
        sql += ' AND (kode_member = ? OR kode_member IS NULL)';
        params.push(kode_member);
      }
      const rows = await query(sql, params);
      return rows[0].total || 0;
    } catch (e) {
      return 0;
    }
  }

  static async create({ nis_nisn, nama_siswa, jk = 'L', kode_kelas, kode_member }) {
    const res = await query(
      'INSERT INTO siswa (nis, nama_siswa, jk, kode_kelas, kode_member) VALUES (?, ?, ?, ?, ?)',
      [nis_nisn, nama_siswa, jk, kode_kelas, kode_member || null]
    );
    return res.insertId;
  }

  static async update(id, data) {
    const fields = [];
    const params = [];
    if (data.nis_nisn !== undefined || data.nis !== undefined) {
      fields.push('nis = ?');
      params.push(data.nis_nisn || data.nis);
    }
    if (data.nama_siswa !== undefined) {
      fields.push('nama_siswa = ?');
      params.push(data.nama_siswa);
    }
    if (data.jk !== undefined) {
      fields.push('jk = ?');
      params.push(data.jk);
    }
    if (data.kode_kelas !== undefined) {
      fields.push('kode_kelas = ?');
      params.push(data.kode_kelas);
    }
    if (data.status !== undefined) {
      fields.push('status = ?');
      params.push(data.status);
    }
    if (data.tahun_lulus !== undefined) {
      fields.push('tahun_lulus = ?');
      params.push(data.tahun_lulus);
    }
    if (data.catatan_alumni !== undefined) {
      fields.push('catatan_alumni = ?');
      params.push(data.catatan_alumni);
    }
    if (fields.length === 0) return;
    params.push(id);
    await query(`UPDATE siswa SET ${fields.join(', ')} WHERE kode_siswa = ?`, params);
  }

  static async delete(id) {
    await query('DELETE FROM siswa WHERE kode_siswa = ?', [id]);
  }
}

module.exports = SiswaModel;
