import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Database, Mail, CheckSquare, FileText,
  ClipboardList, Send, Calendar, BookOpen, Package, Settings,
  ChevronDown, ChevronRight, Menu, X, Bell, Clock, LogOut,
  Building2, GraduationCap, Users, ShieldCheck, UserCheck, BookOpenCheck,
  Fingerprint, Award, FileSpreadsheet, BarChart3, Shield
} from 'lucide-react';
import Swal from 'sweetalert2';
import ArtanitaLogo from '../../components/ArtanitaLogo';
import '../../admin.css';
import api from '../../api/client';

// Tabs
import AdminDashboardTab from './AdminDashboardTab';
import AdminGuruTab from './AdminGuruTab';
import AdminSiswaTab from './AdminSiswaTab';
import AdminKelasTab from './AdminKelasTab';
import AdminMapelTab from './AdminMapelTab';
import AdminJadwalTab from './AdminJadwalTab';
import AdminRekapTab from './AdminRekapTab';
import AdminUsersTab from './AdminUsersTab';
import AdminSettingsTab from './AdminSettingsTab';
import AdminPresensiGuruTab from './AdminPresensiGuruTab';
import AdminIzinTab from './AdminIzinTab';
import AdminAbsensiSiswaTab from './AdminAbsensiSiswaTab';
import AdminAbsensiMapelTab from './AdminAbsensiMapelTab';
import AdminLaporanGeneratorTab from './AdminLaporanGeneratorTab';
import AdminMenuHakAksesTab from './AdminMenuHakAksesTab';

const VALID_ADMIN_TABS = [
  'dashboard', 'kelas', 'siswa', 'guru', 'mapel', 'jadwal',
  'izin', 'presensiGuru', 'absensiSiswa', 'absensiMapel',
  'rekapGuru', 'rekapSiswa', 'rekapMapel',
  'laporanSiswa', 'laporanGuru', 'laporanKelas',
  'laporanPresensiGuru', 'laporanAbsensiSiswa', 'laporanAbsensiMapel',
  'laporanSurat',
  'users', 'settings', 'menuHakAkses'
];

const getInitialTab = () => {
  try {
    const hash = window.location.hash ? window.location.hash.replace('#', '') : '';
    if (hash && VALID_ADMIN_TABS.includes(hash)) return hash;
    const stored = localStorage.getItem('admin_active_tab');
    if (stored && VALID_ADMIN_TABS.includes(stored)) return stored;
  } catch (e) {}
  return 'dashboard';
};

const getInitialOpenMenus = (tab) => ({
  dataMaster: ['kelas', 'siswa', 'guru', 'mapel', 'jadwal'].includes(tab),
  suratMenyurat: ['izin'].includes(tab),
  presensiAbsensi: ['presensiGuru', 'absensiSiswa', 'absensiMapel'].includes(tab),
  laporanMaster: false,
  laporanAbsensi: ['rekapGuru', 'rekapSiswa', 'rekapMapel'].includes(tab),
  laporanSurat: false,
  perpustakaan: false,
  pengaturan: ['settings', 'users', 'menuHakAkses'].includes(tab)
});

