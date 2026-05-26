-- supabase/migrations/20260526000005_create_cron_log.sql
CREATE TABLE IF NOT EXISTS cron_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name        TEXT NOT NULL DEFAULT 'update-rbi-rates',
  status          TEXT NOT NULL, -- 'ok' | 'failed' | 'skipped' | 'rate_unchanged'
  fetched_value   NUMERIC,
  previous_value  NUMERIC,
  changed         BOOLEAN DEFAULT false,
  error_message   TEXT,
  source_url      TEXT,
  duration_ms     INTEGER,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Optimize date queries for dashboard log checks
CREATE INDEX IF NOT EXISTS idx_cron_log_created_at ON cron_log(created_at DESC);
