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
        background: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(8px)',
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
          background: isTomorrow
            ? 'linear-gradient(180deg, #f0f9ff 0%, #ffffff 32%)'
            : 'linear-gradient(180deg, #fffbeb 0%, #ffffff 32%)',
          borderRadius: 28,
          border: isTomorrow ? '2px solid #bae6fd' : '2px solid #fde68a',
          padding: '30px 24px 26px',
          boxShadow: isTomorrow
            ? '0 25px 60px rgba(2, 132, 199, 0.18), 0 10px 30px rgba(0, 0, 0, 0.08)'
            : '0 25px 60px rgba(245, 158, 11, 0.18), 0 10px 30px rgba(0, 0, 0, 0.08)',
          position: 'relative',
          color: '#0f172a',
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
            background: '#f1f5f9',
            border: 'none',
            borderRadius: '50%',
            width: 32,
            height: 32,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#64748b',
            cursor: 'pointer',
            transition: 'background 0.2s ease'
          }}
        >
          <X size={18} />
        </button>

        {/* FLOATING ICON HEADER (CERAH & MERIAH) */}
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: 18 }}>
          <div
            style={{
              width: 92,
              height: 92,
              borderRadius: '50%',
              background: isTomorrow
                ? 'linear-gradient(135deg, #e0f2fe, #bae6fd)'
                : 'linear-gradient(135deg, #fef3c7, #fde68a)',
              padding: 5,
              boxShadow: isTomorrow
                ? '0 10px 25px rgba(2, 132, 199, 0.25), 0 0 0 6px rgba(186, 230, 253, 0.4)'
                : '0 10px 25px rgba(245, 158, 11, 0.25), 0 0 0 6px rgba(254, 243, 199, 0.6)',
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
                background: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isTomorrow ? '#0284c7' : '#f59e0b',
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
              }}
            >
              {isTomorrow ? <Gift size={46} /> : <Cake size={46} />}
            </div>
          </div>

          <div
            style={{
              position: 'absolute',
              top: -4,
              right: -4,
              background: isTomorrow ? '#0284c7' : '#ef4444',
              color: '#ffffff',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #ffffff',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
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
                ? 'linear-gradient(135deg, #e0f2fe, #bae6fd)'
                : 'linear-gradient(135deg, #fef3c7, #fde68a)',
              color: isTomorrow ? '#0369a1' : '#b45309',
              border: isTomorrow ? '1px solid #7dd3fc' : '1px solid #fcd34d',
              padding: '4px 16px',
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              display: 'inline-block',
              marginBottom: 12
            }}
          >
            {isTomorrow ? '⏰ Pengingat: H-1 Ulang Tahun Besok' : '🎉 Momen Bahagia Hari Ini'}
          </span>
        </div>

        {/* TITLE GREETING */}
        <h3 style={{ fontSize: 19, fontWeight: 900, color: '#0f172a', margin: '0 0 6px 0', lineHeight: 1.35 }}>
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
        <p style={{ fontSize: 13, color: isTomorrow ? '#0284c7' : '#d97706', fontWeight: 700, margin: '0 0 16px 0' }}>
          {isTomorrow
            ? (age ? `Besok genap berusia ${age} Tahun • Mari siapkan doa terbaik!` : 'Mari siapkan doa & ucapan terbaik untuk besok!')
            : (age ? `Barakallah fii umrik (Usia ${age} Tahun)` : 'Barakallah fii umrik')}
        </p>

        {/* MESSAGE BOX CERAH */}
        <div
          style={{
            background: '#f8fafc',
            borderRadius: 18,
            padding: '16px 18px',
            marginBottom: 20,
            border: '1px solid #e2e8f0',
            textAlign: 'center',
            fontSize: 13,
            color: '#334155',
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
          <div style={{ fontSize: 11.5, color: '#64748b', marginBottom: 14 }}>
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
              ? 'linear-gradient(135deg, #0284c7, #0066ff)'
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
              ? '0 8px 25px rgba(2, 132, 199, 0.3)'
              : '0 8px 25px rgba(245, 158, 11, 0.3)',
            transition: 'transform 0.15s ease'
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
