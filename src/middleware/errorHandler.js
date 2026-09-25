function errorHandler(err, req, res, next) {
  console.error('[Error Handler]', err);
  const status = err.status || 500;
  const message = err.message || 'Terjadi kesalahan pada server internal.';

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

module.exports = errorHandler;
