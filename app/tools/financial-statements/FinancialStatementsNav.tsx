'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  FileSpreadsheet,
  Layers,
  ArrowRightLeft,
  PieChart,
  ShieldCheck,
  Trash2,
  DownloadCloud
} from 'lucide-react'
import { clearWorkspaceStorage } from '@/lib/financial-statements/storage'

export default function FinancialStatementsNav({ onResetWorkspace }: { onResetWorkspace?: () => void }) {
  const pathname = usePathname()

  const navItems = [
    {
      href: '/tools/financial-statements',
      label: 'Hub & Matrix',
      icon: Layers,
      match: pathname === '/tools/financial-statements'
    },
    {
      href: '/tools/financial-statements/balance-sheet',
      label: 'Balance Sheet',
      icon: FileSpreadsheet,
      match: pathname.startsWith('/tools/financial-statements/balance-sheet')
    },
    {
      href: '/tools/financial-statements/profit-and-loss',
      label: 'Profit & Loss',
      icon: PieChart,
      match: pathname.startsWith('/tools/financial-statements/profit-and-loss')
    },
    {
      href: '/tools/financial-statements/cash-flow-statement',
      label: 'Cash Flow',
      icon: ArrowRightLeft,
      match: pathname.startsWith('/tools/financial-statements/cash-flow-statement')
    }
  ]

  const handleClear = () => {
    if (confirm('Clear local financial workspace? All entered trial balance and draft statement figures stored in this browser will be reset.')) {
      clearWorkspaceStorage()
      if (onResetWorkspace) {
        onResetWorkspace()
      } else {
        window.location.reload()
      }
    }
  }

  return (
    <div className="mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Navigation tabs */}
        <nav className="flex flex-wrap items-center gap-2">
          {navItems.map(item => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  item.match
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Privacy & utility controls */}
        <div className="flex items-center gap-3">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Local Browser Only • Zero Server Upload</span>
          </div>
          <button
            onClick={handleClear}
            title="Reset locally stored statement entries in browser"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear Workspace</span>
          </button>
        </div>
      </div>
    </div>
  )
}
