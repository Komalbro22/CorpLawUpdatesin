-- ==============================================================================
-- Migration: Document Sets Feature & Legal Data Schedule
-- Tables: legal_data_schedule, document_sets, document_set_steps,
--         document_set_documents, document_set_changelog, document_set_usage
-- ==============================================================================

-- 1. Legal Data Schedule (Single source of truth for fees, deadlines, and statutory sections)
CREATE TABLE IF NOT EXISTS legal_data_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('fee', 'deadline', 'statutory_rule', 'notice_period')),
  label TEXT NOT NULL,
  data_value JSONB NOT NULL,
  governing_section TEXT NOT NULL,
  source_reference TEXT NOT NULL,
  last_verified DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_legal_data_schedule_code ON legal_data_schedule(code);
CREATE INDEX IF NOT EXISTS idx_legal_data_schedule_category ON legal_data_schedule(category);

ALTER TABLE legal_data_schedule ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read legal_data_schedule" ON legal_data_schedule;
CREATE POLICY "Allow public read legal_data_schedule" ON legal_data_schedule FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Allow service role all legal_data_schedule" ON legal_data_schedule;
CREATE POLICY "Allow service role all legal_data_schedule" ON legal_data_schedule FOR ALL TO service_role USING (true) WITH CHECK (true);


-- 2. Document Sets Table (Event-based document packs)
CREATE TABLE IF NOT EXISTS document_sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  event TEXT NOT NULL,
  route_type TEXT NOT NULL,
  variant_tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'published' CHECK (status IN ('draft', 'published', 'under_review', 'archived', 'superseded')),
  version TEXT NOT NULL DEFAULT 'v1.0',
  law_as_at DATE DEFAULT '2026-11-07',
  last_verified DATE DEFAULT '2026-11-07',
  needs_reverification BOOLEAN DEFAULT false,
  reverification_notes TEXT,
  reviewer_name TEXT,
  reviewer_status TEXT DEFAULT 'under_review' CHECK (reviewer_status IN ('under_review', 'signed_off')),
  reviewer_date DATE,
  quick_answer TEXT NOT NULL,
  description TEXT NOT NULL,
  variant_notice TEXT,
  common_mistakes JSONB DEFAULT '[]'::jsonb,
  faqs JSONB DEFAULT '[]'::jsonb,
  seo_title TEXT,
  seo_description TEXT,
  display_order INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_document_sets_slug ON document_sets(slug);
CREATE INDEX IF NOT EXISTS idx_document_sets_status ON document_sets(status);

ALTER TABLE document_sets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read document_sets" ON document_sets;
CREATE POLICY "Allow public read document_sets" ON document_sets FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Allow service role all document_sets" ON document_sets;
CREATE POLICY "Allow service role all document_sets" ON document_sets FOR ALL TO service_role USING (true) WITH CHECK (true);


-- 3. Document Set Steps Table (Interactive checklist steps in filing order)
CREATE TABLE IF NOT EXISTS document_set_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  set_id UUID REFERENCES document_sets(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  document_name TEXT NOT NULL,
  spoke_slug TEXT,
  governing_law TEXT NOT NULL,
  deadline_text TEXT NOT NULL,
  form_name TEXT,
  filing_authority TEXT DEFAULT 'MCA V3',
  is_mandatory BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_document_set_steps_set_id ON document_set_steps(set_id);
CREATE INDEX IF NOT EXISTS idx_document_set_steps_order ON document_set_steps(set_id, step_number);

ALTER TABLE document_set_steps ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read document_set_steps" ON document_set_steps;
CREATE POLICY "Allow public read document_set_steps" ON document_set_steps FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Allow service role all document_set_steps" ON document_set_steps;
CREATE POLICY "Allow service role all document_set_steps" ON document_set_steps FOR ALL TO service_role USING (true) WITH CHECK (true);


-- 4. Document Set Documents Table (Pack documents, versions & template storage)
CREATE TABLE IF NOT EXISTS document_set_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  set_id UUID REFERENCES document_sets(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  spoke_slug TEXT NOT NULL,
  governing_section TEXT NOT NULL,
  step_number INTEGER NOT NULL,
  version TEXT NOT NULL DEFAULT 'v1.0',
  docx_url TEXT,
  pdf_url TEXT,
  template_text TEXT NOT NULL,
  who_signs TEXT,
  when_filed TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'superseded', 'archived')),
  superseded_files JSONB DEFAULT '[]'::jsonb,
  faqs JSONB DEFAULT '[]'::jsonb,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_document_set_documents_slug ON document_set_documents(spoke_slug);
CREATE INDEX IF NOT EXISTS idx_document_set_documents_set_id ON document_set_documents(set_id);

ALTER TABLE document_set_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read document_set_documents" ON document_set_documents;
CREATE POLICY "Allow public read document_set_documents" ON document_set_documents FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Allow service role all document_set_documents" ON document_set_documents;
CREATE POLICY "Allow service role all document_set_documents" ON document_set_documents FOR ALL TO service_role USING (true) WITH CHECK (true);


-- 5. Document Set Changelog Table
CREATE TABLE IF NOT EXISTS document_set_changelog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  set_id UUID REFERENCES document_sets(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  change_date DATE NOT NULL DEFAULT CURRENT_DATE,
  change_note TEXT NOT NULL,
  instrument_reference TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_document_set_changelog_set_id ON document_set_changelog(set_id);

ALTER TABLE document_set_changelog ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read document_set_changelog" ON document_set_changelog;
CREATE POLICY "Allow public read document_set_changelog" ON document_set_changelog FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Allow service role all document_set_changelog" ON document_set_changelog;
CREATE POLICY "Allow service role all document_set_changelog" ON document_set_changelog FOR ALL TO service_role USING (true) WITH CHECK (true);


-- 6. Document Set Usage Table (Privacy-preserving aggregate counters)
CREATE TABLE IF NOT EXISTS document_set_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  set_slug TEXT NOT NULL,
  document_slug TEXT NOT NULL DEFAULT '',
  event_type TEXT NOT NULL CHECK (event_type IN (
    'view',
    'download_docx',
    'download_pdf',
    'download_pack_single',
    'download_pack_zip',
    'checklist_complete',
    'generator_use'
  )),
  event_date DATE NOT NULL DEFAULT CURRENT_DATE,
  count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_document_set_usage_day UNIQUE (set_slug, document_slug, event_type, event_date)
);

CREATE INDEX IF NOT EXISTS idx_document_set_usage_lookup ON document_set_usage(set_slug, event_type, event_date);

ALTER TABLE document_set_usage ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public select usage" ON document_set_usage;
CREATE POLICY "Allow public select usage" ON document_set_usage FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Allow service role all usage" ON document_set_usage;
CREATE POLICY "Allow service role all usage" ON document_set_usage FOR ALL TO service_role USING (true) WITH CHECK (true);
