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
      const joinConditions = [];

      if (bulan) {
        const bInt = parseInt(bulan, 10);
        const bPad = String(bInt).padStart(2, '0');
        joinConditions.push('(MONTH(a.tanggal) = ? OR DATE_FORMAT(a.tanggal, "%c") = ? OR DATE_FORMAT(a.tanggal, "%m") = ?)');
        params.push(bInt, String(bInt), bPad);
      }
      if (tahun) {
        const tInt = parseInt(tahun, 10);
        joinConditions.push('(YEAR(a.tanggal) = ? OR DATE_FORMAT(a.tanggal, "%Y") = ?)');
        params.push(tInt, String(tInt));
      }

      if (joinConditions.length > 0) {
        sql += ' AND ' + joinConditions.join(' AND ');
      }

      sql += ' WHERE 1=1';
      if (kode_kelas) {
        sql += ' AND (s.kode_kelas = ? OR a.kode_kelas = ?)';
        params.push(kode_kelas, kode_kelas);
      }

      sql += ' GROUP BY s.kode_siswa, s.nama_siswa, s.nis_nisn, k.nama_kelas, k.jurusan ORDER BY s.nama_siswa ASC';
      const rows = await query(sql, params);

      if (rows && rows.length > 0) {
        return rows;
      }

      // Fallback directly from absensi_siswa table if JOIN produces 0 rows
      let fallbackSql = `
        SELECT 
          a.kode_siswa,
          COALESCE(s.nama_siswa, CONCAT('Siswa #', a.kode_siswa)) AS nama_siswa,
          COALESCE(s.nis_nisn, CONCAT('NIS-', a.kode_siswa)) AS nis_nisn,
          COALESCE(k.nama_kelas, CONCAT('Kelas ', a.kode_kelas)) AS nama_kelas,
          COUNT(a.id) AS total_absen,
          SUM(CASE WHEN a.status = 'H' THEN 1 ELSE 0 END) AS total_hadir,
          SUM(CASE WHEN a.status = 'S' THEN 1 ELSE 0 END) AS total_sakit,
          SUM(CASE WHEN a.status = 'I' THEN 1 ELSE 0 END) AS total_izin,
          SUM(CASE WHEN a.status = 'A' THEN 1 ELSE 0 END) AS total_alpha
        FROM absensi_siswa a
        LEFT JOIN siswa s ON a.kode_siswa = s.kode_siswa
        LEFT JOIN kelas k ON a.kode_kelas = k.kode_kelas
        WHERE 1=1
      `;
      const fbParams = [];
      if (bulan) {
        const bInt = parseInt(bulan, 10);
        const bPad = String(bInt).padStart(2, '0');
        fallbackSql += ' AND (MONTH(a.tanggal) = ? OR DATE_FORMAT(a.tanggal, "%c") = ? OR DATE_FORMAT(a.tanggal, "%m") = ?)';
        fbParams.push(bInt, String(bInt), bPad);
      }
      if (tahun) {
        const tInt = parseInt(tahun, 10);
        fallbackSql += ' AND (YEAR(a.tanggal) = ? OR DATE_FORMAT(a.tanggal, "%Y") = ?)';
        fbParams.push(tInt, String(tInt));
      }
      if (kode_kelas) {
        fallbackSql += ' AND a.kode_kelas = ?';
        fbParams.push(kode_kelas);
      }

      fallbackSql += ' GROUP BY a.kode_siswa, a.kode_kelas ORDER BY a.kode_siswa ASC';
      return await query(fallbackSql, fbParams);

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
      const joinConditions = [];

      if (bulan) {
        const bInt = parseInt(bulan, 10);
        const bPad = String(bInt).padStart(2, '0');
        joinConditions.push('(MONTH(a.tanggal) = ? OR DATE_FORMAT(a.tanggal, "%c") = ? OR DATE_FORMAT(a.tanggal, "%m") = ?)');
        params.push(bInt, String(bInt), bPad);
      }
      if (tahun) {
        const tInt = parseInt(tahun, 10);
        joinConditions.push('(YEAR(a.tanggal) = ? OR DATE_FORMAT(a.tanggal, "%Y") = ?)');
        params.push(tInt, String(tInt));
      }
      if (kode_mapel) {
        joinConditions.push('a.kode_mapel = ?');
        params.push(kode_mapel);
      }

      if (joinConditions.length > 0) {
        sql += ' AND ' + joinConditions.join(' AND ');
      }

      sql += ' LEFT JOIN mapel m ON a.kode_mapel = m.kode_mapel WHERE 1=1';
      if (kode_kelas) {
        sql += ' AND (s.kode_kelas = ? OR a.kode_kelas = ?)';
        params.push(kode_kelas, kode_kelas);
      }

      sql += ' GROUP BY s.kode_siswa, s.nama_siswa, s.nis_nisn, k.nama_kelas, m.nama_mapel ORDER BY s.nama_siswa ASC';
      const rows = await query(sql, params);

      if (rows && rows.length > 0) {
        return rows;
      }

      // Fallback directly from absensi_mapel
      let fallbackSql = `
        SELECT 
          a.kode_siswa,
          COALESCE(s.nama_siswa, CONCAT('Siswa #', a.kode_siswa)) AS nama_siswa,
          COALESCE(s.nis_nisn, CONCAT('NIS-', a.kode_siswa)) AS nis_nisn,
          COALESCE(k.nama_kelas, CONCAT('Kelas ', a.kode_kelas)) AS nama_kelas,
          COALESCE(m.nama_mapel, CONCAT('Mapel ', a.kode_mapel)) AS nama_mapel,
          COUNT(a.id) AS total_absen,
          SUM(CASE WHEN a.status = 'H' THEN 1 ELSE 0 END) AS total_hadir,
          SUM(CASE WHEN a.status = 'S' THEN 1 ELSE 0 END) AS total_sakit,
          SUM(CASE WHEN a.status = 'I' THEN 1 ELSE 0 END) AS total_izin,
          SUM(CASE WHEN a.status = 'A' THEN 1 ELSE 0 END) AS total_alpha
        FROM absensi_mapel a
        LEFT JOIN siswa s ON a.kode_siswa = s.kode_siswa
        LEFT JOIN kelas k ON a.kode_kelas = k.kode_kelas
        LEFT JOIN mapel m ON a.kode_mapel = m.kode_mapel
        WHERE 1=1
      `;
      const fbParams = [];
      if (bulan) {
        const bInt = parseInt(bulan, 10);
        const bPad = String(bInt).padStart(2, '0');
        fallbackSql += ' AND (MONTH(a.tanggal) = ? OR DATE_FORMAT(a.tanggal, "%c") = ? OR DATE_FORMAT(a.tanggal, "%m") = ?)';
        fbParams.push(bInt, String(bInt), bPad);
      }
      if (tahun) {
        const tInt = parseInt(tahun, 10);
        fallbackSql += ' AND (YEAR(a.tanggal) = ? OR DATE_FORMAT(a.tanggal, "%Y") = ?)';
        fbParams.push(tInt, String(tInt));
      }
      if (kode_kelas) {
        fallbackSql += ' AND a.kode_kelas = ?';
        fbParams.push(kode_kelas);
      }
      if (kode_mapel) {
        fallbackSql += ' AND a.kode_mapel = ?';
        fbParams.push(kode_mapel);
      }

      fallbackSql += ' GROUP BY a.kode_siswa, a.kode_kelas, a.kode_mapel ORDER BY a.kode_siswa ASC';
      return await query(fallbackSql, fbParams);

    } catch (e) {
      console.error('[RekapModel.getRekapMapel] Error:', e.message);
      return [];
    }
  }

  static async getRekapGuru({ bulan, tahun }) {
    try {
      const bInt = bulan ? parseInt(bulan, 10) : null;
      const bPad = bInt ? String(bInt).padStart(2, '0') : null;
      const tInt = tahun ? parseInt(tahun, 10) : null;

      let presensiWhere = 'WHERE 1=1';
      let pParams = [];
      if (bInt) {
        presensiWhere += ' AND (MONTH(p.tanggal) = ? OR DATE_FORMAT(p.tanggal, "%c") = ? OR DATE_FORMAT(p.tanggal, "%m") = ?)';
        pParams.push(bInt, String(bInt), bPad);
      }
      if (tInt) {
        presensiWhere += ' AND (YEAR(p.tanggal) = ? OR DATE_FORMAT(p.tanggal, "%Y") = ?)';
        pParams.push(tInt, String(tInt));
      }

      let izinSakitWhere = 'WHERE i.jenis = "Sakit"';
      let sParams = [];
      if (bInt) {
        izinSakitWhere += ' AND (MONTH(i.tanggal_mulai) = ? OR DATE_FORMAT(i.tanggal_mulai, "%c") = ? OR DATE_FORMAT(i.tanggal_mulai, "%m") = ?)';
        sParams.push(bInt, String(bInt), bPad);
      }
      if (tInt) {
        izinSakitWhere += ' AND (YEAR(i.tanggal_mulai) = ? OR DATE_FORMAT(i.tanggal_mulai, "%Y") = ?)';
        sParams.push(tInt, String(tInt));
      }

      let izinLainWhere = 'WHERE (i.jenis IS NULL OR i.jenis != "Sakit")';
      let iParams = [];
      if (bInt) {
        izinLainWhere += ' AND (MONTH(i.tanggal_mulai) = ? OR DATE_FORMAT(i.tanggal_mulai, "%c") = ? OR DATE_FORMAT(i.tanggal_mulai, "%m") = ?)';
        iParams.push(bInt, String(bInt), bPad);
      }
      if (tInt) {
        izinLainWhere += ' AND (YEAR(i.tanggal_mulai) = ? OR DATE_FORMAT(i.tanggal_mulai, "%Y") = ?)';
        iParams.push(tInt, String(tInt));
      }

      const sql = `
        SELECT 
          g.kode_guru,
          g.nama_guru,
          g.nip_nuptk,
          g.status_kepegawaian,
          (
            SELECT COUNT(DISTINCT p.id) FROM presensi p 
            ${presensiWhere} AND (p.kode_guru = g.kode_guru OR p.kode_guru = g.nip_nuptk)
          ) AS total_hadir,
          (
            SELECT COUNT(DISTINCT i.id) FROM pengajuan_izin i 
            ${izinSakitWhere} AND (i.user_id = g.kode_guru OR i.nama_pengaju = g.nama_guru OR i.user_id = g.nip_nuptk)
          ) AS total_sakit,
          (
            SELECT COUNT(DISTINCT i.id) FROM pengajuan_izin i 
            ${izinLainWhere} AND (i.user_id = g.kode_guru OR i.nama_pengaju = g.nama_guru OR i.user_id = g.nip_nuptk)
          ) AS total_izin
        FROM guru g
        ORDER BY g.nama_guru ASC
      `;

      const allParams = [...pParams, ...sParams, ...iParams];
      const rows = await query(sql, allParams);

      if (rows && rows.length > 0) {
        return rows;
      }

      // Fallback directly from presensi table if guru table is empty
      let fallbackSql = `
        SELECT 
          p.kode_guru,
          COALESCE(g.nama_guru, CONCAT('Guru #', p.kode_guru)) AS nama_guru,
          COALESCE(g.nip_nuptk, '-') AS nip_nuptk,
          COALESCE(g.status_kepegawaian, 'PNS/GTT') AS status_kepegawaian,
          COUNT(DISTINCT p.id) AS total_hadir,
          0 AS total_sakit,
          0 AS total_izin
        FROM presensi p
        LEFT JOIN guru g ON (p.kode_guru = g.kode_guru OR p.kode_guru = g.nip_nuptk)
        WHERE 1=1
      `;
      const fbParams = [];
      if (bInt) {
        fallbackSql += ' AND (MONTH(p.tanggal) = ? OR DATE_FORMAT(p.tanggal, "%c") = ? OR DATE_FORMAT(p.tanggal, "%m") = ?)';
        fbParams.push(bInt, String(bInt), bPad);
      }
      if (tInt) {
        fallbackSql += ' AND (YEAR(p.tanggal) = ? OR DATE_FORMAT(p.tanggal, "%Y") = ?)';
        fbParams.push(tInt, String(tInt));
      }

      fallbackSql += ' GROUP BY p.kode_guru ORDER BY p.kode_guru ASC';
      return await query(fallbackSql, fbParams);

    } catch (e) {
      console.error('[RekapModel.getRekapGuru] Error:', e.message);
      return [];
    }
  }

  static async getDetailSiswa({ kode_siswa, bulan, tahun }) {
    try {
      let sql = `
        SELECT 
          id,
          kode_siswa,
          kode_kelas,
          DATE_FORMAT(tanggal, '%Y-%m-%d') AS tanggal,
          DATE_FORMAT(tanggal, '%W, %d %b %Y') AS tanggal_format,
          status
        FROM absensi_siswa
        WHERE kode_siswa = ?
      `;
      const params = [kode_siswa];

      if (bulan) {
        const bInt = parseInt(bulan, 10);
        const bPad = String(bInt).padStart(2, '0');
        sql += ' AND (MONTH(tanggal) = ? OR DATE_FORMAT(tanggal, "%c") = ? OR DATE_FORMAT(tanggal, "%m") = ?)';
        params.push(bInt, String(bInt), bPad);
      }
      if (tahun) {
        const tInt = parseInt(tahun, 10);
        sql += ' AND (YEAR(tanggal) = ? OR DATE_FORMAT(tanggal, "%Y") = ?)';
        params.push(tInt, String(tInt));
      }

      sql += ' ORDER BY tanggal DESC';
      return await query(sql, params);
    } catch (e) {
      console.error('[RekapModel.getDetailSiswa] Error:', e.message);
      return [];
    }
  }

  static async getDetailMapel({ kode_siswa, kode_mapel, bulan, tahun }) {
    try {
      let sql = `
        SELECT 
          a.id,
          a.kode_siswa,
          a.kode_kelas,
          a.kode_mapel,
          COALESCE(m.nama_mapel, 'Mata Pelajaran') AS nama_mapel,
          DATE_FORMAT(a.tanggal, '%Y-%m-%d') AS tanggal,
          DATE_FORMAT(a.tanggal, '%W, %d %b %Y') AS tanggal_format,
          a.status
        FROM absensi_mapel a
        LEFT JOIN mapel m ON a.kode_mapel = m.kode_mapel
        WHERE a.kode_siswa = ?
      `;
      const params = [kode_siswa];

      if (kode_mapel) {
        sql += ' AND a.kode_mapel = ?';
        params.push(kode_mapel);
      }
      if (bulan) {
        const bInt = parseInt(bulan, 10);
        const bPad = String(bInt).padStart(2, '0');
        sql += ' AND (MONTH(a.tanggal) = ? OR DATE_FORMAT(a.tanggal, "%c") = ? OR DATE_FORMAT(a.tanggal, "%m") = ?)';
        params.push(bInt, String(bInt), bPad);
      }
      if (tahun) {
        const tInt = parseInt(tahun, 10);
        sql += ' AND (YEAR(a.tanggal) = ? OR DATE_FORMAT(a.tanggal, "%Y") = ?)';
        params.push(tInt, String(tInt));
      }

      sql += ' ORDER BY a.tanggal DESC';
      return await query(sql, params);
    } catch (e) {
      console.error('[RekapModel.getDetailMapel] Error:', e.message);
      return [];
    }
  }

  static async getDetailGuru({ kode_guru, bulan, tahun }) {
    try {
      let sql = `
        SELECT 
          p.id,
          p.kode_guru,
          COALESCE(g.nama_guru, 'Guru / Pengajar') AS nama_guru,
          COALESCE(g.nip_nuptk, '-') AS nip_nuptk,
          DATE_FORMAT(p.tanggal, '%Y-%m-%d') AS tanggal,
          DATE_FORMAT(p.tanggal, '%W, %d %b %Y') AS tanggal_format,
          p.jam_in,
          p.jam_out,
          p.lokasi_in,
          p.lokasi_out
        FROM presensi p
        LEFT JOIN guru g ON p.kode_guru = g.kode_guru
        WHERE p.kode_guru = ?
      `;
      const params = [kode_guru];

      if (bulan) {
        const bInt = parseInt(bulan, 10);
        const bPad = String(bInt).padStart(2, '0');
        sql += ' AND (MONTH(p.tanggal) = ? OR DATE_FORMAT(p.tanggal, "%c") = ? OR DATE_FORMAT(p.tanggal, "%m") = ?)';
        params.push(bInt, String(bInt), bPad);
      }
      if (tahun) {
        const tInt = parseInt(tahun, 10);
        sql += ' AND (YEAR(p.tanggal) = ? OR DATE_FORMAT(p.tanggal, "%Y") = ?)';
        params.push(tInt, String(tInt));
      }

      sql += ' ORDER BY p.tanggal DESC';
      return await query(sql, params);
    } catch (e) {
      console.error('[RekapModel.getDetailGuru] Error:', e.message);
      return [];
    }
  }
}

module.exports = RekapModel;
