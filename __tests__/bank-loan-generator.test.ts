import {
  calculateBorrowingLimit,
  buildBankLoanBoardResolutionDocx,
  buildBankLoanSpecialResolutionDocx,
  buildBankCoveringLetterDocx,
  buildChg1ExtractDocx,
  buildBankLoanBoardResolutionPdf,
  DEFAULT_SAMPLE_BANK_LOAN_DATA,
} from '@/lib/doc-generator/bank-loan-generator'

describe('Bank Loan Generator & Statutory Borrowing Limit Engine', () => {
  test('Section 180(1)(c) borrowing limit: within limit for public company', () => {
    const limits = calculateBorrowingLimit({
      companyType: 'public',
      paidUpCapital: 10000000, // 1 Cr
      freeReserves: 20000000,  // 2 Cr
      securitiesPremium: 5000000, // 50 L => Cap = 3.5 Cr
      existingBorrowings: 10000000, // 1 Cr
      loanAmount: 15000000, // 1.5 Cr => Total = 2.5 Cr <= 3.5 Cr
    })

    expect(limits.statutoryCap).toBe(35000000)
    expect(limits.totalBorrowingsAfterLoan).toBe(25000000)
    expect(limits.isExceeding).toBe(false)
    expect(limits.isExempt).toBe(false)
    expect(limits.specialResolutionRequired).toBe(false)
  })

  test('Section 180(1)(c) borrowing limit: exceeding limit for public company triggers Special Resolution', () => {
    const limits = calculateBorrowingLimit({
      companyType: 'public',
      paidUpCapital: 10000000, // 1 Cr
      freeReserves: 10000000,  // 1 Cr
      securitiesPremium: 0,    // Cap = 2 Cr
      existingBorrowings: 15000000, // 1.5 Cr
      loanAmount: 10000000, // 1 Cr => Total = 2.5 Cr > 2 Cr
    })

    expect(limits.statutoryCap).toBe(20000000)
    expect(limits.totalBorrowingsAfterLoan).toBe(25000000)
    expect(limits.isExceeding).toBe(true)
    expect(limits.isExempt).toBe(false)
    expect(limits.specialResolutionRequired).toBe(true)
    expect(limits.excessAmount).toBe(5000000)
  })

  test('Section 180(1)(c) private company exemption under Notification G.S.R. 464(E)', () => {
    const limits = calculateBorrowingLimit({
      companyType: 'private',
      paidUpCapital: 1000000, // 10 L
      freeReserves: 500000,   // 5 L => Cap = 15 L
      existingBorrowings: 2000000, // 20 L
      loanAmount: 5000000, // 50 L => Total = 70 L > 15 L
    })

    expect(limits.isExceeding).toBe(true)
    expect(limits.isExempt).toBe(true)
    expect(limits.specialResolutionRequired).toBe(false) // Exempt!
  })

  test('buildBankLoanBoardResolutionDocx generates non-empty Word buffer', async () => {
    const buffer = await buildBankLoanBoardResolutionDocx({
      companyName: 'TEST ENTERPRISES PRIVATE LIMITED',
      loanAmount: 25000000,
      bankName: 'HDFC Bank Limited',
    })

    expect(buffer).toBeDefined()
    expect(buffer.length).toBeGreaterThan(1000)
  })

  test('buildBankLoanSpecialResolutionDocx generates non-empty Word buffer', async () => {
    const buffer = await buildBankLoanSpecialResolutionDocx({
      companyName: 'TEST PUBLIC LIMITED',
      companyType: 'public',
      loanAmount: 50000000,
    })

    expect(buffer).toBeDefined()
    expect(buffer.length).toBeGreaterThan(1000)
  })

  test('buildBankCoveringLetterDocx generates non-empty Word buffer', async () => {
    const buffer = await buildBankCoveringLetterDocx({
      companyName: 'TEST ENTERPRISES PRIVATE LIMITED',
      bankName: 'ICICI Bank Limited',
    })

    expect(buffer).toBeDefined()
    expect(buffer.length).toBeGreaterThan(1000)
  })

  test('buildChg1ExtractDocx generates non-empty Word buffer', async () => {
    const buffer = await buildChg1ExtractDocx({
      companyName: 'TEST ENTERPRISES PRIVATE LIMITED',
      bankName: 'Punjab National Bank',
    })

    expect(buffer).toBeDefined()
    expect(buffer.length).toBeGreaterThan(1000)
  })

  test('buildBankLoanBoardResolutionPdf generates non-empty PDF byte array', async () => {
    const pdfBytes = await buildBankLoanBoardResolutionPdf({
      companyName: 'TEST ENTERPRISES PRIVATE LIMITED',
      loanAmount: 10000000,
      bankName: 'Axis Bank Limited',
    })

    expect(pdfBytes).toBeDefined()
    expect(pdfBytes.length).toBeGreaterThan(500)
  })
})
