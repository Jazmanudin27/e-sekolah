const { query } = require('../config/database');

class KelasMapelModel {
  /**
   * Auto-create junction table if it doesn't exist
   */
  static async ensureTable() {
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS kelas_mapel (
          id INT AUTO_INCREMENT PRIMARY KEY,
          kelas_id INT NOT NULL,
          mapel_id INT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE KEY uq_kelas_mapel (kelas_id, mapel_id)
        )
      `);
    } catch (e) {
      // Table may already exist, ignore
    }
  }

  /**
   * Get all mapel IDs assigned to a specific kelas
   */
  static async getByKelas(kelasId) {
    await this.ensureTable();
    return await query(
      `SELECT km.mapel_id, m.nama_mapel, m.singkatan, m.kkm, m.kelompok
       FROM kelas_mapel km
       JOIN mapel m ON km.mapel_id = m.kode_mapel
       WHERE km.kelas_id = ?
       ORDER BY m.nama_mapel ASC`,
      [kelasId]
    );
  }

  /**
   * Sync mapel list for a kelas (delete old, insert new)
   * @param {number} kelasId
   * @param {number[]} mapelIds - array of mapel kode_mapel
   */
  static async syncKelas(kelasId, mapelIds) {
    await this.ensureTable();
    // Delete existing relations
    await query('DELETE FROM kelas_mapel WHERE kelas_id = ?', [kelasId]);

    if (!Array.isArray(mapelIds) || mapelIds.length === 0) return;

    // Batch insert
    const values = mapelIds.map(mid => `(${parseInt(kelasId)}, ${parseInt(mid)})`).join(', ');
    await query(`INSERT INTO kelas_mapel (kelas_id, mapel_id) VALUES ${values}`);
  }

  /**
   * Check if any mapel are assigned to a kelas
   */
  static async hasMapping(kelasId) {
    await this.ensureTable();
    const rows = await query(
      'SELECT COUNT(*) AS total FROM kelas_mapel WHERE kelas_id = ?',
      [kelasId]
    );
    return (rows[0]?.total || 0) > 0;
  }
}

module.exports = KelasMapelModel;
