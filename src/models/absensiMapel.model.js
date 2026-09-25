const { query } = require('../config/database');

class AbsensiMapelModel {
  static async findAll({ tanggal, kode_kelas, kode_mapel, kode_guru }) {
    let sql = 'SELECT * FROM absensi_mapel WHERE 1=1';
    const params = [];

    if (tanggal) {
      sql += ' AND tanggal = ?';
      params.push(tanggal);
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

    sql += ' ORDER BY id DESC';
    return await query(sql, params);
  }

  static async findExisting({ tanggal, kode_kelas, kode_guru, kode_mapel, kode_siswa }) {
    const rows = await query(
      'SELECT id FROM absensi_mapel WHERE tanggal = ? AND kode_kelas = ? AND kode_guru = ? AND kode_mapel = ? AND kode_siswa = ? LIMIT 1',
      [tanggal, kode_kelas, kode_guru, kode_mapel, kode_siswa]
    );
    return rows[0] || null;
  }

  static async updateStatus(id, status) {
    await query('UPDATE absensi_mapel SET status = ? WHERE id = ?', [status, id]);
  }

  static async create({ tanggal, kode_kelas, kode_guru, kode_mapel, kode_siswa, status }) {
    const res = await query(
      'INSERT INTO absensi_mapel (tanggal, kode_kelas, kode_guru, kode_mapel, kode_siswa, status) VALUES (?, ?, ?, ?, ?, ?)',
      [tanggal, kode_kelas, kode_guru, kode_mapel, kode_siswa, status]
    );
    return res.insertId;
  }
}

module.exports = AbsensiMapelModel;
