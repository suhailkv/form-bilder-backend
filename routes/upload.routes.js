const express = require('express');
const router = express.Router();

const uploadRateLimiter = require('../middlewares/rateLimiter');
const { uploadTempHandler } = require('../middlewares/uploadTemp');

// Apply rate limiter to the upload route
router.post('/upload', uploadRateLimiter, uploadTempHandler);

module.exports = router;
