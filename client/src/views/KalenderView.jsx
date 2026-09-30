import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Sparkles,
  Info, AlertCircle, Clock, BookOpen, Award, Filter, RefreshCw
} from 'lucide-react';
import api from '../api/client';

export default function KalenderView() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 1)); // Default July 2026 (Semester 1 2026/2027)
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedDateEvents, setSelectedDateEvents] = useState(null);
  const [selectedDayNumber, setSelectedDayNumber] = useState(null);

  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-indexed

  useEffect(() => {
    fetchEvents();
  }, [currentYear, currentMonth, selectedCategory]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/kalender', {
        params: {
          tahun_ajaran: '2026/2027',
          tahun: currentYear,
          bulan: currentMonth + 1,
          kategori: selectedCategory
        }
      });
      if (res.data?.success && Array.isArray(res.data.data)) {
        setEvents(res.data.data);
      } else {
        setEvents([]);
      }
    } catch (err) {
      console.warn("Failed to fetch calendar events:", err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    setSelectedDateEvents(null);
    setSelectedDayNumber(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    setSelectedDateEvents(null);
    setSelectedDayNumber(null);
  };

  const handleJumpSemester = (sem) => {
    if (sem === 1) {
      setCurrentDate(new Date(2026, 6, 1)); // Juli 2026
    } else {
      setCurrentDate(new Date(2027, 0, 1)); // Januari 2027
    }
    setSelectedDateEvents(null);
    setSelectedDayNumber(null);
  };

  // Helper: check events on a specific day of the current month
  const getEventsForDay = (day) => {
    const targetDateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => {
      const start = e.tanggal_mulai?.split('T')[0];
      const end = e.tanggal_selesai?.split('T')[0] || start;
      return targetDateStr >= start && targetDateStr <= end;
    });
  };

  const handleDayClick = (day, dayEvents) => {
    setSelectedDayNumber(day);
    if (dayEvents && dayEvents.length > 0) {
      setSelectedDateEvents(dayEvents);
    } else {
      setSelectedDateEvents([]);
    }
  };

  // Calculate days in month & offset
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate();

  const getCategoryBadge = (kategori, warna) => {
    const cat = (kategori || '').toLowerCase();
    let bg = '#eff6ff';
    let text = '#1d4ed8';
    if (cat.includes('libur')) {
      bg = '#fef2f2'; text = '#dc2626';
    } else if (cat.includes('ujian')) {
      bg = '#fffbeb'; text = '#d97706';
    } else if (cat.includes('lomba')) {
      bg = '#f5f3ff'; text = '#7c3aed';
    } else if (cat.includes('rapor')) {
      bg = '#f0fdf4'; text = '#16a34a';
    } else if (cat.includes('mpls')) {
      bg = '#fff7ed'; text = '#c2410c';
    }
    return (
      <span style={{
        background: bg,
        color: text,
        padding: '3px 8px',
        borderRadius: 6,
        fontSize: 10.5,
        fontWeight: 800,
        textTransform: 'uppercase',
        border: `1px solid ${warna || text}25`
      }}>
        {kategori}
      </span>
    );
  };

  return (
    <div style={{ padding: '16px', maxWidth: 640, margin: '0 auto', paddingBottom: 90 }}>
      {/* HEADER CARD */}
      <div style={{
        background: 'linear-gradient(135deg, #07193f 0%, #0066ff 100%)',
        borderRadius: 22,
        padding: '20px 18px',
        color: '#ffffff',
        marginBottom: 16,
        boxShadow: '0 8px 25px rgba(0, 102, 255, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.2)',
            padding: 8,
            borderRadius: 12,
            display: 'flex',
            backdropFilter: 'blur(6px)'
          }}>
            <CalendarIcon size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8', letterSpacing: '0.5px' }}>
              DISDIK PROVINSI JAWA BARAT
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>
              Kalender Pendidikan 2026/2027
            </h2>
          </div>
        </div>
        <p style={{ fontSize: 12, color: '#cbd5e1', margin: 0, lineHeight: 1.45 }}>
          Pedoman agenda akademik, MPLS, jadwal ujian, asesmen, pembagian rapor, dan libur resmi Disdik Jabar.
        </p>

        {/* QUICK SEMESTER JUMP BUTTONS */}
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          <button
            onClick={() => handleJumpSemester(1)}
            style={{
              flex: 1,
              padding: '7px 0',
              borderRadius: 10,
              border: 'none',
              background: currentMonth >= 6 && currentYear === 2026 ? '#ffffff' : 'rgba(255, 255, 255, 0.15)',
              color: currentMonth >= 6 && currentYear === 2026 ? '#0066ff' : '#ffffff',
              fontWeight: 800,
              fontSize: 12,
              cursor: 'pointer'
            }}
          >
            Semester 1 (Ganjil)
          </button>
          <button
            onClick={() => handleJumpSemester(2)}
            style={{
              flex: 1,
              padding: '7px 0',
              borderRadius: 10,
              border: 'none',
              background: currentYear === 2027 ? '#ffffff' : 'rgba(255, 255, 255, 0.15)',
              color: currentYear === 2027 ? '#0066ff' : '#ffffff',
              fontWeight: 800,
              fontSize: 12,
              cursor: 'pointer'
            }}
          >
            Semester 2 (Genap)
          </button>
        </div>
      </div>

      {/* MONTH NAVIGATION BAR */}
      <div style={{
        background: '#ffffff',
        borderRadius: 18,
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
        boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
        border: '1px solid #e2e8f0'
      }}>
        <button
          onClick={handlePrevMonth}
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '50%',
            width: 34,
            height: 34,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#475569'
          }}
        >
          <ChevronLeft size={18} />
        </button>

        <div style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
            {months[currentMonth]} {currentYear}
          </h3>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>
            {events.length} Agenda Kegiatan
          </span>
        </div>

        <button
          onClick={handleNextMonth}
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '50%',
            width: 34,
            height: 34,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#475569'
          }}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* CATEGORY FILTER PILLS */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 8, marginBottom: 12 }}>
        {[
          { key: 'ALL', label: 'Semua' },
          { key: 'Libur', label: '🔴 Libur' },
          { key: 'Ujian', label: '🟠 Ujian/Asesmen' },
          { key: 'Kegiatan', label: '🔵 Kegiatan' },
          { key: 'Lomba', label: '🟣 Lomba' },
          { key: 'Rapor', label: '🟢 Rapor' }
        ].map(cat => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            style={{
              padding: '6px 12px',
              borderRadius: 20,
              fontSize: 11.5,
              fontWeight: 700,
              border: selectedCategory === cat.key ? 'none' : '1px solid #e2e8f0',
              background: selectedCategory === cat.key ? '#0066ff' : '#ffffff',
              color: selectedCategory === cat.key ? '#ffffff' : '#64748b',
              whiteSpace: 'nowrap',
              cursor: 'pointer'
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* INTERACTIVE CALENDAR MONTHLY GRID */}
      <div style={{
        background: '#ffffff',
        borderRadius: 20,
        padding: '16px 14px',
        boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
        border: '1px solid #e2e8f0',
        marginBottom: 16
      }}>
        {/* DAY NAMES */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: 10 }}>
          {days.map((d, i) => (
            <div key={d} style={{ fontSize: 11.5, fontWeight: 800, color: i === 0 ? '#ef4444' : '#64748b' }}>
              {d}
            </div>
          ))}
        </div>

        {/* CALENDAR CELLS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 5 }}>
          {/* Empty cells before first day of month */}
          {Array.from({ length: firstDayIndex }).map((_, idx) => (
            <div key={`empty-${idx}`} style={{ minHeight: 44, background: 'transparent' }} />
          ))}

          {/* Days of current month */}
          {Array.from({ length: totalDays }).map((_, idx) => {
            const dayNum = idx + 1;
            const dayEvents = getEventsForDay(dayNum);
            const hasEvents = dayEvents.length > 0;
            const isSelected = selectedDayNumber === dayNum;
            const dayOfWeek = (firstDayIndex + idx) % 7;
            const isSunday = dayOfWeek === 0;

            // Check if any event is Libur
            const isHoliday = dayEvents.some(e => (e.kategori || '').toLowerCase().includes('libur'));

            return (
              <div
                key={dayNum}
                onClick={() => handleDayClick(dayNum, dayEvents)}
                style={{
                  minHeight: 46,
                  borderRadius: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  border: isSelected ? '2px solid #0066ff' : '1px solid transparent',
                  background: isSelected
                    ? '#eff6ff'
                    : isHoliday
                    ? '#fef2f2'
                    : hasEvents
                    ? '#f0fdf4'
                    : 'transparent',
                  transition: 'all 0.15s ease'
                }}
              >
                <span style={{
                  fontSize: 13,
                  fontWeight: hasEvents || isSunday ? 800 : 600,
                  color: isHoliday || isSunday ? '#ef4444' : '#0f172a'
                }}>
                  {dayNum}
                </span>

                {/* EVENT DOTS */}
                {hasEvents && (
                  <div style={{ display: 'flex', gap: 2, marginTop: 2 }}>
                    {dayEvents.slice(0, 3).map((e, eIdx) => (
                      <span
                        key={eIdx}
                        style={{
                          width: 5,
                          height: 5,
                          borderRadius: '50%',
                          background: e.warna || '#0066ff'
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SELECTED DATE DETAILS POPUP / BANNER */}
      {selectedDayNumber && (
        <div style={{
          background: '#f8fafc',
          border: '1.5px solid #0066ff',
          borderRadius: 16,
          padding: '14px 16px',
          marginBottom: 16,
          animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>
              📅 Agenda {selectedDayNumber} {months[currentMonth]} {currentYear}
            </span>
            <button
              onClick={() => { setSelectedDayNumber(null); setSelectedDateEvents(null); }}
              style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 11, cursor: 'pointer', fontWeight: 700 }}
            >
              Tutup ✕
            </button>
          </div>

          {selectedDateEvents && selectedDateEvents.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {selectedDateEvents.map(e => (
                <div key={e.id} style={{ background: '#ffffff', borderRadius: 12, padding: '10px 12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <div style={{ fontWeight: 800, fontSize: 13, color: '#0f172a' }}>{e.nama_kegiatan}</div>
                    {getCategoryBadge(e.kategori, e.warna)}
                  </div>
                  {e.keterangan && (
                    <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>{e.keterangan}</div>
                  )}
                  <div style={{ fontSize: 10.5, color: '#0066ff', fontWeight: 700, marginTop: 4 }}>
                    Periode: {new Date(e.tanggal_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    {e.tanggal_selesai && e.tanggal_selesai !== e.tanggal_mulai && ` s/d ${new Date(e.tanggal_selesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 12, color: '#64748b' }}>
              Tidak ada agenda khusus pada tanggal ini (Kegiatan Belajar Mengajar Efektif).
            </div>
          )}
        </div>
      )}

      {/* LIST OF AGENDA THIS MONTH */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, padding: '0 4px' }}>
          <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Daftar Agenda {months[currentMonth]} {currentYear}
          </h4>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>
            {events.length} Kegiatan
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: '#64748b', fontSize: 12 }}>
            Memuat kalender kegiatan...
          </div>
        ) : events.length === 0 ? (
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: '20px',
            textAlign: 'center',
            color: '#64748b',
            border: '1px solid #e2e8f0',
            fontSize: 12.5
          }}>
            Tidak ada agenda khusus pada bulan {months[currentMonth]} {currentYear}.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {events.map((e) => (
              <div
                key={e.id}
                style={{
                  background: '#ffffff',
                  borderRadius: 16,
                  padding: '12px 14px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12
                }}
              >
                {/* DATE BADGE */}
                <div style={{
                  background: 'linear-gradient(135deg, #0066ff, #0052cc)',
                  color: '#ffffff',
                  borderRadius: 12,
                  minWidth: 48,
                  padding: '6px 0',
                  textAlign: 'center',
                  flexShrink: 0
                }}>
                  <div style={{ fontSize: 16, fontWeight: 800, lineHeight: 1 }}>
                    {new Date(e.tanggal_mulai).getDate()}
                  </div>
                  <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', marginTop: 2 }}>
                    {months[new Date(e.tanggal_mulai).getMonth()].slice(0, 3)}
                  </div>
                </div>

                {/* DETAILS */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', lineHeight: 1.35 }}>
                      {e.nama_kegiatan}
                    </div>
                    {getCategoryBadge(e.kategori, e.warna)}
                  </div>

                  {e.keterangan && (
                    <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 4, lineHeight: 1.4 }}>
                      {e.keterangan}
                    </div>
                  )}

                  <div style={{ fontSize: 10.5, color: '#94a3b8', marginTop: 6, fontWeight: 600 }}>
                    {new Date(e.tanggal_mulai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    {e.tanggal_selesai && e.tanggal_selesai !== e.tanggal_mulai && (
                      ` s/d ${new Date(e.tanggal_selesai).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
