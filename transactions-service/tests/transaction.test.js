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

describe('POST /api/transactions', () => {
  beforeEach(() => jest.clearAllMocks());

  it('retorna 401 si no se envía header de autorización', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .send({ amount: 50.0, category: 'Alimentación' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error', 'Token de acceso requerido.');
  });

  it('crea una transacción exitosamente y retorna 201', async () => {
    const mockTransaction = {
      id: 'tx-uuid-1',
      user_id: 'user-uuid-1',
      amount: 150.5,
      category: 'Alimentación',
      description: 'Supermercado',
      date: '2026-10-06',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    db.query.mockResolvedValueOnce({
      rowCount: 1,
      rows: [mockTransaction],
    });

    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', AUTH_HEADER)
      .send({
        amount: 150.5,
        category: 'Alimentación',
        description: 'Supermercado',
        date: '2026-10-06',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('message', 'Transacción registrada exitosamente.');
    expect(res.body.transaction).toHaveProperty('id', 'tx-uuid-1');
    expect(res.body.transaction).toHaveProperty('amount', 150.5);
  });

  it('retorna 422 si falta el monto o es negativo', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', AUTH_HEADER)
      .send({
        amount: -10,
        category: 'Alimentación',
      });

    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty('error', 'Validación fallida');
  });

  it('retorna 422 si falta la categoría', async () => {
    const res = await request(app)
      .post('/api/transactions')
      .set('Authorization', AUTH_HEADER)
      .send({
        amount: 100,
      });

    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty('error', 'Validación fallida');
  });
});

describe('GET /api/transactions', () => {
  beforeEach(() => jest.clearAllMocks());

  it('retorna 401 si no hay token', async () => {
    const res = await request(app).get('/api/transactions');
    expect(res.status).toBe(401);
  });

  it('retorna la lista de transacciones del usuario', async () => {
    const mockList = [
      {
        id: 'tx-1',
        user_id: 'user-uuid-1',
        amount: 100,
        category: 'Alimentación',
        date: '2026-10-06',
      },
      {
        id: 'tx-2',
        user_id: 'user-uuid-1',
        amount: 25,
        category: 'Transporte',
        date: '2026-10-05',
      },
    ];

    db.query.mockResolvedValueOnce({
      rowCount: 2,
      rows: mockList,
    });

    const res = await request(app)
      .get('/api/transactions')
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(2);
    expect(res.body[0]).toHaveProperty('id', 'tx-1');
  });

  it('permite filtrar por categoría', async () => {
    db.query.mockResolvedValueOnce({
      rowCount: 1,
      rows: [{ id: 'tx-1', category: 'Alimentación' }],
    });

    const res = await request(app)
      .get('/api/transactions?category=Alimentación')
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
  });
});

describe('GET /api/transactions/summary', () => {
  it('retorna el resumen agrupado por categoría', async () => {
    const mockSummary = [
      { category: 'Alimentación', total: '350.00', count: 4 },
      { category: 'Transporte', total: '120.00', count: 3 },
    ];

    db.query.mockResolvedValueOnce({
      rowCount: 2,
      rows: mockSummary,
    });

    const res = await request(app)
      .get('/api/transactions/summary')
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockSummary);
  });
});

describe('GET /api/transactions/:id', () => {
  it('retorna la transacción si existe', async () => {
    const mockTx = { id: 'tx-1', user_id: 'user-uuid-1', amount: 50 };
    db.query.mockResolvedValueOnce({ rowCount: 1, rows: [mockTx] });

    const res = await request(app)
      .get('/api/transactions/tx-1')
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', 'tx-1');
  });

  it('retorna 404 si la transacción no existe', async () => {
    db.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

    const res = await request(app)
      .get('/api/transactions/tx-999')
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error', 'Transacción no encontrada.');
  });
});

describe('PUT /api/transactions/:id', () => {
  it('actualiza la transacción y retorna 200', async () => {
    const updatedTx = { id: 'tx-1', user_id: 'user-uuid-1', amount: 80, category: 'Alimentación' };
    db.query.mockResolvedValueOnce({ rowCount: 1, rows: [updatedTx] });

    const res = await request(app)
      .put('/api/transactions/tx-1')
      .set('Authorization', AUTH_HEADER)
      .send({ amount: 80 });

    expect(res.status).toBe(200);
    expect(res.body.transaction).toHaveProperty('amount', 80);
  });

  it('retorna 422 si el body está vacío', async () => {
    const res = await request(app)
      .put('/api/transactions/tx-1')
      .set('Authorization', AUTH_HEADER)
      .send({});

    expect(res.status).toBe(422);
  });

  it('retorna 404 si no se encuentra la transacción para actualizar', async () => {
    db.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

    const res = await request(app)
      .put('/api/transactions/tx-999')
      .set('Authorization', AUTH_HEADER)
      .send({ amount: 80 });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/transactions/:id', () => {
  it('elimina la transacción y retorna mensaje de éxito', async () => {
    db.query.mockResolvedValueOnce({ rowCount: 1 });

    const res = await request(app)
      .delete('/api/transactions/tx-1')
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Transacción eliminada exitosamente.');
  });

  it('retorna 404 si la transacción no existe para eliminar', async () => {
    db.query.mockResolvedValueOnce({ rowCount: 0 });

    const res = await request(app)
      .delete('/api/transactions/tx-999')
      .set('Authorization', AUTH_HEADER);

    expect(res.status).toBe(404);
  });
});

describe('GET /health', () => {
  it('retorna status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', service: 'transactions-service' });
  });
});
