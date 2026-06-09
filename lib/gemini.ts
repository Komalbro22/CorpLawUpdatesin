// lib/gemini.ts
// Secure server-side wrapper for Google Gemini models with key rotation.

/**
 * Helper to run API requests with automatic fallback/rotation across multiple Gemini API keys.
 */
async function runWithKeyRotation<T>(
  fn: (apiKey: string) => Promise<T>
): Promise<T> {
  const keys = [
    process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '',
    process.env.GOOGLE_GEMINI_API_KEY_2 || '',
    process.env.GOOGLE_GEMINI_API_KEY_3 || '',
    process.env.GOOGLE_GEMINI_API_KEY_4 || '',
  ]
    .map(k => k.trim())
    .filter(Boolean);

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
      
      const isQuotaError = 
        err.message?.includes('429') || 
        err.message?.includes('403') || 
        err.message?.includes('quota') || 
        err.message?.includes('limit');
        
      if (isQuotaError && i < keys.length - 1) {
        console.log(`[Gemini API] Quota/Rate limit hit on key index ${i}. Rotating to key index ${i + 1}...`);
        continue;
      }
      
      // If it's not a quota issue or we are on the last key, propagate the error
      throw err;
    }
  }
  
  throw lastError || new Error('All Gemini API keys failed.');
}

/**
 * Generate 768-dimension vector embeddings using text-embedding-004.
 */
export async function getEmbedding(text: string): Promise<number[]> {
  return runWithKeyRotation(async (apiKey) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
 * Extract structured parameters from free text using JSON Schema schemas with gemini-2.5-flash or gemini-1.5-pro.
 */
export async function extractVariables(
  fieldsSchema: any[], 
  clientPrompt: string, 
  history: any[] = []
): Promise<{ extracted: Record<string, string | null>; confidence: number }> {
  return runWithKeyRotation(async (apiKey) => {
    const promptText = `
You are a highly precise legal data extractor. Extract values for the requested variables based on the required fields schema and client text.

Required fields schema: ${JSON.stringify(fieldsSchema)}
Client's prompt input: "${clientPrompt}"
Previous conversation history context: "${JSON.stringify(history)}"

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

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Gemini variable extraction failed (status ${response.status}): ${response.statusText} ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    
    try {
      return JSON.parse(rawText.trim());
    } catch {
      console.error('Failed to parse Gemini raw extraction text:', rawText);
      return { extracted: {}, confidence: 0 };
    }
  });
}

/**
 * Direct prompt to generate standard legal language wrapped inside strict Indian Compliance container.
 */
export async function generateCustomDraft(
  userPrompt: string, 
  history: any[] = [],
  currentDraft?: string
): Promise<string> {
  return runWithKeyRotation(async (apiKey) => {
    let promptText = "";
    if (currentDraft && currentDraft.length > 50) {
      promptText = `
You are an expert Indian Corporate Lawyer. The user wants to modify their existing legal document draft.

User's requested modification: "${userPrompt}"
Previous conversation context: "${JSON.stringify(history)}"

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
You are an expert Indian Corporate Lawyer. Draft a highly professional document in Markdown format for this user request: "${userPrompt}".
Previous conversation context: "${JSON.stringify(history)}".

Strict Professional Guidelines:
- Output the document using standard Indian legal headers, structure, and formal legal English.
- Always include clear signing blocks at the bottom.
- Do NOT output any conversational introductions, greetings, meta-discussions, or postscripts. Return ONLY the final legal markdown body text starting with '# '.
`;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Gemini custom draft generation failed (status ${response.status}): ${response.statusText} ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  });
}
