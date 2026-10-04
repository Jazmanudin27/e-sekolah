const { query } = require('../config/database');

class PelanggaranModel {
  static async ensureTables() {
    try {
      const sql = `
        CREATE TABLE IF NOT EXISTS pelanggaran_siswa (
          id INT AUTO_INCREMENT PRIMARY KEY,
          kode_siswa VARCHAR(50) NOT NULL,
          kode_kelas VARCHAR(50) DEFAULT NULL,
          tanggal DATE NOT NULL,
          jam VARCHAR(10) DEFAULT NULL,
          jenis_pelanggaran VARCHAR(255) NOT NULL,
          kategori ENUM('Ringan', 'Sedang', 'Berat') DEFAULT 'Ringan',
          poin INT DEFAULT 5,
          tindakan_sanksi TEXT DEFAULT NULL,
          catatan TEXT DEFAULT NULL,
          pelapor VARCHAR(100) DEFAULT NULL,
          wa_status VARCHAR(50) DEFAULT 'pending',
          kode_member VARCHAR(50) DEFAULT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_siswa (kode_siswa),
          INDEX idx_kelas (kode_kelas),
          INDEX idx_tanggal (tanggal)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `;
      await query(sql);
    } catch (err) {
      console.warn('[PelanggaranModel.ensureTables] Warning:', err.message);
    }
  }

  static async findAll({ kode_kelas, kode_siswa, tanggal_mulai, tanggal_selesai, kategori, search, kode_member } = {}) {
    await this.ensureTables();
    try {
      let sql = `
        SELECT 
          p.*,
          s.nama_siswa,
          COALESCE(s.nis, s.kode_siswa) AS nis,
          s.nama_ortu,
          s.no_wa_ortu,
          s.hubungan_wali,
          k.nama_kelas,
          k.jurusan
        FROM pelanggaran_siswa p
        LEFT JOIN siswa s ON (
          CONVERT(p.kode_siswa USING utf8mb4) = CONVERT(s.kode_siswa USING utf8mb4)
          OR CONVERT(p.kode_siswa USING utf8mb4) = CONVERT(s.nis USING utf8mb4)
        )
        LEFT JOIN kelas k ON (
          CONVERT(COALESCE(p.kode_kelas, s.kode_kelas) USING utf8mb4) = CONVERT(k.kode_kelas USING utf8mb4)
          OR CONVERT(COALESCE(p.kode_kelas, s.kode_kelas) USING utf8mb4) = CONVERT(k.id USING utf8mb4)
        )
        WHERE 1=1
      `;
      const params = [];

      if (kode_member) {
        sql += ' AND (p.kode_member = ? OR p.kode_member IS NULL)';
        params.push(kode_member);
      }

      if (kode_kelas && kode_kelas !== 'ALL') {
        sql += ' AND (p.kode_kelas = ? OR s.kode_kelas = ?)';
        params.push(kode_kelas, kode_kelas);
      }

      if (kode_siswa) {
        sql += ' AND (p.kode_siswa = ? OR s.kode_siswa = ?)';
        params.push(kode_siswa, kode_siswa);
      }

      if (kategori && kategori !== 'ALL') {
        sql += ' AND p.kategori = ?';
        params.push(kategori);
      }

      if (tanggal_mulai) {
        sql += ' AND p.tanggal >= ?';
        params.push(tanggal_mulai);
      }

      if (tanggal_selesai) {
        sql += ' AND p.tanggal <= ?';
        params.push(tanggal_selesai);
      }

      if (search && search.trim()) {
        const q = `%${search.trim()}%`;
        sql += ' AND (s.nama_siswa LIKE ? OR p.jenis_pelanggaran LIKE ? OR p.pelapor LIKE ?)';
        params.push(q, q, q);
      }

      sql += ' ORDER BY p.tanggal DESC, p.id DESC';

      return await query(sql, params);
    } catch (e) {
      console.error('[PelanggaranModel.findAll] Error:', e.message);
      return [];
    }
  }

  static async findById(id) {
    await this.ensureTables();
    const rows = await query(
      `SELECT 
        p.*,
        s.nama_siswa,
        COALESCE(s.nis, s.kode_siswa) AS nis,
        s.nama_ortu,
        s.no_wa_ortu,
        s.hubungan_wali,
        k.nama_kelas
      FROM pelanggaran_siswa p
      LEFT JOIN siswa s ON (
        CONVERT(p.kode_siswa USING utf8mb4) = CONVERT(s.kode_siswa USING utf8mb4)
        OR CONVERT(p.kode_siswa USING utf8mb4) = CONVERT(s.nis USING utf8mb4)
      )
      LEFT JOIN kelas k ON (
        CONVERT(COALESCE(p.kode_kelas, s.kode_kelas) USING utf8mb4) = CONVERT(k.kode_kelas USING utf8mb4)
      )
      WHERE p.id = ? LIMIT 1`,
      [id]
    );
    return rows[0] || null;
  }

