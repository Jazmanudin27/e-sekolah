import React, { useState, useEffect } from 'react';
import { FileBarChart, Filter, Loader2, X, Calendar, ChevronRight, Users, CheckCircle2, HeartPulse, FileText, AlertCircle } from 'lucide-react';
import api from '../api/client';

export default function RekapSiswaView() {
  const [kelasList, setKelasList] = useState([]);
  const [selectedKelas, setSelectedKelas] = useState('');
  const now = new Date();
  const [selectedBulan, setSelectedBulan] = useState(now.getMonth() + 1);
  const [selectedTahun, setSelectedTahun] = useState(now.getFullYear());
  const [rekapList, setRekapList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Detail Modal state
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState([]);
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
    fetchKelas();
  }, []);

  const fetchKelas = async () => {
    try {
      const res = await api.get('/kelas');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setKelasList(res.data.data);
      }
      fetchRekap('', selectedBulan, selectedTahun);
    } catch (err) {
      console.error(err);
      fetchRekap('', selectedBulan, selectedTahun);
    }
  };

  const fetchRekap = async (kId, bul, thn) => {
    setLoading(true);
    try {
      const res = await api.get(`/rekap/siswa?kode_kelas=${kId || ''}&bulan=${bul}&tahun=${thn}`);
      if (res.data?.success && Array.isArray(res.data.data)) {
        setRekapList(res.data.data);
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

  const openStudentDetail = async (student) => {
    setSelectedStudent(student);
    setLoadingDetail(true);
    try {
      const res = await api.get(`/rekap/siswa-detail?kode_siswa=${student.kode_siswa}&bulan=${selectedBulan}&tahun=${selectedTahun}`);
      if (res.data?.success && Array.isArray(res.data.data)) {
        setStudentDetails(res.data.data);
      } else {
        setStudentDetails([]);
      }
    } catch (err) {
      console.error(err);
      setStudentDetails([]);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleKelasChange = (e) => {
    const kId = e.target.value;
    setSelectedKelas(kId);
    fetchRekap(kId, selectedBulan, selectedTahun);
  };

  const handleBulanChange = (e) => {
    const bVal = parseInt(e.target.value, 10);
    setSelectedBulan(bVal);
    fetchRekap(selectedKelas, bVal, selectedTahun);
  };

  const handleTahunChange = (e) => {
    const tVal = parseInt(e.target.value, 10);
    setSelectedTahun(tVal);
    fetchRekap(selectedKelas, selectedBulan, tVal);
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'H':
        return <span style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '3px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700 }}>Hadir</span>;
      case 'S':
        return <span style={{ background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '3px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700 }}>Sakit</span>;
      case 'I':
        return <span style={{ background: '#fffbe6', color: '#b45309', border: '1px solid #fde68a', padding: '3px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700 }}>Izin</span>;
      case 'A':
        return <span style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '3px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700 }}>Alpha</span>;
      default:
        return <span style={{ background: '#f1f5f9', color: '#64748b', padding: '3px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700 }}>{st}</span>;
    }
  };

  // Calculate totals across all students
  const totalSiswaCount = rekapList.length;
  const totalHadirCount = rekapList.reduce((acc, curr) => acc + parseInt(curr.total_hadir || 0, 10), 0);
  const totalSakitCount = rekapList.reduce((acc, curr) => acc + parseInt(curr.total_sakit || 0, 10), 0);
  const totalIzinCount = rekapList.reduce((acc, curr) => acc + parseInt(curr.total_izin || 0, 10), 0);
  const totalAlphaCount = rekapList.reduce((acc, curr) => acc + parseInt(curr.total_alpha || 0, 10), 0);

  return (
    <div className="inner-page-wrapper" style={{ paddingTop: 4, paddingBottom: 36 }}>
      {/* FILTER CONTROL CARD */}
      <div style={{ background: '#ffffff', padding: 14, borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: '0.3px' }}>
          <Filter size={14} color="#0066ff" />
          FILTER LAPORAN ABSENSI SISWA
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 10 }}>
          <div>
            <label style={{ fontSize: 10, fontWeight: 700, color: '#64748b', marginBottom: 4, display: 'block' }}>KELAS</label>
            <select
              value={selectedKelas}
              onChange={handleKelasChange}
              style={{ width: '100%', padding: '9px 10px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 12, fontWeight: 700, background: '#f8fafc', color: '#0f172a', outline: 'none' }}
            >
              <option value="">Semua Kelas</option>
              {kelasList.map(k => (
                <option key={k.kode_kelas} value={k.kode_kelas}>{k.nama_kelas}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 10, fontWeight: 700, color: '#64748b', marginBottom: 4, display: 'block' }}>BULAN</label>
            <select
              value={selectedBulan}
              onChange={handleBulanChange}
              style={{ width: '100%', padding: '9px 10px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 12, fontWeight: 700, background: '#f8fafc', color: '#0f172a', outline: 'none' }}
            >
              {daftarBulan.map(b => (
                <option key={b.value} value={b.value}>{b.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 10, fontWeight: 700, color: '#64748b', marginBottom: 4, display: 'block' }}>TAHUN</label>
            <select
              value={selectedTahun}
              onChange={handleTahunChange}
              style={{ width: '100%', padding: '9px 10px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 12, fontWeight: 700, background: '#f8fafc', color: '#0f172a', outline: 'none' }}
            >
              {daftarTahun.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* SUMMARY STATS CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, marginBottom: 16 }}>
        <div style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', borderRadius: 12, padding: '8px 4px', color: '#ffffff', textAlign: 'center' }}>
          <div style={{ fontSize: 9, fontWeight: 700, opacity: 0.9 }}>SISWA</div>
          <div style={{ fontSize: 16, fontWeight: 900 }}>{totalSiswaCount}</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #10b981, #047857)', borderRadius: 12, padding: '8px 4px', color: '#ffffff', textAlign: 'center' }}>
          <div style={{ fontSize: 9, fontWeight: 700, opacity: 0.9 }}>HADIR</div>
          <div style={{ fontSize: 16, fontWeight: 900 }}>{totalHadirCount}</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #0284c7, #0369a1)', borderRadius: 12, padding: '8px 4px', color: '#ffffff', textAlign: 'center' }}>
          <div style={{ fontSize: 9, fontWeight: 700, opacity: 0.9 }}>SAKIT</div>
          <div style={{ fontSize: 16, fontWeight: 900 }}>{totalSakitCount}</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #f59e0b, #b45309)', borderRadius: 12, padding: '8px 4px', color: '#ffffff', textAlign: 'center' }}>
          <div style={{ fontSize: 9, fontWeight: 700, opacity: 0.9 }}>IZIN</div>
          <div style={{ fontSize: 16, fontWeight: 900 }}>{totalIzinCount}</div>
        </div>
        <div style={{ background: 'linear-gradient(135deg, #ef4444, #b91c1c)', borderRadius: 12, padding: '8px 4px', color: '#ffffff', textAlign: 'center' }}>
          <div style={{ fontSize: 9, fontWeight: 700, opacity: 0.9 }}>ALPHA</div>
          <div style={{ fontSize: 16, fontWeight: 900 }}>{totalAlphaCount}</div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#0066ff' }}>
          <Loader2 size={30} className="spin" style={{ margin: '0 auto' }} />
          <p style={{ marginTop: 10, fontSize: 13, fontWeight: 700 }}>Memuat laporan absensi siswa...</p>
        </div>
      ) : rekapList.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Daftar Presensi Siswa ({rekapList.length})</span>
            <span style={{ fontSize: 11, color: '#0066ff', fontWeight: 600 }}>Klik item untuk rincian</span>
          </div>

          {rekapList.map((item, idx) => {
            const totalH = parseInt(item.total_hadir || 0, 10);
            const totalS = parseInt(item.total_sakit || 0, 10);
            const totalI = parseInt(item.total_izin || 0, 10);
            const totalA = parseInt(item.total_alpha || 0, 10);

            return (
              <div
                key={item.kode_siswa || idx}
                onClick={() => openStudentDetail(item)}
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
                {/* TOP ROW: STUDENT INFO & CHEVRON */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: 12,
                        background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
                        color: '#2563eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: '0 2px 6px rgba(37,99,235,0.12)'
                      }}
                    >
                      <Users size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>{item.nama_siswa}</div>
                      <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginTop: 2 }}>
                        NIS: {item.nis_nisn} • <span style={{ color: '#0066ff', fontWeight: 700 }}>{item.nama_kelas || 'Kelas'}</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={18} color="#94a3b8" />
                </div>

                {/* BOTTOM ROW: STATS BADGES (HADIR, SAKIT, IZIN, ALPHA) */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: 6,
                    paddingTop: 10,
                    borderTop: '1px dashed #e2e8f0'
                  }}
                >
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '5px 4px', textAlign: 'center' }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: '#15803d' }}>Hadir: {totalH}</span>
                  </div>
                  <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '5px 4px', textAlign: 'center' }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: '#1d4ed8' }}>Sakit: {totalS}</span>
                  </div>
                  <div style={{ background: '#fffbe6', border: '1px solid #fde68a', borderRadius: 8, padding: '5px 4px', textAlign: 'center' }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: '#b45309' }}>Izin: {totalI}</span>
                  </div>
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '5px 4px', textAlign: 'center' }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: '#dc2626' }}>Alfa: {totalA}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ background: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0', textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
          <FileBarChart size={48} style={{ opacity: 0.3, marginBottom: 10, margin: '0 auto' }} />
          <p style={{ fontWeight: 700, color: '#64748b', fontSize: 13 }}>Belum ada data rekap absensi siswa pada periode ini.</p>
        </div>
      )}

      {/* DETAIL MODAL WHEN STUDENT IS CLICKED */}
      {selectedStudent && (
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
                <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>Detail Absensi Siswa</h3>
                <div style={{ fontSize: 13, fontWeight: 800, marginTop: 2, opacity: 0.95 }}>
                  {selectedStudent.nama_siswa}
                </div>
                <div style={{ fontSize: 11, opacity: 0.85, marginTop: 2, fontWeight: 600 }}>
                  NIS: {selectedStudent.nis_nisn} • {daftarBulan.find(b => b.value === selectedBulan)?.label} {selectedTahun}
                </div>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: 8, width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* MODAL BODY */}
            <div style={{ padding: 16, overflowY: 'auto', flex: 1 }}>
              {/* SUMMARY STATS ROW IN MODAL */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 14 }}>
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '6px 4px', textAlign: 'center' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#15803d' }}>HADIR</div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: '#16a34a', marginTop: 1 }}>{selectedStudent.total_hadir || 0}</div>
                </div>
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '6px 4px', textAlign: 'center' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#1d4ed8' }}>SAKIT</div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: '#2563eb', marginTop: 1 }}>{selectedStudent.total_sakit || 0}</div>
                </div>
                <div style={{ background: '#fffbe6', border: '1px solid #fde68a', borderRadius: 10, padding: '6px 4px', textAlign: 'center' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#b45309' }}>IZIN</div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: '#d97706', marginTop: 1 }}>{selectedStudent.total_izin || 0}</div>
                </div>
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, padding: '6px 4px', textAlign: 'center' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#dc2626' }}>ALPHA</div>
                  <div style={{ fontSize: 14, fontWeight: 900, color: '#dc2626', marginTop: 1 }}>{selectedStudent.total_alpha || 0}</div>
                </div>
              </div>

              {loadingDetail ? (
                <div style={{ textAlign: 'center', padding: '30px 0', color: '#0066ff' }}>
                  <Loader2 size={26} className="spin" style={{ margin: '0 auto' }} />
                  <p style={{ marginTop: 8, fontSize: 12, fontWeight: 600 }}>Memuat rincian tanggal absensi...</p>
                </div>
              ) : studentDetails.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 2 }}>
                    Riwayat Tanggal Absensi:
                  </div>
                  {studentDetails.map((det) => (
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Calendar size={14} color="#0066ff" />
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>{det.tanggal_format || det.tanggal}</span>
                      </div>
                      <div>{getStatusBadge(det.status)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px 10px', color: '#64748b', fontSize: 13, fontWeight: 600 }}>
                  Belum ada catatan rincian tanggal absensi di database pada periode ini.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

