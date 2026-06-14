-- DB2 RLS Hardening Migration (2026-06-14)
-- Enables Row Level Security (RLS) on rule-engine and clause library tables

-- 1. Enable RLS on all tables
ALTER TABLE intents ENABLE ROW LEVEL SECURITY;
ALTER TABLE intent_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE clauses ENABLE ROW LEVEL SECURITY;
ALTER TABLE rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_clause_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE conflicts ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE placement_learning_queue ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies if any
DROP POLICY IF EXISTS "Public read intents" ON intents;
DROP POLICY IF EXISTS "Admin write intents" ON intents;
DROP POLICY IF EXISTS "Public read intent_aliases" ON intent_aliases;
DROP POLICY IF EXISTS "Admin write intent_aliases" ON intent_aliases;
DROP POLICY IF EXISTS "Public read clauses" ON clauses;
DROP POLICY IF EXISTS "Admin write clauses" ON clauses;
DROP POLICY IF EXISTS "Public read rules" ON rules;
DROP POLICY IF EXISTS "Admin write rules" ON rules;
DROP POLICY IF EXISTS "Public insert doc_clause_log" ON document_clause_log;
DROP POLICY IF EXISTS "Admin read doc_clause_log" ON document_clause_log;
DROP POLICY IF EXISTS "Public read conflicts" ON conflicts;
DROP POLICY IF EXISTS "Admin write conflicts" ON conflicts;
DROP POLICY IF EXISTS "Public insert learning_queue" ON learning_queue;
DROP POLICY IF EXISTS "Admin write learning_queue" ON learning_queue;
DROP POLICY IF EXISTS "Public insert placement_queue" ON placement_learning_queue;
DROP POLICY IF EXISTS "Admin write placement_queue" ON placement_learning_queue;

-- 3. Intents: Public read, Admin write
CREATE POLICY "Public read intents" ON intents FOR SELECT TO public USING (true);
CREATE POLICY "Admin write intents" ON intents FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 4. Intent Aliases: Public read, Admin write
CREATE POLICY "Public read intent_aliases" ON intent_aliases FOR SELECT TO public USING (true);
CREATE POLICY "Admin write intent_aliases" ON intent_aliases FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. Clauses: Public read, Admin write
CREATE POLICY "Public read clauses" ON clauses FOR SELECT TO public USING (is_active = true);
CREATE POLICY "Admin write clauses" ON clauses FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6. Rules: Public read, Admin write
CREATE POLICY "Public read rules" ON rules FOR SELECT TO public USING (true);
CREATE POLICY "Admin write rules" ON rules FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 7. Document Clause Log: Public insert (during gen), Admin all
CREATE POLICY "Public insert doc_clause_log" ON document_clause_log FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Admin read doc_clause_log" ON document_clause_log FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 8. Conflicts: Public read, Admin write
CREATE POLICY "Public read conflicts" ON conflicts FOR SELECT TO public USING (true);
CREATE POLICY "Admin write conflicts" ON conflicts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 9. Learning Queue: Public insert, Admin all
CREATE POLICY "Public insert learning_queue" ON learning_queue FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Admin write learning_queue" ON learning_queue FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 10. Placement Learning Queue: Public insert, Admin all
CREATE POLICY "Public insert placement_queue" ON placement_learning_queue FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Admin write placement_queue" ON placement_learning_queue FOR ALL TO authenticated USING (true) WITH CHECK (true);
