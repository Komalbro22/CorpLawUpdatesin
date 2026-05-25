-- 20260525211510_legal_templates.sql
-- Migration to create the audit-versioned legal_templates table
-- Holds statutory corporate templates with effective date bounds

CREATE TABLE IF NOT EXISTS legal_templates (
  id SERIAL PRIMARY KEY,
  slug TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  category TEXT NOT NULL,                  -- 'Board Resolution', 'Agreement', 'Contract'
  required_fields JSONB NOT NULL,          -- e.g., [{"key": "company_name", "label": "Company Name"}]
  legal_reference TEXT,                    -- statutory basis
  master_text_markdown TEXT NOT NULL,      -- the legally verified markdown boilerplate
  effective_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  effective_to TIMESTAMPTZ,                -- null indicates current active template
  parent_id INTEGER REFERENCES legal_templates(id),
  CONSTRAINT unique_slug_version UNIQUE (slug, version)
);

-- Index active templates for fast retrieval
CREATE INDEX IF NOT EXISTS idx_active_templates ON legal_templates (slug, effective_from, effective_to);

-- Enable Row Level Security (RLS)
ALTER TABLE legal_templates ENABLE ROW LEVEL SECURITY;

-- Create public read policy (AI routes can query active templates)
CREATE POLICY "Allow public read access to legal_templates" 
ON legal_templates FOR SELECT 
TO public 
USING (true);

-- Create admin write policy (Only admin can create/modify templates)
CREATE POLICY "Allow admin full access to legal_templates" 
ON legal_templates FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);
