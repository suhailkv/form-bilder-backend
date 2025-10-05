const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController');
const tokenAuth = require('../middlewares/tokenAuth');

router.post('/', tokenAuth, formController.createForm);
router.post("/:formId/publish",tokenAuth,formController.publish)

router.put('/:id', tokenAuth, formController.updateForm);

router.delete('/:id', tokenAuth, formController.deleteForm);

router.get('/', tokenAuth, formController.listForms);
router.get('/:id', tokenAuth, formController.getForm);
router.get('/:id/submissions', tokenAuth, formController.getSubmissions);

module.exports   = router;
