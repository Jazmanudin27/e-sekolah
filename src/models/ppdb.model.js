const { query } = require('../config/database');

class PpdbModel {
  static async ensureTable() {
    try {
      const sql = `
        CREATE TABLE IF NOT EXISTS ppdb_pendaftaran (
          id INT AUTO_INCREMENT PRIMARY KEY,
          no_pendaftaran VARCHAR(30) UNIQUE NOT NULL,
          nama_lengkap VARCHAR(150) NOT NULL,
          nik VARCHAR(30),
          nisn VARCHAR(30),
          jenis_kelamin ENUM('L', 'P') DEFAULT 'L',
          tempat_lahir VARCHAR(100),
          tanggal_lahir DATE,
          agama VARCHAR(50) DEFAULT 'Islam',
          alamat TEXT,
          sekolah_asal VARCHAR(150),
          tahun_lulus VARCHAR(10),
          jalur_pendaftaran VARCHAR(50) DEFAULT 'Reguler',
          pilihan_jurusan VARCHAR(100),
          nama_ayah VARCHAR(150),
          pekerjaan_ayah VARCHAR(100),
          nama_ibu VARCHAR(150),
          pekerjaan_ibu VARCHAR(100),
          no_hp_ortu VARCHAR(30),
          email_ortu VARCHAR(100),
          penghasilan_ortu VARCHAR(100),
          status ENUM('Menunggu', 'Verifikasi', 'Lulus', 'Daftar Ulang', 'Diterima', 'Ditolak') DEFAULT 'Menunggu',
          ukuran_seragam VARCHAR(20) DEFAULT NULL,
          nominal_daftar_ulang DECIMAL(12,2) DEFAULT 0,
          status_pembayaran_du ENUM('Belum', 'Cicilan', 'Lunas') DEFAULT 'Belum',
          bukti_pembayaran_du TEXT DEFAULT NULL,
          tanggal_daftar_ulang DATETIME DEFAULT NULL,
          berkas_ijazah TEXT DEFAULT NULL,
          berkas_kk TEXT DEFAULT NULL,
          berkas_akta TEXT DEFAULT NULL,
          pas_foto TEXT DEFAULT NULL,
          jadwal_tes DATETIME DEFAULT NULL,
          lokasi_tes VARCHAR(150) DEFAULT NULL,
          nilai_tes_tulis DECIMAL(5,2) DEFAULT NULL,
          nilai_tes_wawancara DECIMAL(5,2) DEFAULT NULL,
          nilai_baca_quran DECIMAL(5,2) DEFAULT NULL,
          catatan TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `;
      await query(sql);

      // Alter columns dynamically if table already existed
      const alterCols = [
        "ALTER TABLE ppdb_pendaftaran ADD COLUMN IF NOT EXISTS ukuran_seragam VARCHAR(20) DEFAULT NULL",
        "ALTER TABLE ppdb_pendaftaran ADD COLUMN IF NOT EXISTS nominal_daftar_ulang DECIMAL(12,2) DEFAULT 0",
        "ALTER TABLE ppdb_pendaftaran ADD COLUMN IF NOT EXISTS status_pembayaran_du ENUM('Belum', 'Cicilan', 'Lunas') DEFAULT 'Belum'",
        "ALTER TABLE ppdb_pendaftaran ADD COLUMN IF NOT EXISTS bukti_pembayaran_du TEXT DEFAULT NULL",
        "ALTER TABLE ppdb_pendaftaran ADD COLUMN IF NOT EXISTS tanggal_daftar_ulang DATETIME DEFAULT NULL",
        "ALTER TABLE ppdb_pendaftaran ADD COLUMN IF NOT EXISTS berkas_ijazah TEXT DEFAULT NULL",
        "ALTER TABLE ppdb_pendaftaran ADD COLUMN IF NOT EXISTS berkas_kk TEXT DEFAULT NULL",
        "ALTER TABLE ppdb_pendaftaran ADD COLUMN IF NOT EXISTS berkas_akta TEXT DEFAULT NULL",
        "ALTER TABLE ppdb_pendaftaran ADD COLUMN IF NOT EXISTS pas_foto TEXT DEFAULT NULL",
        "ALTER TABLE ppdb_pendaftaran ADD COLUMN IF NOT EXISTS jadwal_tes DATETIME DEFAULT NULL",
        "ALTER TABLE ppdb_pendaftaran ADD COLUMN IF NOT EXISTS lokasi_tes VARCHAR(150) DEFAULT NULL",
        "ALTER TABLE ppdb_pendaftaran ADD COLUMN IF NOT EXISTS nilai_tes_tulis DECIMAL(5,2) DEFAULT NULL",
        "ALTER TABLE ppdb_pendaftaran ADD COLUMN IF NOT EXISTS nilai_tes_wawancara DECIMAL(5,2) DEFAULT NULL",
        "ALTER TABLE ppdb_pendaftaran ADD COLUMN IF NOT EXISTS nilai_baca_quran DECIMAL(5,2) DEFAULT NULL"
      ];
      for (const alterSql of alterCols) {
        try { await query(alterSql); } catch (e) {}
      }
    } catch (e) {
      console.error('[PpdbModel] Failed ensuring table:', e.message);
    }
  }

