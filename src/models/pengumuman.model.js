const { getTenantPool } = require('../config/database');

class PengumumanModel {
  static async ensureTable() {
    const pool = getTenantPool();
    const query = `
      CREATE TABLE IF NOT EXISTS pengumuman (
        id INT AUTO_INCREMENT PRIMARY KEY,
        judul VARCHAR(255) NOT NULL,
        kategori VARCHAR(100) DEFAULT 'Umum',
        isi TEXT NOT NULL,
        gambar_url TEXT NULL,
        penulis VARCHAR(150) DEFAULT 'Administrator',
        target_role VARCHAR(50) DEFAULT 'Semua',
        is_active TINYINT(1) DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `;
    try {
      await pool.query(query);
      // Insert sample initial announcements if table is empty
      const [rows] = await pool.query('SELECT COUNT(*) as cnt FROM pengumuman');
      if (rows[0].cnt === 0) {
        await pool.query(`
          INSERT INTO pengumuman (judul, kategori, isi, gambar_url, penulis, target_role, is_active) VALUES
          (
            'Ujian Akhir Semester (UAS) Ganjil Tahun Ajaran 2026/2027',
            'Penting',
            'Diberitahukan kepada seluruh siswa dan dewan guru bahwa pelaksanaan Ujian Akhir Semester (UAS) Ganjil akan dilaksanakan secara serentak mulai minggu depan. Harap mempersiapkan jadwal mengajar & kartu ujian.',
            'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
            'Kepala Sekolah',
            'Semua',
            1
          ),
          (
            'Sosialisasi Presensi Digital Smart Campus SMK Artanita',
            'Kegiatan',
            'Sistem Presensi Digital E-Sekolah berbasis GPS & Anti-Fake GPS kini resmi diaktifkan. Seluruh siswa & guru diwajibkan melakukan scan presensi tepat waktu.',
            'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80',
            'Tim IT Artanita',
            'Semua',
            1
          ),
          (
            'Pengumuman Libur Nasional & Cuti Bersama',
            'Libur',
            'Kegiatan Belajar Mengajar (KBM) ditiadakan dalam rangka memperingati Hari Libur Nasional. KBM akan aktif kembali sesuai dengan kalender akademik.',
            'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
            'Tata Usaha',
            'Semua',
            1
          )
        `);
      }
    } catch (err) {
      console.error('[PengumumanModel.ensureTable] Error:', err.message);
    }
  }

  static async getAllActive() {
    await this.ensureTable();
    const pool = getTenantPool();
    const [rows] = await pool.query(
      `SELECT * FROM pengumuman WHERE is_active = 1 ORDER BY created_at DESC LIMIT 20`
    );
    return rows;
  }

  static async getAllAdmin() {
    await this.ensureTable();
    const pool = getTenantPool();
    const [rows] = await pool.query(
      `SELECT * FROM pengumuman ORDER BY created_at DESC`
    );
    return rows;
  }

  static async create(data) {
    await this.ensureTable();
    const pool = getTenantPool();
    const { judul, kategori, isi, gambar_url, penulis, target_role, is_active } = data;
    const [result] = await pool.query(
      `INSERT INTO pengumuman (judul, kategori, isi, gambar_url, penulis, target_role, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        judul,
        kategori || 'Umum',
        isi,
        gambar_url || null,
        penulis || 'Administrator',
        target_role || 'Semua',
        is_active !== undefined ? is_active : 1
      ]
    );
    return result.insertId;
  }

  static async update(id, data) {
    await this.ensureTable();
    const pool = getTenantPool();
    const { judul, kategori, isi, gambar_url, penulis, target_role, is_active } = data;
    await pool.query(
      `UPDATE pengumuman
       SET judul = ?, kategori = ?, isi = ?, gambar_url = ?, penulis = ?, target_role = ?, is_active = ?
       WHERE id = ?`,
      [judul, kategori, isi, gambar_url, penulis, target_role, is_active, id]
    );
    return true;
  }

  static async delete(id) {
    await this.ensureTable();
    const pool = getTenantPool();
    await pool.query('DELETE FROM pengumuman WHERE id = ?', [id]);
    return true;
  }
}

module.exports = PengumumanModel;
