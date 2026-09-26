const { query } = require('../config/database');

class RekapModel {
  /**
   * Helper to build SQL date conditions and parameter arrays for subqueries
   */
  static buildDateCondition(dateColumn, bulan, tahun) {
    let sqlStr = '';
    const params = [];

    if (bulan) {
      const bInt = parseInt(bulan, 10);
      const bPad = String(bInt).padStart(2, '0');
      sqlStr += ` AND (MONTH(${dateColumn}) = ? OR DATE_FORMAT(${dateColumn}, "%c") = ? OR DATE_FORMAT(${dateColumn}, "%m") = ?)`;
      params.push(bInt, String(bInt), bPad);
    }
    if (tahun) {
      const tInt = parseInt(tahun, 10);
      sqlStr += ` AND (YEAR(${dateColumn}) = ? OR DATE_FORMAT(${dateColumn}, "%Y") = ?)`;
      params.push(tInt, String(tInt));
    }

    return { sqlStr, params };
  }

  /**
   * Rekapitulasi Presensi Siswa
   * Returns ALL students from master table 'siswa' (filtered by class if provided)
   */
  static async getRekapSiswa({ bulan, tahun, kode_kelas }) {
    try {
      const dateCond = this.buildDateCondition('a.tanggal', bulan, tahun);

      const params = [];

      // Add params for 5 subqueries (total_absen, total_hadir, total_sakit, total_izin, total_alpha)
      for (let i = 0; i < 5; i++) {
        params.push(...dateCond.params);
      }

      let mainWhere = 'WHERE 1=1';
      if (kode_kelas) {
        mainWhere += ' AND s.kode_kelas = ?';
        params.push(kode_kelas);
      }

      const sql = `
        SELECT 
          s.kode_siswa,
          s.nama_siswa,
          s.nis_nisn,
          s.kode_kelas,
          COALESCE(k.nama_kelas, CONCAT('Kelas ', s.kode_kelas)) AS nama_kelas,
          k.jurusan,
          (
            SELECT COUNT(a.id) FROM absensi_siswa a 
            WHERE (a.kode_siswa = s.kode_siswa OR a.kode_siswa = s.nis_nisn) ${dateCond.sqlStr}
          ) AS total_absen,
          (
            SELECT COUNT(a.id) FROM absensi_siswa a 
            WHERE (a.kode_siswa = s.kode_siswa OR a.kode_siswa = s.nis_nisn) AND a.status = 'H' ${dateCond.sqlStr}
          ) AS total_hadir,
          (
            SELECT COUNT(a.id) FROM absensi_siswa a 
            WHERE (a.kode_siswa = s.kode_siswa OR a.kode_siswa = s.nis_nisn) AND a.status = 'S' ${dateCond.sqlStr}
          ) AS total_sakit,
          (
            SELECT COUNT(a.id) FROM absensi_siswa a 
            WHERE (a.kode_siswa = s.kode_siswa OR a.kode_siswa = s.nis_nisn) AND a.status = 'I' ${dateCond.sqlStr}
          ) AS total_izin,
          (
            SELECT COUNT(a.id) FROM absensi_siswa a 
            WHERE (a.kode_siswa = s.kode_siswa OR a.kode_siswa = s.nis_nisn) AND a.status = 'A' ${dateCond.sqlStr}
          ) AS total_alpha
        FROM siswa s
        LEFT JOIN kelas k ON s.kode_kelas = k.kode_kelas
        ${mainWhere}
        ORDER BY s.nama_siswa ASC
      `;

      const rows = await query(sql, params);

      if (rows && rows.length > 0) {
        return rows;
      }

      // Fallback directly from absensi_siswa table if master table 'siswa' is completely empty
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

      fallbackSql += ' GROUP BY a.kode_siswa ORDER BY a.kode_siswa ASC';
      return await query(fallbackSql, fbParams);

    } catch (e) {
      console.error('[RekapModel.getRekapSiswa] Error:', e.message);
      return [];
    }
  }

