import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { 
  UserPlus, Search, CheckCircle, Clock, FileText, 
  Send, User, Phone, MapPin, School, BookOpen, CheckSquare, Printer, FileUp, Award, LogIn, ShieldCheck
} from 'lucide-react';
import api from '../api/client';

export default function PublicPpdbPortalView({ onLoginClick }) {
  const [tab, setTab] = useState('daftar'); // 'daftar' | 'daftar_ulang' | 'status'
  const [loading, setLoading] = useState(false);

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
    if (!formData.nama_lengkap || !formData.no_hp_ortu) {
      Swal.fire('Peringatan', 'Nama Lengkap dan Nomor WhatsApp Ortu wajib diisi!', 'warning');
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

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* HERO BANNER & TABS */}
      <div style={{ maxWidth: 1100, margin: '24px auto', padding: '0 16px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          borderRadius: 24,
          padding: '32px 24px',
          marginBottom: 24,
          boxShadow: '0 12px 30px rgba(15,23,42,0.15)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <span style={{ background: 'rgba(59,130,246,0.2)', color: '#60a5fa', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 800, letterSpacing: '0.5px' }}>
              REKREASI AKADEMIK 2026/2027
            </span>
            <h1 style={{ margin: '12px 0 6px 0', fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px' }}>
              Selamat Datang Calon Siswa & Wali Murid
            </h1>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: 14, maxWidth: 600 }}>
              Silakan mendaftar secara online, melakukan konfirmasi pendaftaran ulang, atau memeriksa status hasil seleksi ujian masuk secara langsung.
            </p>

            {/* TAB BUTTONS */}
            <div style={{ display: 'flex', gap: 8, marginTop: 24, flexWrap: 'wrap' }}>
              <button
                onClick={() => setTab('daftar')}
                style={{
                  padding: '10px 20px',
                  borderRadius: 14,
                  border: 'none',
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: 'pointer',
                  background: tab === 'daftar' ? '#0066ff' : 'rgba(255,255,255,0.1)',
                  color: tab === 'daftar' ? '#ffffff' : '#cbd5e1',
                  transition: 'all 0.2s ease'
                }}
              >
                Form Pendaftaran
              </button>

              <button
                onClick={() => setTab('daftar_ulang')}
                style={{
                  padding: '10px 20px',
                  borderRadius: 14,
                  border: 'none',
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: 'pointer',
                  background: tab === 'daftar_ulang' ? '#0066ff' : 'rgba(255,255,255,0.1)',
                  color: tab === 'daftar_ulang' ? '#ffffff' : '#cbd5e1',
                  transition: 'all 0.2s ease'
                }}
              >
                Pendaftaran Ulang
              </button>

              <button
                onClick={() => setTab('status')}
                style={{
                  padding: '10px 20px',
                  borderRadius: 14,
                  border: 'none',
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: 'pointer',
                  background: tab === 'status' ? '#0066ff' : 'rgba(255,255,255,0.1)',
                  color: tab === 'status' ? '#ffffff' : '#cbd5e1',
                  transition: 'all 0.2s ease'
                }}
              >
                Cek Status Kelulusan
              </button>
            </div>
          </div>
        </div>

        {/* TAB CONTENT 1: FORM PENDAFTARAN */}
        {tab === 'daftar' && (
          <form onSubmit={handleSubmitRegister} style={{ background: '#ffffff', padding: 24, borderRadius: 24, border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: 17, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                <User size={20} color="#0066ff" /> Data Calon Siswa & Lampiran Berkas
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#475569', marginBottom: 4 }}>Nama Lengkap *</label>
                  <input type="text" name="nama_lengkap" value={formData.nama_lengkap} onChange={handleInputChange} required placeholder="Nama lengkap siswa" style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #cbd5e1', fontSize: 13, background: '#f8fafc' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#475569', marginBottom: 4 }}>NIK Calon Siswa</label>
                  <input type="text" name="nik" value={formData.nik} onChange={handleInputChange} placeholder="16 digit NIK" style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #cbd5e1', fontSize: 13, background: '#f8fafc' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#475569', marginBottom: 4 }}>NISN</label>
                  <input type="text" name="nisn" value={formData.nisn} onChange={handleInputChange} placeholder="Nomor NISN" style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #cbd5e1', fontSize: 13, background: '#f8fafc' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#475569', marginBottom: 4 }}>Jenis Kelamin</label>
                  <select name="jenis_kelamin" value={formData.jenis_kelamin} onChange={handleInputChange} style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #cbd5e1', fontSize: 13, background: '#f8fafc' }}>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#475569', marginBottom: 4 }}>Tempat Lahir</label>
                  <input type="text" name="tempat_lahir" value={formData.tempat_lahir} onChange={handleInputChange} placeholder="Kota/Kabupaten" style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #cbd5e1', fontSize: 13, background: '#f8fafc' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#475569', marginBottom: 4 }}>Tanggal Lahir</label>
                  <input type="date" name="tanggal_lahir" value={formData.tanggal_lahir} onChange={handleInputChange} style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #cbd5e1', fontSize: 13, background: '#f8fafc' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#475569', marginBottom: 4 }}>Sekolah Asal</label>
                  <input type="text" name="sekolah_asal" value={formData.sekolah_asal} onChange={handleInputChange} placeholder="SMPN 1 / SD Negeri 2" style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #cbd5e1', fontSize: 13, background: '#f8fafc' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#475569', marginBottom: 4 }}>Jalur Pendaftaran</label>
                  <select name="jalur_pendaftaran" value={formData.jalur_pendaftaran} onChange={handleInputChange} style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #cbd5e1', fontSize: 13, background: '#f8fafc' }}>
                    <option value="Reguler">Reguler</option>
                    <option value="Prestasi">Prestasi</option>
                    <option value="Tahfidz">Tahfidz / Beasiswa</option>
                    <option value="Afirmasi">Afirmasi / Kurang Mampu</option>
                  </select>
                </div>
              </div>

              <div style={{ marginTop: 16, background: '#f8fafc', padding: 16, borderRadius: 16, border: '1px solid #e2e8f0' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: 13, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FileUp size={16} color="#0066ff" /> Link Upload Berkas Dokumen (Opsional)
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>Link Scan Ijazah</label>
                    <input type="text" name="berkas_ijazah" value={formData.berkas_ijazah} onChange={handleInputChange} placeholder="URL Google Drive / File" style={{ width: '100%', padding: '10px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 12, background: '#ffffff' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>Link Scan Kartu Keluarga</label>
                    <input type="text" name="berkas_kk" value={formData.berkas_kk} onChange={handleInputChange} placeholder="URL Google Drive / File" style={{ width: '100%', padding: '10px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 12, background: '#ffffff' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>Link Pas Foto 3x4</label>
                    <input type="text" name="pas_foto" value={formData.pas_foto} onChange={handleInputChange} placeholder="URL Google Drive / File" style={{ width: '100%', padding: '10px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 12, background: '#ffffff' }} />
                  </div>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: 17, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Phone size={20} color="#0066ff" /> Data Orang Tua & WhatsApp Notifikasi
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#475569', marginBottom: 4 }}>Nama Ayah</label>
                  <input type="text" name="nama_ayah" value={formData.nama_ayah} onChange={handleInputChange} placeholder="Nama lengkap Ayah" style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #cbd5e1', fontSize: 13, background: '#f8fafc' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#475569', marginBottom: 4 }}>Nama Ibu</label>
                  <input type="text" name="nama_ibu" value={formData.nama_ibu} onChange={handleInputChange} placeholder="Nama lengkap Ibu" style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #cbd5e1', fontSize: 13, background: '#f8fafc' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#475569', marginBottom: 4 }}>No. WhatsApp Ortu *</label>
                  <input type="text" name="no_hp_ortu" value={formData.no_hp_ortu} onChange={handleInputChange} required placeholder="Contoh: 081234567890" style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #cbd5e1', fontSize: 13, background: '#f8fafc' }} />
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', padding: 16, borderRadius: 16, border: 'none', background: '#0066ff', color: '#ffffff', fontWeight: 800, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 16px rgba(0,102,255,0.3)' }}>
              <Send size={18} /> {loading ? 'Mengirim Pendaftaran...' : 'Kirim Pendaftaran PPDB'}
            </button>
          </form>
        )}

        {/* TAB CONTENT 2: FORM DAFTAR ULANG */}
        {tab === 'daftar_ulang' && (
          <form onSubmit={handleSubmitDaftarUlang} style={{ background: '#ffffff', padding: 24, borderRadius: 24, border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: 17, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckSquare size={20} color="#0066ff" /> Form Pendaftaran Ulang Siswa Lulus
            </h3>
            <p style={{ color: '#64748b', fontSize: 13, marginBottom: 20 }}>
              Form ini khusus untuk calon siswa yang telah dinyatakan <b>LULUS SELEKSI</b>.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginBottom: 20 }}>
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#475569', marginBottom: 4 }}>Nomor Pendaftaran *</label>
                <input type="text" name="no_pendaftaran" value={duForm.no_pendaftaran} onChange={handleDuChange} required placeholder="Contoh: PPDB-2026-0001" style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #cbd5e1', fontSize: 13, background: '#f8fafc' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#475569', marginBottom: 4 }}>Ukuran Seragam</label>
                <select name="ukuran_seragam" value={duForm.ukuran_seragam} onChange={handleDuChange} style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #cbd5e1', fontSize: 13, background: '#f8fafc' }}>
                  <option value="S">S (Small)</option>
                  <option value="M">M (Medium)</option>
                  <option value="L">L (Large)</option>
                  <option value="XL">XL (Extra Large)</option>
                  <option value="XXL">XXL (Double Extra Large)</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#475569', marginBottom: 4 }}>Nominal Bayar (Rp)</label>
                <input type="number" name="nominal_daftar_ulang" value={duForm.nominal_daftar_ulang} onChange={handleDuChange} placeholder="500000" style={{ width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid #cbd5e1', fontSize: 13, background: '#f8fafc' }} />
              </div>
            </div>

            <button type="submit" disabled={loading} style={{ width: '100%', padding: 16, borderRadius: 16, border: 'none', background: '#059669', color: '#ffffff', fontWeight: 800, fontSize: 15, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 16px rgba(5,150,105,0.3)' }}>
              <CheckSquare size={18} /> {loading ? 'Memproses...' : 'Kirim Pendaftaran Ulang'}
            </button>
          </form>
        )}

        {/* TAB CONTENT 3: CEK STATUS */}
        {tab === 'status' && (
          <div style={{ background: '#ffffff', padding: 24, borderRadius: 24, border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: 17, fontWeight: 800, color: '#0f172a' }}>Cek Status Seleksi & Cetak Kartu Peserta</h3>
            <form onSubmit={handleCheckStatus} style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              <input type="text" value={searchNo} onChange={(e) => setSearchNo(e.target.value)} placeholder="Nomor Pendaftaran (Contoh: PPDB-2026-0001)" style={{ flex: 1, padding: '14px', borderRadius: 14, border: '1px solid #cbd5e1', fontSize: 14, background: '#f8fafc' }} />
              <button type="submit" disabled={loading} style={{ padding: '14px 24px', background: '#0066ff', color: '#ffffff', border: 'none', borderRadius: 14, fontWeight: 800, cursor: 'pointer', fontSize: 14 }}>Cek Status</button>
            </form>

            {statusResult && (
              <div style={{ background: '#f8fafc', padding: 20, borderRadius: 20, border: '1px solid #e2e8f0' }}>
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

                <hr style={{ margin: '16px 0', borderColor: '#e2e8f0' }} />

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, fontSize: 13 }}>
                  <div><b>Jadwal Ujian:</b> {statusResult.jadwal_tes ? new Date(statusResult.jadwal_tes).toLocaleString('id-ID') : 'Belum Dijadwalkan'}</div>
                  <div><b>Nilai Ujian Tulis:</b> {statusResult.nilai_tes_tulis || '-'}</div>
                  <div><b>Nilai Baca Al-Qur'an:</b> {statusResult.nilai_baca_quran || '-'}</div>
                  <div><b>Ukuran Seragam:</b> {statusResult.ukuran_seragam || 'Belum Diisi'}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
