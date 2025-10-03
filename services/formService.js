const { Form, Field, sequelize } = require('../models');
const { QueryTypes } = require('sequelize');

/**
 * Create a form: store JSON and store fields rows for easy lookup.
 */
async function createForm(payload, userId) {
  const t = await sequelize.transaction();
  try {
    const form = await Form.create({
      title: payload.title || 'Untitled',
      description: payload.description || '',
      json: payload,
      thankYouMessage: payload.thankYouMessage || '',
      bannerImage: payload.bannerImage || '',
      createdBy: userId
    }, { transaction: t });

    // Insert fields rows
    if (Array.isArray(payload.fields)) {
      for (const f of payload.fields) {
        await Field.create({
          formId: form.id,
          fieldId: f.id,
          definition: f,
          createdBy: userId,
        }, { transaction: t });
      }
    }

    await t.commit();
    return form;
  } catch (err) {
    await t.rollback();
    throw err;
  }
}

/**
 * Raw SQL example: fetch submissions with user email and form title.
 * Uses raw SQL for performance for complex join (demo).
 */
async function fetchSubmissionsRaw(formId, limit = 100, offset = 0) {
  const sql = `
    SELECT s.id, s.formId, s.userId, s.data, s.files, s.createdAt,
           u.email as userEmail, f.title as formTitle
    FROM submissions s
    LEFT JOIN users u ON u.id = s.userId
    LEFT JOIN forms f ON f.id = s.formId
    WHERE s.formId = :formId
    ORDER BY s.createdAt DESC
    LIMIT :limit OFFSET :offset
  `;
  const rows = await sequelize.query(sql, {
    replacements: { formId, limit, offset },
    type: QueryTypes.SELECT
  });
  return rows;
}

module.exports = {
  createForm,
  fetchSubmissionsRaw
};
