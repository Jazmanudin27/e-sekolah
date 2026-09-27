import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard, Users, GraduationCap, Building2, BookOpen,
  Calendar, FileBarChart, ShieldCheck, Settings, LogOut,
  Bell, Clock, Shield, Sparkles, ChevronRight
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

export default function AdminDesktopView({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');

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

  const menuItems = [
    { section: 'UTAMA' },
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },

    { section: 'DATA MASTER' },
    { id: 'guru', label: 'Data Master Guru', icon: Users },
    { id: 'siswa', label: 'Data Master Siswa', icon: GraduationCap },
    { id: 'kelas', label: 'Data Master Kelas', icon: Building2 },
    { id: 'mapel', label: 'Mata Pelajaran', icon: BookOpen },
    { id: 'jadwal', label: 'Jadwal Mengajar', icon: Calendar },

    { section: 'MONITORING & LAPORAN' },
    { id: 'rekap', label: 'Rekapitulasi Presensi', icon: FileBarChart },

    { section: 'SISTEM & AKUN' },
    { id: 'users', label: 'Kelola Akun Users', icon: ShieldCheck },
    { id: 'settings', label: 'Pengaturan Sekolah', icon: Settings }
  ];

  const getTabTitle = () => {
    switch (activeTab) {
      case 'dashboard': return { title: 'Dashboard Administrasi', subtitle: 'Ringkasan statistik & pusat pemantauan seluruh data sekolah' };
      case 'guru': return { title: 'Manajemen Data Guru', subtitle: 'Kelola data tenaga pendidik, NIP, kepegawaian, dan akun pengajar' };
      case 'siswa': return { title: 'Manajemen Data Siswa', subtitle: 'Kelola direktori siswa, nomor induk siswa nasional, dan rombel kelas' };
      case 'kelas': return { title: 'Manajemen Kelas & Jurusan', subtitle: 'Kelola ruang kelas, wali kelas, serta kredensial akun kelas' };
      case 'mapel': return { title: 'Manajemen Mata Pelajaran', subtitle: 'Daftar mata pelajaran kurikulum dan standar KKM' };
      case 'jadwal': return { title: 'Jadwal Pelajaran Sekolah', subtitle: 'Pengaturan alokasi jam mengajar guru dan kelas per hari' };
      case 'rekap': return { title: 'Laporan & Rekapitulasi Presensi', subtitle: 'Rekap kehadiran guru, absensi siswa harian, dan absensi mapel' };
      case 'users': return { title: 'Manajemen Akun Admin (Tabel Users)', subtitle: 'Kelola hak akses administrator dan operator sistem' };
      case 'settings': return { title: 'Pengaturan Identitas & Presensi', subtitle: 'Konfigurasi profil sekolah dan parameter waktu absensi' };
      default: return { title: 'Admin Panel', subtitle: 'Pusat kendali E-Sekolah' };
    }
  };

  const currentTabInfo = getTabTitle();

  return (
    <div className="admin-desktop-container">
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        {/* LOGO & TITLE */}
        <div className="admin-sidebar-header">
          <div className="admin-logo-badge">
            <GraduationCap size={22} color="#ffffff" />
          </div>
          <div className="admin-brand-info">
            <h2>E-Sekolah PRO</h2>
            <span>Admin Desktop</span>
          </div>
        </div>

        {/* NAVIGATION LIST */}
        <div className="admin-sidebar-nav">
          {menuItems.map((item, idx) => {
            if (item.section) {
              return (
                <div key={`section-${idx}`} className="sidebar-category-label">
                  {item.section}
                </div>
              );
            }
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                className={`sidebar-menu-btn ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* LOGGED IN USER PILL */}
        <div className="admin-sidebar-footer">
          <div className="admin-user-pill">
            <div className="admin-avatar">
              {adminName.charAt(0).toUpperCase()}
            </div>
            <div className="admin-user-details">
              <div className="admin-user-name" title={adminName}>{adminName}</div>
              <div className="admin-user-role">{adminRole}</div>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="admin-main-wrap">
        {/* TOP HEADER */}
        <header className="admin-top-header">
          <div className="admin-header-title">
            <h1>{currentTabInfo.title}</h1>
            <span>{currentTabInfo.subtitle}</span>
          </div>

          <div className="admin-header-actions">
            <div className="admin-live-clock">
              <Clock size={15} color="#0066ff" />
              <span>{currentDate} • {currentTime}</span>
            </div>

            <button className="admin-logout-btn" onClick={onLogout} title="Keluar dari Admin">
              <LogOut size={16} />
              <span>Keluar</span>
            </button>
          </div>
        </header>

        {/* BODY CONTENT */}
        <main className="admin-content-inner">
          {activeTab === 'dashboard' && <AdminDashboardTab onSwitchTab={(tab) => setActiveTab(tab)} />}
          {activeTab === 'guru' && <AdminGuruTab />}
          {activeTab === 'siswa' && <AdminSiswaTab />}
          {activeTab === 'kelas' && <AdminKelasTab />}
          {activeTab === 'mapel' && <AdminMapelTab />}
          {activeTab === 'jadwal' && <AdminJadwalTab />}
          {activeTab === 'rekap' && <AdminRekapTab />}
          {activeTab === 'users' && <AdminUsersTab />}
          {activeTab === 'settings' && <AdminSettingsTab />}
        </main>
      </div>
    </div>
  );
}
