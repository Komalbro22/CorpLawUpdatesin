/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import sanitizeHtml from 'sanitize-html'

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
    const [subject, setSubject] = useState('')
    const [previewText, setPreviewText] = useState('')
    const [body, setBody] = useState('')
    const [sending, setSending] = useState(false)
    const [testSending, setTestSending] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [subscriberCount, setSubscriberCount] = useState(0)
    const [result, setResult] = useState<SendResult | null>(null)
    const [error, setError] = useState('')
    const [showPreview, setShowPreview] = useState(false)
    const [failedList, setFailedList] = useState<string[]>([])
    
    const [editorMode, setEditorMode] = useState<'markdown' | 'html'>('markdown')
    const [targetType, setTargetType] = useState<'all' | 'specific'>('all')
    const [specificEmail, setSpecificEmail] = useState('')
    const [testEmail, setTestEmail] = useState('')

    useEffect(() => {
        fetch('/api/admin/subscribers?status=active')
            .then(r => r.json())
            .then(data => {
                setSubscriberCount(data.stats?.totalActive || data.total || 0)
            })
            .catch(err => console.error('Failed to fetch subscriber count:', err))
    }, [])

    async function handleSend(testOnly: boolean, retryList?: string[]) {
        setError('')

        if (!subject.trim()) {
            setError('Subject line is required')
            return
        }
        if (!body.trim()) {
            setError('Email body is required')
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
                body: body.trim(),
                testOnly,
                mode: editorMode,
                testEmail: testOnly ? testEmail.trim() : undefined,
            }
            if (retryList && retryList.length > 0) {
                payload.targetEmails = retryList
            } else if (!testOnly && targetType === 'specific') {
                if (!specificEmail.trim()) {
                    setError('Specific subscriber email is required')
                    setSending(false)
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

        } catch (err: any) {
            setError(err.message || 'Something went wrong')
        } finally {
            setTestSending(false)
            setSending(false)
        }
    }

    // SUCCESS STATE
    if (result) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-2xl shadow-sm border 
                        border-slate-100 p-10 text-center">
                    <div className="text-6xl mb-4">
                        {result.testOnly ? '🧪' : '🎉'}
                    </div>
                    <h2 className="text-2xl font-heading font-bold text-navy mb-2">
                        {result.testOnly
                            ? 'Test Email Sent!'
                            : 'Newsletter Sent Successfully!'}
                    </h2>
                    {!result.testOnly && (
                        <div className="bg-slate-50 rounded-xl p-4 my-4 
                            flex justify-around">
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
                            <ul className="list-disc ml-5 text-sm text-red-700 mb-6 max-h-40 overflow-y-auto w-full border border-red-200/50 bg-white p-3 rounded shadow-inner disabled:opacity-50">
                                {failedList.map((email, i) => <li key={i} className="py-0.5">{email}</li>)}
                            </ul>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => handleSend(false, failedList)}
                                    disabled={sending}
                                    className="px-5 py-2.5 font-bold bg-red-600 text-white rounded-lg shadow-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                                >
                                    {sending ? 'Retrying...' : 'Retry Failed Mails'}
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="mt-8">
                        <button
                            onClick={() => {
                                setResult(null)
                                setSubject('')
                                setPreviewText('')
                                setBody('')
                                setError('')
                                setFailedList([])
                            }}
                            className="px-6 py-3 bg-amber-400 text-navy font-semibold rounded-xl hover:bg-amber-500 transition-colors"
                        >
                            Send Another Newsletter
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">

            {/* Header */}
            <div>
                <h1 className="text-2xl font-heading font-bold text-navy">
                    Send Newsletter
                </h1>
                <p className="text-slate-500 mt-1">
                    {subscriberCount > 0
                        ? `${subscriberCount} active subscribers will receive this`
                        : 'No active subscribers yet'}
                </p>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl 
                        p-4 text-red-700 flex items-center gap-2">
                    <span>⚠️</span>
                    <span>{error}</span>
                    <button
                        onClick={() => setError('')}
                        className="ml-auto text-red-400 hover:text-red-600"
                    >
                        ✕
                    </button>
                </div>
            )}

            {/* Main Form */}
            <div className="bg-white rounded-xl shadow-sm border 
                      border-slate-100 p-6 space-y-6">

                {/* Subject */}
                <div>
                    <label className="block text-sm font-semibold 
                            text-navy mb-2">
                        Subject Line <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={subject}
                        onChange={e => setSubject(e.target.value)}
                        placeholder="Weekly Corporate Law Update — April 2026"
                        className="w-full border border-slate-300 rounded-lg 
                       px-4 py-3 text-navy focus:outline-none 
                       focus:ring-2 focus:ring-amber-400 
                       focus:border-transparent"
                    />
                </div>

                {/* Preview Text */}
                <div>
                    <label className="block text-sm font-semibold 
                            text-navy mb-2">
                        Preview Text
                        <span className="text-slate-400 font-normal ml-2 text-xs">
                            (shown below subject in inbox)
                        </span>
                    </label>
                    <input
                        type="text"
                        value={previewText}
                        onChange={e => setPreviewText(e.target.value)}
                        placeholder="This week: MCA updates, SEBI circulars..."
                        maxLength={100}
                        className="w-full border border-slate-300 rounded-lg 
                       px-4 py-3 text-navy focus:outline-none 
                       focus:ring-2 focus:ring-amber-400 
                       focus:border-transparent"
                    />
                    <p className="text-xs text-slate-400 mt-1 text-right">
                        {previewText.length}/100
                    </p>
                </div>

                {/* Markdown / HTML Editor */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-semibold text-navy">
                            Email Body <span className="text-red-500">*</span>
                        </label>
                        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                            <button
                                onClick={() => setEditorMode('markdown')}
                                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${editorMode === 'markdown' ? 'bg-white shadow-sm text-navy' : 'text-slate-500 hover:text-navy'}`}
                            >
                                Markdown
                            </button>
                            <button
                                onClick={() => setEditorMode('html')}
                                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${editorMode === 'html' ? 'bg-white shadow-sm text-navy' : 'text-slate-500 hover:text-navy'}`}
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
                                height={350}
                                preview="edit"
                            />
                            <p className="text-xs text-slate-400 mt-2">
                                Supports **bold**, *italic*, ## headings,
                                [links](url), - bullet lists
                            </p>
                        </div>
                    ) : (
                        <div>
                            <textarea
                                value={body}
                                onChange={e => setBody(e.target.value)}
                                rows={15}
                                placeholder="<h1>Your HTML here</h1>..."
                                className="w-full border border-slate-300 rounded-lg px-4 py-3 text-navy font-mono text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                            />
                            <p className="text-xs text-slate-400 mt-2">
                                Enter valid HTML. You can use inline styles (e.g. style="color: red;").
                            </p>
                        </div>
                    )}
                </div>

            </div>

            {/* Email Preview Toggle */}
            <div>
                <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="text-sm text-amber-600 underline 
                     hover:text-amber-700"
                >
                    {showPreview ? '▲ Hide Email Preview'
                        : '▼ Show Email Preview'}
                </button>

                {showPreview && (
                    <div className="mt-3 border border-slate-200 rounded-xl 
                          overflow-hidden shadow-sm">
                        <div className="bg-slate-100 px-4 py-2 text-xs 
                            text-slate-500 border-b font-medium">
                            📧 Email Preview (approximate)
                        </div>
                        <div style={{ fontFamily: 'Georgia, serif' }}>
                            <div style={{
                                background: '#0F172A',
                                padding: '20px 28px'
                            }}>
                                <div style={{
                                    color: '#F59E0B', fontSize: '18px',
                                    fontWeight: 'bold'
                                }}>
                                    CorpLawUpdates.in
                                </div>
                                <div style={{
                                    color: '#94A3B8', fontSize: '12px',
                                    marginTop: '4px'
                                }}>
                                    India's Free Corporate Law Intelligence Platform
                                </div>
                            </div>
                            <div style={{
                                padding: '24px 28px',
                                background: '#ffffff'
                            }}>
                                <div style={{
                                    fontSize: '20px', fontWeight: 'bold',
                                    color: '#0F172A'
                                }}>
                                    {subject || '(No subject yet)'}
                                </div>
                                {previewText && (
                                    <div style={{
                                        color: '#64748B', fontSize: '13px',
                                        marginTop: '4px'
                                    }}>
                                        {previewText}
                                    </div>
                                )}
                                <hr style={{
                                    margin: '16px 0',
                                    borderColor: '#E2E8F0', border: 'none',
                                    borderTop: '1px solid #E2E8F0'
                                }} />
                                <div style={{
                                    color: '#334155', fontSize: '15px',
                                    lineHeight: '1.7'
                                }}
                                dangerouslySetInnerHTML={{
                                    __html: body ? sanitizeHtml(editorMode === 'markdown' ? markdownToHtml(body) : body, {
                                        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'h3', 'span', 'div', 'p', 'br', 'hr', 'a', 'b', 'i', 'strong', 'em', 'u', 'table', 'thead', 'tbody', 'tr', 'th', 'td']),
                                        allowedAttributes: {
                                            '*': ['style', 'class', 'id'],
                                            'a': ['href', 'target', 'rel'],
                                            'img': ['src', 'alt', 'width', 'height']
                                        },
                                        allowedStyles: {
                                            '*': {
                                                'color': [/^.*$/],
                                                'text-align': [/^.*$/],
                                                'background-color': [/^.*$/],
                                                'font-size': [/^.*$/],
                                                'font-family': [/^.*$/],
                                                'font-weight': [/^.*$/],
                                                'padding': [/^.*$/],
                                                'margin': [/^.*$/],
                                                'border': [/^.*$/],
                                                'border-radius': [/^.*$/],
                                                'line-height': [/^.*$/],
                                                'text-decoration': [/^.*$/],
                                                'max-width': [/^.*$/],
                                                'width': [/^.*$/],
                                                'height': [/^.*$/],
                                                'display': [/^.*$/]
                                            }
                                        }
                                    }) : '(Email body will appear here)'
                                }} />
                            </div>
                            <div style={{
                                background: '#F8FAFC',
                                padding: '16px 28px',
                                borderTop: '1px solid #E2E8F0'
                            }}>
                                <div style={{ color: '#94A3B8', fontSize: '12px' }}>
                                    You're subscribed to CorpLawUpdates.in ·
                                    <span style={{ color: '#F59E0B' }}>
                                        Unsubscribe
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Action Buttons */}
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 space-y-6">
                
                {/* Targeting Options */}
                <div className="flex flex-col md:flex-row gap-6 md:items-start pb-6 border-b border-slate-100">
                    <div className="flex-1 space-y-4">
                        <label className="block text-sm font-semibold text-navy">Send To:</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="radio" 
                                    checked={targetType === 'all'} 
                                    onChange={() => setTargetType('all')}
                                    className="text-amber-500 focus:ring-amber-500 h-4 w-4"
                                />
                                <span className="text-sm font-medium text-slate-700">All Subscribers ({subscriberCount})</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                    type="radio" 
                                    checked={targetType === 'specific'} 
                                    onChange={() => setTargetType('specific')}
                                    className="text-amber-500 focus:ring-amber-500 h-4 w-4"
                                />
                                <span className="text-sm font-medium text-slate-700">Specific Subscriber</span>
                            </label>
                        </div>
                        {targetType === 'specific' && (
                            <input
                                type="email"
                                value={specificEmail}
                                onChange={e => setSpecificEmail(e.target.value)}
                                placeholder="subscriber@example.com"
                                className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-amber-400"
                            />
                        )}
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    {/* Test Send */}
                    <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                        <input
                            type="email"
                            value={testEmail}
                            onChange={e => setTestEmail(e.target.value)}
                            placeholder="Test email address..."
                            className="w-full md:w-64 border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-amber-400"
                        />
                        <button
                            onClick={() => handleSend(true)}
                            disabled={testSending || sending || !subject || !body}
                            className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 border-2 border-navy text-navy rounded-lg font-semibold hover:bg-navy hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                            {testSending ? '⟳ Sending Test...' : '🧪 Send Test Email'}
                        </button>
                    </div>

                    {/* Send Actual */}
                    <button
                        onClick={() => {
                            if (!subject.trim() || !body.trim()) {
                                setError('Subject and body are required before sending')
                                return
                            }
                            if (targetType === 'specific' && !specificEmail.trim()) {
                                setError('Specific subscriber email is required')
                                return
                            }
                            setShowConfirm(true)
                        }}
                        disabled={sending || testSending}
                        className="w-full md:w-auto px-8 py-2.5 bg-amber-400 text-navy rounded-lg font-bold hover:bg-amber-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap shadow-sm"
                    >
                        {sending ? '⟳ Sending...' : targetType === 'all' ? '🚀 Send to All Subscribers' : '🚀 Send to Subscriber'}
                    </button>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black/60 flex items-center 
                        justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 
                          max-w-md w-full">
                        <div className="text-5xl text-center mb-4">⚠️</div>
                        <h2 className="text-xl font-heading font-bold text-navy 
                           text-center mb-2">
                            Confirm Newsletter Send
                        </h2>
                        <p className="text-slate-500 text-center mb-4">
                            This will send an email to
                        </p>
                        <div className="text-4xl font-bold text-navy 
                            text-center mb-4">
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
                        <div className="bg-slate-50 rounded-xl p-4 mb-4 
                            space-y-2">
                            <p className="text-sm text-slate-700">
                                <span className="font-semibold">Subject:</span>{' '}
                                {subject}
                            </p>
                            {previewText && (
                                <p className="text-sm text-slate-500">
                                    <span className="font-semibold">Preview:</span>{' '}
                                    {previewText}
                                </p>
                            )}
                        </div>
                        <p className="text-red-500 text-sm text-center mb-6 
                          font-medium">
                            ⚠️ This cannot be undone
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="flex-1 px-4 py-3 border-2 
                           border-slate-300 text-slate-600 
                           rounded-xl font-semibold 
                           hover:border-slate-400 
                           transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleSend(false)}
                                className="flex-1 px-4 py-3 bg-amber-400 
                           text-navy rounded-xl font-semibold 
                           hover:bg-amber-500 transition-colors"
                            >
                                Yes, Send Now
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}

const markdownToHtml = (markdown: string): string => {
    let html = markdown
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>')
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>')
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
    html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" style="color:#F59E0B">$1</a>')
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>')
    html = html.replace(/(<li>[\s\S]*?<\/li>)/, '<ul>$1</ul>')
    html = html.replace(/\n\n/g, '</p><p>')
    html = '<p>' + html + '</p>'
    html = html.replace(/<p><\/p>/g, '')
    html = html.replace(/<p>(<h[123]>)/g, '$1')
    html = html.replace(/(<\/h[123]>)<\/p>/g, '$1')
    return html
}
