export type DividendResolutionData = {
  resolutionType: 'final' | 'interim'
  companyName?: string
  cin?: string
  registeredOffice?: string
  meetingDate?: string
  meetingTime?: string
  meetingPlace?: string
  financialYear?: string
  dividendPerShare?: string
  faceValue?: string
  eligibleShares?: string
  recordDate?: string
  paymentDeadline?: string
  chairperson?: string
  bankName?: string
}

export const SAMPLE_DIVIDEND_RESOLUTION_DATA: DividendResolutionData = {
  resolutionType: 'final',
  companyName: 'ACME TECHNOLOGIES LIMITED',
  cin: 'U72200MH2018PLC312456',
  registeredOffice: 'Plot No. 45, MIDC Industrial Area, Andheri (East), Mumbai - 400093, Maharashtra',
  meetingDate: '30 September 2026',
  meetingTime: '11:00 A.M.',
  meetingPlace: 'Registered Office / Video Conferencing',
  financialYear: '2025–26',
  dividendPerShare: '2.50',
  faceValue: '10',
  eligibleShares: '1000000',
  recordDate: '15 October 2026',
  paymentDeadline: '30 October 2026',
  chairperson: 'Rajesh Sharma',
  bankName: 'HDFC Bank Limited',
}

const value = (input?: string, fallback = '____________________________') => input?.trim() || fallback

export function buildDividendResolutionText(data: DividendResolutionData): string[] {
  const company = value(data.companyName, '[NAME OF THE COMPANY]')
  const resolutionType = data.resolutionType === 'interim' ? 'Interim' : 'Final'
  const amount = value(data.dividendPerShare, '[AMOUNT]')
  const faceValue = value(data.faceValue, '[FACE VALUE]')
  const year = value(data.financialYear, '[FINANCIAL YEAR]')
  const shares = value(data.eligibleShares, '[NUMBER OF ELIGIBLE SHARES]')
  const total = Number(data.dividendPerShare || 0) * Number(data.eligibleShares || 0)
  const totalText = total > 0 && Number.isFinite(total) ? `Rs. ${total.toLocaleString('en-IN')}` : '[AGGREGATE AMOUNT]'
  const date = value(data.meetingDate, '[DATE]')
  const time = value(data.meetingTime, '[TIME]')
  const place = value(data.meetingPlace || data.registeredOffice, '[VENUE / VC DETAILS]')
  const recordDate = value(data.recordDate, '[RECORD DATE, IF APPLICABLE]')
  const payBy = value(data.paymentDeadline, '[PAYMENT DEADLINE]')
  const bank = value(data.bankName, '[SCHEDULED BANK]')
  const chair = value(data.chairperson, '[CHAIRPERSON]')
  const cin = value(data.cin, '[CIN]')

  const opening = [
    `${company}`,
    `CIN: ${cin}`,
    `Registered Office: ${value(data.registeredOffice)}`,
    '',
    `CERTIFIED TRUE COPY OF THE RESOLUTION PASSED AT THE MEETING OF THE BOARD OF DIRECTORS OF ${company} HELD ON ${date} AT ${time} AT ${place}`,
    '',
    `CHAIRPERSON: ${chair}`,
    '',
  ]

  const finalResolution = [
    `“RESOLVED THAT pursuant to the applicable provisions of the Companies Act, 2013, including section 123, the rules made thereunder and the Articles of Association of the Company, and subject to approval of the members at the ensuing Annual General Meeting, a ${resolutionType.toLowerCase()} dividend of Rs. ${amount} per fully paid-up equity share of face value Rs. ${faceValue} each, aggregating approximately to ${totalText}, be and is hereby recommended for the financial year ${year}, to the members whose names appear in the Register of Members / beneficial owners’ records as on ${recordDate}.`,
    '',
    `RESOLVED FURTHER THAT the Board recommends that the members, at the ensuing Annual General Meeting, declare the aforesaid dividend, and that the dividend, if declared, be paid within the period prescribed by law, subject to deduction of tax at source and other applicable statutory requirements.`,
  ]

  const interimResolution = [
    `“RESOLVED THAT pursuant to section 123(3) and other applicable provisions of the Companies Act, 2013, the rules made thereunder and the Articles of Association of the Company, and after considering the financial position and available profits of the Company, an interim dividend of Rs. ${amount} per fully paid-up equity share of face value Rs. ${faceValue} each, aggregating approximately to ${totalText}, be and is hereby declared for the financial year ${year}, payable to the members whose names appear in the Register of Members / beneficial owners’ records as on ${recordDate}.`,
    '',
    `RESOLVED FURTHER THAT the total amount of dividend declared be deposited in a separate bank account with ${bank} within the period prescribed under section 123(4) of the Act, and that the dividend be paid within the period prescribed under section 127, after applicable tax deductions and verification of shareholder payment details.`,
  ]

  const common = [
    '',
    `RESOLVED FURTHER THAT the Company Secretary / Chief Financial Officer be and is hereby authorised to finalise the eligible shareholder list, verify the number of eligible shares (currently estimated at ${shares}), calculate the final aggregate amount, arrange the required bank transfer and statutory deductions, issue payment instructions, maintain supporting records, and do all acts necessary to give effect to this resolution, subject to the Act, applicable rules, the Articles of Association and any applicable SEBI requirements.`,
    '',
    `RESOLVED FURTHER THAT the authorised signatories be and are hereby authorised to operate the relevant bank account and sign such instructions and documents as may be required for payment of the dividend by ${payBy}, or within the applicable statutory period if earlier or otherwise required by law.`,
    '',
    'RESOLVED FURTHER THAT the Company Secretary be and is hereby authorised to make the necessary entries in the minutes and statutory records and, where applicable, make required intimations to the stock exchange(s) and other authorities.',
    '',
    'For and on behalf of the Board',
    '',
    `For ${company}`,
    '',
    '________________________________________',
    `${chair}`,
    'Chairperson / Director',
    'DIN: [DIN, IF APPLICABLE]',
    '',
    `Date: ${date}`,
    'Place: [PLACE]',
    '',
    'Drafting note: This is a specimen for adaptation. A final dividend is only recommended by the Board; members declare it at the AGM. An interim dividend is declared by the Board subject to section 123. Confirm distributable profits, Articles of Association, shareholder entitlement, tax treatment, record date and any listing obligations before use.',
  ]

  return [...opening, ...(data.resolutionType === 'interim' ? interimResolution : finalResolution), ...common]
}
