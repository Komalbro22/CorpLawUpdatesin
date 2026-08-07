export interface CINBreakdown {
  cin: string
  isValid: boolean
  listingStatus: {
    code: string
    label: string
    description: string
  }
  nicCode: {
    code: string
    majorDivision: string
    industry: string
    sectorGroup: string
  }
  state: {
    code: string
    name: string
    rocOffice: string
  }
  incorporationYear: number
  companyType: {
    code: string
    label: string
    description: string
    isPublic: boolean
  }
  registrationNumber: string
  statutoryAnalysis: {
    smallCompanyEligibility: string
    agmDeadline: string
    boardMeetingGap: string
    dir3KycDeadline: string
    legalCitations: string[]
  }
}

const STATE_MAP: Record<string, { name: string; roc: string }> = {
  MH: { name: 'Maharashtra', roc: 'ROC Mumbai / Pune' },
  KA: { name: 'Karnataka', roc: 'ROC Bangalore' },
  DL: { name: 'Delhi', roc: 'ROC Delhi' },
  TN: { name: 'Tamil Nadu', roc: 'ROC Chennai / Coimbatore' },
  GJ: { name: 'Gujarat', roc: 'ROC Ahmedabad' },
  WB: { name: 'West Bengal', roc: 'ROC Kolkata' },
  TG: { name: 'Telangana', roc: 'ROC Hyderabad' },
  AP: { name: 'Andhra Pradesh', roc: 'ROC Vijayawada' },
  HR: { name: 'Haryana', roc: 'ROC Chandigarh' },
  UP: { name: 'Uttar Pradesh', roc: 'ROC Kanpur' },
  RJ: { name: 'Rajasthan', roc: 'ROC Jaipur' },
  MP: { name: 'Madhya Pradesh', roc: 'ROC Gwalior' },
  KL: { name: 'Kerala', roc: 'ROC Ernakulam' },
  OR: { name: 'Odisha', roc: 'ROC Cuttack' },
  PB: { name: 'Punjab', roc: 'ROC Chandigarh' },
  BR: { name: 'Bihar', roc: 'ROC Patna' },
  JH: { name: 'Jharkhand', roc: 'ROC Ranchi' },
  CT: { name: 'Chhattisgarh', roc: 'ROC Bilaspur' },
  GA: { name: 'Goa', roc: 'ROC Goa' },
  HP: { name: 'Himachal Pradesh', roc: 'ROC Chandigarh' },
  JK: { name: 'Jammu & Kashmir', roc: 'ROC Jammu' },
  UT: { name: 'Uttarakhand', roc: 'ROC Kanpur' },
  AS: { name: 'Assam', roc: 'ROC Shillong' },
  MN: { name: 'Manipur', roc: 'ROC Shillong' },
  ML: { name: 'Meghalaya', roc: 'ROC Shillong' },
  MZ: { name: 'Mizoram', roc: 'ROC Shillong' },
  NL: { name: 'Nagaland', roc: 'ROC Shillong' },
  TR: { name: 'Tripura', roc: 'ROC Shillong' },
  PY: { name: 'Puducherry', roc: 'ROC Chennai' },
  CH: { name: 'Chandigarh', roc: 'ROC Chandigarh' },
  DN: { name: 'Dadra & Nagar Haveli', roc: 'ROC Ahmedabad' },
  DD: { name: 'Daman & Diu', roc: 'ROC Ahmedabad' },
  AN: { name: 'Andaman & Nicobar', roc: 'ROC Kolkata' },
}

