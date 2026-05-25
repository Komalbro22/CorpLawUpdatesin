export interface MonthlyBreakdownRow {
  monthIndex: number
  monthName: string
  openingBalance: number
  interestAdded: number
  closingBalance: number
  daysInPeriod: number
}

export interface MSMEResult {
  principal: number
  interest: number
  total: number
  delayDays: number
  annualRate: number
  breakdown: MonthlyBreakdownRow[]
  rateSource: string
  sectionCited: string
}

export function calculateMSMEInterest(
  principal: number,
  invoiceDate: Date,
  paymentDate: Date,
  bankRate: number, // RBI Bank Rate (e.g., 6.75)
  creditDays: 15 | 45 = 45
): MSMEResult {
  const annualRate = 3 * bankRate // statutory 3x multiplier
  const monthlyRate = annualRate / 12 / 100 // e.g. 20.25 / 12 / 100

  const dueDate = new Date(invoiceDate.getTime() + creditDays * 86400000)
  const diffTime = paymentDate.getTime() - dueDate.getTime()
  const delayDays = Math.max(0, Math.floor(diffTime / 86400000))

  if (delayDays === 0) {
    return {
      principal,
      interest: 0,
      total: principal,
      delayDays: 0,
      annualRate,
      breakdown: [],
      rateSource: 'RBI Bank Rate (Section 49, RBI Act, 1934)',
      sectionCited: 'Section 16, MSMED Act, 2006'
    }
  }

  // Calculate continuous compound interest with monthly rests
  // Using avg days in month (30.4375) to prevent boundary jumps
  const delayMonths = delayDays / 30.4375
  const totalAmount = principal * Math.pow(1 + annualRate / 12 / 100, delayMonths)
  const interest = totalAmount - principal

  // Generate monthly rests breakdown
  const breakdown: MonthlyBreakdownRow[] = []
  let tempPrincipal = principal
  let remainingDays = delayDays
  let currentMonthIndex = 1

  while (remainingDays > 0) {
    const daysInPeriod = Math.min(30.4375, remainingDays)
    const factor = daysInPeriod / 30.4375
    const monthAmount = tempPrincipal * Math.pow(1 + annualRate / 12 / 100, factor)
    const interestAdded = monthAmount - tempPrincipal
    
    breakdown.push({
      monthIndex: currentMonthIndex,
      monthName: `Month ${currentMonthIndex}`,
      openingBalance: Math.round(tempPrincipal * 100) / 100,
      interestAdded: Math.round(interestAdded * 100) / 100,
      closingBalance: Math.round(monthAmount * 100) / 100,
      daysInPeriod: Math.round(daysInPeriod * 10) / 10
    })

    tempPrincipal = monthAmount
    remainingDays -= daysInPeriod
    currentMonthIndex++
  }

  return {
    principal,
    interest: Math.round(interest * 100) / 100,
    total: Math.round(totalAmount * 100) / 100,
    delayDays,
    annualRate,
    breakdown,
    rateSource: 'Statutory RBI Bank Rate (Section 49, RBI Act, 1934)',
    sectionCited: 'Section 16, MSMED Act, 2006'
  }
}
