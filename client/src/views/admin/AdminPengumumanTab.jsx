import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Megaphone, Check, X, Calendar, Image as ImageIcon, Eye } from 'lucide-react';
import api from '../../api/client';
import Swal from 'sweetalert2';

export default function AdminPengumumanTab() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    judul: '',
    kategori: 'Penting',
    isi: '',
    gambar_url: '',
    penulis: 'Administrator',
    target_role: 'Semua',
    is_active: 1
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/pengumuman/admin');
      if (res.data.success) {
        setList(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching announcements admin:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditId(null);
    setFormData({
      judul: '',
      kategori: 'Penting',
      isi: '',
      gambar_url: '',
      penulis: 'Administrator',
      target_role: 'Semua',
      is_active: 1
    });
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditId(item.id);
    setFormData({
      judul: item.judul,
      kategori: item.kategori || 'Penting',
      isi: item.isi,
      gambar_url: item.gambar_url || '',
      penulis: item.penulis || 'Administrator',
      target_role: item.target_role || 'Semua',
      is_active: item.is_active
    });
    setShowModal(true);
  };

  const handleDelete = (id, judul) => {
    Swal.fire({
      title: 'Hapus Pengumuman?',
      text: `Apakah Anda yakin ingin menghapus "${judul}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    }).then(async (res) => {
      if (res.isConfirmed) {
        try {
          await api.delete(`/pengumuman/${id}`);
          Swal.fire('Berhasil!', 'Pengumuman telah dihapus.', 'success');
          fetchData();
        } catch (err) {
          Swal.fire('Gagal!', 'Terjadi kesalahan saat menghapus.', 'error');
        }
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.judul || !formData.isi) {
      Swal.fire('Perhatian', 'Judul dan isi pengumuman wajib diisi.', 'warning');
      return;
    }

    try {
      if (editId) {
        await api.put(`/pengumuman/${editId}`, formData);
        Swal.fire('Berhasil!', 'Pengumuman berhasil diperbarui.', 'success');
      } else {
        await api.post('/pengumuman', formData);
        Swal.fire('Berhasil!', 'Pengumuman baru berhasil diterbitkan.', 'success');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      Swal.fire('Gagal!', err.response?.data?.message || 'Gagal menyimpan pengumuman.', 'error');
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      {/* HEADER TITLE */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: 0 }}>
            📢 Manajemen Pengumuman Sekolah
          </h2>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0 0' }}>
            Buat, edit, dan terbitkan pengumuman interaktif yang akan muncul di aplikasi mobile guru & kelas.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          style={{
            background: 'linear-gradient(135deg, #0066ff, #0052cc)',
            color: '#fff',
            border: 'none',
            padding: '10px 18px',
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 13.5,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 4px 14px rgba(0, 102, 255, 0.35)'
          }}
        >
          <Plus size={18} />
          <span>Tambah Pengumuman Baru</span>
        </button>
      </div>

      {/* TABLE DATA PENGUMUMAN */}
      <div style={{ background: '#ffffff', borderRadius: 16, border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontWeight: 700 }}>
              <th style={{ padding: '14px 16px' }}>Pengumuman</th>
              <th style={{ padding: '14px 16px' }}>Kategori</th>
              <th style={{ padding: '14px 16px' }}>Penulis</th>
              <th style={{ padding: '14px 16px' }}>Target</th>
              <th style={{ padding: '14px 16px' }}>Status</th>
              <th style={{ padding: '14px 16px', textAlign: 'center' }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: 30, textAlign: 'center', color: '#64748b' }}>
                  Memuat data pengumuman...
                </td>
              </tr>
            ) : list.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: 30, textAlign: 'center', color: '#64748b' }}>
                  Belum ada pengumuman yang diterbitkan. Klik tombol di atas untuk membuat pengumuman pertama.
                </td>
              </tr>
            ) : (
              list.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 16px', maxWidth: 320 }}>
                    <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 2 }}>{item.judul}</div>
                    <div style={{ fontSize: 11.5, color: '#64748b', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.isi}
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      background: item.kategori === 'Penting' ? '#fef2f2' : item.kategori === 'Kegiatan' ? '#e0f2fe' : '#ecfdf5',
                      color: item.kategori === 'Penting' ? '#dc2626' : item.kategori === 'Kegiatan' ? '#0284c7' : '#059669',
                      padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 800
                    }}>
                      {item.kategori}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', color: '#475569' }}>{item.penulis || 'Admin'}</td>
                  <td style={{ padding: '14px 16px', color: '#475569' }}>{item.target_role || 'Semua'}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{
                      background: item.is_active ? '#dcfce7' : '#f1f5f9',
                      color: item.is_active ? '#166534' : '#64748b',
                      padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700
                    }}>
                      {item.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <button
                        onClick={() => handleOpenEdit(item)}
                        style={{ background: '#eff6ff', color: '#0066ff', border: 'none', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        title="Edit Pengumuman"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.judul)}
                        style={{ background: '#fef2f2', color: '#ef4444', border: 'none', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                        title="Hapus Pengumuman"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* FORM MODAL ADD / EDIT */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ width: '100%', maxWidth: 580, background: '#ffffff', borderRadius: 20, boxShadow: '0 20px 40px rgba(0,0,0,0.2)', padding: 24, position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {editId ? 'Edit Pengumuman' : 'Tambah Pengumuman Baru'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={16} color="#64748b" />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                  JUDUL PENGUMUMAN *
                </label>
                <input
                  type="text"
                  value={formData.judul}
                  onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                  placeholder="Contoh: Jadwal Ujian Tengah Semester (UTS)"
                  required
                  style={{ width: '100%', height: 42, padding: '0 12px', borderRadius: 10, border: '1px solid #cbd5e1', outline: 'none', fontSize: 13 }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                    KATEGORI
                  </label>
                  <select
                    value={formData.kategori}
                    onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                    style={{ width: '100%', height: 42, padding: '0 12px', borderRadius: 10, border: '1px solid #cbd5e1', outline: 'none', fontSize: 13, background: '#fff' }}
                  >
                    <option value="Penting">🔥 Penting</option>
                    <option value="Kegiatan">📅 Kegiatan</option>
                    <option value="Libur">🎉 Libur</option>
                    <option value="Umum">📢 Umum</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                    PENULIS / PENGIRIM
                  </label>
                  <input
                    type="text"
                    value={formData.penulis}
                    onChange={(e) => setFormData({ ...formData, penulis: e.target.value })}
                    placeholder="Kepala Sekolah / Tim IT"
                    style={{ width: '100%', height: 42, padding: '0 12px', borderRadius: 10, border: '1px solid #cbd5e1', outline: 'none', fontSize: 13 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                  URL GAMBAR BANNER (OPSIONAL)
                </label>
                <input
                  type="text"
                  value={formData.gambar_url}
                  onChange={(e) => setFormData({ ...formData, gambar_url: e.target.value })}
                  placeholder="https://domain.com/gambar.jpg"
                  style={{ width: '100%', height: 42, padding: '0 12px', borderRadius: 10, border: '1px solid #cbd5e1', outline: 'none', fontSize: 13 }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 6 }}>
                  ISI PENGUMUMAN LENGKAP *
                </label>
                <textarea
                  value={formData.isi}
                  onChange={(e) => setFormData({ ...formData, isi: e.target.value })}
                  placeholder="Tuliskan isi pengumuman secara rinci di sini..."
                  rows={4}
                  required
                  style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #cbd5e1', outline: 'none', fontSize: 13, resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ background: '#f1f5f9', color: '#475569', border: 'none', padding: '10px 18px', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  style={{ background: '#0066ff', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
                >
                  {editId ? 'Simpan Perubahan' : 'Terbitkan Pengumuman'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
