const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const guruRoutes = require('./guru.routes');
const kelasRoutes = require('./kelas.routes');
const mapelRoutes = require('./mapel.routes');
const jadwalRoutes = require('./jadwal.routes');
const presensiRoutes = require('./presensi.routes');
const absensiSiswaRoutes = require('./absensiSiswa.routes');
const absensiMapelRoutes = require('./absensiMapel.routes');
const dashboardRoutes = require('./dashboard.routes');
const siswaRoutes = require('./siswa.routes');

// System Health Check
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'E-Sekolah REST API',
    port: process.env.PORT || 5007,
    timestamp: new Date().toISOString()
  });
});

// Module Routes
router.use('/auth', authRoutes);
router.use('/guru', guruRoutes);
router.use('/kelas', kelasRoutes);
router.use('/mapel', mapelRoutes);
router.use('/jadwal', jadwalRoutes);
router.use('/presensi', presensiRoutes);
router.use('/absensi-siswa', absensiSiswaRoutes);
router.use('/absensi-mapel', absensiMapelRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/siswa', siswaRoutes);

module.exports = router;
