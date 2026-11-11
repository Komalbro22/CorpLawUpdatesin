// lib/gemini.ts
// Secure server-side wrapper for Google Gemini models with key rotation.

/**
 * Sanitize user-controlled prompt input to prevent prompt injection attacks.
 * Enforces a 2000-character max and rejects known injection patterns.
 */
function sanitizeUserPrompt(input: string, maxLength = 2000): string {
  const trimmed = String(input ?? '').trim().slice(0, maxLength);
  // Block known prompt injection patterns
  const injectionPattern = /ignore (previous|all|above)|system\s*:|disregard (all|previous|instructions)|you are now|new instruction|forget (everything|all)|override (this|your)/i;
  if (injectionPattern.test(trimmed)) {
    throw new Error('Invalid prompt: contains disallowed instruction patterns.');
  }
  return trimmed;
}

/**
 * Sanitize conversation history entries to prevent prompt injection via history.
 * Strips each entry's text content through the same injection guard.
 */
function sanitizeHistory(history: any[]): string {
  if (!Array.isArray(history) || history.length === 0) return '[]';
  const safe = history.map((entry: any) => {
    if (typeof entry === 'string') {
      try { return sanitizeUserPrompt(entry, 500); } catch { return '[redacted]'; }
    }
    if (entry && typeof entry === 'object') {
      const safeEntry: Record<string, string> = {};
      for (const [k, v] of Object.entries(entry)) {
        if (typeof v === 'string') {
          try { safeEntry[k] = sanitizeUserPrompt(v, 500); } catch { safeEntry[k] = '[redacted]'; }
        }
      }
      return safeEntry;
    }
    return null;
  }).filter(Boolean);
  return JSON.stringify(safe);
}

/**
 * Primary Gemini Flash model for all Documents AI workflows (extraction, editing, clause synthesis).
 */
export const DOCUMENTS_AI_MODEL = 'gemini-3-flash-preview';

/**
 * Ordered Flash fallback models tried if all keys exhaust quota or reject the primary model.
 */
export const DOCUMENTS_AI_FALLBACK_MODELS = [
  'gemini-3-flash-preview',
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash',
] as const;

type CooldownReason = 'auth' | 'not_found' | 'quota' | 'error';

interface CooldownEntry {
  until: number;
  reason: CooldownReason;
}

const AUTH_COOLDOWN_MS = 10 * 60_000;
const NOT_FOUND_COOLDOWN_MS = 30 * 60_000;
const QUOTA_COOLDOWN_MS = 60_000;
const TRANSIENT_ERROR_COOLDOWN_MS = 15_000;
const DEFAULT_GEMINI_TIMEOUT_MS = 15_000;

const cooldownMap = new Map<string, CooldownEntry>();
let keyRotationCursor = 0;

/**
 * Reset in-memory Gemini key/model health cache and rotation cursor (for tests).
 */
export function __resetGeminiHealthCacheForTests(): void {
  cooldownMap.clear();
  keyRotationCursor = 0;
}

/**
 * Read deduplicated Gemini API keys from environment variables.
 * Prefers GOOGLE_GEMINI_API_KEY* slots before legacy GEMINI_API_KEY.
 */
export function getGeminiApiKeys(): string[] {
  const candidates = [
    process.env.GOOGLE_GEMINI_API_KEY || '',
    process.env.GOOGLE_GEMINI_API_KEY_2 || '',
    process.env.GOOGLE_GEMINI_API_KEY_3 || '',
    process.env.GOOGLE_GEMINI_API_KEY_4 || '',
    process.env.GOOGLE_GEMINI_API_KEY_5 || '',
    process.env.GEMINI_API_KEY || '',
  ]
    .map(k => k.trim())
    .filter(Boolean);

  return Array.from(new Set(candidates));
}

function getActiveCooldown(cacheKey: string, now = Date.now()): CooldownEntry | null {
  const entry = cooldownMap.get(cacheKey);
  if (!entry) return null;
  if (entry.until <= now) {
    cooldownMap.delete(cacheKey);
    return null;
  }
  return entry;
}

