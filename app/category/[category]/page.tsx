/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { supabase } from '@/lib/supabase'
import { UPDATE_LIST_COLUMNS } from '@/lib/supabase-queries'
import { notFound, redirect } from 'next/navigation'
import UpdateCard from '@/components/UpdateCard'
import Pagination from '@/components/Pagination'
import { Metadata } from 'next'
import Link from 'next/link'
import EmptyState from '@/components/EmptyState'

export const revalidate = 43200 // 12 hours

const CATEGORIES = ['mca', 'sebi', 'rbi', 'nclt', 'ibc', 'fema', 'cci', 'labour', 'ifsca']

const CATEGORY_FULL_NAMES: Record<string, string> = {
    mca: 'Ministry of Corporate Affairs',
    sebi: 'Securities and Exchange Board of India',
    rbi: 'Reserve Bank of India',
    nclt: 'National Company Law Tribunal',
    ibc: 'Insolvency and Bankruptcy Code',
    fema: 'Foreign Exchange Management Act',
    cci: 'Competition Commission of India',
    labour: 'Ministry of Labour & Employment',
    'labour-law': 'Ministry of Labour & Employment',
    ifsca: 'International Financial Services Centres Authority',
}

const OFFICIAL_URLS: Record<string, string> = {
    mca: 'https://www.mca.gov.in',
    sebi: 'https://www.sebi.gov.in',
    rbi: 'https://www.rbi.org.in',
    nclt: 'https://nclt.gov.in',
    ibc: 'https://ibbi.gov.in',
    fema: 'https://rbi.org.in/Scripts/BS_FemaNotifications.aspx',
    cci: 'https://cci.gov.in',
    labour: 'https://labour.gov.in',
    'labour-law': 'https://labour.gov.in',
    ifsca: 'https://ifsca.gov.in',
}

const WIKIPEDIA_URLS: Record<string, string> = {
    mca: 'https://en.wikipedia.org/wiki/Ministry_of_Corporate_Affairs',
    sebi: 'https://en.wikipedia.org/wiki/Securities_and_Exchange_Board_of_India',
    rbi: 'https://en.wikipedia.org/wiki/Reserve_Bank_of_India',
    nclt: 'https://en.wikipedia.org/wiki/National_Company_Law_Tribunal',
    ibc: 'https://en.wikipedia.org/wiki/Insolvency_and_Bankruptcy_Board_of_India',
    fema: 'https://en.wikipedia.org/wiki/Foreign_Exchange_Management_Act',
    cci: 'https://en.wikipedia.org/wiki/Competition_Commission_of_India',
    labour: 'https://en.wikipedia.org/wiki/Ministry_of_Labour_and_Employment_(India)',
    'labour-law': 'https://en.wikipedia.org/wiki/Ministry_of_Labour_and_Employment_(India)',
    ifsca: 'https://en.wikipedia.org/wiki/International_Financial_Services_Centres_Authority',
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
    mca: [
        'mca circulars',
        'mca updates today live',
        'mca notifications India',
        'mca circulars and notifications',
        'mca latest circulars 2026',
        'MCA21 compliance updates',
        'mca circular',
    ],
    sebi: [
        'sebi circulars 2026',
        'sebi master circulars',
        'sebi lodr amendments',
        'latest sebi circulars',
        'sebi capital market regulations',
        'new sebi rules',
        'sebi notifications India',
    ],
    rbi: [
        'rbi latest circular',
        'latest rbi circular for banks',
        'rbi master directions 2026',
        'rbi notification today',
        'rbi circular 2026',
        'rbi banking regulations India',
    ],
    fema: [
        'fema updates',
        'recent changes in fema act',
        'rbi fema notifications',
        'fdi odi compliance India',
        'cross border transactions fema',
    ],
    nclt: [
        'nclt circulars',
        'latest nclt orders',
        'nclt judgments today',
        'nclat appellate orders',
        'national company law tribunal orders',
    ],
    ibc: [
        'ibbi circulars',
        'ibc updates 2026',
        'cirp regulations ibbi',
        'insolvency and bankruptcy code notifications',
        'latest ibc guidelines',
    ],
    cci: [
        'cci orders',
        'competition commission of india circulars',
        'cci combination approvals',
        'green channel approval cci',
    ],
    labour: [
        'labour law updates India',
        'epfo circulars 2026',
        'esic notifications',
        '4 labour codes compliance India',
    ],
    'labour-law': [
        'labour law updates India',
        'epfo circulars 2026',
        'esic notifications',
        '4 labour codes compliance India',
    ],
    ifsca: [
        'ifsca circulars 2026',
        'gift city regulations',
        'ifsca fund management regulations 2026',
        'ifsc banking unit compliance',
        'ifsca latest notifications',
        'gift city compliance updates',
        'ifsca guidelines for fme',
        'ifsca aircraft leasing regulations',
        'ifsca market abuse regulations',
    ],
}

interface CategoryFAQ {
    question: string
    answer: string
}

