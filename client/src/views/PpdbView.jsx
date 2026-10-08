import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { 
  UserPlus, Search, CheckCircle, XCircle, Clock, FileText, 
  Send, User, Phone, MapPin, School, BookOpen, UserCheck, RefreshCw,
  CreditCard, CheckSquare, Printer, Download, BarChart2, Calendar, FileUp, Award, Users
} from 'lucide-react';
import api from '../api/client';
import SearchableSelect from '../components/SearchableSelect';

export default function PpdbView({ currentUser }) {
  const [mode, setMode] = useState('daftar'); // 'daftar' | 'daftar_ulang' | 'status' | 'admin' | 'statistik'
  const [loading, setLoading] = useState(false);

  // State Form Public Pendaftaran
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

  // State Form Daftar Ulang
  const [duForm, setDuForm] = useState({
    no_pendaftaran: '',
    ukuran_seragam: 'M',
    nominal_daftar_ulang: '',
    bukti_pembayaran_du: ''
  });

  // State Cek Status
  const [searchNo, setSearchNo] = useState('');
  const [statusResult, setStatusResult] = useState(null);

  // State Admin & Data
  const [ppdbList, setPpdbList] = useState([]);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [adminSearch, setAdminSearch] = useState('');
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [kelasList, setKelasList] = useState([]);
  const [statistikData, setStatistikData] = useState(null);

  // State Input Tes Admin
  const [tesForm, setTesForm] = useState({
    jadwal_tes: '',
    lokasi_tes: 'Ruang Ujian Utama',
    nilai_tes_tulis: '',
    nilai_tes_wawancara: '',
    nilai_baca_quran: ''
  });

  const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.role === 'superadmin' || currentUser.role === 'petugas' || currentUser.type === 'Admin');

  useEffect(() => {
    fetchAdminData();
    fetchKelas();
    fetchStatistik();
  }, [filterStatus, adminSearch]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/ppdb', {
        params: { status: filterStatus, search: adminSearch }
      });
      if (res.data.success) {
        setPpdbList(res.data.data);
      }
    } catch (e) {
      console.error('Failed fetching PPDB list:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchKelas = async () => {
    try {
      const res = await api.get('/kelas');
      if (res.data.success) {
        setKelasList(res.data.data);
      }
    } catch (e) {}
  };

  const fetchStatistik = async () => {
    try {
      const res = await api.get('/ppdb/statistik');
      if (res.data.success) {
        setStatistikData(res.data.data);
      }
    } catch (e) {}
  };

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
          html: `Nomor Pendaftaran: <b style="font-size:1.2rem;color:#0066ff">${noPendaftaran}</b><br/><br/>Notifikasi konfirmasi WhatsApp telah dikirim ke nomor orang tua.`,
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
        fetchAdminData();
        fetchStatistik();
      }
    } catch (err) {
      Swal.fire('Gagal', err.response?.data?.message || 'Terjadi kesalahan sistem', 'error');
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
        fetchAdminData();
        fetchStatistik();
        setMode('status');
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

  const handleSaveTesNilai = async (e) => {
    e.preventDefault();
    if (!selectedDetail) return;
    try {
      const res = await api.put(`/ppdb/${selectedDetail.id}/tes-nilai`, tesForm);
      if (res.data.success) {
        Swal.fire('Sukses', 'Jadwal tes & nilai ujian berhasil disimpan!', 'success');
        fetchAdminData();
        setSelectedDetail(prev => ({ ...prev, ...tesForm }));
      }
    } catch (err) {
      Swal.fire('Gagal', err.response?.data?.message || 'Error', 'error');
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const res = await api.put(`/ppdb/${id}/status`, { status: newStatus });
      if (res.data.success) {
        Swal.fire('Sukses', `Status diperbarui menjadi ${newStatus}. Notifikasi WA dikirim.`, 'success');
        fetchAdminData();
        fetchStatistik();
        if (selectedDetail) {
          setSelectedDetail(prev => ({ ...prev, status: newStatus }));
        }
      }
    } catch (e) {
      Swal.fire('Gagal', e.response?.data?.message || 'Error', 'error');
    }
  };

  const handleUpdatePembayaranDU = async (id, statusBayar, nominal) => {
    try {
      const res = await api.put(`/ppdb/${id}/pembayaran-du`, {
        status_pembayaran_du: statusBayar,
        nominal_daftar_ulang: nominal
      });
      if (res.data.success) {
        Swal.fire('Sukses', 'Status pembayaran Daftar Ulang diperbarui!', 'success');
        fetchAdminData();
        fetchStatistik();
        if (selectedDetail) {
          setSelectedDetail(prev => ({ ...prev, status_pembayaran_du: statusBayar, nominal_daftar_ulang: nominal }));
        }
      }
    } catch (e) {
      Swal.fire('Gagal', e.response?.data?.message || 'Error', 'error');
    }
  };

  const handleTransferSiswa = async (calon) => {
    const { value: selectedKelas } = await Swal.fire({
      title: `Transfer ${calon.nama_lengkap} ke Siswa`,
      input: 'select',
      inputOptions: kelasList.reduce((acc, k) => {
        acc[k.kode_kelas] = `${k.nama_kelas} (${k.jurusan || '-'})`;
        return acc;
      }, {}),
      inputPlaceholder: 'Pilih Kelas Tujuan',
      showCancelButton: true,
      confirmButtonText: 'Transfer Sekarang',
      cancelButtonText: 'Batal',
      inputValidator: (val) => (!val ? 'Pilih kelas terlebih dahulu!' : null)
    });

    if (selectedKelas) {
      try {
        const res = await api.post(`/ppdb/${calon.id}/transfer`, { kode_kelas: selectedKelas });
        if (res.data.success) {
          Swal.fire('Berhasil!', res.data.message, 'success');
          fetchAdminData();
          fetchStatistik();
          setSelectedDetail(null);
        }
      } catch (e) {
        Swal.fire('Gagal Transfer', e.response?.data?.message || 'Terjadi kesalahan', 'error');
      }
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
              <p>E-SEKOLAH / PESANTREN PORTAL SELEKSI</p>
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
              <p style="font-size:12px;margin-top:6px;">Tunjukkan kartu ini saat verifikasi berkas & ujian tes.</p>
            </div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleExportCSV = () => {
    if (!ppdbList || ppdbList.length === 0) {
      Swal.fire('Peringatan', 'Tidak ada data untuk diexport', 'warning');
      return;
    }
    const headers = ['No Pendaftaran', 'Nama Lengkap', 'NISN', 'Jalur', 'Status', 'Ukuran Seragam', 'Status Bayar DU', 'No HP Ortu'];
    const rows = ppdbList.map(r => [
      `"${r.no_pendaftaran}"`,
      `"${r.nama_lengkap}"`,
      `"${r.nisn || ''}"`,
      `"${r.jalur_pendaftaran}"`,
      `"${r.status}"`,
      `"${r.ukuran_seragam || ''}"`,
      `"${r.status_pembayaran_du || ''}"`,
      `"${r.no_hp_ortu || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Rekap_PPDB_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'Diterima':
        return <span style={{ fontSize: 12, fontWeight: 800, color: '#059669', background: '#d1fae5', padding: '6px 14px', borderRadius: 10, border: '1px solid #a7f3d0' }}>Resmi Diterima</span>;
      case 'Daftar Ulang':
        return <span style={{ fontSize: 12, fontWeight: 800, color: '#0284c7', background: '#e0f2fe', padding: '6px 14px', borderRadius: 10, border: '1px solid #bae6fd' }}>Daftar Ulang</span>;
      case 'Lulus':
        return <span style={{ fontSize: 12, fontWeight: 800, color: '#166534', background: '#dcfce7', padding: '6px 14px', borderRadius: 10, border: '1px solid #86efac' }}>Lulus Seleksi</span>;
      case 'Ditolak':
        return <span style={{ fontSize: 12, fontWeight: 800, color: '#991b1b', background: '#fee2e2', padding: '6px 14px', borderRadius: 10, border: '1px solid #fca5a5' }}>Tidak Lulus</span>;
      case 'Verifikasi':
        return <span style={{ fontSize: 12, fontWeight: 800, color: '#075985', background: '#e0f2fe', padding: '6px 14px', borderRadius: 10, border: '1px solid #93c5fd' }}>Verifikasi</span>;
      default:
        return <span style={{ fontSize: 12, fontWeight: 800, color: '#92400e', background: '#fef3c7', padding: '6px 14px', borderRadius: 10, border: '1px solid #fde68a' }}>Menunggu</span>;
    }
  };

  const totalPendaftar = ppdbList.length;
  const totalLaki = ppdbList.filter(s => (s.jenis_kelamin || '').toUpperCase() === 'L').length;
  const totalPerempuan = ppdbList.filter(s => (s.jenis_kelamin || '').toUpperCase() === 'P').length;

  return (
    <div className="inner-page-wrapper" style={{ paddingBottom: 36, paddingTop: 4 }}>
      {/* STATS OVERVIEW CARDS (Matching SiswaView Design) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 18 }}>
        <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Total Pendaftar</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#0066ff', marginTop: 4 }}>{totalPendaftar}</div>
        </div>

        <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Laki-laki</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#1e40af', marginTop: 4 }}>{totalLaki}</div>
        </div>

        <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Perempuan</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#be185d', marginTop: 4 }}>{totalPerempuan}</div>
        </div>
      </div>

      {/* TABS NAVIGATION CONTROLS */}
      <div style={{ background: '#ffffff', padding: 12, borderRadius: 18, border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)', marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button
            onClick={() => setMode('daftar')}
            style={{
              padding: '8px 16px',
              borderRadius: 12,
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 13,
              background: mode === 'daftar' ? '#0066ff' : '#f1f5f9',
              color: mode === 'daftar' ? '#ffffff' : '#475569',
              transition: 'all 0.2s ease'
            }}
          >
            Form Pendaftaran
          </button>
          <button
            onClick={() => setMode('daftar_ulang')}
            style={{
              padding: '8px 16px',
              borderRadius: 12,
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 13,
              background: mode === 'daftar_ulang' ? '#0066ff' : '#f1f5f9',
              color: mode === 'daftar_ulang' ? '#ffffff' : '#475569',
              transition: 'all 0.2s ease'
            }}
          >
            Form Daftar Ulang
          </button>
          <button
            onClick={() => setMode('status')}
            style={{
              padding: '8px 16px',
              borderRadius: 12,
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: 13,
              background: mode === 'status' ? '#0066ff' : '#f1f5f9',
              color: mode === 'status' ? '#ffffff' : '#475569',
              transition: 'all 0.2s ease'
            }}
          >
            Cek Status & Kartu
          </button>
          {isAdmin && (
            <>
              <button
                onClick={() => setMode('admin')}
                style={{
                  padding: '8px 16px',
                  borderRadius: 12,
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: 13,
                  background: mode === 'admin' ? '#0066ff' : '#f1f5f9',
                  color: mode === 'admin' ? '#ffffff' : '#475569',
                  transition: 'all 0.2s ease'
                }}
              >
                Kelola Admin PPDB
              </button>
              <button
                onClick={() => setMode('statistik')}
                style={{
                  padding: '8px 16px',
                  borderRadius: 12,
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: 13,
                  background: mode === 'statistik' ? '#0066ff' : '#f1f5f9',
                  color: mode === 'statistik' ? '#ffffff' : '#475569',
                  transition: 'all 0.2s ease'
                }}
              >
                Statistik & Laporan
              </button>
            </>
          )}
        </div>
      </div>

      {/* MODE 1: FORM PENDAFTARAN ONLINE */}
      {mode === 'daftar' && (
        <form onSubmit={handleSubmitRegister} style={{ background: '#ffffff', padding: 20, borderRadius: 18, border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ margin: '0 0 14px 0', fontSize: 16, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
              <User size={20} color="#0066ff" /> Data Calon Siswa & Lampiran Berkas
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#475569', marginBottom: 4 }}>Nama Lengkap *</label>
                <input type="text" name="nama_lengkap" value={formData.nama_lengkap} onChange={handleInputChange} required placeholder="Nama lengkap sesuai ijazah/KK" style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #cbd5e1', fontSize: 13, background: '#f8fafc', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#475569', marginBottom: 4 }}>NIK Calon Siswa</label>
                <input type="text" name="nik" value={formData.nik} onChange={handleInputChange} placeholder="16 digit NIK" style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #cbd5e1', fontSize: 13, background: '#f8fafc', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#475569', marginBottom: 4 }}>NISN</label>
                <input type="text" name="nisn" value={formData.nisn} onChange={handleInputChange} placeholder="Nomor Induk Siswa Nasional" style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #cbd5e1', fontSize: 13, background: '#f8fafc', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#475569', marginBottom: 4 }}>Jenis Kelamin</label>
                <select name="jenis_kelamin" value={formData.jenis_kelamin} onChange={handleInputChange} style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #cbd5e1', fontSize: 13, background: '#f8fafc', outline: 'none' }}>
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#475569', marginBottom: 4 }}>Tempat Lahir</label>
                <input type="text" name="tempat_lahir" value={formData.tempat_lahir} onChange={handleInputChange} placeholder="Kota/Kabupaten" style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #cbd5e1', fontSize: 13, background: '#f8fafc', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#475569', marginBottom: 4 }}>Tanggal Lahir</label>
                <input type="date" name="tanggal_lahir" value={formData.tanggal_lahir} onChange={handleInputChange} style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #cbd5e1', fontSize: 13, background: '#f8fafc', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#475569', marginBottom: 4 }}>Sekolah Asal</label>
                <input type="text" name="sekolah_asal" value={formData.sekolah_asal} onChange={handleInputChange} placeholder="SMPN 1 / SD Negeri 2" style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #cbd5e1', fontSize: 13, background: '#f8fafc', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#475569', marginBottom: 4 }}>Jalur Pendaftaran</label>
                <select name="jalur_pendaftaran" value={formData.jalur_pendaftaran} onChange={handleInputChange} style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #cbd5e1', fontSize: 13, background: '#f8fafc', outline: 'none' }}>
                  <option value="Reguler">Reguler</option>
                  <option value="Prestasi">Prestasi</option>
                  <option value="Tahfidz">Tahfidz / Beasiswa</option>
                  <option value="Afirmasi">Afirmasi / Kurang Mampu</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: 14, background: '#f8fafc', padding: 14, borderRadius: 14, border: '1px solid #e2e8f0' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: 13, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 6 }}>
                <FileUp size={16} color="#0066ff" /> Link Upload Berkas Dokumen (Opsional)
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>Link Scan Ijazah</label>
                  <input type="text" name="berkas_ijazah" value={formData.berkas_ijazah} onChange={handleInputChange} placeholder="URL Google Drive / File" style={{ width: '100%', padding: '8px 12px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 12, background: '#ffffff' }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>Link Scan Kartu Keluarga</label>
                  <input type="text" name="berkas_kk" value={formData.berkas_kk} onChange={handleInputChange} placeholder="URL Google Drive / File" style={{ width: '100%', padding: '8px 12px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 12, background: '#ffffff' }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>Link Pas Foto 3x4</label>
                  <input type="text" name="pas_foto" value={formData.pas_foto} onChange={handleInputChange} placeholder="URL Google Drive / File" style={{ width: '100%', padding: '8px 12px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 12, background: '#ffffff' }} />
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <h3 style={{ margin: '0 0 14px 0', fontSize: 16, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Phone size={20} color="#0066ff" /> Data Orang Tua & WhatsApp Notifikasi
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#475569', marginBottom: 4 }}>Nama Ayah</label>
                <input type="text" name="nama_ayah" value={formData.nama_ayah} onChange={handleInputChange} placeholder="Nama lengkap Ayah" style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #cbd5e1', fontSize: 13, background: '#f8fafc', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#475569', marginBottom: 4 }}>Nama Ibu</label>
                <input type="text" name="nama_ibu" value={formData.nama_ibu} onChange={handleInputChange} placeholder="Nama lengkap Ibu" style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #cbd5e1', fontSize: 13, background: '#f8fafc', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#475569', marginBottom: 4 }}>No. WhatsApp Ortu *</label>
                <input type="text" name="no_hp_ortu" value={formData.no_hp_ortu} onChange={handleInputChange} required placeholder="Contoh: 081234567890" style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #cbd5e1', fontSize: 13, background: '#f8fafc', outline: 'none' }} />
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', padding: 14, borderRadius: 14, border: 'none', background: '#0066ff', color: '#ffffff', fontWeight: 800, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 14px rgba(0,102,255,0.3)' }}>
            <Send size={18} /> {loading ? 'Mengirim Pendaftaran...' : 'Kirim Pendaftaran PPDB'}
          </button>
        </form>
      )}

      {/* MODE 2: FORM DAFTAR ULANG */}
      {mode === 'daftar_ulang' && (
        <form onSubmit={handleSubmitDaftarUlang} style={{ background: '#ffffff', padding: 20, borderRadius: 18, border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <h3 style={{ margin: '0 0 14px 0', fontSize: 16, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckSquare size={20} color="#0066ff" /> Form Pendaftaran Ulang Siswa Lulus
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#475569', marginBottom: 4 }}>Nomor Pendaftaran *</label>
              <input type="text" name="no_pendaftaran" value={duForm.no_pendaftaran} onChange={handleDuChange} required placeholder="Contoh: PPDB-2026-0001" style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #cbd5e1', fontSize: 13, background: '#f8fafc' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#475569', marginBottom: 4 }}>Ukuran Seragam</label>
              <select name="ukuran_seragam" value={duForm.ukuran_seragam} onChange={handleDuChange} style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #cbd5e1', fontSize: 13, background: '#f8fafc' }}>
                <option value="S">S (Small)</option>
                <option value="M">M (Medium)</option>
                <option value="L">L (Large)</option>
                <option value="XL">XL (Extra Large)</option>
                <option value="XXL">XXL (Double Extra Large)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#475569', marginBottom: 4 }}>Nominal Bayar (Rp)</label>
              <input type="number" name="nominal_daftar_ulang" value={duForm.nominal_daftar_ulang} onChange={handleDuChange} placeholder="500000" style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid #cbd5e1', fontSize: 13, background: '#f8fafc' }} />
            </div>
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', padding: 14, borderRadius: 14, border: 'none', background: '#059669', color: '#ffffff', fontWeight: 800, fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 14px rgba(5,150,105,0.3)' }}>
            <CheckSquare size={18} /> {loading ? 'Memproses...' : 'Kirim Pendaftaran Ulang'}
          </button>
        </form>
      )}

      {/* MODE 3: CEK STATUS & CETAK KARTU PESERTA */}
      {mode === 'status' && (
        <div style={{ background: '#ffffff', padding: 20, borderRadius: 18, border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <h3 style={{ margin: '0 0 14px 0', fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Cek Status Seleksi & Cetak Kartu Peserta</h3>
          <form onSubmit={handleCheckStatus} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input type="text" value={searchNo} onChange={(e) => setSearchNo(e.target.value)} placeholder="Nomor Pendaftaran (Contoh: PPDB-2026-0001)" style={{ flex: 1, padding: '12px 14px', borderRadius: 12, border: '1px solid #cbd5e1', fontSize: 13, background: '#f8fafc' }} />
            <button type="submit" disabled={loading} style={{ padding: '12px 20px', background: '#0066ff', color: '#ffffff', border: 'none', borderRadius: 12, fontWeight: 800, cursor: 'pointer', fontSize: 13 }}>Cek Status</button>
          </form>

          {statusResult && (
            <div style={{ background: '#f8fafc', padding: 16, borderRadius: 16, border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#0f172a' }}>{statusResult.nama_lengkap}</h4>
                  <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: 13 }}>No: <b>{statusResult.no_pendaftaran}</b> | Jalur: {statusResult.jalur_pendaftaran}</p>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {getStatusBadge(statusResult.status)}
                  <button onClick={() => handlePrintKartu(statusResult)} style={{ padding: '6px 14px', background: '#0f172a', color: '#ffffff', border: 'none', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700 }}>
                    <Printer size={15} /> Cetak Kartu Peserta
                  </button>
                </div>
              </div>

              <hr style={{ margin: '14px 0', borderColor: '#e2e8f0' }} />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, fontSize: 13 }}>
                <div><b>Jadwal Ujian:</b> {statusResult.jadwal_tes ? new Date(statusResult.jadwal_tes).toLocaleString('id-ID') : 'Belum Dijadwalkan'}</div>
                <div><b>Nilai Ujian Tulis:</b> {statusResult.nilai_tes_tulis || '-'}</div>
                <div><b>Nilai Baca Al-Qur'an:</b> {statusResult.nilai_baca_quran || '-'}</div>
                <div><b>Ukuran Seragam:</b> {statusResult.ukuran_seragam || 'Belum Diisi'}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE 4 & LIST: LIST PENDAFTAR CARDS (Matching SiswaView Design) */}
      {(mode === 'admin' || mode === 'daftar') && (
        <div style={{ marginTop: 20 }}>
          {/* SEARCH & FILTER CONTROLS */}
          <div style={{ background: '#ffffff', padding: 16, borderRadius: 18, border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)', marginBottom: 16 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    placeholder="Cari nama atau No. Pendaftaran..."
                    value={adminSearch}
                    onChange={(e) => setAdminSearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 14px 12px 42px',
                      borderRadius: 12,
                      border: '1px solid #cbd5e1',
                      fontSize: 13,
                      outline: 'none',
                      background: '#f8fafc',
                      color: '#0f172a'
                    }}
                  />
                </div>
                {isAdmin && (
                  <button onClick={handleExportCSV} style={{ padding: '12px 16px', background: '#059669', color: '#ffffff', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                    <Download size={16} /> Export CSV
                  </button>
                )}
              </div>

              {/* FILTER STATUS */}
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 6, display: 'block', letterSpacing: '0.3px' }}>
                  FILTER STATUS SELEKSI
                </label>
                <SearchableSelect
                  options={[
                    { value: 'ALL', label: 'Semua Status Seleksi' },
                    { value: 'Menunggu', label: 'Menunggu' },
                    { value: 'Verifikasi', label: 'Verifikasi' },
                    { value: 'Lulus', label: 'Lulus' },
                    { value: 'Daftar Ulang', label: 'Daftar Ulang' },
                    { value: 'Diterima', label: 'Resmi Diterima' },
                    { value: 'Ditolak', label: 'Ditolak' }
                  ]}
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  placeholder="Semua Status Seleksi"
                />
              </div>
            </div>
          </div>

          {/* LIST CARDS DATA PPDB (Matching SiswaView) */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#0066ff' }}>
              <RefreshCw size={32} className="spin" />
              <p style={{ marginTop: 10, fontSize: 13, fontWeight: 600 }}>Memuat Data Pendaftar PPDB...</p>
            </div>
          ) : ppdbList.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {ppdbList.map((s, idx) => (
                <div
                  key={s.id || idx}
                  style={{
                    background: '#ffffff',
                    padding: '16px 18px',
                    borderRadius: 18,
                    border: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.03)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div
                      style={{
                        width: 46,
                        height: 46,
                        borderRadius: '50%',
                        background: (s.jenis_kelamin || '').toUpperCase() === 'P' ? 'linear-gradient(135deg, #fbcfe8, #f472b6)' : 'linear-gradient(135deg, #dbeafe, #60a5fa)',
                        color: (s.jenis_kelamin || '').toUpperCase() === 'P' ? '#be185d' : '#1e40af',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: 16,
                        boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                        flexShrink: 0
                      }}
                    >
                      {s.nama_lengkap ? s.nama_lengkap.charAt(0).toUpperCase() : 'P'}
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', lineHeight: 1.3 }}>
                        {s.nama_lengkap}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 4, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 600, color: '#0066ff' }}>{s.no_pendaftaran}</span>
                        <span>•</span>
                        <span>{s.sekolah_asal || 'Sekolah Asal -'}</span>
                        <span>•</span>
                        <span style={{ fontWeight: 700, color: (s.jenis_kelamin || '').toUpperCase() === 'P' ? '#be185d' : '#1e40af' }}>{(s.jenis_kelamin || '').toUpperCase() === 'P' ? 'P' : 'L'}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {getStatusBadge(s.status)}
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setSelectedDetail(s);
                          setTesForm({
                            jadwal_tes: s.jadwal_tes ? new Date(s.jadwal_tes).toISOString().slice(0, 16) : '',
                            lokasi_tes: s.lokasi_tes || 'Ruang Ujian Utama',
                            nilai_tes_tulis: s.nilai_tes_tulis || '',
                            nilai_tes_wawancara: s.nilai_tes_wawancara || '',
                            nilai_baca_quran: s.nilai_baca_quran || ''
                          });
                        }}
                        style={{
                          padding: '6px 12px',
                          background: '#0066ff',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: 10,
                          cursor: 'pointer',
                          fontSize: 12,
                          fontWeight: 700
                        }}
                      >
                        Kelola
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '44px 20px', background: '#ffffff', borderRadius: 18, border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.02)' }}>
              <Users size={52} color="#94a3b8" style={{ opacity: 0.4, marginBottom: 12 }} />
              <p style={{ fontSize: 14, fontWeight: 700, color: '#334155' }}>Tidak ada data pendaftar ditemukan.</p>
              <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>Coba ubah kata kunci pencarian atau filter status.</p>
            </div>
          )}
        </div>
      )}

      {/* MODE 5: STATISTIK & LAPORAN */}
      {mode === 'statistik' && isAdmin && (
        <div style={{ background: '#ffffff', padding: 20, borderRadius: 18, border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: 16, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
            <BarChart2 size={20} color="#0066ff" /> Laporan & Rekap Statistik PPDB
          </h3>
          {statistikData && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12, marginBottom: 16 }}>
              <div style={{ background: '#f8fafc', padding: 16, borderRadius: 16, border: '1px solid #e2e8f0' }}>
                <p style={{ margin: 0, color: '#64748b', fontWeight: 700, fontSize: 12 }}>TOTAL PENDAFTAR</p>
                <h2 style={{ margin: '6px 0 0 0', color: '#0066ff', fontSize: 24, fontWeight: 800 }}>{statistikData.total} Siswa</h2>
              </div>
              <div style={{ background: '#f8fafc', padding: 16, borderRadius: 16, border: '1px solid #e2e8f0' }}>
                <p style={{ margin: 0, color: '#64748b', fontWeight: 700, fontSize: 12 }}>STATUS PENDAFTAR</p>
                <div style={{ fontSize: 12, marginTop: 6 }}>
                  {statistikData.status.map(s => <div key={s.status}><b>{s.status}:</b> {s.jumlah}</div>)}
                </div>
              </div>
              <div style={{ background: '#f8fafc', padding: 16, borderRadius: 16, border: '1px solid #e2e8f0' }}>
                <p style={{ margin: 0, color: '#64748b', fontWeight: 700, fontSize: 12 }}>REKAP SERAGAM</p>
                <div style={{ fontSize: 12, marginTop: 6 }}>
                  {statistikData.seragam.map(sg => <div key={sg.ukuran_seragam}><b>Size {sg.ukuran_seragam}:</b> {sg.jumlah} stel</div>)}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Detail & Input Nilai Ujian */}
      {selectedDetail && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16 }}>
          <div style={{ background: '#ffffff', padding: 24, borderRadius: 20, maxWidth: 650, width: '100%', maxHeight: '90vh', overflowY: 'auto', border: '1px solid #e2e8f0', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <h3 style={{ margin: '0 0 14px 0', fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Kelola Tes & Status: {selectedDetail.nama_lengkap}</h3>

            {/* Input Form Tes & Nilai */}
            <form onSubmit={handleSaveTesNilai} style={{ background: '#f8fafc', padding: 16, borderRadius: 14, border: '1px solid #e2e8f0', marginBottom: 14 }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: 13, fontWeight: 800, color: '#0066ff', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Award size={16} /> Input Jadwal & Nilai Tes Ujian Masuk
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12 }}>
                <div>
                  <label style={{ fontWeight: 700, color: '#475569' }}>Jadwal Ujian Tes</label>
                  <input type="datetime-local" value={tesForm.jadwal_tes} onChange={(e) => setTesForm(p => ({ ...p, jadwal_tes: e.target.value }))} style={{ width: '100%', padding: 8, borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 12 }} />
                </div>
                <div>
                  <label style={{ fontWeight: 700, color: '#475569' }}>Nilai Ujian Tulis</label>
                  <input type="number" step="0.1" value={tesForm.nilai_tes_tulis} onChange={(e) => setTesForm(p => ({ ...p, nilai_tes_tulis: e.target.value }))} placeholder="0 - 100" style={{ width: '100%', padding: 8, borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 12 }} />
                </div>
                <div>
                  <label style={{ fontWeight: 700, color: '#475569' }}>Nilai Wawancara</label>
                  <input type="number" step="0.1" value={tesForm.nilai_tes_wawancara} onChange={(e) => setTesForm(p => ({ ...p, nilai_tes_wawancara: e.target.value }))} placeholder="0 - 100" style={{ width: '100%', padding: 8, borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 12 }} />
                </div>
                <div>
                  <label style={{ fontWeight: 700, color: '#475569' }}>Nilai Baca Al-Qur'an</label>
                  <input type="number" step="0.1" value={tesForm.nilai_baca_quran} onChange={(e) => setTesForm(p => ({ ...p, nilai_baca_quran: e.target.value }))} placeholder="0 - 100" style={{ width: '100%', padding: 8, borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 12 }} />
                </div>
              </div>
              <button type="submit" style={{ marginTop: 12, padding: '8px 16px', background: '#0066ff', color: '#ffffff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 800, fontSize: 12 }}>
                Simpan Ujian & Sent WA Alert
              </button>
            </form>

            <div style={{ background: '#f8fafc', padding: 14, borderRadius: 14, border: '1px solid #e2e8f0', marginBottom: 14 }}>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: 8, fontSize: 12, color: '#475569' }}>Ubah Status Kelulusan (Auto WA Alert):</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button onClick={() => handleUpdateStatus(selectedDetail.id, 'Lulus')} style={{ padding: '8px 14px', background: '#dcfce7', color: '#166534', border: '1px solid #86efac', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>
                  Set LULUS
                </button>
                <button onClick={() => handleUpdateStatus(selectedDetail.id, 'Ditolak')} style={{ padding: '8px 14px', background: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>
                  Set DITOLAK
                </button>
              </div>
            </div>

            {(selectedDetail.status === 'Lulus' || selectedDetail.status === 'Daftar Ulang' || selectedDetail.status === 'Diterima') && (
              <div style={{ marginBottom: 14, background: '#f0fdf4', padding: 14, borderRadius: 14, border: '1px solid #bbf7d0' }}>
                <p style={{ margin: '0 0 8px 0', fontSize: 12, color: '#166534', fontWeight: 700 }}>
                  Transfer siswa ini secara resmi ke Master Data Siswa & Masukkan ke Kelas:
                </p>
                <button
                  onClick={() => handleTransferSiswa(selectedDetail)}
                  style={{ width: '100%', padding: 12, background: '#059669', color: '#ffffff', border: 'none', borderRadius: 12, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 13 }}
                >
                  <UserCheck size={18} /> Transfer ke Master Siswa
                </button>
              </div>
            )}

            <div style={{ textAlign: 'right' }}>
              <button onClick={() => setSelectedDetail(null)} style={{ padding: '8px 18px', background: '#64748b', color: '#ffffff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 13 }}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
