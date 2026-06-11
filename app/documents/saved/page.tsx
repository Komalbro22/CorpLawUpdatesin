'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getSavedDocuments, deleteSavedDocument, SavedDocument } from '@/lib/saved-documents'

export default function SavedDocumentsPage() {
  const [documents, setDocuments] = useState<SavedDocument[]>([])
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    setDocuments(getSavedDocuments())
  }, [])

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this saved document?')) {
      deleteSavedDocument(id)
      setDocuments(getSavedDocuments())
    }
  }

  if (!isClient) return null // Avoid hydration mismatch

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/documents" className="text-amber-600 dark:text-amber-400 text-sm font-medium hover:underline mb-4 inline-block">
            &larr; Back to Templates
          </Link>
          <h1 className="text-3xl font-heading font-bold text-navy dark:text-white">Your Saved Documents</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Documents you have generated are saved locally on your device.
          </p>
        </div>

        {documents.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-12 text-center">
            <span className="text-4xl mb-4 block">📄</span>
            <h3 className="text-xl font-bold text-navy dark:text-white mb-2">No saved documents yet</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">
              When you generate a legal document, it will be saved here automatically.
            </p>
            <Link 
              href="/documents" 
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-bold transition-colors"
            >
              Browse Templates
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {documents.map(doc => (
              <div key={doc.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-navy dark:text-white">{doc.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                    <span>Generated: {new Date(doc.createdAt).toLocaleDateString()} {new Date(doc.createdAt).toLocaleTimeString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <button 
                    onClick={() => {
                      const w = window.open('', '_blank')
                      if (w) {
                        w.document.write(\`
                          <html>
                            <head>
                              <title>\${doc.title}</title>
                              <style>
                                body { font-family: serif; max-width: 800px; margin: 0 auto; padding: 40px; line-height: 1.6; }
                                @media print { body { padding: 0; } }
                              </style>
                            </head>
                            <body>
                              \${doc.content}
                            </body>
                            <script>window.onload = function() { window.print(); }</script>
                          </html>
                        \`)
                        w.document.close()
                      }
                    }}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-navy dark:text-white rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    View / Print
                  </button>
                  <button 
                    onClick={() => handleDelete(doc.id)}
                    className="px-4 py-2 text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
