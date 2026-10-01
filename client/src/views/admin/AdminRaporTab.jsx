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
  const [kurikulumFormat, setKurikulumFormat] = useState('MERDEKA'); // 'MERDEKA' | 'K13'
  const [fase, setFase] = useState('E');
  const [semester, setSemester] = useState('1 (Ganjil)');
  const [tahunPelajaran, setTahunPelajaran] = useState('2025/2026');
  const [tanggalCetak, setTanggalCetak] = useState('20 Desember 2025');

  // Selected Student Detailed Data
  const [currentSiswa, setCurrentSiswa] = useState(null);

  // Rapor Components State
  const [nilaiGrouped, setNilaiGrouped] = useState({
    'Kelompok A (Umum)': [
      { id: 1, nama_mapel: "Pendidikan Agama Islam", nilai: 90, deskripsi: "Sangat Baik dalam memahami aqidah dan akhlak terpuji." },
      { id: 2, nama_mapel: "Pendidikan Pancasila", nilai: 90, deskripsi: "Sangat Baik dalam Mengamalkan nilai-nilai demokrasi." },
      { id: 3, nama_mapel: "Bahasa Indonesia", nilai: 90, deskripsi: "Sangat Baik dalam Menyusun opini." },
      { id: 4, nama_mapel: "Matematika", nilai: 90, deskripsi: "Sangat Baik dalam Menemukan konsep dan penyelesaian masalah matematika." },
      { id: 5, nama_mapel: "Geografi", nilai: 90, deskripsi: "Sangat Baik dalam menganalisis fenomena geosfer." },
      { id: 6, nama_mapel: "Bahasa Inggris", nilai: 80, deskripsi: "Baik dalam Memperkenalkan diri dengan menggunakan bahasa Inggris." },
      { id: 7, nama_mapel: "PJOK", nilai: 90, deskripsi: "Sangat Baik dalam kebugaran jasmani." }
    ],
    'Kelompok B (Umum)': [
      { id: 8, nama_mapel: "Pendidikan Seni dan Budaya", nilai: 90, deskripsi: "Sangat Baik dalam apresiasi karya seni." },
      { id: 9, nama_mapel: "Ekonomi", nilai: 90, deskripsi: "Sangat Baik dalam menganalisis prinsip ekonomi." },
      { id: 10, nama_mapel: "Sejarah", nilai: 80, deskripsi: "Baik dalam Menganalisis konsep berpikir sejarah (Sinkronik - Diakronik)." },
      { id: 11, nama_mapel: "Sosiologi", nilai: 90, deskripsi: "Sangat Baik dalam interaksi sosial." },
      { id: 12, nama_mapel: "Akuntansi", nilai: 90, deskripsi: "Sangat Baik dalam penyusunan laporan keuangan." }
    ],
    'Kelompok C (Peminatan)': [
      { id: 13, nama_mapel: "Bahasa Arab", nilai: 90, deskripsi: "Sangat Baik dalam percakapan sehari-hari." },
      { id: 14, nama_mapel: "Bahasa Jawa", nilai: 80, deskripsi: "Baik dalam memperkenalkan diri dengan menggunakan bahasa daerah yang fasih dan benar." }
    ]
  });

  const [ekstraList, setEkstraList] = useState([]);

  const [absensi, setAbsensi] = useState({ sakit: 0, izin: 0, alpha: 0 });
  const [catatanWali, setCatatanWali] = useState("Tingkatkan terus konsistensi belajar dan kedisiplinan di kelas.");

  // Signature Metadata
  const [kotaSekolah, setKotaSekolah] = useState("Kota Sekolah");
  const [namaWaliKelas, setNamaWaliKelas] = useState("Nani Wijaya, S.Pd");
  const [nipWaliKelas, setNipWaliKelas] = useState("19800101 200501 2 003");
  const [namaKepsek, setNamaKepsek] = useState("Dr. H. Supriyadi, M.Pd");
  const [nipKepsek, setNipKepsek] = useState("19700202 199503 1 001");

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedKelas) {
      fetchSiswaByKelas(selectedKelas);
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
      const res = await api.get('/siswa', { params: { kode_kelas: kodeKelas, kelas_id: kodeKelas } });
      if (res.data?.success && Array.isArray(res.data.data)) {
        setSiswaList(res.data.data);
        if (res.data.data.length > 0) {
          const firstS = res.data.data[0];
          setSelectedSiswaId(firstS.kode_siswa || firstS.id);
        } else {
          setSiswaList([]);
          setSelectedSiswaId('');
        }
      }
    } catch (err) {
      console.error(err);
      setSiswaList([]);
      setSelectedSiswaId('');
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

    try {
      const semCode = semester.includes('1') ? '1' : '2';
      const [resMatrix, resMapel, resKelasMapel] = await Promise.all([
        api.get(`/penilaian/matrix?kelas_id=${selectedKelas}&tahun_ajaran=${tahunPelajaran}&semester=${semCode}`).catch(() => null),
        api.get('/mapel').catch(() => null),
        api.get(`/kelas/${selectedKelas}/mapel`).catch(() => null)
      ]);

      let dbMapel = resMapel?.data?.data || [];
      const kelasMapelList = resKelasMapel?.data?.data || [];

      // If kelas has mapel mapping, filter to only show assigned mapel
      if (kelasMapelList.length > 0) {
        const assignedIds = new Set(kelasMapelList.map(km => km.mapel_id));
        dbMapel = dbMapel.filter(m => assignedIds.has(m.kode_mapel));
      }

      if (!Array.isArray(dbMapel) || dbMapel.length === 0) {
        dbMapel = [
          { nama_mapel: "Pendidikan Agama Islam", kelompok: "Kelompok A (Umum)" },
          { nama_mapel: "Pendidikan Pancasila", kelompok: "Kelompok A (Umum)" },
          { nama_mapel: "Bahasa Indonesia", kelompok: "Kelompok A (Umum)" },
          { nama_mapel: "Matematika", kelompok: "Kelompok A (Umum)" },
          { nama_mapel: "Bahasa Inggris", kelompok: "Kelompok A (Umum)" },
          { nama_mapel: "Sejarah", kelompok: "Kelompok A (Umum)" },
          { nama_mapel: "PJOK", kelompok: "Kelompok A (Umum)" },
          { nama_mapel: "Pendidikan Seni dan Budaya", kelompok: "Kelompok B (Umum)" },
          { nama_mapel: "Informatika / Prakarya", kelompok: "Kelompok B (Umum)" },
          { nama_mapel: "Bahasa Jawa / Daerah", kelompok: "Kelompok B (Umum)" },
          { nama_mapel: "Geografi", kelompok: "Kelompok C (Peminatan)" },
          { nama_mapel: "Ekonomi", kelompok: "Kelompok C (Peminatan)" },
          { nama_mapel: "Sosiologi", kelompok: "Kelompok C (Peminatan)" }
        ];
      }

      const rawKomponen = resMatrix?.data?.data?.komponen || [];
      const rawNilaiMap = resMatrix?.data?.data?.nilaiMap || {};

      const categorized = {
        'Kelompok A (Umum)': [],
        'Kelompok B (Umum)': [],
        'Kelompok C (Peminatan)': []
      };

      dbMapel.forEach((m, idx) => {
        const mName = m.nama_mapel || m.nama;
        let group = m.kelompok;
        if (!group) {
          const lower = mName.toLowerCase();
          if (lower.includes('agama') || lower.includes('pancasila') || lower.includes('indonesia') || lower.includes('matematika') || lower.includes('inggris') || lower.includes('sejarah') || lower.includes('pjok')) {
            group = 'Kelompok A (Umum)';
          } else if (lower.includes('seni') || lower.includes('budaya') || lower.includes('prakarya') || lower.includes('informatika') || lower.includes('daerah') || lower.includes('jawa')) {
            group = 'Kelompok B (Umum)';
          } else {
            group = 'Kelompok C (Peminatan)';
          }
        }
        if (!categorized[group]) categorized[group] = [];

        // Find matching component scores strictly from DB for this student
        const mapelKomps = rawKomponen.filter(k => (k.nama_mapel || k.nama_komponen || '').toLowerCase() === mName.toLowerCase());
        let scoreItems = [];

        mapelKomps.forEach(k => {
          const val = (rawNilaiMap[siswaId] && rawNilaiMap[siswaId][k.id] !== undefined) ? parseFloat(rawNilaiMap[siswaId][k.id]) : 0;
          if (val > 0) scoreItems.push({ score: val, nama_komponen: k.nama_komponen });
        });

        let finalScore = "-";
        let deskripsi = "Belum ada penilaian.";

        if (scoreItems.length > 0) {
          const calculatedAvg = Math.round(scoreItems.reduce((a,b)=>a+b.score, 0)/scoreItems.length);
          finalScore = calculatedAvg;

          const sorted = [...scoreItems].sort((a,b) => b.score - a.score);
          const highest = sorted[0];
          const lowest = sorted[sorted.length - 1];
          const highText = `Sangat Baik dalam ${highest.nama_komponen.toLowerCase()}.`;
          let lowText = "";
          if (lowest && lowest.score < 80 && lowest !== highest) {
            lowText = ` Perlu peningkatan pada materi ${lowest.nama_komponen.toLowerCase()}.`;
          }
          deskripsi = `${highText}${lowText}`;
        }

        categorized[group].push({
          id: m.kode_mapel || idx + 1,
          nama_mapel: mName,
          nilai: finalScore,
          deskripsi
        });
      });

      setNilaiGrouped(categorized);

      // Fetch ekskul data for this student
      try {
        const resEkskul = await api.get('/ekskul/rapor/siswa', {
          params: { siswa_id: siswaId, kelas_id: selectedKelas, tahun_ajaran: tahunPelajaran, semester: semCode }
        });
        const ekskulData = resEkskul.data?.data || [];
        setEkstraList(ekskulData.map((ek, i) => ({
          id: i + 1,
          kegiatan: ek.nama_ekskul,
          predikat: ek.predikat || 'Baik',
          keterangan: ek.keterangan || '-'
        })));
      } catch {
        setEkstraList([]);
      }

      // Fetch dynamic absensi (Ketidakhadiran) for this student
      try {
        const resAbsensi = await api.get('/absensi-siswa/rapor-summary', {
          params: { kode_siswa: siswaId, kode_kelas: selectedKelas, tahun_ajaran: tahunPelajaran, semester: semCode }
        });
        if (resAbsensi.data?.data) {
          setAbsensi({
            sakit: parseInt(resAbsensi.data.data.sakit || 0, 10),
            izin: parseInt(resAbsensi.data.data.izin || 0, 10),
            alpha: parseInt(resAbsensi.data.data.alpha || 0, 10)
          });
        }
      } catch {
        setAbsensi({ sakit: 0, izin: 0, alpha: 0 });
      }

    } catch (e) {
      console.warn('Error loading rapor:', e);
    }
  };

  const [showGroupSettingModal, setShowGroupSettingModal] = useState(false);
  const [allDbMapel, setAllDbMapel] = useState([]);
  const [updatingGroupMap, setUpdatingGroupMap] = useState({});

  const handleOpenGroupSetting = async () => {
    try {
      const res = await api.get('/mapel');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setAllDbMapel(res.data.data);
        const initialGroup = {};
        res.data.data.forEach(m => {
          initialGroup[m.kode_mapel] = m.kelompok || 'Kelompok A (Umum)';
        });
        setUpdatingGroupMap(initialGroup);
      }
    } catch (e) {}
    setShowGroupSettingModal(true);
  };

  const handleSaveMapelGroups = async () => {
    try {
      for (const m of allDbMapel) {
        const newGroup = updatingGroupMap[m.kode_mapel];
        if (newGroup && newGroup !== m.kelompok) {
          await api.put(`/mapel/${m.kode_mapel}`, { kelompok: newGroup }).catch(() => null);
        }
      }
      setShowGroupSettingModal(false);
      if (selectedSiswaId) {
        loadRaporSiswa(selectedSiswaId);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getPredikatK13 = (score) => {
    if (typeof score !== 'number') return '-';
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    return 'D';
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="admin-rapor-container" style={{ padding: '24px 28px 40px', background: '#f8fafc', minHeight: '100vh', boxSizing: 'border-box' }}>
      {/* STYLE UNTUK CETAK PDF */}
      <style>{`
        @media print {
          body { background: #ffffff !important; color: #000000 !important; font-family: 'Times New Roman', Times, serif !important; }
          .admin-rapor-controls, .portal-sidebar, .portal-navbar, .portal-brand-header { display: none !important; }
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
      <div className="admin-rapor-controls" style={{ background: '#ffffff', padding: '20px 24px', borderRadius: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.06)', marginBottom: 20, maxWidth: 960, margin: '0 auto 20px auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Award color="#0284c7" size={22} /> E-Rapor Siswa (Laporan Hasil Belajar)
            </h2>
            <p style={{ fontSize: 12, color: '#64748b', margin: '4px 0 0 0' }}>
              Cetak dan pratinjau lembar Rapor resmi Kurikulum Merdeka & K13
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleOpenGroupSetting}
              style={{
                background: '#f1f5f9',
                color: '#0284c7',
                border: '1px solid #bae6fd',
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
              <Edit3 size={15} /> Setting Kelompok Mapel (A/B/C)
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

        {/* FILTERS & CURRICULUM SETTING */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, background: '#f8fafc', padding: 14, borderRadius: 14, border: '1px solid #e2e8f0' }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: '#0284c7', display: 'block', marginBottom: 4 }}>FORMAT KURIKULUM</label>
            <select
              className="form-control-admin"
              style={{ fontSize: 12, padding: '6px 10px', cursor: 'pointer', fontWeight: 700, color: '#0284c7', borderColor: '#38bdf8' }}
              value={kurikulumFormat}
              onChange={e => setKurikulumFormat(e.target.value)}
            >
              <option value="MERDEKA">Kurikulum Merdeka (Fase A - F)</option>
              <option value="K13">Kurikulum 2013 (K13 / 2013)</option>
            </select>
          </div>

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

          {kurikulumFormat === 'MERDEKA' && (
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
          )}

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
        <div className="fase-guide-card" style={{ background: '#ffffff', borderRadius: 16, padding: '20px 24px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', marginBottom: 20, border: '1px solid #e2e8f0', maxWidth: 960, margin: '0 auto 20px auto' }}>
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
      <div className="rapor-paper" style={{ background: '#ffffff', margin: '0 auto', maxWidth: 960, padding: '36px 36px', borderRadius: 16, boxShadow: '0 8px 30px rgba(0,0,0,0.08)', fontFamily: 'serif', color: '#0f172a' }}>
        
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
            {kurikulumFormat === 'MERDEKA' ? (
              <div style={{ display: 'flex' }}>
                <span style={{ width: 130, fontWeight: 600 }}>Fase</span>
                <span>: {fase}</span>
              </div>
            ) : (
              <div style={{ display: 'flex' }}>
                <span style={{ width: 130, fontWeight: 600 }}>Kurikulum</span>
                <span>: Kurikulum 2013 (K13)</span>
              </div>
            )}
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

        {/* SECTION A: NILAI DAN CAPAIAN PEMBELAJARAN (GROUPED KELOMPOK A, B, C) */}
        <div style={{ marginBottom: 28 }}>
          <table className="rapor-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, border: '1px solid #0f172a' }}>
            <thead>
              <tr style={{ background: '#dbeafe', color: '#0f172a' }}>
                <th style={{ border: '1px solid #0f172a', padding: '8px 10px', textAlign: 'center', width: 45 }}>No</th>
                <th style={{ border: '1px solid #0f172a', padding: '8px 12px', textAlign: 'left', minWidth: 200 }}>Mata Pelajaran</th>
                <th style={{ border: '1px solid #0f172a', padding: '8px 10px', textAlign: 'center', width: 70 }}>Nilai</th>
                {kurikulumFormat === 'K13' && (
                  <th style={{ border: '1px solid #0f172a', padding: '8px 10px', textAlign: 'center', width: 70 }}>Predikat</th>
                )}
                <th style={{ border: '1px solid #0f172a', padding: '8px 12px', textAlign: 'left' }}>Capaian Kompetensi</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(nilaiGrouped).map((groupName) => {
                const list = nilaiGrouped[groupName] || [];
                if (list.length === 0) return null;

                return (
                  <React.Fragment key={groupName}>
                    {/* GROUP TITLE ROW */}
                    <tr style={{ background: '#f1f5f9', fontWeight: 800 }}>
                      <td colSpan={kurikulumFormat === 'K13' ? 5 : 4} style={{ border: '1px solid #0f172a', padding: '7px 12px', color: '#0f172a', textTransform: 'uppercase' }}>
                        {groupName}
                      </td>
                    </tr>

                    {/* GROUP SUBJECT ROWS */}
                    {list.map((item, idx) => (
                      <tr key={item.id || idx}>
                        <td style={{ border: '1px solid #0f172a', padding: '7px 10px', textAlign: 'center', verticalAlign: 'top' }}>{idx + 1}</td>
                        <td style={{ border: '1px solid #0f172a', padding: '7px 12px', fontWeight: 500, verticalAlign: 'top' }}>{item.nama_mapel}</td>
                        <td style={{ border: '1px solid #0f172a', padding: '7px 10px', textAlign: 'center', fontWeight: 700, fontSize: 13, verticalAlign: 'top' }}>
                          {item.nilai}
                        </td>
                        {kurikulumFormat === 'K13' && (
                          <td style={{ border: '1px solid #0f172a', padding: '7px 10px', textAlign: 'center', fontWeight: 700, fontSize: 12, verticalAlign: 'top' }}>
                            {getPredikatK13(item.nilai)}
                          </td>
                        )}
                        <td style={{ border: '1px solid #0f172a', padding: '7px 12px', verticalAlign: 'top', lineHeight: 1.4 }}>
                          {item.deskripsi}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* SECTION B: EKSTRAKURIKULER (LIGHT BLUE HEADER MATCHING SCREENSHOT) */}
        <div style={{ marginBottom: 24 }}>
          <table className="rapor-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, border: '1px solid #0f172a' }}>
            <thead>
              <tr style={{ background: '#dbeafe', color: '#0f172a' }}>
                <th style={{ border: '1px solid #0f172a', padding: '8px 10px', textAlign: 'center', width: 45 }}>No</th>
                <th style={{ border: '1px solid #0f172a', padding: '8px 12px', textAlign: 'left', width: 220 }}>Ekstrakurikuler</th>
                <th style={{ border: '1px solid #0f172a', padding: '8px 12px', textAlign: 'left' }}>Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {ekstraList.map((ek, idx) => (
                <tr key={ek.id}>
                  <td style={{ border: '1px solid #0f172a', padding: '7px 10px', textAlign: 'center' }}>{idx + 1}</td>
                  <td style={{ border: '1px solid #0f172a', padding: '7px 12px', fontWeight: 600 }}>{ek.kegiatan}</td>
                  <td style={{ border: '1px solid #0f172a', padding: '7px 12px', lineHeight: 1.4 }}>{ek.keterangan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CATATAN WALI KELAS (LIGHT BLUE HEADER MATCHING SCREENSHOT) */}
        <div style={{ marginBottom: 24 }}>
          <table className="rapor-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, border: '1px solid #0f172a' }}>
            <thead>
              <tr style={{ background: '#dbeafe', color: '#0f172a' }}>
                <th style={{ border: '1px solid #0f172a', padding: '8px 12px', textAlign: 'left' }}>Catatan Wali Kelas</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #0f172a', padding: '10px 14px', lineHeight: 1.5, fontSize: 12 }}>
                  {catatanWali}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* KETIDAKHADIRAN (LIGHT BLUE HEADER MATCHING SCREENSHOT) */}
        <div style={{ marginBottom: 32 }}>
          <table className="rapor-table" style={{ width: 360, borderCollapse: 'collapse', fontSize: 12, border: '1px solid #0f172a' }}>
            <thead>
              <tr style={{ background: '#dbeafe', color: '#0f172a' }}>
                <th colSpan={2} style={{ border: '1px solid #0f172a', padding: '8px 12px', textAlign: 'left' }}>Ketidakhadiran</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #0f172a', padding: '6px 12px', width: 180 }}>Sakit</td>
                <td style={{ border: '1px solid #0f172a', padding: '4px 12px', fontWeight: 700 }}>
                  <span className="no-print">
                    <input 
                      type="number" 
                      min="0"
                      value={absensi.sakit} 
                      onChange={(e) => setAbsensi(prev => ({ ...prev, sakit: parseInt(e.target.value, 10) || 0 }))}
                      style={{ width: 60, padding: '2px 6px', fontWeight: 700, border: '1px solid #cbd5e1', borderRadius: 4 }}
                    /> Hari
                  </span>
                  <span className="print-only">{absensi.sakit} Hari</span>
                </td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #0f172a', padding: '6px 12px' }}>Izin</td>
                <td style={{ border: '1px solid #0f172a', padding: '4px 12px', fontWeight: 700 }}>
                  <span className="no-print">
                    <input 
                      type="number" 
                      min="0"
                      value={absensi.izin} 
                      onChange={(e) => setAbsensi(prev => ({ ...prev, izin: parseInt(e.target.value, 10) || 0 }))}
                      style={{ width: 60, padding: '2px 6px', fontWeight: 700, border: '1px solid #cbd5e1', borderRadius: 4 }}
                    /> Hari
                  </span>
                  <span className="print-only">{absensi.izin} Hari</span>
                </td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #0f172a', padding: '6px 12px' }}>Tanpa Keterangan</td>
                <td style={{ border: '1px solid #0f172a', padding: '4px 12px', fontWeight: 700 }}>
                  <span className="no-print">
                    <input 
                      type="number" 
                      min="0"
                      value={absensi.alpha} 
                      onChange={(e) => setAbsensi(prev => ({ ...prev, alpha: parseInt(e.target.value, 10) || 0 }))}
                      style={{ width: 60, padding: '2px 6px', fontWeight: 700, border: '1px solid #cbd5e1', borderRadius: 4 }}
                    /> Hari
                  </span>
                  <span className="print-only">{absensi.alpha} Hari</span>
                </td>
              </tr>
            </tbody>
          </table>
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

      {/* MODAL SETTING KELOMPOK MAPEL */}
      {showGroupSettingModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: 640 }}>
            <div className="admin-modal-header">
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Edit3 size={18} color="#0284c7" /> Pengaturan Kelompok Mapel (A, B, C)
              </h3>
              <button
                onClick={() => setShowGroupSettingModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              <p style={{ fontSize: 12, color: '#64748b', marginBottom: 14 }}>
                Atur pengelompokan mata pelajaran di lembar Rapor ke <strong>Kelompok A (Umum)</strong>, <strong>Kelompok B (Umum)</strong>, atau <strong>Kelompok C (Peminatan)</strong>:
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {allDbMapel.map(m => (
                  <div key={m.kode_mapel} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc', padding: '10px 14px', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 13 }}>
                      {m.nama_mapel}
                    </div>
                    <select
                      className="form-control-admin"
                      style={{ width: 220, fontSize: 12, padding: '5px 8px' }}
                      value={updatingGroupMap[m.kode_mapel] || 'Kelompok A (Umum)'}
                      onChange={e => setUpdatingGroupMap({ ...updatingGroupMap, [m.kode_mapel]: e.target.value })}
                    >
                      <option value="Kelompok A (Umum)">Kelompok A (Umum)</option>
                      <option value="Kelompok B (Umum)">Kelompok B (Umum)</option>
                      <option value="Kelompok C (Peminatan)">Kelompok C (Peminatan)</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>

            <div className="admin-modal-footer">
              <button type="button" className="btn-outline-admin" onClick={() => setShowGroupSettingModal(false)}>
                Batal
              </button>
              <button type="button" className="btn-primary-admin" onClick={handleSaveMapelGroups}>
                Simpan Kelompok Mapel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
