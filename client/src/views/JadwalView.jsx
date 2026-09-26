import React, { useState, useEffect } from 'react';
import { Clock, Users, User, CalendarX, BookOpen, Filter, CalendarDays } from 'lucide-react';
import api from '../api/client';

export default function JadwalView() {
  const [activeHari, setActiveHari] = useState('ALL');
  const [selectedKelas, setSelectedKelas] = useState('ALL');
  const [kelasList, setKelasList] = useState([]);
  const [jadwalList, setJadwalList] = useState([]);
  const [loading, setLoading] = useState(false);

  const days = [
    { value: 'ALL', label: 'Semua Hari' },
    { value: 'Senin', label: 'Senin' },
    { value: 'Selasa', label: 'Selasa' },
    { value: 'Rabu', label: 'Rabu' },
    { value: 'Kamis', label: 'Kamis' },
    { value: 'Jumat', label: 'Jumat' },
    { value: 'Sabtu', label: 'Sabtu' }
  ];

  useEffect(() => {
    fetchKelas();
  }, []);

  useEffect(() => {
    fetchJadwal();
  }, [activeHari, selectedKelas]);

  const fetchKelas = async () => {
    try {
      const res = await api.get('/kelas');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setKelasList(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchJadwal = async () => {
    setLoading(true);
    try {
      let url = '/jadwal?';
      if (activeHari !== 'ALL') url += `hari=${activeHari}&`;
      if (selectedKelas !== 'ALL') url += `kode_kelas=${selectedKelas}&`;

      const res = await api.get(url);
      if (res.data?.success && Array.isArray(res.data.data)) {
        setJadwalList(res.data.data);
      } else {
        setJadwalList([]);
      }
    } catch (err) {
      console.error(err);
      setJadwalList([]);
    } finally {
      setLoading(false);
    }
  };

  const demoJadwal = [
    { kode_jadwal: 1, hari: 'Senin', jam_ke: 1, jam: '07:30 - 09:00', nama_mapel: 'Pemrograman Web & Perangkat Bergerak', kode_kelas: '1', nama_kelas: 'X RPL 1', nama_guru: 'Citra Dewi, S.Pd.' },
    { kode_jadwal: 2, hari: 'Senin', jam_ke: 2, jam: '09:15 - 10:45', nama_mapel: 'Basis Data Lanjutan', kode_kelas: '2', nama_kelas: 'XI RPL 2', nama_guru: 'Budi Santoso, M.Kom.' },
    { kode_jadwal: 3, hari: 'Selasa', jam_ke: 1, jam: '07:30 - 09:00', nama_mapel: 'Administrasi Infrastruktur Jaringan', kode_kelas: '3', nama_kelas: 'XI TKJ 1', nama_guru: 'Ahmad Fauzi, S.ST.' },
    { kode_jadwal: 4, hari: 'Rabu', jam_ke: 1, jam: '07:30 - 09:00', nama_mapel: 'Desain Grafis & Multimedia', kode_kelas: '4', nama_kelas: 'XII MM 1', nama_guru: 'Eko Prasetyo, S.Kom.' }
  ];

  const filteredDemo = demoJadwal.filter(j => {
    const matchHari = activeHari === 'ALL' || j.hari === activeHari;
    const matchKelas = selectedKelas === 'ALL' || String(j.kode_kelas) === String(selectedKelas) || j.nama_kelas === selectedKelas;
    return matchHari && matchKelas;
  });

  const displayJadwal = jadwalList.length > 0 ? jadwalList : filteredDemo;

  return (
    <div className="inner-page-wrapper" style={{ paddingBottom: 36, paddingTop: 4 }}>
      {/* FILTER CONTROL CARD */}
      <div style={{ background: '#ffffff', padding: 14, borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, fontSize: 11, fontWeight: 700, color: '#475569', letterSpacing: '0.3px' }}>
          <Filter size={14} color="#0066ff" />
          FILTER JADWAL PELAJARAN
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {/* FILTER HARI */}
          <div>
            <label style={{ fontSize: 10, fontWeight: 700, color: '#64748b', marginBottom: 4, display: 'block' }}>HARI</label>
            <select
              value={activeHari}
              onChange={(e) => setActiveHari(e.target.value)}
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
              {days.map(d => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>
          </div>

          {/* FILTER KELAS */}
          <div>
            <label style={{ fontSize: 10, fontWeight: 700, color: '#64748b', marginBottom: 4, display: 'block' }}>KELAS</label>
            <select
              value={selectedKelas}
              onChange={(e) => setSelectedKelas(e.target.value)}
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
              <option value="ALL">Semua Kelas</option>
              {kelasList.map(k => (
                <option key={k.kode_kelas || k.id} value={k.kode_kelas || k.id}>
                  {k.nama_kelas}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* QUICK DAY TAP PILLS */}
      <div style={{
        display: 'flex',
        gap: 8,
        overflowX: 'auto',
        paddingBottom: 6,
        marginBottom: 16
      }}>
        {days.map(d => {
          const isActive = activeHari === d.value;
          return (
            <button
              key={d.value}
              onClick={() => setActiveHari(d.value)}
              style={{
                padding: '7px 16px',
                borderRadius: 20,
                background: isActive ? '#0066ff' : '#ffffff',
                border: isActive ? '1px solid #0066ff' : '1px solid #e2e8f0',
                color: isActive ? '#ffffff' : '#64748b',
                fontWeight: isActive ? 700 : 600,
                fontSize: 12,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                boxShadow: isActive ? '0 4px 12px rgba(0, 102, 255, 0.25)' : '0 2px 6px rgba(0,0,0,0.02)',
                transition: 'all 0.15s ease'
              }}
            >
              {d.label}
            </button>
          );
        })}
      </div>

      {/* SCHEDULE CARDS LIST */}
      {loading ? (
        <div style={{ textAlign: 'center', color: '#0066ff', padding: '40px 20px', fontWeight: 600 }}>
          Memuat jadwal pelajaran...
        </div>
      ) : displayJadwal.length > 0 ? (
        displayJadwal.map(j => (
          <div key={j.kode_jadwal} className="white-card" style={{ borderLeft: '5px solid #0066ff', padding: '16px', marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <div style={{ fontSize: 12, color: '#0066ff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Clock size={15} /> Jam ke-{j.jam_ke || '-'} ({j.jam || '07:30 - 09:00'})
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, background: '#e0f2fe', color: '#0066ff', padding: '2px 8px', borderRadius: 8 }}>
                {j.hari || 'Aktif'}
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
          <p style={{ fontWeight: 600, color: '#64748b' }}>
            Tidak ada jadwal pelajaran untuk kriteria filter yang dipilih.
          </p>
        </div>
      )}
    </div>
  );
}
