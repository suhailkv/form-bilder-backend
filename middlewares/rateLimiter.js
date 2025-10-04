// src/middleware/rateLimiter.js
const rateLimit = require('express-rate-limit');

/**
 * Rate limiter for upload endpoint.
 * Max 10 requests per minute per IP.
 */
const uploadRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many upload requests. Please try again later.' },
});

module.exports = uploadRateLimiter;
