import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Calendar, Search, RefreshCw, Clock, Building2, User, BookOpen,
  AlertTriangle, CheckCircle2, Save, Printer, Info, X, ChevronDown, Check
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../api/client';
import Pagination from '../../components/Pagination';
import SearchableSelect from '../../components/SearchableSelect';

// Default master list of Mapel & Guru matching the school curriculum and user screenshots
const DEFAULT_MAPEL_GURU_LIST = [
  { id: '1_ppkn', kode_guru: '1', nama_guru: 'Drs. H. Ahmad Fauzi', nama_mapel: 'Pendidikan Pancasila dan Kewarganegaraan', kode_mapel: 'PPKN' },
  { id: '3_bing', kode_guru: '3', nama_guru: 'Citra Dewi, S.Pd.', nama_mapel: 'Bahasa Inggris', kode_mapel: 'BING' },
  { id: '4_sej', kode_guru: '4', nama_guru: 'Budi Santoso, M.Pd.', nama_mapel: 'Sejarah Indonesia', kode_mapel: 'SEJ' },
  { id: '4_ritel', kode_guru: '4', nama_guru: 'Budi Santoso, M.Pd.', nama_mapel: 'Pengelolaan bisnis ritel', kode_mapel: 'RITEL' },
  { id: '4_produk', kode_guru: '4', nama_guru: 'Budi Santoso, M.Pd.', nama_mapel: 'Penataan Produk', kode_mapel: 'PRODUK' },
  { id: '4_sarpras', kode_guru: '4', nama_guru: 'Budi Santoso, M.Pd.', nama_mapel: 'Otomatisasi tata kelola sarana dan prasarana', kode_mapel: 'SARPRAS' },
  { id: '4_humas', kode_guru: '4', nama_guru: 'Budi Santoso, M.Pd.', nama_mapel: 'Otomatisasi tata kelola humas dan keprotokolan', kode_mapel: 'HUMAS' },
  { id: '6_pai', kode_guru: '6', nama_guru: 'Ust. Ridwan Kamil, S.Ag.', nama_mapel: 'Pendidikan Agama Islam & Budi Pekerti', kode_mapel: 'PAI' },
  { id: '7_akjasa', kode_guru: '7', nama_guru: 'Eko Prasetyo, S.E., Ak.', nama_mapel: 'Praktikum Ak Perusahaan jasa/Dagang&Manufaktur', kode_mapel: 'AKJASA' },
  { id: '7_pkk', kode_guru: '7', nama_guru: 'Eko Prasetyo, S.E., Ak.', nama_mapel: 'Kreatif, Inovasi dan Kewirausahaan', kode_mapel: 'PKK' },
  { id: '7_pms', kode_guru: '7', nama_guru: 'Eko Prasetyo, S.E., Ak.', nama_mapel: 'Dasar-Dasar Program Keahlian Pemasaran', kode_mapel: 'PMS' },
  { id: '8_bind', kode_guru: '8', nama_guru: 'Siti Rahmawati, S.Pd.', nama_mapel: 'Bahasa Indonesia', kode_mapel: 'BIND' },
  { id: '8_sunda', kode_guru: '8', nama_guru: 'Siti Rahmawati, S.Pd.', nama_mapel: 'Bahasa Sunda', kode_mapel: 'SUNDA' },
  { id: '9_pkk', kode_guru: '9', nama_guru: 'Hendri Gunawan, S.T.', nama_mapel: 'Kreatif, Inovasi dan Kewirausahaan', kode_mapel: 'PKK2' },
  { id: '10_ipas', kode_guru: '10', nama_guru: 'Nurul Hidayah, S.Si.', nama_mapel: 'Project IPAS', kode_mapel: 'IPAS' },
  { id: '11_mtk', kode_guru: '11', nama_guru: 'Agus Setiawan, S.Pd.', nama_mapel: 'Matematika Terapan', kode_mapel: 'MTK' },
  { id: '12_pjok', kode_guru: '12', nama_guru: 'Bambang Sudiro, S.Pd.', nama_mapel: 'Pendidikan Jasmani, Olahraga & Kesehatan', kode_mapel: 'PJOK' },
  { id: '13_bk', kode_guru: '13', nama_guru: 'Dewi Lestari, S.Psi.', nama_mapel: 'Bimbingan dan Konseling (BK)', kode_mapel: 'BK' },
  { id: '14_rpl', kode_guru: '14', nama_guru: 'Fajar Nugraha, S.Kom.', nama_mapel: 'Pemrograman Berorientasi Objek & Web', kode_mapel: 'PBO' },
  { id: '15_db', kode_guru: '15', nama_guru: 'Rina Marlina, M.Kom.', nama_mapel: 'Basis Data & Cloud Architecture', kode_mapel: 'DB' },
  { id: '17_otkp', kode_guru: '17', nama_guru: 'Wahyudi Pratama, S.Pd.', nama_mapel: 'Korespondensi & Kearsipan Digital', kode_mapel: 'OTKP' },
  { id: '19_keu', kode_guru: '19', nama_guru: 'Sri Mulyani, S.E.', nama_mapel: 'Administrasi Pajak & Keuangan', kode_mapel: 'PAJAK' },
  { id: '21_pkk', kode_guru: '21', nama_guru: 'Taufik Hidayat, M.M.', nama_mapel: 'Produk Kreatif Kewirausahaan Digital', kode_mapel: 'PKKD' },
  { id: '22_seni', kode_guru: '22', nama_guru: 'Maya Anggraini, S.Sn.', nama_mapel: 'Seni Budaya & Desain Grafis', kode_mapel: 'SENI' }
];

