import React, { useState, useEffect } from 'react';
import { BookOpen, Filter, Loader2, X, Calendar, ChevronRight } from 'lucide-react';
import api from '../api/client';

export default function RekapMapelView() {
  const [mapelList, setMapelList] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [selectedMapel, setSelectedMapel] = useState('');
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
    fetchOptions();
  }, []);

  const fetchOptions = async () => {
    try {
      const [resM, resK] = await Promise.all([
        api.get('/mapel'),
        api.get('/kelas')
      ]);

      let firstM = '';
      let firstK = '';
      if (resM.data?.success && Array.isArray(resM.data.data) && resM.data.data.length > 0) {
        setMapelList(resM.data.data);
        firstM = resM.data.data[0].kode_mapel;
        setSelectedMapel(firstM);
      }
      if (resK.data?.success && Array.isArray(resK.data.data) && resK.data.data.length > 0) {
        setKelasList(resK.data.data);
        firstK = resK.data.data[0].kode_kelas;
        setSelectedKelas(firstK);
      }

      fetchRekap(firstM, firstK, selectedBulan, selectedTahun);
    } catch (err) {
      console.error(err);
      fetchRekap('', '', selectedBulan, selectedTahun);
    }
  };

  const fetchRekap = async (mId, kId, bul, thn) => {
    setLoading(true);
    try {
      const res = await api.get(`/rekap/mapel?kode_mapel=${mId || ''}&kode_kelas=${kId || ''}&bulan=${bul}&tahun=${thn}`);
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
      const res = await api.get(`/rekap/mapel-detail?kode_siswa=${student.kode_siswa}&kode_mapel=${selectedMapel || ''}&bulan=${selectedBulan}&tahun=${selectedTahun}`);
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

  const handleMapelChange = (e) => {
    const mId = e.target.value;
    setSelectedMapel(mId);
    fetchRekap(mId, selectedKelas, selectedBulan, selectedTahun);
  };

  const handleKelasChange = (e) => {
    const kId = e.target.value;
    setSelectedKelas(kId);
    fetchRekap(selectedMapel, kId, selectedBulan, selectedTahun);
  };

  const handleBulanChange = (e) => {
    const bVal = parseInt(e.target.value, 10);
    setSelectedBulan(bVal);
    fetchRekap(selectedMapel, selectedKelas, bVal, selectedTahun);
  };

  const handleTahunChange = (e) => {
    const tVal = parseInt(e.target.value, 10);
    setSelectedTahun(tVal);
    fetchRekap(selectedMapel, selectedKelas, selectedBulan, tVal);
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'H':
        return <span style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '3px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700 }}>Hadir</span>;
      case 'S':
        return <span style={{ background: '#e0f2fe', color: '#0284c7', border: '1px solid #bae6fd', padding: '3px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700 }}>Sakit</span>;
      case 'I':
        return <span style={{ background: '#fef3c7', color: '#d97706', border: '1px solid #fde68a', padding: '3px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700 }}>Izin</span>;
      case 'A':
        return <span style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '3px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700 }}>Alpha</span>;
      default:
        return <span style={{ background: '#f1f5f9', color: '#64748b', padding: '3px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700 }}>{st}</span>;
    }
  };

  return (
    <div className="inner-page-wrapper" style={{ paddingTop: 4, paddingBottom: 36 }}>
      {/* FILTER CONTROL CARD */}
      <div style={{ background: '#ffffff', padding: 14, borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: '0.3px' }}>
          <Filter size={14} color="#0066ff" />
          FILTER LAPORAN ABSENSI MATA PELAJARAN
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <label style={{ fontSize: 10, fontWeight: 700, color: '#64748b', marginBottom: 4, display: 'block' }}>MATA PELAJARAN</label>
            <select
              value={selectedMapel}
              onChange={handleMapelChange}
              style={{ width: '100%', padding: '9px 10px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 12, fontWeight: 700, background: '#f8fafc', color: '#0f172a', outline: 'none' }}
            >
              <option value="">Semua Mata Pelajaran</option>
              {mapelList.map(m => (
                <option key={m.kode_mapel} value={m.kode_mapel}>{m.nama_mapel}</option>
              ))}
            </select>
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
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#0066ff' }}>
          <Loader2 size={30} className="spin" style={{ margin: '0 auto' }} />
          <p style={{ marginTop: 10, fontSize: 13, fontWeight: 700 }}>Memuat laporan absensi mapel...</p>
        </div>
      ) : rekapList.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>Daftar Rekapitulasi Mapel ({rekapList.length})</span>
            <span style={{ fontSize: 11, color: '#0066ff', fontWeight: 600 }}>Klik item untuk lihat detail tanggal</span>
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
                  borderRadius: 14,
                  padding: '12px 14px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>{item.nama_siswa}</div>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginTop: 2 }}>
                    NIS: {item.nis_nisn} • {item.nama_mapel || 'Mapel'} ({item.nama_kelas || 'Kelas'})
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ display: 'flex', gap: 6, fontSize: 11, fontWeight: 700 }}>
                    <span style={{ background: '#f0fdf4', color: '#16a34a', padding: '3px 7px', borderRadius: 6, border: '1px solid #bbf7d0' }} title="Hadir">H: {totalH}</span>
                    <span style={{ background: '#e0f2fe', color: '#0284c7', padding: '3px 7px', borderRadius: 6, border: '1px solid #bae6fd' }} title="Sakit">S: {totalS}</span>
                    <span style={{ background: '#fef3c7', color: '#d97706', padding: '3px 8px', borderRadius: 6, border: '1px solid #fde68a', fontWeight: 800 }} title="Izin">Izin: {totalI}</span>
                    <span style={{ background: '#fef2f2', color: '#dc2626', padding: '3px 8px', borderRadius: 6, border: '1px solid #fecaca', fontWeight: 800 }} title="Alfa">Alfa: {totalA}</span>
                  </div>
                  <ChevronRight size={16} color="#94a3b8" />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ background: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0', textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
          <BookOpen size={48} style={{ opacity: 0.3, marginBottom: 10, margin: '0 auto' }} />
          <p style={{ fontWeight: 700, color: '#64748b', fontSize: 13 }}>Belum ada data rekap absensi mata pelajaran pada periode ini.</p>
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
                <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>Detail Absensi Mapel: {selectedStudent.nama_siswa}</h3>
                <div style={{ fontSize: 11, opacity: 0.9, marginTop: 2, fontWeight: 600 }}>
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

            {/* MODAL BODY LIST OF DATES */}
            <div style={{ padding: 16, overflowY: 'auto', flex: 1 }}>
              {loadingDetail ? (
                <div style={{ textAlign: 'center', padding: '30px 0', color: '#0066ff' }}>
                  <Loader2 size={26} className="spin" style={{ margin: '0 auto' }} />
                  <p style={{ marginTop: 8, fontSize: 12, fontWeight: 600 }}>Memuat rincian tanggal absensi mapel...</p>
                </div>
              ) : studentDetails.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
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
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Calendar size={14} color="#0066ff" />
                          {det.tanggal_format || det.tanggal}
                        </div>
                        <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{det.nama_mapel}</div>
                      </div>
                      <div>{getStatusBadge(det.status)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px 10px', color: '#64748b', fontSize: 13, fontWeight: 600 }}>
                  Belum ada catatan rincian absensi mapel di database pada periode ini.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
