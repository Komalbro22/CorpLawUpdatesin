-- Migration: 20261110000000_create_newsletter_pdfs.sql
-- Description: Create newsletter_pdfs table and storage configuration for weekly newsletter PDF hosting.
-- Target: Apply to both Primary Supabase and Secondary Supabase (https://igglydprjtptmkzvfngg.supabase.co).

-- 1. Create newsletter_pdfs table
CREATE TABLE IF NOT EXISTS public.newsletter_pdfs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  week_label TEXT NOT NULL,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  file_path TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL DEFAULT 0,
  uploaded_by TEXT DEFAULT 'admin',
  download_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Indexes for fast retrieval and chronological sorting
CREATE INDEX IF NOT EXISTS idx_newsletter_pdfs_slug ON public.newsletter_pdfs (slug);
CREATE INDEX IF NOT EXISTS idx_newsletter_pdfs_week_start ON public.newsletter_pdfs (week_start DESC);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.newsletter_pdfs ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
DROP POLICY IF EXISTS "Allow public read on newsletter_pdfs" ON public.newsletter_pdfs;
CREATE POLICY "Allow public read on newsletter_pdfs"
  ON public.newsletter_pdfs
  FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Allow service_role full access on newsletter_pdfs" ON public.newsletter_pdfs;
CREATE POLICY "Allow service_role full access on newsletter_pdfs"
  ON public.newsletter_pdfs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 5. Supabase Storage Bucket Configuration
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'newsletter-pdfs',
  'newsletter-pdfs',
  true,
  10485760,
  ARRAY['application/pdf']::text[]
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['application/pdf']::text[];

-- 6. Storage Bucket Access Policies
DROP POLICY IF EXISTS "Allow public read on newsletter-pdfs" ON storage.objects;
CREATE POLICY "Allow public read on newsletter-pdfs"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'newsletter-pdfs');

DROP POLICY IF EXISTS "Allow service role all on newsletter-pdfs" ON storage.objects;
CREATE POLICY "Allow service role all on newsletter-pdfs"
  ON storage.objects
  FOR ALL
  TO service_role
  USING (bucket_id = 'newsletter-pdfs')
  WITH CHECK (bucket_id = 'newsletter-pdfs');
