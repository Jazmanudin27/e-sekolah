import React, { useState, useEffect } from 'react';
import { Cake, Sparkles, Heart, X, Gift, PartyPopper } from 'lucide-react';
import api from '../api/client';

export default function BirthdayModal({ user }) {
  const [birthdayTeachers, setBirthdayTeachers] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Check if dismissed in this session already
    const dismissed = sessionStorage.getItem('esekolah_birthday_dismissed');
    if (dismissed) return;

    fetchTodayBirthdays();
  }, []);

  const fetchTodayBirthdays = async () => {
    try {
      const res = await api.get('/guru/birthdays/today');
      if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setBirthdayTeachers(res.data.data);
        setShowModal(true);
      }
    } catch (err) {
      console.warn("Failed to fetch birthday info:", err);
    }
  };

  const handleDismiss = () => {
    sessionStorage.setItem('esekolah_birthday_dismissed', 'true');
    setShowModal(false);
  };

  if (!showModal || birthdayTeachers.length === 0) return null;

  // Check if current user is celebrating birthday today
  const currentUserBirthday = birthdayTeachers.find(
    (g) => g.email === user?.email || g.nama_guru === user?.name || g.nama_guru === user?.nama_guru
  );

  const primaryTeacher = currentUserBirthday || birthdayTeachers[0];

  // Calculate age if year exists
  const calculateAge = (dob) => {
    if (!dob) return null;
    try {
      const birthYear = new Date(dob).getFullYear();
      const currentYear = new Date().getFullYear();
      return currentYear - birthYear;
    } catch (e) {
      return null;
    }
  };

  const age = calculateAge(primaryTeacher.tgl_lahir);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        background: 'rgba(7, 19, 43, 0.82)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        animation: 'fadeIn 0.3s ease-out'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          background: 'linear-gradient(145deg, #1e1b4b 0%, #0f172a 100%)',
          borderRadius: 28,
          border: '2px solid rgba(245, 158, 11, 0.4)',
          padding: '28px 24px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(245, 158, 11, 0.25)',
          position: 'relative',
          color: '#ffffff',
          textAlign: 'center',
          animation: 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* CLOSE BUTTON */}
        <button
          onClick={handleDismiss}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#cbd5e1',
            cursor: 'pointer'
          }}
        >
          <X size={18} />
        </button>

        {/* FLOATING ICON HEADER WITH GOLD GLOW */}
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 20 }}>
          <div
            style={{
              width: 90,
              height: 90,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
              padding: 4,
              boxShadow: '0 10px 30px rgba(245, 158, 11, 0.5), 0 0 0 6px rgba(245, 158, 11, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto'
            }}
          >
            <div
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: '#1e1b4b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fbbf24'
              }}
            >
              <Cake size={44} />
            </div>
          </div>

          <div
            style={{
              position: 'absolute',
              top: -6,
              right: -6,
              background: '#ef4444',
              color: '#fff',
              borderRadius: '50%',
              width: 30,
              height: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #0f172a',
              boxShadow: '0 2px 8px rgba(239, 68, 68, 0.5)'
            }}
          >
            <PartyPopper size={16} />
          </div>
        </div>

        {/* TITLE GREETING */}
        <span
          style={{
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            color: '#ffffff',
            padding: '4px 14px',
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: '0.8px',
            textTransform: 'uppercase',
            display: 'inline-block',
            marginBottom: 10
          }}
        >
          🎉 Momen Istimewa Hari Ini
        </span>

        <h3 style={{ fontSize: 20, fontWeight: 800, color: '#ffffff', margin: '0 0 6px 0', lineHeight: 1.3 }}>
          {currentUserBirthday
            ? `Selamat Ulang Tahun, ${primaryTeacher.nama_guru}! 🎂`
            : `Selamat Ulang Tahun ${primaryTeacher.nama_guru}! 🎂`}
        </h3>

        {/* AGE & SUBTITLE */}
        <p style={{ fontSize: 13, color: '#fbbf24', fontWeight: 700, margin: '0 0 16px 0' }}>
          {age ? `Barakallah fii umrik (Usia ${age} Tahun)` : 'Barakallah fii umrik'}
        </p>

        {/* MESSAGE BOX */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            borderRadius: 18,
            padding: '16px 18px',
            marginBottom: 22,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            textAlign: 'center',
            fontSize: 13,
            color: '#e2e8f0',
            lineHeight: 1.55
          }}
        >
          {currentUserBirthday ? (
            <>
              Segenap <strong>Keluarga Besar SMK Artanita</strong> mengucapkan Selamat Ulang Tahun! 
              Semoga senantiasa diberikan kesehatan, umur panjang yang berkah, serta kemudahan dan kebahagiaan dalam mendidik putra-putri bangsa. ✨
            </>
          ) : (
            <>
              Mari kirimkan doa & ucapan terbaik untuk <strong>{primaryTeacher.nama_guru}</strong> yang sedang berulang tahun hari ini. Semoga panjang umur, sehat selalu, & diberkahi langkahnya! 🌟
            </>
          )}
        </div>

        {/* ACTION BUTTON */}
        <button
          onClick={handleDismiss}
          style={{
            width: '100%',
            height: 48,
            background: 'linear-gradient(135deg, #f59e0b, #d97706)',
            border: 'none',
            borderRadius: 14,
            color: '#ffffff',
            fontSize: 14.5,
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            boxShadow: '0 8px 25px rgba(245, 158, 11, 0.4)'
          }}
        >
          <Heart size={18} fill="#ffffff" />
          <span>{currentUserBirthday ? 'Aamiin Ya Rabbal Alamin' : 'Ucapkan Selamat & Doa'}</span>
        </button>
      </div>
    </div>
  );
}
