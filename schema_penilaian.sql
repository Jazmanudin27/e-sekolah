-- ========================================================
-- SKRIP SQL SINKRONISASI TABEL MODUL PENILAIAN E-SEKOLAH
-- Jalankan skrip ini di Navicat / MySQL Workbench / phpMyAdmin
-- Database Target: artanita
-- ========================================================

SET FOREIGN_KEY_CHECKS = 0;

-- 1. TABEL KATEGORI PENILAIAN
CREATE TABLE IF NOT EXISTS `kategori_penilaian` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `kode_kategori` VARCHAR(30) NOT NULL UNIQUE,
  `nama_kategori` VARCHAR(100) NOT NULL,
  `kelompok` ENUM('FORMATIF', 'SUMATIF', 'PROYEK', 'KETERAMPILAN', 'SIKAP') DEFAULT 'FORMATIF',
  `bobot_default` DECIMAL(5,2) DEFAULT 1.00,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- SEED DATA DEFAULT KATEGORI (Jika belum ada)
INSERT IGNORE INTO `kategori_penilaian` (`id`, `kode_kategori`, `nama_kategori`, `kelompok`, `bobot_default`) VALUES
(1, 'PH', 'Penilaian Harian (Ulangan/Kuis)', 'FORMATIF', 25.00),
(2, 'PRAKTIK', 'Penilaian Praktik / Unjuk Kerja', 'KETERAMPILAN', 25.00),
(3, 'TUGAS', 'Penilaian Tugas & PR', 'FORMATIF', 15.00),
(4, 'UTS', 'Sumatif Tengah Semester (STS / UTS)', 'SUMATIF', 15.00),
(5, 'UAS', 'Sumatif Akhir Semester (SAS / UAS)', 'SUMATIF', 20.00),
(6, 'P5', 'Proyek Penguatan Profil Pelajar Pancasila (P5)', 'PROYEK', 0.00);

-- 2. TABEL KOMPONEN PENILAIAN (Setiap Item Tugas/Ujian per Class & Mapel)
CREATE TABLE IF NOT EXISTS `komponen_penilaian` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `mapel_id` INT NOT NULL,
  `kelas_id` INT NOT NULL,
  `guru_id` INT NULL,
  `kategori_id` INT NOT NULL,
  `nama_komponen` VARCHAR(150) NOT NULL,
  `tanggal_penilaian` DATE NULL,
  `tahun_ajaran` VARCHAR(20) NOT NULL DEFAULT '2026/2027',
  `semester` ENUM('1', '2') NOT NULL DEFAULT '1',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. TABEL KONFIGURASI BOBOT MAPEL
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
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. TABEL DETAIL NILAI SISWA
CREATE TABLE IF NOT EXISTS `nilai_siswa` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `siswa_id` INT NOT NULL,
  `komponen_id` INT NOT NULL,
  `nilai` DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  `catatan_guru` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uniq_siswa_komponen` (`siswa_id`, `komponen_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. TABEL REKAP RAPOR AKHIR
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
  `deskripsi_capaian` TEXT NULL,
  `tahun_ajaran` VARCHAR(20) NOT NULL DEFAULT '2026/2027',
  `semester` ENUM('1', '2') NOT NULL DEFAULT '1',
  `status_kunci` TINYINT(1) DEFAULT 0,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY `uniq_siswa_mapel_sem` (`siswa_id`, `mapel_id`, `tahun_ajaran`, `semester`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

SET FOREIGN_KEY_CHECKS = 1;
