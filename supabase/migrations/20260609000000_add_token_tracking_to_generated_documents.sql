-- Migration: Add token tracking, client details, and indexes to generated_documents
-- Run this script in your Supabase SQL Editor

ALTER TABLE generated_documents 
ADD COLUMN IF NOT EXISTS prompt_tokens INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS completion_tokens INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_tokens INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS ip_address TEXT,
ADD COLUMN IF NOT EXISTS generation_type TEXT DEFAULT 'standard';

-- Constraints to prevent dirty data
ALTER TABLE generated_documents 
DROP CONSTRAINT IF EXISTS chk_generation_type,
ADD CONSTRAINT chk_generation_type CHECK (generation_type IN ('ai', 'standard', 'fallback'));

-- Performance indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_gd_created_at ON generated_documents (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gd_ip_address ON generated_documents (ip_address);
CREATE INDEX IF NOT EXISTS idx_gd_template ON generated_documents (template_name);

-- Seed new site settings for rate limits if they do not exist
INSERT INTO site_settings (key, label, value, description)
VALUES 
  ('max_requests_per_ip_daily', 'Max AI Requests Per IP Daily', '50', 'Daily request limit per unique client IP address for AI generation'),
  ('max_tokens_per_ip_daily', 'Max AI Tokens Per IP Daily', '100000', 'Daily token limit per unique client IP address for AI generation'),
  ('whitelisted_ips', 'Whitelisted Testing IPs', '127.0.0.1', 'Comma-separated list of client IP addresses exempt from daily rate limiting')
ON CONFLICT (key) DO NOTHING;
