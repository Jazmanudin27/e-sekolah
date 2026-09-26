import React, { useState, useEffect } from 'react';
import { FileBarChart, Filter, Users, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '../api/client';

export default function RekapSiswaView() {
  const [kelasList, setKelasList] = useState([]);
  const [selectedKelas, setSelectedKelas] = useState('');
  const now = new Date();
  const [selectedBulan, setSelectedBulan] = useState(now.getMonth() + 1);
  const [selectedTahun, setSelectedTahun] = useState(now.getFullYear());
  const [rekapList, setRekapList] = useState([]);
  const [loading, setLoading] = useState(false);

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
      if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setKelasList(res.data.data);
        const firstK = res.data.data[0].kode_kelas;
        setSelectedKelas(firstK);
        fetchRekap(firstK, selectedBulan, selectedTahun);
      }
    } catch (err) {
      console.error(err);
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

  return (
    <div className="inner-page-wrapper" style={{ paddingTop: 4, paddingBottom: 36 }}>
      {/* FILTER CONTROL CARD */}
      <div style={{ background: '#ffffff', padding: 14, borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: '0.3px' }}>
          <Filter size={14} color="#0066ff" />
          LAPORAN REKAP ABSENSI SISWA
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

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#0066ff' }}>
          <Loader2 size={30} className="spin" style={{ margin: '0 auto' }} />
          <p style={{ marginTop: 10, fontSize: 13, fontWeight: 700 }}>Memuat laporan rekap absensi siswa...</p>
        </div>
      ) : rekapList.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
            Data Rekapitulasi Siswa ({rekapList.length} Siswa)
          </div>

          {rekapList.map((item, idx) => {
            const totalH = parseInt(item.total_hadir || 0, 10);
            const totalS = parseInt(item.total_sakit || 0, 10);
            const totalI = parseInt(item.total_izin || 0, 10);
            const totalA = parseInt(item.total_alpha || 0, 10);
            const totalPertemuan = totalH + totalS + totalI + totalA;
            const pct = totalPertemuan > 0 ? Math.round((totalH / totalPertemuan) * 100) : 0;

            return (
              <div
                key={item.kode_siswa || idx}
                style={{
                  background: '#ffffff',
                  borderRadius: 14,
                  padding: '12px 14px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>{item.nama_siswa}</div>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginTop: 2 }}>
                    NIS: {item.nis_nisn} • Kelas: {item.nama_kelas || 'Kelas'}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 6, fontSize: 11, fontWeight: 700 }}>
                    <span style={{ background: '#f0fdf4', color: '#16a34a', padding: '3px 8px', borderRadius: 6, border: '1px solid #bbf7d0' }}>H: {totalH}</span>
                    <span style={{ background: '#e0f2fe', color: '#0284c7', padding: '3px 8px', borderRadius: 6, border: '1px solid #bae6fd' }}>S: {totalS}</span>
                    <span style={{ background: '#fef3c7', color: '#d97706', padding: '3px 8px', borderRadius: 6, border: '1px solid #fde68a' }}>I: {totalI}</span>
                    <span style={{ background: '#fef2f2', color: '#dc2626', padding: '3px 8px', borderRadius: 6, border: '1px solid #fecaca' }}>A: {totalA}</span>
                  </div>

                  <div style={{ textAlign: 'right', minWidth: 46 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: pct >= 80 ? '#16a34a' : pct >= 60 ? '#d97706' : '#dc2626' }}>
                      {pct}%
                    </div>
                    <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600 }}>Hadir</div>
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
    </div>
  );
}
