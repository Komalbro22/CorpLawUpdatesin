-- ============================================================
-- ADD TAXATION (CBDT + CBIC + GST) CATEGORY MIGRATION
-- Date: 2026-10-21
-- ============================================================

-- 1. Update updates table category check constraint to include TAXATION
ALTER TABLE updates DROP CONSTRAINT IF EXISTS updates_category_check;
ALTER TABLE updates ADD CONSTRAINT updates_category_check 
  CHECK (category IN ('MCA', 'SEBI', 'RBI', 'NCLT', 'IBC', 'FEMA', 'CCI', 'LABOUR', 'IFSCA', 'TAXATION'));

-- 2. Update compliance_entries table regulator check constraint
ALTER TABLE compliance_entries DROP CONSTRAINT IF EXISTS compliance_entries_regulator_check;
ALTER TABLE compliance_entries ADD CONSTRAINT compliance_entries_regulator_check 
  CHECK (regulator IN ('mca', 'sebi', 'rbi', 'income_tax', 'fema', 'nclt', 'ibc', 'gst', 'labor_law', 'labour', 'cci', 'other', 'ifsca', 'taxation'));

-- 3. Re-categorise the 4 specified tax articles to TAXATION
UPDATE updates
SET category = 'TAXATION', updated_at = NOW()
WHERE slug IN (
  'gstn-e-invoicing-rcm-self-invoices-rcmdom-rcmimp-sandbox-october-2026',
  'cbdt-form-173a-government-securities-tax-exemption',
  'cbdt-tds-exemption-ndb-maharajah-inr-bonds-136-2026',
  'india-mauritius-dtaa-protocol-principal-purpose-test-2026'
);
