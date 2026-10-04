require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const routes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middleware/error.middleware');

const { tenantStorage } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 5007;

// Security & Cross-Origin Resource Sharing
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Multi-Tenant Domain Middleware
app.use((req, res, next) => {
  let host = (req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].split(':')[0].toLowerCase().trim();
  if (!host || host === 'localhost' || host === '127.0.0.1') {
    const ref = req.headers.origin || req.headers.referer || '';
    if (ref) {
      try {
        const u = new URL(ref);
        host = u.hostname.toLowerCase();
      } catch (e) {}
    }
  }
  tenantStorage.run(host, () => {
    next();
  });
});

// Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve Mobile & Web Desktop App static assets
app.use(express.static(path.join(__dirname, '../public')));

// Disable caching for API endpoints
app.use('/api', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Mount Unified API Routes
app.use('/api', routes);

// Serve index.html for non-API routes (SPA support)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 404 & Global Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

const SekolahModel = require('./models/sekolah.model');
const SiswaModel = require('./models/siswa.model');
const PelanggaranModel = require('./models/pelanggaran.model');
const PenilaianModel = require('./models/penilaian.model');
const PerpustakaanModel = require('./models/perpustakaan.model');
const SaprasModel = require('./models/sapras.model');
const UserModel = require('./models/user.model');
const TarifPembayaranModel = require('./models/tarifPembayaran.model');

// Start Application Server
app.listen(PORT, async () => {
  console.log(`=================================================`);
  console.log(`🚀 E-Sekolah REST API Server running on port ${PORT}`);
  console.log(`📱 Mobile Presensi App running at http://localhost:${PORT}`);
  console.log(`=================================================`);
  
  try {
    await SekolahModel.ensureColumns();
    await SiswaModel.ensureColumns();
    await PelanggaranModel.ensureTables();
    await TarifPembayaranModel.ensureColumns();
    await PenilaianModel.ensureTables();
    await PerpustakaanModel.ensureTables();
    await SaprasModel.ensureTables();
    await UserModel.ensureDefaultUsers();
    console.log('[ServerInit] Verified & initialized Siswa, Pelanggaran, Perpustakaan, Sapras, TarifPembayaran tables & admin accounts successfully.');
  } catch (err) {
    console.warn('[ServerInit] Initialization warning:', err.message);
  }
});
