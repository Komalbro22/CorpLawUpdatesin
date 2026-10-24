-- ============================================================
-- EXPAND GLOSSARY CATEGORY CHECK CONSTRAINT (CCI, TAXATION, LABOUR, IFSCA)
-- Date: 2026-10-24
-- ============================================================

-- 1. Drop existing category check constraint on glossary table
ALTER TABLE glossary DROP CONSTRAINT IF EXISTS glossary_category_check;

-- 2. Add updated constraint allowing all 10 corporate law categories
ALTER TABLE glossary ADD CONSTRAINT glossary_category_check 
  CHECK (category IN ('MCA', 'SEBI', 'RBI', 'NCLT', 'IBC', 'FEMA', 'CCI', 'LABOUR', 'IFSCA', 'TAXATION'));
