require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const routes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middleware/error.middleware');

const app = express();
const PORT = process.env.PORT || 5007;

// Security & Cross-Origin Resource Sharing
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve Mobile & Web Desktop App static assets
app.use(express.static(path.join(__dirname, '../public')));

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

// Start Application Server
app.listen(PORT, () => {
  console.log(`=================================================`);
  console.log(`🚀 E-Sekolah REST API Server running on port ${PORT}`);
  console.log(`📱 Mobile Presensi App running at http://localhost:${PORT}`);
  console.log(`=================================================`);
});
