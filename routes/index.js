const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const userRoutes = require('./users');
const formRoutes = require('./forms');
const fieldRoutes = require('./fields');
const submissionRoutes = require('./submissions');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/forms', formRoutes);
router.use('/forms', fieldRoutes); // fields nested under /forms/:formId/fields
router.use('/forms', submissionRoutes); // submissions nested under forms

module.exports = router;
