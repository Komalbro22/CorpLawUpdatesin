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
    name: "Simple Mortgage Deed",
    slug: "simple-mortgage-deed",
    description: "Standard Simple Mortgage Deed where the mortgagor binds himself personally to pay the mortgage-money.",
    category: "commercial_contracts",
    template_content: `<div style="font-family: serif; line-height: 1.6; color: #1e293b;">
<h3 style="text-align: center; text-decoration: underline; margin-bottom: 30px; color: #0f172a;">
  SIMPLE MORTGAGE DEED
</h3>

<p style="text-align: justify; margin-bottom: 15px;">
  This Deed of Mortgage made on this <strong>{{DAY}}</strong> day of <strong>{{MONTH_YEAR}}</strong> at <strong>{{CITY}}</strong>.
</p>

<p style="text-align: center; font-weight: bold; margin-bottom: 15px;">BETWEEN</p>

<p style="text-align: justify; margin-bottom: 15px;">
  <strong>{{MORTGAGOR_NAME}}</strong>, son of {{MORTGAGOR_FATHER_NAME}} resident of {{MORTGAGOR_ADDRESS}} hereinafter called as a <strong>MORTGAGOR</strong> of the ONE PART
</p>

<p style="text-align: center; font-weight: bold; margin-bottom: 15px;">AND</p>

<p style="text-align: justify; margin-bottom: 15px;">
  <strong>{{MORTGAGEE_NAME}}</strong>, son of {{MORTGAGEE_FATHER_NAME}} resident of {{MORTGAGEE_ADDRESS}} hereinafter called as a <strong>MORTGAGEE</strong> of the OTHER PART.
</p>

<p style="text-align: justify; margin-bottom: 15px;">
  <strong>WHEREAS</strong> the mortgagor is absolutely seized and possessed of or otherwise well and sufficiently entitled to the house bearing municipal no <strong>{{PROPERTY_MUNICIPAL_NO}}</strong> situated on <strong>{{PROPERTY_ROAD}}</strong>, <strong>{{PROPERTY_CITY}}</strong> more particularly described in the Schedule hereunder written;
</p>

<p style="text-align: justify; margin-bottom: 15px;">
  <strong>AND WHEREAS</strong> the mortgagor has requested the mortgagee to lend him a sum of <strong>Rs. {{LOAN_AMOUNT}} (Rupees {{LOAN_AMOUNT_WORDS}})</strong> which the mortgagee has agreed on the mortgagor mortgaging his property.
</p>

<p style="text-align: justify; margin-bottom: 15px;">
  <strong>NOW THIS DEED WITNESSETH THAT</strong> in pursuance to the said agreement and in consideration of the sum of Rs. {{LOAN_AMOUNT}} at or before the execution of these presents paid by the mortgagee to the mortgagor (the receipt whereof, the mortgagor doth hereby admit and acknowledge and of and from the same hereby release and discharge the mortgagee), the mortgagor hereby covenants with the mortgagee that he will pay on the <strong>{{REPAYMENT_DAY}}</strong> day of <strong>{{REPAYMENT_MONTH_YEAR}}</strong> (hereinafter called "the said date"), the said sum of Rs. {{LOAN_AMOUNT}} with interest @ <strong>{{INTEREST_RATE}}% per annum</strong> from the date of these presents till the repayment of the said sum in full, every quarter the first installment of interest to be paid on the <strong>{{FIRST_INSTALLMENT_DATE}}</strong> and each subsequent installment on the <strong>{{QUARTERLY_DAYS}}</strong> of each succeeding year until the said sum is repaid in full.
</p>

<p style="text-align: justify; margin-bottom: 15px;">
  <strong>AND THIS DEED FURTHER WITNESSETH THAT</strong> in consideration aforesaid, the mortgagor doth hereby transfer by way of mortgage his house bearing municipal no {{PROPERTY_MUNICIPAL_NO}} situated at {{PROPERTY_CITY}} and more particularly described in the Schedule hereunder written as a security for repayment of the said sum with interest @ {{INTEREST_RATE}}% per annum with the condition that the mortgagor, his heirs, executors, administrators or assigns shall on the said day pay to the mortgagee, his heirs, executors, administrators or assigns the said sum of Rs {{LOAN_AMOUNT}} together with interest thereon at the rate mentioned above, the said mortgagee, his heirs, executors, administrators, or assigns shall at any time thereafter upon the request and at the cost of the mortgagor, his heirs, executors, administrators or assigns reconvey the said house, hereinbefore expressed to be mortgaged unto or to the use of the mortgagor, his heirs, executors, administrators or assigns or as he or they shall direct.
</p>

<p style="text-align: justify; margin-bottom: 15px;">
  <strong>AND IT IS HEREBY AGREED AND DECLARED</strong> that if the mortgagor does not pay the said mortgage amount with interest when shall become due and payable under these presents, the mortgagee shall be entitled to sell the said house through any competent court and to realise and receive the said mortgage amount and interest, out of the sale proceeds of the house.
</p>

<p style="text-align: justify; margin-bottom: 15px;">
  <strong>AND IT IS FURTHER AGREED AND DECLARED</strong> by the mortgagor that during the period, the mortgage amount is not paid and the said house remains as a security for the mortgage amount, the mortgagor shall insure the said house and take out an insurance policy in the joint names of the mortgagor and mortgagee and continue the said policy in full force and effect by paying premium and in case of default by the mortgagor to insure or to keep the insurance policy in full force and effect, the mortgagee can insure the said house and the premium paid by the mortgagee will be added to the mortgage amount, if not paid by the mortgagor on demand.
</p>

<p style="text-align: justify; margin-bottom: 15px;">
  <strong>AND IT IS FURTHER AGREED THAT</strong> the mortgagor can grant lease of the said house with the consent of the mortgagee in writing.
</p>

<p style="text-align: justify; margin-bottom: 30px;">
  <strong>AND IT IS FURTHER AGREED BY THE MORTGAGOR</strong> that he shall bear stamp duty, registration charges and other out of pocket expenses for the execution and registration of this deed and reconveyance deed but however each party will bear cost and professional charges of his Solicitor/Advocate.
</p>

<h4 style="color: #0f172a; margin-top: 20px;">The Schedule above referred to</h4>
<p style="text-align: justify; margin-bottom: 30px; border: 1px solid #cbd5e1; padding: 15px;">
  {{PROPERTY_SCHEDULE}}
</p>

<p style="margin-bottom: 30px;">IN WITNESS WHEREOF the parties have put their hands the day and year first hereunder written.</p>

<table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
  <tr>
    <td style="width: 50%; vertical-align: top; padding-bottom: 40px;">
      <p>___________________________________</p>
      <p><strong>{{MORTGAGOR_NAME}}</strong></p>
      <p>(MORTGAGOR)</p>
    </td>
    <td style="width: 50%; vertical-align: top; padding-bottom: 40px;">
      <p>___________________________________</p>
      <p><strong>{{MORTGAGEE_NAME}}</strong></p>
      <p>(MORTGAGEE)</p>
    </td>
  </tr>
  <tr>
    <td colspan="2" style="padding-top: 20px;">
      <p><strong>Witnesses:</strong></p>
    </td>
  </tr>
  <tr>
    <td style="width: 50%; padding-top: 10px;">
      <p>1. ___________________________</p>
      <p>Name: ______________________</p>
      <p>Address: ____________________</p>
    </td>
    <td style="width: 50%; padding-top: 10px;">
      <p>2. ___________________________</p>
      <p>Name: ______________________</p>
      <p>Address: ____________________</p>
    </td>
  </tr>
</table>
</div>`,
    fields: [
      {id:"DAY",label:"Day of Execution",type:"text",placeholder:"e.g. 15th",required:true},
      {id:"MONTH_YEAR",label:"Month & Year",type:"text",placeholder:"e.g. March, 2023",required:true},
      {id:"CITY",label:"City of Execution",type:"text",required:true},
      {id:"MORTGAGOR_NAME",label:"Mortgagor Name",type:"text",required:true},
      {id:"MORTGAGOR_FATHER_NAME",label:"Mortgagor's Father's Name",type:"text",required:true},
      {id:"MORTGAGOR_ADDRESS",label:"Mortgagor Address",type:"textarea",required:true},
      {id:"MORTGAGEE_NAME",label:"Mortgagee Name",type:"text",required:true},
      {id:"MORTGAGEE_FATHER_NAME",label:"Mortgagee's Father's Name",type:"text",required:true},
      {id:"MORTGAGEE_ADDRESS",label:"Mortgagee Address",type:"textarea",required:true},
      {id:"PROPERTY_MUNICIPAL_NO",label:"Property Municipal No.",type:"text",required:true},
      {id:"PROPERTY_ROAD",label:"Property Road/Area",type:"text",required:true},
      {id:"PROPERTY_CITY",label:"Property City",type:"text",required:true},
      {id:"LOAN_AMOUNT",label:"Loan Amount (Rs)",type:"text",placeholder:"e.g. 50,00,000",required:true},
      {id:"LOAN_AMOUNT_WORDS",label:"Loan Amount in Words",type:"text",placeholder:"e.g. Fifty Lakhs Only",required:true},
      {id:"REPAYMENT_DAY",label:"Repayment Day",type:"text",placeholder:"e.g. 15th",required:true},
      {id:"REPAYMENT_MONTH_YEAR",label:"Repayment Month & Year",type:"text",placeholder:"e.g. March, 2028",required:true},
      {id:"INTEREST_RATE",label:"Interest Rate (%)",type:"text",placeholder:"e.g. 12",required:true},
      {id:"FIRST_INSTALLMENT_DATE",label:"First Installment Date",type:"date",required:true},
      {id:"QUARTERLY_DAYS",label:"Subsequent Installment Days",type:"text",placeholder:"e.g. 15th day of July, October, January, and April",required:true},
      {id:"PROPERTY_SCHEDULE",label:"Property Schedule (Boundaries, dimensions)",type:"textarea",placeholder:"e.g. East: Road, West: Plot No 12...",required:true}
    ],
    regulation_reference: 'Section 58(b) of Transfer of Property Act, 1882',
    source: 'ICSI Professional Programme',
    last_verified: '2026-06-11',
    ai_system_prompt: 'You are an expert real estate lawyer. Ensure the deed strictly functions as a Simple Mortgage, explicitly binding the mortgagor personally and allowing sale only through court intervention.',
    is_active: true,
    is_free: false,
    usage_count: 0,
    display_order: 16,
    tags: ["mortgage", "simple mortgage deed", "loan security", "property mortgage", "real estate", "TPA 1882"]
  },
  {
    name: "Mortgage by Conditional Sale",
    slug: "mortgage-conditional-sale",
    description: "Mortgage deed where the sale becomes absolute if loan isn't paid, or void if paid. Valid under Section 58(c) of TPA.",
    category: "commercial_contracts",
    template_content: `<div style="font-family: serif; line-height: 1.6; color: #1e293b;">
<h3 style="text-align: center; text-decoration: underline; margin-bottom: 30px; color: #0f172a;">
  DEED OF MORTGAGE BY CONDITIONAL SALE
</h3>

<p style="text-align: justify; margin-bottom: 15px;">
  THIS DEED OF MORTGAGE BY CONDITIONAL SALE is executed on this <strong>{{DAY}}</strong> day of <strong>{{MONTH_YEAR}}</strong>
</p>

<p style="text-align: center; font-weight: bold; margin-bottom: 15px;">BETWEEN</p>

<p style="text-align: justify; margin-bottom: 15px;">
  <strong>{{VENDOR_NAME}}</strong>, son of {{VENDOR_FATHER_NAME}} resident of {{VENDOR_ADDRESS}} hereinafter called as a <strong>VENDOR</strong> of the ONE PART
</p>

<p style="text-align: center; font-weight: bold; margin-bottom: 15px;">AND</p>

<p style="text-align: justify; margin-bottom: 15px;">
  <strong>{{PURCHASER_NAME}}</strong>, son of {{PURCHASER_FATHER_NAME}} resident of {{PURCHASER_ADDRESS}} hereinafter called as a <strong>PURCHASER</strong> of the OTHER PART.
</p>

<p style="text-align: justify; margin-bottom: 15px;">
  <strong>WHEREAS</strong> the Vendor is seized and possessed of or otherwise well or sufficiently entitled to the land and premises situated at <strong>{{PROPERTY_LOCATION}}</strong> and more particularly described in the Schedule hereunder written.
</p>

<p style="text-align: justify; margin-bottom: 15px;">
  <strong>AND WHEREAS</strong> the Vendor is in need of money and has requested the Purchaser to advance to him a sum of <strong>Rs {{LOAN_AMOUNT}}</strong> which the Purchaser has agreed to do on the Vendor agreeing to execute this deed of sale in favour of the Purchaser in respect of the said property in the manner following.
</p>

<p style="text-align: justify; margin-bottom: 15px; font-weight: bold;">
  NOW THIS DEED WITNESSETH AS UNDER
</p>

<ol style="text-align: justify; margin-bottom: 30px; padding-left: 20px;">
  <li style="margin-bottom: 15px;">Pursuant to the said agreement and in consideration of the said sum of Rs {{LOAN_AMOUNT}} paid by the Purchaser to the Vendor on the execution of these presents (receipt whereof the Vendor doth hereby admit), he the Vendor doth hereby grant and convey unto the Purchaser all the said piece of land with building thereon and situated at {{PROPERTY_LOCATION}} and more particularly described in the Schedule hereunder written together with all things permanently attached thereto or standing thereon and all the liberties, easements, profits, privileges, rights and appurtenances whatsoever to the said piece of land and premises belonging or in anywise appertaining to or with the same or any part thereof and now or at any time hereafter usually held, used, occupied or enjoyed or reputed as part or member thereof or be appurtenant thereto And all the estate, right, title, claim and demand of the Vendor into and upon the said land and other the premises hereby granted TO HOLD the same unto and to the use of Purchaser subject to what is hereafter provided and subject to the payment of rates, taxes, assessments, dues and duties now chargeable upon the same or which may hereafter become payable in respect thereof to the Government or the Municipal Corporation or any other local authority.</li>
  
  <li style="margin-bottom: 15px;">And it is hereby agreed and declared that if the Vendor shall at any time hereafter repay to the Purchaser the said sum of Rs {{LOAN_AMOUNT}} within a period of <strong>{{REPAYMENT_YEARS}}</strong> years that is on or before the <strong>{{REPAYMENT_DATE}}</strong> the grant and transfer of the said property as hereinbefore provided shall become void and in that event the Purchaser shall retransfer the said property to the Vendor or his heirs, executors, administrators or assigns by executing a document of re-sale.</li>
  
  <li style="margin-bottom: 15px;">Provided however and it is agreed that, if the Vendor or his heirs, executors, administrators or assigns shall fail to repay the said amount of Rs {{LOAN_AMOUNT}} within the said period then the grant and transfer of the said property to the Purchaser hereby made shall become absolute in favour of the Purchaser his heirs, executors, administrators or assigns.</li>
  
  <li style="margin-bottom: 15px;">And the Vendor doth hereby covenants with the Purchaser that –
    <ol style="list-style-type: lower-alpha; padding-left: 20px; margin-top: 10px;">
      <li style="margin-bottom: 10px;">The Vendor has good right and full power to grant the said land and building hereby granted or expressed so to be and every part thereof unto and to the use of the Purchaser in manner aforesaid.</li>
      <li style="margin-bottom: 10px;">That the Purchaser shall quietly possess and enjoy the said property and receive the rents, Income and profits thereof without any lawful interruption or disturbance whatsoever by the Vendor or any person or persons lawfully claiming under from or through him and shall be at liberty to pay there out the Govt. revenue and all other charges of a public nature and all rents if any accruing due in respect of the said premises during such possession and any arrears of rent in default of payment of which the said land and premises may be summarily sold and all expenses incurred for the management of the said premises and the collection of rents, Income, profits and all other outgoing including costs of repairs of the said premises.</li>
      <li style="margin-bottom: 10px;">That the said premises are free and clear and forever released and discharged or otherwise by the Vendor well and sufficiently saved, kept harmless and indemnified of and from and against all previous and other estates, title, charges and encumbrances whatsoever had made executed or suffered by the Vendor or any other person lawfully claiming under him.</li>
      <li style="margin-bottom: 10px;">That the Vendor and all persons claiming any estate or interest in the said premises under him, shall and will from time to time and at all times hereafter upon the request of the Purchaser and at the costs of the Vendor do and execute or cause to be done or executed, all such acts, deeds and things whatsoever for further and more perfectly assuring all or any of the said premises unto and to the use of the Purchaser in such manner aforesaid as shall or may be reasonably required by the Purchaser.</li>
    </ol>
  </li>
</ol>

<p style="margin-bottom: 30px;">IN WITNESS WHEREOF the Vendor has put his hand the day and year first hereinabove written.</p>

<h4 style="color: #0f172a; margin-top: 20px;">THE SCHEDULE ABOVE REFERRED TO</h4>
<p style="text-align: justify; margin-bottom: 30px; border: 1px solid #cbd5e1; padding: 15px;">
  {{PROPERTY_SCHEDULE}}
</p>

<table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
  <tr>
    <td style="width: 50%; vertical-align: top; padding-bottom: 40px;">
      <p>___________________________________</p>
      <p><strong>{{VENDOR_NAME}}</strong></p>
      <p>(VENDOR)</p>
    </td>
    <td style="width: 50%; vertical-align: top; padding-bottom: 40px;">
      <p>___________________________________</p>
      <p><strong>{{PURCHASER_NAME}}</strong></p>
      <p>(PURCHASER)</p>
    </td>
  </tr>
  <tr>
    <td colspan="2" style="padding-top: 20px;">
      <p><strong>Witnesses:</strong></p>
    </td>
  </tr>
  <tr>
    <td style="width: 50%; padding-top: 10px;">
      <p>1. ___________________________</p>
      <p>Name: ______________________</p>
      <p>Address: ____________________</p>
    </td>
    <td style="width: 50%; padding-top: 10px;">
      <p>2. ___________________________</p>
      <p>Name: ______________________</p>
      <p>Address: ____________________</p>
    </td>
  </tr>
</table>
</div>`,
    fields: [
      {id:"DAY",label:"Day of Execution",type:"text",placeholder:"e.g. 15th",required:true},
      {id:"MONTH_YEAR",label:"Month & Year",type:"text",placeholder:"e.g. March, 2023",required:true},
      {id:"VENDOR_NAME",label:"Vendor (Mortgagor) Name",type:"text",required:true},
      {id:"VENDOR_FATHER_NAME",label:"Vendor's Father's Name",type:"text",required:true},
      {id:"VENDOR_ADDRESS",label:"Vendor Address",type:"textarea",required:true},
      {id:"PURCHASER_NAME",label:"Purchaser (Mortgagee) Name",type:"text",required:true},
      {id:"PURCHASER_FATHER_NAME",label:"Purchaser's Father's Name",type:"text",required:true},
      {id:"PURCHASER_ADDRESS",label:"Purchaser Address",type:"textarea",required:true},
      {id:"PROPERTY_LOCATION",label:"Property Location/Address",type:"textarea",required:true},
      {id:"LOAN_AMOUNT",label:"Loan/Consideration Amount (Rs)",type:"text",placeholder:"e.g. 50,00,000",required:true},
      {id:"REPAYMENT_YEARS",label:"Repayment Period (Years)",type:"text",placeholder:"e.g. 5",required:true},
      {id:"REPAYMENT_DATE",label:"Absolute Cut-off Date",type:"date",required:true},
      {id:"PROPERTY_SCHEDULE",label:"Property Schedule (Boundaries, dimensions)",type:"textarea",placeholder:"e.g. East: Road, West: Plot No 12...",required:true}
    ],
    regulation_reference: 'Section 58(c) of Transfer of Property Act, 1882',
    source: 'ICSI Professional Programme',
    last_verified: '2026-06-11',
    ai_system_prompt: 'Ensure the condition that the sale becomes absolute on default, or void on payment, is embodied in the same document to satisfy Section 58(c) of TPA.',
    is_active: true,
    is_free: false,
    usage_count: 0,
    display_order: 17,
    tags: ["mortgage", "conditional sale", "mortgage deed", "real estate", "TPA 1882"]
  },
  {
    name: "English Mortgage Deed",
    slug: "english-mortgage-deed",
    description: "Mortgage where the mortgagor binds himself to repay and transfers property absolutely, subject to retransfer upon payment.",
    category: "commercial_contracts",
    template_content: `<div style="font-family: serif; line-height: 1.6; color: #1e293b;">
<h3 style="text-align: center; text-decoration: underline; margin-bottom: 30px; color: #0f172a;">
  DEED OF ENGLISH MORTGAGE
</h3>

<p style="text-align: justify; margin-bottom: 15px;">
  THIS DEED OF ENGLISH MORTGAGE is made at <strong>{{CITY}}</strong> on this <strong>{{DAY}}</strong> day of <strong>{{MONTH_YEAR}}</strong>
</p>

<p style="text-align: center; font-weight: bold; margin-bottom: 15px;">BETWEEN</p>

<p style="text-align: justify; margin-bottom: 15px;">
  <strong>{{MORTGAGOR_NAME}}</strong>, son of {{MORTGAGOR_FATHER_NAME}} resident of {{MORTGAGOR_ADDRESS}} hereinafter referred to as the <strong>"MORTGAGOR"</strong> (which expression shall, unless it be repugnant to the context or meaning thereof, be deemed to mean and include his heirs, executors, administrators and assigns) of the ONE PART;
</p>

<p style="text-align: center; font-weight: bold; margin-bottom: 15px;">AND</p>

<p style="text-align: justify; margin-bottom: 15px;">
  <strong>{{MORTGAGEE_NAME}}</strong>, son of {{MORTGAGEE_FATHER_NAME}} resident of {{MORTGAGEE_ADDRESS}} hereinafter referred to as the <strong>"MORTGAGEE"</strong> (which expression shall, unless it be repugnant to the context or meaning thereof, be deemed to mean and include his heirs, executors, administrators and assigns) of the OTHER PART.
</p>

<p style="text-align: justify; margin-bottom: 15px;">
  <strong>WHEREAS:</strong><br>
  1. The Mortgagor is the absolute owner of the immovable property situated at <strong>{{PROPERTY_LOCATION}}</strong>, more particularly described in the Schedule hereunder written and is free from all encumbrances.
</p>

<p style="text-align: justify; margin-bottom: 15px;">
  2. The Mortgagor has requested the Mortgagee to advance a loan of <strong>Rs. {{LOAN_AMOUNT}} (Rupees {{LOAN_AMOUNT_WORDS}})</strong> for the purpose of {{LOAN_PURPOSE}}, which the Mortgagee has agreed to advance upon having the repayment thereof secured by an absolute transfer of the said property, subject to the proviso for redemption as hereinafter contained.
</p>

<p style="text-align: justify; margin-bottom: 15px; font-weight: bold;">
  NOW THIS DEED WITNESSETH AS FOLLOWS:
</p>

<ol style="text-align: justify; margin-bottom: 30px; padding-left: 20px;">
  <li style="margin-bottom: 15px;"><strong>Consideration and Covenant to Repay:</strong> In consideration of the sum of Rs. {{LOAN_AMOUNT}} advanced by the Mortgagee to the Mortgagor on or before the execution of these presents (the receipt whereof the Mortgagor hereby acknowledges), the Mortgagor hereby covenants with the Mortgagee to repay the said principal sum of Rs. {{LOAN_AMOUNT}} on or before the <strong>{{DUE_DATE}}</strong> ("the Due Date") together with interest thereon at the rate of <strong>{{INTEREST_RATE}}% per annum</strong> payable {{PAYMENT_FREQUENCY}}.</li>
  
  <li style="margin-bottom: 15px;"><strong>Absolute Transfer:</strong> For the consideration aforesaid and to secure the repayment of the mortgage debt, the Mortgagor hereby grants, transfers, conveys and assures unto the Mortgagee ALL THAT piece and parcel of land and premises described in the Schedule hereunder written, together with all rights, easements and appurtenances attached thereto, TO HAVE AND TO HOLD the same unto the Mortgagee absolutely and forever, subject nevertheless to the proviso for redemption hereinafter contained.</li>
  
  <li style="margin-bottom: 15px;"><strong>Proviso for Redemption:</strong> PROVIDED ALWAYS that if the Mortgagor shall duly repay to the Mortgagee the said principal sum of Rs. {{LOAN_AMOUNT}} together with all interest due thereon on or before the Due Date, the Mortgagee shall, at the request and cost of the Mortgagor, re-transfer and reconvey the said property to the Mortgagor or as he may direct, free from all encumbrances created by the Mortgagee.</li>
  
  <li style="margin-bottom: 15px;"><strong>Possession:</strong> The Mortgagor has put the Mortgagee in constructive/actual possession of the said property. The Mortgagee shall have the right to collect the rents and profits of the property and apply the same towards the interest or principal due under this mortgage.</li>
  
  <li style="margin-bottom: 15px;"><strong>Power of Sale:</strong> The Mortgagee shall have the power to sell the mortgaged property without the intervention of the Court under Section 69 of the Transfer of Property Act, 1882, if default is made in payment of the principal money or interest or any part thereof on the Due Date, after giving three months' notice in writing to the Mortgagor.</li>
</ol>

<h4 style="color: #0f172a; margin-top: 20px;">THE SCHEDULE ABOVE REFERRED TO</h4>
<p style="text-align: justify; margin-bottom: 30px; border: 1px solid #cbd5e1; padding: 15px;">
  {{PROPERTY_SCHEDULE}}
</p>

<p style="margin-bottom: 30px;">IN WITNESS WHEREOF the parties hereto have hereunto set and subscribed their respective hands on the day and year first hereinabove written.</p>

<table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
  <tr>
    <td style="width: 50%; vertical-align: top; padding-bottom: 40px;">
      <p>___________________________________</p>
      <p><strong>{{MORTGAGOR_NAME}}</strong></p>
      <p>(MORTGAGOR)</p>
    </td>
    <td style="width: 50%; vertical-align: top; padding-bottom: 40px;">
      <p>___________________________________</p>
      <p><strong>{{MORTGAGEE_NAME}}</strong></p>
      <p>(MORTGAGEE)</p>
    </td>
  </tr>
  <tr>
    <td colspan="2" style="padding-top: 20px;">
      <p><strong>Witnesses:</strong></p>
    </td>
  </tr>
  <tr>
    <td style="width: 50%; padding-top: 10px;">
      <p>1. ___________________________</p>
      <p>Name: ______________________</p>
      <p>Address: ____________________</p>
    </td>
    <td style="width: 50%; padding-top: 10px;">
      <p>2. ___________________________</p>
      <p>Name: ______________________</p>
      <p>Address: ____________________</p>
    </td>
  </tr>
</table>
</div>`,
    fields: [
      {id:"CITY",label:"City of Execution",type:"text",required:true},
      {id:"DAY",label:"Day of Execution",type:"text",placeholder:"e.g. 15th",required:true},
      {id:"MONTH_YEAR",label:"Month & Year",type:"text",placeholder:"e.g. March, 2023",required:true},
      {id:"MORTGAGOR_NAME",label:"Mortgagor Name",type:"text",required:true},
      {id:"MORTGAGOR_FATHER_NAME",label:"Mortgagor's Father's Name",type:"text",required:true},
      {id:"MORTGAGOR_ADDRESS",label:"Mortgagor Address",type:"textarea",required:true},
      {id:"MORTGAGEE_NAME",label:"Mortgagee Name",type:"text",required:true},
      {id:"MORTGAGEE_FATHER_NAME",label:"Mortgagee's Father's Name",type:"text",required:true},
      {id:"MORTGAGEE_ADDRESS",label:"Mortgagee Address",type:"textarea",required:true},
      {id:"PROPERTY_LOCATION",label:"Property Location",type:"textarea",required:true},
      {id:"LOAN_AMOUNT",label:"Loan Amount (Rs)",type:"text",required:true},
      {id:"LOAN_AMOUNT_WORDS",label:"Loan Amount in Words",type:"text",required:true},
      {id:"LOAN_PURPOSE",label:"Purpose of Loan",type:"text",required:true},
      {id:"DUE_DATE",label:"Due Date for Repayment",type:"date",required:true},
      {id:"INTEREST_RATE",label:"Interest Rate (%)",type:"text",required:true},
      {id:"PAYMENT_FREQUENCY",label:"Interest Payment Frequency",type:"text",placeholder:"e.g. monthly, quarterly",required:true},
      {id:"PROPERTY_SCHEDULE",label:"Property Schedule",type:"textarea",required:true}
    ],
    regulation_reference: 'Section 58(e) of Transfer of Property Act, 1882',
    source: 'General Legal Formatting / TPA Guidelines',
    last_verified: '2026-06-11',
    ai_system_prompt: 'Draft as an English Mortgage: must include absolute transfer subject to proviso for redemption on repayment by a certain date.',
    is_active: true,
    is_free: false,
    usage_count: 0,
    display_order: 18,
    tags: ["mortgage", "english mortgage deed", "real estate", "TPA 1882", "absolute transfer"]
  },
  {
    name: "Usufructuary Mortgage Deed",
    slug: "usufructuary-mortgage-deed",
    description: "Mortgage where possession is delivered to the lender who retains it until repayment from property profits.",
    category: "commercial_contracts",
    template_content: `<div style="font-family: serif; line-height: 1.6; color: #1e293b;">
<h3 style="text-align: center; text-decoration: underline; margin-bottom: 30px; color: #0f172a;">
  USUFRUCTUARY MORTGAGE DEED
</h3>

<p style="text-align: justify; margin-bottom: 15px;">
  THIS DEED OF USUFRUCTUARY MORTGAGE is executed at <strong>{{CITY}}</strong> on this <strong>{{DAY}}</strong> day of <strong>{{MONTH_YEAR}}</strong>
</p>

<p style="text-align: center; font-weight: bold; margin-bottom: 15px;">BETWEEN</p>

<p style="text-align: justify; margin-bottom: 15px;">
  <strong>{{MORTGAGOR_NAME}}</strong>, son of {{MORTGAGOR_FATHER_NAME}} resident of {{MORTGAGOR_ADDRESS}} hereinafter called the <strong>MORTGAGOR</strong> of the ONE PART;
</p>

<p style="text-align: center; font-weight: bold; margin-bottom: 15px;">AND</p>

<p style="text-align: justify; margin-bottom: 15px;">
  <strong>{{MORTGAGEE_NAME}}</strong>, son of {{MORTGAGEE_FATHER_NAME}} resident of {{MORTGAGEE_ADDRESS}} hereinafter called the <strong>MORTGAGEE</strong> of the OTHER PART.
</p>

<p style="text-align: justify; margin-bottom: 15px;">
  <strong>WHEREAS</strong> the Mortgagor is the absolute owner and in peaceful possession of the property bearing municipal number <strong>{{PROPERTY_MUNICIPAL_NO}}</strong> situated at <strong>{{PROPERTY_LOCATION}}</strong> and fully described in the Schedule below.
</p>

<p style="text-align: justify; margin-bottom: 15px;">
  <strong>AND WHEREAS</strong> the Mortgagor has requested the Mortgagee to advance a loan of <strong>Rs. {{LOAN_AMOUNT}} (Rupees {{LOAN_AMOUNT_WORDS}})</strong>, which the Mortgagee has agreed to advance on the condition that the Mortgagor shall deliver possession of the said property to the Mortgagee by way of Usufructuary Mortgage.
</p>

<p style="text-align: justify; margin-bottom: 15px; font-weight: bold;">
  NOW THIS DEED WITNESSETH AS FOLLOWS:
</p>

<ol style="text-align: justify; margin-bottom: 30px; padding-left: 20px;">
  <li style="margin-bottom: 15px;">In consideration of the sum of Rs. {{LOAN_AMOUNT}} paid by the Mortgagee to the Mortgagor today (receipt of which the Mortgagor hereby acknowledges), the Mortgagor hereby delivers vacant possession of the scheduled property to the Mortgagee by way of Usufructuary Mortgage.</li>
  
  <li style="margin-bottom: 15px;">The Mortgagee is authorized to retain possession of the said property until the payment of the mortgage money. The Mortgagee shall have the right to receive the rents and profits accruing from the property and to appropriate the same in lieu of interest and towards the principal sum.</li>
  
  <li style="margin-bottom: 15px;">The Mortgagor shall have the right to redeem the property and demand a re-transfer of possession from the Mortgagee upon payment of the entire principal amount of Rs. {{LOAN_AMOUNT}} (or the remaining balance) on or after <strong>{{REDEMPTION_DATE}}</strong>.</li>
  
  <li style="margin-bottom: 15px;">The Mortgagor does not bind himself personally to pay the mortgage money, and the Mortgagee shall look solely to the usufructs of the property for satisfaction of the debt, without any right of foreclosure or sale of the property.</li>
  
  <li style="margin-bottom: 15px;">The Mortgagee shall, during the period of his possession, bear the expenses for routine maintenance, pay property taxes, and manage the property prudently as a person of ordinary prudence would manage his own property.</li>
</ol>

<h4 style="color: #0f172a; margin-top: 20px;">THE SCHEDULE ABOVE REFERRED TO</h4>
<p style="text-align: justify; margin-bottom: 30px; border: 1px solid #cbd5e1; padding: 15px;">
  {{PROPERTY_SCHEDULE}}
</p>

<p style="margin-bottom: 30px;">IN WITNESS WHEREOF the parties have signed this deed on the day, month and year first above written.</p>

<table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
  <tr>
    <td style="width: 50%; vertical-align: top; padding-bottom: 40px;">
      <p>___________________________________</p>
      <p><strong>{{MORTGAGOR_NAME}}</strong></p>
      <p>(MORTGAGOR)</p>
    </td>
    <td style="width: 50%; vertical-align: top; padding-bottom: 40px;">
      <p>___________________________________</p>
      <p><strong>{{MORTGAGEE_NAME}}</strong></p>
      <p>(MORTGAGEE)</p>
    </td>
  </tr>
  <tr>
    <td colspan="2" style="padding-top: 20px;">
      <p><strong>Witnesses:</strong></p>
    </td>
  </tr>
  <tr>
    <td style="width: 50%; padding-top: 10px;">
      <p>1. ___________________________</p>
      <p>Name: ______________________</p>
      <p>Address: ____________________</p>
    </td>
    <td style="width: 50%; padding-top: 10px;">
      <p>2. ___________________________</p>
      <p>Name: ______________________</p>
      <p>Address: ____________________</p>
    </td>
  </tr>
</table>
</div>`,
    fields: [
      {id:"CITY",label:"City of Execution",type:"text",required:true},
      {id:"DAY",label:"Day of Execution",type:"text",required:true},
      {id:"MONTH_YEAR",label:"Month & Year",type:"text",required:true},
      {id:"MORTGAGOR_NAME",label:"Mortgagor Name",type:"text",required:true},
      {id:"MORTGAGOR_FATHER_NAME",label:"Mortgagor's Father's Name",type:"text",required:true},
      {id:"MORTGAGOR_ADDRESS",label:"Mortgagor Address",type:"textarea",required:true},
      {id:"MORTGAGEE_NAME",label:"Mortgagee Name",type:"text",required:true},
      {id:"MORTGAGEE_FATHER_NAME",label:"Mortgagee's Father's Name",type:"text",required:true},
      {id:"MORTGAGEE_ADDRESS",label:"Mortgagee Address",type:"textarea",required:true},
      {id:"PROPERTY_MUNICIPAL_NO",label:"Property Municipal No.",type:"text",required:true},
      {id:"PROPERTY_LOCATION",label:"Property Location",type:"textarea",required:true},
      {id:"LOAN_AMOUNT",label:"Loan Amount (Rs)",type:"text",required:true},
      {id:"LOAN_AMOUNT_WORDS",label:"Loan Amount in Words",type:"text",required:true},
      {id:"REDEMPTION_DATE",label:"Date after which redemption is allowed",type:"date",required:true},
      {id:"PROPERTY_SCHEDULE",label:"Property Schedule",type:"textarea",required:true}
    ],
    regulation_reference: 'Section 58(d) of Transfer of Property Act, 1882',
    source: 'General Legal Formatting / TPA Guidelines',
    last_verified: '2026-06-11',
    ai_system_prompt: 'Draft as a Usufructuary Mortgage: must include transfer of possession, appropriation of rents in lieu of interest/principal, and no personal liability to pay.',
    is_active: true,
    is_free: false,
    usage_count: 0,
    display_order: 19,
    tags: ["mortgage", "usufructuary mortgage deed", "real estate", "TPA 1882", "possession transfer"]
  },
  {
    name: "Memorandum of Deposit of Title Deeds (MODT)",
    slug: "equitable-mortgage-deed",
    description: "Equitable mortgage created by depositing original title deeds with a lender to secure a loan.",
    category: "commercial_contracts",
    template_content: `<div style="font-family: serif; line-height: 1.6; color: #1e293b;">
<h3 style="text-align: center; text-decoration: underline; margin-bottom: 30px; color: #0f172a;">
  MEMORANDUM OF DEPOSIT OF TITLE DEEDS
</h3>

<p style="text-align: justify; margin-bottom: 15px;">
  This Memorandum of Deposit of Title Deeds is made and executed on this <strong>{{DAY}}</strong> day of <strong>{{MONTH_YEAR}}</strong> at <strong>{{CITY}}</strong>.
</p>

<p style="text-align: center; font-weight: bold; margin-bottom: 15px;">BY</p>

<p style="text-align: justify; margin-bottom: 15px;">
  <strong>{{MORTGAGOR_NAME}}</strong>, son of {{MORTGAGOR_FATHER_NAME}} resident of {{MORTGAGOR_ADDRESS}} (hereinafter referred to as the <strong>"MORTGAGOR"</strong> which expression shall unless repugnant to the context include his/her heirs, executors, administrators and assigns)
</p>

<p style="text-align: center; font-weight: bold; margin-bottom: 15px;">IN FAVOUR OF</p>

<p style="text-align: justify; margin-bottom: 15px;">
  <strong>{{MORTGAGEE_NAME}}</strong>, having its branch office at {{MORTGAGEE_ADDRESS}} (hereinafter referred to as the <strong>"LENDER/MORTGAGEE"</strong> which expression shall unless repugnant to the context include its successors and assigns).
</p>

<p style="text-align: justify; margin-bottom: 15px;">
  <strong>WHEREAS:</strong><br>
  1. The Lender has sanctioned a loan/credit facility of <strong>Rs. {{LOAN_AMOUNT}} (Rupees {{LOAN_AMOUNT_WORDS}})</strong> to the Mortgagor vide sanction letter dated <strong>{{SANCTION_LETTER_DATE}}</strong>.
</p>

<p style="text-align: justify; margin-bottom: 15px;">
  2. One of the conditions of the said loan sanction is that the Mortgagor shall secure the repayment of the loan, interest, and other charges by creating an equitable mortgage by deposit of original title deeds in respect of the property owned by the Mortgagor.
</p>

<p style="text-align: justify; margin-bottom: 15px; font-weight: bold;">
  NOW THIS MEMORANDUM WITNESSETH AND IT IS HEREBY RECORDED AS FOLLOWS:
</p>

<ol style="text-align: justify; margin-bottom: 30px; padding-left: 20px;">
  <li style="margin-bottom: 15px;">The Mortgagor has, on the date hereof at the Lender's office at {{CITY}}, voluntarily deposited the original title deeds detailed in the <strong>First Schedule</strong> hereunder written, relating to the immovable property described in the <strong>Second Schedule</strong> hereunder written.</li>
  
  <li style="margin-bottom: 15px;">The said deposit of title deeds has been made by the Mortgagor with the express intent to create an Equitable Mortgage (Mortgage by Deposit of Title Deeds) over the scheduled property in favour of the Lender to secure the due repayment of the loan of Rs. {{LOAN_AMOUNT}} together with interest, costs, charges, and expenses payable by the Mortgagor to the Lender.</li>
  
  <li style="margin-bottom: 15px;">The Mortgagor declares and confirms that he/she is the absolute owner of the scheduled property, and the same is free from all encumbrances, attachments, or charges whatsoever, and the deposited title deeds are the only original documents of title in respect of the property.</li>
  
  <li style="margin-bottom: 15px;">The Lender is authorized to retain the deposited title deeds until the entire outstanding dues of the loan are fully paid and satisfied by the Mortgagor.</li>
</ol>

<h4 style="color: #0f172a; margin-top: 20px;">FIRST SCHEDULE</h4>
<p style="text-align: center; font-size: 14px; color: #64748b; margin-bottom: 10px;">(List of Title Deeds Deposited)</p>
<p style="text-align: justify; margin-bottom: 30px; border: 1px solid #cbd5e1; padding: 15px;">
  {{DOCUMENTS_SCHEDULE}}
</p>

<h4 style="color: #0f172a; margin-top: 20px;">SECOND SCHEDULE</h4>
<p style="text-align: center; font-size: 14px; color: #64748b; margin-bottom: 10px;">(Description of Immovable Property)</p>
<p style="text-align: justify; margin-bottom: 30px; border: 1px solid #cbd5e1; padding: 15px;">
  {{PROPERTY_SCHEDULE}}
</p>

<p style="margin-bottom: 30px;">IN WITNESS WHEREOF the Mortgagor has signed and delivered this Memorandum on the day, month and year first above written.</p>

<table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
  <tr>
    <td style="width: 50%; vertical-align: top; padding-bottom: 40px;">
      <p>___________________________________</p>
      <p><strong>{{MORTGAGOR_NAME}}</strong></p>
      <p>(MORTGAGOR)</p>
    </td>
    <td style="width: 50%;"></td>
  </tr>
  <tr>
    <td colspan="2" style="padding-top: 20px;">
      <p><strong>Witnesses:</strong></p>
    </td>
  </tr>
  <tr>
    <td style="width: 50%; padding-top: 10px;">
      <p>1. ___________________________</p>
      <p>Name: ______________________</p>
      <p>Address: ____________________</p>
    </td>
    <td style="width: 50%; padding-top: 10px;">
      <p>2. ___________________________</p>
      <p>Name: ______________________</p>
      <p>Address: ____________________</p>
    </td>
  </tr>
</table>
</div>`,
    fields: [
      {id:"DAY",label:"Day of Execution",type:"text",required:true},
      {id:"MONTH_YEAR",label:"Month & Year",type:"text",required:true},
      {id:"CITY",label:"City of Notified Town/Branch",type:"text",required:true},
      {id:"MORTGAGOR_NAME",label:"Mortgagor Name",type:"text",required:true},
      {id:"MORTGAGOR_FATHER_NAME",label:"Mortgagor's Father's Name",type:"text",required:true},
      {id:"MORTGAGOR_ADDRESS",label:"Mortgagor Address",type:"textarea",required:true},
      {id:"MORTGAGEE_NAME",label:"Bank/Lender Name",type:"text",required:true},
      {id:"MORTGAGEE_ADDRESS",label:"Bank Branch Address",type:"textarea",required:true},
      {id:"LOAN_AMOUNT",label:"Loan Amount (Rs)",type:"text",required:true},
      {id:"LOAN_AMOUNT_WORDS",label:"Loan Amount in Words",type:"text",required:true},
      {id:"SANCTION_LETTER_DATE",label:"Date of Loan Sanction Letter",type:"date",required:true},
      {id:"DOCUMENTS_SCHEDULE",label:"First Schedule: List of Documents",type:"textarea",placeholder:"e.g. 1. Original Sale Deed No 123... 2. Khatha Certificate...",required:true},
      {id:"PROPERTY_SCHEDULE",label:"Second Schedule: Property Details",type:"textarea",required:true}
    ],
    regulation_reference: 'Section 58(f) of Transfer of Property Act, 1882',
    source: 'General Legal Formatting / TPA Guidelines',
    last_verified: '2026-06-11',
    ai_system_prompt: 'Draft as a Memorandum of Deposit of Title Deeds (MODT). Focus purely on recording the fact that documents were deposited with intent to create equitable mortgage.',
    is_active: true,
    is_free: false,
    usage_count: 0,
    display_order: 20,
    tags: ["mortgage", "MODT", "equitable mortgage", "deposit of title deeds", "real estate", "bank loan security"]
  }
];

async function seed() {
  console.log("Seeding Mortgage templates...");
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
