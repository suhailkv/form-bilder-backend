module.exports = (err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  const payload = {
    error: message
  };
  if (process.env.NODE_ENV === 'development' && err.stack) payload.stack = err.stack;
  res.status(status).json(payload);
};
