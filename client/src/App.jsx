import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import TopBar from './components/TopBar';
import SubHeader from './components/SubHeader';
import BottomNav from './components/BottomNav';
import PresensiModal from './components/PresensiModal';
import LoginView from './views/LoginView';
import BerandaView from './views/BerandaView';
import SiswaView from './views/SiswaView';
import AbsensiSiswaView from './views/AbsensiSiswaView';
import AbsensiMapelView from './views/AbsensiMapelView';
import JadwalView from './views/JadwalView';
import RiwayatView from './views/RiwayatView';
import IzinView from './views/IzinView';
import ProfilView from './views/ProfilView';
import RekapSiswaView from './views/RekapSiswaView';
import RekapMapelView from './views/RekapMapelView';
import RekapGuruView from './views/RekapGuruView';
import AdminDesktopView from './views/admin/AdminDesktopView';
import InstallPwaModal from './components/InstallPwaModal';
import api from './api/client';

const getInitialTab = () => {
  try {
    const hash = window.location.hash ? window.location.hash.replace('#', '') : '';
    if (hash) return hash;
    const stored = localStorage.getItem('esekolah_active_tab');
    if (stored) return stored;
  } catch (e) {}
  return 'beranda';
};

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTabState] = useState(getInitialTab);
  const [presensiModalType, setPresensiModalType] = useState(null);
  const [loading, setLoading] = useState(true);

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    try {
      localStorage.setItem('esekolah_active_tab', tab);
      window.location.hash = tab;
    } catch (e) {}
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash ? window.location.hash.replace('#', '') : '';
      if (hash && hash !== activeTab) {
        setActiveTabState(hash);
        try {
          localStorage.setItem('esekolah_active_tab', hash);
        } catch (e) {}
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [activeTab]);

  useEffect(() => {
    const token = localStorage.getItem('esekolah_token');
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/auth/profile');
      if (res.data.success) {
        setCurrentUser(res.data.data);
      } else {
        handleLogout();
      }
    } catch (err) {
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, isSuccess = true, title = null) => {
    Swal.fire({
      title: title || (isSuccess ? 'Berhasil!' : 'Perhatian'),
      text: message,
      icon: isSuccess ? 'success' : 'error',
      confirmButtonColor: '#0066ff',
      confirmButtonText: 'OK',
      customClass: {
        popup: 'swal2-custom-popup'
      }
    });
  };

  const handleLoginSuccess = (user, token) => {
    localStorage.setItem('esekolah_token', token);
    setCurrentUser(user);
    const hash = window.location.hash ? window.location.hash.replace('#', '') : '';
    const stored = localStorage.getItem('esekolah_active_tab');
    if (!hash && !stored) {
      const isAdmin = user?.type === 'Admin' || (user?.role && ['admin', 'superadmin', 'operator', 'kepala_sekolah', 'kepala sekolah', 'kepsek', 'tu'].includes(String(user.role).toLowerCase()));
      const isKelas = user?.type === 'Kelas' || user?.role === 'Kelas';
      setActiveTab(isAdmin ? 'dashboard' : isKelas ? 'absensiSiswa' : 'beranda');
    } else {
      setActiveTab(hash || stored);
    }
    Swal.fire({
      title: 'Login Berhasil!',
      text: `Selamat datang kembali, ${user.name || user.nama_guru || user.nama_kelas || user.username || 'Pengguna'}!`,
      icon: 'success',
      confirmButtonColor: '#0066ff',
      timer: 2200,
      timerProgressBar: true,
      customClass: {
        popup: 'swal2-custom-popup'
      }
    });
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Konfirmasi Logout',
      text: 'Apakah Anda yakin ingin keluar dari aplikasi E-Sekolah?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Keluar',
      cancelButtonText: 'Batal',
      reverseButtons: true,
      customClass: {
        popup: 'swal2-custom-popup'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('esekolah_token');
        localStorage.removeItem('esekolah_active_tab');
        localStorage.removeItem('admin_active_tab');
        window.location.hash = '';
        setCurrentUser(null);
        Swal.fire({
          title: 'Berhasil Keluar',
          text: 'Anda telah keluar dari aplikasi.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          customClass: {
            popup: 'swal2-custom-popup'
          }
        });
      }
    });
  };

  if (loading) {
    return (
      <div className="app-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#0066ff', fontWeight: 600 }}>Memuat E-Sekolah...</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <>
        <InstallPwaModal />
        <LoginView onLoginSuccess={handleLoginSuccess} showToast={showToast} />
      </>
    );
  }

  // DESKTOP ADMIN PANEL & MANAGEMENT PORTAL
  if (currentUser?.type === 'Admin' || (currentUser?.role && ['admin', 'superadmin', 'operator', 'kepala_sekolah', 'kepala sekolah', 'kepsek', 'tu'].includes(String(currentUser.role).toLowerCase()))) {
    return (
      <>
        <InstallPwaModal />
        <AdminDesktopView user={currentUser} onLogout={handleLogout} />
      </>
    );
  }

  return (
    <div className="app-shell">
      <InstallPwaModal />
      {/* SubHeaders for non-beranda views */}
      {activeTab === 'siswa' && (
        <SubHeader
          title="Data Siswa & Kelas"
          subtitle="Direktori siswa, kelas, dan jurusan"
          onBack={() => setActiveTab('beranda')}
        />
      )}

      {activeTab === 'absensiSiswa' && (
        <SubHeader
          title="Absensi Siswa"
          subtitle="Input data kehadiran siswa per kelas"
          onBack={() => setActiveTab('beranda')}
        />
      )}

      {activeTab === 'absensiMapel' && (
        <SubHeader
          title="Absensi Mapel"
          subtitle="Catat kehadiran siswa pada jam mengajar"
          onBack={() => setActiveTab('beranda')}
        />
      )}

      {activeTab === 'jadwal' && (
        <SubHeader
          title="Jadwal Pengajar"
          subtitle="Jadwal mengajar dan kelas minggu ini"
          onBack={() => setActiveTab('beranda')}
        />
      )}

      {activeTab === 'riwayat' && (
        <SubHeader
          title="Riwayat Presensi"
          subtitle="Catatan dan rekap kehadiran presensi"
          onBack={() => setActiveTab('beranda')}
        />
      )}

      {activeTab === 'izin' && (
        <SubHeader
          title="Pengajuan Izin"
          subtitle="Permohonan izin, sakit, dan dinas sekolah"
          onBack={() => setActiveTab('beranda')}
        />
      )}

      {activeTab === 'profil' && (
        <SubHeader
          title="Profil Saya"
          subtitle="Informasi akun pengguna dan instansi"
          onBack={() => setActiveTab('beranda')}
        />
      )}

      {activeTab === 'rekapSiswa' && (
        <SubHeader
          title="Rekap Absensi Siswa"
          subtitle="Laporan hasil absensi harian siswa"
          onBack={() => setActiveTab('beranda')}
        />
      )}

      {activeTab === 'rekapMapel' && (
        <SubHeader
          title="Rekap Absensi Mapel"
          subtitle="Laporan hasil absensi mata pelajaran siswa"
          onBack={() => setActiveTab('beranda')}
        />
      )}

      {activeTab === 'rekapGuru' && (
        <SubHeader
          title="Rekap Presensi Guru"
          subtitle="Laporan kehadiran dan presensi semua guru"
          onBack={() => setActiveTab('beranda')}
        />
      )}

      {/* Main Content Area */}
      <main className="main-content-area">
        {activeTab === 'beranda' && (
          <BerandaView
            user={currentUser}
            onLogout={handleLogout}
            onOpenPresensiModal={(type) => setPresensiModalType(type)}
            onSwitchTab={(t) => setActiveTab(t)}
          />
        )}
        {activeTab === 'siswa' && <SiswaView showToast={showToast} onSwitchTab={(t) => setActiveTab(t)} />}
        {activeTab === 'absensiSiswa' && <AbsensiSiswaView user={currentUser} showToast={showToast} />}
        {activeTab === 'absensiMapel' && <AbsensiMapelView user={currentUser} showToast={showToast} />}
        {activeTab === 'jadwal' && <JadwalView user={currentUser} />}
        {activeTab === 'riwayat' && <RiwayatView />}
        {activeTab === 'izin' && <IzinView user={currentUser} showToast={showToast} />}
        {activeTab === 'profil' && <ProfilView user={currentUser} onLogout={handleLogout} />}
        {activeTab === 'rekapSiswa' && <RekapSiswaView user={currentUser} />}
        {activeTab === 'rekapMapel' && <RekapMapelView />}
        {activeTab === 'rekapGuru' && <RekapGuruView />}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={(t) => setActiveTab(t)}
        onOpenPresensi={(type) => setPresensiModalType(type || 'in')}
        user={currentUser}
      />

      {/* Presensi CheckIn/Out Modal */}
      {presensiModalType && (
        <PresensiModal
          type={presensiModalType}
          user={currentUser}
          onClose={() => setPresensiModalType(null)}
          onSuccess={() => {
            setPresensiModalType(null);
            showToast(
              `Presensi Scan ${presensiModalType === 'in' ? 'Masuk' : 'Pulang'} Berhasil!`,
              true
            );
          }}
        />
      )}
    </div>
  );
}
