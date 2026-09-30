import React, { useState, useEffect } from 'react';
import {
  BookOpen, Search, RefreshCw, X, CheckCircle2, ChevronRight, Layers
} from 'lucide-react';
import api from '../api/client';

// Warna gradient per huruf pertama
const GRADIENTS = [
  ['#6366f1', '#4f46e5'], // indigo
  ['#0ea5e9', '#0284c7'], // sky
  ['#10b981', '#059669'], // emerald
  ['#f59e0b', '#d97706'], // amber
  ['#ef4444', '#dc2626'], // red
  ['#8b5cf6', '#7c3aed'], // violet
  ['#ec4899', '#db2777'], // pink
  ['#14b8a6', '#0d9488'], // teal
  ['#f97316', '#ea580c'], // orange
  ['#06b6d4', '#0891b2'], // cyan
];

function getGradient(str) {
  const code = (str || 'A').charCodeAt(0);
  return GRADIENTS[code % GRADIENTS.length];
}

function getInitials(name) {
  return (name || 'M')
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() || '')
    .join('');
}

export default function MapelView({ showToast }) {
  const [mapelList, setMapelList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedMapel, setSelectedMapel] = useState(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/mapel');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setMapelList(res.data.data);
      } else {
        setMapelList([]);
      }
    } catch (err) {
      console.error('Error fetching mapel:', err);
      setMapelList([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredMapel = mapelList
    .filter(m => {
      const q = searchQuery.toLowerCase();
      return (
        (m.nama_mapel || '').toLowerCase().includes(q) ||
        (m.singkatan || '').toLowerCase().includes(q)
      );
    })
    .sort((a, b) => (a.nama_mapel || '').localeCompare(b.nama_mapel || '', 'id', { sensitivity: 'base' }));

  const averageKKM = mapelList.length > 0
    ? Math.round(mapelList.reduce((acc, curr) => acc + (parseFloat(curr.kkm) || 75), 0) / mapelList.length)
    : 75;

  return (
    <div className="inner-page-wrapper" style={{ paddingBottom: 40, paddingTop: 4 }}>

      {/* STATS HEADER */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 18 }}>
        <div style={{
          background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
          padding: '16px 18px', borderRadius: 18,
          boxShadow: '0 6px 20px rgba(99,102,241,0.3)',
          color: '#ffffff'
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.85, marginBottom: 4 }}>Total Mapel</div>
          <div style={{ fontSize: 28, fontWeight: 900 }}>{filteredMapel.length}</div>
          <div style={{ fontSize: 10, opacity: 0.75, marginTop: 2 }}>Mata Pelajaran</div>
        </div>
        <div style={{
          background: 'linear-gradient(135deg, #10b981, #059669)',
          padding: '16px 18px', borderRadius: 18,
          boxShadow: '0 6px 20px rgba(16,185,129,0.3)',
          color: '#ffffff'
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.85, marginBottom: 4 }}>Rata-rata KKM</div>
          <div style={{ fontSize: 28, fontWeight: 900 }}>{averageKKM}</div>
          <div style={{ fontSize: 10, opacity: 0.75, marginTop: 2 }}>Nilai Ketuntasan</div>
        </div>
      </div>

      {/* SEARCH */}
      <div style={{
        background: '#ffffff', padding: '12px 14px',
        borderRadius: 16, border: '1px solid #e2e8f0',
        boxShadow: '0 2px 10px rgba(0,0,0,0.04)', marginBottom: 18,
        display: 'flex', gap: 10, alignItems: 'center'
      }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Cari nama atau singkatan mapel..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%', padding: '10px 12px 10px 36px',
              borderRadius: 12, border: '1.5px solid #e2e8f0',
              fontSize: 13, outline: 'none',
              background: '#f8fafc', boxSizing: 'border-box',
              color: '#0f172a', fontWeight: 500
            }}
          />
        </div>
        <button
          onClick={fetchData}
          style={{
            background: '#f1f5f9', border: '1.5px solid #e2e8f0',
            borderRadius: 12, padding: '9px 13px',
            display: 'flex', alignItems: 'center', gap: 5,
            color: '#475569', fontSize: 12, fontWeight: 700, cursor: 'pointer'
          }}
        >
          <RefreshCw size={13} />
        </button>
      </div>

      {/* SUBJECT LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 20px' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid #e2e8f0', borderTopColor: '#6366f1', animation: 'spin 0.8s linear infinite', margin: '0 auto 12px' }} />
            <div style={{ color: '#64748b', fontSize: 13, fontWeight: 600 }}>Memuat data...</div>
          </div>
        ) : filteredMapel.length === 0 ? (
          <div style={{
            background: '#ffffff', borderRadius: 20, border: '1px solid #e2e8f0',
            textAlign: 'center', padding: '48px 20px', color: '#64748b'
          }}>
            <Layers size={48} style={{ opacity: 0.2, margin: '0 auto 12px', color: '#6366f1' }} />
            <div style={{ fontWeight: 800, fontSize: 15, color: '#0f172a' }}>Tidak Ada Mapel</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>Coba ubah kata kunci pencarian.</div>
          </div>
        ) : (
          filteredMapel.map((m, idx) => {
            const [c1, c2] = getGradient(m.nama_mapel);
            const initials = getInitials(m.nama_mapel);
            return (
              <div
                key={m.kode_mapel || idx}
                onClick={() => setSelectedMapel(m)}
                style={{
                  background: '#ffffff',
                  borderRadius: 20,
                  padding: '16px 18px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 3px 12px rgba(0,0,0,0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
                onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                onTouchStart={e => e.currentTarget.style.transform = 'scale(0.97)'}
                onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                {/* Dekorasi sudut */}
                <div style={{
                  position: 'absolute', top: -16, right: -16,
                  width: 70, height: 70, borderRadius: '50%',
                  background: `linear-gradient(135deg, ${c1}18, ${c2}10)`,
                  pointerEvents: 'none'
                }} />

                {/* Avatar inisial */}
                <div style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  background: `linear-gradient(135deg, ${c1}, ${c2})`,
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: 17,
                  flexShrink: 0,
                  boxShadow: `0 6px 16px ${c1}50`,
                  letterSpacing: 0.5
                }}>
                  {initials}
                </div>

                {/* Info mapel */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontWeight: 800, fontSize: 14.5,
                    color: '#0f172a', lineHeight: 1.3,
                    wordBreak: 'break-word'
                  }}>
                    {m.nama_mapel}
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 5, flexWrap: 'wrap' }}>
                    {m.singkatan && (
                      <span style={{
                        background: `${c1}15`,
                        color: c1,
                        border: `1px solid ${c1}30`,
                        padding: '2px 10px',
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 800,
                        letterSpacing: 0.3
                      }}>
                        {m.singkatan}
                      </span>
                    )}
                    <span style={{
                      background: '#f0fdf4',
                      color: '#059669',
                      border: '1px solid #bbf7d0',
                      padding: '2px 10px',
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 800
                    }}>
                      KKM {m.kkm || 75}
                    </span>
                  </div>
                </div>

                {/* Arrow */}
                <div style={{
                  width: 32, height: 32, borderRadius: 10,
                  background: '#f8fafc', border: '1px solid #e2e8f0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <ChevronRight size={16} color="#94a3b8" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DETAIL MODAL — slide up dari bawah */}
      {selectedMapel && (() => {
        const [c1, c2] = getGradient(selectedMapel.nama_mapel);
        const initials = getInitials(selectedMapel.nama_mapel);
        return (
          <div
            onClick={() => setSelectedMapel(null)}
            style={{
              position: 'fixed', inset: 0, zIndex: 999999,
              background: 'rgba(15,23,42,0.6)',
              backdropFilter: 'blur(6px)',
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center'
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                width: '100%', maxWidth: 500,
                background: '#ffffff',
                borderTopLeftRadius: 28, borderTopRightRadius: 28,
                overflow: 'hidden',
                boxShadow: '0 -16px 50px rgba(0,0,0,0.2)',
                animation: 'slideUp 0.25s ease-out'
              }}
            >
              {/* Modal header gradient */}
              <div style={{
                background: `linear-gradient(135deg, ${c1}, ${c2})`,
                padding: '28px 22px 24px',
                position: 'relative'
              }}>
                <button
                  onClick={() => setSelectedMapel(null)}
                  style={{
                    position: 'absolute', top: 16, right: 16,
                    background: 'rgba(255,255,255,0.2)',
                    border: 'none', borderRadius: '50%',
                    width: 32, height: 32, color: '#ffffff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                >
                  <X size={16} />
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{
                    width: 60, height: 60, borderRadius: 18,
                    background: 'rgba(255,255,255,0.25)',
                    border: '2px solid rgba(255,255,255,0.5)',
                    color: '#ffffff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 900, fontSize: 22,
                    letterSpacing: 0.5
                  }}>
                    {initials}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 17, fontWeight: 900, color: '#ffffff', lineHeight: 1.3 }}>
                      {selectedMapel.nama_mapel}
                    </h3>
                    {selectedMapel.singkatan && (
                      <div style={{
                        display: 'inline-block',
                        marginTop: 6,
                        background: 'rgba(255,255,255,0.2)',
                        color: '#ffffff',
                        padding: '2px 12px',
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 700
                      }}>
                        {selectedMapel.singkatan}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Modal body */}
              <div style={{ padding: '22px 22px 10px' }}>
                {/* KKM Card */}
                <div style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: 16,
                  padding: '16px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  marginBottom: 14
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 14,
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#ffffff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 900, fontSize: 18,
                    flexShrink: 0
                  }}>
                    {selectedMapel.kkm || 75}
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#059669' }}>Standar Ketuntasan (KKM)</div>
                    <div style={{ fontSize: 12, color: '#166534', marginTop: 3, lineHeight: 1.5 }}>
                      Peserta didik dinyatakan tuntas apabila memperoleh nilai minimal <strong>{selectedMapel.kkm || 75}</strong>.
                    </div>
                  </div>
                </div>

                {/* Info rows */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {selectedMapel.singkatan && (
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 0',
                      borderBottom: '1px solid #f1f5f9'
                    }}>
                      <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Singkatan</span>
                      <span style={{
                        fontSize: 13, fontWeight: 800, color: c1,
                        background: `${c1}12`,
                        padding: '3px 12px', borderRadius: 20
                      }}>{selectedMapel.singkatan}</span>
                    </div>
                  )}
                  {selectedMapel.jenjang && (
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', padding: '12px 0',
                      borderBottom: '1px solid #f1f5f9'
                    }}>
                      <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Jenjang</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{selectedMapel.jenjang}</span>
                    </div>
                  )}
                  {selectedMapel.jam_per_minggu && (
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', padding: '12px 0',
                      borderBottom: '1px solid #f1f5f9'
                    }}>
                      <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Jam / Minggu</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{selectedMapel.jam_per_minggu} JP</span>
                    </div>
                  )}
                  {selectedMapel.keterangan && (
                    <div style={{ padding: '12px 0' }}>
                      <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600, marginBottom: 6 }}>Keterangan</div>
                      <div style={{
                        background: '#f8fafc', borderRadius: 12, padding: '10px 14px',
                        fontSize: 12.5, color: '#475569', lineHeight: 1.6
                      }}>
                        {selectedMapel.keterangan}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div style={{ padding: '14px 22px 28px' }}>
                <button
                  onClick={() => setSelectedMapel(null)}
                  style={{
                    width: '100%',
                    background: `linear-gradient(135deg, ${c1}, ${c2})`,
                    color: '#ffffff', border: 'none',
                    borderRadius: 14, padding: '13px',
                    fontWeight: 800, fontSize: 14,
                    cursor: 'pointer',
                    boxShadow: `0 6px 20px ${c1}40`
                  }}
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
