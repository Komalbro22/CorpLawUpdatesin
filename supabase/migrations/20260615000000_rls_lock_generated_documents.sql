-- RLS Hardening: Lock down generated_documents (2026-06-15)
-- Public users have no reason to query this table directly;
-- all access flows through Next.js API routes using the service-role client.

-- 1. Drop overly permissive public policies
DROP POLICY IF EXISTS "Allow public select generated" ON generated_documents;
DROP POLICY IF EXISTS "Allow public insert generated" ON generated_documents;
DROP POLICY IF EXISTS "Allow public update generated" ON generated_documents;

-- 2. Service-role (admin) retains full access
DROP POLICY IF EXISTS "Service role full access generated_documents" ON generated_documents;
CREATE POLICY "Service role full access generated_documents"
  ON generated_documents FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
