'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DocumentIntentSearch() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const router = useRouter()

  async function handleSearch() {
    if (query.length < 5) return
    setLoading(true)
    try {
      const res = await fetch('/api/documents/intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      })
      const data = await res.json()
      setResult(data)
    } catch {
      // Handle error silently
    } finally {
      setLoading(false)
    }
  }

  const examples = [
    "I need to open a bank account for my company",
    "Director resigned, need to inform ROC",
    "Taking a loan from HDFC Bank",
    "Appoint a new director today",
    "Change registered office address",
  ]

  return (
    <div className="max-w-2xl mx-auto">
      
      {/* Search box */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 
                             -translate-y-1/2 text-xl">
              🤖
            </span>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleSearch()
              }}
              placeholder="Tell me what document you need..."
              className="w-full bg-white/10 
                         border border-white/30 
                         text-white placeholder-slate-400
                         rounded-2xl py-4 pl-12 pr-4
                         text-sm focus:outline-none
                         focus:ring-2 focus:ring-amber-400
                         focus:border-transparent"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading || query.length < 5}
            className="bg-amber-400 hover:bg-amber-500 
                       text-navy font-bold px-6 
                       rounded-2xl text-sm 
                       transition-colors
                       disabled:opacity-60 
                       flex items-center gap-2
                       flex-shrink-0"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 
                border-navy border-t-transparent 
                rounded-full animate-spin" />
            ) : (
              '→ Find'
            )}
          </button>
        </div>
      </div>

      {/* Example queries */}
      {!result && (
        <div className="flex flex-wrap gap-2 
                        justify-center mt-4">
          {examples.map(ex => (
            <button
              key={ex}
              onClick={() => setQuery(ex)}
              className="text-xs bg-white/10 
                         text-slate-300 px-3 py-1.5 
                         rounded-full hover:bg-white/20
                         transition-colors text-left"
            >
              {ex}
            </button>
          ))}
        </div>
      )}

      {/* Intent result */}
      {result && (
        <div className="mt-4 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl 
                        p-5 text-left shadow-xl">
          
          {result.intent?.warning && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 
                            rounded-xl p-3 mb-4 flex gap-2">
              <span className="text-red-500">⚠️</span>
              <p className="text-red-800 dark:text-red-400 text-sm 
                            font-medium">
                {result.intent.warning}
              </p>
            </div>
          )}

          {result.matched_template ? (
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                Best match found:
              </p>
              <div className="bg-amber-50 dark:bg-amber-950/15 border 
                              border-amber-200 dark:border-amber-900/30 
                              rounded-xl p-4 mb-4">
                <h3 className="font-bold text-navy dark:text-white">
                  {result.matched_template.name}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-350 
                              mt-1">
                  {result.matched_template.description}
                </p>
                <div className="mt-1 text-xs 
                                text-amber-700 dark:text-amber-400 font-medium">
                  Confidence: {Math.round(
                    (result.intent.confidence || 0) * 100
                  )}% match
                </div>
              </div>
              
              {result.intent.missing_info?.length > 0 && (
                <div className="text-xs text-slate-500 dark:text-slate-450 
                                mb-4">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    You may also need:
                  </span>
                  {' '}
                  {result.intent.missing_info.join(', ')}
                </div>
              )}

              <button
                onClick={() => router.push(
                  `/documents/${result.matched_template.slug}`
                )}
                className="w-full bg-amber-400 
                           hover:bg-amber-500 text-navy 
                           font-bold py-3 rounded-xl 
                           text-sm transition-colors"
              >
                Generate {result.matched_template.name} →
              </button>

              {result.intent.alternatives?.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                    Or choose an alternative:
                  </p>
                  <div className="space-y-1">
                    {result.intent.alternatives
                      .slice(0, 2)
                      .map((altSlug: string) => {
                        const alt = result.all_templates?.find(
                          (t: any) => t.slug === altSlug
                        )
                        if (!alt) return null
                        return (
                          <button
                            key={altSlug}
                            onClick={() => router.push(
                              `/documents/${altSlug}`
                            )}
                            className="w-full text-left 
                                       text-sm text-navy dark:text-slate-200 
                                       hover:text-amber-700 dark:hover:text-amber-400 
                                       border border-slate-200 dark:border-slate-800 
                                       rounded-lg px-3 py-2
                                       hover:border-amber-300 dark:hover:border-amber-500
                                       transition-colors"
                          >
                            {alt.name} →
                          </button>
                        )
                      })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-slate-600 dark:text-slate-350 font-medium">
                No exact match found
              </p>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                Browse all document types below
              </p>
            </div>
          )}

          <button
            onClick={() => setResult(null)}
            className="mt-3 text-xs text-slate-400 dark:text-slate-500 
                       hover:text-slate-600 dark:hover:text-slate-300 w-full 
                       text-center"
          >
            ← Try a different query
          </button>
        </div>
      )}
    </div>
  )
}
