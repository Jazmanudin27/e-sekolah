const { query } = require('../config/database');

class PengumumanModel {
  static async ensureTable() {
    const createTableSql = `
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
      await query(createTableSql);
    } catch (err) {
      console.error('[PengumumanModel.ensureTable] Error:', err.message);
    }
  }

  static async getAllActive() {
    await this.ensureTable();
    const rows = await query(
      `SELECT * FROM pengumuman WHERE is_active = 1 ORDER BY created_at DESC LIMIT 20`
    );
    return rows || [];
  }

  static async getAllAdmin() {
    await this.ensureTable();
    const rows = await query(
      `SELECT * FROM pengumuman ORDER BY created_at DESC`
    );
    return rows || [];
  }

  static async create(data) {
    await this.ensureTable();
    const { judul, kategori, isi, gambar_url, penulis, target_role, is_active } = data;
    const res = await query(
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
    return res ? res.insertId : null;
  }

  static async update(id, data) {
    await this.ensureTable();
    const { judul, kategori, isi, gambar_url, penulis, target_role, is_active } = data;
    await query(
      `UPDATE pengumuman
       SET judul = ?, kategori = ?, isi = ?, gambar_url = ?, penulis = ?, target_role = ?, is_active = ?
       WHERE id = ?`,
      [judul, kategori, isi, gambar_url, penulis, target_role, is_active, id]
    );
    return true;
  }

  static async delete(id) {
    await this.ensureTable();
    await query('DELETE FROM pengumuman WHERE id = ?', [id]);
    return true;
  }
}

module.exports = PengumumanModel;
