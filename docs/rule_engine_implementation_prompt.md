# Intelligent Hybrid Legal Drafting Rule Engine — Complete Sectioned Implementation Plan

> **HOW TO USE THIS DOCUMENT**
> This plan is divided into **9 self-contained sections**. Implement one section at a time.
> After each section, run error checks and confirm the section is working before moving to the next.
> At the end of each section, report: **"Section [N] complete. No errors. Ready for Section [N+1]?"**

---

## PROJECT CONTEXT (Read Before Starting Any Section)

**Platform:** `corplawupdates.in` — a legal document drafting platform for Indian CAs and Company Secretaries.
**Stack:** Next.js 14 (App Router), TypeScript, Supabase (PostgreSQL + pgvector), Google Gemini AI, Upstash Redis, Tailwind CSS.
**Goal:** Replace the existing "always-call-Gemini" edit pipeline with a deterministic-first hybrid engine:
- **Tier 1:** Alias DB match → <1ms, $0 cost
- **Tier 2:** Redis centroid cache → <3ms, $0 cost
- **Tier 3:** pgvector semantic match → <25ms, $0 cost
- **Tier 4:** AI fallback (Gemini) → ~4s, ~$0.01 cost

**Existing files you must NOT break:**
- `lib/supabase.ts` — browser client
- `lib/supabase-server.ts` — exports `supabaseAdmin` (bypasses RLS)
- `lib/gemini.ts` — exports `getEmbedding(text)`, `extractVariables(...)`, `generateCustomDraft(...)`
- `app/api/documents/generate/route.ts` — document generation (do not break existing form generation)
- `app/api/documents/edit/route.ts` — **CRITICAL INTEGRATION POINT** — this is the route you will intercept
- `app/api/documents/intent/route.ts` — template search (do not touch)
- `app/documents/[slug]/page.tsx` — main drafting workspace UI

---

## SECTION 1 — Database Schema Migration

**What you are doing:** Creating all new database tables, indexes, and a pgvector similarity function in Supabase. This is pure SQL — no code changes yet.

**File to create:** `supabase/migrations/01_rule_engine_tables.sql`

**Instructions:**
Create this file and paste the following complete SQL script. This must be run in the Supabase SQL Editor after the file is created.

```sql
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
```

**After creating the file:**
1. Go to Supabase Dashboard → SQL Editor
2. Paste and run the entire script above
3. Verify in the Table Editor that these tables exist: `intents`, `intent_aliases`, `clauses`, `rules`, `document_clause_log`, `conflicts`, `learning_queue`, `placement_learning_queue`
4. Verify the `match_intents` function exists under Database → Functions

**Error checks:**
- If `pgvector` extension fails: Go to Supabase Dashboard → Database → Extensions → search "vector" → Enable it, then re-run
- If any table already exists, the `IF NOT EXISTS` guard prevents errors
- Confirm all 8 tables are visible before proceeding

**When done, report:** `Section 1 complete. 8 tables created, match_intents function verified. No errors. Ready for Section 2?`

---

## SECTION 2 — Classifier & Caching API Route

**What you are doing:** Creating the brain of the rule engine — the `/api/rule-engine/classify` endpoint. This handles prompt normalization → alias lookup → Redis cache → pgvector similarity routing.

**Dependencies:** Section 1 must be complete. `lib/supabase-server.ts` (supabaseAdmin), `lib/gemini.ts` (getEmbedding) must exist.

**Packages to install first:**
```bash
npm install @upstash/redis @upstash/ratelimit
```

**Environment variables to add to `.env.local`:**
```
UPSTASH_REDIS_REST_URL=your_upstash_url_here
UPSTASH_REDIS_REST_TOKEN=your_upstash_token_here
```
> Get these from https://console.upstash.com — create a free Redis database.

**File to create:** `app/api/rule-engine/classify/route.ts`

```typescript
// app/api/rule-engine/classify/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { getEmbedding } from '@/lib/gemini';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

// ─── Redis client (Upstash) ───────────────────────────────────────────────────
const redis = Redis.fromEnv();

// Rate limiter: max 20 AI embedding calls per user per day
const rateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.tokenBucket(20, '1 d', 20),
});

// ─── Text normalization ───────────────────────────────────────────────────────
// Strips stop-words, punctuation, and lowercases for alias DB matching
function normalizePrompt(prompt: string): string {
  return prompt
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g, '')
    .replace(/\b(please|the|a|an|could|you|insert|add|put|show|make|in|for|to|into|section)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ─── Legal Lexicon fuzzy spell-check ─────────────────────────────────────────
// Levenshtein distance for domain-specific term fuzzy matching
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

// Tries to fix typos in known legal terms using DB-seeded lexicon
async function applyLegalSpellCheck(normalized: string): Promise<string> {
  // Fetch known intent names as the legal lexicon
  const { data: intents } = await supabaseAdmin
    .from('intents')
    .select('name');

  if (!intents) return normalized;

  // Build a flat word list from intent names e.g. ["confidentiality", "disclosure", "mbp1"]
  const lexicon = intents.flatMap(i =>
    i.name.toLowerCase().split('_').filter(w => w.length > 2)
  );

  const words = normalized.split(' ');
  const corrected = words.map(word => {
    // Only check words that are at least 60% similar to a known lexicon term
    let bestMatch = word;
    let bestScore = Infinity;
    for (const term of lexicon) {
      const dist = levenshtein(word, term);
      const similarity = 1 - dist / Math.max(word.length, term.length);
      if (similarity >= 0.6 && dist < bestScore) {
        bestScore = dist;
        bestMatch = term;
      }
    }
    return bestMatch;
  });

  return corrected.join(' ');
}

// ─── POST handler ─────────────────────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    const { prompt, userId, docType } = await request.json();

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
    }

    // ── STEP 1: Normalize prompt ──────────────────────────────────────────────
    let normalized = normalizePrompt(prompt);

    // ── STEP 2: Alias DB lookup (1ms, $0) ────────────────────────────────────
    const { data: aliasMatch } = await supabaseAdmin
      .from('intent_aliases')
      .select('intent_id, intents(id, name)')
      .eq('phrase', normalized)
      .single();

    if (aliasMatch) {
      const intentData = (aliasMatch as any).intents;
      return NextResponse.json({
        status: 'success',
        confidence: 1.0,
        intent: intentData.name,
        intentId: intentData.id,
        source: 'alias_table',
      });
    }

    // ── STEP 3: Apply legal spell-check and re-check alias ───────────────────
    const spellChecked = await applyLegalSpellCheck(normalized);
    if (spellChecked !== normalized) {
      const { data: spellMatch } = await supabaseAdmin
        .from('intent_aliases')
        .select('intent_id, intents(id, name)')
        .eq('phrase', spellChecked)
        .single();

      if (spellMatch) {
        const intentData = (spellMatch as any).intents;
        return NextResponse.json({
          status: 'success',
          confidence: 0.98,
          intent: intentData.name,
          intentId: intentData.id,
          source: 'alias_spellchecked',
        });
      }
    }

    // ── STEP 4: Redis centroid cache lookup (3ms, $0) ─────────────────────────
    const cacheKey = `centroid:${normalized}`;
    const cachedResult = await redis.get<string>(cacheKey);
    if (cachedResult) {
      return NextResponse.json(
        typeof cachedResult === 'string' ? JSON.parse(cachedResult) : cachedResult
      );
    }

    // ── STEP 5: Rate-limit before calling Gemini for embeddings ───────────────
    const rateLimitId = userId || 'anonymous';
    const { success: withinLimit } = await rateLimiter.limit(rateLimitId);
    if (!withinLimit) {
      return NextResponse.json({
        status: 'fallback_to_ai',
        reason: 'rate_limit_exceeded',
      });
    }

    // ── STEP 6: Compute Gemini embeddings ────────────────────────────────────
    const embedding = await getEmbedding(prompt);

    // ── STEP 7: pgvector cosine similarity query ──────────────────────────────
    const { data: intentMatches, error: matchError } = await supabaseAdmin.rpc('match_intents', {
      query_embedding: embedding,
      match_threshold: 0.70,
      match_count: 1,
    });

    if (matchError || !intentMatches || intentMatches.length === 0) {
      return NextResponse.json({ status: 'fallback_to_ai', source: 'no_match' });
    }

    const match = intentMatches[0];

    // ── STEP 8: Route by confidence bands ────────────────────────────────────
    // Band 1: HIGH confidence (≥88%) → deterministic rule execution
    if (match.similarity >= 0.88) {
      const responsePayload = {
        status: 'success',
        confidence: match.similarity,
        intent: match.name,
        intentId: match.id,
        source: 'pgvector_exact',
      };
      // Cache for 24 hours
      await redis.set(cacheKey, JSON.stringify(responsePayload), { ex: 86400 });
      return NextResponse.json(responsePayload);
    }

    // Band 2: MEDIUM confidence (70–88%) → FuzzyClarifier UI confirmation
    if (match.similarity >= 0.70 && match.similarity < 0.88) {
      return NextResponse.json({
        status: 'fuzzy_match',
        confidence: match.similarity,
        intent: match.name,
        intentId: match.id,
        suggested_label: `Add ${match.name.replace('ADD_', '').replace(/_/g, ' ').toLowerCase()} clause`,
        source: 'pgvector_fuzzy',
      });
    }

    // Band 3: LOW confidence (<70%) → AI fallback
    return NextResponse.json({ status: 'fallback_to_ai', source: 'low_confidence' });

  } catch (error: any) {
    console.error('[classify/route.ts] Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

**After creating the file, test it:**
```bash
# Test alias miss → should return fallback_to_ai (no intents seeded yet)
curl -X POST http://localhost:3000/api/rule-engine/classify \
  -H "Content-Type: application/json" \
  -d '{"prompt": "add confidentiality clause", "userId": "test-user"}'
