const { Form, Field, Submission } = require('../models');

/**
 * Create a new form with optional fields in one call.
 */
async function createForm({ title, description, settings, created_by, fields = [] }) {
  const form = await Form.create({ title, description, settings, created_by });
  if (fields && fields.length) {
    const fieldsToCreate = fields.map((f, idx) => ({ order: idx, ...f, form_id: form.id }));
    await Field.bulkCreate(fieldsToCreate);
  }
  return Form.findByPk(form.id, { include: [{ model: Field, as: 'fields', order: [['order', 'ASC']] }] });
}

async function updateForm(id, updates) {
  const form = await Form.findByPk(id);
  if (!form) return null;
  await form.update(updates);
  return form;
}

async function deleteForm(id) {
  const form = await Form.findByPk(id);
  if (!form) return false;
  await form.destroy();
  return true;
}

async function getFormWithFields(id) {
  return Form.findByPk(id, { include: [{ model: Field, as: 'fields', order: [['order', 'ASC']] }] });
}

async function listSubmissions(formId, { page = 1, limit = 20, search = null, fromDate = null, toDate = null }) {
  const offset = (page - 1) * limit;
  const where = { form_id: formId };
  const { Op } = require('sequelize');
  if (fromDate || toDate) {
    where.created_at = {};
    if (fromDate) where.created_at[Op.gte] = new Date(fromDate);
    if (toDate) where.created_at[Op.lte] = new Date(toDate);
  }
  if (search) {
    // basic search scanning data JSON values (MySQL JSON search is limited — we do a LIKE on stringified JSON)
    where.data = { [Op.like]: `%${search}%` };
  }
  const { count, rows } = await Submission.findAndCountAll({
    where,
    limit,
    offset,
    order: [['created_at', 'DESC']]
  });
  return { count, rows, page, limit };
}

module.exports = {
  createForm,
  updateForm,
  deleteForm,
  getFormWithFields,
  listSubmissions
};
