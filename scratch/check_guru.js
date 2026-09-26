require('dotenv').config();
const { query } = require('../src/config/database');
const RekapModel = require('../src/models/rekap.model');

async function test() {
  try {
    console.log('=== CHECK TABLES ===');
    const guru = await query('SELECT * FROM guru LIMIT 5');
    console.log('Guru sample:', guru);

    const presensi = await query('SELECT * FROM presensi LIMIT 5');
    console.log('Presensi sample:', presensi);

    const izin = await query('SELECT * FROM pengajuan_izin LIMIT 5');
    console.log('Pengajuan izin sample:', izin);

    console.log('=== TEST REKAP GURU ===');
    const resAll = await RekapModel.getRekapGuru({});
    console.log('Rekap guru all:', resAll);

    const resSep = await RekapModel.getRekapGuru({ bulan: 9, tahun: 2026 });
    console.log('Rekap guru Sep 2026:', resSep);

    process.exit(0);
  } catch (err) {
    console.error('Error in test:', err);
    process.exit(1);
  }
}

test();
