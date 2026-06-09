-- ============================================================
-- CORPLAWUPDATES CORE DATABASE SCHEMA & SYSTEM SEEDS
-- Run in: Supabase Dashboard > SQL Editor
-- ============================================================

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Updates (Articles) Table
CREATE TABLE IF NOT EXISTS updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  summary TEXT NOT NULL,
  content TEXT,
  category TEXT NOT NULL CHECK (category IN ('MCA','SEBI','RBI','NCLT','IBC','FEMA')),
  tags TEXT[] DEFAULT '{}',
  source_url TEXT,
  source_name TEXT,
  published_at TIMESTAMPTZ,
  is_featured BOOLEAN DEFAULT false,
  effective_date TIMESTAMPTZ,
  featured_image_url TEXT,
  impact_level TEXT,
  key_change TEXT,
  key_changes JSONB DEFAULT '[]'::jsonb,
  seo_description TEXT,
  seo_title TEXT,
  sources JSONB DEFAULT '[]'::jsonb,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Optimize active updates fetching
CREATE INDEX IF NOT EXISTS updates_category_idx ON updates(category);
CREATE INDEX IF NOT EXISTS updates_published_at_idx ON updates(published_at DESC);
CREATE INDEX IF NOT EXISTS updates_slug_idx ON updates(slug);

-- Enable RLS and create policy for Updates
ALTER TABLE updates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read published updates" ON updates;
CREATE POLICY "Public read published updates" ON updates FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Service role full access updates" ON updates;
CREATE POLICY "Service role full access updates" ON updates FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- 2. Document Templates Table
CREATE TABLE IF NOT EXISTS document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN (
    'board_resolution',
    'shareholders_meeting',
    'agreements',
    'appointments',
    'mca_forms',
    'notices',
    'commercial_contracts',
    'company_drafts'
  )),
  template_content TEXT NOT NULL,
  fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  regulation_reference TEXT,
  source TEXT,
  last_verified DATE DEFAULT CURRENT_DATE,
  ai_system_prompt TEXT,
  is_active BOOLEAN DEFAULT true,
  is_free BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and create policy for Templates
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public select templates" ON document_templates;
CREATE POLICY "Allow public select templates" ON document_templates FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Allow service role all templates" ON document_templates;
CREATE POLICY "Allow service role all templates" ON document_templates FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- 3. Generated Documents Table
CREATE TABLE IF NOT EXISTS generated_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID REFERENCES document_templates(id) ON DELETE SET NULL,
  template_name TEXT,
  form_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  original_content TEXT NOT NULL,
  edited_content TEXT NOT NULL,
  session_id TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and create policy for Generated Documents
ALTER TABLE generated_documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public select generated" ON generated_documents;
CREATE POLICY "Allow public select generated" ON generated_documents FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Allow public insert generated" ON generated_documents;
CREATE POLICY "Allow public insert generated" ON generated_documents FOR INSERT TO public WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update generated" ON generated_documents;
CREATE POLICY "Allow public update generated" ON generated_documents FOR UPDATE TO public USING (true);


-- 4. Compliance Calendar Table
CREATE TABLE IF NOT EXISTS compliance_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  compliance TEXT NOT NULL,
  category TEXT NOT NULL,
  due_date TEXT NOT NULL,
  form_name TEXT,
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  penalty TEXT,
  priority TEXT,
  regulation TEXT,
  applicable_to TEXT,
  due_date_sort TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and create policy for Compliance Calendar
ALTER TABLE compliance_calendar ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public select calendar" ON compliance_calendar;
CREATE POLICY "Allow public select calendar" ON compliance_calendar FOR SELECT TO public USING (true);


-- 5. Compliance Entries Table
CREATE TABLE IF NOT EXISTS compliance_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  regulator TEXT NOT NULL CHECK (regulator IN ('mca', 'sebi', 'rbi', 'income_tax', 'fema', 'nclt', 'ibc', 'gst', 'labor_law', 'other')),
  form_name TEXT NOT NULL,
  compliance_title TEXT NOT NULL,
  due_date TEXT NOT NULL,
  applicable_to TEXT NOT NULL,
  frequency TEXT DEFAULT 'monthly',
  penalty TEXT,
  regulation_reference TEXT,
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  official_link TEXT,
  contributor_email TEXT,
  contributor_name TEXT,
  contributor_profession TEXT,
  correction_count INTEGER DEFAULT 0,
  created_by TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and create policy for Compliance Entries
