const { query } = require('../config/database');

class AbsensiMapelModel {
  static async findAll({ tanggal, kode_kelas, kode_mapel, kode_guru, kode_member }) {
    let sql = 'SELECT * FROM absensi_mapel WHERE 1=1';
    const params = [];

    if (kode_member) {
      sql += ' AND kode_member = ?';
      params.push(kode_member);
    }
    if (tanggal) {
      sql += ' AND (DATE(tanggal) = DATE(?) OR tanggal = ?)';
      params.push(tanggal, tanggal);
    }
    if (kode_kelas) {
      sql += ' AND kode_kelas = ?';
      params.push(kode_kelas);
    }
    if (kode_mapel) {
      sql += ' AND kode_mapel = ?';
      params.push(kode_mapel);
    }
    if (kode_guru) {
      sql += ' AND kode_guru = ?';
      params.push(kode_guru);
    }

    sql += ' ORDER BY id ASC';
    return await query(sql, params);
  }

  static async findExisting({ tanggal, kode_kelas, kode_mapel, kode_siswa }) {
    const rows = await query(
      `SELECT id FROM absensi_mapel 
       WHERE (DATE(tanggal) = DATE(?) OR tanggal = ?) AND kode_kelas = ? AND kode_mapel = ? 
         AND (CONVERT(kode_siswa USING utf8mb4) = CONVERT(? USING utf8mb4))
       LIMIT 1`,
      [tanggal, tanggal, kode_kelas, kode_mapel, kode_siswa]
    );
    return rows[0] || null;
  }

  static async updateStatus(id, status, kode_guru) {
    if (kode_guru) {
      await query('UPDATE absensi_mapel SET status = ?, kode_guru = ? WHERE id = ?', [status, kode_guru, id]);
    } else {
      await query('UPDATE absensi_mapel SET status = ? WHERE id = ?', [status, id]);
    }
  }

  static async create({ tanggal, kode_kelas, kode_guru, kode_mapel, kode_siswa, status }) {
    const res = await query(
      'INSERT INTO absensi_mapel (tanggal, kode_kelas, kode_guru, kode_mapel, kode_siswa, status) VALUES (?, ?, ?, ?, ?, ?)',
      [tanggal, kode_kelas, kode_guru || null, kode_mapel, kode_siswa, status]
    );
    return res.insertId;
  }
}

module.exports = AbsensiMapelModel;
