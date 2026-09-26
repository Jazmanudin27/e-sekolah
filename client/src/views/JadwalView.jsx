import React, { useState, useEffect } from 'react';
import { Clock, Users, User, CalendarX, BookOpen, Filter } from 'lucide-react';
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
      <div style={{ background: '#ffffff', padding: 16, borderRadius: 18, border: '1px solid #e2e8f0', boxShadow: '0 4px 16px rgba(0,0,0,0.03)', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, color: '#0f172a', letterSpacing: '0.2px' }}>
            <Filter size={15} color="#0066ff" />
            FILTER JADWAL PELAJARAN
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#0066ff', background: '#eff6ff', padding: '3px 10px', borderRadius: 12 }}>
            {displayJadwal.length} Jadwal Tampil
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {/* FILTER HARI */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, display: 'block' }}>HARI</label>
            <select
              value={activeHari}
              onChange={(e) => setActiveHari(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 12,
                border: '1px solid #cbd5e1',
                fontSize: 13,
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
            <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, display: 'block' }}>KELAS</label>
            <select
              value={selectedKelas}
              onChange={(e) => setSelectedKelas(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 12,
                border: '1px solid #cbd5e1',
                fontSize: 13,
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

      {/* SCHEDULE CARDS LIST */}
      {loading ? (
        <div style={{ textAlign: 'center', color: '#0066ff', padding: '40px 20px', fontWeight: 600 }}>
          Memuat jadwal pelajaran...
        </div>
      ) : displayJadwal.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {displayJadwal.map((j, idx) => (
            <div
              key={j.kode_jadwal || idx}
              style={{
                background: '#ffffff',
                borderRadius: 18,
                padding: 16,
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* TOP COLOR STRIP */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #0052cc, #0072ff)' }} />

              {/* CARD HEADER: TIME & DAY BADGE */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 800, color: '#0066ff', background: '#eff6ff', padding: '4px 10px', borderRadius: 10 }}>
                  <Clock size={14} /> Jam ke-{j.jam_ke || 1} • {j.jam || '07:30 - 09:00'}
                </div>

                <span style={{ fontSize: 11, fontWeight: 800, background: '#f1f5f9', color: '#475569', padding: '4px 10px', borderRadius: 10 }}>
                  {j.hari || 'Senin'}
                </span>
              </div>

              {/* MAPEL TITLE */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: 12, background: 'linear-gradient(135deg, #e0f2fe, #bae6fd)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7', flexShrink: 0 }}>
                  <BookOpen size={20} />
                </div>
                <div>
                  <h4 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', lineHeight: 1.3, margin: 0 }}>
                    {j.nama_mapel || 'Mata Pelajaran'}
                  </h4>
                </div>
              </div>

              {/* FOOTER METADATA: KELAS & GURU */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, borderTop: '1px dashed #e2e8f0', paddingTop: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                    <Users size={14} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>KELAS</div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#0f172a' }}>{j.nama_kelas || '-'}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                    <User size={14} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>GURU PENGAJAR</div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#0f172a' }}>{j.nama_guru || '-'}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
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
