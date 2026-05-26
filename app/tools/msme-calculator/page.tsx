// src/app/tools/msme-calculator/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { TrendingUp } from 'lucide-react'
import { calculateMSMEInterest } from '@/lib/msme-interest'
import { supabase } from '@/lib/supabase'
import { RateBadge } from '@/components/msme/RateBadge'
import { MSMEForm } from '@/components/msme/MSMEForm'
import { MSMEResults } from '@/components/msme/MSMEResults'
import { InterestChart } from '@/components/msme/InterestChart'

export default function MsmeCalculatorPage() {
  const [principal, setPrincipal] = useState(100000)
  const [invoiceDate, setInvoiceDate] = useState('')
  const [paymentDate, setPaymentDate] = useState('')
  const [creditDays, setCreditDays] = useState<15 | 45>(45)
  const [bankRate, setBankRate] = useState(6.75) // RBI Bank Rate: 6.75% -> MSME rate: 20.25%
  const [lastVerifiedHours, setLastVerifiedHours] = useState(4)

  // Fetch the dynamically verified rate from Supabase on mount
  useEffect(() => {
    async function fetchRate() {
      try {
        const { data, error } = await supabase
          .from('compliance_rates')
          .select('rate_value, last_verified')
          .eq('key', 'rbi_bank_rate')
          .single()
        
        if (data && !error) {
          setBankRate(Number(data.rate_value) || 6.75)
          if (data.last_verified) {
            const hrs = Math.max(1, Math.floor((Date.now() - new Date(data.last_verified).getTime()) / 3_600_000))
            setLastVerifiedHours(hrs)
          }
        }
      } catch (err) {
        console.error('Failed to retrieve RBI reference rate:', err)
      }
    }
    fetchRate()
  }, [])

  // Populate default demo-friendly invoice and payment values
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0]
    setPaymentDate(todayStr)
    
    // Default invoice to 75 days ago to demonstrate compound curves
    const seventyFiveDaysAgo = new Date(Date.now() - 75 * 86400000).toISOString().split('T')[0]
    setInvoiceDate(seventyFiveDaysAgo)
  }, [])

  // Execute statutory compound equations
  const results = calculateMSMEInterest(
    principal,
    invoiceDate ? new Date(invoiceDate) : new Date(),
    paymentDate ? new Date(paymentDate) : new Date(),
    bankRate,
    creditDays
  )

  return (
    <div className="min-h-screen bg-brand-navy pb-24 text-white">
      
      {/* Hero Header */}
      <section className="relative px-6 py-16 text-center border-b border-white/5">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <div className="mb-4">
            <RateBadge bankRate={bankRate} lastVerifiedHours={lastVerifiedHours} />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4 leading-tight flex items-center justify-center gap-3">
            <TrendingUp className="h-8 w-8 text-brand-gold" />
            MSME Delayed Interest Calculator
          </h1>
          <p className="text-brand-muted text-sm max-w-xl mx-auto leading-relaxed">
            Statutorily accurate delayed payment estimator computing compound monthly compounding rests at 3× the active RBI Bank Rate.
          </p>
        </div>
      </section>

      {/* Main Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Form & Compounding Graph */}
          <div className="lg:col-span-7 space-y-8">
            <MSMEForm
              principal={principal}
              setPrincipal={setPrincipal}
              creditDays={creditDays}
              setCreditDays={setCreditDays}
              invoiceDate={invoiceDate}
              setInvoiceDate={setInvoiceDate}
              paymentDate={paymentDate}
              setPaymentDate={setPaymentDate}
              bankRate={bankRate}
              setBankRate={setBankRate}
            />

            <InterestChart 
              breakdown={results.breakdown}
              principal={principal}
            />
          </div>

          {/* Right Column: Calculated Cards & Tables */}
          <div className="lg:col-span-5">
            <MSMEResults
              results={results}
              invoiceDate={invoiceDate}
              creditDays={creditDays}
            />
          </div>

        </div>
      </div>

    </div>
  )
}
