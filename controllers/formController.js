const { Form, Field } = require('../models');
const formService = require('../services/formService');
const validation = require('../services/validationService');

/**
 * Create form (user or admin)
 */
async function createForm(req, res, next) {
  try {
    const payload = req.body; // validated
    payload.created_by = req.user?.id || 0;
    const form = await formService.createForm(payload);
    res.status(201).json({ data: form });
  } catch (err) {
    next(err);
  }
}

/**
 * Update form (only creator or admin)
 */
async function updateForm(req, res, next) {
  try {
    const formId = parseInt(req.params.formId, 10);
    const form = await Form.findByPk(formId);
    if (!form) return res.status(404).json({ error: 'Form not found' });
    if (form.created_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await form.update(req.body);
    res.json({ data: form });
  } catch (err) {
    next(err);
  }
}

/**
 * Delete form (only creator or admin)
 */
async function deleteForm(req, res, next) {
  try {
    const id = parseInt(req.params.formId, 10);
    const form = await Form.findByPk(id);
    if (!form) return res.status(404).json({ error: 'Form not found' });
    if (form.created_by !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    await form.destroy();
    res.json({ data: { success: true } });
  } catch (err) {
    next(err);
  }
}

/**
 * Get single form with fields
 */
async function getForm(req, res, next) {
  try {
    const id = parseInt(req.params.formId, 10);
    const form = await formService.getFormWithFields(id);
    if (!form) return res.status(404).json({ error: 'Form not found' });
    res.json({ data: form });
  } catch (err) {
    next(err);
  }
}

/**
 * List forms with pagination and basic search
 */
async function listForms(req, res, next) {
  try {
    const { Op } = require('sequelize');
    const page = parseInt(req.query.page || '1', 10);
    const limit = Math.min(100, parseInt(req.query.limit || '20', 10));
    const offset = (page - 1) * limit;
    const where = {};
    if (req.query.q) {
      where.title = { [Op.like]: `%${req.query.q}%` };
    }
    // If not admin, restrict to user-created forms
    if (req.user.role !== 'admin') where.created_by = req.user.id;
    const { count, rows } = await Form.findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });
    res.json({ data: { forms: rows, total: count, page, limit } });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  createForm,
  updateForm,
  deleteForm,
  getForm,
  listForms
};
