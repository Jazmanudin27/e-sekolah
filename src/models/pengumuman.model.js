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
    try {
      await query("ALTER TABLE pengumuman ADD COLUMN kode_member VARCHAR(50) DEFAULT NULL");
    } catch (e) {}
  }

  static async getAllActive(kode_member = null) {
    await this.ensureTable();
    let sql = 'SELECT * FROM pengumuman WHERE is_active = 1';
    const params = [];
    if (kode_member) {
      sql += ' AND kode_member = ?';
      params.push(kode_member);
    }
    sql += ' ORDER BY created_at DESC LIMIT 20';
    const rows = await query(sql, params);
    return rows || [];
  }

  static async getAllAdmin(kode_member = null) {
    await this.ensureTable();
    let sql = 'SELECT * FROM pengumuman';
    const params = [];
    if (kode_member) {
      sql += ' WHERE kode_member = ?';
      params.push(kode_member);
    }
    sql += ' ORDER BY created_at DESC';
    const rows = await query(sql, params);
    return rows || [];
  }

  static async create(data) {
    await this.ensureTable();
    const { judul, kategori, isi, gambar_url, penulis, target_role, is_active, kode_member } = data;
    const res = await query(
      `INSERT INTO pengumuman (judul, kategori, isi, gambar_url, penulis, target_role, is_active, kode_member)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        judul,
        kategori || 'Umum',
        isi,
        gambar_url || null,
        penulis || 'Administrator',
        target_role || 'Semua',
        is_active !== undefined ? is_active : 1,
        kode_member || null
      ]
    );
    return res ? res.insertId : null;
  }

  static async update(id, data) {
    await this.ensureTable();
    const { judul, kategori, isi, gambar_url, penulis, target_role, is_active, kode_member } = data;
    if (kode_member !== undefined) {
      await query(
        `UPDATE pengumuman
         SET judul = ?, kategori = ?, isi = ?, gambar_url = ?, penulis = ?, target_role = ?, is_active = ?, kode_member = ?
         WHERE id = ?`,
        [judul, kategori, isi, gambar_url, penulis, target_role, is_active, kode_member, id]
      );
    } else {
      await query(
        `UPDATE pengumuman
         SET judul = ?, kategori = ?, isi = ?, gambar_url = ?, penulis = ?, target_role = ?, is_active = ?
         WHERE id = ?`,
        [judul, kategori, isi, gambar_url, penulis, target_role, is_active, id]
      );
    }
    return true;
  }

  static async delete(id) {
    await this.ensureTable();
    await query('DELETE FROM pengumuman WHERE id = ?', [id]);
    return true;
  }
}

module.exports = PengumumanModel;
