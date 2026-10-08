const Joi = require('joi');

const createTransactionSchema = Joi.object({
  amount: Joi.number().positive().required().messages({
    'number.base': 'El monto debe ser un número.',
    'number.positive': 'El monto debe ser mayor a 0.',
    'any.required': 'El campo "amount" es obligatorio.',
  }),
  category: Joi.string().min(2).max(100).required().messages({
    'string.min': 'La categoría debe tener al menos 2 caracteres.',
    'string.max': 'La categoría no puede exceder 100 caracteres.',
    'any.required': 'El campo "category" es obligatorio.',
  }),
  date: Joi.string().isoDate().optional().messages({
    'string.isoDate': 'La fecha debe tener un formato ISO válido (YYYY-MM-DD).',
  }),
  description: Joi.string().max(255).allow('', null).optional().messages({
    'string.max': 'La descripción no puede exceder 255 caracteres.',
  }),
});

const updateTransactionSchema = Joi.object({
  amount: Joi.number().positive().optional().messages({
    'number.base': 'El monto debe ser un número.',
    'number.positive': 'El monto debe ser mayor a 0.',
  }),
  category: Joi.string().min(2).max(100).optional().messages({
    'string.min': 'La categoría debe tener al menos 2 caracteres.',
    'string.max': 'La categoría no puede exceder 100 caracteres.',
  }),
  date: Joi.string().isoDate().optional().messages({
    'string.isoDate': 'La fecha debe tener un formato ISO válido (YYYY-MM-DD).',
  }),
  description: Joi.string().max(255).allow('', null).optional().messages({
    'string.max': 'La descripción no puede exceder 255 caracteres.',
  }),
}).min(1).messages({
  'object.min': 'Debe proporcionar al menos un campo para actualizar.',
});

const queryTransactionsSchema = Joi.object({
  category: Joi.string().optional(),
  startDate: Joi.string().isoDate().optional(),
  endDate: Joi.string().isoDate().optional(),
  limit: Joi.number().integer().min(1).max(100).default(50),
  offset: Joi.number().integer().min(0).default(0),
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
    req.body = value;
    next();
  };
}

/**
 * Middleware de validación de query params con un schema Joi.
 * @param {Joi.Schema} schema
 */
function validateQuery(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, { abortEarly: false });
    if (error) {
      const messages = error.details.map((d) => d.message);
      return res.status(422).json({ error: 'Validación de parámetros fallida', messages });
    }
    req.query = value;
    next();
  };
}

module.exports = {
  createTransactionSchema,
  updateTransactionSchema,
  queryTransactionsSchema,
  validate,
  validateQuery,
};
