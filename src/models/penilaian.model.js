const { query } = require('../config/database');

class PenilaianModel {
  static async ensureTables() {
    try {
      // 1. Table Kategori Penilaian
      await query(`
        CREATE TABLE IF NOT EXISTS \`kategori_penilaian\` (
          \`id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`kode_kategori\` VARCHAR(30) NOT NULL UNIQUE,
          \`nama_kategori\` VARCHAR(100) NOT NULL,
          \`kelompok\` ENUM('FORMATIF', 'SUMATIF', 'PROYEK', 'KETERAMPILAN', 'SIKAP') DEFAULT 'FORMATIF',
          \`bobot_default\` DECIMAL(5,2) DEFAULT 1.00,
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      // Seed Default Categories if empty
      const existing = await query(`SELECT COUNT(*) as count FROM \`kategori_penilaian\``);
      if (existing && existing[0] && existing[0].count === 0) {
        await query(`
          INSERT INTO \`kategori_penilaian\` (\`kode_kategori\`, \`nama_kategori\`, \`kelompok\`, \`bobot_default\`) VALUES
          ('PH', 'Penilaian Harian (Ulangan/Kuis)', 'FORMATIF', 25.00),
          ('PRAKTIK', 'Penilaian Praktik / Unjuk Kerja', 'KETERAMPILAN', 25.00),
          ('TUGAS', 'Penilaian Tugas & PR', 'FORMATIF', 15.00),
          ('UTS', 'Sumatif Tengah Semester (STS / UTS)', 'SUMATIF', 15.00),
          ('UAS', 'Sumatif Akhir Semester (SAS / UAS)', 'SUMATIF', 20.00),
          ('P5', 'Proyek Penguatan Profil Pelajar Pancasila (P5)', 'PROYEK', 0.00)
        `);
      }

      // 2. Table Sub-Komponen Penilaian (Dibuat Guru per Mapel & Kelas)
      await query(`
        CREATE TABLE IF NOT EXISTS \`komponen_penilaian\` (
          \`id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`mapel_id\` INT NOT NULL,
          \`kelas_id\` INT NOT NULL,
          \`guru_id\` INT NULL,
          \`kategori_id\` INT NOT NULL,
          \`nama_komponen\` VARCHAR(150) NOT NULL,
          \`tanggal_penilaian\` DATE NULL,
          \`tahun_ajaran\` VARCHAR(20) NOT NULL DEFAULT '2026/2027',
          \`semester\` ENUM('1', '2') NOT NULL DEFAULT '1',
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      // 3. Table Konfigurasi Bobot Penilaian Mapel
      await query(`
        CREATE TABLE IF NOT EXISTS \`bobot_penilaian_mapel\` (
          \`id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`mapel_id\` INT NOT NULL,
          \`kelas_id\` INT NOT NULL,
          \`tahun_ajaran\` VARCHAR(20) NOT NULL DEFAULT '2026/2027',
          \`semester\` ENUM('1', '2') NOT NULL DEFAULT '1',
          \`bobot_ph\` INT DEFAULT 25,
          \`bobot_praktik\` INT DEFAULT 25,
          \`bobot_uts\` INT DEFAULT 25,
          \`bobot_uas\` INT DEFAULT 25,
          \`kktp_kkm\` INT DEFAULT 75,
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      // 4. Table Detail Nilai Siswa
      await query(`
        CREATE TABLE IF NOT EXISTS \`nilai_siswa\` (
          \`id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`siswa_id\` INT NOT NULL,
          \`komponen_id\` INT NOT NULL,
          \`nilai\` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
          \`catatan_guru\` VARCHAR(255) NULL,
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE KEY \`uniq_siswa_komponen\` (\`siswa_id\`, \`komponen_id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      // 5. Table Rekap Rapor Akhir
      await query(`
        CREATE TABLE IF NOT EXISTS \`rapor_akhir\` (
          \`id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`siswa_id\` INT NOT NULL,
          \`kelas_id\` INT NOT NULL,
          \`mapel_id\` INT NOT NULL,
          \`avg_ph\` DECIMAL(5,2) DEFAULT 0.00,
          \`avg_praktik\` DECIMAL(5,2) DEFAULT 0.00,
          \`nilai_uts\` DECIMAL(5,2) DEFAULT 0.00,
          \`nilai_uas\` DECIMAL(5,2) DEFAULT 0.00,
          \`nilai_akhir\` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
          \`predikat\` VARCHAR(5) NOT NULL DEFAULT 'C',
          \`deskripsi_capaian\` TEXT NULL,
          \`tahun_ajaran\` VARCHAR(20) NOT NULL DEFAULT '2026/2027',
          \`semester\` ENUM('1', '2') NOT NULL DEFAULT '1',
          \`status_kunci\` TINYINT(1) DEFAULT 0,
          \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          UNIQUE KEY \`uniq_siswa_mapel_sem\` (\`siswa_id\`, \`mapel_id\`, \`tahun_ajaran\`, \`semester\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

    } catch (err) {
      console.warn('[PenilaianModel.ensureTables] Warning:', err.message);
    }
  }

  // Get all active Categories
  static async getKategori() {
    await this.ensureTables();
    return await query(`SELECT * FROM \`kategori_penilaian\` ORDER BY id ASC`);
  }

  // Get Komponen Penilaian for class & mapel
  static async getKomponen({ mapel_id, kelas_id, tahun_ajaran = '2026/2027', semester = '1' }) {
    await this.ensureTables();
    return await query(`
      SELECT kp.*, kat.nama_kategori, kat.kode_kategori, kat.kelompok
      FROM \`komponen_penilaian\` kp
      JOIN \`kategori_penilaian\` kat ON kp.kategori_id = kat.id
      WHERE kp.mapel_id = ? AND kp.kelas_id = ? AND kp.tahun_ajaran = ? AND kp.semester = ?
      ORDER BY kp.id ASC
    `, [mapel_id, kelas_id, tahun_ajaran, semester]);
  }

  // Create Komponen Penilaian
  static async createKomponen({ mapel_id, kelas_id, guru_id, kategori_id, nama_komponen, tanggal_penilaian, tahun_ajaran = '2026/2027', semester = '1' }) {
    await this.ensureTables();
    const res = await query(`
      INSERT INTO \`komponen_penilaian\` (mapel_id, kelas_id, guru_id, kategori_id, nama_komponen, tanggal_penilaian, tahun_ajaran, semester)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [mapel_id, kelas_id, guru_id || null, kategori_id, nama_komponen, tanggal_penilaian || null, tahun_ajaran, semester]);
    return res.insertId;
  }

  // Delete Komponen Penilaian
  static async deleteKomponen(id) {
    await this.ensureTables();
    await query(`DELETE FROM \`nilai_siswa\` WHERE komponen_id = ?`, [id]);
    return await query(`DELETE FROM \`komponen_penilaian\` WHERE id = ?`, [id]);
  }

  // Batch Save Nilai for class & mapel
  static async saveBatchNilai({ komponen_id, nilai_list }) {
    await this.ensureTables();
    for (const item of nilai_list) {
      const { siswa_id, nilai, catatan_guru } = item;
      await query(`
        INSERT INTO \`nilai_siswa\` (siswa_id, komponen_id, nilai, catatan_guru)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE nilai = VALUES(nilai), catatan_guru = VALUES(catatan_guru)
      `, [siswa_id, komponen_id, parseFloat(nilai) || 0, catatan_guru || null]);
    }
    return true;
  }

  // Get full Spreadsheet Matrix for Class & Mapel
  static async getMatrixNilai({ mapel_id, kelas_id, tahun_ajaran = '2026/2027', semester = '1' }) {
    await this.ensureTables();

    // 1. Get Students in Class
    const siswaList = await query(`
      SELECT id, nis, nama, jenis_kelamin FROM siswa
      WHERE kelas_id = ? OR id_kelas = ? OR id IN (SELECT id_siswa FROM siswa WHERE id_kelas = ?)
      ORDER BY nama ASC
    `, [kelas_id, kelas_id, kelas_id]);

    // Fallback if no siswa in query with kelas_id
    let students = siswaList;
    if (!students || students.length === 0) {
      students = await query(`SELECT id, nis, nama, jenis_kelamin FROM siswa ORDER BY nama ASC LIMIT 50`);
    }

    // 2. Get Komponen list
    const komponenList = await this.getKomponen({ mapel_id, kelas_id, tahun_ajaran, semester });

    // 3. Get all Nilai for these Komponen
    const komponenIds = komponenList.map(k => k.id);
    let nilaiRows = [];
    if (komponenIds.length > 0) {
      const inClause = komponenIds.join(',');
      nilaiRows = await query(`SELECT * FROM \`nilai_siswa\` WHERE komponen_id IN (${inClause})`);
    }

    // Map nilai to siswa_id & komponen_id
    const nilaiMap = {};
    for (const row of nilaiRows) {
      if (!nilaiMap[row.siswa_id]) nilaiMap[row.siswa_id] = {};
      nilaiMap[row.siswa_id][row.komponen_id] = row.nilai;
    }

    // 4. Get Bobot Config
    const bobotRows = await query(`
      SELECT * FROM \`bobot_penilaian_mapel\`
      WHERE mapel_id = ? AND kelas_id = ? AND tahun_ajaran = ? AND semester = ?
      LIMIT 1
    `, [mapel_id, kelas_id, tahun_ajaran, semester]);
    const bobot = (bobotRows && bobotRows.length > 0) ? bobotRows[0] : { bobot_ph: 25, bobot_praktik: 25, bobot_uts: 25, bobot_uas: 25, kktp_kkm: 75 };

    return {
      students,
      komponen: komponenList,
      nilaiMap,
      bobot
    };
  }

  // Get Transkrip Nilai Siswa (Account Siswa)
  static async getTranskripSiswa({ siswa_id, tahun_ajaran = '2026/2027', semester = '1' }) {
    await this.ensureTables();

    const sql = `
      SELECT
        m.id as mapel_id,
        m.nama_mapel,
        m.kode_mapel,
        ra.nilai_akhir,
        ra.predikat,
        ra.deskripsi_capaian,
        ra.avg_ph,
        ra.avg_praktik,
        ra.nilai_uts,
        ra.nilai_uas
      FROM mapel m
      LEFT JOIN \`rapor_akhir\` ra ON m.id = ra.mapel_id AND ra.siswa_id = ? AND ra.tahun_ajaran = ? AND ra.semester = ?
      ORDER BY m.nama_mapel ASC
    `;

    return await query(sql, [siswa_id, tahun_ajaran, semester]);
  }
}

module.exports = PenilaianModel;
