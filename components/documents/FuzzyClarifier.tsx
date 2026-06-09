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
