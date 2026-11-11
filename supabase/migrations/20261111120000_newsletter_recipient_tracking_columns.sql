-- Newsletter delivery, open, and click tracking columns on newsletter_recipients (additive-only)
ALTER TABLE newsletter_recipients
  ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS clicked_url TEXT;

CREATE INDEX IF NOT EXISTS newsletter_recipients_resend_email_id_idx
  ON newsletter_recipients (resend_email_id)
  WHERE resend_email_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS newsletter_recipients_email_sent_idx
  ON newsletter_recipients (lower(email), sent_at DESC NULLS LAST);
