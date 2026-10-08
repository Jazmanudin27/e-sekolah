import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { Plus } from 'lucide-react';
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
import GuruView from './views/GuruView';
import MapelView from './views/MapelView';
import KalenderView from './views/KalenderView';
import PenilaianInputView from './views/PenilaianInputView';
import PenilaianLaporanView from './views/PenilaianLaporanView';
import PerpustakaanView from './views/PerpustakaanView';
import SaprasView from './views/SaprasView';
import PelanggaranView from './views/PelanggaranView';
import PpdbView from './views/PpdbView';
import PublicPpdbPortalView from './views/PublicPpdbPortalView';
import AdminDesktopView from './views/admin/AdminDesktopView';
import PortalOrtuSiswaView from './views/PortalOrtuSiswaView';
import InstallPwaModal from './components/InstallPwaModal';
import BirthdayModal from './components/BirthdayModal';
import SplashScreen from './components/SplashScreen';
import api from './api/client';

const getInitialTab = () => {
  try {
    const path = window.location.pathname.toLowerCase();
    const host = window.location.hostname.toLowerCase();
    if (path.startsWith('/ppdb') || host.startsWith('ppdb.')) return 'ppdb';

    const hash = window.location.hash ? window.location.hash.replace('#', '') : '';
    if (hash) return hash;
    const stored = localStorage.getItem('esekolah_active_tab');
    if (stored) return stored;
  } catch (e) {}
  return 'beranda';
};

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [sekolahInfo, setSekolahInfo] = useState(null);
  const [tambahBukuTrigger, setTambahBukuTrigger] = useState(0);
  const [activeTab, setActiveTabState] = useState(getInitialTab);
  const [presensiModalType, setPresensiModalType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(() => {
    try {
      const shown = sessionStorage.getItem('esekolah_splash_shown');
      return !shown;
    } catch (e) {
      return true;
    }
  });

  const handleFinishSplash = () => {
    setShowSplash(false);
    try {
      sessionStorage.setItem('esekolah_splash_shown', 'true');
    } catch (e) {}
  };

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

  useEffect(() => {
    const fetchSekolah = async () => {
      try {
        const res = await api.get('/sekolah');
        if (res.data?.success && res.data?.data) {
          setSekolahInfo(res.data.data);
        }
      } catch (err) {
        console.warn('Gagal memuat info sekolah:', err);
      }
    };
    if (currentUser) {
      fetchSekolah();
    }
  }, [currentUser]);

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
      const isAdminAccount = user?.type === 'Admin' && !user?.kode_guru;
      const isKelasAccount = user?.type === 'Kelas' || user?.role === 'Kelas';
      setActiveTab(isAdminAccount ? 'dashboard' : isKelasAccount ? 'absensiSiswa' : 'beranda');
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

  if (showSplash) {
    return <SplashScreen onFinish={handleFinishSplash} duration={1800} />;
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0f172a', color: '#ffffff' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner-border text-primary" role="status" style={{ width: '2.5rem', height: '2.5rem', marginBottom: 12 }}></div>
          <p style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>Memuat data...</p>
        </div>
      </div>
    );
  }

  const isPpdbDirect = window.location.pathname.toLowerCase().startsWith('/ppdb') ||
                       window.location.hash === '#ppdb' ||
                       window.location.hostname.toLowerCase().startsWith('ppdb.');

  if (isPpdbDirect) {
    return (
      <>
        <InstallPwaModal />
        <PublicPpdbPortalView onLoginClick={() => {
          window.location.hash = '';
          window.history.pushState('', '', '/');
          window.location.href = '/';
        }} />
      </>
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

  // DESKTOP ADMIN PANEL & MANAGEMENT PORTAL (Only for pure Admin type accounts)
  if (currentUser?.type === 'Admin' && !currentUser?.kode_guru) {
    return (
      <>
        <InstallPwaModal />
        <BirthdayModal user={currentUser} />
        <AdminDesktopView user={currentUser} onLogout={handleLogout} onUserUpdated={(u) => setCurrentUser(u)} />
      </>
    );
  }

  return (
    <div className="app-shell">
      <InstallPwaModal />
      <BirthdayModal user={currentUser} />
      {/* SubHeaders for non-beranda views */}
      {activeTab === 'siswa' && (
        <SubHeader
          title="Data Siswa & Kelas"
          subtitle="Direktori siswa, kelas, dan jurusan"
          onBack={() => setActiveTab('beranda')}
        />
      )}

      {activeTab === 'guru' && (
        <SubHeader
          title="Data Guru & Tendik"
          subtitle="Direktori lengkap tenaga pendidik dan kependidikan"
          onBack={() => setActiveTab('beranda')}
        />
      )}

      {activeTab === 'mapel' && (
        <SubHeader
          title="Data Mata Pelajaran"
          subtitle="Daftar mata pelajaran kurikulum dan standar KKM"
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

      {activeTab === 'kalender' && (
        <SubHeader
          title="Kalender Pendidikan"
          subtitle="Pedoman Akademik Disdik Jabar 2026/2027"
          onBack={() => setActiveTab('beranda')}
        />
      )}

      {activeTab === 'perpustakaan' && (
        <SubHeader
          title="Perpustakaan"
          subtitle={sekolahInfo?.nama_sekolah || currentUser?.nama_sekolah || 'SMK ARTANITA TASIKMALAYA'}
          onBack={() => setActiveTab('beranda')}
          rightAction={
            <button
              type="button"
              onClick={() => setTambahBukuTrigger(Date.now())}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '6px 11px',
                borderRadius: 12,
                background: 'rgba(255, 255, 255, 0.22)',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.35)',
                color: '#ffffff',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <Plus size={15} strokeWidth={2.5} />
              <span>Tambah Buku</span>
            </button>
          }
        />
      )}

      {activeTab === 'sapras' && (
        <SubHeader
          title="Sarana & Prasarana"
          subtitle="Laporan Fasilitas, Inventaris & Lahan Sekolah"
          onBack={() => setActiveTab('beranda')}
        />
      )}

      {activeTab === 'pelanggaran' && (
        <SubHeader
          title="Buku Tata Tertib & BK"
          subtitle="Pencatatan Pelanggaran Siswa & Notifikasi WA"
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
            onUserUpdated={(u) => setCurrentUser(u)}
          />
        )}
        {activeTab === 'siswa' && <SiswaView showToast={showToast} onSwitchTab={(t) => setActiveTab(t)} />}
        {activeTab === 'guru' && <GuruView showToast={showToast} />}
        {activeTab === 'mapel' && <MapelView showToast={showToast} />}
        {activeTab === 'absensiSiswa' && <AbsensiSiswaView user={currentUser} showToast={showToast} />}
        {activeTab === 'absensiMapel' && <AbsensiMapelView user={currentUser} showToast={showToast} />}
        {activeTab === 'jadwal' && <JadwalView user={currentUser} />}
        {activeTab === 'riwayat' && <RiwayatView />}
        {activeTab === 'izin' && <IzinView user={currentUser} showToast={showToast} />}
        {activeTab === 'profil' && <ProfilView user={currentUser} onLogout={handleLogout} onUserUpdated={(u) => setCurrentUser(u)} />}
        {activeTab === 'rekapSiswa' && <RekapSiswaView user={currentUser} />}
        {activeTab === 'rekapMapel' && <RekapMapelView />}
        {activeTab === 'rekapGuru' && <RekapGuruView />}
        {activeTab === 'kalender' && <KalenderView />}
        {activeTab === 'perpustakaan' && (
          <PerpustakaanView
            user={currentUser}
            showToast={showToast}
            tambahBukuTrigger={tambahBukuTrigger}
          />
        )}
        {activeTab === 'sapras' && (
          <SaprasView
            user={currentUser}
            showToast={showToast}
          />
        )}
        {activeTab === 'tagihanSiswa' && (
          <PortalOrtuSiswaView
            user={currentUser}
            onLogout={handleLogout}
            onUserUpdated={(u) => setCurrentUser(u)}
          />
        )}
        {activeTab === 'pelanggaran' && (
          <PelanggaranView
            user={currentUser}
            showToast={showToast}
            onSwitchTab={(t) => setActiveTab(t)}
          />
        )}
        {activeTab === 'ppdb' && (
          <PpdbView
            currentUser={currentUser}
          />
        )}
        {(activeTab === 'penilaianInput' || activeTab === 'penilaian') && <PenilaianInputView onBack={() => setActiveTab('beranda')} />}
        {activeTab === 'penilaianLaporan' && <PenilaianLaporanView onBack={() => setActiveTab('beranda')} />}
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