const COMPANY_TYPE_MAP: Record<string, { label: string; description: string; isPublic: boolean }> = {
  PLC: { label: 'Public Limited Company', description: 'Shares can be offered to the public; minimum 7 members & 3 directors.', isPublic: true },
  PTC: { label: 'Private Limited Company', description: 'Privately held; transfer of shares restricted; maximum 200 members.', isPublic: false },
  FLC: { label: 'Foreign Company', description: 'Incorporated outside India with a place of business in India.', isPublic: true },
  SGC: { label: 'State Government Company', description: 'Company in which state government holds ≥ 51% paid-up capital.', isPublic: true },
  GOI: { label: 'Government of India Company', description: 'Central Government holds ≥ 51% paid-up capital.', isPublic: true },
  ULL: { label: 'Public Unlimited Company', description: 'Public company with unlimited liability of members.', isPublic: true },
  ULT: { label: 'Private Unlimited Company', description: 'Private company with unlimited liability of members.', isPublic: false },
  GAP: { label: 'Public Guarantee Company', description: 'Company limited by guarantee (Public).', isPublic: true },
  GAT: { label: 'Private Guarantee Company', description: 'Company limited by guarantee (Private).', isPublic: false },
  NPL: { label: 'Section 8 / Non-Profit Company', description: 'Promotes commerce, art, science, sports, or charity.', isPublic: false },
}

