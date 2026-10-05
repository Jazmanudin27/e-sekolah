const { query } = require('../config/database');

class KenaikanAlumniModel {
  /**
   * Pastikan kolom status, tahun_lulus, catatan_alumni pada tabel siswa tersedia
   * serta tabel riwayat_kenaikan_siswa dibuat jika belum ada.
   */
  static async ensureSchema() {
    try {
      await query(`ALTER TABLE siswa ADD COLUMN status VARCHAR(30) NOT NULL DEFAULT 'Aktif'`);
    } catch (e) {
      // Column might already exist, ignore
    }

    try {
      await query(`ALTER TABLE siswa ADD COLUMN tahun_lulus VARCHAR(20) DEFAULT NULL`);
    } catch (e) {
      // Column might already exist, ignore
    }

    try {
      await query(`ALTER TABLE siswa ADD COLUMN catatan_alumni TEXT DEFAULT NULL`);
    } catch (e) {
      // Column might already exist, ignore
    }

    try {
      await query(`
        CREATE TABLE IF NOT EXISTS riwayat_kenaikan_siswa (
          id INT AUTO_INCREMENT PRIMARY KEY,
          kode_siswa INT NOT NULL,
          nis VARCHAR(50) DEFAULT NULL,
          nama_siswa VARCHAR(255) DEFAULT NULL,
          jenis_aksi ENUM('Kenaikan', 'Tinggal', 'Kelulusan', 'Batal_Alumni', 'Mutasi') NOT NULL,
          kelas_asal VARCHAR(100) DEFAULT NULL,
          kelas_tujuan VARCHAR(100) DEFAULT NULL,
          tahun_ajaran VARCHAR(50) DEFAULT NULL,
          tanggal DATE NOT NULL,
          keterangan TEXT DEFAULT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
    } catch (e) {
      console.warn('[KenaikanAlumniModel.ensureSchema] Warning creating table:', e.message);
    }
  }

  /**
   * Proses Kenaikan Kelas Massal
   */
  static async prosesKenaikanKelas({ siswa_ids, kelas_asal_id, kelas_tujuan_id, tahun_ajaran, keterangan }) {
    await this.ensureSchema();

    if (!Array.isArray(siswa_ids) || siswa_ids.length === 0) {
      throw new Error('Pilih minimal satu siswa untuk dinaikkan kelasnya.');
    }
    if (!kelas_tujuan_id) {
      throw new Error('Kelas tujuan wajib dipilih.');
    }

    // Ambil nama kelas asal dan tujuan
    let namaKelasAsal = '-';
    let namaKelasTujuan = '-';

    if (kelas_asal_id) {
      const rowsAsal = await query('SELECT nama_kelas FROM kelas WHERE kode_kelas = ? LIMIT 1', [kelas_asal_id]);
      if (rowsAsal.length > 0) namaKelasAsal = rowsAsal[0].nama_kelas;
    }

    const rowsTujuan = await query('SELECT nama_kelas FROM kelas WHERE kode_kelas = ? LIMIT 1', [kelas_tujuan_id]);
    if (rowsTujuan.length > 0) {
      namaKelasTujuan = rowsTujuan[0].nama_kelas;
    } else {
      namaKelasTujuan = kelas_tujuan_id;
    }

    // Ambil data siswa yang akan dipindahkan
    const placeholders = siswa_ids.map(() => '?').join(',');
    const siswaList = await query(
      `SELECT kode_siswa, nis, nama_siswa FROM siswa WHERE kode_siswa IN (${placeholders})`,
      siswa_ids
    );

    // Update kelas siswa di tabel siswa
    await query(
      `UPDATE siswa SET kode_kelas = ?, status = 'Aktif' WHERE kode_siswa IN (${placeholders})`,
      [kelas_tujuan_id, ...siswa_ids]
    );

    // Catat ke riwayat
    const today = new Date().toISOString().split('T')[0];
    const logPromises = siswaList.map((s) =>
      query(
        `INSERT INTO riwayat_kenaikan_siswa 
         (kode_siswa, nis, nama_siswa, jenis_aksi, kelas_asal, kelas_tujuan, tahun_ajaran, tanggal, keterangan) 
         VALUES (?, ?, ?, 'Kenaikan', ?, ?, ?, ?, ?)`,
        [
          s.kode_siswa,
          s.nis || '-',
          s.nama_siswa,
          namaKelasAsal,
          namaKelasTujuan,
          tahun_ajaran || 'Tahun Baru',
          today,
          keterangan || `Kenaikan massal dari ${namaKelasAsal} ke ${namaKelasTujuan}`
        ]
      )
    );
    await Promise.all(logPromises);

    return {
      total_siswa: siswaList.length,
      kelas_asal: namaKelasAsal,
      kelas_tujuan: namaKelasTujuan
    };
  }

  /**
   * Proses Kelulusan Siswa (Jadikan Alumni)
   */
  static async prosesKelulusan({ siswa_ids, kelas_asal_id, tahun_lulus, catatan }) {
    await this.ensureSchema();

    if (!Array.isArray(siswa_ids) || siswa_ids.length === 0) {
      throw new Error('Pilih minimal satu siswa untuk diluluskan.');
    }
    if (!tahun_lulus) {
      throw new Error('Tahun kelulusan wajib diisi.');
    }

    let namaKelasAsal = '-';
    if (kelas_asal_id) {
      const rowsAsal = await query('SELECT nama_kelas FROM kelas WHERE kode_kelas = ? LIMIT 1', [kelas_asal_id]);
      if (rowsAsal.length > 0) namaKelasAsal = rowsAsal[0].nama_kelas;
    }

    const placeholders = siswa_ids.map(() => '?').join(',');
    const siswaList = await query(
      `SELECT kode_siswa, nis, nama_siswa FROM siswa WHERE kode_siswa IN (${placeholders})`,
      siswa_ids
    );

    // Update status siswa menjadi Alumni
    await query(
      `UPDATE siswa 
       SET status = 'Alumni', tahun_lulus = ?, catatan_alumni = ? 
       WHERE kode_siswa IN (${placeholders})`,
      [tahun_lulus, catatan || null, ...siswa_ids]
    );

    // Catat ke riwayat
    const today = new Date().toISOString().split('T')[0];
    const logPromises = siswaList.map((s) =>
      query(
        `INSERT INTO riwayat_kenaikan_siswa 
         (kode_siswa, nis, nama_siswa, jenis_aksi, kelas_asal, kelas_tujuan, tahun_ajaran, tanggal, keterangan) 
         VALUES (?, ?, ?, 'Kelulusan', ?, 'Alumni', ?, ?, ?)`,
        [
          s.kode_siswa,
          s.nis || '-',
          s.nama_siswa,
          namaKelasAsal,
          tahun_lulus,
          today,
          catatan || `Lulus dari kelas ${namaKelasAsal} tahun ${tahun_lulus}`
        ]
      )
    );
    await Promise.all(logPromises);

    return {
      total_siswa: siswaList.length,
      tahun_lulus
    };
  }

  /**
   * Batalkan status Alumni (Kembalikan ke status Aktif)
   */
  static async batalAlumni({ kode_siswa, kode_kelas_tujuan, keterangan }) {
    await this.ensureSchema();

    const studentRows = await query('SELECT kode_siswa, nis, nama_siswa FROM siswa WHERE kode_siswa = ?', [kode_siswa]);
    if (studentRows.length === 0) {
      throw new Error('Siswa tidak ditemukan.');
    }
    const student = studentRows[0];

    let namaKelas = '-';
    if (kode_kelas_tujuan) {
      const kRows = await query('SELECT nama_kelas FROM kelas WHERE kode_kelas = ?', [kode_kelas_tujuan]);
      if (kRows.length > 0) namaKelas = kRows[0].nama_kelas;
    }

    await query(
      `UPDATE siswa 
       SET status = 'Aktif', kode_kelas = ?, tahun_lulus = NULL, catatan_alumni = NULL 
       WHERE kode_siswa = ?`,
      [kode_kelas_tujuan || null, kode_siswa]
    );

    const today = new Date().toISOString().split('T')[0];
    await query(
      `INSERT INTO riwayat_kenaikan_siswa 
       (kode_siswa, nis, nama_siswa, jenis_aksi, kelas_asal, kelas_tujuan, tanggal, keterangan) 
       VALUES (?, ?, ?, 'Batal_Alumni', 'Alumni', ?, ?, ?)`,
      [
        student.kode_siswa,
        student.nis || '-',
        student.nama_siswa,
        namaKelas,
        today,
        keterangan || `Pembatalan status alumni dikembalikan ke ${namaKelas}`
      ]
    );

    return student;
  }

  /**
   * Ambil daftar Alumni
   */
  static async getAlumniList({ search, tahun_lulus, limit = 100, offset = 0, kode_member }) {
    await this.ensureSchema();

    let sql = `
      SELECT 
        s.*,
        k.nama_kelas AS kelas_terakhir,
        k.jurusan
      FROM siswa s
      LEFT JOIN kelas k ON s.kode_kelas = k.kode_kelas
      WHERE s.status = 'Alumni'
    `;
    const params = [];

    if (kode_member) {
      sql += ' AND s.kode_member = ?';
      params.push(kode_member);
    }
    if (tahun_lulus && tahun_lulus !== 'ALL') {
      sql += ' AND s.tahun_lulus = ?';
      params.push(tahun_lulus);
    }

    if (search) {
      sql += ' AND (s.nama_siswa LIKE ? OR s.nis LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    sql += ' ORDER BY s.tahun_lulus DESC, s.nama_siswa ASC';

    const countSql = sql.replace(/SELECT\s+s\.\*,\s*k\.nama_kelas AS kelas_terakhir,\s*k\.jurusan/i, 'SELECT COUNT(*) AS total');
    const countRows = await query(countSql, params);
    const total = countRows[0]?.total || 0;

    sql += ' LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const rows = await query(sql, params);
    return {
      total,
      rows: rows.map(r => ({
        ...r,
        nis_nisn: r.nis || r.nisn || `NIS-${r.kode_siswa}`
      }))
    };
  }

  /**
   * Ambil daftar tahun kelulusan unik untuk filter
   */
  static async getTahunLulusOptions() {
    await this.ensureSchema();
    const rows = await query(
      `SELECT DISTINCT tahun_lulus 
       FROM siswa 
       WHERE status = 'Alumni' AND tahun_lulus IS NOT NULL AND tahun_lulus != '' 
       ORDER BY tahun_lulus DESC`
    );
    return rows.map(r => r.tahun_lulus);
  }

  /**
   * Ambil Riwayat Kenaikan & Kelulusan
   */
  static async getRiwayat(limit = 100, kode_member = null) {
    await this.ensureSchema();
    let sql = 'SELECT * FROM riwayat_kenaikan_siswa';
    const params = [];
    if (kode_member) {
      sql += ' WHERE kode_member = ?';
      params.push(kode_member);
    }
    sql += ' ORDER BY id DESC LIMIT ?';
    params.push(Number(limit));
    return await query(sql, params);
  }

  /**
   * Ambil ringkasan statistik siswa & alumni
   */
  static async getStatistik(kode_member = null) {
    await this.ensureSchema();
    let sWhere = "WHERE (status = 'Aktif' OR status IS NULL OR status = '')";
    let aWhere = "WHERE status = 'Alumni'";
    let kWhere = "";
    let rWhere = "";
    const sParams = [];
    const aParams = [];
    const kParams = [];
    const rParams = [];

    if (kode_member) {
      sWhere += " AND kode_member = ?";
      sParams.push(kode_member);
      aWhere += " AND kode_member = ?";
      aParams.push(kode_member);
      kWhere += "WHERE kode_member = ?";
      kParams.push(kode_member);
      rWhere += "WHERE kode_member = ?";
      rParams.push(kode_member);
    }

    const [aktifRows] = await query(`SELECT COUNT(*) AS total FROM siswa ${sWhere}`, sParams);
    const [alumniRows] = await query(`SELECT COUNT(*) AS total FROM siswa ${aWhere}`, aParams);
    const [kelasRows] = await query(`SELECT COUNT(*) AS total FROM kelas ${kWhere}`, kParams);
    const [riwayatRows] = await query(`SELECT COUNT(*) AS total FROM riwayat_kenaikan_siswa ${rWhere}`, rParams);

    return {
      total_aktif: aktifRows.total || 0,
      total_alumni: alumniRows.total || 0,
      total_kelas: kelasRows.total || 0,
      total_riwayat: riwayatRows.total || 0
    };
  }
}

module.exports = KenaikanAlumniModel;
