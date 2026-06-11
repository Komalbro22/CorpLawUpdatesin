// app/admin/rule-learning/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/Toast';

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
  const { showToast } = useToast();

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
    } catch (err) {
      console.error('Failed to load data:', err);
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
        showToast(`Rule "${item.proposed_intent}" approved and activated!`, 'success');
        loadData();
      } else {
        showToast('Error: ' + result.error, 'error');
      }
    } catch (err) {
      console.error('Approve failed:', err);
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
    } catch (err) {
      console.error('Reject failed:', err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Learning Panel</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Review AI-generalized rules before they go live.
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
                  <p className="text-sm mt-1">No new rules are currently in the queue.</p>
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
