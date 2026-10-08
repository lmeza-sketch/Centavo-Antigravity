const request = require('supertest');
const app = require('../src/app');

// Mock del módulo de DB
jest.mock('../src/config/db', () => ({
  query: jest.fn(),
}));

const db = require('../src/config/db');

// Mock de jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  verify: jest.fn((token) => {
    if (token === 'valid.jwt.token') {
      return { sub: 'user-uuid-1', email: 'test@example.com' };
    }
    throw new Error('invalid token');
  }),
}));

const AUTH_HEADER = 'Bearer valid.jwt.token';

describe('POST /api/notifications/evaluate-transaction', () => {
  beforeEach(() => jest.clearAllMocks());

  it('retorna 401 si no se envía header de autorización', async () => {
    const res = await request(app)
      .post('/api/notifications/evaluate-transaction')
      .send({ amount: 50.0, category: 'Alimentación', budgetLimit: 200 });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error', 'Token de acceso requerido.');
  });

  it('retorna 422 si falta el monto o no es positivo', async () => {
    const res = await request(app)
      .post('/api/notifications/evaluate-transaction')
      .set('Authorization', AUTH_HEADER)
      .send({ amount: -10, category: 'Alimentación' });

    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty('error', 'Validación fallida');
  });

  it('retorna 422 si falta la categoría', async () => {
    const res = await request(app)
      .post('/api/notifications/evaluate-transaction')
      .set('Authorization', AUTH_HEADER)
      .send({ amount: 100 });

    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty('error', 'Validación fallida');
  });

  it('evalúa gasto dentro del presupuesto y no genera alerta (shouldAlert: false)', async () => {
    // Preferencias del usuario mock
    db.query.mockResolvedValueOnce({
      rowCount: 1,
      rows: [{ user_id: 'user-uuid-1', threshold_percent: 80 }],
    });

    const res = await request(app)
      .post('/api/notifications/evaluate-transaction')
      .set('Authorization', AUTH_HEADER)
      .send({
        amount: 50.0,
        category: 'Alimentación',
        budgetLimit: 500.0,
        currentSpent: 100.0,
      });

    expect(res.status).toBe(200);
    expect(res.body.evaluation.shouldAlert).toBe(false);
    expect(res.body.evaluation.percentage).toBe(30);
    expect(res.body.evaluation.newTotalSpent).toBe(150);
    expect(res.body.evaluation.notification).toBeNull();
  });

  it('evalúa y genera alerta del 80% cuando alcanza el umbral de advertencia', async () => {
    // Preferencias del usuario mock
    db.query.mockResolvedValueOnce({
      rowCount: 1,
      rows: [{ user_id: 'user-uuid-1', threshold_percent: 80 }],
    });

    const mockNotification = {
      id: 'notif-uuid-1',
      user_id: 'user-uuid-1',
      type: 'presupuesto.alerta80',
      title: 'Alerta de presupuesto (85%)',
      message: 'Llevas el 85% de tu presupuesto en la categoría Alimentación. Gasto acumulado: $425.00 de un límite de $500.00.',
      category: 'Alimentación',
      read: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Mock insert de notificación
    db.query.mockResolvedValueOnce({
      rowCount: 1,
      rows: [mockNotification],
    });

    const res = await request(app)
      .post('/api/notifications/evaluate-transaction')
      .set('Authorization', AUTH_HEADER)
      .send({
        amount: 75.0,
        category: 'Alimentación',
        budgetLimit: 500.0,
        currentSpent: 350.0,
      });

    expect(res.status).toBe(200);
    expect(res.body.evaluation.shouldAlert).toBe(true);
    expect(res.body.evaluation.alertType).toBe('presupuesto.alerta80');
    expect(res.body.evaluation.percentage).toBe(85);
    expect(res.body.evaluation.newTotalSpent).toBe(425);
    expect(res.body.evaluation.notification).toBeDefined();
    expect(res.body.evaluation.notification.id).toBe('notif-uuid-1');
  });

  it('evalúa y genera alerta crítica cuando se excede el presupuesto (100%+)', async () => {
    // Preferencias del usuario mock
    db.query.mockResolvedValueOnce({
      rowCount: 0,
      rows: [],
    });

    const mockNotification = {
      id: 'notif-uuid-2',
      user_id: 'user-uuid-1',
      type: 'presupuesto.excedido',
      title: '¡Presupuesto superado!',
      message: 'Has superado tu presupuesto de Alimentación. Gasto acumulado: $550.00 de un límite de $500.00 (110%).',
      category: 'Alimentación',
      read: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.query.mockResolvedValueOnce({
      rowCount: 1,
      rows: [mockNotification],
    });

    const res = await request(app)
      .post('/api/notifications/evaluate-transaction')
      .set('Authorization', AUTH_HEADER)
      .send({
        amount: 150.0,
        category: 'Alimentación',
        budgetLimit: 500.0,
        currentSpent: 400.0,
      });

    expect(res.status).toBe(200);
    expect(res.body.evaluation.shouldAlert).toBe(true);
    expect(res.body.evaluation.alertType).toBe('presupuesto.excedido');
    expect(res.body.evaluation.percentage).toBe(110);
    expect(res.body.evaluation.newTotalSpent).toBe(550);
    expect(res.body.evaluation.notification).toHaveProperty('id', 'notif-uuid-2');
  });
});

describe('GET /api/notifications', () => {
  beforeEach(() => jest.clearAllMocks());

  it('retorna 401 si no hay token', async () => {
    const res = await request(app).get('/api/notifications');
    expect(res.status).toBe(401);
  });

  it('retorna la lista de notificaciones del usuario', async () => {
    const mockList = [
      {
        id: 'notif-1',
        user_id: 'user-uuid-1',
        type: 'presupuesto.excedido',
        title: 'Presupuesto superado',
        category: 'Alimentación',
        read: false,
      },
      {
        id: 'notif-2',
        user_id: 'user-uuid-1',
        type: 'presupuesto.alerta80',
        title: 'Alerta 80%',
        category: 'Transporte',
        read: true,
      },
    ];

    db.query.mockResolvedValueOnce({
      rowCount: 2,
      rows: mockList,
    });

    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toHaveProperty('id', 'notif-1');
  });

  it('permite filtrar por estado de lectura y categoría', async () => {
    db.query.mockResolvedValueOnce({
      rowCount: 1,
      rows: [{ id: 'notif-1', read: false, category: 'Alimentación' }],
    });

    const res = await request(app)
      .get('/api/notifications?read=false&category=Alimentación')
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });
});

describe('GET /api/notifications/:id', () => {
  it('retorna el detalle de la notificación si existe', async () => {
    const mockNotif = {
      id: 'notif-1',
      user_id: 'user-uuid-1',
      type: 'presupuesto.excedido',
      title: 'Presupuesto superado',
    };

    db.query.mockResolvedValueOnce({ rowCount: 1, rows: [mockNotif] });

    const res = await request(app)
      .get('/api/notifications/notif-1')
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', 'notif-1');
  });

  it('retorna 404 si la notificación no existe', async () => {
    db.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

    const res = await request(app)
      .get('/api/notifications/notif-999')
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'Notificación no encontrada.');
  });
});

describe('PATCH /api/notifications/:id/read', () => {
  it('marca la notificación como leída y retorna 200', async () => {
    const updatedNotif = {
      id: 'notif-1',
      user_id: 'user-uuid-1',
      read: true,
      updated_at: new Date().toISOString(),
    };

    db.query.mockResolvedValueOnce({ rowCount: 1, rows: [updatedNotif] });

    const res = await request(app)
      .patch('/api/notifications/notif-1/read')
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body.notification).toHaveProperty('read', true);
    expect(res.body).toHaveProperty('message', 'Notificación marcada como leída.');
  });
});

