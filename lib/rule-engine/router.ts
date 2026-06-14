// lib/rule-engine/router.ts
import { supabaseAdmin } from '@/lib/supabase-server';
import { supabaseDocumentsAdmin } from '@/lib/supabase-documents-server';

const docDb = supabaseDocumentsAdmin || supabaseAdmin;

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

// ─── Normalize Anchor Text (Fuzzy Matching) ──────────────────────────────────
function normalizeAnchorText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[#\d.,\/#!$%\^&\*;:{}=\-_`~()?]/g, '') // remove markdown symbols, numbers, punctuation
    .replace(/\b(please|the|a|an|could|you|insert|add|put|show|make|in|for|to|into|section|clause|article|agreement)\b/gi, '') // strip fluff
    .replace(/\s+/g, ' ')
    .trim();
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
    const result = await extractVariables(fieldsSpec, prompt, []);
    return (result?.extracted as Record<string, string>) || {};
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
  const { data: clause, error: clauseError } = await docDb
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
  const lines = currentText.split('\n');
  let injected = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let isMatch = false;

    if (placement.anchor_type === 'HEADING') {
      if (line.trim().startsWith('#')) {
        const normalizedLine = normalizeAnchorText(line);
        const normalizedAnchor = normalizeAnchorText(placement.anchor);
        isMatch = normalizedLine.includes(normalizedAnchor) && normalizedAnchor !== '';
      }
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
  const { data: conflictRules } = await docDb
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
    await docDb.from('document_clause_log').insert({
      document_id: documentId,
      clause_id: clause.id,
      version_applied: clause.version,
    });
  }

  // 8. Increment usage count on the rule
  const { data: currentRule } = await docDb
    .from('rules')
    .select('usage_count')
    .eq('clause_id', clauseId)
    .single();

  if (currentRule) {
    await docDb
      .from('rules')
      .update({ usage_count: (currentRule.usage_count || 0) + 1 })
      .eq('clause_id', clauseId);
  }

  return {
    text: updatedText,
    inlineWarnings,
    clauseVersion: clause.version,
    missingVariables,
  };
}
