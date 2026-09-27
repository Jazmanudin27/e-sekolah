import React, { useState, useEffect } from 'react';
import {
  FileBarChart, Printer, RefreshCw, Users, GraduationCap, BookOpen,
  Calendar, CheckCircle2, HeartPulse, FileText, AlertCircle, X, ChevronRight
} from 'lucide-react';
import api from '../../api/client';
import Pagination from '../../components/Pagination';

export default function AdminRekapTab({ initialSubTab = 'guru' }) {
  const [activeSubTab, setActiveSubTab] = useState(initialSubTab);
  const [currentPage, setCurrentPage] = useState(1);
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
              <FileBarChart size={18} color="#0284c7" /> Pusat Laporan & Rekapitulasi Presensi
            </div>
            <div className="admin-panel-subtitle">
              Laporan lengkap kehadiran guru, absensi harian siswa, dan absensi per mata pelajaran
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-outline-admin" onClick={printReport}>
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
              <select
                value={selectedKelas}
                onChange={(e) => setSelectedKelas(e.target.value)}
                className="form-control-admin"
              >
                <option value="">Semua Kelas</option>
                {kelasList.map(k => (
                  <option key={k.kode_kelas} value={k.kode_kelas}>
                    {k.nama_kelas} {k.jurusan && k.jurusan !== '-' ? `(${k.jurusan})` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {activeSubTab === 'mapel' && (
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, display: 'block' }}>MATA PELAJARAN</label>
              <select
                value={selectedMapel}
                onChange={(e) => setSelectedMapel(e.target.value)}
                className="form-control-admin"
              >
                <option value="">Semua Mapel</option>
                {mapelList.map(m => (
                  <option key={m.kode_mapel} value={m.kode_mapel}>
                    {m.nama_mapel}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, display: 'block' }}>BULAN</label>
            <select
              value={selectedBulan}
              onChange={(e) => setSelectedBulan(parseInt(e.target.value, 10))}
              className="form-control-admin"
            >
              {daftarBulan.map(b => (
                <option key={b.value} value={b.value}>{b.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, display: 'block' }}>TAHUN</label>
            <select
              value={selectedTahun}
              onChange={(e) => setSelectedTahun(parseInt(e.target.value, 10))}
              className="form-control-admin"
            >
              {daftarTahun.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
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
                  <th style={{ width: 90, textAlign: 'center' }}>Detail</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                      Memuat rekap guru...
                    </td>
                  </tr>
                ) : rekapGuru.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
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
                      <td style={{ fontWeight: 600, textAlign: 'center' }}>{g.nip_nuptk || '-'}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
                          {g.status_kepegawaian || 'Guru'}
                        </span>
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
                      <td style={{ textAlign: 'center' }}>
                        <button className="btn-outline-admin" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => openDetail('guru', g)}>
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
                  <th style={{ textAlign: 'center', color: '#16a34a' }}>Hadir (H)</th>
                  <th style={{ textAlign: 'center', color: '#2563eb' }}>Sakit (S)</th>
                  <th style={{ textAlign: 'center', color: '#d97706' }}>Izin (I)</th>
                  <th style={{ textAlign: 'center', color: '#dc2626' }}>Alpha (A)</th>
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
                      <td style={{ fontWeight: 700, color: '#0066ff', textAlign: 'center' }}>{s.nis_nisn || `NIS-${s.kode_siswa}`}</td>
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
                        <button className="btn-outline-admin" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => openDetail('siswa', s)}>
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
                  <th style={{ textAlign: 'center', color: '#16a34a' }}>Hadir (H)</th>
                  <th style={{ textAlign: 'center', color: '#2563eb' }}>Sakit (S)</th>
                  <th style={{ textAlign: 'center', color: '#d97706' }}>Izin (I)</th>
                  <th style={{ textAlign: 'center', color: '#dc2626' }}>Alpha (A)</th>
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
                      <td style={{ fontWeight: 700, color: '#0066ff', textAlign: 'center' }}>{m.nis_nisn || `NIS-${m.kode_siswa}`}</td>
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
                        <button className="btn-outline-admin" style={{ padding: '4px 8px', fontSize: 11 }} onClick={() => openDetail('mapel', m)}>
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
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: 640 }}>
            <div className="admin-modal-header">
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Rincian Riwayat Presensi
                </h3>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                  {detailModal.data.nama_guru || detailModal.data.nama_siswa} ({detailModal.data.nip_nuptk || detailModal.data.nis_nisn || '-'})
                </div>
              </div>
              <button
                onClick={() => setDetailModal(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-body">
              {loadingDetail ? (
                <div style={{ textAlign: 'center', padding: '30px 0', color: '#64748b' }}>
                  Memuat rincian data...
                </div>
              ) : detailModal.details.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 0', color: '#64748b' }}>
                  Belum ada catatan detail kehadiran.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {detailModal.details.map((d, i) => (
                    <div
                      key={d.id || i}
                      style={{
                        padding: '12px 14px',
                        background: '#f8fafc',
                        borderRadius: 12,
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 13, color: '#0f172a' }}>
                          {d.tanggal_format || d.tanggal}
                        </div>
                        {d.jam_in && (
                          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                            Masuk: {d.jam_in} • Pulang: {d.jam_out || '-'}
                          </div>
                        )}
                        {d.nama_mapel && (
                          <div style={{ fontSize: 11, color: '#7c3aed', fontWeight: 600, marginTop: 2 }}>
                            Mapel: {d.nama_mapel}
                          </div>
                        )}
                      </div>

                      <div>
                        {d.status === 'H' || (!d.status && d.jam_in) ? (
                          <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 800 }}>
                            Hadir
                          </span>
                        ) : d.status === 'S' ? (
                          <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 800 }}>
                            Sakit
                          </span>
                        ) : d.status === 'I' ? (
                          <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 800 }}>
                            Izin
                          </span>
                        ) : (
                          <span style={{ background: '#fee2e2', color: '#dc2626', padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 800 }}>
                            Alpha
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="admin-modal-footer">
              <button type="button" className="btn-primary-admin" onClick={() => setDetailModal(null)}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
