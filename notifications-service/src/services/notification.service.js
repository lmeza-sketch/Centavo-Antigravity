const { query } = require('../config/db');

/**
 * Evalúa si una nueva transacción supera o se aproxima al límite de presupuesto correspondiente,
 * y genera una notificación de alerta si corresponde.
 *
 * @param {Object} params
 * @param {string} params.userId
 * @param {number} params.amount
 * @param {string} params.category
 * @param {number} [params.budgetLimit]
 * @param {number} [params.currentSpent=0]
 * @param {string} [params.date]
 * @param {string} [params.description]
 */
async function evaluateTransactionAlert({
  userId,
  amount,
  category,
  budgetLimit,
  currentSpent = 0,
  date,
  description,
}) {
  const transactionAmount = Number(amount);
  const previousSpent = Number(currentSpent || 0);
  const newTotalSpent = Number((previousSpent + transactionAmount).toFixed(2));

  // Obtener preferencias del usuario si existen
  const userPreferences = await getPreferences(userId);
  const thresholdPercent = Number(userPreferences.threshold_percent) || 80;

  let shouldAlert = false;
  let alertType = null;
  let title = null;
  let message = 'El gasto se encuentra dentro del margen de presupuesto establecido.';
  let percentage = 0;
  let notification = null;

  if (budgetLimit && Number(budgetLimit) > 0) {
    const limit = Number(budgetLimit);
    percentage = Number(((newTotalSpent / limit) * 100).toFixed(2));

    if (percentage >= 100) {
      shouldAlert = true;
      alertType = 'presupuesto.excedido';
      title = '¡Presupuesto superado!';
      message = `Has superado tu presupuesto de ${category}. Gasto acumulado: $${newTotalSpent.toFixed(2)} de un límite de $${limit.toFixed(2)} (${percentage}%).`;
    } else if (percentage >= thresholdPercent) {
      shouldAlert = true;
      alertType = 'presupuesto.alerta80';
      title = `Alerta de presupuesto (${percentage.toFixed(0)}%)`;
      message = `Llevas el ${percentage}% de tu presupuesto en la categoría ${category}. Gasto acumulado: $${newTotalSpent.toFixed(2)} de un límite de $${limit.toFixed(2)}.`;
    }

    if (shouldAlert) {
      const metadata = JSON.stringify({
        category,
        amount: transactionAmount,
        previousSpent,
        newTotalSpent,
        budgetLimit: limit,
        percentage,
        date: date || new Date().toISOString().split('T')[0],
        description: description || null,
      });

      const insertResult = await query(
        `INSERT INTO notifications (user_id, type, title, message, category, metadata, read)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, user_id, type, title, message, category, metadata, read, created_at, updated_at`,
        [userId, alertType, title, message, category, metadata, false],
      );

      notification = insertResult.rows[0];
    }
  }

  return {
    shouldAlert,
    alertType,
    percentage,
    previousSpent,
    transactionAmount,
    newTotalSpent,
    budgetLimit: budgetLimit ? Number(budgetLimit) : null,
    message,
    notification,
  };
}

/**
 * Lista el historial de notificaciones del usuario.
 * @param {string} userId
 * @param {Object} [filters]
 * @param {boolean} [filters.read]
 * @param {string} [filters.type]
 * @param {string} [filters.category]
 * @param {number} [filters.limit=50]
 * @param {number} [filters.offset=0]
 */