const CATEGORY_REGULATORY_FAQS: Record<string, CategoryFAQ[]> = {
    mca: [
        {
            question: 'Are MCA circulars legally binding under the Companies Act, 2013?',
            answer: 'Yes. Circulars issued by the Ministry of Corporate Affairs clarify procedural requirements, statutory compliance timelines, and interpretations of the Companies Act, 2013 and LLP Act, 2008. They are legally binding on all registered companies, LLPs, and directors in India.',
        },
        {
            question: 'Where can compliance professionals verify official MCA notifications?',
            answer: 'Official MCA circulars, notifications, and orders are published directly on the MCA21 portal (mca.gov.in) under the Notifications & Circulars repository. CorpLawUpdates tracks and summarizes them daily with direct links to official gazette copies.',
        },
        {
            question: 'What is the difference between an MCA notification and a circular?',
            answer: 'An MCA notification amends statutory rules, enacts new sections of the Companies Act, or modifies statutory fee schedules (published in the Gazette of India). An MCA circular provides administrative clarifications, procedural relief, or filing extensions without amending substantive statutory provisions.',
        },
    ],
    sebi: [
        {
            question: 'What is the legal effect of SEBI circulars and Master Circulars?',
            answer: 'SEBI circulars are issued under Section 11(1) of the SEBI Act, 1992. They are statutory directives legally binding on stock exchanges, depositories, mutual funds, listed entities, merchant bankers, and registered market intermediaries.',
        },
        {
            question: 'How frequently does SEBI issue Master Circulars?',
            answer: 'SEBI consolidates individual circulars into subject-specific Master Circulars annually (covering LODR, Mutual Funds, Substantial Acquisition of Shares, and Intermediaries) to provide a single, updated point of reference for market participants.',
        },
        {
            question: 'Where are official SEBI circulars published?',
            answer: 'Official circulars, board meeting decisions, and consultation papers are published on the official SEBI portal (sebi.gov.in) in the Legal Framework repository.',
        },
    ],
    rbi: [
        {
            question: 'What is the difference between an RBI circular and a Master Direction?',
            answer: 'An RBI circular announces a specific operational instruction or policy revision. Master Directions consolidate all existing instructions on a regulatory area (e.g., KYC, NBFCs, FEMA, Digital Payments) into an ongoing running compendium updated dynamically whenever amendments occur.',
        },
        {
            question: 'Are RBI circulars binding on all banks and NBFCs in India?',
            answer: 'Yes. RBI directives issued under the Banking Regulation Act, 1949 and RBI Act, 1934 are mandatory statutory directions. Non-compliance attracts supervisory action and monetary penalties under Section 47A.',
        },
        {
            question: 'Where can banks and financial institutions track RBI circulars?',
            answer: 'Official RBI notifications, circulars, and Master Directions are published on rbi.org.in under the Notifications and Master Directions sections.',
        },
    ],
    nclt: [
        {
            question: 'What matters are adjudicated by the NCLT?',
            answer: 'The National Company Law Tribunal (NCLT) adjudicates corporate dispute petitions under the Companies Act, 2013 (mergers, amalgamations, oppression, mismanagement, capital reduction) and corporate insolvency proceedings under the Insolvency and Bankruptcy Code, 2016.',
        },
        {
            question: 'Where can daily NCLT orders and cause lists be accessed?',
            answer: 'Orders and cause lists are published on nclt.gov.in across its principal bench in New Delhi and regional benches across India.',
        },
        {
            question: 'Can NCLT orders be appealed, and what is the appellate forum?',
            answer: 'Appeals against orders passed by any bench of the NCLT lie before the National Company Law Appellate Tribunal (NCLAT) under Section 421 of the Companies Act, 2013 and Section 61 of the IBC, 2016, with a statutory limitation period of 45 days (extendable by 15 days on showing sufficient cause).',
        },
        {
            question: 'Does NCLT have jurisdiction over personal insolvency under IBC?',
            answer: 'Yes. Under Section 60(1) and 60(2) of the IBC, the NCLT bench having territorial jurisdiction over the corporate debtor is also the Adjudicating Authority for insolvency and bankruptcy proceedings of personal guarantors to the corporate debtor.',
        },
    ],
    ibc: [
        {
            question: 'Who regulates insolvency circulars and guidelines in India?',
            answer: 'Insolvency rules and guidelines are administered by the Ministry of Corporate Affairs (MCA) and the Insolvency and Bankruptcy Board of India (IBBI) under the Insolvency and Bankruptcy Code, 2016.',
        },
        {
            question: 'What is the statutory timeline for CIRP under IBC?',
            answer: 'Under Section 12 of the IBC, 2016, Corporate Insolvency Resolution Process (CIRP) must be completed within 180 days, with a maximum permissible extension of up to 330 days including legal proceedings.',
        },
        {
            question: 'What is the waterfall mechanism of liquidation payout under Section 53 of IBC?',
            answer: 'Under Section 53 of the IBC, liquidation proceeds are distributed in strict hierarchy: (1) CIRP and liquidation costs in full; (2) Workmen dues (24 months) and secured debts ranking equally; (3) Wages of other employees (12 months); (4) Financial debts owed to unsecured creditors; (5) Government taxes (2 years) and remaining secured debt; (6) Any remaining debts and liabilities; (7) Preference shareholders; (8) Equity shareholders.',
        },
    ],
    fema: [
        {
            question: 'Who administers FEMA regulations and notifications in India?',
            answer: 'The Reserve Bank of India (RBI) administers FEMA regulations for foreign exchange and cross-border capital transactions (FDI, ODI, ECB), while the Directorate of Enforcement (ED) investigates contraventions.',
        },
        {
            question: 'What is the penalty for non-compliance under FEMA, 1999?',
            answer: 'FEMA violations are civil contraventions punishable with penalties up to thrice the amount involved, or up to ₹2 lakh where the amount is unquantifiable, along with compounding options under RBI rules.',
        },
        {
            question: 'What is the difference between Automatic Route and Approval Route for FDI?',
            answer: 'Under the Foreign Exchange Management (Non-debt Instruments) Rules, 2019, FDI under the Automatic Route requires no prior approval from the Government or RBI, requiring only post-investment filing in Form FC-GPR on the FIRMS portal within 30 days. Under the Government Approval Route, prior approval from the relevant administrative ministry is mandatory before inward remittance.',
        },
        {
            question: 'What is the External Commercial Borrowing (ECB) framework under FEMA?',
            answer: 'ECB refers to commercial loans raised by eligible resident entities from recognized non-resident entities. Under the automatic route, eligible borrowers can raise up to USD 750 million per financial year with a minimum average maturity period (MAMP) of 3 to 5 years depending on end-use.',
        },
    ],
    cci: [
        {
            question: 'What is the primary function of CCI orders and notifications?',
            answer: 'The Competition Commission of India enforces the Competition Act, 2002 to prohibit anti-competitive agreements, prevent abuse of dominant market position, and review combinations (mergers and acquisitions) to protect fair competition.',
        },
        {
            question: 'What is the Green Channel approval route in CCI?',
            answer: 'The Green Channel provides automatic deemed approval for combination filings where there are no horizontal overlaps, vertical relationships, or complementary activities between the transacting parties.',
        },
        {
            question: 'What constitutes an abuse of dominant position under Section 4 of the Competition Act?',
            answer: 'Section 4 prohibits unfair or discriminatory conditions in purchase or sale, predatory pricing, limiting or restricting scientific/technical development, denial of market access, and leveraging dominance in one relevant market to enter or protect another.',
        },
        {
            question: 'What are the combination thresholds requiring mandatory notification to CCI?',
            answer: 'Parties to mergers, amalgamations, or acquisitions exceeding prescribed domestic or worldwide asset/turnover thresholds (or meeting the Deal Value Threshold of ₹2,000 crore under the Competition Amendment Act) must file a notification with CCI and observe a mandatory 150-day standstill period prior to closing.',
        },
    ],
    labour: [
        {
            question: 'What are the 4 Labour Codes in India?',
            answer: 'The 4 Labour Codes are the Code on Wages (2019), Industrial Relations Code (2020), Code on Social Security (2020), and Occupational Safety, Health and Working Conditions (OSHWC) Code (2020), consolidating 29 central labor statutes.',
        },
        {
            question: 'Where are official EPFO and ESIC circulars published?',
            answer: 'EPFO circulars are published at epfindia.gov.in and ESIC circulars at esic.gov.in, tracking monthly ECR filing guidelines, contribution rates, and social security updates.',
        },
        {
            question: 'What are the compliance responsibilities of employers under EPF ECR?',
            answer: 'Under the EPF & MP Act, 1952, establishments employing 20 or more persons must deduct 12% statutory PF contributions from eligible employees wages, match with employer contributions (including EPS), and remit electronically via the Electronic Challan-cum-Return (ECR) portal on epfindia.gov.in by the 15th of each succeeding month.',
        },
        {
            question: 'What is the threshold limit and wage ceiling for ESIC coverage in India?',
            answer: 'Under the ESI Act, 1948, non-seasonal factories employing 10 or more persons (and notified establishments) must enroll employees whose gross monthly wages are up to ₹21,000 (₹25,000 for persons with disabilities). Employer contribution is 3.25% and employee contribution is 0.75% of wages.',
        },
    ],
    'labour-law': [
        {
            question: 'What are the 4 Labour Codes in India?',
            answer: 'The 4 Labour Codes are the Code on Wages (2019), Industrial Relations Code (2020), Code on Social Security (2020), and Occupational Safety, Health and Working Conditions (OSHWC) Code (2020), consolidating 29 central labor statutes.',
        },
        {
            question: 'Where are official EPFO and ESIC circulars published?',
            answer: 'EPFO circulars are published at epfindia.gov.in and ESIC circulars at esic.gov.in, tracking monthly ECR filing guidelines, contribution rates, and social security updates.',
        },
    ],
    ifsca: [
        {
            question: 'What is the regulatory role of IFSCA in GIFT City IFSC?',
            answer: 'The International Financial Services Centres Authority (IFSCA), established under the IFSCA Act, 2019, is the unified statutory regulator for financial products, financial services, and financial institutions in International Financial Services Centres (IFSCs) in India. It consolidates regulatory powers that were previously exercised by RBI, SEBI, IRDAI, and PFRDA into a single window.',
        },
        {
            question: 'What entities are regulated under IFSCA regulations?',
            answer: 'IFSCA regulates Fund Management Entities (FMEs) managing AIFs and Family Investment Funds (FIFs), IFSC Banking Units (IBUs), international stock exchanges (NSE IX, India INX), capital market intermediaries, aircraft and ship leasing units, bullion exchanges (IIBX), and FinTech sandboxes operating in GIFT City.',
        },
        {
            question: 'What are the main compliance requirements for FMEs under IFSCA Fund Management Regulations?',
            answer: 'Fund Management Entities must maintain prescribed net worth requirements, appoint dedicated Key Managerial Personnel (KMPs) and Compliance Officers, adhere to portfolio diversification limits, compute and disclose Scheme NAV at mandatory intervals, and submit periodic regulatory filings through the IFSCA online reporting portal.',
        },
        {
            question: 'What tax benefits are available to units registered under IFSCA in GIFT City?',
            answer: 'Under Section 80LA of the Income-tax Act, eligible IFSC units enjoy a 100% tax exemption on profits for 10 consecutive assessment years out of 15 years. Additional benefits include a concessional Minimum Alternate Tax (MAT) / Alternate Minimum Tax (AMT) rate of 9%, exemption from Dividend Distribution Tax, and GST exemptions on transactions carried out on IFSC exchanges.',
        },
    ],
}

