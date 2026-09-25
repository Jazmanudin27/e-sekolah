import React, { useState, useEffect } from 'react';
import { CalendarCheck, Camera, MapPin, Users, BookOpen, Calendar, Clock } from 'lucide-react';
import api from '../api/client';

export default function BerandaView({ onOpenPresensiModal, onSwitchTab }) {
  const [clock, setClock] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [todayStatus, setTodayStatus] = useState(null);
  const [stats, setStats] = useState({ guru: 0, kelas: 0, presensi: 0 });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setClock(now.toTimeString().split(' ')[0]);
      setDateStr(now.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchTodayStatus();
    fetchDashboardStats();
  }, []);

  const fetchTodayStatus = async () => {
    try {
      const res = await api.get('/presensi/today');
      if (res.data.success) {
        setTodayStatus(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const res = await api.get('/dashboard/summary');
      if (res.data.success) {
        setStats({
          guru: res.data.data.total_guru,
          kelas: res.data.data.total_kelas,
          presensi: res.data.data.total_presensi_hari_ini
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const isCheckInDisabled = todayStatus?.status === 'CHECKIN' || todayStatus?.status === 'CHECKOUT';
  const isCheckOutDisabled = todayStatus?.status === 'BELUM_CHECKIN' || todayStatus?.status === 'CHECKOUT';

  return (
    <div>
      {/* LIVE CLOCK CARD */}
      <div className="glass-card" style={{ textAlign: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: '#38bdf8', fontWeight: 500 }}>{dateStr}</div>
        <div style={{ fontSize: 38, fontWeight: 700, margin: '6px 0', letterSpacing: 2 }}>{clock}</div>
        <div style={{ fontSize: 11, color: '#94a3b8', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <MapPin size={12} style={{ color: '#10b981' }} />
          <span>GPS: -7.3252, 108.2083 (SMK Artanita)</span>
        </div>
      </div>

      {/* PRESENSI HARI INI CARD */}
      <div className="glass-card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
            <CalendarCheck size={18} style={{ color: '#38bdf8' }} /> Status Presensi Hari Ini
          </h3>
          <span style={{
            fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 12,
            background: todayStatus?.status === 'BELUM_CHECKIN' ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            color: todayStatus?.status === 'BELUM_CHECKIN' ? '#f43f5e' : '#10b981'
          }}>
            {todayStatus?.status === 'CHECKOUT' ? 'SUDAH PULANG' : (todayStatus?.status === 'CHECKIN' ? 'SUDAH MASUK' : 'BELUM ABSEN')}
          </span>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-around',
          marginBottom: 16, background: 'rgba(15, 23, 42, 0.5)', padding: 12, borderRadius: 12
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>Jam Masuk</span>
            <span style={{ fontSize: 18, fontWeight: 700 }}>{todayStatus?.jam_in || '--:--'}</span>
          </div>
          <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.08)' }}></div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>Jam Pulang</span>
            <span style={{ fontSize: 18, fontWeight: 700 }}>{todayStatus?.jam_out || '--:--'}</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button
            className="btn btn-emerald"
            onClick={() => onOpenPresensiModal('in')}
            disabled={isCheckInDisabled}
          >
            <Camera size={16} /> Absen Masuk
          </button>
          <button
            className="btn btn-rose"
            onClick={() => onOpenPresensiModal('out')}
            disabled={isCheckOutDisabled}
          >
            <Camera size={16} /> Absen Pulang
          </button>
        </div>
      </div>

      {/* MENU UTAMA GRID */}
      <div style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', margin: '16px 0 10px 0', textTransform: 'uppercase' }}>
        Menu Utama
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer' }} onClick={() => onSwitchTab('absensiSiswa')}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg, #0284c7, #38bdf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <Users size={22} />
          </div>
          <span style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>Absen Siswa</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer' }} onClick={() => onSwitchTab('absensiMapel')}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg, #4f46e5, #818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <BookOpen size={22} />
          </div>
          <span style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>Absen Mapel</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer' }} onClick={() => onSwitchTab('jadwal')}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg, #d97706, #fbbf24)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <Calendar size={22} />
          </div>
          <span style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>Jadwal</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer' }} onClick={() => onSwitchTab('riwayat')}>
          <div style={{ width: 52, height: 52, borderRadius: 16, background: 'linear-gradient(135deg, #059669, #34d399)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
            <Clock size={22} />
          </div>
          <span style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center' }}>Riwayat</span>
        </div>
      </div>

      {/* DASHBOARD STATS */}
      <div style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', margin: '20px 0 10px 0', textTransform: 'uppercase' }}>
        Informasi Sekolah
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        <div className="glass-card" style={{ textAlign: 'center', padding: '12px 8px' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#38bdf8' }}>{stats.guru}</div>
          <div style={{ fontSize: 10, color: '#94a3b8' }}>Guru Aktif</div>
        </div>
        <div className="glass-card" style={{ textAlign: 'center', padding: '12px 8px' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#38bdf8' }}>{stats.kelas}</div>
          <div style={{ fontSize: 10, color: '#94a3b8' }}>Total Kelas</div>
        </div>
        <div className="glass-card" style={{ textAlign: 'center', padding: '12px 8px' }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#38bdf8' }}>{stats.presensi}</div>
          <div style={{ fontSize: 10, color: '#94a3b8' }}>Presensi Hari Ini</div>
        </div>
      </div>
    </div>
  );
}
