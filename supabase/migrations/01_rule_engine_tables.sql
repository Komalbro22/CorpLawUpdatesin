-- ============================================================
-- INTELLIGENT HYBRID LEGAL RULE ENGINE — MIGRATION v1
-- Run in: Supabase Dashboard > SQL Editor
-- ============================================================

-- Step 1: Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Step 2: Intents table — stores normalized intent names + their 768-dim embedding vectors
CREATE TABLE IF NOT EXISTS intents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,       -- e.g. 'ADD_CONFIDENTIALITY', 'ADD_MBP1_DISCLOSURE'
  description TEXT,                        -- Human-readable explanation for admin CMS
  embedding vector(768) NOT NULL,          -- Gemini text-embedding-004 output
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Intent aliases — exact-match phrase lookup bypassing all vector math
CREATE TABLE IF NOT EXISTS intent_aliases (
  phrase VARCHAR(255) PRIMARY KEY,         -- Lowercase, punctuation-stripped e.g. "insert mbp1"
  intent_id UUID NOT NULL REFERENCES intents(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_intent_aliases_intent ON intent_aliases(intent_id);

-- Step 4: Clauses table — versioned legal clause templates with metadata
CREATE TABLE IF NOT EXISTS clauses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_clause_id UUID REFERENCES clauses(id) ON DELETE SET NULL, -- Groups versions together
  version INT NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,       -- Only one active version per intent+doctype
  document_type VARCHAR(100) NOT NULL,           -- 'EMPLOYMENT_CONTRACT', 'BOARD_RESOLUTION', etc.
  category VARCHAR(50) NOT NULL                  -- 'INSERT', 'REMOVE', 'REPLACE', 'FORMAT', 'WARNING'
    CHECK (category IN ('INSERT','REMOVE','REPLACE','FORMAT','WARNING')),
  content TEXT NOT NULL,                         -- Template text with {{variable}} placeholders
  variables JSONB NOT NULL DEFAULT '{}',         -- e.g. {"name":"STRING","location":"CITY","amount":"CURRENCY"}
  placement_rules JSONB NOT NULL DEFAULT '{}',   -- Typed DSL: see PlacementDSL type in Section 2
  legal_basis VARCHAR(255),                      -- "Section 184(1) of the Companies Act, 2013"
  related_forms TEXT[] DEFAULT '{}',             -- e.g. ARRAY['MGT-14','MBP-1']
  compliance_deadline VARCHAR(255),              -- "Within 30 days of the Board Meeting"
  review_due_date TIMESTAMPTZ,                   -- Alert admin when this date is near (legislative review)
  created_by UUID,
  approved_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_active_clauses ON clauses(document_type, is_active, version DESC);

-- Step 5: Rules table — maps an intent + document_type to its active clause, with health metrics
CREATE TABLE IF NOT EXISTS rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  intent_id UUID NOT NULL REFERENCES intents(id) ON DELETE CASCADE,
  clause_id UUID NOT NULL REFERENCES clauses(id) ON DELETE CASCADE,
  document_type VARCHAR(100) NOT NULL,
  usage_count INT NOT NULL DEFAULT 0,
  accepted_count INT NOT NULL DEFAULT 0,
  rejected_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(intent_id, document_type)               -- One active rule per intent per document type
);

-- Step 6: Document clause audit log — tracks which clause version was applied to which document
CREATE TABLE IF NOT EXISTS document_clause_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL,                     -- References generated_documents.id
  clause_id UUID NOT NULL REFERENCES clauses(id) ON DELETE CASCADE,
  version_applied INT NOT NULL,
  applied_by VARCHAR(100),                       -- User identifier
  applied_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_doc_clause_log_document ON document_clause_log(document_id);

-- Step 7: Conflicts table — compliance warning rules (runs as a sweep over document text)
CREATE TABLE IF NOT EXISTS conflicts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_condition JSONB NOT NULL,              -- e.g. {"requires_all": ["Independent Director", "salary"]}
  severity VARCHAR(50) NOT NULL DEFAULT 'INFO'
    CHECK (severity IN ('INFO','WARNING','CRITICAL')),
  message TEXT NOT NULL,
  legal_basis VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 8: Self-learning queue — AI-generalized templates awaiting admin approval
CREATE TABLE IF NOT EXISTS learning_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  original_prompt TEXT NOT NULL,                 -- The actual user input
  generalized_prompt TEXT NOT NULL,              -- Parameterized version: "Add {{name}}'s details for {{location}}"
  proposed_intent VARCHAR(100) NOT NULL,         -- Suggested intent name for admin to review
  ai_clause_draft TEXT NOT NULL,                 -- Full clause text with {{variables}}
  variables_schema JSONB NOT NULL DEFAULT '{}',  -- Extracted slot types
  document_type VARCHAR(100),
  frequency_count INT NOT NULL DEFAULT 1,        -- Must reach 5 before surfacing in admin CMS
  status VARCHAR(50) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approved','rejected')),
  validation_passed BOOLEAN NOT NULL DEFAULT FALSE, -- Schema validation gate flag
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 9: Placement learning queue — logs how verified professionals move clauses
CREATE TABLE IF NOT EXISTS placement_learning_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clause_id UUID REFERENCES clauses(id) ON DELETE CASCADE,
  original_position VARCHAR(255),
  new_position VARCHAR(255),
  document_type VARCHAR(100),
  user_role VARCHAR(100),                        -- 'CA', 'CS', 'Admin' — non-verified excluded
  frequency_count INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 10: pgvector cosine similarity matching function
CREATE OR REPLACE FUNCTION match_intents (
  query_embedding vector(768),
  match_threshold FLOAT,
  match_count INT
)
RETURNS TABLE (
  id UUID,
  name VARCHAR(100),
  similarity FLOAT
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    intents.id,
    intents.name,
    1 - (intents.embedding <=> query_embedding) AS similarity
  FROM intents
  WHERE 1 - (intents.embedding <=> query_embedding) > match_threshold
  ORDER BY intents.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Step 11: Seed initial conflict rules
INSERT INTO conflicts (trigger_condition, severity, message, legal_basis) VALUES
(
  '{"requires_all": ["Independent Director", "salary"]}',
  'CRITICAL',
  'An Independent Director cannot receive a monthly salary under Section 149 of the Companies Act, 2013. Only sitting fees and profit-linked commission are permitted. Review remuneration components immediately.',
  'Section 149(9) of the Companies Act, 2013'
),
(
  '{"requires_all": ["Board Resolution", "MGT-14"]}',
  'INFO',
  'This board resolution may require filing Form MGT-14 with the Registrar of Companies within 30 days. Please verify under Section 117 of the Companies Act, 2013.',
  'Section 117 of the Companies Act, 2013'
)
ON CONFLICT DO NOTHING;
