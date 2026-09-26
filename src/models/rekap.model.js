const { query } = require('../config/database');

class RekapModel {
  static async getRekapSiswa({ bulan, tahun, kode_kelas }) {
    try {
      let sql = `
        SELECT 
          s.kode_siswa,
          s.nama_siswa,
          s.nis_nisn,
          k.nama_kelas,
          k.jurusan,
          COUNT(a.id) AS total_absen,
          SUM(CASE WHEN a.status = 'H' THEN 1 ELSE 0 END) AS total_hadir,
          SUM(CASE WHEN a.status = 'S' THEN 1 ELSE 0 END) AS total_sakit,
          SUM(CASE WHEN a.status = 'I' THEN 1 ELSE 0 END) AS total_izin,
          SUM(CASE WHEN a.status = 'A' THEN 1 ELSE 0 END) AS total_alpha
        FROM siswa s
        LEFT JOIN kelas k ON s.kode_kelas = k.kode_kelas
        LEFT JOIN absensi_siswa a ON s.kode_siswa = a.kode_siswa 
      `;

      const params = [];
      const conditions = [];

      if (bulan) {
        conditions.push('MONTH(a.tanggal) = ?');
        params.push(parseInt(bulan, 10));
      }
      if (tahun) {
        conditions.push('YEAR(a.tanggal) = ?');
        params.push(parseInt(tahun, 10));
      }

      if (conditions.length > 0) {
        sql += ' AND ' + conditions.join(' AND ');
      }

      sql += ' WHERE 1=1';
      if (kode_kelas) {
        sql += ' AND s.kode_kelas = ?';
        params.push(kode_kelas);
      }

      sql += ' GROUP BY s.kode_siswa, s.nama_siswa, s.nis_nisn, k.nama_kelas, k.jurusan ORDER BY s.nama_siswa ASC';
      return await query(sql, params);
    } catch (e) {
      console.error('[RekapModel.getRekapSiswa] Error:', e.message);
      return [];
    }
  }

  static async getRekapMapel({ bulan, tahun, kode_kelas, kode_mapel }) {
    try {
      let sql = `
        SELECT 
          s.kode_siswa,
          s.nama_siswa,
          s.nis_nisn,
          k.nama_kelas,
          m.nama_mapel,
          COUNT(a.id) AS total_absen,
          SUM(CASE WHEN a.status = 'H' THEN 1 ELSE 0 END) AS total_hadir,
          SUM(CASE WHEN a.status = 'S' THEN 1 ELSE 0 END) AS total_sakit,
          SUM(CASE WHEN a.status = 'I' THEN 1 ELSE 0 END) AS total_izin,
          SUM(CASE WHEN a.status = 'A' THEN 1 ELSE 0 END) AS total_alpha
        FROM siswa s
        LEFT JOIN kelas k ON s.kode_kelas = k.kode_kelas
        LEFT JOIN absensi_mapel a ON s.kode_siswa = a.kode_siswa 
      `;

      const params = [];
      const conditions = [];

      if (bulan) {
        conditions.push('MONTH(a.tanggal) = ?');
        params.push(parseInt(bulan, 10));
      }
      if (tahun) {
        conditions.push('YEAR(a.tanggal) = ?');
        params.push(parseInt(tahun, 10));
      }
      if (kode_mapel) {
        conditions.push('a.kode_mapel = ?');
        params.push(kode_mapel);
      }

      if (conditions.length > 0) {
        sql += ' AND ' + conditions.join(' AND ');
      }

      sql += ' LEFT JOIN mapel m ON a.kode_mapel = m.kode_mapel WHERE 1=1';
      if (kode_kelas) {
        sql += ' AND s.kode_kelas = ?';
        params.push(kode_kelas);
      }

      sql += ' GROUP BY s.kode_siswa, s.nama_siswa, s.nis_nisn, k.nama_kelas, m.nama_mapel ORDER BY s.nama_siswa ASC';
      return await query(sql, params);
    } catch (e) {
      console.error('[RekapModel.getRekapMapel] Error:', e.message);
      return [];
    }
  }

  static async getRekapGuru({ bulan, tahun }) {
    try {
      let sql = `
        SELECT 
          p.id,
          p.kode_guru,
          COALESCE(g.nama_guru, 'Guru / Pengajar') AS nama_guru,
          COALESCE(g.nip_nuptk, '-') AS nip_nuptk,
          COALESCE(g.status_kepegawaian, 'PNS/GTT') AS status_kepegawaian,
          DATE_FORMAT(p.tanggal, '%Y-%m-%d') AS tanggal,
          DATE_FORMAT(p.tanggal, '%d %b %Y') AS tanggal_format,
          p.jam_in,
          p.jam_out,
          p.lokasi_in,
          p.lokasi_out
        FROM presensi p
        LEFT JOIN guru g ON p.kode_guru = g.kode_guru
        WHERE 1=1
      `;
      const params = [];
      if (bulan) {
        sql += ' AND MONTH(p.tanggal) = ?';
        params.push(parseInt(bulan, 10));
      }
      if (tahun) {
        sql += ' AND YEAR(p.tanggal) = ?';
        params.push(parseInt(tahun, 10));
      }

      sql += ' ORDER BY p.tanggal DESC, p.id DESC';
      return await query(sql, params);
    } catch (e) {
      console.error('[RekapModel.getRekapGuru] Error:', e.message);
      return [];
    }
  }
}

module.exports = RekapModel;
