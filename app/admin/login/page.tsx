/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'

export default function AdminLogin() {
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async () => {
        if (!password) return
        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            })

            if (res.ok) {
                window.location.href = '/admin/dashboard'
                return
            }

            if (res.status === 429) {
                setError('Too many attempts. Try again in 15 minutes.')
            } else if (res.status === 401) {
                setError('Invalid password. Please try again.')
            } else {
                setError('Something went wrong. Please try again.')
            }
        } catch {
            setError('Something went wrong. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSubmit()
        }
    }

    return (
        <div className="min-h-screen bg-[#0b1120] flex items-center justify-center p-4 relative overflow-hidden">
            <div
                className="absolute inset-0 opacity-[0.35] bg-[linear-gradient(rgba(255,255,255,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.04)_1px,transparent_1px)] bg-[size:64px_64px]"
                aria-hidden
            />
            <div
                className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(245,158,11,0.15),transparent_55%)]"
                aria-hidden
            />

            <div className="relative w-full max-w-md bg-white/95 backdrop-blur-md rounded-2xl shadow-premium border border-slate-200/60 p-8 md:p-10 transform transition-all duration-300 hover:shadow-premium-hover">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-navy text-gold mb-4 shadow-glow-gold-sm border border-gold/20 animate-pulse-subtle">
                        <Lock className="w-5 h-5" aria-hidden />
                    </div>
                    <h1 className="font-heading text-2xl md:text-3xl font-bold flex justify-center items-baseline gap-0.5 flex-wrap">
                        <span className="text-navy">CorpLawUpdates</span>
                        <span className="text-gold">.in</span>
                    </h1>
                    <p className="text-slate-500 text-sm mt-2 font-medium tracking-wide">Secure admin sign-in</p>
                </div>

                <div className="border-t border-slate-100/80 pt-6">
                    <label htmlFor="admin-password" className="block text-sm font-semibold text-navy mb-2">
                        Password
                    </label>
                    <div className="relative">
                        <input
                            id="admin-password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={handleKeyDown}
                            autoComplete="current-password"
                            className="w-full border border-slate-200/80 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 text-navy placeholder:text-slate-400/70 transition-all duration-200 bg-white/80"
                            placeholder="Enter admin password"
                            disabled={loading}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-navy rounded-md focus:outline-none focus:ring-2 focus:ring-gold/45"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {error && (
                    <div
                        role="alert"
                        className="mt-5 text-red-700 text-sm bg-red-50/80 border border-red-100/90 px-3 py-3 rounded-lg font-medium"
                    >
                        {error}
                    </div>
                )}

                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading || !password}
                    className="mt-6 w-full bg-navy text-gold font-semibold py-3 px-4 rounded-lg hover:bg-navy/95 transition-all duration-200 hover:shadow-glow-gold-sm disabled:opacity-50 disabled:pointer-events-none active:scale-[0.995]"
                >
                    {loading ? 'Verifying…' : 'Sign in'}
                </button>

                <p className="mt-6 text-center text-xs text-slate-400">
                    Authorized personnel only. Sessions are secured with HTTP-only cookies.
                </p>
            </div>
        </div>
    )
}
