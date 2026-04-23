/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    const handleSubmit = async () => {
        if (!password) return
        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            })

            if (res.ok) {
                router.push('/admin/dashboard')
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
        <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-md w-full">
                <div className="text-center mb-6">
                    <h1 className="font-heading text-3xl font-bold flex justify-center items-baseline space-x-1">
                        <span className="text-navy">CorpLawUpdates</span>
                        <span className="text-gold">.in</span>
                    </h1>
                    <p className="text-slate-500 text-sm mt-2">Admin Panel</p>
                </div>

                <hr className="border-slate-100 mb-6" />

                <div className="mb-6">
                    <label className="block text-sm font-medium text-navy mb-2">Password</label>
                    <div className="relative">
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gold text-navy pr-12"
                            placeholder="Enter admin password"
                            disabled={loading}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-navy"
                        >
                            {showPassword ? '👁️' : '👁️‍🗨️'}
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 flex items-center text-red-500 text-sm bg-red-50 p-3 rounded-lg">
                        <span className="mr-2">⚠</span>
                        {error}
                    </div>
                )}

                <button
                    onClick={handleSubmit}
                    disabled={loading || !password}
                    className="w-full bg-navy text-gold font-semibold py-3 px-4 rounded-lg hover:bg-navy/90 transition-colors disabled:opacity-50 flex justify-center"
                >
                    {loading ? 'Verifying...' : 'Enter Admin Panel'}
                </button>
            </div>
        </div>
    )
}
