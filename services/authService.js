const jwt = require('jsonwebtoken');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

async function authenticateUser(email, password) {
  const user = await User.findOne({ where: { email } });
  if (!user) return null;
  const ok = await user.verifyPassword(password);
  if (!ok) return null;
  return user;
}

function signToken(user) {
  const payload = { id: user.id, role: user.role, email: user.email };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

module.exports = {
  authenticateUser,
  signToken,
  verifyToken
};
