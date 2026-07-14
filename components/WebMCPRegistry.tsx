'use client';

import { useEffect } from 'react';

export default function WebMCPRegistry() {
  useEffect(() => {
    if (!('modelContext' in document) || !document.modelContext) return;

    // Register RBI Repo Rate headless tool
    try {
      document.modelContext.registerTool({
        name: 'getRBIRepoRate',
        description: 'Get the current RBI Repo Rate and recent history from the RBI regulatory dashboard.',
        inputSchema: {
          type: 'object',
          properties: {},
          required: []
        },
        execute: async () => {
          try {
            const res = await fetch('/api/tools/rbi-rate');
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            return `Current RBI Repo Rate: ${data.currentRate}%\nLast updated: ${data.lastUpdated}\n\nRecent History:\n${data.history.map((h: any) => `- ${h.date}: ${h.rate}%`).join('\n')}`;
          } catch (e) {
            return 'Failed to fetch current RBI Repo Rate. Please check the RBI website directly.';
          }
        }
      });
    } catch (err) {
      console.warn("Failed to register tool 'getRBIRepoRate':", err);
    }

    // Register ROC Deadline Tracker headless tool
    try {
      document.modelContext.registerTool({
        name: 'getROCDeadline',
        description: 'Check the next ROC filing deadline for a specific form (e.g., AOC-4, MGT-7, DIR-3 KYC).',
        inputSchema: {
          type: 'object',
          properties: {
            formName: {
              type: 'string',
              description: 'Name of the ROC form. Examples: "AOC-4", "MGT-7", "DIR-3 KYC"'
            }
          },
          required: ['formName']
        },
        execute: async (params: { formName?: string }) => {
          try {
            const res = await fetch(`/api/tools/roc-deadline?form=${encodeURIComponent(params.formName || '')}`);
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            return `The next ROC deadline for ${data.formName} is ${data.deadlineDate}.\nApplicable to: ${data.applicableTo}\nPenalty: ${data.penalty}\nFor more details, visit: https://corplawupdates.in/calendar`;
          } catch (e) {
            return `Could not find ROC deadline for "${params.formName}". Visit https://corplawupdates.in/calendar for the full corporate compliance calendar.`;
          }
        }
      });
    } catch (err) {
      console.warn("Failed to register tool 'getROCDeadline':", err);
    }

    return () => {
      if (!('modelContext' in document) || !document.modelContext) return;
      try {
        document.modelContext.unregisterTool?.('getRBIRepoRate');
      } catch (err) {
        console.warn("Failed to unregister tool 'getRBIRepoRate':", err);
      }
      try {
        document.modelContext.unregisterTool?.('getROCDeadline');
      } catch (err) {
        console.warn("Failed to unregister tool 'getROCDeadline':", err);
      }
    };
  }, []);

  return null;
}
