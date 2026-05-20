'use client'

import { useState } from 'react'

type SuggestionType = 'new_entry' | 'error_report' | 'update_request'

interface ComplianceSuggestModalProps {
  entryId?: string
  entryName?: string
  defaultType?: SuggestionType
  onClose: () => void
}

export default function ComplianceSuggestModal({
  entryId,
  entryName,
  onClose,
}: ComplianceSuggestModalProps) {
  const [type, setType] = useState<SuggestionType>(
    entryId ? 'error_report' : 'new_entry'
  )
  const [form, setForm] = useState({
    regulator: '',
    form_name: '',
    compliance_title: '',
    due_date: '',
    applicable_to: '',
    penalty: '',
    regulation_reference: '',
    error_field: '',
    error_description: '',
    suggested_correction: '',
    user_name: '',
    user_email: '',
    user_profession: '',
    user_city: '',
    user_linkedin: '',
    frequency: 'annual',
    display_order: 0,
  })
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const res = await fetch('/api/compliance/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          suggestion_type: type,
          compliance_entry_id: entryId || null,
          ...form,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to submit')
        return
      }

      setSuccess(true)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass =
    'w-full border border-slate-200 bg-slate-50 focus:bg-white rounded-lg px-3 py-2.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all shadow-sm'

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50 flex-shrink-0">
          <h2 className="text-xl font-heading font-bold text-navy flex items-center gap-2">
            {type === 'new_entry' ? '➕ Suggest New Compliance' : '⚠️ Report an Error'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 bg-white hover:bg-slate-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors shadow-sm border border-slate-200"
          >
            ✕
          </button>
        </div>

        {success ? (
          <div className="text-center py-12 px-6 flex-1 overflow-y-auto">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">
              ✓
            </div>
            <h3 className="font-heading font-bold text-navy text-2xl mb-3">Thank You!</h3>
            <p className="text-slate-600 text-base max-w-md mx-auto mb-8 leading-relaxed">
              Your suggestion has been submitted for admin review. If approved, it will appear
              on the calendar shortly. If you provided your name, you will be credited
              as a contributor.
            </p>
            <button
              onClick={onClose}
              className="bg-navy hover:bg-slate-800 text-white px-8 py-3 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-navy/20"
            >
              Close Window
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
            
            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              
              {/* Type selector — only if no entryId */}
              {!entryId && (
                <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
                  <label className="block text-xs font-bold text-amber-800 uppercase tracking-wider mb-2">
                    What would you like to do?
                  </label>
                  <select
                    value={type}
                    onChange={e => setType(e.target.value as SuggestionType)}
                    className="w-full border border-amber-300 bg-white rounded-lg px-3 py-2.5 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm font-medium"
                  >
                    <option value="new_entry">➕ Suggest New Compliance Entry</option>
                    <option value="error_report">⚠️ Report Error in Existing Entry</option>
                  </select>
                </div>
              )}

              {/* Error report fields */}
              {type === 'error_report' && (
                <div className="space-y-5">
                  <div className="border-b border-slate-100 pb-2">
                     <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Error Details</h3>
                  </div>
                  
                  {entryName && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
                      <p className="text-xs text-red-600 font-bold uppercase tracking-wider mb-1">Reporting error in:</p>
                      <p className="text-base text-red-900 font-semibold">{entryName}</p>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">
                      Which field has an error? *
                    </label>
                    <select
                      required
                      value={form.error_field}
                      onChange={e => setForm(p => ({ ...p, error_field: e.target.value }))}
                      className={inputClass}
                    >
                      <option value="">Select field...</option>
                      <option value="due_date">Due Date</option>
                      <option value="penalty">Penalty Amount</option>
                      <option value="applicable_to">Applicable To</option>
                      <option value="compliance_title">Compliance Description</option>
                      <option value="regulation_reference">Regulation Reference</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">
                        What is wrong? *
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={form.error_description}
                        onChange={e => setForm(p => ({ ...p, error_description: e.target.value }))}
                        placeholder="Describe the error..."
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">
                        What should it be? *
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={form.suggested_correction}
                        onChange={e => setForm(p => ({ ...p, suggested_correction: e.target.value }))}
                        placeholder="Correct information..."
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* New entry fields */}
              {type === 'new_entry' && (
                <div className="space-y-5">
                  <div className="border-b border-slate-100 pb-2">
                     <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Compliance Information</h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">
                        Regulator *
                      </label>
                      <select
                        required
                        value={form.regulator}
                        onChange={e => setForm(p => ({ ...p, regulator: e.target.value }))}
                        className={inputClass}
                      >
                        <option value="">Select...</option>
                        <option value="mca">MCA</option>
                        <option value="sebi">SEBI</option>
                        <option value="rbi">RBI</option>
                        <option value="fema">FEMA</option>
                        <option value="income_tax">Income Tax</option>
                        <option value="nclt">NCLT</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">
                        Form Name *
                      </label>
                      <input
                        required
                        type="text"
                        value={form.form_name}
                        onChange={e => setForm(p => ({ ...p, form_name: e.target.value }))}
                        placeholder="e.g. MGT-7"
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">
                      Compliance Description *
                    </label>
                    <input
                      required
                      type="text"
                      value={form.compliance_title}
                      onChange={e => setForm(p => ({ ...p, compliance_title: e.target.value }))}
                      placeholder="e.g. Annual Return filing"
                      className={inputClass}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">
                        Due Date *
                      </label>
                      <input
                        required
                        type="text"
                        value={form.due_date}
                        onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))}
                        placeholder="e.g. 30 Sep 2026"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">
                        Penalty Amount <span className="font-normal text-slate-400">(optional)</span>
                      </label>
                      <input
                        type="text"
                        value={form.penalty}
                        onChange={e => setForm(p => ({ ...p, penalty: e.target.value }))}
                        placeholder="e.g. ₹100/day"
                        className={inputClass}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">
                      Applicable To *
                    </label>
                    <input
                      required
                      type="text"
                      value={form.applicable_to}
                      onChange={e => setForm(p => ({ ...p, applicable_to: e.target.value }))}
                      placeholder="e.g. All public companies"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">
                      Law / Regulation Reference <span className="font-normal text-slate-400">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={form.regulation_reference}
                      onChange={e => setForm(p => ({ ...p, regulation_reference: e.target.value }))}
                      placeholder="e.g. Section 92, Companies Act"
                      className={inputClass}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Frequency</label>
                      <select value={form.frequency || 'annual'}
                        onChange={e => setForm(p => ({ ...p, frequency: e.target.value }))}
                        className={inputClass}>
                        <option value="monthly">Monthly</option>
                        <option value="quarterly">Quarterly</option>
                        <option value="half_yearly">Half Yearly</option>
                        <option value="annual">Annual</option>
                        <option value="every_2_years">Every 2 Years</option>
                        <option value="every_3_years">Every 3 Years</option>
                        <option value="every_5_years">Every 5 Years</option>
                        <option value="event_based">Event Based</option>
                        <option value="one_time">One Time</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">
                        Display Order <span className="font-normal text-slate-400">(optional)</span>
                      </label>
                      <input type="number" value={form.display_order || 0}
                        onChange={e => setForm(p => ({ ...p, display_order: Number(e.target.value) }))}
                        className={inputClass} />
                    </div>
                  </div>
                </div>
              )}

              {/* User details */}
              <div className="space-y-5 bg-slate-50/80 -mx-6 -mb-6 p-6 border-t border-slate-100">
                <div className="mb-2">
                   <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Your Profile</h3>
                   <p className="text-xs text-slate-500 mt-1">Provide your details to get contributor credit on the calendar.</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Name</label>
                    <input
                      type="text"
                      value={form.user_name}
                      onChange={e => setForm(p => ({ ...p, user_name: e.target.value }))}
                      placeholder="Jane Doe"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Profession</label>
                    <select
                      value={form.user_profession}
                      onChange={e => setForm(p => ({ ...p, user_profession: e.target.value }))}
                      className={inputClass}
                    >
                      <option value="">Select...</option>
                      <option value="Company Secretary">Company Secretary</option>
                      <option value="Chartered Accountant">Chartered Accountant</option>
                      <option value="Advocate">Advocate / Lawyer</option>
                      <option value="Cost Accountant">Cost Accountant</option>
                      <option value="Corporate Professional">Corporate Professional</option>
                      <option value="Student">Student</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">City</label>
                    <input
                      type="text"
                      value={form.user_city}
                      onChange={e => setForm(p => ({ ...p, user_city: e.target.value }))}
                      placeholder="Mumbai, Delhi..."
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">
                      LinkedIn <span className="font-normal text-slate-400">(optional)</span>
                    </label>
                    <input
                      type="url"
                      value={form.user_linkedin}
                      onChange={e => setForm(p => ({ ...p, user_linkedin: e.target.value }))}
                      placeholder="https://linkedin.com/in/yourname"
                      className={inputClass}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">
                    Email * <span className="font-normal text-slate-400">(never shown publicly)</span>
                  </label>
                  <input
                    required
                    type="email"
                    value={form.user_email}
                    onChange={e => setForm(p => ({ ...p, user_email: e.target.value }))}
                    placeholder="you@example.com"
                    className={inputClass}
                  />
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="px-6 py-3 bg-red-50 border-t border-red-100 flex-shrink-0 text-red-700 text-sm font-medium flex items-center gap-2">
                <span className="text-lg">⚠️</span> {error}
              </div>
            )}

            {/* Footer / Actions */}
            <div className="p-6 border-t border-slate-100 bg-white flex justify-end gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors shadow-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-8 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-500 text-navy font-bold text-sm shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-navy/30 border-t-navy rounded-full animate-spin"></span>
                    Submitting...
                  </>
                ) : (
                  'Submit Suggestion'
                )}
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  )
}
