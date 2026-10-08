const Joi = require('joi');

const evaluateTransactionSchema = Joi.object({
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
  budgetLimit: Joi.number().positive().optional().messages({
    'number.base': 'El límite de presupuesto debe ser un número.',
    'number.positive': 'El límite de presupuesto debe ser mayor a 0.',
  }),
  currentSpent: Joi.number().min(0).optional().default(0).messages({
    'number.base': 'El gasto acumulado debe ser un número.',
    'number.min': 'El gasto acumulado no puede ser negativo.',
  }),
  userId: Joi.string().optional(),
  date: Joi.string().isoDate().optional().messages({
    'string.isoDate': 'La fecha debe tener un formato ISO válido (YYYY-MM-DD).',
  }),
  description: Joi.string().max(255).allow('', null).optional().messages({
    'string.max': 'La descripción no puede exceder 255 caracteres.',
  }),
});

const updatePreferencesSchema = Joi.object({
  email_enabled: Joi.boolean().optional(),
  push_enabled: Joi.boolean().optional(),
  sms_enabled: Joi.boolean().optional(),
  threshold_percent: Joi.number().min(1).max(100).optional().messages({
    'number.min': 'El porcentaje de alerta debe ser al menos 1%.',
    'number.max': 'El porcentaje de alerta no puede superar el 100%.',
  }),
}).min(1).messages({
  'object.min': 'Debe proporcionar al menos un campo para actualizar preferencias.',
});

const queryNotificationsSchema = Joi.object({
  read: Joi.boolean().optional(),
  type: Joi.string().optional(),
  category: Joi.string().optional(),
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
  evaluateTransactionSchema,
  updatePreferencesSchema,
  queryNotificationsSchema,
  validate,
  validateQuery,
};
