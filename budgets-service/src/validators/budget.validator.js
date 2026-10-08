const Joi = require('joi');

const createBudgetSchema = Joi.object({
  category: Joi.string().min(2).max(100).required().messages({
    'string.min': 'La categoría debe tener al menos 2 caracteres.',
    'string.max': 'La categoría no puede exceder 100 caracteres.',
    'any.required': 'El campo "category" es obligatorio.',
  }),
  limit_amount: Joi.number().positive().messages({
    'number.base': 'El monto límite debe ser un número.',
    'number.positive': 'El monto límite debe ser mayor a 0.',
  }),
  amount: Joi.number().positive().messages({
    'number.base': 'El monto límite debe ser un número.',
    'number.positive': 'El monto límite debe ser mayor a 0.',
  }),
  limit: Joi.number().positive().messages({
    'number.base': 'El monto límite debe ser un número.',
    'number.positive': 'El monto límite debe ser mayor a 0.',
  }),
  period: Joi.string()
    .valid('diario', 'semanal', 'quincenal', 'mensual', 'anual', 'daily', 'weekly', 'biweekly', 'monthly', 'yearly')
    .default('mensual')
    .messages({
      'any.only': 'El periodo debe ser válido (ej. diario, semanal, quincenal, mensual, anual).',
    }),
})
  .or('limit_amount', 'amount', 'limit')
  .messages({
    'object.missing': 'Debe proporcionar el monto límite ("limit_amount", "amount" o "limit").',
  });

const updateBudgetSchema = Joi.object({
  category: Joi.string().min(2).max(100).optional().messages({
    'string.min': 'La categoría debe tener al menos 2 caracteres.',
    'string.max': 'La categoría no puede exceder 100 caracteres.',
  }),
  limit_amount: Joi.number().positive().optional().messages({
    'number.base': 'El monto límite debe ser un número.',
    'number.positive': 'El monto límite debe ser mayor a 0.',
  }),
  amount: Joi.number().positive().optional().messages({
    'number.base': 'El monto límite debe ser un número.',
    'number.positive': 'El monto límite debe ser mayor a 0.',
  }),
  limit: Joi.number().positive().optional().messages({
    'number.base': 'El monto límite debe ser un número.',
    'number.positive': 'El monto límite debe ser mayor a 0.',
  }),
  period: Joi.string()
    .valid('diario', 'semanal', 'quincenal', 'mensual', 'anual', 'daily', 'weekly', 'biweekly', 'monthly', 'yearly')
    .optional()
    .messages({
      'any.only': 'El periodo debe ser válido (ej. diario, semanal, quincenal, mensual, anual).',
    }),
})
  .min(1)
  .messages({
    'object.min': 'Debe proporcionar al menos un campo para actualizar.',
  });

const queryBudgetsSchema = Joi.object({
  category: Joi.string().optional(),
  period: Joi.string().optional(),
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
  createBudgetSchema,
  updateBudgetSchema,
  queryBudgetsSchema,
  validate,
  validateQuery,
};
