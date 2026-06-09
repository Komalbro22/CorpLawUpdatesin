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