```
Expected response: `{"status":"fallback_to_ai","source":"no_match"}` (correct — no intents seeded yet)

**Error checks:**
- If `Redis.fromEnv()` throws: verify UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are in `.env.local`
- If `getEmbedding` import fails: verify `lib/gemini.ts` exports this function by name
- If `supabaseAdmin` import fails: verify `lib/supabase-server.ts` exports it
- TypeScript errors on `aliasMatch`: The `.intents` join is typed as `any` intentionally — acceptable here

**When done, report:** `Section 2 complete. classify/route.ts created, test returns fallback_to_ai as expected. No errors. Ready for Section 3?`

---

## SECTION 3 — Rule Router, Placement Engine & Variable Interpolation

**What you are doing:** Creating the core execution library that takes a matched intent, fetches the clause, interpolates variables, runs the Placement DSL, prevents silent overwrites, and checks critical compliance inline.

**File to create:** `lib/rule-engine/router.ts`

First create the directory:
```bash
mkdir -p lib/rule-engine
```

```typescript
// lib/rule-engine/router.ts
import { supabaseAdmin } from '@/lib/supabase-server';

// ─── Placement DSL Type ───────────────────────────────────────────────────────
// All placement_rules JSONB in the DB must strictly conform to this shape
export type PlacementDSL = {
  action: 'INSERT_AFTER' | 'INSERT_BEFORE' | 'REPLACE' | 'APPEND';
  anchor: string;
  anchor_type: 'HEADING' | 'CLAUSE_ID' | 'REGEX';
  fallback: 'BOTTOM' | 'TOP';
};

// ─── Validate Placement DSL ───────────────────────────────────────────────────
export function validatePlacementDSL(obj: any): obj is PlacementDSL {
  return (
    obj &&
    ['INSERT_AFTER', 'INSERT_BEFORE', 'REPLACE', 'APPEND'].includes(obj.action) &&
    typeof obj.anchor === 'string' &&
    ['HEADING', 'CLAUSE_ID', 'REGEX'].includes(obj.anchor_type) &&
    ['BOTTOM', 'TOP'].includes(obj.fallback)
  );
}

// ─── Levenshtein Distance (for silent overwrite protection) ───────────────────
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

// ─── Indian Number-to-Words ───────────────────────────────────────────────────
function numberToWordsIndian(num: number): string {
  if (num === 0) return 'Zero';
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
    'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertHundreds(n: number): string {
    if (n >= 100) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertHundreds(n % 100) : '');
    if (n >= 20) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
    return ones[n];
  }

  let result = '';
  if (num >= 10000000) { result += convertHundreds(Math.floor(num / 10000000)) + ' Crore '; num %= 10000000; }
  if (num >= 100000) { result += convertHundreds(Math.floor(num / 100000)) + ' Lakh '; num %= 100000; }
  if (num >= 1000) { result += convertHundreds(Math.floor(num / 1000)) + ' Thousand '; num %= 1000; }
  if (num > 0) result += convertHundreds(num);
  return result.trim();
}

