-- ==============================================================================
-- DATABASE SCHEMA LENGKAP & TERINTEGRASI E-SEKOLAH (E-BMS & SISTEM AKADEMIK)
-- Target Database: artanita (atau database sekolah sesuai .env)
-- Kompatibilitas: MySQL 5.7+ / MySQL 8.0+ / MariaDB 10.3+
-- Engine: InnoDB | Charset: utf8mb4 | Collate: utf8mb4_unicode_ci
-- ==============================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+07:00";

-- ------------------------------------------------------------------------------
-- 1. TABEL PROFIL SEKOLAH / TENANT MEMBER
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `member` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `kode_member` VARCHAR(50) NOT NULL UNIQUE,
  `nama_member` VARCHAR(255) NOT NULL DEFAULT 'SMK ARTANITA TASIKMALAYA',
  `npsn` VARCHAR(30) DEFAULT '20279876',
  `alamat` TEXT NULL,
  `desa` VARCHAR(100) DEFAULT NULL,
  `kecamatan` VARCHAR(100) DEFAULT NULL,
  `kota` VARCHAR(100) DEFAULT 'Kota Tasikmalaya',
  `no_hp` VARCHAR(30) DEFAULT '081234567890',
  `email` VARCHAR(100) DEFAULT 'info@artanita.sch.id',
  `kepala_sekolah` VARCHAR(150) DEFAULT 'Ali Irsan Shafar, SH.M.Pd',
  `jam_masuk` VARCHAR(10) DEFAULT '07:00',
  `toleransi_telat` INT DEFAULT 15,
  `jam_pulang` VARCHAR(10) DEFAULT '15:30',
  `radius_gps` INT DEFAULT 100,
  `mode_presensi_guru` VARCHAR(30) DEFAULT 'gps_kamera',
  `lat_sekolah` VARCHAR(50) DEFAULT '-7.325205',
  `lng_sekolah` VARCHAR(50) DEFAULT '108.208354',
  `wa_provider` VARCHAR(50) DEFAULT 'fonnte',
  `wa_api_token` VARCHAR(255) DEFAULT NULL,
  `wa_endpoint` VARCHAR(255) DEFAULT NULL,
  `wa_auto_absen` TINYINT(1) DEFAULT 1,
  `wa_auto_pelanggaran` TINYINT(1) DEFAULT 1,
  `wa_sender_phone` VARCHAR(30) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 2. TABEL USERS / PENGGUNA SISTEM
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `username` VARCHAR(100) NOT NULL UNIQUE,
  `email` VARCHAR(150) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` VARCHAR(50) NOT NULL DEFAULT 'Admin',
  `status` VARCHAR(20) NOT NULL DEFAULT 'Active',
  `kode_member` VARCHAR(50) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_users_role` (`role`),
  INDEX `idx_users_member` (`kode_member`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 3. TABEL MASTER GURU & TENAGA PENDIDIK
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `guru` (
  `kode_guru` INT AUTO_INCREMENT PRIMARY KEY,
  `nip_nuptk` VARCHAR(50) DEFAULT '-',
  `nama_guru` VARCHAR(150) NOT NULL,
  `jk` ENUM('L', 'P') DEFAULT 'L',
  `tempat_lahir` VARCHAR(100) DEFAULT NULL,
  `tgl_lahir` DATE DEFAULT NULL,
  `agama` VARCHAR(50) DEFAULT 'Islam',
  `alamat` TEXT DEFAULT NULL,
  `no_hp` VARCHAR(30) DEFAULT '-',
  `email` VARCHAR(100) DEFAULT '-',
  `pendidikan_terakhir` VARCHAR(50) DEFAULT 'S1',
  `tmt` DATE DEFAULT NULL,
  `status_kepegawaian` VARCHAR(50) DEFAULT 'PNS',
  `status` VARCHAR(20) DEFAULT 'Aktif',
  `role` VARCHAR(50) DEFAULT 'Guru',
  `username` VARCHAR(100) DEFAULT NULL,
  `password` VARCHAR(255) DEFAULT '123456',
  `kode_member` VARCHAR(50) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_guru_nip` (`nip_nuptk`),
  INDEX `idx_guru_member` (`kode_member`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 4. TABEL MASTER KELAS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `kelas` (
  `kode_kelas` INT AUTO_INCREMENT PRIMARY KEY,
  `nama_kelas` VARCHAR(100) NOT NULL,
  `jurusan` VARCHAR(100) DEFAULT '-',
  `kode_guru` INT DEFAULT NULL,
  `username` VARCHAR(100) DEFAULT NULL,
  `password` VARCHAR(255) DEFAULT '123456',
  `kode_member` VARCHAR(50) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_kelas_guru` (`kode_guru`),
  INDEX `idx_kelas_member` (`kode_member`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 5. TABEL MASTER SISWA
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `siswa` (
  `kode_siswa` INT AUTO_INCREMENT PRIMARY KEY,
  `nis` VARCHAR(50) DEFAULT NULL,
  `nisn` VARCHAR(50) DEFAULT NULL,
  `nis_nisn` VARCHAR(50) DEFAULT NULL,
  `nama_siswa` VARCHAR(150) NOT NULL,
  `jk` ENUM('L', 'P') DEFAULT 'L',
  `kode_kelas` VARCHAR(50) DEFAULT NULL,
  `tingkat` VARCHAR(20) DEFAULT NULL,
  `nama_ortu` VARCHAR(150) DEFAULT NULL,
  `no_wa_ortu` VARCHAR(30) DEFAULT NULL,
  `hubungan_wali` VARCHAR(50) DEFAULT 'Orang Tua',
  `username` VARCHAR(100) DEFAULT NULL,
  `password` VARCHAR(255) DEFAULT NULL,
  `email` VARCHAR(100) DEFAULT NULL,
  `status` VARCHAR(30) DEFAULT 'Aktif',
  `tahun_lulus` VARCHAR(20) DEFAULT NULL,
  `catatan_alumni` TEXT DEFAULT NULL,
  `kode_member` VARCHAR(50) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_siswa_nis` (`nis`),
  INDEX `idx_siswa_nisn` (`nisn`),
  INDEX `idx_siswa_kelas` (`kode_kelas`),
  INDEX `idx_siswa_status` (`status`),
  INDEX `idx_siswa_member` (`kode_member`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 6. TABEL MASTER MATA PELAJARAN (MAPEL)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `mapel` (
  `kode_mapel` INT AUTO_INCREMENT PRIMARY KEY,
  `nama_mapel` VARCHAR(150) NOT NULL,
  `singkatan` VARCHAR(50) DEFAULT NULL,
  `kkm` INT DEFAULT 75,
  `kelompok` VARCHAR(100) DEFAULT 'Kelompok A (Umum)',
  `kode_member` VARCHAR(50) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_mapel_member` (`kode_member`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 7. TABEL RELASI KELAS & MAPEL
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `kelas_mapel` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `kelas_id` INT NOT NULL,
  `mapel_id` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_kelas_mapel` (`kelas_id`, `mapel_id`),
  INDEX `idx_km_kelas` (`kelas_id`),
  INDEX `idx_km_mapel` (`mapel_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 8. TABEL RELASI MAPEL & GURU PENGAMPU
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `mapel_guru` (
  `kode_guru_mapel` INT AUTO_INCREMENT PRIMARY KEY,
  `kode_guru` INT NOT NULL,
  `kode_mapel` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_mg_guru` (`kode_guru`),
  INDEX `idx_mg_mapel` (`kode_mapel`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 9. TABEL MASTER JAM JADWAL PELAJARAN
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `jadwal_jam` (
  `kode_jam` INT AUTO_INCREMENT PRIMARY KEY,
  `jam_ke` INT NOT NULL,
  `jam` VARCHAR(50) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 10. TABEL JADWAL PELAJARAN
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `jadwal` (
  `kode_jadwal` INT AUTO_INCREMENT PRIMARY KEY,
  `hari` ENUM('Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu') NOT NULL,
  `kode_jam` INT NOT NULL,
  `kode_kelas` INT NOT NULL,
  `kode_guru_mapel` INT NOT NULL,
  `kode_member` VARCHAR(50) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_jadwal_hari_kelas` (`hari`, `kode_kelas`),
  INDEX `idx_jadwal_member` (`kode_member`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 11. TABEL PRESENSI GURU & PEGAWAI (GPS / KAMERA)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `presensi` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `kode_guru` VARCHAR(50) NOT NULL,
  `tanggal` DATE NOT NULL,
  `jam_in` TIME NOT NULL,
  `jam_out` TIME DEFAULT NULL,
  `lokasi_in` TEXT DEFAULT NULL,
  `lokasi_out` TEXT DEFAULT NULL,
  `foto_in` TEXT DEFAULT NULL,
  `foto_out` TEXT DEFAULT NULL,
  `kode_member` VARCHAR(50) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_presensi_guru_tgl` (`kode_guru`, `tanggal`),
  INDEX `idx_presensi_member` (`kode_member`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 12. TABEL ABSENSI HARIAN SISWA KELAS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `absensi_siswa` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tanggal` DATE NOT NULL,
  `kode_kelas` VARCHAR(50) NOT NULL,
  `kode_siswa` VARCHAR(50) NOT NULL,
  `status` ENUM('H', 'S', 'I', 'A', 'Hadir', 'Sakit', 'Izin', 'Alpha') NOT NULL DEFAULT 'Hadir',
  `kode_member` VARCHAR(50) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_abs_siswa_tgl_kelas` (`tanggal`, `kode_kelas`),
  INDEX `idx_abs_siswa_kode` (`kode_siswa`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 13. TABEL ABSENSI MAPEL / JURNAL KELAS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `absensi_mapel` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tanggal` DATE NOT NULL,
  `kode_kelas` VARCHAR(50) NOT NULL,
  `kode_guru` VARCHAR(50) DEFAULT NULL,
  `kode_mapel` VARCHAR(50) NOT NULL,
  `kode_siswa` VARCHAR(50) NOT NULL,
  `status` ENUM('H', 'S', 'I', 'A', 'Hadir', 'Sakit', 'Izin', 'Alpha') NOT NULL DEFAULT 'Hadir',
  `kode_member` VARCHAR(50) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_abs_mapel_tgl` (`tanggal`, `kode_kelas`, `kode_mapel`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 14. TABEL PENGAJUAN IZIN / CUTI GURU & SISWA
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `pengajuan_izin` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `kode_member` VARCHAR(50) DEFAULT NULL,
  `user_id` INT DEFAULT NULL,
  `nama_pengaju` VARCHAR(255) DEFAULT NULL,
  `jenis` VARCHAR(50) NOT NULL DEFAULT 'Sakit',
  `tanggal_mulai` DATE NOT NULL,
  `tanggal_selesai` DATE DEFAULT NULL,
  `durasi` VARCHAR(50) DEFAULT '1 Hari',
  `keterangan` TEXT DEFAULT NULL,
  `status` VARCHAR(50) DEFAULT 'Menunggu',
  `disetujui_oleh` VARCHAR(255) DEFAULT 'Menunggu Persetujuan',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_izin_member` (`kode_member`),
  INDEX `idx_izin_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 15. TABEL MODUL PENILAIAN & RAPOR
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `kategori_penilaian` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `kode_kategori` VARCHAR(30) NOT NULL UNIQUE,
  `nama_kategori` VARCHAR(100) NOT NULL,
  `kelompok` ENUM('FORMATIF', 'SUMATIF', 'PROYEK', 'KETERAMPILAN', 'SIKAP') DEFAULT 'FORMATIF',
  `bobot_default` DECIMAL(5,2) DEFAULT 1.00,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `komponen_penilaian` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `mapel_id` INT NOT NULL,
  `kelas_id` INT NOT NULL,
  `guru_id` INT DEFAULT NULL,
  `kategori_id` INT NOT NULL,
  `nama_komponen` VARCHAR(150) NOT NULL,
  `tanggal_penilaian` DATE DEFAULT NULL,
  `tahun_ajaran` VARCHAR(20) NOT NULL DEFAULT '2026/2027',
  `semester` ENUM('1', '2') NOT NULL DEFAULT '1',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_komponen_mapel_kelas` (`mapel_id`, `kelas_id`, `tahun_ajaran`, `semester`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `bobot_penilaian_mapel` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `mapel_id` INT NOT NULL,
  `kelas_id` INT NOT NULL,
  `tahun_ajaran` VARCHAR(20) NOT NULL DEFAULT '2026/2027',
  `semester` ENUM('1', '2') NOT NULL DEFAULT '1',
  `bobot_ph` INT DEFAULT 25,
  `bobot_praktik` INT DEFAULT 25,
  `bobot_uts` INT DEFAULT 25,
  `bobot_uas` INT DEFAULT 25,
  `kktp_kkm` INT DEFAULT 75,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_bobot_mapel_kelas` (`mapel_id`, `kelas_id`, `tahun_ajaran`, `semester`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `nilai_siswa` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `siswa_id` INT NOT NULL,
  `komponen_id` INT NOT NULL,
  `nilai` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  `catatan_guru` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uniq_siswa_komponen` (`siswa_id`, `komponen_id`),
  INDEX `idx_nilai_siswa` (`siswa_id`),
  INDEX `idx_nilai_komponen` (`komponen_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `rapor_akhir` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `siswa_id` INT NOT NULL,
  `kelas_id` INT NOT NULL,
  `mapel_id` INT NOT NULL,
  `avg_ph` DECIMAL(5,2) DEFAULT 0.00,
  `avg_praktik` DECIMAL(5,2) DEFAULT 0.00,
  `nilai_uts` DECIMAL(5,2) DEFAULT 0.00,
  `nilai_uas` DECIMAL(5,2) DEFAULT 0.00,
  `nilai_akhir` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  `predikat` VARCHAR(5) NOT NULL DEFAULT 'C',
  `deskripsi_capaian` TEXT DEFAULT NULL,
  `tahun_ajaran` VARCHAR(20) NOT NULL DEFAULT '2026/2027',
  `semester` ENUM('1', '2') NOT NULL DEFAULT '1',
  `status_kunci` TINYINT(1) DEFAULT 0,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uniq_siswa_mapel_sem` (`siswa_id`, `mapel_id`, `tahun_ajaran`, `semester`),
  INDEX `idx_rapor_siswa` (`siswa_id`),
  INDEX `idx_rapor_kelas` (`kelas_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 16. TABEL KALENDER PENDIDIKAN
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `kalender_pendidikan` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tahun_ajaran` VARCHAR(20) DEFAULT '2026/2027',
  `semester` INT DEFAULT 1,
  `kategori` VARCHAR(50) DEFAULT 'Kegiatan',
  `nama_kegiatan` VARCHAR(255) NOT NULL,
  `tanggal_mulai` DATE NOT NULL,
  `tanggal_selesai` DATE NOT NULL,
  `keterangan` TEXT NULL,
  `warna` VARCHAR(20) DEFAULT '#0066ff',
  `tingkat_target` VARCHAR(50) DEFAULT 'Semua',
  `kode_member` VARCHAR(50) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_kalender_tgl` (`tanggal_mulai`, `tanggal_selesai`),
  INDEX `idx_kalender_ta` (`tahun_ajaran`, `semester`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 17. TABEL KESISWAAN, PELANGGARAN & POIN TATA TERTIB
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `pelanggaran_siswa` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `kode_siswa` VARCHAR(50) NOT NULL,
  `kode_kelas` VARCHAR(50) DEFAULT NULL,
  `tanggal` DATE NOT NULL,
  `jam` VARCHAR(10) DEFAULT NULL,
  `jenis_pelanggaran` VARCHAR(255) NOT NULL,
  `kategori` ENUM('Ringan', 'Sedang', 'Berat') DEFAULT 'Ringan',
  `poin` INT DEFAULT 5,
  `tindakan_sanksi` TEXT DEFAULT NULL,
  `catatan` TEXT DEFAULT NULL,
  `pelapor` VARCHAR(100) DEFAULT NULL,
  `wa_status` VARCHAR(50) DEFAULT 'pending',
  `kode_member` VARCHAR(50) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_pelanggaran_siswa` (`kode_siswa`),
  INDEX `idx_pelanggaran_kelas` (`kode_kelas`),
  INDEX `idx_pelanggaran_tgl` (`tanggal`),
  INDEX `idx_pelanggaran_member` (`kode_member`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 18. TABEL EKSTRAKURIKULER & NILAI EKSKUL
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `ekstrakurikuler` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nama_ekskul` VARCHAR(200) NOT NULL,
  `pembina` VARCHAR(200) DEFAULT NULL,
  `kode_member` VARCHAR(50) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ekskul_siswa` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ekskul_id` INT NOT NULL,
  `siswa_id` INT NOT NULL,
  `kelas_id` INT NOT NULL,
  `tahun_ajaran` VARCHAR(20) DEFAULT '2026/2027',
  `semester` VARCHAR(10) DEFAULT '1',
  `predikat` VARCHAR(50) DEFAULT 'Baik',
  `keterangan` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_ekskul_siswa_sem` (`ekskul_id`, `siswa_id`, `kelas_id`, `tahun_ajaran`, `semester`),
  INDEX `idx_es_ekskul` (`ekskul_id`),
  INDEX `idx_es_siswa` (`siswa_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 19. TABEL RIWAYAT KENAIKAN KELAS & KELULUSAN ALUMNI
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `riwayat_kenaikan_siswa` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `kode_siswa` INT NOT NULL,
  `nis` VARCHAR(50) DEFAULT NULL,
  `nama_siswa` VARCHAR(255) DEFAULT NULL,
  `jenis_aksi` ENUM('Kenaikan', 'Tinggal', 'Kelulusan', 'Batal_Alumni', 'Mutasi') NOT NULL,
  `kelas_asal` VARCHAR(100) DEFAULT NULL,
  `kelas_tujuan` VARCHAR(100) DEFAULT NULL,
  `tahun_ajaran` VARCHAR(50) DEFAULT NULL,
  `tanggal` DATE NOT NULL,
  `keterangan` TEXT DEFAULT NULL,
  `kode_member` VARCHAR(50) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_rks_siswa` (`kode_siswa`),
  INDEX `idx_rks_tgl` (`tanggal`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 20. TABEL PERPUSTAKAAN DIGITAL (BUKU & SIRKULASI)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `perpustakaan_buku` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `kode_buku` VARCHAR(50) NOT NULL UNIQUE,
  `judul` VARCHAR(255) NOT NULL,
  `pengarang` VARCHAR(200) NOT NULL,
  `penerbit` VARCHAR(200) DEFAULT NULL,
  `tahun_terbit` VARCHAR(10) DEFAULT NULL,
  `isbn` VARCHAR(50) DEFAULT NULL,
  `kategori` VARCHAR(100) NOT NULL DEFAULT 'Umum',
  `lokasi_rak` VARCHAR(100) DEFAULT 'Rak A-1',
  `stok` INT NOT NULL DEFAULT 1,
  `tersedia` INT NOT NULL DEFAULT 1,
  `deskripsi` TEXT DEFAULT NULL,
  `sampul_url` TEXT DEFAULT NULL,
  `kode_member` VARCHAR(50) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_pbuku_kategori` (`kategori`),
  INDEX `idx_pbuku_member` (`kode_member`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `perpustakaan_peminjaman` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `kode_transaksi` VARCHAR(50) NOT NULL UNIQUE,
  `buku_id` INT NOT NULL,
  `peminjam_type` ENUM('siswa', 'guru') DEFAULT 'siswa',
  `peminjam_id` VARCHAR(50) NOT NULL,
  `nama_peminjam` VARCHAR(200) NOT NULL,
  `kelas_atau_jabatan` VARCHAR(100) DEFAULT '-',
  `tgl_pinjam` DATE NOT NULL,
  `tgl_tenggat` DATE NOT NULL,
  `tgl_kembali` DATE DEFAULT NULL,
  `status` ENUM('Dipinjam', 'Dikembalikan', 'Terlambat', 'Hilang') DEFAULT 'Dipinjam',
  `denda` DECIMAL(10,2) DEFAULT 0.00,
  `catatan` TEXT DEFAULT NULL,
  `kode_member` VARCHAR(50) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_ppinjam_buku` (`buku_id`),
  INDEX `idx_ppinjam_status` (`status`),
  INDEX `idx_ppinjam_member` (`kode_member`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 21. TABEL SARANA & PRASARANA (SAPRAS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `sapras_fasilitas` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `no_urut` INT NOT NULL DEFAULT 1,
  `fasilitas` VARCHAR(200) NOT NULL,
  `jumlah` INT NOT NULL DEFAULT 1,
  `keterangan` VARCHAR(100) NOT NULL DEFAULT 'BAIK',
  `kode_member` VARCHAR(50) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_sapras_f_member` (`kode_member`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sapras_sarana` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `no_urut` INT NOT NULL DEFAULT 1,
  `jenis_sapras` VARCHAR(255) NOT NULL,
  `jumlah` INT NOT NULL DEFAULT 1,
  `baik` INT NOT NULL DEFAULT 0,
  `rusak` INT NOT NULL DEFAULT 0,
  `keterangan` VARCHAR(150) DEFAULT NULL,
  `kode_member` VARCHAR(50) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_sapras_s_member` (`kode_member`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sapras_tanah` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `no_urut` INT NOT NULL DEFAULT 1,
  `penggunaan_tanah` VARCHAR(200) NOT NULL,
  `luas_tanah` DECIMAL(10,2) NOT NULL,
  `satuan` VARCHAR(20) DEFAULT 'M2',
  `keterangan` VARCHAR(150) DEFAULT NULL,
  `kode_member` VARCHAR(50) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_sapras_t_member` (`kode_member`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 22. TABEL KEUANGAN & PEMBAYARAN SPP (E-BMS)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `pos_pembayaran` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `kode_pos` VARCHAR(50) NOT NULL UNIQUE,
  `nama_pos` VARCHAR(150) NOT NULL,
  `tipe` ENUM('BULANAN', 'BEBAS') NOT NULL DEFAULT 'BULANAN',
  `deskripsi` TEXT DEFAULT NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `kode_member` VARCHAR(50) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_pos_kode` (`kode_pos`),
  INDEX `idx_pos_member` (`kode_member`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tarif_pembayaran` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `pos_id` INT NOT NULL,
  `tahun_ajaran` VARCHAR(20) NOT NULL DEFAULT '2026/2027',
  `tingkat` VARCHAR(20) DEFAULT NULL,
  `kode_kelas` VARCHAR(50) DEFAULT NULL,
  `nominal` BIGINT NOT NULL DEFAULT 0,
  `kode_member` VARCHAR(50) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_tarif_pos` (`pos_id`),
  INDEX `idx_tarif_ta_kelas` (`tahun_ajaran`, `kode_kelas`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tarif_siswa_override` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `tarif_id` INT NOT NULL,
  `siswa_id` INT NOT NULL,
  `tipe_potongan` ENUM('NOMINAL', 'PERSEN') NOT NULL DEFAULT 'NOMINAL',
  `nilai_potongan` BIGINT NOT NULL DEFAULT 0,
  `keterangan` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_tarif_siswa_ov` (`tarif_id`, `siswa_id`),
  INDEX `idx_override_tarif` (`tarif_id`),
  INDEX `idx_override_siswa` (`siswa_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `tagihan_siswa` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `kode_tagihan` VARCHAR(50) NOT NULL UNIQUE,
  `siswa_id` INT NOT NULL,
  `tarif_id` INT NOT NULL,
  `bulan` INT DEFAULT NULL,
  `tahun` INT DEFAULT NULL,
  `nominal_tagihan` BIGINT NOT NULL DEFAULT 0,
  `nominal_terbayar` BIGINT NOT NULL DEFAULT 0,
  `status` ENUM('UNPAID', 'PARTIAL', 'PAID', 'CANCELLED') NOT NULL DEFAULT 'UNPAID',
  `tanggal_jatuh_tempo` DATE DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_tagihan_siswa` (`siswa_id`),
  INDEX `idx_tagihan_tarif` (`tarif_id`),
  INDEX `idx_tagihan_status` (`status`),
  INDEX `idx_tagihan_periode` (`tahun`, `bulan`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `pembayaran_transaksi` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `no_transaksi` VARCHAR(50) NOT NULL UNIQUE,
  `reference_no` VARCHAR(100) DEFAULT NULL,
  `siswa_id` INT NOT NULL,
  `total_bayar` BIGINT NOT NULL DEFAULT 0,
  `metode_pembayaran` VARCHAR(50) DEFAULT 'CASH',
  `channel_pembayaran` VARCHAR(50) DEFAULT 'CASH_KASIR',
  `user_id_kasir` INT DEFAULT NULL,
  `status_transaksi` ENUM('PENDING', 'SUCCESS', 'CANCELLED', 'EXPIRED', 'FAILED') DEFAULT 'SUCCESS',
  `alasan_batal` TEXT DEFAULT NULL,
  `tanggal_bayar` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_ptrx_no` (`no_transaksi`),
  INDEX `idx_ptrx_ref` (`reference_no`),
  INDEX `idx_ptrx_siswa` (`siswa_id`),
  INDEX `idx_ptrx_status` (`status_transaksi`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `pembayaran_detail` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `transaksi_id` INT NOT NULL,
  `tagihan_id` INT NOT NULL,
  `nominal_dibayar` BIGINT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_pdetail_trx` (`transaksi_id`),
  INDEX `idx_pdetail_tagihan` (`tagihan_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- 23. TABEL PENGUMUMAN & INFORMASI SEKOLAH
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `pengumuman` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `judul` VARCHAR(255) NOT NULL,
  `kategori` VARCHAR(100) DEFAULT 'Umum',
  `isi` TEXT NOT NULL,
  `gambar_url` TEXT NULL,
  `penulis` VARCHAR(150) DEFAULT 'Administrator',
  `target_role` VARCHAR(50) DEFAULT 'Semua',
  `is_active` TINYINT(1) DEFAULT 1,
  `kode_member` VARCHAR(50) DEFAULT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_pengumuman_active` (`is_active`),
  INDEX `idx_pengumuman_member` (`kode_member`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================================================
-- INITIAL SEED DATA (DATA AWAL LENGKAP & SIAP PAKAI)
-- ==============================================================================

-- 1. SEED PROFIL SEKOLAH / MEMBER DEFAULT
INSERT INTO `member` (`id`, `kode_member`, `nama_member`, `npsn`, `alamat`, `kota`, `no_hp`, `email`, `kepala_sekolah`, `jam_masuk`, `toleransi_telat`, `jam_pulang`, `radius_gps`, `mode_presensi_guru`, `lat_sekolah`, `lng_sekolah`, `wa_provider`, `wa_auto_absen`, `wa_auto_pelanggaran`)
VALUES (1, 'SCH001', 'SMK ARTANITA TASIKMALAYA', '20279876', 'Jl. Cienteung No. 112 A, Kota Tasikmalaya', 'Kota Tasikmalaya', '081234567890', 'info@artanita.sch.id', 'Ali Irsan Shafar, SH.M.Pd', '07:00', 15, '15:30', 100, 'gps_kamera', '-7.325205', '108.208354', 'fonnte', 1, 1)
ON DUPLICATE KEY UPDATE `nama_member` = VALUES(`nama_member`);

-- 2. SEED AKUN USER / ADMIN
INSERT INTO `users` (`id`, `name`, `username`, `email`, `password`, `role`, `status`, `kode_member`) VALUES
(1, 'Super Administrator', 'admin', 'admin@artanita.sch.id', '123456', 'Super Admin', 'Active', 'SCH001'),
(2, 'Admin Perpustakaan', 'adminperpus', 'perpus@artanita.sch.id', '123456', 'Admin Perpustakaan', 'Active', 'SCH001'),
(3, 'Pustakawan Artanita', 'pustakawan', 'pustakawan@artanita.sch.id', '123456', 'Pustakawan', 'Active', 'SCH001'),
(4, 'Bendahara / Kasir TU', 'bendahara', 'keuangan@artanita.sch.id', '123456', 'Bendahara', 'Active', 'SCH001'),
(5, 'Kepala Sekolah', 'kepsek', 'kepsek@artanita.sch.id', '123456', 'Kepala Sekolah', 'Active', 'SCH001')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- 3. SEED MASTER JAM PELAJARAN
INSERT INTO `jadwal_jam` (`kode_jam`, `jam_ke`, `jam`) VALUES
(1, 1, '07:15 - 08:00'),
(2, 2, '08:00 - 08:45'),
(3, 3, '08:45 - 09:30'),
(4, 4, '09:45 - 10:30'),
(5, 5, '10:30 - 11:15'),
(6, 6, '11:15 - 12:00'),
(7, 7, '12:45 - 13:30'),
(8, 8, '13:30 - 14:15'),
(9, 9, '14:15 - 15:00')
ON DUPLICATE KEY UPDATE `jam` = VALUES(`jam`);

-- 4. SEED MASTER KATEGORI PENILAIAN
INSERT INTO `kategori_penilaian` (`id`, `kode_kategori`, `nama_kategori`, `kelompok`, `bobot_default`) VALUES
(1, 'PH', 'Penilaian Harian (Ulangan/Kuis)', 'FORMATIF', 25.00),
(2, 'PRAKTIK', 'Penilaian Praktik / Unjuk Kerja', 'KETERAMPILAN', 25.00),
(3, 'TUGAS', 'Penilaian Tugas & PR', 'FORMATIF', 15.00),
(4, 'UTS', 'Sumatif Tengah Semester (STS / UTS)', 'SUMATIF', 15.00),
(5, 'UAS', 'Sumatif Akhir Semester (SAS / UAS)', 'SUMATIF', 20.00),
(6, 'P5', 'Proyek Penguatan Profil Pelajar Pancasila (P5)', 'PROYEK', 0.00)
ON DUPLICATE KEY UPDATE `nama_kategori` = VALUES(`nama_kategori`);

-- 5. SEED MASTER POS KEUANGAN
INSERT INTO `pos_pembayaran` (`id`, `kode_pos`, `nama_pos`, `tipe`, `deskripsi`, `is_active`, `kode_member`) VALUES
(1, 'POS-SPP', 'SPP Bulanan', 'BULANAN', 'Sumbangan Pembinaan Pendidikan rutin setiap bulan', 1, 'SCH001'),
(2, 'POS-DSP', 'Uang Gedung / DSP', 'BEBAS', 'Dana Sumbangan Pendidikan / Pembangunan Gedung Sekolah', 1, 'SCH001'),
(3, 'POS-SRG', 'Uang Seragam & Atribut', 'BEBAS', 'Seragam OSIS, Pramuka, Batik, Olahraga, & Atribut', 1, 'SCH001'),
(4, 'POS-PTS', 'Uang Ujian PTS/PAS', 'BEBAS', 'Biaya Administrasi Pelaksanaan Ujian Semester', 1, 'SCH001'),
(5, 'POS-EKS', 'Iuran Ekstrakurikuler', 'BULANAN', 'Iuran operasional kegiatan ekstrakurikuler', 1, 'SCH001')
ON DUPLICATE KEY UPDATE `nama_pos` = VALUES(`nama_pos`);

-- 6. SEED TARIF PEMBAYARAN DASAR
INSERT INTO `tarif_pembayaran` (`id`, `pos_id`, `tahun_ajaran`, `tingkat`, `kode_kelas`, `nominal`, `kode_member`) VALUES
(1, 1, '2026/2027', NULL, NULL, 350000, 'SCH001'),
(2, 2, '2026/2027', NULL, NULL, 3500000, 'SCH001'),
(3, 3, '2026/2027', NULL, NULL, 850000, 'SCH001'),
(4, 4, '2026/2027', NULL, NULL, 150000, 'SCH001')
ON DUPLICATE KEY UPDATE `nominal` = VALUES(`nominal`);

-- 7. SEED MASTER EKSTRAKURIKULER
INSERT INTO `ekstrakurikuler` (`id`, `nama_ekskul`, `pembina`, `kode_member`) VALUES
(1, 'Pramuka Gudep Artanita', 'Kak Ahmad, S.Pd', 'SCH001'),
(2, 'Paskibra', 'Kak Rian', 'SCH001'),
(3, 'PMR / UKS', 'Ibu Siti Rahma, S.Kep', 'SCH001'),
(4, 'Rohani Islam (Rohis)', 'Ust. Fauzi, S.Pd.I', 'SCH001'),
(5, 'Futsal & Sepak Bola', 'Coach Dani', 'SCH001'),
(6, 'Basket Club', 'Coach Hendra', 'SCH001'),
(7, 'IT & Coding Club', 'Jazman, S.Kom', 'SCH001')
ON DUPLICATE KEY UPDATE `nama_ekskul` = VALUES(`nama_ekskul`);

-- 8. SEED BUKU PERPUSTAKAAN
INSERT INTO `perpustakaan_buku` (`id`, `kode_buku`, `judul`, `pengarang`, `penerbit`, `tahun_terbit`, `isbn`, `kategori`, `lokasi_rak`, `stok`, `tersedia`, `deskripsi`, `kode_member`) VALUES
(1, 'BUK-001', 'Matematika SMK Fase E (Kurikulum Merdeka)', 'Dr. Suparno, M.Sc', 'Erlangga', '2024', '978-602-01-0001-1', 'Pelajaran', 'Rak A-1', 15, 15, 'Buku panduan utama pembelajaran Matematika SMK Fase E.', 'SCH001'),
(2, 'BUK-002', 'Dasar-Dasar Teknik Komputer & Jaringan', 'Prof. Bambang Haryono', 'Informatika', '2023', '978-602-01-0002-8', 'Teknologi', 'Rak A-2', 12, 12, 'Buku paket kejuruan TKJ materi router, switch, dan TCP/IP.', 'SCH001'),
(3, 'BUK-003', 'Laskar Pelangi', 'Andrea Hirata', 'Bentang Pustaka', '2005', '978-979-3062-79-2', 'Fiksi', 'Rak B-1', 5, 5, 'Novel populer perjuangan 10 anak di Belitung mengejar cita-cita.', 'SCH001'),
(4, 'BUK-004', 'Pemrograman Web Modern React & Node.js', 'Eko Prasetyo, M.Kom', 'Informatika', '2025', '978-623-00-1234-5', 'Teknologi', 'Rak C-1', 8, 8, 'Panduan fullstack web development modern React 19 dan Express.', 'SCH001'),
(5, 'BUK-005', 'Filosofi Teras', 'Henry Manampiring', 'Kompas', '2020', '978-602-412-518-9', 'Psikologi', 'Rak D-1', 6, 6, 'Penerapan filsafat Stoisisme dalam kehidupan sehari-hari anak muda.', 'SCH001')
ON DUPLICATE KEY UPDATE `judul` = VALUES(`judul`);

-- 9. SEED FASILITAS & SARANA PRASARANA
INSERT INTO `sapras_fasilitas` (`id`, `no_urut`, `fasilitas`, `jumlah`, `keterangan`, `kode_member`) VALUES
(1, 1, 'GARASI & PARKIR KENDARAAN', 1, 'BAIK', 'SCH001'),
(2, 2, 'MESJID SEKOLAH', 1, 'BAIK', 'SCH001'),
(3, 3, 'RUANG KBM KELAS', 12, 'BAIK', 'SCH001'),
(4, 4, 'RUANG AULA PERTEMUAN', 1, 'BAIK', 'SCH001'),
(5, 5, 'LABORATORIUM KOMPUTER', 5, 'BAIK', 'SCH001'),
(6, 6, 'RUANG GURU & STAFF', 1, 'BAIK', 'SCH001'),
(7, 7, 'RUANG KEPALA SEKOLAH', 1, 'BAIK', 'SCH001'),
(8, 8, 'PERPUSTAKAAN DIGITAL', 1, 'BAIK', 'SCH001'),
(9, 9, 'RUANG UKS', 1, 'BAIK', 'SCH001'),
(10, 10, 'RUANG TEACHING FACTORY', 1, 'BAIK', 'SCH001')
ON DUPLICATE KEY UPDATE `fasilitas` = VALUES(`fasilitas`);

INSERT INTO `sapras_sarana` (`id`, `no_urut`, `jenis_sapras`, `jumlah`, `baik`, `rusak`, `keterangan`, `kode_member`) VALUES
(1, 1, 'AC PENDINGIN RUANGAN', 5, 5, 0, 'Terpasang di Ruang Lab & Server', 'SCH001'),
(2, 2, 'KOMPUTER LAB PC', 50, 48, 2, 'Core i5 16GB SSD', 'SCH001'),
(3, 3, 'LAPTOP OPERASIONAL', 15, 15, 0, 'Laptop Inventaris Guru', 'SCH001'),
(4, 4, 'PROYEKTOR & LAYAR SCREEN', 6, 6, 0, 'Laboratorium & Ruang Aula', 'SCH001'),
(5, 5, 'MEJA & KURSI SISWA', 300, 295, 5, 'Setiap Ruang KBM', 'SCH001'),
(6, 6, 'MEJA & KURSI GURU', 40, 40, 0, 'Ruang Guru & Tata Usaha', 'SCH001'),
(7, 7, 'ROUTER MIKROTIK & ACCESS POINT', 10, 10, 0, 'Jaringan WiFi Sekolah', 'SCH001'),
(8, 8, 'PRINTER SCANNER', 4, 4, 0, 'Ruang TU & Perpustakaan', 'SCH001')
ON DUPLICATE KEY UPDATE `jenis_sapras` = VALUES(`jenis_sapras`);

INSERT INTO `sapras_tanah` (`id`, `no_urut`, `penggunaan_tanah`, `luas_tanah`, `satuan`, `keterangan`, `kode_member`) VALUES
(1, 1, 'BANGUNAN UTAMA & LAB', 750.00, 'M2', 'Sertifikat Hak Milik Yayasan', 'SCH001'),
(2, 2, 'HALAMAN & TAMAN', 120.00, 'M2', 'Area Hijau & Upacara', 'SCH001'),
(3, 3, 'LAPANGAN OLAHRAGA MULTIFUNGSI', 350.00, 'M2', 'Futsal, Basket, Voli', 'SCH001')
ON DUPLICATE KEY UPDATE `penggunaan_tanah` = VALUES(`penggunaan_tanah`);

-- 10. SEED PENGUMUMAN PERDANA
INSERT INTO `pengumuman` (`id`, `judul`, `kategori`, `isi`, `gambar_url`, `penulis`, `target_role`, `is_active`, `kode_member`) VALUES
(1, 'Selamat Datang di Portal E-Sekolah Digital Terintegrasi', 'Akademik', 'Selamat datang di Sistem Informasi Manajemen E-Sekolah & E-BMS SMK Artanita Tasikmalaya. Seluruh layanan absensi, keuangan SPP, penilaian kurikulum, perpustakaan, hingga sarana prasarana telah terintegrasi dalam satu portal cerdas.', NULL, 'Super Administrator', 'Semua', 1, 'SCH001')
ON DUPLICATE KEY UPDATE `judul` = VALUES(`judul`);

SET FOREIGN_KEY_CHECKS = 1;

-- ==============================================================================
-- END OF SCHEMA SCRIPT
-- ==============================================================================
