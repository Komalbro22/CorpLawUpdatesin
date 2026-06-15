-- Postgres Full-Text Search generated columns (2026-06-15)

-- 1. Updates table search vector (weights: Title A, Summary B, key_change B)
ALTER TABLE updates ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') || ' ' ||
    setweight(to_tsvector('english', coalesce(summary, '')), 'B') || ' ' ||
    setweight(to_tsvector('english', coalesce(key_change, '')), 'B')
  ) STORED;

CREATE INDEX IF NOT EXISTS updates_search_vector_idx ON updates USING GIN (search_vector);

-- 2. Compliance entries search vector
ALTER TABLE compliance_entries ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(form_name, '') || ' ' || coalesce(compliance_title, '') || ' ' || coalesce(applicable_to, ''))
  ) STORED;

CREATE INDEX IF NOT EXISTS compliance_entries_search_vector_idx ON compliance_entries USING GIN (search_vector);

-- Helper function to join array elements immutably for FTS generated columns
CREATE OR REPLACE FUNCTION immutable_array_to_string(arr text[], sep text)
RETURNS text AS $$
  SELECT array_to_string(arr, sep);
$$ LANGUAGE sql IMMUTABLE;

-- 3. Glossary table search vector (includes synonyms and keywords array elements)
ALTER TABLE glossary ADD COLUMN IF NOT EXISTS search_vector tsvector
  GENERATED ALWAYS AS (
    to_tsvector('english', coalesce(term, '') || ' ' || coalesce(definition, '') || ' ' || coalesce(immutable_array_to_string(synonyms, ' '), '') || ' ' || coalesce(immutable_array_to_string(keywords, ' '), ''))
  ) STORED;

CREATE INDEX IF NOT EXISTS glossary_search_vector_idx ON glossary USING GIN (search_vector);
