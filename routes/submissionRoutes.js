const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
const checkOtpVerified = require('../middlewares/checkOtpVerified')
router.post('/forms/:id/submit', submissionController.submitForm);
router.get('/submissions/:token', submissionController.getSubmissionByToken);

module.exports = router;