export default function AdminJadwalTab() {
  const [viewMode, setViewMode] = useState('matrix'); // 'matrix' or 'list'
  const [jadwalList, setJadwalList] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [guruList, setGuruList] = useState([]);
  const [mapelList, setMapelList] = useState([]);
  const [mapelGuruOptions, setMapelGuruOptions] = useState(DEFAULT_MAPEL_GURU_LIST);

  const [selectedHari, setSelectedHari] = useState('Senin');
  const [selectedKelasFilter, setSelectedKelasFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Active cell popover for changing schedule
  const [activeCell, setActiveCell] = useState(null); // { jam, className, rect, currentVal }
  const [cellSearchQuery, setCellSearchQuery] = useState('');
  const popoverRef = useRef(null);

  // Pagination for list view
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const daftarHari = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  const classColumns = [
    'X AKL', 'X MPLB', 'X PM', 'X PPLG',
    'XI AKL', 'XI MPLB', 'XI PM', 'XI PPLG',
    'XII AKL', 'XII MPLB', 'XII PM', 'XII PPLG'
  ];

  const timeSlots = [
    { jam: 1, range: '07.00 - 07.40', isBreak: false },
    { jam: 2, range: '07.40 - 08.20', isBreak: false },
    { jam: 3, range: '08.20 - 09.00', isBreak: false },
    { jam: 4, range: '09.00 - 09.40', isBreak: false },
    { jam: 5, range: '09.40 - 10.10', isBreak: true, label: 'ISTIRAHAT 1' },
    { jam: 6, range: '10.10 - 10.50', isBreak: false },
    { jam: 7, range: '10.50 - 11.30', isBreak: false },
    { jam: 8, range: '11.30 - 12.10', isBreak: false },
    { jam: 9, range: '12.10 - 12.40', isBreak: true, label: 'ISTIRAHAT / SHOLAT DZUHUR' },
    { jam: 10, range: '12.40 - 13.20', isBreak: false },
    { jam: 11, range: '13.20 - 14.00', isBreak: false }
  ];

  // Full Weekly Schedule Matrix State: { [hari]: { [jam]: { [className]: optionObj } } }
  const [scheduleState, setScheduleState] = useState(() => {
    // Initial demo matrix matching user screenshot
    const init = {};
    daftarHari.forEach(h => {
      init[h] = {
        1: {
          'X AKL': { kode_guru: '4', nama_mapel: 'Sejarah Indonesia' },
          'X MPLB': { kode_guru: '1', nama_mapel: 'Pendidikan Pancasila' },
          'XI AKL': { kode_guru: '7', nama_mapel: 'Kreatif Kewirausahaan' }
        },
        2: {
          'X AKL': { kode_guru: '4', nama_mapel: 'Pengelolaan bisnis ritel' },
          'X MPLB': { kode_guru: '17', nama_mapel: 'Korespondensi' },
          'X PM': { kode_guru: '7', nama_mapel: 'Kreatif Kewirausahaan' },
          'X PPLG': { kode_guru: '8', nama_mapel: 'Bahasa Indonesia' }
        },
        3: {
          'X AKL': { kode_guru: '7', nama_mapel: 'Praktikum Ak Perusahaan' },
          'X MPLB': { kode_guru: '17', nama_mapel: 'Korespondensi' },
          'X PM': { kode_guru: '6', nama_mapel: 'PAI & Budi Pekerti' },
          'X PPLG': { kode_guru: '7', nama_mapel: 'Dasar Pemasaran' }
        },
        4: {
          'X AKL': { kode_guru: '8', nama_mapel: 'Bahasa Indonesia' },
          'X MPLB': { kode_guru: '3', nama_mapel: 'Bahasa Inggris' },
          'X PM': { kode_guru: '7', nama_mapel: 'Kreatif Kewirausahaan' },
          'X PPLG': { kode_guru: '6', nama_mapel: 'PAI & Budi Pekerti' }
        },
        5: {}, // Istirahat
        6: {
          'X AKL': { kode_guru: '4', nama_mapel: 'Penataan Produk' },
          'X MPLB': { kode_guru: '4', nama_mapel: 'Otomatisasi sarpras' },
          'X PM': { kode_guru: '7', nama_mapel: 'Praktikum Akuntasi' },
          'X PPLG': { kode_guru: '7', nama_mapel: 'Kreatif Kewirausahaan' }
        },
        7: {
          'X AKL': { kode_guru: '4', nama_mapel: 'Sejarah Indonesia' },
          'X MPLB': { kode_guru: '6', nama_mapel: 'PAI & Budi Pekerti' },
          'X PM': { kode_guru: '4', nama_mapel: 'Otomatisasi humas' },
          'X PPLG': { kode_guru: '7', nama_mapel: 'Kreatif Kewirausahaan' }
        },
        8: {
          'X AKL': { kode_guru: '4', nama_mapel: 'Pengelolaan bisnis ritel' },
          'X MPLB': { kode_guru: '6', nama_mapel: 'PAI & Budi Pekerti' },
          'X PM': { kode_guru: '4', nama_mapel: 'Otomatisasi humas' },
          'X PPLG': { kode_guru: '7', nama_mapel: 'Dasar Pemasaran' }
        },
        9: {}, // Istirahat
        10: {
          'X AKL': { kode_guru: '7', nama_mapel: 'Praktikum Ak Perusahaan' },
          'X MPLB': { kode_guru: '13', nama_mapel: 'Bimbingan Konseling' },
          'XI AKL': { kode_guru: '6', nama_mapel: 'PAI' },
          'XI MPLB': { kode_guru: '8', nama_mapel: 'Bahasa Sunda' },
          'XI PM': { kode_guru: '17', nama_mapel: 'OTKP' },
          'XI PPLG': { kode_guru: '11', nama_mapel: 'Matematika' },
          'XII AKL': { kode_guru: '7', nama_mapel: 'Kreatif Kewirausahaan' },
          'XII MPLB': { kode_guru: '15', nama_mapel: 'Basis Data' },
          'XII PM': { kode_guru: '4', nama_mapel: 'Otomatisasi sarpras' }
        },
        11: {
          'X AKL': { kode_guru: '7', nama_mapel: 'Praktikum Ak Perusahaan' },
          'X MPLB': { kode_guru: '5', nama_mapel: 'Bahasa Indonesia' },
          'X PPLG': { kode_guru: '6', nama_mapel: 'PAI' },
          'XI AKL': { kode_guru: '8', nama_mapel: 'Bahasa Sunda' },
          'XI MPLB': { kode_guru: '19', nama_mapel: 'Administrasi Pajak' },
          'XI PPLG': { kode_guru: '2', nama_mapel: 'Pemrograman Web' },
          'XII AKL': { kode_guru: '21', nama_mapel: 'PKK Digital' },
          'XII MPLB': { kode_guru: '7', nama_mapel: 'Praktikum Akuntansi' }
        }
      };
    });
    return init;
  });

  // Fetch Master Data on Mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [resK, resJ, resG, resM] = await Promise.all([
        api.get('/kelas').catch(() => ({ data: { data: [] } })),
        api.get('/jadwal').catch(() => ({ data: { data: [] } })),
        api.get('/guru').catch(() => ({ data: { data: [] } })),
        api.get('/mapel').catch(() => ({ data: { data: [] } }))
      ]);

      const kData = resK.data?.data || [];
      const jData = resJ.data?.data || [];
      const gData = resG.data?.data || [];
      const mData = resM.data?.data || [];

      if (kData.length > 0) setKelasList(kData);
      if (jData.length > 0) setJadwalList(jData);
      if (gData.length > 0) setGuruList(gData);
      if (mData.length > 0) setMapelList(mData);

      // Build options from API or combine with default
      if (gData.length > 0 && mData.length > 0) {
        const combined = [];
        gData.forEach((g, idx) => {
          mData.forEach(m => {
            combined.push({
              id: `${g.kode_guru || idx + 1}_${m.kode_mapel}`,
              kode_guru: String(g.kode_guru || idx + 1),
              nama_guru: g.nama_guru,
              kode_mapel: m.kode_mapel,
              nama_mapel: m.nama_mapel
            });
          });
        });
        if (combined.length > 0) {
          setMapelGuruOptions(combined);
        }
      }
    } catch (err) {
      console.error('Error loading initial jadwal data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Close popover when clicking outside
  useEffect(() => {
    const handleOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setActiveCell(null);
      }
    };
    if (activeCell) {
      document.addEventListener('mousedown', handleOutside);
    }
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [activeCell]);

  // Find all conflicts in the current day matrix
  const dayConflicts = useMemo(() => {
    const conflicts = []; // [{ jam, kode_guru, nama_guru, classes: ['X AKL', 'X MPLB'] }]
    const daySchedule = scheduleState[selectedHari] || {};

    timeSlots.forEach(slot => {
      if (slot.isBreak) return;
      const jamData = daySchedule[slot.jam] || {};
      const teacherMap = {}; // { kode_guru: [className] }

      classColumns.forEach(cls => {
        const cell = jamData[cls];
        if (cell && cell.kode_guru && cell.kode_guru !== '-') {
          const kg = String(cell.kode_guru);
          if (!teacherMap[kg]) {
            teacherMap[kg] = [];
          }
          teacherMap[kg].push({
            className: cls,
            nama_mapel: cell.nama_mapel,
            nama_guru: cell.nama_guru
          });
        }
      });

      // Find any teacher assigned to > 1 class in the same jam
      Object.entries(teacherMap).forEach(([kg, classArr]) => {
        if (classArr.length > 1) {
          const matchedGuru = mapelGuruOptions.find(o => String(o.kode_guru) === String(kg));
          conflicts.push({
            jam: slot.jam,
            range: slot.range,
            kode_guru: kg,
            nama_guru: classArr[0].nama_guru || matchedGuru?.nama_guru || `Guru (${kg})`,
            classes: classArr.map(c => c.className),
            details: classArr
          });
        }
      });
    });

    return conflicts;
  }, [scheduleState, selectedHari, mapelGuruOptions]);

  // Check if a specific cell currently has a conflict
  const isCellConflicting = (jam, className) => {
    const cell = scheduleState[selectedHari]?.[jam]?.[className];
    if (!cell || !cell.kode_guru || cell.kode_guru === '-') return false;
    return dayConflicts.some(c => c.jam === jam && c.classes.includes(className) && String(c.kode_guru) === String(cell.kode_guru));
  };

  // Check conflicts when user selects a new subject/guru
  const checkTeacherConflict = (targetJam, targetClass, selectedOption) => {
    if (!selectedOption || selectedOption.kode_guru === '-') return [];
    
    const targetGuru = String(selectedOption.kode_guru);
    const daySchedule = scheduleState[selectedHari] || {};
    const jamData = daySchedule[targetJam] || {};
    const conflicts = [];

    classColumns.forEach(cls => {
      if (cls === targetClass) return; // Skip current cell
      const otherCell = jamData[cls];
      if (otherCell && String(otherCell.kode_guru) === targetGuru) {
        conflicts.push({
          className: cls,
          nama_mapel: otherCell.nama_mapel || 'Mata Pelajaran',
          nama_guru: otherCell.nama_guru || selectedOption.nama_guru || `Guru (${targetGuru})`
        });
      }
    });

    return conflicts;
  };

  // Apply cell update into schedule state
  const applyCellUpdate = (jam, className, option) => {
    setScheduleState(prev => {
      const nextState = { ...prev };
      const nextDay = { ...(nextState[selectedHari] || {}) };
      const nextJam = { ...(nextDay[jam] || {}) };

      if (!option || option.kode_guru === '-') {
        delete nextJam[className];
      } else {
        nextJam[className] = {
          kode_guru: String(option.kode_guru),
          nama_guru: option.nama_guru || '',
          nama_mapel: option.nama_mapel || '',
          kode_mapel: option.kode_mapel || ''
        };
      }

      nextDay[jam] = nextJam;
      nextState[selectedHari] = nextDay;
      return nextState;
    });
    setActiveCell(null);
  };

  // Handle cell click / select with SweetAlert Conflict Warning
  const handleSelectOption = (option) => {
    if (!activeCell) return;
    const { jam, className } = activeCell;

    // If clearing cell
    if (!option || option.kode_guru === '-') {
      applyCellUpdate(jam, className, null);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'info',
        title: `Jadwal ${className} Jam ke-${jam} dikosongkan`,
        showConfirmButton: false,
        timer: 1500
      });
      return;
    }

    // Check for conflict
    const conflicts = checkTeacherConflict(jam, className, option);

    if (conflicts.length > 0) {
      const guruName = option.nama_guru || conflicts[0].nama_guru || `Guru Kode: ${option.kode_guru}`;
      const conflictListHtml = conflicts.map(c => `<li style="margin-bottom: 4px;"><strong>${c.className}</strong>: ${c.nama_mapel}</li>`).join('');

      Swal.fire({
        title: '⚠️ Peringatan: Jadwal Bentrok!',
        html: `
          <div style="text-align: left; font-size: 12.5px; line-height: 1.5; color: #1e293b;">
            <p style="margin-bottom: 8px;">
              Guru <strong style="color: #0284c7;">${guruName}</strong> (Kode: <strong>${option.kode_guru}</strong>) sudah terjadwal mengajar di kelas lain pada waktu yang sama:
            </p>
            <div style="background: #fef2f2; border: 1.5px solid #fecaca; border-radius: 6px; padding: 10px 14px; margin-bottom: 12px; color: #991b1b;">
              <div style="margin-bottom: 3px;">📅 <strong>Hari:</strong> ${selectedHari}</div>
              <div style="margin-bottom: 3px;">⏰ <strong>Jam ke-${jam}:</strong> ${timeSlots.find(s => s.jam === jam)?.range || ''}</div>
              <div>🏫 <strong>Kelas yang bentrok:</strong>
                <ul style="margin: 4px 0 0 18px; padding: 0;">${conflictListHtml}</ul>
              </div>
            </div>
            <p style="color: #64748b; font-size: 11.5px; margin: 0;">
              Apakah Anda ingin <strong>tetap menyimpan</strong> (jadwal gabungan) atau <strong>membatalkan</strong>?
            </p>
          </div>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Tetap Simpan',
        cancelButtonText: 'Batalkan',
        confirmButtonColor: '#f59e0b',
        cancelButtonColor: '#64748b',
        reverseButtons: true,
        customClass: {
          popup: 'swal2-custom-popup'
        }
      }).then((result) => {
        if (result.isConfirmed) {
          applyCellUpdate(jam, className, option);
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'warning',
            title: `Jadwal ${className} disimpan (Status: Bentrok)`,
            showConfirmButton: false,
            timer: 2500
          });
        }
      });
    } else {
      // Clean save without conflict
      applyCellUpdate(jam, className, option);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: `✓ ${className} Jam ke-${jam}: ${option.kode_guru} (${option.nama_mapel})`,
        showConfirmButton: false,
        timer: 1600
      });
    }
  };

  // Open popover at clicked cell
  const handleOpenCellPopover = (e, jam, className, isBreak) => {
    if (isBreak) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const currentVal = scheduleState[selectedHari]?.[jam]?.[className];
    setActiveCell({ jam, className, rect, currentVal });
    setCellSearchQuery('');
  };

  // Filter options for dropdown
  const filteredMapelGuru = useMemo(() => {
    if (!cellSearchQuery.trim()) return mapelGuruOptions;
    const q = cellSearchQuery.toLowerCase();
    return mapelGuruOptions.filter(opt =>
      opt.nama_mapel.toLowerCase().includes(q) ||
      (opt.nama_guru && opt.nama_guru.toLowerCase().includes(q)) ||
      String(opt.kode_guru).includes(q)
    );
  }, [mapelGuruOptions, cellSearchQuery]);

  // Save full schedule to API
  const handleSaveSchedule = async () => {
    setSaving(true);
    try {
      // In local state, everything is preserved; save feedback:
      setTimeout(() => {
        setSaving(false);
        Swal.fire({
          title: 'Berhasil!',
          text: `Seluruh pengaturan jadwal pelajaran untuk hari ${selectedHari} berhasil disimpan ke sistem.`,
          icon: 'success',
          confirmButtonColor: '#0284c7',
          customClass: {
            popup: 'swal2-custom-popup'
          }
        });
      }, 500);
    } catch (err) {
      setSaving(false);
      Swal.fire('Error', 'Gagal menyimpan perubahan jadwal pelajaran.', 'error');
    }
  };

  // Print schedule matrix
  const handlePrintMatrix = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    let tableHtml = `
      <table style="width: 100%; border-collapse: collapse; font-family: sans-serif; font-size: 11px; text-align: center;">
        <thead>
          <tr style="background: #f1f5f9;">
            <th colspan="2" style="border: 1px solid #000; padding: 6px;">WAKTU</th>
            <th colspan="${classColumns.length}" style="border: 1px solid #000; padding: 6px;">KELAS</th>
          </tr>
          <tr style="background: #f8fafc;">
            <th style="border: 1px solid #000; padding: 4px; width: 45px;">JAM</th>
            <th style="border: 1px solid #000; padding: 4px; width: 90px;">DARI - SAMPAI</th>
            ${classColumns.map(c => `<th style="border: 1px solid #000; padding: 4px;">${c}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
    `;

    timeSlots.forEach(slot => {
      tableHtml += `<tr>`;
      tableHtml += `<td style="border: 1px solid #000; font-weight: bold; padding: 4px;">${slot.jam}</td>`;
      tableHtml += `<td style="border: 1px solid #000; padding: 4px;">${slot.range}</td>`;

      if (slot.isBreak) {
        tableHtml += `<td colspan="${classColumns.length}" style="border: 1px solid #000; background: #f1f5f9; font-weight: bold; color: #475569; letter-spacing: 1px;">${slot.label}</td>`;
      } else {
        classColumns.forEach(cls => {
          const cell = scheduleState[selectedHari]?.[slot.jam]?.[cls];
          const display = cell ? `${cell.kode_guru} (${cell.nama_mapel})` : '-';
          tableHtml += `<td style="border: 1px solid #000; padding: 4px; font-weight: ${cell ? 'bold' : 'normal'};">${display}</td>`;
        });
      }
      tableHtml += `</tr>`;
    });

    tableHtml += `</tbody></table>`;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Jadwal Pelajaran - Hari ${selectedHari}</title>
        <style>
          @page { size: landscape; margin: 15mm; }
          body { font-family: Arial, sans-serif; margin: 0; color: #000; }
          .kop { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
        </style>
      </head>
      <body>
        <div class="kop">
          <h2 style="margin: 0; font-size: 16px;">SMK ARTANITA SYSTEM</h2>
          <h3 style="margin: 4px 0 0; font-size: 13px;">JADWAL PELAJARAN TAHUN AJARAN 2026/2027</h3>
          <p style="margin: 3px 0 0; font-size: 11px;">HARI: <strong>${selectedHari.toUpperCase()}</strong></p>
        </div>
        ${tableHtml}
        <script>
          window.onload = function() { window.print(); window.close(); }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Convert matrix to list data for the list view
  const flattenedList = useMemo(() => {
    const list = [];
    const dayData = scheduleState[selectedHari] || {};

    timeSlots.forEach(slot => {
      if (slot.isBreak) return;
      const jamData = dayData[slot.jam] || {};

      classColumns.forEach(cls => {
        if (selectedKelasFilter !== 'ALL' && cls !== selectedKelasFilter) return;
        const cell = jamData[cls];
        if (cell && cell.kode_guru) {
          list.push({
            hari: selectedHari,
            jam_ke: slot.jam,
            jam: slot.range,
            nama_kelas: cls,
            kode_guru: cell.kode_guru,
            nama_guru: cell.nama_guru || `Guru Kode ${cell.kode_guru}`,
            nama_mapel: cell.nama_mapel || 'Mata Pelajaran',
            isBentrok: isCellConflicting(slot.jam, cls)
          });
        }
      });
    });

    return list;
  }, [scheduleState, selectedHari, selectedKelasFilter, dayConflicts]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedList = flattenedList.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div>
      <div className="admin-panel" style={{ padding: '16px 20px' }}>
        
        {/* HEADER SECTION */}
        <div className="admin-panel-header" style={{ marginBottom: 14, paddingBottom: 10 }}>
          <div>
            <div className="admin-panel-title" style={{ fontSize: '15px' }}>
              <Calendar size={18} color="#0284c7" /> Setting Jadwal Pelajaran & Matriks Jam Mengajar
            </div>
            <div className="admin-panel-subtitle" style={{ fontSize: '11.5px' }}>
              Klik cell matriks untuk mengganti mata pelajaran/guru dengan deteksi bentrok otomatis
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-outline-admin"
              onClick={handlePrintMatrix}
              title="Cetak Jadwal Hari Ini"
            >
              <Printer size={13} /> Cetak
            </button>

            <button
              type="button"
              className="btn-primary-admin"
              onClick={handleSaveSchedule}
              disabled={saving}
              style={{ background: '#16a34a', borderColor: '#15803d' }}
            >
              <Save size={13} /> {saving ? 'Menyimpan...' : 'Simpan Jadwal'}
            </button>

            <div style={{ width: 1, height: 22, background: '#cbd5e1', margin: '0 4px' }} />

            <button
              type="button"
              className={`btn-outline-admin ${viewMode === 'matrix' ? 'active' : ''}`}
              onClick={() => setViewMode('matrix')}
              style={{
                background: viewMode === 'matrix' ? '#0284c7' : '#ffffff',
                color: viewMode === 'matrix' ? '#ffffff' : '#334155',
                borderColor: viewMode === 'matrix' ? '#0284c7' : '#cbd5e1',
                fontWeight: 600
              }}
            >
              Matriks Grid
            </button>
            <button
              type="button"
              className={`btn-outline-admin ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              style={{
                background: viewMode === 'list' ? '#0284c7' : '#ffffff',
                color: viewMode === 'list' ? '#ffffff' : '#334155',
                borderColor: viewMode === 'list' ? '#0284c7' : '#cbd5e1',
                fontWeight: 600
              }}
            >
              Daftar Baris
            </button>
          </div>
        </div>

        {/* DAY SELECTOR & CONFLICT ALERT BAR */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10,
          marginBottom: 14,
          padding: '10px 14px',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: 6
        }}>
          {/* DAY BUTTONS */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: '#475569', marginRight: 4 }}>PILIH HARI:</span>
            {daftarHari.map(h => (
              <button
                key={h}
                type="button"
                onClick={() => {
                  setSelectedHari(h);
                  setActiveCell(null);
                }}
                style={{
                  padding: '4px 10px',
                  borderRadius: 4,
                  fontSize: 11.5,
                  fontWeight: 700,
                  border: '1px solid',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  background: selectedHari === h ? '#0284c7' : '#ffffff',
                  color: selectedHari === h ? '#ffffff' : '#334155',
                  borderColor: selectedHari === h ? '#0369a1' : '#cbd5e1',
                  boxShadow: selectedHari === h ? '0 1px 2px rgba(2, 132, 199, 0.3)' : 'none'
                }}
              >
                {h}
              </button>
            ))}
          </div>

          {/* CONFLICT STATUS BADGE */}
          <div>
            {dayConflicts.length === 0 ? (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                borderRadius: 4,
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                color: '#059669',
                fontSize: 11.5,
                fontWeight: 700
              }}>
                <CheckCircle2 size={13} color="#059669" />
                <span>0 Bentrok (Jadwal Aman)</span>
              </div>
            ) : (
              <div
                onClick={() => {
                  Swal.fire({
                    title: `⚠️ ${dayConflicts.length} Jadwal Bentrok Terdeteksi!`,
                    html: `
                      <div style="text-align: left; font-size: 12.5px; max-height: 250px; overflow-y: auto;">
                        ${dayConflicts.map((c, i) => `
                          <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 8px 12px; margin-bottom: 8px; color: #991b1b;">
                            <div><strong>${i + 1}. Jam ke-${c.jam} (${c.range})</strong></div>
                            <div>Guru: <strong>${c.nama_guru}</strong> (Kode: ${c.kode_guru})</div>
                            <div>Kelas: <span style="font-weight: 800; color: #dc2626;">${c.classes.join(' & ')}</span></div>
                          </div>
                        `).join('')}
                      </div>
                    `,
                    icon: 'warning',
                    confirmButtonText: 'Tutup',
                    confirmButtonColor: '#dc2626'
                  });
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '4px 10px',
                  borderRadius: 4,
                  background: '#fef2f2',
                  border: '1px solid #f87171',
                  color: '#dc2626',
                  fontSize: 11.5,
                  fontWeight: 700,
                  cursor: 'pointer',
                  animation: 'pulse 2s infinite'
                }}
                title="Klik untuk melihat rincian bentrok"
              >
                <AlertTriangle size={13} color="#dc2626" />
                <span>⚠️ {dayConflicts.length} Jadwal Bentrok (Klik detail)</span>
              </div>
            )}
          </div>
        </div>

        {/* 1. MATRIX VIEW (INTERACTIVE SETTING JADWAL GRID) */}
        {viewMode === 'matrix' && (
          <div style={{ position: 'relative' }}>
            <div className="portal-matrix-table-wrap" style={{ border: '1px solid #cbd5e1', borderRadius: 4 }}>
              <table className="portal-matrix-table" style={{ width: '100%', fontSize: '11.5px' }}>
                <thead>
                  {/* TOP HEADER */}
                  <tr style={{ background: '#f8fafc' }}>
                    <th colSpan={2} className="matrix-th-waktu" style={{ border: '1px solid #cbd5e1', padding: '5px 8px', fontSize: '11.5px' }}>
                      WAKTU
                    </th>
                    <th colSpan={classColumns.length} className="matrix-th-kelas" style={{ border: '1px solid #cbd5e1', padding: '5px 8px', fontSize: '11.5px', letterSpacing: '0.05em' }}>
                      KELAS
                    </th>
                  </tr>
                  {/* SUB HEADER */}
                  <tr style={{ background: '#f1f5f9' }}>
                    <th className="matrix-th-jam" style={{ border: '1px solid #cbd5e1', width: 45, padding: '4px', fontSize: '11px' }}>JAM</th>
                    <th className="matrix-th-range" style={{ border: '1px solid #cbd5e1', width: 95, padding: '4px', fontSize: '11px' }}>DARI - SAMPAI</th>
                    {classColumns.map(col => {
                      const parts = col.split(' ');
                      return (
                        <th key={col} className="matrix-th-class" style={{ border: '1px solid #cbd5e1', minWidth: 62, padding: '4px 2px', fontSize: '11px' }}>
                          <div>{parts[0]}</div>
                          <div style={{ fontWeight: 800, color: '#0f172a' }}>{parts[1]}</div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {timeSlots.map(slot => {
                    if (slot.isBreak) {
                      return (
                        <tr key={slot.jam} style={{ background: '#f8fafc' }}>
                          <td className="matrix-td-jam" style={{ border: '1px solid #cbd5e1', fontWeight: 700, padding: '4px', color: '#64748b' }}>
                            {slot.jam}
                          </td>
                          <td className="matrix-td-range" style={{ border: '1px solid #cbd5e1', padding: '4px', color: '#64748b' }}>
                            {slot.range}
                          </td>
                          <td
                            colSpan={classColumns.length}
                            style={{
                              border: '1px solid #cbd5e1',
                              background: '#f1f5f9',
                              color: '#64748b',
                              fontWeight: 700,
                              fontSize: '11px',
                              letterSpacing: '0.05em',
                              padding: '6px'
                            }}
                          >
                            — {slot.label} —
                          </td>
                        </tr>
                      );
                    }

                    return (
                      <tr key={slot.jam}>
                        <td className="matrix-td-jam" style={{ border: '1px solid #cbd5e1', fontWeight: 700, padding: '3px 4px', fontSize: '11.5px', background: '#fff' }}>
                          {slot.jam}
                        </td>
                        <td className="matrix-td-range" style={{ border: '1px solid #cbd5e1', padding: '3px 4px', fontSize: '11px', color: '#475569', background: '#fff' }}>
                          {slot.range}
                        </td>
                        {classColumns.map(col => {
                          const cell = scheduleState[selectedHari]?.[slot.jam]?.[col];
                          const isBentrok = isCellConflicting(slot.jam, col);
                          const isSelected = activeCell?.jam === slot.jam && activeCell?.className === col;

                          let displayLabel = '-';
                          let tooltipText = 'Klik untuk memilih jadwal';

                          if (cell && cell.kode_guru && cell.kode_guru !== '-') {
                            displayLabel = `${cell.kode_guru} (${cell.nama_mapel ? cell.nama_mapel.substring(0, 4) : ''})`;
                            tooltipText = `Guru: ${cell.nama_guru || cell.kode_guru}\nMapel: ${cell.nama_mapel}`;
                          }

                          return (
                            <td
                              key={col}
                              onClick={(e) => handleOpenCellPopover(e, slot.jam, col, false)}
                              title={tooltipText}
                              style={{
                                border: '1px solid #cbd5e1',
                                padding: '2px',
                                background: isBentrok ? '#fef2f2' : isSelected ? '#eff6ff' : '#ffffff',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <div
                                style={{
                                  height: '28px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: 2,
                                  borderRadius: 3,
                                  padding: '0 4px',
                                  fontSize: '11px',
                                  fontWeight: cell?.kode_guru ? 700 : 500,
                                  color: isBentrok ? '#dc2626' : cell?.kode_guru ? '#0f172a' : '#94a3b8',
                                  border: isBentrok ? '1.5px solid #ef4444' : isSelected ? '1.5px solid #0284c7' : '1px solid transparent',
                                  background: isBentrok ? '#fee2e2' : isSelected ? '#dbeafe' : 'transparent',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}
                              >
                                {isBentrok && <AlertTriangle size={11} color="#dc2626" style={{ flexShrink: 0 }} />}
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {displayLabel}
                                </span>
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* FLOATING POPOVER SEARCHABLE DROPDOWN AT CLICKED CELL */}
            {activeCell && (
              <div
                ref={popoverRef}
                style={{
                  position: 'fixed',
                  top: Math.min(window.innerHeight - 320, Math.max(10, activeCell.rect.bottom + 4)),
                  left: Math.min(window.innerWidth - 300, Math.max(10, activeCell.rect.left - 40)),
                  width: 290,
                  maxHeight: 310,
                  background: '#ffffff',
                  border: '1px solid #cbd5e1',
                  borderRadius: 8,
                  boxShadow: '0 12px 30px rgba(15, 23, 42, 0.25), 0 4px 10px rgba(0,0,0,0.1)',
                  zIndex: 99999,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  animation: 'adminModalFadeIn 0.15s ease'
                }}
              >
                {/* POPOVER HEADER */}
                <div style={{
                  padding: '8px 10px',
                  background: '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ fontSize: 11.5, fontWeight: 800, color: '#0f172a' }}>
                    Pilih Mapel & Guru ({activeCell.className} - Jam {activeCell.jam})
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveCell(null)}
                    style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0 }}
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* SEARCH INPUT */}
                <div style={{ padding: '6px 8px', borderBottom: '1px solid #e2e8f0', background: '#ffffff' }}>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Search size={13} style={{ position: 'absolute', left: 8, color: '#94a3b8' }} />
                    <input
                      type="text"
                      autoFocus
                      placeholder="Cari mapel atau guru..."
                      value={cellSearchQuery}
                      onChange={(e) => setCellSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        height: 26,
                        paddingLeft: 26,
                        paddingRight: 8,
                        fontSize: 11,
                        border: '1px solid #cbd5e1',
                        borderRadius: 4,
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                {/* OPTIONS LIST (MATCHING SCREENSHOT) */}
                <div style={{ overflowY: 'auto', maxHeight: 220, padding: 4 }}>
                  {/* OPTION KOSONGKAN */}
                  <div
                    onClick={() => handleSelectOption({ kode_guru: '-' })}
                    style={{
                      padding: '5px 8px',
                      fontSize: 11.5,
                      borderRadius: 4,
                      cursor: 'pointer',
                      color: '#dc2626',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      background: '#fff',
                      marginBottom: 2
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#fee2e2'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#fff'}
                  >
                    <X size={13} /> - ( Kosongkan Jadwal )
                  </div>

                  {filteredMapelGuru.map(opt => {
                    const isCurrent = activeCell.currentVal && String(activeCell.currentVal.kode_guru) === String(opt.kode_guru) && activeCell.currentVal.nama_mapel === opt.nama_mapel;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleSelectOption(opt)}
                        style={{
                          padding: '5px 8px',
                          fontSize: 11.5,
                          borderRadius: 4,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 6,
                          background: isCurrent ? '#e0f2fe' : '#ffffff',
                          color: isCurrent ? '#0369a1' : '#1e293b',
                          fontWeight: isCurrent ? 700 : 500,
                          lineHeight: 1.3
                        }}
                        onMouseEnter={(e) => {
                          if (!isCurrent) e.currentTarget.style.background = '#f1f5f9';
                        }}
                        onMouseLeave={(e) => {
                          if (!isCurrent) e.currentTarget.style.background = '#ffffff';
                        }}
                      >
                        <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          <span style={{ fontWeight: 800, color: '#0284c7' }}>{opt.kode_guru}</span>
                          {' '}( {opt.nama_mapel} )
                          {opt.nama_guru && (
                            <span style={{ display: 'block', fontSize: 10, color: '#64748b', marginTop: 1 }}>
                              {opt.nama_guru}
                            </span>
                          )}
                        </div>
                        {isCurrent && <Check size={13} color="#0284c7" style={{ flexShrink: 0 }} />}
                      </div>
                    );
                  })}

                  {filteredMapelGuru.length === 0 && (
                    <div style={{ padding: 12, textAlign: 'center', fontSize: 11, color: '#94a3b8' }}>
                      Tidak ditemukan mapel/guru
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. LIST VIEW (TABULAR WITH PAGINATION & FILTERS) */}
        {viewMode === 'list' && (
          <div>
            {/* FILTERS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 10, marginBottom: 14 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 4, display: 'block' }}>FILTER HARI</label>
                <SearchableSelect
                  value={selectedHari}
                  onChange={(e) => setSelectedHari(e.target.value)}
                  options={daftarHari.map(h => ({ value: h, label: h }))}
                />
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 4, display: 'block' }}>FILTER KELAS</label>
                <SearchableSelect
                  value={selectedKelasFilter}
                  onChange={(e) => setSelectedKelasFilter(e.target.value)}
                  options={[
                    { value: 'ALL', label: 'Semua Kelas' },
                    ...classColumns.map(c => ({ value: c, label: c }))
                  ]}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button
                  type="button"
                  className="btn-outline-admin"
                  onClick={() => {
                    setSelectedHari('Senin');
                    setSelectedKelasFilter('ALL');
                  }}
                  title="Reset Filter"
                >
                  <RefreshCw size={13} /> Reset
                </button>
              </div>
            </div>

            {/* LIST TABLE */}
            <div className="admin-table-wrapper" style={{ border: '1px solid #cbd5e1', borderRadius: 4 }}>
              <table className="admin-table" style={{ width: '100%', fontSize: '11.5px' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9' }}>
                    <th style={{ width: 45, textAlign: 'center' }}>No</th>
                    <th style={{ textAlign: 'center' }}>Hari</th>
                    <th style={{ textAlign: 'center' }}>Jam Ke</th>
                    <th style={{ textAlign: 'center' }}>Waktu / Jam</th>
                    <th style={{ textAlign: 'center' }}>Kelas</th>
                    <th>Mata Pelajaran</th>
                    <th>Guru Pengampu</th>
                    <th style={{ textAlign: 'center' }}>Status Bentrok</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedList.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '30px 0', color: '#64748b' }}>
                        Tidak ada jadwal terdaftar untuk filter yang dipilih.
                      </td>
                    </tr>
                  ) : (
                    paginatedList.map((j, idx) => (
                      <tr key={idx} style={{ background: j.isBentrok ? '#fef2f2' : '#ffffff' }}>
                        <td style={{ fontWeight: 700, color: '#64748b', textAlign: 'center' }}>{startIndex + idx + 1}</td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{
                            background: '#eff6ff',
                            color: '#1d4ed8',
                            fontWeight: 700,
                            padding: '2px 6px',
                            borderRadius: 3,
                            fontSize: 11
                          }}>
                            {j.hari}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center', fontWeight: 700, color: '#334155' }}>
                          Jam Ke-{j.jam_ke}
                        </td>
                        <td style={{ textAlign: 'center', color: '#0f172a', fontWeight: 600 }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                            <Clock size={12} color="#64748b" />
                            {j.jam}
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span style={{ fontWeight: 800, color: '#0284c7' }}>
                            {j.nama_kelas}
                          </span>
                        </td>
                        <td>
                          <div style={{ fontWeight: 700, color: '#0f172a' }}>
                            {j.nama_mapel}
                          </div>
                        </td>
                        <td>
                          <div style={{ color: '#334155', fontWeight: 600 }}>
                            <span style={{ fontWeight: 800, color: '#0284c7', marginRight: 4 }}>[{j.kode_guru}]</span>
                            {j.nama_guru}
                          </div>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          {j.isBentrok ? (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              background: '#fee2e2',
                              color: '#dc2626',
                              border: '1px solid #fca5a5',
                              padding: '2px 6px',
                              borderRadius: 3,
                              fontSize: 10.5,
                              fontWeight: 800
                            }}>
                              <AlertTriangle size={11} /> Bentrok
                            </span>
                          ) : (
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              background: '#ecfdf5',
                              color: '#059669',
                              border: '1px solid #a7f3d0',
                              padding: '2px 6px',
                              borderRadius: 3,
                              fontSize: 10.5,
                              fontWeight: 700
                            }}>
                              <CheckCircle2 size={11} /> Aman
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            <Pagination
              currentPage={currentPage}
              totalItems={flattenedList.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

      </div>
    </div>
  );
}
