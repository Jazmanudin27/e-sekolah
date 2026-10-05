import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  Box,
  Layers,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  MapPin,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Compass,
  Check,
  Trees,
  Dumbbell,
  Laptop,
  X
} from 'lucide-react';
import api from '../api/client';

export default function SaprasView({ user, showToast }) {
  const [activeSubTab, setActiveSubTab] = useState('fasilitas'); // 'fasilitas' | 'sarana' | 'tanah'
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    fasilitas: [],
    sarana: [],
    tanah: [],
    stats: {
      totalFasilitas: 0,
      totalUnitFasilitas: 0,
      fasilitasKondisi: { baik: 0, cukupBaik: 0, cukup: 0, rusak: 0 },
      totalJenisSarana: 0,
      totalUnitSarana: 0,
      totalBaikSarana: 0,
      totalRusakSarana: 0,
      totalLuasTanah: 0
    }
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterKondisi, setFilterKondisi] = useState('ALL');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/sapras/summary');
      if (res.data?.success && res.data?.data) {
        setData(res.data.data);
      }
    } catch (err) {
      console.warn('Gagal load sapras dari API, menggunakan data offline fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered lists
  const filteredFasilitas = useMemo(() => {
    return (data.fasilitas || []).filter(item => {
      const matchSearch = (item.fasilitas || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchKondisi =
        filterKondisi === 'ALL' ||
        (item.keterangan || '').toUpperCase() === filterKondisi.toUpperCase();
      return matchSearch && matchKondisi;
    });
  }, [data.fasilitas, searchTerm, filterKondisi]);

  const filteredSarana = useMemo(() => {
    return (data.sarana || []).filter(item => {
      const matchSearch = (item.jenis_sapras || '').toLowerCase().includes(searchTerm.toLowerCase());
      if (filterKondisi === 'RUSAK') {
        return matchSearch && (parseInt(item.rusak, 10) || 0) > 0;
      }
      if (filterKondisi === 'BAIK') {
        return matchSearch && (parseInt(item.baik, 10) || 0) > 0;
      }
      return matchSearch;
    });
  }, [data.sarana, searchTerm, filterKondisi]);

  const filteredTanah = useMemo(() => {
    return (data.tanah || []).filter(item => {
      return (item.penggunaan_tanah || '').toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [data.tanah, searchTerm]);

  // Helper status color badge
  const renderKondisiBadge = (keterangan) => {
    const ket = (keterangan || '').toUpperCase();
    if (ket === 'BAIK') {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '3px 9px',
          borderRadius: 20,
          background: 'rgba(16, 185, 129, 0.12)',
          color: '#059669',
          fontSize: 11,
          fontWeight: 800,
          border: '1px solid rgba(16, 185, 129, 0.25)'
        }}>
          <CheckCircle2 size={12} strokeWidth={2.5} />
          BAIK
        </span>
      );
    }
    if (ket === 'CUKUP BAIK') {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '3px 9px',
          borderRadius: 20,
          background: 'rgba(2, 132, 199, 0.12)',
          color: '#0284c7',
          fontSize: 11,
          fontWeight: 800,
          border: '1px solid rgba(2, 132, 199, 0.25)'
        }}>
          <CheckCircle2 size={12} strokeWidth={2.5} />
          CUKUP BAIK
        </span>
      );
    }
    if (ket === 'CUKUP') {
      return (
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          padding: '3px 9px',
          borderRadius: 20,
          background: 'rgba(245, 158, 11, 0.14)',
          color: '#d97706',
          fontSize: 11,
          fontWeight: 800,
          border: '1px solid rgba(245, 158, 11, 0.3)'
        }}>
          <AlertTriangle size={12} strokeWidth={2.5} />
          CUKUP
        </span>
      );
    }
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '3px 9px',
        borderRadius: 20,
        background: 'rgba(239, 68, 68, 0.12)',
        color: '#dc2626',
        fontSize: 11,
        fontWeight: 800,
        border: '1px solid rgba(239, 68, 68, 0.25)'
      }}>
        <XCircle size={12} strokeWidth={2.5} />
        {ket || 'RUSAK'}
      </span>
    );
  };

  // Helper icon for facility names
  const getFasilitasIcon = (name) => {
    const n = (name || '').toUpperCase();
    if (n.includes('MESJID')) return { icon: Compass, bg: '#10b981', color: '#ffffff' };
    if (n.includes('LAB') || n.includes('KOMPUTER')) return { icon: Laptop, bg: '#8b5cf6', color: '#ffffff' };
    if (n.includes('AULA') || n.includes('COFI')) return { icon: Sparkles, bg: '#f59e0b', color: '#ffffff' };
    if (n.includes('WC')) return { icon: CheckCircle2, bg: '#06b6d4', color: '#ffffff' };
    if (n.includes('SECURITY')) return { icon: ShieldCheck, bg: '#64748b', color: '#ffffff' };
    return { icon: Building2, bg: '#0284c7', color: '#ffffff' };
  };

  return (
    <div className="sapras-view-container" style={{ padding: '12px 14px 90px', maxWidth: 680, margin: '0 auto' }}>

      {/* 1. HERO HEADER CARD WITH GLOW ACCENT */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #0284c7 100%)',
        borderRadius: 22,
        padding: '18px 18px 20px',
        color: '#ffffff',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 12px 28px rgba(2, 132, 199, 0.25)',
        marginBottom: 16
      }}>
        {/* Glow ambient background circle */}
        <div style={{
          position: 'absolute',
          top: -30,
          right: -30,
          width: 140,
          height: 140,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.12)',
          filter: 'blur(20px)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '3px 10px',
              borderRadius: 20,
              background: 'rgba(255, 255, 255, 0.16)',
              backdropFilter: 'blur(8px)',
              fontSize: 11,
              fontWeight: 700,
              marginBottom: 8,
              letterSpacing: 0.3
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
              DATA INVENTARIS RESMI
            </div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, letterSpacing: -0.4 }}>
              Sarana & Prasarana
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 12, opacity: 0.85, lineHeight: 1.4 }}>
              Laporan fasilitas fisik, sarana KBM, dan penggunaan lahan
            </p>
          </div>

          <button
            type="button"
            onClick={fetchData}
            title="Refresh Data"
            style={{
              border: 'none',
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(8px)',
              color: '#ffffff',
              width: 36,
              height: 36,
              borderRadius: 12,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* 2. STATS ROW IN HERO */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 8,
          marginTop: 16,
          position: 'relative',
          zIndex: 1
        }}>
          {/* Stat 1 */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.14)',
            backdropFilter: 'blur(10px)',
            borderRadius: 14,
            padding: '10px 10px',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.18)'
          }}>
            <div style={{ fontSize: 10.5, opacity: 0.9, fontWeight: 600 }}>Fasilitas</div>
            <div style={{ fontSize: 18, fontWeight: 900, marginTop: 2 }}>{data.fasilitas?.length || 25}</div>
            <div style={{ fontSize: 9.5, opacity: 0.8 }}>45 Unit Ruang</div>
          </div>

          {/* Stat 2 */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.14)',
            backdropFilter: 'blur(10px)',
            borderRadius: 14,
            padding: '10px 10px',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.18)'
          }}>
            <div style={{ fontSize: 10.5, opacity: 0.9, fontWeight: 600 }}>Sarana</div>
            <div style={{ fontSize: 18, fontWeight: 900, marginTop: 2 }}>{data.sarana?.length || 31}</div>
            <div style={{ fontSize: 9.5, opacity: 0.8 }}>494 Item Baik</div>
          </div>

          {/* Stat 3 */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.14)',
            backdropFilter: 'blur(10px)',
            borderRadius: 14,
            padding: '10px 10px',
            textAlign: 'center',
            border: '1px solid rgba(255, 255, 255, 0.18)'
          }}>
            <div style={{ fontSize: 10.5, opacity: 0.9, fontWeight: 600 }}>Luas Lahan</div>
            <div style={{ fontSize: 18, fontWeight: 900, marginTop: 2 }}>1.032</div>
            <div style={{ fontSize: 9.5, opacity: 0.8 }}>Meter Persegi</div>
          </div>
        </div>
      </div>

      {/* 3. SEGMENTED TABS (PILL BUTTONS) */}
      <div style={{
        display: 'flex',
        background: '#f1f5f9',
        padding: 4,
        borderRadius: 16,
        marginBottom: 14,
        gap: 4
      }}>
        <button
          type="button"
          onClick={() => { setActiveSubTab('fasilitas'); setFilterKondisi('ALL'); }}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '10px 8px',
            borderRadius: 12,
            border: 'none',
            background: activeSubTab === 'fasilitas' ? '#ffffff' : 'transparent',
            color: activeSubTab === 'fasilitas' ? '#0066ff' : '#64748b',
            fontWeight: activeSubTab === 'fasilitas' ? 800 : 600,
            fontSize: 12.5,
            boxShadow: activeSubTab === 'fasilitas' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <Building2 size={15} />
          <span>Fasilitas ({data.fasilitas?.length || 25})</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveSubTab('sarana'); setFilterKondisi('ALL'); }}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '10px 8px',
            borderRadius: 12,
            border: 'none',
            background: activeSubTab === 'sarana' ? '#ffffff' : 'transparent',
            color: activeSubTab === 'sarana' ? '#0066ff' : '#64748b',
            fontWeight: activeSubTab === 'sarana' ? 800 : 600,
            fontSize: 12.5,
            boxShadow: activeSubTab === 'sarana' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <Box size={15} />
          <span>Sarana ({data.sarana?.length || 31})</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveSubTab('tanah'); setFilterKondisi('ALL'); }}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            padding: '10px 8px',
            borderRadius: 12,
            border: 'none',
            background: activeSubTab === 'tanah' ? '#ffffff' : 'transparent',
            color: activeSubTab === 'tanah' ? '#0066ff' : '#64748b',
            fontWeight: activeSubTab === 'tanah' ? 800 : 600,
            fontSize: 12.5,
            boxShadow: activeSubTab === 'tanah' ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <Layers size={15} />
          <span>Lahan ({data.tanah?.length || 3})</span>
        </button>
      </div>

      {/* 4. SEARCH & FILTER CHIPS */}
      <div style={{ marginBottom: 14 }}>
        {/* Search Bar */}
        <div style={{ position: 'relative', marginBottom: 10 }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input
            type="text"
            placeholder={`Cari nama ${activeSubTab === 'fasilitas' ? 'ruangan' : activeSubTab === 'sarana' ? 'barang/sarana' : 'lahan'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '11px 36px 11px 40px',
              borderRadius: 16,
              border: '1.5px solid #e2e8f0',
              background: '#ffffff',
              fontSize: 13,
              fontWeight: 500,
              outline: 'none',
              boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
              boxSizing: 'border-box'
            }}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                border: 'none',
                background: '#e2e8f0',
                borderRadius: '50%',
                width: 20,
                height: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748b'
              }}
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Filter condition pills for Fasilitas */}
        {activeSubTab === 'fasilitas' && (
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2 }}>
            {[
              { id: 'ALL', label: 'Semua', count: data.fasilitas?.length || 25 },
              { id: 'BAIK', label: 'Baik', count: data.stats?.fasilitasKondisi?.baik || 14 },
              { id: 'CUKUP BAIK', label: 'Cukup Baik', count: data.stats?.fasilitasKondisi?.cukupBaik || 10 },
              { id: 'CUKUP', label: 'Cukup', count: data.stats?.fasilitasKondisi?.cukup || 1 }
            ].map(f => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterKondisi(f.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '6px 12px',
                  borderRadius: 20,
                  fontSize: 11.5,
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  border: '1px solid',
                  borderColor: filterKondisi === f.id ? '#0066ff' : '#e2e8f0',
                  background: filterKondisi === f.id ? '#0066ff' : '#ffffff',
                  color: filterKondisi === f.id ? '#ffffff' : '#64748b',
                  cursor: 'pointer',
                  boxShadow: filterKondisi === f.id ? '0 3px 10px rgba(0, 102, 255, 0.22)' : 'none',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{f.label}</span>
                <span style={{
                  padding: '1px 6px',
                  borderRadius: 10,
                  background: filterKondisi === f.id ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                  color: filterKondisi === f.id ? '#ffffff' : '#64748b',
                  fontSize: 10.5
                }}>
                  {f.count}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 5. CONTENT SECTION: CARDS PRESENTATION (MOBILE OPTIMIZED) */}

      {/* TAB 1: FASILITAS RUANGAN */}
      {activeSubTab === 'fasilitas' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredFasilitas.length === 0 ? (
            <div style={{
              background: '#ffffff',
              borderRadius: 18,
              padding: '40px 20px',
              textAlign: 'center',
              color: '#94a3b8',
              border: '1px dashed #cbd5e1'
            }}>
              <Building2 size={36} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
              <div style={{ fontWeight: 700, fontSize: 14 }}>Tidak ada ruangan yang cocok</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Coba kata kunci pencarian lain</div>
            </div>
          ) : (
            filteredFasilitas.map((item, index) => {
              const iconStyle = getFasilitasIcon(item.fasilitas);
              const IconComp = iconStyle.icon;

              return (
                <div
                  key={item.id || index}
                  style={{
                    background: '#ffffff',
                    borderRadius: 16,
                    padding: '12px 14px',
                    border: '1px solid #f1f5f9',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                    transition: 'transform 0.15s ease'
                  }}
                >
                  {/* Left: Icon & Name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                    <div style={{
                      width: 42,
                      height: 42,
                      borderRadius: 14,
                      background: `${iconStyle.bg}15`,
                      color: iconStyle.bg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <IconComp size={20} strokeWidth={2.3} />
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{
                          fontSize: 10,
                          fontWeight: 800,
                          color: '#94a3b8',
                          background: '#f8fafc',
                          padding: '1px 5px',
                          borderRadius: 6
                        }}>
                          #{item.no_urut || index + 1}
                        </span>
                      </div>
                      <div style={{
                        fontSize: 13.5,
                        fontWeight: 800,
                        color: '#1e293b',
                        marginTop: 2,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {item.fasilitas}
                      </div>
                    </div>
                  </div>

                  {/* Right: Count & Badge */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span style={{
                        fontSize: 11.5,
                        fontWeight: 800,
                        color: '#0f172a',
                        background: '#f1f5f9',
                        padding: '2px 8px',
                        borderRadius: 8
                      }}>
                        {item.jumlah} Unit
                      </span>
                    </div>
                    {renderKondisiBadge(item.keterangan)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: SARANA & PRASARANA */}
      {activeSubTab === 'sarana' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredSarana.length === 0 ? (
            <div style={{
              background: '#ffffff',
              borderRadius: 18,
              padding: '40px 20px',
              textAlign: 'center',
              color: '#94a3b8',
              border: '1px dashed #cbd5e1'
            }}>
              <Box size={36} style={{ margin: '0 auto 8px', opacity: 0.4 }} />
              <div style={{ fontWeight: 700, fontSize: 14 }}>Tidak ada sarana yang cocok</div>
              <div style={{ fontSize: 12, marginTop: 4 }}>Coba kata kunci pencarian lain</div>
            </div>
          ) : (
            filteredSarana.map((item, index) => {
              const totalJml = parseInt(item.jumlah, 10) || 1;
              const baikJml = parseInt(item.baik, 10) || totalJml;
              const rusakJml = parseInt(item.rusak, 10) || 0;
              const pctBaik = Math.min(100, Math.round((baikJml / totalJml) * 100));

              return (
                <div
                  key={item.id || index}
                  style={{
                    background: '#ffffff',
                    borderRadius: 16,
                    padding: '13px 14px',
                    border: '1px solid #f1f5f9',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10
                  }}
                >
                  {/* Top row: Title and Total Count */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                      <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: 12,
                        background: '#eff6ff',
                        color: '#0066ff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Box size={18} strokeWidth={2.3} />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <span style={{ fontSize: 10, fontWeight: 800, color: '#94a3b8' }}>
                          #{item.no_urut || index + 1}
                        </span>
                        <div style={{
                          fontSize: 13,
                          fontWeight: 800,
                          color: '#1e293b',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {item.jenis_sapras}
                        </div>
                      </div>
                    </div>

                    <div style={{
                      background: '#0f172a',
                      color: '#ffffff',
                      padding: '4px 10px',
                      borderRadius: 10,
                      fontSize: 12,
                      fontWeight: 800,
                      flexShrink: 0
                    }}>
                      {item.jumlah} Unit
                    </div>
                  </div>

                  {/* Visual Progress Bar (Baik vs Rusak) */}
                  <div style={{
                    width: '100%',
                    height: 6,
                    borderRadius: 6,
                    background: '#fee2e2',
                    overflow: 'hidden',
                    display: 'flex'
                  }}>
                    <div style={{
                      width: `${pctBaik}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #10b981, #059669)',
                      borderRadius: 6
                    }} />
                  </div>

                  {/* Bottom Stats Pills */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11.5 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#059669', fontWeight: 700 }}>
                      <CheckCircle2 size={13} strokeWidth={2.5} />
                      <span>Kondisi Baik: <strong>{baikJml}</strong></span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: rusakJml > 0 ? '#dc2626' : '#94a3b8', fontWeight: 700 }}>
                      <AlertTriangle size={13} strokeWidth={2.5} />
                      <span>Rusak: <strong>{rusakJml}</strong></span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 3: PENGGUNAAN TANAH */}
      {activeSubTab === 'tanah' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Visual Distribution Summary Card */}
          <div style={{
            background: '#ffffff',
            borderRadius: 20,
            padding: 16,
            border: '1px solid #f1f5f9',
            boxShadow: '0 4px 14px rgba(0,0,0,0.03)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>TOTAL LUAS LAHAN</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', marginTop: 1 }}>
                  1.032 M²
                </div>
              </div>
              <span style={{
                background: '#dcfce7',
                color: '#15803d',
                padding: '4px 10px',
                borderRadius: 20,
                fontSize: 11,
                fontWeight: 800
              }}>
                100% Terkelola
              </span>
            </div>

            {/* Segmented Visual Bar */}
            <div style={{
              display: 'flex',
              height: 18,
              borderRadius: 9,
              overflow: 'hidden',
              background: '#f1f5f9',
              marginBottom: 12
            }}>
              <div style={{ width: '68%', background: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 800 }} title="Bangunan (68%)">
                68%
              </div>
              <div style={{ width: '29.1%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 800 }} title="Lapangan (29.1%)">
                29%
              </div>
              <div style={{ width: '2.9%', background: '#f59e0b' }} title="Halaman (2.9%)" />
            </div>

            {/* Legend Chips */}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 11.5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: '#0284c7' }} />
                <span style={{ color: '#475569', fontWeight: 600 }}>Bangunan (68.0%)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: '#10b981' }} />
                <span style={{ color: '#475569', fontWeight: 600 }}>Lapangan (29.1%)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ width: 10, height: 10, borderRadius: 3, background: '#f59e0b' }} />
                <span style={{ color: '#475569', fontWeight: 600 }}>Halaman (2.9%)</span>
              </div>
            </div>
          </div>

          {/* 3 Detailed Land Area Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Card 1: Bangunan */}
            <div style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)',
              borderRadius: 18,
              padding: 16,
              border: '1.5px solid #bae6fd',
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.08)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    background: '#0284c7',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 10px rgba(2, 132, 199, 0.3)'
                  }}>
                    <Building2 size={22} />
                  </div>
                  <div>
                    <span style={{ fontSize: 10, fontWeight: 800, color: '#0284c7', background: '#e0f2fe', padding: '1px 6px', borderRadius: 6 }}>
                      ZONA UTAMA
                    </span>
                    <h4 style={{ margin: '2px 0 0', fontSize: 15, fontWeight: 900, color: '#0f172a' }}>
                      BANGUNAN SEKOLAH
                    </h4>
                  </div>
                </div>

                <div style={{
                  background: '#0284c7',
                  color: '#ffffff',
                  fontSize: 12,
                  fontWeight: 800,
                  padding: '3px 9px',
                  borderRadius: 8
                }}>
                  68.0%
                </div>
              </div>

              <div style={{
                marginTop: 14,
                padding: '10px 12px',
                borderRadius: 12,
                background: '#ffffff',
                border: '1px solid #e0f2fe',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Luas Area Fisik</span>
                <span style={{ fontSize: 18, fontWeight: 900, color: '#0284c7' }}>702 M²</span>
              </div>
            </div>

            {/* Card 2: Lapangan Olahraga */}
            <div style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)',
              borderRadius: 18,
              padding: 16,
              border: '1.5px solid #bbf7d0',
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.08)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    background: '#10b981',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)'
                  }}>
                    <Dumbbell size={22} />
                  </div>
                  <div>
                    <span style={{ fontSize: 10, fontWeight: 800, color: '#059669', background: '#dcfce7', padding: '1px 6px', borderRadius: 6 }}>
                      ZONA AKTIVITAS
                    </span>
                    <h4 style={{ margin: '2px 0 0', fontSize: 15, fontWeight: 900, color: '#0f172a' }}>
                      LAPANGAN OLAHRAGA
                    </h4>
                  </div>
                </div>

                <div style={{
                  background: '#10b981',
                  color: '#ffffff',
                  fontSize: 12,
                  fontWeight: 800,
                  padding: '3px 9px',
                  borderRadius: 8
                }}>
                  29.1%
                </div>
              </div>

              <div style={{
                marginTop: 14,
                padding: '10px 12px',
                borderRadius: 12,
                background: '#ffffff',
                border: '1px solid #dcfce7',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Luas Area Fisik</span>
                <span style={{ fontSize: 18, fontWeight: 900, color: '#10b981' }}>300 M²</span>
              </div>
            </div>

            {/* Card 3: Halaman */}
            <div style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)',
              borderRadius: 18,
              padding: 16,
              border: '1.5px solid #fde68a',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.08)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    background: '#f59e0b',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 10px rgba(245, 158, 11, 0.3)'
                  }}>
                    <Trees size={22} />
                  </div>
                  <div>
                    <span style={{ fontSize: 10, fontWeight: 800, color: '#d97706', background: '#fef3c7', padding: '1px 6px', borderRadius: 6 }}>
                      ZONA TERBUKA
                    </span>
                    <h4 style={{ margin: '2px 0 0', fontSize: 15, fontWeight: 900, color: '#0f172a' }}>
                      HALAMAN SEKOLAH
                    </h4>
                  </div>
                </div>

                <div style={{
                  background: '#f59e0b',
                  color: '#ffffff',
                  fontSize: 12,
                  fontWeight: 800,
                  padding: '3px 9px',
                  borderRadius: 8
                }}>
                  2.9%
                </div>
              </div>

              <div style={{
                marginTop: 14,
                padding: '10px 12px',
                borderRadius: 12,
                background: '#ffffff',
                border: '1px solid #fef3c7',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Luas Area Fisik</span>
                <span style={{ fontSize: 18, fontWeight: 900, color: '#f59e0b' }}>30 M²</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