// 2-digit NIC Major Divisions (01 to 99)
const NIC_MAJOR_DIVISIONS: Record<string, { division: string; sector: string }> = {
  '01': { division: 'Crop and Animal Production, Hunting and Related Service Activities', sector: 'Agriculture & Farming' },
  '02': { division: 'Forestry and Logging', sector: 'Agriculture & Natural Resources' },
  '03': { division: 'Fishing and Aquaculture', sector: 'Agriculture & Natural Resources' },
  '05': { division: 'Mining of Coal and Lignite', sector: 'Mining & Natural Resources' },
  '06': { division: 'Extraction of Crude Petroleum and Natural Gas', sector: 'Energy & Mining' },
  '07': { division: 'Mining of Metal Ores', sector: 'Mining & Metals' },
  '08': { division: 'Other Mining and Quarrying', sector: 'Mining & Minerals' },
  '09': { division: 'Mining Support Service Activities', sector: 'Mining Services' },
  '10': { division: 'Manufacture of Food Products', sector: 'Food & FMCG Manufacturing' },
  '11': { division: 'Manufacture of Beverages', sector: 'Food & Beverage' },
  '12': { division: 'Manufacture of Tobacco Products', sector: 'Consumer Goods' },
  '13': { division: 'Manufacture of Textiles', sector: 'Textiles & Apparel' },
  '14': { division: 'Manufacture of Wearing Apparel', sector: 'Apparel & Fashion' },
  '15': { division: 'Manufacture of Leather and Related Products', sector: 'Leather & Goods' },
  '16': { division: 'Manufacture of Wood and Products of Wood', sector: 'Manufacturing & Materials' },
  '17': { division: 'Manufacture of Paper and Paper Products', sector: 'Paper & Packaging' },
  '18': { division: 'Printing and Reproduction of Recorded Media', sector: 'Media & Printing' },
  '19': { division: 'Manufacture of Coke and Refined Petroleum Products', sector: 'Petroleum & Energy' },
  '20': { division: 'Manufacture of Chemicals and Chemical Products', sector: 'Chemicals & Synthetics' },
  '21': { division: 'Manufacture of Pharmaceuticals, Medicinal Chemical and Botanical Products', sector: 'Pharmaceuticals & Healthcare' },
  '22': { division: 'Manufacture of Rubber and Plastics Products', sector: 'Plastics & Polymers' },
  '23': { division: 'Manufacture of Other Non-Metallic Mineral Products', sector: 'Cement & Building Materials' },
  '24': { division: 'Manufacture of Basic Metals', sector: 'Steel & Metallurgy' },
  '25': { division: 'Manufacture of Fabricated Metal Products', sector: 'Heavy Engineering' },
  '26': { division: 'Manufacture of Computer, Electronic and Optical Products', sector: 'Electronics & Hardware' },
  '27': { division: 'Manufacture of Electrical Equipment', sector: 'Electrical Machinery' },
  '28': { division: 'Manufacture of Machinery and Equipment N.E.C.', sector: 'Industrial Machinery' },
  '29': { division: 'Manufacture of Motor Vehicles, Trailers and Semi-Trailers', sector: 'Automotive Industry' },
  '30': { division: 'Manufacture of Other Transport Equipment (Aviation, Ships, Railways)', sector: 'Transportation Equipment' },
  '31': { division: 'Manufacture of Furniture', sector: 'Consumer Goods' },
  '32': { division: 'Other Manufacturing (Jewellery, Medical Instruments, Toys)', sector: 'Specialized Manufacturing' },
  '33': { division: 'Repair and Installation of Machinery and Equipment', sector: 'Industrial Services' },
  '35': { division: 'Electricity, Gas, Steam and Air Conditioning Supply', sector: 'Power & Renewable Energy' },
  '36': { division: 'Water Collection, Treatment and Supply', sector: 'Utilities & Infrastructure' },
  '37': { division: 'Sewerage and Waste Management', sector: 'Utilities & Sanitation' },
  '41': { division: 'Construction of Buildings', sector: 'Real Estate & Infrastructure' },
  '42': { division: 'Civil Engineering (Highways, Bridges, Ports)', sector: 'Civil Construction & Infra' },
  '43': { division: 'Specialized Construction Activities', sector: 'Construction Services' },
  '45': { division: 'Wholesale and Retail Trade and Repair of Motor Vehicles', sector: 'Automobile Retail' },
  '46': { division: 'Wholesale Trade, Except of Motor Vehicles', sector: 'Wholesale & B2B Trade' },
  '47': { division: 'Retail Trade, Except of Motor Vehicles', sector: 'Retail & E-Commerce' },
  '49': { division: 'Land Transport and Transport via Pipelines', sector: 'Logistics & Freight' },
  '50': { division: 'Water Transport', sector: 'Shipping & Ports' },
  '51': { division: 'Air Transport', sector: 'Aviation & Airlines' },
  '52': { division: 'Warehousing and Support Activities for Transportation', sector: 'Logistics & Warehousing' },
  '53': { division: 'Postal and Courier Activities', sector: 'Courier & Logistics' },
  '55': { division: 'Accommodation (Hotels, Resorts, Lodging)', sector: 'Hospitality & Tourism' },
  '56': { division: 'Food and Beverage Service Activities (Restaurants, Catering)', sector: 'Food & Restaurants' },
  '58': { division: 'Publishing Activities (Books, Software Publishing)', sector: 'Media & Publishing' },
  '59': { division: 'Motion Picture, Video and Television Programme Production', sector: 'Entertainment & Film' },
  '60': { division: 'Programming and Broadcasting Activities', sector: 'Media & Broadcasting' },
  '61': { division: 'Telecommunications', sector: 'Telecom & ISP' },
  '62': { division: 'Computer Programming, Consultancy and Related Activities', sector: 'IT & Software Development' },
  '63': { division: 'Information Service Activities (Data Processing, Web Portals)', sector: 'IT & Digital Media' },
  '64': { division: 'Financial Service Activities (Banking, NBFC, Microfinance)', sector: 'Banking & Financial Services' },
  '65': { division: 'Insurance, Reinsurance and Pension Funding', sector: 'Insurance & Pensions' },
  '66': { division: 'Activities Auxiliary to Financial Service and Insurance Activities', sector: 'Fintech & Capital Markets' },
  '68': { division: 'Real Estate Activities', sector: 'Real Estate & Property' },
  '69': { division: 'Legal and Accounting Activities', sector: 'Legal & Professional Services' },
  '70': { division: 'Activities of Head Offices; Management Consultancy Activities', sector: 'Corporate Consultancy' },
  '71': { division: 'Architectural and Engineering Activities; Technical Testing', sector: 'Engineering Consultancy' },
  '72': { division: 'Scientific Research and Development', sector: 'R&D & Innovation' },
  '73': { division: 'Advertising and Market Research', sector: 'Marketing & Advertising' },
  '74': { division: 'Other Professional, Scientific and Technical Activities', sector: 'Professional Services' },
  '75': { division: 'Veterinary Activities', sector: 'Healthcare & Animal Care' },
  '77': { division: 'Rental and Leasing Activities', sector: 'Leasing & Equipment Rental' },
  '78': { division: 'Employment Activities (Staffing, HR Consultancy)', sector: 'HR & Staffing Services' },
  '79': { division: 'Travel Agency, Tour Operator and Reservation Services', sector: 'Travel & Tourism' },
  '80': { division: 'Security and Investigation Activities', sector: 'Security Services' },
  '81': { division: 'Services to Buildings and Landscape Activities', sector: 'Facility Management' },
  '82': { division: 'Office Administrative, Office Support and Other Business Support', sector: 'BPO & Shared Services' },
  '84': { division: 'Public Administration and Defence; Compulsory Social Security', sector: 'Public Sector & Defense' },
  '85': { division: 'Education (Schools, Colleges, EdTech, Training)', sector: 'Education & EdTech' },
  '86': { division: 'Human Health Activities (Hospitals, Clinics, Diagnostics)', sector: 'Healthcare & Hospitals' },
  '87': { division: 'Residential Care Activities', sector: 'Healthcare Services' },
  '88': { division: 'Social Work Activities Without Accommodation', sector: 'Social Services & NGO' },
  '90': { division: 'Creative, Arts and Entertainment Activities', sector: 'Arts & Culture' },
  '91': { division: 'Libraries, Archives, Museums and Other Cultural Activities', sector: 'Culture & Heritage' },
  '92': { division: 'Gambling and Betting Activities', sector: 'Gaming & Recreation' },
  '93': { division: 'Sports Activities and Amusement and Recreation Activities', sector: 'Sports & Gaming' },
  '94': { division: 'Activities of Membership Organizations (Trade Associations)', sector: 'Trade Associations' },
  '95': { division: 'Repair of Computers and Personal and Household Goods', sector: 'Consumer Support' },
  '96': { division: 'Other Personal Service Activities (Beauty, Dry Cleaning)', sector: 'Personal Care Services' },
  '97': { division: 'Activities of Households as Employers of Domestic Personnel', sector: 'Household Services' },
  '98': { division: 'Undifferentiated Goods and Services Producing Activities', sector: 'General Services' },
  '99': { division: 'Activities of Extraterritorial Organizations and Bodies', sector: 'International Bodies' },
}

