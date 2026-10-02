const { query } = require('../config/database');

async function seedKeuangan() {
  console.log('🚀 Memulai Seeding Data Keuangan & SPP (E-BMS)...');

  try {
    // 1. SEED POS PEMBAYARAN
    console.log('📦 Seeding Pos Pembayaran...');
    const posData = [
      { kode_pos: 'POS-SPP', nama_pos: 'SPP Bulanan', tipe: 'BULANAN', deskripsi: 'Sumbangan Pembinaan Pendidikan rutin setiap bulan' },
      { kode_pos: 'POS-DSP', nama_pos: 'Uang Gedung / DSP', tipe: 'BEBAS', deskripsi: 'Dana Sumbangan Pendidikan / Pembangunan Gedung Sekolah' },
      { kode_pos: 'POS-SRG', nama_pos: 'Uang Seragam & Atribut', tipe: 'BEBAS', deskripsi: 'Seragam OSIS, Pramuka, Batik, Olahraga, & Atribut' },
      { kode_pos: 'POS-PTS', nama_pos: 'Uang Ujian PTS/PAS', tipe: 'BEBAS', deskripsi: 'Biaya Administrasi Pelaksanaan Ujian Penilaian Tengah/Akhir Semester' },
      { kode_pos: 'POS-EKS', nama_pos: 'Iuran Ekstrakurikuler', tipe: 'BULANAN', deskripsi: 'Iuran operasional kegiatan ekstrakurikuler' }
    ];

    const posIds = {};
    for (const pos of posData) {
      const sql = `
        INSERT INTO pos_pembayaran (kode_pos, nama_pos, tipe, deskripsi)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE nama_pos=VALUES(nama_pos), tipe=VALUES(tipe), deskripsi=VALUES(deskripsi)
      `;
      const res = await query(sql, [pos.kode_pos, pos.nama_pos, pos.tipe, pos.deskripsi]);

      // Fetch inserted or existing ID
      const rows = await query('SELECT id FROM pos_pembayaran WHERE kode_pos = ?', [pos.kode_pos]);
      if (rows && rows.length > 0) {
        posIds[pos.kode_pos] = rows[0].id;
      }
    }
    console.log('✅ Master Pos Pembayaran berhasil di-seed:', posIds);

    // 2. SEED TARIF PEMBAYARAN
    console.log('🏷️ Seeding Matrix Tarif Pembayaran...');
    const tahunAjaran = '2025/2026';
    const tarifData = [
      { pos_id: posIds['POS-SPP'], tahun_ajaran: tahunAjaran, tingkat: null, kode_kelas: null, nominal: 350000 },
      { pos_id: posIds['POS-DSP'], tahun_ajaran: tahunAjaran, tingkat: null, kode_kelas: null, nominal: 3500000 },
      { pos_id: posIds['POS-SRG'], tahun_ajaran: tahunAjaran, tingkat: null, kode_kelas: null, nominal: 850000 },
      { pos_id: posIds['POS-PTS'], tahun_ajaran: tahunAjaran, tingkat: null, kode_kelas: null, nominal: 150000 }
    ];

    const tarifIds = {};
    for (const t of tarifData) {
      const existing = await query(
        'SELECT id FROM tarif_pembayaran WHERE pos_id = ? AND tahun_ajaran = ? AND tingkat IS NULL AND kode_kelas IS NULL',
        [t.pos_id, t.tahun_ajaran]
      );

      let tId;
      if (existing && existing.length > 0) {
        tId = existing[0].id;
        await query('UPDATE tarif_pembayaran SET nominal = ? WHERE id = ?', [t.nominal, tId]);
      } else {
        const res = await query(
          'INSERT INTO tarif_pembayaran (pos_id, tahun_ajaran, tingkat, kode_kelas, nominal) VALUES (?, ?, ?, ?, ?)',
          [t.pos_id, t.tahun_ajaran, t.tingkat, t.kode_kelas, t.nominal]
        );
        tId = res.insertId;
      }

      if (t.pos_id === posIds['POS-SPP']) tarifIds['SPP'] = tId;
      if (t.pos_id === posIds['POS-DSP']) tarifIds['DSP'] = tId;
      if (t.pos_id === posIds['POS-SRG']) tarifIds['SRG'] = tId;
      if (t.pos_id === posIds['POS-PTS']) tarifIds['PTS'] = tId;
    }
    console.log('✅ Matrix Tarif Pembayaran berhasil di-seed:', tarifIds);

    // 3. FETCH SISWA UNTUK SAMPLE INVOICE
    console.log('👥 Mengambil data siswa aktif untuk sample tagihan...');
    const siswaList = await query("SELECT kode_siswa, nama_siswa, nis FROM siswa LIMIT 10");

    if (!siswaList || siswaList.length === 0) {
      console.warn('⚠️ Tidak ada data di tabel siswa. Melewati seeding tagihan & transaksi.');
      console.log('🎉 Seeding Master Pos & Tarif selesai!');
      process.exit(0);
    }

    // 4. SEED SAMPLE OVERRIDE BEASISWA
    if (siswaList.length >= 2) {
      console.log('🎓 Seeding Beasiswa / Diskon khusus siswa...');
      await query(
        `INSERT INTO tarif_siswa_override (tarif_id, siswa_id, tipe_potongan, nilai_potongan, keterangan)
         VALUES (?, ?, 'NOMINAL', 100000, 'Beasiswa Prestasi Akademik')
         ON DUPLICATE KEY UPDATE nilai_potongan=VALUES(nilai_potongan), keterangan=VALUES(keterangan)`,
        [tarifIds['SPP'], siswaList[0].kode_siswa]
      );

      await query(
        `INSERT INTO tarif_siswa_override (tarif_id, siswa_id, tipe_potongan, nilai_potongan, keterangan)
         VALUES (?, ?, 'PERSEN', 50, 'Potongan Putra/Putri Guru')
         ON DUPLICATE KEY UPDATE nilai_potongan=VALUES(nilai_potongan), keterangan=VALUES(keterangan)`,
        [tarifIds['SPP'], siswaList[1].kode_siswa]
      );
      console.log('✅ Override Beasiswa berhasil di-seed.');
    }

    // 5. SEED TAGIHAN SISWA (INVOICES)
    console.log('📄 Seeding Tagihan Siswa (SPP & DSP)...');
    const sampleMonths = [7, 8, 9, 10]; // Bulan Juli - Oktober
    const invoiceIds = [];

    for (let i = 0; i < Math.min(5, siswaList.length); i++) {
      const s = siswaList[i];
      let sppNominal = 350000;
      if (i === 0) sppNominal = 250000; // Potongan 100rb
      if (i === 1) sppNominal = 175000; // Potongan 50%

      for (const m of sampleMonths) {
        const kodeInv = `INV-2025${String(m).padStart(2, '0')}-${s.kode_siswa}`;
        let status = 'UNPAID';
        let terbayar = 0;

        // Make Juli & Agustus PAID for realistic display
        if (m === 7 || (m === 8 && i % 2 === 0)) {
          status = 'PAID';
          terbayar = sppNominal;
        } else if (m === 9 && i === 0) {
          status = 'PARTIAL';
          terbayar = 100000;
        }

        const sqlInv = `
          INSERT INTO tagihan_siswa (kode_tagihan, siswa_id, tarif_id, bulan, tahun, nominal_tagihan, nominal_terbayar, status, tanggal_jatuh_tempo)
          VALUES (?, ?, ?, ?, 2025, ?, ?, ?, '2025-10-10')
          ON DUPLICATE KEY UPDATE nominal_tagihan=VALUES(nominal_tagihan), nominal_terbayar=VALUES(nominal_terbayar), status=VALUES(status)
        `;
        const resInv = await query(sqlInv, [kodeInv, s.kode_siswa, tarifIds['SPP'], m, sppNominal, terbayar, status]);

        const invRows = await query('SELECT id FROM tagihan_siswa WHERE kode_tagihan = ?', [kodeInv]);
        if (invRows && invRows.length > 0) {
          invoiceIds.push({ id: invRows[0].id, siswa_id: s.kode_siswa, nominal: sppNominal, status });
        }
      }
    }
    console.log(`✅ ${invoiceIds.length} Sample Tagihan Siswa berhasil di-seed.`);

    // 6. SEED SAMPLE TRANSAKSI KASIR
    console.log('💵 Seeding Sample Transaksi Kasir...');
    const paidInvoices = invoiceIds.filter(inv => inv.status === 'PAID');

    if (paidInvoices.length > 0) {
      const sampleTrx1 = paidInvoices[0];
      const noTrx1 = `TRX-20251001-0001`;

      const resTrx = await query(
        `INSERT INTO pembayaran_transaksi (no_transaksi, siswa_id, total_bayar, metode_pembayaran, channel_pembayaran, status_transaksi)
         VALUES (?, ?, ?, 'CASH', 'CASH_KASIR', 'SUCCESS')
         ON DUPLICATE KEY UPDATE total_bayar=VALUES(total_bayar)`,
        [noTrx1, sampleTrx1.siswa_id, sampleTrx1.nominal]
      );

      const trxRows = await query('SELECT id FROM pembayaran_transaksi WHERE no_transaksi = ?', [noTrx1]);
      if (trxRows && trxRows.length > 0) {
        await query(
          `INSERT INTO pembayaran_detail (transaksi_id, tagihan_id, nominal_dibayar)
           VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE nominal_dibayar=VALUES(nominal_dibayar)`,
          [trxRows[0].id, sampleTrx1.id, sampleTrx1.nominal]
        );
      }
    }
    console.log('✅ Sample Transaksi Kasir berhasil di-seed.');

    console.log('🎉 PROSES SEEDING KEUANGAN & SPP SELESAI DENGAN SUKSES!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error Seeding Keuangan:', err);
    process.exit(1);
  }
}

seedKeuangan();
