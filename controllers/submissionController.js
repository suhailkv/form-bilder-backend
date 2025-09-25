const { Submission, Field, Form } = require('../models');
const validation = require('../services/validationService');
const formService = require('../services/formService');

/**
 * Submit data to a form — public or authenticated
 */
async function submitForm(req, res, next) {
  try {
    const formId = parseInt(req.params.formId, 10);
    const form = await Form.findByPk(formId, { include: [{ model: Field, as: 'fields' }] });
    if (!form) return res.status(404).json({ error: 'Form not found' });

    // Validate presence of required fields at controller level
    const data = req.body.data || {};
    const missing = [];
    for (const field of form.fields) {
      if (field.required && (data[field.key] === undefined || data[field.key] === null || data[field.key] === '')) {
        missing.push(field.key);
      }
    }
    if (missing.length) return res.status(400).json({ error: 'Missing required fields', missing });

    // Basic type validation
    // (Extend this later for stricter type checks)
    const submission = await Submission.create({
      form_id: formId,
      submitted_by: req.user ? req.user.id : null,
      data,
      ip_address: req.ip,
      user_agent: req.get('user-agent') || null
    });

    res.status(201).json({ data: submission });
  } catch (err) {
    next(err);
  }
}

/**
 * List submissions (with pagination, filtering, search)
 */
async function listSubmissions(req, res, next) {
  try {
    const formId = parseInt(req.params.formId, 10);
    const form = await Form.findByPk(formId);
    if (!form) return res.status(404).json({ error: 'Form not found' });

    // Only form owner or admin can list
    if (form.created_by !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

    const page = parseInt(req.query.page || '1', 10);
    const limit = Math.min(200, parseInt(req.query.limit || '20', 10));
    const search = req.query.q || null;
    const from = req.query.from || null;
    const to = req.query.to || null;

    const result = await formService.listSubmissions(formId, { page, limit, search, fromDate: from, toDate: to });

    res.json({ data: result });
  } catch (err) {
    next(err);
  }
}

/**
 * Export submissions as JSON (simple) — paginated
 */
async function exportSubmissions(req, res, next) {
  try {
    // Reuse listSubmissions logic but return file download
    const formId = parseInt(req.params.formId, 10);
    const form = await Form.findByPk(formId);
    if (!form) return res.status(404).json({ error: 'Form not found' });

    if (form.created_by !== req.user.id && req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

    const page = parseInt(req.query.page || '1', 10);
    const limit = Math.min(1000, parseInt(req.query.limit || '100', 10));
    const search = req.query.q || null;
    const from = req.query.from || null;
    const to = req.query.to || null;

    const result = await formService.listSubmissions(formId, { page, limit, search, fromDate: from, toDate: to });

    const filename = `submissions_form_${formId}_page_${page}.json`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({ meta: { total: result.count, page, limit }, submissions: result.rows }, null, 2));
  } catch (err) {
    next(err);
  }
}

module.exports = {
  submitForm,
  listSubmissions,
  exportSubmissions
};
