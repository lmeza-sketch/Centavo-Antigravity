const { query } = require('../config/db');

/**
 * Registra una nueva transacción de gasto.
 * @param {Object} params
 * @param {string} params.userId
 * @param {number} params.amount
 * @param {string} params.category
 * @param {string} [params.date]
 * @param {string} [params.description]
 */
async function createTransaction({ userId, amount, category, date, description }) {
  const transactionDate = date || new Date().toISOString().split('T')[0];
  const transactionDescription = description || null;

  const result = await query(
    `INSERT INTO transactions (user_id, amount, category, date, description)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, user_id, amount, category, description, date, created_at, updated_at`,
    [userId, amount, category, transactionDate, transactionDescription],
  );

  return result.rows[0];
}

/**
 * Lista las transacciones de un usuario con filtros opcionales.
 * @param {string} userId
 * @param {Object} filters
 * @param {string} [filters.category]
 * @param {string} [filters.startDate]
 * @param {string} [filters.endDate]
 * @param {number} [filters.limit=50]
 * @param {number} [filters.offset=0]
 */
async function listTransactions(userId, filters = {}) {
  const conditions = ['user_id = $1'];
  const params = [userId];
  let paramIndex = 2;

  if (filters.category) {
    conditions.push(`category = $${paramIndex}`);
    params.push(filters.category);
    paramIndex++;
  }

  if (filters.startDate) {
    conditions.push(`date >= $${paramIndex}`);
    params.push(filters.startDate);
    paramIndex++;
  }

  if (filters.endDate) {
    conditions.push(`date <= $${paramIndex}`);
    params.push(filters.endDate);
    paramIndex++;
  }

  const limit = filters.limit ? parseInt(filters.limit, 10) : 50;
  const offset = filters.offset ? parseInt(filters.offset, 10) : 0;

  params.push(limit, offset);
  const limitClause = `LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;

  const sql = `
    SELECT id, user_id, amount, category, description, date, created_at, updated_at
    FROM transactions
    WHERE ${conditions.join(' AND ')}
    ORDER BY date DESC, created_at DESC
    ${limitClause}
  `;

  const result = await query(sql, params);
  return result.rows;
}

/**
 * Obtiene el detalle de una transacción por ID y usuario.
 * @param {string} userId
 * @param {string} transactionId
 */
async function getTransactionById(userId, transactionId) {
  const result = await query(
    `SELECT id, user_id, amount, category, description, date, created_at, updated_at
     FROM transactions
     WHERE id = $1 AND user_id = $2`,
    [transactionId, userId],
  );

  if (result.rowCount === 0) {
    const err = new Error('Transacción no encontrada.');
    err.status = 404;
    throw err;
  }

  return result.rows[0];
}

/**
 * Actualiza una transacción existente.
 * @param {string} userId
 * @param {string} transactionId
 * @param {Object} data
 */
async function updateTransaction(userId, transactionId, data) {
  const updates = [];
  const params = [transactionId, userId];
  let paramIndex = 3;

  if (data.amount !== undefined) {
    updates.push(`amount = $${paramIndex}`);
    params.push(data.amount);
    paramIndex++;
  }

  if (data.category !== undefined) {
    updates.push(`category = $${paramIndex}`);
    params.push(data.category);
    paramIndex++;
  }

  if (data.description !== undefined) {
    updates.push(`description = $${paramIndex}`);
    params.push(data.description);
    paramIndex++;
  }

  if (data.date !== undefined) {
    updates.push(`date = $${paramIndex}`);
    params.push(data.date);
    paramIndex++;
  }

  updates.push('updated_at = NOW()');

  const sql = `
    UPDATE transactions
    SET ${updates.join(', ')}
    WHERE id = $1 AND user_id = $2
    RETURNING id, user_id, amount, category, description, date, created_at, updated_at
  `;

  const result = await query(sql, params);

  if (result.rowCount === 0) {
    const err = new Error('Transacción no encontrada.');
    err.status = 404;
    throw err;
  }

  return result.rows[0];
}

/**
 * Elimina una transacción por ID y usuario.
 * @param {string} userId
 * @param {string} transactionId
 */
async function deleteTransaction(userId, transactionId) {
  const result = await query(
    'DELETE FROM transactions WHERE id = $1 AND user_id = $2',
    [transactionId, userId],
  );

  if (result.rowCount === 0) {
    const err = new Error('Transacción no encontrada.');
    err.status = 404;
    throw err;
  }

  return { message: 'Transacción eliminada exitosamente.' };
}

/**
 * Obtiene el resumen de gastos agrupado por categoría.
 * @param {string} userId
 * @param {Object} filters
 */
async function getSummaryByCategory(userId, filters = {}) {
  const conditions = ['user_id = $1'];
  const params = [userId];
  let paramIndex = 2;

  if (filters.startDate) {
    conditions.push(`date >= $${paramIndex}`);
    params.push(filters.startDate);
    paramIndex++;
  }

  if (filters.endDate) {
    conditions.push(`date <= $${paramIndex}`);
    params.push(filters.endDate);
    paramIndex++;
  }

  const sql = `
    SELECT
      category,
      SUM(amount)::numeric(12, 2) AS total,
      COUNT(*)::int AS count
    FROM transactions
    WHERE ${conditions.join(' AND ')}
    GROUP BY category
    ORDER BY total DESC
  `;

  const result = await query(sql, params);
  return result.rows;
}

module.exports = {
  createTransaction,
  listTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getSummaryByCategory,
};
