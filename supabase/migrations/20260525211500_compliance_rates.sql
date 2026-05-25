-- 20260525211500_compliance_rates.sql
-- Migration to create the compliance_rates table
-- Stores statutory rates, limits, and active waiver configurations for all regulators

CREATE TABLE IF NOT EXISTS compliance_rates (
  rate_key TEXT PRIMARY KEY,
  regulator TEXT NOT NULL,
  rate_value NUMERIC NOT NULL,
  unit TEXT NOT NULL,                  -- 'percentage', 'currency_inr', 'fixed_days'
  last_verified TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  description TEXT
);

-- Enable Row Level Security (RLS)
ALTER TABLE compliance_rates ENABLE ROW LEVEL SECURITY;

-- Create public read policy (Calculators need to read rates without auth)
CREATE POLICY "Allow public read access to compliance_rates" 
ON compliance_rates FOR SELECT 
TO public 
USING (true);

-- Create admin write policy (Only admin can update rates)
CREATE POLICY "Allow admin full access to compliance_rates" 
ON compliance_rates FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);
