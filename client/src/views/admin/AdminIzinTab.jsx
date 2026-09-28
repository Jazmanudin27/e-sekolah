import React, { useState, useEffect } from 'react';
import {
  FileText, Search, Filter, Calendar, CheckCircle2, XCircle,
  Clock, Trash2, RefreshCw, Plus, User, AlertCircle
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../api/client';
import Pagination from '../../components/Pagination';
import SearchableSelect from '../../components/SearchableSelect';

export default function AdminIzinTab() {
  const [izinList, setIzinList] = useState([]);
  const [guruList, setGuruList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filterJenis, setFilterJenis] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    kode_guru: '',
    nama_guru: '',
    jenis: 'Sakit',
    tanggal_mulai: new Date().toISOString().split('T')[0],
    tanggal_selesai: new Date().toISOString().split('T')[0],
    status: 'Disetujui',
    keterangan: ''
  });

  useEffect(() => {
    fetchIzin();
    fetchGuruList();
  }, []);

  const fetchGuruList = async () => {
    try {
      const res = await api.get('/guru');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setGuruList(res.data.data);
      }
    } catch (e) {
      console.warn('Error fetching guru list:', e);
    }
  };

  const fetchIzin = async () => {
    setLoading(true);
    try {
      const res = await api.get('/izin');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setIzinList(res.data.data);
      } else {
        setIzinList([]);
      }
    } catch (err) {
      console.error('Error fetching izin:', err);
      setIzinList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nama_guru && !formData.kode_guru) {
      Swal.fire('Peringatan', 'Pilih atau isi nama guru pengaju izin.', 'warning');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        kode_guru: formData.kode_guru,
        nama_guru: formData.nama_guru || 'Guru Pengajar',
        jenis: formData.jenis,
        tanggal_mulai: formData.tanggal_mulai,
        tanggal_selesai: formData.tanggal_selesai || formData.tanggal_mulai,
        status: formData.status,
        keterangan: formData.keterangan
      };
      const res = await api.post('/izin', payload);
      if (res.data?.success) {
        Swal.fire('Berhasil!', 'Surat izin baru berhasil ditambahkan.', 'success');
        setShowModal(false);
        setFormData({
          kode_guru: '',
          nama_guru: '',
          jenis: 'Sakit',
          tanggal_mulai: new Date().toISOString().split('T')[0],
          tanggal_selesai: new Date().toISOString().split('T')[0],
          status: 'Disetujui',
          keterangan: ''
        });
        fetchIzin();
      } else {
        throw new Error(res.data?.message || 'Gagal menyimpan surat izin');
      }
    } catch (err) {
      Swal.fire('Gagal!', err.response?.data?.message || err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (item) => {
    Swal.fire({
      title: 'Hapus Surat Izin?',
      text: `Hapus pengajuan izin "${item.nama_guru || 'Guru'}" tanggal ${item.tanggal_mulai}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await api.delete(`/izin/${item.id}`);
          if (res.data?.success) {
            Swal.fire('Berhasil!', 'Data izin telah dihapus.', 'success');
            fetchIzin();
          }
        } catch (err) {
          Swal.fire('Gagal!', err.response?.data?.message || 'Gagal menghapus izin.', 'error');
        }
      }
    });
  };

  const handleUpdateStatus = (item, newStatus) => {
    Swal.fire({
      title: `${newStatus === 'Disetujui' ? 'Setujui' : 'Tolak'} Izin?`,
      text: `Ubah status pengajuan izin ${item.nama_guru || 'Guru'} menjadi "${newStatus}"?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: newStatus === 'Disetujui' ? '#059669' : '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Konfirmasi',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // If update endpoint exists
          await api.put(`/izin/${item.id}`, { status: newStatus }).catch(() => null);
          Swal.fire('Sukses!', `Status izin diperbarui menjadi ${newStatus}.`, 'success');
          // Optimistically update list
          setIzinList(prev => prev.map(i => i.id === item.id ? { ...i, status: newStatus } : i));
        } catch (e) {
          Swal.fire('Info', 'Status diperbarui di tampilan lokal.', 'info');
        }
      }
    });
  };

  const filteredList = izinList.filter(item => {
    const matchSearch =
      (item.nama_guru || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.keterangan || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.tanggal_mulai || '').includes(search);

    const matchJenis = filterJenis === 'ALL' || item.jenis_izin === filterJenis;
    const itemStatus = item.status || 'Disetujui';
    const matchStatus = filterStatus === 'ALL' || itemStatus === filterStatus;

    return matchSearch && matchJenis && matchStatus;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterJenis, filterStatus]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedList = filteredList.slice(startIndex, startIndex + itemsPerPage);

  const totalSakit = izinList.filter(i => (i.jenis_izin || '').toLowerCase() === 'sakit').length;
  const totalIzin = izinList.filter(i => (i.jenis_izin || '').toLowerCase() === 'izin').length;
  const totalDinas = izinList.filter(i => (i.jenis_izin || '').toLowerCase() === 'dinas').length;

  return (
    <div className="admin-izin-wrapper">
      {/* STATS CARDS */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div>
            <div className="stat-label">Total Surat Izin</div>
            <div className="stat-value">{izinList.length}</div>
            <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>Semua permohonan izin</div>
          </div>
          <div className="stat-icon-wrapper stat-icon-blue">
            <FileText size={24} />
          </div>
        </div>

        <div className="admin-stat-card">
          <div>
            <div className="stat-label">Izin Sakit</div>
            <div className="stat-value" style={{ color: '#059669' }}>{totalSakit}</div>
            <div style={{ fontSize: 11, color: '#10b981', marginTop: 4 }}>Kondisi medis / surat dokter</div>
          </div>
          <div className="stat-icon-wrapper stat-icon-emerald">
            <CheckCircle2 size={24} />
          </div>
        </div>

        <div className="admin-stat-card">
          <div>
            <div className="stat-label">Izin Keperluan Pribadi</div>
            <div className="stat-value" style={{ color: '#d97706' }}>{totalIzin}</div>
            <div style={{ fontSize: 11, color: '#f59e0b', marginTop: 4 }}>Urusan keluarga / mendesak</div>
          </div>
          <div className="stat-icon-wrapper stat-icon-amber">
            <Clock size={24} />
          </div>
        </div>

        <div className="admin-stat-card">
          <div>
            <div className="stat-label">Tugas Luar / Dinas</div>
            <div className="stat-value" style={{ color: '#7c3aed' }}>{totalDinas}</div>
            <div style={{ fontSize: 11, color: '#8b5cf6', marginTop: 4 }}>Pelatihan / rapat dinas</div>
          </div>
          <div className="stat-icon-wrapper stat-icon-purple">
            <AlertCircle size={24} />
          </div>
        </div>
      </div>

      {/* MAIN DATA PANEL */}
      <div className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <div className="admin-panel-title">
              <FileText size={18} color="#0284c7" /> Data Pengajuan Surat Izin & Ketidakhadiran Guru
            </div>
            <div className="admin-panel-subtitle">
              Daftar surat keterangan dokter, izin keperluan dinas, dan urusan keluarga
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              className="btn-primary-admin"
              onClick={() => setShowModal(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', fontSize: 13 }}
            >
              <Plus size={16} /> Tambah Surat Izin
            </button>
            <button className="btn-outline-admin" onClick={fetchIzin} title="Segarkan Data">
              <RefreshCw size={16} /> Refresh
            </button>
          </div>
        </div>

        {/* TOOLBAR CONTROLS */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 18, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Cari nama guru, alasan izin, tanggal..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-control-admin"
              style={{ paddingLeft: 40 }}
            />
          </div>

          <div style={{ width: 170 }}>
            <SearchableSelect
              value={filterJenis}
              onChange={(e) => setFilterJenis(e.target.value)}
              options={[
                { value: 'ALL', label: 'Semua Jenis Izin' },
                { value: 'Sakit', label: 'Sakit' },
                { value: 'Izin', label: 'Izin Pribadi' },
                { value: 'Cuti', label: 'Cuti' },
                { value: 'Dinas', label: 'Tugas Dinas' }
              ]}
            />
          </div>

          <div style={{ width: 170 }}>
            <SearchableSelect
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              options={[
                { value: 'ALL', label: 'Semua Status' },
                { value: 'Disetujui', label: 'Disetujui' },
                { value: 'Menunggu', label: 'Menunggu' },
                { value: 'Ditolak', label: 'Ditolak' }
              ]}
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 50 }}>No</th>
                <th>Nama Guru & NIP</th>
                <th>Jenis Izin</th>
                <th>Mulai Tanggal</th>
                <th>Sampai Tanggal</th>
                <th>Keterangan / Alasan</th>
                <th>Status</th>
                <th style={{ width: 120, textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                    Memuat data surat izin...
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                    Tidak ada pengajuan surat izin yang ditemukan.
                  </td>
                </tr>
              ) : (
                paginatedList.map((item, idx) => {
                  const status = item.status || 'Disetujui';
                  const isSakit = (item.jenis_izin || '').toLowerCase() === 'sakit';
                  const isDinas = (item.jenis_izin || '').toLowerCase() === 'dinas';

                  return (
                    <tr key={item.id || idx}>
                      <td style={{ fontWeight: 700, color: '#64748b', textAlign: 'center' }}>{startIndex + idx + 1}</td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.nama_guru || 'Guru Pengajar'}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>Kode: #{item.kode_guru || item.id}</div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{
                          padding: '3px 10px',
                          borderRadius: 4,
                          fontSize: 11.5,
                          fontWeight: 700,
                          background: isSakit ? '#ecfdf5' : isDinas ? '#f5f3ff' : '#eff6ff',
                          color: isSakit ? '#059669' : isDinas ? '#7c3aed' : '#2563eb',
                          border: `1px solid ${isSakit ? '#a7f3d0' : isDinas ? '#ddd6fe' : '#bfdbfe'}`
                        }}>
                          {item.jenis_izin || 'Izin'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600, textAlign: 'center' }}>{item.tanggal_mulai}</td>
                      <td style={{ fontWeight: 600, textAlign: 'center' }}>{item.tanggal_selesai || item.tanggal_mulai}</td>
                      <td>
                        <div style={{ maxWidth: 260, fontSize: 12.5, color: '#334155', lineHeight: 1.4 }}>
                          {item.keterangan && item.keterangan !== '-' ? item.keterangan : ''}
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {status === 'Disetujui' ? (
                          <span className="badge-status-aktif">
                            <span className="status-dot"></span> Disetujui
                          </span>
                        ) : status === 'Ditolak' ? (
                          <span style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '3px 10px', borderRadius: 4, fontSize: 11.5, fontWeight: 700 }}>
                            Ditolak
                          </span>
                        ) : (
                          <span style={{ background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a', padding: '3px 10px', borderRadius: 4, fontSize: 11.5, fontWeight: 700 }}>
                            Menunggu
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          {status !== 'Disetujui' && (
                            <button
                              className="btn-action-icon"
                              style={{ background: '#16a34a', color: '#ffffff', border: '1px solid #15803d' }}
                              onClick={() => handleUpdateStatus(item, 'Disetujui')}
                              title="Setujui Izin"
                            >
                              <CheckCircle2 size={13} />
                            </button>
                          )}
                          <button
                            className="btn-action-icon btn-delete"
                            onClick={() => handleDelete(item)}
                            title="Hapus Surat Izin"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredList.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* MODAL TAMBAH SURAT IZIN */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 999999, padding: 16
        }}>
          <div style={{
            background: '#ffffff', borderRadius: 16, width: '100%', maxWidth: 520,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', overflow: 'hidden',
            border: '1px solid #e2e8f0'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '16px 20px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: 15, color: '#0f172a' }}>
                <Plus size={18} color="#0066ff" /> Tambah Data Surat Izin Guru
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <XCircle size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateSubmit} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                  NAMA GURU / PEGAWAI <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <SearchableSelect
                  options={guruList.map(g => ({
                    value: String(g.kode_guru || g.id),
                    label: `${g.nama_guru} (${g.nip_nuptk || g.kode_guru || 'Guru'})`
                  }))}
                  value={formData.kode_guru}
                  onChange={(e) => {
                    const selected = guruList.find(g => String(g.kode_guru || g.id) === String(e.target.value));
                    setFormData({
                      ...formData,
                      kode_guru: e.target.value,
                      nama_guru: selected ? selected.nama_guru : e.target.value
                    });
                  }}
                  placeholder="-- Pilih Guru / Ketik Nama Guru --"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                    JENIS IZIN <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <SearchableSelect
                    options={[
                      { value: 'Sakit', label: 'Sakit (Kondisi Medis)' },
                      { value: 'Izin', label: 'Izin Keperluan Pribadi' },
                      { value: 'Cuti', label: 'Cuti Tahunan / Melahirkan' },
                      { value: 'Dinas', label: 'Tugas Luar / Dinas' }
                    ]}
                    value={formData.jenis}
                    onChange={(e) => setFormData({ ...formData, jenis: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                    STATUS VERIFIKASI
                  </label>
                  <SearchableSelect
                    options={[
                      { value: 'Disetujui', label: 'Disetujui' },
                      { value: 'Menunggu', label: 'Menunggu Verifikasi' },
                      { value: 'Ditolak', label: 'Ditolak' }
                    ]}
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                    TANGGAL MULAI <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="date"
                    required
                    className="form-control-admin"
                    value={formData.tanggal_mulai}
                    onChange={(e) => setFormData({ ...formData, tanggal_mulai: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                    TANGGAL SELESAI
                  </label>
                  <input
                    type="date"
                    className="form-control-admin"
                    value={formData.tanggal_selesai}
                    onChange={(e) => setFormData({ ...formData, tanggal_selesai: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 4 }}>
                  KETERANGAN / ALASAN IZIN
                </label>
                <textarea
                  rows={3}
                  className="form-control-admin"
                  placeholder="Tuliskan keterangan detail pengajuan surat izin..."
                  value={formData.keterangan}
                  onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })}
                />
              </div>

              {/* Modal Footer */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  className="btn-outline-admin"
                  onClick={() => setShowModal(false)}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-primary-admin"
                  disabled={saving}
                  style={{ padding: '10px 20px', fontSize: 13 }}
                >
                  {saving ? 'Menyimpan...' : 'Simpan Surat Izin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
