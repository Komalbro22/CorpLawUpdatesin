'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { FuzzyClarifier } from '@/components/documents/FuzzyClarifier'
import { LegalBasisCard } from '@/components/documents/LegalBasisCard'
import { ConflictAuditor } from '@/components/documents/ConflictAuditor'
import { checkMissingClauses, checkLeaseClauses, getImportanceIcon, getImportanceLabel, formatTemplateSource, type ClauseCheck } from '@/lib/document-clause-checker'
import { DocumentRetry } from '@/components/documents/DocumentRetry'

interface Field {
  id: string
  label: string
  type: 'text' | 'textarea' | 'date' | 'select'
  placeholder?: string
  required: boolean
  help_text?: string
  options?: string[]
  pattern?: string
}

interface Template {
  id: string
  name: string
  slug: string
  description: string
  category: string
  template_content: string
  fields: Field[]
  regulation_reference: string
  source: string
  last_verified: string
  ai_system_prompt: string
}

const NEXT_STEPS: Record<string, {
  title: string
  steps: { 
    icon: string
    text: string
    note?: string
    urgent?: boolean
    link?: { text: string; href: string }
  }[]
}> = {

  'lease-agreement': {
    title: 'After Downloading — Execute and Register Lease Deed',
    steps: [
      {
        icon: '⚠️',
        text: 'CHECK — Is registration compulsory for your lease?',
        note: 'Lease for MORE than 1 year = MUST register\nLease for 11 months or less = registration optional (but notarize)',
        urgent: true
      },
      {
        icon: '💰',
        text: 'Pay stamp duty before signing',
        note: 'Stamp duty is state-specific:\nMaharashtra: 0.25% of total rent for up to 1 year\nDelhi: 2% of annual rent\nKarnataka: 0.1% of total rent\nPay on e-stamp paper from state portal or SHCIL'
      },
      {
        icon: '✍️',
        text: 'Both Lessor and Lessee sign on all pages',
        note: 'Two witnesses must sign on the last page with their name and address'
      },
      {
        icon: '🏛️',
        text: 'Register at Sub-Registrar Office (if lease > 1 year)',
        note: 'Documents needed:\n• Original deed + 2 photocopies\n• ID proof of both parties\n• Address proof\n• Property documents (7/12 extract, ownership proof)\n• Recent property tax receipt\n• Passport photos of both parties\n• Pay registration fee'
      },
      {
        icon: '💳',
        text: 'Collect security deposit cheque/transfer from Lessee',
        note: 'Take cheque or bank transfer — avoid cash deposits above ₹20,000 (IT Act restriction). Issue written receipt.'
      },
      {
        icon: '📸',
        text: 'Do a joint inspection and photo/video documentation',
        note: 'Before handing over keys, document the property condition with dated photos/video. Attach inventory list as Schedule II.'
      },
      {
        icon: '📄',
        text: 'Complete TDS compliance if applicable',
        note: 'Annual rent > ₹2.4 lakh:\n• Individual Lessee: TDS @ 2% under Section 194IB\n• Company/Firm Lessee: TDS @ 10% under Section 194I\nFile Form 26QC (individual) or 26Q (company) quarterly'
      },
      {
        icon: '🔑',
        text: 'Hand over keys and possession receipt',
        note: 'Issue written "Possession Receipt" confirming Lessee has taken possession. Keep signed copy.'
      },
      {
        icon: '🏛️',
        text: 'Inform local police/society about new tenant',
        note: 'File tenant verification form with local police (mandatory in many states). Inform housing society/RWA. Update address change on Aadhaar if Lessee is using as residence.'
      },
    ],
  },

  'board-resolution-bank-account': {
    title: 'How to Open Bank Account with This Resolution',
    steps: [
      { icon: '📋', text: 'Print on company letterhead (original, not photocopy)', note: 'Banks require original printed copies' },
      { icon: '✍️', text: 'Get all directors present at meeting to sign', note: 'Signatures must match bank records/KYC documents' },
      { icon: '🏢', text: 'Chairperson signs at the bottom as "Chairperson"', note: 'Must be same person named as Chairperson in resolution' },
      { icon: '📝', text: 'Company Secretary certifies the copy as "Certified True Copy"', note: 'CS signs with membership number and date' },
      { icon: '🔵', text: 'Affix company seal (if your company has one)', note: 'Optional since Companies Act 2013 amendment' },
      { icon: '🏦', text: 'Visit bank branch with this resolution + following documents:', note: '• Certificate of Incorporation\n• MOA and AOA\n• PAN card of company\n• Address proof of company\n• KYC of all authorized signatories\n• Form INC-22 (registered office proof)' },
      { icon: '📄', text: 'Bank will verify resolution against their internal format', note: 'Some banks have their own resolution format — ask bank first' },
      { icon: '📁', text: 'Keep original certified copy in Minute Book at registered office', note: 'Required to be maintained under Companies Act 2013' },
    ],
  },

  'board-resolution-director-appointment': {
    title: 'After Appointment — File DIR-12 within 30 Days',
    steps: [
      { icon: '⚠️', text: 'FILE DIR-12 WITHIN 30 DAYS of appointment date', note: 'Late filing: ₹300/day additional fee. Under CCFS 2026 until July 15 — only 10% of fee', urgent: true },
      { icon: '📋', text: 'Get newly appointed director to submit DIR-2 (consent to act as director)', note: 'Mandatory — director must confirm acceptance of appointment' },
      { icon: '📝', text: 'New director to submit Form DIR-8 (declaration of non-disqualification)', note: 'Required before first board meeting they attend' },
      { icon: '🖥️', text: 'File Form DIR-12 on MCA V3 portal (mca.gov.in)', note: 'Attach: Board resolution + DIR-2 consent + DIR-8 declaration' },
      { icon: '🔑', text: 'New director to link DIN with company on MCA portal', note: 'Login to mca.gov.in → DIN services → Link DIN' },
      { icon: '✍️', text: 'Print and sign appointment letter issued to director', note: 'Director countersigns as acceptance' },
      { icon: '📁', text: 'Update Register of Directors (MGT-9) at registered office', note: 'Physical register must be updated within 15 days' },
      { icon: '📄', text: 'Disclose new director in next Annual Return (MGT-7)', note: 'List all directors as on AGM date' },
      { icon: '🏦', text: 'Inform bank if new director is an authorized signatory', note: 'Fresh board resolution needed for bank account changes' },
    ],
  },

  'board-resolution-registered-office-change': {
    title: 'After Resolution — File INC-22 within 30 Days',
    steps: [
      { icon: '⚠️', text: 'FILE FORM INC-22 within 30 days of change', note: 'Attach: Board resolution + utility bill of new address + NOC from owner', urgent: true },
      { icon: '🏢', text: 'Get Ownership/NOC documents of new premises ready', note: '• Own property: Latest property tax receipt\n• Rented: Rent agreement + NOC from owner\n• Shared premises: NOC from occupant' },
      { icon: '🖥️', text: 'File Form INC-22 on MCA V3 portal', note: 'Under Company Services → Change of Registered Office' },
      { icon: '📰', text: 'Publish notice in newspaper (if different city — not required for same city)', note: 'Required only when shifting to different city/ROC jurisdiction' },
      { icon: '🪧', text: 'Update company name board at new address within 15 days', note: 'Companies Act requires visible name board at registered office' },
      { icon: '📋', text: 'Update all company stationery with new address', note: '• Letterheads\n• Business cards\n• Invoice formats\n• Website' },
      { icon: '🏦', text: 'Intimate bank about change of registered office address', note: 'Fresh board resolution may be needed for bank records' },
      { icon: '📄', text: 'Update GST registration address within 15 days', note: 'Login to GST portal → Amendments to Registration' },
    ],
  },

  'board-resolution-bank-loan': {
    title: 'After Resolution — Execute Loan Documents',
    steps: [
      { icon: '🏦', text: 'Submit resolution to bank along with loan application', note: 'Bank will verify resolution before processing' },
      { icon: '📄', text: 'Execute loan agreement / hypothecation deed as per bank format', note: 'Authorized person named in resolution must sign' },
      { icon: '🔑', text: 'Execute collateral security documents (mortgage deed if property)', note: 'May need sub-registrar registration for mortgage' },
      { icon: '💰', text: 'Pay stamp duty on loan agreement (varies by state)', note: 'Maharashtra: 0.1% of loan, UP: Fixed ₹200, Check your state' },
      { icon: '📋', text: 'Enter loan in statutory registers at registered office', note: 'Register of Charges (if creating charge on assets)' },
      { icon: '🖥️', text: 'File Form CHG-1 within 30 days if charge created', note: 'Creates charge on MCA records — bank requires this', urgent: true },
      { icon: '📁', text: 'Keep certified copy of board resolution with bank documents', note: 'Banks keep this in their records throughout loan tenure' },
      { icon: '💳', text: 'Check if borrowing exceeds paid-up capital + free reserves', note: 'If yes → Special resolution needed under Section 180(1)(c)' },
    ],
  },

  'board-resolution-investment': {
    title: 'After Resolution — Comply with Section 186',
    steps: [
      { icon: '📋', text: 'Verify investment does not exceed limits under Section 186', note: 'Limit: 60% of paid-up capital + reserves OR 100% of free reserves (whichever is higher)' },
      { icon: '💳', text: 'Check if special resolution needed (if exceeding 186 limits)', note: 'Special resolution at general meeting required for inter-corporate investments beyond limit' },
      { icon: '📄', text: 'Execute investment/FD/mutual fund application', note: 'Authorized person named in resolution signs all documents' },
      { icon: '📁', text: 'Register investment in company\'s Register of Investments', note: 'Mandatory register under Companies Act 2013' },
      { icon: '🖥️', text: 'Disclose in Board Report under Section 186(4)', note: 'Annual Board Report must disclose all investments, loans and guarantees' },
      { icon: '💰', text: 'Obtain unanimous board approval if lending to director/associate', note: 'Section 185 restrictions apply to loans to directors and related parties' },
      { icon: '📊', text: 'Reflect investment in financial statements (Schedule III)', note: 'Show under Non-current/Current Investments as per AS/Ind AS' },
    ],
  },

  'board-resolution-dividend': {
    title: 'After Resolution — Pay Dividend Correctly',
    steps: [
      { icon: '📅', text: 'Fix record date and publish announcement (listed companies)', note: 'Listed companies: 7 days notice to stock exchange before record date' },
      { icon: '🏦', text: 'Open separate Unpaid Dividend Account in bank', note: 'Required under Section 124 — must be separate bank account' },
      { icon: '💰', text: 'Transfer dividend amount to separate account within 5 days of declaration', note: 'Failure to transfer attracts 18% interest per year' },
      { icon: '📊', text: 'Deduct TDS before paying dividend', note: 'TDS @ 10% if dividend > ₹5,000 per shareholder per year (Section 194)' },
      { icon: '💳', text: 'Pay dividend within 30 days of declaration', note: 'Late payment: 18% annual interest to shareholders, urgent: true' },
      { icon: '📧', text: 'Send dividend warrants/ECS to all eligible shareholders', note: 'Physical warrant or NECS transfer within 30 days' },
      { icon: '🖥️', text: 'File TDS returns (Form 24Q/26Q) for dividend TDS', note: 'Quarterly TDS return showing dividend payments' },
      { icon: '📄', text: 'Transfer unclaimed dividend to IEPF after 7 years', note: 'Investor Education and Protection Fund — mandatory transfer' },
    ],
  },

  'board-resolution-common-seal': {
    title: 'After Adopting Seal — Proper Custody',
    steps: [
      { icon: '🔐', text: 'Hand over seal to Company Secretary for safe custody', note: 'CS is custodian — keep in locked safe at registered office' },
      { icon: '📋', text: 'Maintain Seal Register for every use of seal', note: 'Record: Date used, document name, authorized by, witness' },
      { icon: '⚖️', text: 'Note: Common seal is optional under Companies Act 2013', note: 'Section 9 amended — seal is no longer mandatory. Both with and without seal documents are valid.' },
      { icon: '📄', text: 'Update MOA/AOA if seal was previously mandatory under Articles', note: 'Some older AOAs require seal — may need amendment' },
      { icon: '✍️', text: 'Every document with seal must be signed by designated signatories', note: 'As specified in this board resolution — typically Director + CS' },
      { icon: '📁', text: 'Keep this board resolution with company\'s constitutional documents', note: 'Important reference for seal usage authorization' },
    ],
  },

  'director-appointment-letter': {
    title: 'After Issuing Letter — Complete Onboarding',
    steps: [
      { icon: '✍️', text: 'Director countersigns one copy as acceptance and returns it', note: 'Keep signed copy on file — this is the formal contract' },
      { icon: '📋', text: 'File Board Resolution + DIR-2 + DIR-8 on MCA portal', note: 'File Form DIR-12 within 30 days of appointment', urgent: true },
      { icon: '🔑', text: 'Director to obtain DSC (Digital Signature Certificate) if not already held', note: 'Required for signing MCA forms. eMudhra/Sify/NSDL issue DSC' },
      { icon: '🖥️', text: 'Director to register on MCA portal and link DIN', note: 'MCA21 → Registration → Director — needed for all filings' },
      { icon: '🏦', text: 'Add director to bank mandate if they are authorized signatory', note: 'New board resolution needed specifically for bank changes' },
      { icon: '📄', text: 'Issue share certificate if director is also a shareholder', note: 'If any share allotment is linked to appointment' },
      { icon: '📁', text: 'Update all company records with new director details', note: '• Register of Directors\n• Board meeting attendance register\n• Company letterhead\n• MCA portal records' },
      { icon: '📧', text: 'Share company\'s email ID and access credentials', note: 'Give access to required company systems, portals and documentation' },
    ],
  },

  'partnership-deed': {
    title: 'After Executing Deed — Complete Formalities',
    steps: [
      { icon: '📜', text: 'Print the deed on Non-Judicial Stamp Paper', note: 'Stamp duty value varies by state (e.g. ₹500 to 1% of capital). Refer to local state stamp rules.', urgent: true },
      { icon: '✍️', text: 'Sign on each page by both partners', note: 'Both partners must sign at the bottom of each page and execute at the end in full.' },
      { icon: '👥', text: 'Get two independent witnesses to sign', note: 'Witnesses must provide their names, addresses, and signatures.' },
      { icon: '⚖️', text: 'Notarize the executed Partnership Deed', note: 'Notary public verification adds legal weight and prevents future authenticity disputes.' },
      { icon: '📋', text: 'Register firm with Registrar of Firms (ROF)', note: 'File Form 1 with ROF of your state. Registration is required to sue third parties (Section 69).' },
      { icon: '💳', text: 'Apply for Partnership Firm PAN Card', note: 'Apply online on NSDL portal using the notarized deed. Partnership is a separate tax entity.' },
      { icon: '🏦', text: 'Open a Current Bank Account in the firm name', note: 'Submit: Executed deed, ROF certificate/acknowledgment, PAN of firm, and KYC of partners.' },
      { icon: '📈', text: 'Apply for GST and local business registrations', note: 'Register for GST on GST portal, and apply for Shops & Establishment license (Gumasta).' },
    ],
  },

  'general-power-of-attorney': {
    title: 'After Executing GPA — Proper Formalities',
    steps: [
      { icon: '📜', text: 'Print on Non-Judicial Stamp Paper of correct value', note: 'Stamp duty varies by state and whether property sale/transfer is authorized. Consult local state stamp act rules.', urgent: true },
      { icon: '👥', text: 'Execute in the presence of two independent witnesses', note: 'Witnesses must sign and provide their full names, addresses, and occupations.' },
      { icon: '⚖️', text: 'Notarize before a Notary Public', note: 'Notarization authenticates execution and is required for administrative, banking, and general actions.' },
      { icon: '📋', text: 'Register the GPA at the Sub-Registrar Office (if required)', note: 'Mandatory under Section 17 of the Registration Act, 1908 if the GPA grants power to sell, mortgage, or transfer immovable property.', urgent: true },
      { icon: '🌍', text: 'Consulate Attestation / Apostille (for NRI/Overseas execution)', note: 'If executed outside India, must be notarized abroad and attested by the Indian Consulate or Apostilled within 3 months.' },
      { icon: '🏦', text: 'Submit certified copy to Banks and Financial Institutions', note: 'Banks will verify the clauses and update their records to allow the Attorney to operate accounts.' },
      { icon: '🏢', text: 'Submit copy to MCA/ROC/Sub-Registrar for transactions', note: 'For company matters or property registrations, the registered GPA must be filed alongside relevant forms.' },
      { icon: '📄', text: 'Maintain a detailed ledger of all actions taken by Attorney', note: 'The Principal has a legal right to inspect all actions and accounts under Section 213 of the Indian Contract Act, 1872.' },
    ],
  },

  // DEFAULT for any template not specifically listed
  '_default': {
    title: 'Steps After Downloading Your Document',
    steps: [
      { icon: '👁️', text: 'Review entire document carefully before signing', note: 'Check all names, dates, DIN numbers, amounts for accuracy' },
      { icon: '⚖️', text: 'Get it reviewed by your Company Secretary or Advocate', note: 'Legal review recommended before executing any document' },
      { icon: '🖨️', text: 'Print on company letterhead (original — not photocopy)', note: 'Use official letterhead with company name, address, CIN' },
      { icon: '✍️', text: 'Get all required parties to sign', note: 'Directors, witnesses, authorized signatories as applicable' },
      { icon: '🔵', text: 'Affix company seal if applicable', note: 'Optional — seal is not mandatory under Companies Act 2013' },
      { icon: '📝', text: 'Company Secretary certifies as "Certified True Copy" if required', note: 'CS signs with membership number, date, and designation' },
      { icon: '🖥️', text: 'File required MCA forms within prescribed time limit', note: 'Check if any regulatory filing is triggered by this document' },
      { icon: '📁', text: 'Store original in Minute Book / company records permanently', note: 'Keep at registered office as per Companies Act requirement' },
    ],
  },
}

