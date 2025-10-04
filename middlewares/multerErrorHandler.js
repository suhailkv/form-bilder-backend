// src/middleware/multerErrorHandler.js
const multer = require('multer');

/**
 * Error-handling middleware specifically for multer and upload errors.
 * Must be added after route handlers.
 */
function multerErrorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    // Map common multer error codes to message
    let message = 'Invalid file type or size';
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'Invalid file type or size'; // keep generic per spec
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Invalid file type or size';
        break;
      default:
        message = 'Invalid file type or size';
    }
    return res.status(400).json({ success: false, message });
  }

  // If it's an HTTP or other known error, keep generic response for upload issues
  if (err && (err.code === 'ENOENT' || err.message && err.message.includes('Invalid'))) {
    return res.status(400).json({ success: false, message: 'Invalid file type or size' });
  }

  // Unhandled errors: pass to next error handler (or respond)
  console.error('Unexpected upload error:', err);
  return res.status(500).json({ success: false, message: 'Internal server error' });
}

module.exports = multerErrorHandler;
