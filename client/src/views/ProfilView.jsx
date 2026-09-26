import React from 'react';
import { User, Shield, Mail, Phone, Building, LogOut, CheckCircle2 } from 'lucide-react';

export default function ProfilView({ user, onLogout }) {
  const rawName = user?.nama_guru || user?.username || 'Citra Dewi, S.Pd.';
  
  const getCleanName = (name) => {
    if (!name) return 'Citra Dewi, S.Pd.';
    let clean = name.split(',')[0].trim();
    if (clean.startsWith('Pak') || clean.startsWith('Bu') || clean.startsWith('Guru')) {
      return clean;
    }
    const parts = clean.split(' ').filter(Boolean);
    if (parts.length > 2) {
      clean = parts.slice(0, 2).join(' ');
    }
    return `Bu ${clean}`;
  };

  const displayName = getCleanName(rawName);

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
          marginBottom: 18
        }}
      >
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
            fontSize: 28,
            fontWeight: 800,
            marginBottom: 12,
            boxShadow: '0 6px 18px rgba(0, 102, 255, 0.3)',
            border: '3px solid #ffffff'
          }}
        >
          {user?.avatar ? <img src={user.avatar} alt={displayName} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : 'BC'}
        </div>

        <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', marginBottom: 2 }}>{displayName}</h3>
        <p style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>NIP/NIPK: 19850412 201001 2 015</p>

        <span
          style={{
            marginTop: 8,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            fontSize: 11,
            fontWeight: 700,
            color: '#0066ff',
            background: '#eff6ff',
            padding: '4px 12px',
            borderRadius: 20,
            border: '1px solid #bfdbfe'
          }}
        >
          <CheckCircle2 size={13} />
          {user?.role ? user.role.toUpperCase() : 'GURU PENGELOLA'}
        </span>
      </div>

      {/* INFORMASI AKUN & SEKOLAH */}
      <div style={{ background: '#ffffff', borderRadius: 18, padding: 16, border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.02)', marginBottom: 20 }}>
        <h4 style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', marginBottom: 12, letterSpacing: '0.2px' }}>
          INFORMASI AKUN & SEKOLAH
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0066ff' }}>
              <Building size={18} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>INSTANSI / SEKOLAH</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>SMK Negeri 1 E-Sekolah</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0066ff' }}>
              <Mail size={18} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>EMAIL RESMI</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>guru.citra@esekolah.sch.id</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0066ff' }}>
              <Phone size={18} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>NO. TELEPON / WHATSAPP</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>+62 812-3456-7890</div>
            </div>
          </div>
        </div>
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
