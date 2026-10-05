const SaprasModel = require('../models/sapras.model');

class SaprasController {
  // GET /api/sapras/summary
  static async getSummary(req, res) {
    try {
      await SaprasModel.ensureTables();
      const kode_member = req.user?.kode_member || req.query?.kode_member;

      const [fasilitas, sarana, tanah] = await Promise.all([
        SaprasModel.getAllFasilitas(kode_member),
        SaprasModel.getAllSarana(kode_member),
        SaprasModel.getAllTanah(kode_member)
      ]);

      // Metrics Fasilitas
      const totalFasilitas = fasilitas.length;
      const totalUnitFasilitas = fasilitas.reduce((acc, f) => acc + (parseInt(f.jumlah, 10) || 0), 0);
      const fasilitasKondisi = {
        baik: fasilitas.filter(f => (f.keterangan || '').toUpperCase() === 'BAIK').length,
        cukupBaik: fasilitas.filter(f => (f.keterangan || '').toUpperCase() === 'CUKUP BAIK').length,
        cukup: fasilitas.filter(f => (f.keterangan || '').toUpperCase() === 'CUKUP').length,
        rusak: fasilitas.filter(f => (f.keterangan || '').toUpperCase().includes('RUSAK')).length
      };

      // Metrics Sarana
      const totalJenisSarana = sarana.length;
      const totalUnitSarana = sarana.reduce((acc, s) => acc + (parseInt(s.jumlah, 10) || 0), 0);
      const totalBaikSarana = sarana.reduce((acc, s) => acc + (parseInt(s.baik, 10) || 0), 0);
      const totalRusakSarana = sarana.reduce((acc, s) => acc + (parseInt(s.rusak, 10) || 0), 0);

      // Metrics Tanah
      const totalLuasTanah = tanah.reduce((acc, t) => acc + (parseFloat(t.luas_tanah) || 0), 0);

      res.json({
        success: true,
        data: {
          fasilitas,
          sarana,
          tanah,
          stats: {
            totalFasilitas,
            totalUnitFasilitas,
            fasilitasKondisi,
            totalJenisSarana,
            totalUnitSarana,
            totalBaikSarana,
            totalRusakSarana,
            totalLuasTanah
          }
        }
      });
    } catch (err) {
      console.error('[SaprasController.getSummary] Error:', err);
      res.status(500).json({ success: false, message: 'Gagal memuat data laporan sapras: ' + err.message });
    }
  }

  // ================= FASILITAS =================
  static async addFasilitas(req, res) {
    try {
      const { no_urut, fasilitas, jumlah, keterangan } = req.body;
      if (!fasilitas) {
        return res.status(400).json({ success: false, message: 'Nama fasilitas wajib diisi' });
      }
      const id = await SaprasModel.createFasilitas({ no_urut, fasilitas, jumlah, keterangan });
      res.json({ success: true, message: 'Fasilitas berhasil ditambahkan', data: { id } });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async updateFasilitas(req, res) {
    try {
      const { id } = req.params;
      await SaprasModel.updateFasilitas(id, req.body);
      res.json({ success: true, message: 'Fasilitas berhasil diperbarui' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async deleteFasilitas(req, res) {
    try {
      const { id } = req.params;
      await SaprasModel.deleteFasilitas(id);
      res.json({ success: true, message: 'Fasilitas berhasil dihapus' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // ================= SARANA =================
  static async addSarana(req, res) {
    try {
      const { no_urut, jenis_sapras, jumlah, baik, rusak, keterangan } = req.body;
      if (!jenis_sapras) {
        return res.status(400).json({ success: false, message: 'Jenis sarana wajib diisi' });
      }
      const id = await SaprasModel.createSarana({ no_urut, jenis_sapras, jumlah, baik, rusak, keterangan });
      res.json({ success: true, message: 'Sarana & prasarana berhasil ditambahkan', data: { id } });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async updateSarana(req, res) {
    try {
      const { id } = req.params;
      await SaprasModel.updateSarana(id, req.body);
      res.json({ success: true, message: 'Sarana & prasarana berhasil diperbarui' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async deleteSarana(req, res) {
    try {
      const { id } = req.params;
      await SaprasModel.deleteSarana(id);
      res.json({ success: true, message: 'Sarana & prasarana berhasil dihapus' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  // ================= TANAH =================
  static async addTanah(req, res) {
    try {
      const { no_urut, penggunaan_tanah, luas_tanah, satuan, keterangan } = req.body;
      if (!penggunaan_tanah) {
        return res.status(400).json({ success: false, message: 'Penggunaan tanah wajib diisi' });
      }
      const id = await SaprasModel.createTanah({ no_urut, penggunaan_tanah, luas_tanah, satuan, keterangan });
      res.json({ success: true, message: 'Penggunaan tanah berhasil ditambahkan', data: { id } });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async updateTanah(req, res) {
    try {
      const { id } = req.params;
      await SaprasModel.updateTanah(id, req.body);
      res.json({ success: true, message: 'Penggunaan tanah berhasil diperbarui' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  static async deleteTanah(req, res) {
    try {
      const { id } = req.params;
      await SaprasModel.deleteTanah(id);
      res.json({ success: true, message: 'Penggunaan tanah berhasil dihapus' });
    } catch (err) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

module.exports = SaprasController;
