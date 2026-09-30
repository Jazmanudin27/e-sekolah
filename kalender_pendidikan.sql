-- ==============================================================================
-- DDL & DML KALENDER PENDIDIKAN TAHUN AJARAN 2026/2027
-- Disdik Provinsi Jawa Barat (Nomor: 30234/PK.02.01.05/PSMA)
-- ==============================================================================

-- 1. Buat Tabel kalender_pendidikan
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
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Bersihkan data kalender tahun ajaran 2026/2027 jika ada sebelumnya (opsional)
-- DELETE FROM `kalender_pendidikan` WHERE `tahun_ajaran` = '2026/2027';

-- 3. Isi Data Kalender Pendidikan Semester 1 & Semester 2 TA 2026/2027
INSERT INTO `kalender_pendidikan` 
(`tahun_ajaran`, `semester`, `kategori`, `nama_kegiatan`, `tanggal_mulai`, `tanggal_selesai`, `keterangan`, `warna`, `tingkat_target`) 
VALUES
-- ================= SEMESTER 1 (TAHUN 2026) =================
('2026/2027', 1, 'Kegiatan', 'Daftar Ulang SPMB SMA/SMK Maung', '2026-06-09', '2026-06-10', 'Daftar ulang peserta didik baru jalur khusus', '#0284c7', 'SMK/SMA'),
('2026/2027', 1, 'Kegiatan', 'Daftar Ulang SPMB SMA/SMK Tahap I', '2026-06-26', '2026-06-29', 'Daftar ulang peserta didik baru tahap 1', '#0284c7', 'SMK/SMA'),
('2026/2027', 1, 'Kegiatan', 'Daftar Ulang Luring SPMB SLB', '2026-06-26', '2026-06-29', 'Daftar ulang luring SLB tahap 1', '#0284c7', 'SLB'),
('2026/2027', 1, 'Lomba', 'Olimpiade Olahraga Siswa Nasional (O2SN) Tk. Provinsi', '2026-07-02', '2026-07-03', 'Pelaksanaan O2SN tingkat Provinsi Jawa Barat', '#8b5cf6', 'Semua'),
('2026/2027', 1, 'Lomba', 'Lomba Debat Bahasa Indonesia (LDBI) Tk. Provinsi', '2026-07-11', '2026-07-12', 'Kompetisi debat bahasa tingkat provinsi', '#8b5cf6', 'SMK/SMA'),
('2026/2027', 1, 'Kegiatan', 'Daftar Ulang SPMB SMA/SMK Tahap 2', '2026-07-13', '2026-07-14', 'Daftar ulang peserta didik baru tahap 2', '#0284c7', 'SMK/SMA'),
('2026/2027', 1, 'Kegiatan', 'Daftar Ulang Daring SPMB SLB', '2026-07-13', '2026-07-14', 'Daftar ulang daring SLB tahap 2', '#0284c7', 'SLB'),
('2026/2027', 1, 'Kegiatan', 'Penyelarasan Kurikulum SMK dengan Industri (DUDI)', '2026-07-14', '2026-07-14', 'Penyesuaian materi pembelajaran, standar kompetensi, dan budaya kerja dengan DUDI', '#059669', 'SMK'),
('2026/2027', 1, 'Lomba', 'Festival Lomba Seni dan Sastra Siswa Nasional (FLS3N) Pendidikan Khusus', '2026-07-13', '2026-07-18', 'Perkiraan FLS3N Pendidikan Khusus Tk. Nasional (Daring)', '#8b5cf6', 'SLB'),
('2026/2027', 1, 'Kegiatan', 'Hari Pertama Masuk Sekolah Semester 1', '2026-07-15', '2026-07-15', 'Awal tahun ajaran baru 2026/2027 masuk serempak', '#10b981', 'Semua'),
('2026/2027', 1, 'MPLS', 'Masa Pengenalan Lingkungan Sekolah (MPLS)', '2026-07-15', '2026-07-21', 'Kegiatan MPLS peserta didik baru (15-17 Juli dan 20-21 Juli 2026)', '#f59e0b', 'Semua'),
('2026/2027', 1, 'Lomba', 'Lomba Kompetensi Siswa (LKS) Jenjang Menengah Tk. Nasional', '2026-07-26', '2026-08-01', 'LKS Jenjang Pendidikan Menengah Tk. Nasional (Daring & Luring)', '#8b5cf6', 'SMK'),
('2026/2027', 1, 'Lomba', 'Olimpiade Sains Nasional (OSN) Jenjang Menengah Tk. Provinsi', '2026-07-27', '2026-07-29', 'OSN Jenjang Pendidikan Menengah Tk. Provinsi Jawa Barat', '#8b5cf6', 'SMK/SMA'),
('2026/2027', 1, 'Kegiatan', 'Program Pemberian Imunisasi SD/MI Tahap 1', '2026-08-01', '2026-08-31', 'Pelaksanaan Program Imunisasi SD/MI (kelas 1, 2, 5, 6)', '#0284c7', 'SD'),
('2026/2027', 1, 'Kegiatan', 'Pelaksanaan Survey Lingkungan Belajar (Sulingjar)', '2026-08-03', '2026-08-31', 'Sulingjar Kepala Satuan Pendidikan dan Pendidik PAUD, SD, SMP, SMA, SMK, SLB', '#0284c7', 'Semua'),
('2026/2027', 1, 'Lomba', 'LKS Jenjang Pendidikan Khusus Tk. Nasional', '2026-08-03', '2026-08-08', 'Lomba Kompetensi Siswa Pendidikan Khusus (Daring)', '#8b5cf6', 'SLB'),
('2026/2027', 1, 'Lomba', 'FLS3N Jenjang Pendidikan Menengah Tk. Provinsi', '2026-08-08', '2026-08-08', 'Festival Lomba Seni dan Sastra Siswa Nasional SMA/SMK Tk. Provinsi', '#8b5cf6', 'SMK/SMA'),
('2026/2027', 1, 'Kegiatan', 'Kegiatan Hari Pramuka Nasional', '2026-08-14', '2026-08-14', 'Peringatan Hari Pramuka Nasional ke-65', '#b45309', 'Semua'),
('2026/2027', 1, 'Libur', 'Libur Hari Proklamasi Kemerdekaan RI Ke-81', '2026-08-17', '2026-08-17', 'HUT Kemerdekaan Republik Indonesia', '#ef4444', 'Semua'),
('2026/2027', 1, 'Lomba', 'O2SN Jenjang Pendidikan Dasar Tk. Nasional', '2026-08-17', '2026-08-23', 'Olimpiade Olahraga Siswa Nasional Pendidikan Dasar (Luring)', '#8b5cf6', 'SD/SMP'),
('2026/2027', 1, 'Libur', 'Libur Maulid Nabi Muhammad SAW 1448 H', '2026-08-25', '2026-08-25', 'Hari Libur Nasional Keagamaan', '#ef4444', 'Semua'),
('2026/2027', 1, 'Lomba', 'OSN Jenjang Pendidikan Dasar Tk. Nasional', '2026-08-25', '2026-08-31', 'Olimpiade Sains Nasional SD/SMP (Daring)', '#8b5cf6', 'SD/SMP'),
('2026/2027', 1, 'Lomba', 'Lomba Debat Indonesia (LDI) Jenjang Menengah Tk. Nasional', '2026-08-31', '2026-09-06', 'Lomba Debat Nasional Daring', '#8b5cf6', 'SMK/SMA'),
('2026/2027', 1, 'Lomba', 'Festival Inovasi & Kewirausahaan Siswa (FIKSI) Tk. Nasional', '2026-09-07', '2026-09-12', 'FIKSI Jenjang Pendidikan Menengah', '#8b5cf6', 'SMK/SMA'),
('2026/2027', 1, 'Lomba', 'O2SN Jenjang Pendidikan Khusus Tk. Nasional', '2026-09-07', '2026-09-12', 'Olimpiade Olahraga Siswa Khusus (Luring)', '#8b5cf6', 'SLB'),
('2026/2027', 1, 'Lomba', 'O2SN Jenjang Pendidikan Menengah Tk. Nasional', '2026-09-07', '2026-09-13', 'Olimpiade Olahraga Siswa Menengah (Luring)', '#8b5cf6', 'SMK/SMA'),
('2026/2027', 1, 'Lomba', 'OSN Jenjang Pendidikan Menengah Tk. Nasional', '2026-09-14', '2026-09-20', 'Olimpiade Sains Nasional SMA/SMK (Luring)', '#8b5cf6', 'SMK/SMA'),
('2026/2027', 1, 'Lomba', 'Olimpiade Penelitian Siswa Indonesia (OPSI) Tk. Nasional', '2026-09-24', '2026-09-30', 'OPSI Jenjang Menengah (Luring)', '#8b5cf6', 'SMK/SMA'),
('2026/2027', 1, 'Lomba', 'FLS3N Jenjang Pendidikan Dasar Tk. Nasional', '2026-09-28', '2026-10-03', 'Festival Lomba Seni Siswa Dasar (Daring)', '#8b5cf6', 'SD/SMP'),
('2026/2027', 1, 'Lomba', 'FLS3N Jenjang Pendidikan Menengah Tk. Nasional', '2026-10-05', '2026-10-10', 'Festival Lomba Seni Siswa Menengah (Daring)', '#8b5cf6', 'SMK/SMA'),
('2026/2027', 1, 'Lomba', 'Gala Siswa Indonesia (GSI) Tk. Nasional', '2026-10-20', '2026-10-31', 'GSI Jenjang Pendidikan Dasar (Luring)', '#8b5cf6', 'SD/SMP'),
('2026/2027', 1, 'Ujian', 'Tes Kemampuan Akademik (TKA) Gelombang 1 & 2', '2026-10-26', '2026-11-08', 'Pelaksanaan TKA Jenjang SMA/MA/SMALB/Paket C dan SMK/MAK', '#f59e0b', 'SMK/SMA'),
('2026/2027', 1, 'Ujian', 'Uji Kompetensi Keahlian (UKK) 2026 Kelas XII & XIII SMK', '2026-11-09', '2026-12-11', 'Pelaksanaan UKK SMK Semester V bagi siswa yang PKL Semester VI', '#f59e0b', 'SMK'),
('2026/2027', 1, 'Kegiatan', 'Program Pemberian Imunisasi SD/MI Tahap 2', '2026-11-01', '2026-11-30', 'Pelaksanaan imunisasi SD/MI (kelas 1, 2, 5, 6)', '#0284c7', 'SD'),
('2026/2027', 1, 'Kegiatan', 'Gelar Aksi Karakter Siswa Indonesia Tk. Provinsi', '2026-11-21', '2026-11-21', 'Kegiatan penguatan pendidikan karakter provinsi Jawa Barat', '#059669', 'Semua'),
('2026/2027', 1, 'Kegiatan', 'Hari Guru Nasional & HUT PGRI', '2026-11-25', '2026-11-25', 'Peringatan Hari Guru Nasional', '#059669', 'Semua'),
('2026/2027', 1, 'Ujian', 'Pelaksanaan Tes Kemampuan Akademik Susulan', '2026-11-16', '2026-11-29', 'TKA Susulan SMA/SMK/SMALB/MA', '#f59e0b', 'SMK/SMA'),
('2026/2027', 1, 'Ujian', 'Asesmen Sumatif Akhir Semester (ASAS) Ganjil', '2026-11-30', '2026-12-11', 'Penilaian sumatif akhir semester ganjil semua jenjang', '#dc2626', 'Semua'),
('2026/2027', 1, 'Kegiatan', 'Hari Disabilitas Internasional', '2026-12-03', '2026-12-03', 'Peringatan Hari Disabilitas', '#0284c7', 'Semua'),
('2026/2027', 1, 'Rapor', 'Penetapan & Pembagian Rapor Semester 1', '2026-12-23', '2026-12-23', 'Penyerahan laporan hasil belajar siswa semester ganjil', '#0284c7', 'Semua'),
('2026/2027', 1, 'Libur', 'Cuti Bersama Hari Raya Natal', '2026-12-24', '2026-12-24', 'Cuti Bersama Hari Raya Natal', '#ef4444', 'Semua'),
('2026/2027', 1, 'Libur', 'Libur Hari Raya Natal', '2026-12-25', '2026-12-25', 'Hari Libur Nasional Hari Raya Natal', '#ef4444', 'Semua'),
('2026/2027', 1, 'Libur', 'Perkiraan Libur Semester 1 (Ganjil)', '2026-12-28', '2027-01-08', 'Libur pembelajaran akhir semester 1', '#ef4444', 'Semua'),

