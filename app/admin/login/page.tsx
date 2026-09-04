/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState, useEffect, useRef } from 'react'
import { Eye, EyeOff, Lock, ShieldCheck, ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function AdminLogin() {
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [capsLockActive, setCapsLockActive] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus()
        }
    }, [])

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
                setError('Invalid password. Please verify and try again.')
            } else {
                setError('Something went wrong. Please try again.')
            }
        } catch {
            setError('Network error. Please check your connection.')
        } finally {
            setLoading(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.getModifierState && e.getModifierState('CapsLock')) {
            setCapsLockActive(true)
        } else {
            setCapsLockActive(false)
        }

        if (e.key === 'Enter') {
            handleSubmit()
        }
    }

    const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.getModifierState && e.getModifierState('CapsLock')) {
            setCapsLockActive(true)
        } else {
            setCapsLockActive(false)
        }
    }

    return (
        <div
            style={{
                backgroundColor: '#080c15',
                minHeight: '100vh',
                width: '100%',
            }}
            className="flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden selection:bg-amber-500 selection:text-slate-950"
        >
            {/* Ambient Background Lighting */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: `
                        radial-gradient(circle at 50% 0%, rgba(245, 158, 11, 0.15) 0%, transparent 60%),
                        radial-gradient(circle at 80% 90%, rgba(59, 130, 246, 0.08) 0%, transparent 50%),
                        radial-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px)
                    `,
                    backgroundSize: '100% 100%, 100% 100%, 32px 32px',
                }}
                aria-hidden
            />

            {/* Top Navigation Bar */}
            <div className="w-full max-w-[440px] mb-6 flex justify-between items-center z-10 px-1">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white transition-all duration-200 group py-1.5 px-3 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/60 backdrop-blur-md shadow-sm"
                >
                    <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1 text-amber-400" />
                    <span>Return to public website</span>
                </Link>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full shadow-sm backdrop-blur-md">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>System Active</span>
                </div>
            </div>

            {/* Main Auth Card */}
            <div
                style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.88)',
                    boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.08), 0 0 40px -15px rgba(245, 158, 11, 0.12)',
                }}
                className="relative w-full max-w-[440px] backdrop-blur-2xl rounded-3xl p-7 sm:p-9 z-10 border border-slate-800/90"
            >
                {/* Logo & Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 mb-4 shadow-lg shadow-amber-500/25 ring-4 ring-amber-500/10">
                        <Lock className="w-6 h-6 text-slate-950 font-extrabold" aria-hidden />
                    </div>
                    <h1 className="font-heading text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex justify-center items-baseline gap-1">
                        <span>CorpLawUpdates</span>
                        <span className="text-amber-400 font-extrabold">.in</span>
                    </h1>
                    <p className="text-slate-400 text-xs sm:text-sm mt-1.5 font-medium">
                        Admin Command Center Authentication
                    </p>
                </div>

                {/* Password Input Section */}
                <div className="space-y-4">
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label
                                htmlFor="admin-password"
                                className="block text-[11px] font-bold uppercase tracking-wider text-slate-300"
                            >
                                Security Passkey
                            </label>
                            {capsLockActive && (
                                <span className="text-[11px] text-amber-400 flex items-center gap-1 font-semibold animate-pulse">
                                    <AlertCircle className="w-3.5 h-3.5" /> Caps Lock On
                                </span>
                            )}
                        </div>

                        {/* Rock-solid Full-width Input Container */}
                        <div className="relative w-full" style={{ width: '100%' }}>
                            <input
                                ref={inputRef}
                                id="admin-password"
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onKeyUp={handleKeyUp}
                                autoComplete="current-password"
                                style={{
                                    width: '100%',
                                    boxSizing: 'border-box',
                                    backgroundColor: '#030712',
                                    color: '#ffffff',
                                }}
                                className="block w-full border border-slate-700/90 focus:border-amber-400 focus:ring-4 focus:ring-amber-400/20 rounded-xl px-4 py-3.5 pr-12 text-white placeholder:text-slate-500 transition-all duration-200 text-sm font-medium outline-none shadow-inner"
                                placeholder="Enter admin passkey..."
                                disabled={loading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/40 transition-colors duration-200 cursor-pointer z-10"
                                aria-label={showPassword ? 'Hide passkey' : 'Show passkey'}
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Error Notice */}
                    {error && (
                        <div
                            role="alert"
                            className="text-red-300 text-xs sm:text-sm bg-red-950/40 border border-red-500/30 px-3.5 py-2.5 rounded-xl font-medium flex items-center gap-2"
                        >
                            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* High-Contrast Luxury Submit Button */}
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading || !password}
                        style={{
                            width: '100%',
                            boxSizing: 'border-box',
                        }}
                        className="w-full mt-2 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold py-3.5 px-4 rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/35 active:scale-[0.99] transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer text-sm tracking-wide"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                                <span>Authenticating Session…</span>
                            </>
                        ) : (
                            <>
                                <ShieldCheck className="w-4 h-4 text-slate-950 font-bold" />
                                <span>Authenticate & Open Dashboard</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Card Security Footer */}
                <div className="mt-8 pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-400 text-[11px] font-medium">
                    <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>256-bit SSL Protected Gateway</span>
                    </div>
                    <span className="font-mono text-slate-500">v2.11.0 Enterprise</span>
                </div>
            </div>

            {/* Bottom Trust Micro-Badges */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-slate-500 text-[11px] font-medium z-10">
                <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                    Encrypted Session
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                    Direct DB Connection
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                    Regulatory Intelligence Hub
                </span>
            </div>
        </div>
    )
}
