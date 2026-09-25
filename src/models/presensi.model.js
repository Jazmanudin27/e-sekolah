const { query } = require('../config/database');

class PresensiModel {
  static async findByGuruAndDate(kode_guru, tanggal) {
    const rows = await query(
      'SELECT * FROM presensi WHERE kode_guru = ? AND tanggal = ? LIMIT 1',
      [kode_guru, tanggal]
    );
    return rows[0] || null;
  }

  static async createCheckIn({ kode_guru, tanggal, jam_in, lokasi_in, foto_in }) {
    const now = new Date();
    const result = await query(
      `INSERT INTO presensi (kode_guru, tanggal, jam_in, lokasi_in, foto_in, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [kode_guru, tanggal, jam_in, lokasi_in || null, foto_in || null, now, now]
    );
    return result.insertId;
  }

  static async updateCheckOut(id, { jam_out, lokasi_out, foto_out }) {
    const now = new Date();
    await query(
      `UPDATE presensi SET jam_out = ?, lokasi_out = ?, foto_out = ?, updated_at = ?
       WHERE id = ?`,
      [jam_out, lokasi_out || null, foto_out || null, now, id]
    );
  }

  static async getHistory({ kode_guru, bulan, tahun, limit = 30 }) {
    let sql = 'SELECT * FROM presensi WHERE 1=1';
    const params = [];

    if (kode_guru) {
      sql += ' AND kode_guru = ?';
      params.push(kode_guru);
    }
    if (bulan) {
      sql += ' AND MONTH(tanggal) = ?';
      params.push(parseInt(bulan, 10));
    }
    if (tahun) {
      sql += ' AND YEAR(tanggal) = ?';
      params.push(parseInt(tahun, 10));
    }

    sql += ' ORDER BY tanggal DESC LIMIT ?';
    params.push(parseInt(limit, 10));

    return await query(sql, params);
  }

  static async countToday(tanggal) {
    const rows = await query('SELECT COUNT(*) AS total FROM presensi WHERE tanggal = ?', [tanggal]);
    return rows[0].total || 0;
  }
}

module.exports = PresensiModel;
