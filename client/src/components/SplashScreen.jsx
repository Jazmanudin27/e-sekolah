import React, { useEffect, useState } from 'react';
import { GraduationCap, Sparkles } from 'lucide-react';

export default function SplashScreen({ onFinish, duration = 2000 }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start fade-out slightly before duration ends
    const fadeTimer = setTimeout(() => {
      setFadeOut(true);
    }, duration - 400);

    const finishTimer = setTimeout(() => {
      if (onFinish) onFinish();
    }, duration);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [duration, onFinish]);

  return (
    <div
      className={`splash-screen-container ${fadeOut ? 'splash-fade-out' : ''}`}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999999,
        background: 'linear-gradient(135deg, #071633 0%, #004ecc 50%, #0066ff 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        overflow: 'hidden'
      }}
    >
      {/* Decorative Glow Circles */}
      <div
        style={{
          position: 'absolute',
          width: 320,
          height: 320,
          borderRadius: '50%',
          top: '-60px',
          right: '-60px',
          background: 'radial-gradient(circle, rgba(96, 165, 250, 0.35) 0%, rgba(59, 130, 246, 0) 70%)',
          pointerEvents: 'none'
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 280,
          height: 280,
          borderRadius: '50%',
          bottom: '-50px',
          left: '-50px',
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, rgba(168, 85, 247, 0) 70%)',
          pointerEvents: 'none'
        }}
      />

      {/* Main Animated Content Box */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: '0 24px',
          position: 'relative',
          zIndex: 2
        }}
      >
        {/* Animated Logo Circle */}
        <div className="splash-logo-wrapper">
          <div className="splash-logo-pulse-ring" />
          <div className="splash-logo-card">
            <GraduationCap size={44} color="#ffffff" strokeWidth={2.2} />
          </div>
        </div>

        {/* Brand Name & Tagline */}
        <div className="splash-brand-row">
          <h1 className="splash-brand-title">E-Sekolah</h1>
          <span className="splash-pro-badge">PRO</span>
        </div>

        <p className="splash-subtitle">
          Sistem Presensi & Manajemen Sekolah Digital
        </p>

        {/* Loading Progress Bar & Spinner */}
        <div className="splash-loader-box">
          <div className="splash-progress-track">
            <div className="splash-progress-fill" />
          </div>
          <div className="splash-status-text">
            <Sparkles size={13} className="splash-sparkle-icon" />
            <span>Memuat aplikasi...</span>
          </div>
        </div>
      </div>

      {/* Footer Powered By */}
      <div className="splash-footer-text">
        E-Sekolah Mobile Edition &bull; v2.5
      </div>
    </div>
  );
}
