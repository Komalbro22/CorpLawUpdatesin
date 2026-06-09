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
      const fetchedAlerts = data.alerts || [];
      setAlerts(fetchedAlerts);
      setRan(true);
      onAuditComplete?.(fetchedAlerts.some((a: ConflictAlert) => a.severity === 'CRITICAL'));
    } catch (err) {
      console.error('[ConflictAuditor] Failed to run check:', err);
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
