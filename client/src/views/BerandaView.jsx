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
    <div className="beranda-view-container">

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
            <svg width="34" height="34" viewBox="0 0 48 48" fill="none">
              <circle cx="24" cy="18" r="9" fill="#ffdbac"/>
              <path d="M14 18c0-5.52 4.48-9 10-9s10 4.48 10 9" fill="#3b2314"/>
              <path d="M12 40c0-6.63 5.37-12 12-12s12 5.37 12 12" fill="#38bdf8"/>
              <polygon points="20,28 24,34 28,28" fill="#ffffff"/>
              <line x1="24" y1="34" x2="24" y2="42" stroke="#ef4444" strokeWidth="3.5" strokeLinecap="round"/>
            </svg>
            <span>Siswa</span>
          </button>

          <button className="menu-blue-card" onClick={() => onSwitchTab('jadwal')}>
            <svg width="34" height="34" viewBox="0 0 48 48" fill="none">
              <rect x="18" y="16" width="12" height="24" rx="3" fill="#60a5fa"/>
              <polygon points="18,40 24,46 30,40" fill="#f59e0b"/>
              <polygon points="21,43 24,46 27,43" fill="#1e293b"/>
              <rect x="15" y="6" width="18" height="6" fill="#1e293b" rx="1"/>
              <polygon points="24,2 14,8 34,8" fill="#0f172a"/>
              <circle cx="21" cy="22" r="3" stroke="#ffffff" strokeWidth="2"/>
              <circle cx="27" cy="22" r="3" stroke="#ffffff" strokeWidth="2"/>
              <line x1="24" y1="22" x2="24" y2="24" stroke="#ffffff" strokeWidth="2"/>
            </svg>
            <span>Pengajar</span>
          </button>

          <button className="menu-blue-card" onClick={() => onSwitchTab('riwayat')}>
            <svg width="34" height="34" viewBox="0 0 48 48" fill="none">
              <circle cx="16" cy="18" r="6" fill="#ffdbac"/>
              <path d="M9 36c0-3.87 3.13-7 7-7s7 3.13 7 7" fill="#818cf8"/>
              <circle cx="32" cy="18" r="6" fill="#ffdbac"/>
              <path d="M25 36c0-3.87 3.13-7 7-7s7 3.13 7 7" fill="#38bdf8"/>
              <circle cx="16" cy="11" r="3.5" fill="#22c55e"/>
              <path d="M14.5 11l1 1 2.5-2.5" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="32" cy="11" r="3.5" fill="#38bdf8"/>
              <path d="M30.5 11l1 1 2.5-2.5" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span>History</span>
          </button>

          <button className="menu-blue-card" onClick={() => onSwitchTab('absensiSiswa')}>
            <svg width="34" height="34" viewBox="0 0 48 48" fill="none">
              <path d="M14 36v-10a3 3 0 0 1 6 0v10" stroke="#fde047" strokeWidth="3.5" strokeLinecap="round"/>
              <path d="M21 36v-14a3 3 0 0 1 6 0v14" stroke="#f97316" strokeWidth="3.5" strokeLinecap="round"/>
              <path d="M28 36v-18a3 3 0 0 1 6 0v18" stroke="#38bdf8" strokeWidth="3.5" strokeLinecap="round"/>
              <circle cx="24" cy="32" r="6" fill="#ef4444"/>
              <path d="M22 30l4 4M26 30l-4 4" stroke="#ffffff" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>Absen Siswa</span>
          </button>

          <button className="menu-blue-card" onClick={() => onSwitchTab('absensiMapel')}>
            <svg width="34" height="34" viewBox="0 0 48 48" fill="none">
              <rect x="12" y="8" width="24" height="16" rx="3" fill="#38bdf8"/>
              <circle cx="24" cy="14" r="3" fill="#ffdbac"/>
              <path d="M18 24c0-3.31 2.69-5 6-5s6 1.69 6 5" fill="#1e293b"/>
              <circle cx="14" cy="36" r="3" fill="#f43f5e"/>
              <circle cx="24" cy="36" r="3" fill="#eab308"/>
              <circle cx="34" cy="36" r="3" fill="#22c55e"/>
              <path d="M8 42c0-3 2.69-5 6-5s6 2 6 5" fill="#cbd5e1"/>
              <path d="M18 42c0-3 2.69-5 6-5s6 2 6 5" fill="#cbd5e1"/>
              <path d="M28 42c0-3 2.69-5 6-5s6 2 6 5" fill="#cbd5e1"/>
            </svg>
            <span>Absen Mapel</span>
          </button>

          <button className="menu-blue-card" onClick={() => onSwitchTab('riwayat')}>
            <svg width="34" height="34" viewBox="0 0 48 48" fill="none">
              <circle cx="16" cy="18" r="6" fill="#ffdbac"/>
              <path d="M9 36c0-3.87 3.13-7 7-7s7 3.13 7 7" fill="#818cf8"/>
              <circle cx="32" cy="18" r="6" fill="#ffdbac"/>
              <path d="M25 36c0-3.87 3.13-7 7-7s7 3.13 7 7" fill="#38bdf8"/>
              <circle cx="16" cy="11" r="3.5" fill="#22c55e"/>
              <path d="M14.5 11l1 1 2.5-2.5" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round"/>
              <circle cx="32" cy="11" r="3.5" fill="#22c55e"/>
              <path d="M30.5 11l1 1 2.5-2.5" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span>Rekap Siswa</span>
          </button>

          <button className="menu-blue-card" onClick={() => onSwitchTab('jadwal')}>
            <svg width="34" height="34" viewBox="0 0 48 48" fill="none">
              <path d="M10 32l14 8 14-8-14-8-14 8z" fill="#ef4444"/>
              <path d="M10 26l14 8 14-8-14-8-14 8z" fill="#f59e0b"/>
              <path d="M10 20l14 8 14-8-14-8-14 8z" fill="#22c55e"/>
              <polygon points="24,4 12,10 36,10" fill="#0f172a"/>
              <rect x="20" y="8" width="8" height="3" fill="#1e293b"/>
              <path d="M34 10v8" stroke="#eab308" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="34" cy="20" r="2" fill="#eab308"/>
            </svg>
            <span>Rekap Mapel</span>
          </button>

          <button className="menu-blue-card" onClick={() => onSwitchTab('riwayat')}>
            <svg width="34" height="34" viewBox="0 0 48 48" fill="none">
              <rect x="18" y="16" width="12" height="24" rx="3" fill="#60a5fa"/>
              <polygon points="18,40 24,46 30,40" fill="#f59e0b"/>
              <polygon points="21,43 24,46 27,43" fill="#1e293b"/>
              <rect x="15" y="6" width="18" height="6" fill="#1e293b" rx="1"/>
              <polygon points="24,2 14,8 34,8" fill="#0f172a"/>
              <circle cx="21" cy="22" r="3" stroke="#ffffff" strokeWidth="2"/>
              <circle cx="27" cy="22" r="3" stroke="#ffffff" strokeWidth="2"/>
              <path d="M30 28l8-6" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round"/>
            </svg>
            <span>Rekap Guru</span>
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

