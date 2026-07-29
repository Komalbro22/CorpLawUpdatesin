-- ============================================================
-- ADD CCI (COMPETITION COMMISSION OF INDIA) CATEGORY MIGRATION
-- ============================================================

-- 1. Update updates table category check constraint
ALTER TABLE updates DROP CONSTRAINT IF EXISTS updates_category_check;
ALTER TABLE updates ADD CONSTRAINT updates_category_check 
  CHECK (category IN ('MCA', 'SEBI', 'RBI', 'NCLT', 'IBC', 'FEMA', 'CCI'));

-- 2. Update compliance_entries table regulator check constraint
ALTER TABLE compliance_entries DROP CONSTRAINT IF EXISTS compliance_entries_regulator_check;
ALTER TABLE compliance_entries ADD CONSTRAINT compliance_entries_regulator_check 
  CHECK (regulator IN ('mca', 'sebi', 'rbi', 'income_tax', 'fema', 'nclt', 'ibc', 'gst', 'labor_law', 'cci', 'other'));