// ─── Markdown to HTML ─────────────────────────────────────────────────────────
function markdownToHtml(md: string): string {
  return md
    .replace(/^### (.+)/gm, '<h3>$1</h3>')
    .replace(/^## (.+)/gm, '<h2>$1</h2>')
    .replace(/^# (.+)/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[h|p])(.+)/gm, '<p>$1</p>');
}

// ─── Variable Extractor using Gemini NER ─────────────────────────────────────
// Extracts named entities from user prompt based on the clause's variables schema
export async function extractVariablesFromPrompt(
  prompt: string,
  variablesSchema: Record<string, string>
): Promise<Record<string, string>> {
  if (Object.keys(variablesSchema).length === 0) return {};

  // Use Gemini extractVariables from lib/gemini.ts
  const { extractVariables } = await import('@/lib/gemini');

  // Convert variables schema to a field spec compatible with extractVariables
  const fieldsSpec = Object.entries(variablesSchema).map(([key, type]) => ({
    name: key,
    type: type,
    description: `Extract the ${key} (${type}) from the user message`
  }));

  try {
    const extracted = await extractVariables(fieldsSpec, prompt, []);
    return extracted || {};
  } catch {
    return {};
  }
}

// ─── Main Rule Execution Engine ───────────────────────────────────────────────
export async function executeRule(
  currentText: string,
  clauseId: string,
  extractedVariables: Record<string, string>,
  documentId?: string
): Promise<{
  text: string;
  inlineWarnings: string[];
  clauseVersion: number;
  missingVariables: string[];
}> {
  // 1. Fetch active clause version from DB
  const { data: clause, error: clauseError } = await supabaseAdmin
    .from('clauses')
    .select('*')
    .eq('id', clauseId)
    .eq('is_active', true)
    .single();

  if (clauseError || !clause) {
    throw new Error(`Active clause not found for id: ${clauseId}`);
  }

  // Validate placement DSL before proceeding
  if (!validatePlacementDSL(clause.placement_rules)) {
    throw new Error(`Invalid placement_rules DSL on clause ${clauseId}. Expected: {action, anchor, anchor_type, fallback}`);
  }

  // 2. Check for missing required variables → surface to UI for user input
  const requiredVars = Object.keys(clause.variables || {});
  const missingVariables = requiredVars.filter(k => !extractedVariables[k]);

  // 3. Variable interpolation with value normalization
  let interpolatedClause = clause.content;
  Object.entries(extractedVariables).forEach(([key, val]) => {
    let normalizedValue = val;

    if (clause.variables[key] === 'CURRENCY' && /^\d+$/.test(val)) {
      const num = parseInt(val);
      normalizedValue = `₹${num.toLocaleString('en-IN')} (Rupees ${numberToWordsIndian(num)} Only)`;
    }

    if (clause.variables[key] === 'DATE') {
      // Ensure Indian date format: 27th May, 2026
      const d = new Date(val);
      if (!isNaN(d.getTime())) {
        const day = d.getDate();
        const suffix = ['th','st','nd','rd'][(day % 10 > 3 || Math.floor(day / 10) === 1) ? 0 : day % 10] || 'th';
        normalizedValue = `${day}${suffix} ${d.toLocaleString('en-IN', { month: 'long' })}, ${d.getFullYear()}`;
      }
    }

    if (clause.variables[key] === 'TIME') {
      // Ensure uppercase meridian: 11:00 A.M. (no double periods)
      normalizedValue = val.toUpperCase().replace(/AM\.?\s*$/, 'A.M.').replace(/PM\.?\s*$/, 'P.M.').replace(/A\.M\.\./g, 'A.M.').replace(/P\.M\.\./g, 'P.M.');
    }

    interpolatedClause = interpolatedClause.replace(new RegExp(`{{${key}}}`, 'g'), normalizedValue);
  });

  // 4. Format safeguard: convert MD to HTML if document is HTML
  const isHtml = currentText.includes('<p>') || currentText.includes('</div>') || currentText.includes('<br');
  if (isHtml) {
    interpolatedClause = markdownToHtml(interpolatedClause);
  }

  // 5. Execute Placement DSL
  const placement: PlacementDSL = clause.placement_rules;
  let lines = currentText.split('\n');
  let injected = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let isMatch = false;

    if (placement.anchor_type === 'HEADING') {
      isMatch = line.trim().startsWith('#') && line.toLowerCase().includes(placement.anchor.toLowerCase());
    } else if (placement.anchor_type === 'REGEX') {
      try {
        isMatch = new RegExp(placement.anchor, 'i').test(line);
      } catch {
        isMatch = false;
      }
    } else if (placement.anchor_type === 'CLAUSE_ID') {
      isMatch = line.includes(placement.anchor);
    }

    if (isMatch) {
      if (placement.action === 'INSERT_AFTER') {
        lines.splice(i + 1, 0, '\n' + interpolatedClause + '\n');
        injected = true;
        break;
      } else if (placement.action === 'INSERT_BEFORE') {
        lines.splice(i, 0, '\n' + interpolatedClause + '\n');
        injected = true;
        break;
      } else if (placement.action === 'REPLACE') {
        // Silent overwrite prevention: check if block has been user-customized
        const targetBlock = lines[i];
        if (targetBlock.length > 20) {
          const editDistance = levenshtein(
            targetBlock.toLowerCase().trim(),
            (clause.content || '').toLowerCase().trim().slice(0, targetBlock.length)
          );
          const similarity = 1 - editDistance / Math.max(targetBlock.length, 30);
          if (similarity < 0.85) {
            // Block appears heavily modified — route to Gemini for smart merge instead
            throw new Error('CUSTOM_MODIFIED_BLOCK_DETECTED');
          }
        }
        lines[i] = interpolatedClause;
        injected = true;
        break;
      } else if (placement.action === 'APPEND') {
        lines.splice(i + 1, 0, '\n' + interpolatedClause + '\n');
        injected = true;
        break;
      }
    }
  }

  // Fallback if no anchor found
  if (!injected) {
    if (placement.fallback === 'TOP') {
      lines.unshift('\n' + interpolatedClause + '\n');
    } else {
      lines.push('\n' + interpolatedClause + '\n');
    }
  }

  const updatedText = lines.join('\n');

  // 6. Lightweight inline CRITICAL compliance check
  const inlineWarnings: string[] = [];

  // Fetch conflicts and check against combined document text
  const { data: conflictRules } = await supabaseAdmin
    .from('conflicts')
    .select('*')
    .eq('severity', 'CRITICAL');

  if (conflictRules) {
    for (const conflict of conflictRules) {
      const conditions: string[] = conflict.trigger_condition?.requires_all || [];
      const allPresent = conditions.every((term: string) =>
        updatedText.toLowerCase().includes(term.toLowerCase())
      );
      if (allPresent) {
        inlineWarnings.push(`[${conflict.severity}] ${conflict.message}`);
      }
    }
  }

  // 7. Log clause application for audit trail
  if (documentId) {
    await supabaseAdmin.from('document_clause_log').insert({
      document_id: documentId,
      clause_id: clause.id,
      version_applied: clause.version,
    });
  }

  // 8. Increment usage count on the rule
  await supabaseAdmin
    .from('rules')
    .update({ usage_count: supabaseAdmin.rpc('increment', { x: 1 }) })
    .eq('clause_id', clauseId);

  return {
    text: updatedText,
    inlineWarnings,
    clauseVersion: clause.version,
    missingVariables,
  };
}
```

**Also create the index file for the rule-engine lib:**

`lib/rule-engine/index.ts`
```typescript
export { executeRule, extractVariablesFromPrompt, validatePlacementDSL } from './router';
export type { PlacementDSL } from './router';
```

**Error checks:**
- If TypeScript errors on `supabaseAdmin.rpc('increment', ...)`: replace that line with a raw SQL approach or just `usage_count: clause.usage_count + 1` using a separate fetch first
- Verify `extractVariables` export name in `lib/gemini.ts` matches exactly
- Run `npx tsc --noEmit` to check for type errors before proceeding

**When done, report:** `Section 3 complete. lib/rule-engine/router.ts created, compiles with no TypeScript errors. Ready for Section 4?`

---

## SECTION 4 — Intercept edit/route.ts & AI Generalization Pipe

**What you are doing:** Modifying the existing `app/api/documents/edit/route.ts` to intercept user edit commands BEFORE calling Gemini. If the rule engine can handle it deterministically, it responds instantly. If not, it falls through to Gemini AND triggers a background generalization job to learn from this AI interaction.

**File to MODIFY:** `app/api/documents/edit/route.ts`

**IMPORTANT:** Do not delete or break the existing Gemini fallback logic. You are wrapping it, not replacing it.

Read the existing file fully first, then integrate the following logic at the TOP of the POST handler, before any Gemini call:

```typescript
// app/api/documents/edit/route.ts
// ── Add these imports at the top of the existing file ─────────────────────────
import { executeRule, extractVariablesFromPrompt } from '@/lib/rule-engine';

// ── Inside your existing POST handler, BEFORE the Gemini call ─────────────────
// Add this block where `edit_instruction` is the user's chat command
// and `current_content` is the current document text

// === RULE ENGINE INTERCEPT ===
try {
  const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const classifyResponse = await fetch(`${origin}/api/rule-engine/classify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: edit_instruction,
      userId: user_id || 'anonymous',
      docType: doc_type || 'GENERAL',
    }),
  });

  const classification = await classifyResponse.json();

  // ── HIGH CONFIDENCE: Execute deterministically ────────────────────────────
  if (classification.status === 'success') {
    // Fetch the rule for this intent + document type
    const { data: rule } = await supabaseAdmin
      .from('rules')
      .select('clause_id')
      .eq('intent_id', classification.intentId)
      .single();

    if (rule?.clause_id) {
      // Extract variables from the user's prompt using the clause's variable schema
      const { data: clause } = await supabaseAdmin
        .from('clauses')
        .select('variables')
        .eq('id', rule.clause_id)
        .single();

      let extractedVars: Record<string, string> = {};
      if (clause?.variables && Object.keys(clause.variables).length > 0) {
        extractedVars = await extractVariablesFromPrompt(edit_instruction, clause.variables);
      }

      // Check if any required variables are missing → signal UI to show input form
      const requiredVars = Object.keys(clause?.variables || {});
      const missingVars = requiredVars.filter(k => !extractedVars[k]);

      if (missingVars.length > 0) {
        return NextResponse.json({
          success: true,
          requiresInput: true,
          missingVariables: missingVars,
          clauseId: rule.clause_id,
          currentVariables: extractedVars,
          source: 'rule_engine_needs_input',
        });
      }

      try {
        const ruleResult = await executeRule(
          current_content,
          rule.clause_id,
          extractedVars,
          document_id
        );

        // Increment rule accepted_count (user got a result)
        await supabaseAdmin
          .from('rules')
          .update({ accepted_count: supabaseAdmin.rpc('increment', { x: 1 }) })
          .eq('clause_id', rule.clause_id);

        return NextResponse.json({
          success: true,
          content: ruleResult.text,
          inlineWarnings: ruleResult.inlineWarnings,
          missingVariables: ruleResult.missingVariables,
          source: 'rule_engine',
          confidence: classification.confidence,
          clauseVersion: ruleResult.clauseVersion,
        });

      } catch (ruleError: any) {
        if (ruleError.message === 'CUSTOM_MODIFIED_BLOCK_DETECTED') {
          // Block was user-modified — fall through to Gemini for smart merge
          console.log('[edit/route.ts] Custom block detected, routing to Gemini smart merge');
          // Falls through to existing Gemini logic below
        } else {
          throw ruleError;
        }
      }
    }
  }

  // ── FUZZY MATCH: Return suggestion to trigger FuzzyClarifier UI ──────────
  if (classification.status === 'fuzzy_match') {
    return NextResponse.json({
      success: true,
      fuzzyMatch: true,
      suggestion: {
        intentId: classification.intentId,
        intent: classification.intent,
        confidence: classification.confidence,
        suggested_label: classification.suggested_label,
      },
      source: 'rule_engine_fuzzy',
    });
  }

  // classification.status === 'fallback_to_ai' → continues to existing Gemini code below

} catch (interceptError: any) {
  // If rule engine itself errors, log and fall through gracefully to Gemini
  console.error('[edit/route.ts] Rule engine intercept error:', interceptError.message);
  // Falls through to existing Gemini logic
}
// === END RULE ENGINE INTERCEPT ===

// ... your existing Gemini call continues here unchanged ...
```

**After the Gemini call succeeds, add the AI Generalization Pipe:**
```typescript
// After: const aiResponse = ... (your existing Gemini response variable)
// Add this AFTER the Gemini call, as a non-blocking background job:

// === AI GENERALIZATION PIPE (background, non-blocking) ===
(async () => {
  try {
    const { generateCustomDraft } = await import('@/lib/gemini');

    // Ask Gemini to generalize the specific prompt into a reusable parameterized template
    const generalizationPrompt = `
You are a legal template engineer. A user made this edit request to a legal document:
"${edit_instruction}"

The AI produced this clause/change in response:
"${aiResponseText.substring(0, 500)}"

Your task: Extract a generalized, reusable template from this interaction.
Respond ONLY with a valid JSON object (no markdown, no backticks):
{
  "proposed_intent": "ADD_INTENT_NAME_IN_CAPS",
  "generalized_clause": "The full clause text with {{variable_name}} placeholders for any specific values",
  "variables_schema": {"variable_name": "STRING|CITY|DATE|CURRENCY|NAME"},
  "document_type": "BOARD_RESOLUTION|EMPLOYMENT_CONTRACT|GENERAL"
}

Rules:
- proposed_intent must start with ADD_, REMOVE_, REPLACE_, or FORMAT_
- Only create placeholders for things that change between uses (names, dates, amounts, locations)
- Do NOT create placeholders for legal boilerplate that never changes
- If the clause is too specific (person's name, specific CIN) to generalize, return {"skip": true}
    `.trim();

    const generalizationResponse = await generateCustomDraft(generalizationPrompt, '', 'GENERAL');
    const cleanJson = generalizationResponse.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    if (parsed.skip) return; // Too specific, don't queue

    // Validate: must have at least one {{variable}} placeholder
    const hasPlaceholder = /{{[a-zA-Z_]+}}/.test(parsed.generalized_clause || '');
    if (!hasPlaceholder) return; // Failed quality gate

    // Validate variables_schema keys match placeholders in clause
    const placeholders = [...(parsed.generalized_clause || '').matchAll(/{{([a-zA-Z_]+)}}/g)].map(m => m[1]);
    const schemaKeys = Object.keys(parsed.variables_schema || {});
    const allAccountedFor = placeholders.every(p => schemaKeys.includes(p));
    if (!allAccountedFor) return; // Failed quality gate

    // Check if this prompt pattern already exists in the queue (upsert frequency_count)
    const { data: existing } = await supabaseAdmin
      .from('learning_queue')
      .select('id, frequency_count')
      .eq('proposed_intent', parsed.proposed_intent)
      .eq('status', 'pending')
      .single();

    if (existing) {
      await supabaseAdmin
        .from('learning_queue')
        .update({ frequency_count: existing.frequency_count + 1, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
    } else {
      await supabaseAdmin.from('learning_queue').insert({
        original_prompt: edit_instruction,
        generalized_prompt: parsed.generalized_clause,
        proposed_intent: parsed.proposed_intent,
        ai_clause_draft: parsed.generalized_clause,
        variables_schema: parsed.variables_schema,
        document_type: parsed.document_type || 'GENERAL',
        frequency_count: 1,
        validation_passed: true,
      });
    }
  } catch (genError: any) {
    // Non-fatal: generalization failing should never affect the user response
    console.error('[edit/route.ts] Generalization pipe error:', genError.message);
  }
})();
// === END GENERALIZATION PIPE ===
```

**Error checks:**
- Confirm `edit_instruction`, `current_content`, `user_id`, `doc_type`, `document_id` variable names match what already exists in the file — rename in the intercept block to match
- Run `npx tsc --noEmit` — no type errors allowed
- Test: make an edit request manually and confirm the response contains `source: 'rule_engine'` or falls back to Gemini gracefully

**When done, report:** `Section 4 complete. edit/route.ts modified, intercept wired, generalization pipe added. No TypeScript errors. Ready for Section 5?`

---

## SECTION 5 — React UI Components (FuzzyClarifier, LegalBasisCard, DocumentBundlePanel)

**What you are doing:** Creating 3 new React UI components that plug into the existing drafting workspace.

**File 1 to create:** `components/documents/FuzzyClarifier.tsx`

This renders when the rule engine returns `fuzzy_match: true`. It shows a confirmation card: "Did you mean: Add [X] clause?" with Yes/No buttons.

```tsx
// components/documents/FuzzyClarifier.tsx
'use client';

import { useState } from 'react';

interface FuzzyClarifierProps {
  suggestion: {
    intentId: string;
    intent: string;
    confidence: number;
    suggested_label: string;
  };
  onConfirm: (intentId: string) => void;  // User clicks Yes → execute rule
  onDismiss: () => void;                   // User clicks No → let AI handle it
}

export function FuzzyClarifier({ suggestion, onConfirm, onDismiss }: FuzzyClarifierProps) {
  const [loading, setLoading] = useState(false);
  const confidencePct = Math.round(suggestion.confidence * 100);

  return (
    <div className="border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 rounded-lg p-4 mb-3 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="text-amber-500 text-lg mt-0.5">⚡</div>
        <div className="flex-1">
          <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">
            Instant rule available ({confidencePct}% match)
          </p>
          <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
            Did you mean: <span className="font-semibold">"{suggestion.suggested_label}"</span>?
            <br />
            <span className="text-xs text-amber-600 dark:text-amber-400">
              Applying via rule engine is free and instant (&lt;100ms).
            </span>
          </p>
          <div className="flex gap-2">
            <button
              onClick={async () => {
                setLoading(true);
                await onConfirm(suggestion.intentId);
                setLoading(false);
              }}
              disabled={loading}
              className="px-3 py-1.5 text-xs font-medium bg-amber-500 hover:bg-amber-600 text-white rounded-md transition-colors disabled:opacity-50"
            >
              {loading ? 'Applying...' : '✓ Yes, apply this'}
            </button>
            <button
              onClick={onDismiss}
              disabled={loading}
              className="px-3 py-1.5 text-xs font-medium border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 rounded-md transition-colors disabled:opacity-50"
            >
              No, use AI instead
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

**File 2 to create:** `components/documents/LegalBasisCard.tsx`

This renders as a sliding side panel when a user clicks on any rule-engine-injected clause. It shows the statutory authority, required filings, and deadline.

```tsx
// components/documents/LegalBasisCard.tsx
'use client';

import { useState, useEffect } from 'react';

interface ClauseMetadata {
  legal_basis: string | null;
  related_forms: string[];
  compliance_deadline: string | null;
  review_due_date: string | null;
}

interface LegalBasisCardProps {
  clauseId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function LegalBasisCard({ clauseId, isOpen, onClose }: LegalBasisCardProps) {
  const [metadata, setMetadata] = useState<ClauseMetadata | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!clauseId || !isOpen) return;
    setLoading(true);
    fetch(`/api/rule-engine/clause-metadata?id=${clauseId}`)
      .then(r => r.json())
      .then(d => { setMetadata(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [clauseId, isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />
      {/* Sliding panel */}
      <div className={`fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-5 h-full overflow-y-auto">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Legal Compliance Info</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-lg"
            >
              ✕
            </button>
          </div>

          {loading && (
            <div className="text-sm text-gray-400 text-center py-8">Loading...</div>
          )}

          {!loading && metadata && (
            <div className="space-y-4">
              {metadata.legal_basis && (
                <div className="bg-blue-50 dark:bg-blue-950/30 rounded-lg p-3">
                  <p className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide mb-1">
                    📖 Statutory Authority
                  </p>
                  <p className="text-sm text-blue-900 dark:text-blue-100">{metadata.legal_basis}</p>
                </div>
              )}

              {metadata.related_forms && metadata.related_forms.length > 0 && (
                <div className="bg-purple-50 dark:bg-purple-950/30 rounded-lg p-3">
                  <p className="text-xs font-semibold text-purple-700 dark:text-purple-300 uppercase tracking-wide mb-2">
                    📋 Required Filings
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {metadata.related_forms.map(form => (
                      <span
                        key={form}
                        className="px-2 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200 rounded-md"
                      >
                        {form}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {metadata.compliance_deadline && (
                <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-3">
                  <p className="text-xs font-semibold text-red-700 dark:text-red-300 uppercase tracking-wide mb-1">
                    ⏰ Deadline
                  </p>
                  <p className="text-sm text-red-900 dark:text-red-100">{metadata.compliance_deadline}</p>
                </div>
              )}

              {metadata.review_due_date && (
                <div className="bg-yellow-50 dark:bg-yellow-950/30 rounded-lg p-3">
                  <p className="text-xs font-semibold text-yellow-700 dark:text-yellow-300 uppercase tracking-wide mb-1">
                    🔔 Legislative Review Due
                  </p>
                  <p className="text-sm text-yellow-900 dark:text-yellow-100">
                    {new Date(metadata.review_due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
              )}
            </div>
          )}

          {!loading && !metadata && clauseId && (
            <p className="text-sm text-gray-400 text-center py-8">No legal metadata available for this clause.</p>
          )}
        </div>
      </div>
    </>
  );
}
```

**File 3 to create:** `components/documents/DocumentBundlePanel.tsx`

Recommends related documents to generate alongside the current one (e.g., DIR-2 when drafting Additional Director appointment).

```tsx
// components/documents/DocumentBundlePanel.tsx
'use client';

import { useState, useEffect } from 'react';

interface BundleRecommendation {
  slug: string;
  name: string;
  description: string;
}

interface DocumentBundlePanelProps {
  currentDocType: string;
  onAddToBundle: (slug: string) => void;
}

export function DocumentBundlePanel({ currentDocType, onAddToBundle }: DocumentBundlePanelProps) {
  const [recommendations, setRecommendations] = useState<BundleRecommendation[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    if (!currentDocType) return;
    fetch(`/api/rule-engine/bundle-recommendations?docType=${encodeURIComponent(currentDocType)}`)
      .then(r => r.json())
      .then(d => setRecommendations(d.recommendations || []));
  }, [currentDocType]);

  const visible = recommendations.filter(r => !dismissed.includes(r.slug));
  if (visible.length === 0) return null;

  return (
    <div className="border border-emerald-200 bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-800 rounded-lg p-4 mb-4">
      <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 uppercase tracking-wide mb-3">
        📦 Often drafted together
      </p>
      <div className="space-y-2">
        {visible.map(rec => (
          <div key={rec.slug} className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-emerald-900 dark:text-emerald-100 truncate">{rec.name}</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5 line-clamp-2">{rec.description}</p>
            </div>
            <div className="flex gap-1.5 flex-shrink-0">
              <button
                onClick={() => onAddToBundle(rec.slug)}
                className="px-2.5 py-1 text-xs font-medium bg-emerald-500 hover:bg-emerald-600 text-white rounded-md transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => setDismissed(d => [...d, rec.slug])}
                className="px-2.5 py-1 text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-md transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Supporting API route for LegalBasisCard:**

Create `app/api/rule-engine/clause-metadata/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from('clauses')
    .select('legal_basis, related_forms, compliance_deadline, review_due_date')
    .eq('id', id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
```

**Supporting API route for DocumentBundlePanel:**

Create `app/api/rule-engine/bundle-recommendations/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const docType = searchParams.get('docType');
  if (!docType) return NextResponse.json({ recommendations: [] });

  // Fetch document templates that are commonly bundled with this docType
  // This uses the document_templates table that already exists in the codebase
  const { data } = await supabaseAdmin
    .from('document_templates')
    .select('slug, name, description')
    .contains('category', docType) // Adjust filter logic to match your category scheme
    .limit(3);

  return NextResponse.json({ recommendations: data || [] });
}
```

**Error checks:**
- All three components are purely presentational — no DB calls in components themselves (calls go through the API routes)
- Check all Tailwind classes are standard utility classes (no custom values)
- Ensure `'use client'` directive is at top of all three component files
- Run `npx tsc --noEmit` on components

**When done, report:** `Section 5 complete. 3 UI components and 2 supporting API routes created. No TypeScript errors. Ready for Section 6?`

---

## SECTION 6 — Conflict Auditor Component + Pre-Download Sweep

**What you are doing:** Creating the `ConflictAuditor` component and a full conflict sweep API that runs before the user downloads their document.

**File to create:** `app/api/rule-engine/conflict-check/route.ts`

```typescript
// app/api/rule-engine/conflict-check/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function POST(request: Request) {
  const { documentText } = await request.json();
  if (!documentText) return NextResponse.json({ alerts: [] });

  // Fetch all conflict rules from DB
  const { data: conflicts, error } = await supabaseAdmin
    .from('conflicts')
    .select('*')
    .order('severity', { ascending: false }); // CRITICAL first

  if (error || !conflicts) return NextResponse.json({ alerts: [] });

  const alerts: Array<{
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
    message: string;
    legal_basis: string | null;
  }> = [];

  const lowerText = documentText.toLowerCase();

  for (const conflict of conflicts) {
    const conditions: string[] = conflict.trigger_condition?.requires_all || [];
    const allPresent = conditions.length > 0 &&
      conditions.every((term: string) => lowerText.includes(term.toLowerCase()));

    if (allPresent) {
      alerts.push({
        severity: conflict.severity,
        message: conflict.message,
        legal_basis: conflict.legal_basis || null,
      });
    }
  }

  return NextResponse.json({ alerts, checkedAt: new Date().toISOString() });
}
```

**File to create:** `components/documents/ConflictAuditor.tsx`

```tsx
// components/documents/ConflictAuditor.tsx
'use client';

import { useState } from 'react';

interface ConflictAlert {
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  message: string;
  legal_basis: string | null;
}

interface ConflictAuditorProps {
  documentText: string;
  onAuditComplete?: (hasCritical: boolean) => void;
}

const severityConfig = {
  CRITICAL: { icon: '🚨', bg: 'bg-red-50 dark:bg-red-950/30', border: 'border-red-200 dark:border-red-800', title: 'text-red-700 dark:text-red-300', text: 'text-red-900 dark:text-red-100', label: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200' },
  WARNING:  { icon: '⚠️', bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-800', title: 'text-amber-700 dark:text-amber-300', text: 'text-amber-900 dark:text-amber-100', label: 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200' },
  INFO:     { icon: 'ℹ️', bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-200 dark:border-blue-800', title: 'text-blue-700 dark:text-blue-300', text: 'text-blue-900 dark:text-blue-100', label: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200' },
};

export function ConflictAuditor({ documentText, onAuditComplete }: ConflictAuditorProps) {
  const [alerts, setAlerts] = useState<ConflictAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [ran, setRan] = useState(false);

  const runAudit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/rule-engine/conflict-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentText }),
      });
      const data = await res.json();
      setAlerts(data.alerts || []);
      setRan(true);
      onAuditComplete?.(data.alerts.some((a: ConflictAlert) => a.severity === 'CRITICAL'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {!ran ? (
        <button
          onClick={runAudit}
          disabled={loading}
          className="w-full py-2 px-4 text-sm font-medium border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <><span className="animate-spin">⟳</span> Running compliance check...</>
          ) : (
            <><span>🛡️</span> Run compliance check before download</>
          )}
        </button>
      ) : (
        <>
          {alerts.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
              <span>✅</span>
              <span className="font-medium">No compliance issues detected.</span>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {alerts.length} issue{alerts.length > 1 ? 's' : ''} found
              </p>
              {alerts.map((alert, idx) => {
                const cfg = severityConfig[alert.severity];
                return (
                  <div key={idx} className={`${cfg.bg} border ${cfg.border} rounded-lg p-3`}>
                    <div className="flex items-start gap-2">
                      <span>{cfg.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${cfg.label}`}>
                            {alert.severity}
                          </span>
                        </div>
                        <p className={`text-sm ${cfg.text}`}>{alert.message}</p>
                        {alert.legal_basis && (
                          <p className={`text-xs mt-1 ${cfg.title} opacity-80`}>
                            Ref: {alert.legal_basis}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <button
            onClick={runAudit}
            disabled={loading}
            className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 underline"
          >
            Re-run check
          </button>
        </>
      )}
    </div>
  );
}
```

**Integration into the download flow in `app/documents/[slug]/page.tsx`:**

Find the download button or the section where `getCleanedContent()` is called. Wrap the download with the ConflictAuditor. Add:
```tsx
// Near the download button in page.tsx
import { ConflictAuditor } from '@/components/documents/ConflictAuditor';

// In the JSX, before the download button:
<ConflictAuditor
  documentText={editedContent}
  onAuditComplete={(hasCritical) => {
    if (hasCritical) {
      // Optionally disable download or show a modal warning
      console.warn('CRITICAL compliance issues detected in document');
    }
  }}
/>
```

**Error checks:**
- Verify the conflict_check API route correctly reads `documentText` from request body
- Test: POST to `/api/rule-engine/conflict-check` with `{"documentText": "Independent Director salary"}` — should return 1 CRITICAL alert (from seeded data in Section 1)
- Confirm the `ConflictAuditor` component has `'use client'` at top

**When done, report:** `Section 6 complete. ConflictAuditor component and conflict-check API route created. Tested: CRITICAL alert fires correctly. Ready for Section 7?`

---

## SECTION 7 — Admin CMS Panel (Rule Learning & Health Dashboard)

**What you are doing:** Creating the Admin CMS page at `/admin/rule-learning` where admins review AI-learned rules from the queue, see health scores for active rules, and approve/reject new rules with one click.

**File to create:** `app/admin/rule-learning/page.tsx`

```tsx
// app/admin/rule-learning/page.tsx
'use client';

import { useState, useEffect } from 'react';

interface QueueItem {
  id: string;
  original_prompt: string;
  generalized_prompt: string;
  proposed_intent: string;
  ai_clause_draft: string;
  variables_schema: Record<string, string>;
  document_type: string;
  frequency_count: number;
  created_at: string;
}

interface RuleHealth {
  id: string;
  intent_name: string;
  document_type: string;
  usage_count: number;
  accepted_count: number;
  rejected_count: number;
  health_score: number;
  clause_content_preview: string;
}

export default function RuleLearningPage() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [health, setHealth] = useState<RuleHealth[]>([]);
  const [activeTab, setActiveTab] = useState<'queue' | 'health'>('queue');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [queueRes, healthRes] = await Promise.all([
        fetch('/api/admin/rule-learning/queue'),
        fetch('/api/admin/rule-learning/health'),
      ]);
      const queueData = await queueRes.json();
      const healthData = await healthRes.json();
      setQueue(queueData.items || []);
      setHealth(healthData.rules || []);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (item: QueueItem) => {
    setActionLoading(item.id);
    try {
      const res = await fetch('/api/admin/rule-learning/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queueItemId: item.id }),
      });
      const result = await res.json();
      if (result.success) {
        setQueue(prev => prev.filter(q => q.id !== item.id));
        alert(`✅ Rule "${item.proposed_intent}" approved and activated!`);
        loadData();
      } else {
        alert('Error: ' + result.error);
      }
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    try {
      await fetch('/api/admin/rule-learning/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queueItemId: id }),
      });
      setQueue(prev => prev.filter(q => q.id !== id));
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Learning Panel</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Review AI-generalized rules before they go live. Only rules used 5+ times appear here.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
        {(['queue', 'health'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab === 'queue' ? `📥 Learning Queue (${queue.length})` : `📊 Rule Health (${health.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading...</div>
      ) : (
        <>
          {/* QUEUE TAB */}
          {activeTab === 'queue' && (
            <div className="space-y-4">
              {queue.length === 0 ? (
                <div className="text-center py-12 text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <p className="text-4xl mb-3">🎉</p>
                  <p className="font-medium">Learning queue is empty.</p>
                  <p className="text-sm mt-1">No new rules have reached the 5-use threshold yet.</p>
                </div>
              ) : (
                queue.map(item => (
                  <div key={item.id} className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 bg-white dark:bg-gray-900">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded">
                            {item.proposed_intent}
                          </span>
                          <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
                            {item.document_type}
                          </span>
                          <span className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded font-medium">
                            Used {item.frequency_count}× by users
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">Original: "{item.original_prompt}"</p>
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mb-3">
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">GENERALIZED TEMPLATE</p>
                      <p className="text-sm text-gray-800 dark:text-gray-200 font-mono">{item.ai_clause_draft}</p>
                    </div>

                    {Object.keys(item.variables_schema).length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {Object.entries(item.variables_schema).map(([key, type]) => (
                          <span key={key} className="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 rounded font-mono">
                            {`{{${key}}}`} <span className="text-blue-400">{type}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(item)}
                        disabled={actionLoading === item.id}
                        className="px-4 py-2 text-sm font-medium bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors disabled:opacity-50"
                      >
                        {actionLoading === item.id ? 'Processing...' : '✓ Approve → Add to Rules'}
                      </button>
                      <button
                        onClick={() => handleReject(item.id)}
                        disabled={actionLoading === item.id}
                        className="px-4 py-2 text-sm font-medium border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors disabled:opacity-50"
                      >
                        ✕ Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* HEALTH TAB */}
          {activeTab === 'health' && (
            <div className="space-y-3">
              {health.length === 0 ? (
                <div className="text-center py-12 text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                  <p className="text-sm">No active rules yet. Approve rules from the Learning Queue first.</p>
                </div>
              ) : (
                health.map(rule => {
                  const isLowHealth = rule.health_score < 70 && rule.usage_count >= 10;
                  const hasMinUsage = rule.usage_count >= 10;
                  return (
                    <div key={rule.id} className={`border rounded-xl p-4 bg-white dark:bg-gray-900 ${isLowHealth ? 'border-red-300 dark:border-red-700' : 'border-gray-200 dark:border-gray-700'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">
                            {rule.intent_name}
                          </span>
                          <span className="text-xs text-gray-400">· {rule.document_type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {isLowHealth && (
                            <span className="text-xs font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded">
                              Requires Template Refinement
                            </span>
                          )}
                          <span className={`text-sm font-bold ${
                            !hasMinUsage ? 'text-gray-400' :
                            rule.health_score >= 70 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                          }`}>
                            {hasMinUsage ? `${Math.round(rule.health_score)}%` : 'Building...'}
                          </span>
                        </div>
                      </div>

                      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 mb-2">
                        <div
                          className={`h-1.5 rounded-full transition-all ${
                            !hasMinUsage ? 'bg-gray-300 dark:bg-gray-600' :
                            rule.health_score >= 70 ? 'bg-emerald-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${hasMinUsage ? rule.health_score : (rule.usage_count / 10) * 100}%` }}
                        />
                      </div>

                      <div className="flex gap-4 text-xs text-gray-400">
                        <span>Used: {rule.usage_count}×</span>
                        <span className="text-emerald-500">✓ Accepted: {rule.accepted_count}</span>
                        <span className="text-red-500">✗ Rejected: {rule.rejected_count}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
```

**Admin API routes to create:**

`app/api/admin/rule-learning/queue/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('learning_queue')
    .select('*')
    .eq('status', 'pending')
    .eq('validation_passed', true)
    .gte('frequency_count', 5)
    .order('frequency_count', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data || [] });
}
```

`app/api/admin/rule-learning/health/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('rules')
    .select(`
      id, usage_count, accepted_count, rejected_count, document_type,
      intents(name),
      clauses(content)
    `);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rules = (data || []).map((r: any) => {
    const total = r.accepted_count + r.rejected_count;
    const health_score = total > 0 ? (r.accepted_count / total) * 100 : 0;
    return {
      id: r.id,
      intent_name: r.intents?.name || 'Unknown',
      document_type: r.document_type,
      usage_count: r.usage_count,
      accepted_count: r.accepted_count,
      rejected_count: r.rejected_count,
      health_score,
      clause_content_preview: (r.clauses?.content || '').substring(0, 100),
    };
  });

  return NextResponse.json({ rules });
}
```

`app/api/admin/rule-learning/approve/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function POST(request: Request) {
  const { queueItemId } = await request.json();

  // Fetch the queue item
  const { data: item, error: fetchError } = await supabaseAdmin
    .from('learning_queue')
    .select('*')
    .eq('id', queueItemId)
    .single();

  if (fetchError || !item) return NextResponse.json({ error: 'Queue item not found' }, { status: 404 });

  // Create the intent (or find existing)
  let intentId: string;
  const { data: existingIntent } = await supabaseAdmin
    .from('intents')
    .select('id')
    .eq('name', item.proposed_intent)
    .single();

  if (existingIntent) {
    intentId = existingIntent.id;
  } else {
    // Generate embedding for the new intent
    const { getEmbedding } = await import('@/lib/gemini');
    const embedding = await getEmbedding(item.proposed_intent.replace(/_/g, ' ').toLowerCase());

    const { data: newIntent, error: intentError } = await supabaseAdmin
      .from('intents')
      .insert({ name: item.proposed_intent, embedding, description: item.generalized_prompt })
      .select('id')
      .single();

    if (intentError || !newIntent) return NextResponse.json({ error: 'Failed to create intent' }, { status: 500 });
    intentId = newIntent.id;
  }

  // Create the clause (version 1)
  const defaultPlacement: PlacementDSL = {
    action: 'APPEND',
    anchor: '',
    anchor_type: 'REGEX',
    fallback: 'BOTTOM',
  };

  const { data: newClause, error: clauseError } = await supabaseAdmin
    .from('clauses')
    .insert({
      version: 1,
      is_active: true,
      document_type: item.document_type || 'GENERAL',
      category: 'INSERT',
      content: item.ai_clause_draft,
      variables: item.variables_schema,
      placement_rules: defaultPlacement,
    })
    .select('id')
    .single();

  if (clauseError || !newClause) return NextResponse.json({ error: 'Failed to create clause' }, { status: 500 });

  // Create the rule linking intent → clause
  const { error: ruleError } = await supabaseAdmin
    .from('rules')
    .insert({
      intent_id: intentId,
      clause_id: newClause.id,
      document_type: item.document_type || 'GENERAL',
    });

  if (ruleError) return NextResponse.json({ error: 'Failed to create rule' }, { status: 500 });

  // Mark queue item as approved
  await supabaseAdmin
    .from('learning_queue')
    .update({ status: 'approved' })
    .eq('id', queueItemId);

  return NextResponse.json({ success: true, clauseId: newClause.id, intentId });
}

type PlacementDSL = { action: string; anchor: string; anchor_type: string; fallback: string; };
```

`app/api/admin/rule-learning/reject/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function POST(request: Request) {
  const { queueItemId } = await request.json();
  const { error } = await supabaseAdmin
    .from('learning_queue')
    .update({ status: 'rejected' })
    .eq('id', queueItemId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
```

**Error checks:**
- Visit `/admin/rule-learning` — should render the tabs with empty state messages (no data yet)
- Check no 404s on the 4 admin API routes
- Confirm `'use client'` is at top of the page.tsx
- Run `npx tsc --noEmit`

**When done, report:** `Section 7 complete. Admin CMS page and 4 admin API routes created. Page renders without errors. Ready for Section 8?`

---

## SECTION 8 — Seed Initial Intents + Integrate Components into Drafting Workspace

**What you are doing:** Two tasks in this section:
1. Seeding the database with real intents and aliases so the rule engine has data to match against
2. Wiring the React components from Section 5 into the existing `app/documents/[slug]/page.tsx`

**Part A: Seed intents via a one-time API route**

Create `app/api/admin/seed-intents/route.ts`:
```typescript
// app/api/admin/seed-intents/route.ts
// ONE-TIME USE: Run once, then delete or protect this route
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { getEmbedding } from '@/lib/gemini';

const INTENTS_TO_SEED = [
  {
    name: 'ADD_CONFIDENTIALITY',
    description: 'Add a Non-Disclosure/Confidentiality clause',
    aliases: ['add confidentiality clause', 'insert nda section', 'add secrecy clause', 'insert confidentiality', 'add nondisclosure'],
    sampleClause: {
      document_type: 'EMPLOYMENT_CONTRACT',
      category: 'INSERT',
      content: 'CONFIDENTIALITY: The Employee, {{name}}, hereby agrees to maintain strict confidentiality of all proprietary information, trade secrets, and business data of the Company during and after the term of employment. Breach of this clause shall render the Employee liable under applicable Indian law.',
      variables: { name: 'STRING' },
      placement_rules: { action: 'INSERT_AFTER', anchor: 'REMUNERATION', anchor_type: 'HEADING', fallback: 'BOTTOM' },
      legal_basis: 'Section 27 of the Indian Contract Act, 1872',
      related_forms: [],
      compliance_deadline: null,
    }
  },
  {
    name: 'ADD_MBP1_DISCLOSURE',
    description: 'Add MBP-1 disclosure of interest by director',
    aliases: ['add mbp1', 'insert mbp 1', 'add disclosure of interest', 'director disclosure', 'add mbp1 clause'],
    sampleClause: {
      document_type: 'BOARD_RESOLUTION',
      category: 'INSERT',
      content: 'DISCLOSURE OF INTEREST: Shri/Smt. {{director_name}}, Director, hereby discloses pursuant to Section 184(1) of the Companies Act, 2013 that they hold a position of concern or interest in {{company_name}} as detailed in Form MBP-1 submitted to the Board.',
      variables: { director_name: 'STRING', company_name: 'STRING' },
      placement_rules: { action: 'INSERT_AFTER', anchor: 'PRESENT', anchor_type: 'HEADING', fallback: 'BOTTOM' },
      legal_basis: 'Section 184(1) of the Companies Act, 2013',
      related_forms: ['MBP-1'],
      compliance_deadline: 'At first Board Meeting of every financial year',
    }
  },
  {
    name: 'ADD_INDEPENDENT_DIRECTOR_DECLARATION',
    description: 'Add Section 164 declaration / Independent Director declaration',
    aliases: ['add section 164 declaration', 'add independent director declaration', 'insert dir2 consent', 'add dir 2'],
    sampleClause: {
      document_type: 'BOARD_RESOLUTION',
      category: 'INSERT',
      content: 'DECLARATION: Shri/Smt. {{director_name}}, the proposed Independent Director, hereby declares under Section 164 of the Companies Act, 2013 that they are not disqualified from being appointed as a Director and meet all independence criteria under Section 149(6) of the Act.',
      variables: { director_name: 'STRING' },
      placement_rules: { action: 'APPEND', anchor: '', anchor_type: 'REGEX', fallback: 'BOTTOM' },
      legal_basis: 'Section 164 and Section 149(6) of the Companies Act, 2013',
      related_forms: ['DIR-2', 'DIR-8'],
      compliance_deadline: 'Before appointment',
    }
  },
  {
    name: 'ADD_REGISTERED_OFFICE_CLAUSE',
    description: 'Add or update registered office address',
    aliases: ['add registered office', 'update registered office address', 'change registered office', 'insert registered office clause'],
    sampleClause: {
      document_type: 'BOARD_RESOLUTION',
      category: 'INSERT',
      content: 'REGISTERED OFFICE: RESOLVED THAT the registered office of the Company be and is hereby shifted to {{new_address}}, {{city}}, {{state}} — {{pincode}}, with effect from {{effective_date}}.',
      variables: { new_address: 'STRING', city: 'CITY', state: 'STRING', pincode: 'STRING', effective_date: 'DATE' },
      placement_rules: { action: 'INSERT_AFTER', anchor: 'RESOLVED', anchor_type: 'REGEX', fallback: 'BOTTOM' },
      legal_basis: 'Section 12 of the Companies Act, 2013',
      related_forms: ['INC-22'],
      compliance_deadline: 'Within 30 days of change',
    }
  },
];

export async function POST() {
  const results = [];

  for (const intentDef of INTENTS_TO_SEED) {
    try {
      // Generate embedding
      const embedding = await getEmbedding(intentDef.description);

      // Insert intent
      const { data: intent, error: intentError } = await supabaseAdmin
        .from('intents')
        .upsert({ name: intentDef.name, description: intentDef.description, embedding }, { onConflict: 'name' })
        .select('id')
        .single();

      if (intentError || !intent) { results.push({ intent: intentDef.name, error: intentError?.message }); continue; }

      // Insert aliases
      for (const alias of intentDef.aliases) {
        await supabaseAdmin.from('intent_aliases').upsert({ phrase: alias, intent_id: intent.id }, { onConflict: 'phrase' });
      }

      // Insert sample clause
      const { data: clause } = await supabaseAdmin
        .from('clauses')
        .insert({ ...intentDef.sampleClause, version: 1, is_active: true })
        .select('id')
        .single();

      // Insert rule
      if (clause) {
        await supabaseAdmin.from('rules').upsert({
          intent_id: intent.id,
          clause_id: clause.id,
          document_type: intentDef.sampleClause.document_type,
        }, { onConflict: 'intent_id, document_type' });
      }

      results.push({ intent: intentDef.name, status: 'seeded', intentId: intent.id, clauseId: clause?.id });
    } catch (e: any) {
      results.push({ intent: intentDef.name, error: e.message });
    }
  }

  return NextResponse.json({ results });
}
```

**Run it once:**
```bash
curl -X POST http://localhost:3000/api/admin/seed-intents
```
Verify all 4 intents return `status: 'seeded'`.

**Part B: Wire components into `app/documents/[slug]/page.tsx`**

Open the existing file and add the following integrations. Read the file first to understand its structure, then apply:

```tsx
// Add to imports at top:
import { FuzzyClarifier } from '@/components/documents/FuzzyClarifier';
import { LegalBasisCard } from '@/components/documents/LegalBasisCard';
import { DocumentBundlePanel } from '@/components/documents/DocumentBundlePanel';
import { ConflictAuditor } from '@/components/documents/ConflictAuditor';

// Add to state variables:
const [fuzzyMatch, setFuzzyMatch] = useState<null | {
  intentId: string; intent: string; confidence: number; suggested_label: string;
}>(null);
const [legalCardClauseId, setLegalCardClauseId] = useState<string | null>(null);
const [legalCardOpen, setLegalCardOpen] = useState(false);
const [lastAppliedClauseId, setLastAppliedClauseId] = useState<string | null>(null);

// Modify handleAiEdit to handle new rule-engine response shapes:
// After: const data = await response.json()
// Add this block:
if (data.fuzzyMatch) {
  setFuzzyMatch(data.suggestion);
  setIsLoading(false); // or whatever your loading state is called
  return;
}
if (data.requiresInput) {
  // Show a modal or inline form for missing variables
  // For now, alert the user which variables are needed
  alert(`Please provide: ${data.missingVariables.join(', ')}`);
  setIsLoading(false);
  return;
}
if (data.source === 'rule_engine') {
  // Track the clause that was just applied for LegalBasisCard
  if (data.clauseId) setLastAppliedClauseId(data.clauseId);
  // Show inline warnings if any
  if (data.inlineWarnings?.length > 0) {
    data.inlineWarnings.forEach((w: string) => console.warn('[Compliance]', w));
  }
}
// ... rest of existing update logic (setContent etc.) continues unchanged

// In JSX, add above the AI chat input:
{fuzzyMatch && (
  <FuzzyClarifier
    suggestion={fuzzyMatch}
    onConfirm={async (intentId) => {
      setFuzzyMatch(null);
      // Re-submit the original prompt, now confirmed
      await handleAiEdit(chatInput); // re-trigger the edit flow
    }}
    onDismiss={() => {
      setFuzzyMatch(null);
      // Fall through to AI: re-call edit API with a flag to skip rule engine
    }}
  />
)}

// Add DocumentBundlePanel above the editor:
<DocumentBundlePanel
  currentDocType={template?.category?.toUpperCase() || 'GENERAL'}
  onAddToBundle={(slug) => {
    window.open(`/documents/${slug}`, '_blank');
  }}
/>

// Add LegalBasisCard (slide panel):
<LegalBasisCard
  clauseId={legalCardClauseId}
  isOpen={legalCardOpen}
  onClose={() => { setLegalCardOpen(false); setLegalCardClauseId(null); }}
/>

// Add ConflictAuditor near the download button:
<ConflictAuditor documentText={editedContent || originalContent || ''} />
```

**Error checks:**
- Run seed endpoint and confirm 4 intents exist in Supabase Table Editor
- Test: type "add confidentiality clause for Rahul" in the chat input → should now return `source: 'rule_engine'`
- Check page.tsx compiles without errors after adding new imports
- Verify `FuzzyClarifier` renders correctly in browser for a fuzzy match scenario

**When done, report:** `Section 8 complete. 4 intents seeded, all components wired into page.tsx, rule engine responding correctly. Ready for Section 9?`

---

## SECTION 9 — Verification, Testing & Final Quality Gates

**What you are doing:** Running all verification tests from the implementation plan, fixing any issues, and confirming the full system works end-to-end.

### Test Suite — Run Each Test In Order

**Test 1: Alias Bypass Test (must resolve in <1ms, $0)**
```bash
curl -X POST http://localhost:3000/api/rule-engine/classify \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Please insert the standard MBP-1!", "userId": "test"}'
```
Expected: `{ "status": "success", "source": "alias_table", "confidence": 1.0, "intent": "ADD_MBP1_DISCLOSURE" }`
If FAIL: Check that "insert mbp 1" is in `intent_aliases` table. Re-run seed endpoint.

**Test 2: Semantic Similarity Test (pgvector)**
```bash
curl -X POST http://localhost:3000/api/rule-engine/classify \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Put a secrecy clause in for Priya", "userId": "test"}'
```
Expected: `{ "status": "success", "intent": "ADD_CONFIDENTIALITY", "confidence": >0.88 }` OR `{ "status": "fuzzy_match" }` if slightly below threshold — both are correct.

**Test 3: Variable Extraction Test**
Make an edit request through the full edit API:
```bash
curl -X POST http://localhost:3000/api/documents/edit \
  -H "Content-Type: application/json" \
  -d '{"edit_instruction": "Add confidentiality clause for Amit in Delhi", "current_content": "# EMPLOYMENT CONTRACT\n\n## REMUNERATION\n\nSalary: ₹50,000 per month", "doc_type": "EMPLOYMENT_CONTRACT"}'
```
Expected: `{ "success": true, "source": "rule_engine", "content": "..." }` where content includes "Amit" injected.

**Test 4: Missing Variable Fallback Test**
```bash
curl -X POST http://localhost:3000/api/documents/edit \
  -H "Content-Type: application/json" \
  -d '{"edit_instruction": "Add confidentiality clause", "current_content": "# EMPLOYMENT CONTRACT", "doc_type": "EMPLOYMENT_CONTRACT"}'
```
Expected: `{ "requiresInput": true, "missingVariables": ["name"] }` OR it completes if `name` is optional.

**Test 5: Conflict Auditor Test**
```bash
curl -X POST http://localhost:3000/api/rule-engine/conflict-check \
  -H "Content-Type: application/json" \
  -d '{"documentText": "Independent Director salary remuneration monthly"}'
```
Expected: `{ "alerts": [{ "severity": "CRITICAL", "message": "An Independent Director cannot receive..." }] }`

**Test 6: Admin Queue Test**
1. Make the same edit request 5+ times with different specific names to trigger the generalization pipe
2. Visit http://localhost:3000/admin/rule-learning
3. After 5 uses, the item should appear in the Learning Queue tab
4. Click Approve — verify a new rule appears in the Rule Health tab

**Test 7: End-to-End Performance Test**
Using the browser Network tab:
- Alias match: should show response time <50ms (local network overhead)
- pgvector match: should show <200ms
- AI fallback: should show ~3-5s

### Final Quality Gates Checklist

Before marking complete, verify every item:

- [ ] `classify/route.ts` rate limits: Upstash enforces 20 AI calls/user/day
- [ ] Date formatting: dates in injected clauses follow Indian format (27th May, 2026)
- [ ] Time formatting: times show `11:00 A.M.` not `11:00 AM` or `11:00 A.M..`
- [ ] Admin queue: only shows items with `frequency_count >= 5` and `validation_passed = true`
- [ ] pgvector: confidence ≥ 0.88 = success, 0.70–0.88 = fuzzy, <0.70 = AI fallback
- [ ] No existing functionality broken: test that the existing Gemini document generation still works for non-matching prompts
- [ ] Silent overwrite protection: `CUSTOM_MODIFIED_BLOCK_DETECTED` falls through to Gemini instead of crashing
- [ ] `lib/rule-engine/router.ts`: exports are clean, `npx tsc --noEmit` passes with zero errors
- [ ] Redis cache TTL: 24 hours set on centroid cache entries
- [ ] Learning queue frequency counter: upsert increments existing entries rather than creating duplicates

### If Any Test Fails — Troubleshooting Guide

| Symptom | Likely Cause | Fix |
|---|---|---|
| classify returns `fallback_to_ai` for known alias | Seed not run or phrase mismatch | Re-run `/api/admin/seed-intents`, check normalized form of phrase |
| pgvector returns no matches | `match_intents` function not created or vectors empty | Re-run Section 1 SQL, re-run seed endpoint |
| `Redis.fromEnv()` throws | Missing Upstash env vars | Add UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN to `.env.local` |
| `executeRule` throws "Active clause not found" | Rule exists but clause `is_active = false` | Check clauses table, set `is_active = true` |
| TypeScript error on `supabaseAdmin.rpc('increment')` | Supabase doesn't have `increment` RPC by default | Replace with: fetch current count, add 1, update — or use raw SQL `UPDATE rules SET usage_count = usage_count + 1 WHERE ...` |
| Components don't render | Missing `'use client'` directive | Add to top of each component file |
| Admin approve fails with "Failed to create intent" | Gemini embedding call fails | Check `GOOGLE_AI_API_KEY` env var is set |

**When ALL tests pass, report:** `Section 9 complete. All 7 tests passing. Full rule engine operational. Implementation complete.`

---

## APPENDIX: File Creation Summary

All files created across all sections:

| File | Type | Section |
|---|---|---|
| `supabase/migrations/01_rule_engine_tables.sql` | SQL Migration | 1 |
| `app/api/rule-engine/classify/route.ts` | API Route | 2 |
| `lib/rule-engine/router.ts` | Library | 3 |
| `lib/rule-engine/index.ts` | Library Export | 3 |
| `app/api/documents/edit/route.ts` | MODIFIED | 4 |
| `components/documents/FuzzyClarifier.tsx` | Component | 5 |
| `components/documents/LegalBasisCard.tsx` | Component | 5 |
| `components/documents/DocumentBundlePanel.tsx` | Component | 5 |
| `app/api/rule-engine/clause-metadata/route.ts` | API Route | 5 |
| `app/api/rule-engine/bundle-recommendations/route.ts` | API Route | 5 |
| `app/api/rule-engine/conflict-check/route.ts` | API Route | 6 |
| `components/documents/ConflictAuditor.tsx` | Component | 6 |
| `app/admin/rule-learning/page.tsx` | Admin Page | 7 |
| `app/api/admin/rule-learning/queue/route.ts` | API Route | 7 |
| `app/api/admin/rule-learning/health/route.ts` | API Route | 7 |
| `app/api/admin/rule-learning/approve/route.ts` | API Route | 7 |
| `app/api/admin/rule-learning/reject/route.ts` | API Route | 7 |
| `app/api/admin/seed-intents/route.ts` | Seed Route (temp) | 8 |
| `app/documents/[slug]/page.tsx` | MODIFIED | 8 |

**Total: 17 new files + 2 modified files across 9 sections.**
