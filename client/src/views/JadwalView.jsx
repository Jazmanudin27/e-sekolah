import React, { useState, useEffect } from 'react';
import { Clock, Users, User, CalendarX, BookOpen } from 'lucide-react';
import api from '../api/client';

export default function JadwalView() {
  const [activeHari, setActiveHari] = useState('Senin');
  const [jadwalList, setJadwalList] = useState([]);
  const [loading, setLoading] = useState(false);

  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

  useEffect(() => {
    fetchJadwal();
  }, [activeHari]);

  const fetchJadwal = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/jadwal?hari=${activeHari}`);
      if (res.data.success) {
        setJadwalList(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inner-page-wrapper">
      {/* DAY PILLS FILTER */}
      <div style={{
        display: 'flex',
        gap: 8,
        overflowX: 'auto',
        paddingBottom: 6,
        marginBottom: 16
      }}>
        {days.map(d => {
          const isActive = activeHari === d;
          return (
            <button
              key={d}
              onClick={() => setActiveHari(d)}
              style={{
                padding: '8px 18px',
                borderRadius: 20,
                background: isActive ? '#0066ff' : '#ffffff',
                border: isActive ? '1px solid #0066ff' : '1px solid #e2e8f0',
                color: isActive ? '#ffffff' : '#64748b',
                fontWeight: isActive ? 700 : 600,
                fontSize: 13,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                boxShadow: isActive ? '0 4px 12px rgba(0, 102, 255, 0.25)' : '0 2px 6px rgba(0,0,0,0.02)',
                transition: 'all 0.15s ease'
              }}
            >
              {d}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: '#0066ff', padding: '40px 20px', fontWeight: 600 }}>
          Memuat jadwal mengajar...
        </div>
      ) : (
        jadwalList.length > 0 ? (
          jadwalList.map(j => (
            <div key={j.kode_jadwal} className="white-card" style={{ borderLeft: '5px solid #0066ff', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ fontSize: 12, color: '#0066ff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Clock size={15} /> Jam ke-{j.jam_ke || '-'} ({j.jam || '07:30 - 09:00'})
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, background: '#e0f2fe', color: '#0066ff', padding: '2px 8px', borderRadius: 8 }}>
                  Aktif
                </span>
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <BookOpen size={18} color="#0066ff" /> {j.nama_mapel || 'Mata Pelajaran'}
              </div>
              <div style={{ fontSize: 13, color: '#64748b', display: 'flex', gap: 16, borderTop: '1px solid #f1f5f9', paddingTop: 8 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                  <Users size={14} color="#64748b" /> Kelas: <strong style={{ color: '#0f172a' }}>{j.nama_kelas || '-'}</strong>
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }}>
                  <User size={14} color="#64748b" /> Guru: <strong style={{ color: '#0f172a' }}>{j.nama_guru || '-'}</strong>
                </span>
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: '#94a3b8' }}>
            <CalendarX size={54} style={{ opacity: 0.3, marginBottom: 12 }} />
            <p style={{ fontWeight: 600, color: '#64748b' }}>Tidak ada jadwal mengajar pada hari {activeHari}.</p>
          </div>
        )
      )}
    </div>
  );
}
