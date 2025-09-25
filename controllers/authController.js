const { User } = require('../models');
const authService = require('../services/authService');
const validation = require('../services/validationService');

async function register(req, res, next) {
  try {
    // req.body already validated by middleware
    const { email, password, name } = req.body;
    const exists = await User.findOne({ where: { email } });
    if (exists) return res.status(409).json({ error: 'Email already registered' });
    const user = await User.create({ email, password, name });
    const token = authService.signToken(user);
    res.status(201).json({ data: { user: user.toJSON(), token } });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await authService.authenticateUser(email, password);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const token = authService.signToken(user);
    res.json({ data: { user: user.toJSON(), token } });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login
};