-- ================= SEMESTER 2 (TAHUN 2027) =================
('2026/2027', 2, 'Libur', 'Libur Tahun Baru Masehi 2027', '2027-01-01', '2027-01-01', 'Hari Libur Nasional Tahun Baru', '#ef4444', 'Semua'),
('2026/2027', 2, 'Libur', 'Perkiraan Libur Isra Mi\'raj 1448 H', '2027-01-05', '2027-01-05', 'Hari Libur Nasional Keagamaan', '#ef4444', 'Semua'),
('2026/2027', 2, 'Kegiatan', 'Hari Pertama Masuk Sekolah Semester 2', '2027-01-11', '2027-01-11', 'Awal kegiatan belajar mengajar semester genap', '#10b981', 'Semua'),
('2026/2027', 2, 'Libur', 'Perkiraan Libur Tahun Baru Imlek 2578', '2027-02-06', '2027-02-06', 'Hari Libur Nasional', '#ef4444', 'Semua'),
('2026/2027', 2, 'Libur', 'Perkiraan Libur Awal Ramadan 1448 H', '2027-02-08', '2027-02-12', 'Penetapan menyesuaikan ketetapan pemerintah', '#ef4444', 'Semua'),
('2026/2027', 2, 'Kegiatan', 'Penumbuhan Budi Pekerti / Pesantren Ramadhan', '2027-02-15', '2027-03-05', 'Kegiatan keagamaan dan penguatan karakter ramadhan', '#059669', 'Semua'),
('2026/2027', 2, 'Libur', 'Perkiraan Libur Hari Raya Idul Fitri 1448 H', '2027-03-08', '2027-03-19', 'Libur hari raya Idul Fitri dan cuti bersama', '#ef4444', 'Semua'),
('2026/2027', 2, 'Libur', 'Perkiraan Libur Hari Raya Nyepi (Tahun Baru Saka 1949)', '2027-03-09', '2027-03-09', 'Hari Libur Nasional', '#ef4444', 'Semua'),
('2026/2027', 2, 'Libur', 'Perkiraan Hari Raya Idul Fitri 1448 H (1 Syawal)', '2027-03-10', '2027-03-10', 'Hari Raya Idul Fitri 1448 H', '#ef4444', 'Semua'),
('2026/2027', 2, 'Ujian', 'Perkiraan Asesmen Sumatif Akhir Jenjang (ASAJ) SMA/SMK', '2027-03-22', '2027-04-02', 'Ujian akhir jenjang bagi siswa kelas XII', '#f59e0b', 'SMK/SMA'),
('2026/2027', 2, 'Kegiatan', 'PKL / Magang SMALB Kelas XI', '2027-03-01', '2027-04-30', 'Pelaksanaan magang kerja siswa SMALB', '#0284c7', 'SLB'),
('2026/2027', 2, 'Ujian', 'Perkiraan Pelaksanaan UKK SMK / SMALB', '2027-03-29', '2027-04-30', 'Uji Kompetensi Keahlian SMK Semester VI', '#f59e0b', 'SMK'),
('2026/2027', 2, 'Ujian', 'Perkiraan TKA SMP/MTs/SMPLB', '2027-04-05', '2027-04-16', 'Tes Kemampuan Akademik jenjang SMP/sederajat', '#f59e0b', 'SMP'),
('2026/2027', 2, 'Ujian', 'Perkiraan ASAJ SD/SDLB', '2027-04-12', '2027-04-23', 'Asesmen Sumatif Akhir Jenjang SD/sederajat', '#f59e0b', 'SD'),
('2026/2027', 2, 'Ujian', 'Perkiraan TKA SD/MI/SDLB', '2027-04-19', '2027-04-30', 'Tes Kemampuan Akademik jenjang SD/sederajat', '#f59e0b', 'SD'),
('2026/2027', 2, 'Lomba', 'Pelaksanaan LKS Tk. Kabupaten/Kota', '2027-04-01', '2027-04-30', 'Lomba Kompetensi Siswa SMK Tk. Kab/Kota', '#8b5cf6', 'SMK'),
('2026/2027', 2, 'Libur', 'Perkiraan Libur Wafat Isa Almasih', '2027-04-26', '2027-04-26', 'Hari Libur Nasional', '#ef4444', 'Semua'),
('2026/2027', 2, 'Ujian', 'Perkiraan ASAJ SMP/SMPLB', '2027-04-26', '2027-05-07', 'Asesmen Sumatif Akhir Jenjang SMP/sederajat', '#f59e0b', 'SMP'),
('2026/2027', 2, 'Libur', 'Libur Hari Buruh Internasional', '2027-05-01', '2027-05-01', 'Hari Libur Nasional Hari Buruh', '#ef4444', 'Semua'),
('2026/2027', 2, 'Kegiatan', 'Hari Pendidikan Nasional (Hardiknas)', '2027-05-02', '2027-05-02', 'Peringatan Hari Pendidikan Nasional', '#0284c7', 'Semua'),
('2026/2027', 2, 'Kegiatan', 'Perkiraan Penetapan Kelulusan SMA/SMK/SMALB', '2027-05-03', '2027-05-03', 'Rapat dewan guru dan penetapan kelulusan kelas XII', '#10b981', 'SMK/SMA'),
('2026/2027', 2, 'Libur', 'Libur Kenaikan Isa Almasih', '2027-05-06', '2027-05-06', 'Hari Libur Nasional', '#ef4444', 'Semua'),
('2026/2027', 2, 'Libur', 'Perkiraan Libur Hari Raya Waisak 2571', '2027-05-16', '2027-05-16', 'Hari Libur Keagamaan Nasional', '#ef4444', 'Semua'),
('2026/2027', 2, 'Libur', 'Perkiraan Hari Raya Idul Adha 1448 H', '2027-05-17', '2027-05-17', 'Hari Raya Idul Adha', '#ef4444', 'Semua'),
('2026/2027', 2, 'Ujian', 'Perkiraan ASAJ SD/SMP Sederajat', '2027-05-11', '2027-05-21', 'Asesmen sumatif akhir jenjang SD/SMP', '#f59e0b', 'SD/SMP'),
('2026/2027', 2, 'Lomba', 'Pelaksanaan O2SN & FLS3N Tk. Kab/Kota', '2027-05-01', '2027-05-31', 'Kompetisi olahraga & seni tingkat kabupaten/kota', '#8b5cf6', 'Semua'),
('2026/2027', 2, 'Libur', 'Libur Hari Lahir Pancasila', '2027-06-01', '2027-06-01', 'Hari Libur Nasional', '#ef4444', 'Semua'),
('2026/2027', 2, 'Kegiatan', 'Perkiraan Penetapan Kelulusan SDLB/SMPLB', '2027-06-02', '2027-06-02', 'Rapat pleno kelulusan SDLB dan SMPLB', '#10b981', 'SD/SMP'),
('2026/2027', 2, 'Libur', 'Perkiraan Libur Tahun Baru Islam 1449 H', '2027-06-06', '2027-06-06', 'Hari Libur Nasional', '#ef4444', 'Semua'),
('2026/2027', 2, 'Ujian', 'Asesmen Sumatif Akhir Tahun / Akhir Fase (ASAT)', '2027-06-07', '2027-06-18', 'Penilaian sumatif kenaikan kelas seluruh jenjang', '#dc2626', 'Semua'),
('2026/2027', 2, 'Lomba', 'Pelaksanaan LKS Tk. Provinsi', '2027-06-01', '2027-06-30', 'LKS SMK tingkat provinsi Jawa Barat', '#8b5cf6', 'SMK'),
('2026/2027', 2, 'Lomba', 'Pelaksanaan OSN Tk. Kabupaten/Kota', '2027-06-01', '2027-06-30', 'Olimpiade Sains Nasional tingkat kab/kota', '#8b5cf6', 'Semua'),
('2026/2027', 2, 'Rapor', 'Penetapan & Pembagian Rapor Semester 2', '2027-06-25', '2027-06-25', 'Penyerahan buku rapor kenaikan kelas', '#0284c7', 'Semua'),
('2026/2027', 2, 'Libur', 'Libur Akhir Tahun Ajaran 2026/2027', '2027-06-28', '2027-07-09', 'Libur akhir tahun ajaran & persiapan tahun ajaran baru', '#ef4444', 'Semua'),
('2026/2027', 2, 'Kegiatan', 'Perkiraan Masa SPMB Tahun Ajaran 2027/2028', '2027-06-15', '2027-07-15', 'Penerimaan Murid Baru Tahun Ajaran 2027/2028', '#0284c7', 'Semua');