ALTER TABLE compliance_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public select compliance" ON compliance_entries;
CREATE POLICY "Allow public select compliance" ON compliance_entries FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Allow service role all compliance" ON compliance_entries;
CREATE POLICY "Allow service role all compliance" ON compliance_entries FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- 6. Compliance Suggestions Table
CREATE TABLE IF NOT EXISTS compliance_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  compliance_entry_id UUID REFERENCES compliance_entries(id) ON DELETE SET NULL,
  suggestion_type TEXT NOT NULL,
  suggested_correction TEXT,
  error_description TEXT,
  error_field TEXT,
  compliance_title TEXT,
  regulator TEXT,
  form_name TEXT,
  due_date TEXT,
  penalty TEXT,
  regulation_reference TEXT,
  applicable_to TEXT,
  user_name TEXT,
  user_email TEXT NOT NULL,
  user_profession TEXT,
  user_city TEXT,
  user_linkedin TEXT,
  status TEXT DEFAULT 'pending',
  admin_note TEXT,
  contribution_count INTEGER DEFAULT 1,
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and create policy for Suggestions
ALTER TABLE compliance_suggestions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public insert suggestions" ON compliance_suggestions;
CREATE POLICY "Allow public insert suggestions" ON compliance_suggestions FOR INSERT TO public WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public select suggestions" ON compliance_suggestions;
CREATE POLICY "Allow public select suggestions" ON compliance_suggestions FOR SELECT TO public USING (true);


-- 7. Subscribers Table
CREATE TABLE IF NOT EXISTS subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);

-- Enable RLS and create policy for Subscribers
ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public select subscribers" ON subscribers;
CREATE POLICY "Allow public select subscribers" ON subscribers FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Allow public insert subscribers" ON subscribers;
CREATE POLICY "Allow public insert subscribers" ON subscribers FOR INSERT TO public WITH CHECK (true);


-- 8. Login Attempts Table
CREATE TABLE IF NOT EXISTS login_attempts (
  ip TEXT PRIMARY KEY,
  attempts INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;


-- 9. Site Settings Table
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  label TEXT,
  value TEXT,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public select site_settings" ON site_settings;
CREATE POLICY "Allow public select site_settings" ON site_settings FOR SELECT TO public USING (true);


-- 10. Storage Bucket Setup
INSERT INTO storage.buckets (id, name, public)
VALUES ('article-images', 'article-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read article images" ON storage.objects;
CREATE POLICY "Public read article images" ON storage.objects FOR SELECT USING (bucket_id = 'article-images');

DROP POLICY IF EXISTS "Service role upload article images" ON storage.objects;
CREATE POLICY "Service role upload article images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'article-images');


-- ============================================================
-- SEED INITIAL ARTICLES & SITE DATA
-- ============================================================

INSERT INTO updates (title, slug, summary, content, category, is_featured, published_at, impact_level)
VALUES (
  'SEBI Alters Minimum Public Shareholding Norms for Mid-market IPOs',
  'sebi-alters-mps-norms-ipos',
  'The Securities and Exchange Board of India (SEBI) has revised the minimum public shareholding timeline, easing listing standards for mid-cap corporate entities.',
  'SEBI has announced key updates easing capital requirements and timelines to support active market participation by mid-sized corporate organizations in India...',
  'SEBI',
  true,
  NOW(),
  'HIGH'
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO site_settings (key, label, value, description)
VALUES 
  ('announcement_text', 'Active Announcement', 'Welcome to the upgraded CorpLawUpdates legal drafting workspace!', 'Banner notification text'),
  ('announcement_active', 'Announcement Banner Active', 'true', 'Determines if banner is visible')
ON CONFLICT (key) DO NOTHING;
