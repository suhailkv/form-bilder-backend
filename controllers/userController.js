const { User } = require('../models');

/**
 * List users (admin only)
 */
async function listUsers(req, res, next) {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = Math.min(100, parseInt(req.query.limit || '20', 10));
    const offset = (page - 1) * limit;
    const { count, rows } = await User.findAndCountAll({ limit, offset, attributes: { exclude: ['password'] }, order: [['id', 'DESC']] });
    res.json({ data: { users: rows, total: count, page, limit } });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listUsers
};