async function listNotifications(userId, filters = {}) {
  const conditions = ['user_id = $1'];
  const params = [userId];
  let paramIndex = 2;

  if (filters.read !== undefined) {
    conditions.push(`read = $${paramIndex}`);
    params.push(filters.read === 'true' || filters.read === true);
    paramIndex++;
  }

  if (filters.type) {
    conditions.push(`type = $${paramIndex}`);
    params.push(filters.type);
    paramIndex++;
  }

  if (filters.category) {
    conditions.push(`category = $${paramIndex}`);
    params.push(filters.category);
    paramIndex++;
  }

  const limit = filters.limit ? parseInt(filters.limit, 10) : 50;
  const offset = filters.offset ? parseInt(filters.offset, 10) : 0;

  params.push(limit, offset);
  const limitClause = `LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;

  const sql = `
    SELECT id, user_id, type, title, message, category, metadata, read, created_at, updated_at
    FROM notifications
    WHERE ${conditions.join(' AND ')}
    ORDER BY created_at DESC
    ${limitClause}
  `;

  const result = await query(sql, params);
  return result.rows;
}

/**
 * Obtiene el detalle de una notificación por ID y usuario.
 * @param {string} userId
 * @param {string} notificationId
 */
async function getNotificationById(userId, notificationId) {
  const result = await query(
    `SELECT id, user_id, type, title, message, category, metadata, read, created_at, updated_at
     FROM notifications
     WHERE id = $1 AND user_id = $2`,
    [notificationId, userId],
  );

  if (result.rowCount === 0) {
    const err = new Error('Notificación no encontrada.');
    err.status = 404;
    throw err;
  }

  return result.rows[0];
}

/**
 * Marca una notificación como leída.
 * @param {string} userId
 * @param {string} notificationId
 */
async function markAsRead(userId, notificationId) {
  const result = await query(
    `UPDATE notifications
     SET read = TRUE, updated_at = NOW()
     WHERE id = $1 AND user_id = $2
     RETURNING id, user_id, type, title, message, category, metadata, read, created_at, updated_at`,
    [notificationId, userId],
  );

  if (result.rowCount === 0) {
    const err = new Error('Notificación no encontrada.');
    err.status = 404;
    throw err;
  }

  return result.rows[0];
}

/**
 * Elimina una notificación por ID y usuario.
 * @param {string} userId
 * @param {string} notificationId
 */
async function deleteNotification(userId, notificationId) {
  const result = await query(
    'DELETE FROM notifications WHERE id = $1 AND user_id = $2',
    [notificationId, userId],
  );

  if (result.rowCount === 0) {
    const err = new Error('Notificación no encontrada.');
    err.status = 404;
    throw err;
  }

  return { message: 'Notificación eliminada exitosamente.' };
}

/**
 * Obtiene las preferencias de notificación de un usuario.
 * Si no existen registros previos, retorna los valores predeterminados.
 * @param {string} userId
 */
async function getPreferences(userId) {
  const result = await query(
    `SELECT id, user_id, email_enabled, push_enabled, sms_enabled, threshold_percent, created_at, updated_at
     FROM notification_preferences
     WHERE user_id = $1`,
    [userId],
  );

  if (result.rowCount > 0) {
    return result.rows[0];
  }

  return {
    user_id: userId,
    email_enabled: true,
    push_enabled: true,
    sms_enabled: false,
    threshold_percent: 80,
  };
}

/**
 * Actualiza o crea las preferencias de notificación del usuario.
 * @param {string} userId
 * @param {Object} data
 */
async function updatePreferences(userId, data) {
  const current = await getPreferences(userId);

  const emailEnabled = data.email_enabled !== undefined ? data.email_enabled : current.email_enabled;
  const pushEnabled = data.push_enabled !== undefined ? data.push_enabled : current.push_enabled;
  const smsEnabled = data.sms_enabled !== undefined ? data.sms_enabled : current.sms_enabled;
  const thresholdPercent = data.threshold_percent !== undefined ? data.threshold_percent : current.threshold_percent;

  const result = await query(
    `INSERT INTO notification_preferences (user_id, email_enabled, push_enabled, sms_enabled, threshold_percent, updated_at)
     VALUES ($1, $2, $3, $4, $5, NOW())
     ON CONFLICT (user_id)
     DO UPDATE SET
       email_enabled = EXCLUDED.email_enabled,
       push_enabled = EXCLUDED.push_enabled,
       sms_enabled = EXCLUDED.sms_enabled,
       threshold_percent = EXCLUDED.threshold_percent,
       updated_at = NOW()
     RETURNING id, user_id, email_enabled, push_enabled, sms_enabled, threshold_percent, created_at, updated_at`,
    [userId, emailEnabled, pushEnabled, smsEnabled, thresholdPercent],
  );

  return result.rows[0];
}

module.exports = {
  evaluateTransactionAlert,
  listNotifications,
  getNotificationById,
  markAsRead,
  deleteNotification,
  getPreferences,
  updatePreferences,
};
