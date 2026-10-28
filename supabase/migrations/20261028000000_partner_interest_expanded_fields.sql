-- Migration: Add partnership_types, product_description, and message to partner_interests
-- Date: 2026-10-28

ALTER TABLE partner_interests
  ADD COLUMN IF NOT EXISTS partnership_types text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS product_description text,
  ADD COLUMN IF NOT EXISTS message text;

-- GIN index for efficient query filtering on partnership types
CREATE INDEX IF NOT EXISTS idx_partner_interests_partnership_types
  ON partner_interests USING gin (partnership_types);
