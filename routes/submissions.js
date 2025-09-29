const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const validate = require('../middlewares/validateRequest');
const validation = require('../services/validationService');
const { authenticate, requireAuth } = require('../middlewares/auth');

router.use(authenticate);

// Submit to a form (public allowed) — we allow both authenticated and unauthenticated
router.post('/:formId/submissions', validate(validation.submissionSchema), submissionController.submitForm);

// List submissions (owner/admin)
router.get('/:formId/submissions', submissionController.listSubmissions);

// Export submissions
router.get('/:formId/submissions/export', submissionController.exportSubmissions);

module.exports = router;
