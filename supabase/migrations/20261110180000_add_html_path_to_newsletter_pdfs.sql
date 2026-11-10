-- Migration: 20261110180000_add_html_path_to_newsletter_pdfs.sql
-- Description: Adds html_path column to newsletter_pdfs and configures newsletter-pdfs bucket to allow text/html.
-- Target: Apply to both Primary Supabase (fcosrsznbxedischtbwe) and Secondary Supabase (igglydprjtptmkzvfngg).

-- 1. Add html_path column to public.newsletter_pdfs (nullable text)
ALTER TABLE public.newsletter_pdfs 
ADD COLUMN IF NOT EXISTS html_path TEXT DEFAULT NULL;

-- 2. Update storage bucket newsletter-pdfs allowed MIME types to include text/html
UPDATE storage.buckets
SET allowed_mime_types = ARRAY['application/pdf', 'text/html']::text[]
WHERE id = 'newsletter-pdfs';
