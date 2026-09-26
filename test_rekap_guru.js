const { query } = require('./src/config/database');

async function test() {
  const bulan = 9;
  const tahun = 2026;
  const bInt = parseInt(bulan, 10);
  const bPad = String(bInt).padStart(2, '0');
  const tInt = parseInt(tahun, 10);

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

  let izinLainWhere = 'WHERE i.jenis != "Sakit"';
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
        ${presensiWhere} AND p.kode_guru = g.kode_guru
      ) AS total_hadir,
      (
        SELECT COUNT(DISTINCT i.id) FROM pengajuan_izin i 
        ${izinSakitWhere} AND (i.user_id = g.kode_guru OR i.nama_pengaju = g.nama_guru)
      ) AS total_sakit,
      (
        SELECT COUNT(DISTINCT i.id) FROM pengajuan_izin i 
        ${izinLainWhere} AND (i.user_id = g.kode_guru OR i.nama_pengaju = g.nama_guru)
      ) AS total_izin
    FROM guru g
    ORDER BY g.nama_guru ASC
  `;

  const allParams = [...pParams, ...sParams, ...iParams];
  console.log('SQL:', sql);
  console.log('Params:', allParams);
  try {
    const rows = await query(sql, allParams);
    console.log('Rows count:', rows.length);
  } catch (err) {
    console.error('SQL ERROR:', err);
  }
}

test().then(() => process.exit(0));
