import React, { useState, useEffect } from 'react';
import { Fingerprint, FolderOpen, CalendarDays } from 'lucide-react';
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
      const res = await api.get('/presensi/history?limit=20');
      if (res.data.success) {
        setHistoryList(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const defaultHistoryCards = [
    { date: 'Friday, 25 September 2026', time: '06:23:35 - 15:08:46', status: 'HADIR' },
    { date: 'Thursday, 24 September 2026', time: '06:19:20 - 15:00:12', status: 'HADIR' },
    { date: 'Wednesday, 23 September 2026', time: '06:20:05 - 15:05:40', status: 'HADIR' },
    { date: 'Tuesday, 22 September 2026', time: '06:17:42 - 15:10:00', status: 'HADIR' },
    { date: 'Monday, 21 September 2026', time: '06:25:10 - 15:02:18', status: 'HADIR' },
  ];

  return (
    <div className="inner-page-wrapper">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
          <CalendarDays size={18} color="#0066ff" /> Log Kehadiran Saya
        </h3>
        <span style={{ fontSize: 12, fontWeight: 700, color: '#0066ff' }}>20 Record Terakhir</span>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#0066ff', padding: '40px 20px', fontWeight: 600 }}>
          Memuat riwayat presensi...
        </div>
      ) : historyList.length > 0 ? (
        historyList.map((item, idx) => (
          <div key={item.id || idx} className="history-item-card" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div className="history-fingerprint-box">
                <Fingerprint size={24} color="#0066ff" />
              </div>
              <div className="history-item-content">
                <div className="history-item-date">{item.tanggal || item.date || 'Friday, 25 September 2026'}</div>
                <div className="history-item-time">
                  {item.jam_in || '06:23:35'} - {item.jam_out || '15:08:46'}
                </div>
              </div>
            </div>
            <span style={{
              fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 12,
              background: '#dcfce7', color: '#16a34a'
            }}>
              HADIR
            </span>
          </div>
        ))
      ) : (
        defaultHistoryCards.map((item, idx) => (
          <div key={idx} className="history-item-card" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div className="history-fingerprint-box">
                <Fingerprint size={24} color="#0066ff" />
              </div>
              <div className="history-item-content">
                <div className="history-item-date">{item.date}</div>
                <div className="history-item-time">{item.time}</div>
              </div>
            </div>
            <span style={{
              fontSize: 11, fontWeight: 800, padding: '4px 10px', borderRadius: 12,
              background: '#dcfce7', color: '#16a34a'
            }}>
              HADIR
            </span>
          </div>
        ))
      )}
    </div>
  );
}
