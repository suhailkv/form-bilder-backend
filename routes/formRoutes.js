const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController');
const jwtAuth = require('../middlewares/jwtAuth');

// Admin create
router.post('/', jwtAuth, formController.createForm);

// Edit
router.put('/:id', jwtAuth, formController.updateForm);

// Delete
router.delete('/:id', jwtAuth, formController.deleteForm);

// Public fetch (authenticated via externalBase64Auth endpoint which returns JWT on client)
router.get('/', jwtAuth, formController.listForms);
router.get('/:id', jwtAuth, formController.getForm);

// Get submissions (admin)
router.get('/:id/submissions', jwtAuth, formController.getSubmissions);

router.post("/:formId/publish",jwtAuth,formController.publish)
module.exports   = router;
