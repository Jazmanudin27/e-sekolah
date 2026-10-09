import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { 
  UserPlus, Search, CheckCircle, Clock, FileText, 
  Send, User, Phone, MapPin, School, BookOpen, CheckSquare, Printer, FileUp, Award, LogIn, ShieldCheck, Calendar,
  HelpCircle, ChevronRight, AlertCircle, Info, ExternalLink, Check, Sparkles, MessageCircle, HeartHandshake, Layers
} from 'lucide-react';
import api from '../api/client';

export default function PublicPpdbPortalView({ onLoginClick, sekolahInfo }) {
  const [tab, setTab] = useState('beranda'); // 'beranda' | 'daftar' | 'daftar_ulang' | 'status'
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
        setSchedule(res.data.data);
      }
    } catch (e) {
      console.error('Failed fetching schedule:', e);
    }
  };

  const schoolData = schedule?.sekolah || sekolahInfo || {
    nama_sekolah: 'SMK ARTANITA TASIKMALAYA',
    npsn: '20279876',
    alamat: 'Jl. Cienteung No. 112 A, Kota Tasikmalaya',
    no_hp: '081234567890',
    email: 'info@sistemiartas.com'
  };

  const cleanPhone = String(schoolData.no_hp || '081234567890').replace(/\D/g, '').replace(/^0/, '62');

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
    bukti_pembayaran_du: '',
    berkas_ijazah: '',
    berkas_kk: '',
    berkas_akta: '',
    pas_foto: ''
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
        setSearchNo(noPendaftaran);
        setTab('status');
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
        setSearchNo(duForm.no_pendaftaran);
        setDuForm({
          no_pendaftaran: '',
          ukuran_seragam: 'M',
          nominal_daftar_ulang: '',
          bukti_pembayaran_du: '',
          berkas_ijazah: '',
          berkas_kk: '',
          berkas_akta: '',
          pas_foto: ''
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
    if (e) e.preventDefault();
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
              <p>${schoolData.nama_sekolah}</p>
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
        return <span style={{ background: '#fef3c7', color: '#92400e', padding: '6px 14px', borderRadius: 10, fontWeight: 800, fontSize: 13 }}>Menunggu Seleksi</span>;
    }
  };

  const canDaftar = !schedule || isScheduleActive(schedule.is_pendaftaran_open, schedule.pendaftaran_buka, schedule.pendaftaran_tutup);
  const canDU = !schedule || isScheduleActive(schedule.is_daftar_ulang_open, schedule.daftar_ulang_buka, schedule.daftar_ulang_tutup);
  const canPengumuman = !schedule || isScheduleActive(schedule.is_pengumuman_open, schedule.pengumuman_buka, schedule.pengumuman_tutup);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
      <style>{`
        .ppdb-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(12px);
          border-bottom: 1px solid #e2e8f0;
          box-shadow: 0 4px 20px rgba(0,0,0,0.03);
        }
        .ppdb-nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 12px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .ppdb-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          color: inherit;
          cursor: pointer;
        }
        .ppdb-brand-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: linear-gradient(135deg, #0066ff 0%, #0284c7 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(0,102,255,0.3);
          flex-shrink: 0;
        }
        .ppdb-nav-links {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .ppdb-nav-btn {
          padding: 8px 16px;
          border-radius: 10px;
          border: none;
          background: transparent;
          color: #475569;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .ppdb-nav-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
        }
        .ppdb-nav-btn.active {
          background: #0066ff;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(0,102,255,0.25);
        }
        .ppdb-wrapper {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px 20px 60px 20px;
        }
        .ppdb-hero-box {
          background: linear-gradient(135deg, #090d16 0%, #0f172a 50%, #1e293b 100%);
          color: #ffffff;
          border-radius: 24px;
          padding: 44px 36px;
          margin-bottom: 28px;
          box-shadow: 0 20px 40px rgba(15,23,42,0.16);
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .ppdb-hero-glow {
          position: absolute;
          top: -40%;
          right: -10%;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(0,102,255,0.25) 0%, transparent 70%);
          pointer-events: none;
        }
        .ppdb-card {
          background: #ffffff;
          border-radius: 20px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 10px 30px rgba(15,23,42,0.05);
          overflow: hidden;
          margin-bottom: 32px;
        }
        .ppdb-card-body {
          padding: 32px;
        }
        .ppdb-section-card {
          background: #f8fafc;
          padding: 24px;
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
        .ppdb-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .ppdb-grid-4 {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
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
        .ppdb-step-item {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.03);
          position: relative;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .ppdb-step-badge {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: linear-gradient(135deg, #0066ff, #0284c7);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 15px;
        }
        .ppdb-footer {
          background: #0f172a;
          color: #94a3b8;
          padding: 40px 20px 30px 20px;
          border-top: 1px solid #1e293b;
          font-size: 13px;
        }
        @media (max-width: 860px) {
          .ppdb-nav-links {
            display: none;
          }
          .ppdb-grid-4 {
            grid-template-columns: repeat(2, 1fr);
          }
          .ppdb-grid-3 {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 640px) {
          .ppdb-wrapper {
            padding: 16px 12px 40px 12px;
          }
          .ppdb-hero-box {
            padding: 24px 18px;
            border-radius: 18px;
          }
          .ppdb-card-body {
            padding: 20px 16px;
          }
          .ppdb-grid-2 {
            grid-template-columns: 1fr;
          }
          .ppdb-grid-full {
            grid-column: span 1;
          }
          .ppdb-grid-4 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* TOP NAVBAR */}
      <header className="ppdb-header">
        <div className="ppdb-nav-container">
          <div className="ppdb-brand" onClick={() => setTab('beranda')}>
            <div className="ppdb-brand-icon">
              <School size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h1 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px' }}>
                  {schoolData.nama_sekolah}
                </h1>
                <span style={{ background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: 6, fontSize: 10, fontWeight: 800 }}>
                  PPDB 2026
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 11, color: '#64748b' }}>
                Portal Resmi Penerimaan Peserta Didik Baru Online
              </p>
            </div>
          </div>

          <div className="ppdb-nav-links">
            <button 
              className={`ppdb-nav-btn ${tab === 'beranda' ? 'active' : ''}`}
              onClick={() => setTab('beranda')}
            >
              <BookOpen size={16} /> Beranda & Alur
            </button>
            <button 
              className={`ppdb-nav-btn ${tab === 'daftar' ? 'active' : ''}`}
              onClick={() => setTab('daftar')}
            >
              <UserPlus size={16} /> Formulir Daftar
            </button>
            <button 
              className={`ppdb-nav-btn ${tab === 'status' ? 'active' : ''}`}
              onClick={() => setTab('status')}
            >
              <Search size={16} /> Cek Kelulusan
            </button>
            <button 
              className={`ppdb-nav-btn ${tab === 'daftar_ulang' ? 'active' : ''}`}
              onClick={() => setTab('daftar_ulang')}
            >
              <CheckSquare size={16} /> Daftar Ulang
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <a 
              href={`https://wa.me/${cleanPhone}?text=Halo%20Panitia%20PPDB%20${encodeURIComponent(schoolData.nama_sekolah)},%20saya%20ingin%20bertanya%20seputar%20pendaftaran`}
              target="_blank"
              rel="noreferrer"
              style={{
                background: '#22c55e',
                color: '#ffffff',
                padding: '8px 14px',
                borderRadius: 10,
                fontSize: 12,
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: '0 2px 8px rgba(34,197,94,0.3)'
              }}
            >
              <MessageCircle size={15} /> WhatsApp Panitia
            </a>

            {onLoginClick && (
              <button 
                onClick={onLoginClick}
                style={{
                  background: '#f1f5f9',
                  color: '#334155',
                  border: '1px solid #cbd5e1',
                  padding: '8px 14px',
                  borderRadius: 10,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <LogIn size={15} /> Portal Utama
              </button>
            )}
          </div>
        </div>
      </header>

      {/* MOBILE TAB NAVIGATION STRIP */}
      <div style={{ background: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '8px 12px', display: 'flex', gap: 6, overflowX: 'auto' }}>
        <button 
          className={`ppdb-nav-btn ${tab === 'beranda' ? 'active' : ''}`}
          onClick={() => setTab('beranda')}
          style={{ whiteSpace: 'nowrap' }}
        >
          <BookOpen size={14} /> Beranda
        </button>
        <button 
          className={`ppdb-nav-btn ${tab === 'daftar' ? 'active' : ''}`}
          onClick={() => setTab('daftar')}
          style={{ whiteSpace: 'nowrap' }}
        >
          <UserPlus size={14} /> Daftar Online
        </button>
        <button 
          className={`ppdb-nav-btn ${tab === 'status' ? 'active' : ''}`}
          onClick={() => setTab('status')}
          style={{ whiteSpace: 'nowrap' }}
        >
          <Search size={14} /> Cek Kelulusan
        </button>
        <button 
          className={`ppdb-nav-btn ${tab === 'daftar_ulang' ? 'active' : ''}`}
          onClick={() => setTab('daftar_ulang')}
          style={{ whiteSpace: 'nowrap' }}
        >
          <CheckSquare size={14} /> Daftar Ulang
        </button>
      </div>

      <div className="ppdb-wrapper">
        {/* HERO BANNER */}
        <div className="ppdb-hero-box">
          <div className="ppdb-hero-glow" />
          <div style={{ position: 'relative', zIndex: 1, maxWidth: 840 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              <span style={{ background: 'rgba(59,130,246,0.2)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.4)', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 800, letterSpacing: '0.5px' }}>
                TAHUN AJARAN 2026/2027
              </span>
              <span style={{ background: 'rgba(16,185,129,0.2)', color: '#34d399', border: '1px solid rgba(16,185,129,0.4)', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Sparkles size={12} /> Pendaftaran Online Resmi Dibuka
              </span>
            </div>

            <h2 style={{ margin: '0 0 12px 0', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, letterSpacing: '-0.5px', lineHeight: 1.25 }}>
              Penerimaan Peserta Didik Baru (PPDB)<br />
              <span style={{ color: '#38bdf8' }}>{schoolData.nama_sekolah}</span>
            </h2>

            <p style={{ margin: '0 0 24px 0', color: '#cbd5e1', fontSize: 14, lineHeight: 1.6, maxWidth: 650 }}>
              Wujudkan masa depan gemilang bersama sekolah berprestasi dan berkarakter. Pendaftaran dapat dilakukan dari rumah secara praktis, cepat, dan transparan melalui portal resmi ini.
            </p>

            {/* ACTION CTA BUTTONS */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button 
                onClick={() => setTab('daftar')}
                style={{
                  background: 'linear-gradient(135deg, #0066ff 0%, #0284c7 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: 12,
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  boxShadow: '0 8px 20px rgba(0,102,255,0.35)'
                }}
              >
                <UserPlus size={18} /> Daftar Siswa Baru Sekarang
              </button>

              <button 
                onClick={() => setTab('status')}
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.25)',
                  padding: '12px 20px',
                  borderRadius: 12,
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  backdropFilter: 'blur(8px)'
                }}
              >
                <Search size={18} /> Cek Kelulusan & Kartu
              </button>

              <button 
                onClick={() => setTab('beranda')}
                style={{
                  background: 'transparent',
                  color: '#94a3b8',
                  border: '1px solid rgba(255,255,255,0.15)',
                  padding: '12px 18px',
                  borderRadius: 12,
                  fontWeight: 600,
                  fontSize: 14,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6
                }}
              >
                <Info size={16} /> Alur & Syarat
              </button>
            </div>
          </div>
        </div>

        {/* TAB 1: BERANDA & INFORMASI LENGKAP */}
        {tab === 'beranda' && (
          <div>
            {/* JALUR PENDAFTARAN (4 CARDS) */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <h3 style={{ margin: '0 0 6px 0', fontSize: 22, fontWeight: 800, color: '#0f172a' }}>
                  Jalur Penerimaan Calon Siswa Baru
                </h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>
                  Pilih jalur pendaftaran yang sesuai dengan kualifikasi dan prestasi calon peserta didik
                </p>
              </div>

              <div className="ppdb-grid-4">
                <div className="ppdb-step-item">
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#eff6ff', color: '#0066ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BookOpen size={20} />
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Jalur Reguler</h4>
                    <p style={{ margin: 0, color: '#64748b', fontSize: 12, lineHeight: 1.5 }}>
                      Terbuka bagi seluruh lulusan SMP/MTs sederajat melalui tes potensi akademik & wawancara.
                    </p>
                  </div>
                </div>

                <div className="ppdb-step-item">
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Award size={20} />
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Jalur Prestasi</h4>
                    <p style={{ margin: 0, color: '#64748b', fontSize: 12, lineHeight: 1.5 }}>
                      Khusus siswa berprestasi akademik, olahraga, seni, sains peringkat juara kota/provinsi.
                    </p>
                  </div>
                </div>

                <div className="ppdb-step-item">
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Jalur Tahfidz</h4>
                    <p style={{ margin: 0, color: '#64748b', fontSize: 12, lineHeight: 1.5 }}>
                      Beasiswa khusus penghafal Al-Qur'an (minimal 1 Juz mutqin) dengan fasilitas pembinaan khusus.
                    </p>
                  </div>
                </div>

                <div className="ppdb-step-item">
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <HeartHandshake size={20} />
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Jalur Afirmasi</h4>
                    <p style={{ margin: 0, color: '#64748b', fontSize: 12, lineHeight: 1.5 }}>
                      Bagi pemegang kartu KIP/PKH/KKS dari keluarga prasejahtera untuk keringanan biaya.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ALUR PENDAFTARAN TIMELINE */}
            <div className="ppdb-card">
              <div style={{ height: 6, background: 'linear-gradient(90deg, #0066ff 0%, #0284c7 50%, #10b981 100%)' }} />
              <div className="ppdb-card-body">
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ margin: '0 0 6px 0', fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
                    Alur & Tata Cara Pendaftaran PPDB
                  </h3>
                  <p style={{ margin: 0, color: '#64748b', fontSize: 13 }}>
                    Ikuti 4 langkah mudah berikut untuk menyelesaikan pendaftaran peserta didik baru
                  </p>
                </div>

                <div className="ppdb-grid-4">
                  <div className="ppdb-step-item" style={{ background: '#f8fafc' }}>
                    <div className="ppdb-step-badge">1</div>
                    <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Isi Formulir Online</h4>
                    <p style={{ margin: 0, fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>
                      Lengkapi data diri calon siswa & ortu pada menu <b>Formulir Daftar</b>. Simpan Nomor Pendaftaran yang muncul.
                    </p>
                  </div>

                  <div className="ppdb-step-item" style={{ background: '#f8fafc' }}>
                    <div className="ppdb-step-badge">2</div>
                    <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Ujian Seleksi & Berkas</h4>
                    <p style={{ margin: 0, fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>
                      Ikuti tes potensi akademik, tes wawancara, dan baca Al-Qur'an sesuai jadwal di kartu peserta.
                    </p>
                  </div>

                  <div className="ppdb-step-item" style={{ background: '#f8fafc' }}>
                    <div className="ppdb-step-badge">3</div>
                    <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Pengumuman Kelulusan</h4>
                    <p style={{ margin: 0, fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>
                      Cek kelulusan online melalui menu <b>Cek Kelulusan</b> dengan memasukkan Nomor Pendaftaran Anda.
                    </p>
                  </div>

                  <div className="ppdb-step-item" style={{ background: '#f8fafc' }}>
                    <div className="ppdb-step-badge">4</div>
                    <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Daftar Ulang & Seragam</h4>
                    <p style={{ margin: 0, fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>
                      Calon siswa yang dinyatakan lulus melakukan konfirmasi ukuran seragam dan upload berkas pendukung.
                    </p>
                  </div>
                </div>

                <div style={{ marginTop: 24, textAlign: 'center' }}>
                  <button 
                    onClick={() => setTab('daftar')}
                    style={{
                      background: '#0066ff',
                      color: '#ffffff',
                      border: 'none',
                      padding: '12px 28px',
                      borderRadius: 12,
                      fontWeight: 800,
                      fontSize: 14,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 8,
                      boxShadow: '0 4px 16px rgba(0,102,255,0.3)'
                    }}
                  >
                    Mulai Isi Formulir Sekarang <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* SYARAT & JADWAL 2-COLUMNS */}
            <div className="ppdb-grid-2" style={{ marginBottom: 32 }}>
              {/* PERSYARATAN BERKAS */}
              <div className="ppdb-card" style={{ margin: 0 }}>
                <div className="ppdb-card-body">
                  <h3 style={{ margin: '0 0 16px 0', fontSize: 18, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FileText size={20} color="#0066ff" /> Syarat & Dokumen Berkas
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: '#334155' }}>
                      <Check size={16} color="#10b981" style={{ marginTop: 2, flexShrink: 0 }} />
                      <span>Fotokopi Ijazah / Surat Keterangan Lulus (SKL) SMP/MTs legalisir (2 lembar).</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: '#334155' }}>
                      <Check size={16} color="#10b981" style={{ marginTop: 2, flexShrink: 0 }} />
                      <span>Fotokopi Kartu Keluarga (KK) & Akta Kelahiran yang masih berlaku.</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: '#334155' }}>
                      <Check size={16} color="#10b981" style={{ marginTop: 2, flexShrink: 0 }} />
                      <span>Nomor Induk Siswa Nasional (NISN) & NIK Kependudukan yang valid.</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: '#334155' }}>
                      <Check size={16} color="#10b981" style={{ marginTop: 2, flexShrink: 0 }} />
                      <span>Pas Foto resmi ukuran 3x4 latar belakang merah/biru (3 lembar).</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: '#334155' }}>
                      <Check size={16} color="#10b981" style={{ marginTop: 2, flexShrink: 0 }} />
                      <span>Piagam/Sertifikat Kejuaraan asli (Khusus pendaftar Jalur Prestasi/Tahfidz).</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* JADWAL & AGENDA KEGIATAN */}
              <div className="ppdb-card" style={{ margin: 0 }}>
                <div className="ppdb-card-body">
                  <h3 style={{ margin: '0 0 16px 0', fontSize: 18, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Calendar size={20} color="#0066ff" /> Jadwal & Agenda PPDB 2026
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>Pendaftaran Gelombang 1</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>Pendaftaran online & penyerahan berkas</div>
                      </div>
                      <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700 }}>
                        {canDaftar ? 'Aktif' : 'Selesai'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>Tes Seleksi & Wawancara</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>Akademik, wawancara & tes baca Al-Qur'an</div>
                      </div>
                      <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700 }}>
                        Sesuai Jadwal
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>Pengumuman Hasil Seleksi</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>Pengecekan online via nomor pendaftaran</div>
                      </div>
                      <span style={{ background: '#fef3c7', color: '#92400e', padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700 }}>
                        {canPengumuman ? 'Dibuka' : 'Terjadwal'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>Daftar Ulang & Seragam</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>Pelunasan administrasi & pengukuran seragam</div>
                      </div>
                      <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700 }}>
                        {canDU ? 'Aktif' : 'Terjadwal'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* KONTAK BANTUAN CALL CENTER */}
            <div style={{ background: '#0f172a', color: '#ffffff', borderRadius: 20, padding: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
              <div>
                <h3 style={{ margin: '0 0 6px 0', fontSize: 20, fontWeight: 800 }}>
                  Butuh Bantuan atau Informasi Lebih Lanjut?
                </h3>
                <p style={{ margin: 0, color: '#94a3b8', fontSize: 13, maxWidth: 500 }}>
                  Tim Panitia PPDB {schoolData.nama_sekolah} siap membantu Anda setiap hari kerja pukul 08:00 - 15:00 WIB.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <a 
                  href={`https://wa.me/${cleanPhone}?text=Halo%20Panitia%20PPDB%20${encodeURIComponent(schoolData.nama_sekolah)},%20mohon%20informasi%20PPDB`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    background: '#22c55e',
                    color: '#ffffff',
                    padding: '12px 20px',
                    borderRadius: 12,
                    fontWeight: 700,
                    fontSize: 14,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8
                  }}
                >
                  <MessageCircle size={18} /> Chat WhatsApp Panitia
                </a>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FORM PENDAFTARAN SISWA BARU */}
        {tab === 'daftar' && (
          <div>
            {!canDaftar && (
              <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', padding: 20, borderRadius: 16, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                <AlertCircle size={24} color="#d97706" />
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: '#92400e' }}>Periode Pendaftaran Belum Dibuka / Telah Ditutup</div>
                  <div style={{ fontSize: 12, color: '#b45309' }}>Anda tetap dapat melihat alur pendaftaran atau melakukan cek kelulusan jika sudah pernah mendaftar.</div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmitRegister} className="ppdb-card">
              <div style={{ height: 6, background: 'linear-gradient(90deg, #0066ff 0%, #00c6ff 50%, #6366f1 100%)' }} />

              <div className="ppdb-card-body">
                <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <h2 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px' }}>
                      Formulir Pendaftaran Siswa Baru (PPDB)
                    </h2>
                    <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: 13 }}>
                      Lengkapi data calon siswa & orang tua secara teliti. Tanda bintang (<span style={{ color: '#ef4444' }}>*</span>) wajib diisi.
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '6px 14px', borderRadius: 20, fontSize: 12, color: '#15803d', fontWeight: 700 }}>
                    <ShieldCheck size={16} /> Data Aman & Terenkripsi
                  </div>
                </div>

                {/* SEKSI 1: DATA CALON SISWA */}
                <div className="ppdb-section-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg, #0066ff, #0284c7)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13 }}>
                      1
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Identitas Calon Peserta Didik</h3>
                      <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Data sesuai Akta Kelahiran & Kartu Keluarga (KK)</p>
                    </div>
                  </div>

                  <div className="ppdb-grid-2">
                    <div className="ppdb-grid-full">
                      <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#1e293b', marginBottom: 6 }}>
                        Nama Lengkap Calon Siswa <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input 
                        type="text" 
                        name="nama_lengkap" 
                        value={formData.nama_lengkap} 
                        onChange={handleInputChange} 
                        required 
                        placeholder="Nama lengkap sesuai ijazah/akta kelahiran" 
                        className="ppdb-input-field" 
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#1e293b', marginBottom: 6 }}>
                        Nomor Induk Kependudukan (NIK) <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input 
                        type="text" 
                        name="nik" 
                        value={formData.nik} 
                        onChange={handleInputChange} 
                        required 
                        maxLength={16}
                        placeholder="16 Digit NIK sesuai KK" 
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
                        maxLength={10}
                        placeholder="10 Digit NISN dari SMP/MTs" 
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
                      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Data Sekolah Asal & Pilihan Jurusan</h3>
                      <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Informasi sekolah menengah pertama dan program yang diminati</p>
                    </div>
                  </div>

                  <div className="ppdb-grid-2">
                    <div>
                      <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#1e293b', marginBottom: 6 }}>
                        Sekolah Asal (SMP / MTs) <span style={{ color: '#ef4444' }}>*</span>
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
                        <option value="Komputer">Teknik Jaringan Komputer & Telekomunikasi (TJKT)</option>
                        <option value="RPL">Pengembangan Perangkat Lunak & Gim (PPLG)</option>
                        <option value="Bisnis">Manajemen Perkantoran & Bisnis Digital</option>
                        <option value="Akuntansi">Akuntansi & Keuangan Lembaga</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* SEKSI 3: DATA ORANG TUA / WALI */}
                <div className="ppdb-section-card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg, #0066ff, #0284c7)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13 }}>
                      3
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Data Orang Tua / Wali & WhatsApp Notifikasi</h3>
                      <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Nomor WhatsApp wajib aktif untuk pengiriman bukti pendaftaran & nomor kartu peserta</p>
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
                        placeholder="PNS / Swasta / Wiraswasta / Buruh" 
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
                    padding: '16px 24px', 
                    borderRadius: 14, 
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
                  <Send size={20} /> {loading ? 'Mengirim Data Pendaftaran...' : 'Kirim Formulir Pendaftaran PPDB'}
                </button>

                <div style={{ marginTop: 14, textAlign: 'center', color: '#64748b', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Phone size={14} color="#059669" /> Bukti pendaftaran & nomor registrasi akan dikirim otomatis via WhatsApp setelah formulir terkirim.
                </div>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: CEK HASIL SELEKSI & CETAK KARTU */}
        {tab === 'status' && (
          <div className="ppdb-card">
            <div style={{ height: 6, background: 'linear-gradient(90deg, #0284c7 0%, #38bdf8 100%)' }} />
            <div className="ppdb-card-body">
              <h3 style={{ margin: '0 0 6px 0', fontSize: 20, fontWeight: 800, color: '#0f172a' }}>
                Cek Hasil Seleksi & Cetak Kartu Peserta
              </h3>
              <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: 13 }}>
                Masukkan Nomor Pendaftaran yang Anda dapatkan saat registrasi (Contoh: PPDB-2026-0001)
              </p>

              <form onSubmit={handleCheckStatus} style={{ display: 'flex', gap: 10, marginBottom: 24, flexWrap: 'wrap' }}>
                <input 
                  type="text" 
                  value={searchNo} 
                  onChange={(e) => setSearchNo(e.target.value)} 
                  placeholder="Nomor Pendaftaran (Contoh: PPDB-2026-0001)" 
                  className="ppdb-input-field" 
                  style={{ flex: 1, minWidth: 240 }} 
                />
                <button 
                  type="submit" 
                  disabled={loading} 
                  style={{ 
                    padding: '12px 24px', 
                    background: '#0066ff', 
                    color: '#ffffff', 
                    border: 'none', 
                    borderRadius: 12, 
                    fontWeight: 800, 
                    cursor: 'pointer', 
                    fontSize: 14,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: '0 4px 14px rgba(0,102,255,0.25)'
                  }}
                >
                  <Search size={16} /> {loading ? 'Mencari...' : 'Periksa Status'}
                </button>
              </form>

              {statusResult && (
                <div style={{ background: '#f8fafc', padding: 24, borderRadius: 16, border: '1px solid #cbd5e1' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 14 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Nomor Pendaftaran:</span>
                        <span style={{ fontWeight: 800, color: '#0066ff', fontSize: 14 }}>{statusResult.no_pendaftaran}</span>
                      </div>
                      <h4 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#0f172a' }}>{statusResult.nama_lengkap}</h4>
                      <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: 13 }}>
                        Jalur: <b>{statusResult.jalur_pendaftaran}</b> | Jurusan: <b>{statusResult.pilihan_jurusan}</b>
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                      {getStatusBadge(statusResult.status)}
                      <button 
                        onClick={() => handlePrintKartu(statusResult)} 
                        style={{ 
                          padding: '8px 16px', 
                          background: '#0f172a', 
                          color: '#ffffff', 
                          border: 'none', 
                          borderRadius: 10, 
                          cursor: 'pointer', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 6, 
                          fontSize: 13, 
                          fontWeight: 700 
                        }}
                      >
                        <Printer size={16} /> Cetak Kartu Peserta
                      </button>
                      {(statusResult.status === 'Lulus' || statusResult.status === 'Daftar Ulang') && (
                        <button 
                          onClick={() => {
                            setDuForm(prev => ({ ...prev, no_pendaftaran: statusResult.no_pendaftaran }));
                            setTab('daftar_ulang');
                          }}
                          style={{
                            padding: '8px 16px',
                            background: '#059669',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: 10,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            fontSize: 13,
                            fontWeight: 700
                          }}
                        >
                          <CheckSquare size={16} /> Lanjut Daftar Ulang
                        </button>
                      )}
                    </div>
                  </div>

                  <hr style={{ margin: '18px 0', borderColor: '#e2e8f0' }} />

                  <div className="ppdb-grid-2" style={{ fontSize: 13 }}>
                    <div><b>Jadwal Ujian:</b> {statusResult.jadwal_tes ? new Date(statusResult.jadwal_tes).toLocaleString('id-ID') : 'Belum Dijadwalkan'}</div>
                    <div><b>Lokasi Ujian:</b> {statusResult.lokasi_tes || 'Gedung Utama Sekolah'}</div>
                    <div><b>Nilai Ujian Tulis:</b> {statusResult.nilai_tes_tulis || '-'}</div>
                    <div><b>Nilai Wawancara:</b> {statusResult.nilai_tes_wawancara || '-'}</div>
                    <div><b>Nilai Baca Al-Qur'an:</b> {statusResult.nilai_baca_quran || '-'}</div>
                    <div><b>Ukuran Seragam:</b> {statusResult.ukuran_seragam || 'Belum Mengisi'}</div>
                  </div>

                  {statusResult.catatan && (
                    <div style={{ marginTop: 14, background: '#fef3c7', padding: '10px 14px', borderRadius: 10, fontSize: 12, color: '#92400e' }}>
                      <b>Catatan Panitia:</b> {statusResult.catatan}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: FORM DAFTAR ULANG */}
        {tab === 'daftar_ulang' && (
          <form onSubmit={handleSubmitDaftarUlang} className="ppdb-card">
            <div style={{ height: 6, background: 'linear-gradient(90deg, #059669 0%, #10b981 100%)' }} />
            <div className="ppdb-card-body">
              <h3 style={{ margin: '0 0 6px 0', fontSize: 20, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckSquare size={22} color="#059669" /> Formulir Pendaftaran Ulang Siswa Lulus
              </h3>
              <p style={{ color: '#64748b', fontSize: 13, marginBottom: 24 }}>
                Form ini diperuntukkan bagi calon siswa yang telah dinyatakan <b>LULUS SELEKSI</b> untuk konfirmasi seragam dan berkas.
              </p>

              <div className="ppdb-grid-2" style={{ marginBottom: 20 }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#1e293b', marginBottom: 6 }}>Nomor Pendaftaran *</label>
                  <input 
                    type="text" 
                    name="no_pendaftaran" 
                    value={duForm.no_pendaftaran} 
                    onChange={handleDuChange} 
                    required 
                    placeholder="Contoh: PPDB-2026-0001" 
                    className="ppdb-input-field" 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#1e293b', marginBottom: 6 }}>Ukuran Seragam Sekolah *</label>
                  <select name="ukuran_seragam" value={duForm.ukuran_seragam} onChange={handleDuChange} className="ppdb-input-field">
                    <option value="S">S (Small)</option>
                    <option value="M">M (Medium)</option>
                    <option value="L">L (Large)</option>
                    <option value="XL">XL (Extra Large)</option>
                    <option value="XXL">XXL (Double Extra Large)</option>
                  </select>
                </div>

                <div className="ppdb-grid-full">
                  <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#1e293b', marginBottom: 6 }}>Nominal Bayar / Pembayaran Awal (Rp)</label>
                  <input 
                    type="number" 
                    name="nominal_daftar_ulang" 
                    value={duForm.nominal_daftar_ulang} 
                    onChange={handleDuChange} 
                    placeholder="Contoh: 500000" 
                    className="ppdb-input-field" 
                  />
                </div>
              </div>

              {/* SEKSI BERKAS DOKUMEN SAAT DAFTAR ULANG */}
              <div className="ppdb-section-card" style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <FileUp size={20} color="#059669" />
                  <div>
                    <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#0f172a' }}>Upload Berkas & Dokumen Pendaftaran Ulang</h4>
                    <p style={{ margin: 0, fontSize: 11, color: '#64748b' }}>Masukkan link Google Drive / Cloud Storage berkas pendukung (Pastikan akses diset publik/siapa saja memiliki link)</p>
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

              <button 
                type="submit" 
                disabled={loading} 
                style={{ 
                  width: '100%', 
                  padding: '16px 24px', 
                  borderRadius: 14, 
                  border: 'none', 
                  background: '#059669', 
                  color: '#ffffff', 
                  fontWeight: 800, 
                  fontSize: 15, 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: 8, 
                  boxShadow: '0 4px 16px rgba(5,150,105,0.3)' 
                }}
              >
                <CheckSquare size={18} /> {loading ? 'Memproses...' : 'Kirim Konfirmasi Daftar Ulang'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* FOOTER */}
      <footer className="ppdb-footer">
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ffffff', fontWeight: 800, fontSize: 16, marginBottom: 8 }}>
              <School size={20} color="#38bdf8" /> {schoolData.nama_sekolah}
            </div>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: 12, maxWidth: 360, lineHeight: 1.6 }}>
              {schoolData.alamat || 'Jl. Cienteung No. 112 A, Kota Tasikmalaya'}
            </p>
            <div style={{ marginTop: 8, fontSize: 12, color: '#64748b' }}>
              NPSN: {schoolData.npsn || '20279876'}
            </div>
          </div>

          <div>
            <div style={{ color: '#ffffff', fontWeight: 700, fontSize: 14, marginBottom: 8 }}>Layanan Informasi</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
              <div>WhatsApp: <b>{schoolData.no_hp || '-'}</b></div>
              <div>Email: <b>{schoolData.email || '-'}</b></div>
              <div>Jam Layanan: <b>Senin - Sabtu (08:00 - 15:00 WIB)</b></div>
            </div>
          </div>

          <div>
            <div style={{ color: '#ffffff', fontWeight: 700, fontSize: 14, marginBottom: 8 }}>Tautan Terkait</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12 }}>
              <a href="https://sistemiartas.com" target="_blank" rel="noreferrer" style={{ color: '#38bdf8', textDecoration: 'none' }}>
                Portal Sistem Informasi Sekolah &rarr;
              </a>
              <span style={{ color: '#64748b' }}>Sistem Informasi PPDB Terpadu Cloud</span>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1200, margin: '24px auto 0 auto', paddingTop: 20, borderTop: '1px solid #1e293b', textAlign: 'center', fontSize: 12, color: '#64748b' }}>
          &copy; {new Date().getFullYear()} {schoolData.nama_sekolah}. Seluruh Hak Cipta Dilindungi.
        </div>
      </footer>
    </div>
  );
}
