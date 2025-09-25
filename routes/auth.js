const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const validate = require('../middlewares/validateRequest');
const validation = require('../services/validationService');

router.post('/register', validate(validation.registerSchema), authController.register);
router.post('/login', validate(validation.loginSchema), authController.login);

module.exports = router;
