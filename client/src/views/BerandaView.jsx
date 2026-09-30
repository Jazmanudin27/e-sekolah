import React, { useState, useEffect } from 'react';
import {
  CheckSquare, Building2, FileText, Clock, Fingerprint,
  Users, GraduationCap, History, UserCheck, BookOpen,
  FileBarChart, PieChart, Award, Calendar, X, AlertCircle, CheckCircle2
} from 'lucide-react';
import api from '../api/client';
import TopBar from '../components/TopBar';
import PengumumanSlider from '../components/PengumumanSlider';

export default function BerandaView({ user, onLogout, onOpenPresensiModal, onSwitchTab }) {
  const isClassAccount = user?.type === 'Kelas' || user?.role === 'Kelas';
  const [todayStatus, setTodayStatus] = useState(null);
  const [historyItems, setHistoryItems] = useState([]);
  const [izinItems, setIzinItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    if (!isClassAccount) {
      fetchTodayStatus();
      fetchHistory();
      fetchIzin();
    }
  }, [isClassAccount]);

  const fetchTodayStatus = async () => {
    try {
      const res = await api.get('/presensi/today');
      if (res.data.success) {
        setTodayStatus(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await api.get('/presensi/history?limit=30');
      if (res.data.success) {
        setHistoryItems(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchIzin = async () => {
    try {
      const res = await api.get('/izin');
      if (res.data.success && Array.isArray(res.data.data)) {
        setIzinItems(res.data.data);
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const isCheckInDisabled = todayStatus?.status === 'CHECKIN' || todayStatus?.status === 'CHECKOUT';
  const isCheckOutDisabled = todayStatus?.status === 'BELUM_CHECKIN' || todayStatus?.status === 'CHECKOUT';

  // Categorize lists
  const hadirList = historyItems.filter(h => h.jam_in);
  const sakitList = izinItems.filter(i => (i.jenis || i.jenis_izin || '').toLowerCase() === 'sakit');
  const izinList = izinItems.filter(i => (i.jenis || i.jenis_izin || '').toLowerCase() === 'izin');
  const cutiList = izinItems.filter(i => (i.jenis || i.jenis_izin || '').toLowerCase() === 'cuti');

  const defaultHistoryCards = [
    { date: 'Friday, 25 September 2026', time: '06:23:35 - 15:08:46' },
    { date: 'Thursday, 24 September 2026', time: '06:19:20 - 15:00:12' },
    { date: 'Wednesday, 23 September 2026', time: '06:20:05 - 15:05:40' },
    { date: 'Tuesday, 22 September 2026', time: '06:17:42 - 15:10:00' },
    { date: 'Monday, 21 September 2026', time: '06:25:10 - 15:02:18' },
  ];

  const formatFullDate = (dateStr) => {
    if (!dateStr) return 'Hari ini';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
      const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      const dayName = days[d.getDay()];
      const dateNum = d.getDate();
      const monthName = months[d.getMonth()];
      const year = d.getFullYear();
      return `${dayName}, ${dateNum} ${monthName} ${year}`;
    } catch (e) {
      return dateStr;
    }
  };

  const renderTimeRange = (jamIn, jamOut) => {
    const inText = jamIn || 'Belum Scan';
    const outText = jamOut || 'Belum Scan';

    return (
      <div className="history-item-time">
        <span style={{ color: !jamIn ? '#dc2626' : '#0066ff', fontWeight: !jamIn ? 700 : 600 }}>
          {inText}
        </span>
        <span style={{ color: '#94a3b8', margin: '0 4px' }}>-</span>
        <span style={{ color: !jamOut ? '#dc2626' : '#0066ff', fontWeight: !jamOut ? 700 : 600 }}>
          {outText}
        </span>
      </div>
    );
  };

  // Get active list for modal
  const getModalList = () => {
    if (selectedCategory === 'Hadir') return hadirList;
    if (selectedCategory === 'Sakit') return sakitList;
    if (selectedCategory === 'Izin') return izinList;
    if (selectedCategory === 'Cuti') return cutiList;
    return [];
  };

  // ========================
  // BERANDA KHUSUS AKUN KELAS
  // ========================
  if (isClassAccount) {
    const className = user?.nama_kelas || 'Kelas';
    return (
      <div className="beranda-view-container">
        {/* HERO BLUE HEADER */}
        <TopBar user={user} onLogout={onLogout} />

        {/* WELCOME CARD KELAS */}
        <div className="summary-overlap-card">
          <div style={{ textAlign: 'center', padding: '6px 0 2px 0' }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#64748b', marginBottom: 4 }}>
              🏫 Dashboard Kelas
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a' }}>
              {className}
            </div>
            {user?.jurusan && user.jurusan !== '-' && (
              <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginTop: 2 }}>
                {user.jurusan}
              </div>
            )}
          </div>
        </div>

        {/* MENU GRID KHUSUS KELAS (3 menu: Absen Siswa, Jadwal, & Rekap Siswa) */}
        <div className="grid-8-menu-wrapper">
          <div className="grid-8-menu" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <button className="menu-blue-card" onClick={() => onSwitchTab('absensiSiswa')}>
              <div className="menu-icon-circle">
                <UserCheck size={22} />
              </div>
              <span>Absen Siswa</span>
            </button>

            <button className="menu-blue-card" onClick={() => onSwitchTab('jadwal')}>
              <div className="menu-icon-circle">
                <Calendar size={22} />
              </div>
              <span>Jadwal</span>
            </button>

            <button className="menu-blue-card" onClick={() => onSwitchTab('rekapSiswa')}>
              <div className="menu-icon-circle">
                <FileBarChart size={22} />
              </div>
              <span>Rekap Siswa</span>
            </button>
          </div>
        </div>

        {/* PENGUMUMAN SLIDER BANNER */}
        <div style={{ padding: '0 16px', margin: '14px 0 20px 0' }}>
          <PengumumanSlider />
        </div>

        {/* INFO BOX */}
        <div style={{
          margin: '0 16px 20px',
          padding: '14px 16px',
          borderRadius: 14,
          background: '#eff6ff',
          border: '1px solid #bfdbfe',
          color: '#1e40af',
          fontSize: 13,
          fontWeight: 600,
          lineHeight: 1.6
        }}>
          <div style={{ fontWeight: 800, marginBottom: 4 }}>ℹ️ Informasi Akun Kelas</div>
          Anda login sebagai <strong>{className}</strong>. Akses terbatas pada menu absensi dan rekap siswa untuk kelas ini saja.
        </div>
      </div>
    );
  }

  // ========================
  // BERANDA GURU / ADMIN (ORIGINAL)
  // ========================
  return (
    <div className="beranda-view-container">

      {/* HERO BLUE HEADER */}
      <TopBar user={user} onLogout={onLogout} />

      {/* 1. FLOATING OVERLAPPING SUMMARY CARD (4 VERTICAL ICON COLUMNS) */}
      <div className="summary-overlap-card">
        <div className="summary-grid-4">

          <div
            className="summary-col-item"
            onClick={() => setSelectedCategory('Hadir')}
            style={{ cursor: 'pointer' }}
          >
            <div className="summary-icon-box box-green">
              <CheckSquare size={26} color="#ffffff" strokeWidth={2.4} />
              {hadirList.length > 0 && <span className="box-notify-badge">{hadirList.length}</span>}
            </div>
            <span className="summary-col-label">Hadir</span>
          </div>

          <div
            className="summary-col-item"
            onClick={() => setSelectedCategory('Sakit')}
            style={{ cursor: 'pointer' }}
          >
            <div className="summary-icon-box box-red">
              <Building2 size={26} color="#ffffff" strokeWidth={2.2} />
              {sakitList.length > 0 && <span className="box-notify-badge" style={{ background: '#ef4444' }}>{sakitList.length}</span>}
            </div>
            <span className="summary-col-label">Sakit</span>
          </div>

          <div
            className="summary-col-item"
            onClick={() => setSelectedCategory('Izin')}
            style={{ cursor: 'pointer' }}
          >
            <div className="summary-icon-box box-amber">
              <FileText size={26} color="#ffffff" strokeWidth={2.2} />
              {izinList.length > 0 && <span className="box-notify-badge" style={{ background: '#f59e0b' }}>{izinList.length}</span>}
            </div>
            <span className="summary-col-label">Izin</span>
          </div>

          <div
            className="summary-col-item"
            onClick={() => setSelectedCategory('Cuti')}
            style={{ cursor: 'pointer' }}
          >
            <div className="summary-icon-box box-teal">
              <Clock size={26} color="#ffffff" strokeWidth={2.2} />
              {cutiList.length > 0 && <span className="box-notify-badge" style={{ background: '#0d9488' }}>{cutiList.length}</span>}
            </div>
            <span className="summary-col-label">Cuti</span>
          </div>

          <button className="menu-blue-card" onClick={() => onSwitchTab('rekapGuru')}>
            <div className="menu-icon-circle">
              <Award size={22} />
            </div>
            <span>Rekap Guru</span>
          </button>
        </div>
      </div>

      {/* PENGUMUMAN SLIDER BANNER */}
      <div style={{ padding: '0 16px', margin: '14px 0 20px 0' }}>
        <PengumumanSlider />
      </div>

      {/* 4. HISTORI ABSENSI 5 HARI TERAKHIR */}
      <div className="history-section-wrapper">
        <div className="section-header-row">
          <h3 className="section-title-bold">Histori Absensi 5 Hari Terakhir</h3>
          <button className="view-all-link" onClick={() => onSwitchTab('riwayat')}>View All</button>
        </div>

        {historyItems.length > 0 ? (
          historyItems.slice(0, 5).map((item, idx) => (
            <div key={item.id || idx} className="history-item-card">
              <div className="history-fingerprint-box">
                <Fingerprint size={20} color="#0066ff" />
              </div>
              <div className="history-item-content">
                <div className="history-item-date">{formatFullDate(item.tanggal || item.date)}</div>
                {renderTimeRange(item.jam_in, item.jam_out)}
              </div>
            </div>
          ))
        ) : (
          defaultHistoryCards.map((item, idx) => (
            <div key={idx} className="history-item-card">
              <div className="history-fingerprint-box">
                <Fingerprint size={24} color="#0066ff" />
              </div>
              <div className="history-item-content">
                <div className="history-item-date">{item.date}</div>
                {renderTimeRange(item.jam_in, item.jam_out)}
              </div>
            </div>
          ))
        )}
      </div>

      {/* DETAIL MODAL UNTUK CARD HADIR, SAKIT, IZIN, CUTI */}
      {selectedCategory && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          zIndex: 999999
        }}>
          <div style={{
            background: '#ffffff', borderTopLeftRadius: 24, borderTopRightRadius: 24,
            width: '100%', maxWidth: 500, maxHeight: '80vh', overflowY: 'auto',
            boxShadow: '0 -10px 25px rgba(0,0,0,0.15)', padding: '20px 18px 30px'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid #f1f5f9', pb: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  padding: 8, borderRadius: 10,
                  background: selectedCategory === 'Hadir' ? '#ecfdf5' : selectedCategory === 'Sakit' ? '#fef2f2' : selectedCategory === 'Izin' ? '#fffbeb' : '#f0fdf4',
                  color: selectedCategory === 'Hadir' ? '#059669' : selectedCategory === 'Sakit' ? '#dc2626' : selectedCategory === 'Izin' ? '#d97706' : '#0d9488'
                }}>
                  {selectedCategory === 'Hadir' && <CheckSquare size={22} />}
                  {selectedCategory === 'Sakit' && <Building2 size={22} />}
                  {selectedCategory === 'Izin' && <FileText size={22} />}
                  {selectedCategory === 'Cuti' && <Clock size={22} />}
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a' }}>Detail Status: {selectedCategory}</h3>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Total Data: {getModalList().length} Catatan</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedCategory(null)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              >
                <X size={18} color="#64748b" />
              </button>
            </div>

            {/* List Body */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {getModalList().length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 0', color: '#94a3b8', fontSize: 13 }}>
                  <AlertCircle size={32} color="#cbd5e1" style={{ marginBottom: 6 }} />
                  <div>Belum ada data untuk kategori <strong>{selectedCategory}</strong></div>
                </div>
              ) : (
                getModalList().map((item, idx) => (
                  <div
                    key={item.id || idx}
                    style={{
                      background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 14, padding: '12px 14px',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                        {item.nama_guru || item.nama_pengaju || user?.nama_guru || 'Guru'}
                      </div>
                      <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                        📅 {formatFullDate(item.tanggal_mulai || item.tanggal || item.date)}
                      </div>
                      {item.keterangan && (
                        <div style={{ fontSize: 11.5, color: '#475569', marginTop: 4, fontStyle: 'italic' }}>
                          "{item.keterangan}"
                        </div>
                      )}
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      {selectedCategory === 'Hadir' ? (
                        <div style={{ fontSize: 11.5, fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '4px 10px', borderRadius: 8, border: '1px solid #a7f3d0' }}>
                          {item.jam_in || 'Hadir'} {item.jam_out ? `- ${item.jam_out}` : ''}
                        </div>
                      ) : (
                        <div style={{
                          fontSize: 11.5, fontWeight: 700,
                          background: selectedCategory === 'Sakit' ? '#fef2f2' : selectedCategory === 'Izin' ? '#fffbeb' : '#f0fdf4',
                          color: selectedCategory === 'Sakit' ? '#dc2626' : selectedCategory === 'Izin' ? '#d97706' : '#0d9488',
                          border: `1px solid ${selectedCategory === 'Sakit' ? '#fecaca' : selectedCategory === 'Izin' ? '#fde68a' : '#99f6e4'}`,
                          padding: '4px 10px', borderRadius: 8
                        }}>
                          {item.status || selectedCategory}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
