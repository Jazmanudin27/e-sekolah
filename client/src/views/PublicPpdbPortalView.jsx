import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { 
  UserPlus, Search, CheckCircle, Clock, FileText, 
  Send, User, Phone, MapPin, School, BookOpen, CheckSquare, Printer, FileUp, Award, LogIn, ShieldCheck, Calendar,
  HelpCircle, ChevronRight, ChevronDown, AlertCircle, Info, ExternalLink, Check, Sparkles, MessageCircle, HeartHandshake, Layers,
  Compass, Laptop, Users, Star, ArrowRight, ArrowLeft, Shield, Bell, CheckCircle2
} from 'lucide-react';
import api from '../api/client';

export default function PublicPpdbPortalView({ onLoginClick, sekolahInfo }) {
  const [tab, setTab] = useState('beranda'); // 'beranda' | 'daftar' | 'status' | 'daftar_ulang'
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeFaq, setActiveFaq] = useState(0);

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
    nama_sekolah: 'SMA YAB SUKARATU',
    npsn: '20279876',
    alamat: 'Sukaratu, Kabupaten Tasikmalaya, Jawa Barat',
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
        confirmButtonColor: '#2563eb'
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
          html: `<div style="text-align:center;padding:10px 0;"><p style="margin:0 0 8px 0;color:#64748b;">Nomor Pendaftaran Resmi Anda:</p><div style="font-size:1.6rem;font-weight:800;color:#2563eb;letter-spacing:1px;background:#eff6ff;padding:12px;border-radius:12px;border:1px dashed #3b82f6;">${noPendaftaran}</div><p style="margin:14px 0 0 0;font-size:13px;color:#475569;">Simpan nomor ini untuk memeriksa kelulusan seleksi dan mencetak kartu peserta ujian.</p></div>`,
          confirmButtonText: 'Cek Status Sekarang',
          confirmButtonColor: '#2563eb'
        }).then(() => {
          setSearchNo(noPendaftaran);
          setTab('status');
          handleCheckStatusByNo(noPendaftaran);
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
        Swal.fire('Daftar Ulang Terkirim!', res.data.message, 'success');
        const submittedNo = duForm.no_pendaftaran;
        setSearchNo(submittedNo);
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
        handleCheckStatusByNo(submittedNo);
      }
    } catch (err) {
      Swal.fire('Gagal Daftar Ulang', err.response?.data?.message || 'Terjadi kesalahan', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatusByNo = async (targetNo) => {
    if (!targetNo) return;
    setLoading(true);
    setStatusResult(null);
    try {
      const res = await api.get(`/ppdb/check/${encodeURIComponent(targetNo.trim())}`);
      if (res.data.success) {
        setStatusResult(res.data.data);
      }
    } catch (err) {
      Swal.fire('Tidak Ditemukan', 'NISN atau Nomor Pendaftaran tidak terdaftar.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = (e) => {
    if (e) e.preventDefault();
    handleCheckStatusByNo(searchNo);
  };

  const handlePrintKartu = (data) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Kartu Peserta PPDB - ${data.nama_lengkap}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #1e293b; background: #fff; }
            .card { border: 2px solid #2563eb; border-radius: 16px; padding: 24px; max-width: 540px; margin: 0 auto; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
            .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 16px; }
            .header h2 { margin: 0; color: #2563eb; font-size: 18px; text-transform: uppercase; font-weight: 800; }
            .header h3 { margin: 4px 0 0 0; color: #0f172a; font-size: 15px; }
            .header p { margin: 4px 0 0 0; font-size: 11px; color: #64748b; }
            .info { font-size: 13px; line-height: 1.8; margin-top: 10px; }
            .info tr td { padding: 4px 6px; }
            .qr { text-align: center; margin-top: 18px; padding-top: 14px; border-top: 1px dashed #cbd5e1; }
            .badge { display: inline-block; padding: 4px 10px; border-radius: 6px; background: #eff6ff; color: #2563eb; font-weight: bold; font-size: 12px; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <h2>KARTU PESERTA PPDB 2026/2027</h2>
              <h3>${schoolData.nama_sekolah}</h3>
              <p>${schoolData.alamat || 'Portal Pendaftaran Siswa Baru Terpadu'}</p>
            </div>
            <table class="info" width="100%">
              <tr><td width="35%"><b>No. Registrasi</b></td><td>: <span class="badge">${data.no_pendaftaran}</span></td></tr>
              <tr><td><b>Nama Siswa</b></td><td>: <b>${data.nama_lengkap}</b></td></tr>
              <tr><td><b>NISN / NIK</b></td><td>: ${data.nisn || '-'} / ${data.nik || '-'}</td></tr>
              <tr><td><b>Jalur Seleksi</b></td><td>: ${data.jalur_pendaftaran}</td></tr>
              <tr><td><b>Pilihan Jurusan</b></td><td>: ${data.pilihan_jurusan || 'Umum'}</td></tr>
              <tr><td><b>Sekolah Asal</b></td><td>: ${data.sekolah_asal || '-'}</td></tr>
              <tr><td><b>Jadwal Ujian</b></td><td>: ${data.jadwal_tes ? new Date(data.jadwal_tes).toLocaleString('id-ID') : 'Menunggu Jadwal dari Panitia'}</td></tr>
              <tr><td><b>Lokasi Ujian</b></td><td>: ${data.lokasi_tes || 'Kampus Utama ' + schoolData.nama_sekolah}</td></tr>
            </table>
            <div class="qr">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(data.no_pendaftaran)}" alt="QR Code" />
              <p style="font-size:11px;color:#64748b;margin:6px 0 0 0;">Bawa kartu ini saat mengikuti verifikasi berkas fisik dan ujian seleksi.</p>
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
        return <span style={{ background: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0', padding: '6px 14px', borderRadius: 20, fontWeight: 800, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}><CheckCircle2 size={16} /> Resmi Diterima</span>;
      case 'Daftar Ulang':
        return <span style={{ background: '#e0f2fe', color: '#0369a1', border: '1px solid #bae6fd', padding: '6px 14px', borderRadius: 20, fontWeight: 800, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}><CheckSquare size={16} /> Siap Daftar Ulang</span>;
      case 'Lulus':
        return <span style={{ background: '#d1fae5', color: '#065f46', border: '1px solid #a7f3d0', padding: '6px 14px', borderRadius: 20, fontWeight: 800, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}><Award size={16} /> Lulus Seleksi</span>;
      case 'Ditolak':
        return <span style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca', padding: '6px 14px', borderRadius: 20, fontWeight: 800, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}><AlertCircle size={16} /> Tidak Lulus</span>;
      case 'Verifikasi':
        return <span style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a', padding: '6px 14px', borderRadius: 20, fontWeight: 800, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}><Clock size={16} /> Sedang Diverifikasi</span>;
      default:
        return <span style={{ background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', padding: '6px 14px', borderRadius: 20, fontWeight: 800, fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 6 }}><Clock size={16} /> Menunggu Seleksi</span>;
    }
  };

  const canDaftar = !schedule || isScheduleActive(schedule.is_pendaftaran_open, schedule.pendaftaran_buka, schedule.pendaftaran_tutup);
  const canDU = !schedule || isScheduleActive(schedule.is_daftar_ulang_open, schedule.daftar_ulang_buka, schedule.daftar_ulang_tutup);
  const canPengumuman = !schedule || isScheduleActive(schedule.is_pengumuman_open, schedule.pengumuman_buka, schedule.pengumuman_tutup);

  const scrollToTahapan = () => {
    if (tab !== 'beranda') {
      setTab('beranda');
      setTimeout(() => {
        document.getElementById('tahapan-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById('tahapan-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const faqs = [
    {
      q: 'Kapan pendaftaran PPDB 2026 dibuka?',
      a: 'Pendaftaran Gelombang 1 dibuka mulai sekarang secara online melalui website ini. Calon siswa dapat mendaftar kapan saja 24 jam tanpa perlu datang langsung ke sekolah.'
    },
    {
      q: 'Bagaimana jika ijazah asli SMP/MTs belum terbit?',
      a: 'Calon siswa dapat menggunakan Surat Keterangan Lulus (SKL) sementara atau Surat Keterangan Aktif dari pihak sekolah asal untuk mendaftar.'
    },
    {
      q: 'Apakah ada program beasiswa untuk siswa berprestasi & tahfidz?',
      a: 'Ya, kami menyediakan beasiswa bebas SPP dan potongan dana sumbangan pendidikan khusus bagi peraih juara perlombaan serta penghafal Al-Qur\'an minimal 1 Juz mutqin.'
    },
    {
      q: 'Bagaimana cara konfirmasi pendaftaran setelah mengisi formulir?',
      a: 'Setelah formulir dikirim, sistem akan mengirimkan pesan konfirmasi otomatis ke nomor WhatsApp Orang Tua/Wali yang didaftarkan. Anda dapat mencetak kartu peserta di menu Cek Kelulusan.'
    }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#edf2f7', color: '#0f172a', fontFamily: "'Plus Jakarta Sans', Inter, system-ui, sans-serif" }}>
      <style>{`
        /* GLOWING ANIMATIONS & MODERN DESIGN */
        @keyframes pulse-subtle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.03); }
        }
        @keyframes float-gentle {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .pulse-beacon {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
          animation: pulse-beacon-kf 1.8s infinite;
        }
        @keyframes pulse-beacon-kf {
          0% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7); }
          70% { box-shadow: 0 0 0 8px rgba(34, 197, 94, 0); }
          100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); }
        }

        /* VIBRANT COLORFUL HEADER */
        .ppdb-header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 55%, #0284c7 100%);
          border-bottom: 1px solid rgba(255, 255, 255, 0.16);
          box-shadow: 0 4px 24px rgba(15, 23, 42, 0.2);
        }
        .ppdb-nav-container {
          max-width: 1240px;
          margin: 0 auto;
          padding: 14px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .ppdb-brand {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
        }
        .ppdb-brand-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #1e3a8a;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
          flex-shrink: 0;
        }

        .ppdb-main-content {
          max-width: 1240px;
          margin: 0 auto;
          padding: 24px 20px 80px 20px;
        }

        /* HERO SECTION - SLEEK & COMPACT */
        .ppdb-hero {
          background: linear-gradient(135deg, #090e17 0%, #0f172a 45%, #1e293b 100%);
          border-radius: 22px;
          padding: 32px 32px;
          color: #ffffff;
          position: relative;
          overflow: hidden;
          margin-bottom: 30px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 16px 36px -8px rgba(15, 23, 42, 0.35);
        }
        .ppdb-hero-glow-1 {
          position: absolute;
          top: -20%;
          right: 15%;
          width: 420px;
          height: 420px;
          background: radial-gradient(circle, rgba(56, 189, 248, 0.2) 0%, transparent 65%);
          pointer-events: none;
          filter: blur(30px);
        }
        .ppdb-hero-glow-2 {
          position: absolute;
          bottom: -20%;
          left: -10%;
          width: 360px;
          height: 360px;
          background: radial-gradient(circle, rgba(37, 99, 235, 0.24) 0%, transparent 65%);
          pointer-events: none;
          filter: blur(40px);
        }
        .ppdb-hero-grid {
          display: grid;
          grid-template-columns: 1.25fr 0.9fr;
          gap: 26px;
          align-items: center;
          position: relative;
          z-index: 2;
        }

        /* GLASS CARD WIDGET */
        .ppdb-glass-widget {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 20px;
          padding: 20px 22px;
          box-shadow: 0 14px 30px rgba(0, 0, 0, 0.25);
          animation: float-gentle 6s ease-in-out infinite;
        }

        .gradient-headline {
          background: linear-gradient(135deg, #ffffff 30%, #38bdf8 70%, #93c5fd 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* HIGH-CONTRAST BENTO CARDS */
        .ppdb-bento-card {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 20px;
          padding: 26px;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          gap: 14px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 10px 25px -4px rgba(15, 23, 42, 0.08);
        }
        .ppdb-bento-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 36px -4px rgba(15, 23, 42, 0.14);
          border-color: #94a3b8;
        }

        .ppdb-section-box {
          background: #ffffff;
          border-radius: 24px;
          border: 1px solid #cbd5e1;
          padding: 36px;
          box-shadow: 0 10px 30px rgba(15, 23, 42, 0.07);
          margin-bottom: 36px;
        }

        .ppdb-grid-4 {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        .ppdb-grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .ppdb-grid-2 {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }

        .ppdb-form-card {
          background: #ffffff;
          border-radius: 24px;
          border: 1px solid #cbd5e1;
          box-shadow: 0 16px 40px rgba(15, 23, 42, 0.1);
          overflow: hidden;
        }
        .ppdb-input-field {
          width: 100%;
          padding: 13px 16px;
          border-radius: 12px;
          border: 1px solid #cbd5e1;
          font-size: 14px;
          background: #ffffff;
          color: #0f172a;
          box-sizing: border-box;
          transition: all 0.2s ease;
        }
        .ppdb-input-field:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15);
        }

        .faq-item {
          background: #ffffff;
          border: 1px solid #cbd5e1;
          border-radius: 16px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(15, 23, 42, 0.04);
        }
        .faq-item:hover {
          border-color: #94a3b8;
          background: #f8fafc;
        }

        @media (max-width: 960px) {
          .ppdb-hero-grid { grid-template-columns: 1fr; }
          .ppdb-grid-4 { grid-template-columns: repeat(2, 1fr); }
          .ppdb-grid-3 { grid-template-columns: 1fr; }
          .ppdb-hero { padding: 36px 24px; }
        }
        @media (max-width: 640px) {
          .ppdb-main-content { padding: 14px 12px 60px 12px; }
          .ppdb-grid-4 { grid-template-columns: 1fr; }
          .ppdb-grid-2 { grid-template-columns: 1fr; }
          .ppdb-hero { padding: 28px 18px; border-radius: 20px; }
          .ppdb-section-box { padding: 24px 16px; }
        }
      `}</style>

      {/* VIBRANT COLORFUL HEADER */}
      <header className="ppdb-header">
        <div className="ppdb-nav-container">
          {/* LOGO & BRANDING */}
          <div className="ppdb-brand" onClick={() => setTab('beranda')}>
            <div className="ppdb-brand-icon">
              <School size={24} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <h1 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.3px' }}>
                  {schoolData.nama_sekolah}
                </h1>
                <span style={{ background: 'rgba(255, 255, 255, 0.22)', color: '#ffffff', padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 800, border: '1px solid rgba(255, 255, 255, 0.3)' }}>
                  PPDB 2026
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 11, color: '#93c5fd', fontWeight: 600 }}>
                Portal Resmi Penerimaan Peserta Didik Baru Online
              </p>
            </div>
          </div>

          {/* SINGLE NAV ACTION: TAHAPAN PENDAFTARAN */}
          <div>
            <button 
              onClick={scrollToTahapan}
              style={{
                background: 'rgba(255, 255, 255, 0.18)',
                color: '#ffffff',
                border: '1px solid rgba(255, 255, 255, 0.32)',
                padding: '10px 20px',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 800,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                backdropFilter: 'blur(8px)',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}
            >
              <Layers size={16} /> Tahapan Pendaftaran
            </button>
          </div>
        </div>
      </header>

      <main className="ppdb-main-content">
        {/* BACK TO BERANDA BUTTON (VISIBLE WHEN NOT IN BERANDA) */}
        {tab !== 'beranda' && (
          <div style={{ marginBottom: 20 }}>
            <button 
              onClick={() => setTab('beranda')}
              style={{
                background: '#ffffff',
                color: '#1e3a8a',
                border: '1px solid #cbd5e1',
                padding: '10px 18px',
                borderRadius: 12,
                fontWeight: 800,
                fontSize: 13,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.05)'
              }}
            >
              <ArrowLeft size={16} /> Kembali ke Beranda & Informasi PPDB
            </button>
          </div>
        )}

        {/* HERO SECTION - REFINED COMPACT */}
        <section className="ppdb-hero">
          <div className="ppdb-hero-glow-1" />
          <div className="ppdb-hero-glow-2" />

          <div className="ppdb-hero-grid">
            {/* LEFT COLUMN: HEADLINE & ACTIONS */}
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.16)', padding: '4px 12px', borderRadius: 20, marginBottom: 12 }}>
                <div className="pulse-beacon" style={{ width: 6, height: 6 }} />
                <span style={{ fontSize: 11, fontWeight: 800, color: '#38bdf8', letterSpacing: '0.4px' }}>
                  GELOMBANG 1 DIBUKA • T.A 2026/2027
                </span>
              </div>

              <h2 style={{ fontSize: 'clamp(1.35rem, 2.2vw, 1.75rem)', fontWeight: 800, lineHeight: 1.3, margin: '0 0 10px 0', letterSpacing: '-0.4px' }}>
                Wujudkan Potensi Terbaikmu di<br />
                <span className="gradient-headline">{schoolData.nama_sekolah}</span>
              </h2>

              <p style={{ margin: '0 0 18px 0', color: '#cbd5e1', fontSize: 13, lineHeight: 1.6, maxWidth: 500 }}>
                Sekolah unggulan berkarakter Islami dengan fasilitas modern dan kurikulum terpadu. Daftarkan diri Anda sekarang secara online langsung dari rumah dengan proses cepat, transparan, dan terpercaya.
              </p>

              {/* ACTION CTA BUTTONS (REFINED COMPACT SIZES) */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
                <button 
                  onClick={() => setTab('daftar')}
                  style={{
                    background: 'linear-gradient(135deg, #2563eb 0%, #0284c7 100%)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '9px 18px',
                    borderRadius: 10,
                    fontWeight: 800,
                    fontSize: 12.5,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 7,
                    boxShadow: '0 6px 18px rgba(37, 99, 235, 0.35)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <UserPlus size={15} /> Daftar Siswa Baru Sekarang
                </button>

                <button 
                  onClick={() => setTab('status')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.22)',
                    padding: '9px 15px',
                    borderRadius: 10,
                    fontWeight: 700,
                    fontSize: 12.5,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 7,
                    backdropFilter: 'blur(8px)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Search size={15} /> Cek Hasil Seleksi & Kartu
                </button>

                <button 
                  onClick={() => setTab('daftar_ulang')}
                  style={{
                    background: 'rgba(16, 185, 129, 0.15)',
                    color: '#34d399',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                    padding: '9px 15px',
                    borderRadius: 10,
                    fontWeight: 700,
                    fontSize: 12.5,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 7,
                    backdropFilter: 'blur(8px)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <CheckSquare size={15} /> Daftar Ulang
                </button>
              </div>

              {/* TRUST RIBBON STATS (COMPACT CHIPS) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', paddingTop: 14, borderTop: '1px solid rgba(255, 255, 255, 0.12)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: '#e2e8f0', fontWeight: 700 }}>
                  <Star size={14} color="#fbbf24" fill="#fbbf24" /> Akreditasi A (Unggul)
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: '#e2e8f0', fontWeight: 700 }}>
                  <Award size={14} color="#38bdf8" /> Beasiswa Prestasi & Tahfidz
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11.5, color: '#e2e8f0', fontWeight: 700 }}>
                  <ShieldCheck size={14} color="#34d399" /> 100% Pendaftaran Online
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: INTERACTIVE STATUS CARD & SEARCH WIDGET */}
            <div>
              <div className="ppdb-glass-widget">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div>
                    <span style={{ fontSize: 10, fontWeight: 800, color: '#38bdf8', letterSpacing: '0.5px' }}>INFO LIVE PENDAFTARAN</span>
                    <h3 style={{ margin: '2px 0 0 0', fontSize: 16, fontWeight: 800, color: '#ffffff' }}>PPDB Online 2026</h3>
                  </div>
                  <div style={{ background: 'rgba(34, 197, 94, 0.2)', border: '1px solid rgba(34, 197, 94, 0.4)', padding: '3px 10px', borderRadius: 16, fontSize: 10.5, color: '#4ade80', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div className="pulse-beacon" style={{ width: 6, height: 6 }} /> Aktif & Terbuka
                  </div>
                </div>

                <div style={{ background: 'rgba(15, 23, 42, 0.5)', borderRadius: 14, padding: '14px 16px', border: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <span style={{ fontSize: 11.5, color: '#94a3b8' }}>Periode Pendaftaran:</span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#f8fafc' }}>Gelombang 1</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingBottom: 8, borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                    <span style={{ fontSize: 11.5, color: '#94a3b8' }}>Pilihan Jalur:</span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#38bdf8' }}>Reguler, Prestasi, Tahfidz, Afirmasi</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11.5, color: '#94a3b8' }}>Layanan Konfirmasi:</span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#4ade80' }}>WhatsApp Notifikasi Otomatis</span>
                  </div>
                </div>

                {/* FAST TRACK QUICK SEARCH */}
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#cbd5e1', marginBottom: 6 }}>
                    Cek Status Cepat dengan NISN:
                  </label>
                  <form onSubmit={handleCheckStatus} style={{ display: 'flex', gap: 6 }}>
                    <input 
                      type="text" 
                      placeholder="Masukkan 10 Digit NISN..." 
                      value={searchNo}
                      onChange={(e) => setSearchNo(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        borderRadius: 9,
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: '#ffffff',
                        fontSize: 12,
                        outline: 'none'
                      }}
                    />
                    <button 
                      type="submit"
                      onClick={() => setTab('status')}
                      style={{
                        background: '#38bdf8',
                        color: '#0f172a',
                        border: 'none',
                        padding: '8px 14px',
                        borderRadius: 9,
                        fontWeight: 800,
                        cursor: 'pointer',
                        fontSize: 12
                      }}
                    >
                      Cari
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* TAB CONTENT: BERANDA & INFORMASI */}
        {tab === 'beranda' && (
          <div>
            {/* SECTION 1: JALUR PENDAFTARAN BENTO */}
            <section style={{ marginBottom: 48 }}>
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 800, letterSpacing: '0.4px' }}>
                  PILIHAN JALUR SELEKSI
                </span>
                <h3 style={{ margin: '8px 0 6px 0', fontSize: 26, fontWeight: 800, color: '#0f172a' }}>
                  Pilih Jalur Sesuai Bakat & Kualifikasi Anda
                </h3>
                <p style={{ margin: 0, color: '#475569', fontSize: 14 }}>
                  Tersedia beragam jalur penerimaan siswa baru dengan kuota dan kriteria seleksi yang transparan.
                </p>
              </div>

              <div className="ppdb-grid-4">
                {/* 1. REGULER */}
                <div className="ppdb-bento-card" style={{ borderTop: '5px solid #2563eb' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BookOpen size={22} />
                  </div>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#1d4ed8', background: '#dbeafe', padding: '3px 8px', borderRadius: 6 }}>KUOTA TERBESAR</span>
                    <h4 style={{ margin: '8px 0 4px 0', fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Jalur Reguler</h4>
                    <p style={{ margin: 0, color: '#475569', fontSize: 13, lineHeight: 1.6 }}>
                      Terbuka bagi seluruh lulusan SMP/MTs sederajat melalui seleksi potensi akademik dan wawancara minat bakat.
                    </p>
                  </div>
                  <ul style={{ margin: 'auto 0 0 0', padding: 0, listStyle: 'none', fontSize: 12, color: '#334155', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Check size={14} color="#16a34a" /> Lulusan SMP/MTs sederajat</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Check size={14} color="#16a34a" /> Tes potensi akademik dasar</li>
                  </ul>
                </div>

                {/* 2. PRESTASI */}
                <div className="ppdb-bento-card" style={{ borderTop: '5px solid #0284c7' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Award size={22} />
                  </div>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#0369a1', background: '#bae6fd', padding: '3px 8px', borderRadius: 6 }}>BEBAS TES TULIS</span>
                    <h4 style={{ margin: '8px 0 4px 0', fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Jalur Prestasi</h4>
                    <p style={{ margin: 0, color: '#475569', fontSize: 13, lineHeight: 1.6 }}>
                      Khusus peraih peringkat kelas atau juara perlombaan sains, seni, olahraga, dan riset tingkat kota/provinsi.
                    </p>
                  </div>
                  <ul style={{ margin: 'auto 0 0 0', padding: 0, listStyle: 'none', fontSize: 12, color: '#334155', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Check size={14} color="#16a34a" /> Sertifikat/Piagam Kejuaraan</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Check size={14} color="#16a34a" /> Prioritas kuota penerimaan</li>
                  </ul>
                </div>

                {/* 3. TAHFIDZ */}
                <div className="ppdb-bento-card" style={{ borderTop: '5px solid #d97706' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Sparkles size={22} />
                  </div>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#b45309', background: '#fde68a', padding: '3px 8px', borderRadius: 6 }}>BEASISWA PENUH</span>
                    <h4 style={{ margin: '8px 0 4px 0', fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Jalur Tahfidz</h4>
                    <p style={{ margin: 0, color: '#475569', fontSize: 13, lineHeight: 1.6 }}>
                      Program beasiswa spesial bagi calon siswa penghafal Al-Qur'an (minimal 1 Juz mutqin) dengan bimbingan istiqomah.
                    </p>
                  </div>
                  <ul style={{ margin: 'auto 0 0 0', padding: 0, listStyle: 'none', fontSize: 12, color: '#334155', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Check size={14} color="#16a34a" /> Uji hafalan Al-Qur'an</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Check size={14} color="#16a34a" /> Bebas biaya SPP bulanan</li>
                  </ul>
                </div>

                {/* 4. AFIRMASI */}
                <div className="ppdb-bento-card" style={{ borderTop: '5px solid #7c3aed' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f5f3ff', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <HeartHandshake size={22} />
                  </div>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#6d28d9', background: '#ede9fe', padding: '3px 8px', borderRadius: 6 }}>BANTUAN PENDIDIKAN</span>
                    <h4 style={{ margin: '8px 0 4px 0', fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Jalur Afirmasi</h4>
                    <p style={{ margin: 0, color: '#475569', fontSize: 13, lineHeight: 1.6 }}>
                      Diberikan bagi keluarga prasejahtera pemegang kartu KIP/PKH/KKS untuk memastikan setiap anak bisa sekolah.
                    </p>
                  </div>
                  <ul style={{ margin: 'auto 0 0 0', padding: 0, listStyle: 'none', fontSize: 12, color: '#334155', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Check size={14} color="#16a34a" /> Kartu KIP / PKH aktif</li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Check size={14} color="#16a34a" /> Subsidi biaya seragam</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* SECTION 2: TAHAPAN PENDAFTARAN (DENGAN ID UNTUK SCROLLING) */}
            <section id="tahapan-section" className="ppdb-section-box">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
                <div>
                  <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 800 }}>
                    TAHAPAN RESMI
                  </span>
                  <h3 style={{ margin: '8px 0 4px 0', fontSize: 24, fontWeight: 800, color: '#0f172a' }}>
                    Tahapan Pendaftaran Siswa Baru
                  </h3>
                  <p style={{ margin: 0, color: '#475569', fontSize: 14 }}>
                    Selesaikan proses seleksi dari awal hingga daftar ulang hanya dalam 4 tahapan
                  </p>
                </div>
                <button 
                  onClick={() => setTab('daftar')}
                  style={{
                    background: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: 12,
                    fontWeight: 800,
                    fontSize: 14,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.28)'
                  }}
                >
                  Mulai Pendaftaran Online <ArrowRight size={16} />
                </button>
              </div>

              <div className="ppdb-grid-4">
                <div style={{ background: '#f8fafc', padding: 22, borderRadius: 18, border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15 }}>
                      1
                    </div>
                    <UserPlus size={20} color="#2563eb" />
                  </div>
                  <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Isi Formulir Online</h4>
                  <p style={{ margin: 0, fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
                    Klik tombol daftar, isi data calon siswa dan nomor WhatsApp orang tua. Simpan No. Pendaftaran yang muncul.
                  </p>
                </div>

                <div style={{ background: '#f8fafc', padding: 22, borderRadius: 18, border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: '#0284c7', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15 }}>
                      2
                    </div>
                    <FileText size={20} color="#0284c7" />
                  </div>
                  <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Tes Seleksi & Wawancara</h4>
                  <p style={{ margin: 0, fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
                    Hadir sesuai jadwal ujian di kartu peserta untuk tes potensi akademik, wawancara motivasi, dan baca Al-Qur'an.
                  </p>
                </div>

                <div style={{ background: '#f8fafc', padding: 22, borderRadius: 18, border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: '#16a34a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15 }}>
                      3
                    </div>
                    <Award size={20} color="#16a34a" />
                  </div>
                  <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Pengumuman Kelulusan</h4>
                  <p style={{ margin: 0, fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
                    Periksa status kelulusan secara online pada menu Cek Kelulusan menggunakan nomor registrasi Anda dan cetak kartu.
                  </p>
                </div>

                <div style={{ background: '#f8fafc', padding: 22, borderRadius: 18, border: '1px solid #cbd5e1', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: '#7c3aed', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15 }}>
                      4
                    </div>
                    <CheckSquare size={20} color="#7c3aed" />
                  </div>
                  <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Daftar Ulang & Seragam</h4>
                  <p style={{ margin: 0, fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
                    Calon siswa yang dinyatakan lulus melengkapi form daftar ulang, ukuran seragam sekolah, dan upload berkas kelulusan.
                  </p>
                </div>
              </div>
            </section>

            {/* SECTION 3: SYARAT BERKAS & JADWAL */}
            <div className="ppdb-grid-2" style={{ marginBottom: 48 }}>
              {/* PERSYARATAN BERKAS */}
              <div style={{ background: '#ffffff', borderRadius: 24, border: '1px solid #cbd5e1', padding: 32, boxShadow: '0 10px 25px -4px rgba(15, 23, 42, 0.06)' }}>
                <h3 style={{ margin: '0 0 18px 0', fontSize: 20, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <FileText size={22} color="#2563eb" /> Persyaratan Dokumen Berkas
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontSize: 13, color: '#334155' }}>
                    <CheckCircle2 size={18} color="#16a34a" style={{ marginTop: 2, flexShrink: 0 }} />
                    <span>Fotokopi Ijazah SMP/MTs dilegalisir (atau Surat Keterangan Lulus / SKL jika belum terbit).</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontSize: 13, color: '#334155' }}>
                    <CheckCircle2 size={18} color="#16a34a" style={{ marginTop: 2, flexShrink: 0 }} />
                    <span>Fotokopi Kartu Keluarga (KK) & Akta Kelahiran calon peserta didik.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontSize: 13, color: '#334155' }}>
                    <CheckCircle2 size={18} color="#16a34a" style={{ marginTop: 2, flexShrink: 0 }} />
                    <span>Nomor Induk Siswa Nasional (NISN) dan NIK yang valid.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontSize: 13, color: '#334155' }}>
                    <CheckCircle2 size={18} color="#16a34a" style={{ marginTop: 2, flexShrink: 0 }} />
                    <span>Pas Foto resmi ukuran 3x4 (latar belakang merah/biru) sebanyak 2 lembar.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, fontSize: 13, color: '#334155' }}>
                    <CheckCircle2 size={18} color="#16a34a" style={{ marginTop: 2, flexShrink: 0 }} />
                    <span>Sertifikat/Piagam Prestasi atau Kartu KIP (khusus pendaftar Jalur Prestasi/Afirmasi).</span>
                  </div>
                </div>
              </div>

              {/* JADWAL KEGIATAN */}
              <div style={{ background: '#ffffff', borderRadius: 24, border: '1px solid #cbd5e1', padding: 32, boxShadow: '0 10px 25px -4px rgba(15, 23, 42, 0.06)' }}>
                <h3 style={{ margin: '0 0 18px 0', fontSize: 20, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Calendar size={22} color="#2563eb" /> Jadwal Kegiatan PPDB 2026
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f8fafc', borderRadius: 14, border: '1px solid #cbd5e1' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 14, color: '#0f172a' }}>Pendaftaran Gelombang 1</div>
                      <div style={{ fontSize: 12, color: '#475569' }}>Pendaftaran online & upload berkas</div>
                    </div>
                    <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 800 }}>
                      {canDaftar ? 'Sedang Dibuka' : 'Ditutup'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f8fafc', borderRadius: 14, border: '1px solid #cbd5e1' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 14, color: '#0f172a' }}>Tes Seleksi & Wawancara</div>
                      <div style={{ fontSize: 12, color: '#475569' }}>Sesuai tanggal pada kartu peserta ujian</div>
                    </div>
                    <span style={{ background: '#e0f2fe', color: '#0284c7', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 800 }}>
                      Terjadwal
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f8fafc', borderRadius: 14, border: '1px solid #cbd5e1' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 14, color: '#0f172a' }}>Pengumuman Hasil Seleksi</div>
                      <div style={{ fontSize: 12, color: '#475569' }}>Dapat dicek melalui portal secara online</div>
                    </div>
                    <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 800 }}>
                      {canPengumuman ? 'Hasil Terbuka' : 'Menunggu'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f8fafc', borderRadius: 14, border: '1px solid #cbd5e1' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 14, color: '#0f172a' }}>Pendaftaran Ulang & Seragam</div>
                      <div style={{ fontSize: 12, color: '#475569' }}>Bagi seluruh peserta yang dinyatakan lulus</div>
                    </div>
                    <span style={{ background: '#f1f5f9', color: '#475569', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 800 }}>
                      {canDU ? 'Aktif' : 'Terjadwal'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 4: FAQ ACCORDION */}
            <section style={{ marginBottom: 48 }}>
              <div style={{ textAlign: 'center', marginBottom: 28 }}>
                <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '4px 14px', borderRadius: 20, fontSize: 12, fontWeight: 800 }}>
                  PUSAT BANTUAN
                </span>
                <h3 style={{ margin: '8px 0 6px 0', fontSize: 24, fontWeight: 800, color: '#0f172a' }}>
                  Pertanyaan yang Sering Diajukan (FAQ)
                </h3>
                <p style={{ margin: 0, color: '#475569', fontSize: 14 }}>
                  Informasi umum seputar pendaftaran peserta didik baru di {schoolData.nama_sekolah}
                </p>
              </div>

              <div style={{ maxWidth: 880, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {faqs.map((f, idx) => (
                  <div 
                    key={idx} 
                    className="faq-item" 
                    onClick={() => setActiveFaq(activeFaq === idx ? -1 : idx)}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 800, fontSize: 15, color: '#0f172a' }}>
                      <span>{f.q}</span>
                      <ChevronDown size={18} color="#64748b" style={{ transform: activeFaq === idx ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                    </div>
                    {activeFaq === idx && (
                      <p style={{ margin: '12px 0 0 0', color: '#475569', fontSize: 14, lineHeight: 1.6, borderTop: '1px solid #cbd5e1', paddingTop: 12 }}>
                        {f.a}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {/* CALL CENTER CARD */}
            <section style={{ background: 'linear-gradient(135deg, #090e17 0%, #1e293b 100%)', color: '#ffffff', borderRadius: 24, padding: '40px 36px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
              <div>
                <span style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8', padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 800 }}>
                  PANITIA SIAP MEMBANTU
                </span>
                <h3 style={{ margin: '10px 0 6px 0', fontSize: 24, fontWeight: 800 }}>
                  Mengalami Kendala Saat Pendaftaran?
                </h3>
                <p style={{ margin: 0, color: '#cbd5e1', fontSize: 14, maxWidth: 540, lineHeight: 1.6 }}>
                  Hubungi layanan pelanggan panitia PPDB {schoolData.nama_sekolah}. Layanan konsultasi dibuka setiap hari kerja pukul 08:00 - 15:00 WIB.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <a 
                  href={`https://wa.me/${cleanPhone}?text=Halo%20Panitia%20PPDB%20${encodeURIComponent(schoolData.nama_sekolah)},%20saya%20memerlukan%20bantuan%20seputar%20pendaftaran`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    background: '#22c55e',
                    color: '#ffffff',
                    padding: '14px 24px',
                    borderRadius: 14,
                    fontWeight: 800,
                    fontSize: 15,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 10,
                    boxShadow: '0 8px 20px rgba(34, 197, 94, 0.35)'
                  }}
                >
                  <MessageCircle size={18} /> Chat WhatsApp Panitia
                </a>
              </div>
            </section>
          </div>
        )}

        {/* TAB CONTENT: FORMULIR PENDAFTARAN */}
        {tab === 'daftar' && (
          <div className="ppdb-form-card">
            <div style={{ height: 6, background: 'linear-gradient(90deg, #2563eb 0%, #0284c7 50%, #38bdf8 100%)' }} />

            <div style={{ padding: '36px 32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
                <div>
                  <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 800 }}>
                    FORMULIR REGISTRASI RESMI
                  </span>
                  <h2 style={{ margin: '8px 0 4px 0', fontSize: 24, fontWeight: 800, color: '#0f172a' }}>
                    Formulir Pendaftaran Siswa Baru (PPDB 2026)
                  </h2>
                  <p style={{ margin: 0, color: '#475569', fontSize: 14 }}>
                    Pastikan seluruh data yang Anda masukkan sesuai dengan dokumen resmi (KK, Akta Kelahiran, dan Ijazah).
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '8px 16px', borderRadius: 20, color: '#16a34a', fontWeight: 800, fontSize: 13 }}>
                  <ShieldCheck size={18} /> 100% Data Terenkripsi & Aman
                </div>
              </div>

              {!canDaftar && (
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: 18, borderRadius: 16, marginBottom: 28, display: 'flex', alignItems: 'center', gap: 14 }}>
                  <AlertCircle size={24} color="#d97706" />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: '#92400e' }}>Periode Pendaftaran Telah Ditutup / Belum Dibuka</div>
                    <div style={{ fontSize: 13, color: '#b45309' }}>Anda tetap dapat melihat alur informasi atau memeriksa hasil seleksi jika sudah pernah mendaftar.</div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmitRegister}>
                {/* 1. DATA PRIBADI */}
                <div style={{ background: '#f8fafc', padding: 24, borderRadius: 18, border: '1px solid #cbd5e1', borderLeft: '5px solid #2563eb', marginBottom: 28 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: '#2563eb', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14 }}>
                      1
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Data Calon Peserta Didik</h4>
                      <p style={{ margin: 0, fontSize: 12, color: '#475569' }}>Wajib sesuai Kartu Keluarga (KK) & Akta Kelahiran</p>
                    </div>
                  </div>

                  <div className="ppdb-grid-2">
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ display: 'block', fontWeight: 700, fontSize: 13, color: '#1e293b', marginBottom: 6 }}>
                        Nama Lengkap Siswa <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input 
                        type="text" 
                        name="nama_lengkap" 
                        value={formData.nama_lengkap} 
                        onChange={handleInputChange} 
                        required 
                        placeholder="Nama lengkap tanpa gelar" 
                        className="ppdb-input-field" 
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontWeight: 700, fontSize: 13, color: '#1e293b', marginBottom: 6 }}>
                        NIK Siswa (16 Digit) <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input 
                        type="text" 
                        name="nik" 
                        value={formData.nik} 
                        onChange={handleInputChange} 
                        required 
                        maxLength={16}
                        placeholder="Contoh: 3206123456780001" 
                        className="ppdb-input-field" 
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontWeight: 700, fontSize: 13, color: '#1e293b', marginBottom: 6 }}>
                        NISN (10 Digit) <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input 
                        type="text" 
                        name="nisn" 
                        value={formData.nisn} 
                        onChange={handleInputChange} 
                        required 
                        maxLength={10}
                        placeholder="Nomor NISN dari SMP/MTs" 
                        className="ppdb-input-field" 
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontWeight: 700, fontSize: 13, color: '#1e293b', marginBottom: 6 }}>
                        Jenis Kelamin <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <select name="jenis_kelamin" value={formData.jenis_kelamin} onChange={handleInputChange} required className="ppdb-input-field">
                        <option value="L">Laki-laki</option>
                        <option value="P">Perempuan</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontWeight: 700, fontSize: 13, color: '#1e293b', marginBottom: 6 }}>
                        Tempat Lahir <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input type="text" name="tempat_lahir" value={formData.tempat_lahir} onChange={handleInputChange} required placeholder="Kota kelahiran" className="ppdb-input-field" />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontWeight: 700, fontSize: 13, color: '#1e293b', marginBottom: 6 }}>
                        Tanggal Lahir <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input type="date" name="tanggal_lahir" value={formData.tanggal_lahir} onChange={handleInputChange} required className="ppdb-input-field" />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontWeight: 700, fontSize: 13, color: '#1e293b', marginBottom: 6 }}>
                        Agama <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <select name="agama" value={formData.agama} onChange={handleInputChange} required className="ppdb-input-field">
                        <option value="Islam">Islam</option>
                        <option value="Kristen">Kristen</option>
                        <option value="Katolik">Katolik</option>
                        <option value="Hindu">Hindu</option>
                        <option value="Buddha">Buddha</option>
                        <option value="Konghucu">Konghucu</option>
                      </select>
                    </div>

                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={{ display: 'block', fontWeight: 700, fontSize: 13, color: '#1e293b', marginBottom: 6 }}>
                        Alamat Tempat Tinggal Lengkap <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <textarea name="alamat" value={formData.alamat} onChange={handleInputChange} required rows={2} placeholder="Jalan, RT/RW, Dusun/Kelurahan, Kecamatan, Kota/Kabupaten" className="ppdb-input-field" style={{ fontFamily: 'inherit' }} />
                    </div>
                  </div>
                </div>

                {/* 2. DATA AKADEMIK */}
                <div style={{ background: '#f8fafc', padding: 24, borderRadius: 18, border: '1px solid #cbd5e1', borderLeft: '5px solid #0284c7', marginBottom: 28 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: '#0284c7', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14 }}>
                      2
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Data Sekolah Asal & Pilihan Jalur</h4>
                      <p style={{ margin: 0, fontSize: 12, color: '#475569' }}>Informasi sekolah jenjang sebelumnya dan peminatan</p>
                    </div>
                  </div>

                  <div className="ppdb-grid-2">
                    <div>
                      <label style={{ display: 'block', fontWeight: 700, fontSize: 13, color: '#1e293b', marginBottom: 6 }}>
                        Nama Sekolah Asal (SMP / MTs) <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input type="text" name="sekolah_asal" value={formData.sekolah_asal} onChange={handleInputChange} required placeholder="Contoh: SMP Negeri 1 Sukaratu" className="ppdb-input-field" />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontWeight: 700, fontSize: 13, color: '#1e293b', marginBottom: 6 }}>
                        Tahun Lulus <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input type="text" name="tahun_lulus" value={formData.tahun_lulus} onChange={handleInputChange} required placeholder="2026" className="ppdb-input-field" />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontWeight: 700, fontSize: 13, color: '#1e293b', marginBottom: 6 }}>
                        Jalur Pendaftaran <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <select name="jalur_pendaftaran" value={formData.jalur_pendaftaran} onChange={handleInputChange} required className="ppdb-input-field">
                        <option value="Reguler">Jalur Reguler / Umum</option>
                        <option value="Prestasi">Jalur Prestasi Akademik/Non-Akademik</option>
                        <option value="Tahfidz">Jalur Tahfidz Al-Qur'an / Beasiswa</option>
                        <option value="Afirmasi">Jalur Afirmasi / Kurang Mampu (KIP)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontWeight: 700, fontSize: 13, color: '#1e293b', marginBottom: 6 }}>
                        Pilihan Program / Jurusan <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <select name="pilihan_jurusan" value={formData.pilihan_jurusan} onChange={handleInputChange} required className="ppdb-input-field">
                        <option value="Umum">Umum / Reguler</option>
                        <option value="IPA">MIPA (Matematika & IPA)</option>
                        <option value="IPS">IPS (Ilmu Pengetahuan Sosial)</option>
                        <option value="Keagamaan">Program Keagamaan / Keislaman</option>
                        <option value="Komputer">Teknik Komputer & Informatika</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 3. DATA ORANG TUA & WA */}
                <div style={{ background: '#f8fafc', padding: 24, borderRadius: 18, border: '1px solid #cbd5e1', borderLeft: '5px solid #16a34a', marginBottom: 32 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: '#16a34a', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14 }}>
                      3
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Data Orang Tua & Kontak WhatsApp</h4>
                      <p style={{ margin: 0, fontSize: 12, color: '#475569' }}>Nomor WhatsApp wajib aktif untuk pengiriman bukti pendaftaran</p>
                    </div>
                  </div>

                  <div className="ppdb-grid-2">
                    <div>
                      <label style={{ display: 'block', fontWeight: 700, fontSize: 13, color: '#1e293b', marginBottom: 6 }}>
                        Nama Ayah Kandung / Wali <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input type="text" name="nama_ayah" value={formData.nama_ayah} onChange={handleInputChange} required placeholder="Nama lengkap Ayah" className="ppdb-input-field" />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontWeight: 700, fontSize: 13, color: '#1e293b', marginBottom: 6 }}>Pekerjaan Ayah</label>
                      <input type="text" name="pekerjaan_ayah" value={formData.pekerjaan_ayah} onChange={handleInputChange} placeholder="PNS / Swasta / Wiraswasta / Buruh" className="ppdb-input-field" />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontWeight: 700, fontSize: 13, color: '#1e293b', marginBottom: 6 }}>
                        Nama Ibu Kandung <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input type="text" name="nama_ibu" value={formData.nama_ibu} onChange={handleInputChange} required placeholder="Nama lengkap Ibu" className="ppdb-input-field" />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontWeight: 700, fontSize: 13, color: '#1e293b', marginBottom: 6 }}>Pekerjaan Ibu</label>
                      <input type="text" name="pekerjaan_ibu" value={formData.pekerjaan_ibu} onChange={handleInputChange} placeholder="Ibu Rumah Tangga / PNS / Swasta" className="ppdb-input-field" />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontWeight: 700, fontSize: 13, color: '#1e293b', marginBottom: 6 }}>
                        Nomor WhatsApp Ortu / Wali <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input type="text" name="no_hp_ortu" value={formData.no_hp_ortu} onChange={handleInputChange} required placeholder="Contoh: 081234567890" className="ppdb-input-field" />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontWeight: 700, fontSize: 13, color: '#1e293b', marginBottom: 6 }}>Email Ortu (Opsional)</label>
                      <input type="email" name="email_ortu" value={formData.email_ortu} onChange={handleInputChange} placeholder="email@gmail.com" className="ppdb-input-field" />
                    </div>
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <button 
                  type="submit" 
                  disabled={loading} 
                  style={{ 
                    width: '100%', 
                    padding: '16px 24px', 
                    borderRadius: 14, 
                    border: 'none', 
                    background: 'linear-gradient(135deg, #2563eb 0%, #0284c7 100%)', 
                    color: '#ffffff', 
                    fontWeight: 800, 
                    fontSize: 16, 
                    cursor: 'pointer', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: 10, 
                    boxShadow: '0 8px 25px rgba(37, 99, 235, 0.35)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Send size={20} /> {loading ? 'Memproses Pendaftaran...' : 'Kirim Formulir Pendaftaran PPDB'}
                </button>

                <div style={{ marginTop: 14, textAlign: 'center', color: '#475569', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <Phone size={15} color="#16a34a" /> Konfirmasi pendaftaran dan nomor registrasi akan dikirim otomatis ke WhatsApp.
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB CONTENT: CEK KELULUSAN & KARTU */}
        {tab === 'status' && (
          <div className="ppdb-form-card">
            <div style={{ height: 6, background: 'linear-gradient(90deg, #0284c7 0%, #38bdf8 100%)' }} />
            <div style={{ padding: '36px 32px' }}>
              <div style={{ marginBottom: 24 }}>
                <span style={{ background: '#e0f2fe', color: '#0284c7', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 800 }}>
                  CEK HASIL ONLINE
                </span>
                <h3 style={{ margin: '8px 0 4px 0', fontSize: 24, fontWeight: 800, color: '#0f172a' }}>
                  Cek Status Seleksi & Cetak Kartu Peserta
                </h3>
                <p style={{ margin: 0, color: '#475569', fontSize: 14 }}>
                  Masukkan NISN calon siswa (atau Nomor Pendaftaran resmi) yang telah didaftarkan.
                </p>
              </div>

              <form onSubmit={handleCheckStatus} style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
                <input 
                  type="text" 
                  value={searchNo} 
                  onChange={(e) => setSearchNo(e.target.value)} 
                  placeholder="Ketik NISN Siswa (Contoh: 0081234567) atau No. Pendaftaran" 
                  className="ppdb-input-field" 
                  style={{ flex: 1, minWidth: 260 }} 
                />
                <button 
                  type="submit" 
                  disabled={loading} 
                  style={{ 
                    padding: '13px 28px', 
                    background: '#2563eb', 
                    color: '#ffffff', 
                    border: 'none', 
                    borderRadius: 12, 
                    fontWeight: 800, 
                    cursor: 'pointer', 
                    fontSize: 14,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.28)'
                  }}
                >
                  <Search size={18} /> {loading ? 'Mencari...' : 'Cari Data'}
                </button>
              </form>

              {statusResult && (
                <div style={{ background: '#f8fafc', padding: 28, borderRadius: 20, border: '1px solid #cbd5e1', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 13, color: '#475569', fontWeight: 600 }}>Nomor Pendaftaran Resmi:</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#2563eb', letterSpacing: '0.5px' }}>{statusResult.no_pendaftaran}</div>
                      <h4 style={{ margin: '6px 0 2px 0', fontSize: 22, fontWeight: 800, color: '#0f172a' }}>{statusResult.nama_lengkap}</h4>
                      <p style={{ margin: 0, color: '#475569', fontSize: 13 }}>
                        Jalur: <b>{statusResult.jalur_pendaftaran}</b> | Peminatan: <b>{statusResult.pilihan_jurusan || 'Umum'}</b>
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                      {getStatusBadge(statusResult.status)}
                      <button 
                        onClick={() => handlePrintKartu(statusResult)} 
                        style={{ 
                          padding: '10px 18px', 
                          background: '#0f172a', 
                          color: '#ffffff', 
                          border: 'none', 
                          borderRadius: 12, 
                          cursor: 'pointer', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 8, 
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
                            padding: '10px 18px',
                            background: '#16a34a',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: 12,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            fontSize: 13,
                            fontWeight: 700,
                            boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)'
                          }}
                        >
                          <CheckSquare size={16} /> Lanjut Daftar Ulang
                        </button>
                      )}
                    </div>
                  </div>

                  <hr style={{ margin: '20px 0', borderColor: '#cbd5e1' }} />

                  <div className="ppdb-grid-3" style={{ fontSize: 13 }}>
                    <div style={{ background: '#ffffff', padding: 14, borderRadius: 12, border: '1px solid #cbd5e1' }}>
                      <span style={{ color: '#475569', fontSize: 12 }}>Jadwal Ujian Masuk:</span>
                      <div style={{ fontWeight: 800, marginTop: 4, color: '#0f172a' }}>
                        {statusResult.jadwal_tes ? new Date(statusResult.jadwal_tes).toLocaleString('id-ID') : 'Menunggu Penjadwalan'}
                      </div>
                    </div>
                    <div style={{ background: '#ffffff', padding: 14, borderRadius: 12, border: '1px solid #cbd5e1' }}>
                      <span style={{ color: '#475569', fontSize: 12 }}>Lokasi Pelaksanaan:</span>
                      <div style={{ fontWeight: 800, marginTop: 4, color: '#0f172a' }}>
                        {statusResult.lokasi_tes || 'Gedung Utama ' + schoolData.nama_sekolah}
                      </div>
                    </div>
                    <div style={{ background: '#ffffff', padding: 14, borderRadius: 12, border: '1px solid #cbd5e1' }}>
                      <span style={{ color: '#475569', fontSize: 12 }}>Ukuran Seragam:</span>
                      <div style={{ fontWeight: 800, marginTop: 4, color: '#0f172a' }}>
                        {statusResult.ukuran_seragam ? `Ukuran ${statusResult.ukuran_seragam}` : 'Belum Diisi'}
                      </div>
                    </div>
                  </div>

                  {statusResult.catatan && (
                    <div style={{ marginTop: 16, background: '#fef3c7', padding: '12px 16px', borderRadius: 12, fontSize: 13, color: '#92400e' }}>
                      <b>Pesan Panitia:</b> {statusResult.catatan}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB CONTENT: FORMULIR DAFTAR ULANG */}
        {tab === 'daftar_ulang' && (
          <form onSubmit={handleSubmitDaftarUlang} className="ppdb-form-card">
            <div style={{ height: 6, background: 'linear-gradient(90deg, #16a34a 0%, #22c55e 100%)' }} />
            <div style={{ padding: '36px 32px' }}>
              <div style={{ marginBottom: 28 }}>
                <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 800 }}>
                  KONFIRMASI SISWA LULUS
                </span>
                <h3 style={{ margin: '8px 0 4px 0', fontSize: 24, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <CheckSquare size={24} color="#16a34a" /> Formulir Pendaftaran Ulang & Seragam
                </h3>
                <p style={{ margin: 0, color: '#475569', fontSize: 14 }}>
                  Khusus bagi calon siswa yang telah dinyatakan <b>LULUS SELEKSI</b> untuk memilih ukuran seragam dan verifikasi dokumen.
                </p>
              </div>

              <div className="ppdb-grid-2" style={{ marginBottom: 24 }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: 13, color: '#1e293b', marginBottom: 6 }}>
                    NISN atau Nomor Pendaftaran Siswa *
                  </label>
                  <input 
                    type="text" 
                    name="no_pendaftaran" 
                    value={duForm.no_pendaftaran} 
                    onChange={handleDuChange} 
                    required 
                    placeholder="Contoh: 0081234567 atau PPDB-2026-0001" 
                    className="ppdb-input-field" 
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: 13, color: '#1e293b', marginBottom: 6 }}>
                    Pilihan Ukuran Seragam Sekolah *
                  </label>
                  <select name="ukuran_seragam" value={duForm.ukuran_seragam} onChange={handleDuChange} className="ppdb-input-field">
                    <option value="S">S (Small)</option>
                    <option value="M">M (Medium)</option>
                    <option value="L">L (Large)</option>
                    <option value="XL">XL (Extra Large)</option>
                    <option value="XXL">XXL (Double Extra Large)</option>
                  </select>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: 13, color: '#1e293b', marginBottom: 6 }}>
                    Nominal Pembayaran Daftar Ulang (Rp)
                  </label>
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

              {/* UPLOAD BERKAS LINK DRIVE */}
              <div style={{ background: '#f8fafc', padding: 22, borderRadius: 18, border: '1px solid #cbd5e1', marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <FileUp size={20} color="#16a34a" />
                  <div>
                    <h4 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#0f172a' }}>Link Upload Berkas Digital (Google Drive / Cloud)</h4>
                    <p style={{ margin: 0, fontSize: 12, color: '#475569' }}>Pastikan tautan dapat diakses publik oleh panitia sekolah</p>
                  </div>
                </div>

                <div className="ppdb-grid-2">
                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#475569', marginBottom: 4 }}>Link Scan Ijazah / SKL</label>
                    <input type="text" name="berkas_ijazah" value={duForm.berkas_ijazah || ''} onChange={handleDuChange} placeholder="https://drive.google.com/..." className="ppdb-input-field" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#475569', marginBottom: 4 }}>Link Scan Kartu Keluarga</label>
                    <input type="text" name="berkas_kk" value={duForm.berkas_kk || ''} onChange={handleDuChange} placeholder="https://drive.google.com/..." className="ppdb-input-field" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#475569', marginBottom: 4 }}>Link Scan Akta Kelahiran</label>
                    <input type="text" name="berkas_akta" value={duForm.berkas_akta || ''} onChange={handleDuChange} placeholder="https://drive.google.com/..." className="ppdb-input-field" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#475569', marginBottom: 4 }}>Link Pas Foto (3x4)</label>
                    <input type="text" name="pas_foto" value={duForm.pas_foto || ''} onChange={handleDuChange} placeholder="https://drive.google.com/..." className="ppdb-input-field" />
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
                  background: 'linear-gradient(135deg, #16a34a 0%, #22c55e 100%)', 
                  color: '#ffffff', 
                  fontWeight: 800, 
                  fontSize: 16, 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: 10, 
                  boxShadow: '0 8px 25px rgba(22, 163, 74, 0.35)' 
                }}
              >
                <CheckSquare size={20} /> {loading ? 'Menyimpan...' : 'Kirim Pendaftaran Ulang'}
              </button>
            </div>
          </form>
        )}
      </main>

      {/* FOOTER PREMIUM */}
      <footer style={{ background: '#090e17', color: '#94a3b8', padding: '48px 24px 32px 24px', borderTop: '1px solid #1e293b' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 32 }}>
          <div style={{ maxWidth: 420 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#ffffff', fontWeight: 800, fontSize: 18, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <School size={20} color="#ffffff" />
              </div>
              {schoolData.nama_sekolah}
            </div>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: 13, lineHeight: 1.7 }}>
              {schoolData.alamat || 'Sukaratu, Kabupaten Tasikmalaya, Jawa Barat'}.
            </p>
            <div style={{ marginTop: 12, fontSize: 12, color: '#64748b' }}>
              NPSN: <b>{schoolData.npsn || '20279876'}</b> | Status: <b>Terakreditasi A</b>
            </div>
          </div>

          <div>
            <div style={{ color: '#ffffff', fontWeight: 800, fontSize: 14, marginBottom: 12 }}>Layanan & Kontak Panitia</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
              <div>WhatsApp Call Center: <b style={{ color: '#38bdf8' }}>{schoolData.no_hp || '-'}</b></div>
              <div>Email: <b>{schoolData.email || 'info@sistemiartas.com'}</b></div>
              <div>Jam Operasional: <b>Senin - Sabtu (08:00 - 15:00 WIB)</b></div>
            </div>
          </div>

          <div>
            <div style={{ color: '#ffffff', fontWeight: 800, fontSize: 14, marginBottom: 12 }}>Tautan Resmi</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
              <a href="https://sistemiartas.com" target="_blank" rel="noreferrer" style={{ color: '#38bdf8', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                Sistem Informasi Sekolah E-Sekolah <ExternalLink size={13} />
              </a>
              <span style={{ color: '#64748b' }}>Portal PPDB Cloud Terintegrasi V2</span>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1240, margin: '36px auto 0 auto', paddingTop: 24, borderTop: '1px solid #1e293b', textAlign: 'center', fontSize: 13, color: '#64748b' }}>
          &copy; {new Date().getFullYear()} {schoolData.nama_sekolah}. Seluruh Hak Cipta Dilindungi Undang-Undang.
        </div>
      </footer>
    </div>
  );
}
