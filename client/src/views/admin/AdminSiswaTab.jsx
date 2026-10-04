import React, { useState, useEffect } from 'react';
import {
  GraduationCap, Plus, Search, Edit2, Trash2, RefreshCw, X, Filter, Award, TrendingUp, Phone, MessageCircle
} from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../api/client';
import Pagination from '../../components/Pagination';
import SearchableSelect from '../../components/SearchableSelect';

export default function AdminSiswaTab({ onSwitchTab }) {
  const [siswaList, setSiswaList] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterKelas, setFilterKelas] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('Aktif');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [formData, setFormData] = useState({
    nis_nisn: '',
    nama_siswa: '',
    jk: 'L',
    kode_kelas: '',
    status: 'Aktif',
    nama_ortu: '',
    no_wa_ortu: '',
    hubungan_wali: 'Orang Tua'
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInitial();
  }, []);

  const fetchInitial = async () => {
    setLoading(true);
    try {
      const [resSiswa, resKelas] = await Promise.all([
        api.get('/siswa?status=ALL'),
        api.get('/kelas')
      ]);

      if (resKelas.data?.success && Array.isArray(resKelas.data.data)) {
        setKelasList(resKelas.data.data);
      }
      if (resSiswa.data?.success && Array.isArray(resSiswa.data.data)) {
        setSiswaList(resSiswa.data.data);
      } else {
        setSiswaList([]);
      }
    } catch (err) {
      console.error(err);
      setSiswaList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setIsEditing(false);
    setCurrentId(null);
    setFormData({
      nis_nisn: '',
      nama_siswa: '',
      jk: 'L',
      kode_kelas: kelasList[0]?.kode_kelas || '',
      status: 'Aktif',
      nama_ortu: '',
      no_wa_ortu: '',
      hubungan_wali: 'Orang Tua'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (siswa) => {
    setIsEditing(true);
    setCurrentId(siswa.kode_siswa);
    setFormData({
      nis_nisn: siswa.nis_nisn || siswa.nis || '',
      nama_siswa: siswa.nama_siswa || '',
      jk: siswa.jk || 'L',
      kode_kelas: siswa.kode_kelas || '',
      status: siswa.status || 'Aktif',
      nama_ortu: siswa.nama_ortu || '',
      no_wa_ortu: siswa.no_wa_ortu || '',
      hubungan_wali: siswa.hubungan_wali || 'Orang Tua'
    });
    setShowModal(true);
  };

  const handleDelete = (siswa) => {
    Swal.fire({
      title: 'Hapus Data Siswa?',
      text: `Apakah Anda yakin ingin menghapus siswa "${siswa.nama_siswa}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await api.delete(`/siswa/${siswa.kode_siswa}`);
          if (res.data?.success) {
            Swal.fire('Terhapus!', 'Data siswa berhasil dihapus.', 'success');
            fetchInitial();
          }
        } catch (err) {
          Swal.fire('Gagal!', err.response?.data?.message || 'Gagal menghapus data siswa.', 'error');
        }
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nama_siswa) {
      Swal.fire('Validasi Gagal', 'Nama siswa wajib diisi!', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing) {
        await api.put(`/siswa/${currentId}`, formData);
        Swal.fire('Berhasil!', 'Data siswa berhasil diperbarui.', 'success');
      } else {
        await api.post('/siswa', formData);
        Swal.fire('Berhasil!', 'Data siswa baru berhasil ditambahkan.', 'success');
      }
      setShowModal(false);
      fetchInitial();
    } catch (err) {
      Swal.fire('Error', err.response?.data?.message || 'Gagal menyimpan data siswa.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterKelas, filterStatus]);

  const filteredList = siswaList
    .filter(s => {
      const matchSearch = (s.nama_siswa || '').toLowerCase().includes(search.toLowerCase()) ||
                          (s.nis_nisn || '').toLowerCase().includes(search.toLowerCase());
      const matchKelas = filterKelas === 'ALL' || String(s.kode_kelas) === String(filterKelas) || s.nama_kelas === filterKelas;
      const currentStatus = s.status || 'Aktif';
      const matchStatus = filterStatus === 'ALL' || currentStatus === filterStatus;
      return matchSearch && matchKelas && matchStatus;
    })
    .sort((a, b) => (a.nama_siswa || '').localeCompare(b.nama_siswa || '', 'id', { sensitivity: 'base' }));

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedList = filteredList.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div>
      <div className="admin-panel">
        <div className="admin-panel-header">
          <div>
            <div className="admin-panel-title">
              <GraduationCap size={18} color="#0284c7" /> Data Master Siswa
            </div>
            <div className="admin-panel-subtitle">
              Total {filteredList.length} siswa terdaftar dalam sistem
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            {onSwitchTab && (
              <button
                type="button"
                className="btn-outline-admin"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700 }}
                onClick={() => onSwitchTab('kenaikanAlumni')}
                title="Kelola Kenaikan Kelas & Alumni"
              >
                <TrendingUp size={16} color="#0284c7" /> Kenaikan & Kelulusan
              </button>
            )}
            <button className="btn-primary-admin" onClick={handleOpenAdd}>
              <Plus size={16} /> Tambah Siswa Baru
            </button>
          </div>
        </div>

        {/* SEARCH & FILTER CONTROLS */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 18, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
            <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Cari berdasarkan nama siswa atau NIS / NISN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-control-admin"
              style={{ paddingLeft: 40 }}
            />
          </div>

          <div style={{ width: 170 }}>
            <SearchableSelect
              options={[
                { value: 'ALL', label: 'Semua Status' },
                { value: 'Aktif', label: 'Siswa Aktif' },
                { value: 'Alumni', label: 'Alumni (Lulus)' }
              ]}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              placeholder="Status"
            />
          </div>

          <div style={{ width: 200 }}>
            <SearchableSelect
              options={[
                { value: 'ALL', label: 'Semua Kelas' },
                ...kelasList.map(k => ({
                  value: k.kode_kelas,
                  label: `${k.nama_kelas} ${k.jurusan && k.jurusan !== '-' ? `(${k.jurusan})` : ''}`
                }))
              ]}
              value={filterKelas}
              onChange={(e) => setFilterKelas(e.target.value)}
              placeholder="Semua Kelas"
            />
          </div>

          <button className="btn-outline-admin" onClick={fetchInitial} title="Refresh Data">
            <RefreshCw size={16} />
          </button>
        </div>

        {/* DATA TABLE */}
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 50 }}>No</th>
                <th>NIS / NISN</th>
                <th>Nama Lengkap Siswa</th>
                <th>L/P</th>
                <th>Kelas</th>
                <th>Kontak Ortu (WA)</th>
                <th>Status</th>
                <th style={{ width: 120, textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                    Memuat data siswa...
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                    Tidak ada data siswa yang cocok.
                  </td>
                </tr>
              ) : (
                paginatedList.map((s, idx) => (
                  <tr key={s.kode_siswa || idx}>
                    <td style={{ fontWeight: 700, color: '#64748b', textAlign: 'center' }}>{startIndex + idx + 1}</td>
                    <td style={{ fontWeight: 700, color: '#0066ff', textAlign: 'center' }}>{s.nis_nisn && s.nis_nisn !== '-' ? s.nis_nisn : ''}</td>
                    <td>
                      <div style={{ fontWeight: 800, color: '#0f172a' }}>{s.nama_siswa}</div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ fontWeight: 700, color: s.jk === 'L' ? '#0066ff' : '#be185d' }}>
                        {s.jk === 'L' ? 'L' : 'P'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ background: '#eff6ff', color: '#1d4ed8', padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700 }}>
                        {s.nama_kelas || `Kelas ${s.kode_kelas}`}
                      </span>
                    </td>
                    <td>
                      {s.no_wa_ortu ? (
                        <div>
                          <a
                            href={`https://wa.me/${String(s.no_wa_ortu).replace(/\D/g, '').replace(/^0/, '62')}`}
                            target="_blank"
                            rel="noreferrer"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#16a34a', textDecoration: 'none', fontWeight: 700, fontSize: 12 }}
                            title="Chat WhatsApp Orang Tua"
                          >
                            <Phone size={12} /> {s.no_wa_ortu}
                          </a>
                          {s.nama_ortu && (
                            <div style={{ fontSize: 11, color: '#64748b', marginTop: 1 }}>
                              {s.hubungan_wali ? `(${s.hubungan_wali}) ` : ''}{s.nama_ortu}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span style={{ fontSize: 11, color: '#94a3b8', fontStyle: 'italic' }}>
                          Belum terdaftar
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {s.status === 'Alumni' ? (
                        <span style={{ background: '#fef3c7', color: '#92400e', padding: '3px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
                          Alumni ({s.tahun_lulus || 'Lulus'})
                        </span>
                      ) : (
                        <span style={{ background: '#dcfce7', color: '#16a34a', padding: '3px 8px', borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
                          Aktif
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: 4 }}>
                        <button
                          className="btn-action-icon"
                          style={{ background: '#0284c7', color: '#ffffff', border: 'none', borderRadius: 6, padding: '5px 8px', cursor: 'pointer' }}
                          title="Lihat & Cetak E-Rapor Siswa"
                          onClick={() => {
                            window.location.hash = 'laporanRapor';
                          }}
                        >
                          <Award size={13} />
                        </button>
                        <button
                          className="btn-action-icon btn-edit"
                          onClick={() => handleOpenEdit(s)}
                          title="Edit Siswa"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          className="btn-action-icon btn-delete"
                          onClick={() => handleDelete(s)}
                          title="Hapus Siswa"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
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
          totalItems={filteredList.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-box" style={{ maxWidth: 580 }}>
            <div className="admin-modal-header">
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {isEditing ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="admin-modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  <div className="form-group-admin" style={{ gridColumn: 'span 2' }}>
                    <label>Nama Lengkap Siswa *</label>
                    <input
                      type="text"
                      className="form-control-admin"
                      required
                      placeholder="Contoh: Muhammad Rizky Pratama"
                      value={formData.nama_siswa}
                      onChange={(e) => setFormData({ ...formData, nama_siswa: e.target.value })}
                    />
                  </div>

                  <div className="form-group-admin">
                    <label>NIS / NISN</label>
                    <input
                      type="text"
                      className="form-control-admin"
                      placeholder="20241001..."
                      value={formData.nis_nisn}
                      onChange={(e) => setFormData({ ...formData, nis_nisn: e.target.value })}
                    />
                  </div>

                  <div className="form-group-admin">
                    <label>Jenis Kelamin</label>
                    <SearchableSelect
                      value={formData.jk}
                      onChange={(e) => setFormData({ ...formData, jk: e.target.value })}
                      options={[
                        { value: 'L', label: 'Laki-laki (L)' },
                        { value: 'P', label: 'Perempuan (P)' }
                      ]}
                    />
                  </div>

                  <div className="form-group-admin" style={{ gridColumn: 'span 2' }}>
                    <label>Pilih Kelas</label>
                    <SearchableSelect
                      placeholder="-- Pilih Kelas --"
                      value={formData.kode_kelas}
                      onChange={(e) => setFormData({ ...formData, kode_kelas: e.target.value })}
                      options={kelasList.map(k => ({
                        value: k.kode_kelas,
                        label: `${k.nama_kelas} ${k.jurusan && k.jurusan !== '-' ? `(${k.jurusan})` : ''}`
                      }))}
                    />
                  </div>

                  {/* DATA ORANG TUA / WALI */}
                  <div className="form-group-admin">
                    <label>Nama Orang Tua / Wali</label>
                    <input
                      type="text"
                      className="form-control-admin"
                      placeholder="Contoh: Bpk. Hendra Gunawan"
                      value={formData.nama_ortu}
                      onChange={(e) => setFormData({ ...formData, nama_ortu: e.target.value })}
                    />
                  </div>

                  <div className="form-group-admin">
                    <label>Hubungan Keluarga</label>
                    <select
                      className="form-control-admin"
                      value={formData.hubungan_wali}
                      onChange={(e) => setFormData({ ...formData, hubungan_wali: e.target.value })}
                    >
                      <option value="Ayah">Ayah</option>
                      <option value="Ibu">Ibu</option>
                      <option value="Wali">Wali Murid</option>
                    </select>
                  </div>

                  <div className="form-group-admin" style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Phone size={13} color="#16a34a" /> No. WhatsApp Orang Tua / Wali (Untuk Notifikasi Absen & Tata Tertib)
                    </label>
                    <input
                      type="text"
                      className="form-control-admin"
                      placeholder="Contoh: 081234567890 atau 6281234567890"
                      value={formData.no_wa_ortu}
                      onChange={(e) => setFormData({ ...formData, no_wa_ortu: e.target.value })}
                    />
                    <small style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                      Nomor ini akan otomatis menerima pesan WhatsApp jika siswa absen (Alpa/Sakit/Izin) atau melanggar aturan.
                    </small>
                  </div>

                  <div className="form-group-admin" style={{ gridColumn: 'span 2' }}>
                    <label>Status Siswa</label>
                    <SearchableSelect
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      options={[
                        { value: 'Aktif', label: 'Aktif' },
                        { value: 'Alumni', label: 'Alumni (Lulus)' }
                      ]}
                    />
                  </div>
                </div>
              </div>

              <div className="admin-modal-footer">
                <button type="button" className="btn-outline-admin" onClick={() => setShowModal(false)}>
                  Batal
                </button>
                <button type="submit" className="btn-primary-admin" disabled={submitting}>
                  {submitting ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Tambah Siswa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
