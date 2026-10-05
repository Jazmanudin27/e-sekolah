const { query } = require('../config/database');

class PosPembayaranModel {
  static async findAll(kode_member = null) {
    let sql = 'SELECT * FROM pos_pembayaran';
    const params = [];
    if (kode_member) {
      sql += ' WHERE kode_member = ?';
      params.push(kode_member);
    }
    sql += ' ORDER BY created_at DESC';
    return await query(sql, params);
  }

  static async findActive(kode_member = null) {
    let sql = 'SELECT * FROM pos_pembayaran WHERE is_active = 1';
    const params = [];
    if (kode_member) {
      sql += ' AND kode_member = ?';
      params.push(kode_member);
    }
    sql += ' ORDER BY nama_pos ASC';
    return await query(sql, params);
  }

  static async findById(id) {
    const rows = await query('SELECT * FROM pos_pembayaran WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async findByKode(kode_pos) {
    const rows = await query('SELECT * FROM pos_pembayaran WHERE kode_pos = ?', [kode_pos]);
    return rows[0] || null;
  }

  static async create({ kode_pos, nama_pos, tipe = 'BULANAN', deskripsi = null }) {
    const res = await query(
      'INSERT INTO pos_pembayaran (kode_pos, nama_pos, tipe, deskripsi) VALUES (?, ?, ?, ?)',
      [kode_pos, nama_pos, tipe, deskripsi]
    );
    return res.insertId;
  }

  static async update(id, { kode_pos, nama_pos, tipe, deskripsi, is_active }) {
    const fields = [];
    const params = [];

    if (kode_pos !== undefined) { fields.push('kode_pos = ?'); params.push(kode_pos); }
    if (nama_pos !== undefined) { fields.push('nama_pos = ?'); params.push(nama_pos); }
    if (tipe !== undefined) { fields.push('tipe = ?'); params.push(tipe); }
    if (deskripsi !== undefined) { fields.push('deskripsi = ?'); params.push(deskripsi); }
    if (is_active !== undefined) { fields.push('is_active = ?'); params.push(is_active); }

    if (fields.length === 0) return false;

    params.push(id);
    await query(`UPDATE pos_pembayaran SET ${fields.join(', ')} WHERE id = ?`, params);
    return true;
  }

  static async delete(id) {
    await query('DELETE FROM pos_pembayaran WHERE id = ?', [id]);
    return true;
  }
}

module.exports = PosPembayaranModel;
