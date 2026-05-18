/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import sanitizeHtml from 'sanitize-html'
import {
    AlertTriangle,
    ChevronDown,
    ChevronUp,
    FlaskConical,
    Loader2,
    Mail,
    PartyPopper,
    Rocket,
    X,
    XCircle,
    Search,
    FileText,
    CheckSquare,
    Square,
    Sparkles,
    Settings,
    History,
    Calendar,
    CheckCircle2
} from 'lucide-react'
import { useToast } from '@/components/Toast'

const MDEditor = dynamic(
    () => import('@uiw/react-md-editor'),
    { ssr: false }
)

interface SendResult {
    sent: number
    failed: number
    total: number
    testOnly?: boolean
    successList?: string[]
    failedList?: string[]
}

export default function NewsletterPage() {
    const { showToast } = useToast()
    const [subject, setSubject] = useState('')
    const [previewText, setPreviewText] = useState('')
    const [body, setBody] = useState('')
    const [sending, setSending] = useState(false)
    const [testSending, setTestSending] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [subscriberCount, setSubscriberCount] = useState(0)
    const [result, setResult] = useState<SendResult | null>(null)
    const [error, setError] = useState('')
    const [showPreview, setShowPreview] = useState(true) // Default to show isolated iframe preview
    const [failedList, setFailedList] = useState<string[]>([])
    
    // Editor and Mode states
    const [modeTab, setModeTab] = useState<'auto' | 'custom' | 'legacy'>('auto')
    const [editorMode, setEditorMode] = useState<'markdown' | 'html'>('markdown')
    const [targetType, setTargetType] = useState<'all' | 'specific'>('all')
    const [specificEmail, setSpecificEmail] = useState('')
    const [testEmail, setTestEmail] = useState('')
    
    // Schedule states
    const [isScheduled, setIsScheduled] = useState(false)
    const [scheduledAt, setScheduledAt] = useState('')

    // Curator & Auto builder states
    const [autoArticles, setAutoArticles] = useState<any[]>([])
    const [loadingAuto, setLoadingAuto] = useState(false)
    const [availableArticles, setAvailableArticles] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [customSelectedIds, setCustomSelectedIds] = useState<string[]>([])
    const [introMessage, setIntroMessage] = useState('')
    
    // Live template preview
    const [previewHtml, setPreviewHtml] = useState('')
    const [renderingPreview, setRenderingPreview] = useState(false)

    // Load active subscriber count
    useEffect(() => {
        fetch('/api/admin/subscribers?status=active')
            .then(r => r.json())
            .then(data => {
                setSubscriberCount(data.stats?.totalActive || data.total || 0)
            })
            .catch(err => console.error('Failed to fetch subscriber count:', err))
    }, [])

    // Fetch published articles for Custom mode search box
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetch(`/api/admin/articles?status=published&search=${encodeURIComponent(searchQuery)}`)
                .then(res => res.json())
                .then(data => {
                    if (data.articles) {
                        setAvailableArticles(data.articles)
                    }
                })
                .catch(err => console.error('Failed to load published articles:', err))
        }, 300)
        return () => clearTimeout(delayDebounce)
    }, [searchQuery])

    // Load default settings and fetch stats for Auto mode
    useEffect(() => {
        if (modeTab === 'auto') {
            setLoadingAuto(true)
            fetch('/api/admin/newsletter/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject: 'Weekly Regulator Update',
                    previewText: '',
                    previewOnly: true,
                    newsletterMode: 'auto'
                })
            })
            .then(res => res.json())
            .then(data => {
                if (data.articles) {
                    setAutoArticles(data.articles)
                    
                    // Set intelligent default subject
                    const todayStr = new Date().toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                    })
                    setSubject(`Weekly Corporate Law Update — ${todayStr}`)
                    
                    // Set default preview text based on top article
                    if (data.articles.length > 0) {
                        const topArt = data.articles[0]
                        setPreviewText(`This week's top update: ${topArt.title}. Read details inside.`)
                    } else {
                        setPreviewText('Stay updated with this week\'s corporate compliance and regulatory updates.')
                    }
                }
                setLoadingAuto(false)
            })
            .catch(err => {
                console.error(err)
                setLoadingAuto(false)
            })
        } else if (modeTab === 'legacy') {
            setSubject('Corporate Law Intelligence Newsletter')
            setPreviewText('Important legal and compliance updates from CorpLawUpdates.in')
            setBody('### Weekly Regulatory Highlights\n\n- Write your newsletter here...')
        }
    }, [modeTab])

    // Dynamically update smart subject and preview defaults in Custom mode based on curation
    useEffect(() => {
        if (modeTab === 'custom' && customSelectedIds.length > 0) {
            const todayStr = new Date().toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            })
            setSubject(`Curated Compliance & Regulatory Updates — ${todayStr}`)
            
            const topChosen = availableArticles.find(a => customSelectedIds.includes(a.id))
            if (topChosen) {
                setPreviewText(`Featured: ${topChosen.title}. Read full insights inside.`)
            }
        }
    }, [modeTab, customSelectedIds, availableArticles])

    // Real-time isolated template preview compiler
    async function renderLivePreview() {
        if (!subject.trim()) return

        setRenderingPreview(true)
        try {
            const payload: any = {
                subject: subject.trim(),
                previewText: previewText.trim(),
                previewOnly: true,
                newsletterMode: modeTab === 'legacy' ? undefined : modeTab,
                introMessage: modeTab === 'custom' ? introMessage : undefined,
                selectedArticleIds: modeTab === 'custom' ? customSelectedIds : undefined,
                body: modeTab === 'legacy' ? body : undefined,
                mode: modeTab === 'legacy' ? editorMode : undefined
            }

            const res = await fetch('/api/admin/newsletter/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (res.ok) {
                const data = await res.json()
                setPreviewHtml(data.html)
            }
        } catch (err) {
            console.error('Failed to render live preview:', err)
        } finally {
            setRenderingPreview(false)
        }
    }

    // Trigger debounced preview compilation
    useEffect(() => {
        const timer = setTimeout(() => {
            renderLivePreview()
        }, 800)
        return () => clearTimeout(timer)
    }, [subject, previewText, introMessage, customSelectedIds, modeTab, body, editorMode])

    async function handleSend(testOnly: boolean, retryList?: string[]) {
        setError('')

        if (!subject.trim()) {
            setError('Subject line is required')
            showToast('Subject line is required', 'error')
            return
        }
        if (modeTab === 'legacy' && !body.trim()) {
            setError('Email body is required for classic mode')
            showToast('Email body is required for classic mode', 'error')
            return
        }
        if (modeTab === 'custom' && customSelectedIds.length === 0) {
            setError('Please select at least one article for custom curation')
            showToast('Please select at least one article for custom curation', 'error')
            return
        }

        if (testOnly) {
            setTestSending(true)
        } else {
            setSending(true)
            setShowConfirm(false)
        }

        try {
            const payload: any = {
                subject: subject.trim(),
                previewText: previewText.trim(),
                testOnly,
                testEmail: testOnly ? testEmail.trim() : undefined,
                scheduledAt: (!testOnly && isScheduled && scheduledAt) ? new Date(scheduledAt).toISOString() : undefined,
                newsletterMode: modeTab === 'legacy' ? undefined : modeTab,
                selectedArticleIds: modeTab === 'custom' ? customSelectedIds : undefined,
                introMessage: modeTab === 'custom' ? introMessage : undefined,
                body: modeTab === 'legacy' ? body.trim() : undefined,
                mode: modeTab === 'legacy' ? editorMode : undefined,
            }

            if (retryList && retryList.length > 0) {
                payload.targetEmails = retryList
            } else if (!testOnly && targetType === 'specific') {
                if (!specificEmail.trim()) {
                    setError('Specific subscriber email is required')
                    setSending(false)
                    showToast('Specific subscriber email is required', 'error')
                    return
                }
                payload.targetEmails = [specificEmail.trim()]
            }

            const res = await fetch('/api/admin/newsletter/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Failed to send newsletter')
            }

            setResult(data)
            if (!testOnly && data.failedList) {
                setFailedList(data.failedList)
            } else {
                setFailedList([])
            }

            showToast(testOnly ? 'Test email dispatched!' : 'Newsletter process completed!', 'success')

        } catch (err: any) {
            const msg = err.message || 'Something went wrong'
            setError(msg)
            showToast(msg, 'error')
        } finally {
            setTestSending(false)
            setSending(false)
        }
    }

    const toggleArticleSelection = (id: string) => {
        setCustomSelectedIds(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        )
    }

    // SUCCESS SUMMARY COMPONENT
    if (result) {
        return (
            <div className="max-w-2xl mx-auto content-fade-in">
                <div className="bg-white rounded-2xl shadow-card border border-slate-200/80 p-10 text-center ring-1 ring-slate-900/[0.02]">
                    <div className="flex justify-center mb-5">
                        {result.testOnly ? (
                            <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                                <FlaskConical className="w-8 h-8" aria-hidden />
                            </span>
                        ) : (
                            <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                                <PartyPopper className="w-8 h-8" aria-hidden />
                            </span>
                        )}
                    </div>
                    <h2 className="text-2xl font-heading font-bold text-navy mb-2">
                        {result.testOnly
                            ? 'Test Email Sent!'
                            : (result as any).scheduled 
                                ? 'Newsletter Scheduled!' 
                                : 'Newsletter Sent Successfully!'}
                    </h2>
                    {(result as any).scheduled && (
                        <p className="text-slate-600 mb-6">
                            Your newsletter is queued for <span className="font-bold">{new Date((result as any).scheduledAt).toLocaleString()}</span>
                        </p>
                    )}
                    {!result.testOnly && (
                        <div className="bg-slate-50 rounded-xl p-4 my-4 flex justify-around">
                            <div>
                                <div className="text-3xl font-bold text-green-600">
                                    {result.sent}
                                </div>
                                <div className="text-sm text-slate-500">Sent</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-red-500">
                                    {result.failed}
                                </div>
                                <div className="text-sm text-slate-500">Failed</div>
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-navy">
                                    {result.total}
                                </div>
                                <div className="text-sm text-slate-500">Total</div>
                            </div>
                        </div>
                    )}
                    {failedList.length > 0 && (
                        <div className="mt-8 text-left bg-red-50 border border-red-200 rounded-xl p-6 w-full mx-auto">
                            <h3 className="text-red-800 font-semibold mb-2 text-lg">Failed Deliveries ({failedList.length})</h3>
                            <p className="text-red-600 text-sm mb-4">The following emails experienced provider rejections or bounces. You can attempt to retry them directly.</p>
                            <ul className="list-disc ml-5 text-sm text-red-700 mb-6 max-h-40 overflow-y-auto w-full border border-red-200/50 bg-white p-3 rounded shadow-inner">
                                {failedList.map((email, i) => <li key={i} className="py-0.5">{email}</li>)}
                            </ul>
                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => handleSend(false, failedList)}
                                    disabled={sending}
                                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 font-semibold bg-red-600 text-white rounded-lg shadow-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                                >
                                    {sending ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                                            Retrying…
                                        </>
                                    ) : (
                                        'Retry failed deliveries'
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="mt-8">
                        <button
                            type="button"
                            onClick={() => {
                                setResult(null)
                                setSubject('')
                                setPreviewText('')
                                setBody('')
                                setError('')
                                setFailedList([])
                                setIsScheduled(false)
                                setScheduledAt('')
                                setCustomSelectedIds([])
                                setIntroMessage('')
                            }}
                            className="px-6 py-3 bg-gold text-navy font-semibold rounded-xl hover:bg-amber-400 transition-colors shadow-sm animate-pulse"
                        >
                            Compose another send
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6 content-fade-in">
            {/* Header & Meta */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-navy flex items-center gap-3">
                        <Mail className="w-8 h-8 text-amber-500" aria-hidden />
                        Newsletter Campaign Center
                    </h1>
                    <p className="text-slate-500 mt-1">
                        {subscriberCount > 0
                            ? `Connected to ${subscriberCount} active & verified compliance subscribers`
                            : 'Loading active subscribers...'}
                    </p>
                </div>
                <div>
                    <a
                        href="/admin/newsletter/history"
                        className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-sm font-semibold text-slate-700 transition-colors bg-white shadow-sm"
                    >
                        <History size={16} />
                        View Campaign History
                    </a>
                </div>
            </div>

            {/* Error Banner */}
            {error && (
                <div role="alert" className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden />
                    <span className="flex-1 text-sm font-medium leading-relaxed">{error}</span>
                    <button
                        type="button"
                        onClick={() => setError('')}
                        className="text-red-500 hover:text-red-700 p-1 rounded-md hover:bg-red-100 transition-colors"
                        aria-label="Dismiss error"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* COMPOSER GRID LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* LEFT COMPOSITION DRAWER */}
                <div className="lg:col-span-7 space-y-6">
                    
                    {/* MODE TABS BAR */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200/80 p-1 flex ring-1 ring-slate-900/[0.01]">
                        <button
                            type="button"
                            onClick={() => setModeTab('auto')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${
                                modeTab === 'auto'
                                    ? 'bg-navy text-white shadow-md'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-navy'
                            }`}
                        >
                            <Sparkles size={16} className={modeTab === 'auto' ? 'text-amber-400' : ''} />
                            Auto Generate (7d)
                        </button>
                        <button
                            type="button"
                            onClick={() => setModeTab('custom')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${
                                modeTab === 'custom'
                                    ? 'bg-navy text-white shadow-md'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-navy'
                            }`}
                        >
                            <Settings size={16} className={modeTab === 'custom' ? 'text-amber-400' : ''} />
                            Custom Curated
                        </button>
                        <button
                            type="button"
                            onClick={() => setModeTab('legacy')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${
                                modeTab === 'legacy'
                                    ? 'bg-navy text-white shadow-md'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-navy'
                            }`}
                        >
                            <FileText size={16} />
                            Classic Markdown
                        </button>
                    </div>

                    {/* GENERAL METADATA CARD */}
                    <div className="bg-white rounded-xl shadow-card border border-slate-200/80 p-6 space-y-5 ring-1 ring-slate-900/[0.02]">
                        
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                            <FileText className="text-amber-500" size={18} />
                            <h2 className="font-heading font-bold text-navy text-lg">Envelope Details</h2>
                        </div>

                        {/* Subject */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Subject Line <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={subject}
                                onChange={e => setSubject(e.target.value)}
                                placeholder="Weekly Corporate Law Update — April 2026"
                                className="w-full border border-slate-200 rounded-lg px-4 py-3 text-navy text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                            />
                        </div>

                        {/* Preview Text */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                Preview text / Preheader
                                <span className="text-slate-400 font-normal lowercase ml-2">
                                    (displays below subject line in inbox)
                                </span>
                            </label>
                            <input
                                type="text"
                                value={previewText}
                                onChange={e => setPreviewText(e.target.value)}
                                placeholder="This week's top compliance developments: MCA rules, SEBI circulars..."
                                maxLength={100}
                                className="w-full border border-slate-200 rounded-lg px-4 py-3 text-navy text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                            />
                            <p className="text-[10px] text-slate-400 mt-1 text-right font-medium">
                                {previewText.length}/100 characters
                            </p>
                        </div>
                    </div>

                    {/* DYNAMIC MODE SPECIFIC FIELDS CONTAINER */}
                    <div className="bg-white rounded-xl shadow-card border border-slate-200/80 p-6 ring-1 ring-slate-900/[0.02] min-h-[16rem]">
                        
                        {/* ───────────────── AUTO GENERATE TAB ───────────────── */}
                        {modeTab === 'auto' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                    <h3 className="font-heading font-bold text-navy flex items-center gap-2">
                                        <Sparkles className="text-amber-500" size={18} />
                                        Auto-Aggregated Regulator Updates (Last 7 Days)
                                    </h3>
                                    {loadingAuto && <Loader2 size={16} className="animate-spin text-amber-500" />}
                                </div>

                                {autoArticles.length > 0 ? (
                                    <div className="space-y-3">
                                        <p className="text-xs text-slate-500 leading-relaxed">
                                            The system automatically fetched the following <span className="font-bold text-navy">{autoArticles.length} published updates</span> to build your digest block.
                                        </p>
                                        <div className="border border-slate-100 rounded-xl divide-y divide-slate-100 max-h-60 overflow-y-auto">
                                            {autoArticles.map((art, index) => (
                                                <div key={art.id} className="p-3 text-sm flex items-start gap-3 hover:bg-slate-50/50 transition-colors">
                                                    <span className="text-xs font-bold text-slate-400 min-w-[1.2rem] text-right mt-0.5">{index + 1}.</span>
                                                    <div className="flex-1">
                                                        <p className="font-semibold text-navy leading-tight">{art.title}</p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase">
                                                                {art.category}
                                                            </span>
                                                            {art.impact_level && (
                                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded capitalize ${
                                                                    art.impact_level === 'high' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'
                                                                }`}>
                                                                    {art.impact_level} impact
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-10 space-y-2 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                                        <AlertTriangle className="mx-auto text-slate-400" size={32} />
                                        <p className="text-sm font-semibold text-slate-600">No updates published in the last 7 days</p>
                                        <p className="text-xs text-slate-400 max-w-xs mx-auto">Publish new regulator updates in your system first, or use the **Custom Curated** tab to select older updates manually.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ───────────────── CUSTOM CURATED TAB ───────────────── */}
                        {modeTab === 'custom' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                    <h3 className="font-heading font-bold text-navy flex items-center gap-2">
                                        <Settings className="text-amber-500" size={18} />
                                        Manual Curation Drawer
                                    </h3>
                                    <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                                        {customSelectedIds.length} Chosen
                                    </span>
                                </div>

                                {/* Custom intro banner text */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                                        Headline Banner Message (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        value={introMessage}
                                        onChange={e => setIntroMessage(e.target.value)}
                                        placeholder="Featured regulatory update: SPICe+ incorporation rules amended. Details inside."
                                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-navy text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    />
                                    <p className="text-[10px] text-slate-400 mt-1">If blank, the banner defaults to: "Featured update: [first chosen article title]. Read inside."</p>
                                </div>

                                {/* Search updates input */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        placeholder="Type to search published updates..."
                                        className="w-full border border-slate-200 rounded-lg pl-9 pr-4 py-2.5 text-navy text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    />
                                </div>

                                {/* Selected & Available updates lists */}
                                <div className="border border-slate-100 rounded-xl divide-y divide-slate-100 max-h-64 overflow-y-auto bg-slate-50/20">
                                    {availableArticles.length > 0 ? (
                                        availableArticles.map((art) => {
                                            const isSelected = customSelectedIds.includes(art.id)
                                            return (
                                                <div
                                                    key={art.id}
                                                    onClick={() => toggleArticleSelection(art.id)}
                                                    className="p-3 text-sm flex items-start gap-3 cursor-pointer hover:bg-slate-50 transition-colors select-none"
                                                >
                                                    <span className="mt-0.5 text-slate-400">
                                                        {isSelected ? (
                                                            <CheckSquare size={16} className="text-amber-500 fill-amber-100" />
                                                        ) : (
                                                            <Square size={16} />
                                                        )}
                                                    </span>
                                                    <div className="flex-1">
                                                        <p className={`font-semibold leading-tight ${isSelected ? 'text-navy' : 'text-slate-600'}`}>
                                                            {art.title}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1 py-0.2 rounded uppercase">
                                                                {art.category}
                                                            </span>
                                                            <span className="text-[9px] text-slate-400 font-medium">
                                                                {new Date(art.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    ) : (
                                        <div className="text-center py-8 text-slate-400 text-xs font-semibold">
                                            No published updates match your query
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ───────────────── CLASSIC MARKDOWN TAB ───────────────── */}
                        {modeTab === 'legacy' && (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                    <h3 className="font-heading font-bold text-navy flex items-center gap-2">
                                        <FileText size={18} />
                                        Classic Freeform Composer
                                    </h3>
                                    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                                        <button
                                            type="button"
                                            onClick={() => setEditorMode('markdown')}
                                            className={`px-2.5 py-1 text-[10px] font-bold rounded transition-colors ${editorMode === 'markdown' ? 'bg-white shadow text-navy' : 'text-slate-500 hover:text-navy'}`}
                                        >
                                            Markdown
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setEditorMode('html')}
                                            className={`px-2.5 py-1 text-[10px] font-bold rounded transition-colors ${editorMode === 'html' ? 'bg-white shadow text-navy' : 'text-slate-500 hover:text-navy'}`}
                                        >
                                            HTML
                                        </button>
                                    </div>
                                </div>

                                {editorMode === 'markdown' ? (
                                    <div data-color-mode="light">
                                        <MDEditor
                                            value={body}
                                            onChange={val => setBody(val || '')}
                                            height={300}
                                            preview="edit"
                                        />
                                        <p className="text-[10px] text-slate-400 mt-2">
                                            Standard syntax: **bold**, *italic*, ## headings, [links](url), - lists.
                                        </p>
                                    </div>
                                ) : (
                                    <div>
                                        <textarea
                                            value={body}
                                            onChange={e => setBody(e.target.value)}
                                            rows={11}
                                            placeholder="<h1>Your custom email structure</h1><p>Body...</p>"
                                            className="w-full border border-slate-200 rounded-lg px-4 py-3 text-navy font-mono text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                                        />
                                        <p className="text-[10px] text-slate-400 mt-1">
                                            All styles must be formatted directly in tag style properties: e.g. style="color:#0F172A;"
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}

                    </div>

                    {/* CAMPAIGN RECIPIENTS & TIMING SETTINGS */}
                    <div className="bg-white rounded-xl border border-slate-200/80 shadow-card p-6 space-y-6 ring-1 ring-slate-900/[0.02]">
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                            <Settings className="text-amber-500" size={18} />
                            <h2 className="font-heading font-bold text-navy text-lg font-sans">Campaign Settings</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            {/* Send Targets */}
                            <div className="space-y-4">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Recipients Selection</label>
                                <div className="flex flex-col gap-3">
                                    <label className="flex items-center gap-2.5 cursor-pointer">
                                        <input 
                                            type="radio" 
                                            checked={targetType === 'all'} 
                                            onChange={() => setTargetType('all')}
                                            className="text-amber-500 focus:ring-amber-500 h-4 w-4"
                                        />
                                        <span className="text-sm font-semibold text-slate-700">All Subscribers ({subscriberCount})</span>
                                    </label>
                                    <label className="flex items-center gap-2.5 cursor-pointer">
                                        <input 
                                            type="radio" 
                                            checked={targetType === 'specific'} 
                                            onChange={() => setTargetType('specific')}
                                            className="text-amber-500 focus:ring-amber-500 h-4 w-4"
                                        />
                                        <span className="text-sm font-semibold text-slate-700">Specific Subscriber</span>
                                    </label>
                                </div>
                                {targetType === 'specific' && (
                                    <input
                                        type="email"
                                        value={specificEmail}
                                        onChange={e => setSpecificEmail(e.target.value)}
                                        placeholder="subscriber@example.com"
                                        className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                                    />
                                )}
                            </div>

                            {/* Schedule Timers */}
                            <div className="space-y-4">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Delivery Option</label>
                                <div className="flex flex-col gap-3">
                                    <label className="flex items-center gap-2.5 cursor-pointer">
                                        <input 
                                            type="radio" 
                                            checked={!isScheduled} 
                                            onChange={() => setIsScheduled(false)}
                                            className="text-amber-500 focus:ring-amber-500 h-4 w-4"
                                        />
                                        <span className="text-sm font-semibold text-slate-700">Send Now (Instant delivery)</span>
                                    </label>
                                    <label className="flex items-center gap-2.5 cursor-pointer">
                                        <input 
                                            type="radio" 
                                            checked={isScheduled} 
                                            onChange={() => setIsScheduled(true)}
                                            className="text-amber-500 focus:ring-amber-500 h-4 w-4"
                                        />
                                        <span className="text-sm font-semibold text-slate-700">Schedule Delivery</span>
                                    </label>
                                </div>
                                {isScheduled && (
                                    <div className="space-y-2">
                                        <input
                                            type="datetime-local"
                                            value={scheduledAt}
                                            onChange={e => setScheduledAt(e.target.value)}
                                            className="w-full border border-slate-200 rounded-lg px-4 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-amber-500"
                                        />
                                        <p className="text-[10px] text-slate-400 font-medium">Timers process in IST. Please select a valid future date & time.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* SEND ACTIONS FOOTER */}
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100">
                            
                            {/* Test Send Area */}
                            <div className="flex items-center gap-2.5 w-full md:w-auto">
                                <input
                                    type="email"
                                    value={testEmail}
                                    onChange={e => setTestEmail(e.target.value)}
                                    placeholder="Enter test recipient email..."
                                    className="w-full md:w-60 border border-slate-200 rounded-lg px-4 py-2.5 text-xs text-navy focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleSend(true)}
                                    disabled={testSending || sending || !subject}
                                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold bg-white hover:bg-slate-50 transition-colors disabled:opacity-40"
                                >
                                    {testSending ? (
                                        <>
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            Testing…
                                        </>
                                    ) : (
                                        <>
                                            <FlaskConical size={14} />
                                            Send Test Email
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Broadcast trigger */}
                            <button
                                type="button"
                                onClick={() => {
                                    if (!subject.trim()) {
                                        setError('Subject is required before sending')
                                        return
                                    }
                                    if (modeTab === 'custom' && customSelectedIds.length === 0) {
                                        setError('Please select at least one article before sending')
                                        return
                                    }
                                    if (targetType === 'specific' && !specificEmail.trim()) {
                                        setError('Specific subscriber email is required')
                                        return
                                    }
                                    if (isScheduled && !scheduledAt) {
                                        setError('Please select a schedule date and time')
                                        return
                                    }
                                    setShowConfirm(true)
                                }}
                                disabled={sending || testSending}
                                className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-gold text-navy rounded-xl font-bold hover:bg-amber-400 transition-all shadow-sm active:scale-95 disabled:opacity-45"
                            >
                                {sending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Processing Send…
                                    </>
                                ) : (
                                    <>
                                        <Rocket size={16} />
                                        {isScheduled ? 'Schedule Campaign' : 'Send Campaign Now'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* RIGHT ISOLATED LIVE PREVIEW */}
                <div className="lg:col-span-5 lg:sticky lg:top-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="text-emerald-500" size={18} />
                            <h3 className="font-heading font-bold text-navy">Live Email Preview</h3>
                        </div>
                        {renderingPreview && (
                            <span className="flex items-center gap-1.5 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                                <Loader2 size={12} className="animate-spin" />
                                Compiling template...
                            </span>
                        )}
                    </div>

                    {subject ? (
                        <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-lg bg-white">
                            <div className="bg-slate-100/80 px-4 py-3 border-b border-slate-200 text-xs font-semibold text-slate-500 flex items-center justify-between">
                                <span className="flex items-center gap-1.5 font-sans uppercase tracking-wider text-[10px]">
                                    <Mail size={12} />
                                    Visualizer container (100% exact rendering)
                                </span>
                                <span className="text-[10px] text-slate-400">Desktop view width</span>
                            </div>
                            
                            {/* Isolated iframe container for 100% accurate visual testing */}
                            <div className="relative bg-slate-50/50 h-[38rem] w-full flex flex-col">
                                {previewHtml ? (
                                    <iframe
                                        srcDoc={previewHtml}
                                        title="Newsletter Template Live Visual Preview"
                                        className="w-full flex-1 border-0"
                                        sandbox="allow-same-origin allow-popups"
                                    />
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-3">
                                        <Loader2 className="animate-spin text-amber-500 w-8 h-8" />
                                        <p className="text-sm font-semibold">Generating visual structure...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="border border-dashed border-slate-200 rounded-2xl h-[42rem] flex flex-col items-center justify-center text-center p-8 bg-slate-50/40 text-slate-400">
                            <Mail size={40} className="text-slate-300 mb-3" />
                            <p className="font-bold text-sm text-slate-500">Preview Visualizer Offline</p>
                            <p className="text-xs text-slate-400 max-w-xs mt-1">Please enter a Subject Line in the envelope settings to compile the preview canvas.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* CONFIRMATION CONFIRM PANEL */}
            {showConfirm && (
                <div
                    className="fixed inset-0 bg-slate-900/55 backdrop-blur-[2px] flex items-center justify-center z-50 p-4 content-fade-in"
                    role="presentation"
                    onClick={() => setShowConfirm(false)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border border-slate-200/80 ring-1 ring-slate-900/5"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="newsletter-confirm-title"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex justify-center mb-4">
                            <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-800">
                                <AlertTriangle className="w-7 h-7" aria-hidden />
                            </span>
                        </div>
                        <h2
                            id="newsletter-confirm-title"
                            className="text-xl font-heading font-bold text-navy text-center mb-2"
                        >
                            {isScheduled ? 'Confirm schedule' : 'Confirm send'}
                        </h2>
                        <p className="text-slate-500 text-center mb-4 text-sm leading-relaxed">
                            {isScheduled 
                                ? 'Are you sure you want to schedule this campaign queue?' 
                                : 'Are you sure you want to broadcast this campaign instantly to subscribers?'}
                        </p>
                        <div className="text-4xl font-bold text-navy text-center mb-4 font-sans">
                            {targetType === 'all' ? (
                                <>
                                    {subscriberCount}
                                    <span className="text-lg font-normal text-slate-500 ml-2">
                                        subscribers
                                    </span>
                                </>
                            ) : (
                                <>
                                    <span className="text-xl">1</span>
                                    <span className="text-lg font-normal text-slate-500 ml-2">
                                        subscriber ({specificEmail})
                                    </span>
                                </>
                            )}
                        </div>
                        
                        <div className="bg-slate-50 rounded-xl p-4 mb-4 space-y-2 border border-slate-100">
                            <p className="text-xs text-slate-700 leading-tight">
                                <span className="font-bold text-slate-500 uppercase tracking-wider">Subject:</span>{' '}
                                {subject}
                            </p>
                            {previewText && (
                                <p className="text-xs text-slate-600 leading-tight">
                                    <span className="font-bold text-slate-500 uppercase tracking-wider">Preview text:</span>{' '}
                                    {previewText}
                                </p>
                            )}
                            {isScheduled && (
                                <p className="text-xs text-amber-800 leading-tight">
                                    <span className="font-bold text-amber-600 uppercase tracking-wider">Scheduled for:</span>{' '}
                                    {new Date(scheduledAt).toLocaleString()}
                                </p>
                            )}
                            <p className="text-xs text-slate-600 leading-tight">
                                <span className="font-bold text-slate-500 uppercase tracking-wider">Campaign Mode:</span>{' '}
                                <span className="font-semibold text-navy capitalize">{modeTab} Builder</span>
                            </p>
                        </div>
                        
                        <p className="text-red-600 text-xs text-center mb-6 font-bold inline-flex items-center justify-center gap-2 w-full">
                            <XCircle className="w-4 h-4 shrink-0" aria-hidden />
                            This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setShowConfirm(false)}
                                className="flex-1 px-4 py-3 border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSend(false)}
                                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-gold text-navy rounded-xl font-bold hover:bg-amber-400 transition-colors text-sm shadow"
                            >
                                <Rocket className="w-4 h-4" aria-hidden />
                                {isScheduled ? 'Schedule' : 'Send now'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
