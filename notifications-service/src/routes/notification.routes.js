const { Router } = require('express');
const notificationService = require('../services/notification.service');
const { authenticate } = require('../middlewares/auth.middleware');
const {
  evaluateTransactionSchema,
  updatePreferencesSchema,
  queryNotificationsSchema,
  validate,
  validateQuery,
} = require('../validators/notification.validator');

const router = Router();

// Todas las rutas requieren autenticación
router.use(authenticate);

// POST /api/notifications/evaluate-transaction - Recibir evento de transacción y evaluar sobregasto
router.post(
  '/evaluate-transaction',
  validate(evaluateTransactionSchema),
  async (req, res, next) => {
    try {
      const userId = req.user.sub;
      const evaluation = await notificationService.evaluateTransactionAlert({
        userId,
        ...req.body,
      });

      res.status(200).json({
        message: evaluation.shouldAlert
          ? 'Evaluación completada: Se ha generado una alerta de presupuesto.'
          : 'Evaluación completada: No se requiere alerta.',
        evaluation,
      });
    } catch (err) {
      next(err);
    }
  },
);

// Alias para endpoint de verificación rápida
router.post(
  '/check-alert',
  validate(evaluateTransactionSchema),
  async (req, res, next) => {
    try {
      const userId = req.user.sub;
      const evaluation = await notificationService.evaluateTransactionAlert({
        userId,
        ...req.body,
      });

      res.status(200).json({
        message: evaluation.shouldAlert
          ? 'Evaluación completada: Se ha generado una alerta de presupuesto.'
          : 'Evaluación completada: No se requiere alerta.',
        evaluation,
      });
    } catch (err) {
      next(err);
    }
  },
);

// GET /api/notifications - Listar notificaciones del usuario
router.get('/', validateQuery(queryNotificationsSchema), async (req, res, next) => {
  try {
    const notifications = await notificationService.listNotifications(
      req.user.sub,
      req.query,
    );
    res.json(notifications);
  } catch (err) {
    next(err);
  }
});

// GET /api/notifications/preferences - Obtener preferencias de notificación
router.get('/preferences', async (req, res, next) => {
  try {
    const preferences = await notificationService.getPreferences(req.user.sub);
    res.json(preferences);
  } catch (err) {
    next(err);
  }
});

// PUT /api/notifications/preferences - Actualizar preferencias de notificación
router.put(
  '/preferences',
  validate(updatePreferencesSchema),
  async (req, res, next) => {
    try {
      const preferences = await notificationService.updatePreferences(
        req.user.sub,
        req.body,
      );
      res.json({
        message: 'Preferencias de notificación actualizadas exitosamente.',
        preferences,
      });
    } catch (err) {
      next(err);
    }
  },
);

// GET /api/notifications/:id - Obtener detalle de notificación
router.get('/:id', async (req, res, next) => {
  try {
    const notification = await notificationService.getNotificationById(
      req.user.sub,
      req.params.id,
    );
    res.json(notification);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/notifications/:id/read - Marcar notificación como leída
router.patch('/:id/read', async (req, res, next) => {
  try {
    const notification = await notificationService.markAsRead(
      req.user.sub,
      req.params.id,
    );
    res.json({
      message: 'Notificación marcada como leída.',
      notification,
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/notifications/:id - Eliminar notificación
router.delete('/:id', async (req, res, next) => {
  try {
    const result = await notificationService.deleteNotification(
      req.user.sub,
      req.params.id,
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
