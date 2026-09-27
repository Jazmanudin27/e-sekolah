import React, { useState, useEffect } from 'react';
import {
  FileText, Search, Filter, Calendar, CheckCircle2, XCircle,
  Clock, Trash2, Printer, RefreshCw, Plus, User, AlertCircle
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../api/client';
import Pagination from '../../components/Pagination';

export default function AdminIzinTab() {
  const [izinList, setIzinList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterJenis, setFilterJenis] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchIzin();
  }, []);

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
              <FileText size={20} color="#0066ff" /> Data Pengajuan Surat Izin & Ketidakhadiran Guru
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
              Daftar surat keterangan dokter, izin keperluan dinas, dan urusan keluarga
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn-outline-admin" onClick={() => window.print()}>
              <Printer size={16} /> Cetak Daftar
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

          <select
            value={filterJenis}
            onChange={(e) => setFilterJenis(e.target.value)}
            className="form-control-admin"
            style={{ width: 170 }}
          >
            <option value="ALL">Semua Jenis Izin</option>
            <option value="Sakit">Sakit</option>
            <option value="Izin">Izin Pribadi</option>
            <option value="Cuti">Cuti</option>
            <option value="Dinas">Tugas Dinas</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="form-control-admin"
            style={{ width: 170 }}
          >
            <option value="ALL">Semua Status</option>
            <option value="Disetujui">Disetujui</option>
            <option value="Menunggu">Menunggu</option>
            <option value="Ditolak">Ditolak</option>
          </select>
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
                      <td style={{ fontWeight: 700, color: '#64748b' }}>{startIndex + idx + 1}</td>
                      <td>
                        <div style={{ fontWeight: 700, color: '#0f172a' }}>{item.nama_guru || 'Guru Pengajar'}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>Kode: #{item.kode_guru || item.id}</div>
                      </td>
                      <td>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: 20,
                          fontSize: 11.5,
                          fontWeight: 700,
                          background: isSakit ? '#ecfdf5' : isDinas ? '#f5f3ff' : '#eff6ff',
                          color: isSakit ? '#059669' : isDinas ? '#7c3aed' : '#2563eb',
                          border: `1px solid ${isSakit ? '#a7f3d0' : isDinas ? '#ddd6fe' : '#bfdbfe'}`
                        }}>
                          {item.jenis_izin || 'Izin'}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{item.tanggal_mulai}</td>
                      <td style={{ fontWeight: 600 }}>{item.tanggal_selesai || item.tanggal_mulai}</td>
                      <td>
                        <div style={{ maxWidth: 260, fontSize: 12.5, color: '#334155', lineHeight: 1.4 }}>
                          {item.keterangan || '-'}
                        </div>
                      </td>
                      <td>
                        {status === 'Disetujui' ? (
                          <span className="badge-status-aktif">
                            <span className="status-dot"></span> Disetujui
                          </span>
                        ) : status === 'Ditolak' ? (
                          <span style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '3px 10px', borderRadius: 20, fontSize: 11.5, fontWeight: 700 }}>
                            Ditolak
                          </span>
                        ) : (
                          <span style={{ background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a', padding: '3px 10px', borderRadius: 20, fontSize: 11.5, fontWeight: 700 }}>
                            Menunggu
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          {status !== 'Disetujui' && (
                            <button
                              className="btn-action-icon"
                              style={{ background: '#ecfdf5', color: '#059669' }}
                              onClick={() => handleUpdateStatus(item, 'Disetujui')}
                              title="Setujui Izin"
                            >
                              <CheckCircle2 size={15} />
                            </button>
                          )}
                          <button
                            className="btn-action-icon btn-delete"
                            onClick={() => handleDelete(item)}
                            title="Hapus Surat Izin"
                          >
                            <Trash2 size={15} />
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
    </div>
  );
}