  /**
   * Rekapitulasi Presensi Mapel
   * Returns ALL students from master table 'siswa' (filtered by class and mapel if provided)
   */
  static async getRekapMapel({ bulan, tahun, kode_kelas, kode_mapel }) {
    try {
      const dateCond = this.buildDateCondition('a.tanggal', bulan, tahun);

      let mapelCond = '';
      const mapelParams = [];
      if (kode_mapel) {
        mapelCond = ' AND a.kode_mapel = ?';
        mapelParams.push(kode_mapel);
      }

      const params = [];
      // Add params for 5 subqueries
      for (let i = 0; i < 5; i++) {
        params.push(...mapelParams, ...dateCond.params);
      }

      if (kode_mapel) {
        params.push(kode_mapel);
      }

      let mainWhere = 'WHERE 1=1';
      if (kode_kelas) {
        mainWhere += ' AND s.kode_kelas = ?';
        params.push(kode_kelas);
      }

      const sql = `
        SELECT 
          s.kode_siswa,
          s.nama_siswa,
          s.nis_nisn,
          s.kode_kelas,
          COALESCE(k.nama_kelas, CONCAT('Kelas ', s.kode_kelas)) AS nama_kelas,
          ${kode_mapel ? 'COALESCE(m.nama_mapel, "Mata Pelajaran")' : '"Semua Mapel"'} AS nama_mapel,
          (
            SELECT COUNT(a.id) FROM absensi_mapel a 
            WHERE (a.kode_siswa = s.kode_siswa OR a.kode_siswa = s.nis_nisn) ${mapelCond} ${dateCond.sqlStr}
          ) AS total_absen,
          (
            SELECT COUNT(a.id) FROM absensi_mapel a 
            WHERE (a.kode_siswa = s.kode_siswa OR a.kode_siswa = s.nis_nisn) AND a.status = 'H' ${mapelCond} ${dateCond.sqlStr}
          ) AS total_hadir,
          (
            SELECT COUNT(a.id) FROM absensi_mapel a 
            WHERE (a.kode_siswa = s.kode_siswa OR a.kode_siswa = s.nis_nisn) AND a.status = 'S' ${mapelCond} ${dateCond.sqlStr}
          ) AS total_sakit,
          (
            SELECT COUNT(a.id) FROM absensi_mapel a 
            WHERE (a.kode_siswa = s.kode_siswa OR a.kode_siswa = s.nis_nisn) AND a.status = 'I' ${mapelCond} ${dateCond.sqlStr}
          ) AS total_izin,
          (
            SELECT COUNT(a.id) FROM absensi_mapel a 
            WHERE (a.kode_siswa = s.kode_siswa OR a.kode_siswa = s.nis_nisn) AND a.status = 'A' ${mapelCond} ${dateCond.sqlStr}
          ) AS total_alpha
        FROM siswa s
        LEFT JOIN kelas k ON s.kode_kelas = k.kode_kelas
        ${kode_mapel ? 'LEFT JOIN mapel m ON m.kode_mapel = ?' : ''}
        ${mainWhere}
        ORDER BY s.nama_siswa ASC
      `;

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

      fallbackSql += ' GROUP BY a.kode_siswa ORDER BY a.kode_siswa ASC';
      return await query(fallbackSql, fbParams);

    } catch (e) {
      console.error('[RekapModel.getRekapMapel] Error:', e.message);
      return [];
    }
  }

  /**
   * Rekapitulasi Presensi Guru
   * Returns ALL teachers from master table 'guru'
   */
  static async getRekapGuru({ bulan, tahun }) {
    try {
      const pCond = this.buildDateCondition('p.tanggal', bulan, tahun);
      const iCond = this.buildDateCondition('i.tanggal_mulai', bulan, tahun);

      const params = [
        ...pCond.params,
        ...iCond.params,
        ...iCond.params
      ];

      const sql = `
        SELECT 
          g.kode_guru,
          g.nama_guru,
          g.nip_nuptk,
          g.status_kepegawaian,
          (
            SELECT COUNT(DISTINCT p.id) FROM presensi p 
            WHERE (p.kode_guru = g.kode_guru OR p.kode_guru = g.nip_nuptk OR p.kode_guru = g.nama_guru)
            ${pCond.sqlStr}
          ) AS total_hadir,
          (
            SELECT COUNT(DISTINCT i.id) FROM pengajuan_izin i 
            WHERE (i.user_id = g.kode_guru OR i.nama_pengaju = g.nama_guru OR i.user_id = g.nip_nuptk)
            AND i.jenis = 'Sakit'
            ${iCond.sqlStr}
          ) AS total_sakit,
          (
            SELECT COUNT(DISTINCT i.id) FROM pengajuan_izin i 
            WHERE (i.user_id = g.kode_guru OR i.nama_pengaju = g.nama_guru OR i.user_id = g.nip_nuptk)
            AND (i.jenis IS NULL OR i.jenis != 'Sakit')
            ${iCond.sqlStr}
          ) AS total_izin
        FROM guru g
        ORDER BY g.nama_guru ASC
      `;

      const rows = await query(sql, params);

      if (rows && rows.length > 0) {
        return rows;
      }

      // Fallback directly from presensi table if master table 'guru' is completely empty
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
      if (bulan) {
        const bInt = parseInt(bulan, 10);
        const bPad = String(bInt).padStart(2, '0');
        fallbackSql += ' AND (MONTH(p.tanggal) = ? OR DATE_FORMAT(p.tanggal, "%c") = ? OR DATE_FORMAT(p.tanggal, "%m") = ?)';
        fbParams.push(bInt, String(bInt), bPad);
      }
      if (tahun) {
        const tInt = parseInt(tahun, 10);
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
        WHERE (kode_siswa = ? OR kode_siswa = (SELECT nis_nisn FROM siswa WHERE kode_siswa = ? LIMIT 1))
      `;
      const params = [kode_siswa, kode_siswa];

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
        WHERE (a.kode_siswa = ? OR a.kode_siswa = (SELECT nis_nisn FROM siswa WHERE kode_siswa = ? LIMIT 1))
      `;
      const params = [kode_siswa, kode_siswa];

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
        LEFT JOIN guru g ON (p.kode_guru = g.kode_guru OR p.kode_guru = g.nip_nuptk)
        WHERE (p.kode_guru = ? OR p.kode_guru = (SELECT nip_nuptk FROM guru WHERE kode_guru = ? LIMIT 1) OR p.kode_guru = (SELECT nama_guru FROM guru WHERE kode_guru = ? LIMIT 1))
      `;
      const params = [kode_guru, kode_guru, kode_guru];

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