// Common 5-digit NIC Codes
const NIC_5DIGIT_MAP: Record<string, string> = {
  '29101': 'Manufacture of Passenger Motor Vehicles',
  '29102': 'Manufacture of Commercial Motor Vehicles (Buses & Trucks)',
  '85110': 'Computer Programming, Custom Software & App Development',
  '62011': 'Writing, Modifying, Testing and Supporting Software',
  '62020': 'Computer Consultancy and Computer Facilities Management',
  '65920': 'Monetary Intermediation of Scheduled Commercial Banks',
  '65999': 'Other Financial Intermediation / Non-Banking Financial Company (NBFC)',
  '17110': 'Preparation and Spinning of Textile Fibres',
  '22210': 'Printing of Newspapers, Magazines and Periodicals',
  '74140': 'Business Management & Corporate Strategy Consultancy',
  '70100': 'Real Estate Activities with Own or Leased Property',
  '55101': 'Hotels and Motels with Restaurants',
  '45201': 'Construction of Residential and Commercial Buildings',
  '01100': 'Cultivation of Cereals, Legumes and Oil Seeds',
  '21001': 'Manufacture of Allopathic Pharmaceutical Preparations',
  '24101': 'Manufacture of Pig Iron, Sponge Iron and Steel Products',
  '35101': 'Electric Power Generation Using Solar, Wind or Hydro Energy',
  '47110': 'Retail Sale in Non-Specialized Stores (Supermarkets, Malls)',
  '73100': 'Advertising Agencies and Brand Consultancy Services',
  '85301': 'Higher Technical Education (Engineering, Medical, Law Colleges)',
}

