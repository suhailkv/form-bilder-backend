// const express = require('express');
// const router = express.Router();
// const submissionController = require('../controllers/submissionController');
// const jwtAuth = require('../middlewares/jwtAuth');

// // Submit to form (authenticated)
// router.post('/:id/submit', jwtAuth, submissionController.submitForm);

// // Get own submissions
// router.get('/me', jwtAuth, submissionController.getMySubmissions);

// module.exports = router;

// routes/submissionRoutes.js
const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');
// const { authMiddleware } = require('../middleware/authMiddleware'); // Optional: if you have auth

/**
 * Public routes
 */

// Submit a form (public endpoint)
router.post('/forms/:id/submit', submissionController.submitForm);

// Verify email submission
// router.get('/submissions/verify/:token', submissionController.verifySubmission);

// Get submission by token (for user to view their own submission)
router.get('/submissions/:encodedToken', submissionController.getSubmissionByToken);

/**
 * Protected routes (require authentication)
 * Uncomment if you have authentication middleware
 */

// Get user's submissions
// router.get('/submissions/my', authMiddleware, submissionController.getMySubmissions);

// Or use without auth and rely on email query parameter
// router.get('/submissions/my', submissionController.getMySubmissions);

module.exports = router;