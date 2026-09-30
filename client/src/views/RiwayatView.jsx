import React, { useState, useEffect } from 'react';
import { Fingerprint, Filter } from 'lucide-react';
import api from '../api/client';
import SearchableSelect from '../components/SearchableSelect';

export default function RiwayatView() {
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(false);
  const now = new Date();
  const [selectedBulan, setSelectedBulan] = useState(now.getMonth() + 1);
  const [selectedTahun, setSelectedTahun] = useState(now.getFullYear());

  const daftarBulan = [
    { value: '', label: 'Semua Bulan (Tampilkan Semua)' },
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
    fetchHistory();
  }, [selectedBulan, selectedTahun]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/presensi/history?bulan=${selectedBulan || ''}&tahun=${selectedTahun || ''}&limit=100`);
      if (res.data?.success && Array.isArray(res.data.data)) {
        setHistoryList(res.data.data);
      } else {
        setHistoryList([]);
      }
    } catch (err) {
      console.error(err);
      setHistoryList([]);
    } finally {
      setLoading(false);
    }
  };

  const formatFullDate = (dateStr) => {
    if (!dateStr) return 'Hari ini';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      const dayName = days[d.getDay()];
      const dateNum = d.getDate();
      const monthName = months[d.getMonth()];
      const year = d.getFullYear();
      return `${dayName}, ${dateNum} ${monthName} ${year}`;
    } catch (e) {
      return dateStr;
    }
  };

  const renderTimeRange = (jamIn, jamOut) => {
    const inText = jamIn || 'Belum Scan';
    const outText = jamOut || 'Belum Scan';

    return (
      <div className="history-item-time">
        <span style={{ color: !jamIn ? '#dc2626' : '#0066ff', fontWeight: !jamIn ? 700 : 600 }}>
          {inText}
        </span>
        <span style={{ color: '#94a3b8', margin: '0 4px' }}>-</span>
        <span style={{ color: !jamOut ? '#dc2626' : '#0066ff', fontWeight: !jamOut ? 700 : 600 }}>
          {outText}
        </span>
      </div>
    );
  };

  return (
    <div className="inner-page-wrapper" style={{ paddingBottom: 36, paddingTop: 4 }}>
      {/* FILTER BULAN & TAHUN CONTROL CARD */}
      <div style={{ background: '#ffffff', padding: 14, borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: '0.3px' }}>
          <Filter size={14} color="#0066ff" />
          FILTER PERIODE PRESENSI
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={{ fontSize: 10, fontWeight: 700, color: '#64748b', marginBottom: 4, display: 'block' }}>BULAN</label>
            <SearchableSelect
              options={daftarBulan.map(b => ({ value: b.value, label: b.label }))}
              value={selectedBulan}
              onChange={(e) => setSelectedBulan(e.target.value !== '' ? parseInt(e.target.value, 10) : '')}
              placeholder="Pilih Bulan"
            />
          </div>

          <div>
            <label style={{ fontSize: 10, fontWeight: 700, color: '#64748b', marginBottom: 4, display: 'block' }}>TAHUN</label>
            <SearchableSelect
              options={daftarTahun.map(t => ({ value: t.value, label: t.label }))}
              value={selectedTahun}
              onChange={(e) => setSelectedTahun(e.target.value !== '' ? parseInt(e.target.value, 10) : '')}
              placeholder="Pilih Tahun"
            />
          </div>
        </div>
      </div>

      {/* LIST PRESENSI */}
      <div className="history-section-wrapper" style={{ width: '100%', padding: 0, background: 'none', boxShadow: 'none' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#0066ff', padding: '40px 20px', fontWeight: 600 }}>
            Memuat data presensi dari database...
          </div>
        ) : historyList.length === 0 ? (
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            border: '1px solid #e2e8f0',
            textAlign: 'center',
            padding: '40px 20px',
            color: '#64748b'
          }}>
            <Fingerprint size={48} style={{ opacity: 0.25, margin: '0 auto 10px', color: '#0066ff' }} />
            <div style={{ fontWeight: 800, fontSize: 14, color: '#0f172a' }}>Belum Ada Riwayat Presensi</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
              Tidak ditemukan data scan presensi guru di database pada periode ini.
            </div>
          </div>
        ) : (
          historyList.map((item, idx) => (
            <div key={item.id || idx} className="history-item-card">
              <div className="history-fingerprint-box">
                <Fingerprint size={20} color="#0066ff" />
              </div>
              <div className="history-item-content">
                <div className="history-item-date">{formatFullDate(item.tanggal || item.date)}</div>
                {renderTimeRange(item.jam_in, item.jam_out)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
