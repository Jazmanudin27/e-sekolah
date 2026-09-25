const { query } = require('../config/database');

class AbsensiSiswaModel {
  static async findAll({ tanggal, kode_kelas }) {
    let sql = 'SELECT * FROM absensi_siswa WHERE 1=1';
    const params = [];

    if (tanggal) {
      sql += ' AND tanggal = ?';
      params.push(tanggal);
    }
    if (kode_kelas) {
      sql += ' AND kode_kelas = ?';
      params.push(kode_kelas);
    }

    sql += ' ORDER BY id DESC';
    return await query(sql, params);
  }

  static async findExisting(tanggal, kode_kelas, kode_siswa) {
    const rows = await query(
      'SELECT id FROM absensi_siswa WHERE tanggal = ? AND kode_kelas = ? AND kode_siswa = ? LIMIT 1',
      [tanggal, kode_kelas, kode_siswa]
    );
    return rows[0] || null;
  }

  static async updateStatus(id, status) {
    await query('UPDATE absensi_siswa SET status = ? WHERE id = ?', [status, id]);
  }

  static async create({ tanggal, kode_kelas, kode_siswa, status }) {
    const res = await query(
      'INSERT INTO absensi_siswa (tanggal, kode_kelas, kode_siswa, status) VALUES (?, ?, ?, ?)',
      [tanggal, kode_kelas, kode_siswa, status]
    );
    return res.insertId;
  }
}

module.exports = AbsensiSiswaModel;