  static async generateNoPendaftaran() {
    await this.ensureTable();
    const year = new Date().getFullYear();
    const prefix = `PPDB-${year}-`;
    try {
      const rows = await query(
        "SELECT no_pendaftaran FROM ppdb_pendaftaran WHERE no_pendaftaran LIKE ? ORDER BY id DESC LIMIT 1",
        [`${prefix}%`]
      );
      if (rows && rows.length > 0) {
        const lastNo = rows[0].no_pendaftaran;
        const seq = parseInt(lastNo.replace(prefix, ''), 10) || 0;
        return `${prefix}${String(seq + 1).padStart(4, '0')}`;
      }
    } catch (e) {}
    return `${prefix}0001`;
  }

  static async create(data) {
    await this.ensureTable();
    const no_pendaftaran = await this.generateNoPendaftaran();
    const sql = `
      INSERT INTO ppdb_pendaftaran (
        no_pendaftaran, nama_lengkap, nik, nisn, jenis_kelamin,
        tempat_lahir, tanggal_lahir, agama, alamat, sekolah_asal,
        tahun_lulus, jalur_pendaftaran, pilihan_jurusan,
        nama_ayah, pekerjaan_ayah, nama_ibu, pekerjaan_ibu,
        no_hp_ortu, email_ortu, penghasilan_ortu, status,
        berkas_ijazah, berkas_kk, berkas_akta, pas_foto
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Menunggu', ?, ?, ?, ?)
    `;
    const params = [
      no_pendaftaran,
      data.nama_lengkap,
      data.nik || null,
      data.nisn || null,
      data.jenis_kelamin || 'L',
      data.tempat_lahir || null,
      data.tanggal_lahir || null,
      data.agama || 'Islam',
      data.alamat || null,
      data.sekolah_asal || null,
      data.tahun_lulus || null,
      data.jalur_pendaftaran || 'Reguler',
      data.pilihan_jurusan || null,
      data.nama_ayah || null,
      data.pekerjaan_ayah || null,
      data.nama_ibu || null,
      data.pekerjaan_ibu || null,
      data.no_hp_ortu || null,
      data.email_ortu || null,
      data.penghasilan_ortu || null,
      data.berkas_ijazah || null,
      data.berkas_kk || null,
      data.berkas_akta || null,
      data.pas_foto || null
    ];

    const result = await query(sql, params);
    return { id: result.insertId, no_pendaftaran };
  }

  static async submitDaftarUlang(id, data) {
    await this.ensureTable();
    const sql = `
      UPDATE ppdb_pendaftaran
      SET 
        ukuran_seragam = ?,
        nominal_daftar_ulang = ?,
        status_pembayaran_du = ?,
        bukti_pembayaran_du = ?,
        berkas_ijazah = COALESCE(?, berkas_ijazah),
        berkas_kk = COALESCE(?, berkas_kk),
        berkas_akta = COALESCE(?, berkas_akta),
        pas_foto = COALESCE(?, pas_foto),
        tanggal_daftar_ulang = NOW(),
        status = 'Daftar Ulang'
      WHERE id = ?
    `;
    const params = [
      data.ukuran_seragam || 'M',
      data.nominal_daftar_ulang || 0,
      data.status_pembayaran_du || 'Belum',
      data.bukti_pembayaran_du || null,
      data.berkas_ijazah || null,
      data.berkas_kk || null,
      data.berkas_akta || null,
      data.pas_foto || null,
      id
    ];
    return await query(sql, params);
  }

  static async updateTesNilai(id, data) {
    await this.ensureTable();
    const sql = `
      UPDATE ppdb_pendaftaran
      SET 
        jadwal_tes = ?,
        lokasi_tes = ?,
        nilai_tes_tulis = ?,
        nilai_tes_wawancara = ?,
        nilai_baca_quran = ?
      WHERE id = ?
    `;
    return await query(sql, [
      data.jadwal_tes || null,
      data.lokasi_tes || null,
      data.nilai_tes_tulis || null,
      data.nilai_tes_wawancara || null,
      data.nilai_baca_quran || null,
      id
    ]);
  }

  static async updatePembayaranDU(id, status_pembayaran_du, nominal_daftar_ulang, catatan = '') {
    await this.ensureTable();
    const sql = `
      UPDATE ppdb_pendaftaran
      SET status_pembayaran_du = ?, nominal_daftar_ulang = ?, catatan = ?
      WHERE id = ?
    `;
    return await query(sql, [status_pembayaran_du, nominal_daftar_ulang, catatan, id]);
  }

