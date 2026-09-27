import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Users, GraduationCap, Building2, BookOpen,
  Calendar, FileBarChart, ShieldCheck, Settings, LogOut,
  Bell, Clock, Shield, Sparkles, ChevronRight, ChevronDown, Menu, X,
  Fingerprint, UserCheck, BookOpenCheck, FileText, Award,
  FileSpreadsheet, BarChart3, Database, CalendarCheck
} from 'lucide-react';
import Swal from 'sweetalert2';
import '../../admin.css';

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

export default function AdminDesktopView({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

  // Accordion open states
  const [openGroups, setOpenGroups] = useState({
    master: true,
    presensi: true,
    laporan: true,
    sistem: false
  });

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const options = { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' };
      setCurrentDate(now.toLocaleDateString('id-ID', options));
      setCurrentTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' WIB');
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const adminName = user?.name || user?.nama || user?.username || 'Administrator';
  const adminRole = user?.role || 'Admin Utama';

  const toggleGroup = (groupKey) => {
    setOpenGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    setIsMobileSidebarOpen(false);
  };

  // Structured Navigation Groups
  const navigationStructure = [
    {
      type: 'single',
      id: 'dashboard',
      label: 'Dashboard Overview',
      icon: LayoutDashboard,
      badge: null
    },
    {
      type: 'group',
      key: 'master',
      label: 'Data Master',
      icon: Database,
      items: [
        { id: 'kelas', label: 'Data Kelas & Jurusan', icon: Building2 },
        { id: 'siswa', label: 'Data Siswa & NISN', icon: GraduationCap },
        { id: 'guru', label: 'Data Guru & Pegawai', icon: Users },
        { id: 'mapel', label: 'Data Mata Pelajaran', icon: BookOpen },
        { id: 'jadwal', label: 'Jadwal Pelajaran', icon: Calendar }
      ]
    },
    {
      type: 'group',
      key: 'presensi',
      label: 'Absensi & Presensi',
      icon: CalendarCheck,
      items: [
        { id: 'presensiGuru', label: 'Presensi Guru', icon: Fingerprint, sub: 'Log masuk & pulang' },
        { id: 'absensiSiswa', label: 'Absensi Siswa', icon: UserCheck, sub: 'Input harian per kelas' },
        { id: 'absensiMapel', label: 'Absensi Mapel', icon: BookOpenCheck, sub: 'Per jam pelajaran' },
        { id: 'izin', label: 'Surat Izin Guru', icon: FileText, sub: 'Pengajuan sakit/izin' }
      ]
    },
    {
      type: 'group',
      key: 'laporan',
      label: 'Laporan & Rekap',
      icon: FileBarChart,
      items: [
        { id: 'rekapGuru', label: 'Rekap Presensi Guru', icon: Award },
        { id: 'rekapSiswa', label: 'Rekap Absensi Siswa', icon: FileSpreadsheet },
        { id: 'rekapMapel', label: 'Rekap Absensi Mapel', icon: BarChart3 }
      ]
    },
    {
      type: 'group',
      key: 'sistem',
      label: 'Pengaturan & Akun',
      icon: ShieldCheck,
      items: [
        { id: 'users', label: 'Kelola Akun Users', icon: Shield },
        { id: 'settings', label: 'Pengaturan Sekolah', icon: Settings }
      ]
    }
  ];

  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return {
          category: 'Pusat Kendali',
          title: 'Dashboard Administrasi',
          subtitle: 'Ringkasan statistik & pusat pemantauan seluruh aktivitas sekolah'
        };
      case 'kelas':
        return {
          category: 'Data Master',
          title: 'Manajemen Kelas & Jurusan',
          subtitle: 'Kelola ruang kelas, wali kelas, serta kredensial akun kelas'
        };
      case 'siswa':
        return {
          category: 'Data Master',
          title: 'Manajemen Data Siswa',
          subtitle: 'Kelola direktori siswa, nomor induk siswa nasional (NISN), dan rombel'
        };
      case 'guru':
        return {
          category: 'Data Master',
          title: 'Manajemen Data Guru & Pegawai',
          subtitle: 'Kelola data tenaga pendidik, NIP, kepegawaian, dan akun pengajar'
        };
      case 'mapel':
        return {
          category: 'Data Master',
          title: 'Manajemen Mata Pelajaran',
          subtitle: 'Daftar mata pelajaran kurikulum dan standar KKM sekolah'
        };
      case 'jadwal':
        return {
          category: 'Data Master',
          title: 'Jadwal Pelajaran Sekolah',
          subtitle: 'Pengaturan alokasi jam mengajar guru dan kelas per hari'
        };
      case 'presensiGuru':
        return {
          category: 'Absensi & Presensi',
          title: 'Monitoring Presensi Guru',
          subtitle: 'Riwayat presensi mandiri, waktu scan masuk/pulang, dan foto selfie'
        };
      case 'absensiSiswa':
        return {
          category: 'Absensi & Presensi',
          title: 'Absensi Harian Siswa',
          subtitle: 'Pencatatan status kehadiran harian siswa per kelas (Hadir, Sakit, Izin, Alpa)'
        };
      case 'absensiMapel':
        return {
          category: 'Absensi & Presensi',
          title: 'Absensi Mata Pelajaran',
          subtitle: 'Pencatatan kehadiran siswa pada jam mengajar mata pelajaran tertentu'
        };
      case 'izin':
        return {
          category: 'Absensi & Presensi',
          title: 'Verifikasi Surat Izin Guru',
          subtitle: 'Daftar pengajuan izin sakit, dinas luar, dan keperluan keluarga'
        };
      case 'rekapGuru':
        return {
          category: 'Laporan & Rekap',
          title: 'Laporan Rekap Presensi Guru',
          subtitle: 'Rekapitulasi kehadiran bulanan seluruh tenaga pendidik & persentase'
        };
      case 'rekapSiswa':
        return {
          category: 'Laporan & Rekap',
          title: 'Laporan Rekap Absensi Siswa',
          subtitle: 'Rekapitulasi absensi harian per kelas dalam rentang bulan & semester'
        };
      case 'rekapMapel':
        return {
          category: 'Laporan & Rekap',
          title: 'Laporan Rekap Absensi Mapel',
          subtitle: 'Laporan kehadiran per mata pelajaran dan guru pengampu'
        };
      case 'users':
        return {
          category: 'Pengaturan & Akun',
          title: 'Kelola Akun Administrator (Tabel Users)',
          subtitle: 'Kelola hak akses administrator dan operator sistem'
        };
      case 'settings':
        return {
          category: 'Pengaturan & Akun',
          title: 'Pengaturan Identitas & Sekolah',
          subtitle: 'Konfigurasi profil sekolah, radius GPS, dan parameter jam presensi'
        };
      default:
        return {
          category: 'Admin Panel',
          title: 'Pusat Kendali E-Sekolah',
          subtitle: 'Sistem Informasi Akademik Terpadu'
        };
    }
  };

  const currentTabInfo = getTabTitle();

  return (
    <div className="admin-desktop-container">
      {/* MOBILE BACKDROP OVERLAY */}
      <div
        className={`admin-sidebar-backdrop ${isMobileSidebarOpen ? 'mobile-open' : ''}`}
        onClick={() => setIsMobileSidebarOpen(false)}
      />

      {/* ========================================================
          SIDEBAR WITH ACCORDION HIERARCHY
          ======================================================== */}
      <aside className={`admin-sidebar ${isMobileSidebarOpen ? 'mobile-open' : ''}`}>
        {/* LOGO & BRAND HEADER */}
        <div className="admin-sidebar-header">
          <div className="admin-logo-badge">
            <GraduationCap size={22} color="#ffffff" />
          </div>
          <div className="admin-brand-info">
            <h2>E-SEKOLAH PRO</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <span className="online-beacon-dot"></span>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: '#38bdf8', letterSpacing: '0.5px' }}>
                ADMIN DESKTOP
              </span>
            </div>
          </div>
          {/* MOBILE CLOSE TOGGLE */}
          <button
            className="mobile-menu-toggle"
            onClick={() => setIsMobileSidebarOpen(false)}
            style={{ marginLeft: 'auto', color: '#ffffff' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* NAVIGATION LIST WITH ACCORDION SECTIONS */}
        <div className="admin-sidebar-nav">
          {navigationStructure.map((navItem, idx) => {
            // 1. Single Direct Link (e.g. Dashboard)
            if (navItem.type === 'single') {
              const Icon = navItem.icon;
              const isActive = activeTab === navItem.id;
              return (
                <button
                  key={navItem.id}
                  className={`sidebar-menu-btn ${isActive ? 'active' : ''}`}
                  onClick={() => handleSelectTab(navItem.id)}
                  style={{ marginBottom: 6 }}
                >
                  <div className="sidebar-icon-pod">
                    <Icon size={18} />
                  </div>
                  <span>{navItem.label}</span>
                </button>
              );
            }

            // 2. Accordion Group
            const isOpen = openGroups[navItem.key];
            const hasActiveChild = navItem.items.some(child => child.id === activeTab);
            const GroupIcon = navItem.icon;

            return (
              <div key={navItem.key} className="sidebar-group-block">
                {/* GROUP ACCORDION HEADER */}
                <button
                  type="button"
                  className={`sidebar-group-header ${hasActiveChild ? 'has-active' : ''}`}
                  onClick={() => toggleGroup(navItem.key)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div className="sidebar-group-icon-pod">
                      <GroupIcon size={15} />
                    </div>
                    <span className="sidebar-group-label">{navItem.label}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="sidebar-group-count">{navItem.items.length}</span>
                    <ChevronDown
                      size={15}
                      className={`group-chevron ${isOpen ? 'open' : ''}`}
                    />
                  </div>
                </button>

                {/* ACCORDION CHILDREN */}
                {isOpen && (
                  <div className="sidebar-sub-menu">
                    {navItem.items.map((subItem) => {
                      const SubIcon = subItem.icon;
                      const isSubActive = activeTab === subItem.id;
                      return (
                        <button
                          key={subItem.id}
                          className={`sidebar-sub-item ${isSubActive ? 'active' : ''}`}
                          onClick={() => handleSelectTab(subItem.id)}
                        >
                          <div className="sub-item-indicator"></div>
                          <SubIcon size={16} />
                          <span className="sub-item-text">{subItem.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* SIDEBAR FOOTER PROFILE CARD */}
        <div className="admin-sidebar-footer">
          <div className="admin-user-pill">
            <div className="admin-avatar">
              {adminName.charAt(0).toUpperCase()}
            </div>
            <div className="admin-user-details">
              <div className="admin-user-name" title={adminName}>{adminName}</div>
              <div className="admin-user-role">{adminRole}</div>
            </div>
            <button
              className="btn-action-icon"
              style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', marginLeft: 'auto' }}
              onClick={onLogout}
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================================
          MAIN CONTENT WRAPPER
          ======================================================== */}
      <div className="admin-main-wrap">
        {/* TOPBAR HEADER */}
        <header className="admin-top-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              className="mobile-menu-toggle"
              onClick={() => setIsMobileSidebarOpen(true)}
              title="Buka Menu"
            >
              <Menu size={22} />
            </button>

            <div className="admin-header-title">
              <div className="admin-breadcrumbs">
                <span>E-Sekolah</span>
                <ChevronRight size={12} />
                <span>{currentTabInfo.category}</span>
                <ChevronRight size={12} />
                <span className="breadcrumb-current">{currentTabInfo.title}</span>
              </div>
              <h1>{currentTabInfo.title}</h1>
              <span className="mobile-subtitle-hidden">{currentTabInfo.subtitle}</span>
            </div>
          </div>

          <div className="admin-header-actions">
            {/* LIVE CLOCK */}
            <div className="admin-live-clock">
              <Clock size={15} color="#0066ff" />
              <span>{currentDate} • {currentTime}</span>
            </div>

            {/* LOGOUT BUTTON */}
            <button className="admin-logout-btn" onClick={onLogout} title="Keluar dari Admin">
              <LogOut size={16} />
              <span>Keluar</span>
            </button>
          </div>
        </header>

        {/* TAB BODY CONTENT */}
        <main className="admin-content-inner">
          {/* 1. DASHBOARD */}
          {activeTab === 'dashboard' && <AdminDashboardTab onSwitchTab={(tab) => handleSelectTab(tab)} />}

          {/* 2. DATA MASTER */}
          {activeTab === 'kelas' && <AdminKelasTab />}
          {activeTab === 'siswa' && <AdminSiswaTab />}
          {activeTab === 'guru' && <AdminGuruTab />}
          {activeTab === 'mapel' && <AdminMapelTab />}
          {activeTab === 'jadwal' && <AdminJadwalTab />}

          {/* 3. ABSENSI & PRESENSI */}
          {activeTab === 'presensiGuru' && <AdminPresensiGuruTab />}
          {activeTab === 'absensiSiswa' && <AdminAbsensiSiswaTab />}
          {activeTab === 'absensiMapel' && <AdminAbsensiMapelTab />}
          {activeTab === 'izin' && <AdminIzinTab />}

          {/* 4. LAPORAN & REKAP */}
          {activeTab === 'rekapGuru' && <AdminRekapTab initialSubTab="guru" />}
          {activeTab === 'rekapSiswa' && <AdminRekapTab initialSubTab="siswa" />}
          {activeTab === 'rekapMapel' && <AdminRekapTab initialSubTab="mapel" />}

          {/* 5. SISTEM & AKUN */}
          {activeTab === 'users' && <AdminUsersTab />}
          {activeTab === 'settings' && <AdminSettingsTab />}
        </main>
      </div>
    </div>
  );
}
