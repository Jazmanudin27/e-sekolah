import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Database, Mail, CheckSquare, FileText,
  ClipboardList, Send, Calendar, BookOpen, Package, Settings,
  ChevronDown, ChevronRight, Menu, X, Bell, Clock, LogOut,
  Building2, GraduationCap, Users, ShieldCheck, UserCheck, BookOpenCheck,
  Fingerprint, Award, FileSpreadsheet, BarChart3, Shield, Megaphone, Trophy, KeyRound
} from 'lucide-react';
import Swal from 'sweetalert2';
import ArtanitaLogo from '../../components/ArtanitaLogo';
import UpdateCredentialsModal from '../../components/UpdateCredentialsModal';
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
import AdminPengumumanTab from './AdminPengumumanTab';
import AdminKalenderTab from './AdminKalenderTab';
import AdminRaporTab from './AdminRaporTab';
import AdminEkskulTab from './AdminEkskulTab';
import AdminPerpustakaanTab from './AdminPerpustakaanTab';
import AdminSaprasTab from './AdminSaprasTab';
import AdminPresensiAbsensiTab from './AdminPresensiAbsensiTab';
import AdminKenaikanAlumniTab from './AdminKenaikanAlumniTab';

const VALID_ADMIN_TABS = [
  'dashboard', 'pengumuman', 'kalender', 'kelas', 'siswa', 'kenaikanAlumni', 'guru', 'mapel', 'jadwal', 'ekskul',
  'izin', 'presensiAbsensi', 'presensiGuru', 'absensiSiswa', 'absensiMapel',
  'rekapPresensi', 'rekapGuru', 'rekapSiswa', 'rekapMapel',
  'laporanRapor', 'laporanSiswa', 'laporanGuru', 'laporanKelas',
  'laporanPresensiGuru', 'laporanAbsensiSiswa', 'laporanAbsensiMapel',
  'laporanSurat', 'perpustakaan', 'sapras',
  'users', 'settings'
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
  dataMaster: ['kelas', 'siswa', 'guru', 'mapel', 'jadwal', 'ekskul'].includes(tab),
  suratMenyurat: ['izin'].includes(tab),
  presensiAbsensi: ['presensiGuru', 'absensiSiswa', 'absensiMapel'].includes(tab),
  laporanMaster: false,
  laporanAbsensi: ['rekapGuru', 'rekapSiswa', 'rekapMapel'].includes(tab),
  laporanSurat: false,
  perpustakaan: ['perpustakaan'].includes(tab),
  pengaturan: ['settings', 'users'].includes(tab)
});

