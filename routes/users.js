const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, requireAuth, requireRole } = require('../middlewares/auth');

router.use(authenticate);
router.get('/', requireAuth, requireRole('admin'), userController.listUsers);

module.exports = router;
