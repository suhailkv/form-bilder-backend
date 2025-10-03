const logger = require('../utils/logger');
const { User } = require('../models');
const jwt = require('jsonwebtoken');
const config = require('../config/config').app;

/**
 * POST /auth/external
 * body: { tokenBase64: "<base64-of-json>" }
 *
 * Example base64 object (JSON):
 * {
 *   "email": "user@example.com",
 *   "nonce": "optional",
 *   "issuedAt": 169615...
 * }
 */
async function externalBase64Auth(req, res) {
  const { tokenBase64 } = req.body;
  if (!tokenBase64) return res.status(400).json({ message: 'tokenBase64 required' });

  let decoded;
  try {
    const json = Buffer.from(tokenBase64, 'base64').toString('utf8');
    decoded = JSON.parse(json);
  } catch (err) {
    logger.info('Invalid base64 object');
    return res.status(400).json({ message: 'Invalid base64 object' });
  }

  const { email } = decoded;
  if (!email) return res.status(400).json({ message: 'email missing in decoded object' });

  // Validate user exists
  const user = await User.findOne({ where: { email }});
  if (!user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Create JWT for session
  const token = jwt.sign({ sub: user.id, role: user.role, email: user.email }, config.jwtSecret, { expiresIn: config.tokenExpiry });
  return res.json({ token });
}

module.exports = externalBase64Auth;
