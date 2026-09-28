import React from 'react';
import { Home, FileText, Fingerprint, History, User, UserCheck, BookOpen, FileBarChart, Calendar } from 'lucide-react';

export default function BottomNav({ activeTab, onTabChange, onOpenPresensi, user }) {
  const isClassAccount = user?.type === 'Kelas' || user?.role === 'Kelas';

  if (isClassAccount) {
    return (
      <nav className="bottom-nav-white">
        <div className="bottom-nav-inner">
          {/* 1. BERANDA KELAS */}
          <button
            className={`nav-link-item ${activeTab === 'beranda' ? 'active' : ''}`}
            onClick={() => onTabChange('beranda')}
          >
            <div className="nav-icon-wrapper">
              <Home size={21} />
            </div>
            <span>Beranda</span>
            {activeTab === 'beranda' && <span className="active-dot" />}
          </button>

          {/* 2. ABSENSI SISWA */}
          <button
            className={`nav-link-item ${activeTab === 'absensiSiswa' ? 'active' : ''}`}
            onClick={() => onTabChange('absensiSiswa')}
          >
            <div className="nav-icon-wrapper">
              <UserCheck size={21} />
            </div>
            <span>Absen Siswa</span>
            {activeTab === 'absensiSiswa' && <span className="active-dot" />}
          </button>

          {/* 3. JADWAL PELAJARAN */}
          <button
            className={`nav-link-item ${activeTab === 'jadwal' ? 'active' : ''}`}
            onClick={() => onTabChange('jadwal')}
          >
            <div className="nav-icon-wrapper">
              <Calendar size={21} />
            </div>
            <span>Jadwal</span>
            {activeTab === 'jadwal' && <span className="active-dot" />}
          </button>

          {/* 4. REKAP SISWA */}
          <button
            className={`nav-link-item ${activeTab === 'rekapSiswa' ? 'active' : ''}`}
            onClick={() => onTabChange('rekapSiswa')}
          >
            <div className="nav-icon-wrapper">
              <FileBarChart size={21} />
            </div>
            <span>Rekap</span>
            {activeTab === 'rekapSiswa' && <span className="active-dot" />}
          </button>
        </div>
      </nav>
    );
  }

  // GURU / ADMIN NAVIGATION (Original)
  return (
    <nav className="bottom-nav-white">
      <div className="bottom-nav-inner">
        {/* 1. BERANDA */}
        <button
          className={`nav-link-item ${activeTab === 'beranda' ? 'active' : ''}`}
          onClick={() => onTabChange('beranda')}
        >
          <div className="nav-icon-wrapper">
            <Home size={21} />
          </div>
          <span>Beranda</span>
          {activeTab === 'beranda' && <span className="active-dot" />}
        </button>

        {/* 2. IZIN */}
        <button
          className={`nav-link-item ${activeTab === 'izin' ? 'active' : ''}`}
          onClick={() => onTabChange('izin')}
        >
          <div className="nav-icon-wrapper">
            <FileText size={21} />
          </div>
          <span>Izin</span>
          {activeTab === 'izin' && <span className="active-dot" />}
        </button>

        {/* 3. CENTER FLOATING FINGERPRINT FAB */}
        <div className="fab-wrapper">
          <button
            className="floating-center-fab"
            onClick={() => onOpenPresensi?.('in')}
            title="Scan Presensi Fingerprint"
          >
            <div className="fab-pulse-ring" />
            <Fingerprint size={32} color="#ffffff" />
          </button>
        </div>

        {/* 4. HISTORI */}
        <button
          className={`nav-link-item ${activeTab === 'riwayat' || activeTab === 'histori' ? 'active' : ''}`}
          onClick={() => onTabChange('riwayat')}
        >
          <div className="nav-icon-wrapper">
            <History size={21} />
          </div>
          <span>Histori</span>
          {(activeTab === 'riwayat' || activeTab === 'histori') && <span className="active-dot" />}
        </button>

        {/* 5. PROFILE */}
        <button
          className={`nav-link-item ${activeTab === 'profil' ? 'active' : ''}`}
          onClick={() => onTabChange('profil')}
        >
          <div className="nav-icon-wrapper">
            <User size={21} />
          </div>
          <span>Profile</span>
          {activeTab === 'profil' && <span className="active-dot" />}
        </button>
      </div>
    </nav>
  );
}
