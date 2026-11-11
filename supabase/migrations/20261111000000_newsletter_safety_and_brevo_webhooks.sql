-- F1: Harden newsletter_campaigns with is_test, status, sent_at
ALTER TABLE newsletter_campaigns
  ADD COLUMN IF NOT EXISTS is_test BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS sent_at TIMESTAMPTZ;

UPDATE newsletter_campaigns
SET sent_count = COALESCE(sent_count, 0),
    failed_count = COALESCE(failed_count, 0),
    total_recipients = COALESCE(total_recipients, 0)
WHERE sent_count IS NULL OR failed_count IS NULL OR total_recipients IS NULL;

ALTER TABLE newsletter_campaigns
  ALTER COLUMN sent_count SET DEFAULT 0,
  ALTER COLUMN sent_count SET NOT NULL;

UPDATE newsletter_campaigns
SET status = 'sent',
    sent_at = COALESCE(sent_at, created_at)
WHERE sent_count > 0 AND status = 'draft';

-- Permanently flag test-only campaign drafts (including 071d463c from 10 Nov audit)
UPDATE newsletter_campaigns
SET is_test = true
WHERE id = '071d463c-05ca-4468-85fc-1da0a362df8b'
   OR (sent_count = 0 AND (subject ILIKE 'TEST - %' OR subject ILIKE '[TEST]%'));

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'newsletter_campaigns_status_check'
  ) THEN
    ALTER TABLE newsletter_campaigns
      ADD CONSTRAINT newsletter_campaigns_status_check
      CHECK (status IN ('draft', 'sending', 'sent', 'partially_sent', 'failed'));
  END IF;
END $$;

-- F1/F2: Case-insensitive lookup indexes for unsubscribe and recipient retries
CREATE INDEX IF NOT EXISTS subscribers_email_lower_idx
  ON subscribers (lower(email));

CREATE INDEX IF NOT EXISTS newsletter_recipients_campaign_email_idx
  ON newsletter_recipients (campaign_id, lower(email));

-- F9: Webhook event log for Brevo bounces and complaints
CREATE TABLE IF NOT EXISTS newsletter_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider TEXT NOT NULL DEFAULT 'brevo',
  event_type TEXT NOT NULL,
  email TEXT,
  message_id TEXT,
  reason TEXT,
  action_taken TEXT NOT NULL DEFAULT 'logged',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS newsletter_webhook_events_email_idx
  ON newsletter_webhook_events (lower(email));

CREATE INDEX IF NOT EXISTS newsletter_webhook_events_created_idx
  ON newsletter_webhook_events (created_at DESC);

ALTER TABLE newsletter_webhook_events ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'newsletter_webhook_events'
      AND policyname = 'Service role full access newsletter_webhook_events'
  ) THEN
    CREATE POLICY "Service role full access newsletter_webhook_events"
      ON newsletter_webhook_events
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END $$;
