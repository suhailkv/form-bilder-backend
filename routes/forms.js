const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController');
const validate = require('../middlewares/validateRequest');
const validation = require('../services/validationService');
const { authenticate, requireAuth } = require('../middlewares/auth');

// router.use(authenticate);

// list forms (must be authenticated)
router.get('/', formController.listForms);

// create form
router.post('/', validate(validation.formCreateSchema), formController.createForm);

// get single form (any authenticated user can view form if it's theirs or admin)
router.get('/:formId', formController.getForm);

// update / delete
router.put('/:formId', requireAuth, validate(validation.formCreateSchema), formController.updateForm);
router.delete('/:formId', requireAuth, formController.deleteForm);

module.exports = router;
