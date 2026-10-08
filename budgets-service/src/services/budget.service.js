const { query } = require('../config/db');

/**
 * Crea un nuevo presupuesto por categoría.
 * @param {Object} params
 * @param {string} params.userId
 * @param {string} params.category
 * @param {number} [params.limit_amount]
 * @param {number} [params.amount]
 * @param {number} [params.limit]
 * @param {string} [params.period]
 */
async function createBudget({ userId, category, limit_amount, amount, limit, period }) {
  const limitValue = limit_amount !== undefined ? limit_amount : (amount !== undefined ? amount : limit);
  const budgetPeriod = period || 'mensual';

  const result = await query(
    `INSERT INTO budgets (user_id, category, limit_amount, period)
     VALUES ($1, $2, $3, $4)
     RETURNING id, user_id, category, limit_amount, period, created_at, updated_at`,
    [userId, category, limitValue, budgetPeriod],
  );

  return result.rows[0];
}

/**
 * Lista los presupuestos del usuario con filtros opcionales.
 * @param {string} userId
 * @param {Object} [filters]
 * @param {string} [filters.category]
 * @param {string} [filters.period]
 * @param {number} [filters.limit=50]
 * @param {number} [filters.offset=0]
 */
async function listBudgets(userId, filters = {}) {
  const conditions = ['user_id = $1'];
  const params = [userId];
  let paramIndex = 2;

  if (filters.category) {
    conditions.push(`category = $${paramIndex}`);
    params.push(filters.category);
    paramIndex++;
  }

  if (filters.period) {
    conditions.push(`period = $${paramIndex}`);
    params.push(filters.period);
    paramIndex++;
  }

  const limit = filters.limit ? parseInt(filters.limit, 10) : 50;
  const offset = filters.offset ? parseInt(filters.offset, 10) : 0;

  params.push(limit, offset);
  const limitClause = `LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;

  const sql = `
    SELECT id, user_id, category, limit_amount, period, created_at, updated_at
    FROM budgets
    WHERE ${conditions.join(' AND ')}
    ORDER BY created_at DESC
    ${limitClause}
  `;

  const result = await query(sql, params);
  return result.rows;
}

/**
 * Obtiene el detalle de un presupuesto por ID y usuario.
 * @param {string} userId
 * @param {string} budgetId
 */
async function getBudgetById(userId, budgetId) {
  const result = await query(
    `SELECT id, user_id, category, limit_amount, period, created_at, updated_at
     FROM budgets
     WHERE id = $1 AND user_id = $2`,
    [budgetId, userId],
  );

  if (result.rowCount === 0) {
    const err = new Error('Presupuesto no encontrado.');
    err.status = 404;
    throw err;
  }

  return result.rows[0];
}

/**
 * Actualiza un presupuesto existente.
 * @param {string} userId
 * @param {string} budgetId
 * @param {Object} data
 */
async function updateBudget(userId, budgetId, data) {
  const updates = [];
  const params = [budgetId, userId];
  let paramIndex = 3;

  if (data.category !== undefined) {
    updates.push(`category = $${paramIndex}`);
    params.push(data.category);
    paramIndex++;
  }

  const limitValue = data.limit_amount !== undefined ? data.limit_amount : (data.amount !== undefined ? data.amount : data.limit);
  if (limitValue !== undefined) {
    updates.push(`limit_amount = $${paramIndex}`);
    params.push(limitValue);
    paramIndex++;
  }

  if (data.period !== undefined) {
    updates.push(`period = $${paramIndex}`);
    params.push(data.period);
    paramIndex++;
  }

  updates.push('updated_at = NOW()');

  const sql = `
    UPDATE budgets
    SET ${updates.join(', ')}
    WHERE id = $1 AND user_id = $2
    RETURNING id, user_id, category, limit_amount, period, created_at, updated_at
  `;

  const result = await query(sql, params);

  if (result.rowCount === 0) {
    const err = new Error('Presupuesto no encontrado.');
    err.status = 404;
    throw err;
  }

  return result.rows[0];
}

/**
 * Elimina un presupuesto por ID y usuario.
 * @param {string} userId
 * @param {string} budgetId
 */
async function deleteBudget(userId, budgetId) {
  const result = await query(
    'DELETE FROM budgets WHERE id = $1 AND user_id = $2',
    [budgetId, userId],
  );

  if (result.rowCount === 0) {
    const err = new Error('Presupuesto no encontrado.');
    err.status = 404;
    throw err;
  }

  return { message: 'Presupuesto eliminado exitosamente.' };
}

module.exports = {
  createBudget,
  listBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
};
