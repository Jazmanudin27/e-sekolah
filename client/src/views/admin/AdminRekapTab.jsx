import React, { useState, useEffect } from 'react';
import {
  FileBarChart, RefreshCw, Users, GraduationCap, BookOpen,
  Calendar, CheckCircle2, HeartPulse, FileText, AlertCircle, X, ChevronRight,
  Printer
} from 'lucide-react';
import api from '../../api/client';
import Pagination from '../../components/Pagination';
import SearchableSelect from '../../components/SearchableSelect';
import AdminLaporanGeneratorTab from './AdminLaporanGeneratorTab';

export default function AdminRekapTab({ initialSubTab = 'guru' }) {
  const [activeSubTab, setActiveSubTab] = useState(initialSubTab);
  const [currentPage, setCurrentPage] = useState(1);
  const [showCetakModal, setShowCetakModal] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Common date filters
  const now = new Date();
  const [selectedBulan, setSelectedBulan] = useState(now.getMonth() + 1);
  const [selectedTahun, setSelectedTahun] = useState(now.getFullYear());

  // Siswa & Mapel filter state
  const [kelasList, setKelasList] = useState([]);
  const [mapelList, setMapelList] = useState([]);
  const [selectedKelas, setSelectedKelas] = useState('');
  const [selectedMapel, setSelectedMapel] = useState('');

  // Data lists
  const [rekapGuru, setRekapGuru] = useState([]);
  const [rekapSiswa, setRekapSiswa] = useState([]);
  const [rekapMapel, setRekapMapel] = useState([]);
  const [loading, setLoading] = useState(false);

  // Detail Modal
  const [detailModal, setDetailModal] = useState(null); // { type, data, details: [] }
  const [loadingDetail, setLoadingDetail] = useState(false);

  const daftarBulan = [
    { value: 1, label: 'Januari' },
    { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' },
    { value: 4, label: 'April' },
    { value: 5, label: 'Mei' },
    { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' },
    { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' },
    { value: 12, label: 'Desember' }
  ];

  const daftarTahun = [2024, 2025, 2026, 2027];

  const formatDateIndo = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const cleanStr = String(dateStr).split('T')[0];
      const parts = cleanStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        const d = new Date(year, month, day);
        return new Intl.DateTimeFormat('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        }).format(d);
      }
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }).format(d);
    } catch (e) {
      return dateStr;
    }
  };

  useEffect(() => {
    fetchDropdowns();
  }, []);

  useEffect(() => {
    fetchCurrentRekap();
  }, [activeSubTab, selectedBulan, selectedTahun, selectedKelas, selectedMapel]);

  const fetchDropdowns = async () => {
    try {
      const [resK, resM] = await Promise.all([
        api.get('/kelas'),
        api.get('/mapel')
      ]);
      if (resK.data?.success && Array.isArray(resK.data.data)) {
        setKelasList(resK.data.data);
      }
      if (resM.data?.success && Array.isArray(resM.data.data)) {
        setMapelList(resM.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCurrentRekap = async () => {
    setLoading(true);
    try {
      if (activeSubTab === 'guru') {
        const res = await api.get(`/rekap/guru?bulan=${selectedBulan}&tahun=${selectedTahun}`);
        if (res.data?.success && Array.isArray(res.data.data)) {
          const sorted = res.data.data.slice().sort((a, b) => (a.nama_guru || '').localeCompare(b.nama_guru || '', 'id', { sensitivity: 'base' }));
          setRekapGuru(sorted);
        } else {
          setRekapGuru([]);
        }
      } else if (activeSubTab === 'siswa') {
        const res = await api.get(`/rekap/siswa?kode_kelas=${selectedKelas}&bulan=${selectedBulan}&tahun=${selectedTahun}`);
        if (res.data?.success && Array.isArray(res.data.data)) {
          const sorted = res.data.data.slice().sort((a, b) => (a.nama_siswa || '').localeCompare(b.nama_siswa || '', 'id', { sensitivity: 'base' }));
          setRekapSiswa(sorted);
        } else {
          setRekapSiswa([]);
        }
      } else if (activeSubTab === 'mapel') {
        const res = await api.get(`/rekap/mapel?kode_mapel=${selectedMapel}&kode_kelas=${selectedKelas}&bulan=${selectedBulan}&tahun=${selectedTahun}`);
        if (res.data?.success && Array.isArray(res.data.data)) {
          const sorted = res.data.data.slice().sort((a, b) => (a.nama_siswa || '').localeCompare(b.nama_siswa || '', 'id', { sensitivity: 'base' }));
          setRekapMapel(sorted);
        } else {
          setRekapMapel([]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openDetail = async (type, item) => {
    setLoadingDetail(true);
    setDetailModal({ type, data: item, details: [] });
    try {
      if (type === 'guru') {
        const res = await api.get(`/rekap/guru-detail?kode_guru=${item.kode_guru}&bulan=${selectedBulan}&tahun=${selectedTahun}`);
        setDetailModal({ type, data: item, details: res.data?.data || [] });
      } else if (type === 'siswa') {
        const res = await api.get(`/rekap/siswa-detail?kode_siswa=${item.kode_siswa}&bulan=${selectedBulan}&tahun=${selectedTahun}`);
        setDetailModal({ type, data: item, details: res.data?.data || [] });
      } else if (type === 'mapel') {
        const res = await api.get(`/rekap/mapel-detail?kode_siswa=${item.kode_siswa}&kode_mapel=${selectedMapel || ''}&bulan=${selectedBulan}&tahun=${selectedTahun}`);
        setDetailModal({ type, data: item, details: res.data?.data || [] });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDetail(false);
    }
  };

  const printReport = () => {
    window.print();
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [activeSubTab, selectedBulan, selectedTahun, selectedKelas, selectedMapel]);

  const currentList = activeSubTab === 'guru' ? rekapGuru : activeSubTab === 'siswa' ? rekapSiswa : rekapMapel;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedList = currentList.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div>
      <div className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <div className="admin-panel-title">
              <FileBarChart size={18} color="#0284c7" /> Rekapitulasi Presensi & Absensi
            </div>
            <div className="admin-panel-subtitle">
              Laporan lengkap kehadiran guru, absensi harian siswa, dan absensi per mata pelajaran
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              type="button"
              className="btn-primary-admin"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
              onClick={() => setShowCetakModal(true)}
            >
              <Printer size={16} /> Cetak Laporan
            </button>
            <button className="btn-outline-admin" onClick={fetchCurrentRekap} title="Refresh">
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        {/* SUBTAB TOGGLE */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, borderBottom: '1px solid #e2e8f0', paddingBottom: 12 }}>
          <button
            className={`btn-outline-admin ${activeSubTab === 'guru' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('guru')}
            style={{
              background: activeSubTab === 'guru' ? '#0066ff' : '#ffffff',
              color: activeSubTab === 'guru' ? '#ffffff' : '#475569',
              borderColor: activeSubTab === 'guru' ? '#0066ff' : '#cbd5e1'
            }}
          >
            <Users size={16} /> Rekap Presensi Guru
          </button>

          <button
            className={`btn-outline-admin ${activeSubTab === 'siswa' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('siswa')}
            style={{
              background: activeSubTab === 'siswa' ? '#0066ff' : '#ffffff',
              color: activeSubTab === 'siswa' ? '#ffffff' : '#475569',
              borderColor: activeSubTab === 'siswa' ? '#0066ff' : '#cbd5e1'
            }}
          >
            <GraduationCap size={16} /> Rekap Absensi Siswa
          </button>

          <button
            className={`btn-outline-admin ${activeSubTab === 'mapel' ? 'active' : ''}`}
            onClick={() => setActiveSubTab('mapel')}
            style={{
              background: activeSubTab === 'mapel' ? '#0066ff' : '#ffffff',
              color: activeSubTab === 'mapel' ? '#ffffff' : '#475569',
              borderColor: activeSubTab === 'mapel' ? '#0066ff' : '#cbd5e1'
            }}
          >
            <BookOpen size={16} /> Rekap Absensi Mapel
          </button>
        </div>

        {/* FILTER BAR */}
        <div style={{ display: 'grid', gridTemplateColumns: activeSubTab === 'mapel' ? '1fr 1fr 1fr 1fr' : activeSubTab === 'siswa' ? '1.5fr 1fr 1fr' : '1fr 1fr', gap: 14, marginBottom: 20 }}>
          {activeSubTab !== 'guru' && (
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, display: 'block' }}>PILIH KELAS</label>
              <SearchableSelect
                options={[
                  { value: '', label: 'Semua Kelas' },
                  ...kelasList.map(k => ({
                    value: k.kode_kelas,
                    label: `${k.nama_kelas} ${k.jurusan && k.jurusan !== '-' ? `(${k.jurusan})` : ''}`
                  }))
                ]}
                value={selectedKelas}
                onChange={(e) => setSelectedKelas(e.target.value)}
                placeholder="Semua Kelas"
              />
            </div>
          )}

          {activeSubTab === 'mapel' && (
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, display: 'block' }}>MATA PELAJARAN</label>
              <SearchableSelect
                options={[
                  { value: '', label: 'Semua Mapel' },
                  ...mapelList.map(m => ({ value: m.kode_mapel, label: m.nama_mapel }))
                ]}
                value={selectedMapel}
                onChange={(e) => setSelectedMapel(e.target.value)}
                placeholder="Semua Mapel"
              />
            </div>
          )}

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, display: 'block' }}>BULAN</label>
            <SearchableSelect
              options={daftarBulan.map(b => ({ value: b.value, label: b.label }))}
              value={selectedBulan}
              onChange={(e) => setSelectedBulan(parseInt(e.target.value, 10))}
              placeholder="Pilih Bulan"
            />
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, display: 'block' }}>TAHUN</label>
            <SearchableSelect
              options={daftarTahun.map(t => ({ value: t, label: String(t) }))}
              value={selectedTahun}
              onChange={(e) => setSelectedTahun(parseInt(e.target.value, 10))}
              placeholder="Pilih Tahun"
            />
          </div>
        </div>

        {/* 1. REKAP GURU TABLE */}
        {activeSubTab === 'guru' && (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: 50 }}>No</th>
                  <th>Nama Guru</th>
                  <th>NIP / NUPTK</th>
                  <th>Status Kepegawaian</th>
                  <th style={{ textAlign: 'center', color: '#16a34a' }}>Hadir</th>
                  <th style={{ textAlign: 'center', color: '#2563eb' }}>Sakit</th>
                  <th style={{ textAlign: 'center', color: '#d97706' }}>Izin</th>
                  <th style={{ textAlign: 'center', color: '#0284c7' }}>Dinas</th>
                  <th style={{ textAlign: 'center', color: '#9333ea' }}>Cuti</th>
                  <th style={{ width: 90, textAlign: 'center' }}>Detail</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={10} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                      Memuat rekap guru...
                    </td>
                  </tr>
                ) : rekapGuru.length === 0 ? (
                  <tr>
                    <td colSpan={10} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                      Tidak ada data presensi guru untuk periode ini.
                    </td>
                  </tr>
                ) : (
                  paginatedList.map((g, idx) => (
                    <tr key={g.kode_guru || idx}>
                      <td style={{ fontWeight: 700, color: '#64748b', textAlign: 'center' }}>{startIndex + idx + 1}</td>
                      <td>
                        <div style={{ fontWeight: 800, color: '#0f172a' }}>{g.nama_guru}</div>
                      </td>
                      <td style={{ fontWeight: 600, textAlign: 'center' }}>{g.nip_nuptk && g.nip_nuptk !== '-' ? g.nip_nuptk : ''}</td>
                      <td style={{ textAlign: 'center' }}>
                        {g.status_kepegawaian && g.status_kepegawaian !== '-' ? (
                          <span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                            {g.status_kepegawaian}
                          </span>
                        ) : ''}
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 800, color: '#16a34a' }}>
                        {g.total_hadir || 0}
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 800, color: '#2563eb' }}>
                        {g.total_sakit || 0}
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 800, color: '#d97706' }}>
                        {g.total_izin || 0}
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 800, color: '#0284c7' }}>
                        {g.total_dinas || 0}
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 800, color: '#9333ea' }}>
                        {g.total_cuti || 0}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button className="btn-outline-detail" onClick={() => openDetail('guru', g)}>
                          Rincian <ChevronRight size={12} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. REKAP SISWA TABLE */}
        {activeSubTab === 'siswa' && (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: 50 }}>No</th>
                  <th>NIS / NISN</th>
                  <th>Nama Lengkap Siswa</th>
                  <th>Kelas</th>
                  <th style={{ width: 60, textAlign: 'center', color: '#16a34a' }}>H</th>
                  <th style={{ width: 60, textAlign: 'center', color: '#2563eb' }}>S</th>
                  <th style={{ width: 60, textAlign: 'center', color: '#d97706' }}>I</th>
                  <th style={{ width: 60, textAlign: 'center', color: '#dc2626' }}>A</th>
                  <th style={{ width: 90, textAlign: 'center' }}>Detail</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                      Memuat rekap absensi siswa...
                    </td>
                  </tr>
                ) : rekapSiswa.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                      Tidak ada data absensi siswa untuk periode ini.
                    </td>
                  </tr>
                ) : (
                  paginatedList.map((s, idx) => (
                    <tr key={s.kode_siswa || idx}>
                      <td style={{ fontWeight: 700, color: '#64748b', textAlign: 'center' }}>{startIndex + idx + 1}</td>
                      <td style={{ fontWeight: 700, color: '#0066ff', textAlign: 'center' }}>{s.nis_nisn && s.nis_nisn !== '-' ? s.nis_nisn : ''}</td>
                      <td>
                        <div style={{ fontWeight: 800, color: '#0f172a' }}>{s.nama_siswa}</div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                          {s.nama_kelas || `Kelas ${s.kode_kelas}`}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 800, color: '#16a34a' }}>{s.total_hadir || 0}</td>
                      <td style={{ textAlign: 'center', fontWeight: 800, color: '#2563eb' }}>{s.total_sakit || 0}</td>
                      <td style={{ textAlign: 'center', fontWeight: 800, color: '#d97706' }}>{s.total_izin || 0}</td>
                      <td style={{ textAlign: 'center', fontWeight: 800, color: '#dc2626' }}>{s.total_alpha || 0}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button className="btn-outline-detail" onClick={() => openDetail('siswa', s)}>
                          Rincian <ChevronRight size={12} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. REKAP MAPEL TABLE */}
        {activeSubTab === 'mapel' && (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: 50 }}>No</th>
                  <th>NIS / NISN</th>
                  <th>Nama Lengkap Siswa</th>
                  <th>Kelas</th>
                  <th>Mata Pelajaran</th>
                  <th style={{ width: 60, textAlign: 'center', color: '#16a34a' }}>H</th>
                  <th style={{ width: 60, textAlign: 'center', color: '#2563eb' }}>S</th>
                  <th style={{ width: 60, textAlign: 'center', color: '#d97706' }}>I</th>
                  <th style={{ width: 60, textAlign: 'center', color: '#dc2626' }}>A</th>
                  <th style={{ width: 90, textAlign: 'center' }}>Detail</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={10} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                      Memuat rekap absensi mapel...
                    </td>
                  </tr>
                ) : rekapMapel.length === 0 ? (
                  <tr>
                    <td colSpan={10} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                      Tidak ada data absensi mapel untuk filter yang dipilih.
                    </td>
                  </tr>
                ) : (
                  paginatedList.map((m, idx) => (
                    <tr key={m.kode_siswa || idx}>
                      <td style={{ fontWeight: 700, color: '#64748b', textAlign: 'center' }}>{startIndex + idx + 1}</td>
                      <td style={{ fontWeight: 700, color: '#0066ff', textAlign: 'center' }}>{m.nis_nisn && m.nis_nisn !== '-' ? m.nis_nisn : ''}</td>
                      <td>
                        <div style={{ fontWeight: 800, color: '#0f172a' }}>{m.nama_siswa}</div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                          {m.nama_kelas || `Kelas ${m.kode_kelas}`}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ fontWeight: 700, color: '#7c3aed' }}>
                          {m.nama_mapel || 'Semua Mapel'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 800, color: '#16a34a' }}>{m.total_hadir || 0}</td>
                      <td style={{ textAlign: 'center', fontWeight: 800, color: '#2563eb' }}>{m.total_sakit || 0}</td>
                      <td style={{ textAlign: 'center', fontWeight: 800, color: '#d97706' }}>{m.total_izin || 0}</td>
                      <td style={{ textAlign: 'center', fontWeight: 800, color: '#dc2626' }}>{m.total_alpha || 0}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button className="btn-outline-detail" onClick={() => openDetail('mapel', m)}>
                          Rincian <ChevronRight size={12} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION */}
        <Pagination
          currentPage={currentPage}
          totalItems={currentList.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* DETAIL MODAL */}
      {detailModal && (
        <div className="admin-modal-overlay" onClick={() => setDetailModal(null)}>
          <div
            className="admin-modal-box"
            style={{ maxWidth: 680, width: '94%' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div className="admin-modal-header" style={{ padding: '16px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: '0 3px 8px rgba(2, 132, 199, 0.25)',
                  flexShrink: 0
                }}>
                  <Calendar size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    Rincian Riwayat Presensi
                  </h3>
                  <div style={{ fontSize: 12, color: '#475569', marginTop: 3, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, color: '#0284c7' }}>
                      {detailModal.data.nama_guru || detailModal.data.nama_siswa}
                    </span>
                    {(detailModal.data.nip_nuptk || detailModal.data.nis_nisn) && (
                      <span style={{ background: '#e2e8f0', padding: '1px 6px', borderRadius: 4, fontSize: 11, fontWeight: 600, color: '#334155' }}>
                        {detailModal.data.nip_nuptk || detailModal.data.nis_nisn}
                      </span>
                    )}
                    {detailModal.data.nama_kelas && (
                      <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '1px 6px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>
                        {detailModal.data.nama_kelas}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDetailModal(null)}
                style={{
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: 8,
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#64748b',
                  transition: 'all 0.15s ease'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* QUICK STATS SUMMARY BANNER */}
            {(() => {
              const details = detailModal.details || [];
              const hCount = details.filter(d => {
                const js = (d.jenis_status || d.status || '').toLowerCase();
                return js === 'h' || js === 'hadir' || (!d.status && d.jam_in);
              }).length;
              const sCount = details.filter(d => {
                const js = (d.jenis_status || d.status || '').toLowerCase();
                return js === 's' || js === 'sakit';
              }).length;
              const iCount = details.filter(d => {
                const js = (d.jenis_status || d.status || '').toLowerCase();
                return js === 'i' || js === 'izin';
              }).length;
              const dCount = details.filter(d => {
                const js = (d.jenis_status || d.status || '').toLowerCase();
                return js === 'd' || js === 'dinas';
              }).length;
              const cCount = details.filter(d => {
                const js = (d.jenis_status || d.status || '').toLowerCase();
                return js === 'c' || js === 'cuti';
              }).length;
              const aCount = details.filter(d => {
                const js = (d.jenis_status || d.status || '').toLowerCase();
                return js === 'a' || js === 'alpa' || js === 'alpha';
              }).length;

              return (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, 1fr)',
                  gap: 8,
                  padding: '12px 20px',
                  background: '#ffffff',
                  borderBottom: '1px solid #e2e8f0'
                }}>
                  <div style={{ padding: '8px 10px', background: '#ecfdf5', borderRadius: 8, border: '1px solid #a7f3d0', textAlign: 'center' }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#059669' }}>Hadir (H)</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#047857', marginTop: 1 }}>{hCount}</div>
                  </div>
                  <div style={{ padding: '8px 10px', background: '#eff6ff', borderRadius: 8, border: '1px solid #bfdbfe', textAlign: 'center' }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#2563eb' }}>Sakit (S)</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#1d4ed8', marginTop: 1 }}>{sCount}</div>
                  </div>
                  <div style={{ padding: '8px 10px', background: '#fffbeb', borderRadius: 8, border: '1px solid #fde68a', textAlign: 'center' }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#d97706' }}>Izin (I)</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#b45309', marginTop: 1 }}>{iCount}</div>
                  </div>
                  <div style={{ padding: '8px 10px', background: '#e0f2fe', borderRadius: 8, border: '1px solid #bae6fd', textAlign: 'center' }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#0284c7' }}>Dinas (D)</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#0369a1', marginTop: 1 }}>{dCount}</div>
                  </div>
                  <div style={{ padding: '8px 10px', background: '#faf5ff', borderRadius: 8, border: '1px solid #e9d5ff', textAlign: 'center' }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#9333ea' }}>Cuti (C)</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#7e22ce', marginTop: 1 }}>{cCount}</div>
                  </div>
                </div>
              );
            })()}

            {/* MODAL BODY */}
            <div className="admin-modal-body" style={{ padding: '16px 20px', maxHeight: '50vh' }}>
              {loadingDetail ? (
                <div style={{ textAlign: 'center', padding: '36px 0', color: '#64748b' }}>
                  <RefreshCw size={24} style={{ margin: '0 auto 8px', display: 'block', color: '#0284c7', animation: 'spin 1s linear infinite' }} />
                  <div style={{ fontWeight: 600, fontSize: 13 }}>Memuat rincian data...</div>
                </div>
              ) : detailModal.details.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px 20px', background: '#ffffff', borderRadius: 12, border: '1px dashed #cbd5e1' }}>
                  <AlertCircle size={32} style={{ margin: '0 auto 8px', color: '#94a3b8', display: 'block' }} />
                  <div style={{ fontWeight: 700, color: '#334155', fontSize: 14 }}>Belum Ada Catatan Kehadiran</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
                    Tidak ditemukan catatan presensi/absensi untuk periode bulan ini.
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {detailModal.details.map((d, i) => {
                    const js = (d.jenis_status || d.status || '').toLowerCase();
                    const isH = js === 'h' || js === 'hadir' || (!d.status && d.jam_in);
                    const isS = js === 's' || js === 'sakit';
                    const isI = js === 'i' || js === 'izin';
                    const isD = js === 'd' || js === 'dinas';
                    const isC = js === 'c' || js === 'cuti';
                    const statusLetter = isH ? 'H' : isS ? 'S' : isI ? 'I' : isD ? 'D' : isC ? 'C' : 'A';
                    const statusLabel = isH ? 'Hadir' : isS ? 'Sakit' : isI ? 'Izin' : isD ? 'Dinas' : isC ? 'Cuti' : 'Alpha';

                    const bgCol = isH ? '#ecfdf5' : isS ? '#eff6ff' : isI ? '#fffbeb' : isD ? '#e0f2fe' : isC ? '#faf5ff' : '#fef2f2';
                    const textCol = isH ? '#059669' : isS ? '#2563eb' : isI ? '#d97706' : isD ? '#0284c7' : isC ? '#9333ea' : '#dc2626';
                    const borderCol = isH ? '#a7f3d0' : isS ? '#bfdbfe' : isI ? '#fde68a' : isD ? '#bae6fd' : isC ? '#e9d5ff' : '#fecaca';

                    return (
                      <div
                        key={d.id || i}
                        style={{
                          padding: '10px 14px',
                          background: '#ffffff',
                          borderRadius: 10,
                          border: '1px solid #e2e8f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 12,
                          boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                          <div style={{
                            width: 34,
                            height: 34,
                            borderRadius: 8,
                            background: bgCol,
                            color: textCol,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: 13,
                            border: `1px solid ${borderCol}`,
                            flexShrink: 0
                          }}>
                            {statusLetter}
                          </div>

                          <div>
                            <div style={{ fontWeight: 700, fontSize: 13, color: '#0f172a' }}>
                              {formatDateIndo(d.tanggal || d.tanggal_format)}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2, flexWrap: 'wrap' }}>
                              {d.nama_mapel && (
                                <span style={{ fontSize: 11, color: '#7c3aed', fontWeight: 600, background: '#f5f3ff', padding: '1px 6px', borderRadius: 4 }}>
                                  Mapel: {d.nama_mapel}
                                </span>
                              )}
                              {d.jam_in && (
                                <span style={{ fontSize: 11, color: '#64748b' }}>
                                  Masuk: <strong style={{ color: '#16a34a' }}>{d.jam_in}</strong> • Pulang: <strong style={{ color: '#0066ff' }}>{d.jam_out || 'Belum Scan'}</strong>
                                </span>
                              )}
                              {d.keterangan && (
                                <span style={{ fontSize: 11, color: '#475569', fontStyle: 'italic' }}>
                                  "{d.keterangan}"
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div style={{ flexShrink: 0 }}>
                          <span style={{
                            background: bgCol,
                            color: textCol,
                            border: `1px solid ${borderCol}`,
                            padding: '3px 12px',
                            borderRadius: 6,
                            fontSize: 11.5,
                            fontWeight: 800,
                            display: 'inline-block',
                            minWidth: 50,
                            textAlign: 'center'
                          }}>
                            {statusLabel}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* MODAL FOOTER */}
            <div className="admin-modal-footer" style={{ padding: '12px 20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>
                Total {detailModal.details?.length || 0} catatan
              </div>
              <button
                type="button"
                className="btn-primary-admin"
                onClick={() => setDetailModal(null)}
                style={{ padding: '6px 18px' }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CETAK LAPORAN DENGAN FORM FILTER */}
      {showCetakModal && (
        <AdminLaporanGeneratorTab
          reportType={
            activeSubTab === 'guru'
              ? 'laporanPresensiGuru'
              : activeSubTab === 'mapel'
              ? 'laporanAbsensiMapel'
              : 'laporanAbsensiSiswa'
          }
          isModal={true}
          allowSwitchType={true}
          onClose={() => setShowCetakModal(false)}
        />
      )}
    </div>
  );
}
