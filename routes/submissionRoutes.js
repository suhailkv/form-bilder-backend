const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');

router.post('/forms/:id/submit', submissionController.submitForm);
router.get('/submissions/:encodedToken', submissionController.getSubmissionByToken);

module.exports = router;