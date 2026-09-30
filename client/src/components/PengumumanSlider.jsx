import React, { useState, useEffect, useRef } from 'react';
import { Bell, ChevronLeft, ChevronRight, Calendar, User, Info, AlertCircle, Sparkles, X, Megaphone } from 'lucide-react';
import api from '../api/client';

export default function PengumumanSlider() {
  const [announcements, setAnnouncements] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const res = await api.get('/pengumuman');
      if (res.data.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        setAnnouncements(res.data.data);
      } else {
        // Fallback default sample announcements
        setAnnouncements([
          {
            id: 1,
            judul: 'Ujian Akhir Semester (UAS) Ganjil Tahun Ajaran 2026/2027',
            kategori: 'Penting',
            isi: 'Diberitahukan kepada seluruh siswa dan dewan guru bahwa pelaksanaan Ujian Akhir Semester (UAS) Ganjil akan dilaksanakan secara serentak mulai minggu depan. Harap mempersiapkan jadwal mengajar & kartu ujian.',
            gambar_url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=1200&q=80',
            penulis: 'Kepala Sekolah',
            created_at: new Date().toISOString()
          },
          {
            id: 2,
            judul: 'Sosialisasi Presensi Digital Smart Campus SMK Artanita',
            kategori: 'Kegiatan',
            isi: 'Sistem Presensi Digital E-Sekolah berbasis GPS & Anti-Fake GPS kini resmi diaktifkan. Seluruh siswa & guru diwajibkan melakukan scan presensi tepat waktu.',
            gambar_url: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80',
            penulis: 'Tim IT Artanita',
            created_at: new Date().toISOString()
          }
        ]);
      }
    } catch (err) {
      console.warn("Failed to fetch announcements:", err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-play Slider Timer
  useEffect(() => {
    if (announcements.length <= 1 || isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 4500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [announcements.length, isPaused]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % announcements.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + announcements.length) % announcements.length);
  };

  const getCategoryBadgeStyle = (category) => {
    const cat = (category || '').toLowerCase();
    if (cat.includes('penting')) {
      return { bg: 'linear-gradient(135deg, #ef4444, #dc2626)', text: '#fff', icon: AlertCircle };
    }
    if (cat.includes('kegiatan')) {
      return { bg: 'linear-gradient(135deg, #0284c7, #2563eb)', text: '#fff', icon: Sparkles };
    }
    if (cat.includes('libur')) {
      return { bg: 'linear-gradient(135deg, #f59e0b, #d97706)', text: '#fff', icon: Info };
    }
    return { bg: 'linear-gradient(135deg, #10b981, #059669)', text: '#fff', icon: Megaphone };
  };

  if (loading) {
    return (
      <div style={{ padding: '16px 0', textAlign: 'center', color: '#64748b' }}>
        <p style={{ fontSize: 13, fontWeight: 600 }}>Memuat pengumuman sekolah...</p>
      </div>
    );
  }

  if (announcements.length === 0) return null;

  const currentItem = announcements[currentIndex];
  const BadgeIcon = getCategoryBadgeStyle(currentItem.kategori).icon;

  return (
    <div style={{ marginBottom: 20 }}>
      {/* SECTION HEADER */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, padding: '0 4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #0066ff, #00d2ff)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 2px 8px rgba(0, 102, 255, 0.3)'
          }}>
            <Bell size={15} />
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.2px' }}>
            Pengumuman Terbaru
          </h3>
        </div>

        {/* CAROUSEL ARROWS */}
        {announcements.length > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={handlePrev}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '50%',
                width: 28,
                height: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#475569',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={handleNext}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '50%',
                width: 28,
                height: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#475569',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* BANNER CAROUSEL CARD */}
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        style={{
          borderRadius: 20,
          overflow: 'hidden',
          position: 'relative',
          background: '#0f172a',
          boxShadow: '0 10px 25px rgba(0, 102, 255, 0.15)',
          minHeight: 160,
          color: '#ffffff',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
        onClick={() => setSelectedAnnouncement(currentItem)}
      >
        {/* BACKGROUND IMAGE WITH GRADIENT OVERLAY */}
        {currentItem.gambar_url ? (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.35) 0%, rgba(15, 23, 42, 0.92) 80%), url(${currentItem.gambar_url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'brightness(0.95)'
            }}
          />
        ) : (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(135deg, #07193f 0%, #0f172a 100%)'
            }}
          />
        )}

        {/* CONTENT INSIDE CARD */}
        <div style={{ position: 'relative', zIndex: 2, padding: '16px 18px', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
          <div>
            {/* CATEGORY BADGE & DATE */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <span
                style={{
                  background: getCategoryBadgeStyle(currentItem.kategori).bg,
                  color: getCategoryBadgeStyle(currentItem.kategori).text,
                  padding: '4px 10px',
                  borderRadius: 20,
                  fontSize: 10.5,
                  fontWeight: 800,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px'
                }}
              >
                <BadgeIcon size={12} />
                {currentItem.kategori || 'Umum'}
              </span>

              <span style={{ fontSize: 10.5, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(0,0,0,0.4)', padding: '2px 8px', borderRadius: 10, backdropFilter: 'blur(4px)' }}>
                <Calendar size={11} />
                {currentItem.created_at ? new Date(currentItem.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Baru'}
              </span>
            </div>

            {/* TITLE */}
            <h4
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: '#ffffff',
                margin: '0 0 6px 0',
                lineHeight: 1.35,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {currentItem.judul}
            </h4>

            {/* BRIEF CONTENT PREVIEW */}
            <p
              style={{
                fontSize: 12,
                color: '#cbd5e1',
                margin: 0,
                lineHeight: 1.45,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {currentItem.isi}
            </p>
          </div>

          {/* FOOTER AUTHOR & READ MORE */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 14, paddingTop: 10, borderTop: '1px solid rgba(255, 255, 255, 0.12)' }}>
            <span style={{ fontSize: 11, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: 4 }}>
              <User size={12} color="#38bdf8" /> {currentItem.penulis || 'Pengumuman Resmi'}
            </span>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: 2 }}>
              Baca Selengkapnya &rarr;
            </span>
          </div>
        </div>
      </div>

      {/* DOTS INDICATOR */}
      {announcements.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 10 }}>
          {announcements.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              style={{
                width: currentIndex === idx ? 20 : 6,
                height: 6,
                borderRadius: 4,
                border: 'none',
                background: currentIndex === idx ? '#0066ff' : '#cbd5e1',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>
      )}

      {/* FULL DETAIL MODAL READ POPUP */}
      {selectedAnnouncement && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(7, 19, 43, 0.8)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            animation: 'fadeIn 0.25s ease'
          }}
          onClick={() => setSelectedAnnouncement(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 520,
              maxHeight: '90vh',
              background: '#ffffff',
              borderRadius: 24,
              overflow: 'hidden',
              boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER IMAGE / BANNER */}
            {selectedAnnouncement.gambar_url ? (
              <div style={{ height: 180, width: '100%', position: 'relative', background: '#0f172a' }}>
                <img
                  src={selectedAnnouncement.gambar_url}
                  alt={selectedAnnouncement.judul}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <button
                  onClick={() => setSelectedAnnouncement(null)}
                  style={{
                    position: 'absolute',
                    top: 14,
                    right: 14,
                    background: 'rgba(0,0,0,0.5)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '50%',
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    backdropFilter: 'blur(4px)'
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            ) : (
              <div style={{ padding: '20px 20px 10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span
                  style={{
                    background: getCategoryBadgeStyle(selectedAnnouncement.kategori).bg,
                    color: '#fff',
                    padding: '4px 12px',
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 800,
                    textTransform: 'uppercase'
                  }}
                >
                  {selectedAnnouncement.kategori || 'Umum'}
                </span>
                <button
                  onClick={() => setSelectedAnnouncement(null)}
                  style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <X size={18} color="#64748b" />
                </button>
              </div>
            )}

            {/* MODAL BODY CONTENT */}
            <div style={{ padding: '20px', overflowY: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#64748b', fontSize: 12, marginBottom: 10 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Calendar size={13} color="#0066ff" />
                  {selectedAnnouncement.created_at ? new Date(selectedAnnouncement.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Hari ini'}
                </span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <User size={13} color="#0066ff" />
                  {selectedAnnouncement.penulis || 'Administrator'}
                </span>
              </div>

              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 14, lineHeight: 1.4 }}>
                {selectedAnnouncement.judul}
              </h2>

              <div style={{ fontSize: 13.5, color: '#334155', lineHeight: 1.6, whitespace: 'pre-line' }}>
                {selectedAnnouncement.isi}
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div style={{ padding: '14px 20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', textAlign: 'right' }}>
              <button
                onClick={() => setSelectedAnnouncement(null)}
                style={{
                  background: '#0066ff',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 20px',
                  borderRadius: 10,
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: 'pointer'
                }}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
