const PerpustakaanModel = require('../models/perpustakaan.model');

class PerpustakaanController {
  // ============ BUKU ============
  static async getAllBuku(req, res) {
    try {
      const { search, kategori, lokasi_rak } = req.query;
      const data = await PerpustakaanModel.getAllBuku({ search, kategori, lokasi_rak });
      res.json({ success: true, data });
    } catch (error) {
      console.error('Error getAllBuku:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getBukuById(req, res) {
    try {
      const { id } = req.params;
      const data = await PerpustakaanModel.getBukuById(id);
      if (!data) {
        return res.status(404).json({ success: false, message: 'Buku tidak ditemukan' });
      }
      res.json({ success: true, data });
    } catch (error) {
      console.error('Error getBukuById:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async createBuku(req, res) {
    try {
      const { judul, pengarang } = req.body;
      if (!judul || !pengarang) {
        return res.status(400).json({ success: false, message: 'Judul dan pengarang wajib diisi' });
      }
      const insertId = await PerpustakaanModel.createBuku(req.body);
      res.status(201).json({ success: true, message: 'Buku berhasil ditambahkan', insertId });
    } catch (error) {
      console.error('Error createBuku:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async updateBuku(req, res) {
    try {
      const { id } = req.params;
      await PerpustakaanModel.updateBuku(id, req.body);
      res.json({ success: true, message: 'Data buku berhasil diperbarui' });
    } catch (error) {
      console.error('Error updateBuku:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async deleteBuku(req, res) {
    try {
      const { id } = req.params;
      await PerpustakaanModel.deleteBuku(id);
      res.json({ success: true, message: 'Buku berhasil dihapus' });
    } catch (error) {
      console.error('Error deleteBuku:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // ============ PEMINJAMAN ============
  static async getAllPeminjaman(req, res) {
    try {
      const { search, status, peminjam_type, date_from, date_to } = req.query;
      const data = await PerpustakaanModel.getAllPeminjaman({ search, status, peminjam_type, date_from, date_to });
      res.json({ success: true, data });
    } catch (error) {
      console.error('Error getAllPeminjaman:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async createPeminjaman(req, res) {
    try {
      const { buku_id, peminjam_id, nama_peminjam, tgl_pinjam, tgl_tenggat } = req.body;
      if (!buku_id || !peminjam_id || !nama_peminjam || !tgl_pinjam || !tgl_tenggat) {
        return res.status(400).json({ success: false, message: 'Mohon lengkapi semua field peminjaman' });
      }
      const insertId = await PerpustakaanModel.createPeminjaman(req.body);
      res.status(201).json({ success: true, message: 'Transaksi peminjaman berhasil dicatat', insertId });
    } catch (error) {
      console.error('Error createPeminjaman:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async kembalikanBuku(req, res) {
    try {
      const { id } = req.params;
      await PerpustakaanModel.kembalikanBuku(id, req.body || {});
      res.json({ success: true, message: 'Buku berhasil dikembalikan' });
    } catch (error) {
      console.error('Error kembalikanBuku:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  static async deletePeminjaman(req, res) {
    try {
      const { id } = req.params;
      await PerpustakaanModel.deletePeminjaman(id);
      res.json({ success: true, message: 'Data peminjaman berhasil dihapus' });
    } catch (error) {
      console.error('Error deletePeminjaman:', error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // ============ STATISTIK ============
  static async getStats(req, res) {
    try {
      const data = await PerpustakaanModel.getStats();
      res.json({ success: true, data });
    } catch (error) {
      console.error('Error getStats:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = PerpustakaanController;
