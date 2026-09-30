const { query } = require('../config/database');

class SekolahModel {
  static async ensureColumns() {
    try {
      const cols = await query('DESCRIBE member');
      const colNames = cols.map(c => c.Field);
      if (!colNames.includes('kepala_sekolah')) await query("ALTER TABLE member ADD COLUMN kepala_sekolah VARCHAR(150) DEFAULT NULL");
      if (!colNames.includes('jam_masuk')) await query("ALTER TABLE member ADD COLUMN jam_masuk VARCHAR(10) DEFAULT '07:00'");
      if (!colNames.includes('toleransi_telat')) await query("ALTER TABLE member ADD COLUMN toleransi_telat INT DEFAULT 15");
      if (!colNames.includes('jam_pulang')) await query("ALTER TABLE member ADD COLUMN jam_pulang VARCHAR(10) DEFAULT '15:30'");
      if (!colNames.includes('radius_gps')) await query("ALTER TABLE member ADD COLUMN radius_gps INT DEFAULT 100");
      if (!colNames.includes('mode_presensi_guru')) await query("ALTER TABLE member ADD COLUMN mode_presensi_guru VARCHAR(30) DEFAULT 'gps_kamera'");
      if (!colNames.includes('lat_sekolah')) await query("ALTER TABLE member ADD COLUMN lat_sekolah VARCHAR(50) DEFAULT '-7.325205'");
      if (!colNames.includes('lng_sekolah')) await query("ALTER TABLE member ADD COLUMN lng_sekolah VARCHAR(50) DEFAULT '108.208354'");
    } catch (err) {
      console.warn('[SekolahModel.ensureColumns] Warning:', err.message);
    }
  }

  static async get(kode_member) {
    await this.ensureColumns();
    try {
      let sql = 'SELECT * FROM member';
      const params = [];
      if (kode_member) {
        sql += ' WHERE kode_member = ?';
        params.push(kode_member);
      }
      sql += ' ORDER BY kode_member ASC LIMIT 1';

      const rows = await query(sql, params);
      if (rows && rows.length > 0) {
        const m = rows[0];
        return {
          kode_sekolah: m.kode_member,
          kode_member: m.kode_member,
          nama_sekolah: m.nama_member || 'SMK ARTANITA TASIKMALAYA',
          npsn: m.npsn || '',
          alamat: m.alamat || '',
          desa: m.desa || '',
          kecamatan: m.kecamatan || '',
          kota: m.kota || '',
          no_hp: m.no_hp || '',
          email: m.email || '',
          kepala_sekolah: m.kepala_sekolah || 'Kepala Sekolah',
          jam_masuk: m.jam_masuk || '07:00',
          toleransi_telat: m.toleransi_telat !== undefined ? m.toleransi_telat : 15,
          jam_pulang: m.jam_pulang || '15:30',
          radius_gps: m.radius_gps !== undefined ? parseInt(m.radius_gps, 10) : 100,
          mode_presensi_guru: m.mode_presensi_guru || 'gps_kamera',
          lat_sekolah: m.lat_sekolah || '-7.325205',
          lng_sekolah: m.lng_sekolah || '108.208354'
        };
      }
      return {
        nama_sekolah: 'SMK ARTANITA TASIKMALAYA',
        npsn: '20279876',
        alamat: 'Jl. Cienteung No. 112 A, Kota Tasikmalaya',
        kepala_sekolah: 'Ali Irsan Shafar, SH.M.Pd',
        jam_masuk: '07:00',
        toleransi_telat: 15,
        jam_pulang: '15:30',
        radius_gps: 100,
        mode_presensi_guru: 'gps_kamera',
        lat_sekolah: '-7.325205',
        lng_sekolah: '108.208354'
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
        jam_pulang: '15:30',
        radius_gps: 100,
        mode_presensi_guru: 'gps_kamera',
        lat_sekolah: '-7.325205',
        lng_sekolah: '108.208354'
      };
    }
  }

  static async update(data, targetKodeMember) {
    await this.ensureColumns();
    try {
      const existing = await this.get(targetKodeMember);
      const km = targetKodeMember || existing.kode_member;

      if (km) {
        const fields = [];
        const params = [];
        if (data.nama_sekolah !== undefined) { fields.push('nama_member = ?'); params.push(data.nama_sekolah); }
        if (data.nama_member !== undefined) { fields.push('nama_member = ?'); params.push(data.nama_member); }
        if (data.npsn !== undefined) { fields.push('npsn = ?'); params.push(data.npsn); }
        if (data.alamat !== undefined) { fields.push('alamat = ?'); params.push(data.alamat); }
        if (data.kepala_sekolah !== undefined) { fields.push('kepala_sekolah = ?'); params.push(data.kepala_sekolah); }
        if (data.jam_masuk !== undefined) { fields.push('jam_masuk = ?'); params.push(data.jam_masuk); }
        if (data.toleransi_telat !== undefined) { fields.push('toleransi_telat = ?'); params.push(data.toleransi_telat); }
        if (data.jam_pulang !== undefined) { fields.push('jam_pulang = ?'); params.push(data.jam_pulang); }
        if (data.radius_gps !== undefined) { fields.push('radius_gps = ?'); params.push(data.radius_gps); }
        if (data.mode_presensi_guru !== undefined) { fields.push('mode_presensi_guru = ?'); params.push(data.mode_presensi_guru); }
        if (data.lat_sekolah !== undefined) { fields.push('lat_sekolah = ?'); params.push(data.lat_sekolah); }
        if (data.lng_sekolah !== undefined) { fields.push('lng_sekolah = ?'); params.push(data.lng_sekolah); }

        if (fields.length > 0) {
          params.push(km);
          await query(`UPDATE member SET ${fields.join(', ')} WHERE kode_member = ?`, params);
        }
      }
      return await this.get(km);
    } catch (e) {
      console.error('[SekolahModel.update] Error:', e.message);
      throw e;
    }
  }
}

module.exports = SekolahModel;