function setCooldown(cacheKey: string, reason: CooldownReason, durationMs: number): void {
  cooldownMap.set(cacheKey, { until: Date.now() + durationMs, reason });
}

function rotateArray<T>(items: T[], offset: number): T[] {
  if (items.length <= 1) return [...items];
  const idx = ((offset % items.length) + items.length) % items.length;
  return [...items.slice(idx), ...items.slice(0, idx)];
}

/**
 * Error thrown when Gemini generation fails across all available keys and fallback models.
 */
export class GeminiApiError extends Error {
  status: number;
  allQuotaExceeded: boolean;

  constructor(message: string, status: number, allQuotaExceeded = false) {
    super(message);
    this.name = 'GeminiApiError';
    this.status = status;
    this.allQuotaExceeded = allQuotaExceeded;
  }
}

export interface GeminiGenerateContentOptions {
  contents: Array<{ role?: string; parts: Array<{ text: string }> }>;
  generationConfig?: Record<string, unknown>;
  models?: readonly string[];
  timeoutMs?: number;
  label?: string;
}

export interface GeminiGenerateContentResult {
  text: string;
  model: string;
  keyIndex: number;
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  };
}

/**
 * Parse JSON returned by Gemini, stripping accidental markdown code fences.
 */
export function parseGeminiJson<T = any>(rawText: string): T {
  const trimmed = String(rawText ?? '').trim();
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    const cleaned = trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    return JSON.parse(cleaned) as T;
  }
}

function classifyHttpFailure(status: number, bodyText: string): CooldownReason {
  const lower = bodyText.toLowerCase();
  if (
    status === 401 ||
    status === 403 ||
    (status === 400 && (lower.includes('api key') || lower.includes('api_key_invalid')))
  ) {
    return 'auth';
  }
  if (status === 404 || lower.includes('no longer available') || lower.includes('not_found')) {
    return 'not_found';
  }
  if (status === 429 || lower.includes('resource_exhausted') || lower.includes('quota')) {
    return 'quota';
  }
  return 'error';
}

function isRecoverableStatus(status: number, reason: CooldownReason): boolean {
  return (
    reason === 'auth' ||
    reason === 'not_found' ||
    reason === 'quota' ||
    status === 408 ||
    status >= 500
  );
}

/**
 * Call Gemini generateContent with automatic per-key health tracking, key rotation, and model fallback.
 */
