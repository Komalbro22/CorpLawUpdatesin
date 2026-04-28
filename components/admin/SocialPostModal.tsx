'use client'

import { useState } from 'react'

interface SocialPostModalProps {
    article: {
        title: string
        summary: string
        slug: string
        category: string
    }
    onClose: () => void
}

export default function SocialPostModal({
    article,
    onClose,
}: SocialPostModalProps) {
    const [platforms, setPlatforms] = useState<string[]>(
        ['twitter', 'linkedin']
    )
    const [posting, setPosting] = useState(false)
    const [results, setResults] = useState<Record<string, string> | null>(null)

    const url = `https://www.corplawupdates.in/updates/${article.slug}`

    const tweetPreview = `📋 ${article.title}\n\n${article.summary?.slice(0, 200)}...\n\n🔗 ${url}\n\n#CorporateLaw #${article.category} #CS #Compliance`

    function togglePlatform(p: string) {
        setPlatforms(prev =>
            prev.includes(p)
                ? prev.filter(x => x !== p)
                : [...prev, p]
        )
    }

    async function handlePost() {
        if (!platforms.length) return
        setPosting(true)
        try {
            const res = await fetch('/api/admin/social-post', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: article.title,
                    summary: article.summary,
                    slug: article.slug,
                    category: article.category,
                    platforms,
                }),
            })
            const data = await res.json()
            setResults(data.results)
        } catch {
            setResults({ error: 'failed' })
        } finally {
            setPosting(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-5">

                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-navy">
                        📣 Share on Social Media
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
                    >
                        ×
                    </button>
                </div>

                {/* Platform toggles */}
                <div className="space-y-3">
                    <p className="text-sm font-semibold text-slate-600">
                        Select platforms:
                    </p>

                    {/* Twitter/X */}
                    <button
                        onClick={() => togglePlatform('twitter')}
                        className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${platforms.includes('twitter')
                                ? 'border-black bg-black text-white'
                                : 'border-slate-200 bg-white text-slate-600'
                            }`}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.742l7.735-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                        <div className="text-left">
                            <p className="font-semibold text-sm">X (Twitter)</p>
                            <p className="text-xs opacity-70">Post as tweet to your followers</p>
                        </div>
                        {platforms.includes('twitter') && (
                            <span className="ml-auto text-lg">✓</span>
                        )}
                    </button>

                    {/* LinkedIn */}
                    <button
                        onClick={() => togglePlatform('linkedin')}
                        className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${platforms.includes('linkedin')
                                ? 'border-blue-600 bg-blue-600 text-white'
                                : 'border-slate-200 bg-white text-slate-600'
                            }`}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                        <div className="text-left">
                            <p className="font-semibold text-sm">LinkedIn</p>
                            <p className="text-xs opacity-70">Share as professional post</p>
                        </div>
                        {platforms.includes('linkedin') && (
                            <span className="ml-auto text-lg">✓</span>
                        )}
                    </button>
                </div>

                {/* Tweet preview */}
                <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
                        Preview
                    </p>
                    <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                        {tweetPreview}
                    </p>
                </div>

                {/* Results */}
                {results && (
                    <div className="space-y-2">
                        {Object.entries(results).map(([platform, status]) => (
                            <div
                                key={platform}
                                className={`flex items-center gap-2 p-3 rounded-lg text-sm ${status === 'posted'
                                        ? 'bg-green-50 text-green-700'
                                        : 'bg-red-50 text-red-700'
                                    }`}
                            >
                                <span>{status === 'posted' ? '✅' : '❌'}</span>
                                <span className="capitalize font-medium">{platform}:</span>
                                <span>
                                    {status === 'posted'
                                        ? 'Posted successfully!'
                                        : 'Failed — check API keys in settings'}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                    {!results ? (
                        <>
                            <button
                                onClick={onClose}
                                className="flex-1 border border-slate-300 text-slate-600 py-3 rounded-xl font-semibold text-sm hover:bg-slate-50"
                            >
                                Skip for now
                            </button>
                            <button
                                onClick={handlePost}
                                disabled={posting || !platforms.length}
                                className="flex-1 bg-amber-400 hover:bg-amber-500 text-navy py-3 rounded-xl font-bold text-sm disabled:opacity-50 transition-colors"
                            >
                                {posting
                                    ? 'Posting...'
                                    : `Post to ${platforms.length} platform${platforms.length !== 1 ? 's' : ''}`}
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={onClose}
                            className="w-full bg-navy text-white py-3 rounded-xl font-bold text-sm"
                        >
                            Done ✓
                        </button>
                    )}
                </div>

            </div>
        </div>
    )
}
