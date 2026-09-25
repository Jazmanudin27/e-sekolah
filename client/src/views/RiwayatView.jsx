import React, { useState, useEffect } from 'react';
import { CalendarDays, FolderOpen } from 'lucide-react';
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

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 20 }}>Riwayat Presensi Saya</h2>
        <p style={{ color: '#94a3b8', fontSize: 12 }}>Catatan kehadiran bulan ini</p>
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#94a3b8', padding: 20 }}>Memuat riwayat...</p>
      ) : (
        historyList.length > 0 ? (
          historyList.map(item => (
            <div key={item.id} className="glass-card" style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 16px', marginBottom: 10
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CalendarDays size={14} style={{ color: '#38bdf8' }} /> {item.tanggal}
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                  Masuk: {item.jam_in || '--:--'} | Pulang: {item.jam_out || '--:--'}
                </div>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 12,
                background: item.jam_out ? 'rgba(16, 185, 129, 0.15)' : 'rgba(56, 189, 248, 0.15)',
                color: item.jam_out ? '#10b981' : '#38bdf8'
              }}>
                {item.jam_out ? 'LENGKAP' : 'MASUK'}
              </span>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
            <FolderOpen size={48} style={{ opacity: 0.4, marginBottom: 12 }} />
            <p>Belum ada riwayat presensi.</p>
          </div>
        )
      )}
    </div>
  );
}
