-- Migration: 20261002000000_agm_glossary_statutory_definition.sql
-- Ensure statutory accuracy of AGM definition under Section 96(1) of the Companies Act, 2013

INSERT INTO glossary (
  term,
  slug,
  definition,
  category,
  keywords,
  extended_note,
  related_terms,
  is_verified,
  faqs,
  synonyms
) VALUES (
  'Annual General Meeting (AGM)',
  'agm',
  'An Annual General Meeting (AGM) is a mandatory yearly gathering of a company''s interested shareholders and directors. Under Section 96(1) of the Companies Act, 2013, the First AGM must be held within 9 months from the closing of the first financial year; subsequent AGMs must be held within 6 months from the closing of the financial year (and not later than 15 months from the previous AGM).',
  'MCA',
  ARRAY['AGM', 'Annual General Meeting', 'Section 96', 'Companies Act 2013', 'First AGM', 'Subsequent AGM'],
  '<!-- METADATA {"seo_title": "AGM (Annual General Meeting) — Section 96 Rules & Timelines", "seo_description": "Learn statutory timelines for Annual General Meetings under Section 96(1) of the Companies Act, 2013: 9 months for First AGM and 6 months for subsequent AGMs."} METADATA -->

## Statutory Framework: Section 96 of Companies Act, 2013

Every company other than an One Person Company (OPC) is statutorily required to hold an Annual General Meeting in each calendar year.

### Key Statutory Requirements
- **First AGM Rule**: Under Section 96(1) of the Companies Act, 2013, the First AGM must be held within 9 months from the closing of the first financial year of the company. When a company holds its first AGM within this period, it is not necessary to hold any AGM in the year of incorporation.
- **Subsequent AGMs**: Must be held within 6 months from the closing of the financial year (typically by 30th September for financial years closing 31st March).
- **Maximum Inter-Meeting Gap**: The interval between two consecutive AGMs must not exceed 15 months.
- **ROC Extension**: The Registrar of Companies may grant an extension up to 3 months for subsequent AGMs for special reasons, but cannot extend the First AGM.

<div class="faq-q">What is the statutory deadline for holding the First AGM under Section 96(1)?</div>
<div class="faq-a">Under Section 96(1) of the Companies Act, 2013, the First AGM must be held within 9 months from the closing of the first financial year. No extension of time can be granted by the Registrar of Companies for the first AGM.</div>

<div class="faq-q">What is the statutory timeline for subsequent AGMs?</div>
<div class="faq-a">Subsequent AGMs must be held within 6 months from the closing of the financial year (typically 30th September for FY ending 31st March) and not later than 15 months from the date of the previous AGM.</div>
',
  ARRAY['Board Meeting', 'Extraordinary General Meeting', 'Financial Year'],
  true,
  '[
    {"q": "What is the statutory deadline for holding the First AGM under Section 96(1)?", "a": "Under Section 96(1) of the Companies Act, 2013, the First AGM must be held within 9 months from the closing of the first financial year."},
    {"q": "What is the statutory timeline for subsequent AGMs?", "a": "Subsequent AGMs must be held within 6 months from the closing of the financial year (and not later than 15 months from the previous AGM)."}
  ]'::jsonb,
  ARRAY['AGM', 'Annual Meeting']
)
ON CONFLICT (slug) DO UPDATE SET
  definition = EXCLUDED.definition,
  extended_note = EXCLUDED.extended_note,
  keywords = EXCLUDED.keywords,
  faqs = EXCLUDED.faqs,
  synonyms = EXCLUDED.synonyms,
  is_verified = true;

INSERT INTO glossary (
  term,
  slug,
  definition,
  category,
  keywords,
  extended_note,
  related_terms,
  is_verified,
  faqs,
  synonyms
) VALUES (
  'Annual General Meeting',
  'annual-general-meeting',
  'An Annual General Meeting (AGM) is a mandatory yearly gathering of a company''s interested shareholders and directors. Under Section 96(1) of the Companies Act, 2013, the First AGM must be held within 9 months from the closing of the first financial year; subsequent AGMs must be held within 6 months from the closing of the financial year (and not later than 15 months from the previous AGM).',
  'MCA',
  ARRAY['AGM', 'Annual General Meeting', 'Section 96', 'Companies Act 2013', 'First AGM', 'Subsequent AGM'],
  '<!-- METADATA {"seo_title": "Annual General Meeting — Meaning, Section 96 Timelines & Compliances", "seo_description": "Under Section 96(1) of the Companies Act 2013, First AGM must be held within 9 months of FY end; subsequent AGMs within 6 months. Detailed statutory analysis."} METADATA -->

## Statutory Framework: Section 96 of Companies Act, 2013

Every company other than an One Person Company (OPC) is statutorily required to hold an Annual General Meeting in each calendar year.

### Key Statutory Requirements
- **First AGM Rule**: Under Section 96(1) of the Companies Act, 2013, the First AGM must be held within 9 months from the closing of the first financial year of the company. When a company holds its first AGM within this period, it is not necessary to hold any AGM in the year of incorporation.
- **Subsequent AGMs**: Must be held within 6 months from the closing of the financial year (typically by 30th September for financial years closing 31st March).
- **Maximum Inter-Meeting Gap**: The interval between two consecutive AGMs must not exceed 15 months.
- **ROC Extension**: The Registrar of Companies may grant an extension up to 3 months for subsequent AGMs for special reasons, but cannot extend the First AGM.

<div class="faq-q">What is the statutory deadline for holding the First AGM under Section 96(1)?</div>
<div class="faq-a">Under Section 96(1) of the Companies Act, 2013, the First AGM must be held within 9 months from the closing of the first financial year. No extension of time can be granted by the Registrar of Companies for the first AGM.</div>

<div class="faq-q">What is the statutory timeline for subsequent AGMs?</div>
<div class="faq-a">Subsequent AGMs must be held within 6 months from the closing of the financial year (typically 30th September for FY ending 31st March) and not later than 15 months from the date of the previous AGM.</div>
',
  ARRAY['Board Meeting', 'Extraordinary General Meeting', 'Financial Year'],
  true,
  '[
    {"q": "What is the statutory deadline for holding the First AGM under Section 96(1)?", "a": "Under Section 96(1) of the Companies Act, 2013, the First AGM must be held within 9 months from the closing of the first financial year."},
    {"q": "What is the statutory timeline for subsequent AGMs?", "a": "Subsequent AGMs must be held within 6 months from the closing of the financial year (and not later than 15 months from the previous AGM)."}
  ]'::jsonb,
  ARRAY['AGM', 'Annual Meeting']
)
ON CONFLICT (slug) DO UPDATE SET
  definition = EXCLUDED.definition,
  extended_note = EXCLUDED.extended_note,
  keywords = EXCLUDED.keywords,
  faqs = EXCLUDED.faqs,
  synonyms = EXCLUDED.synonyms,
  is_verified = true;
