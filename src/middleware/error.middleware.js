const { sendError } = require('../utils/response.util');

function notFoundHandler(req, res, next) {
  sendError(res, `Endpoint ${req.originalUrl} tidak ditemukan.`, 404);
}

function errorHandler(err, req, res, next) {
  console.error('[E-Sekolah Server Error]', err);
  const status = err.status || 500;
  const message = err.message || 'Terjadi kesalahan pada server internal.';

  sendError(res, message, status, process.env.NODE_ENV === 'development' ? { stack: err.stack } : null);
}

module.exports = {
  notFoundHandler,
  errorHandler
};
