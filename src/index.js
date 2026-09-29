require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/auth.routes');
const guruRoutes = require('./routes/guru.routes');
const kelasRoutes = require('./routes/kelas.routes');
const mapelRoutes = require('./routes/mapel.routes');
const jadwalRoutes = require('./routes/jadwal.routes');
const presensiRoutes = require('./routes/presensi.routes');
const absensiSiswaRoutes = require('./routes/absensiSiswa.routes');
const absensiMapelRoutes = require('./routes/absensiMapel.routes');
const dashboardRoutes = require('./routes/dashboard.routes');

const app = express();
const PORT = process.env.PORT || 5007;

// Lightweight Security & CORS setup for both Mobile (Android) and Web Desktop
app.use(helmet());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'E-Sekolah Unified REST API',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/guru', guruRoutes);
app.use('/api/kelas', kelasRoutes);
app.use('/api/mapel', mapelRoutes);
app.use('/api/jadwal', jadwalRoutes);
app.use('/api/presensi', presensiRoutes);
app.use('/api/absensi-siswa', absensiSiswaRoutes);
app.use('/api/absensi-mapel', absensiMapelRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error Handling Middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 E-Sekolah REST API Server running on port ${PORT}`);
  console.log(`📱 Ready for Android & 💻 Web Desktop Clients`);
  console.log(`=================================================`);
});
