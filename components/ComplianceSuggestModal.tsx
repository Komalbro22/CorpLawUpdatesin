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
    'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm text-navy focus:outline-none focus:ring-2 focus:ring-amber-400'

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 my-4">

        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-navy">
            {type === 'new_entry' ? '➕ Suggest New Compliance' : '⚠️ Report an Error'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="font-bold text-green-800 text-lg mb-2">Thank you!</h3>
            <p className="text-green-700 text-sm mb-4">
              Your suggestion has been submitted for admin review. If approved, it will appear
              on the calendar within 24 hours. If you provided your name, you will be credited
              as a contributor.
            </p>
            <button
              onClick={onClose}
              className="bg-navy text-white px-6 py-2 rounded-lg text-sm font-semibold"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Type selector — only if no entryId */}
            {!entryId && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Suggestion Type
                </label>
                <select
                  value={type}
                  onChange={e => setType(e.target.value as SuggestionType)}
                  className={inputClass}
                >
                  <option value="new_entry">➕ Suggest New Compliance Entry</option>
                  <option value="error_report">⚠️ Report Error in Existing Entry</option>
                </select>
              </div>
            )}

            {/* Error report fields */}
            {type === 'error_report' && (
              <>
                {entryName && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-xs text-red-700 font-medium">Reporting error in:</p>
                    <p className="text-sm text-red-900 font-bold">{entryName}</p>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Which field has error? *
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
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    What is wrong? *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={form.error_description}
                    onChange={e => setForm(p => ({ ...p, error_description: e.target.value }))}
                    placeholder="Describe the error..."
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    What should it be? *
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={form.suggested_correction}
                    onChange={e => setForm(p => ({ ...p, suggested_correction: e.target.value }))}
                    placeholder="Correct information..."
                    className={inputClass}
                  />
                </div>
              </>
            )}

            {/* New entry fields */}
            {type === 'new_entry' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
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
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
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
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Compliance Description *
                  </label>
                  <input
                    required
                    type="text"
                    value={form.compliance_title}
                    onChange={e => setForm(p => ({ ...p, compliance_title: e.target.value }))}
                    placeholder="Annual Return filing"
                    className={inputClass}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Due Date *
                    </label>
                    <input
                      required
                      type="text"
                      value={form.due_date}
                      onChange={e => setForm(p => ({ ...p, due_date: e.target.value }))}
                      placeholder="30 Sep 2026"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Penalty
                    </label>
                    <input
                      type="text"
                      value={form.penalty}
                      onChange={e => setForm(p => ({ ...p, penalty: e.target.value }))}
                      placeholder="₹100/day"
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Applicable To *
                  </label>
                  <input
                    required
                    type="text"
                    value={form.applicable_to}
                    onChange={e => setForm(p => ({ ...p, applicable_to: e.target.value }))}
                    placeholder="All companies"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Law / Regulation Reference
                  </label>
                  <input
                    type="text"
                    value={form.regulation_reference}
                    onChange={e => setForm(p => ({ ...p, regulation_reference: e.target.value }))}
                    placeholder="Section 92, Companies Act"
                    className={inputClass}
                  />
                </div>
              </>
            )}

            {/* User details */}
            <div className="border-t border-slate-100 pt-4">
              <p className="text-xs font-semibold text-slate-500 mb-3">Your Details</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Name</label>
                  <input
                    type="text"
                    value={form.user_name}
                    onChange={e => setForm(p => ({ ...p, user_name: e.target.value }))}
                    placeholder="Your name"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Profession</label>
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
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">City</label>
                  <input
                    type="text"
                    value={form.user_city}
                    onChange={e => setForm(p => ({ ...p, user_city: e.target.value }))}
                    placeholder="Mumbai, Delhi..."
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    LinkedIn
                    <span className="text-slate-400 font-normal ml-1">(optional — for contributor credit)</span>
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
              <div className="mt-3">
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Email *
                  <span className="text-slate-400 font-normal ml-1">(not shown publicly)</span>
                </label>
                <input
                  required
                  type="email"
                  value={form.user_email}
                  onChange={e => setForm(p => ({ ...p, user_email: e.target.value }))}
                  placeholder="you@example.com"
                  className={inputClass}
                />
                <p className="text-xs text-slate-400 mt-1">
                  Your email is never shown publicly. Used only for follow-up if needed.
                </p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                ❌ {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-slate-300 text-slate-600 py-2.5 rounded-lg text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-amber-400 hover:bg-amber-500 text-navy py-2.5 rounded-lg text-sm font-bold disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Suggestion'}
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  )
}
