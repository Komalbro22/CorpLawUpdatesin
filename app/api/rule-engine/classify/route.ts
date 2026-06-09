// app/api/rule-engine/classify/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { supabaseDocumentsAdmin } from '@/lib/supabase-documents-server';

const docDb = supabaseDocumentsAdmin || supabaseAdmin;
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
  const { data: intents } = await docDb
    .from('intents')
    .select('name');

  if (!intents) return normalized;

  // Build a flat word list from intent names e.g. ["confidentiality", "disclosure", "mbp1"]
  const lexicon = intents.flatMap((i: { name: string }) =>
    i.name.toLowerCase().split('_').filter((w: string) => w.length > 2)
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
    const normalized = normalizePrompt(prompt);

    // ── STEP 2: Alias DB lookup (1ms, $0) ────────────────────────────────────
    const { data: aliasMatch } = await docDb
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
      const { data: spellMatch } = await docDb
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
    const { data: intentMatches, error: matchError } = await docDb.rpc('match_intents', {
      query_embedding: embedding,
      match_threshold: 0.80,
      match_count: 1,
    });

    if (matchError || !intentMatches || intentMatches.length === 0) {
      return NextResponse.json({ status: 'fallback_to_ai', source: 'no_match' });
    }

    const match = intentMatches[0];

    // ── STEP 8: Route by confidence bands ────────────────────────────────────
    // Band 1: HIGH confidence (≥85%) → deterministic rule execution
    if (match.similarity >= 0.85) {
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

    // Band 2: MEDIUM confidence (80–85%) → FuzzyClarifier UI confirmation
    if (match.similarity >= 0.80 && match.similarity < 0.85) {
      return NextResponse.json({
        status: 'fuzzy_match',
        confidence: match.similarity,
        intent: match.name,
        intentId: match.id,
        suggested_label: `Add ${match.name.replace('ADD_', '').replace(/_/g, ' ').toLowerCase()} clause`,
        source: 'pgvector_fuzzy',
      });
    }

    // Band 3: LOW confidence (<80%) → AI fallback
    return NextResponse.json({ status: 'fallback_to_ai', source: 'low_confidence' });

  } catch (error: any) {
    console.error('[classify/route.ts] Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
