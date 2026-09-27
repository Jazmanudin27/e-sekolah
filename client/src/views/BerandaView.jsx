import React, { useState, useEffect } from 'react';
import {
  CheckSquare, Building2, FileText, Clock, Fingerprint,
  Users, GraduationCap, History, UserCheck, BookOpen,
  FileBarChart, PieChart, Award, Calendar
} from 'lucide-react';
import api from '../api/client';
import TopBar from '../components/TopBar';

export default function BerandaView({ user, onLogout, onOpenPresensiModal, onSwitchTab }) {
  const [todayStatus, setTodayStatus] = useState(null);
  const [historyItems, setHistoryItems] = useState([]);
  const isClassAccount = user?.type === 'Kelas' || Boolean(user?.kode_kelas && user?.role === 'Kelas');

  useEffect(() => {
    if (!isClassAccount) {
      fetchTodayStatus();
      fetchHistory();
    }
  }, [isClassAccount]);

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

  const fetchHistory = async () => {
    try {
      const res = await api.get('/presensi/history?limit=5');
      if (res.data.success) {
        setHistoryItems(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const isCheckInDisabled = todayStatus?.status === 'CHECKIN' || todayStatus?.status === 'CHECKOUT';
  const isCheckOutDisabled = todayStatus?.status === 'BELUM_CHECKIN' || todayStatus?.status === 'CHECKOUT';

  const defaultHistoryCards = [
    { date: 'Friday, 25 September 2026', time: '06:23:35 - 15:08:46' },
    { date: 'Thursday, 24 September 2026', time: '06:19:20 - 15:00:12' },
    { date: 'Wednesday, 23 September 2026', time: '06:20:05 - 15:05:40' },
    { date: 'Tuesday, 22 September 2026', time: '06:17:42 - 15:10:00' },
    { date: 'Monday, 21 September 2026', time: '06:25:10 - 15:02:18' },
  ];

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

  if (isClassAccount) {
    const className = user?.nama_kelas || (user?.kode_kelas ? `Kelas ${user.kode_kelas}` : 'Kelas');

    return (
      <div className="beranda-view-container">
        {/* HERO BLUE HEADER */}
        <TopBar user={user} onLogout={onLogout} />

        <div className="inner-page-wrapper" style={{ paddingTop: 14 }}>
          {/* CLASS PORTAL BANNER */}
          <div
            style={{
              background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
              borderRadius: 20,
              padding: '18px 20px',
              color: '#ffffff',
              boxShadow: '0 8px 24px rgba(2, 132, 199, 0.25)',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', opacity: 0.9 }}>
                PORTAL KHUSUS AKUN KELAS
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800, margin: '4px 0 2px 0' }}>{className}</h2>
              <p style={{ fontSize: 12, margin: 0, opacity: 0.95 }}>
                Sistem Pengelolaan Absensi Siswa & Mapel Terkunci
              </p>
            </div>
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: 14,
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(10px)'
              }}
            >
              <GraduationCap size={26} color="#ffffff" />
            </div>
          </div>

          {/* MAIN CLASS ACTIONS GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            {/* 1. ABSENSI SISWA */}
            <button
              onClick={() => onSwitchTab('absensiSiswa')}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 18,
                padding: 16,
                textAlign: 'left',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease'
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 12,
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                }}
              >
                <UserCheck size={22} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>Absensi Siswa</div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Input harian {className}</div>
              </div>
            </button>

            {/* 2. ABSENSI MAPEL */}
            <button
              onClick={() => onSwitchTab('absensiMapel')}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 18,
                padding: 16,
                textAlign: 'left',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease'
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, #0072ff, #0052cc)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 12,
                  boxShadow: '0 4px 12px rgba(0, 114, 255, 0.3)'
                }}
              >
                <BookOpen size={22} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>Absensi Mapel</div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Absen jam pelajaran</div>
              </div>
            </button>

            {/* 3. REKAP SISWA */}
            <button
              onClick={() => onSwitchTab('rekapSiswa')}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 18,
                padding: 16,
                textAlign: 'left',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease'
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 12,
                  boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)'
                }}
              >
                <FileBarChart size={22} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>Rekap Siswa</div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Laporan harian & bulanan</div>
              </div>
            </button>

            {/* 4. REKAP MAPEL */}
            <button
              onClick={() => onSwitchTab('rekapMapel')}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 18,
                padding: 16,
                textAlign: 'left',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease'
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 12,
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
                }}
              >
                <PieChart size={22} />
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>Rekap Mapel</div>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>Laporan mata pelajaran</div>
              </div>
            </button>
          </div>

          {/* SECONDARY CLASS LINKS */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
            <button
              onClick={() => onSwitchTab('siswa')}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 14,
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: 'pointer'
              }}
            >
              <Users size={18} color="#0066ff" />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>Data Siswa {className}</span>
            </button>

            <button
              onClick={() => onSwitchTab('profil')}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: 14,
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                cursor: 'pointer'
              }}
            >
              <UserCheck size={18} color="#475569" />
              <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>Profil Akun Kelas</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="beranda-view-container">

      {/* HERO BLUE HEADER */}
      <TopBar user={user} onLogout={onLogout} />

      {/* 1. FLOATING OVERLAPPING SUMMARY CARD (4 VERTICAL ICON COLUMNS) */}
      <div className="summary-overlap-card">
        <div className="summary-grid-4">

          <div className="summary-col-item">
            <div className="summary-icon-box box-green">
              <CheckSquare size={26} color="#ffffff" strokeWidth={2.4} />
              <span className="box-notify-badge">19</span>
            </div>
            <span className="summary-col-label">Hadir</span>
          </div>

          <div className="summary-col-item">
            <div className="summary-icon-box box-red">
              <Building2 size={26} color="#ffffff" strokeWidth={2.2} />
            </div>
            <span className="summary-col-label">Sakit</span>
          </div>

          <div className="summary-col-item">
            <div className="summary-icon-box box-amber">
              <FileText size={26} color="#ffffff" strokeWidth={2.2} />
            </div>
            <span className="summary-col-label">Izin</span>
          </div>

          <div className="summary-col-item">
            <div className="summary-icon-box box-teal">
              <Clock size={26} color="#ffffff" strokeWidth={2.2} />
            </div>
            <span className="summary-col-label">Cuti</span>
          </div>

        </div>
      </div>

      {/* 2. DUAL SCAN ACTION CARDS (SCAN MASUK & SCAN PULANG) */}
      <div className="dual-scan-row">
        <button
          className="scan-box-btn scan-masuk-btn"
          onClick={() => onOpenPresensiModal('in')}
        >
          <div className="scan-icon-circle-box">
            <Fingerprint size={24} />
          </div>
          <div>
            <div className="scan-main-title">Scan Masuk</div>
            <div className="scan-sub-text">
              {todayStatus?.jam_in ? `Jam: ${todayStatus.jam_in}` : 'Belum Scan'}
            </div>
          </div>
        </button>

        <button
          className="scan-box-btn scan-pulang-btn"
          onClick={() => onOpenPresensiModal('out')}
        >
          <div className="scan-icon-circle-box">
            <Fingerprint size={24} />
          </div>
          <div>
            <div className="scan-main-title">Scan Pulang</div>
            <div className="scan-sub-text">
              {todayStatus?.jam_out ? `Jam: ${todayStatus.jam_out}` : 'Belum Scan'}
            </div>
          </div>
        </button>
      </div>

      {/* 3. 8-GRID BLUE MENU CARDS */}
      <div className="grid-8-menu-wrapper">
        <div className="grid-8-menu">
          <button className="menu-blue-card" onClick={() => onSwitchTab('siswa')}>
            <div className="menu-icon-circle">
              <Users size={22} />
            </div>
            <span>Siswa</span>
          </button>

          <button className="menu-blue-card" onClick={() => onSwitchTab('jadwal')}>
            <div className="menu-icon-circle">
              <Calendar size={22} />
            </div>
            <span>Jadwal</span>
          </button>

          <button className="menu-blue-card" onClick={() => onSwitchTab('riwayat')}>
            <div className="menu-icon-circle">
              <History size={22} />
            </div>
            <span>History</span>
          </button>

          <button className="menu-blue-card" onClick={() => onSwitchTab('absensiSiswa')}>
            <div className="menu-icon-circle">
              <UserCheck size={22} />
            </div>
            <span>Absen Siswa</span>
          </button>

          <button className="menu-blue-card" onClick={() => onSwitchTab('absensiMapel')}>
            <div className="menu-icon-circle">
              <BookOpen size={22} />
            </div>
            <span>Absen Mapel</span>
          </button>

          <button className="menu-blue-card" onClick={() => onSwitchTab('rekapSiswa')}>
            <div className="menu-icon-circle">
              <FileBarChart size={22} />
            </div>
            <span>Rekap Siswa</span>
          </button>

          <button className="menu-blue-card" onClick={() => onSwitchTab('rekapMapel')}>
            <div className="menu-icon-circle">
              <PieChart size={22} />
            </div>
            <span>Rekap Mapel</span>
          </button>

          <button className="menu-blue-card" onClick={() => onSwitchTab('rekapGuru')}>
            <div className="menu-icon-circle">
              <Award size={22} />
            </div>
            <span>Rekap Guru</span>
          </button>
        </div>
      </div>

      {/* 4. HISTORI ABSENSI 5 HARI TERAKHIR */}
      <div className="history-section-wrapper">
        <div className="section-header-row">
          <h3 className="section-title-bold">Histori Absensi 5 Hari Terakhir</h3>
          <button className="view-all-link" onClick={() => onSwitchTab('riwayat')}>View All</button>
        </div>

        {historyItems.length > 0 ? (
          historyItems.slice(0, 5).map((item, idx) => (
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
        ) : (
          defaultHistoryCards.map((item, idx) => (
            <div key={idx} className="history-item-card">
              <div className="history-fingerprint-box">
                <Fingerprint size={24} color="#0066ff" />
              </div>
              <div className="history-item-content">
                <div className="history-item-date">{item.date}</div>
                {renderTimeRange(item.jam_in, item.jam_out)}
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