describe('DELETE /api/notifications/:id', () => {
  it('elimina la notificación y retorna mensaje de confirmación', async () => {
    db.query.mockResolvedValueOnce({ rowCount: 1 });

    const res = await request(app)
      .delete('/api/notifications/notif-1')
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Notificación eliminada exitosamente.');
  });

  it('retorna 404 si la notificación no existe para eliminar', async () => {
    db.query.mockResolvedValueOnce({ rowCount: 0 });

    const res = await request(app)
      .delete('/api/notifications/notif-999')
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(404);
  });
});

describe('GET & PUT /api/notifications/preferences', () => {
  it('obtiene las preferencias del usuario', async () => {
    const mockPreferences = {
      user_id: 'user-uuid-1',
      email_enabled: true,
      push_enabled: true,
      sms_enabled: false,
      threshold_percent: 80,
    };

    db.query.mockResolvedValueOnce({ rowCount: 1, rows: [mockPreferences] });

    const res = await request(app)
      .get('/api/notifications/preferences')
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('threshold_percent', 80);
    expect(res.body).toHaveProperty('email_enabled', true);
  });

  it('actualiza las preferencias del usuario exitosamente', async () => {
    // getPreferences
    db.query.mockResolvedValueOnce({
      rowCount: 1,
      rows: [{ user_id: 'user-uuid-1', email_enabled: true, push_enabled: true, sms_enabled: false, threshold_percent: 80 }],
    });

    const updatedPreferences = {
      id: 'pref-1',
      user_id: 'user-uuid-1',
      email_enabled: true,
      push_enabled: false,
      sms_enabled: true,
      threshold_percent: 85,
    };

    // insert / update query
    db.query.mockResolvedValueOnce({
      rowCount: 1,
      rows: [updatedPreferences],
    });

    const res = await request(app)
      .put('/api/notifications/preferences')
      .set('Authorization', AUTH_HEADER)
      .send({
        push_enabled: false,
        sms_enabled: true,
        threshold_percent: 85,
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Preferencias de notificación actualizadas exitosamente.');
    expect(res.body.preferences).toHaveProperty('threshold_percent', 85);
    expect(res.body.preferences).toHaveProperty('push_enabled', false);
    expect(res.body.preferences).toHaveProperty('sms_enabled', true);
  });
});

describe('GET /health', () => {
  it('retorna status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', service: 'notifications-service' });
  });
});
