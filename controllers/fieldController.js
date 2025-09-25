const { Field, Form } = require('../models');
const validation = require('../services/validationService');

/**
 * Add field to a form — only form owner or admin
 */
async function addField(req, res, next) {
  try {
    const formId = parseInt(req.params.formId, 10);
    const form = await Form.findByPk(formId);
    if (!form) return res.status(404).json({ error: 'Form not found' });
    if (form.created_by !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

    const payload = req.body;
    payload.form_id = formId;
    // ensure unique key per form
    const exists = await Field.findOne({ where: { form_id: formId, key: payload.key } });
    if (exists) return res.status(409).json({ error: 'Field key must be unique within the form' });

    const field = await Field.create(payload);
    res.status(201).json({ data: field });
  } catch (err) {
    next(err);
  }
}

/**
 * Update field
 */
async function updateField(req, res, next) {
  try {
    const fieldId = parseInt(req.params.fieldId, 10);
    const field = await Field.findByPk(fieldId);
    if (!field) return res.status(404).json({ error: 'Field not found' });
    const form = await Form.findByPk(field.form_id);
    if (form.created_by !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

    // if key changed, ensure uniqueness
    if (req.body.key && req.body.key !== field.key) {
      const exists = await Field.findOne({ where: { form_id: field.form_id, key: req.body.key } });
      if (exists) return res.status(409).json({ error: 'Field key must be unique within the form' });
    }
    await field.update(req.body);
    res.json({ data: field });
  } catch (err) {
    next(err);
  }
}

/**
 * Delete field
 */
async function deleteField(req, res, next) {
  try {
    const fieldId = parseInt(req.params.fieldId, 10);
    const field = await Field.findByPk(fieldId);
    if (!field) return res.status(404).json({ error: 'Field not found' });
    const form = await Form.findByPk(field.form_id);
    if (form.created_by !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    await field.destroy();
    res.json({ data: { success: true } });
  } catch (err) {
    next(err);
  }
}

/**
 * List fields for a form
 */
async function listFields(req, res, next) {
  try {
    const formId = parseInt(req.params.formId, 10);
    const fields = await Field.findAll({ where: { form_id: formId }, order: [['order','ASC']] });
    res.json({ data: { fields } });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  addField,
  updateField,
  deleteField,
  listFields
};
