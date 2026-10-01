import React, { useState, useEffect } from 'react';
import {
  Printer, Award, FileText, CheckCircle2, UserCheck, AlertCircle, RefreshCw, Calendar, Edit3, HelpCircle, BookOpen, ShieldCheck, ChevronDown, ChevronUp
} from 'lucide-react';
import api from '../../api/client';

export default function AdminRaporTab() {
  const [loading, setLoading] = useState(false);
  const [kelasList, setKelasList] = useState([]);
  const [siswaList, setSiswaList] = useState([]);
  const [sekolahInfo, setSekolahInfo] = useState(null);
  const [showFaseGuide, setShowFaseGuide] = useState(false);

  // Filter States
  const [selectedKelas, setSelectedKelas] = useState('');
  const [selectedSiswaId, setSelectedSiswaId] = useState('');
  const [fase, setFase] = useState('E');
  const [semester, setSemester] = useState('1 (Ganjil)');
  const [tahunPelajaran, setTahunPelajaran] = useState('2025/2026');
  const [tanggalCetak, setTanggalCetak] = useState('20 Desember 2025');

  // Selected Student Detailed Data
  const [currentSiswa, setCurrentSiswa] = useState(null);

  // Rapor Components State
  const [nilaiList, setNilaiList] = useState([
    {
      id: 1,
      nama_mapel: "Pendidikan Agama dan Budi Pekerti",
      nilai_akhir: 88,
      deskripsi: "Menunjukkan penguasaan yang sangat baik dalam menganalisis hukum bacaan Al-Qur'an. Perlu peningkatan pada hafalan ayat pilihan."
    },
    {
      id: 2,
      nama_mapel: "Pendidikan Pancasila",
      nilai_akhir: 85,
      deskripsi: "Sangat baik dalam menganalisis penerapan nilai-nilai Pancasila dalam kehidupan."
    },
    {
      id: 3,
      nama_mapel: "Bahasa Indonesia",
      nilai_akhir: 90,
      deskripsi: "Sangat baik dalam menyusun teks Laporan Hasil Observasi secara runtut dan objektif."
    },
    {
      id: 4,
      nama_mapel: "Matematika",
      nilai_akhir: 78,
      deskripsi: "Menunjukkan penguasaan baik pada Sistem Persamaan Linear. Perlu bimbingan lebih lanjut pada materi Vektor."
    },
    {
      id: 5,
      nama_mapel: "Bahasa Inggris",
      nilai_akhir: 82,
      deskripsi: "Baik dalam memahami teks deskriptif lisan dan tulisan."
    }
  ]);

  const [ekstraList, setEkstraList] = useState([
    { id: 1, kegiatan: "Pramuka", predikat: "Baik", keterangan: "Aktif mengikuti seluruh kegiatan perkemahan." },
    { id: 2, kegiatan: "PMR", predikat: "Baik", keterangan: "Menunjukkan kepedulian tinggi dalam aksi medis." }
  ]);

  const [absensi, setAbsensi] = useState({ sakit: 2, izin: 1, alpha: 0 });
  const [catatanWali, setCatatanWali] = useState("Tingkatkan terus konsistensi belajar, terutama pada mata pelajaran eksak.");

  // Signature Metadata
  const [kotaSekolah, setKotaSekolah] = useState("Kota Sekolah");
  const [namaWaliKelas, setNamaWaliKelas] = useState("Nani Wijaya, S.Pd");
  const [nipWaliKelas, setNipWaliKelas] = useState("19800101 200501 2 003");
  const [namaKepsek, setNamaKepsek] = useState("Dr. H. Supriyadi, M.Pd");
  const [nipKepsek, setNipKepsek] = useState("19700202 199503 1 001");

  // Official Kurikulum Merdeka Fase Mapping Table
  const faseTableData = [
    { fase: 'Fase A', kelas: 'Kelas 1 – 2', tingkat: 'SD / MI / Sederajat' },
    { fase: 'Fase B', kelas: 'Kelas 3 – 4', tingkat: 'SD / MI / Sederajat' },
    { fase: 'Fase C', kelas: 'Kelas 5 – 6', tingkat: 'SD / MI / Sederajat' },
    { fase: 'Fase D', kelas: 'Kelas 7 – 9', tingkat: 'SMP / MTs / Sederajat' },
    { fase: 'Fase E', kelas: 'Kelas 10', tingkat: 'SMA / SMK / MA / Sederajat' },
    { fase: 'Fase F', kelas: 'Kelas 11 – 12', tingkat: 'SMA / SMK / MA / Sederajat' }
  ];

  // Auto-detect Fase based on Class Name
  const autoDetectFase = (className) => {
    if (!className) return 'E';
    const cUpper = String(className).toUpperCase();
    if (cUpper.includes('XI') || cUpper.includes('XII') || cUpper.includes('11') || cUpper.includes('12')) {
      return 'F';
    } else if (cUpper.includes('X') || cUpper.includes('10')) {
      return 'E';
    } else if (cUpper.includes('7') || cUpper.includes('8') || cUpper.includes('9') || cUpper.includes('VII') || cUpper.includes('VIII') || cUpper.includes('IX')) {
      return 'D';
    } else if (cUpper.includes('5') || cUpper.includes('6') || cUpper.includes('V') || cUpper.includes('VI')) {
      return 'C';
    } else if (cUpper.includes('3') || cUpper.includes('4') || cUpper.includes('III') || cUpper.includes('IV')) {
      return 'B';
    } else if (cUpper.includes('1') || cUpper.includes('2') || cUpper.includes('I') || cUpper.includes('II')) {
      return 'A';
    }
    return 'E';
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedKelas) {
      fetchSiswaByKelas(selectedKelas);
      const detected = autoDetectFase(selectedKelas);
      setFase(detected);
    }
  }, [selectedKelas]);

  useEffect(() => {
    if (selectedSiswaId) {
      loadRaporSiswa(selectedSiswaId);
    }
  }, [selectedSiswaId, selectedKelas, semester, tahunPelajaran]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [resK, resSekolah] = await Promise.all([
        api.get('/kelas').catch(() => ({ data: { data: [] } })),
        api.get('/sekolah').catch(() => ({ data: { data: null } }))
      ]);

      const kArr = resK.data?.data || [];
      setKelasList(kArr);
      if (kArr.length > 0) {
        const firstK = kArr[0].kode_kelas || kArr[0].id || kArr[0].nama_kelas;
        setSelectedKelas(firstK);
        setFase(autoDetectFase(kArr[0].nama_kelas || firstK));
      }

      if (resSekolah.data?.data) {
        setSekolahInfo(resSekolah.data.data);
        if (resSekolah.data.data.nama_kepala_sekolah) {
          setNamaKepsek(resSekolah.data.data.nama_kepala_sekolah);
        }
        if (resSekolah.data.data.nip_kepala_sekolah) {
          setNipKepsek(resSekolah.data.data.nip_kepala_sekolah);
        }
        if (resSekolah.data.data.kabupaten || resSekolah.data.data.kota) {
          setKotaSekolah(resSekolah.data.data.kabupaten || resSekolah.data.data.kota);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSiswaByKelas = async (kodeKelas) => {
    try {
      const res = await api.get('/siswa', { params: { kelas_id: kodeKelas } });
      if (res.data?.success && Array.isArray(res.data.data)) {
        setSiswaList(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedSiswaId(res.data.data[0].kode_siswa || res.data.data[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadRaporSiswa = async (siswaId) => {
    const sFound = siswaList.find(s => String(s.kode_siswa || s.id) === String(siswaId));
    if (sFound) {
      setCurrentSiswa({
        nama: sFound.nama_siswa || sFound.nama || 'Ahmad Fauzi',
        nis: sFound.nis || sFound.nis_nisn || '22231001',
        nisn: sFound.nisn || '0071234567',
        kelas: sFound.nama_kelas || sFound.kelas || selectedKelas || 'X-1'
      });
    } else {
      setCurrentSiswa({
        nama: 'Ahmad Fauzi',
        nis: '22231001',
        nisn: '0071234567',
        kelas: selectedKelas || 'X-1'
      });
    }

    // Load real grades for this student from DB scoped by class, year, and semester
    try {
      const semCode = semester.includes('1') ? '1' : '2';
      const res = await api.get(`/penilaian/matrix?kelas_id=${selectedKelas}&tahun_ajaran=${tahunPelajaran}&semester=${semCode}`);
      if (res.data?.success && res.data?.data?.komponen && res.data?.data?.students) {
        const rawKomponen = res.data.data.komponen || [];
        const rawNilaiMap = res.data.data.nilaiMap || {};
        const mapelMap = {};

        rawKomponen.forEach(k => {
          const mName = k.nama_mapel || k.nama_kategori || k.nama_komponen;
          if (!mapelMap[mName]) mapelMap[mName] = [];
          const score = (rawNilaiMap[siswaId] && rawNilaiMap[siswaId][k.id] !== undefined) ? parseFloat(rawNilaiMap[siswaId][k.id]) : 0;
          if (score > 0) mapelMap[mName].push(score);
        });

        const newNilai = Object.keys(mapelMap).map((mName, idx) => {
          const scores = mapelMap[mName];
          const avg = scores.length > 0 ? (scores.reduce((a,b)=>a+b, 0)/scores.length) : 80;
          const rounded = parseFloat(avg.toFixed(0));
          return {
            id: idx + 1,
            nama_mapel: mName,
            nilai_akhir: rounded,
            deskripsi: rounded >= 85
              ? `Menunjukkan penguasaan yang sangat baik dalam menganalisis dan memahami materi ${mName}.`
              : `Menunjukkan penguasaan baik pada materi ${mName}. Perlu bimbingan dan peningkatan konsistensi.`
          };
        });

        if (newNilai.length > 0) {
          setNilaiList(newNilai);
        }
      }
    } catch (e) {
      console.warn('Fallback to default mockup grades:', e);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="admin-rapor-container" style={{ padding: '20px 24px', background: '#f8fafc', minHeight: '100vh' }}>
      {/* STYLE UNTUK CETAK PDF */}
      <style>{`
        @media print {
          body { background: #ffffff !important; color: #000000 !important; font-family: 'Times New Roman', Times, serif !important; }
          .admin-rapor-controls, .portal-sidebar, .portal-navbar, .portal-brand-header, .fase-guide-card { display: none !important; }
          .portal-main-area, .portal-page-body { padding: 0 !important; margin: 0 !important; }
          .rapor-paper {
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .rapor-table th, .rapor-table td {
            border: 1px solid #000000 !important;
            color: #000000 !important;
          }
          .rapor-header-line {
            border-bottom: 2px solid #000000 !important;
          }
        }
      `}</style>

      {/* CONTROL BAR (SCREEN ONLY) */}
      <div className="admin-rapor-controls" style={{ background: '#ffffff', padding: 20, borderRadius: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Award color="#0284c7" size={22} /> E-Rapor Siswa (Laporan Hasil Belajar)
            </h2>
            <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0 0' }}>
              Cetak dan pratinjau lembar Rapor resmi Kurikulum Merdeka / K13
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => setShowFaseGuide(prev => !prev)}
              style={{
                background: '#f1f5f9',
                color: '#334155',
                border: '1px solid #cbd5e1',
                padding: '9px 14px',
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer'
              }}
            >
              <BookOpen size={15} color="#0284c7" /> Tabel Referensi Fase {showFaseGuide ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            <button
              onClick={handlePrint}
              style={{
                background: 'linear-gradient(135deg, #0284c7, #0369a1)',
                color: '#ffffff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: 12,
                fontWeight: 700,
                fontSize: 13,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)'
              }}
            >
              <Printer size={16} /> Cetak / Download PDF Rapor
            </button>
          </div>
        </div>

        {/* DATA RETENTION GUARANTEE NOTICE */}
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 12, padding: '10px 14px', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
          <ShieldCheck size={20} color="#059669" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: 11.5, color: '#065f46', lineHeight: 1.5 }}>
            <strong>Jaminan Historis Riwayat Rapor (Bebas Hilang Saat Kenaikan Kelas):</strong> Seluruh angka nilai dan rapor tersimpan aman per <em>(Tahun Pelajaran + Semester + Kelas)</em>. Ketika siswa naik dari Kelas X ke XI atau XII, riwayat rapor Kelas X tetap utuh dan dapat dibuka kembali kapan saja dengan memilih Tahun Pelajaran & Kelas terkait.
          </div>
        </div>

        {/* FILTERS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, background: '#f8fafc', padding: 14, borderRadius: 14, border: '1px solid #e2e8f0' }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4 }}>KELAS</label>
            <select
              className="form-control-admin"
              style={{ fontSize: 12, padding: '6px 10px', cursor: 'pointer' }}
              value={selectedKelas}
              onChange={e => setSelectedKelas(e.target.value)}
            >
              {kelasList.map(k => {
                const kVal = k.kode_kelas || k.id || k.nama_kelas;
                return (
                  <option key={kVal} value={kVal}>
                    {k.nama_kelas || k.nama || kVal}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4 }}>SISWA</label>
            <select
              className="form-control-admin"
              style={{ fontSize: 12, padding: '6px 10px', cursor: 'pointer' }}
              value={selectedSiswaId}
              onChange={e => setSelectedSiswaId(e.target.value)}
            >
              {siswaList.map(s => {
                const sVal = s.kode_siswa || s.id;
                return (
                  <option key={sVal} value={sVal}>
                    {s.nama_siswa || s.nama} (NIS: {s.nis || s.nis_nisn || '-'})
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4 }}>FASE (KURIKULUM MERDEKA)</label>
            <select className="form-control-admin" style={{ fontSize: 12, padding: '6px 10px' }} value={fase} onChange={e => setFase(e.target.value)}>
              <option value="A">Fase A (Kelas 1 - 2 SD / MI)</option>
              <option value="B">Fase B (Kelas 3 - 4 SD / MI)</option>
              <option value="C">Fase C (Kelas 5 - 6 SD / MI)</option>
              <option value="D">Fase D (Kelas 7 - 9 SMP / MTs)</option>
              <option value="E">Fase E (Kelas 10 SMA / SMK / MA)</option>
              <option value="F">Fase F (Kelas 11 - 12 SMA / SMK / MA)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4 }}>SEMESTER</label>
            <select className="form-control-admin" style={{ fontSize: 12, padding: '6px 10px' }} value={semester} onChange={e => setSemester(e.target.value)}>
              <option value="1 (Ganjil)">1 (Ganjil)</option>
              <option value="2 (Genap)">2 (Genap)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4 }}>TAHUN PELAJARAN</label>
            <select className="form-control-admin" style={{ fontSize: 12, padding: '6px 10px' }} value={tahunPelajaran} onChange={e => setTahunPelajaran(e.target.value)}>
              <option value="2025/2026">2025/2026</option>
              <option value="2026/2027">2026/2027</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', display: 'block', marginBottom: 4 }}>TANGGAL CETAK</label>
            <input
              type="text"
              className="form-control-admin"
              style={{ fontSize: 12, padding: '6px 10px' }}
              value={tanggalCetak}
              onChange={e => setTanggalCetak(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* COLLAPSIBLE OFFICIAL FASE GUIDE CARD */}
      {showFaseGuide && (
        <div className="fase-guide-card" style={{ background: '#ffffff', borderRadius: 16, padding: 18, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', marginBottom: 20, border: '1px solid #e2e8f0' }}>
          <h4 style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: 6 }}>
            <BookOpen size={16} color="#0284c7" /> Tabel Acuan Fase Kurikulum Merdeka (Resmi Disdik)
          </h4>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5 }}>
              <thead>
                <tr style={{ background: '#f8fafc', color: '#475569', textAlign: 'left', fontWeight: 800 }}>
                  <th style={{ padding: '8px 12px', border: '1px solid #e2e8f0', width: 100 }}>Fase</th>
                  <th style={{ padding: '8px 12px', border: '1px solid #e2e8f0', width: 160 }}>Jenjang Kelas</th>
                  <th style={{ padding: '8px 12px', border: '1px solid #e2e8f0' }}>Tingkat Sekolah / Sederajat</th>
                </tr>
              </thead>
              <tbody>
                {faseTableData.map(row => (
                  <tr key={row.fase} style={{ background: fase === row.fase.replace('Fase ', '') ? '#eff6ff' : '#ffffff' }}>
                    <td style={{ padding: '6px 12px', border: '1px solid #e2e8f0', fontWeight: 800, color: '#0284c7' }}>{row.fase}</td>
                    <td style={{ padding: '6px 12px', border: '1px solid #e2e8f0', fontWeight: 700 }}>{row.kelas}</td>
                    <td style={{ padding: '6px 12px', border: '1px solid #e2e8f0', color: '#334155' }}>{row.tingkat}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RAPOR PAPER CONTAINER */}
      <div className="rapor-paper" style={{ background: '#ffffff', margin: '0 auto', maxWidth: 920, padding: '40px 48px', borderRadius: 16, boxShadow: '0 8px 30px rgba(0,0,0,0.08)', fontFamily: 'serif', color: '#0f172a' }}>
        
        {/* HEADER TITLE */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ borderBottom: '2px solid #0f172a', borderTop: '2px solid #0f172a', padding: '6px 0' }}>
            <h1 style={{ fontSize: 17, fontWeight: 800, letterSpacing: '1px', margin: 0, textTransform: 'uppercase' }}>
              LAPORAN HASIL BELAJAR (RAPOR)
            </h1>
          </div>
        </div>

        {/* METADATA GRID HEADER */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px', fontSize: 13, marginBottom: 24, lineHeight: 1.6 }}>
          <div>
            <div style={{ display: 'flex' }}>
              <span style={{ width: 140, fontWeight: 600 }}>Nama Peserta Didik</span>
              <span>: <strong>{currentSiswa?.nama || 'Ahmad Fauzi'}</strong></span>
            </div>
            <div style={{ display: 'flex' }}>
              <span style={{ width: 140, fontWeight: 600 }}>NIS / NISN</span>
              <span>: {currentSiswa?.nis || '22231001'} / {currentSiswa?.nisn || '0071234567'}</span>
            </div>
            <div style={{ display: 'flex' }}>
              <span style={{ width: 140, fontWeight: 600 }}>Nama Sekolah</span>
              <span>: {sekolahInfo?.nama_sekolah || 'SMAN 1 MERDEKA'}</span>
            </div>
            <div style={{ display: 'flex' }}>
              <span style={{ width: 140, fontWeight: 600 }}>Alamat Sekolah</span>
              <span>: {sekolahInfo?.alamat || 'Jl. Pendidikan No. 12'}</span>
            </div>
          </div>

          <div>
            <div style={{ display: 'flex' }}>
              <span style={{ width: 130, fontWeight: 600 }}>Kelas</span>
              <span>: {currentSiswa?.kelas || selectedKelas || 'X-1'}</span>
            </div>
            <div style={{ display: 'flex' }}>
              <span style={{ width: 130, fontWeight: 600 }}>Fase</span>
              <span>: {fase}</span>
            </div>
            <div style={{ display: 'flex' }}>
              <span style={{ width: 130, fontWeight: 600 }}>Semester</span>
              <span>: {semester}</span>
            </div>
            <div style={{ display: 'flex' }}>
              <span style={{ width: 130, fontWeight: 600 }}>Tahun Pelajaran</span>
              <span>: {tahunPelajaran}</span>
            </div>
          </div>
        </div>

        <div style={{ borderBottom: '2px solid #0f172a', marginBottom: 24 }}></div>

        {/* SECTION A: NILAI DAN CAPAIAN PEMBELAJARAN */}
        <div style={{ marginBottom: 28 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 10, textTransform: 'uppercase' }}>
            A. NILAI DAN CAPAIAN PEMBELAJARAN
          </h3>

          <table className="rapor-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ border: '1px solid #0f172a', padding: '8px 10px', textAlign: 'center', width: 40 }}>No</th>
                <th style={{ border: '1px solid #0f172a', padding: '8px 12px', textAlign: 'left', minWidth: 180 }}>Mata Pelajaran</th>
                <th style={{ border: '1px solid #0f172a', padding: '8px 10px', textAlign: 'center', width: 90 }}>Nilai Akhir</th>
                <th style={{ border: '1px solid #0f172a', padding: '8px 12px', textAlign: 'left' }}>Capaian Kompetensi (Deskripsi)</th>
              </tr>
            </thead>
            <tbody>
              {nilaiList.map((item, idx) => (
                <tr key={item.id}>
                  <td style={{ border: '1px solid #0f172a', padding: '8px 10px', textAlign: 'center', verticalAlign: 'top' }}>{idx + 1}</td>
                  <td style={{ border: '1px solid #0f172a', padding: '8px 12px', fontWeight: 600, verticalAlign: 'top' }}>{item.nama_mapel}</td>
                  <td style={{ border: '1px solid #0f172a', padding: '8px 10px', textAlign: 'center', fontWeight: 800, fontSize: 13, verticalAlign: 'top' }}>
                    {item.nilai_akhir}
                  </td>
                  <td style={{ border: '1px solid #0f172a', padding: '8px 12px', verticalAlign: 'top', lineHeight: 1.5 }}>
                    {item.deskripsi}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* SECTION B: EKSTRAKURIKULER */}
        <div style={{ marginBottom: 28 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 10, textTransform: 'uppercase' }}>
            B. EKSTRAKURIKULER
          </h3>

          <table className="rapor-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th style={{ border: '1px solid #0f172a', padding: '8px 10px', textAlign: 'center', width: 40 }}>No</th>
                <th style={{ border: '1px solid #0f172a', padding: '8px 12px', textAlign: 'left', minWidth: 180 }}>Kegiatan Ekstrakurikuler</th>
                <th style={{ border: '1px solid #0f172a', padding: '8px 10px', textAlign: 'center', width: 90 }}>Predikat</th>
                <th style={{ border: '1px solid #0f172a', padding: '8px 12px', textAlign: 'left' }}>Keterangan / Catatan</th>
              </tr>
            </thead>
            <tbody>
              {ekstraList.map((ek, idx) => (
                <tr key={ek.id}>
                  <td style={{ border: '1px solid #0f172a', padding: '8px 10px', textAlign: 'center' }}>{idx + 1}</td>
                  <td style={{ border: '1px solid #0f172a', padding: '8px 12px', fontWeight: 600 }}>{ek.kegiatan}</td>
                  <td style={{ border: '1px solid #0f172a', padding: '8px 10px', textAlign: 'center', fontWeight: 700 }}>{ek.predikat}</td>
                  <td style={{ border: '1px solid #0f172a', padding: '8px 12px' }}>{ek.keterangan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* SECTION C: KETIDAKHADIRAN */}
        <div style={{ marginBottom: 28 }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 10, textTransform: 'uppercase' }}>
            C. KETIDAKHADIRAN
          </h3>

          <div style={{ border: '1px solid #0f172a', padding: '12px 18px', maxWidth: 360, borderRadius: 4, fontSize: 12, lineHeight: 1.8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Sakit</span>
              <span>: <strong>{absensi.sakit} hari</strong></span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Izin</span>
              <span>: <strong>{absensi.izin} hari</strong></span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Tanpa Keterangan</span>
              <span>: <strong>{absensi.alpha} hari</strong></span>
            </div>
          </div>
        </div>

        {/* CATATAN WALI KELAS */}
        <div style={{ marginBottom: 40 }}>
          <h4 style={{ fontSize: 13, fontWeight: 800, marginBottom: 6 }}>Catatan Wali Kelas:</h4>
          <div style={{ border: '1px solid #0f172a', padding: '12px 16px', fontStyle: 'italic', fontSize: 12.5, borderRadius: 4, background: '#fafafa' }}>
            "{catatanWali}"
          </div>
        </div>

        {/* TANDA TANGAN FOOTER BLOCK */}
        <div style={{ pageBreakInside: 'avoid' }}>
          <div style={{ textAlign: 'right', marginBottom: 24, fontSize: 12 }}>
            {kotaSekolah}, {tanggalCetak}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, textAlign: 'center', fontSize: 12, lineHeight: 1.6 }}>
            {/* COLUMN 1: ORANG TUA */}
            <div>
              <div>Mengetahui,</div>
              <div style={{ fontWeight: 600 }}>Orang Tua / Wali Siswa,</div>
              <div style={{ height: 75 }}></div>
              <div>( ___________________ )</div>
            </div>

            {/* COLUMN 2: WALI KELAS */}
            <div>
              <div>&nbsp;</div>
              <div style={{ fontWeight: 600 }}>Wali Kelas,</div>
              <div style={{ height: 75 }}></div>
              <div style={{ fontWeight: 700, textDecoration: 'underline' }}>{namaWaliKelas}</div>
              <div style={{ fontSize: 11 }}>NIP. {nipWaliKelas}</div>
            </div>

            {/* COLUMN 3: KEPALA SEKOLAH */}
            <div>
              <div>&nbsp;</div>
              <div style={{ fontWeight: 600 }}>Kepala Sekolah,</div>
              <div style={{ height: 75 }}></div>
              <div style={{ fontWeight: 700, textDecoration: 'underline' }}>{namaKepsek}</div>
              <div style={{ fontSize: 11 }}>NIP. {nipKepsek}</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
