-- 20260525211520_consent_logs.sql
-- Migration to create the consent_logs table for DPDP Act 2023 compliance
-- Records anonymous, cryptographic proof of disclaimers acceptances

CREATE TABLE IF NOT EXISTS consent_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_hash TEXT NOT NULL,            -- SHA-256 hash of SessionID + timestamp
  template_slug TEXT NOT NULL,           -- e.g., 'mutual_nda_agreement'
  consented_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_masked TEXT NOT NULL,               -- Anonymized IP (e.g., '192.168.XX.XX')
  user_agent TEXT NOT NULL,              -- Browser fingerprint signature
  disclaimer_version TEXT NOT NULL       -- Track disclaimer template revisions
);

-- Enable Row Level Security (RLS)
ALTER TABLE consent_logs ENABLE ROW LEVEL SECURITY;

-- Allow public insert access (Guests must write their consent receipt when downloading)
CREATE POLICY "Allow public insert to consent_logs" 
ON consent_logs FOR INSERT 
TO public 
WITH CHECK (true);

-- Allow admin read access (For audits or dispute resolution)
CREATE POLICY "Allow admin read access to consent_logs" 
ON consent_logs FOR SELECT 
TO authenticated 
USING (true);