export async function requestGeminiGenerateContent(
  options: GeminiGenerateContentOptions
): Promise<GeminiGenerateContentResult> {
  const keys = getGeminiApiKeys();
  if (keys.length === 0) {
    throw new GeminiApiError(
      'No Gemini API keys found in environment variables (GOOGLE_GEMINI_API_KEY, GOOGLE_GEMINI_API_KEY_2, etc.).',
      500
    );
  }

  const candidateModels =
    options.models && options.models.length > 0 ? [...options.models] : [...DOCUMENTS_AI_FALLBACK_MODELS];
  const timeoutMs = options.timeoutMs ?? DEFAULT_GEMINI_TIMEOUT_MS;
  const label = options.label || 'Gemini API';

  const healthyIndices: number[] = [];
  const authCooledIndices: number[] = [];
  keys.forEach((key, idx) => {
    const keyCd = getActiveCooldown(`key:${key}`);
    if (keyCd?.reason === 'auth') {
      authCooledIndices.push(idx);
    } else {
      healthyIndices.push(idx);
    }
  });

  const rotatedHealthy =
    healthyIndices.length > 0
      ? rotateArray(healthyIndices, keyRotationCursor++)
      : [];
  const orderedIndices = [...rotatedHealthy, ...authCooledIndices];

  const attempted = new Set<string>();
  let lastStatus = 502;
  let lastMessage = 'All Gemini API keys and fallback models failed.';
  let sawQuota = false;
  let sawNonQuota = false;

  const tryAttempt = async (model: string, keyIndex: number): Promise<GeminiGenerateContentResult | null> => {
    const apiKey = keys[keyIndex];
    const attemptKey = `${model}::${apiKey}`;
    if (attempted.has(attemptKey)) return null;
    attempted.add(attemptKey);

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
    const bodyPayload: Record<string, unknown> = { contents: options.contents };
    if (options.generationConfig) {
      bodyPayload.generationConfig = options.generationConfig;
    }

    let response: Response;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
          body: JSON.stringify(bodyPayload),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timer);
      }
    } catch (err: any) {
      lastStatus = 504;
      lastMessage = err?.message || 'Network or timeout error calling Gemini';
      sawNonQuota = true;
      setCooldown(`pair:${apiKey}::${model}`, 'error', TRANSIENT_ERROR_COOLDOWN_MS);
      console.warn(`[${label}] Network/timeout on ${model} (key #${keyIndex}): ${lastMessage}`);
      return null;
    }

    if (!response.ok) {
      const errText = await response.text().catch(() => '');
      const reason = classifyHttpFailure(response.status, errText);
      lastStatus = response.status;
      lastMessage = `${label} failed on ${model} (status ${response.status}): ${errText.slice(0, 300)}`;

      if (reason === 'auth') {
        sawNonQuota = true;
        setCooldown(`key:${apiKey}`, 'auth', AUTH_COOLDOWN_MS);
      } else if (reason === 'not_found') {
        sawNonQuota = true;
        setCooldown(`pair:${apiKey}::${model}`, 'not_found', NOT_FOUND_COOLDOWN_MS);
      } else if (reason === 'quota') {
        sawQuota = true;
        setCooldown(`pair:${apiKey}::${model}`, 'quota', QUOTA_COOLDOWN_MS);
      } else {
        sawNonQuota = true;
        setCooldown(`pair:${apiKey}::${model}`, 'error', TRANSIENT_ERROR_COOLDOWN_MS);
      }

      console.warn(`[${label}] ${model} rejected on key #${keyIndex} (HTTP ${response.status}, reason=${reason})`);
      if (!isRecoverableStatus(response.status, reason)) {
        throw new GeminiApiError(lastMessage, response.status, false);
      }
      return null;
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    if (!rawText.trim()) {
      lastStatus = 502;
      lastMessage = `${label} returned empty response on ${model}`;
      sawNonQuota = true;
      setCooldown(`pair:${apiKey}::${model}`, 'error', TRANSIENT_ERROR_COOLDOWN_MS);
      return null;
    }

    return {
      text: rawText.trim(),
      model,
      keyIndex,
      usageMetadata: data?.usageMetadata,
    };
  };

  // Pass 1: Try non-cooled (model, key) pairs in priority order
  for (const model of candidateModels) {
    for (const keyIndex of orderedIndices) {
      const apiKey = keys[keyIndex];
      if (getActiveCooldown(`key:${apiKey}`)?.reason === 'auth') continue;
      if (getActiveCooldown(`pair:${apiKey}::${model}`)) continue;

      const res = await tryAttempt(model, keyIndex);
      if (res) return res;
    }
  }

  // Pass 2: Fallback through previously quota/error cooled pairs not yet tried in this call
  for (const model of candidateModels) {
    for (const keyIndex of orderedIndices) {
      const apiKey = keys[keyIndex];
      if (getActiveCooldown(`key:${apiKey}`)?.reason === 'auth') continue;
      if (getActiveCooldown(`pair:${apiKey}::${model}`)?.reason === 'not_found') continue;

      const res = await tryAttempt(model, keyIndex);
      if (res) return res;
    }
  }

  // Pass 3: Absolute last resort if every key was marked auth/not_found cooled on a warm container
  if (attempted.size === 0) {
    for (const model of candidateModels) {
      for (const keyIndex of orderedIndices) {
        const res = await tryAttempt(model, keyIndex);
        if (res) return res;
      }
    }
  }

  throw new GeminiApiError(lastMessage, lastStatus, sawQuota && !sawNonQuota);
}

