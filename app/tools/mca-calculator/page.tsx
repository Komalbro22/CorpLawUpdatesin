// src/app/tools/mca-calculator/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { Scale } from 'lucide-react'
import { calculateFees, getStatutoryDueDate, FormType } from '@/lib/mca-fees'
import { supabase } from '@/lib/supabase'
import { AmnestyBanner } from '@/components/mca/AmnestyBanner'
import { MCAForm } from '@/components/mca/MCAForm'
import { MCAResults } from '@/components/mca/MCAResults'

export default function McaCalculatorPage() {
  const [entityType, setEntityType] = useState<'company' | 'llp'>('company')
  const [isSmallOrOPC, setIsSmallOrOPC] = useState(false)
  const [formType, setFormType] = useState<FormType>('AOC-4')
  const [nominalCapital, setNominalCapital] = useState(100000)
  const [financialYear, setFinancialYear] = useState(2025)
  const [actualFilingDate, setActualFilingDate] = useState('')
  
  // Database amnesty parameters
  const [isAmnestyActive, setIsAmnestyActive] = useState(false)
  const [schemeName, setSchemeName] = useState('')
  const [circularUrl, setCircularUrl] = useState('')

  // Sync active amnesty parameters from Supabase compliance_rates
  useEffect(() => {
    async function fetchAmnesty() {
      try {
        const { data: rates } = await supabase
          .from('compliance_rates')
          .select('key, text_value')
          .in('key', ['active_amnesty_scheme', 'amnesty_scheme_name', 'amnesty_scheme_url'])

        if (rates && rates.length > 0) {
          const activeFlag = rates.find(r => r.key === 'active_amnesty_scheme')?.text_value === 'true'
          setIsAmnestyActive(activeFlag)
          
          const name = rates.find(r => r.key === 'amnesty_scheme_name')?.text_value || ''
          setSchemeName(name)
          
          const url = rates.find(r => r.key === 'amnesty_scheme_url')?.text_value || ''
          setCircularUrl(url)
        }
      } catch (err) {
        console.error('Failed to load database amnesty schemes:', err)
      }
    }
    fetchAmnesty()
  }, [])

  // Auto-set standard form types when entity shifts to avoid mismatches
  useEffect(() => {
    if (entityType === 'llp') {
      setFormType('LLP-11')
    } else {
      setFormType('AOC-4')
    }
  }, [entityType])

  // Inject current calendar date as default value on first render
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    setActualFilingDate(today)
  }, [])

  // Execute calculations based on reactive inputs
  const dueDate = getStatutoryDueDate(formType, financialYear)
  const filingDate = actualFilingDate ? new Date(actualFilingDate) : new Date()
  
  const ms = filingDate.getTime() - dueDate.getTime()
  const daysDelayed = Math.max(0, Math.floor(ms / 86400000))

  const results = calculateFees(
    formType,
    daysDelayed,
    nominalCapital,
    isSmallOrOPC,
    isAmnestyActive
  )

  return (
    <div className="min-h-screen bg-brand-navy pb-24 text-white">
      
      {/* Hero Header */}
      <section className="relative px-6 py-16 text-center border-b border-white/5">
        <div className="max-w-4xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 mb-5 text-[10px] font-bold tracking-widest uppercase bg-brand-gold/10 text-brand-gold border border-brand-gold/20 rounded-full">
            Scale Calculations Slabs
          </span>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4 leading-tight flex items-center justify-center gap-3">
            <Scale className="h-8 w-8 text-brand-gold" />
            MCA Late Filing Fee Calculator
          </h1>
          <p className="text-brand-muted text-sm max-w-xl mx-auto leading-relaxed">
            Calculate statutory basic filing costs and daily delayed penalty rates for AOC-4, MGT-7, DIR-3 KYC, and LLP returns.
          </p>
        </div>
      </section>

      {/* Main Page Workspace */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="space-y-8">
          
          {/* Amnesty Waiver Banner Alert (Renders strictly if database flag is true) */}
          <AmnestyBanner
            isActive={isAmnestyActive}
            schemeName={schemeName}
            circularUrl={circularUrl}
          />

          {/* Form and calculation output grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Hand: Statutory Input Fields */}
            <div className="lg:col-span-7">
              <MCAForm
                entityType={entityType}
                setEntityType={setEntityType}
                isSmallOrOPC={isSmallOrOPC}
                setIsSmallOrOPC={setIsSmallOrOPC}
                formType={formType}
                setFormType={setFormType}
                nominalCapital={nominalCapital}
                setNominalCapital={setNominalCapital}
                financialYear={financialYear}
                setFinancialYear={setFinancialYear}
                actualFilingDate={actualFilingDate}
                setActualFilingDate={setActualFilingDate}
              />
            </div>

            {/* Right Hand: Calculated Outputs & Breakdown Cards */}
            <div className="lg:col-span-5">
              <MCAResults
                results={results}
                dueDate={dueDate}
                daysDelayed={daysDelayed}
                isSmallOrOPC={isSmallOrOPC}
              />
            </div>

          </div>

        </div>
      </div>

    </div>
  )
}
