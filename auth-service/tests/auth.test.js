const request = require('supertest');
const app = require('../src/app');

// Mock del módulo de DB para no necesitar PostgreSQL en los tests
jest.mock('../src/config/db', () => ({
  query: jest.fn(),
}));

const db = require('../src/config/db');

// Mock de bcrypt para acelerar los tests
jest.mock('bcrypt', () => ({
  hash: jest.fn(async () => 'hashed_password'),
  compare: jest.fn(async (plain, hashed) => plain === 'password123' && hashed === 'hashed_password'),
}));

// Mock de jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mock.jwt.token'),
  verify: jest.fn((token) => {
    if (token === 'valid.refresh.token') return { sub: 'user-id-1', email: 'test@example.com' };
    throw new Error('invalid token');
  }),
}));

describe('POST /api/auth/register', () => {
  beforeEach(() => jest.clearAllMocks());

  it('registra un usuario nuevo y retorna 201', async () => {
    db.query
      .mockResolvedValueOnce({ rowCount: 0 }) // email no existe
      .mockResolvedValueOnce({
        rows: [{ id: 'uuid-1', name: 'Ana', email: 'ana@test.com', created_at: new Date() }],
      });

    const res = await request(app).post('/api/auth/register').send({
      name: 'Ana',
      email: 'ana@test.com',
      password: 'password123',
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('user.email', 'ana@test.com');
  });

  it('retorna 409 si el email ya existe', async () => {
    db.query.mockResolvedValueOnce({ rowCount: 1 });

    const res = await request(app).post('/api/auth/register').send({
      name: 'Ana',
      email: 'ana@test.com',
      password: 'password123',
    });

    expect(res.status).toBe(409);
  });

  it('retorna 422 si faltan campos requeridos', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'x@x.com' });
    expect(res.status).toBe(422);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(() => jest.clearAllMocks());

  it('retorna tokens y datos del usuario con credenciales válidas', async () => {
    db.query
      .mockResolvedValueOnce({
        rowCount: 1,
        rows: [{ id: 'user-id-1', name: 'Ana', email: 'ana@test.com', password: 'hashed_password' }],
      })
      .mockResolvedValueOnce({ rowCount: 1 }); // INSERT refresh token

    const res = await request(app).post('/api/auth/login').send({
      email: 'ana@test.com',
      password: 'password123',
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body).toHaveProperty('refreshToken');
    expect(res.body).toHaveProperty('user.email', 'ana@test.com');
  });

  it('retorna 401 con credenciales inválidas', async () => {
    db.query.mockResolvedValueOnce({ rowCount: 0, rows: [] });

    const res = await request(app).post('/api/auth/login').send({
      email: 'ana@test.com',
      password: 'wrong',
    });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/auth/me', () => {
  it('retorna 401 sin token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('retorna el perfil del usuario con token válido', async () => {
    // jwt.verify ya está mockeado para retornar { sub: 'user-id-1' } con cualquier token
    const jwt = require('jsonwebtoken');
    jwt.verify.mockReturnValueOnce({ sub: 'user-id-1', email: 'ana@test.com' });

    db.query.mockResolvedValueOnce({
      rowCount: 1,
      rows: [{ id: 'user-id-1', name: 'Ana', email: 'ana@test.com', created_at: new Date() }],
    });

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer some.valid.token');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('user.id', 'user-id-1');
  });
});

describe('GET /health', () => {
  it('retorna status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
  });
});
