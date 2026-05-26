-- supabase/migrations/20260526000002_create_compliance_rates.sql
CREATE TABLE IF NOT EXISTS compliance_rates (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key          TEXT UNIQUE NOT NULL,
  rate_value   NUMERIC,        -- For numeric rates
  text_value   TEXT,           -- For metadata / flags
  last_successful_fetch  TIMESTAMPTZ,
  last_verified          TIMESTAMPTZ DEFAULT NOW(),
  source_url         TEXT,
  source_name        TEXT,
  notes              TEXT,
  created_at         TIMESTAMPTZ DEFAULT NOW(),
  updated_at         TIMESTAMPTZ DEFAULT NOW()
);

-- Seed initial values safely (non-destructive)
INSERT INTO compliance_rates (key, rate_value, text_value, source_name, notes) VALUES
  ('rbi_bank_rate',          6.75, NULL,    'RBI Website', 'Statutory RBI Bank Rate for MSME delayed payment compounding'),
  ('active_amnesty_scheme',  NULL, 'false', 'Manual',      'Set to true when MCA announces CFSS or similar scheme'),
  ('amnesty_scheme_name',    NULL, '',      'Manual',      'e.g., CFSS 2020'),
  ('amnesty_scheme_url',     NULL, '',      'Manual',      'Link to MCA circular'),
  ('whatsapp_member_count',  NULL, '12000', 'Manual',      'WhatsApp member count tracker')
ON CONFLICT (key) DO NOTHING;

-- Row Level Security
ALTER TABLE compliance_rates ENABLE ROW LEVEL SECURITY;

-- Anonymous select access
CREATE POLICY "Allow public select" 
ON compliance_rates FOR SELECT 
TO public 
USING (true);

-- Authenticated service/admin full control
CREATE POLICY "Allow service role write" 
ON compliance_rates FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);
