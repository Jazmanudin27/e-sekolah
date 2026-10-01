import React, { useState, useEffect } from 'react';
import {
  GraduationCap, TrendingUp, Users, CheckSquare, Square,
  ArrowRight, Search, Filter, RotateCcw, History, Award,
  AlertCircle, Calendar, RefreshCw, Check, Undo2
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../api/client';
import SearchableSelect from '../../components/SearchableSelect';
import Pagination from '../../components/Pagination';

export default function AdminKenaikanAlumniTab() {
  const [activeSubTab, setActiveSubTab] = useState('kenaikan'); // 'kenaikan' | 'kelulusan' | 'alumni' | 'riwayat'
  const [kelasList, setKelasList] = useState([]);
  const [stats, setStats] = useState({ total_aktif: 0, total_alumni: 0, total_kelas: 0, total_riwayat: 0 });
  const [loadingStats, setLoadingStats] = useState(false);

  // ================= TAB 1: KENAIKAN KELAS =================
  const [kelasAsalKenaikan, setKelasAsalKenaikan] = useState('');
  const [kelasTujuanKenaikan, setKelasTujuanKenaikan] = useState('');
  const [tahunAjaranKenaikan, setTahunAjaranKenaikan] = useState('2026/2027');
  const [keteranganKenaikan, setKeteranganKenaikan] = useState('');
  const [siswaKenaikanList, setSiswaKenaikanList] = useState([]);
  const [selectedKenaikanIds, setSelectedKenaikanIds] = useState([]);
  const [loadingSiswaKenaikan, setLoadingSiswaKenaikan] = useState(false);
  const [submittingKenaikan, setSubmittingKenaikan] = useState(false);
  const [searchKenaikan, setSearchKenaikan] = useState('');

  // ================= TAB 2: KELULUSAN (ALUMNI) =================
  const [kelasLulus, setKelasLulus] = useState('');
  const [tahunLulusInput, setTahunLulusInput] = useState('2025/2026');
  const [catatanLulus, setCatatanLulus] = useState('');
  const [siswaLulusList, setSiswaLulusList] = useState([]);
  const [selectedLulusIds, setSelectedLulusIds] = useState([]);
  const [loadingSiswaLulus, setLoadingSiswaLulus] = useState(false);
  const [submittingLulus, setSubmittingLulus] = useState(false);
  const [searchLulus, setSearchLulus] = useState('');

  // ================= TAB 3: DIREKTORI ALUMNI =================
  const [alumniList, setAlumniList] = useState([]);
  const [loadingAlumni, setLoadingAlumni] = useState(false);
  const [searchAlumni, setSearchAlumni] = useState('');
  const [filterTahunLulus, setFilterTahunLulus] = useState('ALL');
  const [tahunLulusOptions, setTahunLulusOptions] = useState([]);
  const [currentPageAlumni, setCurrentPageAlumni] = useState(1);
  const itemsPerPageAlumni = 10;

  // ================= TAB 4: RIWAYAT MUTASI =================
  const [riwayatList, setRiwayatList] = useState([]);
  const [loadingRiwayat, setLoadingRiwayat] = useState(false);

  useEffect(() => {
    fetchKelas();
    fetchStats();
  }, []);

  useEffect(() => {
    if (activeSubTab === 'alumni') {
      fetchAlumni();
      fetchTahunLulusOptions();
    } else if (activeSubTab === 'riwayat') {
      fetchRiwayat();
    }
  }, [activeSubTab]);

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await api.get('/kenaikan-alumni/stats');
      if (res.data?.success) {
        setStats(res.data.data);
      }
    } catch (e) {
      console.warn('Gagal memuat stats kenaikan alumni:', e);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchKelas = async () => {
    try {
      const res = await api.get('/kelas');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setKelasList(res.data.data);
        if (res.data.data.length > 0) {
          if (!kelasAsalKenaikan) setKelasAsalKenaikan(res.data.data[0].kode_kelas);
          // Set kelas tujuan default ke kelas kedua jika ada
          if (!kelasTujuanKenaikan && res.data.data.length > 1) {
            setKelasTujuanKenaikan(res.data.data[1].kode_kelas);
          }
          if (!kelasLulus) {
            // Cek kelas tingkat akhir jika ada nama XII atau kelas terakhir
            const kelasXII = res.data.data.find(k => k.nama_kelas?.toUpperCase().includes('XII') || k.nama_kelas?.includes('12'));
            setKelasLulus(kelasXII ? kelasXII.kode_kelas : res.data.data[res.data.data.length - 1].kode_kelas);
          }
        }
      }
    } catch (e) {
      console.error('Gagal memuat kelas:', e);
    }
  };

  // Muat siswa ketika kelas asal kenaikan berubah
  useEffect(() => {
    if (kelasAsalKenaikan) {
      fetchSiswaKenaikan(kelasAsalKenaikan);
    }
  }, [kelasAsalKenaikan]);

  const fetchSiswaKenaikan = async (kodeKelas) => {
    setLoadingSiswaKenaikan(true);
    try {
      const res = await api.get(`/siswa?kode_kelas=${kodeKelas}&status=Aktif`);
      if (res.data?.success && Array.isArray(res.data.data)) {
        setSiswaKenaikanList(res.data.data);
        // Default: pilih semua siswa
        setSelectedKenaikanIds(res.data.data.map(s => s.kode_siswa));
      } else {
        setSiswaKenaikanList([]);
        setSelectedKenaikanIds([]);
      }
    } catch (e) {
      console.error(e);
      setSiswaKenaikanList([]);
      setSelectedKenaikanIds([]);
    } finally {
      setLoadingSiswaKenaikan(false);
    }
  };

  // Muat siswa ketika kelas lulus berubah
  useEffect(() => {
    if (kelasLulus) {
      fetchSiswaLulus(kelasLulus);
    }
  }, [kelasLulus]);

  const fetchSiswaLulus = async (kodeKelas) => {
    setLoadingSiswaLulus(true);
    try {
      const res = await api.get(`/siswa?kode_kelas=${kodeKelas}&status=Aktif`);
      if (res.data?.success && Array.isArray(res.data.data)) {
        setSiswaLulusList(res.data.data);
        setSelectedLulusIds(res.data.data.map(s => s.kode_siswa));
      } else {
        setSiswaLulusList([]);
        setSelectedLulusIds([]);
      }
    } catch (e) {
      console.error(e);
      setSiswaLulusList([]);
      setSelectedLulusIds([]);
    } finally {
      setLoadingSiswaLulus(false);
    }
  };

  const fetchAlumni = async () => {
    setLoadingAlumni(true);
    try {
      const res = await api.get('/kenaikan-alumni/alumni', {
        params: {
          search: searchAlumni,
          tahun_lulus: filterTahunLulus !== 'ALL' ? filterTahunLulus : undefined
        }
      });
      if (res.data?.success && res.data.data?.rows) {
        setAlumniList(res.data.data.rows);
      } else {
        setAlumniList([]);
      }
    } catch (e) {
      console.error(e);
      setAlumniList([]);
    } finally {
      setLoadingAlumni(false);
    }
  };

  const fetchTahunLulusOptions = async () => {
    try {
      const res = await api.get('/kenaikan-alumni/tahun-lulus');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setTahunLulusOptions(res.data.data);
      }
    } catch (e) {}
  };

  const fetchRiwayat = async () => {
    setLoadingRiwayat(true);
    try {
      const res = await api.get('/kenaikan-alumni/riwayat');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setRiwayatList(res.data.data);
      } else {
        setRiwayatList([]);
      }
    } catch (e) {
      console.error(e);
      setRiwayatList([]);
    } finally {
      setLoadingRiwayat(false);
    }
  };

  // ================= ACTION: PROSES KENAIKAN =================
  const handleProsesKenaikan = async () => {
    if (selectedKenaikanIds.length === 0) {
      Swal.fire('Perhatian', 'Pilih minimal satu siswa yang akan dinaikkan.', 'warning');
      return;
    }
    if (!kelasTujuanKenaikan) {
      Swal.fire('Perhatian', 'Pilih kelas tujuan kenaikan.', 'warning');
      return;
    }
    if (kelasAsalKenaikan === kelasTujuanKenaikan) {
      Swal.fire('Peringatan', 'Kelas tujuan tidak boleh sama dengan kelas asal!', 'warning');
      return;
    }

    const kelasAsalObj = kelasList.find(k => String(k.kode_kelas) === String(kelasAsalKenaikan));
    const kelasTujuanObj = kelasList.find(k => String(k.kode_kelas) === String(kelasTujuanKenaikan));

    const confirm = await Swal.fire({
      title: 'Konfirmasi Kenaikan Kelas',
      html: `
        <div style="text-align: left; font-size: 13.5px; line-height: 1.6;">
          <p>Anda akan menaikkan <strong>${selectedKenaikanIds.length} siswa</strong>:</p>
          <div style="background: #f1f5f9; padding: 12px; border-radius: 8px; margin-bottom: 12px;">
            <div>Kelas Asal: <strong style="color: #0369a1;">${kelasAsalObj?.nama_kelas || kelasAsalKenaikan}</strong></div>
            <div>Kelas Tujuan: <strong style="color: #16a34a;">${kelasTujuanObj?.nama_kelas || kelasTujuanKenaikan}</strong></div>
            <div>Tahun Ajaran: <strong>${tahunAjaranKenaikan}</strong></div>
          </div>
          <p style="color: #64748b; font-size: 12px;">Siswa yang dipilih akan otomatis dipindahkan ke kelas tujuan dan riwayat mutasi akan dicatat.</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0284c7',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Proses Kenaikan',
      cancelButtonText: 'Batal'
    });

    if (!confirm.isConfirmed) return;

    setSubmittingKenaikan(true);
    try {
      const res = await api.post('/kenaikan-alumni/kenaikan-kelas', {
        siswa_ids: selectedKenaikanIds,
        kelas_asal_id: kelasAsalKenaikan,
        kelas_tujuan_id: kelasTujuanKenaikan,
        tahun_ajaran: tahunAjaranKenaikan,
        keterangan: keteranganKenaikan
      });

      if (res.data?.success) {
        Swal.fire({
          icon: 'success',
          title: 'Kenaikan Kelas Berhasil!',
          text: `Sebanyak ${res.data.data.total_siswa} siswa berhasil dipindahkan ke kelas ${res.data.data.kelas_tujuan}.`,
          confirmButtonColor: '#0284c7'
        });
        fetchSiswaKenaikan(kelasAsalKenaikan);
        fetchStats();
      }
    } catch (err) {
      Swal.fire('Gagal!', err.response?.data?.message || 'Terjadi kesalahan saat memproses kenaikan.', 'error');
    } finally {
      setSubmittingKenaikan(false);
    }
  };

  // ================= ACTION: PROSES KELULUSAN =================
  const handleProsesKelulusan = async () => {
    if (selectedLulusIds.length === 0) {
      Swal.fire('Perhatian', 'Pilih minimal satu siswa yang akan diluluskan.', 'warning');
      return;
    }
    if (!tahunLulusInput) {
      Swal.fire('Perhatian', 'Tentukan tahun kelulusan.', 'warning');
      return;
    }

    const kelasObj = kelasList.find(k => String(k.kode_kelas) === String(kelasLulus));

    const confirm = await Swal.fire({
      title: 'Konfirmasi Kelulusan (Alumni)',
      html: `
        <div style="text-align: left; font-size: 13.5px; line-height: 1.6;">
          <p>Anda akan meluluskan <strong>${selectedLulusIds.length} siswa</strong> dari kelas <strong>${kelasObj?.nama_kelas || kelasLulus}</strong>:</p>
          <div style="background: #fefce8; border: 1px solid #fef08a; padding: 12px; border-radius: 8px; margin-bottom: 12px;">
            <div>Tahun Kelulusan: <strong style="color: #ca8a04;">${tahunLulusInput}</strong></div>
            <div>Status Siswa: <strong style="color: #16a34a;">Alumni (Lulus)</strong></div>
          </div>
          <p style="color: #64748b; font-size: 12px;">Data siswa akan diarsipkan ke Direktori Alumni dan tidak lagi muncul di absensi kelas aktif.</p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ca8a04',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Luluskan Siswa',
      cancelButtonText: 'Batal'
    });

    if (!confirm.isConfirmed) return;

    setSubmittingLulus(true);
    try {
      const res = await api.post('/kenaikan-alumni/kelulusan', {
        siswa_ids: selectedLulusIds,
        kelas_asal_id: kelasLulus,
        tahun_lulus: tahunLulusInput,
        catatan: catatanLulus
      });

      if (res.data?.success) {
        Swal.fire({
          icon: 'success',
          title: 'Kelulusan Berhasil!',
          text: `Sebanyak ${res.data.data.total_siswa} siswa berhasil dialihkan ke Direktori Alumni.`,
          confirmButtonColor: '#ca8a04'
        });
        fetchSiswaLulus(kelasLulus);
        fetchStats();
      }
    } catch (err) {
      Swal.fire('Gagal!', err.response?.data?.message || 'Terjadi kesalahan saat memproses kelulusan.', 'error');
    } finally {
      setSubmittingLulus(false);
    }
  };

  // ================= ACTION: BATAL ALUMNI =================
  const handleBatalAlumni = async (alumni) => {
    const { value: selectedKelasId } = await Swal.fire({
      title: 'Kembalikan ke Siswa Aktif?',
      html: `
        <div style="text-align: left; font-size: 13px; margin-bottom: 12px;">
          Batalkan status alumni untuk: <strong>${alumni.nama_siswa}</strong> (${alumni.nis_nisn})<br/>
          Pilih kelas aktif tempat siswa akan ditempatkan:
        </div>
      `,
      input: 'select',
      inputOptions: kelasList.reduce((acc, k) => {
        acc[k.kode_kelas] = `${k.nama_kelas} ${k.jurusan && k.jurusan !== '-' ? `(${k.jurusan})` : ''}`;
        return acc;
      }, {}),
      inputPlaceholder: 'Pilih Kelas Tujuan',
      showCancelButton: true,
      confirmButtonText: 'Kembalikan ke Aktif',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#0284c7',
      inputValidator: (value) => {
        if (!value) return 'Anda wajib memilih kelas aktif!';
      }
    });

    if (!selectedKelasId) return;

    try {
      const res = await api.post(`/kenaikan-alumni/batal-alumni/${alumni.kode_siswa}`, {
        kode_kelas_tujuan: selectedKelasId,
        keterangan: 'Pembatalan status alumni secara manual oleh admin'
      });
      if (res.data?.success) {
        Swal.fire('Berhasil!', `Siswa ${alumni.nama_siswa} berhasil dikembalikan ke status aktif.`, 'success');
        fetchAlumni();
        fetchStats();
      }
    } catch (err) {
      Swal.fire('Gagal!', err.response?.data?.message || 'Gagal membatalkan status alumni.', 'error');
    }
  };

  // Filter Kenaikan Siswa
  const filteredKenaikan = siswaKenaikanList.filter(s =>
    (s.nama_siswa || '').toLowerCase().includes(searchKenaikan.toLowerCase()) ||
    (s.nis_nisn || '').toLowerCase().includes(searchKenaikan.toLowerCase())
  );

  // Toggle select all kenaikan
  const handleToggleSelectAllKenaikan = () => {
    if (selectedKenaikanIds.length === filteredKenaikan.length) {
      setSelectedKenaikanIds([]);
    } else {
      setSelectedKenaikanIds(filteredKenaikan.map(s => s.kode_siswa));
    }
  };

  const handleToggleKenaikan = (id) => {
    setSelectedKenaikanIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Filter Lulus Siswa
  const filteredLulus = siswaLulusList.filter(s =>
    (s.nama_siswa || '').toLowerCase().includes(searchLulus.toLowerCase()) ||
    (s.nis_nisn || '').toLowerCase().includes(searchLulus.toLowerCase())
  );

  const handleToggleSelectAllLulus = () => {
    if (selectedLulusIds.length === filteredLulus.length) {
      setSelectedLulusIds([]);
    } else {
      setSelectedLulusIds(filteredLulus.map(s => s.kode_siswa));
    }
  };

  const handleToggleLulus = (id) => {
    setSelectedLulusIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Pagination Alumni
  const filteredAlumni = alumniList.filter(a => {
    const matchSearch = (a.nama_siswa || '').toLowerCase().includes(searchAlumni.toLowerCase()) ||
                        (a.nis_nisn || '').toLowerCase().includes(searchAlumni.toLowerCase());
    const matchTahun = filterTahunLulus === 'ALL' || a.tahun_lulus === filterTahunLulus;
    return matchSearch && matchTahun;
  });

  const startIndexAlumni = (currentPageAlumni - 1) * itemsPerPageAlumni;
  const paginatedAlumni = filteredAlumni.slice(startIndexAlumni, startIndexAlumni + itemsPerPageAlumni);

  return (
    <div>
      {/* ================= HEADER STATS ================= */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 20 }}>
        <div style={{ background: '#ffffff', borderRadius: 16, padding: '16px 20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
            <Users size={22} />
          </div>
          <div>
            <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Siswa Aktif</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>{loadingStats ? '...' : stats.total_aktif}</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: 16, padding: '16px 20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#d97706' }}>
            <Award size={22} />
          </div>
          <div>
            <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Alumni</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>{loadingStats ? '...' : stats.total_alumni}</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: 16, padding: '16px 20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
            <GraduationCap size={22} />
          </div>
          <div>
            <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Rombel Kelas</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>{loadingStats ? '...' : stats.total_kelas}</div>
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: 16, padding: '16px 20px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 2px 6px rgba(0,0,0,0.03)' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}>
            <History size={22} />
          </div>
          <div>
            <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Riwayat Kenaikan</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#0f172a' }}>{loadingStats ? '...' : stats.total_riwayat}</div>
          </div>
        </div>
      </div>

      {/* ================= SUB-NAVIGATION TABS ================= */}
      <div className="admin-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', padding: '6px 12px', gap: 8, overflowX: 'auto' }}>
          <button
            type="button"
            onClick={() => setActiveSubTab('kenaikan')}
            style={{
              padding: '10px 18px',
              borderRadius: 10,
              border: 'none',
              background: activeSubTab === 'kenaikan' ? '#0284c7' : 'transparent',
              color: activeSubTab === 'kenaikan' ? '#ffffff' : '#64748b',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.15s ease'
            }}
          >
            <TrendingUp size={16} /> Kenaikan Kelas Massal
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('kelulusan')}
            style={{
              padding: '10px 18px',
              borderRadius: 10,
              border: 'none',
              background: activeSubTab === 'kelulusan' ? '#0284c7' : 'transparent',
              color: activeSubTab === 'kelulusan' ? '#ffffff' : '#64748b',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.15s ease'
            }}
          >
            <Award size={16} /> Kelulusan Siswa (Alumni)
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('alumni')}
            style={{
              padding: '10px 18px',
              borderRadius: 10,
              border: 'none',
              background: activeSubTab === 'alumni' ? '#0284c7' : 'transparent',
              color: activeSubTab === 'alumni' ? '#ffffff' : '#64748b',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.15s ease'
            }}
          >
            <Users size={16} /> Direktori Alumni
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('riwayat')}
            style={{
              padding: '10px 18px',
              borderRadius: 10,
              border: 'none',
              background: activeSubTab === 'riwayat' ? '#0284c7' : 'transparent',
              color: activeSubTab === 'riwayat' ? '#ffffff' : '#64748b',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'all 0.15s ease'
            }}
          >
            <History size={16} /> Log & Riwayat Mutasi
          </button>
        </div>

        {/* ================= TAB 1: KENAIKAN KELAS MASSAL ================= */}
        {activeSubTab === 'kenaikan' && (
          <div style={{ padding: 24 }}>
            {/* INSTRUCTION CARD */}
            <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 12, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <AlertCircle size={20} color="#0284c7" style={{ marginTop: 2, flexShrink: 0 }} />
              <div style={{ fontSize: 12.5, color: '#0369a1', lineHeight: 1.5 }}>
                <strong>Petunjuk Kenaikan Kelas:</strong> Pilih <em>Kelas Asal</em> untuk menampilkan daftar siswa aktif. Centang siswa yang dinyatakan naik kelas, lalu tentukan <em>Kelas Tujuan</em> dan <em>Tahun Ajaran Baru</em>. Siswa yang tidak dicentang akan tetap berada di kelas asal (tinggal kelas).
              </div>
            </div>

            {/* CONTROLS CARD */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: 20, marginBottom: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                    1. Kelas Asal (Saat Ini)
                  </label>
                  <SearchableSelect
                    options={kelasList.map(k => ({
                      value: k.kode_kelas,
                      label: `${k.nama_kelas} ${k.jurusan && k.jurusan !== '-' ? `(${k.jurusan})` : ''}`
                    }))}
                    value={kelasAsalKenaikan}
                    onChange={(e) => setKelasAsalKenaikan(e.target.value)}
                    placeholder="Pilih Kelas Asal"
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 20 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
                    <ArrowRight size={20} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                    2. Kelas Tujuan (Naik Ke)
                  </label>
                  <SearchableSelect
                    options={kelasList.map(k => ({
                      value: k.kode_kelas,
                      label: `${k.nama_kelas} ${k.jurusan && k.jurusan !== '-' ? `(${k.jurusan})` : ''}`
                    }))}
                    value={kelasTujuanKenaikan}
                    onChange={(e) => setKelasTujuanKenaikan(e.target.value)}
                    placeholder="Pilih Kelas Tujuan"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                    3. Tahun Ajaran Baru
                  </label>
                  <input
                    type="text"
                    className="form-control-admin"
                    value={tahunAjaranKenaikan}
                    onChange={(e) => setTahunAjaranKenaikan(e.target.value)}
                    placeholder="Contoh: 2026/2027"
                  />
                </div>
              </div>

              <div style={{ marginTop: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                  Catatan Kenaikan (Opsional)
                </label>
                <input
                  type="text"
                  className="form-control-admin"
                  value={keteranganKenaikan}
                  onChange={(e) => setKeteranganKenaikan(e.target.value)}
                  placeholder="Keterangan tambahan (misal: Rapat Pleno Kenaikan Kelas Tahun Ajaran Baru)"
                />
              </div>
            </div>

            {/* ROSTER TABLE & SELECTION */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                  type="button"
                  onClick={handleToggleSelectAllKenaikan}
                  style={{
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: 8,
                    padding: '6px 12px',
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: '#334155',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  {selectedKenaikanIds.length === filteredKenaikan.length && filteredKenaikan.length > 0 ? (
                    <CheckSquare size={16} color="#0284c7" />
                  ) : (
                    <Square size={16} color="#94a3b8" />
                  )}
                  Pilih Semua ({selectedKenaikanIds.length} / {filteredKenaikan.length} Dipilih)
                </button>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ position: 'relative', width: 260 }}>
                  <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    placeholder="Cari nama siswa atau NIS..."
                    value={searchKenaikan}
                    onChange={(e) => setSearchKenaikan(e.target.value)}
                    className="form-control-admin"
                    style={{ paddingLeft: 36, height: 36, fontSize: 12.5 }}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleProsesKenaikan}
                  disabled={submittingKenaikan || selectedKenaikanIds.length === 0}
                  className="btn-primary-admin"
                  style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', boxShadow: '0 4px 12px rgba(2,132,199,0.3)' }}
                >
                  <Check size={16} />
                  {submittingKenaikan ? 'Memproses...' : `Proses Kenaikan (${selectedKenaikanIds.length} Siswa)`}
                </button>
              </div>
            </div>

            {/* TABLE */}
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: 44, textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={selectedKenaikanIds.length === filteredKenaikan.length && filteredKenaikan.length > 0}
                        onChange={handleToggleSelectAllKenaikan}
                        style={{ cursor: 'pointer' }}
                      />
                    </th>
                    <th style={{ width: 50 }}>No</th>
                    <th>NIS / NISN</th>
                    <th>Nama Lengkap Siswa</th>
                    <th>L/P</th>
                    <th>Kelas Saat Ini</th>
                    <th>Status Kenaikan</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingSiswaKenaikan ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                        Memuat data siswa kelas asal...
                      </td>
                    </tr>
                  ) : filteredKenaikan.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                        Tidak ada siswa aktif ditemukan di kelas asal ini.
                      </td>
                    </tr>
                  ) : (
                    filteredKenaikan.map((siswa, idx) => {
                      const isSelected = selectedKenaikanIds.includes(siswa.kode_siswa);
                      return (
                        <tr
                          key={siswa.kode_siswa}
                          style={{ background: isSelected ? '#f0fdf4' : 'inherit', cursor: 'pointer' }}
                          onClick={() => handleToggleKenaikan(siswa.kode_siswa)}
                        >
                          <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleKenaikan(siswa.kode_siswa)}
                              style={{ cursor: 'pointer' }}
                            />
                          </td>
                          <td>{idx + 1}</td>
                          <td style={{ fontWeight: 600 }}>{siswa.nis_nisn}</td>
                          <td style={{ fontWeight: 700, color: '#0f172a' }}>{siswa.nama_siswa}</td>
                          <td>{siswa.jk || '-'}</td>
                          <td>{siswa.nama_kelas || '-'}</td>
                          <td>
                            {isSelected ? (
                              <span style={{ background: '#dcfce7', color: '#16a34a', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <Check size={12} /> Naik Kelas
                              </span>
                            ) : (
                              <span style={{ background: '#fee2e2', color: '#dc2626', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700 }}>
                                Tinggal Kelas
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 2: KELULUSAN SISWA (ALUMNI) ================= */}
        {activeSubTab === 'kelulusan' && (
          <div style={{ padding: 24 }}>
            <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: 12, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <Award size={20} color="#d97706" style={{ marginTop: 2, flexShrink: 0 }} />
              <div style={{ fontSize: 12.5, color: '#b45309', lineHeight: 1.5 }}>
                <strong>Petunjuk Kelulusan (Alumni):</strong> Pilih kelas tingkat akhir (misal kelas XII). Centang siswa yang dinyatakan <strong>Lulus</strong> dan masukkan tahun kelulusan. Siswa yang diluluskan akan otomatis berstatus <strong>Alumni</strong> dan diarsipkan dari daftar siswa aktif.
              </div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: 20, marginBottom: 20 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                    1. Kelas Tingkat Akhir
                  </label>
                  <SearchableSelect
                    options={kelasList.map(k => ({
                      value: k.kode_kelas,
                      label: `${k.nama_kelas} ${k.jurusan && k.jurusan !== '-' ? `(${k.jurusan})` : ''}`
                    }))}
                    value={kelasLulus}
                    onChange={(e) => setKelasLulus(e.target.value)}
                    placeholder="Pilih Kelas Tingkat Akhir"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                    2. Tahun Kelulusan
                  </label>
                  <input
                    type="text"
                    className="form-control-admin"
                    value={tahunLulusInput}
                    onChange={(e) => setTahunLulusInput(e.target.value)}
                    placeholder="Contoh: 2025/2026 atau 2026"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                    3. Catatan / SK Kelulusan (Opsional)
                  </label>
                  <input
                    type="text"
                    className="form-control-admin"
                    value={catatanLulus}
                    onChange={(e) => setCatatanLulus(e.target.value)}
                    placeholder="Nomor SK Kelulusan atau Catatan"
                  />
                </div>
              </div>
            </div>

            {/* SELECTION BAR */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                  type="button"
                  onClick={handleToggleSelectAllLulus}
                  style={{
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: 8,
                    padding: '6px 12px',
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: '#334155',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6
                  }}
                >
                  {selectedLulusIds.length === filteredLulus.length && filteredLulus.length > 0 ? (
                    <CheckSquare size={16} color="#d97706" />
                  ) : (
                    <Square size={16} color="#94a3b8" />
                  )}
                  Pilih Semua ({selectedLulusIds.length} / {filteredLulus.length} Dipilih)
                </button>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <div style={{ position: 'relative', width: 260 }}>
                  <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    placeholder="Cari siswa tingkat akhir..."
                    value={searchLulus}
                    onChange={(e) => setSearchLulus(e.target.value)}
                    className="form-control-admin"
                    style={{ paddingLeft: 36, height: 36, fontSize: 12.5 }}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleProsesKelulusan}
                  disabled={submittingLulus || selectedLulusIds.length === 0}
                  className="btn-primary-admin"
                  style={{ background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)', boxShadow: '0 4px 12px rgba(217,119,6,0.3)' }}
                >
                  <Award size={16} />
                  {submittingLulus ? 'Memproses...' : `Luluskan Siswa (${selectedLulusIds.length} Siswa)`}
                </button>
              </div>
            </div>

            {/* TABLE */}
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: 44, textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={selectedLulusIds.length === filteredLulus.length && filteredLulus.length > 0}
                        onChange={handleToggleSelectAllLulus}
                        style={{ cursor: 'pointer' }}
                      />
                    </th>
                    <th style={{ width: 50 }}>No</th>
                    <th>NIS / NISN</th>
                    <th>Nama Siswa Tingkat Akhir</th>
                    <th>L/P</th>
                    <th>Kelas</th>
                    <th>Status Kelulusan</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingSiswaLulus ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                        Memuat data siswa kelas tingkat akhir...
                      </td>
                    </tr>
                  ) : filteredLulus.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                        Tidak ada siswa aktif ditemukan di kelas ini.
                      </td>
                    </tr>
                  ) : (
                    filteredLulus.map((siswa, idx) => {
                      const isSelected = selectedLulusIds.includes(siswa.kode_siswa);
                      return (
                        <tr
                          key={siswa.kode_siswa}
                          style={{ background: isSelected ? '#fefce8' : 'inherit', cursor: 'pointer' }}
                          onClick={() => handleToggleLulus(siswa.kode_siswa)}
                        >
                          <td style={{ textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleLulus(siswa.kode_siswa)}
                              style={{ cursor: 'pointer' }}
                            />
                          </td>
                          <td>{idx + 1}</td>
                          <td style={{ fontWeight: 600 }}>{siswa.nis_nisn}</td>
                          <td style={{ fontWeight: 700, color: '#0f172a' }}>{siswa.nama_siswa}</td>
                          <td>{siswa.jk || '-'}</td>
                          <td>{siswa.nama_kelas || '-'}</td>
                          <td>
                            {isSelected ? (
                              <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                <Award size={12} /> Dinyatakan Lulus
                              </span>
                            ) : (
                              <span style={{ background: '#f1f5f9', color: '#64748b', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                                Belum Dipilih
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ================= TAB 3: DIREKTORI ALUMNI ================= */}
        {activeSubTab === 'alumni' && (
          <div style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', gap: 10, flex: 1, maxWidth: 500 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    placeholder="Cari nama alumni atau NIS/NISN..."
                    value={searchAlumni}
                    onChange={(e) => setSearchAlumni(e.target.value)}
                    className="form-control-admin"
                    style={{ paddingLeft: 38 }}
                  />
                </div>

                <div style={{ width: 180 }}>
                  <SearchableSelect
                    options={[
                      { value: 'ALL', label: 'Semua Tahun Lulus' },
                      ...tahunLulusOptions.map(th => ({ value: th, label: `Tahun ${th}` }))
                    ]}
                    value={filterTahunLulus}
                    onChange={(e) => setFilterTahunLulus(e.target.value)}
                    placeholder="Filter Tahun"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={fetchAlumni}
                  className="btn-outline-admin"
                  title="Segarkan Data"
                >
                  <RefreshCw size={15} /> Refresh
                </button>
              </div>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: 50 }}>No</th>
                    <th>NIS / NISN</th>
                    <th>Nama Lengkap Alumni</th>
                    <th>L/P</th>
                    <th>Kelas Terakhir</th>
                    <th>Tahun Lulus</th>
                    <th>Catatan / Keterangan</th>
                    <th style={{ width: 140, textAlign: 'center' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingAlumni ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                        Memuat data direktori alumni...
                      </td>
                    </tr>
                  ) : paginatedAlumni.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                        Belum ada data siswa berstatus alumni.
                      </td>
                    </tr>
                  ) : (
                    paginatedAlumni.map((alumni, idx) => (
                      <tr key={alumni.kode_siswa}>
                        <td>{startIndexAlumni + idx + 1}</td>
                        <td style={{ fontWeight: 600 }}>{alumni.nis_nisn}</td>
                        <td style={{ fontWeight: 700, color: '#0f172a' }}>{alumni.nama_siswa}</td>
                        <td>{alumni.jk || '-'}</td>
                        <td>{alumni.kelas_terakhir || '-'}</td>
                        <td>
                          <span style={{ background: '#fef3c7', color: '#92400e', padding: '3px 8px', borderRadius: 12, fontSize: 11.5, fontWeight: 700 }}>
                            {alumni.tahun_lulus || '-'}
                          </span>
                        </td>
                        <td style={{ fontSize: 12, color: '#64748b' }}>{alumni.catatan_alumni || '-'}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleBatalAlumni(alumni)}
                            style={{
                              background: '#f1f5f9',
                              border: '1px solid #cbd5e1',
                              borderRadius: 8,
                              padding: '5px 10px',
                              fontSize: 11,
                              fontWeight: 700,
                              color: '#0284c7',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4
                            }}
                            title="Batalkan status alumni dan kembalikan ke siswa aktif"
                          >
                            <Undo2 size={13} /> Batal Alumni
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {filteredAlumni.length > itemsPerPageAlumni && (
              <Pagination
                currentPage={currentPageAlumni}
                totalItems={filteredAlumni.length}
                itemsPerPage={itemsPerPageAlumni}
                onPageChange={setCurrentPageAlumni}
              />
            )}
          </div>
        )}

        {/* ================= TAB 4: LOG & RIWAYAT MUTASI ================= */}
        {activeSubTab === 'riwayat' && (
          <div style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h4 style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#0f172a' }}>Jejak Rekam Mutasi & Kenaikan</h4>
                <p style={{ margin: '2px 0 0 0', fontSize: 12, color: '#64748b' }}>Riwayat lengkap aktivitas kenaikan kelas massal dan kelulusan siswa.</p>
              </div>
              <button type="button" onClick={fetchRiwayat} className="btn-outline-admin">
                <RefreshCw size={15} /> Refresh Log
              </button>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: 50 }}>No</th>
                    <th>Tanggal</th>
                    <th>Nama Siswa</th>
                    <th>NIS</th>
                    <th>Jenis Aksi</th>
                    <th>Kelas Asal</th>
                    <th>Kelas Tujuan</th>
                    <th>Tahun Ajaran</th>
                    <th>Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingRiwayat ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                        Memuat riwayat mutasi...
                      </td>
                    </tr>
                  ) : riwayatList.length === 0 ? (
                    <tr>
                      <td colSpan={9} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                        Belum ada catatan riwayat kenaikan atau kelulusan.
                      </td>
                    </tr>
                  ) : (
                    riwayatList.map((log, idx) => (
                      <tr key={log.id}>
                        <td>{idx + 1}</td>
                        <td style={{ fontSize: 12, color: '#64748b' }}>
                          {log.tanggal ? new Date(log.tanggal).toLocaleDateString('id-ID') : '-'}
                        </td>
                        <td style={{ fontWeight: 700, color: '#0f172a' }}>{log.nama_siswa}</td>
                        <td style={{ fontWeight: 600 }}>{log.nis || '-'}</td>
                        <td>
                          {log.jenis_aksi === 'Kenaikan' ? (
                            <span style={{ background: '#dcfce7', color: '#16a34a', padding: '3px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
                              Kenaikan
                            </span>
                          ) : log.jenis_aksi === 'Kelulusan' ? (
                            <span style={{ background: '#fef3c7', color: '#92400e', padding: '3px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
                              Kelulusan
                            </span>
                          ) : (
                            <span style={{ background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
                              {log.jenis_aksi}
                            </span>
                          )}
                        </td>
                        <td>{log.kelas_asal || '-'}</td>
                        <td style={{ fontWeight: 700, color: '#0284c7' }}>{log.kelas_tujuan || '-'}</td>
                        <td>{log.tahun_ajaran || '-'}</td>
                        <td style={{ fontSize: 12, color: '#64748b' }}>{log.keterangan || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
