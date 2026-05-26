// src/components/msme/InterestChart.tsx
'use client'

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import type { MonthlyBreakdownRow } from '@/lib/msme-interest'

interface InterestChartProps {
  breakdown: MonthlyBreakdownRow[]
  principal: number
}

export function InterestChart({ breakdown, principal }: InterestChartProps) {
  // If there's no delay breakdown, show a flat principal projection
  const data = breakdown.length > 0 
    ? [
        { name: 'Start', balance: principal, interest: 0 },
        ...breakdown.map(r => ({
          name: r.monthName,
          balance: r.closingBalance,
          interest: Math.round((r.closingBalance - principal) * 100) / 100
        }))
      ]
    : [
        { name: 'Start', balance: principal, interest: 0 },
        { name: 'No Delay', balance: principal, interest: 0 }
      ]

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val)
  }

  return (
    <div className="bg-brand-slate-blue border border-white/10 rounded-card p-6 shadow-md text-white space-y-4">
      <div>
        <h4 className="font-serif font-bold text-sm text-white">
          Outstanding Debt Compound Curve
        </h4>
        <p className="text-[10px] text-brand-muted mt-0.5 leading-normal">
          Visual comparison of static outstanding principal vs the 3× RBI interest compound acceleration.
        </p>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="balanceGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#C9A84C" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="interestGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#DC2626" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#DC2626" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis 
              dataKey="name" 
              stroke="#8B9BB4" 
              fontSize={10}
              tickLine={false}
            />
            <YAxis 
              stroke="#8B9BB4" 
              fontSize={9}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              tickLine={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#0B1F3A', 
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: '#fff',
                fontFamily: 'system-ui, sans-serif',
                fontSize: '11px'
              }}
              formatter={(value: any, name: any) => [
                formatCurrency(Number(value)), 
                name === 'balance' ? 'Total Outstanding' : 'Compound Interest'
              ]}
            />
            <Area 
              type="monotone" 
              dataKey="balance" 
              stroke="#C9A84C" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#balanceGlow)" 
            />
            <Area 
              type="monotone" 
              dataKey="interest" 
              stroke="#DC2626" 
              strokeWidth={1.5}
              fillOpacity={1} 
              fill="url(#interestGlow)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-6 text-[10px] font-bold uppercase tracking-wider font-sans border-t border-white/5 pt-3.5">
        <span className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-brand-gold rounded-full" />
          <span className="text-brand-muted">Total Outstanding</span>
        </span>
        <span className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-status-error rounded-full" />
          <span className="text-brand-muted">Interest Growth</span>
        </span>
      </div>
    </div>
  )
}
