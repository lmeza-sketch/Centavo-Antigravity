-- Migración inicial: tabla de transacciones
-- Ejecutar con: psql $DATABASE_URL -f migrations/001_init.sql

CREATE TABLE IF NOT EXISTS transactions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL,
  amount      NUMERIC(12, 2) NOT NULL,
  category    TEXT NOT NULL,
  description TEXT,
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_transactions_user_id  ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date     ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
