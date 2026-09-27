import React, { useState, useEffect } from 'react';
import {
  Users, GraduationCap, Building2, BookOpen, Fingerprint,
  Calendar, ArrowUpRight, CheckCircle2, Clock, FileBarChart,
  UserCheck, AlertTriangle, ShieldCheck
} from 'lucide-react';
import api from '../../api/client';

export default function AdminDashboardTab({ onSwitchTab }) {
  const [summary, setSummary] = useState({
    total_guru: 0,
    total_siswa: 0,
    total_kelas: 0,
    total_mapel: 0,
    total_presensi_hari_ini: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentPresensi, setRecentPresensi] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [sumRes, guruRes, siswaRes, kelasRes, mapelRes, presensiRes] = await Promise.all([
        api.get('/dashboard/summary').catch(() => ({ data: { success: false } })),
        api.get('/guru').catch(() => ({ data: { success: false } })),
        api.get('/siswa').catch(() => ({ data: { success: false } })),
        api.get('/kelas').catch(() => ({ data: { success: false } })),
        api.get('/mapel').catch(() => ({ data: { success: false } })),
        api.get('/presensi/history?limit=7').catch(() => ({ data: { success: false } }))
      ]);

      const gCount = guruRes.data?.data?.length || 0;
      const sCount = siswaRes.data?.data?.length || 0;
      const kCount = kelasRes.data?.data?.length || 0;
      const mCount = mapelRes.data?.data?.length || 0;
      const pCount = sumRes.data?.data?.total_presensi_hari_ini || 0;

      setSummary({
        total_guru: gCount || sumRes.data?.data?.total_guru || 0,
        total_siswa: sCount || 0,
        total_kelas: kCount || sumRes.data?.data?.total_kelas || 0,
        total_mapel: mCount || sumRes.data?.data?.total_mapel || 0,
        total_presensi_hari_ini: pCount
      });

      if (presensiRes.data?.success && Array.isArray(presensiRes.data.data)) {
        setRecentPresensi(presensiRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching admin dashboard summary:', err);
    } finally {
      setLoading(false);
    }
  };

  const todayDate = new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  return (
    <div>
      {/* WELCOME BANNER */}
      <div style={{
        background: 'linear-gradient(135deg, #0052cc 0%, #0066ff 50%, #00d2ff 100%)',
        padding: '24px 28px',
        borderRadius: '20px',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '26px',
        boxShadow: '0 10px 28px rgba(0, 102, 255, 0.22)'
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
            <ShieldCheck size={14} /> PANEL ADMINISTRATOR RESMI
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: '2px 0 6px' }}>Selamat Datang di Pusat Kontrol E-Sekolah</h2>
          <p style={{ fontSize: 13, opacity: 0.9, maxWidth: 620, lineHeight: 1.5, margin: 0 }}>
            Kelola data master guru, siswa, kelas, mata pelajaran, serta pantau rekaman presensi harian seluruh sekolah secara terintegrasi.
          </p>
        </div>
        <div style={{ textAlign: 'right', background: 'rgba(255,255,255,0.15)', padding: '12px 18px', borderRadius: 14, backdropFilter: 'blur(4px)' }}>
          <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.85 }}>TANGGAL HARI INI</div>
          <div style={{ fontSize: 14, fontWeight: 800, marginTop: 2 }}>{todayDate}</div>
        </div>
      </div>

      {/* 4 PRIMARY STAT CARDS */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card" onClick={() => onSwitchTab('guru')} style={{ cursor: 'pointer' }}>
          <div>
            <div className="stat-label">TOTAL GURU & STAFF</div>
            <div className="stat-value">{summary.total_guru}</div>
            <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 700, marginTop: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
              <ArrowUpRight size={14} /> Data Aktif
            </div>
          </div>
          <div className="stat-icon-wrapper stat-icon-blue">
            <Users size={24} />
          </div>
        </div>

        <div className="admin-stat-card" onClick={() => onSwitchTab('siswa')} style={{ cursor: 'pointer' }}>
          <div>
            <div className="stat-label">TOTAL SISWA TERDAFTAR</div>
            <div className="stat-value">{summary.total_siswa}</div>
            <div style={{ fontSize: 11, color: '#2563eb', fontWeight: 700, marginTop: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
              <ArrowUpRight size={14} /> Semua Kelas
            </div>
          </div>
          <div className="stat-icon-wrapper stat-icon-emerald">
            <GraduationCap size={24} />
          </div>
        </div>

        <div className="admin-stat-card" onClick={() => onSwitchTab('kelas')} style={{ cursor: 'pointer' }}>
          <div>
            <div className="stat-label">TOTAL RUANG KELAS</div>
            <div className="stat-value">{summary.total_kelas}</div>
            <div style={{ fontSize: 11, color: '#d97706', fontWeight: 700, marginTop: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
              <ArrowUpRight size={14} /> Terintegrasi
            </div>
          </div>
          <div className="stat-icon-wrapper stat-icon-amber">
            <Building2 size={24} />
          </div>
        </div>

        <div className="admin-stat-card" onClick={() => onSwitchTab('mapel')} style={{ cursor: 'pointer' }}>
          <div>
            <div className="stat-label">MATA PELAJARAN</div>
            <div className="stat-value">{summary.total_mapel}</div>
            <div style={{ fontSize: 11, color: '#7c3aed', fontWeight: 700, marginTop: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
              <ArrowUpRight size={14} /> Kurikulum Aktif
            </div>
          </div>
          <div className="stat-icon-wrapper stat-icon-purple">
            <BookOpen size={24} />
          </div>
        </div>
      </div>

      {/* 2-COLUMN SECTION: QUICK ACTIONS & ATTENDANCE MONITOR */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 24 }}>
        {/* QUICK SHORTCUTS */}
        <div className="admin-panel">
          <div className="admin-panel-header">
            <div className="admin-panel-title">
              <CheckCircle2 size={18} color="#0066ff" /> Pintasan Cepat Administrasi
            </div>
            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Akses Langsung</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <button
              className="btn-outline-admin"
              onClick={() => onSwitchTab('guru')}
              style={{ padding: '14px', justifyContent: 'flex-start', background: '#f8fafc' }}
            >
              <Users size={20} color="#0066ff" />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 800, color: '#0f172a' }}>Kelola Data Guru</div>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>Tambah / edit tenaga pengajar</div>
              </div>
            </button>

            <button
              className="btn-outline-admin"
              onClick={() => onSwitchTab('siswa')}
              style={{ padding: '14px', justifyContent: 'flex-start', background: '#f8fafc' }}
            >
              <GraduationCap size={20} color="#16a34a" />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 800, color: '#0f172a' }}>Kelola Data Siswa</div>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>Direktori siswa & nomor induk</div>
              </div>
            </button>

            <button
              className="btn-outline-admin"
              onClick={() => onSwitchTab('rekap')}
              style={{ padding: '14px', justifyContent: 'flex-start', background: '#f8fafc' }}
            >
              <FileBarChart size={20} color="#d97706" />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 800, color: '#0f172a' }}>Laporan & Rekap</div>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>Cetak presensi guru & siswa</div>
              </div>
            </button>

            <button
              className="btn-outline-admin"
              onClick={() => onSwitchTab('users')}
              style={{ padding: '14px', justifyContent: 'flex-start', background: '#f8fafc' }}
            >
              <ShieldCheck size={20} color="#7c3aed" />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 800, color: '#0f172a' }}>Akun Admin / User</div>
                <div style={{ fontSize: 11, color: '#64748b', fontWeight: 500 }}>Kelola hak akses operator</div>
              </div>
            </button>
          </div>
        </div>

        {/* SYSTEM STATUS */}
        <div className="admin-panel">
          <div className="admin-panel-header">
            <div className="admin-panel-title">
              <Clock size={18} color="#16a34a" /> Status Server & Sistem
            </div>
            <span className="status-badge-active">Online</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#f8fafc', borderRadius: 10, fontSize: 12 }}>
              <span style={{ color: '#64748b', fontWeight: 600 }}>Status Database</span>
              <span style={{ fontWeight: 800, color: '#16a34a' }}>MySQL Terhubung</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#f8fafc', borderRadius: 10, fontSize: 12 }}>
              <span style={{ color: '#64748b', fontWeight: 600 }}>Tipe Autentikasi</span>
              <span style={{ fontWeight: 800, color: '#0f172a' }}>Tabel `users` (Admin)</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#f8fafc', borderRadius: 10, fontSize: 12 }}>
              <span style={{ color: '#64748b', fontWeight: 600 }}>Versi Sistem</span>
              <span style={{ fontWeight: 800, color: '#0066ff' }}>E-Sekolah PRO v2.6.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
