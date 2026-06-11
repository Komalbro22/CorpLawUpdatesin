import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const templates = [
  {
    name: 'Public Notice — Financial Results Extract',
    slug: 'public-notice-financial-results',
    description: 'Public notice format for publishing the extract of standalone unaudited financial results for the quarter and nine months ended, as per Regulation 33 of SEBI LODR.',
    category: 'notices',
    template_content: 'Public Notice of extract of standalone unaudited financial results for the quarter and nine months\n\n{{COMPANY_NAME}}\nCIN: {{COMPANY_CIN}}\nRegd. Office: {{REGD_OFFICE}}\nCont. No. {{CONTACT_NO}} Email id. {{EMAIL_ID}} Fax. No. {{FAX_NO}}\nWebsite: {{WEBSITE}}\n\nEXTRACT OF STANDALONE UNAUDITED FINANCIAL RESULTS FOR THE QUARTER AND NINE MONTHS ENDED {{QUARTER_END_DATE}}\n\n<table style="width: 100%; border-collapse: collapse;" border="1">\n  <thead>\n    <tr>\n      <th rowspan="2" style="padding: 8px; text-align: left;">S. No.</th>\n      <th rowspan="2" style="padding: 8px; text-align: left;">Particulars</th>\n      <th colspan="3" style="padding: 8px; text-align: center;">Quarter ENDED</th>\n      <th colspan="2" style="padding: 8px; text-align: center;">NINE MONTH ENDED</th>\n      <th style="padding: 8px; text-align: center;">YEAR ENDED</th>\n    </tr>\n    <tr>\n      <th style="padding: 8px; text-align: center;">{{Q1_DATE}}</th>\n      <th style="padding: 8px; text-align: center;">{{Q2_DATE}}</th>\n      <th style="padding: 8px; text-align: center;">{{Q3_DATE}}</th>\n      <th style="padding: 8px; text-align: center;">{{M1_DATE}}</th>\n      <th style="padding: 8px; text-align: center;">{{M2_DATE}}</th>\n      <th style="padding: 8px; text-align: center;">{{Y1_DATE}}</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td style="padding: 8px;">1</td>\n      <td style="padding: 8px;">Total Income from Operations</td>\n      <td style="padding: 8px;"></td>\n      <td style="padding: 8px;"></td>\n      <td style="padding: 8px;"></td>\n      <td style="padding: 8px;"></td>\n      <td style="padding: 8px;"></td>\n      <td style="padding: 8px;"></td>\n    </tr>\n    <tr>\n      <td style="padding: 8px;">2</td>\n      <td style="padding: 8px;">Net Profit / (Loss) for the period (before Tax, Exceptional and/or Extraordinary items)</td>\n      <td style="padding: 8px;"></td>\n      <td style="padding: 8px;"></td>\n      <td style="padding: 8px;"></td>\n      <td style="padding: 8px;"></td>\n      <td style="padding: 8px;"></td>\n      <td style="padding: 8px;"></td>\n    </tr>\n    <tr>\n      <td style="padding: 8px;">3</td>\n      <td style="padding: 8px;">Net Profit / (Loss) for the period before tax (after Exceptional and/or Extraordinary items)</td>\n      <td style="padding: 8px;"></td>\n      <td style="padding: 8px;"></td>\n      <td style="padding: 8px;"></td>\n      <td style="padding: 8px;"></td>\n      <td style="padding: 8px;"></td>\n      <td style="padding: 8px;"></td>\n    </tr>\n    <tr>\n      <td style="padding: 8px;">4</td>\n      <td style="padding: 8px;">Net Profit / (Loss) for the period after tax (after Exceptional and/or Extraordinary items)</td>\n      <td style="padding: 8px;"></td>\n      <td style="padding: 8px;"></td>\n      <td style="padding: 8px;"></td>\n      <td style="padding: 8px;"></td>\n      <td style="padding: 8px;"></td>\n      <td style="padding: 8px;"></td>\n    </tr>\n    <tr>\n      <td style="padding: 8px;">5</td>\n      <td style="padding: 8px;">Total Comprehensive Income for the period [Comprising Profit / (Loss) for the period (after tax) and Other Comprehensive Income (after tax)]</td>\n      <td style="padding: 8px;"></td>\n      <td style="padding: 8px;"></td>\n      <td style="padding: 8px;"></td>\n      <td style="padding: 8px;"></td>\n      <td style="padding: 8px;"></td>\n      <td style="padding: 8px;"></td>\n    </tr>\n    <tr>\n      <td style="padding: 8px;">6</td>\n      <td style="padding: 8px;">Equity Share Capital</td>\n      <td style="padding: 8px;"></td>\n      <td style="padding: 8px;"></td>\n      <td style="padding: 8px;"></td>\n      <td style="padding: 8px;"></td>\n      <td style="padding: 8px;"></td>\n      <td style="padding: 8px;"></td>\n    </tr>\n    <tr>\n      <td style="padding: 8px;">7</td>\n      <td style="padding: 8px;">Reserves (excluding Revaluation Reserve) as shown in the Audited Balance Sheet of the previous year</td>\n      <td style="padding: 8px;"></td>\n      <td style="padding: 8px;"></td>\n      <td style="padding: 8px;"></td>\n      <td style="padding: 8px;"></td>\n      <td style="padding: 8px;"></td>\n      <td style="padding: 8px;"></td>\n    </tr>\n    <tr>\n      <td style="padding: 8px;">8</td>\n      <td style="padding: 8px;">Earnings Per Share (of ₹ {{FACE_VALUE}}/- each) (for continuing and discontinued operations) - 1. Basic: 2. Diluted:</td>\n      <td style="padding: 8px;"></td>\n      <td style="padding: 8px;"></td>\n      <td style="padding: 8px;"></td>\n      <td style="padding: 8px;"></td>\n      <td style="padding: 8px;"></td>\n      <td style="padding: 8px;"></td>\n    </tr>\n  </tbody>\n</table>\n\nNote:\nThe above is an extract of the detailed format of quarterly and nine months ended unaudited financial results filed with the stock exchange under Regulation 33 of the SEBI (Listing Obligation and Disclosure Requirements) Regulation, 2015. The full format of the Quarterly Financial Results are available on the stock exchange websites ({{STOCK_EXCHANGE_WEBSITES}}) and also hosted on the Company\'s website at {{WEBSITE}}.\n\nFor and On Behalf of Board of Directors\n{{COMPANY_NAME}}\n\n________________________\nName: {{DIRECTOR_NAME}}\nDesignation: {{DIRECTOR_DESIGNATION}}\nDIN: {{DIRECTOR_DIN}}\n\nDate: {{NOTICE_DATE}}\nPlace: {{NOTICE_PLACE}}',
    fields: [
      {id:"COMPANY_NAME",label:"Company Name",type:"text",placeholder:"e.g. XYZ Limited",required:true},
      {id:"COMPANY_CIN",label:"Corporate Identification Number (CIN)",type:"text",placeholder:"e.g. L12345MH2000PLC123456",required:true},
      {id:"REGD_OFFICE",label:"Registered Office Address",type:"textarea",required:true},
      {id:"CONTACT_NO",label:"Contact Number",type:"text",required:true},
      {id:"EMAIL_ID",label:"Email ID",type:"text",required:true},
      {id:"FAX_NO",label:"Fax Number",type:"text",required:false},
      {id:"WEBSITE",label:"Company Website",type:"text",placeholder:"e.g. www.xyzlimited.com",required:true},
      {id:"QUARTER_END_DATE",label:"Quarter / Nine Months Ended Date",type:"text",placeholder:"e.g. 31ST DECEMBER, 2023",required:true},
      {id:"Q1_DATE",label:"Current Quarter End Date",type:"text",placeholder:"e.g. 31/12/23",required:true},
      {id:"Q2_DATE",label:"Previous Quarter End Date",type:"text",placeholder:"e.g. 30/09/23",required:true},
      {id:"Q3_DATE",label:"Corresponding Quarter Previous Year",type:"text",placeholder:"e.g. 31/12/22",required:true},
      {id:"M1_DATE",label:"Current Nine Months End Date",type:"text",placeholder:"e.g. 31/12/23",required:true},
      {id:"M2_DATE",label:"Corresponding Nine Months Previous Year",type:"text",placeholder:"e.g. 31/12/22",required:true},
      {id:"Y1_DATE",label:"Previous Year End Date",type:"text",placeholder:"e.g. 31/03/23",required:true},
      {id:"FACE_VALUE",label:"Face Value Per Share (₹)",type:"text",placeholder:"e.g. 10",required:true},
      {id:"STOCK_EXCHANGE_WEBSITES",label:"Stock Exchange Websites",type:"text",placeholder:"e.g. www.bseindia.com and www.nseindia.com",required:true},
      {id:"DIRECTOR_NAME",label:"Director Name",type:"text",required:true},
      {id:"DIRECTOR_DESIGNATION",label:"Director Designation",type:"text",placeholder:"e.g. Managing Director",required:true},
      {id:"DIRECTOR_DIN",label:"Director DIN",type:"text",required:true},
      {id:"NOTICE_DATE",label:"Date of Notice",type:"date",required:true},
      {id:"NOTICE_PLACE",label:"Place of Issue",type:"text",required:true}
    ],
    regulation_reference: 'SEBI (LODR) Regulations 2015, Regulation 33',
    source: 'ICSI Professional Programme',
    last_verified: '2026-06-11',
    ai_system_prompt: 'You are a senior Company Secretary in India preparing a public notice for financial results under SEBI LODR Regulation 33. Ensure the format strictly follows the prescribed extract format with all mandatory fields. Ensure the tabular structure is perfectly intact. Maintain formal and concise language.',
    is_active: true,
    is_free: true,
    usage_count: 0,
    display_order: 80,
    tags: ['public notice','financial results','sebi','lodr','quarterly results','unaudited results']
  },
  {
    name: 'Public Notice — Expulsion of Trading Member',
    slug: 'public-notice-trading-member-expulsion',
    description: 'Specimen public notice issued by a Stock Exchange declaring a trading member as a defaulter and expelled from membership.',
    category: 'notices',
    template_content: 'Specimen Public Notice\n\n{{EXCHANGE_NAME}}\n{{EXCHANGE_ADDRESS}}\n\nNOTICE\n\nNotice is hereby given that the following Trading Member of the {{EXCHANGE_NAME}} has been expelled from the membership of the Exchange under Rules 1 and 2 of Chapter IV of Bye Laws and declared defaulter.\n\n<table style="width: 100%; border-collapse: collapse;" border="1">\n  <thead>\n    <tr>\n      <th style="padding: 8px; text-align: left;">Sr. No.</th>\n      <th style="padding: 8px; text-align: left;">Member Name</th>\n      <th style="padding: 8px; text-align: left;">SEBI Registration No.</th>\n      <th style="padding: 8px; text-align: left;">Date of declaration of Defaulter</th>\n      <th style="padding: 8px; text-align: left;">Date of Expulsion</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td style="padding: 8px;">1</td>\n      <td style="padding: 8px;">{{MEMBER_NAME}}</td>\n      <td style="padding: 8px;">{{SEBI_REG_NO}}</td>\n      <td style="padding: 8px;">{{DEFAULTER_DATE}}</td>\n      <td style="padding: 8px;">{{EXPULSION_DATE}}</td>\n    </tr>\n  </tbody>\n</table>\n\nThe Constituents of the above-mentioned member are hereby advised to lodge claims, if any, in the prescribed claim form, against the above-mentioned within 3 months from the date of this notice.\n\nAll claims submitted by investors will be considered for Processing if found due and payable in accordance with Rules, Byelaws, Regulations, guidelines etc. of the Exchange, SEBI circulars and Regulations and the maximum compensation limit per investor is ₹ {{MAX_COMPENSATION}} lakhs out of the Investor Protection Fund.\n\nThe claim can be lodged online on the Exchange portal {{EXCHANGE_PORTAL}} where the relevant documents can be uploaded. A sample claim form and FAQ is made available on the Exchange website {{EXCHANGE_WEBSITE}} for the convenience of the claimants. The claimants who have already submitted Form A need not file a separate Claim against the said member.\n\nAlternatively, the claim form, duly filled and signed, along with the relevant documents may also be sent in Physical form to the Defaulters\' Section of the Exchange at {{DEFAULTER_SECTION_ADDRESS}}. For this Purpose, the format of the Claim from may be downloaded from {{EXCHANGE_WEBSITE}} or obtained from the corporate office or the regional / branch offices of the Exchange. However, the Exchange urges all claimants to make use of the online claim lodgment facility as mentioned above for better tracking of your claims.\n\nIn case of any queries you may contact us on {{CONTACT_EMAIL}} or on toll free number {{TOLL_FREE_NUMBER}}.\n\nFor {{EXCHANGE_NAME}}\n\n________________________\n{{AUTHORIZED_SIGNATORY_NAME}}\n{{AUTHORIZED_SIGNATORY_DESIGNATION}}\nDefaulters\' Section\n\nPlace: {{NOTICE_PLACE}}\nDate: {{NOTICE_DATE}}',
    fields: [
      {id:"EXCHANGE_NAME",label:"Name of the Stock Exchange",type:"text",placeholder:"e.g. National Stock Exchange of India Ltd.",required:true},
      {id:"EXCHANGE_ADDRESS",label:"Address of the Exchange",type:"textarea",required:true},
      {id:"MEMBER_NAME",label:"Defaulter Member Name",type:"text",required:true},
      {id:"SEBI_REG_NO",label:"SEBI Registration No.",type:"text",required:true},
      {id:"DEFAULTER_DATE",label:"Date of Declaration of Defaulter",type:"date",required:true},
      {id:"EXPULSION_DATE",label:"Date of Expulsion",type:"date",required:true},
      {id:"MAX_COMPENSATION",label:"Max Compensation Limit (in Lakhs)",type:"text",placeholder:"e.g. 25",required:true},
      {id:"EXCHANGE_PORTAL",label:"Exchange Claim Portal URL",type:"text",placeholder:"e.g. https://investorhelpline.nseindia.com",required:true},
      {id:"EXCHANGE_WEBSITE",label:"Exchange Website",type:"text",placeholder:"e.g. www.nseindia.com",required:true},
      {id:"DEFAULTER_SECTION_ADDRESS",label:"Defaulters Section Physical Address",type:"textarea",required:true},
      {id:"CONTACT_EMAIL",label:"Contact Email ID",type:"text",required:true},
      {id:"TOLL_FREE_NUMBER",label:"Toll Free Number",type:"text",required:true},
      {id:"AUTHORIZED_SIGNATORY_NAME",label:"Authorized Signatory Name",type:"text",placeholder:"e.g. Chief Manager",required:true},
      {id:"AUTHORIZED_SIGNATORY_DESIGNATION",label:"Designation",type:"text",placeholder:"e.g. Chief Manager",required:true},
      {id:"NOTICE_PLACE",label:"Place of Notice",type:"text",required:true},
      {id:"NOTICE_DATE",label:"Date of Notice",type:"date",required:true}
    ],
    regulation_reference: 'Stock Exchange Bye Laws, Chapter IV, Rules 1 and 2',
    source: 'ICSI Professional Programme',
    last_verified: '2026-06-11',
    ai_system_prompt: 'You are drafting a public notice on behalf of a recognized Stock Exchange in India regarding the expulsion of a trading member. Maintain a highly formal and authoritative tone. Ensure that the investor protection guidelines, maximum compensation limits, and claim lodgment procedures are clearly stated.',
    is_active: true,
    is_free: true,
    usage_count: 0,
    display_order: 81,
    tags: ['public notice','stock exchange','trading member','expulsion','defaulter','sebi']
  }
];

async function seed() {
  console.log("Seeding Public Notices...");
  for (const tpl of templates) {
    const { data: existing } = await supabase.from('document_templates').select('id').eq('slug', tpl.slug).single();
    if (existing) {
      console.log(`Updating ${tpl.slug}...`);
      const { error } = await supabase.from('document_templates').update(tpl).eq('id', existing.id);
      if (error) console.error(error);
    } else {
      console.log(`Inserting ${tpl.slug}...`);
      const { error } = await supabase.from('document_templates').insert(tpl);
      if (error) console.error(error);
    }
  }
  console.log("Done seeding.");
}

seed();
