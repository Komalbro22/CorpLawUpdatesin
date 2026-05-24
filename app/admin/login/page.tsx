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
            {/* Grid pattern overlay */}
            <div
                className="absolute inset-0 opacity-[0.15] bg-[linear-gradient(rgba(255,255,255,.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.04)_1px,transparent_1px)] bg-[size:64px_64px]"
                aria-hidden
            />
            {/* Radial glow */}
            <div
                className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_-10%,rgba(245,158,11,0.15),transparent_55%)]"
                aria-hidden
            />

            {/* Floating orbs */}
            <div
                className="float-orb-1 absolute top-[-5%] right-[-5%] w-[300px] h-[300px] rounded-full bg-amber-500/[0.07] blur-[100px]"
                aria-hidden
            />
            <div
                className="float-orb-2 absolute bottom-[-8%] left-[-8%] w-[250px] h-[250px] rounded-full bg-blue-500/[0.05] blur-[80px]"
                aria-hidden
            />
            <div
                className="float-orb-3 absolute top-[40%] left-[-4%] w-[200px] h-[200px] rounded-full bg-violet-500/[0.04] blur-[60px]"
                aria-hidden
            />

            {/* Login card */}
            <div className="login-card-enter relative w-full max-w-md bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-admin-glass p-8 md:p-10">
                {/* Logo section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 text-amber-400 mb-4 animate-admin-glow">
                        <Lock className="w-5 h-5" aria-hidden />
                    </div>
                    <h1 className="font-heading text-2xl md:text-3xl font-bold flex justify-center items-baseline gap-0.5 flex-wrap">
                        <span className="text-white">CorpLawUpdates</span>
                        <span className="admin-gradient-text">.in</span>
                    </h1>
                    <p className="text-slate-400 text-sm mt-2 font-medium tracking-wide">Secure admin sign-in</p>
                </div>

                {/* Divider + Input */}
                <div className="border-t border-white/[0.06] pt-6">
                    <label htmlFor="admin-password" className="block text-sm font-semibold text-slate-300 mb-2">
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
                            className="w-full bg-white/[0.04] border border-white/[0.1] rounded-lg px-4 py-3 pr-12 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/40 transition-all duration-200"
                            placeholder="Enter admin password"
                            disabled={loading}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-amber-400 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-colors duration-200"
                            aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                {/* Error alert */}
                {error && (
                    <div
                        role="alert"
                        className="mt-5 text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-3 py-3 rounded-lg font-medium"
                    >
                        {error}
                    </div>
                )}

                {/* Submit button */}
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading || !password}
                    className="mt-6 w-full bg-gradient-to-r from-amber-500 to-amber-600 text-navy font-bold py-3 px-4 rounded-xl admin-btn-shimmer hover:from-amber-400 hover:to-amber-500 hover:shadow-admin-glow-amber transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none active:scale-[0.995]"
                >
                    {loading ? (
                        <span className="inline-flex items-center justify-center gap-2">
                            <span className="admin-spinner w-4 h-4 border-2 border-navy/30 border-t-navy rounded-full animate-spin" />
                            Verifying…
                        </span>
                    ) : (
                        'Sign in'
                    )}
                </button>

                {/* Footer */}
                <p className="mt-6 text-center text-xs text-slate-500">
                    Authorized personnel only · v2.0
                </p>
            </div>
        </div>
    )
}
