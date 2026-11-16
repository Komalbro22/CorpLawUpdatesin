import fs from 'fs'
if (fs.existsSync('.env.local')) {
  const envContent = fs.readFileSync('.env.local', 'utf8')
  envContent.split(/\r?\n/).forEach((line) => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
    if (match && !process.env[match[1]]) {
      process.env[match[1]] = match[2]?.replace(/^['"](.*)['"]$/, '$1')
    }
  })
}

import { createApiKey, hashApiKey, revokeApiKey } from '@/lib/api-key-auth'
import { supabaseAdmin } from '@/lib/supabase-server'
import { GET as whoamiGet } from '@/app/api/admin/whoami/route'
import { GET as calendarOverviewGet } from '@/app/api/admin/calendar/route'
import { GET as categoriesGet, POST as categoriesPost } from '@/app/api/admin/calendar/categories/route'
import { GET as categoryGet, PATCH as categoryPatch, DELETE as categoryDelete } from '@/app/api/admin/calendar/categories/[id]/route'
import { GET as entriesGet, POST as entriesPost } from '@/app/api/admin/calendar/entries/route'
import { GET as entryGet, PATCH as entryPatch, DELETE as entryDelete } from '@/app/api/admin/calendar/entries/[id]/route'
import { POST as entryRestorePost } from '@/app/api/admin/calendar/entries/[id]/restore/route'
import { GET as entryHistoryGet } from '@/app/api/admin/calendar/entries/[id]/history/route'
import { POST as importPost } from '@/app/api/admin/calendar/import/route'
import { NextRequest } from 'next/server'

describe('Compliance Calendar API & Permissions End-to-End Suite', () => {
  let rawApiKey: string
  let testKeyId: string
  let testCategoryId: string
  let testCategorySlug: string
  let testEntryId: string

  beforeAll(async () => {
    // 1. Create a dedicated test API key with calendar:read and calendar:write
    const keyResult = await createApiKey(
      'jest-calendar-test-key',
      ['calendar:read', 'calendar:write']
    )
    rawApiKey = keyResult.rawKey
    testKeyId = keyResult.keyRecord.id
  })

  afterAll(async () => {
    // Cleanup test API key
    if (testKeyId) {
      await supabaseAdmin.from('api_keys').delete().eq('id', testKeyId)
    }
    // Cleanup any lingering test entries or categories
    if (testEntryId) {
      await supabaseAdmin.from('compliance_entries').delete().eq('id', testEntryId)
    }
    if (testCategoryId) {
      await supabaseAdmin.from('compliance_categories').delete().eq('id', testCategoryId)
    }
  })

  function makeAuthRequest(url: string, method: string = 'GET', body?: any): NextRequest {
    return new NextRequest(url, {
      method,
      headers: {
        'authorization': `Bearer ${rawApiKey}`,
        'content-type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  test('1. whoami lists calendar:read and calendar:write for bearer key', async () => {
    const req = makeAuthRequest('http://localhost:3000/api/admin/whoami')
    const res = await whoamiGet(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.type).toBe('api_key')
    expect(data.scopes).toContain('calendar:read')
    expect(data.scopes).toContain('calendar:write')
  })

  test('2. GET /api/admin/calendar overview returns stats and endpoint catalog', async () => {
    const req = makeAuthRequest('http://localhost:3000/api/admin/calendar')
    const res = await calendarOverviewGet(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.status).toBe('active')
    expect(data.stats.total_categories).toBeGreaterThanOrEqual(8)
    expect(data.stats.total_active_entries).toBeGreaterThanOrEqual(100)
  })

  test('3. Category Management: Create, Read, Update, and Prevent Delete when entries exist', async () => {
    testCategorySlug = `test-cat-${Date.now()}`

    // A. Create new category
    const createReq = makeAuthRequest('http://localhost:3000/api/admin/calendar/categories', 'POST', {
      name: 'Test Category For Muse',
      slug: testCategorySlug,
      colour: 'emerald',
      icon: 'Landmark',
      sort_order: 99,
    })
    const createRes = await categoriesPost(createReq)
    expect(createRes.status).toBe(201)
    const createData = await createRes.json()
    expect(createData.success).toBe(true)
    expect(createData.category.slug).toBe(testCategorySlug)
    testCategoryId = createData.category.id

    // B. Read back category
    const getReq = makeAuthRequest(`http://localhost:3000/api/admin/calendar/categories/${testCategoryId}`)
    const getRes = await categoryGet(getReq, { params: Promise.resolve({ id: testCategoryId }) })
    expect(getRes.status).toBe(200)
    const getData = await getRes.json()
    expect(getData.category.name).toBe('Test Category For Muse')

    // C. Update category
    const patchReq = makeAuthRequest(`http://localhost:3000/api/admin/calendar/categories/${testCategoryId}`, 'PATCH', {
      name: 'Test Category Updated',
      colour: 'purple',
    })
    const patchRes = await categoryPatch(patchReq, { params: Promise.resolve({ id: testCategoryId }) })
    expect(patchRes.status).toBe(200)
    const patchData = await patchRes.json()
    expect(patchData.category.name).toBe('Test Category Updated')
    expect(patchData.category.colour).toBe('purple')
    expect(patchData.diff.name.old).toBe('Test Category For Muse')
    expect(patchData.diff.name.new).toBe('Test Category Updated')
  }, 20000)

  test('4. Entry Management: Create, Read, Duplicate Guard, Update, History, Soft Delete & Restore', async () => {
    const testFormName = `TEST-FORM-${Date.now()}`
    const testDueDate = '30 Nov 2026'

    // 0. Unknown fields rejection check (Must return 400, not drop)
    const unknownFieldReq = makeAuthRequest('http://localhost:3000/api/admin/calendar/entries', 'POST', {
      form_name: testFormName,
      title: 'Unknown Field Test',
      due_date: testDueDate,
      applies_to: 'All test entities',
      regulator: testCategorySlug,
      unrecognized_foo_bar: 'bad_value',
    })
    const unknownFieldRes = await entriesPost(unknownFieldReq)
    expect(unknownFieldRes.status).toBe(400)
    const unknownFieldData = await unknownFieldRes.json()
    expect(unknownFieldData.error).toBe('UNKNOWN_FIELDS')
    expect(unknownFieldData.unknown_fields).toContain('unrecognized_foo_bar')

    // 0b. Invalid recurrence rejection check (Must return 400, not 500)
    const invalidRecReq = makeAuthRequest('http://localhost:3000/api/admin/calendar/entries', 'POST', {
      form_name: testFormName,
      title: 'Invalid Recurrence Test',
      due_date: testDueDate,
      applies_to: 'All test entities',
      regulator: testCategorySlug,
      recurrence: 'invalid_frequency_xyz',
    })
    const invalidRecRes = await entriesPost(invalidRecReq)
    expect(invalidRecRes.status).toBe(400)
    const invalidRecData = await invalidRecRes.json()
    expect(invalidRecData.error).toBe('INVALID_RECURRENCE')

    // A. Create Entry with applies_to, act_rule_reference, penalty_details, and one_off recurrence
    const createReq = makeAuthRequest('http://localhost:3000/api/admin/calendar/entries', 'POST', {
      form_name: testFormName,
      title: 'Muse Verification Test Deadline',
      due_date: testDueDate,
      applies_to: 'All test entities',
      regulator: testCategorySlug,
      description: 'Temporary deadline created by automated verification suite',
      act_rule_reference: 'Section 450 Companies Act',
      penalty_details: '₹100 per day',
      source_url: 'https://www.corplawupdates.in/calendar',
      recurrence: 'one_off',
      is_live: true,
    })
    const createRes = await entriesPost(createReq)
    expect(createRes.status).toBe(201)
    const createData = await createRes.json()
    expect(createData.success).toBe(true)
    expect(createData.entry.form_name).toBe(testFormName)
    expect(createData.entry.applies_to).toBe('All test entities')
    expect(createData.entry.statutory_ref).toBe('Section 450 Companies Act')
    expect(createData.entry.penalty_text).toBe('₹100 per day')
    expect(createData.entry.recurrence).toBe('one-off')
    expect(createData.entry.frequency).toBe('one-off')
    testEntryId = createData.entry.id

    // B. Duplicate Guard Check: same form and date should return 409
    const dupReq = makeAuthRequest('http://localhost:3000/api/admin/calendar/entries', 'POST', {
      form_name: testFormName,
      title: 'Duplicate Attempt',
      due_date: testDueDate,
      applies_to: 'All test entities',
      regulator: testCategorySlug,
    })
    const dupRes = await entriesPost(dupReq)
    expect(dupRes.status).toBe(409)
    const dupData = await dupRes.json()
    expect(dupData.warning).toBe('DUPLICATE_ENTRY')

    // C. Verify Category cannot be deleted while it has entries
    const deleteCatReq = makeAuthRequest(`http://localhost:3000/api/admin/calendar/categories/${testCategoryId}`, 'DELETE')
    const deleteCatRes = await categoryDelete(deleteCatReq, { params: Promise.resolve({ id: testCategoryId }) })
    expect(deleteCatRes.status).toBe(409)
    const deleteCatData = await deleteCatRes.json()
    expect(deleteCatData.error).toBe('CATEGORY_NOT_EMPTY')

    // D. Update Entry: move to 'mca' category, change recurrence to 'every-3-years' (normalizes to triennial), and add statutory extension
    const patchReq = makeAuthRequest(`http://localhost:3000/api/admin/calendar/entries/${testEntryId}`, 'PATCH', {
      title: 'Muse Verification Test Deadline (Extended)',
      regulator: 'mca',
      recurrence: 'every-3-years',
      is_extended: true,
      original_date: '30 Nov 2026',
      due_date: '15 Dec 2026',
      extension_ref: 'MCA Circular No. 99/2026',
      extension_note: 'Extended to 15 Dec 2026 (MCA Circular No. 99/2026)',
    })
    const patchRes = await entryPatch(patchReq, { params: Promise.resolve({ id: testEntryId }) })
    expect(patchRes.status).toBe(200)
    const patchData = await patchRes.json()
    expect(patchData.entry.title).toBe('Muse Verification Test Deadline (Extended)')
    expect(patchData.entry.recurrence).toBe('triennial')
    expect(patchData.entry.frequency).toBe('triennial')
    expect(patchData.entry.is_extended).toBe(true)
    expect(patchData.entry.due_date).toBe('15 Dec 2026')
    expect(patchData.diff.due_date.old).toBe('30 Nov 2026')
    expect(patchData.diff.due_date.new).toBe('15 Dec 2026')

    // E. Read History
    const historyReq = makeAuthRequest(`http://localhost:3000/api/admin/calendar/entries/${testEntryId}/history`)
    const historyRes = await entryHistoryGet(historyReq, { params: Promise.resolve({ id: testEntryId }) })
    expect(historyRes.status).toBe(200)
    const historyData = await historyRes.json()
    expect(historyData.history.length).toBeGreaterThanOrEqual(2) // create + update

    // F. Soft Delete Entry with explicit deletion_reason
    const deleteReq = makeAuthRequest(`http://localhost:3000/api/admin/calendar/entries/${testEntryId}`, 'DELETE', {
      deletion_reason: 'Automated test suite cleanup descriptive reason',
    })
    const deleteRes = await entryDelete(deleteReq, { params: Promise.resolve({ id: testEntryId }) })
    expect(deleteRes.status).toBe(200)
    const deleteData = await deleteRes.json()
    expect(deleteData.mode).toBe('soft_delete')
    expect(deleteData.deletion_reason).toBe('Automated test suite cleanup descriptive reason')

    // G. Verify soft-deleted entry is hidden from active list
    const activeReq = makeAuthRequest(`http://localhost:3000/api/admin/calendar/entries?status=active&search=${testFormName}`)
    const activeRes = await entriesGet(activeReq)
    const activeData = await activeRes.json()
    expect(activeData.entries.some((e: any) => e.id === testEntryId)).toBe(false)

    // H. Restore Entry
    const restoreReq = makeAuthRequest(`http://localhost:3000/api/admin/calendar/entries/${testEntryId}/restore`, 'POST')
    const restoreRes = await entryRestorePost(restoreReq, { params: Promise.resolve({ id: testEntryId }) })
    expect(restoreRes.status).toBe(200)
    const restoreData = await restoreRes.json()
    expect(restoreData.entry.is_deleted).toBe(false)

    // I. Hard Delete test entry permanently for test cleanup
    await supabaseAdmin.from('compliance_entries').delete().eq('id', testEntryId)
    testEntryId = ''

    // J. Now Category has 0 entries -> Category Delete succeeds
    const deleteEmptyCatReq = makeAuthRequest(`http://localhost:3000/api/admin/calendar/categories/${testCategoryId}`, 'DELETE')
    const deleteEmptyCatRes = await categoryDelete(deleteEmptyCatReq, { params: Promise.resolve({ id: testCategoryId }) })
    expect(deleteEmptyCatRes.status).toBe(200)
    testCategoryId = ''
  }, 20000)

  test('5. Bulk Import Dry-Run & Apply with duplicate warning preview', async () => {
    const importPayload = {
      dry_run: true,
      entries: [
        {
          form_name: 'GSTR-3B', // duplicate of existing
          title: 'Monthly Summary Return',
          due_date: '20 November 2026',
          applies_to: 'All registered taxpayers',
          category: 'gst',
        },
        {
          form_name: 'DGFT-TEST-RETURN',
          title: 'Annual Import Export Intimation',
          due_date: '31 Dec 2026',
          applies_to: 'All IEC holders',
          category: 'other',
        },
      ],
    }

    const req = makeAuthRequest('http://localhost:3000/api/admin/calendar/import', 'POST', importPayload)
    const res = await importPost(req)
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.dry_run).toBe(true)
    expect(data.summary.total_rows).toBe(2)
    expect(data.summary.duplicate_warnings).toBeGreaterThanOrEqual(1)
    expect(data.preview[0].is_duplicate).toBe(true)
  })
})
