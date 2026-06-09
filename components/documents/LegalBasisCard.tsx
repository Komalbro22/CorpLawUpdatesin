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
