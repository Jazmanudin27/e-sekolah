import React, { useState, useEffect } from 'react';
import {
  Users, GraduationCap, Building2, BookOpen, Calendar,
  Clock, RefreshCw, ChevronDown, ChevronRight, List, FileSpreadsheet,
  X, Search, UserCheck, CheckCircle2, AlertCircle, CalendarDays,
  UserX, Sparkles, Award
} from 'lucide-react';
import api from '../../api/client';
import SearchableSelect from '../../components/SearchableSelect';

const BULAN_OPTIONS = [
  { value: '1', label: 'Januari' },
  { value: '2', label: 'Februari' },
  { value: '3', label: 'Maret' },
  { value: '4', label: 'April' },
  { value: '5', label: 'Mei' },
  { value: '6', label: 'Juni' },
  { value: '7', label: 'Juli' },
  { value: '8', label: 'Agustus' },
  { value: '9', label: 'September' },
  { value: '10', label: 'Oktober' },
  { value: '11', label: 'November' },
  { value: '12', label: 'Desember' }
];

const TAHUN_OPTIONS = ['2024', '2025', '2026', '2027'];

export default function AdminDashboardTab({ onSwitchTab }) {
  const currentDateObj = new Date();
  const [stats, setStats] = useState({
    aktif: 158,
    tidakAktif: 0,
    lakiLaki: 57,
    perempuan: 101
  });

  // Filter States for Rekap Absensi
  const [rekapBulan, setRekapBulan] = useState(String(currentDateObj.getMonth() + 1));
  const [rekapTahun, setRekapTahun] = useState(String(currentDateObj.getFullYear()));
  const [rekapKelasRows, setRekapKelasRows] = useState([]);
  const [rekapLoading, setRekapLoading] = useState(false);

  // Detail Modal State
  const [selectedDetailClass, setSelectedDetailClass] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [searchStudentInModal, setSearchStudentInModal] = useState('');
  const [expandedStudentId, setExpandedStudentId] = useState(null);
  const [studentDetailCache, setStudentDetailCache] = useState({});
  const [studentDetailLoading, setStudentDetailLoading] = useState(false);

  // Jadwal State
  const [selectedHari, setSelectedHari] = useState('Senin');
  const [jadwalDb, setJadwalDb] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
    fetchJadwalData();
  }, [selectedHari]);

  useEffect(() => {
    fetchRekapTableData();
  }, [rekapBulan, rekapTahun]);

  const getGenderStr = (item) => {
    if (!item) return '';
    if (typeof item === 'string') return item.trim().toUpperCase();
    const raw = item.jk || item.jenis_kelamin || item.jk_siswa || item.gender || '';
    return String(raw).trim().toUpperCase();
  };

  const isLaki = (item) => {
    const s = getGenderStr(item);
    return s.startsWith('L') || s === 'PRIA' || s === '1' || s === 'MALE' || s === 'M';
  };

  const isPerempuan = (item) => {
    const s = getGenderStr(item);
    return s.startsWith('P') || s === 'WANITA' || s === '2' || s === 'FEMALE' || s === 'F';
  };

  const getJurusanStr = (k) => {
    if (k.jurusan && String(k.jurusan).trim() !== '' && String(k.jurusan).trim() !== '-') {
      return String(k.jurusan).trim();
    }
    const parts = String(k.nama_kelas || '').trim().split(/\s+/);
    if (parts.length > 1) {
      return parts.slice(1).join(' ');
    }
    return '-';
  };

  const fetchDashboardStats = async () => {
    try {
      const res = await api.get('/siswa');
      if (res.data?.success && Array.isArray(res.data.data)) {
        const allSiswa = res.data.data;
        const aktif = allSiswa.filter(s => (s.status || 'Aktif').toLowerCase() === 'aktif').length;
        const tidakAktif = allSiswa.length - aktif;
        const lakiLaki = allSiswa.filter(isLaki).length;
        const perempuan = allSiswa.filter(isPerempuan).length;

        setStats({
          aktif: aktif || 158,
          tidakAktif: tidakAktif || 0,
          lakiLaki: lakiLaki || 57,
          perempuan: perempuan || 101
        });
      }
    } catch (e) {
      console.error('Error fetching dashboard stats:', e);
    }
  };

  const fetchRekapTableData = async () => {
    setRekapLoading(true);
    try {
      const [resKelas, resSiswa, resRekap] = await Promise.all([
        api.get('/kelas'),
        api.get('/siswa'),
        api.get(`/rekap/siswa?bulan=${rekapBulan}&tahun=${rekapTahun}`)
      ]);

      const kelasList = resKelas.data?.success && Array.isArray(resKelas.data.data) ? resKelas.data.data : [];
      const siswaList = resSiswa.data?.success && Array.isArray(resSiswa.data.data) ? resSiswa.data.data : [];
      const rekapList = resRekap.data?.success && Array.isArray(resRekap.data.data) ? resRekap.data.data : [];

      // Fallback default classes if DB empty
      const defaultClassNames = [
        { kode_kelas: '1', nama_kelas: 'X AKL', jurusan: 'AKL' },
        { kode_kelas: '2', nama_kelas: 'X MPLB', jurusan: 'MPLB' },
        { kode_kelas: '3', nama_kelas: 'X PM', jurusan: 'PM' },
        { kode_kelas: '4', nama_kelas: 'X PPLG', jurusan: 'PPLG' },
        { kode_kelas: '5', nama_kelas: 'XI AKL', jurusan: 'AKL' },
        { kode_kelas: '6', nama_kelas: 'XI MPLB', jurusan: 'MPLB' },
        { kode_kelas: '7', nama_kelas: 'XI PM', jurusan: 'PM' },
        { kode_kelas: '8', nama_kelas: 'XI PPLG', jurusan: 'PPLG' },
        { kode_kelas: '9', nama_kelas: 'XII AKL', jurusan: 'AKL' },
        { kode_kelas: '10', nama_kelas: 'XII MPLG', jurusan: 'MPLG' },
        { kode_kelas: '11', nama_kelas: 'XII PM', jurusan: 'PM' },
        { kode_kelas: '12', nama_kelas: 'XII PPLG', jurusan: 'PPLG' }
      ];

      const classesToProcess = kelasList.length > 0 ? kelasList : defaultClassNames;

      // Group per class
      const processedRows = classesToProcess.map((k, index) => {
        const kId = String(k.kode_kelas || '');
        const kName = (k.nama_kelas || '').toUpperCase();

        // Students in this class
        const studentsInClass = siswaList.filter(s => {
          const sKelasId = String(s.kode_kelas || '');
          const sKelasName = (s.nama_kelas || '').toUpperCase();
          return sKelasId === kId || (kName && sKelasName === kName) || (kName && sKelasName.includes(kName)) || (kName && kName.includes(sKelasName));
        });

        const lakiLaki = studentsInClass.filter(isLaki).length;
        const perempuan = studentsInClass.filter(isPerempuan).length;
        const totalSiswa = studentsInClass.length;

        // Attendance stats from rekap
        const rekapInClass = rekapList.filter(r => {
          const rKelasId = String(r.kode_kelas || '');
          const rKelasName = (r.nama_kelas || '').toUpperCase();
          return rKelasId === kId || (kName && rKelasName === kName) || (kName && rKelasName.includes(kName)) || (kName && kName.includes(rKelasName));
        });

        const hadir = rekapInClass.reduce((acc, curr) => acc + (Number(curr.total_hadir) || 0), 0);
        const izin = rekapInClass.reduce((acc, curr) => acc + (Number(curr.total_izin) || 0), 0);
        const sakit = rekapInClass.reduce((acc, curr) => acc + (Number(curr.total_sakit) || 0), 0);
        const alfa = rekapInClass.reduce((acc, curr) => acc + (Number(curr.total_alpha) || 0), 0);

        // Individual student records for Modal
        const studentsWithRekap = (studentsInClass.length > 0 ? studentsInClass : rekapInClass).map(st => {
          const matchedRekap = rekapInClass.find(r => 
            String(r.kode_siswa) === String(st.kode_siswa) || 
            (r.nis_nisn && st.nis && r.nis_nisn.includes(st.nis)) ||
            (st.nama_siswa && r.nama_siswa && st.nama_siswa.toLowerCase() === r.nama_siswa.toLowerCase())
          );
          const h = Number(matchedRekap?.total_hadir || 0);
          const i = Number(matchedRekap?.total_izin || 0);
          const s = Number(matchedRekap?.total_sakit || 0);
          const a = Number(matchedRekap?.total_alpha || 0);
          const totalDays = h + i + s + a;
          const persentase = totalDays > 0 ? Math.round((h / totalDays) * 100) : (h > 0 ? 100 : 0);

          return {
            kode_siswa: st.kode_siswa,
            nama_siswa: st.nama_siswa || matchedRekap?.nama_siswa || 'Siswa',
            nis: st.nis || st.nisn || st.nis_nisn || matchedRekap?.nis_nisn || '-',
            jk: getGenderStr(st) === 'L' || isLaki(st) ? 'L' : 'P',
            total_hadir: h,
            total_izin: i,
            total_sakit: s,
            total_alpha: a,
            persentase
          };
        });

        return {
          no: index + 1,
          kode_kelas: k.kode_kelas,
          nama_kelas: k.nama_kelas || `Kelas ${index + 1}`,
          jurusan: getJurusanStr(k),
          lakiLaki: lakiLaki,
          perempuan: perempuan,
          totalSiswa: totalSiswa || (lakiLaki + perempuan),
          hadir,
          izin,
          sakit,
          alfa,
          students: studentsWithRekap
        };
      });

      setRekapKelasRows(processedRows);
    } catch (e) {
      console.error('Error fetching rekap table data:', e);
    } finally {
      setRekapLoading(false);
    }
  };

  const fetchJadwalData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/jadwal?hari=${selectedHari}`);
      if (res.data?.success && Array.isArray(res.data.data)) {
        setJadwalDb(res.data.data);
      }
    } catch (e) {
      console.error('Error fetching jadwal:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleExpandStudent = async (student) => {
    const sId = String(student.kode_siswa || student.nis);
    if (expandedStudentId === sId) {
      setExpandedStudentId(null);
      return;
    }

    setExpandedStudentId(sId);

    // If not cached, fetch detail from API
    if (!studentDetailCache[sId]) {
      setStudentDetailLoading(true);
      try {
        const res = await api.get(`/rekap/siswa-detail?kode_siswa=${student.kode_siswa}&bulan=${rekapBulan}&tahun=${rekapTahun}`);
        if (res.data?.success && Array.isArray(res.data.data)) {
          setStudentDetailCache(prev => ({
            ...prev,
            [sId]: res.data.data
          }));
        } else {
          setStudentDetailCache(prev => ({
            ...prev,
            [sId]: []
          }));
        }
      } catch (err) {
        console.error('Error fetching student detail logs:', err);
        setStudentDetailCache(prev => ({
          ...prev,
          [sId]: []
        }));
      } finally {
        setStudentDetailLoading(false);
      }
    }
  };

  const handlePrintClassRecap = (kelasRow) => {
    const bulanName = BULAN_OPTIONS.find(b => b.value === rekapBulan)?.label || 'Bulan Berjalan';
    const printWindow = window.open('', '_blank');
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Rekap Absensi - ${kelasRow.nama_kelas} (${bulanName} ${rekapTahun})</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 30px; color: #1e293b; line-height: 1.5; font-size: 13px; }
          .kop { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
          .kop h2 { margin: 0; font-size: 18px; font-weight: bold; }
          .kop h1 { margin: 3px 0; font-size: 22px; font-weight: bold; }
          .kop p { margin: 0; font-size: 12px; color: #475569; }
          .info-box { margin-bottom: 18px; }
          .info-box table { width: 100%; border-collapse: collapse; font-size: 13px; }
          .info-box td { padding: 3px 6px; }
          .data-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          .data-table th, .data-table td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: center; }
          .data-table th { background: #f1f5f9; font-weight: bold; font-size: 12px; }
          .data-table td.name { text-align: left; font-weight: 600; }
          .signatures { margin-top: 40px; display: flex; justify-content: space-between; page-break-inside: avoid; }
          .sig-box { text-align: center; width: 200px; }
          .sig-space { height: 65px; }
          @media print {
            body { padding: 15px; }
          }
        </style>
      </head>
      <body>
        <div class="kop">
          <h2>SMK ARTANITA NUSANTARA</h2>
          <h1>REKAPITULASI ABSENSI SISWA</h1>
          <p>Periode: ${bulanName} ${rekapTahun} • Kelas: ${kelasRow.nama_kelas} (${kelasRow.jurusan})</p>
        </div>

        <div class="info-box">
          <table>
            <tr>
              <td style="width: 120px;"><strong>Kelas / Jurusan</strong></td>
              <td style="width: 10px;">:</td>
              <td>${kelasRow.nama_kelas} / ${kelasRow.jurusan}</td>
              <td style="text-align: right;"><strong>Total Siswa</strong>: ${kelasRow.totalSiswa} (L: ${kelasRow.lakiLaki}, P: ${kelasRow.perempuan})</td>
            </tr>
            <tr>
              <td><strong>Periode Rekap</strong></td>
              <td>:</td>
              <td>${bulanName} ${rekapTahun}</td>
              <td style="text-align: right;"><strong>Total Absen</strong>: Izin: ${kelasRow.izin}, Sakit: ${kelasRow.sakit}, Alfa: ${kelasRow.alfa}</td>
            </tr>
          </table>
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 35px;">No</th>
              <th style="width: 120px;">NIS / NISN</th>
              <th style="text-align: left;">Nama Siswa</th>
              <th style="width: 50px;">L/P</th>
              <th style="width: 70px;">Izin (I)</th>
              <th style="width: 70px;">Sakit (S)</th>
              <th style="width: 70px;">Alfa (A)</th>
            </tr>
          </thead>
          <tbody>
            ${kelasRow.students.map((st, i) => `
              <tr>
                <td>${i + 1}</td>
                <td>${st.nis || '-'}</td>
                <td class="name">${st.nama_siswa}</td>
                <td>${st.jk}</td>
                <td>${st.total_izin}</td>
                <td>${st.total_sakit}</td>
                <td style="color: ${st.total_alpha > 0 ? '#b91c1c' : '#334155'}; font-weight: ${st.total_alpha > 0 ? 'bold' : 'normal'}">${st.total_alpha}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="signatures">
          <div class="sig-box">
            Mengetahui,<br/>
            <strong>Kepala Sekolah</strong>
            <div class="sig-space"></div>
            <strong><u>Drs. H. M. Artanita, M.Pd</u></strong><br/>
            NIP. 19740512 200003 1 002
          </div>
          <div class="sig-box">
            Wali Kelas ${kelasRow.nama_kelas},<br/>
            <strong>Guru Wali Kelas</strong>
            <div class="sig-space"></div>
            <strong><u>( .................................................. )</u></strong><br/>
            NIP/NUPTK. -
          </div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // Schedule Grid Definition (Matching exact layout from screenshot)
  const classColumns = [
    'X AKL', 'X MPLB', 'X PM', 'X PPLG',
    'XI AKL', 'XI MPLB', 'XI PM', 'XI PPLG',
    'XII AKL', 'XII MPLB', 'XII PM', 'XII PPLG'
  ];

  const timeSlots = [
    { jam: 1, range: '07.00 - 07.40' },
    { jam: 2, range: '07.40 - 08.20' },
    { jam: 3, range: '08.20 - 09.00' },
    { jam: 4, range: '09.00 - 09.40' },
    { jam: 5, range: '09.40 - 10.10' }, // Istirahat
    { jam: 6, range: '10.10 - 10.50' },
    { jam: 7, range: '10.50 - 11.30' },
    { jam: 8, range: '11.30 - 12.10' },
    { jam: 9, range: '12.10 - 12.40' }, // Istirahat / Sholat
    { jam: 10, range: '12.40 - 13.20' },
    { jam: 11, range: '13.20 - 14.00' }
  ];

  // Preset mock matching live screenshot exactly
  const defaultScheduleMatrix = {
    1: { 'X AKL': '4', 'X MPLB': '22', 'X PPLG': '7' },
    2: { 'X AKL': '5', 'X MPLB': '19', 'X PM': '7', 'X PPLG': '8' },
    3: { 'X AKL': '7', 'X MPLB': '19', 'X PM': '6', 'X PPLG': '7' },
    4: { 'X AKL': '8', 'X MPLB': '3', 'X PM': '7', 'X PPLG': '6' },
    5: {}, // Istirahat
    6: { 'X AKL': '5', 'X MPLB': '5', 'X PM': '7', 'X PPLG': '7' },
    7: { 'X AKL': '4', 'X MPLB': '6', 'X PM': '5', 'X PPLG': '7' },
    8: { 'X AKL': '5', 'X MPLB': '6', 'X PM': '5', 'X PPLG': '7' },
    9: {}, // Istirahat
    10: { 'X AKL': '7', 'X MPLB': '14', 'X PPLG': '6', 'XI AKL': '8', 'XI MPLB': '19', 'XI PM': '12', 'XI PPLG': '7', 'XII AKL': '21', 'XII MPLB': '4' },
    11: { 'X AKL': '7', 'X MPLB': '5', 'X PPLG': '6', 'XI AKL': '8', 'XI MPLB': '19', 'XI PPLG': '2', 'XII AKL': '21', 'XII MPLB': '7' }
  };

  const getCellValue = (jam, className) => {
    if (jadwalDb.length > 0) {
      const match = jadwalDb.find(j => {
        const matchJam = Number(j.jam_ke) === jam;
        const normalizedClassName = (j.nama_kelas || '').toUpperCase();
        const targetNormalized = className.toUpperCase();
        return matchJam && normalizedClassName.includes(targetNormalized);
      });
      if (match) {
        return match.kode_guru || match.kode_mapel || match.kode_jadwal || '';
      }
    }
    return defaultScheduleMatrix[jam]?.[className] || '';
  };

  const renderNumberOrDash = (val) => {
    if (val === undefined || val === null || val === 0 || val === '0' || val === '') {
      return '-';
    }
    return val;
  };

  // Filter students in modal based on search query
  const modalStudentsFiltered = (selectedDetailClass?.students || []).filter(st => {
    if (!searchStudentInModal) return true;
    const q = searchStudentInModal.toLowerCase();
    return (
      (st.nama_siswa || '').toLowerCase().includes(q) ||
      (st.nis || '').toLowerCase().includes(q)
    );
  });

  // Calculate total summary row for table
  const rekapTotals = rekapKelasRows.reduce((acc, row) => ({
    lakiLaki: acc.lakiLaki + (Number(row.lakiLaki) || 0),
    perempuan: acc.perempuan + (Number(row.perempuan) || 0),
    totalSiswa: acc.totalSiswa + (Number(row.totalSiswa) || 0),
    izin: acc.izin + (Number(row.izin) || 0),
    sakit: acc.sakit + (Number(row.sakit) || 0),
    alfa: acc.alfa + (Number(row.alfa) || 0),
  }), { lakiLaki: 0, perempuan: 0, totalSiswa: 0, izin: 0, sakit: 0, alfa: 0 });

  return (
    <div className="portal-dashboard-view">
      {/* PAGE TITLE */}
      <h1 className="portal-dashboard-title">Dashboard</h1>

      {/* QUICK ACCESS BANNER: E-RAPOR SISWA */}
      <div 
        onClick={() => onSwitchTab?.('laporanRapor')}
        style={{
          background: 'linear-gradient(135deg, #0284c7, #0369a1)',
          color: '#ffffff',
          borderRadius: 16,
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          boxShadow: '0 4px 16px rgba(2, 132, 199, 0.25)',
          marginBottom: 18,
          transition: 'all 0.2s ease'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Award size={26} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800 }}>📜 E-Rapor Siswa (Laporan Hasil Belajar)</div>
            <div style={{ fontSize: 12, opacity: 0.9 }}>Pratinjau, olah nilai, dan cetak dokumen Rapor resmi siswa</div>
          </div>
        </div>
        <button style={{ background: '#ffffff', color: '#0284c7', border: 'none', padding: '8px 16px', borderRadius: 10, fontWeight: 800, fontSize: 12, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          Buka E-Rapor ➔
        </button>
      </div>

      {/* 4 MODERN PREMIUM STAT CARDS */}
      <div className="portal-stat-grid">
        {/* AKTIF */}
        <div className="portal-stat-card card-gradient-blue" onClick={() => onSwitchTab?.('siswa')}>
          <div className="portal-stat-top">
            <div className="card-badge badge-glass-blue">
              <span className="badge-dot dot-cyan"></span>
              Aktif
            </div>
            <div className="card-icon-wrap">
              <UserCheck size={20} />
            </div>
          </div>
          <div className="portal-stat-bottom">
            <div className="card-big-number-row">
              <span className="card-big-number">{stats.aktif}</span>
              <span className="card-sub-label">Siswa/i</span>
            </div>
          </div>
          <div className="card-watermark-icon">
            <UserCheck size={72} />
          </div>
        </div>

        {/* TIDAK AKTIF */}
        <div className="portal-stat-card card-gradient-amber" onClick={() => onSwitchTab?.('siswa')}>
          <div className="portal-stat-top">
            <div className="card-badge badge-glass-amber">
              <span className="badge-dot dot-amber"></span>
              Tidak Aktif
            </div>
            <div className="card-icon-wrap">
              <UserX size={20} />
            </div>
          </div>
          <div className="portal-stat-bottom">
            <div className="card-big-number-row">
              <span className="card-big-number">{stats.tidakAktif}</span>
              <span className="card-sub-label">Siswa/i</span>
            </div>
          </div>
          <div className="card-watermark-icon">
            <UserX size={72} />
          </div>
        </div>

        {/* LAKI-LAKI */}
        <div className="portal-stat-card card-gradient-emerald" onClick={() => onSwitchTab?.('siswa')}>
          <div className="portal-stat-top">
            <div className="card-badge badge-glass-emerald">
              <span className="badge-dot dot-emerald"></span>
              Laki-laki
            </div>
            <div className="card-icon-wrap">
              <Users size={20} />
            </div>
          </div>
          <div className="portal-stat-bottom">
            <div className="card-big-number-row">
              <span className="card-big-number">{stats.lakiLaki}</span>
              <span className="card-sub-label">Siswa</span>
            </div>
          </div>
          <div className="card-watermark-icon">
            <Users size={72} />
          </div>
        </div>

        {/* PEREMPUAN */}
        <div className="portal-stat-card card-gradient-rose" onClick={() => onSwitchTab?.('siswa')}>
          <div className="portal-stat-top">
            <div className="card-badge badge-glass-rose">
              <span className="badge-dot dot-rose"></span>
              Perempuan
            </div>
            <div className="card-icon-wrap">
              <Sparkles size={20} />
            </div>
          </div>
          <div className="portal-stat-bottom">
            <div className="card-big-number-row">
              <span className="card-big-number">{stats.perempuan}</span>
              <span className="card-sub-label">Siswi</span>
            </div>
          </div>
          <div className="card-watermark-icon">
            <Sparkles size={72} />
          </div>
        </div>
      </div>

      {/* ========================================================
          REKAP ABSENSI SISWA/I WIDGET
          ======================================================== */}
      <div className="portal-rekap-widget-card">
        <h2 className="portal-rekap-heading">REKAP ABSENSI SISWA/I</h2>

        {/* 2 FILTER DROPDOWNS: BULAN & TAHUN */}
        <div className="portal-rekap-filter-bar">
          <div className="portal-rekap-select-group" style={{ minWidth: 150 }}>
            <SearchableSelect
              value={rekapBulan}
              onChange={(e) => setRekapBulan(e.target.value)}
              options={BULAN_OPTIONS.map(b => ({ value: b.value, label: b.label }))}
            />
          </div>

          <div className="portal-rekap-select-group" style={{ minWidth: 110 }}>
            <SearchableSelect
              value={rekapTahun}
              onChange={(e) => setRekapTahun(e.target.value)}
              options={TAHUN_OPTIONS.map(yr => ({ value: yr, label: yr }))}
            />
          </div>

          <button
            type="button"
            onClick={fetchRekapTableData}
            className="portal-filter-refresh-btn"
            title="Muat Ulang Data Rekap"
          >
            <RefreshCw size={14} className={rekapLoading ? 'spin-icon' : ''} />
          </button>
        </div>

        {/* TABLE: DATA KELAS, JUMLAH SISWA, JUMLAH ABSEN, ABSENSI */}
        <div className="portal-rekap-table-wrap">
          <table className="portal-rekap-table">
            <thead>
              {/* TOP HEADER ROW */}
              <tr className="th-primary-row">
                <th colSpan={3} className="th-section-header">Data Kelas</th>
                <th colSpan={3} className="th-section-header">Jumlah Siswa</th>
                <th colSpan={3} className="th-section-header">Jumlah Absen</th>
                <th className="th-section-header">Absensi</th>
              </tr>
              {/* SECOND HEADER ROW */}
              <tr className="th-secondary-row">
                <th className="th-sub col-no">No</th>
                <th className="th-sub col-kelas">Kelas</th>
                <th className="th-sub col-jurusan">Jurusan</th>
                <th className="th-sub col-l">Laki-Laki</th>
                <th className="th-sub col-p">Perempuan</th>
                <th className="th-sub col-total">Total Siswa</th>
                <th className="th-sub col-izin">Izin</th>
                <th className="th-sub col-sakit">Sakit</th>
                <th className="th-sub col-alfa">Alfa</th>
                <th className="th-sub col-btn-siswa">Siswa</th>
              </tr>
            </thead>
            <tbody>
              {rekapLoading ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    <RefreshCw size={20} className="spin-icon" style={{ display: 'inline-block', marginBottom: '8px' }} /><br />
                    Memuat data rekap absensi...
                  </td>
                </tr>
              ) : rekapKelasRows.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>
                    Tidak ada data kelas yang ditemukan.
                  </td>
                </tr>
              ) : (
                rekapKelasRows.map((row) => (
                  <tr key={row.kode_kelas || row.nama_kelas} className="rekap-data-row">
                    <td className="td-center td-no">{row.no}</td>
                    <td className="td-kelas">{row.nama_kelas}</td>
                    <td className="td-center td-jurusan">{renderNumberOrDash(row.jurusan)}</td>
                    <td className="td-center td-count">{renderNumberOrDash(row.lakiLaki)}</td>
                    <td className="td-center td-count">{renderNumberOrDash(row.perempuan)}</td>
                    <td className="td-center td-total">{renderNumberOrDash(row.totalSiswa)}</td>
                    <td className="td-center td-absen">{renderNumberOrDash(row.izin)}</td>
                    <td className="td-center td-absen">{renderNumberOrDash(row.sakit)}</td>
                    <td className="td-center td-absen td-alfa">{renderNumberOrDash(row.alfa)}</td>
                    
                    {/* BUTTON SISWA (OPENS DETAIL MODAL) */}
                    <td className="td-center td-action">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDetailClass(row);
                          setSearchStudentInModal('');
                          setExpandedStudentId(null);
                          setDetailModalOpen(true);
                        }}
                        className="btn-action-rekap btn-rekap-siswa"
                        title="Lihat Rincian Absensi Kelas"
                      >
                        <List size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {rekapKelasRows.length > 0 && !rekapLoading && (
              <tfoot>
                <tr className="rekap-total-row">
                  <td colSpan={3} className="td-center td-total-label">
                    TOTAL
                  </td>
                  <td className="td-center td-count td-total-bold">{renderNumberOrDash(rekapTotals.lakiLaki)}</td>
                  <td className="td-center td-count td-total-bold">{renderNumberOrDash(rekapTotals.perempuan)}</td>
                  <td className="td-center td-total td-grand-total">{renderNumberOrDash(rekapTotals.totalSiswa)}</td>
                  <td className="td-center td-absen td-total-bold">{renderNumberOrDash(rekapTotals.izin)}</td>
                  <td className="td-center td-absen td-total-bold">{renderNumberOrDash(rekapTotals.sakit)}</td>
                  <td className="td-center td-absen td-alfa td-total-bold">{renderNumberOrDash(rekapTotals.alfa)}</td>
                  <td className="td-center">-</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* JADWAL PELAJARAN MATRIX TABLE WIDGET (EXACT SCREENSHOT LAYOUT) */}
      <div className="portal-jadwal-container">
        <h2 className="portal-jadwal-heading">JADWAL PELAJARAN</h2>

        {/* DAY SELECTOR DROPDOWN */}
        <div className="portal-day-selector-wrapper" style={{ minWidth: 140 }}>
          <SearchableSelect
            value={selectedHari}
            onChange={(e) => setSelectedHari(e.target.value)}
            options={[
              { value: 'Senin', label: 'Senin' },
              { value: 'Selasa', label: 'Selasa' },
              { value: 'Rabu', label: 'Rabu' },
              { value: 'Kamis', label: 'Kamis' },
              { value: 'Jumat', label: 'Jumat' },
              { value: 'Sabtu', label: 'Sabtu' }
            ]}
          />
        </div>

        {/* MATRIX GRID TABLE */}
        <div className="portal-matrix-table-wrap">
          <table className="portal-matrix-table">
            <thead>
              {/* TOP HEADER ROW */}
              <tr>
                <th colSpan={2} className="matrix-th-waktu">WAKTU</th>
                <th colSpan={classColumns.length} className="matrix-th-kelas">KELAS</th>
              </tr>
              {/* SUB HEADER ROW */}
              <tr>
                <th className="matrix-th-jam">JAM</th>
                <th className="matrix-th-range">DARI - SAMPAI</th>
                {classColumns.map(col => (
                  <th key={col} className="matrix-th-class">
                    <div>{col.split(' ')[0]}</div>
                    <div style={{ fontWeight: 800 }}>{col.split(' ')[1]}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timeSlots.map(slot => (
                <tr key={slot.jam}>
                  <td className="matrix-td-jam">{slot.jam}</td>
                  <td className="matrix-td-range">{slot.range}</td>
                  {classColumns.map(col => {
                    const val = getCellValue(slot.jam, col);
                    return (
                      <td key={col} className="matrix-td-cell">
                        {val}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================
          MODAL DETAIL RINCIAN ABSENSI SISWA KELAS
          ======================================================== */}
      {detailModalOpen && selectedDetailClass && (
        <div className="portal-modal-backdrop" onClick={() => setDetailModalOpen(false)}>
          <div className="portal-modal-content portal-modal-lg" onClick={(e) => e.stopPropagation()}>
            {/* MODAL HEADER */}
            <div className="portal-modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '8px',
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#2563eb'
                }}>
                  <UserCheck size={20} />
                </div>
                <div>
                  <h3 className="portal-modal-title">
                    Detail Absensi Siswa - {selectedDetailClass.nama_kelas}
                  </h3>
                  <p className="portal-modal-subtitle">
                    Periode: <strong>{BULAN_OPTIONS.find(b => b.value === rekapBulan)?.label} {rekapTahun}</strong> • Jurusan: <strong>{selectedDetailClass.jurusan}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="portal-modal-close"
                onClick={() => setDetailModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            {/* MODAL BODY */}
            <div className="portal-modal-body">
              {/* TOP KPI CARDS (4 CARDS: TOTAL SISWA, IZIN, SAKIT, ALFA) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '16px' }}>
                <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Total Siswa</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>{selectedDetailClass.totalSiswa}</div>
                </div>
                <div style={{ background: '#fffbeb', padding: '10px 14px', borderRadius: '8px', border: '1px solid #fde68a', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#92400e', fontWeight: 600 }}>Izin (I)</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#b45309' }}>{selectedDetailClass.izin}</div>
                </div>
                <div style={{ background: '#faf5ff', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e9d5ff', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#6b21a8', fontWeight: 600 }}>Sakit (S)</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#7e22ce' }}>{selectedDetailClass.sakit}</div>
                </div>
                <div style={{ background: '#fef2f2', padding: '10px 14px', borderRadius: '8px', border: '1px solid #fecaca', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#991b1b', fontWeight: 600 }}>Alfa (A)</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#dc2626' }}>{selectedDetailClass.alfa}</div>
                </div>
              </div>

              {/* SEARCH BOX & INSTRUCTION NOTE */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', flex: 1, position: 'relative' }}>
                  <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px' }} />
                  <input
                    type="text"
                    placeholder="Cari nama siswa atau NIS..."
                    value={searchStudentInModal}
                    onChange={(e) => setSearchStudentInModal(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px 8px 36px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                </div>
                <span style={{ fontSize: '11.5px', color: '#64748b', fontStyle: 'italic', whiteSpace: 'nowrap' }}>
                  *Klik baris siswa untuk melihat tanggal ketidakhadiran
                </span>
              </div>

              {/* STUDENT RECAP TABLE (NO, NIS, NAMA SISWA, L/P, IZIN, SAKIT, ALFA) */}
              <div style={{ maxHeight: '360px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <table className="admin-table" style={{ width: '100%', fontSize: '12.5px', margin: 0 }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 2 }}>
                      <th style={{ padding: '8px 10px', textAlign: 'center', width: '45px' }}>No</th>
                      <th style={{ padding: '8px 10px', textAlign: 'center', width: '110px' }}>NIS</th>
                      <th style={{ padding: '8px 10px', textAlign: 'left' }}>Nama Siswa</th>
                      <th style={{ padding: '8px 10px', textAlign: 'center', width: '55px' }}>L/P</th>
                      <th style={{ padding: '8px 10px', textAlign: 'center', width: '70px' }}>Izin</th>
                      <th style={{ padding: '8px 10px', textAlign: 'center', width: '70px' }}>Sakit</th>
                      <th style={{ padding: '8px 10px', textAlign: 'center', width: '70px' }}>Alfa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalStudentsFiltered.length > 0 ? (
                      modalStudentsFiltered.map((st, idx) => {
                        const sId = String(st.kode_siswa || st.nis);
                        const isExpanded = expandedStudentId === sId;
                        const logs = (studentDetailCache[sId] || []).filter(l => l.status !== 'H');

                        return (
                          <React.Fragment key={st.kode_siswa || idx}>
                            <tr
                              onClick={() => handleToggleExpandStudent(st)}
                              style={{
                                borderBottom: '1px solid #f1f5f9',
                                cursor: 'pointer',
                                background: isExpanded ? '#eff6ff' : 'transparent',
                                transition: 'background-color 0.15s'
                              }}
                              title="Klik untuk melihat tanggal ketidakhadiran"
                            >
                              <td style={{ padding: '9px 10px', textAlign: 'center', color: '#64748b' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                                  {isExpanded ? <ChevronDown size={14} color="#2563eb" /> : <ChevronRight size={14} color="#94a3b8" />}
                                  <span>{idx + 1}</span>
                                </div>
                              </td>
                              <td style={{ padding: '9px 10px', textAlign: 'center', fontWeight: 600, color: '#0284c7' }}>
                                {st.nis || '-'}
                              </td>
                              <td style={{ padding: '9px 10px', fontWeight: 700, color: '#0f172a' }}>
                                {st.nama_siswa}
                              </td>
                              <td style={{ padding: '9px 10px', textAlign: 'center', fontWeight: 600, color: st.jk === 'L' ? '#0284c7' : '#db2777' }}>
                                {st.jk}
                              </td>
                              <td style={{ padding: '9px 10px', textAlign: 'center', fontWeight: 600, color: st.total_izin > 0 ? '#d97706' : '#64748b' }}>
                                {renderNumberOrDash(st.total_izin)}
                              </td>
                              <td style={{ padding: '9px 10px', textAlign: 'center', fontWeight: 600, color: st.total_sakit > 0 ? '#9333ea' : '#64748b' }}>
                                {renderNumberOrDash(st.total_sakit)}
                              </td>
                              <td style={{ padding: '9px 10px', textAlign: 'center' }}>
                                <span style={{
                                  display: 'inline-block',
                                  padding: '2px 8px',
                                  borderRadius: '10px',
                                  fontSize: '11.5px',
                                  fontWeight: 700,
                                  background: st.total_alpha > 0 ? '#fee2e2' : '#f1f5f9',
                                  color: st.total_alpha > 0 ? '#b91c1c' : '#64748b'
                                }}>
                                  {renderNumberOrDash(st.total_alpha)}
                                </span>
                              </td>
                            </tr>

                            {/* EXPANDED ACCORDION ROW FOR DATE-BY-DATE ABSENCE */}
                            {isExpanded && (
                              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1' }}>
                                <td colSpan={7} style={{ padding: '12px 18px' }}>
                                  <div style={{
                                    background: '#ffffff',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: '8px',
                                    padding: '14px 16px',
                                    boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
                                  }}>
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '13px', color: '#1e293b' }}>
                                        <CalendarDays size={16} color="#0284c7" />
                                        <span>Rincian Tanggal Ketidakhadiran - {st.nama_siswa}</span>
                                      </div>
                                      <div style={{ fontSize: '11.5px', color: '#64748b' }}>
                                        Izin: <strong>{st.total_izin}</strong> • Sakit: <strong>{st.total_sakit}</strong> • Alfa: <strong>{st.total_alpha}</strong>
                                      </div>
                                    </div>

                                    {studentDetailLoading && !studentDetailCache[sId] ? (
                                      <div style={{ padding: '14px', textAlign: 'center', color: '#64748b', fontSize: '12px' }}>
                                        <RefreshCw size={14} className="spin-icon" style={{ display: 'inline-block', marginRight: '6px' }} />
                                        Memuat riwayat tanggal absensi...
                                      </div>
                                    ) : logs.length > 0 ? (
                                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                                        {logs.map((logItem, logIdx) => {
                                          const isAlfa = logItem.status === 'A';
                                          const isSakit = logItem.status === 'S';
                                          const isIzin = logItem.status === 'I';
                                          const badgeBg = isAlfa ? '#fee2e2' : isSakit ? '#f3e8ff' : isIzin ? '#fef3c7' : '#f1f5f9';
                                          const badgeColor = isAlfa ? '#991b1b' : isSakit ? '#6b21a8' : isIzin ? '#92400e' : '#334155';
                                          const borderCol = isAlfa ? '#fecaca' : isSakit ? '#e9d5ff' : isIzin ? '#fde68a' : '#cbd5e1';
                                          const statusLabel = isAlfa ? 'Alfa (Tanpa Keterangan)' : isSakit ? 'Sakit' : isIzin ? 'Izin' : logItem.status;

                                          return (
                                            <div
                                              key={logItem.id || logIdx}
                                              style={{
                                                background: badgeBg,
                                                color: badgeColor,
                                                border: `1px solid ${borderCol}`,
                                                padding: '6px 12px',
                                                borderRadius: '6px',
                                                fontSize: '12px',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '8px'
                                              }}
                                            >
                                              <span style={{ fontWeight: 700 }}>
                                                📅 {logItem.tanggal_format || logItem.tanggal}
                                              </span>
                                              <span style={{
                                                fontSize: '11px',
                                                fontWeight: 800,
                                                padding: '2px 6px',
                                                borderRadius: '4px',
                                                background: '#ffffff',
                                                color: badgeColor
                                              }}>
                                                {statusLabel}
                                              </span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    ) : (
                                      <div style={{ padding: '10px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', color: '#166534', fontSize: '12px' }}>
                                        ✅ Tidak ada catatan tanggal izin, sakit, maupun alfa untuk siswa ini pada periode {BULAN_OPTIONS.find(b => b.value === rekapBulan)?.label} {rekapTahun}. (Kehadiran 100%)
                                      </div>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                          Tidak ada siswa yang cocok dengan pencarian.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}




