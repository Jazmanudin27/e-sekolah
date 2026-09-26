const { query } = require('../config/database');

class RekapModel {
  /**
   * Rekapitulasi Presensi Siswa
   * Returns ALL students from master table 'siswa' (filtered by class if provided)
   */
  static async getRekapSiswa({ bulan, tahun, kode_kelas }) {
    try {
      const aParams = [];
      let dateWhereA = '';
      if (bulan) {
        const bInt = parseInt(bulan, 10);
        const bPad = String(bInt).padStart(2, '0');
        dateWhereA += ' AND (MONTH(a.tanggal) = ? OR a.tanggal LIKE ?)';
        aParams.push(bInt, `%-${bPad}-%`);
      }
      if (tahun) {
        const tInt = parseInt(tahun, 10);
        dateWhereA += ' AND (YEAR(a.tanggal) = ? OR a.tanggal LIKE ?)';
        aParams.push(tInt, `${tInt}-%`);
      }

      const params = [...aParams];
      let mainWhere = 'WHERE 1=1';
      if (kode_kelas) {
        mainWhere += ' AND s.kode_kelas = ?';
        params.push(kode_kelas);
      }

      const sqlPrimary = `
        SELECT 
          s.kode_siswa,
          s.nama_siswa,
          COALESCE(s.nis_nisn, s.nis, s.nisn, CONCAT('NIS-', s.kode_siswa)) AS nis_nisn,
          s.kode_kelas,
          COALESCE(k.nama_kelas, CONCAT('Kelas ', s.kode_kelas)) AS nama_kelas,
          k.jurusan,
          COUNT(DISTINCT a.id) AS total_absen,
          COUNT(DISTINCT CASE WHEN a.status = 'H' THEN a.id END) AS total_hadir,
          COUNT(DISTINCT CASE WHEN a.status = 'S' THEN a.id END) AS total_sakit,
          COUNT(DISTINCT CASE WHEN a.status = 'I' THEN a.id END) AS total_izin,
          COUNT(DISTINCT CASE WHEN a.status = 'A' THEN a.id END) AS total_alpha
        FROM siswa s
        LEFT JOIN kelas k ON s.kode_kelas = k.kode_kelas
        LEFT JOIN absensi_siswa a 
          ON (CONVERT(a.kode_siswa USING utf8mb4) = CONVERT(s.kode_siswa USING utf8mb4) 
              OR CONVERT(a.kode_siswa USING utf8mb4) = CONVERT(s.nis_nisn USING utf8mb4))
          ${dateWhereA}
        ${mainWhere}
        GROUP BY s.kode_siswa, s.nama_siswa, s.nis_nisn, s.nis, s.nisn, s.kode_kelas, k.nama_kelas, k.jurusan
        ORDER BY s.nama_siswa ASC
      `;

      const rows = await query(sqlPrimary, params);
      if (rows && rows.length > 0) {
        return rows;
      }

      // Fallback directly from absensi_siswa table if master table 'siswa' is empty
      let fallbackSql = `
        SELECT 
          a.kode_siswa,
          COALESCE(s.nama_siswa, CONCAT('Siswa #', a.kode_siswa)) AS nama_siswa,
          COALESCE(s.nis_nisn, CONCAT('NIS-', a.kode_siswa)) AS nis_nisn,
          COALESCE(k.nama_kelas, CONCAT('Kelas ', a.kode_kelas)) AS nama_kelas,
          COUNT(DISTINCT a.id) AS total_absen,
          COUNT(DISTINCT CASE WHEN a.status = 'H' THEN a.id END) AS total_hadir,
          COUNT(DISTINCT CASE WHEN a.status = 'S' THEN a.id END) AS total_sakit,
          COUNT(DISTINCT CASE WHEN a.status = 'I' THEN a.id END) AS total_izin,
          COUNT(DISTINCT CASE WHEN a.status = 'A' THEN a.id END) AS total_alpha
        FROM absensi_siswa a
        LEFT JOIN siswa s ON (
          CONVERT(a.kode_siswa USING utf8mb4) = CONVERT(s.kode_siswa USING utf8mb4) 
          OR CONVERT(a.kode_siswa USING utf8mb4) = CONVERT(s.nis_nisn USING utf8mb4)
        )
        LEFT JOIN kelas k ON a.kode_kelas = k.kode_kelas
        WHERE 1=1 ${dateWhereA}
      `;
      const fbParams = [...aParams];
      if (kode_kelas) {
        fallbackSql += ' AND a.kode_kelas = ?';
        fbParams.push(kode_kelas);
      }

      fallbackSql += ' GROUP BY a.kode_siswa, s.nama_siswa, s.nis_nisn, k.nama_kelas ORDER BY a.kode_siswa ASC';
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
      const aParams = [];
      let dateWhereA = '';
      if (kode_mapel) {
        dateWhereA += ' AND a.kode_mapel = ?';
        aParams.push(kode_mapel);
      }
      if (bulan) {
        const bInt = parseInt(bulan, 10);
        const bPad = String(bInt).padStart(2, '0');
        dateWhereA += ' AND (MONTH(a.tanggal) = ? OR a.tanggal LIKE ?)';
        aParams.push(bInt, `%-${bPad}-%`);
      }
      if (tahun) {
        const tInt = parseInt(tahun, 10);
        dateWhereA += ' AND (YEAR(a.tanggal) = ? OR a.tanggal LIKE ?)';
        aParams.push(tInt, `${tInt}-%`);
      }

      const params = [];
      if (kode_mapel) {
        params.push(kode_mapel);
      }
      params.push(...aParams);

      let mainWhere = 'WHERE 1=1';
      if (kode_kelas) {
        mainWhere += ' AND s.kode_kelas = ?';
        params.push(kode_kelas);
      }

      const sqlPrimary = `
        SELECT 
          s.kode_siswa,
          s.nama_siswa,
          COALESCE(s.nis_nisn, s.nis, s.nisn, CONCAT('NIS-', s.kode_siswa)) AS nis_nisn,
          s.kode_kelas,
          COALESCE(k.nama_kelas, CONCAT('Kelas ', s.kode_kelas)) AS nama_kelas,
          ${kode_mapel ? 'COALESCE(m.nama_mapel, "Mata Pelajaran")' : '"Semua Mapel"'} AS nama_mapel,
          COUNT(DISTINCT a.id) AS total_absen,
          COUNT(DISTINCT CASE WHEN a.status = 'H' THEN a.id END) AS total_hadir,
          COUNT(DISTINCT CASE WHEN a.status = 'S' THEN a.id END) AS total_sakit,
          COUNT(DISTINCT CASE WHEN a.status = 'I' THEN a.id END) AS total_izin,
          COUNT(DISTINCT CASE WHEN a.status = 'A' THEN a.id END) AS total_alpha
        FROM siswa s
        LEFT JOIN kelas k ON s.kode_kelas = k.kode_kelas
        ${kode_mapel ? 'LEFT JOIN mapel m ON m.kode_mapel = ?' : ''}
        LEFT JOIN absensi_mapel a 
          ON (CONVERT(a.kode_siswa USING utf8mb4) = CONVERT(s.kode_siswa USING utf8mb4) 
              OR CONVERT(a.kode_siswa USING utf8mb4) = CONVERT(s.nis_nisn USING utf8mb4))
          ${dateWhereA}
        ${mainWhere}
        GROUP BY s.kode_siswa, s.nama_siswa, s.nis_nisn, s.nis, s.nisn, s.kode_kelas, k.nama_kelas ${kode_mapel ? ', m.nama_mapel' : ''}
        ORDER BY s.nama_siswa ASC
      `;

      const rows = await query(sqlPrimary, params);
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
          COUNT(DISTINCT a.id) AS total_absen,
          COUNT(DISTINCT CASE WHEN a.status = 'H' THEN a.id END) AS total_hadir,
          COUNT(DISTINCT CASE WHEN a.status = 'S' THEN a.id END) AS total_sakit,
          COUNT(DISTINCT CASE WHEN a.status = 'I' THEN a.id END) AS total_izin,
          COUNT(DISTINCT CASE WHEN a.status = 'A' THEN a.id END) AS total_alpha
        FROM absensi_mapel a
        LEFT JOIN siswa s ON (
          CONVERT(a.kode_siswa USING utf8mb4) = CONVERT(s.kode_siswa USING utf8mb4) 
          OR CONVERT(a.kode_siswa USING utf8mb4) = CONVERT(s.nis_nisn USING utf8mb4)
        )
        LEFT JOIN kelas k ON a.kode_kelas = k.kode_kelas
        LEFT JOIN mapel m ON a.kode_mapel = m.kode_mapel
        WHERE 1=1 ${dateWhereA}
      `;
      const fbParams = [...aParams];
      if (kode_kelas) {
        fallbackSql += ' AND a.kode_kelas = ?';
        fbParams.push(kode_kelas);
      }

      fallbackSql += ' GROUP BY a.kode_siswa, s.nama_siswa, s.nis_nisn, k.nama_kelas, m.nama_mapel ORDER BY a.kode_siswa ASC';
      return await query(fallbackSql, fbParams);

    } catch (e) {
      console.error('[RekapModel.getRekapMapel] Error:', e.message);
      return [];
    }
  }

  /**
   * Rekapitulasi Presensi Guru
   * Returns ALL teachers from master table 'guru' and attendance tables
   */
  static async getRekapGuru({ bulan, tahun } = {}) {
    try {
      const pParams = [];
      let pWhere = '';
      if (bulan) {
        const bInt = parseInt(bulan, 10);
        const bPad = String(bInt).padStart(2, '0');
        pWhere += ' AND (MONTH(p.tanggal) = ? OR p.tanggal LIKE ?)';
        pParams.push(bInt, `%-${bPad}-%`);
      }
      if (tahun) {
        const tInt = parseInt(tahun, 10);
        pWhere += ' AND (YEAR(p.tanggal) = ? OR p.tanggal LIKE ?)';
        pParams.push(tInt, `${tInt}-%`);
      }

      const iParams = [];
      let iWhere = '';
      if (bulan) {
        const bInt = parseInt(bulan, 10);
        const bPad = String(bInt).padStart(2, '0');
        iWhere += ' AND (MONTH(i.tanggal_mulai) = ? OR i.tanggal_mulai LIKE ?)';
        iParams.push(bInt, `%-${bPad}-%`);
      }
      if (tahun) {
        const tInt = parseInt(tahun, 10);
        iWhere += ' AND (YEAR(i.tanggal_mulai) = ? OR i.tanggal_mulai LIKE ?)';
        iParams.push(tInt, `${tInt}-%`);
      }

      const params = [...pParams, ...iParams];

      // Optimized single-pass query directly from master table 'guru'
      const sqlPrimary = `
        SELECT 
          g.kode_guru,
          COALESCE(g.nama_guru, CONCAT('Guru #', g.kode_guru)) AS nama_guru,
          COALESCE(g.nip_nuptk, '-') AS nip_nuptk,
          COALESCE(g.status_kepegawaian, 'Guru') AS status_kepegawaian,
          COUNT(DISTINCT p.id) AS total_hadir,
          COUNT(DISTINCT CASE WHEN i.jenis = 'Sakit' THEN i.id END) AS total_sakit,
          COUNT(DISTINCT CASE WHEN i.jenis IS NOT NULL AND i.jenis != 'Sakit' THEN i.id END) AS total_izin
        FROM guru g
        LEFT JOIN presensi p 
          ON (CONVERT(p.kode_guru USING utf8mb4) = CONVERT(g.kode_guru USING utf8mb4) 
              OR CONVERT(p.kode_guru USING utf8mb4) = CONVERT(g.nip_nuptk USING utf8mb4))
          ${pWhere}
        LEFT JOIN pengajuan_izin i 
          ON (CONVERT(i.user_id USING utf8mb4) = CONVERT(g.kode_guru USING utf8mb4) 
              OR CONVERT(i.user_id USING utf8mb4) = CONVERT(g.nip_nuptk USING utf8mb4) 
              OR CONVERT(i.nama_pengaju USING utf8mb4) = CONVERT(g.nama_guru USING utf8mb4))
          ${iWhere}
        GROUP BY g.kode_guru, g.nama_guru, g.nip_nuptk, g.status_kepegawaian
        ORDER BY g.nama_guru ASC
      `;

      const rows = await query(sqlPrimary, params);
      if (rows && rows.length > 0) {
        return rows;
      }

      // Fallback directly from presensi table if master table 'guru' is empty
      const sqlFallback = `
        SELECT 
          p.kode_guru,
          COALESCE(g.nama_guru, CONCAT('Guru #', p.kode_guru)) AS nama_guru,
          COALESCE(g.nip_nuptk, '-') AS nip_nuptk,
          COALESCE(g.status_kepegawaian, 'Guru') AS status_kepegawaian,
          COUNT(DISTINCT p.id) AS total_hadir,
          0 AS total_sakit,
          0 AS total_izin
        FROM presensi p
        LEFT JOIN guru g ON (
          CONVERT(p.kode_guru USING utf8mb4) = CONVERT(g.kode_guru USING utf8mb4)
          OR CONVERT(p.kode_guru USING utf8mb4) = CONVERT(g.nip_nuptk USING utf8mb4)
        )
        WHERE 1=1 ${pWhere}
        GROUP BY p.kode_guru, g.nama_guru, g.nip_nuptk, g.status_kepegawaian
        ORDER BY nama_guru ASC
      `;
      return await query(sqlFallback, pParams);

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
