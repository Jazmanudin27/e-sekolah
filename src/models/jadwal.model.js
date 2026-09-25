const { query } = require('../config/database');

class JadwalModel {
  static async findSchedules({ hari, kode_kelas, kode_guru }) {
    let sql = `
      SELECT j.kode_jadwal, j.hari, j.kode_jam, jj.jam_ke, jj.jam,
             j.kode_kelas, k.nama_kelas, k.jurusan,
             mg.kode_guru, g.nama_guru,
             mg.kode_mapel, m.nama_mapel
      FROM jadwal j
      LEFT JOIN jadwal_jam jj ON j.kode_jam = jj.kode_jam
      LEFT JOIN kelas k ON j.kode_kelas = k.kode_kelas
      LEFT JOIN mapel_guru mg ON j.kode_guru_mapel = mg.kode_guru_mapel
      LEFT JOIN guru g ON mg.kode_guru = g.kode_guru
      LEFT JOIN mapel m ON mg.kode_mapel = m.kode_mapel
      WHERE 1=1
    `;
    const params = [];

    if (hari) {
      sql += ' AND j.hari = ?';
      params.push(hari);
    }
    if (kode_kelas) {
      sql += ' AND j.kode_kelas = ?';
      params.push(kode_kelas);
    }
    if (kode_guru) {
      sql += ' AND mg.kode_guru = ?';
      params.push(kode_guru);
    }

    sql += ' ORDER BY FIELD(j.hari, "Senin","Selasa","Rabu","Kamis","Jumat","Sabtu","Minggu"), jj.jam_ke ASC';

    return await query(sql, params);
  }
}

module.exports = JadwalModel;
