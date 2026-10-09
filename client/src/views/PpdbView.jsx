import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { 
  UserPlus, Search, CheckCircle, XCircle, Clock, FileText, 
  Send, User, Phone, MapPin, School, BookOpen, UserCheck, RefreshCw,
  CreditCard, CheckSquare, Printer, Download, BarChart2, Calendar, FileUp, Award, Users, Edit2, Trash2, KeyRound, X
} from 'lucide-react';
import api from '../api/client';
import SearchableSelect from '../components/SearchableSelect';
import Pagination from '../components/Pagination';

export default function PpdbView({ currentUser, onSwitchTab }) {
  const [mode, setMode] = useState('admin'); // Default admin table view
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

  // State Table Data & Filters
  const [ppdbList, setPpdbList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterJalur, setFilterJalur] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [selectedDetail, setSelectedDetail] = useState(null);
  const [kelasList, setKelasList] = useState([]);
  const [statistikData, setStatistikData] = useState(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showJadwalModal, setShowJadwalModal] = useState(false);
  const [jadwalForm, setJadwalForm] = useState({
    pendaftaran_buka: '',
    pendaftaran_tutup: '',
    is_pendaftaran_open: true,
    daftar_ulang_buka: '',
    daftar_ulang_tutup: '',
    is_daftar_ulang_open: true,
    pengumuman_buka: '',
    pengumuman_tutup: '',
    is_pengumuman_open: true
  });

  // State Input Tes Admin
  const [tesForm, setTesForm] = useState({
    jadwal_tes: '',
    lokasi_tes: 'Ruang Ujian Utama',
    nilai_tes_tulis: '',
    nilai_tes_wawancara: '',
    nilai_baca_quran: ''
  });

  const isAdmin = true;

  useEffect(() => {
    fetchAdminData();
    fetchKelas();
    fetchStatistik();
    fetchJadwal();
  }, []);

  const fetchJadwal = async () => {
    try {
      const res = await api.get('/ppdb/jadwal');
      if (res.data.success && res.data.data) {
        const d = res.data.data;
        const formatDT = (dtStr) => {
          if (!dtStr) return '';
          const date = new Date(dtStr);
          if (isNaN(date.getTime())) return '';
          const pad = (n) => String(n).padStart(2, '0');
          return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
        };
        setJadwalForm({
          pendaftaran_buka: formatDT(d.pendaftaran_buka),
          pendaftaran_tutup: formatDT(d.pendaftaran_tutup),
          is_pendaftaran_open: d.is_pendaftaran_open === undefined ? true : Boolean(d.is_pendaftaran_open),
          daftar_ulang_buka: formatDT(d.daftar_ulang_buka),
          daftar_ulang_tutup: formatDT(d.daftar_ulang_tutup),
          is_daftar_ulang_open: d.is_daftar_ulang_open === undefined ? true : Boolean(d.is_daftar_ulang_open),
          pengumuman_buka: formatDT(d.pengumuman_buka),
          pengumuman_tutup: formatDT(d.pengumuman_tutup),
          is_pengumuman_open: d.is_pengumuman_open === undefined ? true : Boolean(d.is_pengumuman_open)
        });
      }
    } catch (e) {}
  };

  const handleSaveJadwal = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/ppdb/jadwal', jadwalForm);
      if (res.data.success) {
        Swal.fire('Berhasil', 'Setting Jadwal PPDB telah disimpan!', 'success');
        setShowJadwalModal(false);
      }
    } catch (err) {
      Swal.fire('Gagal', err.response?.data?.message || 'Gagal menyimpan jadwal', 'error');
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus, filterJalur]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/ppdb');
      if (res.data.success && Array.isArray(res.data.data)) {
        setPpdbList(res.data.data);
      } else {
        setPpdbList([]);
      }
    } catch (e) {
      console.error('Failed fetching PPDB list:', e);
      setPpdbList([]);
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
        setShowRegisterModal(false);
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

  const handleDelete = (calon) => {
    Swal.fire({
      title: 'Hapus Data PPDB?',
      text: `Apakah Anda yakin ingin menghapus data pendaftaran "${calon.nama_lengkap}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await api.delete(`/ppdb/${calon.id}`);
          Swal.fire('Berhasil!', 'Data pendaftaran berhasil dihapus.', 'success');
          fetchAdminData();
          fetchStatistik();
        } catch (err) {
          Swal.fire('Error', err.response?.data?.message || 'Gagal menghapus data.', 'error');
        }
      }
    });
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
        return <span style={{ background: '#dcfce7', color: '#16a34a', padding: '3px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700 }}>Resmi Diterima</span>;
      case 'Daftar Ulang':
        return <span style={{ background: '#e0f2fe', color: '#0284c7', padding: '3px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700 }}>Daftar Ulang</span>;
      case 'Lulus':
        return <span style={{ background: '#dcfce7', color: '#16a34a', padding: '3px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700 }}>Lulus Seleksi</span>;
      case 'Ditolak':
        return <span style={{ background: '#fee2e2', color: '#dc2626', padding: '3px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700 }}>Tidak Lulus</span>;
      case 'Verifikasi':
        return <span style={{ background: '#e0f2fe', color: '#075985', padding: '3px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700 }}>Verifikasi</span>;
      default:
        return <span style={{ background: '#fef3c7', color: '#92400e', padding: '3px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700 }}>Menunggu</span>;
    }
  };

  // Filter List Logic (Exact match with AdminSiswaTab)
  const filteredList = ppdbList
    .filter(s => {
      const matchSearch = (s.nama_lengkap || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (s.no_pendaftaran || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (s.nisn || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = filterStatus === 'ALL' || s.status === filterStatus;
      const matchJalur = filterJalur === 'ALL' || s.jalur_pendaftaran === filterJalur;
      return matchSearch && matchStatus && matchJalur;
    })
    .sort((a, b) => (b.id || 0) - (a.id || 0));

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedList = filteredList.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div>
      <div className="admin-panel">
        {/* HEADER PANEL (Matching Data Master Siswa) */}
        <div className="admin-panel-header">
          <div>
            <div className="admin-panel-title">
              <UserPlus size={18} color="#0284c7" /> Data PPDB Online & Seleksi
            </div>
            <div className="admin-panel-subtitle">
              Total {filteredList.length} pendaftar terdaftar dalam sistem
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-outline-admin"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
              onClick={handleExportCSV}
              title="Cetak Laporan PPDB"
            >
              <Printer size={16} color="#0284c7" /> Cetak Laporan
            </button>

            <button
              type="button"
              className="btn-outline-admin"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
              onClick={() => setShowJadwalModal(true)}
              title="Setting Jadwal PPDB"
            >
              <Calendar size={16} color="#0284c7" /> Setting Jadwal
            </button>

            <button
              type="button"
              className="btn-outline-admin"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
              onClick={() => setMode(mode === 'statistik' ? 'admin' : 'statistik')}
              title="Statistik & Rekap PPDB"
            >
              <BarChart2 size={16} color="#0284c7" /> {mode === 'statistik' ? 'Tabel Pendaftar' : 'Statistik & Rekap'}
            </button>
          </div>
        </div>

        {/* SEARCH & FILTER CONTROLS (Identical to Data Master Siswa) */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 18, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Cari berdasarkan nama pendaftar atau No. Reg / NISN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control-admin"
              style={{ paddingLeft: 40 }}
            />
          </div>

          <div style={{ width: 170 }}>
            <SearchableSelect
              options={[
                { value: 'ALL', label: 'Semua Status' },
                { value: 'Menunggu', label: 'Menunggu' },
                { value: 'Verifikasi', label: 'Verifikasi' },
                { value: 'Lulus', label: 'Lulus Seleksi' },
                { value: 'Daftar Ulang', label: 'Daftar Ulang' },
                { value: 'Diterima', label: 'Resmi Diterima' },
                { value: 'Ditolak', label: 'Tidak Lulus' }
              ]}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              placeholder="Status"
            />
          </div>

          <div style={{ width: 170 }}>
            <SearchableSelect
              options={[
                { value: 'ALL', label: 'Semua Jalur' },
                { value: 'Reguler', label: 'Reguler' },
                { value: 'Prestasi', label: 'Prestasi' },
                { value: 'Tahfidz', label: 'Tahfidz' },
                { value: 'Afirmasi', label: 'Afirmasi' }
              ]}
              value={filterJalur}
              onChange={(e) => setFilterJalur(e.target.value)}
              placeholder="Semua Jalur"
            />
          </div>

          <button className="btn-outline-admin" onClick={fetchAdminData} title="Refresh Data">
            <RefreshCw size={16} />
          </button>
        </div>

        {/* STATISTIK VIEW IF TOGGLED */}
        {mode === 'statistik' && statistikData && (
          <div style={{ background: '#f8fafc', padding: 16, borderRadius: 12, border: '1px solid #e2e8f0', marginBottom: 18 }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 800, color: '#0284c7' }}>Ringkasan Rekapitulasi PPDB</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              <div style={{ background: '#ffffff', padding: 12, borderRadius: 10, border: '1px solid #cbd5e1' }}>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700 }}>TOTAL CALON SISWA</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#0284c7', marginTop: 4 }}>{statistikData.total} Orang</div>
              </div>
              <div style={{ background: '#ffffff', padding: 12, borderRadius: 10, border: '1px solid #cbd5e1' }}>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700 }}>REKAP STATUS</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>
                  {statistikData.status.map(s => <div key={s.status}><b>{s.status}:</b> {s.jumlah}</div>)}
                </div>
              </div>
              <div style={{ background: '#ffffff', padding: 12, borderRadius: 10, border: '1px solid #cbd5e1' }}>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 700 }}>REKAP SERAGAM</div>
                <div style={{ fontSize: 12, marginTop: 4 }}>
                  {statistikData.seragam.map(sg => <div key={sg.ukuran_seragam}><b>Size {sg.ukuran_seragam}:</b> {sg.jumlah} stel</div>)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* DATA TABLE (Identical to Data Master Siswa) */}
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 50 }}>NO</th>
                <th>NIS / NISN</th>
                <th>NAMA LENGKAP SISWA</th>
                <th style={{ width: 50, textAlign: 'center' }}>L/P</th>
                <th style={{ textAlign: 'center' }}>KELAS / JALUR</th>
                <th>KONTAK ORTU (WA)</th>
                <th style={{ textAlign: 'center' }}>STATUS</th>
                <th style={{ width: 120, textAlign: 'center' }}>AKSI</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                    Memuat data PPDB...
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                    Tidak ada data pendaftaran yang cocok.
                  </td>
                </tr>
              ) : (
                paginatedList.map((s, idx) => (
                  <tr key={s.id || idx}>
                    <td style={{ fontWeight: 700, color: '#64748b', textAlign: 'center' }}>{startIndex + idx + 1}</td>
                    <td style={{ fontWeight: 700, color: '#0066ff', textAlign: 'center' }}>
                      {s.nisn || s.no_pendaftaran}
                    </td>
                    <td>
                      <div style={{ fontWeight: 800, color: '#0f172a' }}>{s.nama_lengkap}</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>No. Reg: {s.no_pendaftaran} • {s.sekolah_asal || 'Sekolah -'}</div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ fontWeight: 700, color: (s.jenis_kelamin || '').toUpperCase() === 'L' ? '#0066ff' : '#be185d' }}>
                        {(s.jenis_kelamin || '').toUpperCase() === 'L' ? 'L' : 'P'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>
                        {s.jalur_pendaftaran || 'Reguler'}
                      </span>
                    </td>
                    <td>
                      {s.no_hp_ortu ? (
                        <div>
                          <a
                            href={`https://wa.me/${String(s.no_hp_ortu).replace(/\D/g, '').replace(/^0/, '62')}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#16a34a', textDecoration: 'none', fontWeight: 700, fontSize: 12 }}
                            title="Chat WhatsApp Orang Tua"
                          >
                            <Phone size={12} /> {s.no_hp_ortu}
                          </a>
                          {(s.nama_ayah || s.nama_ibu) && (
                            <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>
                              {s.nama_ayah || s.nama_ibu}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span style={{ fontSize: 11, color: '#94a3b8', fontStyle: 'italic' }}>
                          Belum terdaftar
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {getStatusBadge(s.status)}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                        <button
                          className="btn-action-icon btn-edit"
                          title="Cetak Kartu / Detail"
                          onClick={() => handlePrintKartu(s)}
                        >
                          <Printer size={13} color="#ffffff" />
                        </button>
                        <button
                          className="btn-action-icon btn-edit"
                          title="Kelola & Input Nilai Ujian"
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
                        >
                          <Edit2 size={13} color="#ffffff" />
                        </button>
                        <button
                          className="btn-action-icon btn-delete"
                          title="Hapus Data PPDB"
                          onClick={() => handleDelete(s)}
                        >
                          <Trash2 size={13} color="#ffffff" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION (Matching Data Master Siswa) */}
        {!loading && filteredList.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <Pagination
              currentPage={currentPage}
              totalItems={filteredList.length}
              itemsPerPage={itemsPerPage}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>

      {/* MODAL FORM TAMBAH PENDAFTAR BARU */}
      {showRegisterModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16 }}>
          <div style={{ background: '#ffffff', padding: 24, borderRadius: 20, maxWidth: 650, width: '100%', maxHeight: '90vh', overflowY: 'auto', border: '1px solid #e2e8f0', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Tambah Pendaftar PPDB Baru</h3>
              <button onClick={() => setShowRegisterModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitRegister}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#475569', marginBottom: 4 }}>Nama Lengkap *</label>
                  <input type="text" name="nama_lengkap" value={formData.nama_lengkap} onChange={handleInputChange} required placeholder="Nama lengkap siswa" style={{ width: '100%', padding: '8px 12px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#475569', marginBottom: 4 }}>NISN / NIK</label>
                  <input type="text" name="nisn" value={formData.nisn} onChange={handleInputChange} placeholder="Nomor NISN" style={{ width: '100%', padding: '8px 12px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#475569', marginBottom: 4 }}>Jenis Kelamin</label>
                  <select name="jenis_kelamin" value={formData.jenis_kelamin} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 13 }}>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#475569', marginBottom: 4 }}>Sekolah Asal</label>
                  <input type="text" name="sekolah_asal" value={formData.sekolah_asal} onChange={handleInputChange} placeholder="Asal Sekolah" style={{ width: '100%', padding: '8px 12px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 13 }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#475569', marginBottom: 4 }}>Jalur Pendaftaran</label>
                  <select name="jalur_pendaftaran" value={formData.jalur_pendaftaran} onChange={handleInputChange} style={{ width: '100%', padding: '8px 12px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 13 }}>
                    <option value="Reguler">Reguler</option>
                    <option value="Prestasi">Prestasi</option>
                    <option value="Tahfidz">Tahfidz</option>
                    <option value="Afirmasi">Afirmasi</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 700, fontSize: 12, color: '#475569', marginBottom: 4 }}>No. WhatsApp Ortu *</label>
                  <input type="text" name="no_hp_ortu" value={formData.no_hp_ortu} onChange={handleInputChange} required placeholder="081234567890" style={{ width: '100%', padding: '8px 12px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 13 }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                <button type="button" onClick={() => setShowRegisterModal(false)} className="btn-outline-admin">Batal</button>
                <button type="submit" disabled={loading} className="btn-primary-admin">
                  <Send size={16} /> Simpan Pendaftar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KELOLA & INPUT NILAI UJIAN */}
      {selectedDetail && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16 }}>
          <div style={{ background: '#ffffff', padding: 24, borderRadius: 20, maxWidth: 650, width: '100%', maxHeight: '90vh', overflowY: 'auto', border: '1px solid #e2e8f0', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <h3 style={{ margin: '0 0 14px 0', fontSize: 18, fontWeight: 800, color: '#0f172a' }}>Kelola Tes & Status: {selectedDetail.nama_lengkap}</h3>

            <form onSubmit={handleSaveTesNilai} style={{ background: '#f8fafc', padding: 16, borderRadius: 14, border: '1px solid #e2e8f0', marginBottom: 14 }}>
              <h4 style={{ margin: '0 0 10px 0', fontSize: 13, fontWeight: 800, color: '#0284c7', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Award size={16} /> Input Jadwal & Nilai Ujian Masuk
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
              <button type="submit" className="btn-primary-admin" style={{ marginTop: 12 }}>
                Simpan Ujian & Kirim WA Alert
              </button>
            </form>

            <div style={{ background: '#f8fafc', padding: 14, borderRadius: 14, border: '1px solid #e2e8f0', marginBottom: 14 }}>
              <label style={{ display: 'block', fontWeight: 700, marginBottom: 8, fontSize: 12, color: '#475569' }}>Ubah Status Kelulusan (Auto WA Alert):</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <button onClick={() => handleUpdateStatus(selectedDetail.id, 'Lulus')} style={{ padding: '8px 14px', background: '#dcfce7', color: '#16a34a', border: '1px solid #86efac', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>
                  Set LULUS
                </button>
                <button onClick={() => handleUpdateStatus(selectedDetail.id, 'Ditolak')} style={{ padding: '8px 14px', background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>
                  Set DITOLAK
                </button>
              </div>
            </div>

            {(selectedDetail.status === 'Lulus' || selectedDetail.status === 'Daftar Ulang' || selectedDetail.status === 'Diterima') && (
              <div style={{ marginBottom: 14, background: '#f0fdf4', padding: 14, borderRadius: 14, border: '1px solid #bbf7d0' }}>
                <p style={{ margin: '0 0 8px 0', fontSize: 12, color: '#16a34a', fontWeight: 700 }}>
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
              <button onClick={() => setSelectedDetail(null)} className="btn-outline-admin">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SETTING JADWAL PPDB */}
      {showJadwalModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 16 }}>
          <div style={{ background: '#ffffff', padding: 24, borderRadius: 20, maxWidth: 650, width: '100%', maxHeight: '90vh', overflowY: 'auto', border: '1px solid #e2e8f0', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Calendar size={20} color="#0284c7" /> Setting Jadwal & Status PPDB Portal
              </h3>
              <button onClick={() => setShowJadwalModal(false)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveJadwal} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* GELOMBANG PENDAFTARAN */}
              <div style={{ background: '#f8fafc', padding: 16, borderRadius: 14, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <label style={{ fontWeight: 800, fontSize: 14, color: '#0f172a' }}>1. Form Pendaftaran Calon Siswa</label>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                    <input type="checkbox" checked={jadwalForm.is_pendaftaran_open} onChange={(e) => setJadwalForm(p => ({ ...p, is_pendaftaran_open: e.target.checked }))} /> Status Aktif
                  </label>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12 }}>
                  <div>
                    <label style={{ fontWeight: 700, color: '#475569' }}>Tanggal Buka Pendaftaran</label>
                    <input type="datetime-local" value={jadwalForm.pendaftaran_buka} onChange={(e) => setJadwalForm(p => ({ ...p, pendaftaran_buka: e.target.value }))} style={{ width: '100%', padding: 8, borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 12 }} />
                  </div>
                  <div>
                    <label style={{ fontWeight: 700, color: '#475569' }}>Tanggal Tutup Pendaftaran</label>
                    <input type="datetime-local" value={jadwalForm.pendaftaran_tutup} onChange={(e) => setJadwalForm(p => ({ ...p, pendaftaran_tutup: e.target.value }))} style={{ width: '100%', padding: 8, borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 12 }} />
                  </div>
                </div>
              </div>

              {/* CEK STATUS KELULUSAN */}
              <div style={{ background: '#f8fafc', padding: 16, borderRadius: 14, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <label style={{ fontWeight: 800, fontSize: 14, color: '#0f172a' }}>2. Pengumuman & Cek Status Kelulusan</label>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                    <input type="checkbox" checked={jadwalForm.is_pengumuman_open} onChange={(e) => setJadwalForm(p => ({ ...p, is_pengumuman_open: e.target.checked }))} /> Status Aktif
                  </label>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12 }}>
                  <div>
                    <label style={{ fontWeight: 700, color: '#475569' }}>Tanggal Buka Pengumuman</label>
                    <input type="datetime-local" value={jadwalForm.pengumuman_buka} onChange={(e) => setJadwalForm(p => ({ ...p, pengumuman_buka: e.target.value }))} style={{ width: '100%', padding: 8, borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 12 }} />
                  </div>
                  <div>
                    <label style={{ fontWeight: 700, color: '#475569' }}>Tanggal Tutup Pengumuman</label>
                    <input type="datetime-local" value={jadwalForm.pengumuman_tutup} onChange={(e) => setJadwalForm(p => ({ ...p, pengumuman_tutup: e.target.value }))} style={{ width: '100%', padding: 8, borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 12 }} />
                  </div>
                </div>
              </div>

              {/* PENDAFTARAN ULANG */}
              <div style={{ background: '#f8fafc', padding: 16, borderRadius: 14, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <label style={{ fontWeight: 800, fontSize: 14, color: '#0f172a' }}>3. Form Pendaftaran Ulang & Seragam</label>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                    <input type="checkbox" checked={jadwalForm.is_daftar_ulang_open} onChange={(e) => setJadwalForm(p => ({ ...p, is_daftar_ulang_open: e.target.checked }))} /> Status Aktif
                  </label>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12 }}>
                  <div>
                    <label style={{ fontWeight: 700, color: '#475569' }}>Tanggal Buka Daftar Ulang</label>
                    <input type="datetime-local" value={jadwalForm.daftar_ulang_buka} onChange={(e) => setJadwalForm(p => ({ ...p, daftar_ulang_buka: e.target.value }))} style={{ width: '100%', padding: 8, borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 12 }} />
                  </div>
                  <div>
                    <label style={{ fontWeight: 700, color: '#475569' }}>Tanggal Tutup Daftar Ulang</label>
                    <input type="datetime-local" value={jadwalForm.daftar_ulang_tutup} onChange={(e) => setJadwalForm(p => ({ ...p, daftar_ulang_tutup: e.target.value }))} style={{ width: '100%', padding: 8, borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 12 }} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button type="button" onClick={() => setShowJadwalModal(false)} className="btn-outline-admin">
                  Batal
                </button>
                <button type="submit" className="btn-primary-admin">
                  Simpan Setting Jadwal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
