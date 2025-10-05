module.exports = (req, res, next) => {
  req.submissionInfo = {
    userIP: getClientIP(req),
    userAgent: req.get('User-Agent') || null,
    referrer: req.get('Referrer') || req.get('Referer') || null
  };
  next();
};

// Helper function to get client IP
function getClientIP(req) {
  return (
    req.headers['x-forwarded-for']?.split(',').shift() || // If behind proxy
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.connection?.socket?.remoteAddress ||
    null
  );
}