const AI_SUGGESTIONS: Record<string, {
  label: string
  prompt: string
  category: 'add' | 'remove' | 'modify' | 'improve'
}[]> = {

  'lease-agreement': [
    // ADD CLAUSES
    { label: '+ Add sub-lease prohibition', prompt: 'Add an explicit clause prohibiting the Lessee from sub-letting, underletting or parting with possession of the premises or any part thereof without prior written consent of the Lessor', category: 'add' },
    { label: '+ Add pet policy clause', prompt: 'Add a clause specifying whether pets are allowed — if residential lease, add that no pets are permitted without prior written consent of the Lessor', category: 'add' },
    { label: '+ Add maintenance charge clause', prompt: 'Add a clause that all maintenance charges, society charges, parking charges and common area charges shall be paid by the Lessee in addition to the rent', category: 'add' },
    { label: '+ Add painting obligation', prompt: 'Add a clause that the Lessee shall get the premises freshly painted at their own cost before vacating, or shall pay an amount equivalent to painting charges to the Lessor', category: 'add' },
    { label: '+ Add notice/notice board clause', prompt: 'Add that the Lessor shall have the right to display a "To Let" notice on the premises during the last 30 days before lease expiry', category: 'add' },
    { label: '+ Add diplomatic/break clause', prompt: 'Add a diplomatic break clause allowing either party to terminate after 6 months on giving 2 months written notice, notwithstanding the lock-in period, for diplomatic or relocation reasons', category: 'add' },
    { label: '+ Add GST on rent clause', prompt: 'Add a clause confirming whether GST is applicable on the lease rent — if commercial lease and Lessor is GST registered, add that GST at 18% shall be charged on rent and the Lessee shall be entitled to claim input tax credit if eligible', category: 'add' },
    { label: '+ Add generator/power backup clause', prompt: 'Add that the Lessee shall bear the cost of generator/power backup usage at actuals in addition to regular electricity charges', category: 'add' },
    { label: '+ Add lock change prohibition', prompt: 'Add that the Lessee shall not change the locks or add additional locks to the premises without prior written consent of the Lessor, and any new keys must be provided to the Lessor', category: 'add' },
    { label: '+ Add early termination penalty', prompt: 'Add an early termination penalty clause — if the Lessee terminates during the lock-in period, they shall forfeit the security deposit and pay rent for the unexpired lock-in period', category: 'add' },

    // REMOVE CLAUSES
    { label: '− Remove sub-lease restriction', prompt: 'Modify the sub-letting clause to allow the Lessee to sublet part of the premises with prior written intimation to the Lessor (not requiring formal consent)', category: 'remove' },
    { label: '− Remove arbitration (keep court only)', prompt: 'Remove the arbitration clause and replace with exclusive jurisdiction of courts at the specified city only', category: 'remove' },

    // MODIFY
    { label: '↕ Convert to 11-month lease', prompt: 'Convert this to an 11-month lease (not exceeding 1 year) to avoid compulsory registration requirement under Section 17 of Registration Act 1908. Update the lease end date, duration, and registration clause accordingly.', category: 'modify' },
    { label: '↕ Convert to commercial lease', prompt: 'Convert this from a residential to a commercial office space lease. Update the purpose clause, add GST clause, add signboard/branding rights, add business hours access clause, and remove residential-specific obligations', category: 'modify' },
    { label: '↕ Add rent-free period', prompt: 'Add a rent-free period of {{number}} months at the start of the lease for fitting out and renovation purposes, during which no rent shall be payable but the security deposit shall apply', category: 'modify' },
    { label: '↕ Make security deposit interest-bearing', prompt: 'Modify the security deposit clause to make it interest-bearing at {{rate}}% per annum, and update the refund clause accordingly', category: 'modify' },

    // IMPROVE
    { label: '✦ Strengthen Lessor protections', prompt: 'Strengthen all Lessor protection clauses — add right to enter and inspect monthly without notice, add right to terminate for non-payment after 1 month, add explicit forfeiture of deposit on damage', category: 'improve' },
    { label: '✦ Strengthen Lessee protections', prompt: 'Strengthen Lessee protection clauses — add minimum 3 months written notice for rent increase, add Lessor\'s obligation to repair within 30 days, clarify that deposit is fully refundable without deduction for normal wear and tear', category: 'improve' },
    { label: '🔤 Make language more formal', prompt: 'Rewrite the entire lease deed in more formal legal language with proper recitals, covenants, and legal terminology as used in registered documents', category: 'improve' },
  ],

  'board-resolution-bank-account': [
    { label: '+ Add joint signing requirement', prompt: 'Add a clause that two authorized signatories must sign jointly for transactions above ₹1,00,000', category: 'add' },
    { label: '+ Add transaction limit', prompt: 'Add a clause specifying the authorized signatories can operate up to their designated transaction limits: single signatory up to ₹50,000, joint signatories above ₹50,000', category: 'add' },
    { label: '+ Add internet banking authorization', prompt: 'Add authorization for internet banking, NEFT, RTGS and IMPS transactions', category: 'add' },
    { label: '+ Add locker authorization', prompt: 'Add authorization to open and operate safe deposit locker at the bank', category: 'add' },
    { label: '↕ Change to joint signing only', prompt: 'Modify the resolution so that ALL transactions require JOINT signing by any two of the authorized signatories — no single signatory operation allowed', category: 'modify' },
    { label: '− Remove seal clause', prompt: 'Remove any reference to company seal — common seal is optional under Companies Act 2013', category: 'remove' },
    { label: '✦ Add FD authorization', prompt: 'Add authorization to open Fixed Deposits with the bank from the current account balance', category: 'add' },
    { label: '✦ Add cheque book authorization', prompt: 'Add explicit authorization to obtain cheque books and debit cards for the account', category: 'add' },
    { label: '🔤 Make more formal', prompt: 'Make the entire resolution more formal and legally precise. Use proper legal language throughout.', category: 'improve' },
    { label: '📋 Add FEMA compliance clause', prompt: 'Add a clause confirming compliance with FEMA regulations for any foreign exchange transactions from this account', category: 'add' },
  ],

  'board-resolution-director-appointment': [
    { label: '+ Add independence declaration', prompt: 'Add a clause that the director has declared their independence as required under Section 149(6) and Schedule IV of the Companies Act 2013 (use only if this is an Independent Director)', category: 'add' },
    { label: '+ Add non-compete clause', prompt: 'Add a clause that the director shall not engage in any competing business during and for 1 year after the tenure', category: 'add' },
    { label: '+ Add disclosure of interest clause', prompt: 'Add a clause requiring the director to disclose all their other directorships and interests as per Section 184 within 30 days', category: 'add' },
    { label: '+ Add CSR committee mention', prompt: 'Add authorization for the director to be a member of the CSR Committee if the company is required to constitute one under Section 135', category: 'add' },
    { label: '+ Add audit committee authorization', prompt: 'Add authorization for the director to be part of the Audit Committee as required under Section 177', category: 'add' },
    { label: '↕ Change to MD appointment', prompt: 'Convert this from an ordinary director appointment to a Managing Director appointment under Section 196, adding managing director powers and responsibilities', category: 'modify' },
    { label: '↕ Change to WTD appointment', prompt: 'Convert this to a Whole-time Director appointment under Section 196 of Companies Act 2013', category: 'modify' },
    { label: '− Remove remuneration clause', prompt: 'Remove the remuneration clause — this director is being appointed on a non-remuneration/honorary basis', category: 'remove' },
    { label: '📋 Add DIR-12 filing authorization', prompt: 'Add a specific clause authorizing the Company Secretary to file Form DIR-12 with ROC within 30 days', category: 'add' },
    { label: '📋 Add Whole-time KMP declaration', prompt: 'Add a clause confirming this director is appointed as Key Managerial Personnel (KMP) under Section 203', category: 'add' },
  ],

  'board-resolution-registered-office-change': [
    { label: '+ Add NOC acknowledgment', prompt: 'Add a clause acknowledging receipt of No Objection Certificate from the property owner/landlord for using the premises as registered office', category: 'add' },
    { label: '+ Add GST update authorization', prompt: 'Add authorization to update the registered office address in GST registration within 15 days', category: 'add' },
    { label: '+ Add INC-22 filing authorization', prompt: 'Add explicit authorization to file Form INC-22 with ROC within 30 days of this resolution', category: 'add' },
    { label: '+ Add bank intimation clause', prompt: 'Add a clause authorizing intimation to all banks and financial institutions about the change of registered office', category: 'add' },
    { label: '↕ Convert to different state change', prompt: 'Convert this to a special resolution for change of registered office to a different state, which requires approval under Section 13 and Central Government approval', category: 'modify' },
    { label: '+ Add newspaper publication clause', prompt: 'Add a clause authorizing publication of notice of change of registered office in a local newspaper (required for different city change)', category: 'add' },
    { label: '📋 Add stationery update clause', prompt: 'Add a clause directing all departments to update company letterheads, invoice formats and other stationery with the new address within 30 days', category: 'add' },
  ],

  'board-resolution-bank-loan': [
    { label: '+ Add security creation clause', prompt: 'Add detailed clause about creation of charge on company assets — specifying the assets to be hypothecated or mortgaged as security', category: 'add' },
    { label: '+ Add CHG-1 filing authorization', prompt: 'Add explicit authorization to file Form CHG-1 with ROC within 30 days of charge creation under Section 77', category: 'add' },
    { label: '+ Add personal guarantee mention', prompt: 'Add a clause authorizing specific directors to provide personal guarantee to the bank as additional security for the loan', category: 'add' },
    { label: '+ Add interest rate clause', prompt: 'Add a clause specifying the interest rate terms: fixed/floating rate, reset period and any prepayment conditions', category: 'add' },
    { label: '+ Add repayment schedule clause', prompt: 'Add a clause noting the repayment schedule: monthly EMI amount and loan tenure', category: 'add' },
    { label: '↕ Convert to cash credit facility', prompt: 'Convert this from a term loan resolution to a Cash Credit Facility resolution with revolving credit feature', category: 'modify' },
    { label: '+ Add Section 180 compliance note', prompt: 'Add a note confirming that the borrowing is within the limits approved by shareholders under Section 180(1)(c)', category: 'add' },
    { label: '+ Add insurance clause', prompt: 'Add a clause authorizing creation of insurance on the assets being hypothecated as security, with bank as co-beneficiary', category: 'add' },
    { label: '− Remove personal guarantee', prompt: 'Remove any personal guarantee clause — this loan is purely corporate without personal guarantee from directors', category: 'remove' },
  ],

  'board-resolution-investment': [
    { label: '+ Add Section 186 compliance note', prompt: 'Add explicit compliance confirmation under Section 186 stating the investment is within statutory limits of 60% of paid-up capital and free reserves or 100% of free reserves whichever is higher', category: 'add' },
    { label: '+ Add risk disclosure clause', prompt: 'Add a clause acknowledging the investment carries market risks and directors have conducted due diligence', category: 'add' },
    { label: '+ Add rollover authorization', prompt: 'Add authorization to rollover/renew the Fixed Deposit on maturity at prevailing interest rates without fresh board resolution', category: 'add' },
    { label: '+ Add redemption authorization', prompt: 'Add authorization for premature redemption of the investment if required for business needs', category: 'add' },
    { label: '↕ Convert to inter-corporate loan', prompt: 'Convert this from investment to an inter-corporate loan resolution with interest rate and repayment terms as per Section 186', category: 'modify' },
    { label: '+ Add Board Report disclosure clause', prompt: 'Add clause noting this investment will be disclosed in the Annual Board Report under Section 186(4)', category: 'add' },
  ],

  'board-resolution-dividend': [
    { label: '+ Add TDS deduction clause', prompt: 'Add explicit clause about TDS deduction at 10% on dividend payments exceeding ₹5,000 per shareholder under Section 194 of Income Tax Act', category: 'add' },
    { label: '+ Add IEPF transfer clause', prompt: 'Add clause about transfer of unclaimed dividend to Investor Education and Protection Fund (IEPF) after 7 years', category: 'add' },
    { label: '+ Add separate bank account clause', prompt: 'Add clause directing opening of separate Unpaid Dividend Account and transfer of dividend within 5 days', category: 'add' },
    { label: '↕ Convert to interim dividend', prompt: 'Convert this from final dividend recommendation to interim dividend declaration by the Board under Section 123(3)', category: 'modify' },
    { label: '↕ Convert to final dividend', prompt: 'Convert this to final dividend recommendation by Board to shareholders for approval at AGM', category: 'modify' },
    { label: '+ Add ECS payment clause', prompt: 'Add authorization for payment of dividend through ECS/NECS directly to shareholders bank accounts', category: 'add' },
    { label: '+ Add stock exchange intimation', prompt: 'Add clause authorizing intimation to stock exchanges (BSE/NSE) within 30 minutes of board decision (for listed companies)', category: 'add' },
  ],

  'board-resolution-common-seal': [
    { label: '+ Add seal register maintenance clause', prompt: 'Add clause directing Company Secretary to maintain a Seal Register recording every use of seal with date, document name and authorizing signatories', category: 'add' },
    { label: '+ Add security custody clause', prompt: 'Add clause specifying the seal shall be kept in a locked safe at registered office and CS holds the key', category: 'add' },
    { label: '↕ Specify joint authorization for seal', prompt: 'Modify to require TWO authorized persons to be present whenever seal is affixed — one director and company secretary', category: 'modify' },
    { label: '+ Add lost seal procedure', prompt: 'Add clause specifying procedure if seal is lost or stolen — board must pass new resolution and inform ROC', category: 'add' },
    { label: '📋 Add note on optional nature', prompt: 'Add a note that common seal is optional under Companies Act 2013 as amended, and documents are equally valid without seal if signed by authorized persons', category: 'add' },
  ],

  'director-appointment-letter': [
    { label: '+ Add Schedule IV obligations', prompt: 'Add a clause listing the Independent Director obligations under Schedule IV (Code for Independent Directors) if this is an independent director appointment', category: 'add' },
    { label: '+ Add D&O insurance clause', prompt: 'Add clause stating the company will obtain Directors and Officers (D&O) liability insurance covering the director during their tenure', category: 'add' },
    { label: '+ Add data confidentiality clause', prompt: 'Add comprehensive confidentiality clause covering trade secrets, customer data, business strategies and financial information — both during and 3 years after tenure', category: 'add' },
    { label: '+ Add IP assignment clause', prompt: 'Add intellectual property assignment clause — all inventions, designs or improvements made during tenure belong to the company', category: 'add' },
    { label: '+ Add expense reimbursement clause', prompt: 'Add clause about reimbursement of travel, accommodation and out-of-pocket expenses incurred in performance of duties', category: 'add' },
    { label: '− Remove non-compete clause', prompt: 'Remove the non-compete restriction — this appointment does not include any non-compete obligation', category: 'remove' },
    { label: '↕ Add MD-level remuneration structure', prompt: 'Expand remuneration clause to include full MD-level structure: basic salary, perquisites, commission, incentives and retirement benefits as per Schedule V', category: 'modify' },
    { label: '+ Add governing law clause', prompt: 'Add clause specifying this agreement is governed by laws of India and disputes subject to jurisdiction of courts at [city of registered office]', category: 'add' },
  ],

  'partnership-deed': [
    { label: '+ Add banking single signatory operation', prompt: 'Add clause specifying the bank account can be operated by either partner individually up to a transaction limit of ₹50,000, and jointly for higher amounts', category: 'add' },
    { label: '+ Add admission of new partner clause', prompt: 'Add clause stating that new partners can be admitted to the firm only with the written consent of all existing partners', category: 'add' },
    { label: '+ Add partner salary cap', prompt: 'Add clause specifying the partner remuneration shall be capped strictly at the maximum permissible limit under Section 40(b)(v) of the Income Tax Act 1961', category: 'add' },
    { label: '+ Add partner loan interest rate', prompt: 'Add clause specifying that if any partner provides a loan to the firm, they shall receive simple interest at the rate of 12% per annum', category: 'add' },
    { label: '+ Add goodwill valuation formula', prompt: 'Add clause defining the goodwill valuation method (three times the average net profits of preceding three years) in case of retirement or death of a partner', category: 'add' },
    { label: '+ Add non-compete for outgoing partner', prompt: 'Add clause restricting a retiring partner from engaging in any competing business within a radius of 5 kilometers for a period of 2 years from their retirement', category: 'add' },
    { label: '+ Add accounting system details', prompt: 'Add clause specifying that the firm shall maintain books of account on a mercantile/accrual basis', category: 'add' },
    { label: '− Remove capital interest clause', prompt: 'Remove the clause providing interest on capital contributions—no interest shall be paid on partners capital', category: 'remove' },
    { label: '+ Add partner drawings limits', prompt: 'Add clause limiting monthly partner drawings to ₹25,000 without prior mutual consent', category: 'add' },
    { label: '+ Add dispute mediation step', prompt: 'Add clause mandating that before referring any dispute to arbitration, partners must first attempt resolution through good-faith mediation within 30 days', category: 'add' },
    { label: '+ Add intellectual property clause', prompt: 'Add clause specifying that any intellectual property developed by a partner during the partnership shall belong exclusively to the partnership firm', category: 'add' },
    { label: '+ Add specific partner roles', prompt: 'Add clause defining roles: Partner 1 shall manage daily sales and client relations, and Partner 2 shall manage finance, accounts, and administration', category: 'add' },
    { label: '+ Restrict dissolution by notice', prompt: 'Add clause stating that the partnership shall not be dissolved by notice by a single partner, but requires the mutual written consent of both partners', category: 'add' },
    { label: '↕ Update profit-sharing ratio', prompt: 'Modify the profit and loss sharing ratio to 60:40 between Partner 1 and Partner 2 respectively', category: 'modify' },
  ],

  'general-power-of-attorney': [
    { label: '🔒 Restrict property sale', prompt: 'Add a clause explicitly prohibiting the attorney from selling, transferring, or creating third-party rights on any immovable property (lease and maintenance only)', category: 'modify' },
    { label: '⏳ Limit validity duration', prompt: 'Limit the power of attorney validity to a fixed duration of 1 year from the date of execution', category: 'modify' },
    { label: '📅 Add revocation notice period', prompt: 'Add a clause requiring a 30-day written notice for revocation of this power of attorney', category: 'add' },
    { label: '🚫 Remove power of substitution', prompt: 'Remove the power of substitution clause so that the attorney cannot delegate powers to a substitute', category: 'remove' },
    { label: '💰 Restrict borrowing/loans', prompt: 'Add a restriction that the attorney cannot borrow money or take loans on my behalf without prior written consent', category: 'modify' },
    { label: '📊 Add monthly account reporting', prompt: 'Add a clause requiring the attorney to submit a detailed monthly statement of accounts to me on or before the 10th of every month', category: 'add' },
    { label: '🔨 Exclude construction/demolition', prompt: 'Remove the power to construct, demolish, or rebuild properties from the attorney\'s scope of powers', category: 'remove' },
    { label: '🏦 Limit single bank transaction', prompt: 'Add a limit of ₹1,00,000 per banking transaction for operations conducted by the attorney', category: 'modify' },
    { label: '🏛️ Exclude trust/trustee powers', prompt: 'Delete the section authorizing the attorney to act in relation to trusts where I am a trustee or beneficiary', category: 'remove' },
    { label: '🏢 Exclude company promotion', prompt: 'Remove the powers allowing the attorney to promote or form new companies in my name', category: 'remove' },
    { label: '🛡️ Add principal indemnity', prompt: 'Add a clause where the principal agrees to indemnify the attorney for all lawful acts done in good faith within the scope of this GPA', category: 'add' },
    { label: '⚖️ Add governing law & jurisdiction', prompt: 'Add a governing law clause specifying Indian law and court jurisdiction at New Delhi', category: 'add' },
    { label: '🔑 Grant specific power of sale', prompt: 'Add a clause explicitly authorizing the attorney to sell and register a sale deed for the immovable properties listed in Schedule I', category: 'add' },
    { label: '👥 Add joint attorney operations', prompt: 'Add a requirement that if multiple attorneys are appointed, they must act and sign jointly for all transactions', category: 'add' },
  ],

  // Default suggestions for any unspecified template
  '_default': [
    { label: '+ Add confidentiality clause', prompt: 'Add a comprehensive confidentiality clause covering all business information, trade secrets and client data', category: 'add' },
    { label: '+ Add dispute resolution clause', prompt: 'Add a dispute resolution clause specifying arbitration under Arbitration and Conciliation Act 1996 with seat at [city]', category: 'add' },
    { label: '+ Add governing law clause', prompt: 'Add that this document is governed by laws of India and subject to jurisdiction of courts at the company\'s registered office city', category: 'add' },
    { label: '+ Add force majeure clause', prompt: 'Add a force majeure clause covering pandemic, natural disaster, government action and other unforeseeable events', category: 'add' },
    { label: '+ Add penalty clause', prompt: 'Add a clause specifying penalties for breach of any obligation in this document', category: 'add' },
    { label: '+ Add witness signatures block', prompt: 'Add signature blocks for two independent witnesses with name, address and signature lines', category: 'add' },
    { label: '🔤 Make more formal', prompt: 'Rewrite the entire document in more formal legal language — more precise, professional tone throughout', category: 'improve' },
    { label: '📝 Simplify language', prompt: 'Simplify the legal language to be clearer and easier to understand while keeping it legally valid', category: 'improve' },
    { label: '− Remove seal reference', prompt: 'Remove all references to company seal — it is optional under Companies Act 2013', category: 'remove' },
    { label: '↕ Add amendment clause', prompt: 'Add a clause that this document can only be amended by written consent of all parties', category: 'modify' },
  ],
}

