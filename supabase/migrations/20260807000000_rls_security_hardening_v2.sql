-- RLS Security Hardening & Indexing Optimization Migration (2026-08-07)
-- Fixes public write access on companies_master, generated_documents, and rule engine tables.
-- Adds HNSW vector index for pgvector semantic search and custom RPC for table size retrieval.

-- ── 1. Fix RLS Write Access on companies_master and compliance_rules ──────────
ALTER TABLE IF EXISTS public.companies_master ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.compliance_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.company_data_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin write companies_master" ON public.companies_master;
DROP POLICY IF EXISTS "Admin write compliance_rules" ON public.compliance_rules;
DROP POLICY IF EXISTS "Admin write company_data_audit_log" ON public.company_data_audit_log;

-- Write access reserved strictly for service_role / backend API
CREATE POLICY "Service role write companies_master" ON public.companies_master
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role write compliance_rules" ON public.compliance_rules
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role write company_data_audit_log" ON public.company_data_audit_log
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── 2. Fix RLS Write Access on generated_documents ────────────────────────────
ALTER TABLE IF EXISTS public.generated_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public insert generated_documents" ON public.generated_documents;
DROP POLICY IF EXISTS "Admin write generated_documents" ON public.generated_documents;

-- Public may insert new generated documents, but cannot read or mutate others
CREATE POLICY "Public insert generated_documents" ON public.generated_documents
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Service role all generated_documents" ON public.generated_documents
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── 3. Fix RLS Write Access on Rule Engine Tables ─────────────────────────────
ALTER TABLE IF EXISTS public.intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.clauses ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin write intents" ON public.intents;
DROP POLICY IF EXISTS "Admin write clauses" ON public.clauses;
DROP POLICY IF EXISTS "Admin write rules" ON public.rules;

CREATE POLICY "Service role write intents" ON public.intents
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role write clauses" ON public.clauses
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Service role write rules" ON public.rules
  FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ── 4. Add HNSW Index for pgvector Semantic Search on Intents ─────────────────
CREATE INDEX IF NOT EXISTS idx_intents_embedding_hnsw
  ON public.intents USING hnsw (embedding vector_cosine_ops);

-- ── 5. Safe Security Definer RPC for Table Size Inspection ──────────────────
CREATE OR REPLACE FUNCTION public.get_table_size(relname text)
RETURNS bigint AS $$
BEGIN
  RETURN pg_total_relation_size(relname::regclass);
EXCEPTION WHEN OTHERS THEN
  RETURN 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
