-- Alter table glossary to add faqs and synonyms columns if they don't exist
ALTER TABLE glossary ADD COLUMN IF NOT EXISTS faqs jsonb DEFAULT '[]'::jsonb;
ALTER TABLE glossary ADD COLUMN IF NOT EXISTS synonyms text[] DEFAULT '{}'::text[];
