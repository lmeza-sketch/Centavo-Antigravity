-- Migración inicial: tablas de notificaciones y preferencias
-- Ejecutar con: psql $DATABASE_URL -f migrations/001_init.sql

CREATE TABLE IF NOT EXISTS notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL,
  type        TEXT NOT NULL,
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  category    TEXT,
  metadata    JSONB DEFAULT '{}'::jsonb,
  read        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notification_preferences (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL UNIQUE,
  email_enabled     BOOLEAN NOT NULL DEFAULT TRUE,
  push_enabled      BOOLEAN NOT NULL DEFAULT TRUE,
  sms_enabled       BOOLEAN NOT NULL DEFAULT FALSE,
  threshold_percent NUMERIC(5, 2) NOT NULL DEFAULT 80.00,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_notifications_user_id   ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type      ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_read      ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_category  ON notifications(category);
CREATE INDEX IF NOT EXISTS idx_notif_pref_user_id      ON notification_preferences(user_id);
