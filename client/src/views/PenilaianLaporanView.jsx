import React, { useState, useEffect } from 'react';
import {
  FileCheck, Printer, Download, Award, UserCheck, AlertTriangle, FileSpreadsheet,
  CheckCircle2, Search, BookOpen, ChevronRight, User
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../api/client';
import SubHeader from '../components/SubHeader';

export default function PenilaianLaporanView({ onBack }) {
  const [kelasList, setKelasList] = useState([]);
  const [mapelList, setMapelList] = useState([]);

  const [selectedKelas, setSelectedKelas] = useState('');
  const [selectedMapel, setSelectedMapel] = useState('all');
  const [tahunAjaran, setTahunAjaran] = useState('2026/2027');
  const [semester, setSemester] = useState('1');

  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedSiswaId, setSelectedSiswaId] = useState(null);
  const [siswaTranskrip, setSiswaTranskrip] = useState([]);

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
        const komponenList = res.data.data.komponen || [];
        const nilaiMap = res.data.data.nilaiMap || {};
        const bobot = res.data.data.bobot || { kktp_kkm: 75 };

        // Process data for report summary
        const processed = rawStudents.map(s => {
          const sNilai = nilaiMap[s.id] || {};
          let phSum = 0, phCount = 0;
          let prkSum = 0, prkCount = 0;
          let utsScore = 0;
          let uasScore = 0;

          for (const k of komponenList) {
            const val = parseFloat(sNilai[k.id]);
            if (isNaN(val)) continue;

            const code = (k.kode_kategori || '').toUpperCase();
            if (code === 'PH' || code === 'TUGAS' || k.kelompok === 'FORMATIF') {
              phSum += val; phCount++;
            } else if (code === 'PRAKTIK' || code === 'P5' || k.kelompok === 'KETERAMPILAN') {
              prkSum += val; prkCount++;
            } else if (code === 'UTS') {
              utsScore = val;
            } else if (code === 'UAS') {
              uasScore = val;
            }
          }

          const avgPH = phCount > 0 ? (phSum / phCount) : 0;
          const avgPraktik = prkCount > 0 ? (prkSum / prkCount) : 0;

          const bPH = bobot.bobot_ph || 25;
          const bPrk = bobot.bobot_praktik || 25;
          const bUTS = bobot.bobot_uts || 25;
          const bUAS = bobot.bobot_uas || 25;
          const totalBobot = bPH + bPrk + bUTS + bUAS || 100;

          const finalScore = ((avgPH * bPH) + (avgPraktik * bPrk) + (utsScore * bUTS) + (uasScore * bUAS)) / totalBobot;

          let predikat = 'D';
          if (finalScore >= 88) predikat = 'A';
          else if (finalScore >= 78) predikat = 'B';
          else if (finalScore >= 68) predikat = 'C';

          return {
            ...s,
            avgPH: avgPH.toFixed(1),
            avgPraktik: avgPraktik.toFixed(1),
            utsScore,
            uasScore,
            finalScore: finalScore.toFixed(1),
            predikat,
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

  const handlePrintRapor = (siswa) => {
    Swal.fire({
      title: '📄 Unduh E-Rapor Digital',
      text: `Mencetak Rapor Digital untuk siswa ${siswa.nama}`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Cetak / Unduh PDF',
      confirmButtonColor: '#0066ff'
    }).then((result) => {
      if (result.isConfirmed) {
        window.print();
      }
    });
  };

  // Stats calculation
  const totalSiswa = students.length;
  const tuntasCount = students.filter(s => s.isPass).length;
  const remedialCount = totalSiswa - tuntasCount;
  const avgKelas = totalSiswa > 0 ? (students.reduce((acc, s) => acc + parseFloat(s.finalScore), 0) / totalSiswa).toFixed(1) : 0;

  return (
    <div className="penilaian-laporan-container" style={{ paddingBottom: 40 }}>
      <SubHeader title="📊 Laporan Penilaian & E-Rapor" subtitle="Rekapitulasi rapor nilai siswa, analisis ketuntasan, dan cetak PDF" onBack={onBack} />

      {/* FILTER BAR */}
      <div style={{ maxWidth: 960, margin: '16px auto', padding: '0 16px' }}>
        <div style={{ background: '#ffffff', borderRadius: 20, padding: '16px 18px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 4, display: 'block' }}>KELAS</label>
            <select
              className="form-control-admin"
              style={{ cursor: 'pointer', opacity: 1, pointerEvents: 'auto' }}
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
            <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 4, display: 'block' }}>MATA PELAJARAN</label>
            <select
              className="form-control-admin"
              style={{ cursor: 'pointer', opacity: 1, pointerEvents: 'auto' }}
              value={selectedMapel}
              onChange={e => setSelectedMapel(e.target.value)}
            >
              <option value="all">Semua Mapel (Rapor Keseluruhan)</option>
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
            <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 4, display: 'block' }}>TAHUN AJARAN</label>
            <select className="form-control-admin" value={tahunAjaran} onChange={e => setTahunAjaran(e.target.value)}>
              <option value="2026/2027">2026/2027</option>
              <option value="2025/2026">2025/2026</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 4, display: 'block' }}>SEMESTER</label>
            <select className="form-control-admin" value={semester} onChange={e => setSemester(e.target.value)}>
              <option value="1">Semester 1 (Ganjil)</option>
              <option value="2">Semester 2 (Genap)</option>
            </select>
          </div>
        </div>
      </div>

      {/* STATS OVERVIEW CARDS (HORIZONTAL ROW SIDE-BY-SIDE) */}
      <div style={{ maxWidth: 960, margin: '0 auto 16px auto', padding: '0 16px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
        <div style={{ background: 'linear-gradient(135deg, #0284c7, #0369a1)', color: '#fff', padding: '14px 16px', borderRadius: 16, boxShadow: '0 4px 14px rgba(2, 132, 199, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 700, opacity: 0.9 }}>RATA-RATA KELAS</div>
            <div style={{ fontSize: 22, fontWeight: 800, marginTop: 2 }}>{avgKelas}</div>
          </div>
          <Award size={24} style={{ opacity: 0.8 }} />
        </div>

        <div style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff', padding: '14px 16px', borderRadius: 16, boxShadow: '0 4px 14px rgba(34, 197, 94, 0.25)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 10.5, fontWeight: 700, opacity: 0.9 }}>SISWA TUNTAS</div>
            <div style={{ fontSize: 22, fontWeight: 800, marginTop: 2 }}>{tuntasCount} <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.9 }}>/ {totalSiswa} Siswa</span></div>
          </div>
          <CheckCircle2 size={24} style={{ opacity: 0.8 }} />
        </div>
      </div>

      {/* TABLE LAPORAN RAPOR */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 16px' }}>
        <div style={{ background: '#ffffff', borderRadius: 20, boxShadow: '0 6px 24px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>
              📄 Rekapitulasi Nilai
            </h3>
          </div>

          {loading ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#64748b' }}>
              <p style={{ fontSize: 13, fontWeight: 600 }}>Memuat laporan penilaian...</p>
            </div>
          ) : students.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: '#94a3b8' }}>
              <p style={{ fontSize: 13, fontWeight: 600 }}>Tidak ada data penilaian ditemukan.</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textTransform: 'uppercase', color: '#475569', fontSize: 11, fontWeight: 800 }}>
                    <th style={{ padding: '12px 14px', textAlign: 'center', width: 45 }}>No</th>
                    <th style={{ padding: '12px 14px', textAlign: 'left' }}>Nama Siswa</th>
                    <th style={{ padding: '12px 10px', textAlign: 'center', background: '#eff6ff' }}>Nilai Akhir</th>
                    <th style={{ padding: '12px 10px', textAlign: 'center' }}>Predikat</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s, idx) => (
                    <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                      <td style={{ padding: '12px 14px', textAlign: 'center', fontWeight: 600, color: '#64748b' }}>{idx + 1}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a' }}>
                        {s.nama}
                        <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 500 }}>NIS: {s.nis || '-'}</div>
                      </td>
                      <td style={{ padding: '12px 10px', textAlign: 'center', fontWeight: 800, fontSize: 14, background: '#eff6ff', color: s.isPass ? '#0284c7' : '#dc2626' }}>
                        {s.finalScore}
                      </td>
                      <td style={{ padding: '12px 10px', textAlign: 'center' }}>
                        <span style={{ fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 8, background: s.predikat === 'A' ? '#dcfce7' : s.predikat === 'B' ? '#e0f2fe' : '#fef3c7', color: s.predikat === 'A' ? '#15803d' : s.predikat === 'B' ? '#0369a1' : '#b45309' }}>
                          {s.predikat}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