export default function DocumentGeneratorPage() {
  const params = useParams()
  const slug = params.slug as string
  const router = useRouter()

  // Rule engine states
  const [fuzzyMatch, setFuzzyMatch] = useState<{ intentId: string; intent: string; confidence: number; suggested_label: string } | null>(null)
  const [legalCardClauseId, setLegalCardClauseId] = useState<string | null>(null)
  const [legalCardOpen, setLegalCardOpen] = useState(false)
  const [lastAppliedClauseId, setLastAppliedClauseId] = useState<string | null>(null)
  const [errorCode, setErrorCode] = useState<string | null>(null)
  const [missingVariables, setMissingVariables] = useState<string[] | null>(null)
  const [requiresInputData, setRequiresInputData] = useState<{ clauseId: string; currentVariables: Record<string, string> } | null>(null)
  const [inputVariablesValues, setInputVariablesValues] = useState<Record<string, string>>({})
  const [hasCriticalConflict, setHasCriticalConflict] = useState(false)
  const [missingClauses, setMissingClauses] = useState<ClauseCheck[]>([])
  const [showClauseChecker, setShowClauseChecker] = useState(false)

  const [template, setTemplate] = useState<Template | null>(null)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [generatedContent, setGeneratedContent] = useState<string>('')
  const [documentId, setDocumentId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [editInstruction, setEditInstruction] = useState('')
  const [editing, setEditing] = useState(false)
  const [letterheadUrl, setLetterheadUrl] = useState<string | null>(null)
  const [letterheadUploading, setLetterheadUploading] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [useAi, setUseAi] = useState(true)
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'ai'; text: string }[]>([])
  const [generationError, setGenerationError] = useState<string | null>(null)
  const [generationWarning, setGenerationWarning] = useState<string | null>(null)
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(null)

  // Letterhead states
  const [showLetterheadModal, setShowLetterheadModal] = useState(false)
  const [pendingLetterheadFile, setPendingLetterheadFile] = useState<File | null>(null)
  const [letterheadType, setLetterheadType] = useState<'full_page' | 'top_only' | 'footer_only' | 'top_bottom_footer' | 'logo_only' | 'watermark' | null>(null)
  const [suppressCompanyDetails, setSuppressCompanyDetails] = useState(true)
  const [autoAdjustMargins, setAutoAdjustMargins] = useState(true)
  const [preserveA4Layout, setPreserveA4Layout] = useState(true)
  const [maintainEditableText, setMaintainEditableText] = useState(true)
  const [customMarginTop, setCustomMarginTop] = useState(180)
  const [customMarginBottom, setCustomMarginBottom] = useState(120)
  const [customMarginSide, setCustomMarginSide] = useState(54)

  // Auto-detection states
  const [autoDetecting, setAutoDetecting] = useState(false)
  const [autoDetectProgress, setAutoDetectProgress] = useState(0)
  const [detectedType, setDetectedType] = useState<string | null>(null)
  const [manualSelectionRequired, setManualSelectionRequired] = useState(false)

  // Load template
  useEffect(() => {
    if (!slug) return
    // Prevent redundant fetches if the template is already loaded for this slug
    if (template && (template.slug === slug || template.slug.replace(/_/g, '-') === slug)) return

    setLoading(true)
    setErrorCode(null)
    fetch(`/api/documents/${slug}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) {
          setErrorCode(d.code || 'UNKNOWN')
          return
        }
        setTemplate(d.template)
        // Pre-fill defaults
        const defaults: Record<string, string> = {}
        const today = new Date().toISOString().split('T')[0]
        d.template?.fields?.forEach((f: Field) => {
          if (f.type === 'date') {
            defaults[f.id] = today
          }
        })
        setFormData(defaults)
      })
      .catch(() => {
        setErrorCode('NETWORK_ERROR')
      })
      .finally(() => setLoading(false))
  }, [slug, template])

  // Letterhead upload trigger
  async function handleLetterheadUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0]
    if (!file) return

    const ext = file.name.split('.').pop()?.toLowerCase()

    if (ext === 'docx' || ext === 'doc') {
      setLetterheadUploading(true)
      try {
        const reader = new FileReader()
        reader.onload = async (evt) => {
          try {
            const arrayBuffer = evt.target?.result as ArrayBuffer
            const mammoth = await import('mammoth')
            const result = await mammoth.extractRawText({ arrayBuffer })
            const rawText = result.value

            // Perform dynamic placeholder substitution based on current form fields
            let processedText = rawText
            
            // Map formData keys case-insensitively to placeholders
            Object.entries(formData).forEach(([key, val]) => {
              const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'gi')
              processedText = processedText.replace(regex, val)
            })

            // Also check template fields explicitly
            template?.fields?.forEach((f) => {
              const val = formData[f.id] || ''
              const regex = new RegExp(`{{\\s*${f.id}\\s*}}`, 'gi')
              processedText = processedText.replace(regex, val)
            })

            setGeneratedContent(processedText)
          } catch (err) {
            console.error('Failed to parse DOCX template client-side:', err)
          } finally {
            setLetterheadUploading(false)
          }
        }
        reader.readAsArrayBuffer(file)
      } catch (err) {
        console.error('Failed to read file:', err)
        setLetterheadUploading(false)
      }
      e.target.value = ''
      return
    }

    if (ext === 'pdf') {
      setPendingLetterheadFile(file)
      setShowLetterheadModal(true)
    }
    e.target.value = ''
  }

  // Upload and confirm letterhead type selection
  async function handleConfirmLetterheadType(type: 'full_page' | 'top_only' | 'footer_only' | 'top_bottom_footer' | 'logo_only' | 'watermark') {
    setLetterheadType(type)
    
    // For logo_only, let's keep details checked by default but modifiable
    if (type === 'logo_only') {
      setSuppressCompanyDetails(false)
    } else {
      setSuppressCompanyDetails(true)
    }

    // Set custom margin states dynamically based on standard layouts
    if (type === 'full_page') {
      setCustomMarginTop(180); setCustomMarginBottom(120); setCustomMarginSide(54);
    } else if (type === 'top_only') {
      setCustomMarginTop(180); setCustomMarginBottom(54); setCustomMarginSide(54);
    } else if (type === 'footer_only') {
      setCustomMarginTop(54); setCustomMarginBottom(120); setCustomMarginSide(54);
    } else if (type === 'top_bottom_footer') {
      setCustomMarginTop(180); setCustomMarginBottom(120); setCustomMarginSide(54);
    } else if (type === 'logo_only') {
      setCustomMarginTop(120); setCustomMarginBottom(54); setCustomMarginSide(54);
    } else if (type === 'watermark') {
      setCustomMarginTop(72); setCustomMarginBottom(72); setCustomMarginSide(54);
    }

    if (!pendingLetterheadFile) {
      // Modifying type on already uploaded letterhead
      return
    }

    setLetterheadUploading(true)
    setShowLetterheadModal(false)

    try {
      const fd = new FormData()
      fd.append('file', pendingLetterheadFile)
      fd.append('type', type)
      
      const res = await fetch(
        '/api/documents/letterhead',
        { method: 'POST', body: fd }
      )
      const data = await res.json()
      const url = data.publicUrl || data.url
      if (url) {
        setLetterheadUrl(url)
      }
    } catch (err) {
      console.error('Failed to upload letterhead:', err)
    } finally {
      setLetterheadUploading(false)
      setPendingLetterheadFile(null)
      setDetectedType(null)
      setManualSelectionRequired(false)
      setAutoDetectProgress(0)
    }
  }

  // Auto-detect letterhead layout in the browser based on aspect ratio of PDF or image
  async function handleAutoDetect() {
    if (!pendingLetterheadFile) return
    setAutoDetecting(true)
    setAutoDetectProgress(15)

    const interval = setInterval(() => {
      setAutoDetectProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval)
          return 90
        }
        return prev + 15
      })
    }, 150)

    try {
      const ext = pendingLetterheadFile.name.split('.').pop()?.toLowerCase()
      let aspectRatio = 0.707

      if (ext === 'pdf') {
        const arrayBuffer = await pendingLetterheadFile.arrayBuffer()
        const { PDFDocument } = await import('pdf-lib')
        const pdfDoc = await PDFDocument.load(arrayBuffer)
        const firstPage = pdfDoc.getPages()[0]
        if (firstPage) {
          const { width, height } = firstPage.getSize()
          aspectRatio = width / height
        }
      } else {
        const img = new Image()
        const objectUrl = URL.createObjectURL(pendingLetterheadFile)
        img.src = objectUrl

        await new Promise((resolve) => {
          img.onload = resolve
        })
        aspectRatio = img.naturalWidth / img.naturalHeight
      }

      clearInterval(interval)
      setAutoDetectProgress(100)
      
      // Artificial delay for smooth premium experience
      await new Promise(r => setTimeout(r, 600))

      let typeResult: 'full_page' | 'top_only' | 'footer_only' | 'top_bottom_footer' | 'logo_only' | 'watermark' = 'top_only'

      if (aspectRatio < 0.85) {
        // Tall portrait page frame/background
        setManualSelectionRequired(true)
        setDetectedType('portrait')
        setAutoDetecting(false)
        return
      } else if (aspectRatio > 2.2) {
        // Horizontal banner
        typeResult = 'top_only'
      } else {
        // Square or compact logo
        typeResult = 'logo_only'
      }

      await handleConfirmLetterheadType(typeResult)
    } catch (err) {
      console.error('Auto detect error:', err)
      setManualSelectionRequired(true)
    } finally {
      setAutoDetecting(false)
    }
  }

  // Clean company metadata duplicates from the generated draft header dynamically
  function getCleanedContent(content: string) {
    if (!content) return ''

    // Determine if we should suppress company details from the document text body.
    // Clean if suppressCompanyDetails is checked, or if there is an active letterhead that covers header/footer.
    // Restrict this cleanup to board resolutions only to avoid stripping preamble party details in contracts/agreements.
    const shouldClean = (suppressCompanyDetails || (letterheadUrl && (
      letterheadType === 'full_page' || 
      letterheadType === 'top_only' || 
      letterheadType === 'top_bottom_footer'
    ))) && template?.category === 'board_resolution';

    if (!shouldClean) return content

    const lines = content.split('\n')
    const cleaned: string[] = []
    
    // Look up company name, CIN, and address by checking all keys case-insensitively
    let compName = ''
    let cin = ''
    let address = ''

    Object.entries(formData).forEach(([key, val]) => {
      const k = key.toUpperCase()
      if (k.includes('COMPANY') && k.includes('NAME')) compName = val
      else if (k === 'COMPANY_NAME' || k === 'COMPANYNAME') compName = val
      else if (k.includes('CIN')) cin = val
      else if (k.includes('ADDRESS') || k.includes('OFFICE') || k.includes('VENUE')) address = val
    })

    // Fallback to standard lookups if still empty
    if (!compName) compName = formData.COMPANY_NAME || formData.company_name || formData.Company_Name || formData.name || ''
    if (!cin) cin = formData.CIN || formData.cin || formData.company_cin || formData.COMPANY_CIN || ''
    if (!address) address = formData.REGISTERED_OFFICE || formData.registered_office || formData.address || ''

    let headerAreaEnded = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      const lineUpper = line.toUpperCase()

      // Only check for suppression in the first 15 lines of the document, and before headerAreaEnded is true
      if (i < 15 && !headerAreaEnded) {
        // If we hit standard resolution body markers, we stop the header suppression sweep immediately
        const isResolutionTitle = 
          lineUpper.includes('RESOLVED THAT') ||
          lineUpper.includes('RESOLVED FURTHER') ||
          lineUpper.includes('CERTIFIED TRUE COPY') ||
          lineUpper.includes('MINUTES OF') ||
          lineUpper.includes('BOARD OF DIRECTORS') ||
          lineUpper.includes('DIRECTORS PRESENT') ||
          lineUpper.includes('CHAIRPERSON:') ||
          lineUpper.includes('HELD ON');

        if (isResolutionTitle) {
          headerAreaEnded = true;
          cleaned.push(lines[i]);
          continue;
        }

        // 1. Skip empty lines or standard horizontal divider lines
        if (line === '' || /^[-=_*#\s]+$/.test(line)) {
          continue
        }

        // 2. Matching using active formData values
        const isNameMatch = compName && (
          lineUpper === compName.toUpperCase() ||
          lineUpper.includes(compName.toUpperCase()) ||
          compName.toUpperCase().includes(lineUpper) && lineUpper.length > 5
        )

        const isCinMatch = cin && (
          lineUpper.includes('CIN') ||
          lineUpper.includes(cin.toUpperCase()) ||
          cin.toUpperCase().includes(lineUpper) && lineUpper.length > 5
        )

        const isAddrMatch = address && (
          lineUpper.includes('REGISTERED OFFICE') ||
          lineUpper.includes(address.toUpperCase().substring(0, 15)) ||
          address.toUpperCase().includes(lineUpper) && lineUpper.length > 10
        )

        if (isNameMatch || isCinMatch || isAddrMatch) {
          continue
        }

        // 3. Smart Regex Pattern sweeps (handles template defaults/mocks)
        // A. CIN pattern (matches standard 21-digit Indian CIN like U72200MH2019PTC325678 or label CIN)
        const cinRegex = /[A-Z]\d{5}[A-Z]{2}\d{4}[A-Z]{3}\d{6}/i;
        const isCinPattern = cinRegex.test(line) || /^CIN\s*[:\-\s]*$/i.test(line);

        // B. Corporate Name patterns (e.g. Private Limited, Pvt Ltd, Ltd, LLP etc.)
        const isCorpNamePattern = /\b(pvt\b\.?\s*ltd|private\s+limited|limited|ltd|llp)\b/i.test(line);

        // C. Address patterns (e.g. registered office, road, avenue, floor, building, pincode)
        const isAddressPattern = /\b(registered\s+office|corp(orate)?\s+office|office|road|avenue|street|lane|marg|nagar|building|floor|plot|extension|delhi|mumbai|bangalore|bengaluru|chennai|kolkata|pune|hyderabad|gujarat|maharashtra|india|pincode|pin\s*code)\b/i.test(line) || /\b\d{6}\b/.test(line);

        // D. Contact Details patterns (e.g. email, phone, tel, fax, website, www., email patterns)
        const isContactPattern = 
          lineUpper.includes('EMAIL:') || 
          lineUpper.includes('PHONE:') || 
          lineUpper.includes('WEBSITE:') || 
          lineUpper.includes('TEL:') ||
          lineUpper.includes('EMAIL') ||
          lineUpper.includes('FAX') ||
          lineUpper.includes('WWW.') ||
          lineUpper.includes('[TELEPHONE]') ||
          lineUpper.includes('[EMAIL]') ||
          /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/i.test(line) ||
          /\b(tel\b\.?|phone\b\.?|mob\b\.?)\s*[:\-\s]*/i.test(line);

        if (isCinPattern || isCorpNamePattern || isAddressPattern || isContactPattern) {
          continue
        }
      }

      cleaned.push(lines[i])
    }

    return cleaned.join('\n').trim()
  }

  // Generate document
  async function handleGenerate() {
    if (!template) return
    setGenerating(true)
    setGenerationError(null)
    setGenerationWarning(null)
    try {
      const res = await fetch(
        '/api/documents/generate',
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify({
            template_slug: slug,
            form_data: Object.fromEntries(
              Object.entries(formData).filter(([k]) => !k.endsWith('__mode'))
            ),
            use_ai: useAi,
          }),
        }
      )
      const data = await res.json()
      if (res.ok && data.content) {
        setGeneratedContent(data.content)
        setDocumentId(data.document_id)
        if (data.fell_back) {
          if (formData.custom_instructions && formData.custom_instructions.trim()) {
            setGenerationWarning('AI Quota Limit — Fallback Active. Please note that your custom instructions could not be automatically woven into the standard template clauses. We have appended them at the end of the document under "ADDITIONAL CONDITIONS / SPECIAL CLAUSES" for your manual review and editing.')
          } else {
            setGenerationWarning('Gemini AI daily rate limit or free tier quota exceeded. Your document has been successfully generated using the high-quality standard template format instead!')
          }
        }
        
        // Check for missing clauses
        if (template?.category !== 'board_resolution') {
          const missing = checkMissingClauses(
            data.content,
            template?.slug || '',
            template?.category || ''
          )
          const actuallyMissing = missing.filter(c => c.missing)
          
          // Lease-specific additional checks
          if (slug === 'lease-agreement') {
            const leaseSpecific = checkLeaseClauses(data.content).filter(c => c.missing)
            actuallyMissing.push(...leaseSpecific)
          }

          setMissingClauses(actuallyMissing)
          if (actuallyMissing.length > 0) {
            setShowClauseChecker(true)
          }
        }
      } else {
        setGenerationError(data.error || 'Failed to generate document. Please verify your form entries and try again.')
      }
    } catch (err: any) {
      console.error('Failed to generate document:', err)
      setGenerationError('A network or server error occurred. Please verify your connection.')
    } finally {
      setGenerating(false)
    }
  }

  // AI Edit
  async function handleAiEdit(confirmedIntentId?: string, overrideVars?: Record<string, string>) {
    const instruction = editInstruction.trim() || (fuzzyMatch ? fuzzyMatch.suggested_label : '');
    if (!instruction || !generatedContent) return
    setEditing(true)
    setGenerationError(null)
    try {
      const res = await fetch(
        '/api/documents/edit',
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify({
            document_id: documentId,
            current_content: generatedContent,
            edit_instruction: instruction,
            document_type: template?.name,
            intent_id: confirmedIntentId || undefined,
            variables: overrideVars || undefined,
          }),
        }
      )
      const data = await res.json()
      if (res.ok) {
        if (data.fuzzyMatch) {
          setFuzzyMatch(data.suggestion)
          setMissingVariables(null)
          setRequiresInputData(null)
        } else if (data.requiresInput) {
          setMissingVariables(data.missingVariables)
          setRequiresInputData({ clauseId: data.clauseId, currentVariables: data.currentVariables })
          setInputVariablesValues({})
          setFuzzyMatch(null)
        } else if (data.content) {
          setGeneratedContent(data.content)
          
          // Re-check missing clauses
          if (template?.category !== 'board_resolution') {
            const missing = checkMissingClauses(
              data.content,
              template?.slug || '',
              template?.category || ''
            )
            const actuallyMissing = missing.filter(c => c.missing)

            // Lease-specific additional checks
            if (slug === 'lease-agreement') {
              const leaseSpecific = checkLeaseClauses(data.content).filter(c => c.missing)
              actuallyMissing.push(...leaseSpecific)
            }

            setMissingClauses(actuallyMissing)
          }

          setChatHistory(prev => [
            ...prev,
            { role: 'user', text: instruction },
            { role: 'ai', text: data.source === 'rule_engine' ? '✓ Applied standard template from corporate compliance library.' : 'Done! Applied your changes.' }
          ])
          
          if (data.clauseId) {
            setLastAppliedClauseId(data.clauseId)
            setLegalCardClauseId(data.clauseId)
            setLegalCardOpen(true)
          }
          
          // Clear rule engine temporary states
          setFuzzyMatch(null)
          setMissingVariables(null)
          setRequiresInputData(null)
          setEditInstruction('')
        }
      } else {
        setGenerationError(data.error || 'Failed to apply AI edits. Please try rephrasing your instructions.')
      }
    } catch (err: any) {
      console.error('Failed to apply AI edits:', err)
      setGenerationError('A network or server error occurred during AI editing.')
    } finally {
      setEditing(false)
    }
  }

  // Download DOCX or PDF
  async function handleDownload(
    format: 'docx' | 'pdf'
  ) {
    if (!generatedContent) return
    setDownloading(true)
    try {
      const res = await fetch(
        '/api/documents/download',
        {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify({
            content: getCleanedContent(generatedContent),
            document_name: template?.name,
            letterhead_url: letterheadUrl,
            letterhead_type: letterheadType,
            format,
            custom_margin_top: customMarginTop,
            custom_margin_bottom: customMarginBottom,
            custom_margin_side: customMarginSide,
          }),
        }
      )
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${slug}.${format}`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      // Handle error silently
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 text-sm">
            Loading template...
          </p>
        </div>
      </div>
    )
  }

  if (errorCode === 'COLD_START') {
    return <DocumentRetry />
  }

  if (!template) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Template not found
      </div>
    )
  }

  const inputClass = `w-full border border-slate-300 
    rounded-xl px-3 py-2.5 text-sm text-navy
    focus:outline-none focus:ring-2 
    focus:ring-amber-400 focus:border-transparent
    bg-white`

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* Page header */}
      <div className="bg-navy py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <nav className="text-xs text-slate-400 mb-3">
            <a href="/documents" className="hover:text-amber-400">
              Documents
            </a>
            {' → '}
            <span className="text-slate-300">
              {template.name}
            </span>
          </nav>
          <h1 className="text-2xl md:text-3xl font-bold text-white font-heading">
            {template.name}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {template.description}
          </p>
          <div className="flex gap-3 mt-3 flex-wrap">
            <span className="text-xs bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full font-medium">
              📚 {formatTemplateSource(template.slug, template.source, template.category)}
            </span>
            <span className="text-xs bg-green-500/20 text-green-300 px-3 py-1 rounded-full font-medium">
              ⚖️ {template.regulation_reference}
            </span>
            {template.last_verified && (
              <span className="text-xs bg-slate-500/20 text-slate-300 px-3 py-1 rounded-full">
                ✓ Verified {new Date(template.last_verified)
                  .toLocaleDateString('en-IN', {
                    month: 'long', year: 'numeric'
                  })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* LEFT — Form */}
        <div className="space-y-6">
          
          {/* Letterhead upload */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5">
            <h3 className="font-bold text-navy text-sm mb-3 flex items-center gap-2">
              🏢 Company Letterhead & Template Setup
              <span className="text-slate-400 font-normal text-xs">
                (optional)
              </span>
            </h3>
            
            {letterheadUrl ? (
              <div className="space-y-4">
                <div className="relative border border-slate-200 rounded-xl p-3 bg-slate-50 flex items-center gap-3">
                  {letterheadUrl.toLowerCase().endsWith('.pdf') ? (
                    <div className="w-16 h-12 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-center text-lg flex-shrink-0 select-none">
                      📕
                    </div>
                  ) : (
                    <img 
                      src={letterheadUrl} 
                      alt="Letterhead preview"
                      className="w-16 h-12 object-contain bg-white border border-slate-200 rounded-lg"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-navy truncate">
                      {letterheadType === 'full_page' ? '✨ Full Page Stationery' :
                       letterheadType === 'top_only' ? '🔝 Header Only' :
                       letterheadType === 'footer_only' ? '🔽 Footer Only' :
                       letterheadType === 'top_bottom_footer' ? '🖼️ Header & Footer Frame' :
                       letterheadType === 'logo_only' ? '💼 Simple Logo Header' :
                       letterheadType === 'watermark' ? '✨ Watermark Only' : 'Letterhead'}
                    </p>
                    <button
                      onClick={() => {
                        setLetterheadUrl(null)
                        setLetterheadType(null)
                      }}
                      className="text-[10px] text-red-500 hover:text-red-700 font-semibold mt-0.5 block"
                    >
                      Remove letterhead
                    </button>
                  </div>
                </div>

                {/* Segmented radio layout selectors */}
                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <p className="text-[11px] font-bold text-navy uppercase tracking-wider">
                    Layout Configuration
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'full_page', label: 'Full Page', desc: 'Stationery Background', icon: '📄' },
                      { id: 'top_only', label: 'Header Only', desc: 'Top Banner Only', icon: '🔝' },
                      { id: 'footer_only', label: 'Footer Only', desc: 'Bottom Banner Only', icon: '🔽' },
                      { id: 'top_bottom_footer', label: 'Header + Footer', desc: 'Top & Bottom Frame', icon: '🖼️' },
                      { id: 'logo_only', label: 'Simple Logo', desc: 'Logo Header Only', icon: '💼' },
                      { id: 'watermark', label: 'Watermark', desc: 'Faint Center Emblem', icon: '✨' },
                    ].map(type => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => handleConfirmLetterheadType(type.id as any)}
                        className={`text-left p-2 border rounded-xl transition-all flex items-center gap-2 group ${
                          letterheadType === type.id
                            ? 'border-amber-400 bg-amber-50/50 ring-1 ring-amber-400 shadow-sm'
                            : 'border-slate-200 hover:border-amber-300 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-base flex-shrink-0">{type.icon}</span>
                        <div className="min-w-0">
                          <p className={`text-[10px] font-bold truncate ${letterheadType === type.id ? 'text-amber-800' : 'text-navy'}`}>
                            {type.label}
                          </p>
                          <p className="text-[8px] text-slate-400 font-medium truncate">
                            {type.desc}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Checklist options */}
                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <p className="text-[11px] font-bold text-navy uppercase tracking-wider">
                    Configuration Controls
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-2 rounded-lg border border-slate-200 hover:bg-slate-100/50 transition-colors">
                      <input 
                        type="checkbox"
                        checked={suppressCompanyDetails}
                        onChange={(e) => setSuppressCompanyDetails(e.target.checked)}
                        className="rounded text-amber-500 focus:ring-amber-400 h-3.5 w-3.5 border-slate-300"
                      />
                      <span className="text-[9px] font-semibold text-slate-600 select-none">
                        Hide duplicates
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-2 rounded-lg border border-slate-200 hover:bg-slate-100/50 transition-colors">
                      <input 
                        type="checkbox"
                        checked={autoAdjustMargins}
                        onChange={(e) => setAutoAdjustMargins(e.target.checked)}
                        className="rounded text-amber-500 focus:ring-amber-400 h-3.5 w-3.5 border-slate-300"
                      />
                      <span className="text-[9px] font-semibold text-slate-600 select-none">
                        Auto margins
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-2 rounded-lg border border-slate-200 hover:bg-slate-100/50 transition-colors">
                      <input 
                        type="checkbox"
                        checked={preserveA4Layout}
                        onChange={(e) => setPreserveA4Layout(e.target.checked)}
                        className="rounded text-amber-500 focus:ring-amber-400 h-3.5 w-3.5 border-slate-300"
                      />
                      <span className="text-[9px] font-semibold text-slate-600 select-none">
                        Preserve A4 layout
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer bg-slate-50 p-2 rounded-lg border border-slate-200 hover:bg-slate-100/50 transition-colors">
                      <input 
                        type="checkbox"
                        checked={maintainEditableText}
                        onChange={(e) => setMaintainEditableText(e.target.checked)}
                        className="rounded text-amber-500 focus:ring-amber-400 h-3.5 w-3.5 border-slate-300"
                      />
                      <span className="text-[9px] font-semibold text-slate-600 select-none">
                        Maintain text
                      </span>
                    </label>
                  </div>
                </div>

                {/* Interactive Writable Area Margin Sliders */}
                <div className="space-y-3 pt-3 border-t border-slate-100 mt-2">
                  <p className="text-[11px] font-bold text-navy uppercase tracking-wider flex items-center justify-between">
                    <span>📏 Adjust Writable Area Margins</span>
                  </p>
                  <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                    {/* Top Margin */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-semibold text-slate-600">
                        <span>Top Padding (Header Clearance)</span>
                        <span className="text-amber-600 font-bold">{customMarginTop} pt</span>
                      </div>
                      <input 
                        type="range" 
                        min="30" 
                        max="300" 
                        value={customMarginTop}
                        onChange={(e) => setCustomMarginTop(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                    </div>

                    {/* Bottom Margin */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-semibold text-slate-600">
                        <span>Bottom Padding (Footer Clearance)</span>
                        <span className="text-amber-600 font-bold">{customMarginBottom} pt</span>
                      </div>
                      <input 
                        type="range" 
                        min="30" 
                        max="300" 
                        value={customMarginBottom}
                        onChange={(e) => setCustomMarginBottom(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                    </div>

                    {/* Side Margin */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-semibold text-slate-600">
                        <span>Side Margin (Left & Right)</span>
                        <span className="text-amber-600 font-bold">{customMarginSide} pt</span>
                      </div>
                      <input 
                        type="range" 
                        min="20" 
                        max="150" 
                        value={customMarginSide}
                        onChange={(e) => setCustomMarginSide(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-amber-400 hover:bg-amber-50/50 transition-colors">
                <span className="text-2xl mb-1">📄</span>
                <span className="text-xs font-semibold text-slate-500 text-center">
                  {letterheadUploading 
                    ? 'Processing...' 
                    : 'Upload PDF Letterhead or Word Template'}
                </span>
                <span className="text-[10px] text-slate-400 mt-1 text-center px-2">
                  Accepts strictly .pdf, .docx, .doc (No image files)
                </span>
                <input
                  type="file"
                  accept=".pdf,.docx,.doc"
                  className="hidden"
                  onChange={handleLetterheadUpload}
                  disabled={letterheadUploading}
                />
              </label>
            )}
          </div>

          {/* AI toggle */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-navy">
                ✨ AI-Enhanced Generation
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                AI adds context and improves language
              </p>
            </div>
            <button
              onClick={() => setUseAi(p => !p)}
              className={`relative w-12 h-6 rounded-full transition-colors ${useAi ? 'bg-amber-400' : 'bg-slate-300'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${useAi ? 'translate-x-6' : ''}`} />
            </button>
          </div>

          {/* Form fields */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-5 py-3">
              <h3 className="font-bold text-navy text-sm">
                📝 Document Details
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Fill in the details below to generate your document
              </p>
            </div>
            
            <div className="p-5 space-y-4">
              {template.fields.map((field: Field) => (
                <div key={field.id}>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {field.label}
                    {field.required && (
                      <span className="text-red-500 ml-1">
                        *
                      </span>
                    )}
                  </label>

                  {field.type === 'textarea' ? (
                    <textarea
                      rows={3}
                      value={formData[field.id] || ''}
                      onChange={e => setFormData(p => ({
                        ...p, [field.id]: e.target.value
                      }))}
                      placeholder={field.placeholder}
                      className={inputClass}
                    />
                  ) : field.type === 'select' ? (
                    <>
                      <select
                        value={formData[`${field.id}__mode`] === 'custom' ? '__custom__' : (formData[field.id] || '')}
                        onChange={e => {
                          if (e.target.value === '__custom__') {
                            setFormData(p => ({ ...p, [`${field.id}__mode`]: 'custom', [field.id]: '' }))
                          } else {
                            setFormData(p => ({ ...p, [`${field.id}__mode`]: 'preset', [field.id]: e.target.value }))
                          }
                        }}
                        className={inputClass}
                      >
                        <option value="">Select...</option>
                        {field.options?.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                        <option value="__custom__">✏️ Other — type custom value</option>
                      </select>
                      {formData[`${field.id}__mode`] === 'custom' && (
                        <input
                          type="text"
                          value={formData[field.id] || ''}
                          onChange={e => setFormData(p => ({ ...p, [field.id]: e.target.value }))}
                          placeholder={field.placeholder || `Type custom ${field.label.toLowerCase()}`}
                          className={`${inputClass} mt-2`}
                          autoFocus
                        />
                      )}
                    </>

                  ) : (
                    <input
                      type={field.type}
                      value={formData[field.id] || ''}
                      onChange={e => setFormData(p => ({
                        ...p, [field.id]: e.target.value
                      }))}
                      placeholder={field.placeholder}
                      className={inputClass}
                      pattern={field.pattern}
                      title={field.help_text || field.placeholder}
                    />
                  )}

                  {field.help_text && (
                    <p className="text-xs text-slate-400 mt-1">
                      💡 {field.help_text}
                    </p>
                  )}
                </div>
              ))}

              {/* Additional Custom Instructions / Special Conditions */}
              <div className="border-t border-slate-100 pt-4 mt-2">
                <label className="block text-xs font-bold text-navy mb-1.5 flex items-center gap-1">
                  <span>💡</span> Additional Custom Instructions / Special Conditions (Optional)
                </label>
                <textarea
                  rows={3}
                  value={formData.custom_instructions || ''}
                  onChange={e => setFormData(p => ({
                    ...p, custom_instructions: e.target.value
                  }))}
                  placeholder="Specify details, e.g., why this document is being executed, any custom conditions/restrictions, or special clauses you want the AI to weave into the draft."
                  className={inputClass}
                />
                <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                  The AI will naturally incorporate these instructions, reasons, or conditions into the drafted document before generation.
                </p>
              </div>

              {generationError && (
                <div className="bg-red-50 border border-red-200 text-red-800 p-3.5 rounded-xl text-xs font-semibold leading-relaxed flex items-start gap-2.5 shadow-sm animate-fade-in mb-2 text-left">
                  <span className="text-sm">⚠️</span>
                  <div className="flex-1">
                    <p className="font-bold">Generation Failed</p>
                    <p className="text-red-600/90 font-medium mt-0.5">{generationError}</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setGenerationError(null)} 
                    className="text-red-400 hover:text-red-600 font-bold text-sm select-none"
                  >
                    ✕
                  </button>
                </div>
              )}

              {generationWarning && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3.5 rounded-xl text-xs font-semibold leading-relaxed flex items-start gap-2.5 shadow-sm animate-fade-in mb-2 text-left">
                  <span className="text-sm">⚡</span>
                  <div className="flex-1">
                    <p className="font-bold">AI Quota Limit — Fallback Active</p>
                    <p className="text-amber-700 font-medium mt-0.5">{generationWarning}</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setGenerationWarning(null)} 
                    className="text-amber-400 hover:text-amber-600 font-bold text-sm select-none"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Generate button */}
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full bg-amber-400 hover:bg-amber-500 text-navy font-bold py-3.5 rounded-xl text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-navy border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>✨ Generate Document</>
                )}
              </button>

            </div>
          </div>
        </div>

        {/* RIGHT — Preview + AI Editor */}
        <div className="space-y-6">
          
          {generatedContent ? (
            <>
              {/* Document preview */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center justify-between">
                  <h3 className="font-bold text-navy text-sm">
                    📄 Generated Document
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDownload('docx')}
                      disabled={downloading}
                      className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-60"
                    >
                      ⬇️ Word
                    </button>
                    <button
                      onClick={() => handleDownload('pdf')}
                      disabled={downloading}
                      className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-red-700 disabled:opacity-60"
                    >
                      ⬇️ PDF
                    </button>
                  </div>
                </div>

                {/* Pre-Download Compliance Conflict Sweep */}
                <div className="p-4 border-b border-slate-200 bg-slate-50/50">
                  <ConflictAuditor
                    documentText={generatedContent}
                    onAuditComplete={(hasCritical) => setHasCriticalConflict(hasCritical)}
                  />
                </div>

                {/* Document text preview in A4 page style */}
                <div className="p-4 bg-slate-100 border-t border-slate-200 overflow-x-auto flex justify-center select-none">
                  <div 
                    id="a4-preview-page"
                    className="bg-white shadow-md relative font-serif select-text transition-all duration-300"
                    style={{
                      width: '620px',
                      height: '877px', // Fixed A4 aspect ratio (620 x 877)
                    }}
                  >
                    {/* Render PDF background if letterhead is PDF */}
                    {letterheadUrl && letterheadUrl.toLowerCase().endsWith('.pdf') ? (
                      <iframe
                        src={`${letterheadUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                        className="absolute inset-0 w-full h-full border-0 pointer-events-none z-0 select-none opacity-85"
                        style={{ mixBlendMode: 'multiply' }}
                      />
                    ) : (letterheadType === 'full_page' || letterheadType === 'top_bottom_footer') && letterheadUrl ? (
                      <div 
                        className="absolute inset-0 w-full h-full pointer-events-none z-0"
                        style={{
                          backgroundImage: `url(${letterheadUrl})`,
                          backgroundSize: '100% 100%',
                          backgroundRepeat: 'no-repeat'
                        }}
                      />
                    ) : null}

                    {/* Render top header graphic if 'top_only' and not PDF */}
                    {letterheadType === 'top_only' && letterheadUrl && !letterheadUrl.toLowerCase().endsWith('.pdf') && (
                      <div className="absolute top-0 left-0 w-full h-[105px] pointer-events-none z-10 border-b border-slate-100">
                        <img 
                          src={letterheadUrl} 
                          alt="Top Header Banner" 
                          className="w-full h-full object-fill"
                        />
                      </div>
                    )}

                    {/* Render logo graphic if 'logo_only' and not PDF */}
                    {letterheadType === 'logo_only' && letterheadUrl && !letterheadUrl.toLowerCase().endsWith('.pdf') && (
                      <div className="absolute top-6 left-[45px] pointer-events-none z-10">
                        <img 
                          src={letterheadUrl} 
                          alt="Company Logo" 
                          className="h-[40px] w-auto object-contain"
                        />
                      </div>
                    )}

                    {/* Centered Watermark if watermark is selected and not PDF */}
                    {letterheadType === 'watermark' && letterheadUrl && !letterheadUrl.toLowerCase().endsWith('.pdf') && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-[0.06]">
                        <img 
                          src={letterheadUrl} 
                          alt="Watermark Logo" 
                          className="w-[200px] h-[200px] object-contain"
                        />
                      </div>
                    )}

                    {/* Scrollable text container constrained to the blank middle area */}
                    <div 
                      className="absolute overflow-y-auto select-text font-serif text-[11px] text-navy leading-relaxed py-4 whitespace-pre-wrap z-10"
                      style={{
                        top: `${customMarginTop}px`,
                        bottom: `${customMarginBottom}px`,
                        left: '0px',
                        right: '0px',
                        paddingLeft: `${customMarginSide}px`,
                        paddingRight: `${customMarginSide}px`,
                      }}
                    >
                      {getCleanedContent(generatedContent)}
                    </div>
                  </div>
                </div>
              </div>

              {showClauseChecker && missingClauses.length > 0 && (
                <div className="bg-white dark:bg-slate-800 border-2 border-amber-300 dark:border-amber-700 rounded-2xl overflow-hidden mb-4 animate-fade-in">
                  {/* Header */}
                  <div className="bg-amber-50 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-700 px-5 py-3 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-amber-900 dark:text-amber-300 text-sm flex items-center gap-2">
                        ⚡ {missingClauses.length} Recommended Clauses Not Found
                      </h3>
                      <p className="text-amber-700 dark:text-amber-400 text-xs mt-0.5">
                        Click any clause to add it to your document via AI
                      </p>
                    </div>
                    <button
                      onClick={() => setShowClauseChecker(false)}
                      className="text-amber-500 hover:text-amber-700 text-lg font-bold"
                    >
                      ×
                    </button>
                  </div>

                  {/* Missing clauses list */}
                  <div className="p-4 space-y-3">
                    {/* Critical first, then recommended, then optional */}
                    {(['critical', 'recommended', 'optional'] as const).map(importance => {
                      const clauses = missingClauses.filter(c => c.importance === importance)
                      if (clauses.length === 0) return null
                      
                      return (
                        <div key={importance} className="space-y-2">
                          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                            {getImportanceIcon(importance)} {getImportanceLabel(importance)} Clauses
                          </p>
                          <div className="grid grid-cols-1 gap-2">
                            {clauses.map(clause => (
                              <div
                                key={clause.id}
                                className="flex items-start justify-between gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700"
                              >
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-semibold text-navy dark:text-slate-100">
                                    {clause.name}
                                  </p>
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                    {clause.description}
                                  </p>
                                </div>
                                <button
                                  onClick={() => {
                                    setEditInstruction(clause.aiPrompt)
                                    setShowClauseChecker(false)
                                    // Scroll to AI editor
                                    document.getElementById('ai-editor')?.scrollIntoView({ behavior: 'smooth' })
                                  }}
                                  className="flex-shrink-0 text-xs bg-amber-400 hover:bg-amber-500 text-navy font-bold px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors"
                                >
                                  + Add
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                    
                    {/* Add all missing critical clauses at once */}
                    {missingClauses.filter(c => c.importance === 'critical').length > 1 && (
                      <button
                        onClick={() => {
                          const criticalPrompts = missingClauses
                            .filter(c => c.importance === 'critical')
                            .map(c => c.aiPrompt)
                            .join('. Also, ')
                          setEditInstruction(criticalPrompts)
                          setShowClauseChecker(false)
                          document.getElementById('ai-editor')?.scrollIntoView({ behavior: 'smooth' })
                        }}
                        className="w-full mt-2 bg-navy text-white text-xs font-bold py-2.5 rounded-xl hover:opacity-90 transition-opacity"
                      >
                        ⚡ Add All Critical Clauses at Once
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* AI Chat Editor */}
              <div id="ai-editor" className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-5 py-3">
                  <h3 className="font-bold text-navy text-sm">
                    🤖 AI Document Editor
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tell AI what to change, add or remove
                  </p>
                </div>

                {/* Chat history */}
                {chatHistory.length > 0 && (
                  <div className="p-4 space-y-2 max-h-40 overflow-y-auto border-b border-slate-100">
                    {chatHistory.map((msg, i) => (
                      <div key={i} className={`text-xs p-2 rounded-lg ${msg.role === 'user' ? 'bg-navy text-white ml-8' : 'bg-green-50 text-green-800 mr-8'}`}>
                        {msg.text}
                      </div>
                    ))}
                  </div>
                )}

                {/* Edit input */}
                <div className="p-4">
                  {fuzzyMatch && (
                    <FuzzyClarifier
                      suggestion={fuzzyMatch}
                      onConfirm={(intentId) => handleAiEdit(intentId)}
                      onDismiss={() => {
                        setFuzzyMatch(null)
                        handleAiEdit()
                      }}
                    />
                  )}

                  {missingVariables && missingVariables.length > 0 && requiresInputData && (
                    <div className="border border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800 rounded-lg p-4 mb-3 shadow-sm animate-fade-in">
                      <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1 flex items-center gap-1">
                        📋 Additional Information Required
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
                        Please fill in these details to automatically insert the standard compliance clause:
                      </p>
                      <div className="space-y-3 mb-3">
                        {missingVariables.map((varName) => (
                          <div key={varName}>
                            <label className="block text-[10px] font-bold text-blue-800 dark:text-blue-200 uppercase tracking-wider mb-1">
                              {varName.replace(/_/g, ' ')}
                            </label>
                            <input
                              type="text"
                              value={inputVariablesValues[varName] || ''}
                              onChange={(e) => setInputVariablesValues(prev => ({ ...prev, [varName]: e.target.value }))}
                              placeholder={`Enter ${varName.toLowerCase().replace(/_/g, ' ')}`}
                              className={`${inputClass} border-blue-300 focus:ring-blue-400`}
                            />
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAiEdit(undefined, { ...requiresInputData.currentVariables, ...inputVariablesValues })}
                          disabled={missingVariables.some(v => !inputVariablesValues[v]?.trim())}
                          className="px-3 py-1.5 text-xs font-semibold bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors disabled:opacity-50"
                        >
                          ✓ Submit & Apply
                        </button>
                        <button
                          onClick={() => {
                            setMissingVariables(null)
                            setRequiresInputData(null)
                            setInputVariablesValues({})
                          }}
                          className="px-3 py-1.5 text-xs font-semibold border border-blue-300 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-md transition-colors"
                        >
                          ✕ Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editInstruction}
                      onChange={e => setEditInstruction(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleAiEdit()
                        }
                      }}
                      placeholder='e.g. "Add confidentiality clause" or "Remove the seal clause"'
                      className={inputClass}
                    />
                    <button
                      onClick={() => handleAiEdit()}
                      disabled={editing || !editInstruction.trim()}
                      className="px-4 py-2 bg-navy text-white rounded-xl text-sm font-semibold hover:bg-navy/90 disabled:opacity-60 flex-shrink-0"
                    >
                      {editing ? '...' : '→'}
                    </button>
                  </div>
                  
                  {/* Document-specific AI suggestions */}
                  {(() => {
                    const suggestions = AI_SUGGESTIONS[slug] || 
                      AI_SUGGESTIONS['_default']
                    
                    const categoryColors = {
                      add: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
                      remove: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
                      modify: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
                      improve: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
                    }

                    const categoryIcons = {
                      add: '➕',
                      remove: '➖',
                      modify: '↕️',
                      improve: '✨',
                    }

                    // Group by category for better UX
                    const categories = ['add', 'remove', 'modify', 'improve'] as const
                    
                    return (
                      <div className="space-y-3 mt-3">
                        <p className="text-xs font-semibold 
                                      text-slate-500 uppercase 
                                      tracking-wide">
                          Quick edits for this document:
                        </p>
                        
                        {categories.map(cat => {
                          const catSuggestions = suggestions.filter(
                            s => s.category === cat
                          )
                          if (catSuggestions.length === 0) return null
                          
                          return (
                            <div key={cat}>
                              <p className="text-xs text-slate-400 
                                            mb-1.5 capitalize">
                                {categoryIcons[cat]} {cat === 'add' 
                                  ? 'Add clauses' : cat === 'remove' 
                                  ? 'Remove clauses' : cat === 'modify' 
                                  ? 'Modify structure' : 'Improve writing'}
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {catSuggestions.map(s => (
                                  <button
                                    key={s.label}
                                    onClick={() => 
                                      setEditInstruction(s.prompt)
                                    }
                                    className={`text-xs px-2.5 py-1 
                                      rounded-full border font-medium
                                      transition-colors
                                      ${categoryColors[s.category]}`}
                                  >
                                    {s.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })()}
                </div>
              </div>

              {/* What to do next — document specific */}
              {(() => {
                const steps = NEXT_STEPS[slug] || NEXT_STEPS['_default']
                return (
                  <div className="bg-blue-50  
                                  border border-blue-200 
                                   
                                  rounded-2xl overflow-hidden">
                    <div className="bg-blue-600 px-5 py-3">
                      <h3 className="font-bold text-white text-sm">
                        📋 {steps.title}
                      </h3>
                    </div>
                    <div className="p-5 space-y-3">
                      {steps.steps.map((step, i) => (
                        <div key={i} 
                             className={`flex items-start gap-3 
                               p-3 rounded-xl
                               ${step.urgent 
                                 ? 'bg-red-50  border border-red-300 ' 
                                 : 'bg-white '}`}>
                          <span className="flex-shrink-0 text-lg mt-0.5">
                            {step.icon}
                          </span>
                          <div className="min-w-0">
                            <p className={`text-sm font-semibold 
                              ${step.urgent 
                                ? 'text-red-800 ' 
                                : 'text-navy '}`}>
                              <span className="text-xs opacity-60 mr-1">
                                {i + 1}.
                              </span>
                              {step.text}
                            </p>
                            {step.note && (
                              <p className={`text-xs mt-1 
                                whitespace-pre-line leading-relaxed
                                ${step.urgent 
                                  ? 'text-red-600 ' 
                                  : 'text-slate-500 '}`}>
                                {step.note}
                              </p>
                            )}
                            {step.link && (
                              <a href={step.link.href}
                                 className="text-xs text-amber-600 
                                            underline font-semibold 
                                            mt-1 inline-block">
                                {step.link.text} →
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}
            </>
          ) : (
            /* Empty state */
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="font-bold text-navy text-lg mb-2">
                Your document will appear here
              </h3>
              <p className="text-slate-500 text-sm">
                Fill in the form on the left and click "Generate Document" to create your legally formatted document instantly.
              </p>
            </div>
          )}
        </div>
      </div>

      {slug === 'lease-agreement' && (
        <div className="border-t border-slate-200 dark:border-slate-800 pt-12 mt-12 space-y-12">
          {/* Section 1: Educational Legal Content */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
            <h2 className="text-2xl md:text-3xl font-bold font-heading text-navy dark:text-white mb-6 flex items-center gap-2">
              <span>⚖️</span> Immovable Property Lease Law — Transfer of Property Act, 1882
            </h2>
            
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-8">
              A lease of immovable property is not merely a contract; it is a transfer of an interest in the property. In India, leases are primarily governed by Chapter V of the <strong>Transfer of Property Act, 1882</strong> (TPA), along with the <strong>Registration Act, 1908</strong> and state-specific Rent Control Acts. Understanding the legal framework is essential for both landlords (lessors) and tenants (lessees) to safeguard their interests.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-900 space-y-2">
                <div className="text-amber-500 font-bold text-xs uppercase tracking-wide">Section 105 TPA</div>
                <h3 className="font-bold text-navy dark:text-slate-200 text-base">Definition of Lease</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                  A lease is a transfer of a right to enjoy such property, made for a certain time, express or implied, or in perpetuity, in consideration of a price paid or promised, or of money, a share of crops, service or any other thing of value.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-900 space-y-2">
                <div className="text-amber-500 font-bold text-xs uppercase tracking-wide">Section 107 TPA & Sec 17 Registration Act</div>
                <h3 className="font-bold text-navy dark:text-slate-200 text-base">Registration Requirements</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                  Leases from year to year, or for any term exceeding one year, or reserving a yearly rent, can be made <strong>only by a registered instrument</strong>. Leases of 11 months or less do not require compulsory registration, though notarization is standard practice.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-900 space-y-2">
                <div className="text-amber-500 font-bold text-xs uppercase tracking-wide">Section 108 TPA</div>
                <h3 className="font-bold text-navy dark:text-slate-200 text-base">Rights & Liabilities</h3>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                  Defines default statutory obligations unless modified by agreement: Landlord must ensure peaceful possession (quiet enjoyment) and major repairs; tenant must pay rent timely, use property reasonably, and refrain from structural changes.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: FAQs Accordion */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm">
            <h2 className="text-2xl md:text-3xl font-bold font-heading text-navy dark:text-white mb-2 text-center">
              Frequently Asked Questions (FAQs)
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 text-center max-w-2xl mx-auto">
              Clear answers to the most common legal and tax queries concerning rent agreements and lease deeds in India.
            </p>

            <div className="space-y-4 max-w-3xl mx-auto">
              {[
                {
                  q: "What is the difference between a Lease Agreement and a License Agreement?",
                  a: "A Lease (governed by the Transfer of Property Act, 1882) transfers an interest in the property, creating tenancy rights and granting exclusive possession. It is relatively difficult for landlords to evict tenants under a lease. A License (governed by the Indian Easements Act, 1882) only grants permission to occupy the property without transferring any interest. License agreements (commonly called Leave and License) are preferred for residential lettings as they simplify eviction."
                },
                {
                  q: "Why are rent agreements commonly drawn for 11 months in India?",
                  a: "Under Section 17 of the Registration Act, 1908, leases exceeding 12 months require compulsory registration at the Sub-Registrar's office, involving expensive stamp duty and registration fees. To avoid these costs and lengthy administrative procedures, landlords and tenants routinely sign 11-month agreements, which can be notarized on non-judicial stamp paper."
                },
                {
                  q: "What is the stamp duty rate on Lease Deeds in India?",
                  a: "Stamp duty is state-specific and is calculated as a percentage of the annual rent plus any security deposit or premium. For instance, in Maharashtra, the stamp duty is 0.25% of the total rent payable for the entire period. In Delhi, it ranges from 2% to 3% of the average annual rent depending on the term. E-stamp paper can be bought online via SHCIL or authorized state portals."
                },
                {
                  q: "Who is responsible for repairs in a leased property?",
                  a: "Under Section 108 of the Transfer of Property Act, the Lessor (Landlord) is responsible for all major structural repairs (such as wall cracks, roof leakage, structural plumbing, and external electrical lines) to keep the premises fit for habitability. The Lessee (Tenant) is responsible for day-to-day minor maintenance (e.g., replacement of bulbs, tap washers, minor cleaning, and repairing fixtures damaged due to negligence)."
                },
                {
                  q: "Is TDS applicable on monthly rent payments?",
                  a: "Yes, under the Income Tax Act, 1961: (1) Section 194I: Companies, Partnership Firms, and Sole Proprietorships (subject to tax audit) must deduct TDS at 10% on annual rent payments exceeding ₹2,40,000. (2) Section 194IB: Individuals and HUFs not subject to audit must deduct TDS at 5% if the monthly rent exceeds ₹50,000. The tenant must submit Form 26QC or Form 26Q to deposit this tax."
                }
              ].map((faq, idx) => {
                const isOpen = openFaqIdx === idx;
                return (
                  <div key={idx} className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                      className="w-full flex justify-between items-center px-5 py-4 text-left font-bold text-navy dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors text-sm md:text-base"
                    >
                      <span>{faq.q}</span>
                      <span className="text-amber-500 font-extrabold text-xl leading-none">
                        {isOpen ? '−' : '+'}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 pt-1 text-slate-600 dark:text-slate-400 text-xs md:text-sm leading-relaxed border-t border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/10">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Letterhead Classification Dialog Modal */}
      {showLetterheadModal && pendingLetterheadFile && (
        <div className="fixed inset-0 bg-navy/65 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <style>{`
            @keyframes scan {
              0% { top: 0%; opacity: 0.8; }
              50% { top: 100%; opacity: 1; }
              100% { top: 0%; opacity: 0.8; }
            }
            .animate-scan {
              animation: scan 2s linear infinite;
              position: absolute;
            }
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            .animate-fade-in {
              animation: fadeIn 0.2s ease-out forwards;
            }
          `}</style>
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] flex flex-col relative overflow-hidden">
            
            {/* Decorative colored glow bar at top */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-400 via-yellow-500 to-blue-600" />
            
            <div className="flex items-center justify-between mb-4 mt-2">
              <div>
                <h2 className="text-xl font-extrabold text-navy font-heading flex items-center gap-2">
                  <span>🏢</span> Which type of letterhead is this?
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select the letterhead format so we can optimize document padding, margins, and prevent overlaps.
                </p>
              </div>
              <button 
                onClick={() => {
                  setShowLetterheadModal(false)
                  setPendingLetterheadFile(null)
                }}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Body: Split view */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 overflow-y-auto flex-1 pr-1 pb-4">
              
              {/* Left Column: Image Preview */}
              <div className="md:col-span-2 space-y-4">
                <div className="border border-slate-200 rounded-2xl p-3 bg-slate-50 relative flex flex-col justify-center items-center h-52 overflow-hidden shadow-inner select-none">
                  
                  {pendingLetterheadFile.name.toLowerCase().endsWith('.pdf') ? (
                    <iframe
                      src={`${URL.createObjectURL(pendingLetterheadFile)}#toolbar=0&navpanes=0&scrollbar=0`}
                      className="w-full h-full border-0 rounded bg-white pointer-events-none z-0"
                    />
                  ) : (
                    <img 
                      src={URL.createObjectURL(pendingLetterheadFile)} 
                      alt="Pending upload preview"
                      className="max-w-full max-h-full object-contain bg-white rounded shadow-sm"
                    />
                  )}

                  {/* Scanning overlay bar */}
                  {autoDetecting && (
                    <div className="absolute left-0 right-0 w-full h-1 bg-gradient-to-r from-amber-400 to-yellow-500 animate-scan shadow-lg shadow-amber-400 z-10" />
                  )}
                  
                  {autoDetecting && (
                    <div className="absolute inset-0 bg-amber-400/5 backdrop-blur-[0.5px] flex flex-col justify-center items-center z-10">
                      <div className="bg-navy/80 text-white text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full shadow animate-pulse">
                        Scanning structure...
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="text-[10px] text-slate-400 text-center font-medium bg-slate-50 py-1.5 px-3 rounded-lg border border-slate-100 truncate">
                  File: <span className="text-slate-600 font-semibold">{pendingLetterheadFile.name}</span> ({(pendingLetterheadFile.size / 1024).toFixed(1)} KB)
                </div>

                {/* Auto-detect progress */}
                {autoDetecting && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-navy">
                      <span>Analyzing layout aspect ratio...</span>
                      <span>{autoDetectProgress}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 transition-all duration-300 rounded-full" 
                        style={{ width: `${autoDetectProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Low confidence warning */}
                {manualSelectionRequired && (
                  <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-xl space-y-1">
                    <p className="text-xs font-bold flex items-center gap-1">
                      ⚠️ Aspect ratio classification split
                    </p>
                    <p className="text-[10px] leading-relaxed text-red-700 font-medium">
                      A tall A4 Portrait format was detected. Since confidence is low to distinguish between Full Background Stationery vs Header/Footer Frame, please select manual category.
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column: Choices */}
              <div className="md:col-span-3 space-y-2.5 overflow-y-auto max-h-[50vh] pr-1">
                
                {/* Option 1: Full Page Stationery */}
                <button
                  disabled={autoDetecting}
                  type="button"
                  onClick={() => handleConfirmLetterheadType('full_page')}
                  className="w-full text-left p-3 border border-slate-200 rounded-2xl hover:border-amber-400 hover:bg-amber-50/30 transition-all flex items-start gap-3 group hover:shadow-sm"
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-base flex-shrink-0 group-hover:bg-amber-400 transition-colors">
                    📄
                  </div>
                  <div>
                    <h4 className="text-[11px] font-extrabold text-navy group-hover:text-amber-600 transition-colors uppercase tracking-wider">
                      1. Full Page Background
                    </h4>
                    <p className="text-[10px] leading-relaxed text-slate-500 font-medium mt-0.5">
                      Fills the full background. Suppresses duplicate details in the draft and sets margins to clear top/bottom logos.
                    </p>
                  </div>
                </button>

                {/* Option 2: Top Banner */}
                <button
                  disabled={autoDetecting}
                  type="button"
                  onClick={() => handleConfirmLetterheadType('top_only')}
                  className="w-full text-left p-3 border border-slate-200 rounded-2xl hover:border-amber-400 hover:bg-amber-50/30 transition-all flex items-start gap-3 group hover:shadow-sm"
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-base flex-shrink-0 group-hover:bg-blue-400 transition-colors">
                    🔝
                  </div>
                  <div>
                    <h4 className="text-[11px] font-extrabold text-navy group-hover:text-blue-600 transition-colors uppercase tracking-wider">
                      2. Top Header Only
                    </h4>
                    <p className="text-[10px] leading-relaxed text-slate-500 font-medium mt-0.5">
                      Places image banner at the top. Body text starts below header area and suppresses duplicate details.
                    </p>
                  </div>
                </button>

                {/* Option 3: Footer Banner */}
                <button
                  disabled={autoDetecting}
                  type="button"
                  onClick={() => handleConfirmLetterheadType('footer_only')}
                  className="w-full text-left p-3 border border-slate-200 rounded-2xl hover:border-amber-400 hover:bg-amber-50/30 transition-all flex items-start gap-3 group hover:shadow-sm"
                >
                  <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center text-base flex-shrink-0 group-hover:bg-orange-400 transition-colors">
                    🔽
                  </div>
                  <div>
                    <h4 className="text-[11px] font-extrabold text-navy group-hover:text-orange-600 transition-colors uppercase tracking-wider">
                      3. Bottom Footer Only
                    </h4>
                    <p className="text-[10px] leading-relaxed text-slate-500 font-medium mt-0.5">
                      Places graphics at the bottom. Body text has extra bottom spacing to clear signatures and logos safely.
                    </p>
                  </div>
                </button>

                {/* Option 4: Header and Footer frame */}
                <button
                  disabled={autoDetecting}
                  type="button"
                  onClick={() => handleConfirmLetterheadType('top_bottom_footer')}
                  className="w-full text-left p-3 border border-slate-200 rounded-2xl hover:border-amber-400 hover:bg-amber-50/30 transition-all flex items-start gap-3 group hover:shadow-sm"
                >
                  <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center text-base flex-shrink-0 group-hover:bg-purple-400 transition-colors">
                    🖼️
                  </div>
                  <div>
                    <h4 className="text-[11px] font-extrabold text-navy group-hover:text-purple-600 transition-colors uppercase tracking-wider">
                      4. Header + Footer Frame
                    </h4>
                    <p className="text-[10px] leading-relaxed text-slate-500 font-medium mt-0.5">
                      Uses image as fixed frame. Keeps text inside middle space, keeping signatures safely above footer graphic.
                    </p>
                  </div>
                </button>

                {/* Option 5: Simple Logo */}
                <button
                  disabled={autoDetecting}
                  type="button"
                  onClick={() => handleConfirmLetterheadType('logo_only')}
                  className="w-full text-left p-3 border border-slate-200 rounded-2xl hover:border-amber-400 hover:bg-amber-50/30 transition-all flex items-start gap-3 group hover:shadow-sm"
                >
                  <div className="w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center text-base flex-shrink-0 group-hover:bg-green-400 transition-colors">
                    💼
                  </div>
                  <div>
                    <h4 className="text-[11px] font-extrabold text-navy group-hover:text-green-600 transition-colors uppercase tracking-wider">
                      5. Simple Logo Header Only
                    </h4>
                    <p className="text-[10px] leading-relaxed text-slate-500 font-medium mt-0.5">
                      Places logo at top-left. Only prints company name and CIN if they are not already embedded inside the logo.
                    </p>
                  </div>
                </button>

                {/* Option 6: Watermark */}
                <button
                  disabled={autoDetecting}
                  type="button"
                  onClick={() => handleConfirmLetterheadType('watermark')}
                  className="w-full text-left p-3 border border-slate-200 rounded-2xl hover:border-amber-400 hover:bg-amber-50/30 transition-all flex items-start gap-3 group hover:shadow-sm"
                >
                  <div className="w-8 h-8 rounded-xl bg-teal-100 flex items-center justify-center text-base flex-shrink-0 group-hover:bg-teal-400 transition-colors">
                    ✨
                  </div>
                  <div>
                    <h4 className="text-[11px] font-extrabold text-navy group-hover:text-teal-600 transition-colors uppercase tracking-wider">
                      6. Centered Faded Watermark
                    </h4>
                    <p className="text-[10px] leading-relaxed text-slate-500 font-medium mt-0.5">
                      Places a faded watermark emblem in the exact center of the page at 5% opacity.
                    </p>
                  </div>
                </button>

                {/* Option 7: Auto-detect */}
                <button
                  disabled={autoDetecting}
                  type="button"
                  onClick={handleAutoDetect}
                  className="w-full text-left p-3 border border-dashed border-amber-400 bg-amber-50/10 hover:bg-amber-50/50 rounded-2xl hover:border-amber-500 transition-all flex items-start gap-3 group hover:shadow-sm"
                >
                  <div className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-600 flex items-center justify-center text-base flex-shrink-0 group-hover:bg-amber-400 group-hover:text-navy transition-colors">
                    🚀
                  </div>
                  <div>
                    <h4 className="text-[11px] font-extrabold text-amber-600 uppercase tracking-wider">
                      7. Auto-detect layout
                    </h4>
                    <p className="text-[10px] leading-relaxed text-slate-500 font-medium mt-0.5">
                      Scans vector bounds and aspect ratio to recognize top header, bottom footer, watermark or background stationery.
                    </p>
                  </div>
                </button>

              </div>
            </div>
          </div>
        </div>
      )}
      {/* Legal Basis Sidebar Card */}
      <LegalBasisCard
        clauseId={legalCardClauseId}
        isOpen={legalCardOpen}
        onClose={() => setLegalCardOpen(false)}
      />
    </div>
  )
}
