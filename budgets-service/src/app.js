const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const budgetRouter = require('./routes/budget.routes');
const { errorHandler } = require('./middlewares/error.middleware');

const app = express();

// ── Seguridad ──────────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors());

// ── Rate limiting global ───────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas solicitudes, intenta más tarde.' },
});
app.use(limiter);

// ── Parsing ────────────────────────────────────────────────────────────────────
app.use(express.json());

// ── Rutas ──────────────────────────────────────────────────────────────────────
app.use('/api/budgets', budgetRouter);

// ── Health check ───────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'budgets-service' }));

// ── Manejo global de errores ───────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
