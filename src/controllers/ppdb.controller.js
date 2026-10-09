const PpdbModel = require('../models/ppdb.model');
const { query } = require('../config/database');
const { sendWhatsAppMessage } = require('../utils/whatsapp.util');

class PpdbController {
  // Public Endpoint: Submit Form Pendaftaran Calon Siswa
  static async register(req, res) {
    try {
      const { nama_lengkap, no_hp_ortu } = req.body;
      if (!nama_lengkap) {
        return res.status(400).json({ success: false, message: 'Nama lengkap wajib diisi' });
      }
      if (!no_hp_ortu) {
        return res.status(400).json({ success: false, message: 'Nomor WhatsApp Ortu wajib diisi' });
      }

      const result = await PpdbModel.create(req.body);

      // 1. WhatsApp Automatic Notification
      try {
        const msg = `*PENDAFTARAN PPDB BERHASIL*\n\nSelamat! Pendaftaran calon siswa a.n *${nama_lengkap}* telah diterima.\n\n*No. Pendaftaran:* ${result.no_pendaftaran}\n*Jalur:* ${req.body.jalur_pendaftaran || 'Reguler'}\n\nSimpan nomor ini untuk melakukan cek status seleksi & pendaftaran ulang di sistem portal PPDB Sekolah.\n\nTerima kasih.`;
        sendWhatsAppMessage({ target: no_hp_ortu, message: msg }).catch(e => console.warn('WA error:', e.message));
      } catch (errWA) {}

      return res.status(201).json({
        success: true,
        message: 'Pendaftaran berhasil dikirim! Simpan Nomor Pendaftaran Anda.',
        data: {
          id: result.id,
          no_pendaftaran: result.no_pendaftaran,
          nama_lengkap
        }
      });
    } catch (e) {
      console.error('[PpdbController.register] Error:', e);
      return res.status(500).json({ success: false, message: 'Gagal mengirim pendaftaran: ' + e.message });
    }
  }

  // Public Endpoint: Cek Status Pendaftaran oleh Calon Siswa/Ortu
  static async checkStatus(req, res) {
    try {
      const { no } = req.params;
      const data = await PpdbModel.findByNoPendaftaran(no);
      if (!data) {
        return res.status(404).json({ success: false, message: 'NISN atau Nomor Pendaftaran tidak ditemukan' });
      }
      return res.json({ success: true, data });
    } catch (e) {
      return res.status(500).json({ success: false, message: e.message });
    }
  }

  // Public/Calon: Submit Form Daftar Ulang
  static async submitDaftarUlang(req, res) {
    try {
      const { 
        no_pendaftaran, ukuran_seragam, nominal_daftar_ulang, bukti_pembayaran_du,
        berkas_ijazah, berkas_kk, berkas_akta, pas_foto
      } = req.body;
      if (!no_pendaftaran) {
        return res.status(400).json({ success: false, message: 'Nomor Pendaftaran wajib disertakan' });
      }

      const calon = await PpdbModel.findByNoPendaftaran(no_pendaftaran);
      if (!calon) {
        return res.status(404).json({ success: false, message: 'Data pendaftaran tidak ditemukan' });
      }

      if (calon.status !== 'Lulus' && calon.status !== 'Daftar Ulang') {
        return res.status(400).json({ success: false, message: 'Calon siswa belum dinyatakan LULUS untuk Daftar Ulang' });
      }

      await PpdbModel.submitDaftarUlang(calon.id, {
        ukuran_seragam: ukuran_seragam || 'M',
        nominal_daftar_ulang: nominal_daftar_ulang || 0,
        status_pembayaran_du: nominal_daftar_ulang > 0 ? 'Cicilan' : 'Belum',
        bukti_pembayaran_du: bukti_pembayaran_du || null,
        berkas_ijazah: berkas_ijazah || null,
        berkas_kk: berkas_kk || null,
        berkas_akta: berkas_akta || null,
        pas_foto: pas_foto || null
      });

      // WA Notification Daftar Ulang
      try {
        if (calon.no_hp_ortu) {
          const msg = `*KONFIRMASI DAFTAR ULANG PPDB*\n\nTerima kasih, data Daftar Ulang untuk *${calon.nama_lengkap}* (${calon.no_pendaftaran}) telah berhasil dikirim.\nUkuran Seragam: ${ukuran_seragam || 'M'}\nNominal Bayar: Rp ${Number(nominal_daftar_ulang || 0).toLocaleString('id-ID')}\n\nTim Administrasi Sekolah akan melakukan verifikasi berkas & pembayaran.`;
          sendWhatsAppMessage({ target: calon.no_hp_ortu, message: msg }).catch(e => console.warn('WA error:', e.message));
        }
      } catch (errWA) {}

      return res.json({
        success: true,
        message: 'Daftar Ulang berhasil dikirim! Menunggu konfirmasi verifikasi panitia/keuangan.'
      });
    } catch (e) {
      console.error('[PpdbController.submitDaftarUlang] Error:', e);
      return res.status(500).json({ success: false, message: e.message });
    }
  }

