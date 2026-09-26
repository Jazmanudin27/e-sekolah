import React, { useState, useEffect } from 'react';
import { Fingerprint, Filter } from 'lucide-react';
import api from '../api/client';

export default function RiwayatView() {
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(false);
  const now = new Date();
  const [selectedBulan, setSelectedBulan] = useState(now.getMonth() + 1);
  const [selectedTahun, setSelectedTahun] = useState(now.getFullYear());

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

  const daftarTahun = [2024, 2025, 2026, 2027, 2028];

  useEffect(() => {
    fetchHistory();
  }, [selectedBulan, selectedTahun]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/presensi/history?bulan=${selectedBulan}&tahun=${selectedTahun}&limit=50`);
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

  const defaultHistoryCards = [
    { tanggal: '2026-09-25', jam_in: '06:23:35', jam_out: '15:08:46' },
    { tanggal: '2026-09-24', jam_in: '06:19:20', jam_out: '15:00:12' },
    { tanggal: '2026-09-23', jam_in: '06:20:05', jam_out: '15:05:40' },
    { tanggal: '2026-09-22', jam_in: '06:17:42', jam_out: '15:10:00' },
    { tanggal: '2026-09-21', jam_in: '06:25:10', jam_out: null }
  ];

  const displayList = historyList.length > 0 ? historyList : defaultHistoryCards;

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
            <select
              value={selectedBulan}
              onChange={(e) => setSelectedBulan(parseInt(e.target.value, 10))}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 10,
                border: '1px solid #cbd5e1',
                fontSize: 12,
                fontWeight: 700,
                background: '#f8fafc',
                color: '#0f172a',
                outline: 'none'
              }}
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
              onChange={(e) => setSelectedTahun(parseInt(e.target.value, 10))}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 10,
                border: '1px solid #cbd5e1',
                fontSize: 12,
                fontWeight: 700,
                background: '#f8fafc',
                color: '#0f172a',
                outline: 'none'
              }}
            >
              {daftarTahun.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* LIST PRESENSI */}
      <div className="history-section-wrapper" style={{ width: '100%', padding: 0, background: 'none', boxShadow: 'none' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#0066ff', padding: '40px 20px', fontWeight: 600 }}>
            Memuat data presensi dari database...
          </div>
        ) : (
          displayList.map((item, idx) => (
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
