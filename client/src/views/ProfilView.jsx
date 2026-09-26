import React, { useState, useEffect } from 'react';
import {
  User, Shield, Mail, Phone, Building, LogOut, CheckCircle2,
  Calendar, MapPin, GraduationCap, Briefcase, Hash, RefreshCw
} from 'lucide-react';
import api from '../api/client';

export default function ProfilView({ user, onLogout }) {
  const [profile, setProfile] = useState(user || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get('/auth/profile');
      if (res.data?.success && res.data.data) {
        setProfile(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const name = profile?.nama_guru || profile?.username || 'Pengguna E-Sekolah';
  const nip = profile?.nip_nuptk || profile?.nip || '-';
  const email = profile?.email || '-';
  const noHp = profile?.no_hp || profile?.telepon || '-';
  const role = (profile?.role || profile?.type || 'GURU').toUpperCase();
  const statusKepegawaian = profile?.status_kepegawaian || profile?.status || 'Aktif';
  const pendidikan = profile?.pendidikan_terakhir || '-';
  const alamat = profile?.alamat || '-';
  const tempatLahir = profile?.tempat_lahir || '';
  const tglLahir = profile?.tgl_lahir || '';
  const ttl = (tempatLahir || tglLahir) ? `${tempatLahir}${tempatLahir && tglLahir ? ', ' : ''}${tglLahir}` : '-';
  const jkText = profile?.jk === 'L' ? 'Laki-laki' : profile?.jk === 'P' ? 'Perempuan' : '-';

  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase();

  return (
    <div className="inner-page-wrapper" style={{ paddingBottom: 36, paddingTop: 4 }}>
      {/* USER PROFILE HERO CARD */}
      <div
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: 20,
          padding: 20,
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(0,0,0,0.03)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          marginBottom: 18,
          position: 'relative'
        }}
      >
        <button
          onClick={fetchProfile}
          title="Refresh Data Profil"
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            background: '#f1f5f9',
            border: 'none',
            borderRadius: 10,
            padding: '6px 10px',
            fontSize: 11,
            fontWeight: 700,
            color: '#0066ff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}
        >
          <RefreshCw size={12} /> Refresh
        </button>

        <div
          style={{
            width: 76,
            height: 76,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0052cc, #0072ff)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 26,
            fontWeight: 800,
            marginBottom: 12,
            boxShadow: '0 6px 18px rgba(0, 102, 255, 0.3)',
            border: '3px solid #ffffff'
          }}
        >
          {profile?.avatar ? (
            <img src={profile.avatar} alt={name} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            initials || 'ES'
          )}
        </div>

        <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', marginBottom: 2 }}>{name}</h3>
        <p style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>NIP / NUPTK: {nip}</p>

        <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              fontWeight: 800,
              color: '#0066ff',
              background: '#eff6ff',
              padding: '4px 12px',
              borderRadius: 20,
              border: '1px solid #bfdbfe'
            }}
          >
            <CheckCircle2 size={13} />
            {role}
          </span>

          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 11,
              fontWeight: 800,
              color: '#16a34a',
              background: '#f0fdf4',
              padding: '4px 12px',
              borderRadius: 20,
              border: '1px solid #bbf7d0'
            }}
          >
            {statusKepegawaian}
          </span>
        </div>
      </div>

      {/* INFORMASI AKUN & BIODATA DATABASE */}
      <div style={{ background: '#ffffff', borderRadius: 18, padding: 18, border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', marginBottom: 20 }}>
        <h4 style={{ fontSize: 12, fontWeight: 800, color: '#475569', marginBottom: 14, letterSpacing: '0.5px' }}>
          BIODATA & INFORMASI AKUN DATABASE
        </h4>

        {loading ? (
          <div style={{ textAlign: 'center', color: '#0066ff', padding: '20px', fontWeight: 600 }}>
            Memuat profil dari database...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* EMAIL */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0066ff', flexShrink: 0 }}>
                <Mail size={18} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700 }}>EMAIL RESMI</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{email}</div>
              </div>
            </div>

            {/* TELEPON */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0066ff', flexShrink: 0 }}>
                <Phone size={18} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700 }}>NO. TELEPON / WHATSAPP</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{noHp}</div>
              </div>
            </div>

            {/* JENIS KELAMIN */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0066ff', flexShrink: 0 }}>
                <User size={18} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700 }}>JENIS KELAMIN</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{jkText}</div>
              </div>
            </div>

            {/* PENDIDIKAN */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0066ff', flexShrink: 0 }}>
                <GraduationCap size={18} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700 }}>PENDIDIKAN TERAKHIR</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{pendidikan}</div>
              </div>
            </div>

            {/* TEMPAT TANGGAL LAHIR */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0066ff', flexShrink: 0 }}>
                <Calendar size={18} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700 }}>TEMPAT, TANGGAL LAHIR</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{ttl}</div>
              </div>
            </div>

            {/* ALAMAT */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0066ff', flexShrink: 0 }}>
                <MapPin size={18} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 700 }}>ALAMAT DOMISILI</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{alamat}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* LOGOUT BUTTON */}
      <button
        onClick={onLogout}
        style={{
          width: '100%',
          padding: '14px',
          borderRadius: 16,
          background: '#fef2f2',
          color: '#dc2626',
          border: '1px solid #fecaca',
          fontWeight: 800,
          fontSize: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          cursor: 'pointer',
          transition: 'all 0.15s ease'
        }}
      >
        <LogOut size={18} />
        Keluar dari Aplikasi (Logout)
      </button>
    </div>
  );
}
