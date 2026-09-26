import React, { useState, useEffect } from 'react';
import { Award, Filter, Fingerprint, Loader2 } from 'lucide-react';
import api from '../api/client';

export default function RekapGuruView() {
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
    fetchRekap(selectedBulan, selectedTahun);
  }, []);

  const fetchRekap = async (bul, thn) => {
    setLoading(true);
    try {
      const res = await api.get(`/rekap/guru?bulan=${bul}&tahun=${thn}`);
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

  const handleBulanChange = (e) => {
    const bVal = parseInt(e.target.value, 10);
    setSelectedBulan(bVal);
    fetchRekap(bVal, selectedTahun);
  };

  const handleTahunChange = (e) => {
    const tVal = parseInt(e.target.value, 10);
    setSelectedTahun(tVal);
    fetchRekap(selectedBulan, tVal);
  };

  return (
    <div className="inner-page-wrapper" style={{ paddingTop: 4, paddingBottom: 36 }}>
      {/* FILTER CONTROL CARD */}
      <div style={{ background: '#ffffff', padding: 14, borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: '0.3px' }}>
          <Filter size={14} color="#0066ff" />
          LAPORAN KEHADIRAN / PRESENSI GURU
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
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
          <p style={{ marginTop: 10, fontSize: 13, fontWeight: 700 }}>Memuat laporan presensi guru...</p>
        </div>
      ) : rekapList.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
            Log Kehadiran Guru ({rekapList.length} Transaksi Presensi)
          </div>

          {rekapList.map((item, idx) => (
            <div
              key={item.id || idx}
              style={{
                background: '#ffffff',
                borderRadius: 14,
                padding: '12px 14px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: '#e0f2fe',
                    color: '#0066ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Fingerprint size={20} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>{item.nama_guru}</div>
                  <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, marginTop: 2 }}>
                    {item.tanggal_format || item.tanggal} • NIP: {item.nip_nuptk}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#0066ff' }}>
                  {item.jam_in || 'Belum Scan'} - {item.jam_out || 'Belum Scan'}
                </div>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: '#16a34a',
                    background: '#f0fdf4',
                    padding: '2px 8px',
                    borderRadius: 10,
                    border: '1px solid #bbf7d0',
                    marginTop: 4,
                    display: 'inline-block'
                  }}
                >
                  HADIR PRESENSI
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0', textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
          <Award size={48} style={{ opacity: 0.3, marginBottom: 10, margin: '0 auto' }} />
          <p style={{ fontWeight: 700, color: '#64748b', fontSize: 13 }}>Belum ada data presensi guru pada periode ini.</p>
        </div>
      )}
    </div>
  );
}
