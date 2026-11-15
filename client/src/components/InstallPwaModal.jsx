import React, { useState, useEffect } from 'react';
import { Download, X, CheckCircle2 } from 'lucide-react';

export default function InstallPwaModal() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // Cek apakah sedang berjalan di dalam aplikasi terinstal (standalone)
  const isStandalone =
    typeof window !== 'undefined' &&
    (window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://'));

  useEffect(() => {
    // Jika sudah dibuka sebagai aplikasi mandiri (standalone), jangan tampilkan modal
    if (isStandalone) {
      return;
    }

    // Bersihkan kunci localStorage lama yang sempat mengunci modal
    try {
      localStorage.removeItem('esekolah_pwa_installed');
    } catch (e) {}

    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(ua);
    setIsIOS(iosDevice);

    // Tangkap event Chrome beforeinstallprompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const dismissed = sessionStorage.getItem('esekolah_pwa_dismissed');
      if (!dismissed) {
        setShowModal(true);
      }
    };

    // Tangkap saat aplikasi selesai diinstall
    const handleAppInstalled = () => {
      setShowModal(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Munculkan modal otomatis setelah 1.5 detik jika dibuka di browser biasa
    const dismissed = sessionStorage.getItem('esekolah_pwa_dismissed');
    let timer = null;
    if (!dismissed) {
      timer = setTimeout(() => {
        setShowModal(true);
      }, 1500);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      if (timer) clearTimeout(timer);
    };
  }, [isStandalone]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      if (isIOS) {
        alert(
          'Untuk menginstall di iPhone / iPad:\n1. Ketuk ikon "Share" (Bagikan) di bagian bawah Safari\n2. Pilih "Tambahkan ke Layar Utama" (Add to Home Screen)'
        );
      } else {
        alert(
          'Petunjuk Install Chrome:\n1. Klik tombol Titik Tiga (⋮) di sudut kanan atas Chrome\n2. Pilih "Install aplikasi" atau "Tambahkan ke Layar Utama" (Add to Home Screen)'
        );
      }
      return;
    }

    try {
      setIsInstalling(true);
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowModal(false);
      }
    } catch (err) {
      console.error('Error during PWA install:', err);
    } finally {
      setIsInstalling(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    try {
      sessionStorage.setItem('esekolah_pwa_dismissed', 'true');
    } catch (e) {}
    setShowModal(false);
  };

  if (isStandalone || !showModal) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        background: 'rgba(9, 23, 46, 0.72)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.25s ease-out'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 380,
          background: '#0f172a',
          borderRadius: 20,
          border: '1px solid rgba(255, 255, 255, 0.12)',
          padding: '20px 18px',
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.5)',
          position: 'relative',
          color: '#ffffff',
          textAlign: 'center',
          animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* CLOSE BUTTON */}
        <button
          onClick={handleDismiss}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: 'rgba(255, 255, 255, 0.08)',
            border: 'none',
            borderRadius: '50%',
            width: 28,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#94a3b8',
            cursor: 'pointer',
            transition: 'background 0.15s ease'
          }}
          title="Tutup"
        >
          <X size={15} />
        </button>

        {/* LOGO SHOWCASE */}
        <div style={{ marginBottom: 12 }}>
          <div
            style={{
              width: 58,
              height: 58,
              borderRadius: 16,
              background: '#ffffff',
              padding: 5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)'
            }}
          >
            <img
              src="/E-Sekolah.png"
              alt="Logo E-Sekolah"
              style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 12 }}
            />
          </div>
        </div>

        {/* TITLE & INFO */}
        <h3
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: '#ffffff',
            margin: '0 0 4px 0',
            letterSpacing: '-0.2px'
          }}
        >
          Install Aplikasi E-Sekolah
        </h3>
        <p style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 14px 0', lineHeight: 1.45 }}>
          Pasang aplikasi di layar utama HP Anda agar akses presensi lebih cepat & praktis tanpa lewat tab browser.
        </p>

        {/* ADVANTAGES LIST */}
        <div
          style={{
            background: 'rgba(30, 41, 59, 0.5)',
            borderRadius: 12,
            padding: '10px 12px',
            marginBottom: 16,
            border: '1px solid rgba(255, 255, 255, 0.06)',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: 6
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, color: '#cbd5e1' }}>
            <CheckCircle2 size={14} color="#38bdf8" />
            <span>Akses 1-klik langsung dari layar HP</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, color: '#cbd5e1' }}>
            <CheckCircle2 size={14} color="#38bdf8" />
            <span>Tampilan bersih fullscreen tanpa address bar</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5, color: '#cbd5e1' }}>
            <CheckCircle2 size={14} color="#38bdf8" />
            <span>Presensi & scan kamera lebih responsif</span>
          </div>
        </div>

        {/* INSTALL BUTTON */}
        <button
          onClick={handleInstallClick}
          disabled={isInstalling}
          style={{
            width: '100%',
            height: 42,
            background: isInstalling ? '#334155' : 'linear-gradient(135deg, #1e40af, #2563eb)',
            border: 'none',
            borderRadius: 12,
            color: '#ffffff',
            fontSize: 13.5,
            fontWeight: 600,
            cursor: isInstalling ? 'wait' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            boxShadow: isInstalling ? 'none' : '0 4px 14px rgba(37, 99, 235, 0.35)',
            marginBottom: 8,
            transition: 'all 0.15s ease'
          }}
        >
          <Download size={16} />
          <span>
            {isInstalling
              ? 'Memproses Install...'
              : isIOS
              ? 'Petunjuk Install iOS'
              : 'Install Aplikasi Sekarang'}
          </span>
        </button>

        <button
          onClick={handleDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: '#64748b',
            fontSize: 12,
            fontWeight: 500,
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          Nanti Saja
        </button>
      </div>
    </div>
  );
}