export function decodeCIN(cin: string): CINBreakdown | null {
  if (!cin || typeof cin !== 'string') return null
  const clean = cin.trim().toUpperCase()
  if (clean.length !== 21) return null

  const firstChar = clean[0]
  const isListed = firstChar === 'L'

  const nicCodeStr = clean.substring(1, 6)
  const majorDivisionCode = clean.substring(1, 3)
  const stateCodeStr = clean.substring(6, 8)
  const yearStr = clean.substring(8, 12)
  const typeCodeStr = clean.substring(12, 15)
  const regNoStr = clean.substring(15, 21)

  const stateInfo = STATE_MAP[stateCodeStr] || { name: `State Code (${stateCodeStr})`, roc: 'Registrar of Companies' }
  const typeInfo = COMPANY_TYPE_MAP[typeCodeStr] || {
    label: typeCodeStr === 'PTC' ? 'Private Limited Company' : 'Public Limited Company',
    description: 'Corporate classification registered under MCA.',
    isPublic: typeCodeStr !== 'PTC',
  }

  const divisionInfo = NIC_MAJOR_DIVISIONS[majorDivisionCode] || {
    division: `Industrial Division ${majorDivisionCode}`,
    sector: 'Commercial Industry'
  }
  const specificIndustry = NIC_5DIGIT_MAP[nicCodeStr] || divisionInfo.division

  const year = parseInt(yearStr) || 2000
  const isPublic = typeInfo.isPublic

  const statutoryAnalysis = {
    smallCompanyEligibility: isPublic
      ? '❌ INELIGIBLE (Public Company): Section 2(85) of Companies Act 2013 strictly excludes Public Limited Companies regardless of capital or turnover.'
      : '✅ ELIGIBLE (Subject to Caps): Private Limited Company eligible for Small Company privileges if Paid-Up Capital ≤ ₹4.00 Cr (and Turnover ≤ ₹40.00 Cr). Statutory upper ceiling limit under Sec 2(85) is up to ₹10 Cr capital & ₹100 Cr turnover.',
    agmDeadline: `Under Section 96(1), Annual General Meeting (AGM) must be held within 6 months from financial year end (by 30th September).`,
    boardMeetingGap: `Under Section 173(1), minimum 4 board meetings required per calendar year with maximum gap between consecutive meetings ≤ 120 days.`,
    dir3KycDeadline: `Under Rule 12A, universal annual DIR-3 KYC deadline for all active directors is 30th September.`,
    legalCitations: [
      'Section 2(85), Companies Act 2013 (Small Company Definition)',
      'Section 96(1), Companies Act 2013 (AGM Due Date)',
      'Section 173(1), Companies Act 2013 (Board Meeting Gap Limit)',
      'Rule 12A, Companies (Appointment and Qualification of Directors) Rules 2014 (DIR-3 KYC)',
      'NIC-2008 Code Table (Ministry of Statistics and Programme Implementation)'
    ]
  }

  return {
    cin: clean,
    isValid: true,
    listingStatus: {
      code: firstChar,
      label: isListed ? 'Listed Company' : 'Unlisted Company',
      description: isListed
        ? 'Listed on a recognized Indian Stock Exchange (BSE / NSE).'
        : 'Unlisted entity; shares are held privately and not traded on public stock exchanges.',
    },
    nicCode: {
      code: nicCodeStr,
      majorDivision: divisionInfo.division,
      industry: specificIndustry,
      sectorGroup: divisionInfo.sector,
    },
    state: {
      code: stateCodeStr,
      name: stateInfo.name,
      rocOffice: stateInfo.roc,
    },
    incorporationYear: year,
    companyType: {
      code: typeCodeStr,
      label: typeInfo.label,
      description: typeInfo.description,
      isPublic,
    },
    registrationNumber: regNoStr,
    statutoryAnalysis,
  }
}
