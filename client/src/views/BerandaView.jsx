import React, { useState, useEffect } from 'react';
import {
  CheckCircle2, Heart, FileText, Calendar, Fingerprint,
  Users, UserCheck, Clock, ListFilter, BookOpen,
  TrendingUp, Bell
} from 'lucide-react';
import api from '../api/client';

export default function BerandaView({ onOpenPresensiModal, onSwitchTab }) {
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

  // Default fallback 5-day history list matching the reference mockup picture
  const defaultHistoryList = [
    { date: 'Sen, 17 Okt 2023', status: 'Hadir', time: '07:45', class: 'status-text-hadir' },
    { date: 'Jum, 14 Okt 2023', status: 'Hadir', time: '07:50', class: 'status-text-hadir' },
    { date: 'Kam, 13 Okt 2023', status: 'Izin', time: '--', class: 'status-text-izin' },
    { date: 'Rab, 12 Okt 2023', status: 'Sakit', time: '--', class: 'status-text-sakit' },
    { date: 'Sel, 11 Okt 2023', status: 'Hadir', time: '07:48', class: 'status-text-hadir' },
  ];

  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return 'Sen, 17 Okt 2023';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const days = ['Ming', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
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
    <div className="main-content-area">

      {/* 1. FLOATING OVERLAPPING SUMMARY CARD */}
      <div className="summary-overlap-card">
        <div className="summary-card-title">Ringkasan Absensi Hari Ini</div>
        <div className="summary-pills-row">
          <div className="pill-item pill-hadir">
            <CheckCircle2 size={13} />
            <span>Hadir</span>
            <span className="pill-badge badge-hadir">19</span>
          </div>

          <div className="pill-item pill-sakit">
            <Heart size={13} />
            <span>Sakit</span>
            <span className="pill-badge badge-sakit">1</span>
          </div>

          <div className="pill-item pill-izin">
            <FileText size={13} />
            <span>Izin</span>
            <span className="pill-badge badge-izin">2</span>
          </div>

          <div className="pill-item pill-cuti">
            <Calendar size={13} />
            <span>Cuti</span>
            <span className="pill-badge badge-cuti">0</span>
          </div>
        </div>
      </div>

      {/* 2. DUAL SCAN ACTION CARDS (SCAN MASUK & SCAN PULANG) */}
      <div className="dual-scan-row">
        <button
          className="scan-box-btn scan-masuk-btn"
          onClick={() => onOpenPresensiModal('in')}
          disabled={isCheckInDisabled}
        >
          <div className="scan-icon-circle-box">
            <Fingerprint size={24} />
          </div>
          <div>
            <div className="scan-main-title">Scan Masuk</div>
            <div className="scan-sub-text">
              {todayStatus?.jam_in ? `Jam: ${todayStatus.jam_in}` : 'Ketuk untuk Absen Masuk'}
            </div>
          </div>
        </button>

        <button
          className="scan-box-btn scan-pulang-btn"
          onClick={() => onOpenPresensiModal('out')}
          disabled={isCheckOutDisabled}
        >
          <div className="scan-icon-circle-box">
            <Fingerprint size={24} />
          </div>
          <div>
            <div className="scan-main-title">Scan Pulang</div>
            <div className="scan-sub-text">
              {todayStatus?.jam_out ? `Jam: ${todayStatus.jam_out}` : 'Ketuk untuk Absen Pulang'}
            </div>
          </div>
        </button>
      </div>

      {/* 3. 8-GRID BLUE MENU CARDS */}
      <div className="grid-8-menu-wrapper">
        <div className="grid-8-menu">
          <button className="menu-blue-card" onClick={() => onSwitchTab('absensiSiswa')}>
            <Users size={22} />
            <span>Siswa</span>
          </button>

          <button className="menu-blue-card" onClick={() => onSwitchTab('jadwal')}>
            <UserCheck size={22} />
            <span>Pengajar</span>
          </button>

          <button className="menu-blue-card" onClick={() => onSwitchTab('riwayat')}>
            <Clock size={22} />
            <span>History</span>
          </button>

          <button className="menu-blue-card" onClick={() => onSwitchTab('absensiSiswa')}>
            <ListFilter size={22} />
            <span>Absen Siswa</span>
          </button>

          <button className="menu-blue-card" onClick={() => onSwitchTab('absensiMapel')}>
            <BookOpen size={22} />
            <span>Absen Mapel</span>
          </button>

          <button className="menu-blue-card" onClick={() => onSwitchTab('riwayat')}>
            <TrendingUp size={22} />
            <span>Rekap</span>
          </button>

          <button className="menu-blue-card" onClick={() => onSwitchTab('jadwal')}>
            <Calendar size={22} />
            <span>Agenda</span>
          </button>

          <button className="menu-blue-card" onClick={() => onSwitchTab('riwayat')}>
            <Bell size={22} />
            <span>Pengumuman</span>
          </button>
        </div>
      </div>

      {/* 4. HISTORI ABSENSI 5 HARI TERAKHIR */}
      <div className="history-section-card">
        <div className="history-card-title">Histori Absensi 5 Hari Terakhir</div>

        {historyItems.length > 0 ? (
          historyItems.slice(0, 5).map((item, idx) => (
            <div key={item.id || idx} className="history-table-row">
              <span className="history-col-left">{formatDisplayDate(item.tanggal || item.date)}</span>
              <span className={`history-col-right ${item.jam_in ? 'status-text-hadir' : 'status-text-izin'}`}>
                {item.jam_in ? `Hadir, ${item.jam_in.substring(0, 5)}` : 'Izin, --'}
              </span>
            </div>
          ))
        ) : (
          defaultHistoryList.map((item, idx) => (
            <div key={idx} className="history-table-row">
              <span className="history-col-left">{item.date}</span>
              <span className={`history-col-right ${item.class}`}>
                {item.status}, {item.time}
              </span>
            </div>
          ))
        )}
      </div>

    </div>
  );
}