/**
 * Helper to run legacy callback-based Gemini requests with rotation across all configured keys.
 */
async function runWithKeyRotation<T>(
  fn: (apiKey: string) => Promise<T>
): Promise<T> {
  const keys = getGeminiApiKeys();

  if (keys.length === 0) {
    throw new Error('No Gemini API keys found in environment variables (GOOGLE_GEMINI_API_KEY, GOOGLE_GEMINI_API_KEY_2, etc.).');
  }

  let lastError: any = null;
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    try {
      return await fn(key);
    } catch (err: any) {
      console.warn(`[Gemini API] Request failed with key index ${i}. Error:`, err.message || err);
      lastError = err;

      if (i < keys.length - 1) {
        console.log(`[Gemini API] Rotating from key index ${i} to key index ${i + 1}...`);
        continue;
      }
    }
  }

  throw lastError || new Error('All Gemini API keys failed.');
}

/**
 * Generate 768-dimension vector embeddings using text-embedding-004.
 */
export async function getEmbedding(text: string): Promise<number[]> {
  return runWithKeyRotation(async (apiKey) => {
    // API key passed via header — prevents exposure in server access logs
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent';
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
      body: JSON.stringify({
        content: {
          parts: [{ text }]
        },
        outputDimensionality: 768
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Gemini embedding fetch failed (status ${response.status}): ${response.statusText} ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const embedding = data.embedding?.values;
    if (!embedding || !Array.isArray(embedding)) {
      throw new Error('Invalid embedding response from Gemini API.');
    }

    return embedding;
  });
}

/**
 * Extract structured parameters from free text using JSON Schema schemas with the Documents Gemini Flash config.
 */
export async function extractVariables(
  fieldsSchema: any[], 
  clientPrompt: string, 
  history: any[] = []
): Promise<{ extracted: Record<string, string | null>; confidence: number }> {
  const safePrompt = sanitizeUserPrompt(clientPrompt);
  const promptText = `
You are a highly precise legal data extractor. Extract values for the requested variables based on the required fields schema and client text.

Required fields schema: ${JSON.stringify(fieldsSchema)}
Client's prompt input: "${safePrompt}"
Previous conversation history context: ${sanitizeHistory(history)}

Strict Extraction Rules:
1. Extract ONLY what is explicitly stated in the client's prompt or context. Never guess, infer, or hallucinate names, CINs, dates, or places.
2. If a field is not present or ambiguous, set its value strictly to null.
3. Formats: dates must be YYYY-MM-DD. Names must have standard capitals. CINs must be 21-character alphanumeric strings.

Return ONLY a clean JSON object matching this structure:
{
  "extracted": {
    "variable_key": "extracted_value_or_null"
  },
  "confidence": 0.0-1.0
}
`;

  const { text } = await requestGeminiGenerateContent({
    contents: [{ parts: [{ text: promptText }] }],
    generationConfig: {
      responseMimeType: "application/json"
    },
    label: 'Gemini variable extraction',
  });

  try {
    return parseGeminiJson(text);
  } catch {
    console.error('Failed to parse Gemini raw extraction text:', text);
    return { extracted: {}, confidence: 0 };
  }
}

/**
 * Direct prompt to generate standard legal language wrapped inside strict Indian Compliance container.
 */
export async function generateCustomDraft(
  userPrompt: string, 
  history: any[] = [],
  currentDraft?: string
): Promise<string> {
  const safePrompt = sanitizeUserPrompt(userPrompt);
  let promptText = "";
  if (currentDraft && currentDraft.length > 50) {
    promptText = `
You are an expert Indian Corporate Lawyer. The user wants to modify their existing legal document draft.

User's requested modification: "${safePrompt}"
Previous conversation context: ${sanitizeHistory(history)}

Here is the CURRENT legal document draft:
\`\`\`markdown
${currentDraft}
\`\`\`

Strict Revision Guidelines:
1. Apply the user's requested modifications (additions, deletions, adjustments, or rewrites) precisely to the CURRENT draft.
2. Maintain the exact same formatting style, formal legal English, statutory references, and structure of the document where possible.
3. Return the ENTIRE revised legal document in Markdown format.
4. Do NOT output any conversational introductions, greetings, meta-discussions, explanations, or postscripts. Return ONLY the final legal markdown body text starting with '# '.
`;
  } else {
    promptText = `
You are an expert Indian Corporate Lawyer. Draft a highly professional document in Markdown format for this user request: "${safePrompt}".
Previous conversation context: ${sanitizeHistory(history)}.

Strict Professional Guidelines:
- Output the document using standard Indian legal headers, structure, and formal legal English.
- Always include clear signing blocks at the bottom.
- Do NOT output any conversational introductions, greetings, meta-discussions, or postscripts. Return ONLY the final legal markdown body text starting with '# '.
`;
  }

  const { text } = await requestGeminiGenerateContent({
    contents: [{ parts: [{ text: promptText }] }],
    label: 'Gemini custom draft generation',
  });
  return text;
}

/**
 * Refine a standardized clause based on custom instructions in the user's prompt.
 */
export async function refineClauseContent(
  clauseText: string,
  userPrompt: string
): Promise<string> {
  const safePrompt = sanitizeUserPrompt(userPrompt);
  const promptText = `
You are a highly precise legal draftsman specializing in Indian corporate law.
We have a standardized clause that has been generated:
---
${clauseText}
---

The user has provided this custom editing instruction/prompt:
"${safePrompt}"

If the user's instruction specifies additional roles, names, custom limits, conditions, or specific nuances that are not fully reflected in the standardized clause, refine the clause text to incorporate those details.

Strict Rules:
1. Maintain the exact formal legal terminology, structure, and formatting of the standardized clause.
2. Only adapt or add details to match the user's instruction. Do not rewrite the entire clause from scratch.
3. If the user's instruction is simple (e.g. just asking to add a limit, which is already in the clause) and doesn't require any additional modifications, return the standardized clause exactly as-is.
4. Output ONLY the refined clause text. Do NOT include any conversational comments, greetings, markdown ticks, or explanations.
`;

  const { text } = await requestGeminiGenerateContent({
    contents: [{ parts: [{ text: promptText }] }],
    label: 'Gemini clause refinement',
  });
  return text.trim();
}

/**
 * Semantically insert a clause into a document when standard anchor matching fails.
 */
export async function semanticInsertClause(
  currentText: string,
  clauseText: string,
  action: string,
  anchor: string,
  fallback: string
): Promise<string> {
  const promptText = `
You are a highly precise legal document editor. Your task is to insert a new clause into an existing legal document at the semantically correct position.

Here is the existing legal document content:
---
${currentText}
---

Here is the new clause to be inserted:
---
${clauseText}
---

The instruction was to insert this clause:
- Action: ${action}
- Anchor (intended section or location): "${anchor}"

Since the physical anchor text was not found or has been modified, find the most appropriate location in the document to insert this clause (e.g., place a transaction limit or signee clause near existing signatories, bank authorization, or operational parameters).
If there is absolutely no logical place, default to the fallback position: ${fallback} (either TOP of the document or BOTTOM of the document).

Strict Rules:
1. Return the ENTIRE updated legal document text.
2. Do not change any other text in the document.
3. Output ONLY the final updated document text. Do NOT include any conversational introductions, markdown code block backticks (like \`\`\`markdown), or explanations.
`;

  const { text } = await requestGeminiGenerateContent({
    contents: [{ parts: [{ text: promptText }] }],
    label: 'Gemini semantic clause insertion',
  });
  // Clean up potential markdown wrapper code ticks if Gemini fails to follow instructions
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-zA-Z]*\n/, '').replace(/\n```$/, '');
  }
  return cleaned.trim();
}
