require('dotenv').config();
const { query } = require('../src/config/database');

async function test() {
  try {
    const siswaCount = await query('SELECT COUNT(*) AS total FROM siswa');
    console.log('Siswa count:', siswaCount[0]);

    const absensiSiswa = await query('SELECT * FROM absensi_siswa LIMIT 10');
    console.log('Absensi siswa sample count:', absensiSiswa.length);
    console.log('Absensi siswa sample:', absensiSiswa);

    const absensiMapel = await query('SELECT * FROM absensi_mapel LIMIT 10');
    console.log('Absensi mapel sample count:', absensiMapel.length);
    console.log('Absensi mapel sample:', absensiMapel);

    const presensiGuru = await query('SELECT * FROM presensi LIMIT 10');
    console.log('Presensi guru sample count:', presensiGuru.length);

    process.exit(0);
  } catch (err) {
    console.error('Error in test:', err);
    process.exit(1);
  }
}

test();
