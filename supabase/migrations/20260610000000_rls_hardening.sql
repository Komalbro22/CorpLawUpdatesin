-- RLS hardening for CorpLawUpdates PRIMARY (run in Supabase SQL Editor)
-- Fixes: draft articles exposed, subscriber emails publicly readable

-- 1. Updates: public may only read published articles
DROP POLICY IF EXISTS "Public read published updates" ON updates;
CREATE POLICY "Public read published updates"
  ON updates FOR SELECT TO public
  USING (published_at IS NOT NULL AND published_at <= now());

-- 2. Subscribers: remove public SELECT (signup uses service role via API)
DROP POLICY IF EXISTS "Allow public select subscribers" ON subscribers;
DROP POLICY IF EXISTS "Public read subscribers" ON subscribers;

-- Public INSERT still allowed for direct Supabase signups (API uses service role)
DROP POLICY IF EXISTS "Allow public insert subscribers" ON subscribers;
CREATE POLICY "Allow public insert subscribers"
  ON subscribers FOR INSERT TO public
  WITH CHECK (true);

-- 3. Glossary: public read verified terms only
DROP POLICY IF EXISTS "Public read glossary" ON glossary;
CREATE POLICY "Public read verified glossary"
  ON glossary FOR SELECT TO public
  USING (is_verified = true);

-- 4. Compliance entries: public read active entries only
DROP POLICY IF EXISTS "Public read compliance entries" ON compliance_entries;
CREATE POLICY "Public read active compliance entries"
  ON compliance_entries FOR SELECT TO public
  USING (is_active = true);

-- 5. Login attempts: no public access (rate limiting uses service role)
DROP POLICY IF EXISTS "Public read login_attempts" ON login_attempts;
DROP POLICY IF EXISTS "Allow public select login_attempts" ON login_attempts;
