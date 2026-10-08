const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { query } = require('../config/db');

const SALT_ROUNDS = 12;
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Convierte una duración tipo "7d" / "15m" a milisegundos para guardar en BD.
 */
function parseDurationMs(str) {
  const units = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  const match = str.match(/^(\d+)([smhd])$/);
  if (!match) throw new Error(`Duración inválida: ${str}`);
  return parseInt(match[1]) * units[match[2]];
}

function signAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function signRefreshToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
}

// ── Servicio ───────────────────────────────────────────────────────────────────

/**
 * Registra un nuevo usuario.
 * Lanza un error con status 409 si el email ya existe.
 */
async function register({ name, email, password }) {
  const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rowCount > 0) {
    const err = new Error('El email ya está registrado.');
    err.status = 409;
    throw err;
  }

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const result = await query(
    'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email, created_at',
    [name, email, hashed],
  );

  return result.rows[0];
}

/**
 * Autentica a un usuario y retorna accessToken + refreshToken.
 * Lanza error 401 si las credenciales son inválidas.
 */
async function login({ email, password }) {
  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];

  if (!user || !(await bcrypt.compare(password, user.password))) {
    const err = new Error('Credenciales inválidas.');
    err.status = 401;
    throw err;
  }

  const payload = { sub: user.id, email: user.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  // Persistir refresh token
  const expiresAt = new Date(Date.now() + parseDurationMs(REFRESH_TOKEN_EXPIRES_IN));
  await query(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [user.id, refreshToken, expiresAt],
  );

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, name: user.name, email: user.email },
  };
}

/**
 * Renueva el access token a partir de un refresh token válido.
 * Lanza error 401 si el token es inválido, expirado o no existe en BD.
 */
async function refresh({ refreshToken }) {
  let payload;
  try {
    payload = jwt.verify(refreshToken, JWT_SECRET);
  } catch {
    const err = new Error('Refresh token inválido o expirado.');
    err.status = 401;
    throw err;
  }

  const result = await query(
    'SELECT id, user_id, expires_at FROM refresh_tokens WHERE token = $1',
    [refreshToken],
  );

  const stored = result.rows[0];
  if (!stored || new Date(stored.expires_at) < new Date()) {
    const err = new Error('Refresh token inválido o expirado.');
    err.status = 401;
    throw err;
  }

  const newAccessToken = signAccessToken({ sub: payload.sub, email: payload.email });
  return { accessToken: newAccessToken };
}

/**
 * Invalida el refresh token del usuario (logout).
 */
async function logout({ refreshToken }) {
  await query('DELETE FROM refresh_tokens WHERE token = $1', [refreshToken]);
}

/**
 * Retorna el perfil del usuario por ID.
 * Lanza 404 si no existe.
 */
async function getMe(userId) {
  const result = await query(
    'SELECT id, name, email, created_at FROM users WHERE id = $1',
    [userId],
  );
  if (!result.rowCount) {
    const err = new Error('Usuario no encontrado.');
    err.status = 404;
    throw err;
  }
  return result.rows[0];
}

module.exports = { register, login, refresh, logout, getMe };
