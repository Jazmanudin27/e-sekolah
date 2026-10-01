const PenilaianModel = require('../models/penilaian.model');

class PenilaianController {
  // GET /api/penilaian/kategori
  static async getKategori(req, res) {
    try {
      const data = await PenilaianModel.getKategori();
      return res.json({ success: true, data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Gagal mengambil kategori penilaian' });
    }
  }

  // GET /api/penilaian/komponen?mapel_id=1&kelas_id=2&tahun_ajaran=2026/2027&semester=1
  static async getKomponen(req, res) {
    try {
      const { mapel_id, kelas_id, tahun_ajaran, semester } = req.query;
      if (!mapel_id || !kelas_id) {
        return res.status(400).json({ success: false, message: 'mapel_id dan kelas_id wajib diisi' });
      }
      const data = await PenilaianModel.getKomponen({ mapel_id, kelas_id, tahun_ajaran, semester });
      return res.json({ success: true, data });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Gagal mengambil komponen penilaian' });
    }
  }

  // POST /api/penilaian/komponen
  static async createKomponen(req, res) {
    try {
      const { mapel_id, kelas_id, kategori_id, nama_komponen, tanggal_penilaian, tahun_ajaran, semester } = req.body;
      const guru_id = req.user?.id || null;

      if (!mapel_id || !kelas_id || !kategori_id || !nama_komponen) {
        return res.status(400).json({ success: false, message: 'Harap isi mapel, kelas, kategori, dan nama komponen nilai' });
      }

      const id = await PenilaianModel.createKomponen({
        mapel_id,
        kelas_id,
        guru_id,
        kategori_id,
        nama_komponen,
        tanggal_penilaian,
        tahun_ajaran,
        semester
      });

      return res.json({ success: true, message: 'Komponen nilai berhasil ditambahkan', data: { id } });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Gagal menambah komponen penilaian' });
    }
  }

  // DELETE /api/penilaian/komponen/:id
  static async deleteKomponen(req, res) {
    try {
      const { id } = req.params;
      await PenilaianModel.deleteKomponen(id);
      return res.json({ success: true, message: 'Komponen nilai berhasil dihapus' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Gagal menghapus komponen penilaian' });
    }
  }

  // GET /api/penilaian/matrix?mapel_id=1&kelas_id=2
  static async getMatrix(req, res) {
    try {
      const { mapel_id, kelas_id, tahun_ajaran, semester } = req.query;
      if (!mapel_id || !kelas_id) {
        return res.status(400).json({ success: false, message: 'mapel_id dan kelas_id wajib diisi' });
      }

      const matrix = await PenilaianModel.getMatrixNilai({ mapel_id, kelas_id, tahun_ajaran, semester });
      return res.json({ success: true, data: matrix });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Gagal mengambil spreadsheet matrix nilai' });
    }
  }

  // POST /api/penilaian/batch-save
  static async saveBatchNilai(req, res) {
    try {
      const { komponen_id, nilai_list } = req.body;
      if (!komponen_id || !Array.isArray(nilai_list)) {
        return res.status(400).json({ success: false, message: 'komponen_id dan nilai_list wajib diisi' });
      }

      await PenilaianModel.saveBatchNilai({ komponen_id, nilai_list });
      return res.json({ success: true, message: 'Nilai berhasil disimpan' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Gagal menyimpan batch nilai' });
    }
  }

  // GET /api/penilaian/transkrip-siswa
  static async getTranskripSiswa(req, res) {
    try {
      const siswa_id = req.user?.siswa_id || req.user?.id || req.query.siswa_id;
      const { tahun_ajaran, semester } = req.query;

      if (!siswa_id) {
        return res.status(400).json({ success: false, message: 'ID siswa tidak ditemukan' });
      }

      const transkrip = await PenilaianModel.getTranskripSiswa({ siswa_id, tahun_ajaran, semester });
      return res.json({ success: true, data: transkrip });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Gagal mengambil transkrip nilai siswa' });
    }
  }
}

module.exports = PenilaianController;