interface RelatedResource {
    title: string
    description: string
    href: string
    tag: string
}

const CATEGORY_RELATED_RESOURCES: Record<string, RelatedResource[]> = {
    mca: [
        {
            title: 'MCA Company Filing & Late Fee Calculator',
            description: 'Calculate official ROC filing fees and delayed additional late fee slabs under Companies Act, 2013.',
            href: '/tools/fee-calculator/companies',
            tag: 'Calculator',
        },
        {
            title: 'LLP Form 8 & Form 11 Late Fee Calculator',
            description: 'Compute per-day additional fees for delayed LLP Annual Returns and Statement of Account & Solvency.',
            href: '/tools/fee-calculator/llp',
            tag: 'Calculator',
        },
        {
            title: 'Form ADT-1 Filing & Appointment Guide',
            description: 'Auditor appointment rules, intimation timelines, and late fee slabs under Section 139.',
            href: '/tools/fee-calculator/companies/adt-1',
            tag: 'Statutory Tool',
        },
        {
            title: 'Form AOC-4 Financial Statements Filing Guide',
            description: 'Financial statement filing deadlines, XBRL requirements, and ROC late fees under Section 137.',
            href: '/tools/fee-calculator/companies/aoc-4',
            tag: 'Statutory Tool',
        },
    ],
    sebi: [
        {
            title: 'Share Transfer Deed (Form SH-4) Workstation',
            description: 'Generate legally vetted Form SH-4 deeds under Section 56 with instant stamp duty computation.',
            href: '/documents/share-transfer-deed',
            tag: 'Legal Workstation',
        },
        {
            title: 'Board Resolution for Bank Account Operations',
            description: 'Draft compliant board resolutions for corporate banking mandates, authorized signatories, and credit facilities.',
            href: '/documents/board-resolution-bank-account-opening',
            tag: 'Legal Workstation',
        },
        {
            title: 'MCA Corporate Governance & ROC Updates',
            description: 'Track Companies Act circulars and statutory filing requirements complementary to SEBI LODR.',
            href: '/category/mca',
            tag: 'Category Hub',
        },
    ],
    rbi: [
        {
            title: 'MSME Delayed Payment Interest Calculator',
            description: 'Compute compound interest with monthly rests under Section 16 of the MSMED Act, 2006.',
            href: '/tools/fee-calculator/msme',
            tag: 'Calculator',
        },
        {
            title: 'Equitable Mortgage Deed Workstation',
            description: 'Generate commercial property mortgage deeds by deposit of title deeds under Transfer of Property Act.',
            href: '/documents/equitable-mortgage-deed',
            tag: 'Legal Workstation',
        },
        {
            title: 'FEMA & Cross-Border Capital Notifications',
            description: 'Track RBI notifications on foreign direct investment (FDI), ODI, and external commercial borrowings.',
            href: '/category/fema',
            tag: 'Category Hub',
        },
    ],
    fema: [
        {
            title: 'RBI Master Directions & Circulars',
            description: 'Track Reserve Bank of India foreign exchange directives and monetary compliance.',
            href: '/category/rbi',
            tag: 'Category Hub',
        },
        {
            title: 'Commercial Memorandum of Understanding (MoU)',
            description: 'Draft cross-border commercial MoUs with dispute resolution and governing law clauses.',
            href: '/documents/memorandum-of-understanding',
            tag: 'Legal Workstation',
        },
        {
            title: 'MCA Foreign Company Compliances',
            description: 'ROC filing requirements and FC-1 to FC-4 statutory compliance for foreign companies in India.',
            href: '/category/mca',
            tag: 'Category Hub',
        },
    ],
    nclt: [
        {
            title: 'Insolvency and Bankruptcy Code (IBC) Updates',
            description: 'Track IBBI circulars, CIRP regulations, and personal guarantor insolvency rules.',
            href: '/category/ibc',
            tag: 'Category Hub',
        },
        {
            title: 'Board Resolution for Corporate Filings',
            description: 'Draft certified board resolutions authorizing corporate filings before NCLT benches.',
            href: '/documents/board-resolution-bank-account-opening',
            tag: 'Legal Workstation',
        },
        {
            title: 'MCA Companies Act Notifications',
            description: 'Section-wise company law amendments and adjudication orders from the Ministry of Corporate Affairs.',
            href: '/category/mca',
            tag: 'Category Hub',
        },
    ],
    ibc: [
        {
            title: 'Personal Guarantor Insolvency Safeguards (IBBI)',
            description: 'Analysis of IBBI guidelines, asset safeguards, and insolvency process for personal guarantors.',
            href: '/updates/ibbi-personal-guarantor-insolvency-safeguards-2026',
            tag: 'Regulatory Guide',
        },
        {
            title: 'Limited Insolvency Examination (Phase 10) Syllabus',
            description: 'Detailed syllabus, weighting, and case study requirements for insolvency professionals.',
            href: '/updates/ibbi-phase-10-syllabus-limited-insolvency-examination-2026',
            tag: 'Regulatory Guide',
        },
        {
            title: 'NCLT Orders & Benches Hub',
            description: 'Track NCLT insolvency admissions, resolution approvals, and liquidation orders across India.',
            href: '/category/nclt',
            tag: 'Category Hub',
        },
    ],
    cci: [
        {
            title: 'MCA Corporate Law Hub',
            description: 'Merger and amalgamation procedures under Sections 230–232 of the Companies Act, 2013.',
            href: '/category/mca',
            tag: 'Category Hub',
        },
        {
            title: 'Partnership Deed Drafting Workstation',
            description: 'Generate commercial partnership agreements with capital clauses, profit ratios, and governance.',
            href: '/documents/partnership-deed',
            tag: 'Legal Workstation',
        },
    ],
    labour: [
        {
            title: 'Partnership Deed & Employment Workstation',
            description: 'Create statutory deeds with partner remuneration, retirement terms, and statutory compliance.',
            href: '/documents/partnership-deed',
            tag: 'Legal Workstation',
        },
        {
            title: 'MCA Director & Officer Compliance',
            description: 'Director appointments, DIR-3 KYC, and statutory filings under Companies Act, 2013.',
            href: '/category/mca',
            tag: 'Category Hub',
        },
    ],
    'labour-law': [
        {
            title: 'Partnership Deed & Employment Workstation',
            description: 'Create statutory deeds with partner remuneration, retirement terms, and statutory compliance.',
            href: '/documents/partnership-deed',
            tag: 'Legal Workstation',
        },
        {
            title: 'MCA Director & Officer Compliance',
            description: 'Director appointments, DIR-3 KYC, and statutory filings under Companies Act, 2013.',
            href: '/category/mca',
            tag: 'Category Hub',
        },
    ],
    ifsca: [
        {
            title: 'FEMA & Cross-Border Capital Notifications',
            description: 'Track RBI notifications on foreign direct investment (FDI), ODI, and external commercial borrowings applicable to IFSC.',
            href: '/category/fema',
            tag: 'Category Hub',
        },
        {
            title: 'SEBI Notifications & Capital Markets',
            description: 'Monitor domestic securities regulations, AIF frameworks, and intermediary compliance standards.',
            href: '/category/sebi',
            tag: 'Category Hub',
        },
        {
            title: 'Share Transfer Deed (Form SH-4) Workstation',
            description: 'Generate legally vetted Form SH-4 transfer deeds with automatic stamp duty calculations under Section 56.',
            href: '/documents/share-transfer-deed',
            tag: 'Legal Workstation',
        },
        {
            title: 'RBI Master Directions & Banking Hub',
            description: 'Review banking regulation and monetary directions governing cross-border financial operations.',
            href: '/category/rbi',
            tag: 'Category Hub',
        },
    ],
}

