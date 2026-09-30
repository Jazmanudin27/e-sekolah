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

  static async getHistory({ kode_guru, bulan, tahun, limit = 50 }) {
    let sql = `
      SELECT 
        p.id,
        p.kode_guru,
        COALESCE(g.nama_guru, p.kode_guru) AS nama_guru,
        COALESCE(g.nip_nuptk, '-') AS nip_nuptk,
        DATE_FORMAT(p.tanggal, '%Y-%m-%d') AS tanggal,
        DATE_FORMAT(p.tanggal, '%W, %d %b %Y') AS tanggal_format,
        p.jam_in,
        p.jam_out,
        p.lokasi_in,
        p.lokasi_out,
        p.created_at
      FROM presensi p
      LEFT JOIN guru g ON (
        CONVERT(p.kode_guru USING utf8mb4) = CONVERT(g.kode_guru USING utf8mb4)
        OR CONVERT(p.kode_guru USING utf8mb4) = CONVERT(g.nip_nuptk USING utf8mb4)
        OR CONVERT(p.kode_guru USING utf8mb4) = CONVERT(g.nama_guru USING utf8mb4)
      )
      WHERE 1=1
    `;
    const params = [];

    if (kode_guru) {
      sql += ` AND (
        CONVERT(p.kode_guru USING utf8mb4) = CONVERT(? USING utf8mb4)
        OR CONVERT(g.kode_guru USING utf8mb4) = CONVERT(? USING utf8mb4)
        OR CONVERT(g.nip_nuptk USING utf8mb4) = CONVERT(? USING utf8mb4)
        OR CONVERT(g.nama_guru USING utf8mb4) = CONVERT(? USING utf8mb4)
      )`;
      params.push(kode_guru, kode_guru, kode_guru, kode_guru);
    }
    if (bulan) {
      const bInt = parseInt(bulan, 10);
      const bPad = String(bInt).padStart(2, '0');
      sql += ' AND (MONTH(p.tanggal) = ? OR p.tanggal LIKE ?)';
      params.push(bInt, `%-${bPad}-%`);
    }
    if (tahun) {
      const tInt = parseInt(tahun, 10);
      sql += ' AND (YEAR(p.tanggal) = ? OR p.tanggal LIKE ?)';
      params.push(tInt, `${tInt}-%`);
    }

    sql += ' ORDER BY p.tanggal DESC, p.id DESC LIMIT ?';
    params.push(parseInt(limit, 10));

    return await query(sql, params);
  }

  static async countToday(tanggal) {
    const rows = await query('SELECT COUNT(*) AS total FROM presensi WHERE tanggal = ?', [tanggal]);
    return rows[0].total || 0;
  }
}

module.exports = PresensiModel;
