import {
  validateRecurrenceRule,
  computePreviewInstances,
  RecurrenceRule,
} from '@/lib/compliance-series-rules'

describe('Compliance Calendar Series Rules Engine (§1)', () => {
  describe('Rule Validation (§1.2)', () => {
    it('accepts valid day_of_month_next rule and optional overrides', () => {
      const rule: RecurrenceRule = {
        template: 'day_of_month_next',
        day: 20,
      }
      const res = validateRecurrenceRule(rule)
      expect(res.valid).toBe(true)
      expect(res.normalizedRule).toEqual(rule)

      // With overrides (ITNS 281N March -> 30 Apr)
      const itnsRule: RecurrenceRule = {
        template: 'day_of_month_next',
        day: 7,
        month_overrides: { '3': { day: 30 } },
      }
      expect(validateRecurrenceRule(itnsRule).valid).toBe(true)
    })

    it('rejects invalid day_of_month_next with out-of-range day', () => {
      const res = validateRecurrenceRule({
        template: 'day_of_month_next',
        day: 35,
      })
      expect(res.valid).toBe(false)
      expect(res.error).toMatch(/between 1 and 31/)
    })

    it('accepts valid month_end_plus_days rule (Form 141)', () => {
      const rule: RecurrenceRule = {
        template: 'month_end_plus_days',
        days: 30,
      }
      expect(validateRecurrenceRule(rule).valid).toBe(true)
    })

    it('rejects unknown template with 400-level error', () => {
      const res = validateRecurrenceRule({
        template: 'custom_eval_code',
        code: 'eval("20")',
      })
      expect(res.valid).toBe(false)
      expect(res.error).toMatch(/Unknown recurrence rule template/i)
    })

    it('validates quarter_map requires all 4 quarters', () => {
      const invalid = {
        template: 'quarter_map',
        map: { '1': [8, 15], '2': [11, 15] },
      }
      const res = validateRecurrenceRule(invalid)
      expect(res.valid).toBe(false)
      expect(res.error).toMatch(/quarter_map for Q3/i)
    })

    it('accepts event_offset documentation-only rule', () => {
      const rule: RecurrenceRule = {
        template: 'event_offset',
        event: 'AGM',
        days: 60,
        counting: 'exclusive',
        assumed_anchor: '30 September',
      }
      const res = validateRecurrenceRule(rule)
      expect(res.valid).toBe(true)
    })
  })

  describe('Preview Computation (§1.3)', () => {
    it('computes next 3 instances for day_of_month_next (GSTR-3B)', () => {
      const rule: RecurrenceRule = {
        template: 'day_of_month_next',
        day: 20,
      }
      // Start from 15 Nov 2026
      const preview = computePreviewInstances(rule, new Date(2026, 10, 15), 3)
      expect(preview).toHaveLength(3)
      // Period Nov 2026 -> Due 20 Dec 2026
      expect(preview[0].due_date).toBe('20 December 2026')
      expect(preview[0].period_label).toBe('November 2026')
      // Period Dec 2026 -> Due 20 Jan 2027
      expect(preview[1].due_date).toBe('20 January 2027')
      expect(preview[1].period_label).toBe('December 2026')
      // Period Jan 2027 -> Due 20 Feb 2027
      expect(preview[2].due_date).toBe('20 February 2027')
      expect(preview[2].period_label).toBe('January 2027')
    })

    it('applies month_overrides correctly for ITNS 281N in March', () => {
      const rule: RecurrenceRule = {
        template: 'day_of_month_next',
        day: 7,
        month_overrides: { '3': { day: 30 } },
      }
      // Start from 1 Feb 2027 (month 2)
      const preview = computePreviewInstances(rule, new Date(2027, 1, 1), 3)
      // Feb 2027 period -> 7 March 2027
      expect(preview[0].due_date).toBe('7 March 2027')
      // March 2027 period -> 30 April 2027 (override applied!)
      expect(preview[1].due_date).toBe('30 April 2027')
      // April 2027 period -> 7 May 2027
      expect(preview[2].due_date).toBe('7 May 2027')
    })

    it('computes month_end_plus_days for Form 141 (Jan period = 2 March in 28-day Feb)', () => {
      const rule: RecurrenceRule = {
        template: 'month_end_plus_days',
        days: 30,
      }
      // Start from Jan 2027 (month 1, 2027 is non-leap year: Feb has 28 days)
      const preview = computePreviewInstances(rule, new Date(2027, 0, 1), 1)
      // Jan period ends 31 Jan + 30 days = 2 March 2027!
      expect(preview[0].due_date).toBe('2 March 2027')
      expect(preview[0].period_label).toBe('January 2027')
    })

    it('refuses instance generation for event_offset (returns documentation notice)', () => {
      const rule: RecurrenceRule = {
        template: 'event_offset',
        event: 'AGM',
        days: 60,
        counting: 'exclusive',
      }
      const preview = computePreviewInstances(rule, new Date(2026, 9, 1), 3)
      expect(preview[0].due_date).toMatch(/Manual/i)
      expect(preview[0].period_label).toMatch(/Documentation only/i)
    })
  })
})
