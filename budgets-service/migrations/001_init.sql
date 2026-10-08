-- Migración inicial: tabla de presupuestos
-- Ejecutar con: psql $DATABASE_URL -f migrations/001_init.sql

CREATE TABLE IF NOT EXISTS budgets (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID NOT NULL,
  category     TEXT NOT NULL,
  limit_amount NUMERIC(12, 2) NOT NULL,
  period       TEXT NOT NULL DEFAULT 'mensual',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_budgets_user_id  ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_category ON budgets(category);
CREATE INDEX IF NOT EXISTS idx_budgets_period   ON budgets(period);
