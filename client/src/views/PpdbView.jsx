import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { 
  UserPlus, Search, CheckCircle, XCircle, Clock, FileText, 
  Send, User, Phone, MapPin, School, BookOpen, UserCheck, RefreshCw,
  CreditCard, CheckSquare, Printer, Download, BarChart2, Calendar, FileUp, Award
} from 'lucide-react';
import api from '../api/client';

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

  // State Admin & Statistik
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
    if (isAdmin && (mode === 'admin' || mode === 'statistik')) {
      fetchAdminData();
      fetchKelas();
      fetchStatistik();
    }
  }, [mode, filterStatus, adminSearch]);

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
          html: `Nomor Pendaftaran: <b style="font-size:1.2rem;color:#059669">${noPendaftaran}</b><br/><br/>Notifikasi konfirmasi WhatsApp telah dikirim ke nomor orang tua.`,
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
            .card { border: 2px solid #1e3a8a; border-radius: 12px; padding: 20px; max-width: 500px; margin: 0 auto; background: #fff; }
            .header { text-align: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 10px; margin-bottom: 15px; }
            .header h2 { margin: 0; color: #1e3a8a; }
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
        return <span style={{ padding: '4px 10px', borderRadius: '12px', background: '#059669', color: '#fff', fontWeight: 600, fontSize: '0.85rem' }}>Resmi Diterima</span>;
      case 'Daftar Ulang':
        return <span style={{ padding: '4px 10px', borderRadius: '12px', background: '#2563eb', color: '#fff', fontWeight: 600, fontSize: '0.85rem' }}>Daftar Ulang</span>;
      case 'Lulus':
        return <span style={{ padding: '4px 10px', borderRadius: '12px', background: '#dcfce7', color: '#166534', fontWeight: 600, fontSize: '0.85rem' }}>Lulus Seleksi</span>;
      case 'Ditolak':
        return <span style={{ padding: '4px 10px', borderRadius: '12px', background: '#fee2e2', color: '#991b1b', fontWeight: 600, fontSize: '0.85rem' }}>Tidak Lulus</span>;
      case 'Verifikasi':
        return <span style={{ padding: '4px 10px', borderRadius: '12px', background: '#e0f2fe', color: '#075985', fontWeight: 600, fontSize: '0.85rem' }}>Verifikasi</span>;
      default:
        return <span style={{ padding: '4px 10px', borderRadius: '12px', background: '#fef3c7', color: '#92400e', fontWeight: 600, fontSize: '0.85rem' }}>Menunggu</span>;
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
        color: '#fff',
        borderRadius: '16px',
        padding: '2rem',
        marginBottom: '1.5rem',
        boxShadow: '0 10px 25px rgba(59, 130, 246, 0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '1rem', borderRadius: '14px' }}>
            <UserPlus size={36} color="#fff" />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 700 }}>PPDB Online & Tes Seleksi</h1>
            <p style={{ margin: '4px 0 0 0', opacity: 0.9 }}>Portal Terpadu Pendaftaran, Tes Seleksi, WA Gateway & Daftar Ulang</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          <button onClick={() => setMode('daftar')} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, background: mode === 'daftar' ? '#fff' : 'rgba(255,255,255,0.2)', color: mode === 'daftar' ? '#1e3a8a' : '#fff' }}>
            Form Pendaftaran
          </button>
          <button onClick={() => setMode('daftar_ulang')} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, background: mode === 'daftar_ulang' ? '#fff' : 'rgba(255,255,255,0.2)', color: mode === 'daftar_ulang' ? '#1e3a8a' : '#fff' }}>
            Daftar Ulang
          </button>
          <button onClick={() => setMode('status')} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, background: mode === 'status' ? '#fff' : 'rgba(255,255,255,0.2)', color: mode === 'status' ? '#1e3a8a' : '#fff' }}>
            Cek Status & Kartu
          </button>
          {isAdmin && (
            <>
              <button onClick={() => setMode('admin')} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, background: mode === 'admin' ? '#fff' : 'rgba(255,255,255,0.2)', color: mode === 'admin' ? '#1e3a8a' : '#fff' }}>
                Kelola Admin PPDB
              </button>
              <button onClick={() => setMode('statistik')} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600, background: mode === 'statistik' ? '#fff' : 'rgba(255,255,255,0.2)', color: mode === 'statistik' ? '#1e3a8a' : '#fff' }}>
                Statistik & Laporan
              </button>
            </>
          )}
        </div>
      </div>

      {/* MODE 1: FORM PENDAFTARAN ONLINE */}
      {mode === 'daftar' && (
        <form onSubmit={handleSubmitRegister} style={{ background: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={20} /> Data Calon Siswa & Lampiran Berkas
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px' }}>Nama Lengkap *</label>
                <input type="text" name="nama_lengkap" value={formData.nama_lengkap} onChange={handleInputChange} required placeholder="Nama lengkap sesuai ijazah/KK" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px' }}>NIK Calon Siswa</label>
                <input type="text" name="nik" value={formData.nik} onChange={handleInputChange} placeholder="16 digit NIK" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px' }}>NISN</label>
                <input type="text" name="nisn" value={formData.nisn} onChange={handleInputChange} placeholder="Nomor Induk Siswa Nasional" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px' }}>Jenis Kelamin</label>
                <select name="jenis_kelamin" value={formData.jenis_kelamin} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}>
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px' }}>Tempat Lahir</label>
                <input type="text" name="tempat_lahir" value={formData.tempat_lahir} onChange={handleInputChange} placeholder="Kota/Kabupaten" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px' }}>Tanggal Lahir</label>
                <input type="date" name="tanggal_lahir" value={formData.tanggal_lahir} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px' }}>Sekolah Asal</label>
                <input type="text" name="sekolah_asal" value={formData.sekolah_asal} onChange={handleInputChange} placeholder="SMPN 1 / SD Negeri 2" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px' }}>Jalur Pendaftaran</label>
                <select name="jalur_pendaftaran" value={formData.jalur_pendaftaran} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}>
                  <option value="Reguler">Reguler</option>
                  <option value="Prestasi">Prestasi</option>
                  <option value="Tahfidz">Tahfidz / Beasiswa</option>
                  <option value="Afirmasi">Afirmasi / Kurang Mampu</option>
                </select>
              </div>
            </div>

            {/* Upload Berkas Links / URLs */}
            <div style={{ marginTop: '1.5rem', background: '#f9fafb', padding: '1rem', borderRadius: '10px', border: '1px solid #e5e7eb' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileUp size={16} /> URL Link Berkas Dokumen (Opsional)
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.8rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Link Scan Ijazah</label>
                  <input type="text" name="berkas_ijazah" value={formData.berkas_ijazah} onChange={handleInputChange} placeholder="URL Google Drive / File" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Link Scan Kartu Keluarga</label>
                  <input type="text" name="berkas_kk" value={formData.berkas_kk} onChange={handleInputChange} placeholder="URL Google Drive / File" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Link Pas Foto 3x4</label>
                  <input type="text" name="pas_foto" value={formData.pas_foto} onChange={handleInputChange} placeholder="URL Google Drive / File" style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={20} /> Data Orang Tua & WhatsApp Notifikasi
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px' }}>Nama Ayah</label>
                <input type="text" name="nama_ayah" value={formData.nama_ayah} onChange={handleInputChange} placeholder="Nama lengkap Ayah" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px' }}>Nama Ibu</label>
                <input type="text" name="nama_ibu" value={formData.nama_ibu} onChange={handleInputChange} placeholder="Nama lengkap Ibu" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px' }}>No. WhatsApp Ortu *</label>
                <input type="text" name="no_hp_ortu" value={formData.no_hp_ortu} onChange={handleInputChange} required placeholder="Contoh: 081234567890" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: '10px', border: 'none', background: '#2563eb', color: '#fff', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Send size={18} /> {loading ? 'Mengirim Pendaftaran...' : 'Kirim Pendaftaran PPDB'}
          </button>
        </form>
      )}

      {/* MODE 2: FORM DAFTAR ULANG */}
      {mode === 'daftar_ulang' && (
        <form onSubmit={handleSubmitDaftarUlang} style={{ background: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckSquare size={22} /> Form Pendaftaran Ulang Siswa Lulus
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px' }}>Nomor Pendaftaran *</label>
              <input type="text" name="no_pendaftaran" value={duForm.no_pendaftaran} onChange={handleDuChange} required placeholder="Contoh: PPDB-2026-0001" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px' }}>Ukuran Seragam</label>
              <select name="ukuran_seragam" value={duForm.ukuran_seragam} onChange={handleDuChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }}>
                <option value="S">S (Small)</option>
                <option value="M">M (Medium)</option>
                <option value="L">L (Large)</option>
                <option value="XL">XL (Extra Large)</option>
                <option value="XXL">XXL (Double Extra Large)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.85rem', marginBottom: '4px' }}>Nominal Bayar (Rp)</label>
              <input type="number" name="nominal_daftar_ulang" value={duForm.nominal_daftar_ulang} onChange={handleDuChange} placeholder="500000" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
            </div>
          </div>
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '14px', borderRadius: '10px', border: 'none', background: '#059669', color: '#fff', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <CheckSquare size={18} /> {loading ? 'Memproses...' : 'Kirim Pendaftaran Ulang'}
          </button>
        </form>
      )}

      {/* MODE 3: CEK STATUS & CETAK KARTU PESERTA */}
      {mode === 'status' && (
        <div style={{ background: '#fff', padding: '2rem', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#1e3a8a' }}>Cek Status Seleksi & Cetak Kartu Peserta</h3>
          <form onSubmit={handleCheckStatus} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <input type="text" value={searchNo} onChange={(e) => setSearchNo(e.target.value)} placeholder="Nomor Pendaftaran (PPDB-2026-0001)" style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
            <button type="submit" disabled={loading} style={{ padding: '12px 24px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Cek Status</button>
          </form>

          {statusResult && (
            <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.2rem' }}>{statusResult.nama_lengkap}</h4>
                  <p style={{ margin: '4px 0 0 0', color: '#6b7280' }}>No: <b>{statusResult.no_pendaftaran}</b> | Jalur: {statusResult.jalur_pendaftaran}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {getStatusBadge(statusResult.status)}
                  <button onClick={() => handlePrintKartu(statusResult)} style={{ padding: '6px 12px', background: '#1e3a8a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                    <Printer size={16} /> Cetak Kartu Peserta
                  </button>
                </div>
              </div>

              <hr style={{ margin: '1rem 0', borderColor: '#e5e7eb' }} />

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.9rem' }}>
                <div><b>Jadwal Ujian:</b> {statusResult.jadwal_tes ? new Date(statusResult.jadwal_tes).toLocaleString('id-ID') : 'Belum Dijadwalkan'}</div>
                <div><b>Nilai Ujian Tulis:</b> {statusResult.nilai_tes_tulis || '-'}</div>
                <div><b>Nilai Baca Al-Qur'an:</b> {statusResult.nilai_baca_quran || '-'}</div>
                <div><b>Ukuran Seragam:</b> {statusResult.ukuran_seragam || 'Belum Diisi'}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE 4: KELOLA ADMIN PPDB */}
      {mode === 'admin' && isAdmin && (
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h3 style={{ margin: 0, color: '#1e3a8a' }}>Kelola Admin PPDB</h3>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button onClick={handleExportCSV} style={{ padding: '8px 12px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Download size={16} /> Export CSV
              </button>
              <input type="text" value={adminSearch} onChange={(e) => setAdminSearch(e.target.value)} placeholder="Cari pendaftar..." style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #d1d5db' }} />
            </div>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '10px' }}>No Reg</th>
                  <th style={{ padding: '10px' }}>Nama Calon</th>
                  <th style={{ padding: '10px' }}>Tes / Nilai</th>
                  <th style={{ padding: '10px' }}>Seragam</th>
                  <th style={{ padding: '10px' }}>Status</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {ppdbList.map((row) => (
                  <tr key={row.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '10px', fontWeight: 600 }}>{row.no_pendaftaran}</td>
                    <td style={{ padding: '10px' }}>{row.nama_lengkap}</td>
                    <td style={{ padding: '10px' }}>Tulis: {row.nilai_tes_tulis || '-'} | Q: {row.nilai_baca_quran || '-'}</td>
                    <td style={{ padding: '10px' }}>{row.ukuran_seragam || '-'}</td>
                    <td style={{ padding: '10px' }}>{getStatusBadge(row.status)}</td>
                    <td style={{ padding: '10px', textAlign: 'right' }}>
                      <button onClick={() => {
                        setSelectedDetail(row);
                        setTesForm({
                          jadwal_tes: row.jadwal_tes ? new Date(row.jadwal_tes).toISOString().slice(0, 16) : '',
                          lokasi_tes: row.lokasi_tes || 'Ruang Ujian Utama',
                          nilai_tes_tulis: row.nilai_tes_tulis || '',
                          nilai_tes_wawancara: row.nilai_tes_wawancara || '',
                          nilai_baca_quran: row.nilai_baca_quran || ''
                        });
                      }} style={{ padding: '6px 12px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>
                        Kelola
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODE 5: STATISTIK & LAPORAN */}
      {mode === 'statistik' && isAdmin && (
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 1.5rem 0', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart2 size={24} /> Laporan & Rekap Statistik PPDB
          </h3>
          {statistikData && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ background: '#eff6ff', padding: '1.2rem', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                <p style={{ margin: 0, color: '#1e40af', fontWeight: 600, fontSize: '0.85rem' }}>TOTAL PENDAFTAR</p>
                <h2 style={{ margin: '8px 0 0 0', color: '#1e3a8a', fontSize: '2rem' }}>{statistikData.total} Siswa</h2>
              </div>
              <div style={{ background: '#ecfdf5', padding: '1.2rem', borderRadius: '12px', border: '1px solid #a7f3d0' }}>
                <p style={{ margin: 0, color: '#065f46', fontWeight: 600, fontSize: '0.85rem' }}>STATUS PENDAFTAR</p>
                <div style={{ fontSize: '0.85rem', marginTop: '6px' }}>
                  {statistikData.status.map(s => <div key={s.status}><b>{s.status}:</b> {s.jumlah}</div>)}
                </div>
              </div>
              <div style={{ background: '#fefce8', padding: '1.2rem', borderRadius: '12px', border: '1px solid #fef08a' }}>
                <p style={{ margin: 0, color: '#854d0e', fontWeight: 600, fontSize: '0.85rem' }}>REKAP SERAGAM</p>
                <div style={{ fontSize: '0.85rem', marginTop: '6px' }}>
                  {statistikData.seragam.map(sg => <div key={sg.ukuran_seragam}><b>Size {sg.ukuran_seragam}:</b> {sg.jumlah} stel</div>)}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Detail & Input Nilai Ujian */}
      {selectedDetail && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1rem' }}>
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '16px', maxWidth: '650px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 1rem 0' }}>Kelola Tes & Status: {selectedDetail.nama_lengkap}</h3>

            {/* Input Form Tes & Nilai */}
            <form onSubmit={handleSaveTesNilai} style={{ background: '#f9fafb', padding: '1rem', borderRadius: '10px', marginBottom: '1rem' }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: '#1e3a8a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Award size={16} /> Input Jadwal & Nilai Tes Ujian Masuk
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', fontSize: '0.85rem' }}>
                <div>
                  <label style={{ fontWeight: 600 }}>Jadwal Ujian Tes</label>
                  <input type="datetime-local" value={tesForm.jadwal_tes} onChange={(e) => setTesForm(p => ({ ...p, jadwal_tes: e.target.value }))} style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
                </div>
                <div>
                  <label style={{ fontWeight: 600 }}>Nilai Ujian Tulis</label>
                  <input type="number" step="0.1" value={tesForm.nilai_tes_tulis} onChange={(e) => setTesForm(p => ({ ...p, nilai_tes_tulis: e.target.value }))} placeholder="0 - 100" style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
                </div>
                <div>
                  <label style={{ fontWeight: 600 }}>Nilai Wawancara</label>
                  <input type="number" step="0.1" value={tesForm.nilai_tes_wawancara} onChange={(e) => setTesForm(p => ({ ...p, nilai_tes_wawancara: e.target.value }))} placeholder="0 - 100" style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
                </div>
                <div>
                  <label style={{ fontWeight: 600 }}>Nilai Baca Al-Qur'an</label>
                  <input type="number" step="0.1" value={tesForm.nilai_baca_quran} onChange={(e) => setTesForm(p => ({ ...p, nilai_baca_quran: e.target.value }))} placeholder="0 - 100" style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #d1d5db' }} />
                </div>
              </div>
              <button type="submit" style={{ marginTop: '10px', padding: '6px 14px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                Simpan Ujian & Sent WA Alert
              </button>
            </form>

            <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontWeight: 600, marginBottom: '6px', fontSize: '0.85rem' }}>Ubah Status Kelulusan (Auto WhatsApp Alert):</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button onClick={() => handleUpdateStatus(selectedDetail.id, 'Lulus')} style={{ padding: '6px 12px', background: '#dcfce7', color: '#15803d', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
                  Set LULUS
                </button>
                <button onClick={() => handleUpdateStatus(selectedDetail.id, 'Ditolak')} style={{ padding: '6px 12px', background: '#fee2e2', color: '#b91c1c', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
                  Set DITOLAK
                </button>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <button onClick={() => setSelectedDetail(null)} style={{ padding: '8px 16px', background: '#6b7280', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
