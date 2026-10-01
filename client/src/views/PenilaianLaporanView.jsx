import React, { useState, useEffect } from 'react';
import { FileCheck, Search, BookOpen, User, FileText, Printer } from 'lucide-react';
import api from '../api/client';
import SubHeader from '../components/SubHeader';
import RaporModal from '../components/RaporModal';

export default function PenilaianLaporanView({ onBack }) {
  const [kelasList, setKelasList] = useState([]);
  const [mapelList, setMapelList] = useState([]);

  const [selectedKelas, setSelectedKelas] = useState('');
  const [selectedMapel, setSelectedMapel] = useState('all');
  const [selectedKomponen, setSelectedKomponen] = useState('all');
  const [tahunAjaran, setTahunAjaran] = useState('2026/2027');
  const [semester, setSemester] = useState('1 (Ganjil)');

  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [komponenList, setKomponenList] = useState([]);
  const [nilaiMap, setNilaiMap] = useState({});
  const [raporSiswa, setRaporSiswa] = useState(null);

  useEffect(() => {
    fetchOptions();
  }, []);

  useEffect(() => {
    if (selectedKelas) {
      fetchLaporanData();
    }
  }, [selectedKelas, selectedMapel, tahunAjaran, semester]);

  const fetchOptions = async () => {
    try {
      const [resKelas, resMapel] = await Promise.all([
        api.get('/kelas'),
        api.get('/mapel')
      ]);

      if (resKelas.data.success && Array.isArray(resKelas.data.data)) {
        setKelasList(resKelas.data.data);
        if (resKelas.data.data.length > 0) {
          setSelectedKelas(resKelas.data.data[0].kode_kelas || resKelas.data.data[0].id);
        }
      }
      if (resMapel.data.success && Array.isArray(resMapel.data.data)) {
        setMapelList(resMapel.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchLaporanData = async () => {
    if (!selectedKelas) return;
    setLoading(true);
    try {
      const mapelIdParam = selectedMapel !== 'all' ? selectedMapel : (mapelList.length > 0 ? (mapelList[0].kode_mapel || mapelList[0].id) : 1);
      const res = await api.get(`/penilaian/matrix?kelas_id=${selectedKelas}&mapel_id=${mapelIdParam}&tahun_ajaran=${tahunAjaran}&semester=${semester}`);
      
      if (res.data.success) {
        const rawStudents = res.data.data.students || [];
        const rawKomponen = res.data.data.komponen || [];
        const rawNilaiMap = res.data.data.nilaiMap || {};
        const bobot = res.data.data.bobot || { kktp_kkm: 75 };

        setKomponenList(rawKomponen);
        setNilaiMap(rawNilaiMap);

        // Process data for report summary (Average of filled scores)
        const processed = rawStudents.map(s => {
          const sNilai = rawNilaiMap[s.id] || {};
          const filledScores = [];

          for (const k of rawKomponen) {
            const rawVal = sNilai[k.id];
            if (rawVal !== undefined && rawVal !== null && rawVal !== '') {
              const val = parseFloat(rawVal);
              if (!isNaN(val)) {
                filledScores.push(val);
              }
            }
          }

          let finalScore = 0;
          if (filledScores.length > 0) {
            const sum = filledScores.reduce((a, b) => a + b, 0);
            finalScore = sum / filledScores.length;
          }

          return {
            ...s,
            finalScore: finalScore.toFixed(1),
            isPass: finalScore >= (bobot.kktp_kkm || 75)
          };
        });

        setStudents(processed);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const displayedKomponenList = selectedKomponen === 'all'
    ? komponenList
    : komponenList.filter(k => String(k.id) === String(selectedKomponen));

  const selectedKelasObj = kelasList.find(k => (k.kode_kelas || k.id) === selectedKelas);
  const kelasNama = selectedKelasObj ? (selectedKelasObj.nama_kelas || selectedKelasObj.nama || selectedKelas) : 'X-1';

  return (
    <div className="penilaian-laporan-container" style={{ paddingBottom: 40 }}>
      <SubHeader title="📊 Laporan Penilaian" subtitle="Rekapitulasi nilai siswa per komponen dan cetak Rapor Kurikulum Merdeka" onBack={onBack} />

      {/* FILTER BAR */}
      <div style={{ maxWidth: 960, margin: '16px auto', padding: '0 16px' }}>
        <div style={{ background: '#ffffff', borderRadius: 16, padding: '14px 16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
          <div>
            <label style={{ fontSize: 10.5, fontWeight: 700, color: '#64748b', marginBottom: 4, display: 'block' }}>KELAS</label>
            <select
              className="form-control-admin"
              style={{ cursor: 'pointer', opacity: 1, pointerEvents: 'auto', fontSize: 12, padding: '6px 10px' }}
              value={selectedKelas}
              onChange={e => setSelectedKelas(e.target.value)}
            >
              {kelasList.map(k => {
                const kVal = k.kode_kelas || k.id;
                return (
                  <option key={kVal} value={kVal}>
                    {k.nama_kelas || k.nama || kVal}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 10.5, fontWeight: 700, color: '#64748b', marginBottom: 4, display: 'block' }}>MATA PELAJARAN</label>
            <select
              className="form-control-admin"
              style={{ cursor: 'pointer', opacity: 1, pointerEvents: 'auto', fontSize: 12, padding: '6px 10px' }}
              value={selectedMapel}
              onChange={e => {
                setSelectedMapel(e.target.value);
                setSelectedKomponen('all');
              }}
            >
              <option value="all">Semua Mapel</option>
              {mapelList.map(m => {
                const mVal = m.kode_mapel || m.id;
                return (
                  <option key={mVal} value={mVal}>
                    {m.nama_mapel || m.nama || mVal}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 10.5, fontWeight: 700, color: '#64748b', marginBottom: 4, display: 'block' }}>KOMPONEN PENILAIAN</label>
            <select
              className="form-control-admin"
              style={{ cursor: 'pointer', opacity: 1, pointerEvents: 'auto', fontSize: 12, padding: '6px 10px' }}
              value={selectedKomponen}
              onChange={e => setSelectedKomponen(e.target.value)}
            >
              <option value="all">Semua Komponen ({komponenList.length})</option>
              {komponenList.map(k => (
                <option key={k.id} value={k.id}>
                  {k.nama_komponen} ({k.nama_kategori})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 10.5, fontWeight: 700, color: '#64748b', marginBottom: 4, display: 'block' }}>TAHUN AJARAN</label>
            <select className="form-control-admin" style={{ fontSize: 12, padding: '6px 10px' }} value={tahunAjaran} onChange={e => setTahunAjaran(e.target.value)}>
              <option value="2026/2027">2026/2027</option>
              <option value="2025/2026">2025/2026</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: 10.5, fontWeight: 700, color: '#64748b', marginBottom: 4, display: 'block' }}>SEMESTER</label>
            <select className="form-control-admin" style={{ fontSize: 12, padding: '6px 10px' }} value={semester} onChange={e => setSemester(e.target.value)}>
              <option value="1 (Ganjil)">Sem 1 (Ganjil)</option>
              <option value="2 (Genap)">Sem 2 (Genap)</option>
            </select>
          </div>
        </div>
      </div>

      {/* TABLE LAPORAN NILAI */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 16px' }}>
        <div style={{ background: '#ffffff', borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: 0 }}>
              📄 Rekapitulasi Nilai
            </h3>
            {students.length > 0 && (
              <button
                onClick={() => setRaporSiswa(students[0])}
                style={{
                  background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: 10,
                  fontSize: 11.5,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer',
                  boxShadow: '0 2px 10px rgba(2, 132, 199, 0.25)'
                }}
              >
                <FileText size={14} /> Format Cetak Rapor Digital
              </button>
            )}
          </div>

          {loading ? (
            <div style={{ padding: '36px 0', textAlign: 'center', color: '#64748b' }}>
              <p style={{ fontSize: 12.5, fontWeight: 600 }}>Memuat laporan penilaian...</p>
            </div>
          ) : students.length === 0 ? (
            <div style={{ padding: '36px 0', textAlign: 'center', color: '#94a3b8' }}>
              <p style={{ fontSize: 12.5, fontWeight: 600 }}>Tidak ada data penilaian ditemukan.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5 }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textTransform: 'uppercase', color: '#475569', fontSize: 10.5, fontWeight: 800 }}>
                    <th style={{ padding: '8px 10px', textAlign: 'center', width: 35 }}>No</th>
                    <th style={{ padding: '8px 12px', textAlign: 'left', minWidth: 150 }}>Nama Siswa</th>
                    
                    {/* DYNAMIC KOMPONEN COLUMNS */}
                    {displayedKomponenList.map((k) => (
                      <th key={k.id} style={{ padding: '8px 8px', textAlign: 'center', minWidth: 75, borderLeft: '1px solid #e2e8f0', background: k.kode_kategori === 'PH' ? '#eff6ff' : k.kode_kategori === 'PRAKTIK' ? '#f0fdf4' : k.kode_kategori === 'UTS' ? '#fffbeb' : '#fef2f2' }}>
                        <div>{k.nama_komponen}</div>
                        <div style={{ fontSize: 8.5, fontWeight: 700, color: '#64748b', textTransform: 'none' }}>{k.nama_kategori}</div>
                      </th>
                    ))}

                    {/* NILAI AKHIR COLUMN */}
                    <th style={{ padding: '8px 10px', textAlign: 'center', minWidth: 75, borderLeft: '2px solid #cbd5e1', background: '#eff6ff', color: '#1e40af' }}>Nilai Akhir</th>
                    <th style={{ padding: '8px 10px', textAlign: 'center', width: 100 }}>Rapor</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, idx) => (
                    <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                      <td style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 600, color: '#64748b' }}>{idx + 1}</td>
                      <td style={{ padding: '6px 12px', fontWeight: 700, color: '#0f172a' }}>
                        {s.nama}
                        <span style={{ fontSize: 9.5, color: '#94a3b8', fontWeight: 500, marginLeft: 6 }}>NIS: {s.nis || '-'}</span>
                      </td>

                      {/* SCORE PER KOMPONEN */}
                      {displayedKomponenList.map(k => {
                        const val = (nilaiMap[s.id] && nilaiMap[s.id][k.id] !== undefined) ? nilaiMap[s.id][k.id] : '-';
                        return (
                          <td key={k.id} style={{ padding: '6px 6px', textAlign: 'center', fontWeight: 700, color: val !== '-' ? '#0f172a' : '#cbd5e1', borderLeft: '1px solid #f1f5f9' }}>
                            {val}
                          </td>
                        );
                      })}

                      {/* NILAI AKHIR */}
                      <td style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 800, fontSize: 12.5, borderLeft: '2px solid #cbd5e1', background: '#eff6ff', color: s.isPass ? '#0284c7' : '#dc2626' }}>
                        {s.finalScore}
                      </td>

                      {/* ACTION CETAK RAPOR SISWA */}
                      <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                        <button
                          onClick={() => setRaporSiswa(s)}
                          style={{
                            background: '#f1f5f9',
                            border: '1px solid #cbd5e1',
                            color: '#0284c7',
                            padding: '3px 8px',
                            borderRadius: 6,
                            fontSize: 10.5,
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4
                          }}
                          title="Cetak E-Rapor Siswa Ini"
                        >
                          <FileText size={12} /> Cetak
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* RAPOR MODAL PRINT DIALOG */}
      <RaporModal
        isOpen={Boolean(raporSiswa)}
        onClose={() => setRaporSiswa(null)}
        siswa={raporSiswa}
        kelasNama={kelasNama}
        mapelList={mapelList.map(m => ({
          id: m.id,
          nama_mapel: m.nama_mapel || m.nama,
          finalScore: (students.find(st => st.id === raporSiswa?.id)?.finalScore) || 85
        }))}
        tahunAjaran={tahunAjaran}
        semester={semester}
      />
    </div>
  );
}
