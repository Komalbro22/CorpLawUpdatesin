-- Alter table subscribers to add confirmed column if it doesn't exist
ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS confirmed boolean DEFAULT true;

-- Create table newsletter_sends if it doesn't exist
CREATE TABLE IF NOT EXISTS newsletter_sends (
  id uuid primary key default gen_random_uuid(),
  sent_at timestamptz default now(),
  subject text not null,
  article_count int not null,
  recipient_count int not null,
  mode text not null, -- 'auto' or 'custom'
  status text not null -- 'sent' or 'failed'
);

-- Enable RLS for newsletter_sends
ALTER TABLE newsletter_sends ENABLE ROW LEVEL SECURITY;

-- Policy to grant service role full access
CREATE POLICY "Service role full access newsletter_sends"
  ON newsletter_sends USING (auth.role() = 'service_role');