// Answer-First definition paragraphs for AI Overview + SEO
const ANSWER_FIRST: Record<string, { definition: string; facts: string[] }> = {
    mca: {
        definition:
            'MCA Circulars are official communications issued by the Ministry of Corporate Affairs under the Companies Act, 2013. They clarify procedural requirements, grant extensions, and amend compliance deadlines for registered companies and LLPs in India. This page tracks all latest MCA circulars, notifications, orders, consultation papers and clarifications.',
        facts: [
            'MCA issues circulars, notifications, orders, and consultation papers.',
            'Key compliance forms include MCA V3 portal filings such as MGT-7, AOC-4, DIR-3 KYC.',
            'MCA circulars are binding on all companies registered under Companies Act, 2013.',
            'Violations may lead to penalty, adjudication, or director disqualification.',
        ],
    },
    sebi: {
        definition:
            'SEBI Circulars are official directives issued by the Securities and Exchange Board of India under the SEBI Act, 1992. They regulate capital markets, stock exchanges, mutual funds, listed companies, and investor protection in India. This page tracks all latest SEBI circulars, master circulars, notifications, and consultation papers.',
        facts: [
            'SEBI issues circulars, master circulars, informal guidance, and consultation papers.',
            'SEBI regulates stock exchanges, brokers, mutual funds, and listed entities.',
            'SEBI circulars apply to SEBI-registered market intermediaries and listed companies.',
            'Non-compliance can lead to warnings, penalties, or suspension of registration.',
        ],
    },
    rbi: {
        definition:
            'RBI Circulars are official directives issued by the Reserve Bank of India under the RBI Act, 1934 and the Banking Regulation Act, 1949. They cover banking regulation, monetary policy, FEMA compliance, foreign exchange management, and NBFC rules in India. This page tracks all latest RBI circulars, master directions, notifications, and press releases.',
        facts: [
            'RBI issues circulars, master directions, press releases, and guidelines.',
            'RBI regulates commercial banks, cooperative banks, NBFCs, and payment systems.',
            'RBI circulars are binding on all scheduled banks and regulated entities.',
            'FEMA (Foreign Exchange Management Act) circulars are also issued under RBI authority.',
        ],
    },
    nclt: {
        definition:
            'NCLT Orders are judicial pronouncements issued by the National Company Law Tribunal under the Companies Act, 2013 and the Insolvency and Bankruptcy Code, 2016. They adjudicate corporate insolvency, mergers, acquisitions, oppression and mismanagement disputes. This page tracks all latest NCLT orders, circulars, and practice directions.',
        facts: [
            'NCLT has benches across India including Delhi, Mumbai, Chennai, and Kolkata.',
            'NCLT adjudicates insolvency resolution proceedings (CIRP) and liquidation.',
            'NCLT orders on mergers and amalgamations are binding under Companies Act, 2013.',
            'NCLAT is the appellate tribunal for NCLT orders.',
        ],
    },
    ibc: {
        definition:
            'IBC Updates refer to amendments, notifications, and circulars issued under the Insolvency and Bankruptcy Code, 2016 by the Ministry of Corporate Affairs and the Insolvency and Bankruptcy Board of India (IBBI). They govern corporate insolvency resolution, personal insolvency, and liquidation in India. This page tracks all latest IBC updates, IBBI circulars, and regulatory changes.',
        facts: [
            'IBC was enacted in 2016 to consolidate insolvency laws in India.',
            'IBBI (Insolvency and Bankruptcy Board of India) is the regulator under IBC.',
            'The Corporate Insolvency Resolution Process (CIRP) must be completed within 330 days.',
            'IBC governs both corporate and personal insolvency proceedings.',
        ],
    },
    fema: {
        definition:
            'FEMA Notifications are official directives issued under the Foreign Exchange Management Act, 1999 by the Reserve Bank of India. They govern cross-border transactions, foreign direct investment (FDI), overseas direct investment (ODI), and external commercial borrowings (ECB) in India. This page tracks all latest FEMA notifications, master directions, and RBI circulars on foreign exchange.',
        facts: [
            'FEMA replaced FERA (Foreign Exchange Regulation Act) in 1999.',
            'FEMA violations are civil offences unlike the erstwhile criminal offences under FERA.',
            'RBI issues FEMA Master Directions on FDI, ODI, ECB, and remittances.',
            'Enforcement Directorate (ED) investigates FEMA violations.',
        ],
    },
    cci: {
        definition:
            'CCI Orders and Notifications are official directives issued by the Competition Commission of India under the Competition Act, 2002. They regulate merger control (combinations), prohibit anti-competitive agreements, prevent abuse of dominant position, and enforce fair market competition in India. This page tracks all latest CCI orders, combination approvals, regulations, and press releases.',
        facts: [
            'CCI enforces the Competition Act, 2002 to sustain fair market competition in India.',
            'Section 3 prohibits anti-competitive agreements and cartel behavior.',
            'Section 4 prohibits enterprise abuse of dominant market position.',
            'Section 5 & 6 regulate combinations including mergers, acquisitions, and amalgamations.',
            'Green Channel approval scheme provides automatic clearance for non-overlapping combination filings.',
        ],
    },
    labour: {
        definition:
            'Labour Law Updates & Circulars refer to notifications, rules, and statutory compliance directives issued under the Indian Labour Codes (Code on Wages, Industrial Relations Code, Code on Social Security, and OSHWC Code) and by the Ministry of Labour & Employment, EPFO, and ESIC. They govern minimum wages, provident fund (EPF ECR), employee state insurance, gratuity, and workplace safety in India. This page tracks all latest Labour Law circulars, statutory orders, EPFO directions, and ESIC notifications.',
        facts: [
            'The 4 Labour Codes consolidate 29 central labor enactments into a modern statutory framework.',
            'EPFO regulates Employees Provident Fund (EPF) and Electronic Challan-cum-Return (ECR) monthly filings.',
            'ESIC provides statutory social security and healthcare coverage for eligible employees.',
            'The Code on Wages standardizes minimum wages, bonus payments, and timely salary disbursements across India.',
        ],
    },
    'labour-law': {
        definition:
            'Labour Law Updates & Circulars refer to notifications, rules, and statutory compliance directives issued under the Indian Labour Codes (Code on Wages, Industrial Relations Code, Code on Social Security, and OSHWC Code) and by the Ministry of Labour & Employment, EPFO, and ESIC. They govern minimum wages, provident fund (EPF ECR), employee state insurance, gratuity, and workplace safety in India. This page tracks all latest Labour Law circulars, statutory orders, EPFO directions, and ESIC notifications.',
        facts: [
            'The 4 Labour Codes consolidate 29 central labor enactments into a modern statutory framework.',
            'EPFO regulates Employees Provident Fund (EPF) and Electronic Challan-cum-Return (ECR) monthly filings.',
            'ESIC provides statutory social security and healthcare coverage for eligible employees.',
            'The Code on Wages standardizes minimum wages, bonus payments, and timely salary disbursements across India.',
        ],
    },
    ifsca: {
        definition:
            'IFSCA Regulations, Circulars, and Guidelines are statutory directives issued by the International Financial Services Centres Authority under the IFSCA Act, 2019. Headquartered in GIFT City, Gandhinagar, IFSCA is India’s unified statutory regulator governing financial products, financial services, and financial institutions in International Financial Services Centres (IFSCs). This page tracks all latest IFSCA circulars, regulations, consultation papers, and compliance updates for Fund Management Entities (FMEs), IFSC Banking Units (IBUs), Capital Market Intermediaries, and FinTech entities.',
        facts: [
            'IFSCA was established in 2020 under the IFSCA Act, 2019 as India’s unified financial regulator for IFSCs.',
            'IFSCA exercises the powers of RBI, SEBI, IRDAI, and PFRDA within GIFT City IFSC.',
            'Key regulated entities include Fund Management Entities (FMEs), IFSC Banking Units (IBUs), Stock Exchanges (NSE IX / India INX), and Bullion Exchanges (IIBX).',
            'Units in GIFT City enjoy a 100% tax exemption for 10 out of 15 consecutive years under Section 80LA of the Income-tax Act.',
            'IFSCA also regulates global aircraft leasing, ship leasing, global in-house centres (GICs), and cross-border FinTech sandboxes.',
        ],
    },
}

