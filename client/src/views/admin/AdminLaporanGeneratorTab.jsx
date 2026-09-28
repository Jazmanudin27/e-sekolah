import React, { useState, useEffect } from 'react';
import {
  Printer, FileSpreadsheet, FileText, Users, GraduationCap,
  Building2, BookOpen, Send, Calendar, RefreshCw, CheckCircle2,
  AlertCircle
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

export default function AdminLaporanGeneratorTab({ reportType = 'laporanSiswa' }) {
  const currentDateObj = new Date();
  const [loading, setLoading] = useState(false);

  // Master Data Cache for dropdowns
  const [kelasList, setKelasList] = useState([]);
  const [mapelList, setMapelList] = useState([]);
  const [guruList, setGuruList] = useState([]);

  // Filter Form States
  const [selectedKelas, setSelectedKelas] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('Aktif');
  const [selectedKepegawaian, setSelectedKepegawaian] = useState('ALL');
  const [selectedMapel, setSelectedMapel] = useState('ALL');
  const [selectedBulan, setSelectedBulan] = useState(String(currentDateObj.getMonth() + 1));
  const [selectedTahun, setSelectedTahun] = useState(String(currentDateObj.getFullYear()));
  const [jenisLaporan, setJenisLaporan] = useState('Detail'); // 'Standar', 'Detail', 'Rekap'
  const [selectedJenisIzin, setSelectedJenisIzin] = useState('ALL');
  const [selectedStatusIzin, setSelectedStatusIzin] = useState('ALL');

  // Load classes, mapel, guru lists on mount
  useEffect(() => {
    async function loadMasterData() {
      try {
        const [resK, resM, resG] = await Promise.all([
          api.get('/kelas').catch(() => ({ data: { data: [] } })),
          api.get('/mapel').catch(() => ({ data: { data: [] } })),
          api.get('/guru').catch(() => ({ data: { data: [] } }))
        ]);
        const kArr = resK.data?.data || [];
        setKelasList(kArr);
        setMapelList(resM.data?.data || []);
        setGuruList(resG.data?.data || []);

        if (kArr.length > 0 && selectedKelas === 'ALL' && reportType === 'laporanAbsensiSiswa') {
          setSelectedKelas(kArr[0].kode_kelas);
        }
      } catch (err) {
        console.error('Error loading master data:', err);
      }
    }
    loadMasterData();
  }, [reportType]);

  // Helper function to get days in month
  const getDaysInMonth = (month, year) => {
    return new Date(Number(year), Number(month), 0).getDate();
  };

  // Titles and Subtitles based on reportType
  const getReportMeta = () => {
    switch (reportType) {
      case 'laporanSiswa':
        return {
          title: 'Laporan Data Siswa',
          subtitle: 'Cetak dan ekspor data master peserta didik berdasarkan kelas & status',
          icon: <GraduationCap size={20} color="#0284c7" />
        };
      case 'laporanGuru':
        return {
          title: 'Laporan Data Guru & Tenaga Kependidikan',
          subtitle: 'Cetak dan ekspor data tenaga pendidik, NIP/NUPTK & status kepegawaian',
          icon: <Users size={20} color="#0284c7" />
        };
      case 'laporanKelas':
        return {
          title: 'Laporan Data Kelas',
          subtitle: 'Cetak daftar ruang kelas, jurusan, dan wali kelas',
          icon: <Building2 size={20} color="#0284c7" />
        };
      case 'laporanPresensiGuru':
        return {
          title: 'Laporan Presensi Guru',
          subtitle: 'Rekapitulasi kehadiran, keterlambatan, dan riwayat presensi harian guru',
          icon: <FileText size={20} color="#0284c7" />
        };
      case 'laporanAbsensiSiswa':
        return {
          title: 'Laporan Absensi Siswa',
          subtitle: 'Laporan presensi siswa per kelas dalam format Detail (1-31 hari) atau Rekap (1-12 bulan)',
          icon: <FileText size={20} color="#0284c7" />
        };
      case 'laporanAbsensiMapel':
        return {
          title: 'Laporan Absensi Mata Pelajaran',
          subtitle: 'Rekapitulasi absensi siswa pada jam mata pelajaran per kelas',
          icon: <BookOpen size={20} color="#0284c7" />
        };
      case 'laporanSurat':
      case 'laporanIzin':
        return {
          title: 'Laporan Surat Izin & Ketidakhadiran',
          subtitle: 'Rekapitulasi pengajuan surat izin sakit, dinas, cuti, dan keperluan keluarga',
          icon: <Send size={20} color="#0284c7" />
        };
      default:
        return {
          title: 'Pusat Cetak & Laporan',
          subtitle: 'Pilih parameter dan cetak dokumen laporan resmi',
          icon: <FileText size={20} color="#0284c7" />
        };
    }
  };

  const meta = getReportMeta();

  // =========================================================================
  // DATA FETCHING FOR REPORTS
  // =========================================================================
  const fetchReportData = async () => {
    setLoading(true);
    try {
      if (reportType === 'laporanSiswa') {
        const res = await api.get('/siswa');
        let list = res.data?.data || [];
        if (selectedKelas !== 'ALL') {
          list = list.filter(s => String(s.kode_kelas) === String(selectedKelas));
        }
        if (selectedStatus !== 'ALL') {
          list = list.filter(s => (s.status || 'Aktif').toLowerCase() === selectedStatus.toLowerCase());
        }
        return { type: 'siswa', data: list };
      }

      if (reportType === 'laporanGuru') {
        const res = await api.get('/guru');
        let list = res.data?.data || [];
        if (selectedKepegawaian !== 'ALL') {
          list = list.filter(g => (g.status_kepegawaian || '').toLowerCase() === selectedKepegawaian.toLowerCase());
        }
        if (selectedStatus !== 'ALL') {
          list = list.filter(g => (g.status || 'Aktif').toLowerCase() === selectedStatus.toLowerCase());
        }
        return { type: 'guru', data: list };
      }

      if (reportType === 'laporanKelas') {
        const res = await api.get('/kelas');
        return { type: 'kelas', data: res.data?.data || [] };
      }

      if (reportType === 'laporanAbsensiSiswa') {
        // Fetch rekap students
        const kParam = selectedKelas !== 'ALL' ? selectedKelas : (kelasList[0]?.kode_kelas || '');
        const res = await api.get(`/rekap/siswa?bulan=${selectedBulan}&tahun=${selectedTahun}${kParam ? `&kode_kelas=${kParam}` : ''}`);
        const list = res.data?.data || [];

        // For Detail / Rekap matrix, fetch per-student detail logs
        const studentDetails = {};
        for (const st of list) {
          const sId = st.kode_siswa || st.nis;
          if (sId) {
            try {
              const dRes = await api.get(`/rekap/siswa-detail?kode_siswa=${sId}&bulan=${selectedBulan}&tahun=${selectedTahun}`);
              studentDetails[sId] = dRes.data?.data || [];
            } catch (e) {
              studentDetails[sId] = [];
            }
          }
        }

        const kelasObj = kelasList.find(k => String(k.kode_kelas) === String(kParam)) || { nama_kelas: 'Semua Kelas' };
        return {
          type: 'absensiSiswa',
          data: list,
          studentDetails,
          kelasObj,
          bulan: selectedBulan,
          tahun: selectedTahun,
          jenisLaporan
        };
      }

      if (reportType === 'laporanPresensiGuru') {
        const res = await api.get(`/rekap/guru?bulan=${selectedBulan}&tahun=${selectedTahun}`);
        return {
          type: 'presensiGuru',
          data: res.data?.data || [],
          bulan: selectedBulan,
          tahun: selectedTahun,
          jenisLaporan
        };
      }

      if (reportType === 'laporanAbsensiMapel') {
        const kParam = selectedKelas !== 'ALL' ? selectedKelas : '';
        const mParam = selectedMapel !== 'ALL' ? selectedMapel : '';
        const res = await api.get(`/rekap/mapel?bulan=${selectedBulan}&tahun=${selectedTahun}${kParam ? `&kode_kelas=${kParam}` : ''}${mParam ? `&kode_mapel=${mParam}` : ''}`);
        return {
          type: 'absensiMapel',
          data: res.data?.data || [],
          bulan: selectedBulan,
          tahun: selectedTahun,
          jenisLaporan
        };
      }

      if (reportType === 'laporanSurat' || reportType === 'laporanIzin') {
        const res = await api.get('/izin');
        let list = res.data?.data || [];
        if (selectedJenisIzin !== 'ALL') {
          list = list.filter(i => (i.jenis_izin || '').toLowerCase() === selectedJenisIzin.toLowerCase());
        }
        if (selectedStatusIzin !== 'ALL') {
          list = list.filter(i => (i.status || 'Disetujui').toLowerCase() === selectedStatusIzin.toLowerCase());
        }
        return { type: 'izin', data: list, bulan: selectedBulan, tahun: selectedTahun };
      }

      return { type: 'empty', data: [] };
    } catch (err) {
      console.error('Error fetching report data:', err);
      return { type: 'empty', data: [] };
    } finally {
      setLoading(false);
    }
  };

  // =========================================================================
  // PRINT HANDLER (OPENS CLEAN PRINTABLE PAGE MATCHING SCREENSHOTS)
  // =========================================================================
  const handleCetak = async () => {
    const reportObj = await fetchReportData();
    if (!reportObj || !reportObj.data || reportObj.data.length === 0) {
      alert('Tidak ada data yang tersedia untuk filter yang dipilih.');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up terblokir. Harap izinkan pop-up di browser Anda.');
      return;
    }

    const namaBulanStr = BULAN_OPTIONS.find(b => b.value === selectedBulan)?.label || 'Bulan';
    const bulan2Digit = String(selectedBulan).padStart(2, '0');
    const daysInMonth = getDaysInMonth(selectedBulan, selectedTahun);

    let reportTitle = meta.title.toUpperCase();
    let reportSub = `BULAN ${bulan2Digit} TAHUN ${selectedTahun}`;
    let tableHtml = '';

    // 1. ABSENSI SISWA DETAIL (SCREENSHOT 3: 1-31 DATES)
    if (reportObj.type === 'absensiSiswa' && reportObj.jenisLaporan === 'Detail') {
      reportTitle = 'LAPORAN ABSENSI SISWA';
      reportSub = `BULAN ${bulan2Digit} TAHUN ${selectedTahun}<br/>KELAS ${reportObj.kelasObj?.nama_kelas || ''}`;

      let daysTh = '';
      for (let d = 1; d <= daysInMonth; d++) {
        daysTh += `<th style="width: 22px; text-align: center; padding: 4px 2px; font-size: 11px;">${d}</th>`;
      }

      let rowsHtml = '';
      reportObj.data.forEach((st, idx) => {
        const sId = st.kode_siswa || st.nis;
        const logs = reportObj.studentDetails[sId] || [];
        
        let daysTd = '';
        for (let d = 1; d <= daysInMonth; d++) {
          const dStr = String(d).padStart(2, '0');
          const fullDatePrefix = `${selectedTahun}-${bulan2Digit}-${dStr}`;
          const matchLog = logs.find(l => (l.tanggal || '').startsWith(fullDatePrefix));

          let code = '';
          if (matchLog) {
            code = matchLog.status === 'H' ? '' : matchLog.status;
          }
          daysTd += `<td style="text-align: center; padding: 4px 2px; font-size: 11px; font-weight: 700; color: ${code === 'A' ? '#dc2626' : code === 'S' ? '#7e22ce' : code === 'I' ? '#b45309' : '#000000'};">${code}</td>`;
        }

        rowsHtml += `
          <tr>
            <td style="text-align: center;">${idx + 1}</td>
            <td style="text-align: left; padding-left: 8px; font-weight: 600;">${st.nama_siswa || '-'}</td>
            <td style="text-align: center;">${st.nis || '-'}</td>
            ${daysTd}
            <td style="text-align: center; font-weight: 700;">${st.total_izin || st.izin || ''}</td>
            <td style="text-align: center; font-weight: 700;">${st.total_sakit || st.sakit || ''}</td>
            <td style="text-align: center; font-weight: 700; color: #dc2626;">${st.total_alpha || st.alfa || ''}</td>
          </tr>
        `;
      });

      tableHtml = `
        <table class="report-table">
          <thead>
            <tr>
              <th rowspan="2" style="width: 35px; text-align: center;">No</th>
              <th rowspan="2" style="text-align: center;">Nama Siswa</th>
              <th rowspan="2" style="width: 90px; text-align: center;">NIS</th>
              <th colspan="${daysInMonth}" style="text-align: center;">BULAN ${bulan2Digit}</th>
              <th colspan="3" style="text-align: center; width: 75px;">Jumlah Absen</th>
            </tr>
            <tr>
              ${daysTh}
              <th style="width: 25px; text-align: center;">I</th>
              <th style="width: 25px; text-align: center;">S</th>
              <th style="width: 25px; text-align: center;">A</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      `;
    }
    // 2. ABSENSI SISWA REKAP (SCREENSHOT 4: 01-12 MONTHS)
    else if (reportObj.type === 'absensiSiswa' && reportObj.jenisLaporan === 'Rekap') {
      reportTitle = 'LAPORAN REKAP ABSENSI SISWA';
      reportSub = `KELAS ${reportObj.kelasObj?.nama_kelas || ''}<br/>TAHUN ${selectedTahun}`;

      let monthHeaders = '';
      let subHeaders = '';
      for (let m = 1; m <= 12; m++) {
        const mStr = String(m).padStart(2, '0');
        monthHeaders += `<th colspan="3" style="text-align: center; font-size: 11px;">${mStr}</th>`;
        subHeaders += `<th style="width: 18px; text-align: center; font-size: 10px;">I</th><th style="width: 18px; text-align: center; font-size: 10px;">S</th><th style="width: 18px; text-align: center; font-size: 10px;">A</th>`;
      }

      let rowsHtml = '';
      reportObj.data.forEach((st, idx) => {
        let monthsTd = '';
        for (let m = 1; m <= 12; m++) {
          const isSelectedM = String(m) === String(selectedBulan);
          const iVal = isSelectedM ? (st.total_izin || st.izin || '') : '';
          const sVal = isSelectedM ? (st.total_sakit || st.sakit || '') : '';
          const aVal = isSelectedM ? (st.total_alpha || st.alfa || '') : '';
          monthsTd += `<td style="text-align: center; font-size: 10.5px;">${iVal}</td><td style="text-align: center; font-size: 10.5px;">${sVal}</td><td style="text-align: center; font-size: 10.5px; color: #dc2626; font-weight: 700;">${aVal}</td>`;
        }

        rowsHtml += `
          <tr>
            <td style="text-align: center;">${idx + 1}</td>
            <td style="text-align: left; padding-left: 8px; font-weight: 600;">${st.nama_siswa || '-'}</td>
            ${monthsTd}
            <td style="text-align: center; font-weight: 700;">${st.total_izin || st.izin || ''}</td>
            <td style="text-align: center; font-weight: 700;">${st.total_sakit || st.sakit || ''}</td>
            <td style="text-align: center; font-weight: 700; color: #dc2626;">${st.total_alpha || st.alfa || ''}</td>
          </tr>
        `;
      });

      tableHtml = `
        <table class="report-table">
          <thead>
            <tr>
              <th rowspan="2" style="width: 35px; text-align: center;">No</th>
              <th rowspan="2" style="text-align: center;">Nama Siswa</th>
              <th colspan="36" style="text-align: center;">TAHUN ${selectedTahun}</th>
              <th colspan="3" style="text-align: center;">Total</th>
            </tr>
            <tr>
              ${subHeaders}
              <th style="width: 22px; text-align: center;">I</th>
              <th style="width: 22px; text-align: center;">S</th>
              <th style="width: 22px; text-align: center;">A</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      `;
    }
    // 3. LAPORAN SISWA MASTER
    else if (reportObj.type === 'siswa') {
      reportTitle = 'LAPORAN DATA SISWA';
      reportSub = `SMK ARTANITA • STATUS: ${selectedStatus.toUpperCase()}`;

      let rowsHtml = reportObj.data.map((s, idx) => `
        <tr>
          <td style="text-align: center;">${idx + 1}</td>
          <td style="text-align: center; font-weight: 600;">${s.nis || s.nis_nisn || '-'}</td>
          <td style="text-align: left; padding-left: 8px; font-weight: 700;">${s.nama_siswa}</td>
          <td style="text-align: center;">${s.jk || s.jenis_kelamin || '-'}</td>
          <td style="text-align: center;">${s.nama_kelas || s.kode_kelas || '-'}</td>
          <td style="text-align: center;">${s.jurusan || '-'}</td>
          <td style="text-align: center;">${s.status || 'Aktif'}</td>
        </tr>
      `).join('');

      tableHtml = `
        <table class="report-table">
          <thead>
            <tr>
              <th style="width: 40px; text-align: center;">No</th>
              <th style="width: 120px; text-align: center;">NIS / NISN</th>
              <th style="text-align: left; padding-left: 8px;">Nama Lengkap Siswa</th>
              <th style="width: 60px; text-align: center;">L/P</th>
              <th style="width: 110px; text-align: center;">Kelas</th>
              <th style="width: 130px; text-align: center;">Jurusan</th>
              <th style="width: 90px; text-align: center;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      `;
    }
    // 4. LAPORAN GURU MASTER / PRESENSI GURU
    else if (reportObj.type === 'guru' || reportObj.type === 'presensiGuru') {
      reportTitle = reportObj.type === 'guru' ? 'LAPORAN DATA GURU' : 'LAPORAN PRESENSI GURU';
      reportSub = `SMK ARTANITA • PERIODE: ${namaBulanStr.toUpperCase()} ${selectedTahun}`;

      let rowsHtml = reportObj.data.map((g, idx) => `
        <tr>
          <td style="text-align: center;">${idx + 1}</td>
          <td style="text-align: center;">${g.nip_nuptk || g.kode_guru || '-'}</td>
          <td style="text-align: left; padding-left: 8px; font-weight: 700;">${g.nama_guru}</td>
          <td style="text-align: center;">${g.jk || '-'}</td>
          <td style="text-align: center;">${g.status_kepegawaian || 'PNS'}</td>
          <td style="text-align: center;">${g.total_hadir || g.hadir || '0'}</td>
          <td style="text-align: center;">${g.total_izin || g.izin || '0'}</td>
          <td style="text-align: center;">${g.total_sakit || g.sakit || '0'}</td>
          <td style="text-align: center; color: #dc2626; font-weight: 700;">${g.total_alpha || g.alfa || '0'}</td>
        </tr>
      `).join('');

      tableHtml = `
        <table class="report-table">
          <thead>
            <tr>
              <th style="width: 40px; text-align: center;">No</th>
              <th style="width: 140px; text-align: center;">NIP / NUPTK</th>
              <th style="text-align: left; padding-left: 8px;">Nama Guru</th>
              <th style="width: 60px; text-align: center;">L/P</th>
              <th style="width: 120px; text-align: center;">Kepegawaian</th>
              <th style="width: 70px; text-align: center;">Hadir</th>
              <th style="width: 70px; text-align: center;">Izin</th>
              <th style="width: 70px; text-align: center;">Sakit</th>
              <th style="width: 70px; text-align: center;">Alfa</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      `;
    }
    // 5. LAPORAN UMUM / FALLBACK
    else {
      let rowsHtml = reportObj.data.map((item, idx) => `
        <tr>
          <td style="text-align: center;">${idx + 1}</td>
          <td style="text-align: left; padding-left: 8px;">${item.nama_siswa || item.nama_guru || item.nama_kelas || item.jenis_izin || '-'}</td>
          <td style="text-align: center;">${item.status || 'Aktif'}</td>
        </tr>
      `).join('');

      tableHtml = `
        <table class="report-table">
          <thead>
            <tr>
              <th style="width: 40px; text-align: center;">No</th>
              <th style="text-align: left; padding-left: 8px;">Nama / Keterangan</th>
              <th style="width: 100px; text-align: center;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>
      `;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${reportTitle} - SMK ARTANITA</title>
        <meta charset="utf-8" />
        <style>
          @page {
            size: A4 landscape;
            margin: 12mm 15mm;
          }
          body {
            font-family: 'Arial', sans-serif;
            color: #000000;
            background: #ffffff;
            margin: 0;
            padding: 10px;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .report-header-box {
            text-align: center;
            margin-bottom: 18px;
          }
          .report-header-box h2 {
            font-size: 16px;
            font-weight: 800;
            letter-spacing: 0.05em;
            margin: 0 0 4px 0;
            text-transform: uppercase;
          }
          .report-header-box h3 {
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 0.03em;
            margin: 0;
            line-height: 1.4;
            text-transform: uppercase;
          }
          .report-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11.5px;
            margin-bottom: 20px;
          }
          .report-table th, .report-table td {
            border: 1px solid #333333;
            padding: 5px 6px;
            vertical-align: middle;
          }
          .report-table thead th {
            background-color: #f1f5f9 !important;
            font-weight: 700;
            color: #000000;
          }
          .report-signature {
            display: flex;
            justify-content: space-between;
            margin-top: 30px;
            padding: 0 40px;
            font-size: 12px;
          }
          .sig-box {
            text-align: center;
            width: 220px;
          }
          .sig-space {
            height: 60px;
          }
          @media print {
            .no-print { display: none !important; }
          }
        </style>
      </head>
      <body>
        <div class="report-header-box">
          <h2>${reportTitle}</h2>
          <h3>${reportSub}</h3>
        </div>

        ${tableHtml}

        <div class="report-signature">
          <div class="sig-box">
            <div>Mengetahui,</div>
            <div style="font-weight: 700;">Kepala Sekolah</div>
            <div class="sig-space"></div>
            <div style="font-weight: 800; text-decoration: underline;">Drs. H. Ahmad Fauzi, M.Pd</div>
            <div style="font-size: 11px;">NIP. 19750812 199903 1 002</div>
          </div>
          <div class="sig-box">
            <div>Tasikmalaya, ${currentDateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            <div style="font-weight: 700;">Petugas / Wali Kelas</div>
            <div class="sig-space"></div>
            <div style="font-weight: 800; text-decoration: underline;">................................................</div>
            <div style="font-size: 11px;">NIP. ........................................</div>
          </div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  // =========================================================================
  // EXCEL EXPORT HANDLER (EXPORTS CLEAN XLS SPREADSHEET)
  // =========================================================================
  const handleExportExcel = async () => {
    const reportObj = await fetchReportData();
    if (!reportObj || !reportObj.data || reportObj.data.length === 0) {
      alert('Tidak ada data yang tersedia untuk diekspor.');
      return;
    }

    let csvContent = '';
    const fileName = `${reportType}_${selectedBulan}_${selectedTahun}.xls`;

    if (reportObj.type === 'siswa') {
      csvContent += 'No\tNIS\tNama Siswa\tL/P\tKelas\tJurusan\tStatus\n';
      reportObj.data.forEach((s, idx) => {
        csvContent += `${idx + 1}\t${s.nis || s.nis_nisn || ''}\t${s.nama_siswa}\t${s.jk || ''}\t${s.nama_kelas || ''}\t${s.jurusan || ''}\t${s.status || 'Aktif'}\n`;
      });
    } else if (reportObj.type === 'guru' || reportObj.type === 'presensiGuru') {
      csvContent += 'No\tNIP/NUPTK\tNama Guru\tL/P\tStatus Kepegawaian\tHadir\tIzin\tSakit\tAlfa\n';
      reportObj.data.forEach((g, idx) => {
        csvContent += `${idx + 1}\t${g.nip_nuptk || ''}\t${g.nama_guru}\t${g.jk || ''}\t${g.status_kepegawaian || ''}\t${g.total_hadir || g.hadir || 0}\t${g.total_izin || g.izin || 0}\t${g.total_sakit || g.sakit || 0}\t${g.total_alpha || g.alfa || 0}\n`;
      });
    } else if (reportObj.type === 'absensiSiswa') {
      csvContent += 'No\tNIS\tNama Siswa\tIzin\tSakit\tAlfa\n';
      reportObj.data.forEach((st, idx) => {
        csvContent += `${idx + 1}\t${st.nis || ''}\t${st.nama_siswa}\t${st.total_izin || st.izin || 0}\t${st.total_sakit || st.sakit || 0}\t${st.total_alpha || st.alfa || 0}\n`;
      });
    } else {
      csvContent += 'No\tNama\tKeterangan\n';
      reportObj.data.forEach((item, idx) => {
        csvContent += `${idx + 1}\t${item.nama_siswa || item.nama_guru || item.nama_kelas || ''}\t${item.status || ''}\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="portal-dashboard-view">
      {/* PAGE HEADING */}
      <div style={{ marginBottom: '20px' }}>
        <h1 className="portal-dashboard-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          {meta.title}
        </h1>
        <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
          {meta.subtitle}
        </p>
      </div>

      {/* FILTER CARD (EXACT LAYOUT AS USER SCREENSHOTS) */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        padding: '22px 24px',
        maxWidth: '520px',
        boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* 1. FILTER KELAS (For Siswa, Absensi Siswa, Absensi Mapel) */}
          {['laporanSiswa', 'laporanAbsensiSiswa', 'laporanAbsensiMapel'].includes(reportType) && (
            <div className="form-group-admin">
              <label>Kelas</label>
              <SearchableSelect
                value={selectedKelas}
                onChange={(e) => setSelectedKelas(e.target.value)}
                options={[
                  ...(reportType === 'laporanSiswa' ? [{ value: 'ALL', label: 'Semua Kelas' }] : []),
                  ...kelasList.map(k => ({
                    value: k.kode_kelas,
                    label: `${k.nama_kelas} ${k.jurusan && k.jurusan !== '-' ? `(${k.jurusan})` : ''}`
                  }))
                ]}
              />
            </div>
          )}

          {/* 2. FILTER MAPEL (For Absensi Mapel) */}
          {reportType === 'laporanAbsensiMapel' && (
            <div className="form-group-admin">
              <label>Mata Pelajaran</label>
              <SearchableSelect
                value={selectedMapel}
                onChange={(e) => setSelectedMapel(e.target.value)}
                options={[
                  { value: 'ALL', label: 'Semua Mata Pelajaran' },
                  ...mapelList.map(m => ({
                    value: m.kode_mapel,
                    label: `${m.nama_mapel} (${m.kode_mapel})`
                  }))
                ]}
              />
            </div>
          )}

          {/* 3. FILTER STATUS (For Laporan Siswa & Guru) */}
          {['laporanSiswa', 'laporanGuru'].includes(reportType) && (
            <div className="form-group-admin">
              <label>Status</label>
              <SearchableSelect
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                options={[
                  { value: 'Aktif', label: 'Aktif' },
                  { value: 'Nonaktif', label: 'Nonaktif' },
                  { value: 'ALL', label: 'Semua Status' }
                ]}
              />
            </div>
          )}

          {/* 4. FILTER STATUS KEPEGAWAIAN (For Laporan Guru) */}
          {reportType === 'laporanGuru' && (
            <div className="form-group-admin">
              <label>Status Kepegawaian</label>
              <SearchableSelect
                value={selectedKepegawaian}
                onChange={(e) => setSelectedKepegawaian(e.target.value)}
                options={[
                  { value: 'ALL', label: 'Semua Kepegawaian' },
                  { value: 'PNS', label: 'PNS' },
                  { value: 'PPPK', label: 'PPPK' },
                  { value: 'GTT', label: 'Guru Tidak Tetap (GTT)' },
                  { value: 'Honorer', label: 'Honorer' },
                  { value: 'Yayasan', label: 'Guru Tetap Yayasan' }
                ]}
              />
            </div>
          )}

          {/* 5. FILTER BULAN & TAHUN (For Presensi Guru, Absensi Siswa, Absensi Mapel, Surat Izin) */}
          {['laporanPresensiGuru', 'laporanAbsensiSiswa', 'laporanAbsensiMapel', 'laporanSurat', 'laporanIzin'].includes(reportType) && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group-admin">
                <label>Bulan</label>
                <SearchableSelect
                  value={selectedBulan}
                  onChange={(e) => setSelectedBulan(e.target.value)}
                  options={BULAN_OPTIONS.map(b => ({ value: b.value, label: b.label }))}
                />
              </div>
              <div className="form-group-admin">
                <label>Tahun</label>
                <SearchableSelect
                  value={selectedTahun}
                  onChange={(e) => setSelectedTahun(e.target.value)}
                  options={TAHUN_OPTIONS.map(yr => ({ value: yr, label: yr }))}
                />
              </div>
            </div>
          )}

          {/* 6. FILTER JENIS LAPORAN (Standar, Detail, Rekap) */}
          {['laporanPresensiGuru', 'laporanAbsensiSiswa', 'laporanAbsensiMapel'].includes(reportType) && (
            <div className="form-group-admin">
              <label>Jenis Laporan</label>
              <SearchableSelect
                value={jenisLaporan}
                onChange={(e) => setJenisLaporan(e.target.value)}
                options={[
                  { value: 'Detail', label: 'Detail (Format 1-31 Hari Per Tanggal)' },
                  { value: 'Rekap', label: 'Rekap (Format 1-12 Bulan Per Tahun)' },
                  { value: 'Standar', label: 'Standar (Ringkasan Kehadiran)' }
                ]}
              />
            </div>
          )}

          {/* 7. FILTER JENIS & STATUS IZIN */}
          {['laporanSurat', 'laporanIzin'].includes(reportType) && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group-admin">
                <label>Jenis Izin</label>
                <SearchableSelect
                  value={selectedJenisIzin}
                  onChange={(e) => setSelectedJenisIzin(e.target.value)}
                  options={[
                    { value: 'ALL', label: 'Semua Jenis' },
                    { value: 'Sakit', label: 'Sakit' },
                    { value: 'Izin', label: 'Izin' },
                    { value: 'Dinas', label: 'Dinas' },
                    { value: 'Cuti', label: 'Cuti' }
                  ]}
                />
              </div>
              <div className="form-group-admin">
                <label>Status</label>
                <SearchableSelect
                  value={selectedStatusIzin}
                  onChange={(e) => setSelectedStatusIzin(e.target.value)}
                  options={[
                    { value: 'ALL', label: 'Semua Status' },
                    { value: 'Disetujui', label: 'Disetujui' },
                    { value: 'Menunggu', label: 'Menunggu' },
                    { value: 'Ditolak', label: 'Ditolak' }
                  ]}
                />
              </div>
            </div>
          )}

          {/* ACTION BUTTONS (CETAK & EXCEL) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={handleCetak}
              disabled={loading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '9px 16px',
                borderRadius: '6px',
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(37, 99, 235, 0.25)',
                transition: 'background 0.15s ease'
              }}
            >
              <Printer size={16} /> {loading ? 'Memuat...' : 'CETAK'}
            </button>

            <button
              type="button"
              onClick={handleExportExcel}
              disabled={loading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '9px 16px',
                borderRadius: '6px',
                background: '#16a34a',
                color: '#ffffff',
                border: 'none',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(22, 163, 74, 0.25)',
                transition: 'background 0.15s ease'
              }}
            >
              <FileSpreadsheet size={16} /> EXCEL
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
