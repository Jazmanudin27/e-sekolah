import React, { useState, useEffect } from 'react';
import { Fingerprint, CalendarDays, RefreshCw } from 'lucide-react';
import api from '../api/client';

export default function RiwayatView() {
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/presensi/history?limit=30');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setHistoryList(res.data.data);
      }
    } catch (err) {
      console.error(err);
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
          <CalendarDays size={18} color="#0066ff" /> Log Kehadiran Saya
        </h3>
        <button
          onClick={fetchHistory}
          style={{ background: 'none', border: 'none', color: '#0066ff', fontWeight: 700, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      <div className="history-section-wrapper" style={{ padding: 0, background: 'none', boxShadow: 'none' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#0066ff', padding: '40px 20px', fontWeight: 600 }}>
            Memuat data presensi dari database...
          </div>
        ) : (
          displayList.map((item, idx) => (
            <div key={item.id || idx} className="history-item-card">
              <div className="history-fingerprint-box">
                <Fingerprint size={24} color="#0066ff" />
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
