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

describe('POST /api/budgets', () => {
  beforeEach(() => jest.clearAllMocks());

  it('retorna 401 si no se envía header de autorización', async () => {
    const res = await request(app)
      .post('/api/budgets')
      .send({ category: 'Alimentación', limit_amount: 500, period: 'mensual' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error', 'Token de acceso requerido.');
  });

  it('crea un presupuesto exitosamente y retorna 201', async () => {
    const mockBudget = {
      id: 'bdg-uuid-1',
      user_id: 'user-uuid-1',
      category: 'Alimentación',
      limit_amount: 500,
      period: 'mensual',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.query.mockResolvedValueOnce({
      rowCount: 1,
      rows: [mockBudget],
    });

    const res = await request(app)
      .post('/api/budgets')
      .set('Authorization', AUTH_HEADER)
      .send({
        category: 'Alimentación',
        limit_amount: 500,
        period: 'mensual',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('message', 'Presupuesto creado exitosamente.');
    expect(res.body.budget).toHaveProperty('id', 'bdg-uuid-1');
    expect(res.body.budget).toHaveProperty('category', 'Alimentación');
    expect(res.body.budget).toHaveProperty('limit_amount', 500);
    expect(res.body.budget).toHaveProperty('period', 'mensual');
  });

  it('retorna 422 si falta la categoría', async () => {
    const res = await request(app)
      .post('/api/budgets')
      .set('Authorization', AUTH_HEADER)
      .send({
        limit_amount: 500,
        period: 'mensual',
      });

    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty('error', 'Validación fallida');
  });

  it('retorna 422 si falta el monto límite o es negativo', async () => {
    const res = await request(app)
      .post('/api/budgets')
      .set('Authorization', AUTH_HEADER)
      .send({
        category: 'Alimentación',
        limit_amount: -50,
      });

    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty('error', 'Validación fallida');
  });
});

describe('GET /api/budgets', () => {
  beforeEach(() => jest.clearAllMocks());

  it('retorna 401 si no hay token', async () => {
    const res = await request(app).get('/api/budgets');
    expect(res.status).toBe(401);
  });

  it('retorna la lista de presupuestos del usuario', async () => {
    const mockList = [
      {
        id: 'bdg-1',
        user_id: 'user-uuid-1',
        category: 'Alimentación',
        limit_amount: 500,
        period: 'mensual',
      },
      {
        id: 'bdg-2',
        user_id: 'user-uuid-1',
        category: 'Transporte',
        limit_amount: 200,
        period: 'mensual',
      },
    ];

    db.query.mockResolvedValueOnce({
      rowCount: 2,
      rows: mockList,
    });

    const res = await request(app)
      .get('/api/budgets')
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toHaveProperty('id', 'bdg-1');
  });

  it('permite filtrar por categoría y periodo', async () => {
    db.query.mockResolvedValueOnce({
      rowCount: 1,
      rows: [{ id: 'bdg-1', category: 'Alimentación', period: 'mensual' }],
    });

    const res = await request(app)
      .get('/api/budgets?category=Alimentación&period=mensual')
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });
});

describe('GET /api/budgets/:id', () => {
  it('retorna el presupuesto si existe', async () => {
    const mockBudget = { id: 'bdg-1', user_id: 'user-uuid-1', category: 'Alimentación', limit_amount: 500 };
    db.query.mockResolvedValueOnce({ rowCount: 1, rows: [mockBudget] });

    const res = await request(app)
      .get('/api/budgets/bdg-1')
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', 'bdg-1');
  });

  it('retorna 404 si el presupuesto no existe', async () => {
    db.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

    const res = await request(app)
      .get('/api/budgets/bdg-999')
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'Presupuesto no encontrado.');
  });
});

describe('PUT /api/budgets/:id', () => {
  it('actualiza el presupuesto y retorna 200', async () => {
    const updatedBudget = {
      id: 'bdg-1',
      user_id: 'user-uuid-1',
      category: 'Alimentación',
      limit_amount: 650,
      period: 'mensual',
    };
    db.query.mockResolvedValueOnce({ rowCount: 1, rows: [updatedBudget] });

    const res = await request(app)
      .put('/api/budgets/bdg-1')
      .set('Authorization', AUTH_HEADER)
      .send({ limit_amount: 650 });

    expect(res.status).toBe(200);
    expect(res.body.budget).toHaveProperty('limit_amount', 650);
  });

  it('retorna 422 si el body está vacío', async () => {
    const res = await request(app)
      .put('/api/budgets/bdg-1')
      .set('Authorization', AUTH_HEADER)
      .send({});

    expect(res.status).toBe(422);
  });

  it('retorna 404 si no se encuentra el presupuesto para actualizar', async () => {
    db.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

    const res = await request(app)
      .put('/api/budgets/bdg-999')
      .set('Authorization', AUTH_HEADER)
      .send({ limit_amount: 650 });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/budgets/:id', () => {
  it('elimina el presupuesto y retorna mensaje de éxito', async () => {
    db.query.mockResolvedValueOnce({ rowCount: 1 });

    const res = await request(app)
      .delete('/api/budgets/bdg-1')
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Presupuesto eliminado exitosamente.');
  });

  it('retorna 404 si el presupuesto no existe para eliminar', async () => {
    db.query.mockResolvedValueOnce({ rowCount: 0 });

    const res = await request(app)
      .delete('/api/budgets/bdg-999')
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(404);
  });
});

describe('GET /health', () => {
  it('retorna status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', service: 'budgets-service' });
  });
});
