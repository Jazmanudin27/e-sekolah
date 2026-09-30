import React, { useState, useEffect } from 'react';
import { Award, Filter, Fingerprint, Loader2, X, Calendar, ChevronRight, Users, CheckCircle2, HeartPulse, FileText } from 'lucide-react';
import api from '../api/client';
import SearchableSelect from '../components/SearchableSelect';

export default function RekapGuruView() {
  const now = new Date();
  const [selectedBulan, setSelectedBulan] = useState(now.getMonth() + 1);
  const [selectedTahun, setSelectedTahun] = useState(now.getFullYear());
  const [rekapList, setRekapList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Detail Modal state
  const [selectedGuru, setSelectedGuru] = useState(null);
  const [guruDetails, setGuruDetails] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const daftarBulan = [
    { value: '', label: 'Semua Bulan (Total)' },
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

  const daftarTahun = [
    { value: '', label: 'Semua Tahun' },
    { value: 2024, label: '2024' },
    { value: 2025, label: '2025' },
    { value: 2026, label: '2026' },
    { value: 2027, label: '2027' }
  ];

  useEffect(() => {
    fetchRekap(selectedBulan, selectedTahun);
  }, []);

  const fetchRekap = async (bul = selectedBulan, thn = selectedTahun) => {
    setLoading(true);
    try {
      const res = await api.get(`/rekap/guru?bulan=${bul || ''}&tahun=${thn || ''}`);
      if (res.data?.success && Array.isArray(res.data.data)) {
        const sorted = res.data.data.slice().sort((a, b) => (a.nama_guru || '').localeCompare(b.nama_guru || '', 'id', { sensitivity: 'base' }));
        setRekapList(sorted);
      } else {
        setRekapList([]);
      }
    } catch (err) {
      console.error(err);
      setRekapList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBulanChange = (e) => {
    const val = e.target.value;
    setSelectedBulan(val);
    fetchRekap(val, selectedTahun);
  };

  const handleTahunChange = (e) => {
    const val = e.target.value;
    setSelectedTahun(val);
    fetchRekap(selectedBulan, val);
  };

  const openGuruDetail = async (guru) => {
    setSelectedGuru(guru);
    setLoadingDetail(true);
    try {
      const res = await api.get(`/rekap/guru-detail?kode_guru=${guru.kode_guru}&bulan=${selectedBulan}&tahun=${selectedTahun}`);
      if (res.data?.success && Array.isArray(res.data.data)) {
        setGuruDetails(res.data.data);
      } else {
        setGuruDetails([]);
      }
    } catch (err) {
      console.error(err);
      setGuruDetails([]);
    } finally {
      setLoadingDetail(false);
    }
  };

  // Calculate totals across all teachers
  const totalGuruCount = rekapList.length;
  const totalHadirCount = rekapList.reduce((acc, curr) => acc + parseInt(curr.total_hadir || 0, 10), 0);
  const totalSakitCount = rekapList.reduce((acc, curr) => acc + parseInt(curr.total_sakit || 0, 10), 0);
  const totalIzinCount = rekapList.reduce((acc, curr) => acc + parseInt(curr.total_izin || 0, 10), 0);
  const totalDinasCount = rekapList.reduce((acc, curr) => acc + parseInt(curr.total_dinas || 0, 10), 0);
  const totalCutiCount = rekapList.reduce((acc, curr) => acc + parseInt(curr.total_cuti || 0, 10), 0);

  return (
    <div className="inner-page-wrapper" style={{ paddingTop: 4, paddingBottom: 36 }}>

      {/* FILTER CONTROL CARD */}
      <div style={{ background: '#ffffff', padding: 14, borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: '0.3px' }}>
          <Filter size={14} color="#0066ff" />
          FILTER LAPORAN PRESENSI GURU
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={{ fontSize: 10, fontWeight: 700, color: '#64748b', marginBottom: 4, display: 'block' }}>BULAN</label>
            <SearchableSelect
              options={daftarBulan.map(b => ({ value: b.value, label: b.label }))}
              value={selectedBulan}
              onChange={handleBulanChange}
              placeholder="Pilih Bulan"
            />
          </div>

          <div>
            <label style={{ fontSize: 10, fontWeight: 700, color: '#64748b', marginBottom: 4, display: 'block' }}>TAHUN</label>
            <SearchableSelect
              options={daftarTahun.map(t => ({ value: t.value, label: t.label }))}
              value={selectedTahun}
              onChange={handleTahunChange}
              placeholder="Pilih Tahun"
            />
          </div>
        </div>
      </div>

      {/* SUMMARY STATS CARDS (5 COLUMNS: HADIR, SAKIT, IZIN, DINAS, CUTI) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, marginBottom: 16 }}>
        {/* Total Hadir Card */}
        <div style={{ background: 'linear-gradient(135deg, #10b981, #047857)', borderRadius: 12, padding: '8px 4px', color: '#ffffff', boxShadow: '0 4px 10px rgba(16,185,129,0.15)', textAlign: 'center' }}>
          <div style={{ fontSize: 9, fontWeight: 800, opacity: 0.9, marginBottom: 2 }}>HADIR (H)</div>
          <div style={{ fontSize: 16, fontWeight: 900, lineHeight: 1.1 }}>{totalHadirCount}</div>
        </div>

        {/* Total Sakit Card */}
        <div style={{ background: 'linear-gradient(135deg, #0284c7, #0369a1)', borderRadius: 12, padding: '8px 4px', color: '#ffffff', boxShadow: '0 4px 10px rgba(2,132,199,0.15)', textAlign: 'center' }}>
          <div style={{ fontSize: 9, fontWeight: 800, opacity: 0.9, marginBottom: 2 }}>SAKIT (S)</div>
          <div style={{ fontSize: 16, fontWeight: 900, lineHeight: 1.1 }}>{totalSakitCount}</div>
        </div>

        {/* Total Izin Card */}
        <div style={{ background: 'linear-gradient(135deg, #f59e0b, #b45309)', borderRadius: 12, padding: '8px 4px', color: '#ffffff', boxShadow: '0 4px 10px rgba(245,158,11,0.15)', textAlign: 'center' }}>
          <div style={{ fontSize: 9, fontWeight: 800, opacity: 0.9, marginBottom: 2 }}>IZIN (I)</div>
          <div style={{ fontSize: 16, fontWeight: 900, lineHeight: 1.1 }}>{totalIzinCount}</div>
        </div>

        {/* Total Dinas Card */}
        <div style={{ background: 'linear-gradient(135deg, #06b6d4, #0e7490)', borderRadius: 12, padding: '8px 4px', color: '#ffffff', boxShadow: '0 4px 10px rgba(6,182,212,0.15)', textAlign: 'center' }}>
          <div style={{ fontSize: 9, fontWeight: 800, opacity: 0.9, marginBottom: 2 }}>DINAS (D)</div>
          <div style={{ fontSize: 16, fontWeight: 900, lineHeight: 1.1 }}>{totalDinasCount}</div>
        </div>

        {/* Total Cuti Card */}
        <div style={{ background: 'linear-gradient(135deg, #a855f7, #7e22ce)', borderRadius: 12, padding: '8px 4px', color: '#ffffff', boxShadow: '0 4px 10px rgba(168,85,247,0.15)', textAlign: 'center' }}>
          <div style={{ fontSize: 9, fontWeight: 800, opacity: 0.9, marginBottom: 2 }}>CUTI (C)</div>
          <div style={{ fontSize: 16, fontWeight: 900, lineHeight: 1.1 }}>{totalCutiCount}</div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#0066ff' }}>
          <Loader2 size={30} className="spin" style={{ margin: '0 auto' }} />
          <p style={{ marginTop: 10, fontSize: 13, fontWeight: 700 }}>Memuat laporan presensi guru...</p>
        </div>
      ) : rekapList.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Daftar Presensi Guru ({rekapList.length})</span>
            <span style={{ fontSize: 11, color: '#0066ff', fontWeight: 600 }}>Klik item untuk rincian</span>
          </div>

          {rekapList.map((item, idx) => {
            const totalH = parseInt(item.total_hadir || 0, 10);
            const totalS = parseInt(item.total_sakit || 0, 10);
            const totalI = parseInt(item.total_izin || 0, 10);
            const totalD = parseInt(item.total_dinas || 0, 10);
            const totalC = parseInt(item.total_cuti || 0, 10);

            return (
              <div
                key={item.kode_guru || idx}
                onClick={() => openGuruDetail(item)}
                style={{
                  background: '#ffffff',
                  borderRadius: 16,
                  padding: '14px 16px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {/* TOP ROW: TEACHER INFO & CHEVRON */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 12,
                        background: 'linear-gradient(135deg, #e0f2fe, #bae6fd)',
                        color: '#0284c7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: '0 2px 6px rgba(2,132,199,0.12)'
                      }}
                    >
                      <Fingerprint size={22} />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>{item.nama_guru}</div>
                      <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginTop: 2 }}>
                        NIP: {item.nip_nuptk || '-'} • <span style={{ color: '#0066ff', fontWeight: 700 }}>{item.status_kepegawaian || 'Guru'}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={18} color="#94a3b8" />
                </div>

                {/* BOTTOM ROW: STATS SUMMARY BADGES (HADIR, SAKIT, IZIN, DINAS, CUTI) */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gap: 4,
                    paddingTop: 10,
                    borderTop: '1px dashed #e2e8f0'
                  }}
                >
                  {/* Hadir Pill */}
                  <div
                    style={{
                      background: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      borderRadius: 8,
                      padding: '4px 2px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <span style={{ fontSize: 10, fontWeight: 800, color: '#15803d' }}>
                      H: {totalH}
                    </span>
                  </div>

                  {/* Sakit Pill */}
                  <div
                    style={{
                      background: '#eff6ff',
                      border: '1px solid #bfdbfe',
                      borderRadius: 8,
                      padding: '4px 2px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <span style={{ fontSize: 10, fontWeight: 800, color: '#1d4ed8' }}>
                      S: {totalS}
                    </span>
                  </div>

                  {/* Izin Pill */}
                  <div
                    style={{
                      background: '#fffbe6',
                      border: '1px solid #fde68a',
                      borderRadius: 8,
                      padding: '4px 2px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <span style={{ fontSize: 10, fontWeight: 800, color: '#b45309' }}>
                      I: {totalI}
                    </span>
                  </div>

                  {/* Dinas Pill */}
                  <div
                    style={{
                      background: '#e0f2fe',
                      border: '1px solid #bae6fd',
                      borderRadius: 8,
                      padding: '4px 2px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <span style={{ fontSize: 10, fontWeight: 800, color: '#0369a1' }}>
                      D: {totalD}
                    </span>
                  </div>

                  {/* Cuti Pill */}
                  <div
                    style={{
                      background: '#faf5ff',
                      border: '1px solid #e9d5ff',
                      borderRadius: 8,
                      padding: '4px 2px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <span style={{ fontSize: 10, fontWeight: 800, color: '#7e22ce' }}>
                      C: {totalC}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ background: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0', textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
          <Award size={48} style={{ opacity: 0.3, marginBottom: 10, margin: '0 auto' }} />
          <p style={{ fontWeight: 700, color: '#64748b', fontSize: 13 }}>Belum ada data presensi guru pada periode ini.</p>
        </div>
      )}

      {/* DETAIL MODAL WHEN TEACHER IS CLICKED */}
      {selectedGuru && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 20,
              width: '100%',
              maxWidth: 480,
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              border: '1px solid #e2e8f0',
              overflow: 'hidden'
            }}
          >
            {/* MODAL HEADER */}
            <div
              style={{
                padding: '16px 18px',
                background: 'linear-gradient(135deg, #0052cc, #0072ff)',
                color: '#ffffff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>Rincian Presensi Guru</h3>
                <div style={{ fontSize: 13, fontWeight: 800, marginTop: 2, opacity: 0.95 }}>
                  {selectedGuru.nama_guru}
                </div>
                <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2, fontWeight: 600 }}>
                  NIP: {selectedGuru.nip_nuptk || '-'} • {daftarBulan.find(b => String(b.value) === String(selectedBulan))?.label || 'Semua Bulan'} {selectedTahun || ''}
                </div>
              </div>
              <button
                onClick={() => setSelectedGuru(null)}
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* MODAL BODY */}
            <div style={{ padding: 16, overflowY: 'auto', flex: 1 }}>
              {/* SUMMARY STATS ROW IN MODAL (5 COLUMNS) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, marginBottom: 14 }}>
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '6px 4px', textAlign: 'center' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#15803d' }}>HADIR (H)</div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: '#16a34a', marginTop: 2 }}>{selectedGuru.total_hadir || 0}</div>
                </div>
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '6px 4px', textAlign: 'center' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#1d4ed8' }}>SAKIT (S)</div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: '#2563eb', marginTop: 2 }}>{selectedGuru.total_sakit || 0}</div>
                </div>
                <div style={{ background: '#fffbe6', border: '1px solid #fde68a', borderRadius: 8, padding: '6px 4px', textAlign: 'center' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#b45309' }}>IZIN (I)</div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: '#d97706', marginTop: 2 }}>{selectedGuru.total_izin || 0}</div>
                </div>
                <div style={{ background: '#e0f2fe', border: '1px solid #bae6fd', borderRadius: 8, padding: '6px 4px', textAlign: 'center' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#0369a1' }}>DINAS (D)</div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: '#0284c7', marginTop: 2 }}>{selectedGuru.total_dinas || 0}</div>
                </div>
                <div style={{ background: '#faf5ff', border: '1px solid #e9d5ff', borderRadius: 8, padding: '6px 4px', textAlign: 'center' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#7e22ce' }}>CUTI (C)</div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: '#9333ea', marginTop: 2 }}>{selectedGuru.total_cuti || 0}</div>
                </div>
              </div>

              {loadingDetail ? (
                <div style={{ textAlign: 'center', padding: '30px 0', color: '#0066ff' }}>
                  <Loader2 size={26} className="spin" style={{ margin: '0 auto' }} />
                  <p style={{ marginTop: 8, fontSize: 12, fontWeight: 600 }}>Memuat rincian tanggal presensi guru...</p>
                </div>
              ) : guruDetails.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 2 }}>
                    Riwayat Scan Kehadiran:
                  </div>
                  {guruDetails.map((det) => (
                    <div
                      key={det.id}
                      style={{
                        background: '#f8fafc',
                        borderRadius: 12,
                        padding: '10px 14px',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Calendar size={14} color="#0066ff" />
                          {det.tanggal_format || det.tanggal}
                        </div>
                        {det.jenis_status && det.jenis_status.toLowerCase() !== 'hadir' ? (
                          <div style={{ fontSize: 11.5, color: '#475569', marginTop: 3 }}>
                            Status: <strong style={{ color: '#0f172a' }}>{det.jenis_status}</strong>
                            {det.keterangan ? ` • "${det.keterangan}"` : ''}
                          </div>
                        ) : (
                          <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                            Masuk: {det.jam_in ? (
                              <span style={{ color: '#16a34a', fontWeight: 700 }}>{det.jam_in}</span>
                            ) : (
                              <span style={{ color: '#ef4444', fontWeight: 800, background: '#fef2f2', padding: '1px 6px', borderRadius: 6, border: '1px solid #fecaca' }}>Belum Scan</span>
                            )} • Pulang: {det.jam_out ? (
                              <span style={{ color: '#0066ff', fontWeight: 700 }}>{det.jam_out}</span>
                            ) : (
                              <span style={{ color: '#ef4444', fontWeight: 800, background: '#fef2f2', padding: '1px 6px', borderRadius: 6, border: '1px solid #fecaca' }}>Belum Scan</span>
                            )}
                          </div>
                        )}
                      </div>
                      {det.jenis_status && det.jenis_status.toLowerCase() === 'sakit' ? (
                        <span style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '3px 9px', borderRadius: 8, fontSize: 11, fontWeight: 700 }}>
                          Sakit
                        </span>
                      ) : det.jenis_status && det.jenis_status.toLowerCase() === 'izin' ? (
                        <span style={{ background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a', padding: '3px 9px', borderRadius: 8, fontSize: 11, fontWeight: 700 }}>
                          Izin
                        </span>
                      ) : det.jenis_status && det.jenis_status.toLowerCase() === 'cuti' ? (
                        <span style={{ background: '#faf5ff', color: '#9333ea', border: '1px solid #e9d5ff', padding: '3px 9px', borderRadius: 8, fontSize: 11, fontWeight: 700 }}>
                          Cuti
                        </span>
                      ) : det.jenis_status && det.jenis_status.toLowerCase() === 'dinas' ? (
                        <span style={{ background: '#e0f2fe', color: '#0284c7', border: '1px solid #bae6fd', padding: '3px 9px', borderRadius: 8, fontSize: 11, fontWeight: 700 }}>
                          Dinas
                        </span>
                      ) : det.jam_in && det.jam_out ? (
                        <span style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '3px 9px', borderRadius: 8, fontSize: 11, fontWeight: 700 }}>
                          Hadir Lengkap
                        </span>
                      ) : det.jam_in ? (
                        <span style={{ background: '#fffbe6', color: '#b45309', border: '1px solid #fde68a', padding: '3px 9px', borderRadius: 8, fontSize: 11, fontWeight: 700 }}>
                          Belum Pulang
                        </span>
                      ) : (
                        <span style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '3px 9px', borderRadius: 8, fontSize: 11, fontWeight: 700 }}>
                          Belum Absen
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px 10px', color: '#64748b', fontSize: 13, fontWeight: 600 }}>
                  Belum ada catatan scan presensi guru di database pada periode ini.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

