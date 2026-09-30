import React, { useState, useEffect } from 'react';
import {
  Users, Search, RefreshCw, Phone, MapPin, Calendar,
  Award, GraduationCap, Briefcase, ChevronRight, X, Heart, Cake
} from 'lucide-react';
import api from '../api/client';
import SearchableSelect from '../components/SearchableSelect';

export default function GuruView({ showToast }) {
  const [guruList, setGuruList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKepegawaian, setSelectedKepegawaian] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [selectedGuru, setSelectedGuru] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/guru');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setGuruList(res.data.data);
      } else {
        setGuruList([]);
      }
    } catch (err) {
      console.error('Error fetching guru:', err);
      setGuruList([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredGuru = guruList
    .filter(g => {
      const matchSearch =
        (g.nama_guru || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (g.nip_nuptk || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (g.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (g.no_hp || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (g.alamat || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchKepegawaian =
        selectedKepegawaian === 'ALL' ||
        (g.status_kepegawaian || '').toLowerCase() === selectedKepegawaian.toLowerCase();

      return matchSearch && matchKepegawaian;
    })
    .sort((a, b) => (a.nama_guru || '').localeCompare(b.nama_guru || '', 'id', { sensitivity: 'base' }));

  const totalPNS = filteredGuru.filter(g => (g.status_kepegawaian || '').toUpperCase() === 'PNS').length;
  const totalPPPK = filteredGuru.filter(g => (g.status_kepegawaian || '').toUpperCase() === 'PPPK').length;
  const totalHonorer = filteredGuru.filter(g => !['PNS', 'PPPK'].includes((g.status_kepegawaian || '').toUpperCase())).length;

  const formatDateIndo = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(d);
    } catch (e) {
      return dateStr;
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return null;
    try {
      const birthYear = new Date(dob).getFullYear();
      const currentYear = new Date().getFullYear();
      const diff = currentYear - birthYear;
      return diff > 0 ? `${diff} Tahun` : null;
    } catch (e) {
      return null;
    }
  };

  return (
    <div className="inner-page-wrapper" style={{ paddingBottom: 36, paddingTop: 4 }}>
      {/* STATS OVERVIEW CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 18 }}>
        <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: '#64748b', fontWeight: 700 }}>TOTAL GURU</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#0066ff', marginTop: 2 }}>{filteredGuru.length}</div>
        </div>

        <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: '#059669', fontWeight: 700 }}>PNS</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#059669', marginTop: 2 }}>{totalPNS}</div>
        </div>

        <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: '#2563eb', fontWeight: 700 }}>PPPK</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#2563eb', marginTop: 2 }}>{totalPPPK}</div>
        </div>

        <div style={{ background: '#ffffff', padding: '10px 12px', borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.03)', textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: '#d97706', fontWeight: 700 }}>HONORER / GTT</div>
          <div style={{ fontSize: 20, fontWeight: 900, color: '#d97706', marginTop: 2 }}>{totalHonorer}</div>
        </div>
      </div>

      {/* SEARCH & FILTER CONTROLS */}
      <div style={{ background: '#ffffff', padding: 14, borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)', marginBottom: 18 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ position: 'relative', width: '100%' }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Cari nama guru, NIP/NUPTK, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px 10px 40px',
                borderRadius: 12,
                border: '1px solid #cbd5e1',
                fontSize: 13,
                outline: 'none',
                background: '#f8fafc',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <SearchableSelect
                options={[
                  { value: 'ALL', label: 'Semua Status Kepegawaian' },
                  { value: 'PNS', label: 'PNS' },
                  { value: 'PPPK', label: 'PPPK' },
                  { value: 'Guru Tetap Yayasan', label: 'Guru Tetap Yayasan' },
                  { value: 'Honorer', label: 'Honorer / GTT' }
                ]}
                value={selectedKepegawaian}
                onChange={(e) => setSelectedKepegawaian(e.target.value)}
                placeholder="Pilih Status Kepegawaian"
              />
            </div>
            <button
              onClick={fetchData}
              style={{
                background: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: 12,
                padding: '9px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                color: '#475569',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* TEACHER LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#0066ff', fontWeight: 600 }}>
            Memuat data guru...
          </div>
        ) : filteredGuru.length === 0 ? (
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            border: '1px solid #e2e8f0',
            textAlign: 'center',
            padding: '40px 20px',
            color: '#64748b'
          }}>
            <Users size={44} style={{ opacity: 0.3, margin: '0 auto 8px', color: '#0066ff' }} />
            <div style={{ fontWeight: 800, fontSize: 14, color: '#0f172a' }}>Tidak Ada Data Guru</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
              Tidak ditemukan data guru yang sesuai dengan pencarian Anda.
            </div>
          </div>
        ) : (
          filteredGuru.map((guru) => {
            const isPNS = (guru.status_kepegawaian || '').toUpperCase() === 'PNS';
            const isPPPK = (guru.status_kepegawaian || '').toUpperCase() === 'PPPK';
            const badgeBg = isPNS ? '#ecfdf5' : isPPPK ? '#eff6ff' : '#fffbeb';
            const badgeCol = isPNS ? '#059669' : isPPPK ? '#2563eb' : '#d97706';
            const badgeBorder = isPNS ? '#a7f3d0' : isPPPK ? '#bfdbfe' : '#fde68a';

            return (
              <div
                key={guru.kode_guru}
                onClick={() => setSelectedGuru(guru)}
                style={{
                  background: '#ffffff',
                  borderRadius: 16,
                  padding: '14px 16px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: (guru.jk || '').toUpperCase() === 'P'
                      ? 'linear-gradient(135deg, #f43f5e, #be185d)'
                      : 'linear-gradient(135deg, #0066ff, #0284c7)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: 16,
                    flexShrink: 0
                  }}>
                    {(guru.nama_guru || 'G').charAt(0).toUpperCase()}
                  </div>

                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14, color: '#0f172a' }}>
                      {guru.nama_guru}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                      <span>NIP: {guru.nip_nuptk || '-'}</span>
                      <span>•</span>
                      <span style={{
                        background: badgeBg,
                        color: badgeCol,
                        border: `1px solid ${badgeBorder}`,
                        padding: '1px 6px',
                        borderRadius: 6,
                        fontWeight: 700,
                        fontSize: 10
                      }}>
                        {guru.status_kepegawaian || 'Guru'}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button
                    type="button"
                    style={{
                      background: '#f1f5f9',
                      border: 'none',
                      borderRadius: 10,
                      padding: '6px 10px',
                      color: '#0066ff',
                      fontSize: 11.5,
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      cursor: 'pointer'
                    }}
                  >
                    Detail <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DETAIL MODAL PROFIL GURU LENGKAP */}
      {selectedGuru && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999999,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
          onClick={() => setSelectedGuru(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 440,
              background: '#ffffff',
              borderRadius: 24,
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0,0,0,0.2)',
              position: 'relative',
              animation: 'slideUp 0.25s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* MODAL HEADER WITH ACCENT BANNER */}
            <div style={{
              background: 'linear-gradient(135deg, #0066ff, #0284c7)',
              padding: '24px 20px 20px',
              color: '#ffffff',
              position: 'relative'
            }}>
              <button
                onClick={() => setSelectedGuru(null)}
                style={{
                  position: 'absolute',
                  top: 14,
                  right: 14,
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 30,
                  height: 30,
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 58,
                  height: 58,
                  borderRadius: '50%',
                  background: '#ffffff',
                  color: '#0066ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: 24,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}>
                  {(selectedGuru.nama_guru || 'G').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 900, lineHeight: 1.2 }}>
                    {selectedGuru.nama_guru}
                  </h3>
                  <div style={{ fontSize: 12, opacity: 0.9, marginTop: 4 }}>
                    NIP / NUPTK: {selectedGuru.nip_nuptk || '-'}
                  </div>
                </div>
              </div>
            </div>

            {/* MODAL BODY WITH COMPREHENSIVE TEACHER DETAILS */}
            <div style={{ padding: '20px', maxHeight: '68vh', overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b' }}>STATUS KEPEGAWAIAN</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#0066ff', marginTop: 2 }}>
                    {selectedGuru.status_kepegawaian || 'PNS'}
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: 12, border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b' }}>PENDIDIKAN TERAKHIR</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#059669', marginTop: 2 }}>
                    {selectedGuru.pendidikan_terakhir || 'S1 / Sarjana'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12.5 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#f8fafc', borderRadius: 12 }}>
                  <Calendar size={16} color="#0066ff" style={{ flexShrink: 0 }} />
                  <div>
                    <span style={{ color: '#64748b', fontSize: 11, display: 'block' }}>Tempat, Tanggal Lahir</span>
                    <strong style={{ color: '#0f172a' }}>
                      {selectedGuru.tempat_lahir ? `${selectedGuru.tempat_lahir}, ` : ''}{formatDateIndo(selectedGuru.tgl_lahir)}
                      {calculateAge(selectedGuru.tgl_lahir) ? ` (${calculateAge(selectedGuru.tgl_lahir)})` : ''}
                    </strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#f8fafc', borderRadius: 12 }}>
                  <Phone size={16} color="#16a34a" style={{ flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <span style={{ color: '#64748b', fontSize: 11, display: 'block' }}>Nomor WhatsApp / HP</span>
                    <strong style={{ color: '#0f172a' }}>{selectedGuru.no_hp || '-'}</strong>
                  </div>
                  {selectedGuru.no_hp && selectedGuru.no_hp !== '-' && (
                    <a
                      href={`https://wa.me/${selectedGuru.no_hp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        background: '#16a34a',
                        color: '#ffffff',
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '4px 10px',
                        borderRadius: 8,
                        textDecoration: 'none'
                      }}
                    >
                      Chat WA
                    </a>
                  )}
                </div>



                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', background: '#f8fafc', borderRadius: 12 }}>
                  <MapPin size={16} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <span style={{ color: '#64748b', fontSize: 11, display: 'block' }}>Alamat Tempat Tinggal</span>
                    <strong style={{ color: '#0f172a' }}>{selectedGuru.alamat || '-'}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#f8fafc', borderRadius: 12 }}>
                  <Briefcase size={16} color="#7c3aed" style={{ flexShrink: 0 }} />
                  <div>
                    <span style={{ color: '#64748b', fontSize: 11, display: 'block' }}>Agama & Jenis Kelamin</span>
                    <strong style={{ color: '#0f172a' }}>
                      {selectedGuru.agama || 'Islam'} • {(selectedGuru.jk || '').toUpperCase() === 'P' ? 'Perempuan (P)' : 'Laki-laki (L)'}
                    </strong>
                  </div>
                </div>
              </div>
            </div>

            {/* MODAL FOOTER */}
            <div style={{ padding: '12px 20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', textAlign: 'right' }}>
              <button
                type="button"
                onClick={() => setSelectedGuru(null)}
                style={{
                  background: '#0066ff',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 12,
                  padding: '8px 22px',
                  fontWeight: 800,
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
