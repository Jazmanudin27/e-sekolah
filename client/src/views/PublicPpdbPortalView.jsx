import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { 
  UserPlus, Search, CheckCircle, Clock, FileText, 
  Send, User, Phone, MapPin, School, BookOpen, CheckSquare, Printer, FileUp, Award, LogIn, ShieldCheck, Calendar
} from 'lucide-react';
import api from '../api/client';

export default function PublicPpdbPortalView({ onLoginClick }) {
  const [tab, setTab] = useState('daftar'); // 'daftar' | 'daftar_ulang' | 'status'
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSchedule();
  }, []);

  const isScheduleActive = (openFlag, startStr, endStr) => {
    if (openFlag === 0 || openFlag === false) return false;
    const now = new Date();
    if (startStr) {
      const startDate = new Date(startStr);
      if (!isNaN(startDate.getTime()) && now < startDate) return false;
    }
    if (endStr) {
      const endDate = new Date(endStr);
      if (!isNaN(endDate.getTime()) && now > endDate) return false;
    }
    return true;
  };

  const fetchSchedule = async () => {
    try {
      const res = await api.get('/ppdb/jadwal');
      if (res.data.success && res.data.data) {
        const s = res.data.data;
        setSchedule(s);

        const openDaftar = isScheduleActive(s.is_pendaftaran_open, s.pendaftaran_buka, s.pendaftaran_tutup);
        const openDU = isScheduleActive(s.is_daftar_ulang_open, s.daftar_ulang_buka, s.daftar_ulang_tutup);
        const openPengumuman = isScheduleActive(s.is_pengumuman_open, s.pengumuman_buka, s.pengumuman_tutup);

        if (openDaftar) setTab('daftar');
        else if (openPengumuman) setTab('status');
        else if (openDU) setTab('daftar_ulang');
        else setTab('closed');
      }
    } catch (e) {
      console.error('Failed fetching schedule:', e);
    }
  };

  // Form State Pendaftaran Baru
  const [formData, setFormData] = useState({
    nama_lengkap: '',
    nik: '',
    nisn: '',
    jenis_kelamin: 'L',
    tempat_lahir: '',
    tanggal_lahir: '',
    agama: 'Islam',
    alamat: '',
    sekolah_asal: '',
    tahun_lulus: new Date().getFullYear().toString(),
    jalur_pendaftaran: 'Reguler',
    pilihan_jurusan: 'Umum',
    nama_ayah: '',
    pekerjaan_ayah: '',
    nama_ibu: '',
    pekerjaan_ibu: '',
    no_hp_ortu: '',
    email_ortu: '',
    penghasilan_ortu: '',
    berkas_ijazah: '',
    berkas_kk: '',
    berkas_akta: '',
    pas_foto: ''
  });

  // Form State Daftar Ulang
  const [duForm, setDuForm] = useState({
    no_pendaftaran: '',
    ukuran_seragam: 'M',
    nominal_daftar_ulang: '',
    bukti_pembayaran_du: ''
  });

  // Cek Status State
  const [searchNo, setSearchNo] = useState('');
  const [statusResult, setStatusResult] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDuChange = (e) => {
    const { name, value } = e.target;
    setDuForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitRegister = async (e) => {
    e.preventDefault();
    const requiredFields = [
      { key: 'nama_lengkap', label: 'Nama Lengkap Siswa' },
      { key: 'nik', label: 'NIK' },
      { key: 'nisn', label: 'NISN' },
      { key: 'tempat_lahir', label: 'Tempat Lahir' },
      { key: 'tanggal_lahir', label: 'Tanggal Lahir' },
      { key: 'agama', label: 'Agama' },
      { key: 'alamat', label: 'Alamat Tempat Tinggal' },
      { key: 'sekolah_asal', label: 'Sekolah Asal' },
      { key: 'nama_ayah', label: 'Nama Ayah' },
      { key: 'nama_ibu', label: 'Nama Ibu' },
      { key: 'no_hp_ortu', label: 'Nomor WhatsApp Ortu' }
    ];

    const missing = requiredFields.filter(f => !formData[f.key] || !String(formData[f.key]).trim());
    if (missing.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Form Belum Lengkap',
        text: `Mohon lengkapi data wajib berikut: ${missing.map(m => m.label).join(', ')}`,
        confirmButtonColor: '#0066ff'
      });
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/ppdb/register', formData);
      if (res.data.success) {
        const noPendaftaran = res.data.data.no_pendaftaran;
        Swal.fire({
          icon: 'success',
          title: 'Pendaftaran Berhasil!',
          html: `Nomor Pendaftaran Anda: <b style="font-size:1.3rem;color:#0066ff">${noPendaftaran}</b><br/><br/>Notifikasi konfirmasi & nomor registrasi telah terkirim via WhatsApp. Simpan nomor ini untuk pengecekan kelulusan.`,
          confirmButtonText: 'Tutup'
        });
        setFormData({
          nama_lengkap: '', nik: '', nisn: '', jenis_kelamin: 'L',
          tempat_lahir: '', tanggal_lahir: '', agama: 'Islam', alamat: '',
          sekolah_asal: '', tahun_lulus: new Date().getFullYear().toString(),
          jalur_pendaftaran: 'Reguler', pilihan_jurusan: 'Umum',
          nama_ayah: '', pekerjaan_ayah: '', nama_ibu: '', pekerjaan_ibu: '',
          no_hp_ortu: '', email_ortu: '', penghasilan_ortu: '',
          berkas_ijazah: '', berkas_kk: '', berkas_akta: '', pas_foto: ''
        });
      }
    } catch (err) {
      Swal.fire('Gagal Pendaftaran', err.response?.data?.message || 'Terjadi kesalahan sistem', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDaftarUlang = async (e) => {
    e.preventDefault();
    if (!duForm.no_pendaftaran) {
      Swal.fire('Peringatan', 'Nomor Pendaftaran wajib diisi!', 'warning');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/ppdb/daftar-ulang', duForm);
      if (res.data.success) {
        Swal.fire('Daftar Ulang Dikirim!', res.data.message, 'success');
        setDuForm({
          no_pendaftaran: '',
          ukuran_seragam: 'M',
          nominal_daftar_ulang: '',
          bukti_pembayaran_du: ''
        });
        setTab('status');
      }
    } catch (err) {
      Swal.fire('Gagal Daftar Ulang', err.response?.data?.message || 'Terjadi kesalahan', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async (e) => {
    e.preventDefault();
    if (!searchNo) return;
    setLoading(true);
    setStatusResult(null);
    try {
      const res = await api.get(`/ppdb/check/${searchNo.trim()}`);
      if (res.data.success) {
        setStatusResult(res.data.data);
      }
    } catch (err) {
      Swal.fire('Tidak Ditemukan', 'Nomor Pendaftaran tidak terdaftar.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintKartu = (data) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Kartu Peserta PPDB - ${data.nama_lengkap}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
            .card { border: 2px solid #0066ff; border-radius: 12px; padding: 20px; max-width: 500px; margin: 0 auto; background: #fff; }
            .header { text-align: center; border-bottom: 2px solid #0066ff; padding-bottom: 10px; margin-bottom: 15px; }
            .header h2 { margin: 0; color: #0066ff; }
            .header p { margin: 4px 0 0 0; font-size: 13px; color: #666; }
            .info { font-size: 14px; line-height: 1.6; }
            .info tr td { padding: 4px 8px; }
            .qr { text-align: center; margin-top: 15px; padding-top: 10px; border-top: 1px dashed #ccc; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <h2>KARTU PESERTA PPDB 2026/2027</h2>
              <p>PORTAL PENDAFTARAN SISWA BARU</p>
            </div>
            <table class="info" width="100%">
              <tr><td><b>No. Pendaftaran:</b></td><td>${data.no_pendaftaran}</td></tr>
              <tr><td><b>Nama Lengkap:</b></td><td>${data.nama_lengkap}</td></tr>
              <tr><td><b>NISN / NIK:</b></td><td>${data.nisn || '-'} / ${data.nik || '-'}</td></tr>
              <tr><td><b>Jalur Seleksi:</b></td><td>${data.jalur_pendaftaran}</td></tr>
              <tr><td><b>Sekolah Asal:</b></td><td>${data.sekolah_asal || '-'}</td></tr>
              <tr><td><b>Jadwal Ujian:</b></td><td>${data.jadwal_tes ? new Date(data.jadwal_tes).toLocaleString('id-ID') : 'Menunggu Jadwal'}</td></tr>
            </table>
            <div class="qr">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(data.no_pendaftaran)}" alt="QR Code" />
              <p style="font-size:12px;margin-top:6px;">Tunjukkan kartu ini saat verifikasi berkas & tes ujian.</p>
            </div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'Diterima':
        return <span style={{ background: '#d1fae5', color: '#059669', padding: '6px 14px', borderRadius: 10, fontWeight: 800, fontSize: 13 }}>Resmi Diterima</span>;
      case 'Daftar Ulang':
        return <span style={{ background: '#e0f2fe', color: '#0284c7', padding: '6px 14px', borderRadius: 10, fontWeight: 800, fontSize: 13 }}>Daftar Ulang</span>;
      case 'Lulus':
        return <span style={{ background: '#dcfce7', color: '#166534', padding: '6px 14px', borderRadius: 10, fontWeight: 800, fontSize: 13 }}>Lulus Seleksi</span>;
      case 'Ditolak':
        return <span style={{ background: '#fee2e2', color: '#991b1b', padding: '6px 14px', borderRadius: 10, fontWeight: 800, fontSize: 13 }}>Tidak Lulus</span>;
      case 'Verifikasi':
        return <span style={{ background: '#e0f2fe', color: '#075985', padding: '6px 14px', borderRadius: 10, fontWeight: 800, fontSize: 13 }}>Verifikasi Berkas</span>;
      default:
        return <span style={{ background: '#fef3c7', color: '#92400e', padding: '6px 14px', borderRadius: 10, fontWeight: 800, fontSize: 13 }}>Menunggu</span>;
    }
  };

  // Determine open status for each tab
  const canDaftar = !schedule || isScheduleActive(schedule.is_pendaftaran_open, schedule.pendaftaran_buka, schedule.pendaftaran_tutup);
  const canDU = !schedule || isScheduleActive(schedule.is_daftar_ulang_open, schedule.daftar_ulang_buka, schedule.daftar_ulang_tutup);
  const canPengumuman = !schedule || isScheduleActive(schedule.is_pengumuman_open, schedule.pengumuman_buka, schedule.pengumuman_tutup);

  const activeCount = [canDaftar, canDU, canPengumuman].filter(Boolean).length;

  return (
    <div style={{ minHeight: '100vh', background: '#eef2f6', color: '#0f172a', fontFamily: 'Inter, system-ui, -apple-system, sans-serif', paddingBottom: 40 }}>
      <style>{`
        .ppdb-wrapper {
          max-width: 1060px;
          margin: 24px auto;
          padding: 0 16px;
        }
        .ppdb-hero-box {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: #ffffff;
          border-radius: 20px;
          padding: 32px 24px;
          margin-bottom: 24px;
          box-shadow: 0 12px 30px rgba(15,23,42,0.15);
          position: relative;
          overflow: hidden;
        }
        .ppdb-card {
          background: #ffffff;
          border-radius: 20px;
          border: 1px solid #cbd5e1;
          box-shadow: 0 12px 32px rgba(15,23,42,0.08);
          overflow: hidden;
          margin-bottom: 32px;
        }
        .ppdb-card-body {
          padding: 28px 32px;
        }
        .ppdb-section-card {
          background: #f8fafc;
          padding: 22px;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          border-left: 4px solid #0066ff;
          margin-bottom: 24px;
        }
        .ppdb-grid-2 {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        .ppdb-grid-full {
          grid-column: span 2;
        }
        .ppdb-input-field {
          width: 100%;
          padding: 12px 14px;
          border-radius: 10px;
          border: 1px solid #cbd5e1;
          font-size: 13px;
          background: #ffffff;
          color: #0f172a;
          box-sizing: border-box;
          transition: all 0.2s ease;
        }
        .ppdb-input-field:focus {
          outline: none;
          border-color: #0066ff;
          box-shadow: 0 0 0 3px rgba(0,102,255,0.15);
        }
        @media (max-width: 640px) {
          .ppdb-wrapper {
            margin: 12px auto;
            padding: 0 12px;
          }
          .ppdb-hero-box {
            padding: 20px 16px;
            border-radius: 16px;
          }
          .ppdb-card-body {
            padding: 16px;
          }
          .ppdb-section-card {
            padding: 16px 12px;
            border-radius: 12px;
            margin-bottom: 16px;
          }
          .ppdb-grid-2 {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .ppdb-grid-full {
            grid-column: span 1;
          }
        }
      `}</style>

      {/* HERO BANNER */}
      <div className="ppdb-wrapper">
        <div className="ppdb-hero-box">
          <div style={{ position: 'relative', zIndex: 1 }}>
            <span style={{ background: 'rgba(59,130,246,0.2)', color: '#60a5fa', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 800, letterSpacing: '0.5px' }}>
              REKREASI AKADEMIK 2026/2027
            </span>
            <h1 style={{ margin: '12px 0 6px 0', fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px' }}>
              Selamat Datang Calon Siswa & Wali Murid
            </h1>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: 13, maxWidth: 600 }}>
              Silakan mendaftar secara online, melakukan konfirmasi pendaftaran ulang, atau memeriksa status hasil seleksi ujian masuk secara langsung.
            </p>
          </div>
        </div>

        {/* TAB CLOSED VIEW */}
        {tab === 'closed' && (
          <div style={{ background: '#ffffff', padding: 40, borderRadius: 20, textAlign: 'center', border: '1px solid #cbd5e1', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <Calendar size={48} color="#94a3b8" style={{ marginBottom: 16 }} />
            <h3 style={{ margin: '0 0 8px 0', fontSize: 20, fontWeight: 800, color: '#0f172a' }}>Pendaftaran PPDB Belum Dibuka / Telah Ditutup</h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>
              Silakan hubungi panitia sekolah atau cek jadwal resmi pendaftaran secara berkala.
            </p>
          </div>
        )}

        {/* TAB CONTENT 1: FORM PENDAFTARAN (PREMIUM & STUNNING DESIGN) */}
        {tab === 'daftar' && (
          <form onSubmit={handleSubmitRegister} className="ppdb-card">
            {/* GRADIENT ACCENT BAR */}
            <div style={{ height: 6, background: 'linear-gradient(90deg, #0066ff 0%, #00c6ff 50%, #6366f1 100%)' }} />

            <div className="ppdb-card-body">
              {/* FORM HEADER TITLE */}
              <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px' }}>
                    Formulir Pendaftaran Siswa Baru (PPDB)
                  </h2>
                  <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: 13 }}>
                    Lengkapi seluruh data calon siswa & orang tua secara teliti dan tepat.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '6px 14px', borderRadius: 20, fontSize: 12, color: '#15803d', fontWeight: 700 }}>
                  <ShieldCheck size={16} /> Data Terenkripsi & Aman
                </div>
              </div>

              {/* SEKSI 1: DATA PRIBADI CALON SISWA */}
              <div className="ppdb-section-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg, #0066ff, #0284c7)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13 }}>
                    1
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Data Diri Calon Peserta Didik</h3>
                    <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Informasi identitas resmi sesuai Akta / Kartu Keluarga</p>
                  </div>
                </div>

                <div className="ppdb-grid-2">
                  <div className="ppdb-grid-full">
                    <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#1e293b', marginBottom: 6 }}>
                      Nama Lengkap Siswa <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input 
                      type="text" 
                      name="nama_lengkap" 
                      value={formData.nama_lengkap} 
                      onChange={handleInputChange} 
                      required 
                      placeholder="Masukkan nama lengkap calon siswa sesuai ijazah/akta" 
                      className="ppdb-input-field" 
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#1e293b', marginBottom: 6 }}>
                      NIK (Nomor Induk Kependudukan) <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input 
                      type="text" 
                      name="nik" 
                      value={formData.nik} 
                      onChange={handleInputChange} 
                      required
                      placeholder="16 Digit NIK di Kartu Keluarga" 
                      maxLength={16}
                      className="ppdb-input-field" 
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#1e293b', marginBottom: 6 }}>
                      NISN (Nomor Induk Siswa Nasional) <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input 
                      type="text" 
                      name="nisn" 
                      value={formData.nisn} 
                      onChange={handleInputChange} 
                      required
                      placeholder="Nomor NISN 10 Digit" 
                      className="ppdb-input-field" 
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#1e293b', marginBottom: 6 }}>
                      Jenis Kelamin <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <select 
                      name="jenis_kelamin" 
                      value={formData.jenis_kelamin} 
                      onChange={handleInputChange} 
                      required
                      className="ppdb-input-field"
                    >
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#1e293b', marginBottom: 6 }}>
                      Tempat Lahir <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input 
                      type="text" 
                      name="tempat_lahir" 
                      value={formData.tempat_lahir} 
                      onChange={handleInputChange} 
                      required
                      placeholder="Kota / Kabupaten Lahir" 
                      className="ppdb-input-field" 
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#1e293b', marginBottom: 6 }}>
                      Tanggal Lahir <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input 
                      type="date" 
                      name="tanggal_lahir" 
                      value={formData.tanggal_lahir} 
                      onChange={handleInputChange} 
                      required
                      className="ppdb-input-field" 
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#1e293b', marginBottom: 6 }}>
                      Agama <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <select 
                      name="agama" 
                      value={formData.agama} 
                      onChange={handleInputChange} 
                      required
                      className="ppdb-input-field"
                    >
                      <option value="Islam">Islam</option>
                      <option value="Kristen">Kristen</option>
                      <option value="Katolik">Katolik</option>
                      <option value="Hindu">Hindu</option>
                      <option value="Buddha">Buddha</option>
                      <option value="Konghucu">Konghucu</option>
                    </select>
                  </div>

                  <div className="ppdb-grid-full">
                    <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#1e293b', marginBottom: 6 }}>
                      Alamat Tempat Tinggal Lengkap <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <textarea 
                      name="alamat" 
                      value={formData.alamat} 
                      onChange={handleInputChange} 
                      required
                      rows={2} 
                      placeholder="Jalan, RT/RW, Kelurahan, Kecamatan, Kota/Kabupaten" 
                      className="ppdb-input-field"
                      style={{ fontFamily: 'inherit' }}
                    />
                  </div>
                </div>
              </div>

              {/* SEKSI 2: DATA AKADEMIK & JALUR SELEKSI */}
              <div className="ppdb-section-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg, #0066ff, #0284c7)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13 }}>
                    2
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Data Sekolah Asal & Pilihan Jalur</h3>
                    <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Informasi sekolah terdahulu dan kategori pendaftaran</p>
                  </div>
                </div>

                <div className="ppdb-grid-2">
                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#1e293b', marginBottom: 6 }}>
                      Nama Sekolah Asal <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input 
                      type="text" 
                      name="sekolah_asal" 
                      value={formData.sekolah_asal} 
                      onChange={handleInputChange} 
                      required
                      placeholder="Contoh: SMPN 1 Kota / MTs Negeri 2" 
                      className="ppdb-input-field" 
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#1e293b', marginBottom: 6 }}>
                      Tahun Lulus <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input 
                      type="text" 
                      name="tahun_lulus" 
                      value={formData.tahun_lulus} 
                      onChange={handleInputChange} 
                      required
                      placeholder="2026" 
                      className="ppdb-input-field" 
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#1e293b', marginBottom: 6 }}>
                      Jalur Pendaftaran <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <select 
                      name="jalur_pendaftaran" 
                      value={formData.jalur_pendaftaran} 
                      onChange={handleInputChange} 
                      required
                      className="ppdb-input-field"
                    >
                      <option value="Reguler">Jalur Reguler / Umum</option>
                      <option value="Prestasi">Jalur Prestasi Akademik/Non-Akademik</option>
                      <option value="Tahfidz">Jalur Tahfidz Al-Qur'an / Beasiswa</option>
                      <option value="Afirmasi">Jalur Afirmasi / Kurang Mampu</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#1e293b', marginBottom: 6 }}>
                      Pilihan Jurusan / Program <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <select 
                      name="pilihan_jurusan" 
                      value={formData.pilihan_jurusan} 
                      onChange={handleInputChange} 
                      required
                      className="ppdb-input-field"
                    >
                      <option value="Umum">Umum / Reguler</option>
                      <option value="IPA">MIPA (Matematika & IPA)</option>
                      <option value="IPS">IPS (Ilmu Pengetahuan Sosial)</option>
                      <option value="Keagamaan">Keagamaan / Keislaman</option>
                      <option value="Komputer">Teknik Komputer & Informatika</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SEKSI 3: DATA ORANG TUA / WALI & WHATSAPP NOTIFIKASI */}
              <div className="ppdb-section-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg, #0066ff, #0284c7)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13 }}>
                    3
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Data Orang Tua / Wali & WhatsApp Notifikasi</h3>
                    <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Nomor WhatsApp wajib aktif untuk pengiriman bukti pendaftaran & kartu peserta</p>
                  </div>
                </div>

                <div className="ppdb-grid-2">
                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#1e293b', marginBottom: 6 }}>
                      Nama Ayah Kandung / Wali <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input 
                      type="text" 
                      name="nama_ayah" 
                      value={formData.nama_ayah} 
                      onChange={handleInputChange} 
                      required
                      placeholder="Nama lengkap Ayah" 
                      className="ppdb-input-field" 
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#1e293b', marginBottom: 6 }}>Pekerjaan Ayah</label>
                    <input 
                      type="text" 
                      name="pekerjaan_ayah" 
                      value={formData.pekerjaan_ayah} 
                      onChange={handleInputChange} 
                      placeholder="PNS / Swasta / Wiraswasta / Lainnya" 
                      className="ppdb-input-field" 
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#1e293b', marginBottom: 6 }}>
                      Nama Ibu Kandung <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input 
                      type="text" 
                      name="nama_ibu" 
                      value={formData.nama_ibu} 
                      onChange={handleInputChange} 
                      required
                      placeholder="Nama lengkap Ibu" 
                      className="ppdb-input-field" 
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#1e293b', marginBottom: 6 }}>Pekerjaan Ibu</label>
                    <input 
                      type="text" 
                      name="pekerjaan_ibu" 
                      value={formData.pekerjaan_ibu} 
                      onChange={handleInputChange} 
                      placeholder="Ibu Rumah Tangga / PNS / Swasta" 
                      className="ppdb-input-field" 
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#1e293b', marginBottom: 6 }}>
                      No. WhatsApp Ortu / Wali <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input 
                      type="text" 
                      name="no_hp_ortu" 
                      value={formData.no_hp_ortu} 
                      onChange={handleInputChange} 
                      required 
                      placeholder="Contoh: 081234567890" 
                      className="ppdb-input-field" 
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#1e293b', marginBottom: 6 }}>Email Ortu (Opsional)</label>
                    <input 
                      type="email" 
                      name="email_ortu" 
                      value={formData.email_ortu} 
                      onChange={handleInputChange} 
                      placeholder="email@gmail.com" 
                      className="ppdb-input-field" 
                    />
                  </div>
                </div>
              </div>

              {/* SUBMIT BUTTON & WA ALERT NOTICE */}
              <button 
                type="submit" 
                disabled={loading} 
                style={{ 
                  width: '100%', 
                  padding: '18px 24px', 
                  borderRadius: 16, 
                  border: 'none', 
                  background: 'linear-gradient(135deg, #0066ff 0%, #0284c7 100%)', 
                  color: '#ffffff', 
                  fontWeight: 800, 
                  fontSize: 16, 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: 10, 
                  boxShadow: '0 8px 25px rgba(0,102,255,0.3)',
                  transition: 'all 0.2s ease'
                }}
              >
                <Send size={20} /> {loading ? 'Mengirim Data Pendaftaran...' : 'Kirim Pendaftaran PPDB Online'}
              </button>

              <div style={{ marginTop: 14, textAlign: 'center', color: '#64748b', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <Phone size={14} color="#059669" /> Bukti pendaftaran & nomor registrasi akan dikirim otomatis via WhatsApp setelah formulir terkirim.
              </div>
            </div>
          </form>
        )}

        {/* TAB CONTENT 2: FORM DAFTAR ULANG */}
        {tab === 'daftar_ulang' && (
          <form onSubmit={handleSubmitDaftarUlang} className="ppdb-card">
            <div style={{ height: 6, background: 'linear-gradient(90deg, #059669 0%, #10b981 100%)' }} />
            <div className="ppdb-card-body">
              <h3 style={{ margin: '0 0 8px 0', fontSize: 18, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckSquare size={20} color="#059669" /> Form Pendaftaran Ulang Siswa Lulus
              </h3>
              <p style={{ color: '#64748b', fontSize: 13, marginBottom: 20 }}>
                Form ini khusus untuk calon siswa yang telah dinyatakan <b>LULUS SELEKSI</b>.
              </p>

              <div className="ppdb-grid-2" style={{ marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#1e293b', marginBottom: 6 }}>Nomor Pendaftaran *</label>
                  <input type="text" name="no_pendaftaran" value={duForm.no_pendaftaran} onChange={handleDuChange} required placeholder="Contoh: PPDB-2026-0001" className="ppdb-input-field" />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#1e293b', marginBottom: 6 }}>Ukuran Seragam</label>
                  <select name="ukuran_seragam" value={duForm.ukuran_seragam} onChange={handleDuChange} className="ppdb-input-field">
                    <option value="S">S (Small)</option>
                    <option value="M">M (Medium)</option>
                    <option value="L">L (Large)</option>
                    <option value="XL">XL (Extra Large)</option>
                    <option value="XXL">XXL (Double Extra Large)</option>
                  </select>
                </div>
                <div className="ppdb-grid-full">
                  <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#1e293b', marginBottom: 6 }}>Nominal Bayar / Bukti Transfer (Rp)</label>
                  <input type="number" name="nominal_daftar_ulang" value={duForm.nominal_daftar_ulang} onChange={handleDuChange} placeholder="Contoh: 500000" className="ppdb-input-field" />
                </div>
              </div>

              {/* SEKSI BERKAS DOKUMEN SAAT DAFTAR ULANG */}
              <div className="ppdb-section-card" style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <FileUp size={18} color="#059669" />
                  <div>
                    <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#0f172a' }}>Upload Berkas & Dokumen Pendaftaran Ulang</h4>
                    <p style={{ margin: 0, fontSize: 11, color: '#64748b' }}>Link Google Drive / Cloud Storage kelengkapan berkas</p>
                  </div>
                </div>

                <div className="ppdb-grid-2">
                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: 11, color: '#475569', marginBottom: 4 }}>Link Scan Ijazah / SKL</label>
                    <input type="text" name="berkas_ijazah" value={duForm.berkas_ijazah || ''} onChange={handleDuChange} placeholder="URL Google Drive / Link File" className="ppdb-input-field" style={{ fontSize: 12 }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: 11, color: '#475569', marginBottom: 4 }}>Link Scan Kartu Keluarga (KK)</label>
                    <input type="text" name="berkas_kk" value={duForm.berkas_kk || ''} onChange={handleDuChange} placeholder="URL Google Drive / Link File" className="ppdb-input-field" style={{ fontSize: 12 }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: 11, color: '#475569', marginBottom: 4 }}>Link Scan Akta Kelahiran</label>
                    <input type="text" name="berkas_akta" value={duForm.berkas_akta || ''} onChange={handleDuChange} placeholder="URL Google Drive / Link File" className="ppdb-input-field" style={{ fontSize: 12 }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: 11, color: '#475569', marginBottom: 4 }}>Link Pas Foto (3x4)</label>
                    <input type="text" name="pas_foto" value={duForm.pas_foto || ''} onChange={handleDuChange} placeholder="URL Google Drive / Link File" className="ppdb-input-field" style={{ fontSize: 12 }} />
                  </div>
                </div>
              </div>

              <button type="submit" disabled={loading} style={{ width: '100%', padding: '16px 24px', borderRadius: 14, border: 'none', background: '#059669', color: '#ffffff', fontWeight: 800, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 16px rgba(5,150,105,0.3)' }}>
                <CheckSquare size={18} /> {loading ? 'Memproses...' : 'Kirim Pendaftaran Ulang'}
              </button>
            </div>
          </form>
        )}

        {/* TAB CONTENT 3: CEK STATUS */}
        {tab === 'status' && (
          <div className="ppdb-card">
            <div style={{ height: 6, background: 'linear-gradient(90deg, #0284c7 0%, #38bdf8 100%)' }} />
            <div className="ppdb-card-body">
              <h3 style={{ margin: '0 0 16px 0', fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Cek Status Seleksi & Cetak Kartu Peserta</h3>
              <form onSubmit={handleCheckStatus} style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
                <input type="text" value={searchNo} onChange={(e) => setSearchNo(e.target.value)} placeholder="Nomor Pendaftaran (Contoh: PPDB-2026-0001)" className="ppdb-input-field" style={{ flex: 1, minWidth: 220 }} />
                <button type="submit" disabled={loading} style={{ padding: '12px 24px', background: '#0066ff', color: '#ffffff', border: 'none', borderRadius: 12, fontWeight: 800, cursor: 'pointer', fontSize: 14 }}>Cek Status</button>
              </form>

              {statusResult && (
                <div style={{ background: '#f8fafc', padding: 20, borderRadius: 16, border: '1px solid #cbd5e1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a' }}>{statusResult.nama_lengkap}</h4>
                      <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: 13 }}>No: <b>{statusResult.no_pendaftaran}</b> | Jalur: {statusResult.jalur_pendaftaran}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      {getStatusBadge(statusResult.status)}
                      <button onClick={() => handlePrintKartu(statusResult)} style={{ padding: '8px 16px', background: '#0f172a', color: '#ffffff', border: 'none', borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700 }}>
                        <Printer size={16} /> Cetak Kartu Peserta
                      </button>
                    </div>
                  </div>

                  <hr style={{ margin: '16px 0', borderColor: '#cbd5e1' }} />

                  <div className="ppdb-grid-2" style={{ fontSize: 13 }}>
                    <div><b>Jadwal Ujian:</b> {statusResult.jadwal_tes ? new Date(statusResult.jadwal_tes).toLocaleString('id-ID') : 'Belum Dijadwalkan'}</div>
                    <div><b>Nilai Ujian Tulis:</b> {statusResult.nilai_tes_tulis || '-'}</div>
                    <div><b>Nilai Baca Al-Qur'an:</b> {statusResult.nilai_baca_quran || '-'}</div>
                    <div><b>Ukuran Seragam:</b> {statusResult.ukuran_seragam || 'Belum Diisi'}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
