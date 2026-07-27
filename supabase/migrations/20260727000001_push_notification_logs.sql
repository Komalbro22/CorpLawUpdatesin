-- Supabase Migration: Push Notification Broadcast Logs Table

CREATE TABLE IF NOT EXISTS push_notification_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT,
  url TEXT,
  category TEXT DEFAULT 'all',
  targeted_count INT DEFAULT 0,
  sent_count INT DEFAULT 0,
  failed_count INT DEFAULT 0,
  pruned_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick sorting by date
CREATE INDEX IF NOT EXISTS idx_push_logs_created_at ON push_notification_logs (created_at DESC);

-- Enable RLS
ALTER TABLE push_notification_logs ENABLE ROW LEVEL SECURITY;

-- Service role access
CREATE POLICY "Service role push_notification_logs access"
  ON push_notification_logs
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
