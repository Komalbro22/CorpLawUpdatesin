-- Migration: 20261116000000_compliance_calendar_system.sql
-- Description: Compliance Calendar Categories, Entries schema extensions, RLS, and backfill.

-- 1. Create compliance_categories table
CREATE TABLE IF NOT EXISTS compliance_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  colour TEXT NOT NULL DEFAULT 'blue',
  icon TEXT NOT NULL DEFAULT 'Building2',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index on slug
CREATE INDEX IF NOT EXISTS idx_compliance_categories_slug ON compliance_categories(slug);

-- Enable RLS for compliance_categories
ALTER TABLE compliance_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can select compliance categories" ON compliance_categories;
CREATE POLICY "Public can select compliance categories" 
  ON compliance_categories FOR SELECT TO public 
  USING (true);

DROP POLICY IF EXISTS "Service role all compliance categories" ON compliance_categories;
CREATE POLICY "Service role all compliance categories" 
  ON compliance_categories FOR ALL TO authenticated 
  USING (true) WITH CHECK (true);

-- 2. Seed default categories
INSERT INTO compliance_categories (name, slug, colour, icon, sort_order, is_active)
VALUES
  ('MCA / Corporate Laws', 'mca', 'blue', 'Building2', 10, true),
  ('GST & Indirect Taxes', 'gst', 'cyan', 'Receipt', 20, true),
  ('Income Tax & Direct Taxes', 'income_tax', 'orange', 'Calculator', 30, true),
  ('SEBI & Capital Markets', 'sebi', 'purple', 'TrendingUp', 40, true),
  ('Labour Laws & EPFO / ESIC', 'labor_law', 'indigo', 'Users', 50, true),
  ('FEMA & Cross-Border Compliance', 'fema', 'teal', 'Globe', 60, true),
  ('RBI & Banking Regulations', 'rbi', 'emerald', 'Landmark', 70, true),
  ('General & Other Compliances', 'other', 'slate', 'FileText', 80, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  colour = EXCLUDED.colour,
  icon = EXCLUDED.icon,
  sort_order = EXCLUDED.sort_order,
  is_active = EXCLUDED.is_active;

-- 3. Extend compliance_entries table
ALTER TABLE compliance_entries
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES compliance_categories(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS category_slug TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS official_source_url TEXT,
  ADD COLUMN IF NOT EXISTS last_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS original_date TEXT,
  ADD COLUMN IF NOT EXISTS is_extended BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS extension_ref TEXT,
  ADD COLUMN IF NOT EXISTS extension_note TEXT,
  ADD COLUMN IF NOT EXISTS recurrence TEXT DEFAULT 'monthly',
  ADD COLUMN IF NOT EXISTS recurrence_rule JSONB,
  ADD COLUMN IF NOT EXISTS parent_entry_id UUID REFERENCES compliance_entries(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_live BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS ever_live BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deletion_reason TEXT;

-- 4. Backfill existing 103 entries
UPDATE compliance_entries ce
SET
  category_id = cc.id,
  category_slug = ce.regulator,
  official_source_url = COALESCE(ce.official_source_url, ce.official_link),
  last_verified_at = COALESCE(ce.last_verified_at, ce.updated_at, ce.created_at, NOW()),
  recurrence = COALESCE(ce.recurrence, ce.frequency, 'monthly'),
  is_live = COALESCE(ce.is_active, true),
  ever_live = true,
  is_deleted = false
FROM compliance_categories cc
WHERE ce.regulator = cc.slug AND ce.category_id IS NULL;

-- Also set any unmapped entries to 'other'
UPDATE compliance_entries ce
SET
  category_id = (SELECT id FROM compliance_categories WHERE slug = 'other' LIMIT 1),
  category_slug = 'other',
  last_verified_at = COALESCE(ce.last_verified_at, ce.updated_at, ce.created_at, NOW()),
  recurrence = COALESCE(ce.recurrence, ce.frequency, 'monthly'),
  is_live = COALESCE(ce.is_active, true),
  ever_live = true,
  is_deleted = false
WHERE ce.category_id IS NULL;

-- 5. Indexes for fast queries & duplicate guard
CREATE INDEX IF NOT EXISTS idx_compliance_entries_category_id ON compliance_entries(category_id);
CREATE INDEX IF NOT EXISTS idx_compliance_entries_is_deleted ON compliance_entries(is_deleted);
CREATE INDEX IF NOT EXISTS idx_compliance_entries_due_date ON compliance_entries(due_date);
CREATE INDEX IF NOT EXISTS idx_compliance_entries_form_due ON compliance_entries(lower(form_name), due_date) WHERE is_deleted = false;
