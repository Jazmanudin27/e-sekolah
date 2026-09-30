import React, { useState, useEffect } from 'react';
import {
  BookOpen, Search, RefreshCw, Award, ChevronRight, X, FileText, CheckCircle2
} from 'lucide-react';
import api from '../api/client';

export default function MapelView({ showToast }) {
  const [mapelList, setMapelList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedMapel, setSelectedMapel] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

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
      const matchSearch =
        (m.nama_mapel || '').toLowerCase().includes(q) ||
        (m.singkatan || '').toLowerCase().includes(q) ||
        String(m.kode_mapel || '').includes(q);
      return matchSearch;
    })
    .sort((a, b) => (a.nama_mapel || '').localeCompare(b.nama_mapel || '', 'id', { sensitivity: 'base' }));

  const averageKKM = mapelList.length > 0
    ? Math.round(mapelList.reduce((acc, curr) => acc + (parseFloat(curr.kkm) || 75), 0) / mapelList.length)
    : 75;

  return (
    <div className="inner-page-wrapper" style={{ paddingBottom: 36, paddingTop: 4 }}>
      {/* STATS OVERVIEW CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
        <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Total Mata Pelajaran</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#0066ff', marginTop: 4 }}>{filteredMapel.length}</div>
        </div>

        <div style={{ background: '#ffffff', padding: '12px 14px', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Rata-rata KKM</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: '#059669', marginTop: 4 }}>{averageKKM}</div>
        </div>
      </div>

      {/* SEARCH BOX */}
      <div style={{ background: '#ffffff', padding: 14, borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)', marginBottom: 18 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Cari mata pelajaran, singkatan, kode..."
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

      {/* SUBJECTS LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#0066ff', fontWeight: 600 }}>
            Memuat data mata pelajaran...
          </div>
        ) : filteredMapel.length === 0 ? (
          <div style={{
            background: '#ffffff',
            borderRadius: 16,
            border: '1px solid #e2e8f0',
            textAlign: 'center',
            padding: '40px 20px',
            color: '#64748b'
          }}>
            <BookOpen size={44} style={{ opacity: 0.3, margin: '0 auto 8px', color: '#0066ff' }} />
            <div style={{ fontWeight: 800, fontSize: 14, color: '#0f172a' }}>Tidak Ada Mata Pelajaran</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
              Tidak ditemukan data mata pelajaran yang cocok dengan pencarian Anda.
            </div>
          </div>
        ) : (
          filteredMapel.map((m) => (
            <div
              key={m.kode_mapel}
              onClick={() => setSelectedMapel(m)}
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
                  background: 'linear-gradient(135deg, #0284c7, #0052cc)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: 16,
                  flexShrink: 0
                }}>
                  <BookOpen size={20} />
                </div>

                <div>
                  <div style={{ fontWeight: 800, fontSize: 14, color: '#0f172a' }}>
                    {m.nama_mapel}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2, display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span>Kode: #{m.kode_mapel}</span>
                    {m.singkatan && (
                      <>
                        <span>•</span>
                        <span style={{ fontWeight: 700, color: '#0284c7' }}>{m.singkatan}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{
                  background: '#ecfdf5',
                  color: '#059669',
                  border: '1px solid #a7f3d0',
                  padding: '3px 8px',
                  borderRadius: 8,
                  fontSize: 11,
                  fontWeight: 800
                }}>
                  KKM: {m.kkm || 75}
                </span>

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
          ))
        )}
      </div>

      {/* DETAIL MODAL MAPEL */}
      {selectedMapel && (
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
          onClick={() => setSelectedMapel(null)}
        >
          <div
            style={{
              width: '100%',
              maxWidth: 400,
              background: '#ffffff',
              borderRadius: 24,
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0,0,0,0.2)',
              position: 'relative',
              animation: 'slideUp 0.25s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              background: 'linear-gradient(135deg, #0284c7, #0052cc)',
              padding: '24px 20px 20px',
              color: '#ffffff',
              position: 'relative'
            }}>
              <button
                onClick={() => setSelectedMapel(null)}
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
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: '#ffffff',
                  color: '#0284c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}>
                  <BookOpen size={26} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 900, lineHeight: 1.2 }}>
                    {selectedMapel.nama_mapel}
                  </h3>
                  <div style={{ fontSize: 12, opacity: 0.9, marginTop: 4 }}>
                    Singkatan: {selectedMapel.singkatan || '-'}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: 12, border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b' }}>KODE MAPEL</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#0066ff', marginTop: 4 }}>
                    #{selectedMapel.kode_mapel}
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: 12, border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#64748b' }}>STANDAR KKM</div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: '#059669', marginTop: 4 }}>
                    {selectedMapel.kkm || 75}
                  </div>
                </div>
              </div>

              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '12px 14px', fontSize: 12, color: '#166534' }}>
                <div style={{ fontWeight: 800, marginBottom: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircle2 size={15} color="#16a34a" /> Ketuntasan Belajar Minimal
                </div>
                Peserta didik dinyatakan tuntas dalam mata pelajaran ini apabila memperoleh nilai minimal {selectedMapel.kkm || 75}.
              </div>
            </div>

            <div style={{ padding: '12px 20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', textAlign: 'right' }}>
              <button
                type="button"
                onClick={() => setSelectedMapel(null)}
                style={{
                  background: '#0284c7',
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
