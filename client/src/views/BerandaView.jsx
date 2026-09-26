import React, { useState, useEffect } from 'react';
import {
  CheckSquare, Building2, FileText, Clock, Fingerprint,
  Users, GraduationCap, History, UserCheck, BookOpen,
  FileBarChart, PieChart, Award
} from 'lucide-react';
import api from '../api/client';
import TopBar from '../components/TopBar';

export default function BerandaView({ user, onLogout, onOpenPresensiModal, onSwitchTab }) {
  const [todayStatus, setTodayStatus] = useState(null);
  const [historyItems, setHistoryItems] = useState([]);

  useEffect(() => {
    fetchTodayStatus();
    fetchHistory();
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
    if (!dateStr) return 'Friday, 25 September 2026';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const dayName = days[d.getDay()];
      const dateNum = d.getDate();
      const monthName = months[d.getMonth()];
      const year = d.getFullYear();
      return `${dayName}, ${dateNum} ${monthName} ${year}`;
    } catch (e) {
      return dateStr;
    }
  };

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
          <button className="menu-blue-card" onClick={() => onSwitchTab('absensiSiswa')}>
            <div className="menu-icon-circle">
              <Users size={22} />
            </div>
            <span>Siswa</span>
          </button>

          <button className="menu-blue-card" onClick={() => onSwitchTab('jadwal')}>
            <div className="menu-icon-circle">
              <GraduationCap size={22} />
            </div>
            <span>Pengajar</span>
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

          <button className="menu-blue-card" onClick={() => onSwitchTab('riwayat')}>
            <div className="menu-icon-circle">
              <FileBarChart size={22} />
            </div>
            <span>Rekap Siswa</span>
          </button>

          <button className="menu-blue-card" onClick={() => onSwitchTab('jadwal')}>
            <div className="menu-icon-circle">
              <PieChart size={22} />
            </div>
            <span>Rekap Mapel</span>
          </button>

          <button className="menu-blue-card" onClick={() => onSwitchTab('riwayat')}>
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
                <Fingerprint size={24} color="#0066ff" />
              </div>
              <div className="history-item-content">
                <div className="history-item-date">{formatFullDate(item.tanggal || item.date)}</div>
                <div className="history-item-time">
                  {item.jam_in || '06:23:35'} - {item.jam_out || '15:08:46'}
                </div>
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
                <div className="history-item-time">{item.time}</div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}
