import React, { useState, useEffect } from 'react';
import { CalendarCheck, Camera, MapPin, Users, BookOpen, Calendar, Clock, Sparkles, ShieldCheck } from 'lucide-react';
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
      {/* REALTIME CLOCK & DATE CARD */}
      <div className="glass-card" style={{
        textAlign: 'center', marginBottom: 18, position: 'relative', overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(14, 23, 42, 0.9), rgba(15, 23, 42, 0.7))',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(56, 189, 248, 0.15)'
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12,
          color: '#38bdf8', fontWeight: 600, background: 'rgba(56, 189, 248, 0.12)',
          padding: '4px 14px', borderRadius: 20, marginBottom: 8
        }}>
          <Sparkles size={13} /> {dateStr}
        </div>
        
        <div style={{
          fontSize: 42, fontWeight: 800, letterSpacing: 2, margin: '4px 0',
          background: 'linear-gradient(to bottom, #ffffff, #94a3b8)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.2))'
        }}>
          {clock}
        </div>

        <div style={{ fontSize: 12, color: '#94a3b8', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <MapPin size={14} style={{ color: '#10b981' }} />
          <span>GPS Verified: SMK Artanita, Kota Tasikmalaya</span>
        </div>
      </div>

      {/* PRESENSI HARI INI CARD */}
      <div className="glass-card" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
            <CalendarCheck size={20} style={{ color: '#38bdf8' }} /> Status Presensi Hari Ini
          </h3>
          <span style={{
            fontSize: 11, fontWeight: 700, padding: '5px 12px', borderRadius: 20,
            background: todayStatus?.status === 'BELUM_CHECKIN' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(16, 185, 129, 0.2)',
            color: todayStatus?.status === 'BELUM_CHECKIN' ? '#f43f5e' : '#10b981',
            border: `1px solid ${todayStatus?.status === 'BELUM_CHECKIN' ? 'rgba(244, 63, 94, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`
          }}>
            {todayStatus?.status === 'CHECKOUT' ? 'SUDAH PULANG' : (todayStatus?.status === 'CHECKIN' ? 'SUDAH MASUK' : 'BELUM ABSEN')}
          </span>
        </div>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-around',
          marginBottom: 18, background: 'rgba(10, 15, 28, 0.8)', padding: 14,
          borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>Jam Masuk</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: todayStatus?.jam_in ? '#10b981' : '#f8fafc' }}>
              {todayStatus?.jam_in || '--:--'}
            </span>
          </div>
          <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.1)' }}></div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4 }}>Jam Pulang</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: todayStatus?.jam_out ? '#38bdf8' : '#f8fafc' }}>
              {todayStatus?.jam_out || '--:--'}
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <button
            className="btn btn-emerald"
            onClick={() => onOpenPresensiModal('in')}
            disabled={isCheckInDisabled}
          >
            <Camera size={18} /> Absen Masuk
          </button>
          <button
            className="btn btn-rose"
            onClick={() => onOpenPresensiModal('out')}
            disabled={isCheckOutDisabled}
          >
            <Camera size={18} /> Absen Pulang
          </button>
        </div>
      </div>

      {/* QUICK MENU GRID */}
      <div style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', margin: '20px 0 12px 0', textTransform: 'uppercase', letterSpacing: 1 }}>
        Menu Utama
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => onSwitchTab('absensiSiswa')}>
          <div style={{
            width: 56, height: 56, borderRadius: 20,
            background: 'linear-gradient(135deg, #0284c7, #38bdf8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
            boxShadow: '0 8px 20px rgba(56, 189, 248, 0.35)'
          }}>
            <Users size={24} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 500, color: '#f8fafc', textAlign: 'center' }}>Absen Siswa</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => onSwitchTab('absensiMapel')}>
          <div style={{
            width: 56, height: 56, borderRadius: 20,
            background: 'linear-gradient(135deg, #4f46e5, #818cf8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
            boxShadow: '0 8px 20px rgba(129, 140, 248, 0.35)'
          }}>
            <BookOpen size={24} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 500, color: '#f8fafc', textAlign: 'center' }}>Absen Mapel</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => onSwitchTab('jadwal')}>
          <div style={{
            width: 56, height: 56, borderRadius: 20,
            background: 'linear-gradient(135deg, #d97706, #fbbf24)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
            boxShadow: '0 8px 20px rgba(251, 191, 36, 0.35)'
          }}>
            <Calendar size={24} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 500, color: '#f8fafc', textAlign: 'center' }}>Jadwal</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => onSwitchTab('riwayat')}>
          <div style={{
            width: 56, height: 56, borderRadius: 20,
            background: 'linear-gradient(135deg, #059669, #34d399)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
            boxShadow: '0 8px 20px rgba(52, 211, 153, 0.35)'
          }}>
            <Clock size={24} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 500, color: '#f8fafc', textAlign: 'center' }}>Riwayat</span>
        </div>
      </div>

      {/* DASHBOARD STATS */}
      <div style={{ fontSize: 13, fontWeight: 700, color: '#94a3b8', margin: '24px 0 12px 0', textTransform: 'uppercase', letterSpacing: 1 }}>
        Informasi Sekolah
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        <div className="glass-card" style={{ textAlign: 'center', padding: '16px 10px' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#38bdf8' }}>{stats.guru}</div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Guru Aktif</div>
        </div>
        <div className="glass-card" style={{ textAlign: 'center', padding: '16px 10px' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#818cf8' }}>{stats.kelas}</div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Total Kelas</div>
        </div>
        <div className="glass-card" style={{ textAlign: 'center', padding: '16px 10px' }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#10b981' }}>{stats.presensi}</div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>Presensi Hari Ini</div>
        </div>
      </div>
    </div>
  );
}
