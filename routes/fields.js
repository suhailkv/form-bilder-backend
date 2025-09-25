const express = require('express');
const router = express.Router();
const fieldController = require('../controllers/fieldController');
const validate = require('../middlewares/validateRequest');
const validation = require('../services/validationService');
const { authenticate, requireAuth } = require('../middlewares/auth');

router.use(authenticate);

// Create field under a form
router.post('/:formId/fields', requireAuth, validate(validation.fieldSchema), fieldController.addField);

// list fields
router.get('/:formId/fields', requireAuth, fieldController.listFields);

// update and delete field by id
router.put('/fields/:fieldId', requireAuth, validate(validation.fieldSchema), fieldController.updateField);
router.delete('/fields/:fieldId', requireAuth, fieldController.deleteField);

module.exports = router;
