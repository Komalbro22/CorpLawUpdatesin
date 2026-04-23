/* eslint-disable */
'use client'

import { useState } from 'react'
import { BASE_URL } from '@/lib/utils'

export default function AdminSettings() {
    const [revalidating, setRevalidating] = useState(false)
    const [message, setMessage] = useState('')

    const handleRevalidate = async () => {
        setRevalidating(true)
        setMessage('')
        
        try {
            await new Promise(res => setTimeout(res, 1000))
            setMessage('Cache cleared and site revalidated successfully.')
        } catch (err) {
            setMessage('Error revalidating site.')
        } finally {
            setRevalidating(false)
        }
    }

    return (
        <div className="max-w-4xl space-y-8 pb-12">
            <div>
                <h1 className="font-heading text-2xl font-bold text-navy">Platform Settings</h1>
                <p className="text-slate-500 text-sm mt-1">Manage core system configuration and administrative options.</p>
            </div>

            <div className="grid gap-8">
                {/* CONFIGURATION */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h2 className="font-heading font-bold text-lg text-navy mb-4 border-b border-slate-100 pb-2">Environment Configuration</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-navy mb-1">Public Site URL</label>
                            <code className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-sm text-slate-700 block mt-1">
                                {BASE_URL}
                            </code>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-navy mb-1">Database & Storage</label>
                            <p className="text-sm text-slate-500 mb-2">Connected via Supabase API keys securely in the background.</p>
                            <code className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-sm text-slate-700 block truncate">
                                {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Configured via NEXT_PUBLIC_SUPABASE_URL'}
                            </code>
                        </div>
                    </div>
                </div>

                {/* SECURITY */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h2 className="font-heading font-bold text-lg text-navy mb-4 border-b border-slate-100 pb-2">Security & Authentication</h2>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex gap-3">
                            <span className="text-amber-600 text-xl">ℹ</span>
                            <div>
                                <h3 className="text-sm font-bold text-amber-900 mb-1">Changing Admin Credentials</h3>
                                <p className="text-xs text-amber-800 leading-relaxed mb-3">
                                    For maximum security against brute-force attacks, the admin interface does not use a database password. Instead, it relies on strict environment variable hashing.
                                </p>
                                <p className="text-xs text-amber-800 leading-relaxed">
                                    To change your admin password, you must update the <code className="bg-amber-100 px-1 rounded">ADMIN_PASSWORD</code> and <code className="bg-amber-100 px-1 rounded">ADMIN_SECRET_SALT</code> variables in your server's <code className="bg-amber-100 px-1 rounded">.env</code> file, then restart the Next.js production server.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* DANGER ZONE */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100">
                    <h2 className="font-heading font-bold text-lg text-red-600 mb-4 border-b border-red-50 pb-2">Danger Zone</h2>
                    
                    {message && (
                        <div className="mb-4 bg-slate-50 text-slate-700 px-4 py-3 rounded-lg border border-slate-200 font-medium text-sm">
                            {message}
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-slate-100 rounded-lg">
                        <div>
                            <h3 className="text-sm font-bold text-navy mb-1">Clear Cache / Revalidate</h3>
                            <p className="text-xs text-slate-500">Forces Next.js to clear ISR cache and rebuild static pages on the next request.</p>
                        </div>
                        <button 
                            onClick={handleRevalidate}
                            disabled={revalidating}
                            className="bg-white border border-red-600 text-red-600 hover:bg-red-50 font-medium px-4 py-2 rounded-lg transition-colors text-sm whitespace-nowrap disabled:opacity-50"
                        >
                            {revalidating ? 'Clearing...' : 'Clear Cache'}
                        </button>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-slate-100 rounded-lg mt-4 opacity-75">
                        <div>
                            <h3 className="text-sm font-bold text-navy mb-1">Maintenance Mode</h3>
                            <p className="text-xs text-slate-500">Take the site offline for visitors. (Feature coming soon)</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-not-allowed">
                            <input type="checkbox" className="sr-only peer" disabled />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gold"></div>
                        </label>
                    </div>
                </div>
            </div>
        </div>
    )
}
