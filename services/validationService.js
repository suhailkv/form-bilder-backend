const Joi = require('joi');

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().max(255).optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const formCreateSchema = Joi.object({
  title: Joi.string().max(255).required(),
  description: Joi.string().allow(null, '').optional(),
  settings: Joi.object().optional(),
  fields: Joi.array().items(
    Joi.object({
      label: Joi.string().required(),
      key: Joi.string().required(),
      type: Joi.string().valid('text','textarea','number','checkbox','radio','select','date','email').required(),
      required: Joi.boolean().optional(),
      options: Joi.array().items(Joi.object({ value: Joi.any().required(), label: Joi.string().required() })).optional(),
      order: Joi.number().integer().optional()
    })
  ).optional()
});

const fieldSchema = Joi.object({
  label: Joi.string().required(),
  key: Joi.string().required(),
  type: Joi.string().valid('text','textarea','number','checkbox','radio','select','date','email').required(),
  required: Joi.boolean().optional(),
  options: Joi.array().items(Joi.object({ value: Joi.any().required(), label: Joi.string().required() })).optional(),
  order: Joi.number().integer().optional()
});

const submissionSchema = Joi.object({
  data: Joi.object().required()
});

module.exports = {
  registerSchema,
  loginSchema,
  formCreateSchema,
  fieldSchema,
  submissionSchema
};