  // Admin: Update Jadwal Tes & Nilai Ujian Masuk
  static async updateTesNilai(req, res) {
    try {
      const { id } = req.params;
      await PpdbModel.updateTesNilai(id, req.body);

      // Optional WA Alert for Test Schedule
      const calon = await PpdbModel.findById(id);
      if (calon && calon.no_hp_ortu && req.body.jadwal_tes) {
        try {
          const msg = `*JADWAL TES SELEKSI PPDB*\n\nKepada yth. Ortu/Wali dari *${calon.nama_lengkap}* (${calon.no_pendaftaran}):\n\nJadwal Tes: ${new Date(req.body.jadwal_tes).toLocaleString('id-ID')}\nLokasi: ${req.body.lokasi_tes || 'Gedung Utama Sekolah'}\n\nHarap hadir 15 menit sebelum tes dimulai. Terima kasih.`;
          sendWhatsAppMessage({ target: calon.no_hp_ortu, message: msg }).catch(e => {});
        } catch (e) {}
      }

      return res.json({ success: true, message: 'Jadwal tes & nilai ujian berhasil disimpan!' });
    } catch (e) {
      return res.status(500).json({ success: false, message: e.message });
    }
  }

  // Admin: Update Status Pembayaran Daftar Ulang
  static async updatePembayaranDU(req, res) {
    try {
      const { id } = req.params;
      const { status_pembayaran_du, nominal_daftar_ulang, catatan } = req.body;
      await PpdbModel.updatePembayaranDU(id, status_pembayaran_du, nominal_daftar_ulang, catatan || '');
      return res.json({ success: true, message: 'Status pembayaran Daftar Ulang berhasil diperbarui' });
    } catch (e) {
      return res.status(500).json({ success: false, message: e.message });
    }
  }

  // Admin: Get All Pendaftaran
  static async getAll(req, res) {
    try {
      const { search, status } = req.query;
      const data = await PpdbModel.findAll(search, status);
      return res.json({ success: true, data });
    } catch (e) {
      return res.status(500).json({ success: false, message: e.message });
    }
  }

  // Admin: Get Statistik & Laporan PPDB
  static async getStatistik(req, res) {
    try {
      const data = await PpdbModel.getStatistik();
      return res.json({ success: true, data });
    } catch (e) {
      return res.status(500).json({ success: false, message: e.message });
    }
  }

  // Admin/Public: Get Detail
  static async getById(req, res) {
    try {
      const data = await PpdbModel.findById(req.params.id);
      if (!data) {
        return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
      }
      return res.json({ success: true, data });
    } catch (e) {
      return res.status(500).json({ success: false, message: e.message });
    }
  }

