import { mcaForms } from '@/data/mca-forms'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import JsonLd from '@/components/JsonLd'
import FormSpecificCalc from './FormSpecificCalc'
import SPICePlusAdditions from './SPICePlusAdditions'

export function generateStaticParams() {
  return mcaForms.map((form) => ({
    slug: form.slug,
  }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const form = mcaForms.find(f => f.slug === slug)
  if (!form) return { title: 'Not Found' }

  return {
    title: {
      absolute: form.metaTitle,
    },
    description: form.metaDescription,
    keywords: form.aliases.join(', '),
    alternates: {
      canonical: `https://www.corplawupdates.in/tools/fee-calculator/companies/${form.slug}`,
    },
    openGraph: {
      title: form.metaTitle,
      description: form.ogDescription || form.metaDescription,
      url: `https://www.corplawupdates.in/tools/fee-calculator/companies/${form.slug}`,
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: form.metaTitle,
      description: form.ogDescription || form.metaDescription,
    }
  }
}

export default async function FormSpecificPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const form = mcaForms.find(f => f.slug === slug)
  
  if (!form) {
    notFound()
  }

  // Generate Schemas
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.corplawupdates.in' },
      { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://www.corplawupdates.in/tools' },
      { '@type': 'ListItem', position: 3, name: 'Fee Calculator', item: 'https://www.corplawupdates.in/tools/fee-calculator' },
      { '@type': 'ListItem', position: 4, name: 'Company Forms', item: 'https://www.corplawupdates.in/tools/fee-calculator/companies' },
      { '@type': 'ListItem', position: 5, name: form.formNumber, item: `https://www.corplawupdates.in/tools/fee-calculator/companies/${form.slug}` }
    ]
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: form.faqItems.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer }
    }))
  }

  const webAppSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: `${form.formNumber} Fee Calculator`,
    url: `https://www.corplawupdates.in/tools/fee-calculator/companies/${form.slug}`,
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
    description: form.metaDescription
  }

  const howToSchema = form.slug === 'dir-3-kyc' ? {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Check DIR-3 KYC Due Date & File Form DIR-3 KYC Web on MCA V3',
    description: 'Step-by-step guide to verifying your triennial KYC compliance cycle under Rule 12A(1), meeting the 30-day change update deadline under Rule 12A(2), and reactivating a deactivated DIN.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Determine Triennial Cycle Anchor Financial Year',
        text: 'Identify the financial year in which your DIN was allotted. Routine triennial KYC is due once every 3 consecutive financial years, on or before 30 June of the year immediately following the third financial year.'
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Verify Current DIN Status on MCA21 Portal',
        text: 'Log into MCA Services to confirm whether your DIN is "Active" or marked as "Deactivated due to non-filing of DIR-3 KYC". If deactivated, immediate reactivation with a flat ₹5,000 fee is required.'
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Comply with Rule 12A(2) Event-Based 30-Day Window',
        text: 'If your mobile number, email address, or residential address has changed, file Form DIR-3 KYC Web within 30 days of the change with a fee of ₹500. Note that this change filing does NOT reset your 3-year triennial clock.'
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Complete OTP Verification & Professional Certification',
        text: 'Verify mobile and email OTPs, upload identity and address proofs, and have the form digitally certified by a practicing CA, CS, or CMA under Section 448 & 449.'
      },
      {
        '@type': 'HowToStep',
        position: 5,
        name: 'Remit Prescribed Government Fee for STP Auto-Approval',
        text: 'Pay the applicable government fee (NIL for on-time routine filing, ₹500 for change update, or ₹5,000 for reactivation) via MCA21 V3 e-Challan. System auto-approves the filing on Straight-Through-Process (STP) basis.'
      }
    ]
  } : form.slug === 'adt-1' ? {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Calculate Form ADT-1 Filing Fees & Late Penalties on MCA V3',
    description: 'Step-by-step guide to calculating normal filing fees, Table B late fee multipliers, and statutory deadlines for Form ADT-1 auditor appointment.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Determine the Meeting & Appointment Date',
        text: 'Identify the date of the meeting where the auditor was appointed (AGM, EGM, or Board Meeting for first auditor/casual vacancy).'
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Calculate the 15-Day Statutory Due Date',
        text: 'Form ADT-1 must be filed within 15 calendar days from the meeting date pursuant to Section 139(1) and Rule 4(2).'
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Check Nominal Share Capital Bracket',
        text: 'Determine the normal base fee (₹200 to ₹600) based on authorized capital under Table A Items 5 & 6.'
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Apply Table B Delay Multiplier',
        text: 'If delayed, apply the Table B multiplier (1x for ≤15d, 2x for ≤30d, 4x for ≤60d, 6x for ≤90d, 10x for ≤180d, 12x for ≤270d).'
      },
      {
        '@type': 'HowToStep',
        position: 5,
        name: 'Verify Section 403 Condonation Requirement',
        text: 'If the delay exceeds 270 days, obtain prior Condonation of Delay from the Regional Director via Form CG-1 before filing on MCA V3.'
      }
    ]
  } : form.slug === 'chg-1' ? {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Calculate Form CHG-1 Filing Fees & Ad Valorem Late Penalties on MCA V3',
    description: 'Step-by-step guide to calculating normal filing fees, Table B multipliers (3x/6x), ad valorem fees (0.025%/0.05% capped at ₹1L/₹5L), and Section 87 condonation for Form CHG-1 charge registration.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Identify the Date of Charge Creation or Modification',
        text: 'Determine the execution date of the sanction letter, loan agreement, or deed of hypothecation/mortgage (Day 0 of Chapter VI timeline).'
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Verify the Initial 30-Day Statutory Window',
        text: 'Form CHG-1 filed within 30 days of creation attracts only the normal base filing fee (₹200 to ₹600) under Table A based on authorized share capital.'
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Calculate the First Extension Window (Days 31 to 60)',
        text: 'If delayed between 1 and 30 days beyond due date, pay the additional fee: 3× normal fee for Small Companies/OPCs or 6× normal fee for Other Companies.'
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Calculate the Second Extension Ad Valorem Fee (Days 61 to 120)',
        text: 'If delayed between 31 and 90 days, pay 3×/6× normal fee PLUS an Ad Valorem fee: 0.025% of secured amount (capped at ₹1,00,000) for Small/OPC or 0.05% of secured amount (capped at ₹5,00,000) for Others.'
      },
      {
        '@type': 'HowToStep',
        position: 5,
        name: 'Comply with Section 87 Hard Stop (> 120 Days from Creation)',
        text: 'If delayed beyond 120 days from creation (delay exceeds 90 days), direct ROC registration is legally barred under Section 77. The company must file Form CHG-8 with the Regional Director for condonation of delay.'
      }
    ]
  } : form.slug === 'aoc-4' ? {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Calculate Form AOC-4 Filing Fees & Late Penalties on MCA V3',
    description: 'Step-by-step guide to calculating normal filing fees (Table A), flat ₹100/day uncapped late filing fee, 30-day AGM due date, OPC 180-day deadline, and Section 137(3) statutory penalties.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Determine Applicable AOC-4 Variant',
        text: 'Identify whether the company must file standard AOC-4 (standalone), AOC-4 CFS (has subsidiaries/JVs under Section 129(3)), AOC-4 XBRL (listed, paid-up capital ≥ ₹5 Cr, or turnover ≥ ₹100 Cr), or AOC-4 NBFC (Ind AS).'
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Establish Statutory Due Date',
        text: 'For standard companies, determine the 30-day statutory due date from the AGM under Section 137(1) (standard: October 30). For One Person Companies (OPC), determine the 180-day deadline from FY closure under Section 137(1) third proviso (standard: September 27).'
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Verify Cash Flow Statement Exemption',
        text: 'Check whether the company is exempt from attaching a Cash Flow Statement under the proviso to Section 2(40) (OPCs, Small Companies, Dormant Companies, and DPIIT Startups are exempt).'
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Determine Nominal Share Capital Base Fee',
        text: 'Compute the Table A normal filing fee (₹200 to ₹600) based on authorized share capital bracket (or flat ₹200 for company without share capital).'
      },
      {
        '@type': 'HowToStep',
        position: 5,
        name: 'Calculate ₹100/Day Uncapped Delay Fee',
        text: 'If filing past the statutory due date, compute the additional late filing fee at flat ₹100 per day without upper ceiling under Table B Note Item 2.'
      },
      {
        '@type': 'HowToStep',
        position: 6,
        name: 'Assess Section 137(3) Adjudication Exposure & 446B Relief',
        text: 'Evaluate indicative civil penalty exposure: Base ₹10,000 + ₹100/day continuing default (Company cap: ₹2 Lakhs; Officer cap: ₹50,000). Apply 50% discount if eligible for Section 446B relief.'
      }
    ]
  } : (form.slug === 'mgt-7' || form.slug === 'mgt-7a') ? {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to Calculate Form ${form.formNumber} Annual Return Filing Fees & Late Penalties on MCA V3`,
    description: `Step-by-step guide to calculating normal filing fees (Table A), ₹100/day uncapped late filing fee, 60-day AGM deadline, and Section 92(5) adjudication penalties for Form ${form.formNumber}.`,
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Identify the Date of the AGM',
        text: 'Determine the date on which the Annual General Meeting (AGM) was held (Day 0), or for OPCs, the deemed resolution adoption date pursuant to Section 96 and Section 122.'
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Calculate the 60-Day Statutory Due Date',
        text: 'Under Section 92(4), Form MGT-7/MGT-7A must be filed within 60 calendar days from the AGM date (standard due date: 29th November for 30th September AGM).'
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Determine Small Company Qualification (MGT-7 vs MGT-7A)',
        text: 'Assess paid-up capital (≤ ₹10 Cr) and turnover (≤ ₹100 Cr) under Section 2(85) [amended by G.S.R. 880(E)]. Qualified Small Companies and OPCs file Form MGT-7A; others file Form MGT-7.'
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Determine Nominal Share Capital Base Fee',
        text: 'Check authorized share capital bracket under Table A (₹200 to ₹600) to find the normal government filing fee.'
      },
      {
        '@type': 'HowToStep',
        position: 5,
        name: 'Calculate ₹100/Day Uncapped Delay Fee & Section 92(5) Penalty',
        text: 'If filing past the 60-day deadline, compute additional fee at flat ₹100 per day without upper cap on MCA V3, and check potential Section 92(5) ROC adjudication exposure (with Section 446B relief if eligible).'
      }
    ]
  } : form.slug === 'dpt-3' ? {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Calculate Form DPT-3 Filing Fees & Return of Deposits Penalties on MCA V3',
    description: 'Step-by-step guide to calculating normal filing fees, Table B multipliers (2x to 12x), 30 June statutory due date, Circular 02/2026 waiver, and Rule 21 penalties for Form DPT-3.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Identify Outstanding Receipts as on 31st March',
        text: 'Review corporate balance sheet and ledger to identify any outstanding deposits (Sections 73/76) or exempted loans/receipts under Rule 2(1)(c) (such as director loans, inter-corporate borrowings, or customer advances).'
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Determine Filing Category & Auditor Certificate Requirement',
        text: 'Select return category: Return of Deposits requires mandatory Auditor Certificate and trust deed; particulars of transactions not considered as deposits (Rule 2(1)(c)) does NOT require an Auditor Certificate.'
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Establish Statutory Due Date & Circular 02/2026 Waiver',
        text: 'Statutory due date is 30 June annually (90 days from FY closure). For FY 2025-26, MCA General Circular No. 02/2026 provided fee waiver up to 31 July 2026.'
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Determine Nominal Share Capital Base Fee',
        text: 'Check authorized capital bracket under Table A (₹200 for < ₹1L; ₹300 for ₹1L-₹5L; ₹400 for ₹5L-₹25L; ₹500 for ₹25L-₹1Cr; ₹600 for ≥ ₹1Cr; or flat ₹200 for company without share capital).'
      },
      {
        '@type': 'HowToStep',
        position: 5,
        name: 'Apply Table B Multiplier & Assess Rule 21 Penalty',
        text: 'If delayed, apply Table B multiplier (2x for ≤30d, 4x for ≤60d, 6x for ≤90d, 10x for ≤180d, 12x for >180d). Evaluate potential Rule 21 exposure (₹5,000 company + ₹5,000 per officer + ₹500/day continuing default).'
      }
    ]
  } : form.slug === 'inc-20a' ? {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Calculate Form INC-20A Filing Fees & Section 10A Penalties on MCA V3',
    description: 'Step-by-step guide to calculating 180-day incorporation due dates, Table A normal fees, Table B delay multipliers (2x to 12x), Section 10A(2) statutory penalties, and Section 446B relief.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Identify the Date of Incorporation',
        text: 'Check the date printed on the Certificate of Incorporation (CoI). Day 0 is the incorporation date, and Form INC-20A must be filed strictly within 180 calendar days.'
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Verify Share Subscription Remittance in Corporate Bank Account',
        text: 'Ensure each subscriber to the MOA has deposited their full agreed share capital into the corporate bank account through banking channels, and obtain a certified bank statement.'
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Determine Table A Normal Base Filing Fee',
        text: 'Find your authorized capital tier under Table A Item 5: ₹200 for < ₹1L; ₹300 for ₹1L-₹5L; ₹400 for ₹5L-₹25L; ₹500 for ₹25L-₹1Cr; ₹600 for ≥ ₹1Cr.'
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Calculate Delay Beyond 180 Days & Apply Table B Multiplier',
        text: 'If filing after 180 days, determine delay days: 1-30 days (2x fee), 31-60 days (4x fee), 61-90 days (6x fee), 91-180 days (10x fee), >180 days (12x fee).'
      },
      {
        '@type': 'HowToStep',
        position: 5,
        name: 'Assess Section 10A(2) Adjudication Liability & Section 446B Relief',
        text: 'Standard liability: ₹50,000 flat company penalty + ₹1,000/day per officer (capped at ₹1,00,000 each, payable from personal funds). Eligible Small Companies and Startups receive 50% statutory reduction under Section 446B (₹25,000 company + ₹500/day max ₹50,000 per officer).'
      },
      {
        '@type': 'HowToStep',
        position: 6,
        name: 'Submit on MCA V3 & Complete Professional Certification',
        text: 'Attach bank statement, geo-tagged registered office photos, and board resolution. Obtain Class 3 DSC certification from a practicing CA, CS, or CMA for STP auto-approval.'
      }
    ]
  } : form.slug === 'dir-12' ? {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to File Form DIR-12 for Director Appointment or Resignation on MCA V3 within 30 Days',
    description: 'Step-by-step statutory guide to file Form DIR-12 within 30 days of director appointment, resignation, or designation change, calculate Table A fees and Table B late multipliers, and attach mandatory documentation.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Obtain Written Consent (DIR-2) & Declaration (DIR-8)',
        text: 'Before appointing a director, obtain their formal consent to act in Form DIR-2 and intimation of non-disqualification under Section 164(2) in Form DIR-8 along with identity and address proofs.'
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Convene Board Meeting & Pass Resolution',
        text: 'Convene a meeting of the Board of Directors (or General Meeting for regular appointments) and pass a formal resolution approving the appointment, resignation, or change in designation. The resolution date sets Day 0.'
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Track the Strict 30-Day Due Date',
        text: 'Companies must file DIR-12 within 30 days from the effective date of the corporate event pursuant to Section 168(1) and Section 170(2) of the Companies Act, 2013.'
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Compute Table A Normal Fee & Table B Late Multiplier',
        text: 'Determine the base filing fee (₹200 to ₹600) based on nominal capital. If delayed, apply Table B multipliers: 2x (≤30d), 4x (≤60d), 6x (≤90d), 10x (≤180d), or 12x (≤270d).'
      },
      {
        '@type': 'HowToStep',
        position: 5,
        name: 'Attach Mandatory Documents & Sign with DSC on MCA V3',
        text: 'Attach DIR-2, DIR-8, Board Resolution, or Resignation Letter. Affix Class 3 DSC of an authorized Director and get the form digitally certified by a practicing CA, CS, or CMA.'
      },
      {
        '@type': 'HowToStep',
        position: 6,
        name: 'Submit Challan & Verify Master Data Update on STP',
        text: 'Pay the MCA e-Challan. Form DIR-12 is approved on a Straight-Through-Process (STP) basis, and company master data is updated on the MCA registry immediately.'
      }
    ]
  } : form.slug === 'msme-1' ? {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to File Form MSME-1 Half-Yearly Return & Check Section 405 Penalties on MCA V3',
    description: 'Step-by-step statutory guide to reporting delayed payments to Micro and Small Enterprise suppliers (> 45 days), navigating MCA V3 4-category disclosures, and avoiding Section 405(4) adjudication penalties.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Audit Vendor Master for Udyam Registration',
        text: 'Collect and verify Udyam Registration certificates of all Micro and Small enterprise vendors. Filter out Medium enterprises and wholesale/retail traders.'
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Perform 45-Day Invoice Ageing Reconciliation',
        text: 'Identify all supplier payments or outstanding balances exceeding 45 days from acceptance (or 15 days if no written contract). Anchor Day 0 to the date of physical receipt or service sign-off.'
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Compile V3 Four-Category Transaction Data',
        text: 'Compile transactions across: (1) Paid <= 45d, (2) Paid > 45d, (3) Outstanding <= 45d, and (4) Outstanding > 45d with specific reasons for delay for each overdue vendor.'
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Calculate Section 16 Penal Interest & Section 43B(h) Provision',
        text: 'Compute compound interest at 16.50% p.a. (3× 5.50% RBI Bank Rate) with monthly rests and account for permanent tax disallowance under Section 23 of MSMED Act and Section 43B(h).'
      },
      {
        '@type': 'HowToStep',
        position: 5,
        name: 'Submit Form MSME-1 on MCA V3 Portal by 31 Oct / 30 Apr',
        text: 'Log into MCA Services -> Company e-Filing -> MSME Form 1. Sign digitally using an authorized Director Class 3 DSC. Portal filing fee is ₹0 (free of cost). Processed via STP auto-approval.'
      }
    ]
  } : form.slug === 'pas-3' ? {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to File Form PAS-3 Return of Allotment & Check Section 42/39 Penalties on MCA V3',
    description: 'Step-by-step statutory guide to calculating 15-day private placement vs 30-day ordinary allotment deadlines, Table A/B fees, Section 42(9) promoter liability, and filing Form PAS-3 on MCA V3.',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Determine Allotment Mode (Section 42 vs Section 39)',
        text: 'Identify whether shares were allotted via Private Placement under Section 42 (15-day strict deadline) or via Rights/Bonus/ESOP/Preferential under Section 39 (30-day statutory deadline).'
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Anchor Clock to Board Resolution Date',
        text: 'The statutory countdown starts on the date of the board resolution approving the allotment of securities (Day 0), NOT on the date subscription money was received.'
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Enforce Separate Bank Account & Fund Utilisation Lock',
        text: 'Ensure application money was kept in a separate scheduled bank account and NOT utilised until Form PAS-3 is submitted, avoiding severe Section 42(6) contraventions.'
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Compute Table A Base Fee & Table B Escalation Multipliers',
        text: 'Determine base fee (₹200 to ₹600) based on authorised capital. If delayed, apply Table B late multipliers (2x to 12x) computed from the event-specific due date.'
      },
      {
        '@type': 'HowToStep',
        position: 5,
        name: 'Attach Mandatory Schedules & Certified Resolutions',
        text: 'Attach complete list of allottees (separate list for each allotment date), certified board resolution, valuation report (if non-cash or preferential), and PAS-4/PAS-5 records.'
      },
      {
        '@type': 'HowToStep',
        position: 6,
        name: 'Affix Class 3 DSC & File on MCA V3 Portal',
        text: 'Sign with Class 3 DSC of an authorised Director and practicing professional (PCS/PCA/PCMA, except OPC/Small Co). Pay MCA challan within 7 days of upload.'
      }
    ]
  } : null

  return (
    <div className="min-h-dvh bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <JsonLd data={breadcrumbSchema as any} />
      <JsonLd data={faqSchema as any} />
      <JsonLd data={webAppSchema as any} />
      {howToSchema && <JsonLd data={howToSchema as any} />}

      {/* 4A - Breadcrumb */}
      <div className="bg-navy pt-6 px-4">
        <div className="max-w-5xl mx-auto">
          <nav aria-label="breadcrumb">
            <ol className="flex items-center space-x-2 text-sm text-slate-400">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><span className="mx-2">›</span></li>
              <li><Link href="/tools" className="hover:text-white transition-colors">Tools</Link></li>
              <li><span className="mx-2">›</span></li>
              <li><Link href="/tools/fee-calculator" className="hover:text-white transition-colors">Fee Calculator</Link></li>
              <li><span className="mx-2">›</span></li>
              <li><Link href="/tools/fee-calculator/companies" className="hover:text-white transition-colors">Company Forms</Link></li>
              <li><span className="mx-2">›</span></li>
              <li className="text-slate-200 font-medium" aria-current="page">{form.formNumber}</li>
            </ol>
          </nav>
        </div>
      </div>

      {/* 4B - Hero Section */}
      <div className="bg-navy py-12 px-4 border-b border-slate-800">
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6 flex-wrap">
            <span className="bg-green-400/20 text-green-400 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
              ✓ Updated for FY 2026-27
            </span>
            <span className="bg-blue-400/20 text-blue-400 text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
              {form.category.replace('_', ' ')}
            </span>
          </div>
          <h1 className="text-[2.25rem] font-bold font-serif text-white mb-4">
            {form.slug === 'inc-20a'
              ? 'INC-20A Late Fees & Penalty Calculator (FY 2026-27) — Commencement of Business'
              : form.slug === 'dir-3-kyc'
              ? 'DIR-3 KYC Due Date & Penalty Calculator (FY 2026-27) — Triennial Rules'
              : form.slug === 'dpt-3'
              ? 'DPT-3 Late Fees & Return of Deposits Calculator (FY 2026-27)'
              : form.slug === 'adt-1'
              ? 'ADT-1 Late Fees & Penalty Calculator (FY 2026-27) — Auditor Appointment'
              : form.slug === 'chg-1'
              ? 'CHG-1 Late Fees & Ad Valorem Calculator (FY 2026-27) — Charge Creation'
              : form.slug === 'mgt-7'
              ? 'MGT-7 Late Fees & Penalty Calculator (FY 2026-27) — Annual Return'
              : form.slug === 'mgt-7a'
              ? 'MGT-7A Late Fees & Penalty Calculator (FY 2026-27) — Small Company & OPC'
              : form.slug === 'aoc-4'
              ? 'AOC-4 Late Fees & Penalty Calculator (FY 2026-27) — AOC Form Fees on MCA V3'
              : form.slug === 'dir-12'
              ? 'DIR-12 Form: Director Appointment/Resignation Filing Guide (2026)'
              : form.slug === 'msme-1'
              ? 'MSME Form 1: Half-Yearly Return Due Date, Penalty Calculator & Filing Guide (FY 2026-27)'
              : form.slug === 'pas-3'
              ? 'PAS-3 Return of Allotment: Due Date (15/30 Days), Fees & Penalty Calculator (2026-27)'
              : `${form.formNumber} — ${form.formName} Fee & Penalty Calculator (2026-27)`}
          </h1>
          <p className="text-slate-400 text-lg max-w-3xl mx-auto mb-8">
            {form.slug === 'inc-20a'
              ? 'Calculate statutory normal filing fees, 180-day incorporation due date, Table B late fee multipliers (2× to 12×), Section 10A(2) adjudication penalties, and Section 446B relief for Form INC-20A on MCA V3.'
              : form.slug === 'dir-3-kyc'
              ? 'Determine your triennial routine KYC cycle (Rule 12A(1)), 30-day event-based change rules (Rule 12A(2)), and G.S.R. 300(E) fee schedule (₹0 on-time / ₹500 change / ₹5,00,000 reactivation) on MCA21 V3.'
              : form.slug === 'dpt-3'
              ? 'Calculate statutory normal filing fees, 30 June due date, Circular 02/2026 fee waiver, Table B delay multipliers (2× to 12×), and Rule 21 penalties on MCA V3.'
              : form.slug === 'adt-1'
              ? 'Calculate statutory normal filing fees, 15-day due date from AGM/EGM, and Table B late fee multipliers (1× to 12×) for Form ADT-1 on MCA V3.'
              : form.slug === 'chg-1'
              ? 'Calculate exact normal filing fees, 30-60-120 day Section 77 timelines, 3×/6× extension multipliers, and ad valorem penalties (up to ₹5 Lakhs) for Form CHG-1 on MCA V3.'
              : form.slug === 'mgt-7'
              ? 'Calculate exact normal filing fees, 60-day AGM statutory deadlines, ₹100/day uncapped late fees, Form MGT-8 PCS certification, and Section 92(5) adjudication penalties on MCA V3.'
              : form.slug === 'mgt-7a'
              ? 'Calculate abridged annual return fees, 60-day due dates, ₹100/day late fees, Small Company limits (₹10 Cr / ₹100 Cr), and Section 446B 50% penalty relief for OPCs and Small Companies on MCA V3.'
              : form.slug === 'aoc-4'
              ? 'Calculate exact MCA V3 Form AOC-4 fees, Table A normal filing fees (₹200–₹600), ₹100/day uncapped late filing fee, OPC 180-day deadline, and Section 137(3) statutory penalties for FY 2026-27.'
              : form.slug === 'dir-12'
              ? 'Complete guide to file DIR-12 within 30 days of director appointment, resignation, or change in designation. Calculate MCA V3 filing fees, Table B late multipliers (2× to 12×), and checklist rules.'
              : form.slug === 'msme-1'
              ? 'Calculate Section 405(4) adjudication penalties (₹20,000 + ₹1,000/day up to ₹3,00,000), 31 Oct / 30 Apr due dates, V3 4-category reporting rules, Section 16 penal interest (16.50%), and Section 43B(h) tax disallowance.'
              : form.slug === 'pas-3'
              ? 'When is Form PAS-3 due? 15 days for private placements (Section 42), 30 days for other allotments (Section 39). Calculate MCA Table A base fees, Table B late fee multipliers (2× to 12×), and Section 42(9) promoter liability.'
              : `Calculate exact normal filing fees and late penalties for ${form.formNumber} (${form.formName}) based on authorized capital and delay.`}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="bg-slate-800/50 border border-slate-700 rounded-full px-4 py-2 text-sm text-slate-300">
              📅 <span className="font-semibold text-white ml-1">Due:</span> {form.dueDate}
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-full px-4 py-2 text-sm text-slate-300">
              ⚖️ <span className="font-semibold text-white ml-1">Penalty:</span> {form.penaltyRate}
            </div>
            <div className="bg-slate-800/50 border border-slate-700 rounded-full px-4 py-2 text-sm text-slate-300">
              📋 <span className="font-semibold text-white ml-1">Under:</span> {form.section}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-8 relative z-10 mb-16">
        {/* Princeton GEO Direct Answer Block (58 Words) */}
        {form.slug === 'dir-3-kyc' && (
          <div className="mb-6 p-6 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/50 border-l-4 border-l-blue-600 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              <span>⚡</span> Fast Statutory Summary • G.S.R. 943(E) &amp; G.S.R. 300(E)
            </div>
            <p className="text-slate-800 dark:text-slate-200 text-sm md:text-base leading-relaxed font-medium">
              Form DIR-3 KYC Web is the statutory return governed by Rule 12A of the Appointment of Directors Rules. Effective 31 March 2026, routine filing is triennial (every 3 consecutive financial years) due on 30 June with ₹0 fee. Changes in mobile, email, or address require filing within 30 days (₹500 fee). Delayed filings or DIN reactivation require a flat ₹5,000 fee.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-3">
              <span className="font-semibold text-slate-700 dark:text-slate-300">✓ Routine Triennial KYC: ₹0 (NIL)</span>
              <span>•</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">✓ 30-Day Change Rule: ₹500 Fee</span>
              <span>•</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">✓ DIN Reactivation: ₹5,000 Flat</span>
            </div>
          </div>
        )}

        {form.slug === 'dpt-3' && (
          <div className="mb-6 p-6 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 border-l-4 border-l-amber-600 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              <span>⚡</span> Fast Statutory Summary • MCA V3 Portal
            </div>
            <p className="text-slate-800 dark:text-slate-200 text-sm md:text-base leading-relaxed font-medium">
              Form DPT-3 is the statutory annual return of deposits and non-deposit receipts filed under Section 73 and Rule 16 of the Deposit Rules. Normal filing fees range from ₹200 to ₹600 based on authorized capital. Delayed filings attract Table B multipliers from 2× to 12×. For FY 2025-26, filings up to 31 July 2026 enjoyed fee waiver under MCA General Circular 02/2026.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-3">
              <span className="font-semibold text-slate-700 dark:text-slate-300">✓ Section 73 Due Date: 30 June Annually</span>
              <span>•</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">✓ Circular 02/2026: 31 July Waiver</span>
              <span>•</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">✓ Rule 21: ₹5,000 + ₹500/day</span>
            </div>
          </div>
        )}

        {form.slug === 'aoc-4' && (
          <div className="mb-6 p-6 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/50 border-l-4 border-l-blue-600 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              <span>⚡</span> Fast Statutory Summary • MCA V3 Portal
            </div>
            <p className="text-slate-800 dark:text-slate-200 text-sm md:text-base leading-relaxed font-medium">
              Form AOC-4 is the statutory electronic return for filing audited financial statements with the Registrar of Companies under Section 137 of the Companies Act, 2013. Normal filing fees range from ₹200 to ₹600 based on nominal share capital under Table A. Delayed filings attract a flat, uncapped statutory additional fee of ₹100 per day on MCA21 V3 portal.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-3">
              <span className="font-semibold text-slate-700 dark:text-slate-300">✓ Section 137(1) Due Date: 30 Days from AGM</span>
              <span>•</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">✓ OPC Deadline: 180 Days from FY Close</span>
              <span>•</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">✓ Section 446B: 50% Penalty Relief</span>
            </div>
          </div>
        )}

        {form.slug === 'inc-20a' && (
          <div className="mb-6 p-6 bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-900/50 border-l-4 border-l-rose-600 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              <span>⚡</span> Fast Statutory Summary • Section 10A &amp; Rule 23A
            </div>
            <p className="text-slate-800 dark:text-slate-200 text-sm md:text-base leading-relaxed font-medium">
              Form INC-20A is the mandatory one-time declaration for commencement of business under Section 10A. It is due strictly within 180 calendar days from incorporation. Delayed filing attracts Table B portal late multipliers (2× to 12× base fee) PLUS statutory adjudication penalties under Section 10A(2) of ₹50,000 on the company and ₹1,000/day per officer (max ₹1,00,000 each), halved under Section 446B for Small Companies and Startups.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-3">
              <span className="font-semibold text-slate-700 dark:text-slate-300">✓ Strict Due Date: 180 Days from Incorporation</span>
              <span>•</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">✓ Table B Multipliers: 2× to 12× Normal Fee</span>
              <span>•</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">✓ Section 446B: 50% Reduced Penalty</span>
              <span>•</span>
              <span className="font-semibold text-rose-600 dark:text-rose-400">✗ CCFS-2026 Amnesty: EXCLUDED</span>
            </div>
          </div>
        )}

        {form.slug === 'dir-12' && (
          <div className="mb-6 p-6 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/50 border-l-4 border-l-blue-600 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              <span>⚡</span> Fast Statutory Summary • Sections 168 &amp; 170 &amp; Rule 17
            </div>
            <p className="text-slate-800 dark:text-slate-200 text-sm md:text-base leading-relaxed font-medium">
              Companies must file DIR-12 within 30 days of appointment, resignation, or designation change of any director or KMP with the ROC. Filing requires Form DIR-2 consent, DIR-8 non-disqualification, and board resolution. Normal fees follow Table A (₹200–₹600). Delayed filing attracts Table B multipliers (2× to 12× base fee), and delays beyond 270 days require Regional Director condonation under Section 403.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-3">
              <span className="font-semibold text-slate-700 dark:text-slate-300">✓ Strict Timeline: File DIR-12 within 30 days</span>
              <span>•</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">✓ Mandatory Attachments: DIR-2 Consent + DIR-8 + Resolution</span>
              <span>•</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">✓ Table B Multipliers: 2× to 12× Normal Fee</span>
              <span>•</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">✓ Delay &gt; 270 Days: Section 403 Condonation Required</span>
            </div>
          </div>
        )}

        {form.slug === 'msme-1' && (
          <div className="mb-6 p-6 bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 border-l-4 border-l-amber-600 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              <span>⚡</span> Fast Statutory Summary • Section 405 &amp; MSMED Act
            </div>
            <p className="text-slate-800 dark:text-slate-200 text-sm md:text-base leading-relaxed font-medium">
              Form MSME-1 is a mandatory half-yearly return due 31 October (Apr–Sep) and 30 April (Oct–Mar) for companies with overdue vendor payments exceeding 45 days. Portal filing fee is ₹0. Default attracts Section 405(4) adjudication penalties of ₹20,000 base + ₹1,000/day (capped at ₹3,00,000 each for company and officers) plus Section 16 penal compound interest at 16.50% p.a.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-3">
              <span className="font-semibold text-slate-700 dark:text-slate-300">✓ Due Dates: 31 Oct &amp; 30 Apr</span>
              <span>•</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">✓ Portal Fee: ₹0 (No Late Fee on MCA V3)</span>
              <span>•</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">✓ Sec 405(4): ₹20,000 + ₹1,000/day (Max ₹3L Each)</span>
              <span>•</span>
              <span className="font-semibold text-rose-600 dark:text-rose-400">✓ Sec 16 Interest: 16.50% p.a. Monthly Rests</span>
            </div>
          </div>
        )}

        {form.slug === 'pas-3' && (
          <div className="mb-6 p-6 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/50 border-l-4 border-l-blue-600 rounded-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              <span>⚡</span> Fast Statutory Summary • Sections 39 &amp; 42 • Dual Deadline Rule
            </div>
            <p className="text-slate-800 dark:text-slate-200 text-sm md:text-base leading-relaxed font-medium">
              Form PAS-3 (Return of Allotment) has two distinct statutory deadlines: <strong>15 days</strong> from board allotment for Private Placements (Section 42(8)), and <strong>30 days</strong> for all other allotments including rights, bonus, preferential, and ESOPs (Section 39(4)). Late filings attract Table B multipliers (2× to 12× normal fee) plus adjudication penalties of ₹1,000/day (capped at ₹25 Lakh on company, promoters, and directors under Section 42(9), or ₹1 Lakh under Section 39(5)).
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-3">
              <span className="font-semibold text-blue-700 dark:text-blue-300">✓ Private Placement: Strict 15 Days</span>
              <span>•</span>
              <span className="font-semibold text-emerald-700 dark:text-emerald-300">✓ Rights / Bonus / ESOP: 30 Days</span>
              <span>•</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">✓ Table B Multipliers: 2× to 12× Base Fee</span>
              <span>•</span>
              <span className="font-semibold text-red-600 dark:text-red-400">✓ Sec 42(9) Cap: ₹25L Each on Promoters &amp; Directors</span>
              <span>•</span>
              <span className="font-semibold text-purple-600 dark:text-purple-400">✓ Sec 446B: 50% Concession for Startups/Small Cos</span>
            </div>
          </div>
        )}

        {/* 4C - Calculator */}
        <FormSpecificCalc form={form} />
      </div>

      <div className="max-w-5xl mx-auto px-4 mb-20">
        {/* 4D - Quick Reference Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-xl font-bold text-navy dark:text-white mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">📌</span>
              Key Facts
            </h3>
            <ul className="space-y-4">
              <li className="flex flex-col border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Filed By</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">{form.filedBy.join(', ')}</span>
              </li>
              <li className="flex flex-col border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Due Date</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">{form.dueDate}</span>
              </li>
              <li className="flex flex-col border-b border-slate-100 dark:border-slate-800 pb-3">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Section Reference</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">{form.section}</span>
              </li>
              <li className="flex flex-col">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Concessional Fee Applies?</span>
                <span className={`font-bold ${form.concessionApplies ? 'text-green-600' : 'text-slate-800 dark:text-slate-200'}`}>
                  {form.concessionApplies ? 'Yes (OPC / Small Company)' : 'No'}
                </span>
              </li>
            </ul>
          </div>
          
          <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-xl font-bold text-navy dark:text-white mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">📊</span>
              Fee Schedule
            </h3>
            <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
              {form.normalFeeStructure === 'capital_slab' ? (
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-800/50">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">Nominal Capital Bracket</th>
                      <th className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-300">Normal Filing Fee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr><td className="px-4 py-3">Less than ₹1,00,000</td><td className="px-4 py-3 font-medium">₹200</td></tr>
                    <tr><td className="px-4 py-3">₹1,00,000 or more but less than ₹5,00,000</td><td className="px-4 py-3 font-medium">₹300</td></tr>
                    <tr><td className="px-4 py-3">₹5,00,000 or more but less than ₹25,00,000</td><td className="px-4 py-3 font-medium">₹400</td></tr>
                    <tr><td className="px-4 py-3">₹25,00,000 or more but less than ₹1 crore</td><td className="px-4 py-3 font-medium">₹500</td></tr>
                    <tr><td className="px-4 py-3">₹1 crore or more</td><td className="px-4 py-3 font-medium">₹600</td></tr>
                    <tr><td className="px-4 py-3 text-slate-500 italic">Company not having share capital</td><td className="px-4 py-3 font-medium">₹200</td></tr>
                  </tbody>
                </table>
              ) : (
                <div className="p-6 text-center text-slate-600 dark:text-slate-400">
                  This form uses a {form.normalFeeStructure} fee structure. See calculator above for exact values.
                </div>
              )}
            </div>
          </div>
        </div>

        {form.slug === 'spice-plus' && <SPICePlusAdditions />}

        {/* 4E - Educational Content */}
        <article className="prose prose-slate dark:prose-invert prose-lg max-w-none mb-16">
          <h2 className="text-[1.5rem] font-semibold text-navy dark:text-white mb-4">What is {form.formNumber}?</h2>
          <div dangerouslySetInnerHTML={{ __html: form.contentSections.whatIsThisForm }} />

          <h2 className="text-[1.5rem] font-semibold text-navy dark:text-white mb-4">Who Must File {form.formNumber}?</h2>
          <div dangerouslySetInnerHTML={{ __html: form.contentSections.whoMustFile }} />

          <h2 className="text-[1.5rem] font-semibold text-navy dark:text-white mb-4">{form.formNumber} Due Date & Timeline</h2>
          <div dangerouslySetInnerHTML={{ __html: form.contentSections.dueDateExplained }} />

          <h2 className="text-[1.5rem] font-semibold text-navy dark:text-white mb-4">Consequences of Late Filing {form.formNumber}</h2>
          <div dangerouslySetInnerHTML={{ __html: form.contentSections.consequencesOfDelay }} />
        </article>

        {/* AOC-4 Dedicated Statutory Master Tables */}
        {form.slug === 'aoc-4' && (
          <div className="space-y-12 mb-16">
            {/* Table 1: Normal Fees */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-hidden">
              <h3 className="text-lg font-bold text-navy dark:text-white mb-2 flex items-center gap-2">
                <span>📋</span> Table A: Normal Filing Fee Schedule (Items 5 & 6)
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Statutory base fee payable upon filing Form AOC-4, AOC-4 CFS, or AOC-4 XBRL on MCA21 V3 portal based on authorized capital.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Nominal / Authorized Capital Bracket</th>
                      <th className="px-4 py-3 font-semibold">Normal Filing Fee</th>
                      <th className="px-4 py-3 font-semibold">Statutory Reference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr><td className="px-4 py-3 font-medium">Less than ₹1,00,000</td><td className="px-4 py-3 font-bold text-blue-600">₹200</td><td className="px-4 py-3 text-slate-500">Table A, Item 5, Fees Rules 2014</td></tr>
                    <tr><td className="px-4 py-3 font-medium">₹1,00,000 to ₹4,99,999</td><td className="px-4 py-3 font-bold text-blue-600">₹300</td><td className="px-4 py-3 text-slate-500">Table A, Item 5, Fees Rules 2014</td></tr>
                    <tr><td className="px-4 py-3 font-medium">₹5,00,000 to ₹24,99,999</td><td className="px-4 py-3 font-bold text-blue-600">₹400</td><td className="px-4 py-3 text-slate-500">Table A, Item 5, Fees Rules 2014</td></tr>
                    <tr><td className="px-4 py-3 font-medium">₹25,00,000 to ₹99,99,999</td><td className="px-4 py-3 font-bold text-blue-600">₹500</td><td className="px-4 py-3 text-slate-500">Table A, Item 5, Fees Rules 2014</td></tr>
                    <tr><td className="px-4 py-3 font-medium">₹1,00,00,000 or more (≥ ₹1 Crore)</td><td className="px-4 py-3 font-bold text-blue-600">₹600</td><td className="px-4 py-3 text-slate-500">Table A, Item 5, Fees Rules 2014</td></tr>
                    <tr className="bg-slate-50/50 dark:bg-slate-800/30"><td className="px-4 py-3 font-medium italic">Company not having share capital</td><td className="px-4 py-3 font-bold text-blue-600">₹200</td><td className="px-4 py-3 text-slate-500">Table A, Item 6, Fees Rules 2014</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table 2: ₹100/day Uncapped Delay Matrix */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-hidden">
              <h3 className="text-lg font-bold text-navy dark:text-white mb-2 flex items-center gap-2">
                <span>⏱️</span> Form AOC-4 Late Fee Calculation Matrix (₹100/Day Uncapped)
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Under Table B (Note Item 2), additional filing fees accrue at flat ₹100 per day indefinitely without any maximum ceiling on MCA V3.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Delay Period Beyond Due Date</th>
                      <th className="px-4 py-3 font-semibold">Late Fee Formula</th>
                      <th className="px-4 py-3 font-semibold">Additional Fee Amount</th>
                      <th className="px-4 py-3 font-semibold">Filing Remarks & Risk Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr><td className="px-4 py-3 font-medium">0 Days (Filed on or before due date)</td><td className="px-4 py-3">0 × ₹100</td><td className="px-4 py-3 font-bold text-green-600">₹0</td><td className="px-4 py-3 text-slate-500">Fully compliant with Section 137(1)</td></tr>
                    <tr><td className="px-4 py-3 font-medium">15 Days Delay</td><td className="px-4 py-3">15 × ₹100</td><td className="px-4 py-3 font-bold text-amber-600">₹1,500</td><td className="px-4 py-3 text-slate-500">Minor delay; portal fee payable online</td></tr>
                    <tr><td className="px-4 py-3 font-medium">30 Days Delay (1 Month)</td><td className="px-4 py-3">30 × ₹100</td><td className="px-4 py-3 font-bold text-amber-600">₹3,000</td><td className="px-4 py-3 text-slate-500">MGT-7 due date typically coincides here</td></tr>
                    <tr><td className="px-4 py-3 font-medium">60 Days Delay (2 Months)</td><td className="px-4 py-3">60 × ₹100</td><td className="px-4 py-3 font-bold text-amber-600">₹6,000</td><td className="px-4 py-3 text-slate-500">Increased risk of ROC inquiry notice</td></tr>
                    <tr><td className="px-4 py-3 font-medium">90 Days Delay (3 Months)</td><td className="px-4 py-3">90 × ₹100</td><td className="px-4 py-3 font-bold text-amber-600">₹9,000</td><td className="px-4 py-3 text-slate-500">Section 137(3) penalty exposure grows</td></tr>
                    <tr><td className="px-4 py-3 font-medium">180 Days Delay (6 Months)</td><td className="px-4 py-3">180 × ₹100</td><td className="px-4 py-3 font-bold text-red-600">₹18,000</td><td className="px-4 py-3 text-slate-500">Severe ongoing statutory default</td></tr>
                    <tr className="bg-red-50/40 dark:bg-red-950/20"><td className="px-4 py-3 font-medium text-red-700 dark:text-red-400">365 Days Delay (1 Full Year)</td><td className="px-4 py-3">365 × ₹100</td><td className="px-4 py-3 font-bold text-red-600">₹36,500</td><td className="px-4 py-3 text-red-600">Year 1 of Section 164(2)(a) 3-year clock</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table 3: Section 137(3) Penalty vs Section 446B Relief */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-hidden">
              <h3 className="text-lg font-bold text-navy dark:text-white mb-2 flex items-center gap-2">
                <span>⚖️</span> Section 137(3) Civil Adjudication Penalties vs Section 446B Relief
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Comparison of statutory adjudication exposure under Section 137(3) (as amended by Companies Act 2020) and concessional caps under Section 446B.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Liable Person / Entity</th>
                      <th className="px-4 py-3 font-semibold">Standard Statutory Formula</th>
                      <th className="px-4 py-3 font-semibold">Standard Maximum Cap</th>
                      <th className="px-4 py-3 font-semibold">Section 446B Concessional Cap (Small Co/OPC)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr>
                      <td className="px-4 py-3 font-bold text-navy dark:text-white">The Company</td>
                      <td className="px-4 py-3">₹10,000 + ₹100/day after 1st day</td>
                      <td className="px-4 py-3 font-bold text-red-600">₹2,00,000</td>
                      <td className="px-4 py-3 font-bold text-green-600">₹1,00,000 (50% Relief)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-bold text-navy dark:text-white">MD / CFO / In-Charge Director</td>
                      <td className="px-4 py-3">₹10,000 + ₹100/day after 1st day</td>
                      <td className="px-4 py-3 font-bold text-red-600">₹50,000 per person</td>
                      <td className="px-4 py-3 font-bold text-green-600">₹25,000 per person (50% Relief)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-bold text-navy dark:text-white">All Directors (if no MD/CFO)</td>
                      <td className="px-4 py-3">₹10,000 + ₹100/day per director</td>
                      <td className="px-4 py-3 font-bold text-red-600">₹50,000 per director</td>
                      <td className="px-4 py-3 font-bold text-green-600">₹25,000 per director (50% Relief)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table 4: Form AOC-4 Variants Comparison */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-hidden">
              <h3 className="text-lg font-bold text-navy dark:text-white mb-2 flex items-center gap-2">
                <span>📑</span> Form AOC-4 Variants: Which Form Applies to Your Company?
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Comparison of the 4 statutory variants of Form AOC-4 on MCA21 V3 portal.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Form Code</th>
                      <th className="px-4 py-3 font-semibold">Form Title</th>
                      <th className="px-4 py-3 font-semibold">Applicability Criteria</th>
                      <th className="px-4 py-3 font-semibold">Key Statutory Attachment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr>
                      <td className="px-4 py-3 font-bold text-blue-600">AOC-4</td>
                      <td className="px-4 py-3 font-medium">Standalone Financial Statements</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">All companies not mandated for XBRL/Ind AS</td>
                      <td className="px-4 py-3 text-slate-500">Balance sheet, P&L, Board report, Auditor report</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-bold text-blue-600">AOC-4 CFS</td>
                      <td className="px-4 py-3 font-medium">Consolidated Financial Statements</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">Companies having ≥ 1 subsidiary, JV, or associate (Sec 129(3))</td>
                      <td className="px-4 py-3 text-slate-500">Consolidated financials & Form AOC-1</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-bold text-blue-600">AOC-4 XBRL</td>
                      <td className="px-4 py-3 font-medium">Financial Statements in XBRL</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">Listed, Capital ≥ ₹5 Cr, Turnover ≥ ₹100 Cr, or Ind AS</td>
                      <td className="px-4 py-3 text-slate-500">XBRL instance document validated via MCA tool</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-bold text-blue-600">AOC-4 NBFC</td>
                      <td className="px-4 py-3 font-medium">NBFC Financials (Ind AS)</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">NBFCs complying with Indian Accounting Standards</td>
                      <td className="px-4 py-3 text-slate-500">Ind AS compliant standalone & consolidated financials</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table 5: AOC-4 vs MGT-7 Comparison */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-hidden">
              <h3 className="text-lg font-bold text-navy dark:text-white mb-2 flex items-center gap-2">
                <span>🔄</span> AOC-4 vs MGT-7: Key Statutory Differences
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Comparative matrix between the two principal annual ROC compliance filings.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Feature / Parameter</th>
                      <th className="px-4 py-3 font-semibold">Form AOC-4</th>
                      <th className="px-4 py-3 font-semibold">Form MGT-7 / MGT-7A</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr><td className="px-4 py-3 font-bold text-navy dark:text-white">Subject Matter</td><td className="px-4 py-3">Audited Financial Statements & Accounts</td><td className="px-4 py-3">Annual Return (Shareholding, Directors, Governance)</td></tr>
                    <tr><td className="px-4 py-3 font-bold text-navy dark:text-white">Governing Section</td><td className="px-4 py-3 font-medium">Section 137, Companies Act 2013</td><td className="px-4 py-3 font-medium">Section 92, Companies Act 2013</td></tr>
                    <tr><td className="px-4 py-3 font-bold text-navy dark:text-white">Statutory Due Date</td><td className="px-4 py-3 font-bold text-blue-600">Within 30 days of AGM (30th October)</td><td className="px-4 py-3 font-bold text-purple-600">Within 60 days of AGM (29th November)</td></tr>
                    <tr><td className="px-4 py-3 font-bold text-navy dark:text-white">OPC Statutory Due Date</td><td className="px-4 py-3">Within 180 days of FY closure (27th Sept)</td><td className="px-4 py-3">Within 60 days of deemed adoption</td></tr>
                    <tr><td className="px-4 py-3 font-bold text-navy dark:text-white">MCA V3 Late Filing Fee</td><td className="px-4 py-3">Flat ₹100 per day (Uncapped)</td><td className="px-4 py-3">Flat ₹100 per day (Uncapped)</td></tr>
                    <tr><td className="px-4 py-3 font-bold text-navy dark:text-white">Small Company Form</td><td className="px-4 py-3">Form AOC-4 (Cash flow exempt)</td><td className="px-4 py-3">Form MGT-7A (Abridged annual return)</td></tr>
                    <tr><td className="px-4 py-3 font-bold text-navy dark:text-white">Civil Penalty Section</td><td className="px-4 py-3">Section 137(3) (Co: ₹2L, Off: ₹50k)</td><td className="px-4 py-3">Section 92(5) (Co: ₹2L, Off: ₹50k)</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* DPT-3 Dedicated Statutory Master Tables */}
        {form.slug === 'dpt-3' && (
          <div className="space-y-12 mb-16">
            {/* Table 1: Normal Fees */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-hidden">
              <h3 className="text-lg font-bold text-navy dark:text-white mb-2 flex items-center gap-2">
                <span>📋</span> Table A: Normal Base Filing Fee Schedule (Items 5 & 6)
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Statutory base fee payable upon filing Form DPT-3 on MCA21 V3 portal based on authorized nominal share capital under the Companies (Registration Offices and Fees) Rules, 2014.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Nominal / Authorized Capital Bracket</th>
                      <th className="px-4 py-3 font-semibold">Normal Filing Fee</th>
                      <th className="px-4 py-3 font-semibold">Statutory Reference & Nuance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr><td className="px-4 py-3 font-medium">Less than ₹1,00,000</td><td className="px-4 py-3 font-bold text-blue-600">₹200</td><td className="px-4 py-3 text-slate-500">Table A, Item 5, Fees Rules 2014</td></tr>
                    <tr><td className="px-4 py-3 font-medium">₹1,00,000 to ₹4,99,999</td><td className="px-4 py-3 font-bold text-blue-600">₹300</td><td className="px-4 py-3 text-slate-500">Table A, Item 5, Fees Rules 2014</td></tr>
                    <tr><td className="px-4 py-3 font-medium">₹5,00,000 to ₹24,99,999</td><td className="px-4 py-3 font-bold text-blue-600">₹400</td><td className="px-4 py-3 text-slate-500">Table A, Item 5, Fees Rules 2014 (Most standard private companies)</td></tr>
                    <tr><td className="px-4 py-3 font-medium">₹25,00,000 to ₹99,99,999</td><td className="px-4 py-3 font-bold text-blue-600">₹500</td><td className="px-4 py-3 text-slate-500">Table A, Item 5, Fees Rules 2014</td></tr>
                    <tr><td className="px-4 py-3 font-medium">₹1,00,00,000 or more (≥ ₹1 Crore)</td><td className="px-4 py-3 font-bold text-blue-600">₹600</td><td className="px-4 py-3 text-slate-500">Table A, Item 5, Fees Rules 2014 (Maximum base tier)</td></tr>
                    <tr className="bg-slate-50/50 dark:bg-slate-800/30"><td className="px-4 py-3 font-medium italic">Company not having share capital</td><td className="px-4 py-3 font-bold text-blue-600">₹200</td><td className="px-4 py-3 text-slate-500">Table A, Item 6, Fees Rules 2014 (Flat fee for guarantee companies)</td></tr>
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-slate-500 mt-3 italic">
                *Note: Companies incorporated post 26 January 2018 with capital ≤ ₹10 Lakhs had zero incorporation fees; however, this exemption does not apply to recurring annual forms like DPT-3.
              </p>
            </div>

            {/* Table 2: Table B Multiplier Matrix */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-hidden">
              <h3 className="text-lg font-bold text-navy dark:text-white mb-2 flex items-center gap-2">
                <span>⏱️</span> Table B: Additional Late Fee Multiplier Matrix (2× to 12×)
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Unlike AOC-4 and MGT-7 (which charge flat ₹100/day), Form DPT-3 delay fees are calculated strictly as multipliers of the Table A normal fee under Item B of the Fees Rules.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Period of Delay</th>
                      <th className="px-4 py-3 font-semibold">Table B Multiplier</th>
                      <th className="px-4 py-3 font-semibold">Total Fee: ₹10L Capital</th>
                      <th className="px-4 py-3 font-semibold">Total Fee: ≥ ₹1Cr Capital</th>
                      <th className="px-4 py-3 font-semibold">Statutory Risk & Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr><td className="px-4 py-3 font-medium">0 Days (Timely on or before 30 June)</td><td className="px-4 py-3 font-bold text-green-600">0× (No Late Fee)</td><td className="px-4 py-3">₹400</td><td className="px-4 py-3">₹600</td><td className="px-4 py-3 text-slate-500">Fully compliant with Rule 16</td></tr>
                    <tr><td className="px-4 py-3 font-medium">Up to 30 Days Delay</td><td className="px-4 py-3 font-bold text-amber-600">2× Normal Fee</td><td className="px-4 py-3">₹400 + ₹800 = <strong>₹1,200</strong></td><td className="px-4 py-3">₹600 + ₹1,200 = <strong>₹1,800</strong></td><td className="px-4 py-3 text-slate-500">Standard initial late slab</td></tr>
                    <tr><td className="px-4 py-3 font-medium">31 to 60 Days Delay</td><td className="px-4 py-3 font-bold text-amber-600">4× Normal Fee</td><td className="px-4 py-3">₹400 + ₹1,600 = <strong>₹2,000</strong></td><td className="px-4 py-3">₹600 + ₹2,400 = <strong>₹3,000</strong></td><td className="px-4 py-3 text-slate-500">Second tier delay</td></tr>
                    <tr><td className="px-4 py-3 font-medium">61 to 90 Days Delay</td><td className="px-4 py-3 font-bold text-amber-600">6× Normal Fee</td><td className="px-4 py-3">₹400 + ₹2,400 = <strong>₹2,800</strong></td><td className="px-4 py-3">₹600 + ₹3,600 = <strong>₹4,200</strong></td><td className="px-4 py-3 text-slate-500">Escalating compliance warning</td></tr>
                    <tr><td className="px-4 py-3 font-medium">91 to 180 Days Delay</td><td className="px-4 py-3 font-bold text-red-600">10× Normal Fee</td><td className="px-4 py-3">₹400 + ₹4,000 = <strong>₹4,400</strong></td><td className="px-4 py-3">₹600 + ₹6,000 = <strong>₹6,600</strong></td><td className="px-4 py-3 text-slate-500">Substantial delay (3–6 months)</td></tr>
                    <tr className="bg-red-50/40 dark:bg-red-950/20"><td className="px-4 py-3 font-medium text-red-700 dark:text-red-400">More than 180 Days Delay</td><td className="px-4 py-3 font-bold text-red-600">12× Normal Fee</td><td className="px-4 py-3 text-red-700 dark:text-red-300">₹400 + ₹4,800 = <strong>₹5,200</strong></td><td className="px-4 py-3 text-red-700 dark:text-red-300">₹600 + ₹7,200 = <strong>₹7,800</strong></td><td className="px-4 py-3 text-red-600">Max multiplier; &gt;270d needs Sec 403 condonation</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table 3: Rule 21 Procedural Fine vs Section 76A Substantive Penalties */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-hidden">
              <h3 className="text-lg font-bold text-navy dark:text-white mb-2 flex items-center gap-2">
                <span>⚖️</span> Rule 21 Procedural Fines vs Section 76A Substantive Penalties
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Comparison between procedural penalties for missing the DPT-3 filing and criminal/substantive penalties for unauthorized public deposits.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Statutory Dimension</th>
                      <th className="px-4 py-3 font-semibold text-amber-600 dark:text-amber-400">Rule 21 Procedural Fine</th>
                      <th className="px-4 py-3 font-semibold text-red-600 dark:text-red-400">Section 76A Substantive Penalty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr>
                      <td className="px-4 py-3 font-bold text-navy dark:text-white">Governing Law</td>
                      <td className="px-4 py-3">Rule 21, Deposits Rules, 2014</td>
                      <td className="px-4 py-3 font-medium">Section 76A, Companies Act, 2013</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-bold text-navy dark:text-white">When Triggered?</td>
                      <td className="px-4 py-3">Failure or delay in filing Form DPT-3 (even for exempt director loans)</td>
                      <td className="px-4 py-3">Accepting deposits in violation of Sec 73/76 or default in repayment</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-bold text-navy dark:text-white">Company Liability</td>
                      <td className="px-4 py-3">Fine up to ₹5,000</td>
                      <td className="px-4 py-3 font-bold text-red-600">₹1 Crore to ₹10 Crore (or 2× deposit amount)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-bold text-navy dark:text-white">Officers in Default Liability</td>
                      <td className="px-4 py-3">Fine up to ₹5,000 per officer</td>
                      <td className="px-4 py-3 font-bold text-red-600">Imprisonment up to 7 yrs AND/OR ₹25 Lakh to ₹2 Crore</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-bold text-navy dark:text-white">Continuing Default Rate</td>
                      <td className="px-4 py-3">₹500 per day throughout the failure</td>
                      <td className="px-4 py-3">Additional fine extending to ₹10 Crore + 18% penal interest</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-bold text-navy dark:text-white">Adjudication Authority</td>
                      <td className="px-4 py-3">Registrar of Companies (ROC) under Section 454</td>
                      <td className="px-4 py-3">Special Court / NCLT Criminal Prosecution</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table 4: Circular 02/2026 Waiver Matrix */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-hidden">
              <h3 className="text-lg font-bold text-navy dark:text-white mb-2 flex items-center gap-2">
                <span>🏛️</span> MCA General Circular No. 02/2026 Fee Waiver & Date Arithmetic (FY 2025-26)
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Relief issued by the Ministry of Corporate Affairs on 19 June 2026 following the fire at the MCA Data Centre on 5 June 2026.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Filing Date Window</th>
                      <th className="px-4 py-3 font-semibold">Circular 02/2026 Status</th>
                      <th className="px-4 py-3 font-semibold">Table B Multiplier</th>
                      <th className="px-4 py-3 font-semibold">Late Fee Payable</th>
                      <th className="px-4 py-3 font-semibold">Statutory Date Arithmetic Rule</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr>
                      <td className="px-4 py-3 font-medium">On or before 30 June 2026</td>
                      <td className="px-4 py-3 font-bold text-green-600">Timely Filing</td>
                      <td className="px-4 py-3">0×</td>
                      <td className="px-4 py-3 font-bold text-green-600">₹0</td>
                      <td className="px-4 py-3 text-slate-500">Within standard 90-day window under Rule 16</td>
                    </tr>
                    <tr className="bg-amber-50/50 dark:bg-amber-950/30">
                      <td className="px-4 py-3 font-medium text-amber-900 dark:text-amber-200">1 July 2026 to 31 July 2026</td>
                      <td className="px-4 py-3 font-bold text-amber-700 dark:text-amber-300">Fee Waiver Active</td>
                      <td className="px-4 py-3 font-bold">0× (Waived)</td>
                      <td className="px-4 py-3 font-bold text-green-600">₹0</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">Additional late fee completely waived by Circular 02/2026; pay normal fee only</td>
                    </tr>
                    <tr className="bg-red-50/40 dark:bg-red-950/20">
                      <td className="px-4 py-3 font-medium text-red-700 dark:text-red-400">On or after 1 August 2026</td>
                      <td className="px-4 py-3 font-bold text-red-700 dark:text-red-400">Post-Waiver Delayed</td>
                      <td className="px-4 py-3 font-bold text-red-600">2× to 12× Normal Fee</td>
                      <td className="px-4 py-3 font-bold text-red-600">Standard Table B Slabs</td>
                      <td className="px-4 py-3 text-red-700 dark:text-red-300">
                        <strong>Crucial Nuance:</strong> Delay is counted from the <strong>original due date (30 June / 1 July 2026)</strong>, NOT from 31 July! E.g. filing on 1 Aug = 32 days delay = 4× multiplier.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table 5: Rule 2(1)(c) Master Excluded Receipts */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-hidden">
              <h3 className="text-lg font-bold text-navy dark:text-white mb-2 flex items-center gap-2">
                <span>📑</span> Rule 2(1)(c) Master Registry: 18 Categories of Excluded Receipts
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                These transactions are statutorily excluded from the definition of &quot;deposit&quot;, yet <strong>MUST be reported in Form DPT-3 under Rule 16A</strong>. Auditor&apos;s certificate is NOT required for these 18 categories.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="px-4 py-3 font-semibold">#</th>
                      <th className="px-4 py-3 font-semibold">Sub-Clause</th>
                      <th className="px-4 py-3 font-semibold">Excluded Transaction Title</th>
                      <th className="px-4 py-3 font-semibold">Statutory Conditions & Compliance Rules</th>
                      <th className="px-4 py-3 font-semibold">Auditor Cert?</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr><td className="px-4 py-2.5 font-bold">1</td><td className="px-4 py-2.5 font-mono text-xs">2(1)(c)(i)</td><td className="px-4 py-2.5 font-medium">Government / Statutory Receipts</td><td className="px-4 py-2.5 text-xs text-slate-600 dark:text-slate-400">Received from Central/State Govt, local or statutory authorities.</td><td className="px-4 py-2.5 text-xs font-bold text-emerald-600">No</td></tr>
                    <tr><td className="px-4 py-2.5 font-bold">2</td><td className="px-4 py-2.5 font-mono text-xs">2(1)(c)(ii)</td><td className="px-4 py-2.5 font-medium">Foreign Governments / Banks</td><td className="px-4 py-2.5 text-xs text-slate-600 dark:text-slate-400">Foreign bodies, international banks, export credit agencies per FEMA.</td><td className="px-4 py-2.5 text-xs font-bold text-emerald-600">No</td></tr>
                    <tr><td className="px-4 py-2.5 font-bold">3</td><td className="px-4 py-2.5 font-mono text-xs">2(1)(c)(iii)</td><td className="px-4 py-2.5 font-medium">Bank & FI Borrowings</td><td className="px-4 py-2.5 text-xs text-slate-600 dark:text-slate-400">Loans/facilities from banks, SBI, RRBs, or notified Public FIs.</td><td className="px-4 py-2.5 text-xs font-bold text-emerald-600">No</td></tr>
                    <tr><td className="px-4 py-2.5 font-bold">4</td><td className="px-4 py-2.5 font-mono text-xs">2(1)(c)(vi)</td><td className="px-4 py-2.5 font-medium">Inter-Corporate Borrowings</td><td className="px-4 py-2.5 text-xs text-slate-600 dark:text-slate-400">Amounts received by a company from another company under Section 186.</td><td className="px-4 py-2.5 text-xs font-bold text-emerald-600">No</td></tr>
                    <tr><td className="px-4 py-2.5 font-bold">5</td><td className="px-4 py-2.5 font-mono text-xs">2(1)(c)(viii)</td><td className="px-4 py-2.5 font-medium">Director Loans</td><td className="px-4 py-2.5 text-xs text-slate-600 dark:text-slate-400">Mandatory written declaration that loan is out of own (non-borrowed) funds.</td><td className="px-4 py-2.5 text-xs font-bold text-emerald-600">No</td></tr>
                    <tr><td className="px-4 py-2.5 font-bold">6</td><td className="px-4 py-2.5 font-mono text-xs">2(1)(c)(viii) Pr</td><td className="px-4 py-2.5 font-medium">Relative of Director (Pvt Co)</td><td className="px-4 py-2.5 text-xs text-slate-600 dark:text-slate-400">Private companies only. Relative furnishes non-borrowed funds declaration.</td><td className="px-4 py-2.5 text-xs font-bold text-emerald-600">No</td></tr>
                    <tr><td className="px-4 py-2.5 font-bold">7</td><td className="px-4 py-2.5 font-mono text-xs">2(1)(c)(xviia)</td><td className="px-4 py-2.5 font-medium">Startup Convertible Notes</td><td className="px-4 py-2.5 text-xs text-slate-600 dark:text-slate-400">≥ ₹25L in single tranche by DPIIT startup; convertible/repayable up to 10 yrs.</td><td className="px-4 py-2.5 text-xs font-bold text-emerald-600">No</td></tr>
                    <tr><td className="px-4 py-2.5 font-bold">8</td><td className="px-4 py-2.5 font-mono text-xs">2(1)(c)(iv)</td><td className="px-4 py-2.5 font-medium">Commercial Paper (CP)</td><td className="px-4 py-2.5 text-xs text-slate-600 dark:text-slate-400">Issued pursuant to Reserve Bank of India money market guidelines.</td><td className="px-4 py-2.5 text-xs font-bold text-emerald-600">No</td></tr>
                    <tr><td className="px-4 py-2.5 font-bold">9</td><td className="px-4 py-2.5 font-mono text-xs">2(1)(c)(ixa)</td><td className="px-4 py-2.5 font-medium">Secured Bonds & Debentures</td><td className="px-4 py-2.5 text-xs text-slate-600 dark:text-slate-400">Secured by first charge on tangible assets of equal value; tenor ≤ 10 yrs.</td><td className="px-4 py-2.5 text-xs font-bold text-emerald-600">No</td></tr>
                    <tr><td className="px-4 py-2.5 font-bold">10</td><td className="px-4 py-2.5 font-mono text-xs">2(1)(c)(ixb)</td><td className="px-4 py-2.5 font-medium">Compulsorily Convertible Debentures</td><td className="px-4 py-2.5 text-xs text-slate-600 dark:text-slate-400">Unsecured debentures compulsorily convertible into equity within 10 yrs.</td><td className="px-4 py-2.5 text-xs font-bold text-emerald-600">No</td></tr>
                    <tr><td className="px-4 py-2.5 font-bold">11</td><td className="px-4 py-2.5 font-mono text-xs">2(1)(c)(vii)</td><td className="px-4 py-2.5 font-medium">Share Application Money</td><td className="px-4 py-2.5 text-xs text-slate-600 dark:text-slate-400">Allotment within 60 days, else refund in 15 days (becomes deposit on 75th day).</td><td className="px-4 py-2.5 text-xs font-bold text-emerald-600">No</td></tr>
                    <tr><td className="px-4 py-2.5 font-bold">12</td><td className="px-4 py-2.5 font-mono text-xs">2(1)(c)(xii)(a)</td><td className="px-4 py-2.5 font-medium">Customer Advances for Goods/Services</td><td className="px-4 py-2.5 text-xs text-slate-600 dark:text-slate-400">Must be appropriated against supply of goods/services within 365 days.</td><td className="px-4 py-2.5 text-xs font-bold text-emerald-600">No</td></tr>
                    <tr><td className="px-4 py-2.5 font-bold">13</td><td className="px-4 py-2.5 font-mono text-xs">2(1)(c)(xii)(b)</td><td className="px-4 py-2.5 font-medium">Security Deposits / Performance Guarantees</td><td className="px-4 py-2.5 text-xs text-slate-600 dark:text-slate-400">Security deposits received for performance of contracts for supply/services.</td><td className="px-4 py-2.5 text-xs font-bold text-emerald-600">No</td></tr>
                    <tr><td className="px-4 py-2.5 font-bold">14</td><td className="px-4 py-2.5 font-mono text-xs">2(1)(c)(xii)(d)</td><td className="px-4 py-2.5 font-medium">Advance for Immovable Assets</td><td className="px-4 py-2.5 text-xs text-slate-600 dark:text-slate-400">Advance against written agreement for consideration of immovable property.</td><td className="px-4 py-2.5 text-xs font-bold text-emerald-600">No</td></tr>
                    <tr><td className="px-4 py-2.5 font-bold">15</td><td className="px-4 py-2.5 font-mono text-xs">2(1)(c)(xiii)</td><td className="px-4 py-2.5 font-medium">Promoter Subordinated Loans</td><td className="px-4 py-2.5 text-xs text-slate-600 dark:text-slate-400">Brought pursuant to lending bank/FI stipulation until facility is repaid.</td><td className="px-4 py-2.5 text-xs font-bold text-emerald-600">No</td></tr>
                    <tr><td className="px-4 py-2.5 font-bold">16</td><td className="px-4 py-2.5 font-mono text-xs">2(1)(c)(xiv)</td><td className="px-4 py-2.5 font-medium">Nidhi Company Member Receipts</td><td className="px-4 py-2.5 text-xs text-slate-600 dark:text-slate-400">Accepted by declared Nidhi company under Section 406.</td><td className="px-4 py-2.5 text-xs font-bold text-emerald-600">No</td></tr>
                    <tr><td className="px-4 py-2.5 font-bold">17</td><td className="px-4 py-2.5 font-mono text-xs">2(1)(c)(x)</td><td className="px-4 py-2.5 font-medium">Employee Security Deposits</td><td className="px-4 py-2.5 text-xs text-slate-600 dark:text-slate-400">Non-interest-bearing deposit not exceeding annual salary under contract.</td><td className="px-4 py-2.5 text-xs font-bold text-emerald-600">No</td></tr>
                    <tr><td className="px-4 py-2.5 font-bold">18</td><td className="px-4 py-2.5 font-mono text-xs">2(1)(c)(xi)</td><td className="px-4 py-2.5 font-medium">Trust & Mutual Fund Receipts</td><td className="px-4 py-2.5 text-xs text-slate-600 dark:text-slate-400">Held in trust or subscriptions to SEBI-approved mutual funds / CIS.</td><td className="px-4 py-2.5 text-xs font-bold text-emerald-600">No</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* STATUTORY MASTER TABLES FOR FORM DIR-3 KYC (G.S.R. 943(E) & 300(E))  */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {form.slug === 'dir-3-kyc' && (
          <div className="space-y-8 mb-16">
            {/* Table 1: Triennial Schedule */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-hidden">
              <h3 className="text-lg font-bold text-navy dark:text-white mb-2 flex items-center gap-2">
                <span>📅</span> Master Schedule: Triennial Routine KYC Cycle (Rule 12A(1))
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Routine KYC is anchored strictly to the <strong>financial year of DIN allotment</strong> under G.S.R. 943(E). Directors who filed for FY 2025-26 have no routine filing due until 2028.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="px-4 py-3 font-semibold">DIN Allotment Period</th>
                      <th className="px-4 py-3 font-semibold">Compliance Block</th>
                      <th className="px-4 py-3 font-semibold">Filing Due in FY 2026-27?</th>
                      <th className="px-4 py-3 font-semibold">Next Routine Due Window</th>
                      <th className="px-4 py-3 font-semibold">Statutory Deadline</th>
                      <th className="px-4 py-3 font-semibold">On-Time Fee</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr className="bg-emerald-50/40 dark:bg-emerald-950/10">
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">Allotted on or before 31 March 2025</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">FY 2025-26 to FY 2027-28</td>
                      <td className="px-4 py-3 font-bold text-emerald-600">NO (Compliant)</td>
                      <td className="px-4 py-3 font-medium text-blue-600 dark:text-blue-400">April – 30 June 2028</td>
                      <td className="px-4 py-3 font-mono text-xs">30 June 2028</td>
                      <td className="px-4 py-3 font-bold text-emerald-600">₹0 (NIL)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">Allotted during FY 2025-26 (1 Apr 25 – 31 Mar 26)</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">FY 2026-27 to FY 2028-29</td>
                      <td className="px-4 py-3 font-bold text-emerald-600">NO (Compliant)</td>
                      <td className="px-4 py-3 font-medium text-blue-600 dark:text-blue-400">April – 30 June 2029</td>
                      <td className="px-4 py-3 font-mono text-xs">30 June 2029</td>
                      <td className="px-4 py-3 font-bold text-emerald-600">₹0 (NIL)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">Allotted during FY 2026-27 (Current FY)</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">FY 2027-28 to FY 2029-30</td>
                      <td className="px-4 py-3 font-bold text-emerald-600">NO (Compliant)</td>
                      <td className="px-4 py-3 font-medium text-blue-600 dark:text-blue-400">April – 30 June 2030</td>
                      <td className="px-4 py-3 font-mono text-xs">30 June 2030</td>
                      <td className="px-4 py-3 font-bold text-emerald-600">₹0 (NIL)</td>
                    </tr>
                    <tr className="bg-rose-50/40 dark:bg-rose-950/10">
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">Prior Default (DIN Deactivated)</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Pre-2026 Annual Defaults</td>
                      <td className="px-4 py-3 font-bold text-rose-600">YES (Immediate)</td>
                      <td className="px-4 py-3 font-medium text-rose-600">Immediate STP Filing</td>
                      <td className="px-4 py-3 font-mono text-xs">Overdue</td>
                      <td className="px-4 py-3 font-bold text-rose-600">₹5,000</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table 2: Fee Schedule under G.S.R. 300(E) */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-hidden">
              <h3 className="text-lg font-bold text-navy dark:text-white mb-2 flex items-center gap-2">
                <span>💰</span> Statutory Fee Schedule: Form DIR-3 KYC Web (G.S.R. 300(E), Item VII)
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Substituted by G.S.R. 300(E) effective 21 April 2026. Fees are flat and do NOT compound per day.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Filing Scenario</th>
                      <th className="px-4 py-3 font-semibold">Statutory Authority</th>
                      <th className="px-4 py-3 font-semibold">Trigger / Compliance Window</th>
                      <th className="px-4 py-3 font-semibold">Government Fee</th>
                      <th className="px-4 py-3 font-semibold">Delay / Compounding Impact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr>
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">Routine Triennial KYC</td>
                      <td className="px-4 py-3 font-mono text-xs">Rule 12A(1)</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">April 1 to June 30 of due year</td>
                      <td className="px-4 py-3 font-bold text-emerald-600">₹0 (NIL)</td>
                      <td className="px-4 py-3 text-xs text-slate-500">Zero additional fee if filed within window.</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">Event-Based Update</td>
                      <td className="px-4 py-3 font-mono text-xs">Rule 12A(2)</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Within 30 days of contact/address change</td>
                      <td className="px-4 py-3 font-bold text-blue-600">₹500 per filing</td>
                      <td className="px-4 py-3 text-xs text-slate-500">Flat fee. Does NOT reset or extend 3-year clock.</td>
                    </tr>
                    <tr className="bg-rose-50/40 dark:bg-rose-950/10">
                      <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">Delayed Filing / DIN Reactivation</td>
                      <td className="px-4 py-3 font-mono text-xs">Item VII, Annexure</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Filed after 30 June or for deactivated DIN</td>
                      <td className="px-4 py-3 font-bold text-rose-600">₹5,000 flat</td>
                      <td className="px-4 py-3 text-xs text-slate-500">Non-compounding flat fee. STP auto-approval.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table 3: Old vs New Regime Comparison */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-hidden">
              <h3 className="text-lg font-bold text-navy dark:text-white mb-2 flex items-center gap-2">
                <span>⚖️</span> Old Annual Regime vs New Triennial Regime Comparison
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Comparison of the pre-31 March 2026 framework with the new G.S.R. 943(E) and G.S.R. 300(E) regulations.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Regulatory Parameter</th>
                      <th className="px-4 py-3 font-semibold">Old Regime (Pre-31 March 2026)</th>
                      <th className="px-4 py-3 font-semibold text-blue-600 dark:text-blue-400">New Triennial Regime (Post-31 March 2026)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr>
                      <td className="px-4 py-2.5 font-semibold text-slate-900 dark:text-white">Filing Frequency</td>
                      <td className="px-4 py-2.5 text-slate-500">Every Financial Year (Annual)</td>
                      <td className="px-4 py-2.5 font-bold text-emerald-600">Once every 3 consecutive Financial Years</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-semibold text-slate-900 dark:text-white">Routine Due Date</td>
                      <td className="px-4 py-2.5 text-slate-500">30th September annually</td>
                      <td className="px-4 py-2.5 font-bold text-blue-600">30th June of the year following third FY</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-semibold text-slate-900 dark:text-white">Form Structure</td>
                      <td className="px-4 py-2.5 text-slate-500">Two forms: DIR-3 KYC (e-form) &amp; DIR-3 KYC-Web</td>
                      <td className="px-4 py-2.5 font-bold text-slate-900 dark:text-white">Single Form: DIR-3 KYC Web (Unified)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-semibold text-slate-900 dark:text-white">Altered Particulars</td>
                      <td className="px-4 py-2.5 text-slate-500">Updated in annual e-form cycle</td>
                      <td className="px-4 py-2.5 font-bold text-amber-600">Mandatory filing within 30 days (Rule 12A(2))</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-semibold text-slate-900 dark:text-white">Effect of Update on Clock</td>
                      <td className="px-4 py-2.5 text-slate-500">N/A (Annual)</td>
                      <td className="px-4 py-2.5 font-bold text-rose-600">Does NOT reset the 3-year triennial cycle</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-semibold text-slate-900 dark:text-white">On-Time Filing Fee</td>
                      <td className="px-4 py-2.5 text-slate-500">₹0 (NIL)</td>
                      <td className="px-4 py-2.5 font-bold text-emerald-600">₹0 (NIL)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-semibold text-slate-900 dark:text-white">Change Update Fee</td>
                      <td className="px-4 py-2.5 text-slate-500">Standard filing fee</td>
                      <td className="px-4 py-2.5 font-bold text-blue-600">₹500 per filing (Item VII)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-semibold text-slate-900 dark:text-white">Late / Reactivation Fee</td>
                      <td className="px-4 py-2.5 text-slate-500">₹5,000 flat fee</td>
                      <td className="px-4 py-2.5 font-bold text-rose-600">₹5,000 flat fee (Item VII)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-semibold text-slate-900 dark:text-white">Pending Draft Forms</td>
                      <td className="px-4 py-2.5 text-slate-500">Could be resumed</td>
                      <td className="px-4 py-2.5 font-bold text-rose-600">Auto-cancelled as on 31 March 2026</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table 4: DIN Deactivation vs Section 164 Disqualification */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-hidden">
              <h3 className="text-lg font-bold text-navy dark:text-white mb-2 flex items-center gap-2">
                <span>🛡️</span> DIN Deactivation vs Director Disqualification (Section 164)
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Understanding the legal differences between a procedural KYC deactivation and a substantive statutory disqualification.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Aspect</th>
                      <th className="px-4 py-3 font-semibold text-amber-600">DIN Deactivation (KYC Default)</th>
                      <th className="px-4 py-3 font-semibold text-rose-600">Director Disqualification (Section 164(2))</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr>
                      <td className="px-4 py-2.5 font-semibold text-slate-900 dark:text-white">Trigger / Cause</td>
                      <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">Non-filing of Form DIR-3 KYC Web by 30 June.</td>
                      <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">Company failure to file Financial Statements or Annual Returns for 3 continuous years.</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-semibold text-slate-900 dark:text-white">Direct Impact</td>
                      <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">Cannot sign MCA forms; cannot be appointed to new boards.</td>
                      <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">Cannot act as director in ANY company for 5 years; must vacate all board seats (Sec 167).</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-semibold text-slate-900 dark:text-white">Remedy / Cure</td>
                      <td className="px-4 py-2.5 font-bold text-emerald-600">Pay ₹5,000 fee on MCA V3 &rarr; Auto-reactivated via STP.</td>
                      <td className="px-4 py-2.5 font-bold text-rose-600">Cannot be cured by paying a fee; requires High Court writ petition or NCLT compounding.</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-semibold text-slate-900 dark:text-white">MCA Portal Status</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-amber-600">&quot;Deactivated due to non-filing of DIR-3 KYC&quot;</td>
                      <td className="px-4 py-2.5 font-mono text-xs text-rose-600">&quot;Disqualified under Section 164(2)&quot;</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-semibold text-slate-900 dark:text-white">The Cascading Risk</td>
                      <td className="px-4 py-2.5 text-xs text-slate-500" colSpan={2}>
                        <strong>Danger:</strong> A deactivated DIN blocks the company from filing Form AOC-4/MGT-7. If that blockage continues for 3 continuous financial years, it directly causes <strong>Section 164(2) Disqualification</strong> for ALL directors on the board!
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table 5: Step-by-Step Filing Checklist */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-hidden">
              <h3 className="text-lg font-bold text-navy dark:text-white mb-2 flex items-center gap-2">
                <span>📝</span> Step-by-Step Filing Checklist: Form DIR-3 KYC Web on MCA21 V3
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Follow this 6-step compliance protocol for seamless Straight-Through-Processing (STP) auto-approval.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Step #</th>
                      <th className="px-4 py-3 font-semibold">Stage on MCA V3</th>
                      <th className="px-4 py-3 font-semibold">Required Action &amp; Prerequisites</th>
                      <th className="px-4 py-3 font-semibold">Statutory Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr>
                      <td className="px-4 py-2.5 font-bold">Step 1</td>
                      <td className="px-4 py-2.5 font-semibold text-slate-900 dark:text-white">Portal Authentication</td>
                      <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">Log into MCA21 V3 portal with Registered / Business User credentials.</td>
                      <td className="px-4 py-2.5 text-xs text-slate-500">Access MCA Services &rarr; DIR-3 KYC Web.</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-bold">Step 2</td>
                      <td className="px-4 py-2.5 font-semibold text-slate-900 dark:text-white">DIN Data Retrieval</td>
                      <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">Enter the 8-digit DIN. System auto-populates name, father&apos;s name, and DOB.</td>
                      <td className="px-4 py-2.5 text-xs text-slate-500">Cross-verify against PAN records.</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-bold">Step 3</td>
                      <td className="px-4 py-2.5 font-semibold text-slate-900 dark:text-white">Dual OTP Verification</td>
                      <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">Generate OTPs to active Indian Mobile number and personal Email ID.</td>
                      <td className="px-4 py-2.5 text-xs text-slate-500">Both OTPs must be submitted within validity window.</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-bold">Step 4</td>
                      <td className="px-4 py-2.5 font-semibold text-slate-900 dark:text-white">Attachments &amp; Address Proof</td>
                      <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">Upload self-attested PAN card and residential address proof (Aadhaar/utility bill &le; 2 mos).</td>
                      <td className="px-4 py-2.5 text-xs text-slate-500">Mandatory for address updates or routine verification.</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-bold">Step 5</td>
                      <td className="px-4 py-2.5 font-semibold text-slate-900 dark:text-white">Digital Signatures</td>
                      <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">Attach Class 3 DSC of DIN holder + DSC of certifying CA, CS, or CMA in practice.</td>
                      <td className="px-4 py-2.5 text-xs text-slate-500">Sections 448 &amp; 449 liability applies.</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-bold">Step 6</td>
                      <td className="px-4 py-2.5 font-semibold text-slate-900 dark:text-white">Payment &amp; STP Auto-Approval</td>
                      <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">Pay challan (₹0 / ₹500 / ₹5,000) via Bharatkosh online gateway.</td>
                      <td className="px-4 py-2.5 text-xs font-bold text-emerald-600">Instant STP approval. DIN marked Active immediately.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* INC-20A Dedicated Statutory Master Tables */}
        {form.slug === 'inc-20a' && (
          <div className="space-y-12 mb-16">
            {/* Table 1: Table A Base Normal Fees */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-hidden">
              <h3 className="text-lg font-bold text-navy dark:text-white mb-2 flex items-center gap-2">
                <span>📋</span> Table A: Normal Base Filing Fee Schedule (Item 5)
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Statutory base fee payable upon filing Form INC-20A on MCA21 V3 portal based on authorized nominal share capital under the Companies (Registration Offices and Fees) Rules, 2014.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Nominal / Authorized Capital Bracket</th>
                      <th className="px-4 py-3 font-semibold">Normal Base Fee</th>
                      <th className="px-4 py-3 font-semibold">Statutory Reference &amp; Entity Coverage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr><td className="px-4 py-3 font-medium">Less than ₹1,00,000</td><td className="px-4 py-3 font-bold text-rose-600">₹200</td><td className="px-4 py-3 text-slate-500">Table A, Item 5, Fees Rules 2014</td></tr>
                    <tr><td className="px-4 py-3 font-medium">₹1,00,000 to ₹4,99,999</td><td className="px-4 py-3 font-bold text-rose-600">₹300</td><td className="px-4 py-3 text-slate-500">Table A, Item 5, Fees Rules 2014 (Standard OPC bracket)</td></tr>
                    <tr><td className="px-4 py-3 font-medium">₹5,00,000 to ₹24,99,999</td><td className="px-4 py-3 font-bold text-rose-600">₹400</td><td className="px-4 py-3 text-slate-500">Table A, Item 5, Fees Rules 2014 (Standard ₹10L Pvt Ltd)</td></tr>
                    <tr><td className="px-4 py-3 font-medium">₹25,00,000 to ₹99,99,999</td><td className="px-4 py-3 font-bold text-rose-600">₹500</td><td className="px-4 py-3 text-slate-500">Table A, Item 5, Fees Rules 2014</td></tr>
                    <tr><td className="px-4 py-3 font-medium">₹1,00,00,000 or more (≥ ₹1 Crore)</td><td className="px-4 py-3 font-bold text-rose-600">₹600</td><td className="px-4 py-3 text-slate-500">Table A, Item 5, Fees Rules 2014 (Maximum base tier)</td></tr>
                    <tr className="bg-slate-50/50 dark:bg-slate-800/30"><td className="px-4 py-3 font-medium italic">Company not having share capital</td><td className="px-4 py-3 font-bold text-emerald-600">Exempt from Sec 10A</td><td className="px-4 py-3 text-slate-500">Section 10A(1)(a) applies strictly to companies having share capital</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table 2: Table B Multipliers */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-hidden">
              <h3 className="text-lg font-bold text-navy dark:text-white mb-2 flex items-center gap-2">
                <span>⏱️</span> Table B: Additional Late Fee Multiplier Schedule (2× to 12×)
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Unlike AOC-4 and MGT-7 (which charge flat ₹100/day), Form INC-20A late filing fees on MCA V3 are calculated as multipliers of the Table A normal fee under Item B of the Fees Rules.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Period of Delay Beyond 180 Days</th>
                      <th className="px-4 py-3 font-semibold">Table B Multiplier</th>
                      <th className="px-4 py-3 font-semibold">Fee on ₹10L Capital (Base ₹400)</th>
                      <th className="px-4 py-3 font-semibold">Fee on ₹1Cr Capital (Base ₹600)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr><td className="px-4 py-3 font-medium">Up to 30 Days Delay (Days 181 to 210)</td><td className="px-4 py-3 font-bold text-amber-600">2× Normal Fee</td><td className="px-4 py-3">₹400 + ₹800 = <strong className="text-slate-900 dark:text-white">₹1,200</strong></td><td className="px-4 py-3">₹600 + ₹1,200 = <strong className="text-slate-900 dark:text-white">₹1,800</strong></td></tr>
                    <tr><td className="px-4 py-3 font-medium">31 to 60 Days Delay (Days 211 to 240)</td><td className="px-4 py-3 font-bold text-amber-600">4× Normal Fee</td><td className="px-4 py-3">₹400 + ₹1,600 = <strong className="text-slate-900 dark:text-white">₹2,000</strong></td><td className="px-4 py-3">₹600 + ₹2,400 = <strong className="text-slate-900 dark:text-white">₹3,000</strong></td></tr>
                    <tr><td className="px-4 py-3 font-medium">61 to 90 Days Delay (Days 241 to 270)</td><td className="px-4 py-3 font-bold text-amber-600">6× Normal Fee</td><td className="px-4 py-3">₹400 + ₹2,400 = <strong className="text-slate-900 dark:text-white">₹2,800</strong></td><td className="px-4 py-3">₹600 + ₹3,600 = <strong className="text-slate-900 dark:text-white">₹4,200</strong></td></tr>
                    <tr><td className="px-4 py-3 font-medium">91 to 180 Days Delay (Days 271 to 360)</td><td className="px-4 py-3 font-bold text-rose-600">10× Normal Fee</td><td className="px-4 py-3">₹400 + ₹4,000 = <strong className="text-slate-900 dark:text-white">₹4,400</strong></td><td className="px-4 py-3">₹600 + ₹6,000 = <strong className="text-slate-900 dark:text-white">₹6,600</strong></td></tr>
                    <tr className="bg-rose-50/40 dark:bg-rose-950/20"><td className="px-4 py-3 font-medium text-rose-700 dark:text-rose-400">Beyond 180 Days Delay (Day 361 onwards)</td><td className="px-4 py-3 font-bold text-rose-600">12× Normal Fee</td><td className="px-4 py-3">₹400 + ₹4,800 = <strong className="text-slate-900 dark:text-white">₹5,200</strong></td><td className="px-4 py-3">₹600 + ₹7,200 = <strong className="text-slate-900 dark:text-white">₹7,800</strong></td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table 3: Section 10A(2) Adjudication Penalties vs Section 446B Relief */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-hidden">
              <h3 className="text-lg font-bold text-navy dark:text-white mb-2 flex items-center gap-2">
                <span>⚖️</span> Section 10A(2) Statutory Penalties vs Section 446B Relief Comparison
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Adjudication penalties are distinct from MCA portal e-Challan fees. Directors must remit penalties from personal funds, NOT from corporate bank accounts.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Statutory Subject / Offender</th>
                      <th className="px-4 py-3 font-semibold">Standard Penalty (Section 10A(2))</th>
                      <th className="px-4 py-3 font-semibold text-emerald-600">Section 446B Reduced Penalty (Small Co / Startup)</th>
                      <th className="px-4 py-3 font-semibold">Payment Source &amp; Disclosure</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr>
                      <td className="px-4 py-3 font-medium">Company Liability</td>
                      <td className="px-4 py-3 font-bold text-rose-600">₹50,000 flat fine</td>
                      <td className="px-4 py-3 font-bold text-emerald-600">₹25,000 (50% relief)</td>
                      <td className="px-4 py-3 text-slate-500">Payable from company funds; board disclosure required</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">Each Officer in Default (Director)</td>
                      <td className="px-4 py-3 font-bold text-rose-600">₹1,000/day (max ₹1,00,000 each)</td>
                      <td className="px-4 py-3 font-bold text-emerald-600">₹500/day (max ₹50,000 each)</td>
                      <td className="px-4 py-3 text-rose-600 font-semibold">PERSONAL FUNDS ONLY (cannot use company funds)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">Total for 2 Directors (42 Days Delay)</td>
                      <td className="px-4 py-3 font-bold">₹50k + ₹84k = ₹1,34,000</td>
                      <td className="px-4 py-3 font-bold text-emerald-600">₹25k + ₹42k = ₹67,000</td>
                      <td className="px-4 py-3 text-slate-500">Benchmark order: ROC Pune (Dec 2025)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">Total for 3 Directors (100+ Days Delay)</td>
                      <td className="px-4 py-3 font-bold">₹50k + ₹3,00,000 = ₹3,50,000</td>
                      <td className="px-4 py-3 font-bold text-emerald-600">₹25k + ₹1,50,000 = ₹1,75,000</td>
                      <td className="px-4 py-3 text-slate-500">Benchmark order: ROC Bangalore (Jun 2026)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table 4: Operational Freeze, Strike-Off & Escalation Timeline */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-hidden">
              <h3 className="text-lg font-bold text-navy dark:text-white mb-2 flex items-center gap-2">
                <span>🛡️</span> Operational Freeze, Strike-Off Risk &amp; Escalation Timeline
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Statutory consequences under Section 10A(1), Section 10A(3), Section 248(1)(c), and Section 454(8).
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Timeline Phase</th>
                      <th className="px-4 py-3 font-semibold">Statutory Status</th>
                      <th className="px-4 py-3 font-semibold">Operational &amp; Borrowing Powers</th>
                      <th className="px-4 py-3 font-semibold">Enforcement Action Risk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr>
                      <td className="px-4 py-3 font-medium">Days 0 to 180 from CoI</td>
                      <td className="px-4 py-3 font-bold text-emerald-600">Statutory Window</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Cannot commence business until INC-20A filed</td>
                      <td className="px-4 py-3 text-slate-500">Fully compliant; normal filing fees apply</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">Day 181 to Day 360</td>
                      <td className="px-4 py-3 font-bold text-amber-600">Statutory Default</td>
                      <td className="px-4 py-3 text-rose-600 font-semibold">OPERATIONAL FREEZE: Contracts voidable; loans unauthorized</td>
                      <td className="px-4 py-3 text-slate-500">Table B multipliers (2x to 10x) + Section 10A(2) per-day fine active</td>
                    </tr>
                    <tr className="bg-rose-50/40 dark:bg-rose-950/20">
                      <td className="px-4 py-3 font-medium text-rose-700 dark:text-rose-400">Day 361+ (&gt; 180 Days Delay)</td>
                      <td className="px-4 py-3 font-bold text-rose-600">Strike-Off Trigger</td>
                      <td className="px-4 py-3 text-rose-600 font-semibold">Severe default; corporate capacity frozen</td>
                      <td className="px-4 py-3 text-rose-600 font-bold">ROC empowered to initiate strike-off &amp; dissolve entity under Section 248(1)(c)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">Day 90 Post Adjudication Order</td>
                      <td className="px-4 py-3 font-bold text-rose-700 dark:text-rose-300">Section 454(8) Escalation</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Penalties unpaid after 90 days of order</td>
                      <td className="px-4 py-3 text-rose-700 dark:text-rose-300 font-bold">Additional fine ₹25k–₹5L on company; up to 6 months imprisonment for directors</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* DIR-12 Dedicated Statutory Master Tables */}
        {form.slug === 'dir-12' && (
          <div className="space-y-12 mb-16">
            {/* Table 1: Mandatory Attachments Checklist */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-hidden">
              <h3 className="text-lg font-bold text-navy dark:text-white mb-2 flex items-center gap-2">
                <span>📋</span> Form DIR-12 Mandatory Attachments Checklist by Corporate Event
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Under Rule 17 of the Companies (Appointment and Qualification of Directors) Rules, 2014, incomplete attachments result in form rejection on MCA V3.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Corporate Event</th>
                      <th className="px-4 py-3 font-semibold">Statutory Authority</th>
                      <th className="px-4 py-3 font-semibold">Mandatory Attachments Required on MCA V3</th>
                      <th className="px-4 py-3 font-semibold">Signatory Requirement</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr>
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">Appointment of New / Additional Director</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Section 161(1) / Section 152</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                        1. <strong>Form DIR-2:</strong> Consent to act as Director<br />
                        2. <strong>Form DIR-8:</strong> Intimation of non-disqualification (Sec 164(2))<br />
                        3. <strong>Board/EGM Resolution:</strong> Certified true copy<br />
                        4. <strong>ID &amp; Address Proof:</strong> PAN card and residential proof
                      </td>
                      <td className="px-4 py-3 text-blue-600 font-medium">Existing Director + Appointee DSC</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">Resignation of Director</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Section 168(1)</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                        1. <strong>Formal Resignation Notice:</strong> Signed letter specifying effective date<br />
                        2. <strong>Board Resolution / Intimation:</strong> Acknowledging receipt of resignation<br />
                        3. <strong>Proof of Delivery:</strong> Dispatch receipt / email acknowledgment
                      </td>
                      <td className="px-4 py-3 text-blue-600 font-medium">Continuing Director DSC</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">Regularization of Additional Director at AGM</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Section 152(2) &amp; Section 161(1)</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                        1. <strong>AGM Ordinary Resolution:</strong> Passed by shareholders<br />
                        2. <strong>Form DIR-2 &amp; DIR-8:</strong> Fresh consent and declaration<br />
                        3. <strong>Scrutinizer Report:</strong> For voting verification (if applicable)
                      </td>
                      <td className="px-4 py-3 text-blue-600 font-medium">Authorized Director DSC</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">Appointment or Cessation of KMP (MD, CEO, CFO, CS)</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Section 203</td>
                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                        1. <strong>Board Resolution:</strong> Approving appointment terms / cessation<br />
                        2. <strong>Consent Letter:</strong> From appointee KMP<br />
                        3. <strong>Membership Proof:</strong> For Company Secretary (ICSI Certificate)
                      </td>
                      <td className="px-4 py-3 text-blue-600 font-medium">Director / MD DSC</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table 2: Form DIR-12 vs Form DIR-11 Statutory Comparison */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-hidden">
              <h3 className="text-lg font-bold text-navy dark:text-white mb-2 flex items-center gap-2">
                <span>🛡️</span> Form DIR-12 vs Form DIR-11: Statutory Differences for Resigning Directors
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Critical distinction between corporate filing responsibility (DIR-12) and director personal protective filing (DIR-11).
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Comparison Aspect</th>
                      <th className="px-4 py-3 font-semibold text-blue-600">Form DIR-12 (Company Filing)</th>
                      <th className="px-4 py-3 font-semibold text-emerald-600">Form DIR-11 (Director Personal Return)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr>
                      <td className="px-4 py-3 font-medium">Statutory Mandate</td>
                      <td className="px-4 py-3 font-bold text-rose-600">MANDATORY on the Company (Sec 168(1) &amp; 170(2))</td>
                      <td className="px-4 py-3 font-bold text-emerald-600">OPTIONAL on the Resigning Director (Rule 16)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">Statutory Due Date</td>
                      <td className="px-4 py-3 font-semibold">Strictly within 30 days of resignation/appointment</td>
                      <td className="px-4 py-3 font-semibold">Within 30 days of resignation notice to company</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">Filing Authority &amp; Signature</td>
                      <td className="px-4 py-3">Authorized continuing Director / CS + Professional Certification</td>
                      <td className="px-4 py-3">Resigning Director personally using their own Class 3 DSC</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">MCA V3 Normal Base Fee</td>
                      <td className="px-4 py-3 font-medium">₹200 to ₹600 (based on authorized capital bracket)</td>
                      <td className="px-4 py-3 font-medium">Flat ₹300 individual e-Challan fee</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">If Company Fails to File</td>
                      <td className="px-4 py-3 text-rose-600">Company master data frozen; Table B late multipliers (2× to 12×)</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Protects director against post-resignation liabilities and bank claims</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table 3: Table B Late Multiplier Matrix & Section 172 Exposure */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-hidden">
              <h3 className="text-lg font-bold text-navy dark:text-white mb-2 flex items-center gap-2">
                <span>⏱️</span> Form DIR-12 Late Fee Multipliers &amp; Section 172 Residuary Penalties
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Late filing fees escalate under Table B of the Fees Rules. Delays exceeding 270 days require prior Condonation of Delay from the Regional Director.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Delay Duration Beyond 30 Days</th>
                      <th className="px-4 py-3 font-semibold">Table B Multiplier</th>
                      <th className="px-4 py-3 font-semibold">Sample Fee (₹10L Capital)</th>
                      <th className="px-4 py-3 font-semibold">Civil Adjudication Exposure (Sec 172)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr>
                      <td className="px-4 py-3 font-medium">1 to 30 Days Delay</td>
                      <td className="px-4 py-3 font-bold text-amber-600">2× Normal Fee</td>
                      <td className="px-4 py-3">₹400 + ₹800 = <strong className="text-slate-900 dark:text-white">₹1,200</strong></td>
                      <td className="px-4 py-3 text-slate-500">Low adjudication risk if filed before ROC notice</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">31 to 60 Days Delay</td>
                      <td className="px-4 py-3 font-bold text-amber-600">4× Normal Fee</td>
                      <td className="px-4 py-3">₹400 + ₹1,600 = <strong className="text-slate-900 dark:text-white">₹2,000</strong></td>
                      <td className="px-4 py-3 text-slate-500">Section 172 inquiry risk: ₹50k base fine</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">61 to 90 Days Delay</td>
                      <td className="px-4 py-3 font-bold text-amber-600">6× Normal Fee</td>
                      <td className="px-4 py-3">₹400 + ₹2,400 = <strong className="text-slate-900 dark:text-white">₹2,800</strong></td>
                      <td className="px-4 py-3 text-amber-600 font-semibold">Continuing fine: ₹50,000 + ₹500/day</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">91 to 180 Days Delay</td>
                      <td className="px-4 py-3 font-bold text-rose-600">10× Normal Fee</td>
                      <td className="px-4 py-3">₹400 + ₹4,000 = <strong className="text-slate-900 dark:text-white">₹4,400</strong></td>
                      <td className="px-4 py-3 text-rose-600 font-semibold">ROC Show Cause Notice issued for board defect</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">181 to 270 Days Delay</td>
                      <td className="px-4 py-3 font-bold text-rose-600">12× Normal Fee</td>
                      <td className="px-4 py-3">₹400 + ₹4,800 = <strong className="text-slate-900 dark:text-white">₹5,200</strong></td>
                      <td className="px-4 py-3 text-rose-600 font-bold">Max fee bracket; board resolutions voidable</td>
                    </tr>
                    <tr className="bg-rose-50/40 dark:bg-rose-950/20">
                      <td className="px-4 py-3 font-medium text-rose-700 dark:text-rose-400">Beyond 270 Days Delay</td>
                      <td className="px-4 py-3 font-bold text-rose-700 dark:text-rose-300">PORTAL BLOCKED</td>
                      <td className="px-4 py-3 font-bold text-rose-700 dark:text-rose-300">Section 403 Hard Stop</td>
                      <td className="px-4 py-3 text-rose-700 dark:text-rose-300 font-bold">Must file Form CG-1 for Condonation of Delay to Regional Director</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* MSME-1 Dedicated Statutory Master Tables */}
        {form.slug === 'msme-1' && (
          <div className="space-y-12 mb-16">
            {/* Table 1: Section 405(4) Adjudication Penalty Matrix */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-hidden">
              <h3 className="text-lg font-bold text-navy dark:text-white mb-2 flex items-center gap-2">
                <span>⚖️</span> Form MSME-1 Statutory Penalty Schedule under Section 405(4)
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Civil penalties adjudicated under Section 454 of the Companies Act, 2013 for failure to furnish information about delayed MSME payments.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Delay Duration</th>
                      <th className="px-4 py-3 font-semibold">Company Liability</th>
                      <th className="px-4 py-3 font-semibold">Per Officer in Default</th>
                      <th className="px-4 py-3 font-semibold">Total (Company + 2 Directors)</th>
                      <th className="px-4 py-3 font-semibold">Statutory Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr>
                      <td className="px-4 py-3 font-medium">On-Time (By 31 Oct / 30 Apr)</td>
                      <td className="px-4 py-3 font-bold text-emerald-600">₹0</td>
                      <td className="px-4 py-3 font-bold text-emerald-600">₹0</td>
                      <td className="px-4 py-3 font-bold text-emerald-600">₹0</td>
                      <td className="px-4 py-3 text-emerald-600 font-semibold">Fully Compliant</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">30 Days Delay</td>
                      <td className="px-4 py-3">₹20k + (30 × ₹1k) = <strong className="text-slate-900 dark:text-white">₹50,000</strong></td>
                      <td className="px-4 py-3">₹50,000 each</td>
                      <td className="px-4 py-3 font-bold text-amber-600">₹1,50,000</td>
                      <td className="px-4 py-3 text-slate-500">Initial Default Notice</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">60 Days Delay</td>
                      <td className="px-4 py-3">₹20k + (60 × ₹1k) = <strong className="text-slate-900 dark:text-white">₹80,000</strong></td>
                      <td className="px-4 py-3">₹80,000 each</td>
                      <td className="px-4 py-3 font-bold text-amber-600">₹2,40,000</td>
                      <td className="px-4 py-3 text-amber-600 font-semibold">ROC Inquiry Triggered</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">90 Days Delay</td>
                      <td className="px-4 py-3">₹20k + (90 × ₹1k) = <strong className="text-slate-900 dark:text-white">₹1,10,000</strong></td>
                      <td className="px-4 py-3">₹1,10,000 each</td>
                      <td className="px-4 py-3 font-bold text-rose-600">₹3,30,000</td>
                      <td className="px-4 py-3 text-rose-600 font-semibold">Adjudication Hearing Notice</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">200 Days Delay</td>
                      <td className="px-4 py-3">₹20k + (200 × ₹1k) = <strong className="text-slate-900 dark:text-white">₹2,20,000</strong></td>
                      <td className="px-4 py-3">₹2,20,000 each</td>
                      <td className="px-4 py-3 font-bold text-rose-600">₹6,60,000</td>
                      <td className="px-4 py-3 text-rose-600 font-bold">Severe Corporate Default</td>
                    </tr>
                    <tr className="bg-rose-50/40 dark:bg-rose-950/20">
                      <td className="px-4 py-3 font-medium text-rose-700 dark:text-rose-400">280+ Days Delay (Cap Hit)</td>
                      <td className="px-4 py-3 font-bold text-rose-600">₹3,00,000 (Maximum Cap)</td>
                      <td className="px-4 py-3 font-bold text-rose-600">₹3,00,000 each (Cap)</td>
                      <td className="px-4 py-3 font-bold text-rose-600">₹9,00,000</td>
                      <td className="px-4 py-3 text-rose-600 font-bold">Benchmark: Natrinai Ventures Ltd Order</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table 2: The V2 vs V3 Disclosure Trap */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-hidden">
              <h3 className="text-lg font-bold text-navy dark:text-white mb-2 flex items-center gap-2">
                <span>🔄</span> The MCA V3 Disclosure Architecture: Why Clearing Dues Early Still Requires Filing
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Understanding the transition from old V2 logic to the expanded MCA V3 four-category reporting structure.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Compliance Feature</th>
                      <th className="px-4 py-3 font-semibold text-slate-500">Old Portal Logic (MCA V2)</th>
                      <th className="px-4 py-3 font-semibold text-blue-600">Current Portal Logic (MCA V3)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr>
                      <td className="px-4 py-3 font-medium">Primary Filing Trigger</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Outstanding dues &gt; 45 days at the END of the half-year only</td>
                      <td className="px-4 py-3 font-bold text-rose-600">ANY payment &gt; 45 days DURING the half-year, even if balance is ₹0 at period end</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">Paid Late but Settled Before Period End</td>
                      <td className="px-4 py-3 font-semibold text-emerald-600">No filing required (zero outstanding at period end)</td>
                      <td className="px-4 py-3 font-bold text-rose-600">MANDATORY FILING REQUIRED — the delayed transaction itself triggers reporting</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">Scope of Transaction Reporting</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Only outstanding balances at 30 Sep / 31 Mar</td>
                      <td className="px-4 py-3 font-medium">ALL transactions with the triggered supplier (on-time payments, late payments, outstanding)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">Transaction Categories</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">2 categories reported</td>
                      <td className="px-4 py-3 font-bold text-blue-600">4 distinct categories reported (Paid on time, Paid late, Overdue, Accrued)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">Professional Certification</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Not required</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Not required (signed digitally by Director DSC, STP auto-approved)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table 3: The Triple Compliance Penalty */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-hidden">
              <h3 className="text-lg font-bold text-navy dark:text-white mb-2 flex items-center gap-2">
                <span>⚡</span> The Triple Penalty for a Single Delayed MSME Invoice
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                A single delayed invoice to a Micro or Small supplier triggers three cumulative legal consequences across corporate, commercial, and tax laws.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Compliance Layer</th>
                      <th className="px-4 py-3 font-semibold">Governing Statute</th>
                      <th className="px-4 py-3 font-semibold">Penalty Mechanism &amp; Formula</th>
                      <th className="px-4 py-3 font-semibold">Financial Impact on Buyer</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr>
                      <td className="px-4 py-3 font-bold text-blue-600">Layer 1: ROC Reporting</td>
                      <td className="px-4 py-3 font-medium">Section 405(4), Companies Act 2013</td>
                      <td className="px-4 py-3">₹20,000 base + ₹1,000/day continuing default (max ₹3,00,000 each)</td>
                      <td className="px-4 py-3 font-semibold text-rose-600">Up to ₹9 Lakhs for company + 2 directors</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-bold text-amber-600">Layer 2: Commercial Penal Interest</td>
                      <td className="px-4 py-3 font-medium">Section 16, MSMED Act 2006</td>
                      <td className="px-4 py-3">Compound interest at 3× RBI Bank Rate (16.50% p.a.) with monthly rests</td>
                      <td className="px-4 py-3 font-semibold text-amber-600">Payable directly to vendor; permanently NON-DEDUCTIBLE (Sec 23)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-bold text-indigo-600">Layer 3: Income Tax Disallowance</td>
                      <td className="px-4 py-3 font-medium">Section 43B(h) / Section 37(2)(g), IT Act</td>
                      <td className="px-4 py-3">Principal amount disallowed as expense in year of accrual if not paid within 45 days</td>
                      <td className="px-4 py-3 font-semibold text-indigo-600">Direct cash outflow: ~25.17% corporate tax on unpaid amount</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PAS-3 Dedicated Statutory Master Tables & Comparison Framework */}
        {form.slug === 'pas-3' && (
          <div className="space-y-12 mb-16">
            {/* Table 1: The Two Clocks — Private Placement vs Ordinary Allotments */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-hidden">
              <h3 className="text-lg font-bold text-navy dark:text-white mb-2 flex items-center gap-2">
                <span>⏱️</span> The Dual Statutory Clocks: Section 42 (15 Days) vs Section 39 (30 Days)
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Form PAS-3 is unique in corporate law: the statutory deadline and maximum penalty exposure depend strictly on the mode of allotment.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Regulatory Parameter</th>
                      <th className="px-4 py-3 font-semibold text-blue-600">Private Placement (Section 42)</th>
                      <th className="px-4 py-3 font-semibold text-emerald-600">Ordinary Allotment (Section 39)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr>
                      <td className="px-4 py-3 font-medium">Applicable Instruments / Routes</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">Angel rounds, Venture Capital, HNI issuances via PAS-4 offer letter</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">Rights Issues (Sec 62(1)(a)), Bonus Shares (Sec 63), ESOPs, CCPS/CCD conversions</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">Statutory Filing Deadline</td>
                      <td className="px-4 py-3 font-bold text-blue-600">Strictly 15 Calendar Days from board allotment date (Sec 42(8))</td>
                      <td className="px-4 py-3 font-bold text-emerald-600">30 Calendar Days from board allotment date (Sec 39(4))</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">Anchor Date (Day 0)</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">Date of Board Resolution approving allotment (NOT receipt of funds)</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-300">Date of Board Resolution approving allotment</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">Continuing Daily Adjudication Rate</td>
                      <td className="px-4 py-3 font-semibold text-red-600">₹1,000 per day of default</td>
                      <td className="px-4 py-3 font-semibold text-amber-600">₹1,000 per day of default</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">Statutory Penalty Cap (Standard Company)</td>
                      <td className="px-4 py-3 font-bold text-red-600">₹25,00,000 (Twenty-Five Lakhs) on Company</td>
                      <td className="px-4 py-3 font-bold text-amber-600">₹1,00,000 (One Lakh) on Company</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">Personal Liability Exposure</td>
                      <td className="px-4 py-3 font-bold text-red-600">Promoters AND Directors personally up to ₹25 Lakhs EACH (Sec 42(9))</td>
                      <td className="px-4 py-3 font-medium text-slate-600 dark:text-slate-300">Every Officer in Default up to ₹1 Lakh each (Sec 39(5))</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium">Section 446B Concession (Startup/Small Co)</td>
                      <td className="px-4 py-3 font-semibold text-purple-600">Capped at ₹2 Lakhs (Company) / ₹1 Lakh (Promoter/Director)</td>
                      <td className="px-4 py-3 font-semibold text-purple-600">Capped at ₹1 Lakh (Company) / ₹1 Lakh (Officer)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table 2: MCA Table A Base Fees & Table B Escalation Multipliers */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-hidden">
              <h3 className="text-lg font-bold text-navy dark:text-white mb-2 flex items-center gap-2">
                <span>📊</span> Table A Normal Filing Fees &amp; Table B Delay Escalation Multipliers
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Government portal fees computed on MCA V3 under the Companies (Registration Offices and Fees) Rules, 2014.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="overflow-x-auto">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Table A: Base Filing Fee by Capital</h4>
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                      <tr>
                        <th className="px-3 py-2 font-semibold">Authorised Share Capital</th>
                        <th className="px-3 py-2 font-semibold text-right">Normal Fee</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      <tr><td className="px-3 py-2">Less than ₹1,00,000</td><td className="px-3 py-2 text-right font-mono font-bold">₹200</td></tr>
                      <tr><td className="px-3 py-2">₹1,00,000 to ₹4,99,999</td><td className="px-3 py-2 text-right font-mono font-bold">₹300</td></tr>
                      <tr><td className="px-3 py-2">₹5,00,000 to ₹24,99,999</td><td className="px-3 py-2 text-right font-mono font-bold">₹400</td></tr>
                      <tr><td className="px-3 py-2">₹25,00,000 to ₹99,99,999</td><td className="px-3 py-2 text-right font-mono font-bold">₹500</td></tr>
                      <tr><td className="px-3 py-2">₹1,00,00,000 or more</td><td className="px-3 py-2 text-right font-mono font-bold">₹600</td></tr>
                      <tr><td className="px-3 py-2 text-slate-500">Company without share capital</td><td className="px-3 py-2 text-right font-mono font-bold">₹200</td></tr>
                    </tbody>
                  </table>
                </div>

                <div className="overflow-x-auto">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Table B: Late Escalation Multipliers</h4>
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                      <tr>
                        <th className="px-3 py-2 font-semibold">Delay Past Due Date</th>
                        <th className="px-3 py-2 font-semibold text-right">Escalation Multiplier</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      <tr><td className="px-3 py-2">Up to 30 days</td><td className="px-3 py-2 text-right font-mono font-bold text-amber-600">2× normal fee</td></tr>
                      <tr><td className="px-3 py-2">31 to 60 days</td><td className="px-3 py-2 text-right font-mono font-bold text-amber-600">4× normal fee</td></tr>
                      <tr><td className="px-3 py-2">61 to 90 days</td><td className="px-3 py-2 text-right font-mono font-bold text-amber-600">6× normal fee</td></tr>
                      <tr><td className="px-3 py-2">91 to 180 days</td><td className="px-3 py-2 text-right font-mono font-bold text-red-600">10× normal fee</td></tr>
                      <tr><td className="px-3 py-2">Beyond 180 days</td><td className="px-3 py-2 text-right font-mono font-bold text-red-600">12× normal fee</td></tr>
                      <tr><td className="px-3 py-2 text-slate-500">Delay Calculation Basis</td><td className="px-3 py-2 text-right text-slate-500">Calculated from Day 16 or Day 31</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Table 3: Section 42(6) Upstream Rules (The Startup Trap) */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-hidden">
              <h3 className="text-lg font-bold text-navy dark:text-white mb-2 flex items-center gap-2">
                <span>⚠️</span> The Startup Trap: Upstream Clocks &amp; Fund Utilisation Lock (Section 42(6))
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Critical compliance provisions governing application money that frequently trigger heavy ROC compounding orders for emerging companies.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Statutory Rule</th>
                      <th className="px-4 py-3 font-semibold">Governing Provision</th>
                      <th className="px-4 py-3 font-semibold">Prescribed Protocol</th>
                      <th className="px-4 py-3 font-semibold">Consequences of Default</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr>
                      <td className="px-4 py-3 font-bold text-navy dark:text-white">Separate Bank Account</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Section 42(6)</td>
                      <td className="px-4 py-3">Keep all subscription money in a distinct scheduled bank account.</td>
                      <td className="px-4 py-3 text-rose-600">Invalidates private placement offering under Section 42(10).</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-bold text-navy dark:text-white">Fund Utilisation Lock</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Section 42(6) Proviso</td>
                      <td className="px-4 py-3 font-bold text-red-600">MONEY CANNOT BE USED UNTIL PAS-3 IS FILED WITH ROC.</td>
                      <td className="px-4 py-3 text-rose-600">Compulsory refund of all money + penalty up to amount raised or ₹2 Cr.</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-bold text-navy dark:text-white">60-Day Allotment Window</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Section 42(6) Main Text</td>
                      <td className="px-4 py-3">Allot securities within 60 days of receiving subscription money.</td>
                      <td className="px-4 py-3 text-rose-600">Refund within 15 days, failing which 12% p.a. interest runs from Day 61.</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-bold text-navy dark:text-white">5-Allotment Batching Rule</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">MCA V3 Webform Logic</td>
                      <td className="px-4 py-3">Max 5 allotment dates per form, all within 30 days of filing.</td>
                      <td className="px-4 py-3 text-amber-600">Portal rejects batch; separate PAS-3 required for each event date.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table 4: Mandatory Document Checklist for MCA V3 */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-hidden">
              <h3 className="text-lg font-bold text-navy dark:text-white mb-2 flex items-center gap-2">
                <span>📎</span> Mandatory Attachments Checklist for MCA V3 Form PAS-3
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Checklist of required documentation to ensure Straight-Through-Process (STP) approval and avoid resubmission lapses (T+15 days).
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Attachment Name</th>
                      <th className="px-4 py-3 font-semibold">When Mandatory</th>
                      <th className="px-4 py-3 font-semibold">Key Details Required</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr>
                      <td className="px-4 py-2.5 font-semibold text-blue-600">List of Allottees (Schedule)</td>
                      <td className="px-4 py-2.5 font-bold text-slate-900 dark:text-white">Always Mandatory (Every Allotment)</td>
                      <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">Name, address, PAN, occupation, class &amp; number of securities, nominal value, total consideration.</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-semibold text-blue-600">Certified Board Resolution</td>
                      <td className="px-4 py-2.5 font-bold text-slate-900 dark:text-white">Always Mandatory</td>
                      <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">Extract of board meeting approving allotment, specifying share entitlement, date, and signing authorization.</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-semibold text-blue-600">Special Resolution Copy</td>
                      <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">Private Placement &amp; Preferential Issues</td>
                      <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">General meeting resolution approved under Section 42 / 62(1)(c) with filed Form MGT-14 SRN reference.</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-semibold text-blue-600">Registered Valuer Report</td>
                      <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">Non-Cash Issues &amp; Preferential Allotments</td>
                      <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">Fair value computation per Rule 11 of PAS Rules and Section 247 by an IBBI Registered Valuer.</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-semibold text-blue-600">PAS-4 &amp; PAS-5 Records</td>
                      <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">Private Placement</td>
                      <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">Copy of private placement offer letter (PAS-4) and complete record of offerees (PAS-5).</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 font-semibold text-blue-600">Contract for Non-Cash Allotment</td>
                      <td className="px-4 py-2.5 text-slate-700 dark:text-slate-300">Consideration Other Than Cash</td>
                      <td className="px-4 py-2.5 text-slate-600 dark:text-slate-400">Duly stamped agreement constituting the title of allottee to the shares / intellectual property / assets.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Table 5: Real ROC Adjudication Precedents */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-hidden">
              <h3 className="text-lg font-bold text-navy dark:text-white mb-2 flex items-center gap-2">
                <span>⚖️</span> Real 2026 ROC Adjudication Precedents on Form PAS-3
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Authoritative orders passed by Registrars of Companies highlighting strict enforcement of Section 42 timelines.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Adjudicating Authority</th>
                      <th className="px-4 py-3 font-semibold">Factual Matrix</th>
                      <th className="px-4 py-3 font-semibold">Days Delayed</th>
                      <th className="px-4 py-3 font-semibold text-right">Adjudicated Penalty</th>
                      <th className="px-4 py-3 font-semibold">Key Legal Precedent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    <tr>
                      <td className="px-4 py-3 font-bold text-blue-600">ROC Chennai (5 Mar 2026)</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">681 CCPS allotted via private placement; company assumed 30-day window instead of 15-day</td>
                      <td className="px-4 py-3 font-mono font-bold text-amber-600">46 Days</td>
                      <td className="px-4 py-3 font-mono font-bold text-red-600 text-right">₹1,38,000</td>
                      <td className="px-4 py-3 text-xs text-slate-500">Closing funding round does NOT cure late filing; promoters &amp; directors personally penalised under Section 42(9).</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-bold text-blue-600">Tridib Industries (2026)</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">Multiple private placement contraventions including belated PAS-3 and fund utilisation</td>
                      <td className="px-4 py-3 font-mono font-bold text-amber-600">Multiple</td>
                      <td className="px-4 py-3 font-mono font-bold text-red-600 text-right">~₹16,00,000</td>
                      <td className="px-4 py-3 text-xs text-slate-500">Even after applying Section 446B 50% concession, cumulative Section 42 penalties totalled ₹16 Lakhs across directors.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}


        {/* 4F - Worked Example */}
        <div className="bg-blue-50 dark:bg-blue-900/10 border-l-4 border-blue-600 p-6 md:p-8 rounded-r-2xl mb-16">
          <h2 className="text-2xl font-bold text-navy dark:text-white mb-4">Fee Calculation Example</h2>
          <div className="prose prose-slate dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: form.contentSections.workedExample }} />
        </div>

        {/* 10B - Filing Guide Panel */}
        {form.filingGuides && form.filingGuides.length > 0 && (
          <div className="mb-16">
            <h2 className="text-[1.5rem] font-semibold text-navy dark:text-white mb-1">
              Detailed Filing Guide for {form.formNumber}
            </h2>
            <p className="text-sm text-slate-500 mb-6">Step-by-step guidance to complement this calculator</p>
            <div className="flex flex-col gap-4">
              {form.filingGuides.map((guide, i) => (
                <div key={i} className="bg-[#EFF6FF] dark:bg-slate-900 border-l-[3px] border-[#1D4ED8] rounded-r-xl p-6 flex flex-col gap-2">
                  <div className="flex justify-between items-start flex-wrap gap-4">
                    <h3 className="text-lg font-bold text-navy dark:text-white flex items-center gap-2">
                      <span>📄</span> {guide.title}
                    </h3>
                    {guide.isOfficial && (
                      <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider whitespace-nowrap">
                        CorpLawUpdates Guide
                      </span>
                    )}
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 text-sm mt-2">{guide.summary}</p>
                  <div className="mt-4 flex justify-between items-center text-sm font-medium pt-4 border-t border-blue-100 dark:border-slate-800">
                    <span className="text-slate-500">
                      Published: {new Date(guide.publishedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                    </span>
                    <Link href={guide.slug} className="text-[#1D4ED8] dark:text-blue-400 hover:underline font-bold">
                      Read Full Guide →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4G - FAQ Section */}
        <div className="mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-navy dark:text-white font-heading mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {form.faqItems.map((faq, index) => (
              <details key={index} className="group border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between gap-4 p-6 font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-xl">
                  {faq.question}
                  <span className="transition group-open:rotate-180 text-slate-400">
                    <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                  </span>
                </summary>
                <div className="px-6 pb-6 text-slate-600 dark:text-slate-400">
                  <p>{faq.answer}</p>
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* 4H - Related & Cross Links */}
        <div className="mb-16 border-t border-slate-200 dark:border-slate-800 pt-12">
          <h3 className="text-xl font-bold text-navy dark:text-white mb-6">Often filed together with:</h3>
          <div className="flex flex-wrap gap-4 mb-10">
            {[...form.relatedForms, ...form.filedTogetherWith].filter((val, i, arr) => arr.indexOf(val) === i).map(slug => {
              const rel = mcaForms.find(f => f.slug === slug)
              if (!rel) return null
              return (
                <Link key={slug} href={`/tools/fee-calculator/companies/${slug}`} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-4 rounded-xl shadow-sm hover:shadow-md transition-shadow flex items-center gap-3">
                  <span className="font-bold text-blue-600 dark:text-blue-400">{rel.formNumber}</span>
                  <span className="text-slate-500">— {rel.formName}</span>
                </Link>
              )
            })}
          </div>

          <h3 className="text-xl font-bold text-navy dark:text-white mb-6">Other calculators:</h3>
          <div className="flex flex-wrap gap-4">
            <Link href="/tools/fee-calculator/llp" className="bg-teal-50 dark:bg-teal-900/20 text-teal-800 dark:text-teal-300 font-semibold px-6 py-3 rounded-lg hover:bg-teal-100 transition-colors border border-teal-200 dark:border-teal-800">
              LLP Penalty Calculator →
            </Link>
            <Link href="/tools/fee-calculator/msme" className="bg-purple-50 dark:bg-purple-900/20 text-purple-800 dark:text-purple-300 font-semibold px-6 py-3 rounded-lg hover:bg-purple-100 transition-colors border border-purple-200 dark:border-purple-800">
              MSME Interest Calculator →
            </Link>
          </div>
        </div>
      </div>

      {/* 4I - CTA Strip */}
      <div className="bg-slate-100 dark:bg-slate-900 py-12 border-t border-slate-200 dark:border-slate-800 text-center px-4">
        <h2 className="text-2xl font-bold text-navy dark:text-white mb-6">Need to calculate for a different company form?</h2>
        <Link href="/tools/fee-calculator/companies" className="inline-block bg-blue-600 text-white font-bold px-8 py-4 rounded-xl hover:bg-blue-700 transition-colors">
          View All Company Calculators
        </Link>
      </div>
    </div>
  )
}