export default function AdminDesktopView({ user, onLogout }) {
  const roleStr = String(user?.role || user?.username || '').toLowerCase();
  const isPerpusAdmin = roleStr.includes('perpus') || roleStr.includes('pustakawan');
  const isSaprasAdmin = roleStr.includes('sarpas') || roleStr.includes('sarpras');

  const [activeTab, setActiveTab] = useState(() => {
    if (isPerpusAdmin) return 'perpustakaan';
    if (isSaprasAdmin) return 'sapras';
    return getInitialTab();
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [currentUserData, setCurrentUserData] = useState(user);

  // Accordion open states
  const [openMenus, setOpenMenus] = useState(() => getInitialOpenMenus(getInitialTab()));

  useEffect(() => {
    if (isPerpusAdmin) {
      if (activeTab !== 'perpustakaan') {
        setActiveTab('perpustakaan');
      }
      setOpenMenus(prev => ({ ...prev, perpustakaan: true }));
    } else if (isSaprasAdmin) {
      if (activeTab !== 'sapras') {
        setActiveTab('sapras');
      }
      setOpenMenus(prev => ({ ...prev, sapras: true }));
    }
  }, [isPerpusAdmin, isSaprasAdmin, activeTab]);

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
    if (isPerpusAdmin && tabId !== 'perpustakaan') return;
    if (isSaprasAdmin && tabId !== 'sapras') return;

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
        dataMaster: ['kelas', 'siswa', 'kenaikanAlumni', 'guru', 'mapel', 'jadwal', 'ekskul'].includes(tabId) ? true : prev.dataMaster,
        suratMenyurat: ['izin'].includes(tabId) ? true : prev.suratMenyurat,
        presensiAbsensi: ['presensiGuru', 'absensiSiswa', 'absensiMapel'].includes(tabId) ? true : prev.presensiAbsensi,
        laporanAbsensi: ['rekapGuru', 'rekapSiswa', 'rekapMapel'].includes(tabId) ? true : prev.laporanAbsensi,
        pengaturan: ['settings', 'users'].includes(tabId) ? true : prev.pengaturan,
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
            <div className="school-badge-admin">
              {isPerpusAdmin ? 'PUSTAKAWAN' : isSaprasAdmin ? 'SARPRAS' : (user?.role?.toUpperCase() || 'ADMIN')}
            </div>
          </div>
        </div>

        {/* SIDEBAR NAVIGATION ITEMS */}
        <div className="portal-sidebar-menu">
          {isPerpusAdmin ? (
            <>
              <div className="portal-menu-section-label">LAYANAN PERPUSTAKAAN</div>
              <button
                type="button"
                className={`portal-menu-item ${activeTab === 'perpustakaan' ? 'active' : ''}`}
                onClick={() => handleSelectTab('perpustakaan')}
              >
                <div className="menu-icon-wrap">
                  <BookOpen size={17} />
                </div>
                <span className="menu-label">Katalog & Peminjaman Buku</span>
              </button>
            </>
          ) : isSaprasAdmin ? (
            <>
              <div className="portal-menu-section-label">SARANA & PRASARANA</div>
              <button
                type="button"
                className={`portal-menu-item ${activeTab === 'sapras' ? 'active' : ''}`}
                onClick={() => handleSelectTab('sapras')}
              >
                <div className="menu-icon-wrap">
                  <Package size={17} />
                </div>
                <span className="menu-label">Sarana Prasarana</span>
              </button>
            </>
          ) : (
            <>
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

          {/* 1.1 E-Rapor Siswa */}
          <button
            type="button"
            className={`portal-menu-item ${activeTab === 'laporanRapor' ? 'active' : ''}`}
            onClick={() => handleSelectTab('laporanRapor')}
          >
            <div className="menu-icon-wrap">
              <Award size={17} color="#0284c7" />
            </div>
            <span className="menu-label" style={{ fontWeight: 800, color: '#0284c7' }}>E-Rapor Siswa</span>
          </button>

          {/* 1.5 Pengumuman Sekolah */}
          <button
            type="button"
            className={`portal-menu-item ${activeTab === 'pengumuman' ? 'active' : ''}`}
            onClick={() => handleSelectTab('pengumuman')}
          >
            <div className="menu-icon-wrap">
              <Megaphone size={17} />
            </div>
            <span className="menu-label">Pengumuman</span>
          </button>

          {/* 1.6 Kalender Pendidikan */}
          <button
            type="button"
            className={`portal-menu-item ${activeTab === 'kalender' ? 'active' : ''}`}
            onClick={() => handleSelectTab('kalender')}
          >
            <div className="menu-icon-wrap">
              <Calendar size={17} />
            </div>
            <span className="menu-label">Kalender Pendidikan</span>
          </button>

          {/* 2. Data Master (Expandable) */}
          <div className="portal-menu-group">
            <button
              type="button"
              className={`portal-menu-item has-submenu ${['kelas', 'siswa', 'guru', 'mapel', 'jadwal', 'ekskul'].includes(activeTab) ? 'has-active' : ''}`}
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
                  className={`portal-submenu-item ${activeTab === 'kenaikanAlumni' ? 'active' : ''}`}
                  onClick={() => handleSelectTab('kenaikanAlumni')}
                >
                  <span>Kenaikan & Kelulusan</span>
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
                <button
                  type="button"
                  className={`portal-submenu-item ${activeTab === 'ekskul' ? 'active' : ''}`}
                  onClick={() => handleSelectTab('ekskul')}
                >
                  <span>Ekstrakurikuler</span>
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

          {/* 4. Presensi & Absensi (Tanpa dropdown, dengan sub-tab internal) */}
          <button
            type="button"
            className={`portal-menu-item ${['presensiAbsensi', 'presensiGuru', 'absensiSiswa', 'absensiMapel'].includes(activeTab) ? 'active' : ''}`}
            onClick={() => handleSelectTab('presensiAbsensi')}
          >
            <div className="menu-icon-wrap">
              <CheckSquare size={17} />
            </div>
            <span className="menu-label">Presensi & Absensi</span>
          </button>

          {/* Rekapitulasi Presensi & Absensi (Tanpa dropdown, dengan sub-tab internal) */}
          <button
            type="button"
            className={`portal-menu-item ${['rekapPresensi', 'rekapGuru', 'rekapSiswa', 'rekapMapel'].includes(activeTab) ? 'active' : ''}`}
            onClick={() => handleSelectTab('rekapPresensi')}
          >
            <div className="menu-icon-wrap">
              <BarChart3 size={17} />
            </div>
            <span className="menu-label">Rekap Presensi & Absensi</span>
          </button>

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
              className={`portal-menu-item has-submenu ${['perpustakaan'].includes(activeTab) ? 'has-active' : ''}`}
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
                  className={`portal-submenu-item ${activeTab === 'perpustakaan' ? 'active' : ''}`}
                  onClick={() => handleSelectTab('perpustakaan')}
                >
                  <span>Katalog & Peminjaman</span>
                </button>
              </div>
            )}
          </div>

          {/* 10. Sarana Prasarana */}
          <button
            type="button"
            className={`portal-menu-item ${activeTab === 'sapras' ? 'active' : ''}`}
            onClick={() => handleSelectTab('sapras')}
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
              className={`portal-menu-item has-submenu ${['settings', 'users'].includes(activeTab) ? 'has-active' : ''}`}
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
              </div>
            )}
          </div>
            </>
          )}
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
                  {!isPerpusAdmin && !isSaprasAdmin && (
                    <button
                      type="button"
                      className="dropdown-item"
                      onClick={() => handleSelectTab('settings')}
                    >
                      <Settings size={14} /> Pengaturan Profil
                    </button>
                  )}
                  <button
                    type="button"
                    className="dropdown-item"
                    onClick={() => setShowAccountModal(true)}
                  >
                    <KeyRound size={14} color="#0284c7" /> Ubah Email & Password
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
        {activeTab === 'laporanRapor' ? (
          <AdminRaporTab />
        ) : (
          <main className="portal-page-body">
            {isPerpusAdmin ? (
              <AdminPerpustakaanTab />
            ) : isSaprasAdmin ? (
              <AdminSaprasTab />
            ) : (
              <>
                {/* 1. DASHBOARD & PENGUMUMAN */}
                {activeTab === 'dashboard' && <AdminDashboardTab onSwitchTab={handleSelectTab} />}
                {activeTab === 'pengumuman' && <AdminPengumumanTab />}
                {activeTab === 'kalender' && <AdminKalenderTab />}

                {/* 2. DATA MASTER */}
                {activeTab === 'kelas' && <AdminKelasTab />}
                {activeTab === 'siswa' && <AdminSiswaTab onSwitchTab={handleSelectTab} />}
                {activeTab === 'kenaikanAlumni' && <AdminKenaikanAlumniTab />}
                {activeTab === 'guru' && <AdminGuruTab />}
                {activeTab === 'mapel' && <AdminMapelTab />}
                {activeTab === 'jadwal' && <AdminJadwalTab />}
                {activeTab === 'ekskul' && <AdminEkskulTab />}

                {/* 3. SURAT MENYURAT / PRESENSI */}
                {activeTab === 'izin' && <AdminIzinTab />}
                {['presensiAbsensi', 'presensiGuru', 'absensiSiswa', 'absensiMapel'].includes(activeTab) && (
                  <AdminPresensiAbsensiTab
                    initialSubTab={
                      activeTab === 'absensiSiswa'
                        ? 'siswa'
                        : activeTab === 'absensiMapel'
                        ? 'mapel'
                        : 'guru'
                    }
                  />
                )}

                {/* 4. LAPORAN & REKAP */}
                {['laporanSiswa', 'laporanGuru', 'laporanKelas', 'laporanPresensiGuru', 'laporanAbsensiSiswa', 'laporanAbsensiMapel', 'laporanSurat'].includes(activeTab) && (
                  <AdminLaporanGeneratorTab reportType={activeTab} />
                )}
                {['rekapPresensi', 'rekapGuru', 'rekapSiswa', 'rekapMapel'].includes(activeTab) && (
                  <AdminRekapTab
                    initialSubTab={
                      activeTab === 'rekapSiswa'
                        ? 'siswa'
                        : activeTab === 'rekapMapel'
                        ? 'mapel'
                        : 'guru'
                    }
                  />
                )}

                {/* 5. SISTEM & AKUN */}
                {activeTab === 'perpustakaan' && <AdminPerpustakaanTab />}
                {activeTab === 'sapras' && <AdminSaprasTab />}
                {activeTab === 'users' && <AdminUsersTab />}
                {activeTab === 'settings' && <AdminSettingsTab />}
              </>
            )}
          </main>
        )}
      </div>

      {/* MODAL UBAH USERNAME & PASSWORD */}
      {showAccountModal && (
        <UpdateCredentialsModal
          user={currentUserData || user}
          onClose={() => setShowAccountModal(false)}
          onUpdateSuccess={(newUserData) => {
            setCurrentUserData(newUserData);
          }}
        />
      )}
    </div>
  );
}