  // Admin: Update Status Pendaftaran (with WA Notification)
  static async updateStatus(req, res) {
    try {
      const { status, catatan } = req.body;
      const { id } = req.params;
      await PpdbModel.updateStatus(id, status, catatan || '');

      const calon = await PpdbModel.findById(id);
      if (calon && calon.no_hp_ortu) {
        try {
          const statusText = status === 'Lulus' ? 'LULUS SELEKSI' : status === 'Ditolak' ? 'TIDAK LULUS' : status;
          const msg = `*PENGUMUMAN SELEKSI PPDB*\n\nHasil seleksi calon siswa a.n *${calon.nama_lengkap}* (${calon.no_pendaftaran}):\nSTATUS: *${statusText}*\nCatatan: ${catatan || '-'}\n\n` +
            (status === 'Lulus' ? 'Silakan melakukan Pendaftaran Ulang di portal website E-Sekolah. Terima kasih!' : 'Terima kasih telah berpartisipasi.');
          sendWhatsAppMessage({ target: calon.no_hp_ortu, message: msg }).catch(e => console.warn('WA error:', e.message));
        } catch (errWA) {}
      }

      return res.json({ success: true, message: `Status berhasil diubah menjadi ${status}` });
    } catch (e) {
      return res.status(500).json({ success: false, message: e.message });
    }
  }

  // Admin: Transfer Calon Siswa Lulus/Daftar Ulang ke Master Tabel Siswa
  static async transferToSiswa(req, res) {
    try {
      const { id } = req.params;
      const { kode_kelas } = req.body;
      const calon = await PpdbModel.findById(id);

      if (!calon) {
        return res.status(404).json({ success: false, message: 'Data pendaftaran tidak ditemukan' });
      }

      const kode_siswa = calon.nisn || calon.no_pendaftaran.replace(/[^0-9]/g, '');
      const sqlCheck = 'SELECT kode_siswa FROM siswa WHERE kode_siswa = ? OR nama_siswa = ? LIMIT 1';
      const existing = await query(sqlCheck, [kode_siswa, calon.nama_lengkap]);

      if (existing && existing.length > 0) {
        return res.status(400).json({ success: false, message: 'Siswa sudah ada dalam Master Siswa!' });
      }

      const sqlInsert = `
        INSERT INTO siswa (
          kode_siswa, nama_siswa, nis_nisn, jenis_kelamin, tempat_lahir,
          tanggal_lahir, alamat, no_hp, nama_ortu, kode_kelas, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Aktif')
      `;

      await query(sqlInsert, [
        kode_siswa,
        calon.nama_lengkap,
        calon.nisn || calon.no_pendaftaran,
        calon.jenis_kelamin || 'L',
        calon.tempat_lahir || '-',
        calon.tanggal_lahir || null,
        calon.alamat || '-',
        calon.no_hp_ortu || '-',
        calon.nama_ayah || calon.nama_ibu || '-',
        kode_kelas || null
      ]);

      await PpdbModel.updateStatus(id, 'Diterima', 'Telah resmi diterima & ditransfer ke Master Siswa');

      return res.json({
        success: true,
        message: `Berhasil mentransfer ${calon.nama_lengkap} ke Master Siswa!`
      });
    } catch (e) {
      console.error('[PpdbController.transferToSiswa] Error:', e);
      return res.status(500).json({ success: false, message: 'Gagal mentransfer: ' + e.message });
    }
  }

  // Admin/Public: Get Schedule Settings
  static async getJadwal(req, res) {
    try {
      const data = await PpdbModel.getJadwal();
      let sekolah = null;
      try {
        const SekolahModel = require('../models/sekolah.model');
        const s = await SekolahModel.get();
        if (s) {
          sekolah = {
            nama_sekolah: s.nama_sekolah,
            npsn: s.npsn,
            alamat: s.alamat,
            kota: s.kota,
            no_hp: s.no_hp,
            email: s.email
          };
        }
      } catch (errSekolah) {}

      return res.json({ success: true, data: { ...data, sekolah } });
    } catch (e) {
      return res.status(500).json({ success: false, message: e.message });
    }
  }

  // Admin: Save Schedule Settings
  static async saveJadwal(req, res) {
    try {
      await PpdbModel.saveJadwal(req.body);
      return res.json({ success: true, message: 'Setting jadwal PPDB berhasil disimpan' });
    } catch (e) {
      return res.status(500).json({ success: false, message: e.message });
    }
  }

  // Admin: Delete Pendaftaran
  static async delete(idReq, res) {
    try {
      const { id } = idReq.params;
      await PpdbModel.delete(id);
      return res.json({ success: true, message: 'Data pendaftaran berhasil dihapus' });
    } catch (e) {
      return res.status(500).json({ success: false, message: e.message });
    }
  }
}

module.exports = PpdbController;
