const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const jwtAuth = require('../middlewares/jwtAuth');

// Submit to form (authenticated)
router.post('/:id/submit', jwtAuth, submissionController.submitForm);

// Get own submissions
router.get('/me', jwtAuth, submissionController.getMySubmissions);

module.exports = router;
