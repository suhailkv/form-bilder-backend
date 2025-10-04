// src/middleware/uploadTemp.js
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const util = require('util');

const mkdir = util.promisify(fs.mkdir);
const stat = util.promisify(fs.stat);
const unlink = util.promisify(fs.unlink);

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads', 'temp');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_TOTAL_SIZE = 20 * 1024 * 1024; // 20 MB

// Allowed extensions and MIME types
const allowedExts = new Set(['.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx']);
const allowedMimes = new Set([
  'image/jpeg',
  'image/png',
  'application/pdf',
  // doc and docx MIME types
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]);

/**
 * Ensure upload directory exists (recursive).
 */
async function ensureUploadDir() {
  try {
    await stat(UPLOAD_DIR);
    // exists
  } catch (err) {
    if (err.code === 'ENOENT') {
      await mkdir(UPLOAD_DIR, { recursive: true });
    } else {
      throw err;
    }
  }
}

/**
 * Multer storage: files written to UPLOAD_DIR with UUID filename + original extension.
 * Uses path.extname of original name to preserve extension (sanitized).
 */
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await ensureUploadDir();
      cb(null, UPLOAD_DIR);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    // Ensure extension is taken only from originalName and sanitized
    const ext = path.extname(file.originalname || '').toLowerCase();
    // default to empty ext if none
    const safeExt = allowedExts.has(ext) ? ext : '';
    const filename = uuidv4() + safeExt;
    cb(null, filename);
  },
});

/**
 * Validate files by MIME type and extension.
 * Rejects empty files (size 0).
 */
function fileFilter(req, file, cb) {
  const originalName = file.originalname || '';
  const ext = path.extname(originalName).toLowerCase();
  const mime = (file.mimetype || '').toLowerCase();

  // Basic checks
  if (!ext || !allowedExts.has(ext)) {
    return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Invalid file extension'), false);
  }
  if (!allowedMimes.has(mime)) {
    return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Invalid MIME type'), false);
  }

  cb(null, true);
}

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE, // per-file
    // Note: no direct total size limit here — we'll enforce total after files saved
  },
  fileFilter,
});

/**
 * Express middleware that wraps multer.any(), then validates total size and responds with standardized JSON.
 * On failure it deletes any saved files from this request.
 */
async function uploadTempHandler(req, res, next) {
  const multerMiddleware = upload.any();

  multerMiddleware(req, res, async function (err) {
    if (err) {
      // Let multer errors be handled by error middleware (specialized)
      return next(err);
    }

    const files = req.files || [];

    // If no files provided -> reject
    if (files.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid file type or size' });
    }

    // Ensure none of the files are zero-size and re-check extension + mime consistency (defense in depth)
    let totalSize = 0;
    for (const f of files) {
      if (!f.size || f.size <= 0) {
        // delete saved files and error
        await Promise.all(files.map(ff => safeUnlink(ff.path)));
        return res.status(400).json({ success: false, message: 'Invalid file type or size' });
      }
      totalSize += f.size;

      const ext = path.extname(f.originalname || '').toLowerCase();
      const storedExt = path.extname(f.filename || '').toLowerCase();
      if (!allowedExts.has(ext) || !allowedMimes.has((f.mimetype || '').toLowerCase()) || !allowedExts.has(storedExt)) {
        await Promise.all(files.map(ff => safeUnlink(ff.path)));
        return res.status(400).json({ success: false, message: 'Invalid file type or size' });
      }

      // Prevent directory traversal: ensure file is in UPLOAD_DIR and filename is basename
      const base = path.basename(f.filename);
      if (base !== f.filename) {
        await Promise.all(files.map(ff => safeUnlink(ff.path)));
        return res.status(400).json({ success: false, message: 'Invalid file name' });
      }
    }

    if (totalSize > MAX_TOTAL_SIZE) {
      // delete saved files and respond
      await Promise.all(files.map(ff => safeUnlink(ff.path)));
      return res.status(413).json({ success: false, message: 'Total upload size exceeded' });
    }

    // Build response objects
    const responseFiles = files.map(f => ({
      originalName: f.originalname,
      storedName: f.filename,
    //   path: `/uploads/temp/${f.filename}`,
      mimeType: f.mimetype,
      size: f.size,
    }));

    return res.json({ success: true, files: responseFiles });
  });
}

/**
 * Safely unlink file (ignore ENOENT).
 */
async function safeUnlink(filePath) {
  try {
    await unlink(filePath);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      // log but don't throw
      console.error('Failed to delete file during cleanup:', filePath, err);
    }
  }
}

module.exports = {
  uploadTempHandler,
  UPLOAD_DIR,
  safeUnlink,
  // exports for tests / reuse
};
