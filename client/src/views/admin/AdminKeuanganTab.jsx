import React, { useState, useEffect } from 'react';
import {
  Wallet, CreditCard, Layers, RefreshCw, FileSpreadsheet,
  Plus, Search, Edit2, Trash2, CheckCircle, DollarSign,
  X, Check, Printer, User, Filter, AlertCircle, History, Eye
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../api/client';
import Pagination from '../../components/Pagination';
import SearchableSelect from '../../components/SearchableSelect';

const NAMA_BULAN = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const getBulanLabel = (bulanNum) => {
  if (!bulanNum) return '';
  const idx = Number(bulanNum) - 1;
  return NAMA_BULAN[idx] || `Bulan ${bulanNum}`;
};

const formatRupiahInput = (val) => {
  if (val === undefined || val === null || val === '') return '';
  const numStr = String(val).replace(/[^0-9]/g, '');
  if (!numStr) return '';
  return parseInt(numStr, 10).toLocaleString('id-ID');
};

const parseRupiahInput = (val) => {
  if (!val) return 0;
  return parseInt(String(val).replace(/[^0-9]/g, ''), 10) || 0;
};

export default function AdminKeuanganTab() {
  const [activeSubTab, setActiveSubTab] = useState('kasir'); // 'kasir', 'master', 'generate', 'rekap', 'histori'

  // --- KASIR STATE ---
  const [siswaSearch, setSiswaSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedSiswa, setSelectedSiswa] = useState(null);
  const [siswaTagihan, setSiswaTagihan] = useState([]);
  const [selectedTagihanIds, setSelectedTagihanIds] = useState([]);
  const [bayarNominal, setBayarNominal] = useState({});
  const [totalBayar, setTotalBayar] = useState(0);
  const [cashReceived, setCashReceived] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [showDanaModal, setShowDanaModal] = useState(false);
  const [danaModalData, setDanaModalData] = useState(null);
  const [lastReceipt, setLastReceipt] = useState(null);
  const [kasirViewMode, setKasirViewMode] = useState('tagihan'); // 'tagihan' vs 'riwayat_siswa'
  const [siswaRiwayatTransaksi, setSiswaRiwayatTransaksi] = useState([]);

  // --- HISTORI TRANSAKSI STATE ---
  const [transaksiList, setTransaksiList] = useState([]);
  const [transaksiSearch, setTransaksiSearch] = useState('');
  const [isLoadingTransaksi, setIsLoadingTransaksi] = useState(false);
  const [transaksiPage, setTransaksiPage] = useState(1);
  const [showKwitansiModal, setShowKwitansiModal] = useState(false);
  const [selectedTransaksiDetail, setSelectedTransaksiDetail] = useState(null);

  // --- MASTER POS & TARIF STATE ---
  const [posList, setPosList] = useState([]);
  const [tarifList, setTarifList] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [masterSubTab, setMasterSubTab] = useState('pos'); // 'pos', 'tarif', 'override'

  const currentYear = new Date().getFullYear();

  // Modal States
  const [showPosModal, setShowPosModal] = useState(false);
  const [posFormData, setPosFormData] = useState({ kode_pos: '', nama_pos: '', tipe: 'BULANAN', deskripsi: '' });
  const [editingPosId, setEditingPosId] = useState(null);

  const [showTarifModal, setShowTarifModal] = useState(false);
  const [editingTarifId, setEditingTarifId] = useState(null);
  const [targetType, setTargetType] = useState('UMUM'); // 'UMUM', 'TINGKAT', 'KELAS'
  const [selectedKelasList, setSelectedKelasList] = useState([]); // array of kode_kelas for multi-select
  const [selectedTingkatList, setSelectedTingkatList] = useState([]); // array of tingkat for multi-select
  const [kelasSearchQuery, setKelasSearchQuery] = useState('');
  const [tarifFormData, setTarifFormData] = useState({ pos_id: '', tahun_ajaran: `${currentYear}/${currentYear + 1}`, tingkat: '', kode_kelas: '', nominal: '' });
  const [tarifFilterPos, setTarifFilterPos] = useState('');
  const [tarifSearch, setTarifSearch] = useState('');

  // Dynamic levels extracted from database kelasList
  const tingkatOptions = React.useMemo(() => {
    const setTingkat = new Set();
    kelasList.forEach(k => {
      const name = String(k.nama_kelas || k.kode_kelas || '').trim();
      const match = name.match(/^(\d+|X|XI|XII|VII|VIII|IX|IV|V|VI|I|II|III)/i);
      if (match) {
        setTingkat.add(match[1].toUpperCase());
      }
    });
    tarifList.forEach(t => {
      if (t.tingkat) setTingkat.add(String(t.tingkat).toUpperCase());
    });

    const found = Array.from(setTingkat);
    const defaults = ['10', '11', '12', 'X', 'XI', 'XII', '7', '8', '9'];
    const merged = Array.from(new Set([...found, ...defaults]));
    return merged.map(val => ({
      value: val,
      label: `Tingkat ${val}`
    }));
  }, [kelasList, tarifList]);

  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [overrideData, setOverrideData] = useState({ tarif_id: '', siswa_id: '', tipe_potongan: 'NOMINAL', nilai_potongan: '', keterangan: '' });

  // --- GENERATE TAGIHAN STATE ---
  const [genFormData, setGenFormData] = useState({
    mode: 'RANGE',
    tarif_id: '',
    bulan: new Date().getMonth() + 1,
    tahun: currentYear,
    bulan_mulai: 7,
    tahun_mulai: currentYear,
    bulan_selesai: 6,
    tahun_selesai: currentYear + 1,
    kode_kelas: '',
    tanggal_jatuh_tempo: ''
  });
  const [isGenerating, setIsGenerating] = useState(false);

  // --- KELOLA TAGIHAN STATE ---
  const [allTagihanList, setAllTagihanList] = useState([]);
  const [isLoadingAllTagihan, setIsLoadingAllTagihan] = useState(false);
  const [tagihanSearch, setTagihanSearch] = useState('');
  const [tagihanFilterPos, setTagihanFilterPos] = useState('');
  const [tagihanFilterKelas, setTagihanFilterKelas] = useState('');
  const [tagihanFilterBulan, setTagihanFilterBulan] = useState('');
  const [tagihanFilterTahun, setTagihanFilterTahun] = useState('');
  const [tagihanFilterStatus, setTagihanFilterStatus] = useState('ALL');

  // Edit Tagihan Modal State
  const [showEditTagihanModal, setShowEditTagihanModal] = useState(false);
  const [editTagihanData, setEditTagihanData] = useState(null);

  // --- REKAP TUNGGAKAN STATE ---
  const [rekapFilterKelas, setRekapFilterKelas] = useState('');
  const [rekapTunggakan, setRekapTunggakan] = useState([]);
  const [isLoadingRekap, setIsLoadingRekap] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showRekapDetailModal, setShowRekapDetailModal] = useState(false);
  const [selectedRekapSiswa, setSelectedRekapSiswa] = useState(null);
  const [rekapDetailTagihan, setRekapDetailTagihan] = useState([]);
  const [isLoadingRekapDetail, setIsLoadingRekapDetail] = useState(false);

  // Load Initial Data
  useEffect(() => {
    fetchPosList();
    fetchTarifList();
    fetchKelasList();
  }, []);

  const fetchPosList = async () => {
    try {
      const res = await api.get('/keuangan/pos');
      if (res.data?.success) setPosList(res.data.data || []);
    } catch (e) {
      console.error('Error fetch pos:', e);
    }
  };

  const fetchTarifList = async () => {
    try {
      const res = await api.get('/keuangan/tarif');
      if (res.data?.success) setTarifList(res.data.data || []);
    } catch (e) {
      console.error('Error fetch tarif:', e);
    }
  };

  const fetchKelasList = async () => {
    try {
      const res = await api.get('/kelas');
      if (res.data?.success) setKelasList(res.data.data || []);
    } catch (e) {
      console.error('Error fetch kelas:', e);
    }
  };

  // --- KASIR HANDLERS ---
  const handleLiveSearch = async (queryVal) => {
    if (!queryVal || !queryVal.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    try {
      const res = await api.get('/siswa', { params: { search: queryVal.trim() } });
      const students = res.data?.data || [];
      setSearchResults(students);
      setShowDropdown(true);

      // Jika hanya ada 1 hasil pencarian yang tepat, langsung pilih
      if (students.length === 1 && String(queryVal).trim().toLowerCase() === String(students[0].nis || '').toLowerCase()) {
        handleSelectStudent(students[0]);
      }
    } catch (err) {
      console.error('Error live search:', err);
    }
  };

  const handleSelectStudent = (student) => {
    setSelectedSiswa(student);
    setSiswaSearch(`${student.nama_siswa} (${student.nis || 'NIS'})`);
    setShowDropdown(false);
    setSearchResults([]);
    setKasirViewMode('tagihan');
    fetchSiswaTagihan(student.kode_siswa);
    fetchSiswaRiwayatTransaksi(student.kode_siswa);
  };

  const handleSearchSiswaSubmit = async (e) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      handleSelectStudent(searchResults[0]);
    } else if (siswaSearch.trim()) {
      handleLiveSearch(siswaSearch.trim());
    }
  };

  const fetchSiswaTagihan = async (kode_siswa) => {
    try {
      const res = await api.get(`/keuangan/tagihan/siswa/${kode_siswa}`, { params: { status: 'ALL' } });
      const tagihans = res.data?.data || [];
      setSiswaTagihan(tagihans);
      setSelectedTagihanIds([]);
      setBayarNominal({});
      setTotalBayar(0);
    } catch (e) {
      console.error('Error fetch tagihan siswa:', e);
    }
  };

  const fetchSiswaRiwayatTransaksi = async (kode_siswa) => {
    try {
      const res = await api.get('/keuangan/transaksi', { params: { siswa_id: kode_siswa, limit: 50 } });
      if (res.data?.success) setSiswaRiwayatTransaksi(res.data.data || []);
    } catch (e) {
      console.error('Error fetch riwayat siswa:', e);
    }
  };

  const fetchTransaksiList = async () => {
    setIsLoadingTransaksi(true);
    try {
      const res = await api.get('/keuangan/transaksi', { params: { limit: 100 } });
      if (res.data?.success) setTransaksiList(res.data.data || []);
    } catch (e) {
      console.error('Error fetch transaksi:', e);
    } finally {
      setIsLoadingTransaksi(false);
    }
  };

  const handleOpenKwitansi = async (transaksiId) => {
    try {
      const res = await api.get(`/keuangan/transaksi/${transaksiId}`);
      if (res.data?.success) {
        setSelectedTransaksiDetail(res.data.data);
        setShowKwitansiModal(true);
      }
    } catch (e) {
      Swal.fire('Error', 'Gagal memuat detail kuitansi.', 'error');
    }
  };

  const handleCancelTransaksi = async (transaksiId) => {
    const confirm = await Swal.fire({
      title: 'Batalkan Pembayaran Ini?',
      text: 'Status transaksi akan diubah menjadi CANCELLED dan nominal tagihan siswa akan dikembalikan menjadi BELUM LUNAS.',
      icon: 'warning',
      input: 'textarea',
      inputLabel: 'Alasan Pembatalan Transaksi *',
      inputPlaceholder: 'Masukkan alasan pembatalan (misal: salah input nominal / ralat kasir)...',
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return 'Alasan pembatalan transaksi wajib diisi!';
        }
      },
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Batalkan Transaksi',
      cancelButtonText: 'Batal'
    });

    if (!confirm.isConfirmed || !confirm.value) return;

    try {
      const res = await api.delete(`/keuangan/transaksi/${transaksiId}`, {
        data: { alasan_batal: confirm.value }
      });
      if (res.data?.success) {
        Swal.fire('Sukses', 'Transaksi berhasil dibatalkan dan tagihan siswa dikembalikan.', 'success');
        fetchTransaksiList();
        if (selectedSiswa) {
          fetchSiswaTagihan(selectedSiswa.kode_siswa);
          fetchSiswaRiwayatTransaksi(selectedSiswa.kode_siswa);
        }
      }
    } catch (e) {
      Swal.fire('Gagal', e.response?.data?.message || 'Gagal membatalkan transaksi.', 'error');
    }
  };


  const toggleSelectTagihan = (t) => {
    const isSelected = selectedTagihanIds.includes(t.id);
    let newIds = [];
    let newNominal = { ...bayarNominal };

    if (isSelected) {
      newIds = selectedTagihanIds.filter(id => id !== t.id);
      delete newNominal[t.id];
    } else {
      newIds = [...selectedTagihanIds, t.id];
      const sisa = Number(t.nominal_tagihan) - Number(t.nominal_terbayar || 0);
      newNominal[t.id] = sisa;
    }

    setSelectedTagihanIds(newIds);
    setBayarNominal(newNominal);
    calculateTotal(newNominal);
  };

  const toggleSelectAllGroup = (items = []) => {
    if (!items || items.length === 0) return;
    const itemIds = items.map(t => t.id);
    const allSelected = itemIds.every(id => selectedTagihanIds.includes(id));

    let newIds = [...selectedTagihanIds];
    let newNominal = { ...bayarNominal };

    if (allSelected) {
      newIds = newIds.filter(id => !itemIds.includes(id));
      itemIds.forEach(id => delete newNominal[id]);
    } else {
      itemIds.forEach(id => {
        if (!newIds.includes(id)) {
          newIds.push(id);
        }
        const item = items.find(t => t.id === id);
        if (item) {
          const sisa = Number(item.nominal_tagihan) - Number(item.nominal_terbayar || 0);
          newNominal[id] = sisa;
        }
      });
    }

    setSelectedTagihanIds(newIds);
    setBayarNominal(newNominal);
    calculateTotal(newNominal);
  };

  const handleNominalChange = (tId, val) => {
    const num = Number(val) || 0;
    const newNominal = { ...bayarNominal, [tId]: num };
    setBayarNominal(newNominal);
    calculateTotal(newNominal);
  };

  const calculateTotal = (nominals) => {
    const sum = Object.values(nominals).reduce((acc, curr) => acc + Number(curr || 0), 0);
    setTotalBayar(sum);
  };

  const handleProcessPayment = async () => {
    if (!selectedSiswa || selectedTagihanIds.length === 0) {
      Swal.fire('Peringatan', 'Pilih minimal satu tagihan untuk dibayar.', 'warning');
      return;
    }
    if (totalBayar <= 0) {
      Swal.fire('Peringatan', 'Nominal bayar harus lebih besar dari Rp 0.', 'warning');
      return;
    }

    const cashVal = parseRupiahInput(cashReceived);
    if (!cashReceived || cashVal < totalBayar) {
      Swal.fire('Peringatan', 'Uang Diterima (Cash In) belum diisi atau kurang dari total pembayaran.', 'warning');
      return;
    }

    const items = selectedTagihanIds.map(id => ({
      tagihan_id: id,
      nominal_bayar: bayarNominal[id] || 0
    }));

    const confirm = await Swal.fire({
      title: 'Konfirmasi Pembayaran Kasir',
      html: `
        <div style="text-align:left; font-size:14px;">
          <p><strong>Siswa:</strong> ${selectedSiswa.nama_siswa} (${selectedSiswa.nis || 'NIS'})</p>
          <p><strong>Total Pembayaran:</strong> <span style="color:#16a34a; font-weight:700;">Rp ${totalBayar.toLocaleString('id-ID')}</span></p>
          <p>Metode Pembayaran: <strong>Tunai (Kasir TU)</strong></p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Proses Pembayaran',
      cancelButtonText: 'Batal'
    });

    if (!confirm.isConfirmed) return;

    setIsProcessingPayment(true);
    try {
      const res = await api.post('/keuangan/bayar/cash', {
        siswa_id: selectedSiswa.kode_siswa,
        items
      });

      if (res.data?.success) {
        Swal.fire('Sukses', 'Pembayaran berhasil diproses!', 'success');
        setLastReceipt(res.data.data);
        if (res.data.data?.id) {
          handleOpenKwitansi(res.data.data.id);
        }
        fetchSiswaTagihan(selectedSiswa.kode_siswa);
        fetchSiswaRiwayatTransaksi(selectedSiswa.kode_siswa);
      }
    } catch (e) {
      Swal.fire('Gagal', e.response?.data?.message || 'Gagal memproses pembayaran.', 'error');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // --- POS HANDLERS ---
  const handleSavePos = async (e) => {
    e.preventDefault();
    try {
      if (editingPosId) {
        await api.put(`/keuangan/pos/${editingPosId}`, posFormData);
        Swal.fire('Berhasil', 'Pos pembayaran berhasil diperbarui.', 'success');
      } else {
        await api.post('/keuangan/pos', posFormData);
        Swal.fire('Berhasil', 'Pos pembayaran berhasil ditambahkan.', 'success');
      }
      setShowPosModal(false);
      setPosFormData({ kode_pos: '', nama_pos: '', tipe: 'BULANAN', deskripsi: '' });
      setEditingPosId(null);
      fetchPosList();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Gagal menyimpan pos.', 'error');
    }
  };

  const handleDeletePos = async (id) => {
    const confirm = await Swal.fire({
      title: 'Hapus Pos Pembayaran?',
      text: 'Semua tarif terkait pos ini akan ikut terhapus.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus'
    });
    if (confirm.isConfirmed) {
      await api.delete(`/keuangan/pos/${id}`);
      fetchPosList();
      fetchTarifList();
    }
  };

  // --- TARIF HANDLERS ---
  const handleOpenAddTarif = () => {
    setEditingTarifId(null);
    setTargetType('UMUM');
    setSelectedKelasList([]);
    setSelectedTingkatList([]);
    setKelasSearchQuery('');
    setTarifFormData({ pos_id: posList[0]?.id || '', tahun_ajaran: `${currentYear}/${currentYear + 1}`, tingkat: '', kode_kelas: '', nominal: '' });
    setShowTarifModal(true);
  };

  const handleOpenEditTarif = (t) => {
    setEditingTarifId(t.id);
    let tt = 'UMUM';
    if (t.kode_kelas) {
      tt = 'KELAS';
      setSelectedKelasList([t.kode_kelas]);
      setSelectedTingkatList([]);
    } else if (t.tingkat) {
      tt = 'TINGKAT';
      setSelectedTingkatList([t.tingkat]);
      setSelectedKelasList([]);
    } else {
      setSelectedKelasList([]);
      setSelectedTingkatList([]);
    }
    setTargetType(tt);
    setKelasSearchQuery('');
    setTarifFormData({
      pos_id: t.pos_id,
      tahun_ajaran: t.tahun_ajaran || `${currentYear}/${currentYear + 1}`,
      tingkat: t.tingkat || '',
      kode_kelas: t.kode_kelas || '',
      nominal: t.nominal || ''
    });
    setShowTarifModal(true);
  };

  const handleSaveTarif = async (e) => {
    e.preventDefault();
    if (!tarifFormData.pos_id) {
      Swal.fire('Peringatan', 'Pilih Pos Pembayaran terlebih dahulu.', 'warning');
      return;
    }

    const nominalNum = parseRupiahInput(tarifFormData.nominal) || Number(tarifFormData.nominal) || 0;
    if (nominalNum <= 0) {
      Swal.fire('Peringatan', 'Nominal tarif harus lebih besar dari 0.', 'warning');
      return;
    }

    try {
      if (targetType === 'KELAS') {
        if (selectedKelasList.length === 0) {
          Swal.fire('Peringatan', 'Pilih minimal 1 kelas.', 'warning');
          return;
        }

        // Save (create or update) tarif for EVERY selected class
        await Promise.all(
          selectedKelasList.map(k =>
            api.post('/keuangan/tarif', {
              pos_id: tarifFormData.pos_id,
              tahun_ajaran: tarifFormData.tahun_ajaran,
              kode_kelas: k,
              tingkat: null,
              nominal: nominalNum
            })
          )
        );
        Swal.fire('Berhasil', `Berhasil menyimpan tarif untuk ${selectedKelasList.length} kelas terpilih!`, 'success');

      } else if (targetType === 'TINGKAT') {
        if (selectedTingkatList.length === 0) {
          Swal.fire('Peringatan', 'Pilih minimal 1 tingkat.', 'warning');
          return;
        }

        // Save (create or update) tarif for EVERY selected tingkat
        await Promise.all(
          selectedTingkatList.map(t =>
            api.post('/keuangan/tarif', {
              pos_id: tarifFormData.pos_id,
              tahun_ajaran: tarifFormData.tahun_ajaran,
              kode_kelas: null,
              tingkat: t,
              nominal: nominalNum
            })
          )
        );
        Swal.fire('Berhasil', `Berhasil menyimpan tarif untuk ${selectedTingkatList.length} tingkat/angkatan terpilih!`, 'success');

      } else {
        // UMUM (Semua Kelas)
        if (editingTarifId) {
          await api.put(`/keuangan/tarif/${editingTarifId}`, {
            pos_id: tarifFormData.pos_id,
            tahun_ajaran: tarifFormData.tahun_ajaran,
            kode_kelas: null,
            tingkat: null,
            nominal: nominalNum
          });
        } else {
          await api.post('/keuangan/tarif', {
            pos_id: tarifFormData.pos_id,
            tahun_ajaran: tarifFormData.tahun_ajaran,
            kode_kelas: null,
            tingkat: null,
            nominal: nominalNum
          });
        }
        Swal.fire('Berhasil', 'Tarif pembayaran umum berhasil disimpan.', 'success');
      }

      setShowTarifModal(false);
      setEditingTarifId(null);
      setSelectedKelasList([]);
      setSelectedTingkatList([]);
      setTarifFormData({ pos_id: '', tahun_ajaran: `${currentYear}/${currentYear + 1}`, tingkat: '', kode_kelas: '', nominal: '' });
      fetchTarifList();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Gagal menyimpan tarif.', 'error');
    }
  };

  const handleDeleteTarif = async (id) => {
    const confirm = await Swal.fire({
      title: 'Hapus Tarif?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Ya, Hapus'
    });
    if (confirm.isConfirmed) {
      await api.delete(`/keuangan/tarif/${id}`);
      fetchTarifList();
    }
  };

  // --- GENERATE INVOICE HANDLERS ---
  const handleGenerateInvoice = async (e) => {
    e.preventDefault();
    if (!genFormData.tarif_id) {
      Swal.fire('Peringatan', 'Pilih Pos & Tarif terlebih dahulu.', 'warning');
      return;
    }

    const selectedTarif = tarifList.find(t => String(t.id) === String(genFormData.tarif_id));
    const isBebas = selectedTarif?.tipe === 'BEBAS';

    if (isBebas) {
      if (!genFormData.tahun) {
        Swal.fire('Peringatan', 'Isi Tahun Tagihan terlebih dahulu.', 'warning');
        return;
      }
    } else {
      if (genFormData.mode === 'SINGLE') {
        if (!genFormData.bulan || !genFormData.tahun) {
          Swal.fire('Peringatan', 'Pilih Bulan dan Tahun tagihan terlebih dahulu.', 'warning');
          return;
        }
      } else {
        if (!genFormData.bulan_mulai || !genFormData.tahun_mulai || !genFormData.bulan_selesai || !genFormData.tahun_selesai) {
          Swal.fire('Peringatan', 'Lengkapi bulan & tahun mulai serta selesai.', 'warning');
          return;
        }
      }
    }

    let modeText = '';
    if (isBebas) {
      modeText = `Tipe Bebas (Tahun ${genFormData.tahun})`;
    } else if (genFormData.mode === 'SINGLE') {
      modeText = `1 bulan (${getBulanLabel(genFormData.bulan)} ${genFormData.tahun})`;
    } else {
      modeText = `rentang bulan ${getBulanLabel(genFormData.bulan_mulai)} ${genFormData.tahun_mulai} s/d ${getBulanLabel(genFormData.bulan_selesai)} ${genFormData.tahun_selesai}`;
    }

    const confirm = await Swal.fire({
      title: isBebas ? 'Generate Tagihan Tipe Bebas?' : 'Generate Tagihan SPP?',
      html: `
        <div style="text-align:left; font-size:13.5px;">
          <p>Sistem akan membuat <strong>tagihan ${isBebas ? 'Tipe Bebas (Non-Bulanan)' : 'SPP Bulanan'}</strong> untuk <strong>${modeText}</strong>.</p>
          <p style="color:#64748b; font-size:12px; margin-top:6px;">Tagihan yang sudah ada sebelumnya akan otomatis dilewati (tidak duplikat).</p>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Proses Generate'
    });

    if (!confirm.isConfirmed) return;

    setIsGenerating(true);
    try {
      const payload = isBebas ? {
        mode: 'SINGLE',
        tarif_id: genFormData.tarif_id,
        bulan: null,
        tahun: genFormData.tahun,
        kode_kelas: genFormData.kode_kelas,
        tanggal_jatuh_tempo: genFormData.tanggal_jatuh_tempo
      } : genFormData;

      const res = await api.post('/keuangan/tagihan/generate', payload);
      if (res.data?.success) {
        const d = res.data.data;
        if (!isBebas && genFormData.mode === 'RANGE') {
          Swal.fire(
            'Generasi Berhasil',
            `Berhasil meloop ${d.months_processed || 1} bulan. Total ${d.generated_count} tagihan baru terbuat untuk ${d.total_siswa} siswa.`,
            'success'
          );
        } else {
          Swal.fire(
            'Generasi Berhasil',
            `Berhasil generate ${d.generated_count} tagihan baru dari total ${d.total_siswa} siswa.`,
            'success'
          );
        }
      }
    } catch (e) {
      Swal.fire('Error', e.response?.data?.message || 'Gagal membuat tagihan.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  // --- KELOLA TAGIHAN HANDLERS ---
  const fetchAllTagihanList = async () => {
    setIsLoadingAllTagihan(true);
    try {
      const res = await api.get('/keuangan/tagihan', {
        params: {
          search: tagihanSearch,
          pos_id: tagihanFilterPos,
          kode_kelas: tagihanFilterKelas,
          bulan: tagihanFilterBulan,
          tahun: tagihanFilterTahun,
          status: tagihanFilterStatus,
          limit: 100
        }
      });
      if (res.data?.success) setAllTagihanList(res.data.data || []);
    } catch (e) {
      console.error('Error fetch all tagihan:', e);
    } finally {
      setIsLoadingAllTagihan(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'tagihan_list') {
      fetchAllTagihanList();
    }
  }, [activeSubTab, tagihanFilterPos, tagihanFilterKelas, tagihanFilterBulan, tagihanFilterTahun, tagihanFilterStatus]);

  const handleDeleteSingleTagihan = async (t) => {
    if (Number(t.nominal_terbayar || 0) > 0) {
      Swal.fire('Tidak Dapat Dihapus', 'Tagihan ini sudah pernah dibayar sebagian/lunas. Silakan batalkan transaksinya terlebih dahulu di Riwayat Transaksi.', 'warning');
      return;
    }

    const confirm = await Swal.fire({
      title: 'Hapus Tagihan Ini?',
      html: `
        <div style="text-align:left; font-size:13px;">
          <p><strong>Kode Tagihan:</strong> ${t.kode_tagihan}</p>
          <p><strong>Siswa:</strong> ${t.nama_siswa} (${t.nama_kelas || 'Tanpa Kelas'})</p>
          <p><strong>Pos & Periode:</strong> ${t.nama_pos} - ${t.bulan ? `${getBulanLabel(t.bulan)} ${t.tahun}` : 'Tipe Bebas'}</p>
          <p><strong>Nominal Tagihan:</strong> <span style="color:#dc2626; font-weight:700;">Rp ${Number(t.nominal_tagihan).toLocaleString('id-ID')}</span></p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Ya, Hapus Tagihan'
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await api.delete(`/keuangan/tagihan/${t.id}`);
      if (res.data?.success) {
        Swal.fire('Berhasil', 'Tagihan berhasil dihapus dari database.', 'success');
        fetchAllTagihanList();
      }
    } catch (err) {
      Swal.fire('Gagal', err.response?.data?.message || 'Gagal menghapus tagihan.', 'error');
    }
  };

  const handleOpenEditTagihan = (t) => {
    setEditTagihanData({
      id: t.id,
      kode_tagihan: t.kode_tagihan,
      nama_siswa: t.nama_siswa,
      nama_pos: t.nama_pos,
      nominal_tagihan: t.nominal_tagihan,
      tanggal_jatuh_tempo: t.tanggal_jatuh_tempo ? t.tanggal_jatuh_tempo.substring(0, 10) : ''
    });
    setShowEditTagihanModal(true);
  };

  const handleSaveEditTagihan = async (e) => {
    e.preventDefault();
    if (!editTagihanData) return;

    try {
      const res = await api.put(`/keuangan/tagihan/${editTagihanData.id}`, {
        nominal_tagihan: editTagihanData.nominal_tagihan,
        tanggal_jatuh_tempo: editTagihanData.tanggal_jatuh_tempo
      });

      if (res.data?.success) {
        Swal.fire('Berhasil', 'Data tagihan berhasil diperbarui.', 'success');
        setShowEditTagihanModal(false);
        setEditTagihanData(null);
        fetchAllTagihanList();
      }
    } catch (err) {
      Swal.fire('Gagal', err.response?.data?.message || 'Gagal memperbarui tagihan.', 'error');
    }
  };

  const handleDeleteBatchTagihan = async () => {
    if (!tagihanFilterPos && !tagihanFilterBulan && !tagihanFilterTahun && !tagihanFilterKelas) {
      Swal.fire('Peringatan', 'Silakan pilih filter Pos, Bulan, Tahun, atau Kelas terlebih dahulu untuk menghapus tagihan secara masal.', 'warning');
      return;
    }

    const confirm = await Swal.fire({
      title: 'Hapus Tagihan Masal (UNPAID)?',
      html: `
        <div style="text-align:left; font-size:13px;">
          <p>Sistem akan menghapus seluruh tagihan berkriteria berikut yang <strong>BELUM DIBAYAR (UNPAID)</strong>:</p>
          <ul>
            ${tagihanFilterPos ? `<li>Pos: <strong>${(posList.find(p => p.id == tagihanFilterPos) || {}).nama_pos || tagihanFilterPos}</strong></li>` : ''}
            ${tagihanFilterBulan ? `<li>Bulan: <strong>${getBulanLabel(tagihanFilterBulan)}</strong></li>` : ''}
            ${tagihanFilterTahun ? `<li>Tahun: <strong>${tagihanFilterTahun}</strong></li>` : ''}
            ${tagihanFilterKelas ? `<li>Kelas: <strong>Kelas ${(kelasList.find(k => (k.kode_kelas||k.id) == tagihanFilterKelas) || {}).nama_kelas || tagihanFilterKelas}</strong></li>` : ''}
          </ul>
          <p style="color:#dc2626; font-weight:700;">Tindakan ini tidak dapat dibatalkan!</p>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Ya, Hapus Tagihan Masal'
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await api.post('/keuangan/tagihan/delete-batch', {
        pos_id: tagihanFilterPos,
        bulan: tagihanFilterBulan,
        tahun: tagihanFilterTahun,
        kode_kelas: tagihanFilterKelas
      });

      if (res.data?.success) {
        Swal.fire('Berhasil', res.data.message || 'Tagihan masal berhasil dihapus.', 'success');
        fetchAllTagihanList();
      }
    } catch (err) {
      Swal.fire('Gagal', err.response?.data?.message || 'Gagal menghapus tagihan masal.', 'error');
    }
  };

  // --- REKAP HANDLERS ---
  const fetchRekapTunggakan = async () => {
    setIsLoadingRekap(true);
    try {
      const res = await api.get('/keuangan/rekap/tunggakan', { params: { kode_kelas: rekapFilterKelas } });
      if (res.data?.success) setRekapTunggakan(res.data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingRekap(false);
    }
  };

  const handleShowRekapDetail = async (siswaItem) => {
    setSelectedRekapSiswa(siswaItem);
    setShowRekapDetailModal(true);
    setIsLoadingRekapDetail(true);
    try {
      const res = await api.get(`/keuangan/tagihan/siswa/${siswaItem.kode_siswa}`, { params: { status: 'ALL' } });
      const tagihans = res.data?.data || [];
      const tunggakanList = tagihans.filter(t => t.status !== 'LUNAS' && (Number(t.nominal_tagihan) - Number(t.nominal_terbayar)) > 0);
      setRekapDetailTagihan(tunggakanList);
    } catch (err) {
      console.error('Error fetching rekap detail tagihan:', err);
    } finally {
      setIsLoadingRekapDetail(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'rekap') fetchRekapTunggakan();
  }, [activeSubTab, rekapFilterKelas]);

  const paginatedRekap = rekapTunggakan.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div>
      <div className="admin-panel">
        {/* PANEL HEADER MATCHING ADMIN PENGUMUMAN TAB */}
        <div className="admin-panel-header">
          <div>
            <div className="admin-panel-title">
              <Wallet size={18} color="#0284c7" /> Manajemen Keuangan & SPP (E-BMS)
            </div>
            <div className="admin-panel-subtitle">
              Pengelolaan Pos Biaya Sekolah, Matrix Tarif, Generasi Tagihan SPP, & Kasir TU
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className={activeSubTab === 'kasir' ? 'btn-primary-admin' : 'btn-outline-admin'}
              onClick={() => setActiveSubTab('kasir')}
            >
              <CreditCard size={15} /> Kasir TU
            </button>

            <button
              className={activeSubTab === 'tagihan_list' ? 'btn-primary-admin' : 'btn-outline-admin'}
              onClick={() => { setActiveSubTab('tagihan_list'); fetchAllTagihanList(); }}
            >
              <FileSpreadsheet size={15} /> Kelola Tagihan
            </button>

            <button
              className={activeSubTab === 'histori' ? 'btn-primary-admin' : 'btn-outline-admin'}
              onClick={() => { setActiveSubTab('histori'); fetchTransaksiList(); }}
            >
              <History size={15} /> Riwayat Transaksi
            </button>

            <button
              className={activeSubTab === 'master' ? 'btn-primary-admin' : 'btn-outline-admin'}
              onClick={() => setActiveSubTab('master')}
            >
              <Layers size={15} /> Pos & Tarif
            </button>

            <button
              className={activeSubTab === 'generate' ? 'btn-primary-admin' : 'btn-outline-admin'}
              onClick={() => setActiveSubTab('generate')}
            >
              <RefreshCw size={15} /> Auto Tagihan
            </button>

            <button
              className={activeSubTab === 'rekap' ? 'btn-primary-admin' : 'btn-outline-admin'}
              onClick={() => setActiveSubTab('rekap')}
            >
              <FileSpreadsheet size={15} /> Rekap Tunggakan
            </button>
          </div>
        </div>

        {/* ========================================================
            SUB TAB 1: KASIR TU (PEMBAYARAN SISWA)
            ======================================================== */}
        {activeSubTab === 'kasir' && (
          <div style={{ width: '100%' }}>
            {/* SEARCH FORM & FULL-WIDTH TABLE */}
            <div>
              <form onSubmit={handleSearchSiswaSubmit} style={{ display: 'flex', gap: 10, marginBottom: 16, maxWidth: 650 }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', zIndex: 2 }} />
                  <input
                    type="text"
                    placeholder="Ketik NIS, NISN, atau Nama Siswa... (Hasil langsung muncul)"
                    value={siswaSearch}
                    onChange={(e) => {
                      setSiswaSearch(e.target.value);
                      handleLiveSearch(e.target.value);
                    }}
                    onFocus={() => {
                      if (searchResults.length > 0) setShowDropdown(true);
                    }}
                    className="form-control-admin"
                    style={{ paddingLeft: 40, paddingRight: siswaSearch ? 36 : 12 }}
                  />
                  {siswaSearch && (
                    <button
                      type="button"
                      onClick={() => {
                        setSiswaSearch('');
                        setSelectedSiswa(null);
                        setSiswaTagihan([]);
                        setSearchResults([]);
                        setShowDropdown(false);
                      }}
                      style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', zIndex: 2 }}
                      title="Reset Pencarian"
                    >
                      <X size={16} />
                    </button>
                  )}

                  {/* FLOATING LIVE DROPDOWN SISTER SUGGESTIONS */}
                  {showDropdown && searchResults.length > 0 && (
                    <div
                      style={{
                        position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
                        background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: 8,
                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', zIndex: 99999,
                        maxHeight: 280, overflowY: 'auto'
                      }}
                    >
                      {searchResults.map((s) => (
                        <div
                          key={s.kode_siswa}
                          onClick={() => handleSelectStudent(s)}
                          style={{
                            padding: '10px 14px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer',
                            transition: 'background 0.15s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#f0f9ff'}
                          onMouseLeave={(e) => e.currentTarget.style.background = '#ffffff'}
                        >
                          <div style={{ fontWeight: 800, fontSize: 13.5, color: '#0f172a' }}>{s.nama_siswa}</div>
                          <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>
                            NIS: <strong style={{ color: '#0284c7' }}>{s.nis || '-'}</strong> • Kelas: <strong>{s.nama_kelas || '-'}</strong>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </form>

              {selectedSiswa ? (
                <>
                  <div style={{ background: '#f8fafc', padding: 14, borderRadius: 10, border: '1px solid #e2e8f0', marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 16, color: '#0f172a' }}>{selectedSiswa.nama_siswa}</div>
                      <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                        NIS: <strong>{selectedSiswa.nis || '-'}</strong> • Kelas: <strong>{selectedSiswa.nama_kelas || '-'}</strong>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <button
                        type="button"
                        className={kasirViewMode === 'tagihan' ? 'btn-primary-admin' : 'btn-outline-admin'}
                        style={{ padding: '6px 12px', fontSize: 12 }}
                        onClick={() => setKasirViewMode('tagihan')}
                      >
                        Tagihan Belum Lunas ({siswaTagihan.filter(t => t.status !== 'PAID').length})
                      </button>
                      <button
                        type="button"
                        className={kasirViewMode === 'riwayat_siswa' ? 'btn-primary-admin' : 'btn-outline-admin'}
                        style={{ padding: '6px 12px', fontSize: 12 }}
                        onClick={() => {
                          setKasirViewMode('riwayat_siswa');
                          fetchSiswaRiwayatTransaksi(selectedSiswa.kode_siswa);
                        }}
                      >
                        <History size={13} style={{ marginRight: 4 }} /> Riwayat Bayar Siswa ({siswaRiwayatTransaksi.length})
                      </button>
                    </div>
                  </div>

                  {kasirViewMode === 'riwayat_siswa' ? (
                    <div className="admin-table-wrapper" style={{ width: '100%' }}>
                      <table className="admin-table" style={{ width: '100%' }}>
                        <thead>
                          <tr>
                            <th style={{ width: 50 }}>No</th>
                            <th>No Transaksi</th>
                            <th>Tanggal Bayar</th>
                            <th>Total Pembayaran</th>
                            <th>Metode & Kasir</th>
                            <th style={{ textAlign: 'center' }}>Status</th>
                            <th style={{ textAlign: 'center', width: 140 }}>Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {siswaRiwayatTransaksi.length === 0 ? (
                            <tr>
                              <td colSpan={7} style={{ textAlign: 'center', padding: '30px 0', color: '#64748b' }}>
                                Belum ada riwayat pembayaran untuk siswa ini.
                              </td>
                            </tr>
                          ) : (
                            siswaRiwayatTransaksi.map((tr, idx) => (
                              <tr key={tr.id}>
                                <td style={{ textAlign: 'center', color: '#64748b', fontWeight: 700 }}>{idx + 1}</td>
                                <td style={{ fontWeight: 800, color: '#0284c7' }}>{tr.no_transaksi}</td>
                                <td style={{ fontSize: 12, color: '#475569' }}>
                                  {new Date(tr.tanggal_bayar).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </td>
                                <td style={{ fontWeight: 800, color: '#16a34a' }}>
                                  Rp {Number(tr.total_bayar || 0).toLocaleString('id-ID')}
                                </td>
                                <td>
                                  <div style={{ fontSize: 12, fontWeight: 700 }}>{tr.metode_pembayaran}</div>
                                  <div style={{ fontSize: 11, color: '#64748b' }}>Kasir: {tr.nama_kasir || 'Kasir TU'}</div>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                  <span
                                    className="status-badge-active"
                                    style={{
                                      background: tr.status_transaksi === 'CANCELLED' || tr.status_transaksi === 'EXPIRED' || tr.status_transaksi === 'FAILED' ? '#fee2e2' : (tr.status_transaksi === 'PENDING' ? '#fef3c7' : '#dcfce7'),
                                      color: tr.status_transaksi === 'CANCELLED' || tr.status_transaksi === 'EXPIRED' || tr.status_transaksi === 'FAILED' ? '#dc2626' : (tr.status_transaksi === 'PENDING' ? '#d97706' : '#15803d'),
                                      border: tr.status_transaksi === 'CANCELLED' || tr.status_transaksi === 'EXPIRED' || tr.status_transaksi === 'FAILED' ? '1px solid #fca5a5' : (tr.status_transaksi === 'PENDING' ? '1px solid #fcd34d' : '1px solid #86efac')
                                    }}
                                  >
                                    {tr.status_transaksi || 'SUCCESS'}
                                  </span>
                                   {(tr.status_transaksi === 'CANCELLED' || tr.status_transaksi === 'EXPIRED' || tr.alasan_batal) && tr.alasan_batal && (
                                     <div style={{ fontSize: 11, color: '#dc2626', marginTop: 4, fontWeight: 600 }}>
                                       Alasan: {tr.alasan_batal}
                                     </div>
                                   )}
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                  <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                                    <button
                                      type="button"
                                      onClick={() => handleOpenKwitansi(tr.id)}
                                      style={{ padding: '6px 8px', borderRadius: 6, background: '#e0f2fe', color: '#0284c7', border: '1px solid #7dd3fc', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
                                      title="Cetak Kuitansi Pembayaran"
                                    >
                                      <Printer size={15} />
                                    </button>
                                    {tr.status_transaksi !== 'CANCELLED' && (
                                                                              <button
                                          type="button"
                                          onClick={() => handleCancelTransaksi(tr.id)}
                                          style={{ padding: '6px 8px', borderRadius: 6, background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
                                          title="Batalkan Pembayaran Ini"
                                        >
                                          <Trash2 size={15} />
                                        </button>
                                                                          )}
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                      <>
                        {(() => {
                        const unpaidList = siswaTagihan.filter(t => t.status !== 'PAID');
                        const unpaidBulanan = unpaidList.filter(t => t.tipe_pos === 'BULANAN');
                        const unpaidBebas = unpaidList.filter(t => t.tipe_pos !== 'BULANAN');

                        if (unpaidList.length === 0) {
                          return (
                            <div style={{ background: '#ecfdf5', padding: '30px 20px', borderRadius: 10, border: '1px solid #a7f3d0', textAlign: 'center', color: '#047857' }}>
                              <CheckCircle size={36} style={{ marginBottom: 6 }} /><br />
                              <strong style={{ fontSize: 16 }}>Semua tagihan siswa ini telah LUNAS!</strong>
                            </div>
                          );
                        }

                        const renderTagihanTable = (items, title, badgeColor, iconEmoji) => {
                          const isAllGroupSelected = items.length > 0 && items.every(t => selectedTagihanIds.includes(t.id));

                          return (
                            <div style={{ marginBottom: 20 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, background: '#f8fafc', padding: '8px 14px', borderRadius: 8, borderLeft: `4px solid ${badgeColor}`, border: '1px solid #e2e8f0', borderLeftWidth: 4, borderLeftColor: badgeColor }}>
                                <span style={{ fontSize: 16 }}>{iconEmoji}</span>
                                <span style={{ fontWeight: 800, fontSize: 14, color: '#0f172a' }}>{title}</span>
                                {items.length > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => toggleSelectAllGroup(items)}
                                    style={{
                                      fontSize: 11,
                                      background: isAllGroupSelected ? '#e0f2fe' : '#ffffff',
                                      color: isAllGroupSelected ? '#0369a1' : '#475569',
                                      border: isAllGroupSelected ? '1px solid #7dd3fc' : '1px solid #cbd5e1',
                                      padding: '3px 10px',
                                      borderRadius: 6,
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      marginLeft: 10,
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 4
                                    }}
                                  >
                                    {isAllGroupSelected ? '✓ Batalkan Pilih Semua' : '☑️ Pilih Semua (Pelunasan Sekaligus)'}
                                  </button>
                                )}
                                <span style={{ fontSize: 11, background: badgeColor, color: '#fff', padding: '2px 10px', borderRadius: 12, fontWeight: 700, marginLeft: 'auto' }}>
                                  {items.length} Tagihan
                                </span>
                              </div>
                              {items.length === 0 ? (
                                <div style={{ padding: '14px 18px', background: '#ffffff', borderRadius: 8, border: '1px solid #e2e8f0', color: '#64748b', fontSize: 12.5, fontStyle: 'italic' }}>
                                  Tidak ada {title.toLowerCase()} yang belum lunas.
                                </div>
                              ) : (
                                <div className="admin-table-wrapper" style={{ width: '100%' }}>
                                  <table className="admin-table" style={{ width: '100%' }}>
                                    <thead>
                                      <tr>
                                        <th style={{ width: 50, textAlign: 'center' }}>
                                          <input
                                            type="checkbox"
                                            checked={isAllGroupSelected}
                                            onChange={() => toggleSelectAllGroup(items)}
                                            style={{ width: 18, height: 18, cursor: 'pointer' }}
                                            title="Centang / Hapus Centang Semua Tagihan"
                                          />
                                        </th>
                                        <th style={{ width: 200 }}>Pos Pembayaran</th>
                                        <th>Tipe & Periode Tagihan</th>
                                        <th style={{ width: 140 }}>Nominal Tagihan</th>
                                        <th style={{ width: 140 }}>Sisa Tagihan</th>
                                        <th style={{ width: 180 }}>Nominal Bayar (Rp)</th>
                                      </tr>
                                    </thead>
                                  <tbody>
                                    {items.map((t) => {
                                      const isChecked = selectedTagihanIds.includes(t.id);
                                      const sisa = Number(t.nominal_tagihan) - Number(t.nominal_terbayar || 0);
                                      const isBulanan = t.tipe_pos === 'BULANAN';
                                      const terbayar = Number(t.nominal_terbayar || 0);
                                      const percent = Math.min(100, Math.round((terbayar / Number(t.nominal_tagihan)) * 100));

                                      const now = new Date();
                                      const curY = now.getFullYear();
                                      const curM = now.getMonth() + 1;
                                      const isPastMonth = isBulanan && t.bulan && t.tahun && (Number(t.tahun) < curY || (Number(t.tahun) === curY && Number(t.bulan) < curM));

                                      return (
                                        <tr key={t.id} style={{ background: isChecked ? '#f0f9ff' : isPastMonth ? '#fff5f5' : 'transparent' }}>
                                          <td style={{ textAlign: 'center' }}>
                                            <input
                                              type="checkbox"
                                              checked={isChecked}
                                              onChange={() => toggleSelectTagihan(t)}
                                              style={{ width: 18, height: 18, cursor: 'pointer' }}
                                            />
                                          </td>
                                          <td>
                                            <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 13.5 }}>{t.nama_pos}</div>
                                            <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                                              Kode: {t.kode_tagihan || `INV-${t.id}`}
                                            </div>
                                          </td>
                                          <td>
                                            {isBulanan ? (
                                               <div>
                                                 {isPastMonth ? (
                                                   <>
                                                     <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                       ⚠️ Tunggakan {getBulanLabel(t.bulan)} {t.tahun}
                                                     </span>
                                                     <div style={{ fontSize: 11, color: '#dc2626', fontWeight: 700, marginTop: 4 }}>
                                                       Tagihan SPP Bulan Lalu (Menunggak)
                                                     </div>
                                                   </>
                                                 ) : (
                                                   <>
                                                     <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                       🗓️ {getBulanLabel(t.bulan)} {t.tahun}
                                                     </span>
                                                     <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                                                       Tagihan SPP Rutin (Berjalan)
                                                     </div>
                                                   </>
                                                 )}
                                               </div>
                                            ) : (
                                              <div>
                                                <span style={{ background: '#fef3c7', color: '#b45309', padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                  💰 Tipe Bebas (Non-Bulanan)
                                                </span>
                                                {terbayar > 0 && (
                                                  <div style={{ marginTop: 4 }}>
                                                    <div style={{ fontSize: 10.5, color: '#475569', fontWeight: 600 }}>
                                                      Sudah dicicil: <strong>Rp {terbayar.toLocaleString('id-ID')}</strong> ({percent}%)
                                                    </div>
                                                    <div style={{ width: '100%', height: 4, background: '#e2e8f0', borderRadius: 2, marginTop: 2, overflow: 'hidden' }}>
                                                      <div style={{ width: `${percent}%`, height: '100%', background: '#0284c7' }} />
                                                    </div>
                                                  </div>
                                                )}
                                              </div>
                                            )}
                                          </td>
                                          <td style={{ fontWeight: 600 }}>Rp {Number(t.nominal_tagihan).toLocaleString('id-ID')}</td>
                                          <td style={{ fontWeight: 800, color: '#dc2626', fontSize: 14 }}>
                                            Rp {sisa.toLocaleString('id-ID')}
                                          </td>
                                          <td>
                                            {isChecked ? (
                                              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                                <span style={{ position: 'absolute', left: 8, fontSize: 12, fontWeight: 700, color: '#64748b' }}>Rp</span>
                                                <input
                                                  type="text"
                                                  value={formatRupiahInput(bayarNominal[t.id] !== undefined ? bayarNominal[t.id] : sisa)}
                                                  onChange={(e) => handleNominalChange(t.id, parseRupiahInput(e.target.value))}
                                                  className="form-control-admin"
                                                  placeholder="0"
                                                  style={{ paddingLeft: 28, fontWeight: 800, fontSize: 13, color: '#0284c7', background: '#ffffff', borderColor: '#7dd3fc' }}
                                                />
                                              </div>
                                            ) : (
                                              <span style={{ color: '#94a3b8', fontSize: 12 }}>-</span>
                                            )}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        );
                      };

                      return (
                        <>
                          {renderTagihanTable(unpaidBulanan, 'Tagihan SPP Rutin (Bulanan)', '#0284c7', '🗓️')}
                          {renderTagihanTable(unpaidBebas, 'Tagihan Tipe Bebas (Non-Bulanan)', '#d97706', '💰')}
                        </>
                      );
                    })()}

                  {/* BOTTOM FULL-WIDTH SUMMARY PANEL BELOW TABLE */}
                  <div style={{ background: '#ffffff', padding: 20, borderRadius: 10, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', marginTop: 20, display: 'grid', gridTemplateColumns: '1fr 1.2fr 1.5fr 220px', gap: 20, alignItems: 'center' }}>
                    {/* COL 1: ITEM SELECTED */}
                    <div>
                      <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Item Tagihan Dipilih:</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '2px 0' }}>{selectedTagihanIds.length} Tagihan</div>
                      <div style={{ fontSize: 11, color: '#64748b' }}>Metode: <strong>Tunai (Kasir TU)</strong></div>
                    </div>

                    {/* COL 2: TOTAL HARUS DIBAYAR */}
                    <div style={{ borderLeft: '1px dashed #cbd5e1', paddingLeft: 20 }}>
                      <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>Total Harus Dibayar:</div>
                      <div style={{ fontSize: 24, fontWeight: 800, color: '#16a34a' }}>
                        Rp {totalBayar.toLocaleString('id-ID')}
                      </div>
                    </div>

                    {/* COL 3: CASH IN & KEMBALIAN */}
                    <div style={{ borderLeft: '1px dashed #cbd5e1', paddingLeft: 20 }}>
                      <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                        Uang Diterima (Cash In):
                      </label>
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ position: 'absolute', left: 8, fontSize: 12, fontWeight: 700, color: '#64748b' }}>Rp</span>
                        <input
                          type="text"
                          value={formatRupiahInput(cashReceived)}
                          onChange={(e) => setCashReceived(parseRupiahInput(e.target.value))}
                          className="form-control-admin"
                          placeholder="0"
                          style={{ paddingLeft: 30, fontWeight: 800, fontSize: 13, color: '#0f172a' }}
                        />
                      </div>

                      {/* QUICK CASH PRESETS */}
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 4 }}>
                        <button
                          type="button"
                          onClick={() => setCashReceived(totalBayar)}
                          style={{ background: '#e2e8f0', border: 'none', padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700, cursor: 'pointer' }}
                        >
                          Uang Pas
                        </button>
                        <button
                          type="button"
                          onClick={() => setCashReceived(50000)}
                          style={{ background: '#e2e8f0', border: 'none', padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700, cursor: 'pointer' }}
                        >
                          50rb
                        </button>
                        <button
                          type="button"
                          onClick={() => setCashReceived(100000)}
                          style={{ background: '#e2e8f0', border: 'none', padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700, cursor: 'pointer' }}
                        >
                          100rb
                        </button>
                        <button
                          type="button"
                          onClick={() => setCashReceived(500000)}
                          style={{ background: '#e2e8f0', border: 'none', padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 700, cursor: 'pointer' }}
                        >
                          500rb
                        </button>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 4 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#475569' }}>Kembalian:</span>
                        <span style={{ fontSize: 14, fontWeight: 800, color: (parseRupiahInput(cashReceived) - totalBayar) < 0 ? '#dc2626' : '#0284c7' }}>
                          Rp {Math.max(0, parseRupiahInput(cashReceived) - totalBayar).toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>

                    {/* COL 4: ACTION BUTTON */}
                    <div>
                      <button
                        type="button"
                        disabled={isProcessingPayment || selectedTagihanIds.length === 0 || !cashReceived || parseRupiahInput(cashReceived) < totalBayar}
                        onClick={handleProcessPayment}
                        className="btn-primary-admin"
                        style={{
                          width: '100%', padding: '12px',
                          opacity: (selectedTagihanIds.length === 0 || !cashReceived || parseRupiahInput(cashReceived) < totalBayar) ? 0.6 : 1,
                          cursor: (selectedTagihanIds.length === 0 || !cashReceived || parseRupiahInput(cashReceived) < totalBayar) ? 'not-allowed' : 'pointer',
                          background: '#16a34a', borderColor: '#16a34a', fontSize: 13, fontWeight: 800
                        }}
                      >
                        {isProcessingPayment ? 'Memproses...' : '💵 Bayar Tunai (Kasir TU)'}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
                <div style={{ textAlign: 'center', padding: '50px 20px', color: '#94a3b8', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <Search size={40} style={{ marginBottom: 10, opacity: 0.5 }} />
                  <div style={{ fontWeight: 700, color: '#64748b' }}>Ketik NIS atau nama siswa pada pencarian di atas.</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            SUB TAB 1.5: KELOLA TAGIHAN SISWA (SEARCH, EDIT & DELETE)
            ======================================================== */}
        {activeSubTab === 'tagihan_list' && (
          <div style={{ width: '100%' }}>
            {/* FILTER BAR */}
            <div style={{ background: '#f8fafc', padding: 16, borderRadius: 10, border: '1px solid #e2e8f0', marginBottom: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1fr 100px 100px 120px auto', gap: 10, alignItems: 'center' }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 2, display: 'block' }}>Cari Tagihan</label>
                  <div style={{ position: 'relative' }}>
                    <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      placeholder="Cari NIS / Nama / Kode Inv..."
                      value={tagihanSearch}
                      onChange={(e) => setTagihanSearch(e.target.value)}
                      className="form-control-admin"
                      style={{ paddingLeft: 30, fontSize: 12.5 }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 2, display: 'block' }}>Pos Pembayaran</label>
                  <SearchableSelect
                    value={tagihanFilterPos}
                    onChange={(e) => setTagihanFilterPos(e.target.value)}
                    placeholder="Semua Pos"
                    options={posList.map(p => ({ value: p.id, label: p.nama_pos }))}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 2, display: 'block' }}>Kelas</label>
                  <SearchableSelect
                    value={tagihanFilterKelas}
                    onChange={(e) => setTagihanFilterKelas(e.target.value)}
                    placeholder="Semua Kelas"
                    options={kelasList.map(k => ({ value: k.kode_kelas || k.id, label: `Kelas ${k.nama_kelas}` }))}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 2, display: 'block' }}>Bulan</label>
                  <SearchableSelect
                    value={tagihanFilterBulan}
                    onChange={(e) => setTagihanFilterBulan(e.target.value)}
                    placeholder="Semua"
                    options={[1,2,3,4,5,6,7,8,9,10,11,12].map(m => ({ value: m, label: getBulanLabel(m) }))}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 2, display: 'block' }}>Tahun</label>
                  <input
                    type="number"
                    placeholder="Tahun"
                    value={tagihanFilterTahun}
                    onChange={(e) => setTagihanFilterTahun(e.target.value)}
                    className="form-control-admin"
                    style={{ fontSize: 12.5 }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 2, display: 'block' }}>Status</label>
                  <SearchableSelect
                    value={tagihanFilterStatus}
                    onChange={(e) => setTagihanFilterStatus(e.target.value)}
                    options={[
                      { value: 'ALL', label: 'Semua Status' },
                      { value: 'UNPAID', label: 'Belum Lunas' },
                      { value: 'PARTIAL', label: 'Dicicil' },
                      { value: 'PAID', label: 'Lunas' }
                    ]}
                  />
                </div>

                <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', paddingTop: 18 }}>
                  <button type="button" className="btn-outline-admin" onClick={fetchAllTagihanList} title="Refresh">
                    <RefreshCw size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* TABLE OF TAGIHAN */}
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>No</th>
                    <th>Kode Invoice</th>
                    <th>Siswa & Kelas</th>
                    <th>Pos & Periode Tagihan</th>
                    <th style={{ textAlign: 'right' }}>Nominal Tagihan</th>
                    <th style={{ textAlign: 'right' }}>Terbayar / Sisa</th>
                    <th style={{ textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingAllTagihan ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '30px 0', color: '#64748b' }}>
                        Memuat data tagihan...
                      </td>
                    </tr>
                  ) : allTagihanList.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '30px 0', color: '#64748b' }}>
                        Tidak ada data tagihan ditemukan.
                      </td>
                    </tr>
                  ) : (
                    allTagihanList.map((t, idx) => {
                      const sisa = Number(t.nominal_tagihan) - Number(t.nominal_terbayar || 0);
                      return (
                        <tr key={t.id}>
                          <td style={{ textAlign: 'center', color: '#64748b', fontWeight: 700 }}>{idx + 1}</td>
                          <td style={{ fontWeight: 800, color: '#0284c7', fontSize: 12.5 }}>{t.kode_tagihan}</td>
                          <td>
                            <div style={{ fontWeight: 800, color: '#0f172a' }}>{t.nama_siswa}</div>
                            <div style={{ fontSize: 11, color: '#64748b' }}>
                              NIS: {t.nis || '-'} • Kelas: <strong>{t.nama_kelas || '-'}</strong>
                            </div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 700, color: '#334155' }}>{t.nama_pos}</div>
                            <div style={{ fontSize: 11, color: '#64748b' }}>
                              {t.tipe_pos === 'BULANAN' ? `${getBulanLabel(t.bulan)} ${t.tahun}` : 'Tipe Bebas (Non-Bulanan)'}
                            </div>
                          </td>
                          <td style={{ textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>
                            Rp {Number(t.nominal_tagihan).toLocaleString('id-ID')}
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 700 }}>
                              Bayar: Rp {Number(t.nominal_terbayar || 0).toLocaleString('id-ID')}
                            </div>
                            <div style={{ fontSize: 11, color: sisa > 0 ? '#dc2626' : '#64748b', fontWeight: 700 }}>
                              Sisa: Rp {sisa.toLocaleString('id-ID')}
                            </div>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span
                              className="status-badge-active"
                              style={{
                                background: t.status === 'PAID' ? '#dcfce7' : t.status === 'PARTIAL' ? '#fef3c7' : '#fee2e2',
                                color: t.status === 'PAID' ? '#15803d' : t.status === 'PARTIAL' ? '#b45309' : '#dc2626'
                              }}
                            >
                              {t.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================
            SUB TAB 2: MASTER POS & TARIF
            ======================================================== */}
        {activeSubTab === 'master' && (
          <div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <button
                className={masterSubTab === 'pos' ? 'btn-primary-admin' : 'btn-outline-admin'}
                onClick={() => setMasterSubTab('pos')}
              >
                Master Pos Pembayaran
              </button>
              <button
                className={masterSubTab === 'tarif' ? 'btn-primary-admin' : 'btn-outline-admin'}
                onClick={() => setMasterSubTab('tarif')}
              >
                Matrix Tarif Pembayaran
              </button>
            </div>

            {masterSubTab === 'pos' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Daftar Pos Pembayaran</div>
                  <button
                    className="btn-primary-admin"
                    onClick={() => {
                      setEditingPosId(null);
                      setPosFormData({ kode_pos: '', nama_pos: '', tipe: 'BULANAN', deskripsi: '' });
                      setShowPosModal(true);
                    }}
                  >
                    <Plus size={15} /> Tambah Pos Baru
                  </button>
                </div>

                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th style={{ width: 120 }}>Kode Pos</th>
                        <th>Nama Pos Pembayaran</th>
                        <th style={{ width: 120, textAlign: 'center' }}>Tipe</th>
                        <th>Deskripsi</th>
                        <th style={{ width: 100, textAlign: 'center' }}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {posList.map((p) => (
                        <tr key={p.id}>
                          <td style={{ fontWeight: 800, color: '#0284c7' }}>{p.kode_pos}</td>
                          <td style={{ fontWeight: 700 }}>{p.nama_pos}</td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{
                              background: p.tipe === 'BULANAN' ? '#e0f2fe' : '#fef3c7',
                              color: p.tipe === 'BULANAN' ? '#0369a1' : '#b45309',
                              padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 800
                            }}>
                              {p.tipe}
                            </span>
                          </td>
                          <td style={{ color: '#64748b', fontSize: 12 }}>{p.deskripsi || '-'}</td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'inline-flex', gap: 4 }}>
                              <button
                                className="btn-action-icon btn-edit"
                                onClick={() => {
                                  setEditingPosId(p.id);
                                  setPosFormData({ kode_pos: p.kode_pos, nama_pos: p.nama_pos, tipe: p.tipe, deskripsi: p.deskripsi || '' });
                                  setShowPosModal(true);
                                }}
                              >
                                <Edit2 size={13} />
                              </button>
                              <button className="btn-action-icon btn-delete" onClick={() => handleDeletePos(p.id)}>
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {masterSubTab === 'tarif' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Matrix Tarif Pembayaran</div>
                  <button className="btn-primary-admin" onClick={handleOpenAddTarif}>
                    <Plus size={15} /> Tambah Tarif Baru
                  </button>
                </div>

                {/* FILTER BAR MATRIX TARIF */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 14, flexWrap: 'wrap', background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <div style={{ flex: '1 1 200px' }}>
                    <SearchableSelect
                      value={tarifFilterPos}
                      onChange={(e) => setTarifFilterPos(e.target.value)}
                      placeholder="-- Filter Pos Pembayaran --"
                      options={[
                        { value: '', label: 'Semua Pos Pembayaran' },
                        ...posList.map(p => ({ value: p.id, label: p.nama_pos }))
                      ]}
                    />
                  </div>
                  <div style={{ flex: '1 1 200px', position: 'relative' }}>
                    <Search size={15} style={{ position: 'absolute', left: 10, top: 10, color: '#64748b' }} />
                    <input
                      type="text"
                      className="form-control-admin"
                      style={{ paddingLeft: 32 }}
                      placeholder="Cari kelas, tingkat, pos..."
                      value={tarifSearch}
                      onChange={(e) => setTarifSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Pos Pembayaran</th>
                        <th>Tahun Ajaran</th>
                        <th>Sasaran Kelas / Tingkat</th>
                        <th style={{ textAlign: 'right' }}>Nominal Tarif (Rp)</th>
                        <th style={{ width: 100, textAlign: 'center' }}>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tarifList
                        .filter(t => {
                          if (tarifFilterPos && String(t.pos_id) !== String(tarifFilterPos)) return false;
                          if (tarifSearch) {
                            const q = tarifSearch.toLowerCase();
                            const matchPos = String(t.nama_pos || '').toLowerCase().includes(q);
                            const matchKelas = String(t.nama_kelas || t.kode_kelas || '').toLowerCase().includes(q);
                            const matchTingkat = String(t.tingkat || '').toLowerCase().includes(q);
                            const matchTA = String(t.tahun_ajaran || '').toLowerCase().includes(q);
                            return matchPos || matchKelas || matchTingkat || matchTA;
                          }
                          return true;
                        })
                        .map((t) => (
                          <tr key={t.id}>
                            <td style={{ fontWeight: 700, color: '#0f172a' }}>{t.nama_pos}</td>
                            <td style={{ color: '#64748b', fontWeight: 600 }}>{t.tahun_ajaran}</td>
                            <td>
                              {t.nama_kelas || t.kode_kelas ? (
                                <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: 6, fontSize: 11.5, fontWeight: 800, border: '1px solid #bae6fd', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                  🏫 Kelas {t.nama_kelas || t.kode_kelas}
                                </span>
                              ) : t.tingkat ? (
                                <span style={{ background: '#fef3c7', color: '#b45309', padding: '3px 8px', borderRadius: 6, fontSize: 11.5, fontWeight: 800, border: '1px solid #fde68a', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                  📊 Tingkat / Angkatan {t.tingkat}
                                </span>
                              ) : (
                                <span style={{ background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: 6, fontSize: 11.5, fontWeight: 700, border: '1px solid #e2e8f0', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                  🌐 Semua Kelas (Umum)
                                </span>
                              )}
                            </td>
                            <td style={{ fontWeight: 800, color: '#16a34a', textAlign: 'right', fontSize: 13.5 }}>
                              Rp {Number(t.nominal).toLocaleString('id-ID')}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <div style={{ display: 'inline-flex', gap: 4 }}>
                                <button
                                  className="btn-action-icon btn-edit"
                                  onClick={() => handleOpenEditTarif(t)}
                                  title="Edit Tarif"
                                >
                                  <Edit2 size={13} />
                                </button>
                                <button
                                  className="btn-action-icon btn-delete"
                                  onClick={() => handleDeleteTarif(t.id)}
                                  title="Hapus Tarif"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* ========================================================
            SUB TAB 3: GENERATE TAGIHAN SPP / BEBAS
            ======================================================== */}
        {activeSubTab === 'generate' && (() => {
          const selectedTarif = tarifList.find(t => String(t.id) === String(genFormData.tarif_id));
          const isBebas = selectedTarif?.tipe === 'BEBAS';

          return (
            <div style={{ maxWidth: 640, margin: 0, background: '#f8fafc', padding: 24, borderRadius: 12, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                <RefreshCw color="#0284c7" size={18} /> {isBebas ? 'Auto-Generate Tagihan Tipe Bebas (Non-Bulanan)' : 'Auto-Generate Tagihan SPP Bulanan'}
              </div>
              <div style={{ fontSize: 12.5, color: '#64748b', marginBottom: 20 }}>
                {isBebas
                  ? 'Sistem akan membuat tagihan 1x (Non-Bulanan) untuk seluruh siswa aktif sesuai tarif yang ditentukan.'
                  : 'Sistem akan membuat tagihan SPP bulanan secara otomatis untuk seluruh siswa aktif sesuai tarif dan periode yang ditentukan.'}
              </div>

              <form onSubmit={handleGenerateInvoice}>
                {/* TARIF SELECTOR */}
                <div className="form-group-admin" style={{ marginBottom: 16 }}>
                  <label>Pilih Pos & Tarif Pembayaran *</label>
                  <SearchableSelect
                    value={genFormData.tarif_id}
                    onChange={(e) => {
                      const val = e.target.value;
                      const selected = tarifList.find(t => String(t.id) === String(val));
                      let autoKelas = '';
                      if (selected && selected.kode_kelas) {
                        const matchKelas = kelasList.find(k => 
                          (k.kode_kelas && String(k.kode_kelas) === String(selected.kode_kelas)) || 
                          (k.id && String(k.id) === String(selected.kode_kelas)) || 
                          (k.nama_kelas && selected.nama_kelas && k.nama_kelas === selected.nama_kelas)
                        );
                        if (matchKelas) {
                          autoKelas = matchKelas.kode_kelas || matchKelas.id;
                        } else {
                          autoKelas = selected.kode_kelas;
                        }
                      }
                      setGenFormData(prev => ({
                        ...prev,
                        tarif_id: val,
                        kode_kelas: autoKelas
                      }));
                    }}
                    placeholder="-- Pilih Pos & Tarif --"
                    options={tarifList.map(t => {
                      const sasaran = t.nama_kelas ? `Kelas ${t.nama_kelas}` : t.tingkat ? `Tingkat ${t.tingkat}` : 'Semua Kelas';
                      const tipeBadge = t.tipe === 'BEBAS' ? '[BEBAS]' : '[BULANAN]';
                      return {
                        value: t.id,
                        label: `${tipeBadge} ${t.nama_pos} (${sasaran}) - TA ${t.tahun_ajaran} - Rp ${Number(t.nominal).toLocaleString('id-ID')}`
                      };
                    })}
                  />
                </div>

                {isBebas ? (
                  /* TIPE BEBAS FORM FIELDS */
                  <div style={{ background: '#fffbe6', padding: 16, borderRadius: 10, border: '1px solid #ffe58f', marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#d97706', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      💰 Tagihan Tipe Bebas (Non-Bulanan)
                    </div>
                    <div style={{ fontSize: 12, color: '#78350f', marginBottom: 12, lineHeight: 1.4 }}>
                      Biaya ini bersifat <strong>non-rutin bulanan</strong> (seperti Uang Gedung/DSP, Uang Seragam, Uang Ujian). Tidak memerlukan rentang bulan. Tagihan akan otomatis digenerate 1x per siswa.
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div className="form-group-admin">
                        <label>Tahun Tagihan *</label>
                        <input
                          type="number"
                          className="form-control-admin"
                          value={genFormData.tahun || currentYear}
                          onChange={(e) => setGenFormData({ ...genFormData, tahun: Number(e.target.value) })}
                        />
                      </div>
                      <div className="form-group-admin">
                        <label>Tanggal Jatuh Tempo (Opsional)</label>
                        <input
                          type="date"
                          className="form-control-admin"
                          value={genFormData.tanggal_jatuh_tempo || ''}
                          onChange={(e) => setGenFormData({ ...genFormData, tanggal_jatuh_tempo: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="form-group-admin" style={{ marginBottom: 16 }}>
                      <label>Mode Generasi Tagihan *</label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
                        <button
                          type="button"
                          onClick={() => setGenFormData({ ...genFormData, mode: 'RANGE' })}
                          style={{
                            padding: '10px 14px',
                            borderRadius: 8,
                            border: genFormData.mode === 'RANGE' ? '2px solid #0284c7' : '1px solid #cbd5e1',
                            background: genFormData.mode === 'RANGE' ? '#e0f2fe' : '#ffffff',
                            color: genFormData.mode === 'RANGE' ? '#0369a1' : '#475569',
                            fontWeight: 800,
                            fontSize: 12.5,
                            cursor: 'pointer',
                            textAlign: 'left'
                          }}
                        >
                          🔄 Rentang Bulan Custom (Looping)
                          <div style={{ fontSize: 11, fontWeight: 500, color: '#64748b', marginTop: 2 }}>
                            Misal: Agustus 2025 s/d Juli 2026 (1 Tahun Ajaran)
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setGenFormData({ ...genFormData, mode: 'SINGLE' })}
                          style={{
                            padding: '10px 14px',
                            borderRadius: 8,
                            border: genFormData.mode === 'SINGLE' ? '2px solid #0284c7' : '1px solid #cbd5e1',
                            background: genFormData.mode === 'SINGLE' ? '#e0f2fe' : '#ffffff',
                            color: genFormData.mode === 'SINGLE' ? '#0369a1' : '#475569',
                            fontWeight: 800,
                            fontSize: 12.5,
                            cursor: 'pointer',
                            textAlign: 'left'
                          }}
                        >
                          🗓️ Per 1 Bulan (Single)
                          <div style={{ fontSize: 11, fontWeight: 500, color: '#64748b', marginTop: 2 }}>
                            Generate hanya untuk 1 bulan spesifik
                          </div>
                        </button>
                      </div>
                    </div>

                    {genFormData.mode === 'RANGE' ? (
                      <div style={{ background: '#ffffff', padding: 16, borderRadius: 10, border: '1px solid #bae6fd', marginBottom: 16 }}>
                        <div style={{ fontSize: 13, fontWeight: 800, color: '#0369a1', marginBottom: 12 }}>
                          📅 Rentang Bulan Custom (Looping Auto-Generate)
                        </div>

                        {/* DARI PERIODE */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                          <div className="form-group-admin">
                            <label style={{ fontSize: 11.5 }}>Dari Bulan (Mulai) *</label>
                            <SearchableSelect
                              value={genFormData.bulan_mulai}
                              onChange={(e) => setGenFormData({ ...genFormData, bulan_mulai: Number(e.target.value) })}
                              options={[1,2,3,4,5,6,7,8,9,10,11,12].map(m => ({ value: m, label: `${m} - ${getBulanLabel(m)}` }))}
                            />
                          </div>
                          <div className="form-group-admin">
                            <label style={{ fontSize: 11.5 }}>Tahun Mulai *</label>
                            <input
                              type="number"
                              className="form-control-admin"
                              value={genFormData.tahun_mulai}
                              onChange={(e) => setGenFormData({ ...genFormData, tahun_mulai: Number(e.target.value) })}
                            />
                          </div>
                        </div>

                        {/* SAMPAI PERIODE */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 8 }}>
                          <div className="form-group-admin">
                            <label style={{ fontSize: 11.5 }}>Sampai Bulan (Selesai) *</label>
                            <SearchableSelect
                              value={genFormData.bulan_selesai}
                              onChange={(e) => setGenFormData({ ...genFormData, bulan_selesai: Number(e.target.value) })}
                              options={[1,2,3,4,5,6,7,8,9,10,11,12].map(m => ({ value: m, label: `${m} - ${getBulanLabel(m)}` }))}
                            />
                          </div>
                          <div className="form-group-admin">
                            <label style={{ fontSize: 11.5 }}>Tahun Selesai *</label>
                            <input
                              type="number"
                              className="form-control-admin"
                              value={genFormData.tahun_selesai}
                              onChange={(e) => setGenFormData({ ...genFormData, tahun_selesai: Number(e.target.value) })}
                            />
                          </div>
                        </div>

                        <div style={{ fontSize: 11.5, color: '#0284c7', background: '#f0f9ff', padding: '8px 12px', borderRadius: 6, marginTop: 8 }}>
                          💡 <strong>Looping otomatis:</strong> Sistem akan membuat tagihan per bulan mulai dari <strong>{getBulanLabel(genFormData.bulan_mulai)} {genFormData.tahun_mulai}</strong> sampai <strong>{getBulanLabel(genFormData.bulan_selesai)} {genFormData.tahun_selesai}</strong>. Tagihan yang sudah pernah ada akan dilewati (tidak akan duplikat).
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                        <div className="form-group-admin">
                          <label>Bulan Tagihan *</label>
                          <SearchableSelect
                            value={genFormData.bulan}
                            onChange={(e) => setGenFormData({ ...genFormData, bulan: Number(e.target.value) })}
                            options={[1,2,3,4,5,6,7,8,9,10,11,12].map(m => ({ value: m, label: `${m} - ${getBulanLabel(m)}` }))}
                          />
                        </div>

                        <div className="form-group-admin">
                          <label>Tahun Tagihan *</label>
                          <input
                            type="number"
                            className="form-control-admin"
                            value={genFormData.tahun}
                            onChange={(e) => setGenFormData({ ...genFormData, tahun: Number(e.target.value) })}
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* FILTER KELAS */}
                <div className="form-group-admin" style={{ marginBottom: 20 }}>
                  <label>Filter Kelas (Opsional)</label>
                  <SearchableSelect
                    value={genFormData.kode_kelas}
                    onChange={(e) => setGenFormData({ ...genFormData, kode_kelas: e.target.value })}
                    placeholder="-- Semua Kelas (Semua Siswa Aktif) --"
                    options={kelasList.map(k => ({
                      value: k.kode_kelas || k.id,
                      label: `Kelas ${k.nama_kelas}`
                    }))}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isGenerating}
                  className="btn-primary-admin"
                  style={{ width: '100%', padding: '13px', fontWeight: 800, fontSize: 14 }}
                >
                  {isGenerating ? 'Sedang Memproses Tagihan...' : `⚡ Process Auto-Generate Tagihan ${isBebas ? '(Tipe Bebas)' : ''}`}
                </button>
              </form>
            </div>
          );
        })()}

        {/* ========================================================
            SUB TAB 4: REKAP TUNGGAKAN
            ======================================================== */}
        {activeSubTab === 'rekap' && (
          <div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
              <div style={{ width: 220 }}>
                <SearchableSelect
                  value={rekapFilterKelas}
                  onChange={(e) => setRekapFilterKelas(e.target.value)}
                  placeholder="Semua Kelas"
                  options={kelasList.map(k => ({ value: k.kode_kelas || k.id, label: `Kelas ${k.nama_kelas}` }))}
                />
              </div>

              <button className="btn-outline-admin" onClick={fetchRekapTunggakan} title="Refresh Rekap">
                <RefreshCw size={16} />
              </button>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: 50 }}>No</th>
                    <th>NIS</th>
                    <th>Nama Siswa</th>
                    <th>Kelas</th>
                    <th>Total Tagihan Macet</th>
                    <th>Total Nominal Tunggakan (Rp)</th>
                    <th style={{ width: 100, textAlign: 'center' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRekap.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '30px 0', color: '#64748b' }}>
                        Tidak ada data tunggakan.
                      </td>
                    </tr>
                  ) : (
                    paginatedRekap.map((r, idx) => (
                      <tr key={idx}>
                        <td style={{ textAlign: 'center', fontWeight: 700, color: '#64748b' }}>
                          {(currentPage - 1) * itemsPerPage + idx + 1}
                        </td>
                        <td style={{ color: '#64748b' }}>{r.nis || '-'}</td>
                        <td style={{ fontWeight: 800, color: '#0f172a' }}>{r.nama_siswa}</td>
                        <td>{r.nama_kelas || '-'}</td>
                        <td>
                          <span style={{ background: '#fef3c7', color: '#b45309', padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 800 }}>
                            {r.total_tagihan} Invoice
                          </span>
                        </td>
                        <td style={{ fontWeight: 800, color: '#dc2626' }}>
                          Rp {Number(r.total_tunggakan || 0).toLocaleString('id-ID')}
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            className="btn-action-icon btn-edit"
                            onClick={() => handleShowRekapDetail(r)}
                            title="Lihat Detail Rincian Tunggakan"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 8px', fontSize: 11.5, width: 'auto' }}
                          >
                            <Eye size={13} /> Detail
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalItems={rekapTunggakan.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}

        {/* ========================================================
            SUB TAB 5: HISTORI TRANSAKSI PEMBAYARAN
            ======================================================== */}
        {activeSubTab === 'histori' && (
          <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ position: 'relative', width: 350 }}>
                <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="text"
                  placeholder="Cari NIS, Nama Siswa, atau No Transaksi..."
                  value={transaksiSearch}
                  onChange={(e) => setTransaksiSearch(e.target.value)}
                  className="form-control-admin"
                  style={{ paddingLeft: 40 }}
                />
              </div>
              <button
                type="button"
                className="btn-outline-admin"
                onClick={fetchTransaksiList}
              >
                <RefreshCw size={14} style={{ marginRight: 6 }} /> Refresh Data
              </button>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: 50 }}>No</th>
                    <th>No Transaksi</th>
                    <th>Tanggal Bayar</th>
                    <th>Siswa</th>
                    <th>Total Bayar (Rp)</th>
                    <th>Metode & Kasir</th>
                    <th style={{ textAlign: 'center' }}>Status</th>
                    <th style={{ textAlign: 'center', width: 150 }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingTransaksi ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '30px 0', color: '#64748b' }}>
                        Memuat riwayat transaksi...
                      </td>
                    </tr>
                  ) : transaksiList.filter(tr => {
                    if (!transaksiSearch.trim()) return true;
                    const q = transaksiSearch.toLowerCase();
                    return (
                      (tr.no_transaksi || '').toLowerCase().includes(q) ||
                      (tr.nama_siswa || '').toLowerCase().includes(q) ||
                      (tr.nis || '').toLowerCase().includes(q)
                    );
                  }).length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '30px 0', color: '#64748b' }}>
                        Tidak ada riwayat transaksi ditemukan.
                      </td>
                    </tr>
                  ) : (
                    transaksiList
                      .filter(tr => {
                        if (!transaksiSearch.trim()) return true;
                        const q = transaksiSearch.toLowerCase();
                        return (
                          (tr.no_transaksi || '').toLowerCase().includes(q) ||
                          (tr.nama_siswa || '').toLowerCase().includes(q) ||
                          (tr.nis || '').toLowerCase().includes(q)
                        );
                      })
                      .map((tr, idx) => (
                        <tr key={tr.id}>
                          <td style={{ textAlign: 'center', color: '#64748b', fontWeight: 700 }}>{idx + 1}</td>
                          <td style={{ fontWeight: 800, color: '#0284c7' }}>{tr.no_transaksi}</td>
                          <td style={{ fontSize: 12, color: '#475569' }}>
                            {new Date(tr.tanggal_bayar).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </td>
                          <td>
                            <div style={{ fontWeight: 800, color: '#0f172a' }}>{tr.nama_siswa}</div>
                            <div style={{ fontSize: 11, color: '#64748b' }}>NIS: {tr.nis || '-'}</div>
                          </td>
                          <td style={{ fontWeight: 800, color: '#16a34a' }}>
                            Rp {Number(tr.total_bayar || 0).toLocaleString('id-ID')}
                          </td>
                          <td>
                            <div style={{ fontSize: 12, fontWeight: 700 }}>{tr.metode_pembayaran}</div>
                            <div style={{ fontSize: 11, color: '#64748b' }}>Kasir: {tr.nama_kasir || 'Kasir TU'}</div>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <span
                              className="status-badge-active"
                              style={{
                                background: tr.status_transaksi === 'CANCELLED' || tr.status_transaksi === 'EXPIRED' || tr.status_transaksi === 'FAILED' ? '#fee2e2' : (tr.status_transaksi === 'PENDING' ? '#fef3c7' : '#dcfce7'),
                                      color: tr.status_transaksi === 'CANCELLED' || tr.status_transaksi === 'EXPIRED' || tr.status_transaksi === 'FAILED' ? '#dc2626' : (tr.status_transaksi === 'PENDING' ? '#d97706' : '#15803d'),
                                      border: tr.status_transaksi === 'CANCELLED' || tr.status_transaksi === 'EXPIRED' || tr.status_transaksi === 'FAILED' ? '1px solid #fca5a5' : (tr.status_transaksi === 'PENDING' ? '1px solid #fcd34d' : '1px solid #86efac')
                              }}
                            >
                              {tr.status_transaksi || 'SUCCESS'}
                            </span>
                            {(tr.status_transaksi === 'CANCELLED' || tr.status_transaksi === 'EXPIRED' || tr.alasan_batal) && tr.alasan_batal && (
                              <div style={{ fontSize: 11, color: '#dc2626', marginTop: 4, fontWeight: 600 }}>
                                Alasan: {tr.alasan_batal}
                              </div>
                            )}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                              <button
                                type="button"
                                onClick={() => handleOpenKwitansi(tr.id)}
                                style={{ padding: '6px 8px', borderRadius: 6, background: '#e0f2fe', color: '#0284c7', border: '1px solid #7dd3fc', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
                                title="Cetak Kuitansi Pembayaran"
                              >
                                <Printer size={15} />
                              </button>
                              {tr.status_transaksi !== 'CANCELLED' && (
                                <button
                                  type="button"
                                  onClick={() => handleCancelTransaksi(tr.id)}
                                  style={{ padding: '6px 8px', borderRadius: 6, background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
                                  title="Batalkan Pembayaran Ini"
                                >
                                  <Trash2 size={15} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* --- MODAL POS PEMBAYARAN MATCHING ADMIN PENGUMUMAN MODAL --- */}
      {showPosModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: 460 }}>
            <div className="admin-modal-header">
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {editingPosId ? 'Edit Pos Pembayaran' : 'Tambah Pos Pembayaran Baru'}
              </h3>
              <button onClick={() => setShowPosModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSavePos}>
              <div className="admin-modal-body">
                <div className="form-group-admin">
                  <label>Kode Pos *</label>
                  <input
                    type="text"
                    required
                    className="form-control-admin"
                    placeholder="Contoh: POS-SPP"
                    value={posFormData.kode_pos}
                    onChange={(e) => setPosFormData({ ...posFormData, kode_pos: e.target.value })}
                  />
                </div>

                <div className="form-group-admin">
                  <label>Nama Pos Pembayaran *</label>
                  <input
                    type="text"
                    required
                    className="form-control-admin"
                    placeholder="Contoh: SPP Bulanan, Uang Gedung"
                    value={posFormData.nama_pos}
                    onChange={(e) => setPosFormData({ ...posFormData, nama_pos: e.target.value })}
                  />
                </div>

                <div className="form-group-admin">
                  <label>Tipe Pembayaran</label>
                  <SearchableSelect
                    value={posFormData.tipe}
                    onChange={(e) => setPosFormData({ ...posFormData, tipe: e.target.value })}
                    options={[
                      { value: 'BULANAN', label: 'BULANAN (Tagihan rutin per bulan)' },
                      { value: 'BEBAS', label: 'BEBAS (Cicilan / Sekali Bayar)' }
                    ]}
                  />
                </div>

                <div className="form-group-admin">
                  <label>Deskripsi</label>
                  <textarea
                    rows={2}
                    className="form-control-admin"
                    value={posFormData.deskripsi}
                    onChange={(e) => setPosFormData({ ...posFormData, deskripsi: e.target.value })}
                    style={{ height: 'auto', padding: 10 }}
                  />
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="btn-outline-admin" onClick={() => setShowPosModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary-admin">
                  Simpan Pos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL TARIF PEMBAYARAN MATCHING ADMIN PENGUMUMAN MODAL --- */}
      {showTarifModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: 480 }}>
            <div className="admin-modal-header">
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {editingTarifId ? 'Edit Tarif Pembayaran' : 'Tambah Tarif Pembayaran Matrix'}
              </h3>
              <button onClick={() => setShowTarifModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveTarif}>
              <div className="admin-modal-body">
                <div className="form-group-admin">
                  <label>Pos Pembayaran *</label>
                  <SearchableSelect
                    value={tarifFormData.pos_id}
                    onChange={(e) => setTarifFormData({ ...tarifFormData, pos_id: e.target.value })}
                    placeholder="-- Pilih Pos Pembayaran --"
                    options={posList.map(p => ({ value: p.id, label: `${p.nama_pos} (${p.kode_pos})` }))}
                  />
                </div>

                <div className="form-group-admin">
                  <label>Tahun Ajaran *</label>
                  <input
                    type="text"
                    required
                    className="form-control-admin"
                    placeholder="Contoh: 2025/2026"
                    value={tarifFormData.tahun_ajaran}
                    onChange={(e) => setTarifFormData({ ...tarifFormData, tahun_ajaran: e.target.value })}
                  />
                </div>

                <div className="form-group-admin">
                  <label>Cakupan Tarif / Sasaran Pembayaran *</label>
                  <SearchableSelect
                    value={targetType}
                    onChange={(e) => {
                      const val = e.target.value;
                      setTargetType(val);
                      if (val === 'UMUM') {
                        setSelectedKelasList([]);
                        setSelectedTingkatList([]);
                      }
                    }}
                    options={[
                      { value: 'UMUM', label: '🌐 Semua Kelas (Umum / Berlaku Seluruh Siswa)' },
                      { value: 'TINGKAT', label: '📊 Per Tingkat / Angkatan (Multi-Select: Tingkat 10, 11, 12)' },
                      { value: 'KELAS', label: '🏫 Per Kelas Spesifik (Multi-Select: Pilih Bebas Beberapa Kelas)' }
                    ]}
                  />
                </div>

                {/* MULTI-SELECT TINGKAT */}
                {targetType === 'TINGKAT' && (
                  <div className="form-group-admin">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <label style={{ margin: 0 }}>Pilih Tingkat / Angkatan (Bisa Pilih Banyak) *</label>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          type="button"
                          onClick={() => setSelectedTingkatList(tingkatOptions.map(t => t.value))}
                          style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #fde68a', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                        >
                          Pilih Semua
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedTingkatList([])}
                          style={{ background: '#f8fafc', color: '#64748b', border: '1px solid #cbd5e1', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                        >
                          Reset
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, border: '1px solid #cbd5e1', borderRadius: 8, padding: 10, background: '#ffffff', maxHeight: 180, overflowY: 'auto' }}>
                      {tingkatOptions.map(tOpt => {
                        const isChecked = selectedTingkatList.includes(tOpt.value);
                        return (
                          <label
                            key={tOpt.value}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                              padding: '6px 8px',
                              borderRadius: 6,
                              background: isChecked ? '#fef3c7' : '#f8fafc',
                              border: isChecked ? '1px solid #fde68a' : '1px solid #e2e8f0',
                              cursor: 'pointer',
                              fontSize: 12.5,
                              fontWeight: isChecked ? 800 : 500,
                              color: isChecked ? '#b45309' : '#334155'
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedTingkatList([...selectedTingkatList, tOpt.value]);
                                } else {
                                  setSelectedTingkatList(selectedTingkatList.filter(t => t !== tOpt.value));
                                }
                              }}
                              style={{ width: 15, height: 15, accentColor: '#d97706' }}
                            />
                            <span>Tingkat {tOpt.value}</span>
                          </label>
                        );
                      })}
                    </div>
                    <div style={{ fontSize: 11.5, color: '#b45309', marginTop: 4, fontWeight: 700 }}>
                      📌 Terpilih: {selectedTingkatList.length} Tingkat
                    </div>
                  </div>
                )}

                {/* MULTI-SELECT KELAS */}
                {targetType === 'KELAS' && (
                  <div className="form-group-admin">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <label style={{ margin: 0 }}>Pilih Kelas (Bisa Pilih Banyak Kelas) *</label>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          type="button"
                          onClick={() => setSelectedKelasList(kelasList.map(k => k.kode_kelas || k.id))}
                          style={{ background: '#f0f9ff', color: '#0284c7', border: '1px solid #bae6fd', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                        >
                          Pilih Semua ({kelasList.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedKelasList([])}
                          style={{ background: '#f8fafc', color: '#64748b', border: '1px solid #cbd5e1', padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                        >
                          Reset
                        </button>
                      </div>
                    </div>

                    {/* SEARCH INPUT BAR */}
                    <div style={{ position: 'relative', marginBottom: 8 }}>
                      <Search size={14} style={{ position: 'absolute', left: 10, top: 9, color: '#94a3b8' }} />
                      <input
                        type="text"
                        className="form-control-admin"
                        style={{ paddingLeft: 30, fontSize: 12, height: 32 }}
                        placeholder="Cari nama kelas / jurusan..."
                        value={kelasSearchQuery}
                        onChange={(e) => setKelasSearchQuery(e.target.value)}
                      />
                    </div>

                    {/* QUICK TINGKAT CHIPS */}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                      {tingkatOptions.map(tOpt => {
                        const matchClasses = kelasList.filter(k => {
                          const name = String(k.nama_kelas || k.kode_kelas || '').toUpperCase();
                          return name.startsWith(tOpt.value) || name.includes(` ${tOpt.value}`);
                        });
                        if (matchClasses.length === 0) return null;
                        const classCodes = matchClasses.map(k => k.kode_kelas || k.id);
                        const isAllSelected = classCodes.length > 0 && classCodes.every(c => selectedKelasList.includes(c));

                        return (
                          <button
                            key={tOpt.value}
                            type="button"
                            onClick={() => {
                              if (isAllSelected) {
                                setSelectedKelasList(selectedKelasList.filter(c => !classCodes.includes(c)));
                              } else {
                                setSelectedKelasList(Array.from(new Set([...selectedKelasList, ...classCodes])));
                              }
                            }}
                            style={{
                              background: isAllSelected ? '#0284c7' : '#e0f2fe',
                              color: isAllSelected ? '#ffffff' : '#0369a1',
                              border: '1px solid #bae6fd',
                              padding: '3px 8px',
                              borderRadius: 6,
                              fontSize: 11,
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            {isAllSelected ? '✓' : '+'} Kelas {tOpt.value} ({matchClasses.length})
                          </button>
                        );
                      })}
                    </div>

                    {/* CHECKBOX LIST */}
                    <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid #cbd5e1', borderRadius: 8, padding: 8, background: '#ffffff' }}>
                      {kelasList
                        .filter(k => {
                          if (!kelasSearchQuery.trim()) return true;
                          const q = kelasSearchQuery.toLowerCase();
                          return String(k.nama_kelas || k.kode_kelas || '').toLowerCase().includes(q) || String(k.jurusan || '').toLowerCase().includes(q);
                        })
                        .map(k => {
                          const kCode = k.kode_kelas || k.id;
                          const isChecked = selectedKelasList.includes(kCode);
                          return (
                            <label
                              key={kCode}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                padding: '6px 8px',
                                borderRadius: 6,
                                background: isChecked ? '#f0f9ff' : 'transparent',
                                cursor: 'pointer',
                                marginBottom: 2,
                                fontSize: 12.5,
                                fontWeight: isChecked ? 800 : 500,
                                color: isChecked ? '#0284c7' : '#334155'
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedKelasList([...selectedKelasList, kCode]);
                                  } else {
                                    setSelectedKelasList(selectedKelasList.filter(c => c !== kCode));
                                  }
                                }}
                                style={{ width: 15, height: 15, accentColor: '#0284c7' }}
                              />
                              <span>{k.nama_kelas || k.kode_kelas} {k.jurusan ? `(${k.jurusan})` : ''}</span>
                            </label>
                          );
                        })}
                    </div>
                    <div style={{ fontSize: 11.5, color: '#0284c7', marginTop: 4, fontWeight: 700 }}>
                      📌 Terpilih: {selectedKelasList.length} Kelas
                    </div>
                  </div>
                )}

                <div className="form-group-admin">
                  <label>Nominal Tarif SPP / Pos (Rp) *</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span style={{ position: 'absolute', left: 10, fontSize: 12, fontWeight: 700, color: '#64748b' }}>Rp</span>
                    <input
                      type="text"
                      required
                      className="form-control-admin"
                      style={{ paddingLeft: 32, fontWeight: 800, fontSize: 14 }}
                      placeholder="Contoh: 350.000"
                      value={formatRupiahInput(tarifFormData.nominal)}
                      onChange={(e) => setTarifFormData({ ...tarifFormData, nominal: parseRupiahInput(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="btn-outline-admin" onClick={() => setShowTarifModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary-admin">
                  {editingTarifId ? 'Simpan Perubahan' : 'Simpan Tarif'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL CETAK KUITANSI PEMBAYARAN --- */}
      {showKwitansiModal && selectedTransaksiDetail && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: 600, padding: 0, overflow: 'hidden' }}>
            <div className="admin-modal-header" style={{ background: '#0f172a', color: '#ffffff', padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Printer size={20} color="#38bdf8" />
                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#ffffff', margin: 0 }}>
                  Kuitansi Pembayaran Resmi
                </h3>
              </div>
              <button onClick={() => setShowKwitansiModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>

            <div id="printable-receipt" style={{ padding: 24, background: '#ffffff', color: '#0f172a' }}>
              {/* HEADER KUITANSI */}
              <div style={{ borderBottom: '2px double #cbd5e1', paddingBottom: 12, marginBottom: 16, textAlign: 'center' }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#0f172a', letterSpacing: 0.5 }}>SMK ARTANITA</h2>
                <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>BUKTI PEMBAYARAN TAGIHAN SEKOLAH (E-BMS)</div>
              </div>

              {/* META INFO */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 12, marginBottom: 16, background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ color: '#64748b', fontSize: 11 }}>No Transaksi:</div>
                  <div style={{ fontWeight: 800, color: '#0284c7' }}>{selectedTransaksiDetail.no_transaksi}</div>
                </div>
                <div>
                  <div style={{ color: '#64748b', fontSize: 11 }}>Tanggal Bayar:</div>
                  <div style={{ fontWeight: 700 }}>
                    {new Date(selectedTransaksiDetail.tanggal_bayar).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#64748b', fontSize: 11 }}>Siswa / NIS:</div>
                  <div style={{ fontWeight: 800 }}>{selectedTransaksiDetail.nama_siswa} ({selectedTransaksiDetail.nis || '-'})</div>
                </div>
                <div>
                  <div style={{ color: '#64748b', fontSize: 11 }}>Kelas / Metode:</div>
                  <div style={{ fontWeight: 700 }}>{selectedTransaksiDetail.nama_kelas || '-'} ({selectedTransaksiDetail.metode_pembayaran})</div>
                </div>
              </div>

              {/* RINCIAN ITEM */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 12, fontWeight: 800, marginBottom: 6, color: '#475569' }}>Rincian Pembayaran:</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
                      <th style={{ padding: '6px 8px', textAlign: 'left' }}>Item Tagihan</th>
                      <th style={{ padding: '6px 8px', textAlign: 'left' }}>Periode</th>
                      <th style={{ padding: '6px 8px', textAlign: 'right' }}>Jumlah (Rp)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedTransaksiDetail.details || []).map((d, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '6px 8px', fontWeight: 700 }}>{d.nama_pos}</td>
                        <td style={{ padding: '6px 8px', color: '#64748b' }}>
                          {d.bulan ? `${getBulanLabel(d.bulan)} ${d.tahun}` : 'Sekali Bayar'}
                        </td>
                        <td style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 800 }}>
                          Rp {Number(d.nominal_dibayar || 0).toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ borderTop: '2px solid #0f172a', fontWeight: 800 }}>
                      <td colSpan={2} style={{ padding: '8px', textAlign: 'right' }}>TOTAL DIBAYAR:</td>
                      <td style={{ padding: '8px', textAlign: 'right', color: '#16a34a', fontSize: 14 }}>
                        Rp {Number(selectedTransaksiDetail.total_bayar || 0).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* FOOTER & SIGNATURE */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 24, paddingTop: 12, borderTop: '1px dashed #cbd5e1', fontSize: 11 }}>
                <div>
                  <div style={{ color: '#64748b' }}>Status: <strong style={{ color: '#16a34a' }}>LUNAS / BERHASIL</strong></div>
                  <div style={{ color: '#64748b', marginTop: 2 }}>Petugas Kasir: <strong>{selectedTransaksiDetail.nama_kasir || 'Kasir TU'}</strong></div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ color: '#64748b', marginBottom: 36 }}>Kasir / Keuangan</div>
                  <div style={{ fontWeight: 800, textDecoration: 'underline' }}>({selectedTransaksiDetail.nama_kasir || 'Kasir TU'})</div>
                </div>
              </div>
            </div>

            <div className="admin-modal-footer" style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', padding: '12px 20px', display: 'flex', justifyContent: 'space-between' }}>
              <button type="button" className="btn-outline-admin" onClick={() => setShowKwitansiModal(false)}>
                Tutup
              </button>
              <button
                type="button"
                className="btn-primary-admin"
                style={{ background: '#0284c7', borderColor: '#0284c7' }}
                onClick={() => {
                  const printContents = document.getElementById('printable-receipt').innerHTML;
                  const win = window.open('', '', 'height=700,width=800');
                  win.document.write(`
                    <html>
                      <head>
                        <title>Kuitansi ${selectedTransaksiDetail.no_transaksi}</title>
                        <style>
                          body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; color: #0f172a; }
                          table { width: 100%; border-collapse: collapse; }
                        </style>
                      </head>
                      <body>${printContents}</body>
                    </html>
                  `);
                  win.document.close();
                  win.focus();
                  setTimeout(() => { win.print(); win.close(); }, 300);
                }}
              >
                <Printer size={15} style={{ marginRight: 6 }} /> Cetak Kuitansi (Print)
              </button>
            </div>
          </div>
        </div>
      )}


      {/* MODAL EDIT TAGIHAN SISWA */}
      {showEditTagihanModal && editTagihanData && (
        <div className="modal-overlay-admin">
          <div className="modal-content-admin" style={{ maxWidth: 450 }}>
            <div className="modal-header-admin">
              <h3>Edit Tagihan Siswa</h3>
              <button onClick={() => setShowEditTagihanModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleSaveEditTagihan}>
              <div className="modal-body-admin">
                <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 14 }}>
                  <div style={{ fontSize: 11.5, color: '#64748b' }}>Kode: <strong>{editTagihanData.kode_tagihan}</strong></div>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0f172a', marginTop: 2 }}>{editTagihanData.nama_siswa}</div>
                  <div style={{ fontSize: 12, color: '#0284c7', fontWeight: 700, marginTop: 2 }}>{editTagihanData.nama_pos}</div>
                </div>

                <div className="form-group-admin" style={{ marginBottom: 14 }}>
                  <label>Nominal Tagihan (Rp) *</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <span style={{ position: 'absolute', left: 10, fontSize: 12, fontWeight: 700, color: '#64748b' }}>Rp</span>
                    <input
                      type="text"
                      className="form-control-admin"
                      style={{ paddingLeft: 32, fontWeight: 800, fontSize: 14 }}
                      value={formatRupiahInput(editTagihanData.nominal_tagihan)}
                      onChange={(e) => setEditTagihanData({ ...editTagihanData, nominal_tagihan: parseRupiahInput(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="form-group-admin">
                  <label>Tanggal Jatuh Tempo</label>
                  <input
                    type="date"
                    className="form-control-admin"
                    value={editTagihanData.tanggal_jatuh_tempo || ''}
                    onChange={(e) => setEditTagihanData({ ...editTagihanData, tanggal_jatuh_tempo: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer-admin" style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '12px 16px', borderTop: '1px solid #e2e8f0' }}>
                <button type="button" className="btn-outline-admin" onClick={() => setShowEditTagihanModal(false)}>Batal</button>
                <button type="submit" className="btn-primary-admin">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL DETAIL RINCIAN TUNGGAKAN SISWA --- */}
      {showRekapDetailModal && selectedRekapSiswa && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: 960, width: '92%', padding: 0, overflow: 'hidden' }}>
            <div className="admin-modal-header" style={{ background: '#0f172a', color: '#ffffff', padding: '16px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <AlertCircle size={22} color="#ef4444" />
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 800, color: '#ffffff', margin: 0 }}>
                    Rincian Tunggakan Tagihan Siswa
                  </h3>
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                    {selectedRekapSiswa.nama_siswa} ({selectedRekapSiswa.nis || 'NIS -'}) — Kelas {selectedRekapSiswa.nama_kelas || '-'}
                  </div>
                </div>
              </div>
              <button onClick={() => setShowRekapDetailModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={20} />
              </button>
            </div>

            <div id="printable-tunggakan" style={{ padding: 24, background: '#ffffff' }}>
              {/* SUMMARY INFO */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20, background: '#f8fafc', padding: 16, borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 13 }}>
                <div>
                  <div style={{ color: '#64748b', fontSize: 11.5 }}>Nama Siswa:</div>
                  <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 14 }}>{selectedRekapSiswa.nama_siswa}</div>
                </div>
                <div>
                  <div style={{ color: '#64748b', fontSize: 11.5 }}>Kelas:</div>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>{selectedRekapSiswa.nama_kelas || '-'}</div>
                </div>
                <div>
                  <div style={{ color: '#64748b', fontSize: 11.5 }}>Total Tunggakan:</div>
                  <div style={{ fontWeight: 900, color: '#dc2626', fontSize: 16 }}>
                    Rp {Number(selectedRekapSiswa.total_tunggakan || 0).toLocaleString('id-ID')}
                  </div>
                </div>
              </div>

              {/* TABLE TAGIHAN UNPAID */}
              {isLoadingRekapDetail ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b', fontSize: 13 }}>
                  Memuat rincian item tunggakan...
                </div>
              ) : rekapDetailTagihan.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#16a34a', fontWeight: 700 }}>
                  🎉 Siswa ini tidak memiliki tunggakan tagihan aktif.
                </div>
              ) : (
                <div style={{ maxHeight: 420, overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
                        <th style={{ padding: '10px 14px' }}>Pos Tagihan</th>
                        <th style={{ padding: '10px 14px' }}>Periode</th>
                        <th style={{ padding: '10px 14px', textAlign: 'right' }}>Nominal (Rp)</th>
                        <th style={{ padding: '10px 14px', textAlign: 'right' }}>Terbayar (Rp)</th>
                        <th style={{ padding: '10px 14px', textAlign: 'right' }}>Sisa (Rp)</th>
                        <th style={{ padding: '10px 14px', textAlign: 'center' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rekapDetailTagihan.map((t) => {
                        const sisa = Number(t.nominal_tagihan) - Number(t.nominal_terbayar);
                        return (
                          <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '8px 10px', fontWeight: 700, color: '#0f172a' }}>{t.nama_pos}</td>
                            <td style={{ padding: '8px 10px', color: '#64748b' }}>
                              {t.bulan ? `${getBulanLabel(t.bulan)} ${t.tahun}` : 'Sekali Bayar'}
                            </td>
                            <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                              Rp {Number(t.nominal_tagihan).toLocaleString('id-ID')}
                            </td>
                            <td style={{ padding: '8px 10px', textAlign: 'right', color: '#16a34a' }}>
                              Rp {Number(t.nominal_terbayar).toLocaleString('id-ID')}
                            </td>
                            <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 800, color: '#dc2626' }}>
                              Rp {sisa.toLocaleString('id-ID')}
                            </td>
                            <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                              <span style={{
                                background: t.status === 'PARTIAL' ? '#fef3c7' : '#fee2e2',
                                color: t.status === 'PARTIAL' ? '#b45309' : '#dc2626',
                                padding: '3px 8px', borderRadius: 4, fontSize: 10.5, fontWeight: 800
                              }}>
                                {t.status === 'PARTIAL' ? 'SEBAGIAN' : 'BELUM BAYAR'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="admin-modal-footer" style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', padding: '12px 20px', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  className="btn-outline-admin"
                  onClick={() => {
                    const printContents = document.getElementById('printable-tunggakan').innerHTML;
                    const win = window.open('', '', 'height=700,width=800');
                    win.document.write(`
                      <html>
                        <head>
                          <title>Surat Tunggakan - ${selectedRekapSiswa.nama_siswa}</title>
                          <style>
                            body { font-family: system-ui, -apple-system, sans-serif; padding: 24px; color: #0f172a; }
                            table { width: 100%; border-collapse: collapse; margin-top: 14px; }
                            th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
                            th { background: #f1f5f9; }
                          </style>
                        </head>
                        <body>
                          <h2 style="text-align:center; margin-bottom: 4px;">RINCIAN TUNGGAKAN PEMBAYARAN SEKOLAH</h2>
                          <div style="text-align:center; color:#64748b; font-size:12px; margin-bottom: 20px;">SMK ARTANITA</div>
                          ${printContents}
                        </body>
                      </html>
                    `);
                    win.document.close();
                    win.focus();
                    setTimeout(() => { win.print(); win.close(); }, 300);
                  }}
                >
                  <Printer size={15} style={{ marginRight: 6 }} /> Cetak Rincian (Print)
                </button>
                <button
                  type="button"
                  className="btn-primary-admin"
                  style={{ background: '#0284c7', borderColor: '#0284c7' }}
                  onClick={() => {
                    setShowRekapDetailModal(false);
                    // Switch to Kasir tab & select student
                    setActiveSubTab('kasir');
                    handleSelectStudent({
                      kode_siswa: selectedRekapSiswa.kode_siswa,
                      nama_siswa: selectedRekapSiswa.nama_siswa,
                      nis: selectedRekapSiswa.nis,
                      nama_kelas: selectedRekapSiswa.nama_kelas
                    });
                  }}
                >
                  <CreditCard size={15} style={{ marginRight: 6 }} /> Bayar di Kasir TU
                </button>
              </div>

              <button type="button" className="btn-outline-admin" onClick={() => setShowRekapDetailModal(false)}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
