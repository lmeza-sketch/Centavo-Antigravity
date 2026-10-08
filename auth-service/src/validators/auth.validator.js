const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'El nombre debe tener al menos 2 caracteres.',
    'any.required': 'El campo "name" es obligatorio.',
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Debe ser un email válido.',
    'any.required': 'El campo "email" es obligatorio.',
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': 'La contraseña debe tener al menos 8 caracteres.',
    'any.required': 'El campo "password" es obligatorio.',
  }),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Debe ser un email válido.',
    'any.required': 'El campo "email" es obligatorio.',
  }),
  password: Joi.string().required().messages({
    'any.required': 'El campo "password" es obligatorio.',
  }),
});

const refreshSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': 'El campo "refreshToken" es obligatorio.',
  }),
});

/**
 * Middleware de validación de body con un schema Joi.
 * @param {Joi.Schema} schema
 */
function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const messages = error.details.map((d) => d.message);
      return res.status(422).json({ error: 'Validación fallida', messages });
    }
    req.body = value; // usa los valores saneados de Joi
    next();
  };
}

module.exports = { registerSchema, loginSchema, refreshSchema, validate };
