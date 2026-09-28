const { query } = require('../config/database');

class JadwalModel {
  static async findSchedules({ hari, kode_kelas, kode_guru }) {
    let sql = `
      SELECT j.kode_jadwal, j.hari, j.kode_jam, jj.jam_ke, jj.jam,
             j.kode_kelas, k.nama_kelas, k.jurusan,
             mg.kode_guru, g.nama_guru,
             mg.kode_mapel, m.nama_mapel, m.singkatan, j.kode_guru_mapel
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

  static async saveSchedule({ hari, kode_jam, kode_kelas, kode_guru, kode_mapel }) {
    try {
      if (!hari || !kode_jam || !kode_kelas) return null;

      if (!kode_guru || kode_guru === '-' || !kode_mapel || kode_mapel === '-') {
        // Clear schedule entry
        await query('DELETE FROM jadwal WHERE hari = ? AND kode_jam = ? AND kode_kelas = ?', [hari, kode_jam, kode_kelas]);
        return { message: 'Jadwal dikosongkan' };
      }

      // 1. Resolve kode_guru_mapel
      let mgRows = await query('SELECT kode_guru_mapel FROM mapel_guru WHERE kode_guru = ? AND kode_mapel = ? LIMIT 1', [kode_guru, kode_mapel]);
      let kode_guru_mapel = null;

      if (mgRows && mgRows.length > 0) {
        kode_guru_mapel = mgRows[0].kode_guru_mapel;
      } else {
        const ins = await query('INSERT INTO mapel_guru (kode_guru, kode_mapel) VALUES (?, ?)', [kode_guru, kode_mapel]);
        kode_guru_mapel = ins.insertId;
      }

      // 2. Check if schedule exists
      const existing = await query('SELECT kode_jadwal FROM jadwal WHERE hari = ? AND kode_jam = ? AND kode_kelas = ? LIMIT 1', [hari, kode_jam, kode_kelas]);

      if (existing && existing.length > 0) {
        await query('UPDATE jadwal SET kode_guru_mapel = ? WHERE kode_jadwal = ?', [kode_guru_mapel, existing[0].kode_jadwal]);
      } else {
        await query('INSERT INTO jadwal (hari, kode_jam, kode_kelas, kode_guru_mapel) VALUES (?, ?, ?, ?)', [hari, kode_jam, kode_kelas, kode_guru_mapel]);
      }

      return { success: true };
    } catch (err) {
      console.error('[JadwalModel.saveSchedule] Error:', err.message);
      throw err;
    }
  }

  static async saveBatchSchedules(schedules) {
    if (!Array.isArray(schedules)) return;
    for (const item of schedules) {
      await this.saveSchedule(item);
    }
    return { success: true };
  }
}

module.exports = JadwalModel;
