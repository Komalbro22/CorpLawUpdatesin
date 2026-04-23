/* eslint-disable */
'use client'

import { useState } from 'react'

export default function AdminNewsletter() {
    const [subject, setSubject] = useState('')
    const [content, setContent] = useState('')
    const [testEmail, setTestEmail] = useState('')
    
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [confirmModal, setConfirmModal] = useState(false)

    const handleSendTest = async () => {
        if (!testEmail || !testEmail.includes('@')) {
            setError('Please enter a valid test email address.')
            return
        }
        if (!subject || !content) {
            setError('Subject and content are required.')
            return
        }
        
        setLoading(true)
        setError('')
        setSuccess('')

        try {
            const res = await fetch('/api/admin/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subject, content, testEmail })
            })
            const data = await res.json()
            if (res.ok) {
                setSuccess('Test email sent successfully to ' + testEmail)
            } else {
                setError(data.error || 'Failed to send test email')
            }
        } catch (err) {
            setError('Network error sending test email.')
        } finally {
            setLoading(false)
        }
    }

    const handleSendNow = async () => {
        setLoading(true)
        setError('')
        setSuccess('')
        setConfirmModal(false)

        try {
            const res = await fetch('/api/admin/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subject, content })
            })
            const data = await res.json()
            if (res.ok) {
                setSuccess(`Newsletter successfully sent to ${data.sent} subscribers!`)
                setSubject('')
                setContent('')
            } else {
                setError(data.error || 'Failed to send newsletter')
            }
        } catch (err) {
            setError('Network error sending newsletter.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl space-y-6">
            <h1 className="font-heading text-2xl font-bold text-navy">Distribute Newsletter</h1>
            <p className="text-slate-500 text-sm">Send updates or major announcements to all active subscribers.</p>

            {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg border border-red-100 font-medium text-sm">
                    ⚠ {error}
                </div>
            )}
            {success && (
                <div className="bg-emerald-50 text-emerald-700 px-4 py-3 rounded-lg border border-emerald-100 font-medium text-sm">
                    ✨ {success}
                </div>
            )}

            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 space-y-6">
                <div>
                    <label className="block text-sm font-bold text-navy mb-2">Subject Line</label>
                    <input 
                        type="text" 
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="e.g. Major MCA Update: New Format for Director KYC..."
                        className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-gold focus:outline-none"
                    />
                </div>

                <div>
                    <div className="flex justify-between items-end mb-2">
                        <label className="block text-sm font-bold text-navy">Email Content</label>
                        <span className="text-xs text-slate-400">Plain text (Line breaks preserved)</span>
                    </div>
                    <textarea 
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows={12}
                        placeholder="Write your email here..."
                        className="w-full border border-slate-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-gold focus:outline-none resize-y font-mono"
                    />
                </div>

                <div className="pt-6 border-t border-slate-100 grid md:grid-cols-2 gap-6">
                    {/* TEST EMAIL SECTION */}
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <h3 className="text-sm font-bold text-navy mb-3">Send a Test Email</h3>
                        <div className="flex flex-col gap-3">
                            <input 
                                type="email" 
                                value={testEmail}
                                onChange={(e) => setTestEmail(e.target.value)}
                                placeholder="test@email.com"
                                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-navy focus:outline-none"
                            />
                            <button 
                                onClick={handleSendTest}
                                disabled={loading || !subject || !content}
                                className="bg-white text-navy border border-slate-300 font-semibold px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors text-sm disabled:opacity-50"
                            >
                                Send Test
                            </button>
                        </div>
                    </div>

                    {/* SEND TO ALL SECTION */}
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 flex flex-col justify-center text-center">
                        <h3 className="text-sm font-bold text-amber-900 mb-2">Ready to Send?</h3>
                        <p className="text-xs text-amber-700 mb-4">This will be sent to ALL active subscribers on the platform. Please verify everything using a test email first.</p>
                        <button 
                            onClick={() => setConfirmModal(true)}
                            disabled={loading || !subject || !content}
                            className="bg-navy text-gold font-bold px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors text-sm disabled:opacity-50 w-full"
                        >
                            Review & Send to All
                        </button>
                    </div>
                </div>
            </div>

            {/* CONFIRMATION MODAL */}
            {confirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-center">
                        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4 text-3xl">
                            📫
                        </div>
                        <h3 className="font-heading font-bold text-xl text-navy mb-2">Send Newsletter</h3>
                        <p className="text-slate-600 mb-6 text-sm">
                            Are you absolutely sure you want to broadcast this message? It will be sent to all active subscribers immediately.
                        </p>
                        <div className="bg-slate-50 text-left p-3 rounded text-sm text-slate-700 mb-6 border border-slate-200">
                            <strong>Subject:</strong> {subject}
                        </div>
                        <div className="flex justify-center gap-3">
                            <button 
                                onClick={() => setConfirmModal(false)} 
                                disabled={loading}
                                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSendNow} 
                                disabled={loading}
                                className="px-5 py-2 bg-navy text-gold rounded-lg font-bold hover:bg-slate-800 transition-colors shadow-md"
                            >
                                {loading ? 'Sending...' : 'Yes, Send Now'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
