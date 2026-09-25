import React, { useState, useEffect } from 'react';
import {
  CheckCircle, Building, FileText, Clock, Fingerprint,
  Users, GraduationCap, History, UserCheck, BookOpen,
  FileBarChart, PieChart, Award
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

  return (
    <div style={{ position: 'relative' }}>
      
      {/* 1. OVERLAPPING SUMMARY CARD */}
      <div className="summary-card-overlap">
        <div className="summary-item">
          <div className="summary-icon-box box-hadir">
            <CheckCircle size={22} />
            <span className="badge-count">19</span>
          </div>
          <span className="summary-label">Hadir</span>
        </div>

        <div className="summary-item">
          <div className="summary-icon-box box-sakit">
            <Building size={22} />
          </div>
          <span className="summary-label">Sakit</span>
        </div>

        <div className="summary-item">
          <div className="summary-icon-box box-izin">
            <FileText size={22} />
          </div>
          <span className="summary-label">Izin</span>
        </div>

        <div className="summary-item">
          <div className="summary-icon-box box-cuti">
            <Clock size={22} />
          </div>
          <span className="summary-label">Cuti</span>
        </div>
      </div>

      {/* 2. DUAL SCAN CARDS (SCAN MASUK & SCAN PULANG) */}
      <div className="dual-scan-container">
        <button
          className="scan-card scan-masuk"
          onClick={() => onOpenPresensiModal('in')}
          disabled={isCheckInDisabled}
        >
          <div className="scan-icon-circle">
            <Fingerprint size={26} />
          </div>
          <div>
            <div className="scan-text-title">Scan Masuk</div>
            <div className="scan-text-sub">
              {todayStatus?.jam_in ? `Jam: ${todayStatus.jam_in}` : 'Belum Scan'}
            </div>
          </div>
        </button>

        <button
          className="scan-card scan-pulang"
          onClick={() => onOpenPresensiModal('out')}
          disabled={isCheckOutDisabled}
        >
          <div className="scan-icon-circle">
            <Fingerprint size={26} />
          </div>
          <div>
            <div className="scan-text-title">Scan Pulang</div>
            <div className="scan-text-sub">
              {todayStatus?.jam_out ? `Jam: ${todayStatus.jam_out}` : 'Belum Scan'}
            </div>
          </div>
        </button>
      </div>

      {/* 3. 8-GRID BLUE MENU BUTTONS */}
      <div className="grid-menu-container">
        <div className="grid-menu-8">
          <button className="menu-card-blue" onClick={() => onSwitchTab('absensiSiswa')}>
            <div className="menu-icon"><Users size={24} /></div>
            <span>Siswa</span>
          </button>

          <button className="menu-card-blue" onClick={() => onSwitchTab('jadwal')}>
            <div className="menu-icon"><GraduationCap size={24} /></div>
            <span>Pengajar</span>
          </button>

          <button className="menu-card-blue" onClick={() => onSwitchTab('riwayat')}>
            <div className="menu-icon"><History size={24} /></div>
            <span>History</span>
          </button>

          <button className="menu-card-blue" onClick={() => onSwitchTab('absensiSiswa')}>
            <div className="menu-icon"><UserCheck size={24} /></div>
            <span>Absen Siswa</span>
          </button>

          <button className="menu-card-blue" onClick={() => onSwitchTab('absensiMapel')}>
            <div className="menu-icon"><BookOpen size={24} /></div>
            <span>Absen Mapel</span>
          </button>

          <button className="menu-card-blue" onClick={() => onSwitchTab('riwayat')}>
            <div className="menu-icon"><FileBarChart size={24} /></div>
            <span>Rekap Siswa</span>
          </button>

          <button className="menu-card-blue" onClick={() => onSwitchTab('riwayat')}>
            <div className="menu-icon"><PieChart size={24} /></div>
            <span>Rekap Mapel</span>
          </button>

          <button className="menu-card-blue" onClick={() => onSwitchTab('riwayat')}>
            <div className="menu-icon"><Award size={24} /></div>
            <span>Rekap Guru</span>
          </button>
        </div>
      </div>

      {/* 4. HISTORI 5 HARI TERAKHIR SECTION */}
      <div className="section-header-row">
        <div className="section-title-bold">Histori 5 Hari Terakhir</div>
        <div className="view-all-link" onClick={() => onSwitchTab('riwayat')}>View All</div>
      </div>

      {historyItems.length > 0 ? (
        historyItems.slice(0, 3).map(h => (
          <div key={h.id} className="history-card-white">
            <div className="history-fingerprint-box">
              <Fingerprint size={26} />
            </div>
            <div>
              <div className="history-date">{h.tanggal}</div>
              <div className="history-time">
                {h.jam_in || '06:23:35'} - {h.jam_out || '15:08:46'}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="history-card-white">
          <div className="history-fingerprint-box">
            <Fingerprint size={26} />
          </div>
          <div>
            <div className="history-date">Friday, 25 September 2026</div>
            <div className="history-time">06:23:35 - 15:08:46</div>
          </div>
        </div>
      )}

    </div>
  );
}
