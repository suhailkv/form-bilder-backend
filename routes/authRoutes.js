const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const externalBase64Auth = require('../middlewares/externalBase64Auth');

// Local login
router.post('/login', authController.login);

// External Base64 auth
router.post('/external', externalBase64Auth);

module.exports = router;
