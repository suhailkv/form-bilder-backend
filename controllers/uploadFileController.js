const path = require('path');
const fs = require('fs');
const multer = require('multer');

// Setup upload destination
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

exports.uploadFile = [
  upload.single('file'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      // Return filename (not the full path for security)
      res.json({
        success: true,
        fileName: `uploads/${req.file.filename}`,
      });
    } catch (err) {
      console.error('Upload error:', err);
      res.status(500).json({ success: false, message: 'File upload failed' });
    }
  }
];
