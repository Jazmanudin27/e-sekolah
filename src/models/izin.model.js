const { query } = require('../config/database');

class IzinModel {
  static async initTable() {
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS pengajuan_izin (
          id INT AUTO_INCREMENT PRIMARY KEY,
          user_id INT NULL,
          nama_pengaju VARCHAR(255) NULL,
          jenis VARCHAR(50) NOT NULL,
          tanggal_mulai DATE NOT NULL,
          tanggal_selesai DATE NULL,
          durasi VARCHAR(50) NULL,
          keterangan TEXT NULL,
          status VARCHAR(50) DEFAULT 'Menunggu',
          disetujui_oleh VARCHAR(255) NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);
    } catch (err) {
      console.log('[IzinModel] Table init or check:', err.message);
    }
  }

  static async findAll() {
    await this.initTable();
    try {
      const rows = await query(`
        SELECT 
          id, 
          user_id, 
          nama_pengaju, 
          jenis, 
          DATE_FORMAT(tanggal_mulai, '%Y-%m-%d') AS tanggal_mulai,
          DATE_FORMAT(tanggal_selesai, '%Y-%m-%d') AS tanggal_selesai,
          durasi, 
          keterangan, 
          status, 
          disetujui_oleh, 
          DATE_FORMAT(created_at, '%d %b %Y') AS tanggal
        FROM pengajuan_izin 
        ORDER BY id DESC
      `);
      return rows;
    } catch (err) {
      console.error('[IzinModel.findAll] Error:', err.message);
      return [];
    }
  }

  static async findById(id) {
    await this.initTable();
    const rows = await query('SELECT * FROM pengajuan_izin WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async create({ user_id, nama_pengaju, jenis, tanggal_mulai, tanggal_selesai, durasi, keterangan }) {
    await this.initTable();
    const res = await query(
      `INSERT INTO pengajuan_izin 
       (user_id, nama_pengaju, jenis, tanggal_mulai, tanggal_selesai, durasi, keterangan, status, disetujui_oleh) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Menunggu', 'Proses Verifikasi Guru/Admin')`,
      [
        user_id || null,
        nama_pengaju || 'Pengguna E-Sekolah',
        jenis || 'Sakit',
        tanggal_mulai,
        tanggal_selesai || null,
        durasi || '1 Hari',
        keterangan || ''
      ]
    );
    return res.insertId;
  }

  static async delete(id) {
    await this.initTable();
    await query('DELETE FROM pengajuan_izin WHERE id = ?', [id]);
  }
}

module.exports = IzinModel;
