-- supabase/migrations/20260526000004_create_draft_sessions.sql
CREATE TABLE IF NOT EXISTS draft_sessions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token     TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::TEXT,
  template_slug     TEXT REFERENCES legal_templates(slug),
  variables         JSONB NOT NULL DEFAULT '{}',
  conversation      JSONB NOT NULL DEFAULT '[]',
  draft_html        TEXT,
  draft_status      TEXT DEFAULT 'in_progress',
  letterhead_mode   TEXT DEFAULT 'none',
  letterhead_data   JSONB DEFAULT '{}',
  export_log        JSONB DEFAULT '[]',
  expires_at        TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours',
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE draft_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public full control on sessions" 
ON draft_sessions FOR ALL 
TO public 
USING (true)
WITH CHECK (true);
