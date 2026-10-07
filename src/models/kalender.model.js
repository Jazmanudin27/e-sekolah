const { query } = require('../config/database');

class KalenderModel {
  static async ensureTable() {
    const createTableSql = `
      CREATE TABLE IF NOT EXISTS kalender_pendidikan (
        id INT AUTO_INCREMENT PRIMARY KEY,
        tahun_ajaran VARCHAR(20) DEFAULT '2026/2027',
        semester INT DEFAULT 1,
        kategori VARCHAR(50) DEFAULT 'Kegiatan',
        nama_kegiatan VARCHAR(255) NOT NULL,
        tanggal_mulai DATE NOT NULL,
        tanggal_selesai DATE NOT NULL,
        keterangan TEXT NULL,
        warna VARCHAR(20) DEFAULT '#0066ff',
        tingkat_target VARCHAR(50) DEFAULT 'Semua',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;
    try {
      await query(createTableSql);

      // Check if table already has seed data for 2026/2027
      const countRows = await query('SELECT COUNT(*) as cnt FROM kalender_pendidikan WHERE tahun_ajaran = "2026/2027"');
      if (countRows && countRows[0] && countRows[0].cnt === 0) {
        const events = [
          // ================= SEMESTER 1 (2026) =================
          ['2026/2027', 1, 'Kegiatan', 'Daftar Ulang SPMB SMA/SMK Maung', '2026-06-09', '2026-06-10', 'Daftar ulang peserta didik baru jalur khusus', '#0284c7', 'SMK/SMA'],
          ['2026/2027', 1, 'Kegiatan', 'Daftar Ulang SPMB SMA/SMK Tahap I', '2026-06-26', '2026-06-29', 'Daftar ulang peserta didik baru tahap 1', '#0284c7', 'SMK/SMA'],
          ['2026/2027', 1, 'Lomba', 'Olimpiade Olahraga Siswa Nasional (O2SN) Tk. Provinsi', '2026-07-02', '2026-07-03', 'Pelaksanaan O2SN tingkat Provinsi Jawa Barat', '#8b5cf6', 'Semua'],
          ['2026/2027', 1, 'Lomba', 'Lomba Debat Bahasa Indonesia (LDBI) Tk. Provinsi', '2026-07-11', '2026-07-12', 'Kompetisi debat bahasa tingkat provinsi', '#8b5cf6', 'SMK/SMA'],
          ['2026/2027', 1, 'Kegiatan', 'Daftar Ulang SPMB SMA/SMK Tahap 2', '2026-07-13', '2026-07-14', 'Daftar ulang peserta didik baru tahap 2', '#0284c7', 'SMK/SMA'],
          ['2026/2027', 1, 'Kegiatan', 'Penyelarasan Kurikulum SMK dengan Industri (DUDI)', '2026-07-14', '2026-07-14', 'Penyesuaian materi pembelajaran & budaya kerja dengan industri', '#059669', 'SMK'],
          ['2026/2027', 1, 'Kegiatan', 'Hari Pertama Masuk Sekolah Semester 1', '2026-07-15', '2026-07-15', 'Awal tahun ajaran baru 2026/2027', '#10b981', 'Semua'],
          ['2026/2027', 1, 'MPLS', 'Masa Pengenalan Lingkungan Sekolah (MPLS)', '2026-07-15', '2026-07-21', 'Kegiatan MPLS siswa baru (15-17 & 20-21 Juli 2026)', '#f59e0b', 'Semua'],
          ['2026/2027', 1, 'Lomba', 'Lomba Kompetensi Siswa (LKS) Jenjang Menengah Tk. Nasional', '2026-07-26', '2026-08-01', 'Lomba kompetensi keahlian SMK tingkat nasional', '#8b5cf6', 'SMK'],
          ['2026/2027', 1, 'Lomba', 'Olimpiade Sains Nasional (OSN) Jenjang Menengah Tk. Provinsi', '2026-07-27', '2026-07-29', 'Kompetisi sains tingkat provinsi Jawa Barat', '#8b5cf6', 'SMK/SMA'],
          ['2026/2027', 1, 'Kegiatan', 'Pelaksanaan Survey Lingkungan Belajar (Sulingjar)', '2026-08-03', '2026-08-31', 'Sulingjar untuk Kepala Sekolah dan Dewan Guru', '#0284c7', 'Semua'],
          ['2026/2027', 1, 'Kegiatan', 'Kegiatan Hari Pramuka Nasional', '2026-08-14', '2026-08-14', 'Peringatan Hari Pramuka', '#b45309', 'Semua'],
          ['2026/2027', 1, 'Libur', 'Libur Hari Proklamasi Kemerdekaan RI Ke-81', '2026-08-17', '2026-08-17', 'HUT Kemerdekaan Republik Indonesia', '#ef4444', 'Semua'],
          ['2026/2027', 1, 'Libur', 'Libur Maulid Nabi Muhammad SAW 1448 H', '2026-08-25', '2026-08-25', 'Hari Libur Nasional Keagamaan', '#ef4444', 'Semua'],
          ['2026/2027', 1, 'Lomba', 'Festival Inovasi & Kewirausahaan Siswa (FIKSI) Tk. Nasional', '2026-09-07', '2026-09-12', 'Ajang kreativitas wirausaha siswa', '#8b5cf6', 'SMK/SMA'],
          ['2026/2027', 1, 'Lomba', 'O2SN Jenjang Pendidikan Menengah Tk. Nasional', '2026-09-07', '2026-09-13', 'Kompetisi olahraga tingkat nasional', '#8b5cf6', 'SMK/SMA'],
          ['2026/2027', 1, 'Lomba', 'OSN Jenjang Pendidikan Menengah Tk. Nasional', '2026-09-14', '2026-09-20', 'Olimpiade sains tingkat nasional', '#8b5cf6', 'SMK/SMA'],
          ['2026/2027', 1, 'Lomba', 'Olimpiade Penelitian Siswa Indonesia (OPSI) Tk. Nasional', '2026-09-24', '2026-09-30', 'Kompetisi karya tulis ilmiah & riset siswa', '#8b5cf6', 'SMK/SMA'],
          ['2026/2027', 1, 'Lomba', 'FLS2N Jenjang Pendidikan Menengah Tk. Nasional', '2026-10-05', '2026-10-10', 'Festival dan Lomba Seni Siswa Nasional', '#8b5cf6', 'SMK/SMA'],
          ['2026/2027', 1, 'Ujian', 'Tes Kemampuan Akademik (TKA) Gelombang 1 & 2', '2026-10-26', '2026-11-08', 'Pelaksanaan TKA Jenjang SMA/SMK/MA', '#f59e0b', 'SMK/SMA'],
          ['2026/2027', 1, 'Ujian', 'Uji Kompetensi Keahlian (UKK) 2026 Kelas XII & XIII SMK', '2026-11-09', '2026-12-11', 'Pelaksanaan UKK SMK Semester V', '#f59e0b', 'SMK'],
          ['2026/2027', 1, 'Kegiatan', 'Hari Guru Nasional', '2026-11-25', '2026-11-25', 'Peringatan Hari Guru Nasional & HUT PGRI', '#059669', 'Semua'],
          ['2026/2027', 1, 'Ujian', 'Pelaksanaan Tes Kemampuan Akademik Susulan', '2026-11-16', '2026-11-29', 'TKA Susulan untuk SMA/SMK', '#f59e0b', 'SMK/SMA'],
          ['2026/2027', 1, 'Ujian', 'Asesmen Sumatif Akhir Semester (ASAS) Ganjil', '2026-11-30', '2026-12-11', 'Penilaian sumatif semester ganjil seluruh mata pelajaran', '#dc2626', 'Semua'],
          ['2026/2027', 1, 'Rapor', 'Penetapan & Pembagian Rapor Semester 1', '2026-12-23', '2026-12-23', 'Penyerahan laporan hasil belajar siswa semester ganjil', '#0284c7', 'Semua'],
          ['2026/2027', 1, 'Libur', 'Cuti Bersama Hari Raya Natal', '2026-12-24', '2026-12-24', 'Cuti Bersama', '#ef4444', 'Semua'],
          ['2026/2027', 1, 'Libur', 'Libur Hari Raya Natal', '2026-12-25', '2026-12-25', 'Hari Libur Nasional', '#ef4444', 'Semua'],
          ['2026/2027', 1, 'Libur', 'Libur Semester 1 (Ganjil)', '2026-12-28', '2027-01-08', 'Libur pembelajaran akhir semester 1', '#ef4444', 'Semua'],

          // ================= SEMESTER 2 (2027) =================
          ['2026/2027', 2, 'Libur', 'Libur Tahun Baru Masehi 2027', '2027-01-01', '2027-01-01', 'Hari Libur Nasional Tahun Baru 2027', '#ef4444', 'Semua'],
          ['2026/2027', 2, 'Libur', 'Perkiraan Libur Isra Mi\'raj 1448 H', '2027-01-05', '2027-01-05', 'Hari Libur Keagamaan Nasional', '#ef4444', 'Semua'],
          ['2026/2027', 2, 'Kegiatan', 'Hari Pertama Masuk Sekolah Semester 2', '2027-01-11', '2027-01-11', 'Awal kegiatan belajar mengajar semester genap', '#10b981', 'Semua'],
          ['2026/2027', 2, 'Libur', 'Perkiraan Libur Tahun Baru Imlek 2578', '2027-02-06', '2027-02-06', 'Hari Libur Nasional', '#ef4444', 'Semua'],
          ['2026/2027', 2, 'Libur', 'Perkiraan Libur Awal Ramadan 1448 H', '2027-02-08', '2027-02-12', 'Penetapan menyesuaikan keputusan pemerintah', '#ef4444', 'Semua'],
          ['2026/2027', 2, 'Kegiatan', 'Penumbuhan Budi Pekerti / Pesantren Ramadhan', '2027-02-15', '2027-03-05', 'Kegiatan keagamaan & karakter ramadhan', '#059669', 'Semua'],
          ['2026/2027', 2, 'Libur', 'Perkiraan Libur Hari Raya Idul Fitri 1448 H', '2027-03-08', '2027-03-19', 'Libur hari raya Idul Fitri & cuti bersama', '#ef4444', 'Semua'],
          ['2026/2027', 2, 'Libur', 'Perkiraan Libur Hari Raya Nyepi Tahun Baru Saka 1949', '2027-03-09', '2027-03-09', 'Hari Libur Nasional', '#ef4444', 'Semua'],
          ['2026/2027', 2, 'Ujian', 'Perkiraan Asesmen Sumatif Akhir Jenjang (ASAJ) SMK/SMA', '2027-03-22', '2027-04-02', 'Ujian akhir jenjang untuk siswa tingkat akhir (kelas XII)', '#f59e0b', 'SMK/SMA'],
          ['2026/2027', 2, 'Ujian', 'Perkiraan Waktu Pelaksanaan UKK SMK / SMALB', '2027-03-29', '2027-04-30', 'Uji Kompetensi Keahlian SMK Semester VI', '#f59e0b', 'SMK'],
          ['2026/2027', 2, 'Libur', 'Perkiraan Libur Wafat Isa Almasih', '2027-04-26', '2027-04-26', 'Hari Libur Nasional', '#ef4444', 'Semua'],
          ['2026/2027', 2, 'Libur', 'Libur Hari Buruh Internasional', '2027-05-01', '2027-05-01', 'Hari Buruh', '#ef4444', 'Semua'],
          ['2026/2027', 2, 'Kegiatan', 'Hari Pendidikan Nasional (Hardiknas)', '2027-05-02', '2027-05-02', 'Peringatan Hari Pendidikan Nasional', '#0284c7', 'Semua'],
          ['2026/2027', 2, 'Kegiatan', 'Perkiraan Penetapan Kelulusan SMA/SMK', '2027-05-03', '2027-05-03', 'Rapat pleno & pengumuman kelulusan kelas XII', '#10b981', 'SMK/SMA'],
          ['2026/2027', 2, 'Libur', 'Libur Kenaikan Isa Almasih', '2027-05-06', '2027-05-06', 'Hari Libur Nasional', '#ef4444', 'Semua'],
          ['2026/2027', 2, 'Libur', 'Perkiraan Libur Hari Raya Waisak 2571', '2027-05-16', '2027-05-16', 'Hari Libur Nasional Keagamaan', '#ef4444', 'Semua'],
          ['2026/2027', 2, 'Libur', 'Perkiraan Hari Raya Idul Adha 1448 H', '2027-05-17', '2027-05-17', 'Hari Raya Idul Adha', '#ef4444', 'Semua'],
          ['2026/2027', 2, 'Libur', 'Libur Hari Lahir Pancasila', '2027-06-01', '2027-06-01', 'Hari Libur Nasional', '#ef4444', 'Semua'],
          ['2026/2027', 2, 'Libur', 'Perkiraan Libur Tahun Baru Islam 1449 H', '2027-06-06', '2027-06-06', 'Hari Libur Nasional', '#ef4444', 'Semua'],
          ['2026/2027', 2, 'Ujian', 'Asesmen Sumatif Akhir Tahun / Akhir Fase (ASAT)', '2027-06-07', '2027-06-18', 'Penilaian kenaikan kelas seluruh siswa', '#dc2626', 'Semua'],
          ['2026/2027', 2, 'Rapor', 'Penetapan & Pembagian Rapor Semester 2', '2027-06-25', '2027-06-25', 'Penyerahan buku rapor kenaikan kelas', '#0284c7', 'Semua'],
          ['2026/2027', 2, 'Libur', 'Libur Akhir Tahun Ajaran 2026/2027', '2027-06-28', '2027-07-09', 'Libur kenaikan kelas & persiapan tahun ajaran baru', '#ef4444', 'Semua']
        ];

        for (const ev of events) {
          await query(
            `INSERT INTO kalender_pendidikan (tahun_ajaran, semester, kategori, nama_kegiatan, tanggal_mulai, tanggal_selesai, keterangan, warna, tingkat_target)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            ev
          );
        }
        console.log(`[KalenderModel] Seeded ${events.length} default official events from Disdik Jabar 2026/2027`);
      }
    } catch (err) {
      console.error('[KalenderModel.ensureTable] Error:', err.message);
    }
  }

  static async getAll({ tahun_ajaran = '2026/2027', semester, bulan, tahun, kategori, kode_member }) {
    await this.ensureTable();
    try {
      await query("ALTER TABLE kalender_pendidikan ADD COLUMN kode_member VARCHAR(50) DEFAULT NULL");
    } catch (e) {}

    let sql = 'SELECT * FROM kalender_pendidikan WHERE 1=1';
    const params = [];

    if (kode_member) {
      sql += ' AND (kode_member IS NULL OR kode_member = ?)';
      params.push(kode_member);
    }
    if (tahun_ajaran) {
      sql += ' AND tahun_ajaran = ?';
      params.push(tahun_ajaran);
    }
    if (semester) {
      sql += ' AND semester = ?';
      params.push(Number(semester));
    }
    if (kategori && kategori !== 'ALL') {
      sql += ' AND kategori = ?';
      params.push(kategori);
    }
    if (bulan && tahun) {
      // Find events that overlap with this month
      const startOfMonth = `${tahun}-${String(bulan).padStart(2, '0')}-01`;
      const endOfMonth = `${tahun}-${String(bulan).padStart(2, '0')}-31`;
      sql += ' AND ((tanggal_mulai BETWEEN ? AND ?) OR (tanggal_selesai BETWEEN ? AND ?) OR (tanggal_mulai <= ? AND tanggal_selesai >= ?))';
      params.push(startOfMonth, endOfMonth, startOfMonth, endOfMonth, startOfMonth, endOfMonth);
    }

    sql += ' ORDER BY tanggal_mulai ASC';
    return await query(sql, params);
  }

  static async getById(id) {
    await this.ensureTable();
    const rows = await query('SELECT * FROM kalender_pendidikan WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async create(data) {
    await this.ensureTable();
    try {
      await query("ALTER TABLE kalender_pendidikan ADD COLUMN kode_member VARCHAR(50) DEFAULT NULL");
    } catch (e) {}

    const {
      tahun_ajaran = '2026/2027',
      semester = 1,
      kategori = 'Kegiatan',
      nama_kegiatan,
      tanggal_mulai,
      tanggal_selesai,
      keterangan,
      warna = '#0066ff',
      tingkat_target = 'Semua',
      kode_member
    } = data;

    const res = await query(
      `INSERT INTO kalender_pendidikan (tahun_ajaran, semester, kategori, nama_kegiatan, tanggal_mulai, tanggal_selesai, keterangan, warna, tingkat_target, kode_member)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tahun_ajaran,
        semester,
        kategori,
        nama_kegiatan,
        tanggal_mulai,
        tanggal_selesai || tanggal_mulai,
        keterangan || null,
        warna,
        tingkat_target,
        kode_member || null
      ]
    );
    return res ? res.insertId : null;
  }

  static async update(id, data) {
    await this.ensureTable();
    try {
      await query("ALTER TABLE kalender_pendidikan ADD COLUMN kode_member VARCHAR(50) DEFAULT NULL");
    } catch (e) {}

    const {
      tahun_ajaran,
      semester,
      kategori,
      nama_kegiatan,
      tanggal_mulai,
      tanggal_selesai,
      keterangan,
      warna,
      tingkat_target,
      kode_member
    } = data;

    if (kode_member !== undefined) {
      await query(
        `UPDATE kalender_pendidikan
         SET tahun_ajaran = ?, semester = ?, kategori = ?, nama_kegiatan = ?, tanggal_mulai = ?, tanggal_selesai = ?, keterangan = ?, warna = ?, tingkat_target = ?, kode_member = ?
         WHERE id = ?`,
        [
          tahun_ajaran,
          semester,
          kategori,
          nama_kegiatan,
          tanggal_mulai,
          tanggal_selesai || tanggal_mulai,
          keterangan,
          warna,
          tingkat_target,
          kode_member,
          id
        ]
      );
    } else {
      await query(
        `UPDATE kalender_pendidikan
         SET tahun_ajaran = ?, semester = ?, kategori = ?, nama_kegiatan = ?, tanggal_mulai = ?, tanggal_selesai = ?, keterangan = ?, warna = ?, tingkat_target = ?
         WHERE id = ?`,
        [
          tahun_ajaran,
          semester,
          kategori,
          nama_kegiatan,
          tanggal_mulai,
          tanggal_selesai || tanggal_mulai,
          keterangan,
          warna,
          tingkat_target,
          id
        ]
      );
    }
    return true;
  }

  static async delete(id) {
    await this.ensureTable();
    await query('DELETE FROM kalender_pendidikan WHERE id = ?', [id]);
    return true;
  }
}

module.exports = KalenderModel;