const UPDATE_TYPE_LABELS: Record<string, string> = {
    circular: 'Circular',
    notification: 'Notification',
    order: 'Order',
    consultation_paper: 'Consultation Paper',
    clarification: 'Clarification',
    rules: 'Rules / Amendment',
    press_release: 'Press Release',
    master_direction: 'Master Direction',
}

export async function generateStaticParams() {
    return CATEGORIES.map((category) => ({ category }))
}

export async function generateMetadata(
    { params, searchParams }: {
        params: Promise<{ category: string }>,
        searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
    }
): Promise<Metadata> {
    const resolvedParams = await params
    const resolvedSearchParams = searchParams ? await searchParams : {}
    const rawCat = resolvedParams.category.toLowerCase()
    if (rawCat === 'labour-law') {
        redirect('/category/labour')
    }
    const cat = rawCat
    const categoryName = cat.toUpperCase()

    const rawPage = resolvedSearchParams.page
    const pageStr = Array.isArray(rawPage) ? rawPage[0] : rawPage
    const pageNum = pageStr ? parseInt(pageStr, 10) : 1
    const isPaginated = !isNaN(pageNum) && pageNum > 1

    const { data: latestUpdate } = await supabase
        .from('updates')
        .select('title, published_at')
        .eq('category', categoryName)
        .not('published_at', 'is', null)
        .lte('published_at', new Date().toISOString())
        .order('published_at', { ascending: false })
        .limit(1)
        .single()

    const dynamicSuffix = latestUpdate ? ` Latest: ${latestUpdate.title}.` : ''

    const title = isPaginated
        ? `Latest ${categoryName} Circulars, Notifications & Updates (Page ${pageNum}) – India`
        : `Latest ${categoryName} Circulars, Notifications & Updates Today – India`

    const description = isPaginated
        ? `Browse page ${pageNum} of latest ${categoryName} circulars, notifications, orders and compliance updates issued by ${CATEGORY_FULL_NAMES[cat] || categoryName}.`
        : `Get the latest ${categoryName} circulars, notifications, orders and regulatory updates today from ${CATEGORY_FULL_NAMES[cat]}. Track all ${categoryName} compliance changes in India.${dynamicSuffix}`

    const url = isPaginated
        ? `https://www.corplawupdates.in/category/${cat}?page=${pageNum}`
        : `https://www.corplawupdates.in/category/${cat}`

    const keywords = CATEGORY_KEYWORDS[cat] || [
        `${categoryName} update today`,
        `${categoryName} circular today`,
        `latest ${categoryName} notifications India`,
        `${categoryName} compliance updates`,
        `${CATEGORY_FULL_NAMES[cat]} circulars`,
        `MCA SEBI RBI updates for CS CA`,
    ]

    return {
        title,
        description,
        keywords,
        alternates: { canonical: url },
        other: {
            'revisit-after': '1 day',
        },
        openGraph: {
            title,
            description,
            url,
            type: 'website',
            images: [{ url: `https://www.corplawupdates.in/api/og?title=${encodeURIComponent(title)}&category=${encodeURIComponent(cat)}`, width: 1200, height: 630 }],
            modifiedTime: latestUpdate?.published_at || new Date().toISOString(),
        } as any,
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [`https://www.corplawupdates.in/api/og?title=${encodeURIComponent(title)}&category=${encodeURIComponent(cat)}`],
        },
    }
}

