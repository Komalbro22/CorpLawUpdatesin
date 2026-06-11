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
    name: "Letter of Credit (Standby)",
    slug: "letter-of-credit",
    description: "Irrevocable Revolving Standby Letter of Credit with Form of Demand. Commonly used in international trade to secure payments.",
    category: "commercial_contracts",
    template_content: `<div style="font-family: serif; line-height: 1.6; color: #1e293b;">
<div style="text-align: right; margin-bottom: 20px;">
  <strong>Dated:</strong> {{DATE}}
</div>

<div style="margin-bottom: 20px;">
  <strong>To:</strong><br>
  {{BENEFICIARY_NAME}}<br>
  {{BENEFICIARY_ADDRESS}}
</div>

<h3 style="text-align: center; text-decoration: underline; margin-bottom: 30px; color: #0f172a;">
  Irrevocable Revolving Standby Letter of Credit no. {{LC_NUMBER}}
</h3>

<p style="text-align: justify; margin-bottom: 15px;">
  At the request of <strong>{{APPLICANT_NAME}}</strong>, having its address at {{APPLICANT_ADDRESS}} ("Applicant"), we, <strong>{{ISSUING_BANK_NAME}}</strong>, having our address at {{ISSUING_BANK_ADDRESS}} ("Issuing Bank") issue this irrevocable, revolving, standby Letter of Credit ("Letter of Credit") in favour of <strong>{{BENEFICIARY_NAME}}</strong> (the "Beneficiary") for <strong>{{FACE_VALUE_CURRENCY}} {{FACE_VALUE_AMOUNT}}</strong> (the "Face Value") (and such additional value as provided herein) covering amounts owed to the Beneficiary under the Agreement or for which the Beneficiary otherwise has the rights under this Letter of Credit to draw down amounts, all on the following terms and conditions:
</p>

<h4 style="color: #0f172a; margin-top: 20px;">1. Definition in this Letter of Credit:</h4>
<ul style="text-align: justify; margin-bottom: 15px; padding-left: 20px;">
  <li><strong>"Advising Bank"</strong> means the bank whose details are provided by Beneficiary at the time of opening of this Letter of Credit, or any other bank as notified by Beneficiary from time to time, in each case, for the purpose of advising this Letter of Credit to Beneficiary.</li>
  <li><strong>"Agreement"</strong> means the agreement titled <strong>{{AGREEMENT_TITLE}}</strong> dated <strong>{{AGREEMENT_DATE}}</strong>, executed between the Beneficiary (including its successors and permitted assigns), and the Applicant (including its successors and permitted assigns).</li>
  <li><strong>"Banking Day"</strong> means a day on which commercial banks are open for general commercial business in the city of <strong>{{CITY_NAME}}</strong>, India.</li>
  <li><strong>"Demand"</strong> means a demand for a payment under this Letter of Credit in the form of the Schedule to this Letter of Credit duly supported by the documents prescribed under Clause 5.2 of this Letter of Credit.</li>
  <li><strong>"Expiry Date"</strong> means the date calculated in accordance with Clause 3.a (iii) of this Letter of Credit.</li>
  <li><strong>"Trading Currency"</strong> means INR.</li>
  <li><strong>"INR"</strong> means Indian Rupees.</li>
</ul>

<h4 style="color: #0f172a; margin-top: 20px;">2. Terms and Conditions:</h4>
<ol style="list-style-type: lower-alpha; text-align: justify; margin-bottom: 15px; padding-left: 20px;">
  <li>The Issuing Bank unconditionally and irrevocably undertakes to the Beneficiary that this Letter of Credit shall cover a Face Value.</li>
  <li>This Letter of Credit (L/C) shall also cover requests against partial payment and/or multiple drawings.</li>
  <li>Subject to the terms of this Letter of Credit, the Beneficiary may request partial and/or multiple drawings under this Letter of Credit by submitting a Demand to the Issuing Bank at its counters in {{CITY_NAME}} in relation to each such drawing.</li>
  <li>Subject to the terms of this Letter of Credit, the Issuing Bank unconditionally and irrevocably undertakes to the Beneficiary that, on the day of receipt by it of a Demand, it will honour the claim without demur and pay to the Beneficiary the amount requested in that Demand.</li>
  <li>The Issuing Bank unconditionally and irrevocably undertakes to the Beneficiary that, following any payment pursuant to a Demand, it shall automatically and immediately thereafter reinstate the value of this Letter of Credit by the amount paid in order to restore this Letter of Credit to the Face Value. The Issuing Bank shall notify the Beneficiary immediately after any reinstatement of this Letter of Credit to the Face Value.</li>
  <li>This Standby Irrevocable Revolving Letter of Credit (L/C) is available for negotiation directly with the issuing Bank/Branch or through Beneficiary's Banker without recourse to the Applicant.</li>
  <li>The issuing Bank unconditionally and irrevocably undertakes to the Beneficiary that if the payment pursuant to any demand is not made at sight, interest @ <strong>{{ISSUING_BANK_NAME}} Base Rate + 6.25% p.a.</strong> would be payable from the date of such demand till the date of actual payment.</li>
  <li>This Letter of Credit shall not be discharged by any change in the Issuing Bank's constitution, constitution of Beneficiary or that of the Applicant or change in applicable Indian laws.</li>
  <li>Opening, renewal, reinstatement, amendment, negotiation, and any other charges, if any, related to this Letter of Credit levied by the Issuing Bank shall be paid by the Applicant. Failure of the Applicant to make such payments shall not affect the Issuing Bank's obligations under this Letter of Credit and the Beneficiary shall be paid the money due to it under this Letter of Credit without any deduction.</li>
  <li>The Issuing Bank unconditionally and irrevocably undertakes to the Beneficiary that, if at least <strong>{{RENEWAL_NOTICE_DAYS}}</strong> days prior to expiry of this Letter of Credit, Applicant fails to replace or renew such Letter of Credit with another letter of credit then, Beneficiary shall be entitled to draw down the full value of this Letter of Credit as security for payment of amounts payable by the Applicant.</li>
  <li>The Issuing Bank shall allow Beneficiary to assign this Letter of Credit for the benefit of Beneficiary's lenders or Beneficiary's successors and permitted assigns.</li>
  <li>The Issuing Bank undertakes not to amend any of the terms and conditions of this letter of credit (L/C) without prior consent of Beneficiary during the validity of this Letter of Credit (L/C).</li>
  <li>The issuing Bank certifies that the officer signing this L/C is authorised for this purpose and shall remain binding upon the issuing bank.</li>
  <li>The Issuing Bank shall forward and submit this Letter of Credit to the Advising Bank for advising of this Letter of Credit to Beneficiary.</li>
  <li>All bank charges including negotiation, handling, amendment, renewal, interest charges and any other charges shall be borne by the opener of Letter of Credit (L/C) i.e. by the Applicant.</li>
  <li>Payment against this Letter of Credit (L/C) shall be made to the beneficiary immediately on presentation of a copy of any of the documents such as Invoices/Provisional invoices/Debit notes/Statement of claim/Demand Letter/Claim letter etc. at any time within the validity period of the Letter of Credit (L/C).</li>
</ol>

<h4 style="color: #0f172a; margin-top: 20px;">3. Term, Extension and Expiry:</h4>
<ol style="list-style-type: lower-alpha; text-align: justify; margin-bottom: 15px; padding-left: 20px;">
  <li><strong>Terms:</strong>
    <ol style="list-style-type: lower-roman; padding-left: 20px;">
      <li>This Letter of Credit is issued on the date above with an initial term of <strong>{{INITIAL_TERM_MONTHS}}</strong> calendar months.</li>
      <li>The Issuing Bank shall renew this Letter of Credit no later than {{RENEWAL_NOTICE_DAYS}} days before the expiry of this Letter of Credit for a further period of {{INITIAL_TERM_MONTHS}} calendar months or in the event of no further extension of the Agreement, for a further period of {{RENEWAL_NOTICE_DAYS}} days from the End Date.</li>
      <li>This Letter of Credit shall terminate on the date notified by the Beneficiary in writing to the Issuing Bank, giving not less than {{TERMINATION_NOTICE_DAYS}} Banking Days' notice of such termination.</li>
    </ol>
  </li>
  <li><strong>Expiry:</strong>
    <ol style="list-style-type: lower-roman; padding-left: 20px;">
      <li>Without prejudice to Clause 3.b (ii) of this Letter of Credit, the Issuing Bank will be released from its obligations under this Letter of Credit at the close of business on the Expiry Date as per Clause 3.a (iii) of this Letter of Credit.</li>
      <li>On expiry of this Letter of Credit the obligations of the Issuing Bank under this Letter of Credit will cease with no further liability on the part of the Issuing Bank except for any Demand validly presented under this Letter of Credit that remains unpaid. If a Demand has been received by the Issuing Bank not later than the Expiry Date, the Issuing Bank's obligation to pay hereunder shall be deemed accrued notwithstanding that the due date for payment may fall after the Expiry Date.</li>
      <li>When the Issuing Bank is no longer under any further obligations under this Letter of Credit, the Beneficiary shall return the original of this Letter of Credit to the Issuing Bank.</li>
    </ol>
  </li>
</ol>

<h4 style="color: #0f172a; margin-top: 20px;">4. Payments:</h4>
<ol style="list-style-type: lower-alpha; text-align: justify; margin-bottom: 15px; padding-left: 20px;">
  <li>All payments denominated in US$ under this Letter of Credit shall be paid in INR by converting the amount due at the Exchange Rate or in US$ on request of the Beneficiary.</li>
  <li>All payments under this Letter of Credit shall be made for full value in immediately available funds (without any set-off, withholding or deduction) and shall be made on the day of receipt of a Demand to the account of the Beneficiary as set out in the Demand through RTGS or Telegraphic Transfer.</li>
</ol>

<h4 style="color: #0f172a; margin-top: 20px;">5. Delivery of Demand and Supporting Documents:</h4>
<ol style="list-style-type: lower-alpha; text-align: justify; margin-bottom: 15px; padding-left: 20px;">
  <li><strong>Delivery:</strong>
    <ol style="list-style-type: lower-roman; padding-left: 20px;">
      <li>Each Demand must be in writing, and may be given in person, by post, fax or by electronic communication and must be received by the Issuing Bank at its address as follows:<br>
      <strong>{{ISSUING_BANK_ADDRESS}}</strong></li>
      <li>For the purposes of this Letter of Credit, electronic communication with electronic signature shall be treated as a communication that has been validly given in writing.</li>
    </ol>
  </li>
  <li><strong>Supporting Documents:</strong><br>
  Each Demand shall be duly supported by a copy of invoice and / or debit notes under the Agreement against which the payment is claimed.</li>
</ol>

<h4 style="color: #0f172a; margin-top: 20px;">6. Governing Law</h4>
<p style="text-align: justify;">This Letter of Credit shall be governed by and construed in accordance with the laws of India.</p>

<h4 style="color: #0f172a; margin-top: 20px;">7. Jurisdiction</h4>
<p style="text-align: justify;">The courts and tribunals at <strong>{{JURISDICTION_STATE}}</strong> shall have exclusive jurisdiction over the subject matter of this Letter of Credit.</p>

<div style="margin-top: 40px; margin-bottom: 60px;">
  <p>Yours faithfully,</p>
  <p><strong>For {{ISSUING_BANK_NAME}}</strong></p>
  <br><br><br>
  <p>___________________________________<br>Authorized Signatory</p>
</div>

<hr style="border: 1px dashed #cbd5e1; margin: 40px 0;">

<h3 style="text-align: center; text-decoration: underline; margin-bottom: 30px; color: #0f172a;">
  FORM OF DEMAND
</h3>

<div style="text-align: right; margin-bottom: 20px;">
  <strong>Date:</strong> _______________________
</div>

<div style="margin-bottom: 20px;">
  <strong>To:</strong> {{ISSUING_BANK_NAME}}
</div>

<p><strong>Subject:</strong> Irrevocable, Revolving, Standby Letter of Credit No. <strong>{{LC_NUMBER}}</strong> issued in favour of <strong>{{BENEFICIARY_NAME}}</strong> ("Letter of Credit")</p>

<p>Sir/Madam,</p>
<p style="text-align: justify;">We refer to the above-mentioned Letter of Credit. Terms defined in the Letter of Credit have the same meaning when used in this Demand.</p>

<ol style="text-align: justify; margin-bottom: 15px; padding-left: 20px;">
  <li>We certify that the sum of Rs. ________________ is due under the Agreement as of ________________ (Date) against invoice no ________________ dated ________________ and/or debit note no ________________ dated ________________. We therefore demand payment of the sum of Rs ________________ plus interest as provided in the Letter of Credit.<br><br>
  <em>The face value of this Letter of credit (L/C) shall be equal to {{FACE_VALUE_CURRENCY}} {{FACE_VALUE_AMOUNT}}.<br>
  The aggregate liability under this Letter of Credit (L/C) is restricted to {{FACE_VALUE_CURRENCY}} {{FACE_VALUE_AMOUNT}}.</em></li>
  <li>All documents prescribed under Clause 5.2 of the Letter of Credit are enclosed herewith.</li>
  <li>Payment should be made to the following account:<br>
    <strong>Name:</strong> ___________________________________<br>
    <strong>Account Number:</strong> ___________________________________<br>
    <strong>Bank:</strong> ___________________________________
  </li>
  <li>The date of this Demand is not later than the Expiry Date.</li>
</ol>

<div style="margin-top: 40px;">
  <p>Yours faithfully,</p>
  <p><strong>For {{BENEFICIARY_NAME}}</strong></p>
  <br><br><br>
  <p>___________________________________<br>Authorized Signatory</p>
</div>
</div>`,
    fields: [
      {id:"DATE",label:"Date of Issuance",type:"date",required:true},
      {id:"BENEFICIARY_NAME",label:"Beneficiary Name (Seller/Exporter)",type:"text",placeholder:"e.g. ABC Exports Pvt Ltd",required:true},
      {id:"BENEFICIARY_ADDRESS",label:"Beneficiary Address",type:"textarea",required:true},
      {id:"LC_NUMBER",label:"Letter of Credit Number",type:"text",required:true},
      {id:"APPLICANT_NAME",label:"Applicant Name (Buyer/Importer)",type:"text",required:true},
      {id:"APPLICANT_ADDRESS",label:"Applicant Address",type:"textarea",required:true},
      {id:"ISSUING_BANK_NAME",label:"Issuing Bank Name",type:"text",required:true},
      {id:"ISSUING_BANK_ADDRESS",label:"Issuing Bank Address",type:"textarea",required:true},
      {id:"FACE_VALUE_CURRENCY",label:"Currency",type:"text",placeholder:"e.g. INR or USD",required:true},
      {id:"FACE_VALUE_AMOUNT",label:"Face Value Amount",type:"text",placeholder:"e.g. 10,00,000",required:true},
      {id:"AGREEMENT_TITLE",label:"Underlying Agreement Title",type:"text",placeholder:"e.g. Supply Agreement",required:true},
      {id:"AGREEMENT_DATE",label:"Agreement Date",type:"date",required:true},
      {id:"CITY_NAME",label:"City for Banking Days",type:"text",placeholder:"e.g. Delhi",required:true},
      {id:"RENEWAL_NOTICE_DAYS",label:"Renewal Notice Days",type:"text",placeholder:"e.g. 30",required:true},
      {id:"INITIAL_TERM_MONTHS",label:"Initial Term (Months)",type:"text",placeholder:"e.g. 12",required:true},
      {id:"TERMINATION_NOTICE_DAYS",label:"Termination Notice Days",type:"text",placeholder:"e.g. 15",required:true},
      {id:"JURISDICTION_STATE",label:"Jurisdiction State/City",type:"text",placeholder:"e.g. New Delhi",required:true}
    ],
    regulation_reference: 'FEMA Regulations, UCP 600',
    source: 'ICSI Professional Programme',
    last_verified: '2026-06-11',
    ai_system_prompt: 'You are a senior banking legal officer. Ensure the Irrevocable Standby Letter of Credit strictly adheres to the UCP 600 guidelines and perfectly outlines the rights of the beneficiary to draw funds upon presentation of the required demand and documents.',
    is_active: true,
    is_free: false,
    usage_count: 0,
    display_order: 14,
    tags: ["letter of credit", "LC format", "standby LC", "international trade LC", "documentary credit", "banking"]
  },
  {
    name: "Bank Guarantee (Performance/Financial)",
    slug: "bank-guarantee",
    description: "Unconditional Bank Guarantee Deed ensuring that the liabilities of a debtor will be met in the event of default.",
    category: "commercial_contracts",
    template_content: `<div style="font-family: serif; line-height: 1.6; color: #1e293b;">
<div style="margin-bottom: 20px; display: flex; justify-content: space-between;">
  <div><strong>Bank Guarantee No. & Date:</strong> {{BG_NUMBER_AND_DATE}}</div>
  <div><strong>Amount of Guarantee:</strong> Rs. {{BG_AMOUNT}}</div>
</div>

<div style="margin-bottom: 30px;">
  <strong>To,</strong><br>
  {{PURCHASING_ENTITY_NAME}}<br>
  {{PURCHASING_ENTITY_ADDRESS}}
</div>

<h3 style="text-align: center; text-decoration: underline; margin-bottom: 30px; color: #0f172a;">
  DEED OF GUARANTEE
</h3>

<p style="text-align: justify; margin-bottom: 15px;">
  THIS DEED OF GUARANTEE made this <strong>{{DAY}}</strong> day of <strong>{{MONTH_YEAR}}</strong> between <strong>{{BANK_NAME}}</strong> (hereinafter called "the Bank") of the one part, and <strong>{{PURCHASING_ENTITY_NAME}}</strong> (Purchasing entity) of the other part.
</p>

<p style="text-align: justify; margin-bottom: 15px;">
  WHEREAS in consideration of the <strong>{{PURCHASING_ENTITY_NAME}}</strong> (Hereinafter referred to as the 'Purchaser' which expression shall unless repugnant to the context or meaning thereof, include its successors, administrators and assigns) having awarded to <strong>{{CONTRACTOR_NAME}}</strong> with its Registered/Head Office at <strong>{{CONTRACTOR_ADDRESS}}</strong> (Hereinafter referred to as the 'Contractor' which expression shall unless repugnant to the context or meaning thereof, include its successors, administrators, executors and assigns), a Contract by issue of Purchase Order No <strong>{{PURCHASE_ORDER_NO}}</strong> dated <strong>{{PURCHASE_ORDER_DATE}}</strong> and the same having been acknowledged by the contractor, for <strong>{{CONTRACT_SUM}}</strong> and the Contractor having agreed to provide a Contract Performance Guarantee for the faithful performance of the entire Contract equivalent to <strong>{{GUARANTEE_PERCENTAGE}}%</strong> of the said basic value of the aforesaid work under the Purchase Order.
</p>

<p style="text-align: justify; margin-bottom: 15px;">
  AND WHEREAS in consideration of the aforesaid and at the request of the Purchaser, We, <strong>{{BANK_NAME}}</strong> (hereinafter referred as "the Bank") having its registered office at <strong>{{BANK_ADDRESS}}</strong> do hereby unconditionally undertake to pay the amount payable under this guarantee without any demur, merely on a demand from the Purchaser on demand on breach of the contract. Any such demand in writing made on the Bank by the purchaser shall be conclusive as regards the amount due and payable by the Bank under the guarantee. However, our liability under this guarantee shall be restricted to an amount not exceeding <strong>Rs. {{BG_AMOUNT}}</strong> secured by this guarantee.
</p>

<p style="text-align: justify; margin-bottom: 15px;">
  We, the Bank further agree that the guarantee herein contained shall remain in full force and in effect till the work order gets completely executed. Unless demand for claim under this guarantee is made on us in writing on or before <strong>{{CLAIM_EXPIRY_DATE}}</strong>, we shall be discharged from all liabilities under this guarantee thereafter.
</p>

<p style="text-align: justify; margin-bottom: 15px;">
  We, the Bank lastly undertake not to revoke this guarantee during its currency except with the previous consent of the Purchaser in writing.
</p>

<p style="text-align: justify; margin-bottom: 15px;">
  We, the Bank also agree that this guarantee will not be discharged due to change in the constitution of the Bank or the purchasing entity.
</p>

<p style="text-align: justify; margin-bottom: 15px;">
  <strong>Notwithstanding anything contained herein:</strong>
</p>
<ol style="list-style-type: lower-roman; text-align: justify; margin-bottom: 20px; padding-left: 20px;">
  <li>Our liability under this Bank Guarantee shall not exceed <strong>Rs. {{BG_AMOUNT}} (Rupees {{BG_AMOUNT_WORDS}} only)</strong>.</li>
  <li>This Bank Guarantee shall be valid up to <strong>{{VALIDITY_DATE}}</strong> and shall, at the request of the purchasing entity be extended from time to time and kept valid during the completion of work order.</li>
  <li>We are liable to pay the guaranteed amount or any part thereof under this Bank Guarantee only and only if you serve upon us a written claim or demand on or before <strong>{{CLAIM_EXPIRY_DATE}}</strong>.</li>
</ol>

<p style="text-align: justify; margin-bottom: 30px;">
  In witness whereof the Bank, through its authorised officer has set its hand and stamp on this <strong>{{DAY}}</strong> day of <strong>{{MONTH_YEAR}}</strong> at <strong>{{CITY_NAME}}</strong>.
</p>

<table style="width: 100%; margin-top: 40px; border-collapse: collapse;">
  <tr>
    <td style="width: 50%; vertical-align: top;">
      <p><strong>Witness 1:</strong></p>
      <p>Signature: ______________________</p>
      <p>Name: ______________________</p>
    </td>
    <td style="width: 50%; vertical-align: top;">
      <p><strong>For {{BANK_NAME}}</strong></p>
      <p>Signature: ______________________</p>
      <p>Name: ______________________</p>
      <p>Designation: ______________________</p>
      <p>Official Address: ______________________</p>
      <p>(Bank Stamp)</p>
    </td>
  </tr>
  <tr>
    <td style="width: 50%; vertical-align: top; padding-top: 30px;">
      <p><strong>Witness 2:</strong></p>
      <p>Signature: ______________________</p>
      <p>Name: ______________________</p>
    </td>
    <td style="width: 50%;"></td>
  </tr>
</table>
</div>`,
    fields: [
      {id:"BG_NUMBER_AND_DATE",label:"Bank Guarantee No. & Date",type:"text",placeholder:"e.g. BG-12345 dt 12/05/2023",required:true},
      {id:"BG_AMOUNT",label:"Amount of Guarantee (Rs)",type:"text",placeholder:"e.g. 50,00,000",required:true},
      {id:"PURCHASING_ENTITY_NAME",label:"Purchasing Entity (Beneficiary)",type:"text",required:true},
      {id:"PURCHASING_ENTITY_ADDRESS",label:"Purchasing Entity Address",type:"textarea",required:true},
      {id:"DAY",label:"Day of Execution",type:"text",placeholder:"e.g. 15th",required:true},
      {id:"MONTH_YEAR",label:"Month & Year",type:"text",placeholder:"e.g. March, 2023",required:true},
      {id:"BANK_NAME",label:"Bank Name",type:"text",required:true},
      {id:"CONTRACTOR_NAME",label:"Contractor (Applicant) Name",type:"text",required:true},
      {id:"CONTRACTOR_ADDRESS",label:"Contractor Address",type:"textarea",required:true},
      {id:"PURCHASE_ORDER_NO",label:"Purchase Order No.",type:"text",required:true},
      {id:"PURCHASE_ORDER_DATE",label:"Purchase Order Date",type:"date",required:true},
      {id:"CONTRACT_SUM",label:"Contract Sum (Value)",type:"text",placeholder:"e.g. Rs. 5,00,00,000",required:true},
      {id:"GUARANTEE_PERCENTAGE",label:"Guarantee Percentage",type:"text",placeholder:"e.g. 10",required:true},
      {id:"BANK_ADDRESS",label:"Bank Branch Address",type:"textarea",required:true},
      {id:"CLAIM_EXPIRY_DATE",label:"Claim Expiry Date",type:"date",required:true},
      {id:"BG_AMOUNT_WORDS",label:"Amount in Words",type:"text",placeholder:"e.g. Fifty Lakhs",required:true},
      {id:"VALIDITY_DATE",label:"Validity Date",type:"date",required:true},
      {id:"CITY_NAME",label:"City of Execution",type:"text",placeholder:"e.g. Mumbai",required:true}
    ],
    regulation_reference: 'Indian Contract Act, 1872',
    source: 'ICSI Professional Programme',
    last_verified: '2026-06-11',
    ai_system_prompt: 'You are drafting an unconditional bank guarantee on behalf of a bank. Ensure the clauses clearly reflect the unconditional undertaking to pay upon demand without demur, correctly specify the expiry and validity periods, and adhere to standard banking practices.',
    is_active: true,
    is_free: true,
    usage_count: 0,
    display_order: 15,
    tags: ["bank guarantee format", "performance guarantee", "BG format India", "financial guarantee", "contract performance guarantee"]
  }
];

async function seed() {
  console.log("Seeding Banking templates...");
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