  static async findAll(search = '', status = '') {
    await this.ensureTable();
    let sql = 'SELECT * FROM ppdb_pendaftaran WHERE 1=1';
    const params = [];

    if (search) {
      sql += ' AND (nama_lengkap LIKE ? OR no_pendaftaran LIKE ? OR nisn LIKE ? OR sekolah_asal LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    if (status && status !== 'ALL') {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY id DESC';
    return await query(sql, params);
  }

  static async findById(id) {
    await this.ensureTable();
    const rows = await query('SELECT * FROM ppdb_pendaftaran WHERE id = ? LIMIT 1', [id]);
    return rows && rows.length > 0 ? rows[0] : null;
  }

  static async findByNoPendaftaran(no_pendaftaran) {
    await this.ensureTable();
    const rows = await query('SELECT * FROM ppdb_pendaftaran WHERE no_pendaftaran = ? LIMIT 1', [no_pendaftaran]);
    return rows && rows.length > 0 ? rows[0] : null;
  }

  static async updateStatus(id, status, catatan = '') {
    await this.ensureTable();
    const sql = 'UPDATE ppdb_pendaftaran SET status = ?, catatan = ? WHERE id = ?';
    return await query(sql, [status, catatan, id]);
  }

  static async getStatistik() {
    await this.ensureTable();
    const totalRows = await query('SELECT COUNT(*) as total FROM ppdb_pendaftaran');
    const statusRows = await query('SELECT status, COUNT(*) as jumlah FROM ppdb_pendaftaran GROUP BY status');
    const seragamRows = await query("SELECT ukuran_seragam, COUNT(*) as jumlah FROM ppdb_pendaftaran WHERE ukuran_seragam IS NOT NULL GROUP BY ukuran_seragam");
    const jalurRows = await query('SELECT jalur_pendaftaran, COUNT(*) as jumlah FROM ppdb_pendaftaran GROUP BY jalur_pendaftaran');

    return {
      total: totalRows[0]?.total || 0,
      status: statusRows,
      seragam: seragamRows,
      jalur: jalurRows
    };
  }

  static async ensureJadwalTable() {
    try {
      const sql = `
        CREATE TABLE IF NOT EXISTS ppdb_setting_jadwal (
          id INT PRIMARY KEY DEFAULT 1,
          pendaftaran_buka DATETIME NULL,
          pendaftaran_tutup DATETIME NULL,
          is_pendaftaran_open TINYINT(1) DEFAULT 1,
          daftar_ulang_buka DATETIME NULL,
          daftar_ulang_tutup DATETIME NULL,
          is_daftar_ulang_open TINYINT(1) DEFAULT 1,
          pengumuman_buka DATETIME NULL,
          pengumuman_tutup DATETIME NULL,
          is_pengumuman_open TINYINT(1) DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `;
      await query(sql);
      const rows = await query("SELECT id FROM ppdb_setting_jadwal WHERE id = 1");
      if (!rows || rows.length === 0) {
        await query("INSERT INTO ppdb_setting_jadwal (id, is_pendaftaran_open, is_daftar_ulang_open, is_pengumuman_open) VALUES (1, 1, 1, 1)");
      }
    } catch (e) {
      console.error('[PpdbModel] ensureJadwalTable error:', e.message);
    }
  }

  static async getJadwal() {
    await this.ensureJadwalTable();
    const rows = await query("SELECT * FROM ppdb_setting_jadwal WHERE id = 1 LIMIT 1");
    if (rows && rows.length > 0) return rows[0];
    return {
      is_pendaftaran_open: 1,
      is_daftar_ulang_open: 1,
      is_pengumuman_open: 1
    };
  }

  static async saveJadwal(data) {
    await this.ensureJadwalTable();
    const sql = `
      INSERT INTO ppdb_setting_jadwal (
        id, pendaftaran_buka, pendaftaran_tutup, is_pendaftaran_open,
        daftar_ulang_buka, daftar_ulang_tutup, is_daftar_ulang_open,
        pengumuman_buka, pengumuman_tutup, is_pengumuman_open
      ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        pendaftaran_buka = VALUES(pendaftaran_buka),
        pendaftaran_tutup = VALUES(pendaftaran_tutup),
        is_pendaftaran_open = VALUES(is_pendaftaran_open),
        daftar_ulang_buka = VALUES(daftar_ulang_buka),
        daftar_ulang_tutup = VALUES(daftar_ulang_tutup),
        is_daftar_ulang_open = VALUES(is_daftar_ulang_open),
        pengumuman_buka = VALUES(pengumuman_buka),
        pengumuman_tutup = VALUES(pengumuman_tutup),
        is_pengumuman_open = VALUES(is_pengumuman_open)
    `;
    return await query(sql, [
      data.pendaftaran_buka || null,
      data.pendaftaran_tutup || null,
      data.is_pendaftaran_open ? 1 : 0,
      data.daftar_ulang_buka || null,
      data.daftar_ulang_tutup || null,
      data.is_daftar_ulang_open ? 1 : 0,
      data.pengumuman_buka || null,
      data.pengumuman_tutup || null,
      data.is_pengumuman_open ? 1 : 0
    ]);
  }

  static async delete(id) {
    await this.ensureTable();
    return await query('DELETE FROM ppdb_pendaftaran WHERE id = ?', [id]);
  }
}

module.exports = PpdbModel;
