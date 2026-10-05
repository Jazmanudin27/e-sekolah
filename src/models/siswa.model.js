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
        sql += ' AND s.kode_member = ?';
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
        sql += ' AND kode_member = ?';
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

  static async findById(kode_siswa) {
    if (!kode_siswa) return null;
    await this.ensureColumns();
    try {
      const sql = `
        SELECT s.*, k.nama_kelas, k.jurusan
        FROM siswa s
        LEFT JOIN kelas k ON s.kode_kelas = k.kode_kelas
        WHERE s.kode_siswa = ?
        LIMIT 1
      `;
      const rows = await query(sql, [kode_siswa]);
      if (rows && rows.length > 0) {
        return {
          ...rows[0],
          nis_nisn: rows[0].nis_nisn || rows[0].nis || rows[0].nisn || `NIS-${rows[0].kode_siswa}`
        };
      }
    } catch (e) {
      console.warn('[SiswaModel.findById] Error:', e.message);
    }
    return null;
  }

  static async findByUsernameOrNis(identifier) {
    if (!identifier) return null;
    await this.ensureColumns();
    const clean = String(identifier).trim();
    try {
      const sql = `
        SELECT s.*, k.nama_kelas, k.jurusan
        FROM siswa s
        LEFT JOIN kelas k ON s.kode_kelas = k.kode_kelas
        WHERE (
          s.nis = ? OR s.nisn = ? OR s.nis_nisn = ? 
          OR s.username = ? OR s.email = ? OR s.kode_siswa = ?
          OR s.nama_siswa = ?
        )
        LIMIT 1
      `;
      const rows = await query(sql, [clean, clean, clean, clean, clean, clean, clean]);
      if (rows && rows.length > 0) {
        return {
          ...rows[0],
          nis_nisn: rows[0].nis_nisn || rows[0].nis || rows[0].nisn || `NIS-${rows[0].kode_siswa}`
        };
      }
    } catch (e) {
      console.warn('[SiswaModel.findByUsernameOrNis] Error:', e.message);
    }

    // Fallback: search with SELECT * FROM siswa
    try {
      const rows = await query('SELECT * FROM siswa WHERE nis = ? OR kode_siswa = ? OR nama_siswa = ? LIMIT 1', [clean, clean, clean]);
      if (rows && rows.length > 0) {
        return {
          ...rows[0],
          nis_nisn: rows[0].nis_nisn || rows[0].nis || rows[0].nisn || `NIS-${rows[0].kode_siswa}`
        };
      }
    } catch (e) {
      console.warn('[SiswaModel.findByUsernameOrNis] Fallback error:', e.message);
    }

    return null;
  }

  static async countAll(kode_member = null) {
    try {
      let sql = 'SELECT COUNT(*) AS total FROM siswa WHERE 1=1';
      const params = [];
      if (kode_member) {
        sql += ' AND kode_member = ?';
        params.push(kode_member);
      }
      const rows = await query(sql, params);
      return rows[0].total || 0;
    } catch (e) {
      return 0;
    }
  }

  static async ensureColumns() {
    try {
      const cols = await query('DESCRIBE siswa');
      const colNames = cols.map(c => c.Field);
      if (!colNames.includes('nama_ortu')) await query("ALTER TABLE siswa ADD COLUMN nama_ortu VARCHAR(100) DEFAULT NULL");
      if (!colNames.includes('no_wa_ortu')) await query("ALTER TABLE siswa ADD COLUMN no_wa_ortu VARCHAR(30) DEFAULT NULL");
      if (!colNames.includes('hubungan_wali')) await query("ALTER TABLE siswa ADD COLUMN hubungan_wali VARCHAR(30) DEFAULT 'Orang Tua'");
      if (!colNames.includes('username')) await query("ALTER TABLE siswa ADD COLUMN username VARCHAR(50) DEFAULT NULL");
      if (!colNames.includes('password')) await query("ALTER TABLE siswa ADD COLUMN password VARCHAR(255) DEFAULT NULL");
      if (!colNames.includes('nisn')) await query("ALTER TABLE siswa ADD COLUMN nisn VARCHAR(30) DEFAULT NULL");
      if (!colNames.includes('nis_nisn')) await query("ALTER TABLE siswa ADD COLUMN nis_nisn VARCHAR(50) DEFAULT NULL");
      if (!colNames.includes('email')) await query("ALTER TABLE siswa ADD COLUMN email VARCHAR(100) DEFAULT NULL");
    } catch (err) {
      console.warn('[SiswaModel.ensureColumns] Warning:', err.message);
    }
  }

  static async create({ nis_nisn, nama_siswa, jk = 'L', kode_kelas, kode_member, nama_ortu, no_wa_ortu, hubungan_wali, username, password }) {
    await this.ensureColumns();
    const res = await query(
      'INSERT INTO siswa (nis, nama_siswa, jk, kode_kelas, kode_member, nama_ortu, no_wa_ortu, hubungan_wali, username, password) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [nis_nisn, nama_siswa, jk, kode_kelas, kode_member || null, nama_ortu || null, no_wa_ortu || null, hubungan_wali || 'Orang Tua', username || null, password || null]
    );
    return res.insertId;
  }

  static async update(id, data) {
    await this.ensureColumns();
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
    if (data.nama_ortu !== undefined) {
      fields.push('nama_ortu = ?');
      params.push(data.nama_ortu);
    }
    if (data.no_wa_ortu !== undefined) {
      fields.push('no_wa_ortu = ?');
      params.push(data.no_wa_ortu);
    }
    if (data.hubungan_wali !== undefined) {
      fields.push('hubungan_wali = ?');
      params.push(data.hubungan_wali);
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
    await query(`UPDATE siswa SET ${fields.join(', ')} WHERE kode_siswa = ?`, params);
  }

  static async delete(id) {
    await query('DELETE FROM siswa WHERE kode_siswa = ?', [id]);
  }
}

module.exports = SiswaModel;
