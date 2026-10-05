const { query } = require('../config/database');

class PerpustakaanModel {
  /**
   * Auto-create tables if they don't exist
   */
  static async ensureTables() {
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS perpustakaan_buku (
          id INT AUTO_INCREMENT PRIMARY KEY,
          kode_buku VARCHAR(50) NOT NULL UNIQUE,
          judul VARCHAR(255) NOT NULL,
          pengarang VARCHAR(200) NOT NULL,
          penerbit VARCHAR(200) DEFAULT NULL,
          tahun_terbit VARCHAR(10) DEFAULT NULL,
          isbn VARCHAR(50) DEFAULT NULL,
          kategori VARCHAR(100) NOT NULL DEFAULT 'Umum',
          lokasi_rak VARCHAR(100) DEFAULT 'Rak A-1',
          stok INT NOT NULL DEFAULT 1,
          tersedia INT NOT NULL DEFAULT 1,
          deskripsi TEXT DEFAULT NULL,
          sampul_url TEXT DEFAULT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    } catch (e) {
      console.error('Error creating perpustakaan_buku table:', e.message);
    }

    try {
      await query(`
        CREATE TABLE IF NOT EXISTS perpustakaan_peminjaman (
          id INT AUTO_INCREMENT PRIMARY KEY,
          kode_transaksi VARCHAR(50) NOT NULL UNIQUE,
          buku_id INT NOT NULL,
          peminjam_type ENUM('siswa', 'guru') DEFAULT 'siswa',
          peminjam_id VARCHAR(50) NOT NULL,
          nama_peminjam VARCHAR(200) NOT NULL,
          kelas_atau_jabatan VARCHAR(100) DEFAULT '-',
          tgl_pinjam DATE NOT NULL,
          tgl_tenggat DATE NOT NULL,
          tgl_kembali DATE DEFAULT NULL,
          status ENUM('Dipinjam', 'Dikembalikan', 'Terlambat', 'Hilang') DEFAULT 'Dipinjam',
          denda DECIMAL(10,2) DEFAULT 0,
          catatan TEXT DEFAULT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    } catch (e) {
      console.error('Error creating perpustakaan_peminjaman table:', e.message);
    }

    // Seed sample books if table is empty
    try {
      const existing = await query('SELECT COUNT(*) as cnt FROM perpustakaan_buku');
      if (existing && existing[0] && existing[0].cnt === 0) {
        const sampleBooks = [
          ['BUK-001', 'Matematika SMA Kelas X (Kurikulum Merdeka)', 'Dr. Suparno, M.Sc', 'Erlangga', '2023', '978-602-01-0001-1', 'Pelajaran', 'Rak A-1', 10, 8, 'Buku panduan utama pembelajaran Matematika Kurikulum Merdeka Fase E.'],
          ['BUK-002', 'Fisika Dasar untuk SMA/MA Kelas XI', 'Prof. Bambang Haryono', 'Yudhistira', '2022', '978-602-01-0002-8', 'Pelajaran', 'Rak A-2', 8, 7, 'Buku paket pelajaran Fisika SMA pembahasan mekanika dan termodinamika.'],
          ['BUK-003', 'Laskar Pelangi', 'Andrea Hirata', 'Bentang Pustaka', '2005', '978-979-3062-79-2', 'Fiksi', 'Rak B-1', 5, 3, 'Novel populer kisah 10 anak di Belitung memperjuangkan pendidikan.'],
          ['BUK-004', 'Bumi Manusia', 'Pramoedya Ananta Toer', 'Lentera Dipantara', '1980', '978-979-97312-3-5', 'Sejarah', 'Rak B-2', 6, 5, 'Novel sejarah perjuangan Minke di masa awal pergerakan nasional Indonesia.'],
          ['BUK-005', 'Pemrograman Web Modern dengan React & Node.js', 'Eko Prasetyo, M.Kom', 'Informatika', '2024', '978-623-00-1234-5', 'Teknologi', 'Rak C-1', 4, 3, 'Panduan praktis fullstack web development modern React 19 dan Express.'],
          ['BUK-006', 'Biologi Molekuler & Genetika SMA', 'Dr. Endang Setyowati', 'Bumi Aksara', '2023', '978-602-444-123-0', 'Pelajaran', 'Rak A-3', 7, 7, 'Buku pelajaran Biologi materi DNA, RNA, dan pewarisan sifat.'],
          ['BUK-007', 'Sejarah Indonesia Modern 1200-2008', 'M.C. Ricklefs', 'Serambi', '2008', '978-979-024-118-3', 'Sejarah', 'Rak B-3', 3, 2, 'Buku referensi lengkap perjalanan sejarah Nusantara dan Indonesia.'],
          ['BUK-008', 'Filosofi Teras', 'Henry Manampiring', 'Kompas', '2018', '978-602-412-518-9', 'Psikologi', 'Rak D-1', 5, 4, 'Penerapan filsafat Stoisisme dalam kehidupan sehari-hari anak muda.']
        ];
        for (const b of sampleBooks) {
          await query(
            `INSERT INTO perpustakaan_buku 
             (kode_buku, judul, pengarang, penerbit, tahun_terbit, isbn, kategori, lokasi_rak, stok, tersedia, deskripsi)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            b
          );
        }
      }
    } catch (e) {
      console.error('Error seeding perpustakaan_buku:', e.message);
    }
  }

  // ============ BUKU ============
  static async getAllBuku({ search, kategori, lokasi_rak, kode_member } = {}) {
    await this.ensureTables();
    let sql = 'SELECT * FROM perpustakaan_buku WHERE 1=1';
    const params = [];

    if (kode_member) {
      sql += ' AND kode_member = ?';
      params.push(kode_member);
    }
    if (search) {
      sql += ' AND (judul LIKE ? OR pengarang LIKE ? OR kode_buku LIKE ? OR isbn LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }
    if (kategori && kategori !== 'Semua') {
      sql += ' AND kategori = ?';
      params.push(kategori);
    }
    if (lokasi_rak) {
      sql += ' AND lokasi_rak = ?';
      params.push(lokasi_rak);
    }

    sql += ' ORDER BY created_at DESC';
    return await query(sql, params);
  }

  static async getBukuById(id) {
    await this.ensureTables();
    const rows = await query('SELECT * FROM perpustakaan_buku WHERE id = ?', [id]);
    return rows[0] || null;
  }

  static async createBuku(data) {
    await this.ensureTables();
    const {
      kode_buku,
      judul,
      pengarang,
      penerbit,
      tahun_terbit,
      isbn,
      kategori,
      lokasi_rak,
      stok,
      deskripsi,
      sampul_url
    } = data;

    const stokNum = parseInt(stok, 10) || 1;
    const kode = kode_buku || `BUK-${Date.now().toString().slice(-6)}`;

    const result = await query(
      `INSERT INTO perpustakaan_buku 
       (kode_buku, judul, pengarang, penerbit, tahun_terbit, isbn, kategori, lokasi_rak, stok, tersedia, deskripsi, sampul_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        kode,
        judul,
        pengarang,
        penerbit || null,
        tahun_terbit || null,
        isbn || null,
        kategori || 'Umum',
        lokasi_rak || 'Rak A-1',
        stokNum,
        stokNum,
        deskripsi || null,
        sampul_url || null
      ]
    );
    return result.insertId;
  }

  static async updateBuku(id, data) {
    await this.ensureTables();
    const oldBook = await this.getBukuById(id);
    if (!oldBook) throw new Error('Buku tidak ditemukan');

    const stokNum = data.stok !== undefined ? parseInt(data.stok, 10) : oldBook.stok;
    const diffStok = stokNum - oldBook.stok;
    const newTersedia = Math.max(0, oldBook.tersedia + diffStok);

    await query(
      `UPDATE perpustakaan_buku SET
        kode_buku = ?,
        judul = ?,
        pengarang = ?,
        penerbit = ?,
        tahun_terbit = ?,
        isbn = ?,
        kategori = ?,
        lokasi_rak = ?,
        stok = ?,
        tersedia = ?,
        deskripsi = ?,
        sampul_url = ?
       WHERE id = ?`,
      [
        data.kode_buku || oldBook.kode_buku,
        data.judul || oldBook.judul,
        data.pengarang || oldBook.pengarang,
        data.penerbit !== undefined ? data.penerbit : oldBook.penerbit,
        data.tahun_terbit !== undefined ? data.tahun_terbit : oldBook.tahun_terbit,
        data.isbn !== undefined ? data.isbn : oldBook.isbn,
        data.kategori || oldBook.kategori,
        data.lokasi_rak || oldBook.lokasi_rak,
        stokNum,
        newTersedia,
        data.deskripsi !== undefined ? data.deskripsi : oldBook.deskripsi,
        data.sampul_url !== undefined ? data.sampul_url : oldBook.sampul_url,
        id
      ]
    );
    return true;
  }

  static async deleteBuku(id) {
    await this.ensureTables();
    const active = await query(
      'SELECT COUNT(*) as cnt FROM perpustakaan_peminjaman WHERE buku_id = ? AND status = "Dipinjam"',
      [id]
    );
    if (active[0].cnt > 0) {
      throw new Error('Buku tidak dapat dihapus karena sedang ada transaksi peminjaman aktif');
    }
    await query('DELETE FROM perpustakaan_buku WHERE id = ?', [id]);
    return true;
  }

  // ============ PEMINJAMAN ============
  static async getAllPeminjaman({ search, status, peminjam_type, date_from, date_to, kode_member } = {}) {
    await this.ensureTables();
    let sql = `
      SELECT p.*, b.judul as judul_buku, b.kode_buku, b.kategori, b.lokasi_rak
      FROM perpustakaan_peminjaman p
      JOIN perpustakaan_buku b ON p.buku_id = b.id
      WHERE 1=1
    `;
    const params = [];

    if (kode_member) {
      sql += ' AND (p.kode_member = ? OR b.kode_member = ?)';
      params.push(kode_member, kode_member);
    }
    if (search) {
      sql += ' AND (p.kode_transaksi LIKE ? OR p.nama_peminjam LIKE ? OR b.judul LIKE ? OR p.peminjam_id LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }
    if (status && status !== 'Semua') {
      sql += ' AND p.status = ?';
      params.push(status);
    }
    if (peminjam_type && peminjam_type !== 'Semua') {
      sql += ' AND p.peminjam_type = ?';
      params.push(peminjam_type);
    }
    if (date_from) {
      sql += ' AND p.tgl_pinjam >= ?';
      params.push(date_from);
    }
    if (date_to) {
      sql += ' AND p.tgl_pinjam <= ?';
      params.push(date_to);
    }

    sql += ' ORDER BY p.created_at DESC';
    return await query(sql, params);
  }

  static async createPeminjaman(data) {
    await this.ensureTables();
    const {
      buku_id,
      peminjam_type,
      peminjam_id,
      nama_peminjam,
      kelas_atau_jabatan,
      tgl_pinjam,
      tgl_tenggat,
      catatan
    } = data;

    const book = await this.getBukuById(buku_id);
    if (!book) throw new Error('Buku tidak ditemukan');
    if (book.tersedia < 1) throw new Error('Stok buku tidak tersedia saat ini');

    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randSuffix = Math.floor(100 + Math.random() * 900);
    const kode_transaksi = data.kode_transaksi || `TRX-${todayStr}-${randSuffix}`;

    const res = await query(
      `INSERT INTO perpustakaan_peminjaman
       (kode_transaksi, buku_id, peminjam_type, peminjam_id, nama_peminjam, kelas_atau_jabatan, tgl_pinjam, tgl_tenggat, status, catatan)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Dipinjam', ?)`,
      [
        kode_transaksi,
        buku_id,
        peminjam_type || 'siswa',
        peminjam_id,
        nama_peminjam,
        kelas_atau_jabatan || '-',
        tgl_pinjam,
        tgl_tenggat,
        catatan || null
      ]
    );

    // Reduce available stock by 1
    await query('UPDATE perpustakaan_buku SET tersedia = tersedia - 1 WHERE id = ? AND tersedia > 0', [buku_id]);

    return res.insertId;
  }

  static async kembalikanBuku(id, { tgl_kembali, denda, catatan }) {
    await this.ensureTables();
    const rows = await query('SELECT * FROM perpustakaan_peminjaman WHERE id = ?', [id]);
    if (!rows || rows.length === 0) throw new Error('Data peminjaman tidak ditemukan');

    const tx = rows[0];
    if (tx.status === 'Dikembalikan') throw new Error('Buku ini sudah dikembalikan sebelumnya');

    const returnDate = tgl_kembali || new Date().toISOString().slice(0, 10);
    let lateFee = parseFloat(denda) || 0;

    // Auto-calculate denda if not manually provided and late
    if (denda === undefined || denda === null || denda === '') {
      const tenggat = new Date(tx.tgl_tenggat);
      const kembali = new Date(returnDate);
      if (kembali > tenggat) {
        const diffTime = Math.abs(kembali - tenggat);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        lateFee = diffDays * 1000; // Rp 1.000 / day
      }
    }

    await query(
      `UPDATE perpustakaan_peminjaman SET
        tgl_kembali = ?,
        status = 'Dikembalikan',
        denda = ?,
        catatan = ?
       WHERE id = ?`,
      [returnDate, lateFee, catatan || tx.catatan, id]
    );

    // Increase available stock back
    await query('UPDATE perpustakaan_buku SET tersedia = tersedia + 1 WHERE id = ?', [tx.buku_id]);

    return true;
  }

  static async deletePeminjaman(id) {
    await this.ensureTables();
    const rows = await query('SELECT * FROM perpustakaan_peminjaman WHERE id = ?', [id]);
    if (!rows || rows.length === 0) throw new Error('Data peminjaman tidak ditemukan');
    const tx = rows[0];

    // If deleting active borrowing, return stock
    if (tx.status === 'Dipinjam' || tx.status === 'Terlambat') {
      await query('UPDATE perpustakaan_buku SET tersedia = tersedia + 1 WHERE id = ?', [tx.buku_id]);
    }

    await query('DELETE FROM perpustakaan_peminjaman WHERE id = ?', [id]);
    return true;
  }

  // ============ STATISTIK ============
  static async getStats(kode_member = null) {
    await this.ensureTables();
    let bWhere = '';
    let pWhere = 'WHERE status = "Dipinjam"';
    let lWhere = 'WHERE status = "Dipinjam" AND tgl_tenggat < CURDATE()';
    let cWhere = '';
    const bParams = [];
    const pParams = [];
    const lParams = [];
    const cParams = [];

    if (kode_member) {
      bWhere = 'WHERE kode_member = ?';
      bParams.push(kode_member);
      pWhere += ' AND kode_member = ?';
      pParams.push(kode_member);
      lWhere += ' AND kode_member = ?';
      lParams.push(kode_member);
      cWhere = 'WHERE kode_member = ?';
      cParams.push(kode_member);
    }

    const totalBuku = await query(`SELECT COUNT(*) as total_judul, IFNULL(SUM(stok), 0) as total_eksemplar, IFNULL(SUM(tersedia), 0) as total_tersedia FROM perpustakaan_buku ${bWhere}`, bParams);
    const activeBorrow = await query(`SELECT COUNT(*) as total_dipinjam FROM perpustakaan_peminjaman ${pWhere}`, pParams);
    const lateBorrow = await query(`SELECT COUNT(*) as total_terlambat FROM perpustakaan_peminjaman ${lWhere}`, lParams);
    const categories = await query(`SELECT kategori, COUNT(*) as count FROM perpustakaan_buku ${cWhere} GROUP BY kategori`, cParams);

    return {
      total_judul: totalBuku[0]?.total_judul || 0,
      total_eksemplar: totalBuku[0]?.total_eksemplar || 0,
      total_tersedia: totalBuku[0]?.total_tersedia || 0,
      total_dipinjam: activeBorrow[0]?.total_dipinjam || 0,
      total_terlambat: lateBorrow[0]?.total_terlambat || 0,
      kategori_summary: categories
    };
  }
}

module.exports = PerpustakaanModel;
