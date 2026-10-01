const { query } = require('../config/database');

class SaprasModel {
  /**
   * Ensure tables exist and seed initial data if empty
   */
  static async ensureTables() {
    try {
      // 1. Table Fasilitas Ruangan / Gedung
      await query(`
        CREATE TABLE IF NOT EXISTS sapras_fasilitas (
          id INT AUTO_INCREMENT PRIMARY KEY,
          no_urut INT NOT NULL,
          fasilitas VARCHAR(200) NOT NULL,
          jumlah INT NOT NULL DEFAULT 1,
          keterangan VARCHAR(100) NOT NULL DEFAULT 'BAIK',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      // 2. Table Sarana & Prasarana
      await query(`
        CREATE TABLE IF NOT EXISTS sapras_sarana (
          id INT AUTO_INCREMENT PRIMARY KEY,
          no_urut INT NOT NULL,
          jenis_sapras VARCHAR(255) NOT NULL,
          jumlah INT NOT NULL DEFAULT 1,
          baik INT NOT NULL DEFAULT 0,
          rusak INT NOT NULL DEFAULT 0,
          keterangan VARCHAR(150) DEFAULT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      // 3. Table Penggunaan Tanah
      await query(`
        CREATE TABLE IF NOT EXISTS sapras_tanah (
          id INT AUTO_INCREMENT PRIMARY KEY,
          no_urut INT NOT NULL,
          penggunaan_tanah VARCHAR(200) NOT NULL,
          luas_tanah DECIMAL(10,2) NOT NULL,
          satuan VARCHAR(20) DEFAULT 'M2',
          keterangan VARCHAR(150) DEFAULT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
      `);

      // Seed Fasilitas jika kosong
      const countFasilitas = await query('SELECT COUNT(*) as cnt FROM sapras_fasilitas');
      if (countFasilitas && countFasilitas[0]?.cnt === 0) {
        const seedFasilitas = [
          [1, 'GRASI', 1, 'BAIK'],
          [2, 'MESJID', 1, 'BAIK'],
          [3, 'RUAMG KBM', 12, 'CUKUP BAIK'],
          [4, 'RUANG AULA', 1, 'BAIK'],
          [5, 'RUANG BK / BKK', 1, 'BAIK'],
          [6, 'RUANG COFI BREAK AULA', 1, 'BAIK'],
          [7, 'RUANG GURU', 1, 'BAIK'],
          [8, 'RUANG KEPSEK', 1, 'BAIK'],
          [9, 'RUANG LAB', 5, 'CUKUP BAIK'],
          [10, 'RUANG LOBBY MANAJEMEN', 1, 'BAIK'],
          [11, 'RUANG OPS', 1, 'BAIK'],
          [12, 'RUANG OSIA', 1, 'BAIK'],
          [13, 'RUANG PERPUSTAKAAN', 1, 'CUKUP BAIK'],
          [14, 'RUANG PIKET GURU', 1, 'BAIK'],
          [15, 'RUANG PRAMUKA', 1, 'CUKUP BAIK'],
          [16, 'RUANG SECURITY', 1, 'CUKUP'],
          [17, 'RUANG TEACHING FACTORY', 1, 'BAIK'],
          [18, 'RUANG TU', 1, 'BAIK'],
          [19, 'RUANG TUNGGU TAMU', 1, 'CUKUP BAIK'],
          [20, 'RUANG UKS', 1, 'CUKUP BAIK'],
          [21, 'RUANG WAKA & KAPROG', 1, 'BAIK'],
          [22, 'WC AULA', 1, 'CUKUP BAIK'],
          [23, 'WC GURU', 1, 'CUKUP BAIK'],
          [24, 'WC SISWA', 4, 'CUKUP BAIK'],
          [25, 'WC TU', 1, 'CUKUP BAIK']
        ];

        for (const f of seedFasilitas) {
          await query(
            'INSERT INTO sapras_fasilitas (no_urut, fasilitas, jumlah, keterangan) VALUES (?, ?, ?, ?)',
            f
          );
        }
        console.log('[SaprasModel] Seeded 25 fasilitas');
      }

      // Seed Sarana & Prasarana jika kosong
      const countSarana = await query('SELECT COUNT(*) as cnt FROM sapras_sarana');
      if (countSarana && countSarana[0]?.cnt === 0) {
        const seedSarana = [
          [1, 'AC PENDINGIN RUANGAN', 3, 3, 0],
          [2, 'ALAT PERAGA PAI', 1, 1, 0],
          [3, 'BOLA BASKET', 4, 4, 0],
          [4, 'BOLA SEPAK & TAKRAW', 4, 4, 0],
          [5, 'BOLA VOLI', 2, 2, 0],
          [6, 'CAS REGISTER', 1, 1, 0],
          [7, 'KENDARAAN OPERASIONAL (MOBIL)', 1, 1, 0],
          [8, 'KENDARAAN OPERASIONAL (MOTOR)', 2, 2, 0],
          [9, 'KOMPUTER ( DI LUAR YANG ADA DI LAB)', 2, 2, 0],
          [10, 'KOTAK OBAT (P3K)', 1, 1, 0],
          [11, 'KURSI GURU & PEGAWAI', 40, 40, 0],
          [12, 'KURSI GURU DI RUANG KELAS', 12, 12, 0],
          [13, 'KURSI SISWA', 259, 259, 0],
          [14, 'LAPANG BASKET', 1, 1, 0],
          [15, 'LAPTOP & KOMPUTER', 18, 18, 0],
          [16, 'LAPTOP (DI LUAR YANG ADA DI LAB)', 2, 2, 0],
          [17, 'LAYAR SCREEN', 1, 1, 0],
          [18, 'LEMARI ARSIP', 5, 5, 0],
          [19, 'LOKER GURU', 3, 3, 0],
          [20, 'MEJA GURU & PEGAWAI', 40, 40, 0],
          [21, 'MEJA GURU DI RUANG KELAS', 12, 12, 0],
          [22, 'MEJA SISWA', 25, 25, 0],
          [23, 'MEJA TENIS MEJA', 1, 1, 0],
          [24, 'MESIN FOTO CHOPI', 1, 1, 0],
          [25, 'MESIN SCANER', 1, 1, 0],
          [26, 'PENGERAS SUARA', 4, 4, 0],
          [27, 'PRINTER', 4, 4, 0],
          [28, 'PROYEKTOR', 1, 1, 0],
          [29, 'TELEVISI', 1, 1, 0],
          [30, 'WAIT BOARD', 15, 15, 0],
          [31, 'WASTAFEL ( CUCI TANGAN)', 6, 6, 0]
        ];

        for (const s of seedSarana) {
          await query(
            'INSERT INTO sapras_sarana (no_urut, jenis_sapras, jumlah, baik, rusak) VALUES (?, ?, ?, ?, ?)',
            s
          );
        }
        console.log('[SaprasModel] Seeded 31 sarana');
      }

      // Seed Penggunaan Tanah jika kosong
      const countTanah = await query('SELECT COUNT(*) as cnt FROM sapras_tanah');
      if (countTanah && countTanah[0]?.cnt === 0) {
        const seedTanah = [
          [1, 'BANGUNAN', 702.00, 'M2'],
          [2, 'HALAMAN', 30.00, 'M2'],
          [3, 'LAPANGAN OLAHRAGA', 300.00, 'M2']
        ];

        for (const t of seedTanah) {
          await query(
            'INSERT INTO sapras_tanah (no_urut, penggunaan_tanah, luas_tanah, satuan) VALUES (?, ?, ?, ?)',
            t
          );
        }
        console.log('[SaprasModel] Seeded 3 data tanah');
      }
    } catch (err) {
      console.error('[SaprasModel.ensureTables] Error:', err.message);
    }
  }

  // ==========================================
  // FASILITAS METHODS
  // ==========================================
  static async getAllFasilitas() {
    return await query('SELECT * FROM sapras_fasilitas ORDER BY no_urut ASC, id ASC');
  }

  static async createFasilitas(data) {
    const { no_urut, fasilitas, jumlah, keterangan } = data;
    const result = await query(
      'INSERT INTO sapras_fasilitas (no_urut, fasilitas, jumlah, keterangan) VALUES (?, ?, ?, ?)',
      [no_urut || 99, fasilitas, jumlah || 1, keterangan || 'BAIK']
    );
    return result.insertId;
  }

  static async updateFasilitas(id, data) {
    const { no_urut, fasilitas, jumlah, keterangan } = data;
    await query(
      'UPDATE sapras_fasilitas SET no_urut = ?, fasilitas = ?, jumlah = ?, keterangan = ? WHERE id = ?',
      [no_urut, fasilitas, jumlah, keterangan, id]
    );
    return true;
  }

  static async deleteFasilitas(id) {
    await query('DELETE FROM sapras_fasilitas WHERE id = ?', [id]);
    return true;
  }

  // ==========================================
  // SARANA PRASARANA METHODS
  // ==========================================
  static async getAllSarana() {
    return await query('SELECT * FROM sapras_sarana ORDER BY no_urut ASC, id ASC');
  }

  static async createSarana(data) {
    const { no_urut, jenis_sapras, jumlah, baik, rusak, keterangan } = data;
    const result = await query(
      'INSERT INTO sapras_sarana (no_urut, jenis_sapras, jumlah, baik, rusak, keterangan) VALUES (?, ?, ?, ?, ?, ?)',
      [no_urut || 99, jenis_sapras, jumlah || 1, baik !== undefined ? baik : (jumlah || 1), rusak || 0, keterangan || null]
    );
    return result.insertId;
  }

  static async updateSarana(id, data) {
    const { no_urut, jenis_sapras, jumlah, baik, rusak, keterangan } = data;
    await query(
      'UPDATE sapras_sarana SET no_urut = ?, jenis_sapras = ?, jumlah = ?, baik = ?, rusak = ?, keterangan = ? WHERE id = ?',
      [no_urut, jenis_sapras, jumlah, baik, rusak, keterangan, id]
    );
    return true;
  }

  static async deleteSarana(id) {
    await query('DELETE FROM sapras_sarana WHERE id = ?', [id]);
    return true;
  }

  // ==========================================
  // PENGGUNAAN TANAH METHODS
  // ==========================================
  static async getAllTanah() {
    return await query('SELECT * FROM sapras_tanah ORDER BY no_urut ASC, id ASC');
  }

  static async createTanah(data) {
    const { no_urut, penggunaan_tanah, luas_tanah, satuan, keterangan } = data;
    const result = await query(
      'INSERT INTO sapras_tanah (no_urut, penggunaan_tanah, luas_tanah, satuan, keterangan) VALUES (?, ?, ?, ?, ?)',
      [no_urut || 99, penggunaan_tanah, luas_tanah || 0, satuan || 'M2', keterangan || null]
    );
    return result.insertId;
  }

  static async updateTanah(id, data) {
    const { no_urut, penggunaan_tanah, luas_tanah, satuan, keterangan } = data;
    await query(
      'UPDATE sapras_tanah SET no_urut = ?, penggunaan_tanah = ?, luas_tanah = ?, satuan = ?, keterangan = ? WHERE id = ?',
      [no_urut, penggunaan_tanah, luas_tanah, satuan || 'M2', keterangan, id]
    );
    return true;
  }

  static async deleteTanah(id) {
    await query('DELETE FROM sapras_tanah WHERE id = ?', [id]);
    return true;
  }
}

module.exports = SaprasModel;