  static async create(data) {
    await this.ensureTables();
    const {
      kode_siswa,
      kode_kelas,
      tanggal,
      jam,
      jenis_pelanggaran,
      kategori = 'Ringan',
      poin = 5,
      tindakan_sanksi,
      catatan,
      pelapor,
      wa_status = 'pending',
      kode_member
    } = data;

    const res = await query(
      `INSERT INTO pelanggaran_siswa 
       (kode_siswa, kode_kelas, tanggal, jam, jenis_pelanggaran, kategori, poin, tindakan_sanksi, catatan, pelapor, wa_status, kode_member, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        kode_siswa,
        kode_kelas || null,
        tanggal || new Date().toISOString().split('T')[0],
        jam || null,
        jenis_pelanggaran,
        kategori,
        parseInt(poin, 10) || 0,
        tindakan_sanksi || null,
        catatan || null,
        pelapor || null,
        wa_status,
        kode_member || null
      ]
    );
    return res.insertId;
  }

  static async update(id, data) {
    await this.ensureTables();
    const fields = [];
    const params = [];

    const allowed = [
      'kode_siswa', 'kode_kelas', 'tanggal', 'jam', 'jenis_pelanggaran',
      'kategori', 'poin', 'tindakan_sanksi', 'catatan', 'pelapor', 'wa_status'
    ];

    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(data[key]);
      }
    }

    if (fields.length === 0) return;
    fields.push('updated_at = NOW()');
    params.push(id);

    await query(`UPDATE pelanggaran_siswa SET ${fields.join(', ')} WHERE id = ?`, params);
  }

  static async updateWAStatus(id, status) {
    await this.ensureTables();
    await query('UPDATE pelanggaran_siswa SET wa_status = ?, updated_at = NOW() WHERE id = ?', [status, id]);
  }

  static async delete(id) {
    await this.ensureTables();
    await query('DELETE FROM pelanggaran_siswa WHERE id = ?', [id]);
  }

  static async getRekapPoin({ kode_kelas, kode_member } = {}) {
    await this.ensureTables();
    try {
      let sql = `
        SELECT 
          s.kode_siswa,
          s.nama_siswa,
          COALESCE(s.nis, s.kode_siswa) AS nis,
          s.nama_ortu,
          s.no_wa_ortu,
          s.hubungan_wali,
          k.nama_kelas,
          COUNT(p.id) AS total_pelanggaran,
          COALESCE(SUM(p.poin), 0) AS total_poin,
          COUNT(CASE WHEN p.kategori = 'Ringan' THEN 1 END) AS count_ringan,
          COUNT(CASE WHEN p.kategori = 'Sedang' THEN 1 END) AS count_sedang,
          COUNT(CASE WHEN p.kategori = 'Berat' THEN 1 END) AS count_berat,
          MAX(p.tanggal) AS pelanggaran_terakhir
        FROM pelanggaran_siswa p
        JOIN siswa s ON (
          CONVERT(p.kode_siswa USING utf8mb4) = CONVERT(s.kode_siswa USING utf8mb4)
          OR CONVERT(p.kode_siswa USING utf8mb4) = CONVERT(s.nis USING utf8mb4)
        )
        LEFT JOIN kelas k ON (
          CONVERT(COALESCE(p.kode_kelas, s.kode_kelas) USING utf8mb4) = CONVERT(k.kode_kelas USING utf8mb4)
          OR CONVERT(COALESCE(p.kode_kelas, s.kode_kelas) USING utf8mb4) = CONVERT(k.id USING utf8mb4)
        )
        WHERE 1=1
      `;
      const params = [];

      if (kode_member) {
        sql += ' AND (p.kode_member = ? OR p.kode_member IS NULL)';
        params.push(kode_member);
      }

      if (kode_kelas && kode_kelas !== 'ALL') {
        sql += ' AND (p.kode_kelas = ? OR s.kode_kelas = ?)';
        params.push(kode_kelas, kode_kelas);
      }

      sql += `
        GROUP BY s.kode_siswa, s.nama_siswa, s.nis, s.nama_ortu, s.no_wa_ortu, s.hubungan_wali, k.nama_kelas
        ORDER BY total_poin DESC, total_pelanggaran DESC, s.nama_siswa ASC
      `;

      return await query(sql, params);
    } catch (e) {
      console.error('[PelanggaranModel.getRekapPoin] Error:', e.message);
      return [];
    }
  }

  static async getStats({ kode_member } = {}) {
    await this.ensureTables();
    try {
      let sql = `
        SELECT 
          COUNT(id) AS total_kasus,
          COALESCE(SUM(poin), 0) AS total_akumulasi_poin,
          COUNT(CASE WHEN MONTH(tanggal) = MONTH(CURRENT_DATE()) AND YEAR(tanggal) = YEAR(CURRENT_DATE()) THEN 1 END) AS kasus_bulan_ini,
          COUNT(CASE WHEN kategori = 'Berat' THEN 1 END) AS kasus_berat
        FROM pelanggaran_siswa
        WHERE 1=1
      `;
      const params = [];
      if (kode_member) {
        sql += ' AND (kode_member = ? OR kode_member IS NULL)';
        params.push(kode_member);
      }

      const rows = await query(sql, params);
      return rows[0] || {
        total_kasus: 0,
        total_akumulasi_poin: 0,
        kasus_bulan_ini: 0,
        kasus_berat: 0
      };
    } catch (e) {
      console.error('[PelanggaranModel.getStats] Error:', e.message);
      return { total_kasus: 0, total_akumulasi_poin: 0, kasus_bulan_ini: 0, kasus_berat: 0 };
    }
  }
}

module.exports = PelanggaranModel;
