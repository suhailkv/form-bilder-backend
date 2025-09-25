/**
 * Validate request body using a Joi schema (from services/validationService)
 */
module.exports = (schema) => {
  return (req, res, next) => {
    const options = { abortEarly: false, allowUnknown: false, stripUnknown: true };
    const { error, value } = schema.validate(req.body, options);
    if (error) {
      const details = error.details.map(d => d.message);
      return res.status(400).json({ error: 'Validation error', details });
    }
    req.body = value;
    next();
  };
};
