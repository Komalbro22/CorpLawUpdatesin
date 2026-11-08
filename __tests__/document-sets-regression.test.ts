jest.mock('next/cache', () => ({
  unstable_cache: (fn: any) => fn,
  revalidateTag: jest.fn(),
  revalidatePath: jest.fn(),
}))

jest.mock('@/lib/supabase-server', () => ({
  supabaseAdmin: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockImplementation(() =>
        Promise.resolve({
          data: {
            id: 'tpl-test-1',
            slug: 'board-resolution-director-appointment',
            name: 'Board Resolution for Appointment of Additional Director',
            category: 'board_resolution',
            template_content: 'RESOLVED THAT [NAME] be appointed...',
            fields: [],
            is_active: true,
          },
          error: null,
        })
      ),
    })),
  },
}))

jest.mock('@/lib/supabase-documents', () => ({
  supabaseDocuments: null,
}))

import { getCachedDocumentTemplate } from '@/lib/document-template-cache'
import { getSpokeDocument } from '@/lib/document-sets-data'

describe('Document Sets & Templates Regression Test Suite (Review Item 7)', () => {
  test('Board Resolution template resolves and retains existing structure', async () => {
    const tpl = await getCachedDocumentTemplate('board-resolution-director-appointment')
    expect(tpl).toBeDefined()
    expect(tpl?.slug).toBe('board-resolution-director-appointment')
    expect(tpl?.category).toBe('board_resolution')
  })

  test('Generic /documents/[slug] resolution keeps serving remaining templates', async () => {
    const dividendTpl = await getCachedDocumentTemplate('board-resolution-dividend')
    expect(dividendTpl).toBeDefined()
    expect(dividendTpl?.name).toBeDefined()

    const letterOfCreditTpl = await getCachedDocumentTemplate('letter-of-credit')
    expect(letterOfCreditTpl).toBeDefined()
  })

  test('Spoke document board-meeting-notice-director-appointment resolves cleanly', async () => {
    const spoke = await getSpokeDocument('board-meeting-notice-director-appointment')
    expect(spoke).not.toBeNull()
    expect(spoke?.document.title).toBe('Board Meeting Notice and Agenda')
    expect(spoke?.document.step_number).toBe(3)
    expect(spoke?.currentStep?.step_number).toBe(3)
  })
})
