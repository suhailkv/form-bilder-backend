const { Form, Field } = require('../models');
const formService = require('../services/formService');
const { validationResult } = require('express-validator');

exports.createForm = async (req, res) => {
  try {
    // Admins only check
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });

    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const payload = req.body;
    const form = await formService.createForm(payload, req.user.id);
    return res.status(201).json({ form });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.updateForm = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const id = req.params.id;
    const form = await Form.findByPk(id);
    if (!form) return res.status(404).json({ message: 'Form not found' });

    const payload = req.body;
    form.title = payload.title || form.title;
    form.description = payload.description || form.description;
    form.json = payload;
    form.thankYouMessage = payload.thankYouMessage || form.thankYouMessage;
    form.bannerImage = payload.bannerImage || form.bannerImage;
    await form.save();

    // Replace fields table entries
    await Field.destroy({ where: { formId: form.id }});
    if (Array.isArray(payload.fields)) {
      for (const f of payload.fields) {
        await Field.create({ formId: form.id, fieldId: f.id, definition: f });
      }
    }

    return res.json({ form });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteForm = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
    const id = req.params.id;
    const form = await Form.findByPk(id);
    if (!form) return res.status(404).json({ message: 'Form not found' });
    await Field.destroy({ where: { formId: id }});
    await form.destroy();
    return res.json({ message: 'Deleted' });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.getForm = async (req, res) => {
  try {
    const id = req.params.id;
    const form = await Form.findByPk(id);
    if (!form) return res.status(404).json({ message: 'Form not found' });
    // Serve JSON schema directly:
    return res.json({ form: form.json });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.listForms = async (req, res) => {
  try {
    const forms = await Form.findAll({ attributes: ['id','title','description','thankYouMessage','bannerImage','createdAt'] });
    return res.json({ forms });
  } catch (err) {
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.getSubmissions = async (req, res) => {
  try {
    const formId = req.params.id;
    const rows = await formService.fetchSubmissionsRaw(formId, 100, 0);
    return res.json({ submissions: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }
};
