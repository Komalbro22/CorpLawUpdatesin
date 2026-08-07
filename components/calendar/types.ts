export interface ComplianceEntry {
  id: string
  regulator: string
  form_name: string
  compliance_title: string
  due_date: string
  applicable_to: string
  penalty: string | null
  regulation_reference: string | null
  is_active: boolean
  is_verified: boolean
  created_by: string | null
  contributor_name: string | null
  contributor_profession: string | null
  correction_count: number
  frequency: string
  display_order: number
  updated_at?: string
}

export const REGULATOR_COLORS: Record<string, string> = {
  mca: 'bg-blue-100 text-blue-800 border-blue-200',
  sebi: 'bg-purple-100 text-purple-800 border-purple-200',
  rbi: 'bg-green-100 text-green-800 border-green-200',
  income_tax: 'bg-orange-100 text-orange-800 border-orange-200',
  fema: 'bg-teal-100 text-teal-800 border-teal-200',
  nclt: 'bg-red-100 text-red-800 border-red-200',
  ibc: 'bg-pink-100 text-pink-800 border-pink-200',
  gst: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  labor_law: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  other: 'bg-slate-100 text-slate-700 border-slate-200',
}
