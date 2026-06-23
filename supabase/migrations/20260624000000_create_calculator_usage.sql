-- ============================================
-- CALCULATOR USAGE TRACKING
-- ============================================

CREATE TABLE IF NOT EXISTS calculator_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  calculator_type text NOT NULL,
  input_data jsonb DEFAULT '{}'::jsonb,
  result_data jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE calculator_usage ENABLE ROW LEVEL SECURITY;

-- Allow public to insert records (since tracking is often anonymous)
CREATE POLICY "Public can insert calculator usage"
  ON calculator_usage FOR INSERT
  WITH CHECK (true);

-- Allow service role to have full access
CREATE POLICY "Service role full access calculator_usage"
  ON calculator_usage USING (auth.role() = 'service_role');
