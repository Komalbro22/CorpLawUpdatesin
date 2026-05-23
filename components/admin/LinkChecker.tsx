'use client'
import { useState } from 'react'
import { useToast } from '@/components/Toast'

interface LinkResult {
  url: string
  status: 'checking' | 'ok' | 'broken' | 'unknown'
  statusCode?: number
}

export default function LinkChecker({ 
  content 
}: { content: string }) {
  const { showToast } = useToast()
  const [results, setResults] = useState<LinkResult[]>([])
  const [checking, setChecking] = useState(false)
  const [done, setDone] = useState(false)

  function extractLinks(text: string): string[] {
    const links: string[] = []
    
    // Markdown links: [text](url)
    const mdLinks = Array.from(text.matchAll(
      /\[.*?\]\((https?:\/\/[^)]+)\)/g
    ))
    mdLinks.forEach(match => {
      links.push(match[1])
    })
    
    // HTML href links
    const htmlLinks = Array.from(text.matchAll(
      /href=["'](https?:\/\/[^"']+)["']/g
    ))
    htmlLinks.forEach(match => {
      links.push(match[1])
    })
    
    // Deduplicate
    return Array.from(new Set(links))
  }

  async function checkLinks() {
    const links = extractLinks(content)
    if (links.length === 0) {
      showToast('No external links found in content', 'info')
      return
    }

    setChecking(true)
    setDone(false)
    
    const initial: LinkResult[] = links.map(url => ({
      url,
      status: 'checking',
    }))
    setResults(initial)

    // Check links via our API
    for (let i = 0; i < links.length; i++) {
      const url = links[i]
      try {
        const res = await fetch(
          `/api/admin/check-link?url=${encodeURIComponent(url)}`
        )
        const data = await res.json()
        
        setResults(prev => prev.map(r => 
          r.url === url 
            ? { 
                ...r, 
                status: data.ok ? 'ok' : 'broken',
                statusCode: data.status,
              } 
            : r
        ))
      } catch {
        setResults(prev => prev.map(r => 
          r.url === url 
            ? { ...r, status: 'unknown' } 
            : r
        ))
      }
      
      // Small delay between requests
      await new Promise(r => setTimeout(r, 500))
    }

    setChecking(false)
    setDone(true)
  }

  const brokenCount = results.filter(
    r => r.status === 'broken'
  ).length

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={checkLinks}
        disabled={checking}
        className="flex items-center gap-2 
                   text-sm px-3 py-1.5 
                   border border-slate-300 
                   text-slate-600 rounded-lg
                   hover:border-amber-400 
                   hover:text-amber-700
                   disabled:opacity-50
                   transition-colors"
      >
        {checking ? '⏳ Checking...' : '🔗 Check Links'}
      </button>

      {results.length > 0 && (
        <div className="border border-slate-200 
                        rounded-xl overflow-hidden 
                        text-xs max-h-48 
                        overflow-y-auto">
          {done && (
            <div className={`px-3 py-2 font-semibold
              ${brokenCount > 0 
                ? 'bg-red-50 text-red-700' 
                : 'bg-green-50 text-green-700'}`}>
              {brokenCount === 0 
                ? `✅ All ${results.length} links OK!`
                : `❌ ${brokenCount} broken link(s) found`}
            </div>
          )}
          {results.map((r, i) => (
            <div key={i} 
                 className="flex items-center gap-2 
                            px-3 py-1.5 
                            border-t border-slate-100">
              <span className="flex-shrink-0">
                {r.status === 'checking' ? '⏳' :
                 r.status === 'ok' ? '✅' :
                 r.status === 'broken' ? '❌' : '⚠️'}
              </span>
              <span className="truncate text-slate-600 
                               flex-1 min-w-0">
                {r.url}
              </span>
              {r.statusCode && (
                <span className={`flex-shrink-0 
                  ${r.status === 'ok' 
                    ? 'text-green-600' 
                    : 'text-red-600'}`}>
                  {r.statusCode}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
