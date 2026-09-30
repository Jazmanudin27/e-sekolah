import React, { useState, useEffect } from 'react';
import { Cake, Sparkles, Heart, X, Gift, PartyPopper, Bell, Calendar } from 'lucide-react';
import api from '../api/client';

export default function BirthdayModal({ user }) {
  const [birthdayTeachers, setBirthdayTeachers] = useState([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Check if dismissed in this session already
    const dismissed = sessionStorage.getItem('esekolah_birthday_dismissed');
    if (dismissed) return;

    fetchUpcomingBirthdays();
  }, []);

  const fetchUpcomingBirthdays = async () => {
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

  // Check if current user is celebrating birthday (today or tomorrow)
  const currentUserBirthday = birthdayTeachers.find(
    (g) => g.email === user?.email || g.nama_guru === user?.name || g.nama_guru === user?.nama_guru
  );

  const primaryTeacher = currentUserBirthday || birthdayTeachers[0];
  const isTomorrow = primaryTeacher.birthday_timing === 'tomorrow';

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
        background: 'rgba(7, 19, 43, 0.85)',
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
          border: isTomorrow ? '2px solid rgba(56, 189, 248, 0.5)' : '2px solid rgba(245, 158, 11, 0.5)',
          padding: '28px 24px',
          boxShadow: isTomorrow
            ? '0 25px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(56, 189, 248, 0.25)'
            : '0 25px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(245, 158, 11, 0.25)',
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

        {/* FLOATING ICON HEADER */}
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 20 }}>
          <div
            style={{
              width: 90,
              height: 90,
              borderRadius: '50%',
              background: isTomorrow
                ? 'linear-gradient(135deg, #38bdf8, #0284c7)'
                : 'linear-gradient(135deg, #fbbf24, #f59e0b)',
              padding: 4,
              boxShadow: isTomorrow
                ? '0 10px 30px rgba(2, 132, 199, 0.5), 0 0 0 6px rgba(56, 189, 248, 0.2)'
                : '0 10px 30px rgba(245, 158, 11, 0.5), 0 0 0 6px rgba(245, 158, 11, 0.2)',
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
                color: isTomorrow ? '#38bdf8' : '#fbbf24'
              }}
            >
              {isTomorrow ? <Gift size={44} /> : <Cake size={44} />}
            </div>
          </div>

          <div
            style={{
              position: 'absolute',
              top: -6,
              right: -6,
              background: isTomorrow ? '#0284c7' : '#ef4444',
              color: '#fff',
              borderRadius: '50%',
              width: 30,
              height: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #0f172a',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)'
            }}
          >
            {isTomorrow ? <Bell size={16} /> : <PartyPopper size={16} />}
          </div>
        </div>

        {/* BADGE TIMING */}
        <div>
          <span
            style={{
              background: isTomorrow
                ? 'linear-gradient(135deg, #0284c7, #0369a1)'
                : 'linear-gradient(135deg, #f59e0b, #d97706)',
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
            {isTomorrow ? '⏰ Pengingat: H-1 Ulang Tahun Besok' : '🎉 Momen Istimewa Hari Ini'}
          </span>
        </div>

        {/* TITLE GREETING */}
        <h3 style={{ fontSize: 19, fontWeight: 800, color: '#ffffff', margin: '0 0 6px 0', lineHeight: 1.35 }}>
          {isTomorrow ? (
            currentUserBirthday
              ? 'Besok Hari Ulang Tahun Anda! 🎂'
              : `Besok Mari Merayakan Hari Ulang Tahun ${primaryTeacher.nama_guru}! 🎂`
          ) : (
            currentUserBirthday
              ? `Selamat Ulang Tahun, ${primaryTeacher.nama_guru}! 🎂`
              : `Selamat Ulang Tahun ${primaryTeacher.nama_guru}! 🎂`
          )}
        </h3>

        {/* SUBTITLE */}
        <p style={{ fontSize: 13, color: isTomorrow ? '#38bdf8' : '#fbbf24', fontWeight: 700, margin: '0 0 16px 0' }}>
          {isTomorrow
            ? (age ? `Besok genap berusia ${age} Tahun • Mari siapkan doa terbaik!` : 'Mari siapkan doa & ucapan terbaik untuk besok!')
            : (age ? `Barakallah fii umrik (Usia ${age} Tahun)` : 'Barakallah fii umrik')}
        </p>

        {/* MESSAGE BOX */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.06)',
            borderRadius: 18,
            padding: '16px 18px',
            marginBottom: 20,
            border: '1px solid rgba(255, 255, 255, 0.1)',
            textAlign: 'center',
            fontSize: 13,
            color: '#e2e8f0',
            lineHeight: 1.6
          }}
        >
          {isTomorrow ? (
            currentUserBirthday ? (
              <>
                Besok adalah hari bertambahnya usia Anda! Segenap <strong>Keluarga Besar Sekolah</strong> mendoakan agar esok hari dan seterusnya senantiasa dilimpahi keberkahan, kemudahan, dan kesehatan prima. 🌟
              </>
            ) : (
              <>
                Pemberitahuan: <strong>Besok mari kita merayakan hari ulang tahun {primaryTeacher.nama_guru}</strong>! Mari siapkan ucapan selamat dan doa terbaik untuk beliau esok hari! 🎁✨
              </>
            )
          ) : (
            currentUserBirthday ? (
              <>
                Segenap <strong>Keluarga Besar Sekolah</strong> mengucapkan Selamat Ulang Tahun! 
                Semoga senantiasa diberikan kesehatan, umur panjang yang berkah, serta kemudahan dan kebahagiaan dalam mendidik putra-putri bangsa. ✨
              </>
            ) : (
              <>
                Mari kirimkan doa & ucapan terbaik untuk <strong>{primaryTeacher.nama_guru}</strong> yang sedang berulang tahun hari ini. Semoga panjang umur, sehat selalu, & diberkahi langkahnya! 🌟
              </>
            )
          )}
        </div>

        {/* EXTRA TEACHERS NOTICE (IF > 1) */}
        {birthdayTeachers.length > 1 && (
          <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 14 }}>
            🔔 Terdapat <strong>{birthdayTeachers.length} guru</strong> yang merayakan ulang tahun pada periode ini.
          </div>
        )}

        {/* ACTION BUTTON */}
        <button
          onClick={handleDismiss}
          style={{
            width: '100%',
            height: 48,
            background: isTomorrow
              ? 'linear-gradient(135deg, #0284c7, #0052cc)'
              : 'linear-gradient(135deg, #f59e0b, #d97706)',
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
            boxShadow: isTomorrow
              ? '0 8px 25px rgba(2, 132, 199, 0.4)'
              : '0 8px 25px rgba(245, 158, 11, 0.4)'
          }}
        >
          {isTomorrow ? <Bell size={18} fill="#ffffff" /> : <Heart size={18} fill="#ffffff" />}
          <span>
            {isTomorrow
              ? (currentUserBirthday ? 'Siap Sambut Hari Esok' : 'Siapkan Ucapan & Doa')
              : (currentUserBirthday ? 'Aamiin Ya Rabbal Alamin' : 'Ucapkan Selamat & Doa')}
          </span>
        </button>
      </div>
    </div>
  );
}
