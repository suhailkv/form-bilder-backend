const { Submission, Form } = require('../models');
const multer = require('multer');
const configGlobal = require('../config/config');
const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');

// Setup uploader
const uploadsDir = configGlobal.uploadsDir;
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Multer storage to store files with timestamp
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const name = `${Date.now()}_${Math.random().toString(36).slice(2,8)}_${file.originalname}`;
    cb(null, name);
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit per file

// Handler factory to accept dynamic set of files
exports.submitForm = [
  // upload.any() will accept all files - in production you can restrict by fieldnames
  upload.any(),
  async (req, res) => {
    try {
      const formId = req.params.id;
      const form = await Form.findByPk(formId);
      if (!form) return res.status(404).json({ message: 'Form not found' });

      // validate body data - expecting JSON in req.body.data (or raw fields)
      // Many clients will send fields as JSON in body; attempt to parse
      let data = req.body.data;
      if (!data) {
        // If not provided as a json string, use req.body but exclude any multer fields
        data = { ...req.body };
      } else {
        try { data = JSON.parse(data); } catch (err) {}
      }

      // Build files map
      const filesMap = {};
      if (Array.isArray(req.files)) {
        for (const f of req.files) {
          // fieldname indicates which field in form JSON
          filesMap[f.fieldname] = f.filename;
        }
      }

      // Save submission
      const submission = await Submission.create({
        formId: form.id,
        userId: req.user ? req.user.id : null,
        data,
        files: filesMap,
        ip: req.ip
      });

      return res.json({ success: true, submissionId: submission.id, thankYouMessage: form.thankYouMessage || 'Thanks!' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Server error' });
    }
  }
];

exports.getMySubmissions = async (req, res) => {
  try {
    const userId = req.user.id;
    const subs = await Submission.findAll({ where: { userId }, order: [['createdAt','DESC']], limit: 200 });
    return res.json({ submissions: subs });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};
