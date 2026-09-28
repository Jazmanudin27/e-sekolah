const { query } = require('../config/database');

class SekolahModel {
  static async get() {
    try {
      const rows = await query('SELECT * FROM sekolah LIMIT 1');
      if (rows && rows.length > 0) {
        return rows[0];
      }
      return {
        nama_sekolah: 'SMK ARTANITA TASIKMALAYA',
        npsn: '20279876',
        alamat: 'Jl. Cienteung No. 112 A, Kota Tasikmalaya',
        kepala_sekolah: 'Ali Irsan Shafar, SH.M.Pd',
        jam_masuk: '07:00',
        toleransi_telat: 15,
        jam_pulang: '15:30'
      };
    } catch (e) {
      console.warn('[SekolahModel.get] Error:', e.message);
      return {
        nama_sekolah: 'SMK ARTANITA TASIKMALAYA',
        npsn: '20279876',
        alamat: 'Jl. Cienteung No. 112 A, Kota Tasikmalaya',
        kepala_sekolah: 'Ali Irsan Shafar, SH.M.Pd',
        jam_masuk: '07:00',
        toleransi_telat: 15,
        jam_pulang: '15:30'
      };
    }
  }

  static async update(data) {
    try {
      const existing = await this.get();
      if (existing && existing.kode_sekolah) {
        const fields = [];
        const params = [];
        if (data.nama_sekolah !== undefined) { fields.push('nama_sekolah = ?'); params.push(data.nama_sekolah); }
        if (data.npsn !== undefined) { fields.push('npsn = ?'); params.push(data.npsn); }
        if (data.alamat !== undefined) { fields.push('alamat = ?'); params.push(data.alamat); }
        if (data.kepala_sekolah !== undefined) { fields.push('kepala_sekolah = ?'); params.push(data.kepala_sekolah); }
        if (data.jam_masuk !== undefined) { fields.push('jam_masuk = ?'); params.push(data.jam_masuk); }
        if (data.toleransi_telat !== undefined) { fields.push('toleransi_telat = ?'); params.push(data.toleransi_telat); }
        if (data.jam_pulang !== undefined) { fields.push('jam_pulang = ?'); params.push(data.jam_pulang); }

        if (fields.length > 0) {
          fields.push('updated_at = NOW()');
          params.push(existing.kode_sekolah);
          await query(`UPDATE sekolah SET ${fields.join(', ')} WHERE kode_sekolah = ?`, params);
        }
      } else {
        await query(
          `INSERT INTO sekolah (nama_sekolah, npsn, alamat, kepala_sekolah, jam_masuk, toleransi_telat, jam_pulang) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            data.nama_sekolah || 'SMK ARTANITA TASIKMALAYA',
            data.npsn || '20279876',
            data.alamat || 'Jl. Cienteung No. 112 A',
            data.kepala_sekolah || 'Ali Irsan Shafar, SH.M.Pd',
            data.jam_masuk || '07:00',
            data.toleransi_telat || 15,
            data.jam_pulang || '15:30'
          ]
        );
      }
      return await this.get();
    } catch (e) {
      console.error('[SekolahModel.update] Error:', e.message);
      throw e;
    }
  }
}

module.exports = SekolahModel;