export default async function CategoryPage({
    params,
    searchParams
}: {
    params: Promise<{ category: string }>,
    searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const resolvedParams = await params
    const resolvedSearchParams = searchParams ? await searchParams : {}

    const originalCat = resolvedParams.category
    const cat = originalCat.toLowerCase()

    if (cat === 'labour-law') {
        redirect('/category/labour')
    }

    if (originalCat !== cat) {
        redirect(`/category/${cat}`)
    }

    if (!CATEGORIES.includes(cat)) {
        notFound()
    }

    const rawPage = resolvedSearchParams.page
    const pageStr = Array.isArray(rawPage) ? rawPage[0] : rawPage
    const page = pageStr ? parseInt(pageStr, 10) : 1
    const currentPage = Math.max(1, isNaN(page) ? 1 : page)
    const ITEMS_PER_PAGE = 12

    const now = new Date().toISOString()
    const from = (currentPage - 1) * ITEMS_PER_PAGE
    const to = from + ITEMS_PER_PAGE - 1

    const categoryBase = (withCount = false) =>
        supabase
            .from('updates')
            .select(UPDATE_LIST_COLUMNS, withCount ? { count: 'exact' } : undefined)
            .eq('category', cat.toUpperCase())
            .not('published_at', 'is', null)
            .lte('published_at', now)
            .order('published_at', { ascending: false })

    const [{ data: paginatedUpdates, count: totalCount }, { data: top5Data }] = await Promise.all([
        categoryBase(true).range(from, to),
        categoryBase().limit(5),
    ])

    const pageUpdates = paginatedUpdates || []

    const top5Updates = top5Data || []
    const totalPages = Math.ceil((totalCount || 0) / ITEMS_PER_PAGE)
    const latestUpdate = top5Updates[0]
    const lastModified = latestUpdate?.published_at ? new Date(latestUpdate.published_at).toISOString() : new Date().toISOString()

    const answerFirst = ANSWER_FIRST[cat]

    const bgColors: Record<string, string> = {
        mca: 'from-blue-600 to-blue-800',
        sebi: 'from-emerald-600 to-emerald-800',
        rbi: 'from-violet-600 to-violet-800',
        nclt: 'from-orange-500 to-orange-700',
        ibc: 'from-red-600 to-red-800',
        fema: 'from-teal-600 to-teal-800',
        cci: 'from-indigo-600 to-indigo-800',
        labour: 'from-amber-600 to-amber-800',
        'labour-law': 'from-amber-600 to-amber-800',
        ifsca: 'from-cyan-700 to-cyan-900',
    }

    // ─── JSON-LD Schemas ───────────────────────────────────────────────────────

    const itemListSchema = top5Updates.length > 0 ? {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        'name': `Latest ${cat.toUpperCase()} Circulars & Notifications`,
        'description': `Chronological list of the most recent ${cat.toUpperCase()} regulatory documents.`,
        'numberOfItems': top5Updates.length,
        'itemListElement': top5Updates.map((u: any, index: number) => ({
            '@type': 'ListItem',
            'position': index + 1,
            'name': u.title,
            'url': `https://www.corplawupdates.in/updates/${u.slug}`,
            'datePublished': u.published_at,
        })),
    } : null

    const collectionPageSchema = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        'name': `Latest ${cat.toUpperCase()} Circulars, Notifications & Updates`,
        'description': answerFirst.definition,
        'url': `https://www.corplawupdates.in/category/${cat}`,
        'dateModified': lastModified,
        'about': {
            '@type': 'GovernmentOrganization',
            'name': CATEGORY_FULL_NAMES[cat],
            'url': OFFICIAL_URLS[cat],
            ...(WIKIPEDIA_URLS[cat] ? { 'sameAs': [WIKIPEDIA_URLS[cat]] } : {}),
        },
        'publisher': {
            '@type': 'Organization',
            'name': 'CorpLawUpdates.in',
            'url': 'https://www.corplawupdates.in',
        },
        ...(itemListSchema ? { 'mainEntity': itemListSchema } : {}),
    }

    const regulatoryFaqs = CATEGORY_REGULATORY_FAQS[cat] || []
    const dynamicFaqs = top5Updates.slice(0, 3).map((u: any) => ({
        '@type': 'Question',
        'name': `What is the latest ${cat.toUpperCase()} circular/notification about "${u.title}"?`,
        'acceptedAnswer': {
            '@type': 'Answer',
            'text': `${u.summary || u.excerpt || u.title} — Published on ${new Date(u.published_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}. Read more at https://www.corplawupdates.in/updates/${u.slug}`,
        },
    }))

    const allFaqs = [
        ...regulatoryFaqs.map((faq) => ({
            '@type': 'Question',
            'name': faq.question,
            'acceptedAnswer': {
                '@type': 'Answer',
                'text': faq.answer,
            },
        })),
        ...dynamicFaqs,
    ]

    const faqSchema = allFaqs.length > 0 ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': allFaqs,
    } : null

    const relatedResources = CATEGORY_RELATED_RESOURCES[cat] || []

    const definedTermSchema = {
        '@context': 'https://schema.org',
        '@type': 'DefinedTerm',
        'name': `${cat.toUpperCase()} Circular`,
        'description': answerFirst.definition,
        'inDefinedTermSet': 'https://www.corplawupdates.in/category',
        'url': `https://www.corplawupdates.in/category/${cat}`,
    }

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://www.corplawupdates.in' },
            { '@type': 'ListItem', 'position': 2, 'name': 'Categories', 'item': 'https://www.corplawupdates.in/category' },
            { '@type': 'ListItem', 'position': 3, 'name': `${cat.toUpperCase()} Updates`, 'item': `https://www.corplawupdates.in/category/${cat}` },
        ],
    }

    return (
        <div className="min-h-dvh bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
            {/* Category Hero */}
            <div className={`relative bg-gradient-to-br ${bgColors[cat]} text-white overflow-hidden`}>
                <div
                    className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] bg-[size:72px_72px]"
                    aria-hidden="true"
                />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_100%_0%,rgba(255,255,255,0.05),transparent_60%)]" aria-hidden="true" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 relative">
                    {/* Breadcrumb */}
                    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-white/60 text-xs mb-4">
                        <Link href="/" className="hover:text-white transition-colors">Home</Link>
                        <span>/</span>
                        <span className="text-white/80">{cat.toUpperCase()} Updates</span>
                    </nav>

                    <div className="flex items-center gap-3 mb-4">
                        <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase backdrop-blur-sm ring-1 ring-white/30">
                            Regulator
                        </span>
                        <span className="text-white/60 text-sm">·</span>
                        <span className="text-white/80 text-sm font-medium tabular-nums">{totalCount || 0} articles</span>
                        {latestUpdate && (
                            <>
                                <span className="text-white/60 text-sm">·</span>
                                <span className="text-white/70 text-xs">
                                    Last updated: <time dateTime={latestUpdate.published_at} className="tabular-nums">
                                        {new Date(latestUpdate.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </time>
                                </span>
                            </>
                        )}
                    </div>

                    <h1 className="font-heading text-4xl md:text-5xl font-bold mb-3 animate-fade-up">
                        Latest {cat.toUpperCase()} Circulars, Notifications & Updates
                    </h1>

                    {/* Answer-First Paragraph for AI Overview */}
                    <p className="text-base md:text-lg text-white/90 max-w-3xl leading-relaxed mb-4">
                        {answerFirst.definition}
                    </p>

                    <p className="text-sm text-white/60">
                        Updated daily · <a href={OFFICIAL_URLS[cat]} target="_blank" rel="noopener noreferrer" className="underline hover:text-white transition-colors">{CATEGORY_FULL_NAMES[cat]} Official Site ↗</a>
                    </p>
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-7xl mx-auto py-10 px-4">
                {pageUpdates.length > 0 ? (
                    <section aria-labelledby="category-updates-heading">
                        <h2 id="category-updates-heading" className="sr-only">
                            All {cat.toUpperCase()} Regulatory Updates and Circulars
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-12">
                            {pageUpdates.map((update: any, i: number) => (
                                <UpdateCard
                                    key={update.id}
                                    update={update}
                                    animationDelay={i * 60}
                                />
                            ))}
                        </div>
                        {totalPages > 1 && (
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                basePath={`/category/${cat}`}
                            />
                        )}
                    </section>
                ) : (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-card ring-1 ring-slate-900/[0.02] dark:ring-white/[0.02]">
                        <EmptyState
                            icon="📋"
                            title={`Recent ${cat.toUpperCase()} Circulars & Gazette Notifications`}
                            description={`Official notifications and circulars for ${CATEGORY_FULL_NAMES[cat] || cat.toUpperCase()} are monitored and indexed dynamically in real time. Explore our statutory intelligence guides, regulatory FAQs, and compliance calculators below.`}
                            actionLabel="Subscribe to Regulatory Alerts"
                            actionHref="/newsletter"
                        />
                    </div>
                )}
            </div>

            {/* Dynamic Latest Circulars & Notifications (Bottom — FAQ-style for AI) */}
            {top5Updates.length > 0 && (
                <section className="max-w-7xl mx-auto px-4 py-8 mb-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 md:p-8">
                        <h2 className="text-2xl font-bold text-navy dark:text-white mb-2 font-heading">
                            Latest {cat.toUpperCase()} Circulars & Notifications
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                            {new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })} · Auto-updated with every new publication
                        </p>
                        <div className="space-y-6">
                            {top5Updates.map((u: any, idx: number) => (
                                <div key={u.id} className={`${idx !== top5Updates.length - 1 ? 'border-b border-slate-100 dark:border-slate-800 pb-6' : ''}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        {u.update_type && (
                                            <span className="text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">
                                                {UPDATE_TYPE_LABELS[u.update_type] || u.update_type}
                                            </span>
                                        )}
                                        <time dateTime={u.published_at} className="text-xs font-medium text-slate-600 dark:text-slate-400 tabular-nums">
                                            {new Date(u.published_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </time>
                                    </div>
                                    <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-1 leading-snug">
                                        <Link href={`/updates/${u.slug}`} className="hover:text-gold transition-colors">
                                            {u.title}
                                        </Link>
                                    </h3>
                                    {u.excerpt && (
                                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">{u.excerpt}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Regulatory FAQs (AI Overview & Search Answers) */}
            {regulatoryFaqs.length > 0 && (
                <section className="max-w-7xl mx-auto px-4 py-8 mb-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 md:p-8">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-800/60">
                                Regulatory Intelligence
                            </span>
                        </div>
                        <h2 className="text-2xl font-bold text-navy dark:text-white mb-2 font-heading">
                            {cat.toUpperCase()} Compliance & Regulatory FAQs
                        </h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                            Essential compliance answers for Company Secretaries, Chartered Accountants, and corporate legal teams.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {regulatoryFaqs.map((faq, idx) => (
                                <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-2 flex items-start gap-2">
                                        <span className="text-amber-600 dark:text-amber-400 font-bold">Q.</span>
                                        <span>{faq.question}</span>
                                    </h3>
                                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pl-5">
                                        {faq.answer}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Related Compliance Tools & Workstations (Topic Hub) */}
            {relatedResources.length > 0 && (
                <section className="max-w-7xl mx-auto px-4 py-8 mb-4">
                    <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-2xl border border-slate-800 p-6 md:p-8 shadow-md">
                        <div className="flex items-center justify-between flex-wrap gap-2 mb-6">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                                    Topic Hub
                                </span>
                                <h2 className="text-2xl font-bold text-white mt-2 font-heading">
                                    Related {cat.toUpperCase()} Statutory Tools & Workstations
                                </h2>
                            </div>
                            <p className="text-xs text-slate-400 max-w-md">
                                Streamline your filings, statutory late fee computations, and corporate legal drafting.
                            </p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {relatedResources.map((res, idx) => (
                                <Link
                                    key={idx}
                                    href={res.href}
                                    className="group flex flex-col justify-between p-4 rounded-xl bg-slate-800/70 border border-slate-700/70 hover:border-amber-400/50 hover:bg-slate-800 transition-all duration-200"
                                >
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] font-semibold tracking-wider uppercase text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded">
                                                {res.tag}
                                            </span>
                                            <span className="text-slate-400 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all text-sm font-bold">
                                                →
                                            </span>
                                        </div>
                                        <h3 className="text-sm font-bold text-slate-100 group-hover:text-amber-300 transition-colors mb-1.5 line-clamp-2">
                                            {res.title}
                                        </h3>
                                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                                            {res.description}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Professional SEO Knowledge Footer — "About" Section */}
            <section className="max-w-7xl mx-auto px-4 py-10 border-t border-slate-100 dark:border-slate-800">
                <div className="bg-slate-50/50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/60 dark:border-slate-800 p-8 shadow-sm">
                    {/* Key Facts List */}
                    <h2 className="text-xl font-bold text-navy dark:text-white mb-4 font-heading">
                        About {CATEGORY_FULL_NAMES[cat]} ({cat.toUpperCase()}) — Regulatory Guide
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        <div className="space-y-4">
                            <p>
                                Stay updated with the <strong>latest {cat.toUpperCase()} circulars today</strong>,
                                including <strong>{cat.toUpperCase()} notifications India</strong>, orders, consultation papers and
                                regulatory changes issued by {CATEGORY_FULL_NAMES[cat]}.
                            </p>
                            <ul className="space-y-1 list-none">
                                {answerFirst.facts.map((fact, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <span className="text-gold mt-0.5">✓</span>
                                        <span>{fact}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="space-y-4">
                            <p>
                                Our platform provides simplified, sourced summaries of all <strong>{cat.toUpperCase()} updates in India</strong>
                                to help Company Secretaries, Chartered Accountants (CA), Cost Accountants (CMA), CS/CA/CMA students, legal enthusiasts, corporate lawyers, and compliance teams track <strong>{cat.toUpperCase()} circular and notification updates</strong> in real time.
                            </p>
                            <p>
                                <strong>Official Source:</strong>{' '}
                                <a href={OFFICIAL_URLS[cat]} target="_blank" rel="noopener noreferrer" className="text-gold hover:text-amber-700 transition-colors underline underline-offset-4">
                                    {OFFICIAL_URLS[cat]}
                                </a>
                            </p>
                            <div className="pt-2 flex flex-wrap items-center gap-3">
                                <Link href="/" className="text-xs font-semibold text-gold hover:text-amber-700 transition-colors underline decoration-gold/30 underline-offset-4">
                                    Latest Law Updates ↗
                                </Link>
                                <span className="text-slate-400 text-xs">·</span>
                                <Link href="/category" className="text-xs font-semibold text-gold hover:text-amber-700 transition-colors underline decoration-gold/30 underline-offset-4">
                                    All Regulators ↗
                                </Link>
                                <span className="text-slate-400 text-xs">·</span>
                                <Link href="/tools/fee-calculator" className="text-xs font-semibold text-gold hover:text-amber-700 transition-colors underline decoration-gold/30 underline-offset-4">
                                    Statutory Calculators ↗
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* All JSON-LD Schemas */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(definedTermSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
            {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}
            {itemListSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />}
        </div>
    )
}
