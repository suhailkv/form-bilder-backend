const jwt = require('jsonwebtoken');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

/**
 * Attach req.user if token valid. If route requires auth, call as middleware.
 */
async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    req.user = null;
    return next();
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(payload.id);
    req.user = user ? user.toJSON() : null;
    return next();
  } catch (err) {
    // invalid token: treat as unauthenticated (could also respond 401)
    return res.status(401).json({ error: 'Invalid token' });
  }
}

/**
 * Require authentication
 */
function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' });
  next();
}

/**
 * Role guard
 */
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    if (req.user.role !== role) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}

module.exports = {
  authenticate,
  requireAuth,
  requireRole
};
