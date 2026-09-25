import React, { useState, useEffect } from 'react';
import { Clock, Users, User, CalendarX } from 'lucide-react';
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
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 20 }}>Jadwal Pelajaran</h2>
        <p style={{ color: '#94a3b8', fontSize: 12 }}>Jadwal mengajar minggu ini</p>
      </div>

      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 10, marginBottom: 16 }}>
        {days.map(d => (
          <button
            key={d}
            onClick={() => setActiveHari(d)}
            style={{
              padding: '8px 16px', borderRadius: 20,
              background: activeHari === d ? '#38bdf8' : 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: activeHari === d ? '#000' : '#94a3b8',
              fontWeight: activeHari === d ? 600 : 400,
              fontSize: 12, whiteSpace: 'nowrap', cursor: 'pointer'
            }}
          >
            {d}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#94a3b8', padding: 20 }}>Memuat jadwal...</p>
      ) : (
        jadwalList.length > 0 ? (
          jadwalList.map(j => (
            <div key={j.kode_jadwal} className="glass-card" style={{ padding: 14, marginBottom: 10, borderLeft: '4px solid #38bdf8' }}>
              <div style={{ fontSize: 12, color: '#38bdf8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                <Clock size={14} /> Jam ke-{j.jam_ke || '-'} ({j.jam || 'Waktu N/A'})
              </div>
              <div style={{ fontSize: 15, fontWeight: 600, margin: '4px 0' }}>{j.nama_mapel || 'Mata Pelajaran'}</div>
              <div style={{ fontSize: 12, color: '#94a3b8', display: 'flex', gap: 12 }}>
                <span><Users size={12} /> Kelas: {j.nama_kelas || '-'}</span>
                <span><User size={12} /> Guru: {j.nama_guru || '-'}</span>
              </div>
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#94a3b8' }}>
            <CalendarX size={48} style={{ opacity: 0.4, marginBottom: 12 }} />
            <p>Tidak ada jadwal mengajar pada hari {activeHari}.</p>
          </div>
        )
      )}
    </div>
  );
}
