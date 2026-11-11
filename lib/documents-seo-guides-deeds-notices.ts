import type { DocumentSeoGuide } from './documents-seo-guides-types'

export const DEEDS_NOTICES_SEO_GUIDES: Record<string, DocumentSeoGuide> = {
  'english-mortgage-deed': {
    slug: 'english-mortgage-deed',
    seoTitle: 'Free English Mortgage Deed Format India u/s 58(e) TPA (Word/PDF)',
    metaDescription:
      'Download English Mortgage Deed format under Section 58(e) of Transfer of Property Act, 1882. Includes personal repayment covenant & reconveyance in Word & PDF.',
    keywords: [
      'english mortgage deed format india',
      'section 58(e) transfer of property act mortgage',
      'english mortgage format word pdf free',
      'property mortgage deed registration india',
    ],
    h1: 'Free English Mortgage Deed Format India — Section 58(e) TPA (Word/PDF)',
    heroBadge: 'Transfer of Property Act, 1882 — Section 58(e) & 59',
    introSummary:
      'Generate a comprehensive English Mortgage Deed under Section 58(e) of the Transfer of Property Act, 1882, containing the mortgagor’s personal covenant to repay on a fixed due date, absolute transfer of property subject to reconveyance proviso, and property schedule.',
    quickSummary: [
      { label: 'Governing Law', value: 'Section 58(e) (definition), Section 59 (registration & attestation), & Section 69 (power of sale scope) of Transfer of Property Act, 1882' },
      { label: 'Three Defining Ingredients', value: '1. Mortgagor binds himself personally to repay on a certain date -> 2. Transfers the mortgaged property absolutely to Mortgagee -> 3. Subject to proviso of re-transfer upon full payment' },
      { label: 'Mandatory Registration', value: 'Under Section 59 TPA & Section 17 Registration Act, 1908: Compulsory registration via Sub-Registrar & attestation by at least 2 witnesses where principal >= Rs. 100' },
      { label: 'Stamp Duty', value: 'Governed by the applicable State Stamp Act (ad valorem % on secured loan amount; typically payable prior to Sub-Registrar execution via e-Stamping/franked GRAS)' },
      { label: 'Company Borrower Filing', value: 'If Mortgagor is an Indian company/LLP: additionally file MCA Form CHG-1 (company) or Form 8 (LLP) within 30 days of deed execution' },
    ],
    whenRequired: [
      'Structuring commercial real estate debt, promoter bridge financing, or institutional lending where the lender seeks personal covenant plus conditional re-transfer protection.',
      'Documenting secured debt over freehold land, factory sheds, or commercial premises where power of sale remedies (within Section 69 statutory bounds) are negotiated.',
      'Refinancing existing secured debt requiring execution of a formal registered mortgage deed rather than deposit of title deeds.',
      'Creating an auditable security instrument backed by Sub-Registrar registration and MCA Charge Form CHG-1.',
    ],
    clausesExplained: [
      {
        title: 'Personal Covenant to Repay on Fixed Due Date',
        summary:
          'Expressly binds the Mortgagor personally to repay principal and stipulated interest by the fixed date — an essential statutory hallmark distinguishing an English Mortgage from a Usufructuary or Conditional Sale mortgage.',
      },
      {
        title: 'Absolute Transfer with Proviso for Reconveyance',
        summary:
          'Transfers legal estate in the scheduled property to the Mortgagee, paired with an express mandatory covenant to re-convey upon complete satisfaction of debt.',
      },
      {
        title: 'Title Assurance, Maintenance & Encumbrance Warranties',
        summary:
          'Protects lender priority with representations on clear marketable title, municipal tax compliance, and non-creation of prior charges.',
      },
      {
        title: 'Two-Witness Attestation & Schedule Block',
        summary:
          'Provides two witness blocks as strictly mandated by Section 59 of the Transfer of Property Act, 1882 alongside a bordered Property Schedule box.',
      },
    ],
    executionChecklist: [
      'Conduct minimum 13–30 years’ non-encumbrance title search and verify original title chain before drafting the Property Schedule.',
      'Check the State Stamp Act schedule for Mortgage (With/Without Possession) ad-valorem stamp duty using the Stamp Duty estimator or local Sub-Registrar ready-reckoner.',
      'Execute the deed on appropriately stamped paper / e-Stamp certificate before at least two adult attesting witnesses (u/s 59 TPA).',
      'Present the executed deed before the jurisdictional Sub-Registrar of Assurances within 4 months of execution u/s 23 Registration Act, 1908.',
      'If either party securing assets is a Company, pass a Section 179/180(1)(a) Board/Special Resolution and register the charge in Form CHG-1 within 30 days u/s 77 Companies Act.',
    ],
    relatedDocs: [
      { label: 'Simple Mortgage Deed Format (s.58(b))', href: '/documents/simple-mortgage-deed' },
      { label: 'Equitable Mortgage Deed Format (s.58(f))', href: '/documents/equitable-mortgage-deed' },
      { label: 'Usufructuary Mortgage Deed Format (s.58(d))', href: '/documents/usufructuary-mortgage-deed' },
      { label: 'Mortgage by Conditional Sale (s.58(c))', href: '/documents/mortgage-conditional-sale' },
    ],
    relatedGlossary: [
      { label: 'Creation & Registration of Charges (s.77)', href: '/glossary/charge-companies-act' },
      { label: 'Board Meeting Authority', href: '/glossary/board-meeting' },
      { label: 'MCA Form CHG-1 Fee Calculator', href: '/tools/fee-calculator/companies' },
    ],
    faqs: [
      {
        question: 'What defines an English Mortgage under Section 58(e) of the Transfer of Property Act?',
        answer:
          'Under Section 58(e), an English Mortgage occurs when the mortgagor binds himself to repay the mortgage money on a certain date, and transfers the mortgaged property absolutely to the mortgagee, subject to a proviso that the mortgagee will re-transfer it to the mortgagor upon payment of the mortgage money as agreed.',
      },
      {
        question: 'Is registration mandatory for an English Mortgage Deed in India?',
        answer:
          'Yes. Under Section 59 of the Transfer of Property Act, 1882 and Section 17 of the Registration Act, 1908, any mortgage (other than a mortgage by deposit of title deeds) securing Rs. 100 or more must be effected only by a registered instrument signed by the mortgagor and attested by at least two witnesses.',
      },
      {
        question: 'How does an English Mortgage differ from an Equitable Mortgage (Deposit of Title Deeds)?',
        answer:
          'An Equitable Mortgage u/s 58(f) involves depositing original title deeds in notified towns without transferring legal estate (often attracting lower stamp duty), whereas an English Mortgage transfers title absolutely with a reconveyance proviso and mandatory Sub-Registrar registration.',
      },
      {
        question: 'Can a private sale happen without court intervention under an English Mortgage?',
        answer:
          'Under Section 69(1)(a) of the Transfer of Property Act, 1882, power of sale without court intervention in an English Mortgage is strictly restricted to specified cases (e.g., where neither party is Hindu, Muslim, or Buddhist / notified communities, or where the property lies in notified presidency/specified towns), subject to mandatory 3 months’ written notice u/s 69(2).',
      },
      {
        question: 'If a company mortgages its factory under an English Mortgage, is Form CHG-1 needed?',
        answer:
          'Yes. Beyond Sub-Registrar registration under the Registration Act, Section 77 of the Companies Act, 2013 mandates registering the charge with the ROC via e-Form CHG-1 within 30 days of execution.',
      },
      {
        question: 'Can I customize interest rate, due date, and download Word & PDF?',
        answer:
          'Yes. Fill in party details, loan amount, interest rate, due date, and Property Schedule above to generate and export cleanly in Word (.docx), PDF, or print view.',
      },
    ],
  },

  'mortgage-conditional-sale': {
    slug: 'mortgage-conditional-sale',
    seoTitle: 'Free Mortgage by Conditional Sale Format u/s 58(c) TPA (Word/PDF)',
    metaDescription:
      'Download Mortgage by Conditional Sale Deed format under Section 58(c) of Transfer of Property Act, 1882. Includes single-document proviso & Word/PDF export.',
    keywords: [
      'mortgage by conditional sale format india',
      'section 58(c) transfer of property act format',
      'conditional sale mortgage deed word pdf',
      'ostensible sale with condition of repurchase draft',
    ],
    h1: 'Free Mortgage by Conditional Sale Format — Section 58(c) TPA (Word/PDF)',
    heroBadge: 'Transfer of Property Act, 1882 — Section 58(c) & 59',
    introSummary:
      'Generate a structured Mortgage by Conditional Sale instrument strictly aligned with Section 58(c) of the Transfer of Property Act, 1882 — incorporating the mandatory single-document proviso requiring the repurchase/redemption condition to appear inside the same deed.',
    quickSummary: [
      { label: 'Governing Provision', value: 'Section 58(c) & Proviso thereto (added by Act 20 of 1929), Section 59, & Section 67 of Transfer of Property Act, 1882' },
      { label: 'Crucial Proviso Rule', value: 'CRITICAL: Under the proviso to Section 58(c), a transaction is deemed a Mortgage by Conditional Sale ONLY if the condition of repurchase/reconveyance is embodied IN THE SAME DOCUMENT purporting to effect the sale' },
      { label: 'Legal Remedy', value: 'Remedy on default is strictly a suit for FORECLOSURE under Section 67 TPA (not automatic ownership forfeiture without court decree)' },
      { label: 'Registration & Attestation', value: 'Compulsorily registrable u/s 59 TPA & s.17 Registration Act if loan >= Rs. 100, signed and attested by at least 2 witnesses' },
      { label: 'Stamp Duty Note', value: 'Assessed under State Stamp Act (often equivalent to Conveyance/Mortgage with possession rates depending on the state — verify state ready reckoner)' },
    ],
    whenRequired: [
      'Documenting secured real estate finance formatted as an ostensible sale subject to defeasance or compulsory repurchase upon repayment.',
      'Replacing risky "two-deed" sale + buyback agreements which Supreme Court jurisprudence regularly flags under the Section 58(c) single-deed proviso.',
      'Structuring private or institutional land-backed financing where foreclosure rather than personal decree is intended.',
      'Ensuring clear redemption rights u/s 60 TPA so a borrower retains statutory protection against clog on redemption.',
    ],
    clausesExplained: [
      {
        title: 'Ostensible Sale with Single-Deed Condition (s.58(c) Proviso)',
        summary:
          'Expressly embeds the repayment/redemption condition inside the very same instrument, preventing courts from recharacterising the transaction as an outright irrevocable sale.',
      },
      {
        title: 'Statutory Foreclosure & Redemption Safeguards',
        summary:
          'Clarifies that the sale becomes void or reconveyance follows upon repayment by the stipulated date, while preserving equitable Section 60 / Section 67 judicial process.',
      },
      {
        title: 'Schedule of Property & Witness Attestation',
        summary:
          'Provides exact municipal/survey boundaries and two-witness execution blocks mandated by Section 59 of the Act.',
      },
      {
        title: 'Default Remedies & Suit for Foreclosure (Section 67)',
        summary:
          'Defines exact default triggers and limits enforcement to court-decreed foreclosure remedies consistent with Section 67 of the Transfer of Property Act, 1882.',
      }
    ],
    executionChecklist: [
      'NEVER execute two separate documents (an absolute Sale Deed + a separate Agreement to Reconvey) if intending a Mortgage by Conditional Sale — Section 58(c) proviso mandates a single document!',
      'Confirm the exact stamp duty slab under your State Stamp Act (several states levy Conveyance-equivalent duty where possession passes or ostensible sale wording is used).',
      'Complete title & encumbrance verification prior to registration.',
      'Sign before at least two adult attesting witnesses and register before the Sub-Registrar within 4 months of execution.',
      'Record borrower company charge in MCA Form CHG-1 within 30 days if the Mortgagor/Vendor is an Indian company.',
    ],
    relatedDocs: [
      { label: 'Simple Mortgage Deed Format (s.58(b))', href: '/documents/simple-mortgage-deed' },
      { label: 'English Mortgage Deed Format (s.58(e))', href: '/documents/english-mortgage-deed' },
      { label: 'Usufructuary Mortgage Deed Format (s.58(d))', href: '/documents/usufructuary-mortgage-deed' },
      { label: 'Equitable Mortgage Deed Format (s.58(f))', href: '/documents/equitable-mortgage-deed' },
    ],
    relatedGlossary: [
      { label: 'Creation & Registration of Charges', href: '/glossary/charge-companies-act' },
      { label: 'Corporate Law Documents Index', href: '/documents' },
    ],
    faqs: [
      {
        question: 'Why does Section 58(c) Proviso require the condition in the SAME document?',
        answer:
          'The proviso to Section 58(c) clearly states that no such transaction shall be deemed to be a mortgage unless the condition (that the sale becomes void or buyer reconveys upon repayment) is embodied in the document which effects or purports to effect the sale. If put in a separate agreement, the transaction risks being treated legally as an outright sale plus an option to repurchase.',
      },
      {
        question: 'Does ownership automatically become absolute on the day the borrower misses the repayment date?',
        answer:
          'No. Under Section 60 (Right of Redemption) and Section 67 of the Transfer of Property Act, 1882, the mortgagee must approach a competent civil court in a suit for foreclosure — "once a mortgage, always a mortgage."',
      },
      {
        question: 'Is Mortgage by Conditional Sale compulsorily registrable?',
        answer:
          'Yes. Under Section 59 of the Transfer of Property Act and Section 17 of the Registration Act, 1908, if the principal money secured is Rs. 100 or upwards, it can be effected only through a registered instrument attested by at least two witnesses.',
      },
      {
        question: 'Is there personal liability of the borrower to repay in Section 58(c)?',
        answer:
          'Ordinarily, in a pure Mortgage by Conditional Sale, there is no personal covenant to pay unless separately agreed; the mortgagee’s primary statutory remedy is foreclosure of the mortgaged property u/s 67.',
      },
      {
        question: 'What stamp duty applies to a Mortgage by Conditional Sale?',
        answer:
          'Stamp duty varies by State Stamp Act (for instance Maharashtra, Delhi, Karnataka, Tamil Nadu) and often differs based on whether possession is delivered or not. Use an e-Stamp calculator / Sub-Registrar schedule in your property’s state before execution.',
      },
      {
        question: 'Can I customize vendor, purchaser, and repayment dates and export Word or PDF?',
        answer:
          'Yes. Enter all party details, loan amount, tenure, repayment date, and Property Schedule above to download formatted Word (.docx) or PDF.',
      },
    ],
  },

  'simple-mortgage-deed': {
    slug: 'simple-mortgage-deed',
    seoTitle: 'Free Simple Mortgage Deed Format India u/s 58(b) TPA (Word/PDF)',
    metaDescription:
      'Download Simple Mortgage Deed format under Section 58(b) of Transfer of Property Act, 1882. Includes personal covenant, court sale right & Word/PDF export.',
    keywords: [
      'simple mortgage deed format india',
      'section 58(b) transfer of property act',
      'simple mortgage format word pdf download',
      'registered mortgage without possession draft',
    ],
    h1: 'Free Simple Mortgage Deed Format India — Section 58(b) TPA (Word/PDF)',
    heroBadge: 'Transfer of Property Act, 1882 — Section 58(b) & 59',
    introSummary:
      'Draft a clean, legally accurate Simple Mortgage Deed under Section 58(b) of the Transfer of Property Act, 1882 — creating a non-possessory security interest backed by the mortgagor’s personal undertaking to repay and the mortgagee’s right to seek court-ordered sale on default.',
    quickSummary: [
      { label: 'Governing Provision', value: 'Sections 58(b), 59, 67 & 68 of the Transfer of Property Act, 1882' },
      { label: 'Possession Status', value: 'NO delivery of possession — Mortgagor retains full physical possession and enjoyment of the property' },
      { label: 'Two Mandatory Elements', value: '1. Personal covenant binding the Mortgagor to repay the mortgage money -> 2. Express/implied agreement giving Mortgagee right to cause property to be sold by court decree on default' },
      { label: 'Registration & Witnesses', value: 'Mandatory Sub-Registrar registration u/s 59 TPA & s.17 Registration Act (>= Rs. 100) + attestation by at least 2 witnesses' },
      { label: 'Corporate Borrower Charge', value: 'Companies/LLPs must additionally file MCA Form CHG-1 / LLP Form 8 within 30 days' },
    ],
    whenRequired: [
      'Securing term loans, business loans, or private credit facilities against immovable property while the borrower remains in possession.',
      'Executing registered collateral mortgages requested by banks, NBFCs, or co-operative credit societies outside notified Equitable Mortgage towns (or where banks prefer registered priority).',
      'Documenting family/commercial promoter-funded secured lending backed by clear Sub-Registrar priority.',
      'Refinancing where Stamp Act gives concessional duty for mortgage WITHOUT possession compared to mortgage WITH possession.',
    ],
    clausesExplained: [
      {
        title: 'Personal Undertaking & Installment Repayment',
        summary:
          'Binds the Mortgagor personally to repay principal and quarterly/periodic interest — distinguishing Simple Mortgage from Usufructuary or Conditional Sale mortgages.',
      },
      {
        title: 'Continuation of Borrower Possession',
        summary:
          'Confirms possession stays exclusively with the Mortgagor during the currency of the loan.',
      },
      {
        title: 'Right to Court-Ordered Sale on Default',
        summary:
          'Confers the mortgagee’s right u/s 58(b) and s.67 to obtain a court decree for sale of the scheduled property (strictly avoiding unilateral private seizure without decree).',
      },
      {
        title: 'Schedule & Two-Witness Attestation',
        summary:
          'Meets Section 59 TPA and Registration Act particulars required for Sub-Registrar presentation.',
      },
    ],
    executionChecklist: [
      'Check title chain and obtain Encumbrance Certificate (EC) confirming property is free of prior undisclosed charges.',
      'Pay correct "Mortgage Deed WITHOUT Possession" stamp duty under the applicable State Stamp Act (usually lower than with-possession rate).',
      'Execute deed in the presence of two adult witnesses (u/s 59 TPA) and ensure both Mortgagor & Mortgagee/authorised signatories initial every page.',
      'Register at the local Sub-Registrar Office within 4 months of execution u/s 23 Registration Act.',
      'For Company borrowers, file Form CHG-1 on MCA V3 within 30 days u/s 77 Companies Act and keep Form CHG-2 Certificate.',
    ],
    relatedDocs: [
      { label: 'English Mortgage Deed Format (s.58(e))', href: '/documents/english-mortgage-deed' },
      { label: 'Equitable Mortgage Deed Format (s.58(f))', href: '/documents/equitable-mortgage-deed' },
      { label: 'Usufructuary Mortgage Deed Format (s.58(d))', href: '/documents/usufructuary-mortgage-deed' },
      { label: 'Board Resolution — Availing Bank Loan', href: '/documents/board-resolution-bank-loan' },
    ],
    relatedGlossary: [
      { label: 'Creation & Registration of Charges', href: '/glossary/charge-companies-act' },
      { label: 'Board of Directors Borrowing Powers', href: '/glossary/board-of-directors' },
    ],
    faqs: [
      {
        question: 'What is a Simple Mortgage under Section 58(b) of the Transfer of Property Act?',
        answer:
          'Under Section 58(b), without delivering possession of the mortgaged property, the mortgagor binds himself personally to pay the mortgage money and agrees expressly or impliedly that on default, the mortgagee shall have a right to cause the mortgaged property to be sold and the proceeds applied in payment of the mortgage money.',
      },
      {
        question: 'Can the lender sell the property privately on default under a Simple Mortgage?',
        answer:
          'No. Under a Simple Mortgage, the mortgagee cannot apply for foreclosure nor sell privately without court intervention (outside statutory SARFAESI enforcement by notified banks/FIs). The general remedy u/s 67 is a civil court suit for a decree for sale (plus personal decree u/s 68).',
      },
      {
        question: 'Does a Simple Mortgage Deed always require registration?',
        answer:
          'Yes, under Section 59 of the Transfer of Property Act, 1882, whenever the principal secured is Rs. 100 or more, a Simple Mortgage can ONLY be created by a registered instrument signed by the mortgagor and attested by at least two witnesses.',
      },
      {
        question: 'How much stamp duty applies to a Simple Mortgage Deed?',
        answer:
          'Stamp duty depends on the State where the property is situated and typically falls under the "Mortgage Deed not being an agreement relating to Deposit of Title Deeds and WITHOUT possession" article (ranging roughly 0.25%–0.5%–2% depending on state caps — verify local State Stamp Act schedule before buying e-stamp).',
      },
      {
        question: 'Who keeps possession of the property during a Simple Mortgage?',
        answer:
          'The Mortgagor (borrower) retains full physical possession and continues using, leasing, or operating the premises throughout the loan tenure unless transferred in execution of a default decree.',
      },
      {
        question: 'Can I edit the repayment schedule and download Word (.docx) or PDF?',
        answer:
          'Yes. Enter city, parties, municipal particulars, principal, interest rate, installment date, and Property Schedule above to download Word (.docx) or PDF instantly.',
      },
    ],
  },

  'usufructuary-mortgage-deed': {
    slug: 'usufructuary-mortgage-deed',
    seoTitle: 'Free Usufructuary Mortgage Deed Format India u/s 58(d) TPA (Word/PDF)',
    metaDescription:
      'Download Usufructuary Mortgage Deed format u/s 58(d) TPA where possession passes to lender who adjusts rents/profits toward debt. Editable Word (.docx) & PDF.',
    keywords: [
      'usufructuary mortgage deed format india',
      'section 58(d) transfer of property act',
      'possession mortgage rents profits format word pdf',
      'section 62 redemption usufructuary mortgage',
    ],
    h1: 'Free Usufructuary Mortgage Deed Format India — Section 58(d) TPA (Word/PDF)',
    heroBadge: 'Transfer of Property Act, 1882 — Section 58(d), 59 & 62',
    introSummary:
      'Create a statutory Usufructuary Mortgage Deed under Section 58(d) of the Transfer of Property Act, 1882 — delivering actual property possession to the mortgagee to enjoy rents and usufructs towards interest/principal without personal repayment liability or power of foreclosure/sale.',
    quickSummary: [
      { label: 'Governing Provisions', value: 'Sections 58(d), 59, 62, 67 & 76 of the Transfer of Property Act, 1882' },
      { label: 'Core Mechanism', value: 'Delivery of Possession -> Mortgagee retains possession until payment & appropriates rents/profits in lieu of interest, principal, or both' },
      { label: 'No Personal Liability / No Sale', value: 'Mortgagor is NOT personally liable to pay, and Mortgagee CANNOT sue for foreclosure or court sale (Section 67(a) proviso)' },
      { label: 'Redemption u/s 62', value: 'Once the debt is fully satisfied from usufructs (or Mortgagor tenders balance), Mortgagor has an indefeasible right to recover possession u/s 62' },
      { label: 'Registration & Stamp Duty', value: 'Compulsorily registrable u/s 59 (>= Rs. 100) with 2 witnesses; State Stamp Act usually levies "Mortgage WITH Possession" slab' },
    ],
    whenRequired: [
      'Securing financing over revenue-generating commercial shops, agricultural land (subject to local tenancy/ceiling laws), or leased warehouses where rent income services debt.',
      'Family or community secured credit arrangements where the lender holds possession in lieu of interest without wanting to sue for auction.',
      'Structuring agricultural/plantation debt where Section 58(d) protects borrowers against forced personal recovery decrees.',
    ],
    clausesExplained: [
      {
        title: 'Delivery of Vacant Possession Clause',
        summary:
          'Documents immediate delivery of peaceful possession to the Mortgagee (or authority to collect rents/profits), fulfilling the sine qua non of Section 58(d).',
      },
      {
        title: 'Appropriation of Rents & Profits',
        summary:
          'Authorises the Mortgagee to receive rents and profits directly and appropriate them towards interest and/or principal as stipulated.',
      },
      {
        title: 'Absence of Personal Liability & No Foreclosure/Sale',
        summary:
          'Records Section 58(d) & Section 67 bar against personal money suits, foreclosure, or forced sale — ensuring strict statutory accuracy.',
      },
      {
        title: 'Prudent Management & Tax Covenant (Section 76)',
        summary:
          'Binds the mortgagee-in-possession to manage the property prudently, pay municipal/government dues from rents, and keep proper accounts under Section 76 TPA.',
      },
    ],
    executionChecklist: [
      'Check applicable State Land Reforms, Rent Control, or Agricultural Debt statutes (some states restrict usufructuary leases over agricultural land or cap duration).',
      'Determine whether stamp duty falls under "Mortgage WITH Possession" (often matching Conveyance rates in major States — verify before e-stamping).',
      'Prepare a clear inventory/handover memo alongside the Property Schedule detailing any existing tenants.',
      'Execute before two adult attesting witnesses (u/s 59 TPA) and register at the Sub-Registrar Office within 4 months.',
      'Mortgagee must maintain strict rent/expense ledgers throughout possession for Section 62 & Section 76 accounting upon redemption.',
    ],
    relatedDocs: [
      { label: 'Simple Mortgage Deed Format (s.58(b))', href: '/documents/simple-mortgage-deed' },
      { label: 'English Mortgage Deed Format (s.58(e))', href: '/documents/english-mortgage-deed' },
      { label: 'Mortgage by Conditional Sale (s.58(c))', href: '/documents/mortgage-conditional-sale' },
      { label: 'Lease & Rent Agreement Format', href: '/documents/lease-agreement' },
    ],
    relatedGlossary: [
      { label: 'Creation & Registration of Charges', href: '/glossary/charge-companies-act' },
      { label: 'All Legal Document Formats', href: '/documents' },
    ],
    faqs: [
      {
        question: 'Can a lender sue for sale of property under a Usufructuary Mortgage?',
        answer:
          'No. Section 67(a) of the Transfer of Property Act explicitly bars a usufructuary mortgagee from instituting a suit for foreclosure or a suit for sale. The lender’s sole remedy is to retain possession and appropriate rents/profits until the mortgage money is repaid.',
      },
      {
        question: 'Does a Usufructuary Mortgage expire if the borrower does not redeem for 30 years?',
        answer:
          'In *Singh Ram v. Sheo Ram* (2014), the Supreme Court held that there is no rigid limitation running against a pure usufructuary mortgagor until the mortgage money is paid out of usufructs or deposited — the right to seek possession u/s 62 accrues once debt is satisfied ("once a mortgage, always a mortgage").',
      },
      {
        question: 'Is there any limitation period/cap in Stamp Duty for a Usufructuary Mortgage?',
        answer:
          'Unlike a Simple Mortgage (without possession), many State Stamp Acts assess a Mortgage WITH Possession at rates higher than non-possessory mortgages (often equal to Conveyance duty). Check your local State Stamp Act schedule carefully before franking or buying e-stamp.',
      },
      {
        question: 'Can the parties agree that rents pay off both principal and interest automatically?',
        answer:
          'Yes! Under Section 58(d), rents and profits may be appropriated (a) strictly in lieu of interest (principal stays payable on redemption), (b) partly toward interest and partly toward principal, or (c) toward the entire principal + interest.',
      },
      {
        question: 'Is registration mandatory for a Usufructuary Mortgage Deed?',
        answer:
          'Yes, under Section 59 TPA, whenever the mortgage money is Rs. 100 or upwards, it must be executed via a registered instrument signed by the mortgagor and attested by at least two witnesses.',
      },
      {
        question: 'Can I customize redemption date, loan amount, and download Word or PDF?',
        answer:
          'Yes. Enter party details, property location, loan amount, redemption trigger date, and Property Schedule above to download formatted Word (.docx) and PDF files.',
      },
    ],
  },

  'public-notice-financial-results': {
    slug: 'public-notice-financial-results',
    seoTitle: 'Free Public Notice Format for Financial Results SEBI LODR (Word/PDF)',
    metaDescription:
      'Download Public Notice format for Financial Results Extract under SEBI (LODR) Regulations 33 & 47 in Word (.docx) and PDF. Includes tabular extract & QR-code notes.',
    keywords: [
      'public notice financial results format sebi lodr',
      'regulation 33 regulation 47 newspaper publication format',
      'extract of unaudited financial results notice word pdf',
      'listed company quarterly results ad format india',
    ],
    h1: 'Free Public Notice Format for Financial Results Extract — SEBI LODR (Word/PDF)',
    heroBadge: 'SEBI (LODR) Regulations, 2015 — Regulations 33 & 47',
    introSummary:
      'Generate a Regulation 33 & Regulation 47 compliant Extract of Standalone Financial Results Public Notice for listed entities, including standard comparative quarterly/nine-month/yearly columns, stock exchange webpage disclosures, and current Regulation 47 QR-code guidance.',
    quickSummary: [
      { label: 'Governing Regulations', value: 'Regulations 33 & 47 of SEBI (Listing Obligations and Disclosure Requirements) Regulations, 2015' },
      { label: 'Publication Timeline', value: 'Within 48 hours of conclusion of the Board Meeting at which the financial results were approved (Reg 47(3))' },
      { label: 'Newspapers Required', value: 'At least 1 English national daily circulating in the whole/substantially whole of India + 1 regional daily circulating where the Registered Office is situated' },
      { label: 'Dec 2024 SEBI Update', value: 'Under SEBI (LODR) (Third Amendment) Regulations, 2024 (effective Dec 2024), listed entities MAY publish a compact ad with a functional QR code & webpage links to full results (while retaining the option u/r 47(1) proviso to publish the full extract table)' },
      { label: 'Stock Exchange Intimation', value: 'Upload newspaper clipping / copy of advertisement to BSE Listing Centre & NSE NEAPS within prescribed post-publication disclosure norms' },
    ],
    whenRequired: [
      'Publishing Board-approved Q1, Q2, Q3, or Q4 / Annual financial results (standalone or consolidated) by Main Board listed companies.',
      'Choosing the voluntary traditional financial-extract table format permitted under the proviso to Regulation 47(1) SEBI LODR.',
      'Publishing statutory extracts alongside auditor modified opinion disclosures or limited review references.',
      'Formatting investor-facing notices simultaneously hosted on the listed company’s Investor Relations webpage.',
    ],
    clausesExplained: [
      {
        title: 'Corporate Identification & Investor Contact Header',
        summary:
          'Displays CIN, Registered Office, phone/fax/email, and company website URL mandated across listed entity publications.',
      },
      {
        title: '8-Line Statutory Extract Table (Schedule III / Ind AS Aligned)',
        summary:
          'Captures Total Income from Operations, PBT (before & after exceptional items), PAT, Total Comprehensive Income, Equity Share Capital, Reserves, and Basic/Diluted EPS across comparative quarter, 9-month, and prior-year columns.',
      },
      {
        title: 'Stock Exchange & Company Website Cross-Reference Note',
        summary:
          'Explicitly informs shareholders that complete financial results under Regulation 33 are accessible on BSE/NSE websites and the company website (plus space to insert QR code before print).',
      },
      {
        title: 'Board Signatory Authorisation',
        summary:
          'Signature block for the Managing Director / Chairperson / Authorised Director with DIN, date, and place.',
      },
    ],
    executionChecklist: [
      'Approve financial results along with Auditor’s Limited Review Report / Audit Report at the Board Meeting first and submit PDF + XBRL within 30 minutes u/r 30 & 33.',
      'Fill financial figures into the blank extract cells in the exported Word (.docx) file OR opt for the streamlined Reg 47 QR-code notice format introduced in Dec 2024.',
      'If publishing modified audit opinions / qualifications, disclose impact clearly in the extract/notice per Reg 47(1).',
      'Release advertisement to 1 English national daily and 1 regional language daily strictly within 48 hours of Board Meeting conclusion.',
      'Submit scanned newspaper clippings to Stock Exchanges (BSE/NSE) and host on your website under Regulation 46.',
    ],
    relatedDocs: [
      { label: 'Public Notice — Expulsion of Trading Member', href: '/documents/public-notice-trading-member-expulsion' },
      { label: 'Board Resolution — Change of Company Name', href: '/documents/board-resolution-name-change' },
      { label: 'Special Resolution — Registered Office Shifting', href: '/documents/special-resolution-registered-office-shifting' },
      { label: 'All Legal Document Formats', href: '/documents' },
    ],
    relatedGlossary: [
      { label: 'SEBI LODR Regulations Guide', href: '/glossary/lodr' },
      { label: 'Listed Entity Obligations', href: '/glossary/listed-entity' },
      { label: 'Trading Window & UPSI Rules', href: '/glossary/trading-window' },
      { label: 'Balance Sheet Tool', href: '/tools/financial-statements/balance-sheet' },
    ],
    faqs: [
      {
        question: 'Is publishing the full financial results table still mandatory under Regulation 47?',
        answer:
          'Following the SEBI (LODR) (Third Amendment) Regulations, 2024 (effective mid-December 2024), listed companies have the option to publish an abridged advertisement containing a scannable QR code and webpage URLs linking directly to the full financial results. However, under the proviso to Regulation 47(1), entities may still voluntarily publish the complete extract table format provided above.',
      },
      {
        question: 'Within how many hours must the financial results public notice be published?',
        answer:
          'Under Regulation 47(3), the notice/advertisement must be published in the newspapers within 48 hours from the conclusion of the Board Meeting at which the financial results were approved.',
      },
      {
        question: 'Are SME Exchange listed companies required to publish financial results in newspapers?',
        answer:
          'No. Companies whose specified securities are listed exclusively on an SME Exchange (such as BSE SME or NSE Emerge) are exempt from Regulation 47 newspaper publication under Regulation 15(2) / Regulation 47.',
      },
      {
        question: 'Should Consolidated or Standalone figures be published in the notice?',
        answer:
          'Where a listed entity publishes both standalone and consolidated financial results, Regulation 47 generally requires publishing the consolidated financial results alongside standalone turnover, PBT, and PAT footnotes (easily added in the Word export or AI Editor).',
      },
      {
        question: 'Why are the numeric figure cells blank in the initial template?',
        answer:
          'Each company reports distinct quarterly/9-month/annual figures in Lakhs or Crores; generating and downloading the Word (.docx) file lets your Finance/CS team paste verified Excel/Ind-AS figures cleanly into every bordered table cell without manual table alignment.',
      },
      {
        question: 'Can I customize dates, exchange links, and download Word (.docx) and PDF?',
        answer:
          'Yes. Enter your company CIN, quarter/9M/FY dates, Face Value, exchange links, and signatory above, click Generate Document, and export to Word (.docx) or PDF.',
      },
    ],
  },

  'public-notice-trading-member-expulsion': {
    slug: 'public-notice-trading-member-expulsion',
    seoTitle: 'Free Public Notice for Expulsion of Trading Member (Word/PDF)',
    metaDescription:
      'Download Stock Exchange Public Notice format for Defaulter Declaration & Expulsion of a Trading Member (Chapter IV Bye Laws). Editable Word (.docx) & PDF.',
    keywords: [
      'public notice expulsion of trading member',
      'stock exchange defaulter declaration notice format',
      'investor protection fund claim notice format',
      'sebi stock exchange defaulter notice word pdf',
    ],
    h1: 'Free Public Notice Format for Expulsion of Trading Member (Word/PDF)',
    heroBadge: 'Stock Exchange Bye Laws — Chapter IV, Rules 1 & 2',
    introSummary:
      'Generate a formal Stock Exchange / Clearing Corporation Specimen Public Notice declaring a Trading Member a Defaulter and expelled from membership, specifying the 3-month constituent claim window, Investor Protection Fund (IPF) cap, and online/physical claim lodgment channels.',
    quickSummary: [
      { label: 'Governing Framework', value: 'Stock Exchange Bye-Laws (Chapter IV / Defaulters Rules), SEBI (Stock Brokers) Regulations, & SEBI IPF Guidelines' },
      { label: 'Claim Filing Window', value: 'Typically 3 months (or prescribed Bye-Law / SEBI circular period) from the date of Public Notice issuance' },
      { label: 'Compensation Source', value: 'Eligible investor claims are met out of the Exchange’s Investor Protection Fund (IPF) up to the notified per-investor cap' },
      { label: 'Required Notice Content', value: 'Member Name, SEBI Registration No., Defaulter Declaration Date, Expulsion Date, Portal URL, Form A note, & Physical Defaulters’ Section address' },
      { label: 'Publication Scope', value: 'Published on Exchange Website, Regulatory Bulletins, and national/regional newspapers where the broker operated' },
    ],
    whenRequired: [
      'When a recognised Stock Exchange or Clearing Corporation’s Defaulters’ Committee formally declares a trading/clearing member a defaulter and expels membership.',
      'Inviting claims from retail and institutional constituents via the Exchange IPF portal within the statutory claim-lodgment deadline.',
      'Preparing compliance / legal precedent specimens for capital market compliance teams, investor associations, or regulatory documentation.',
      'Notifying investors who already submitted Form A / IGRC claims that duplicate re-filing may not be needed per Exchange SOP.',
    ],
    clausesExplained: [
      {
        title: 'Tabular Identification of Expelled Member',
        summary:
          'Clearly sets out Sr. No., Defaulter Member Name, SEBI Broker Registration Number, Date of Defaulter Declaration, and Date of Expulsion.',
      },
      {
        title: 'Three-Month Constituent Claim Window & IPF Limit',
        summary:
          'States the claim deadline and discloses the maximum Investor Protection Fund (IPF) compensation ceiling in Rs. Lakhs per eligible investor.',
      },
      {
        title: 'Dual Submission Modes (Online Portal + Defaulters’ Section)',
        summary:
          'Guides claimants toward online claim portal tracking while preserving physical claim form submission at the Defaulters’ Section, with Form A non-duplication note.',
      },
      {
        title: 'Helpline & Statutory Investor Grievance Redressal',
        summary:
          'Provides designated Exchange toll-free helpline numbers, Defaulters’ Section office address, and mandatory warning against duplicate claim submissions.',
      }
    ],
    executionChecklist: [
      'Confirm exact Defaulters’ Committee resolution dates (Declaration of Defaulter vs Date of Expulsion — both must match Exchange circulars).',
      'Verify the current IPF compensation limit per investor notified by SEBI / the specific Exchange before releasing notice.',
      'Cross-verify SEBI Registration Number (`INZ...`) and Exchange Member Code.',
      'Test the live Exchange Investor Helpline portal link and toll-free telephone helpline listed in the notice.',
      'Publish simultaneously on the Exchange website bulletin board and designated English/regional dailies.',
    ],
    relatedDocs: [
      { label: 'Public Notice — Financial Results (SEBI LODR)', href: '/documents/public-notice-financial-results' },
      { label: 'Service Level Agreement Format', href: '/documents/service-level-agreement' },
      { label: 'All Legal Document Formats', href: '/documents' },
    ],
    relatedGlossary: [
      { label: 'SEBI Adjudication Framework', href: '/glossary/sebi-adjudication' },
      { label: 'Public Announcement (SEBI)', href: '/glossary/public-announcement-sebi' },
      { label: 'SEBI LODR Regulations', href: '/glossary/lodr' },
    ],
    faqs: [
      {
        question: 'How long do investors have to file claims after a trading member is declared a defaulter?',
        answer:
          'Under standard Exchange Bye-Laws reflected in the specimen notice, constituents are advised to lodge claims within 3 months from the date of the Public Notice (and Exchanges sometimes review belated claims within extended SEBI-permitted timelines upon valid justification).',
      },
      {
        question: 'Do investors who already filed complaints in Form A need to re-file after this notice?',
        answer:
          'Typically no — as reflected in the specimen text, claimants who have already submitted valid claims in Form A against the expelled member need not file a separate duplicate claim, though tracking via the Exchange portal is recommended.',
      },
      {
        question: 'Where does investor compensation come from when a broker defaults?',
        answer:
          'First out of the defaulter broker’s Exchange deposits, bank guarantees, and vested assets realised by the Defaulters’ Committee; any shortfall for eligible investor claims is paid from the Exchange’s Investor Protection Fund (IPF) subject to the notified per-investor cap.',
      },
      {
        question: 'Can this template be adapted for BSE, NSE, or MCX notices?',
        answer:
          'Yes. Every Exchange variable — Exchange Name, SEBI Reg No., Defaulter/Expulsion dates, IPF cap, portal URL, and Defaulters’ Section address — is parameterized cleanly above.',
      },
      {
        question: 'What documents should an investor attach when responding to a defaulter notice?',
        answer:
          'Constituents normally submit executed KYC/Member-Client Agreement, contract notes, demat/holding statements, bank transfer proofs, and ledger statements supporting their net receivable claim.',
      },
      {
        question: 'Can I download this Public Notice in editable Word (.docx) and PDF format?',
        answer:
          'Yes. Fill in Exchange particulars, member details, and claim contacts above, generate the formatted notice, and download in Word (.docx) or PDF.',
      },
    ],
  },

  'consultancy-agreement': {
    slug: 'consultancy-agreement',
    seoTitle: 'Free Consultancy Agreement Format India (Word/PDF)',
    metaDescription:
      'Download Consultancy Agreement format for India under Indian Contract Act, 1872. Covers scope, fees, Section 194J TDS, IP ownership, s.27 non-compete & Word/PDF.',
    keywords: [
      'consultancy agreement format india',
      'independent contractor consultant contract word pdf',
      'section 194j tds consultancy agreement',
      'freelance consulting contract template india',
    ],
    h1: 'Free Consultancy Agreement Format India — Independent Contractor (Word/PDF)',
    heroBadge: 'Indian Contract Act, 1872 & Section 194J Income Tax Act',
    introSummary:
      'Draft an India-ready Consultancy / Independent Contractor Agreement establishing clear scope of services, retainer or milestone fee structure, GST + Section 194J TDS deduction, Intellectual Property assignment to Client, confidentiality, and arbitration in India.',
    quickSummary: [
      { label: 'Governing Statutes', value: 'Indian Contract Act, 1872; Copyright Act, 1957 (IP Assignment u/s 19); Section 194J Income Tax Act, 1961 (TDS); Arbitration & Conciliation Act, 1996' },
      { label: 'Tax & GST Check', value: 'Fees attract TDS under Section 194J (typically 10% for professional/technical services, or 2% where applicable) + GST forward charge if Consultant crosses threshold/registered' },
      { label: 'IP Assignment Rule', value: 'Unlike employees (Section 17(c) Copyright Act), IP created by an independent Consultant stays with the Consultant UNLESS assigned in writing under Section 19' },
      { label: 'Non-Compete Caveat (s.27)', value: 'CRITICAL: Under Section 27 of the Indian Contract Act, 1872, post-termination non-compete restraints are VOID in India; in-term exclusivity & non-solicitation / confidentiality clauses ARE enforceable' },
      { label: 'Stamp Duty & Registration', value: 'General contract stamp duty applies as per the State Stamp Act where executed (NOT compulsorily registrable); digital/e-Sign valid under IT Act 2000' },
    ],
    whenRequired: [
      'Engaging management, IT, legal, financial, marketing, or technical independent consultants without creating an employer-employee relationship (avoiding PF/ESIC/gratuity exposure).',
      'Protecting client-funded software, reports, UI/UX designs, or business deliverables through an explicit written Section 19 IP assignment.',
      'Fixing SLAs, billing cycles, late-payment interest, liability caps, and confidential data handling before project kick-off.',
      'Establishing documentation required by statutory/tax auditors to substantiate Section 194J service expenses.',
    ],
    clausesExplained: [
      {
        title: 'Independent Contractor & Tax Separation (Clause 3 & 4)',
        summary:
          'Expressly negates employment, agency, or partnership status and provides for GST billing plus statutory TDS deduction under Section 194J of the Income Tax Act, 1961.',
      },
      {
        title: 'Written Intellectual Property Assignment (Clause 6)',
        summary:
          'Transfers ownership of all deliverables, code, reports, and work product exclusively to the Client — essential under Indian Copyright Act rules for non-employee contractors.',
      },
      {
        title: 'Confidentiality & Non-Compete Nuance (Clause 5 & 7)',
        summary:
          'Binds confidentiality for a defined post-termination survival term; note under Section 27 of the Indian Contract Act, post-termination non-compete restraints are unenforceable in India, so rely on in-term conflict restrictions and post-term confidentiality/non-solicitation (customizable via AI Editor).',
      },
      {
        title: 'Liability Cap & Indian Arbitration (Clause 9 & 10)',
        summary:
          'Caps consultant liability to trailing-months fees paid, excludes consequential damages, and establishes arbitration seated in your chosen Indian city under the 1996 Act.',
      },
    ],
    executionChecklist: [
      'Verify GSTIN and PAN of the Consultant so Section 194J / Section 206AA higher TDS checks are handled accurately before first payout.',
      'Consider whether Clause 7 should be restricted to "during the Term of this Agreement" (or paired with non-solicitation) given Section 27 Indian Contract Act voidness of post-term non-competes — you can edit this instantly using the AI Clause Editor!',
      'Specify exact Territory and Perpetual/Worldwide assignment wording in IP Clause if deliverables include core software or patents (Section 19 Copyright Act note).',
      'Execute on non-judicial stamp paper / e-Stamp as applicable for agreements in the State of execution.',
      'Sign across authorized signatories on both pages + exchange PAN/cancelled cheque/GST onboarding kit.',
    ],
    relatedDocs: [
      { label: 'Service Level Agreement (SLA) Format', href: '/documents/service-level-agreement' },
      { label: 'Non-Disclosure Agreement (NDA) Format', href: '/documents/non-disclosure-agreement' },
      { label: 'Employment Agreement Format', href: '/documents/employment-agreement' },
      { label: 'Memorandum of Understanding (MoU)', href: '/documents/memorandum-of-understanding' },
    ],
    relatedGlossary: [
      { label: 'All Legal Document Formats', href: '/documents' },
      { label: 'Companies Act & Legal Updates', href: '/updates' },
      { label: 'Corporate Law Compliance Tools', href: '/tools' },
    ],
    faqs: [
      {
        question: 'Is a post-termination non-compete clause in a Consultancy Agreement valid in India?',
        answer:
          'Under Section 27 of the Indian Contract Act, 1872 (and consistent Supreme Court precedent like *Percept D’Mark* and *Niranjan Shankar Golikari*), every agreement restraining anyone from exercising a lawful profession or business AFTER termination is void, except on sale of goodwill. However, exclusivity/conflict-of-interest clauses DURING the contract term and post-term confidentiality/non-solicitation covenants remain valid — use the AI Editor above if you prefer narrowing Clause 7 to in-term exclusivity + non-solicitation.',
      },
      {
        question: 'Why must a Consultancy Agreement explicitly include an Intellectual Property assignment clause?',
        answer:
          'Under Section 17 of the Copyright Act, 1957, copyright in works created by a regular employee belongs to the employer automatically, whereas work created by an independent consultant belongs to the consultant unless assigned in writing under Section 19. An express written assignment clause is indispensable.',
      },
      {
        question: 'What TDS rate applies to payments under an Indian Consultancy Agreement?',
        answer:
          'Fees for professional or technical consulting services paid by specified Indian entities generally attract TDS under Section 194J of the Income Tax Act, 1961 (10% for professional services, or 2% for specified technical services where applicable), plus GST if the consultant is GST-registered.',
      },
      {
        question: 'What value of stamp paper is needed for a Consultancy Agreement?',
        answer:
          'A standard Consultancy Agreement falls under the general "Agreement not otherwise provided for" article of the respective State Stamp Act (e.g., typically Rs. 100–Rs. 500 across Delhi/Maharashtra/Karnataka unless indemnity/specific security clauses attract higher duty). Check your state rate via our Stamp Duty Estimator above.',
      },
      {
        question: 'Does a Consultancy Agreement require registration or notarisation in India?',
        answer:
          'No. A Consultancy Agreement does not transfer immovable property rights, so Sub-Registrar registration is not required. Execution on valid stamp paper (or e-sign under the IT Act, 2000) is fully enforceable.',
      },
      {
        question: 'Can I customize payment period, liability cap, arbitration city, and download Word or PDF?',
        answer:
          'Yes. Every commercial variable — scope, fee period, notice period, confidentiality years, arbitration seat, and signatories — can be customized above and downloaded in Word (.docx) or PDF.',
      },
    ],
  },
}
