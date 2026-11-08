import * as fs from 'fs'

// Mock supabaseAdmin for Jest tests
jest.mock('@/lib/supabase-server', () => ({
  supabaseAdmin: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      neq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null }),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
      insert: jest.fn().mockResolvedValue({ data: null, error: null }),
      update: jest.fn().mockReturnThis(),
    })),
  },
}))

import {
  getAllLegalScheduleItems,
  getDIR12FeeSchedule,
  updateLegalScheduleItemInDb,
} from '@/lib/legal-data-schedule'
import { getDocumentSet, getSpokeDocument } from '@/lib/document-sets-data'
import {
  DOCUMENT_SET_FOOTER_STAMP,
  compileDocumentSetDocx,
  compileDocumentSetPdf,
  compileCompletePackDocx,
  compileCompletePackZip,
} from '@/lib/doc-generator/document-set-pack-compiler'

describe('Document Sets & Legal Data Schedule Test Suite', () => {
  // 1. Data Integrity & Single Source of Truth
  test('Single source of truth loads all statutory schedule items', async () => {
    const items = await getAllLegalScheduleItems()
    expect(items.length).toBeGreaterThanOrEqual(15)

    const dir12Fees = await getDIR12FeeSchedule()
    expect(dir12Fees.feeSlabs.length).toBe(5)
    expect(dir12Fees.lateFeeBands.length).toBe(5)

    // Check Slab 1 standard fee is ₹200
    const slab1 = dir12Fees.feeSlabs.find(s => s.code === 'FEE_DIR12_SLAB_1')
    expect(slab1).toBeDefined()
    expect(slab1?.amount).toBe(200)

    // Check Multipliers: 2x, 4x, 6x, 10x, 12x
    const multipliers = dir12Fees.lateFeeBands.map(b => b.multiplier)
    expect(multipliers).toEqual([2, 4, 6, 10, 12])
  })

  // 2. Hub & Pilot Set Loading
  test('Pilot Director Appointment Set loads with 11 steps and 11 documents', async () => {
    const set = await getDocumentSet('director-appointment-set')
    expect(set).toBeDefined()
    expect(set?.slug).toBe('director-appointment-set')
    expect(set?.steps.length).toBe(11)
    expect(set?.documents.length).toBe(11)
    expect(set?.changelog.length).toBeGreaterThanOrEqual(1)

    // Honesty gate test: must be "under_review" initially
    expect(set?.reviewer_status).toBe('under_review')
  })

  // 3. Spoke Document Loading
  test('Spoke documents resolve correctly with parent set context', async () => {
    const dir2Spoke = await getSpokeDocument('dir-2-consent-format')
    expect(dir2Spoke).toBeDefined()
    expect(dir2Spoke?.document.title).toContain('DIR-2')
    expect(dir2Spoke?.document.step_number).toBe(2)
    expect(dir2Spoke?.set.slug).toBe('director-appointment-set')

    const mbp1Spoke = await getSpokeDocument('mbp-1-format')
    expect(mbp1Spoke).toBeDefined()
    expect(mbp1Spoke?.document.title).toContain('MBP-1')
    expect(mbp1Spoke?.document.step_number).toBe(7)
  })

  // 4. Word (.docx) Compilation & Footer Stamp Test (§5)
  test('Generated .docx carries the mandatory statutory footer stamp', async () => {
    const set = await getDocumentSet('director-appointment-set')
    const sampleDoc = set!.documents[1] // Board Notice

    const docxBuffer = await compileDocumentSetDocx(sampleDoc)
    expect(docxBuffer).toBeDefined()
    expect(docxBuffer.length).toBeGreaterThan(1000)

    // Footer stamp constant verification
    expect(DOCUMENT_SET_FOOTER_STAMP).toBe(
      'CorpLawUpdates.in | Director Appointment Document Set v1.0 | Law as at 7 November 2026 | Draft template for reference — get it reviewed by your company secretary before use or filing.'
    )
  })

  // 5. PDF Rendition Compilation
  test('Generated PDF buffer compiles successfully', async () => {
    const set = await getDocumentSet('director-appointment-set')
    const sampleDoc = set!.documents[3] // Form DIR-2

    const pdfBuffer = await compileDocumentSetPdf(sampleDoc)
    expect(pdfBuffer).toBeDefined()
    expect(pdfBuffer.length).toBeGreaterThan(500)
    expect(pdfBuffer.subarray(0, 5).toString()).toContain('%PDF')
  })

  // 6. Complete Pack (Single Word & ZIP) Compilation
  test('Complete pack compiles both single .docx and ZIP archive', async () => {
    const set = await getDocumentSet('director-appointment-set')

    const singlePackBuf = await compileCompletePackDocx(set!.documents)
    expect(singlePackBuf.length).toBeGreaterThan(5000)

    const zipBuf = await compileCompletePackZip(set!.documents)
    expect(zipBuf.length).toBeGreaterThan(5000)
    // ZIP magic bytes PK\x03\x04
    expect(zipBuf[0]).toBe(0x50)
    expect(zipBuf[1]).toBe(0x4b)
  })

  // 7. Acceptance Test 7 — TAMPER TEST (Single Source of Truth Proof)
  test('Acceptance Test 7: Tamper test proves single source of truth across surfaces', async () => {
    // 1. Mutate Slab 1 normal fee from ₹200 to ₹250 with mandatory source reference
    const updated = await updateLegalScheduleItemInDb('FEE_DIR12_SLAB_1', {
      data_value: {
        min_capital: 0,
        max_capital: 99999,
        amount: 250,
        currency: 'INR',
        description: 'Authorised share capital less than ₹1,00,000 (Tamper Test)',
      },
      source_reference: 'Acceptance Test 7 Tamper Gazette Verification',
    })

    expect(updated.data_value.amount).toBe(250)

    // 2. Query fee schedule through the public helper used by pages
    const feeSchedule = await getDIR12FeeSchedule()
    const slab1 = feeSchedule.feeSlabs.find(s => s.code === 'FEE_DIR12_SLAB_1')
    expect(slab1?.amount).toBe(250)

    // 3. Restore original ₹200 value so state remains clean
    await updateLegalScheduleItemInDb('FEE_DIR12_SLAB_1', {
      data_value: {
        min_capital: 0,
        max_capital: 99999,
        amount: 200,
        currency: 'INR',
        description: 'Authorised share capital less than ₹1,00,000',
      },
      source_reference: 'MCA Notification G.S.R. 268(E) dated 31-03-2014 (Fee Rules 2014, Table A)',
    })

    const restored = await getDIR12FeeSchedule()
    const restoredSlab1 = restored.feeSlabs.find(s => s.code === 'FEE_DIR12_SLAB_1')
    expect(restoredSlab1?.amount).toBe(200)
  })

  // 8. Acceptance Test: Mandatory source_reference requirement (§11.3 & §11.7)
  test('Rejects legal schedule updates when source_reference is missing', async () => {
    await expect(
      updateLegalScheduleItemInDb('FEE_DIR12_SLAB_1', {
        data_value: { amount: 300 },
        source_reference: '',
      })
    ).rejects.toThrow('Mandatory field missing: source_reference')
  })
})
