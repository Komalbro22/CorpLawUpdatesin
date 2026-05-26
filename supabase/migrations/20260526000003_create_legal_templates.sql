-- supabase/migrations/20260526000003_create_legal_templates.sql
CREATE TABLE IF NOT EXISTS legal_templates (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug              TEXT UNIQUE NOT NULL,
  category          TEXT NOT NULL,
  title             TEXT NOT NULL,
  description       TEXT NOT NULL,
  body              TEXT NOT NULL,
  required_fields   JSONB NOT NULL DEFAULT '[]',
  optional_fields   JSONB NOT NULL DEFAULT '[]',
  search_tags       TEXT[] NOT NULL DEFAULT '{}',
  statutory_basis   TEXT NOT NULL,
  applicable_to     TEXT NOT NULL DEFAULT 'Private Limited, Public Limited',
  effective_from    DATE NOT NULL DEFAULT CURRENT_DATE,
  effective_to      DATE,
  amended_by        TEXT,
  verified_by_name  TEXT,
  verified_by_reg   TEXT,
  verified_on       DATE,
  usage_count       INTEGER DEFAULT 0,
  embedding         vector(768), -- Enable pgvector embedding slots
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- Optimize active template fetching and tags indices
CREATE INDEX IF NOT EXISTS idx_legal_templates_slug ON legal_templates(slug) WHERE effective_to IS NULL;
CREATE INDEX IF NOT EXISTS idx_legal_templates_tags ON legal_templates USING GIN(search_tags);

-- Row Level Security
ALTER TABLE legal_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select active templates" 
ON legal_templates FOR SELECT 
TO public 
USING (effective_to IS NULL);

CREATE POLICY "Allow admin all on templates" 
ON legal_templates FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);