export default function AdminDesktopView({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState(getInitialTab);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Accordion open states (closed by default on dashboard, only opens if active tab belongs to the group)
  const [openMenus, setOpenMenus] = useState(() => getInitialOpenMenus(getInitialTab()));

  // Listen to hash change (e.g. browser back/forward buttons)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash ? window.location.hash.replace('#', '') : '';
      if (hash && VALID_ADMIN_TABS.includes(hash) && hash !== activeTab) {
        handleSelectTab(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [activeTab]);

  const [sekolahInfo, setSekolahInfo] = useState(null);

  useEffect(() => {
    const fetchSekolah = async () => {
      try {
        const userStr = localStorage.getItem('esekolah_user');
        let km = user?.kode_member;
        if (!km && userStr) {
          try { km = JSON.parse(userStr)?.kode_member; } catch (e) {}
        }
        const res = await api.get('/sekolah', { params: { kode_member: km } });
        if (res.data?.success && res.data?.data) {
          setSekolahInfo(res.data.data);
        }
      } catch (e) {}
    };
    fetchSekolah();
  }, [user]);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const options = { day: 'numeric', month: 'long', year: 'numeric' };
      setCurrentDate(now.toLocaleDateString('id-ID', options));
      setCurrentTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\./g, ':'));
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleSubMenu = (menuKey) => {
    setOpenMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    try {
      localStorage.setItem('admin_active_tab', tabId);
      window.location.hash = tabId;
    } catch (e) {}
    setIsMobileSidebarOpen(false);

    if (tabId === 'dashboard') {
      // Close all submenus when returning to dashboard
      setOpenMenus({
        dataMaster: false,
        suratMenyurat: false,
        presensiAbsensi: false,
        laporanMaster: false,
        laporanAbsensi: false,
        laporanSurat: false,
        perpustakaan: false,
        pengaturan: false
      });
    } else {
      // Ensure parent menu of selected child is open
      setOpenMenus(prev => ({
        ...prev,
        dataMaster: ['kelas', 'siswa', 'guru', 'mapel', 'jadwal'].includes(tabId) ? true : prev.dataMaster,
        suratMenyurat: ['izin'].includes(tabId) ? true : prev.suratMenyurat,
        presensiAbsensi: ['presensiGuru', 'absensiSiswa', 'absensiMapel'].includes(tabId) ? true : prev.presensiAbsensi,
        laporanAbsensi: ['rekapGuru', 'rekapSiswa', 'rekapMapel'].includes(tabId) ? true : prev.laporanAbsensi,
        pengaturan: ['settings', 'users', 'menuHakAkses'].includes(tabId) ? true : prev.pengaturan,
      }));
    }
  };

  return (
    <div className="portal-admin-layout">
      {/* MOBILE BACKDROP OVERLAY */}
      <div
        className={`portal-sidebar-overlay ${isMobileSidebarOpen ? 'active' : ''}`}
        onClick={() => setIsMobileSidebarOpen(false)}
      />

      {/* ========================================================
          SIDEBAR (MATCHING EXACT PORTAL ARTANITA SYSTEM SCREENSHOT)
          ======================================================== */}
      <aside className={`portal-sidebar ${isMobileSidebarOpen ? 'mobile-visible' : ''}`}>
        {/* BRAND LOGO HEADER */}
        <div className="portal-brand-header">
          <div className="portal-logo-box">
            <span>P</span>
          </div>
          <div className="portal-brand-text">
            <div className="brand-title">PORTAL</div>
            <div className="brand-subtitle">ARTANITA SYSTEM</div>
          </div>
          {/* Mobile close button */}
          <button
            className="portal-mobile-close"
            onClick={() => setIsMobileSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* SCHOOL PROFILE CARD IN SIDEBAR */}
        <div className="portal-school-card">
          <ArtanitaLogo size={36} />
          <div className="school-info">
            <div className="school-name">{sekolahInfo?.nama_sekolah || 'SMK ARTANITA'}</div>
            <div className="school-badge-admin">ADMIN</div>
          </div>
        </div>

        {/* SIDEBAR NAVIGATION ITEMS */}
        <div className="portal-sidebar-menu">
          {/* ----------------- MAIN MENU ----------------- */}
          <div className="portal-menu-section-label">MAIN MENU</div>

          {/* 1. Dashboard */}
          <button
            type="button"
            className={`portal-menu-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => handleSelectTab('dashboard')}
          >
            <div className="menu-icon-wrap">
              <LayoutDashboard size={17} />
            </div>
            <span className="menu-label">Dashboard</span>
          </button>

          {/* 2. Data Master (Expandable) */}
          <div className="portal-menu-group">
            <button
              type="button"
              className={`portal-menu-item has-submenu ${['kelas', 'siswa', 'guru', 'mapel', 'jadwal'].includes(activeTab) ? 'has-active' : ''}`}
              onClick={() => toggleSubMenu('dataMaster')}
            >
              <div className="menu-icon-wrap">
                <Database size={17} />
              </div>
              <span className="menu-label">Data Master</span>
              {openMenus.dataMaster ? <ChevronDown size={14} className="submenu-arrow" /> : <ChevronRight size={14} className="submenu-arrow" />}
            </button>
            {openMenus.dataMaster && (
              <div className="portal-submenu-list">
                <button
                  type="button"
                  className={`portal-submenu-item ${activeTab === 'kelas' ? 'active' : ''}`}
                  onClick={() => handleSelectTab('kelas')}
                >
                  <span>Data Kelas</span>
                </button>
                <button
                  type="button"
                  className={`portal-submenu-item ${activeTab === 'siswa' ? 'active' : ''}`}
                  onClick={() => handleSelectTab('siswa')}
                >
                  <span>Data Siswa</span>
                </button>
                <button
                  type="button"
                  className={`portal-submenu-item ${activeTab === 'guru' ? 'active' : ''}`}
                  onClick={() => handleSelectTab('guru')}
                >
                  <span>Data Guru</span>
                </button>
                <button
                  type="button"
                  className={`portal-submenu-item ${activeTab === 'mapel' ? 'active' : ''}`}
                  onClick={() => handleSelectTab('mapel')}
                >
                  <span>Data Mapel</span>
                </button>
                <button
                  type="button"
                  className={`portal-submenu-item ${activeTab === 'jadwal' ? 'active' : ''}`}
                  onClick={() => handleSelectTab('jadwal')}
                >
                  <span>Jadwal Pelajaran</span>
                </button>
              </div>
            )}
          </div>

          {/* 3. Surat Menyurat (Expandable) */}
          <div className="portal-menu-group">
            <button
              type="button"
              className={`portal-menu-item has-submenu ${activeTab === 'izin' ? 'has-active' : ''}`}
              onClick={() => toggleSubMenu('suratMenyurat')}
            >
              <div className="menu-icon-wrap">
                <Mail size={17} />
              </div>
              <span className="menu-label">Surat Menyurat</span>
              {openMenus.suratMenyurat ? <ChevronDown size={14} className="submenu-arrow" /> : <ChevronRight size={14} className="submenu-arrow" />}
            </button>
            {openMenus.suratMenyurat && (
              <div className="portal-submenu-list">
                <button
                  type="button"
                  className={`portal-submenu-item ${activeTab === 'izin' ? 'active' : ''}`}
                  onClick={() => handleSelectTab('izin')}
                >
                  <span>Surat Izin Guru</span>
                </button>
              </div>
            )}
          </div>

          {/* 4. Presensi & Absensi (Expandable) */}
          <div className="portal-menu-group">
            <button
              type="button"
              className={`portal-menu-item has-submenu ${['presensiGuru', 'absensiSiswa', 'absensiMapel'].includes(activeTab) ? 'has-active' : ''}`}
              onClick={() => toggleSubMenu('presensiAbsensi')}
            >
              <div className="menu-icon-wrap">
                <CheckSquare size={17} />
              </div>
              <span className="menu-label">Presensi & Absensi</span>
              {openMenus.presensiAbsensi ? <ChevronDown size={14} className="submenu-arrow" /> : <ChevronRight size={14} className="submenu-arrow" />}
            </button>
            {openMenus.presensiAbsensi && (
              <div className="portal-submenu-list">
                <button
                  type="button"
                  className={`portal-submenu-item ${activeTab === 'presensiGuru' ? 'active' : ''}`}
                  onClick={() => handleSelectTab('presensiGuru')}
                >
                  <span>Presensi Guru</span>
                </button>
                <button
                  type="button"
                  className={`portal-submenu-item ${activeTab === 'absensiSiswa' ? 'active' : ''}`}
                  onClick={() => handleSelectTab('absensiSiswa')}
                >
                  <span>Absensi Siswa</span>
                </button>
                <button
                  type="button"
                  className={`portal-submenu-item ${activeTab === 'absensiMapel' ? 'active' : ''}`}
                  onClick={() => handleSelectTab('absensiMapel')}
                >
                  <span>Absensi Mapel</span>
                </button>
              </div>
            )}
          </div>

          {/* ----------------- LAPORAN & REKAP ----------------- */}
          <div className="portal-menu-section-label">LAPORAN & REKAP</div>

          {/* 5. Laporan Master */}
          <div className="portal-menu-group">
            <button
              type="button"
              className={`portal-menu-item has-submenu ${['laporanSiswa', 'laporanGuru', 'laporanKelas'].includes(activeTab) ? 'has-active' : ''}`}
              onClick={() => toggleSubMenu('laporanMaster')}
            >
              <div className="menu-icon-wrap">
                <FileText size={17} />
              </div>
              <span className="menu-label">Laporan Master</span>
              {openMenus.laporanMaster ? <ChevronDown size={14} className="submenu-arrow" /> : <ChevronRight size={14} className="submenu-arrow" />}
            </button>
            {openMenus.laporanMaster && (
              <div className="portal-submenu-list">
                <button
                  type="button"
                  className={`portal-submenu-item ${activeTab === 'laporanSiswa' ? 'active' : ''}`}
                  onClick={() => handleSelectTab('laporanSiswa')}
                >
                  <span>Laporan Siswa</span>
                </button>
                <button
                  type="button"
                  className={`portal-submenu-item ${activeTab === 'laporanGuru' ? 'active' : ''}`}
                  onClick={() => handleSelectTab('laporanGuru')}
                >
                  <span>Laporan Guru</span>
                </button>
                <button
                  type="button"
                  className={`portal-submenu-item ${activeTab === 'laporanKelas' ? 'active' : ''}`}
                  onClick={() => handleSelectTab('laporanKelas')}
                >
                  <span>Laporan Kelas</span>
                </button>
              </div>
            )}
          </div>

          {/* 6. Laporan Absensi */}
          <div className="portal-menu-group">
            <button
              type="button"
              className={`portal-menu-item has-submenu ${['laporanPresensiGuru', 'laporanAbsensiSiswa', 'laporanAbsensiMapel', 'rekapGuru', 'rekapSiswa', 'rekapMapel'].includes(activeTab) ? 'has-active' : ''}`}
              onClick={() => toggleSubMenu('laporanAbsensi')}
            >
              <div className="menu-icon-wrap">
                <ClipboardList size={17} />
              </div>
              <span className="menu-label">Laporan Absensi</span>
              {openMenus.laporanAbsensi ? <ChevronDown size={14} className="submenu-arrow" /> : <ChevronRight size={14} className="submenu-arrow" />}
            </button>
            {openMenus.laporanAbsensi && (
              <div className="portal-submenu-list">
                <button
                  type="button"
                  className={`portal-submenu-item ${activeTab === 'laporanPresensiGuru' || activeTab === 'rekapGuru' ? 'active' : ''}`}
                  onClick={() => handleSelectTab('laporanPresensiGuru')}
                >
                  <span>Presensi Guru</span>
                </button>
                <button
                  type="button"
                  className={`portal-submenu-item ${activeTab === 'laporanAbsensiSiswa' || activeTab === 'rekapSiswa' ? 'active' : ''}`}
                  onClick={() => handleSelectTab('laporanAbsensiSiswa')}
                >
                  <span>Absensi Siswa</span>
                </button>
                <button
                  type="button"
                  className={`portal-submenu-item ${activeTab === 'laporanAbsensiMapel' || activeTab === 'rekapMapel' ? 'active' : ''}`}
                  onClick={() => handleSelectTab('laporanAbsensiMapel')}
                >
                  <span>Absensi Mapel</span>
                </button>
              </div>
            )}
          </div>

          {/* 7. Laporan Surat */}
          <div className="portal-menu-group">
            <button
              type="button"
              className={`portal-menu-item has-submenu ${['laporanSurat'].includes(activeTab) ? 'has-active' : ''}`}
              onClick={() => toggleSubMenu('laporanSurat')}
            >
              <div className="menu-icon-wrap">
                <Send size={17} />
              </div>
              <span className="menu-label">Laporan Surat</span>
              {openMenus.laporanSurat ? <ChevronDown size={14} className="submenu-arrow" /> : <ChevronRight size={14} className="submenu-arrow" />}
            </button>
            {openMenus.laporanSurat && (
              <div className="portal-submenu-list">
                <button
                  type="button"
                  className={`portal-submenu-item ${activeTab === 'laporanSurat' ? 'active' : ''}`}
                  onClick={() => handleSelectTab('laporanSurat')}
                >
                  <span>Laporan Surat Izin</span>
                </button>
              </div>
            )}
          </div>

          {/* 8. Jadwal Pelajaran Link */}
          <button
            type="button"
            className={`portal-menu-item ${activeTab === 'jadwal' ? 'active' : ''}`}
            onClick={() => handleSelectTab('jadwal')}
          >
            <div className="menu-icon-wrap">
              <Calendar size={17} />
            </div>
            <span className="menu-label">Jadwal Pelajaran</span>
          </button>

          {/* 9. Perpustakaan */}
          <div className="portal-menu-group">
            <button
              type="button"
              className="portal-menu-item has-submenu"
              onClick={() => toggleSubMenu('perpustakaan')}
            >
              <div className="menu-icon-wrap">
                <BookOpen size={17} />
              </div>
              <span className="menu-label">Perpustakaan</span>
              {openMenus.perpustakaan ? <ChevronDown size={14} className="submenu-arrow" /> : <ChevronRight size={14} className="submenu-arrow" />}
            </button>
            {openMenus.perpustakaan && (
              <div className="portal-submenu-list">
                <button
                  type="button"
                  className="portal-submenu-item"
                  onClick={() => Swal.fire('Info', 'Modul Perpustakaan E-Katalog sedang dalam sinkronisasi.', 'info')}
                >
                  <span>Katalog Buku</span>
                </button>
              </div>
            )}
          </div>

          {/* 10. Sarana Prasarana */}
          <button
            type="button"
            className="portal-menu-item"
            onClick={() => Swal.fire('Info', 'Modul Sarana Prasarana sedang dalam proses integrasi inventaris.', 'info')}
          >
            <div className="menu-icon-wrap">
              <Package size={17} />
            </div>
            <span className="menu-label">Sarana Prasarana</span>
          </button>

          {/* ----------------- SISTEM ----------------- */}
          <div className="portal-menu-section-label">SISTEM</div>

          {/* 11. Pengaturan */}
          <div className="portal-menu-group">
            <button
              type="button"
              className={`portal-menu-item has-submenu ${['settings', 'users', 'menuHakAkses'].includes(activeTab) ? 'has-active' : ''}`}
              onClick={() => toggleSubMenu('pengaturan')}
            >
              <div className="menu-icon-wrap">
                <Settings size={17} />
              </div>
              <span className="menu-label">Pengaturan</span>
              {openMenus.pengaturan ? <ChevronDown size={14} className="submenu-arrow" /> : <ChevronRight size={14} className="submenu-arrow" />}
            </button>
            {openMenus.pengaturan && (
              <div className="portal-submenu-list">
                <button
                  type="button"
                  className={`portal-submenu-item ${activeTab === 'settings' ? 'active' : ''}`}
                  onClick={() => handleSelectTab('settings')}
                >
                  <span>Pengaturan Sekolah</span>
                </button>
                <button
                  type="button"
                  className={`portal-submenu-item ${activeTab === 'users' ? 'active' : ''}`}
                  onClick={() => handleSelectTab('users')}
                >
                  <span>Kelola Akun Users</span>
                </button>
                <button
                  type="button"
                  className={`portal-submenu-item ${activeTab === 'menuHakAkses' ? 'active' : ''}`}
                  onClick={() => handleSelectTab('menuHakAkses')}
                >
                  <span>Hak Akses Menu & Role</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ========================================================
          MAIN AREA & TOPBAR (MATCHING EXACT TOPBAR SCREENSHOT)
          ======================================================== */}
      <div className="portal-main-area">
        {/* TOP NAVBAR */}
        <header className="portal-navbar">
          {/* LEFT: HAMBURGER */}
          <div className="navbar-left">
            <button
              type="button"
              className="navbar-toggle-btn"
              onClick={() => setIsMobileSidebarOpen(true)}
              title="Toggle Menu"
            >
              <Menu size={20} />
            </button>
          </div>

          {/* RIGHT: DATE PILL, NOTIF BELL, PROFILE DROPDOWN */}
          <div className="navbar-right">
            {/* DATE & TIME CAPSULE */}
            <div className="navbar-datetime-capsule">
              <Clock size={14} />
              <span>{currentDate} • {currentTime}</span>
            </div>

            {/* NOTIFICATION BELL */}
            <div className="navbar-bell-btn">
              <Bell size={18} />
              <span className="bell-badge">3</span>
            </div>

            {/* PROFILE DROPDOWN */}
            <div className="navbar-profile-wrapper">
              <button
                type="button"
                className="navbar-profile-btn"
                onClick={() => setShowProfileMenu(prev => !prev)}
              >
                <ArtanitaLogo size={24} />
                <span className="profile-school-title">{sekolahInfo?.nama_sekolah || 'SMK ARTANITA'}</span>
                <ChevronDown size={14} color="#64748b" />
              </button>

              {/* DROPDOWN MENU */}
              {showProfileMenu && (
                <div className="navbar-profile-dropdown" onClick={() => setShowProfileMenu(false)}>
                  <div className="dropdown-header">
                    <div style={{ fontWeight: 700, color: '#0f172a' }}>{user?.name || user?.username || 'Admin Artanita'}</div>
                    <div style={{ fontSize: 11, color: '#64748b' }}>{user?.email || 'admin@artanita.com'}</div>
                  </div>
                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => handleSelectTab('settings')}
                  >
                    <Settings size={14} /> Pengaturan Profil
                  </button>
                  <button
                    type="button"
                    className="dropdown-item dropdown-item-danger"
                    onClick={onLogout}
                  >
                    <LogOut size={14} /> Keluar Aplikasi
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ========================================================
            PAGE CONTENT INNER
            ======================================================== */}
        <main className="portal-page-body">
          {/* 1. DASHBOARD */}
          {activeTab === 'dashboard' && <AdminDashboardTab onSwitchTab={handleSelectTab} />}

          {/* 2. DATA MASTER */}
          {activeTab === 'kelas' && <AdminKelasTab />}
          {activeTab === 'siswa' && <AdminSiswaTab />}
          {activeTab === 'guru' && <AdminGuruTab />}
          {activeTab === 'mapel' && <AdminMapelTab />}
          {activeTab === 'jadwal' && <AdminJadwalTab />}

          {/* 3. SURAT MENYURAT / PRESENSI */}
          {activeTab === 'izin' && <AdminIzinTab />}
          {activeTab === 'presensiGuru' && <AdminPresensiGuruTab />}
          {activeTab === 'absensiSiswa' && <AdminAbsensiSiswaTab />}
          {activeTab === 'absensiMapel' && <AdminAbsensiMapelTab />}

          {/* 4. LAPORAN & REKAP */}
          {['laporanSiswa', 'laporanGuru', 'laporanKelas', 'laporanPresensiGuru', 'laporanAbsensiSiswa', 'laporanAbsensiMapel', 'laporanSurat'].includes(activeTab) && (
            <AdminLaporanGeneratorTab reportType={activeTab} />
          )}
          {activeTab === 'rekapGuru' && <AdminLaporanGeneratorTab reportType="laporanPresensiGuru" />}
          {activeTab === 'rekapSiswa' && <AdminLaporanGeneratorTab reportType="laporanAbsensiSiswa" />}
          {activeTab === 'rekapMapel' && <AdminLaporanGeneratorTab reportType="laporanAbsensiMapel" />}

          {/* 5. SISTEM & AKUN */}
          {activeTab === 'users' && <AdminUsersTab />}
          {activeTab === 'settings' && <AdminSettingsTab />}
          {activeTab === 'menuHakAkses' && <AdminMenuHakAksesTab />}
        </main>
      </div>
    </div>
  );
}
