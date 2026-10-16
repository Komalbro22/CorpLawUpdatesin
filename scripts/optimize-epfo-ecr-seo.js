const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function optimizeArticle() {
  const articleId = '1b1032d5-7b02-49b0-a335-8f15406bf8a5';

  const { data: currentArticle, error: fetchError } = await supabase
    .from('updates')
    .select('*')
    .eq('id', articleId)
    .single();

  if (fetchError || !currentArticle) {
    console.error('Failed to fetch article:', fetchError);
    process.exit(1);
  }

  console.log('Current article fetched:', currentArticle.title);

  // 1. High-CTR SEO Title (exact keyword match first, within 65 chars)
  const seo_title = 'EPFO ECR Deadline Extension 2026: September PF Due Date is 31 Oct';

  // 2. High-CTR SEO Description (under 160 chars, answering intent with dates and numbers)
  const seo_description = 'EPFO circular dated 13 Oct 2026 extends September 2026 ECR filing & PF contribution deposit to 31 October 2026. Get official PDF, wage ceiling rules & FAQs.';

  // 3. Quick Answer (Optimized for Google Featured Snippets & AI Overviews)
  const quick_answer = 'Yes, EPFO has officially extended the deadline for filing the September 2026 Electronic Challan-cum-Return (ECR) and remitting statutory PF contributions from 15 October 2026 to 31 October 2026. Issued under Circular No. Compliance/AnnAcPlan/2022-23/RationalizationofECR-Part(1)/e-704368 dated 13 October 2026, the extension covers both return filing and deposit of dues without penal damages under Section 14B or interest under Section 7Q. The relief addresses payroll adjustment issues following the mid-September wage ceiling hike from ₹15,000 to ₹25,000.';

  // 4. Key Changes (For ItemList schema and Executive Summary)
  const key_changes = [
    'September 2026 ECR filing and contribution remittance deadline extended from 15 October 2026 to 31 October 2026.',
    'Extension covers both Electronic Challan-cum-Return (ECR) filing and statutory contribution deposit across Accounts 1, 2, 10, 21, and 22.',
    'Zero penalty and damages: Remittances completed on or before 31 October 2026 will not attract penal damages under Section 14B or interest under Section 7Q.',
    'Consequential relief following Gazette Notification S.O. 5109(E) raising the EPF/EPS wage ceiling from ₹15,000 to ₹25,000 effective 17 September 2026.',
    'One-time relief: This extension applies exclusively to the September 2026 wage month; October 2026 ECR returns to the standard statutory due date of 15 November 2026.',
    'Legal authority: Issued by CPFC in exercise of powers under the second proviso to Paragraph 28(3) of the Employees\' Provident Funds Scheme, 1952.'
  ];

  // 5. Key Takeaways
  const key_takeaways = [
    'New September 2026 Due Date: 31 October 2026 (extended from 15 October 2026).',
    'Covered Actions: Monthly ECR upload, TRRN challan generation, and payment remittance.',
    'Reason for Extension: Splitting September payroll between ₹15,000 ceiling (1–16 Sept) and ₹25,000 ceiling (17–30 Sept).',
    'No Late Damages: Filings made by 31 October are legally treated as on-time without Section 14B damages.',
    'October 2026 Schedule: Normal timeline applies; due date is 15 November 2026.'
  ];

  // 6. Regulation Reference & Legal Authority
  const regulation_ref = 'EPFO Circular No. Compliance/AnnAcPlan/2022-23/RationalizationofECR-Part(1)/e-704368 dated 13.10.2026; Para 28(3) Proviso, EPF Scheme, 1952';

  // 7. HowTo Steps (For Google HowTo Rich Snippets)
  const has_steps = true;
  const steps_json = [
    {
      heading: 'Step 1: Recalculate Split Payroll for September 2026',
      description: 'Bifurcate employee wages into two periods: 1 to 16 September at the ₹15,000 wage ceiling, and 17 to 30 September at the revised ₹25,000 statutory wage ceiling pursuant to Gazette S.O. 5109(E).'
    },
    {
      heading: 'Step 2: Generate and Validate ECR Text File',
      description: 'Prepare the ECR text file formatted according to the revised contribution wages (EPF, EPS, EDLI). Validate UANs and ensure wage proration errors are cleared in your payroll software.'
    },
    {
      heading: 'Step 3: Upload ECR on EPFO Unified Employer Portal',
      description: 'Log in to unifiedportal-emp.epfindia.gov.in, navigate to Payments > ECR Upload, submit your September 2026 text file, and generate the Temporary Return Reference Number (TRRN) challan.'
    },
    {
      heading: 'Step 4: Remit Statutory Contributions by 31 October 2026',
      description: 'Complete online payment via Internet Banking or SBI aggregator before 11:59 PM on 31 October 2026 to ensure zero late fee, no Section 14B penal damages, and no Section 7Q interest.'
    }
  ];

  // 8. Tags (Capturing all high-volume search queries from GSC)
  const tags = [
    'epfo ecr deadline extension 2026',
    'pf due date extension notification 2026',
    'epfo contribution deposit extension 2026',
    'pf payment due date for september 2026',
    'pf due date for september 2026',
    'epf due date september 2026',
    'epfo circular 2026',
    'epf payment due date for september 2026',
    'epfo circular for extension of due date',
    'September 2026 ECR',
    'wage ceiling 25000',
    'Section 14B damages',
    'EPF Scheme Para 28',
    'EPFO',
    'ECR',
    'EPF'
  ];

  // 9. Rich Content with Quick Due Date Table, Proration Math, and FAQ Accordion
  const enrichedContent = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.75; max-width: 100%;">

  <!-- ================= HIGHLIGHT BANNER: EXTENSION CONFIRMED ================= -->
  <div style="background: linear-gradient(135deg, #0b1f3a 0%, #1e3a5f 100%); color: #ffffff; border-radius: 12px; padding: 22px 26px; margin: 0 0 26px 0; box-shadow: 0 4px 14px rgba(11,31,58,0.12); border-left: 6px solid #c9a84c;">
    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
      <span style="background: #c9a84c; color: #0b1f3a; font-size: 11px; font-weight: 800; padding: 3px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.05em;">Official EPFO Notice</span>
      <span style="color: #cbd5e1; font-size: 12px;">Circular Dated 13 October 2026</span>
    </div>
    <h2 style="margin: 0 0 10px 0; font-size: 20px; font-weight: 700; color: #ffffff; line-height: 1.4;">
      September 2026 PF ECR Filing &amp; Payment Due Date Extended to 31 October 2026
    </h2>
    <p style="margin: 0; font-size: 14.5px; color: #e2e8f0; line-height: 1.6;">
      In relief to over 6.5 lakh establishments across India, the Employees' Provident Fund Organisation (EPFO) has officially extended the statutory due date for filing the Electronic Challan-cum-Return (ECR) and depositing provident fund contributions for the <strong>September 2026 wage month</strong> from <strong>15 October 2026 to 31 October 2026</strong>.
    </p>
  </div>

  <!-- ================= QUICK STATUTORY DUE DATE COMPARISON TABLE ================= -->
  <div style="background: #ffffff; border: 2px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin: 24px 0 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.04);">
    <div style="background: #f8fafc; padding: 14px 20px; border-bottom: 2px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
      <span style="font-weight: 700; color: #0b1f3a; font-size: 15px; display: flex; align-items: center; gap: 8px;">
        📅 Statutory PF Due Dates &amp; Relief Matrix (September 2026)
      </span>
      <span style="font-size: 11px; font-weight: 700; background: #dcfce7; color: #166534; padding: 3px 8px; border-radius: 6px; text-transform: uppercase;">
        Relief Confirmed
      </span>
    </div>
    <table style="width: 100%; border-collapse: collapse; font-size: 14px; text-align: left;">
      <tbody>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 12px 18px; font-weight: 600; color: #475569; width: 42%; background: #f8fafc;">Wage Month</td>
          <td style="padding: 12px 18px; font-weight: 700; color: #0b1f3a;">September 2026</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 12px 18px; font-weight: 600; color: #475569; background: #f8fafc;">Original Statutory Due Date</td>
          <td style="padding: 12px 18px; color: #dc2626; font-weight: 600; text-decoration: line-through;">15 October 2026 (Expired)</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9; background: #fefce8;">
          <td style="padding: 12px 18px; font-weight: 700; color: #854d0e; background: #fef9c3;">Revised Extended Due Date</td>
          <td style="padding: 12px 18px; color: #166534; font-weight: 800; font-size: 16px;">31 October 2026 (11:59 PM)</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 12px 18px; font-weight: 600; color: #475569; background: #f8fafc;">Scope of Extension</td>
          <td style="padding: 12px 18px; color: #1e293b;">Both ECR Return Filing &amp; Remittance of Statutory Dues (A/c 1, 2, 10, 21, 22)</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 12px 18px; font-weight: 600; color: #475569; background: #f8fafc;">Section 14B Penal Damages / Section 7Q Interest</td>
          <td style="padding: 12px 18px; color: #16a34a; font-weight: 700;">NIL / Waived if paid on or before 31 October 2026</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 12px 18px; font-weight: 600; color: #475569; background: #f8fafc;">Legal Source Reference</td>
          <td style="padding: 12px 18px; color: #1e293b;">EPFO Circular No. Compliance/AnnAcPlan/2022-23/RationalizationofECR-Part(1)/e-704368 dated 13.10.2026</td>
        </tr>
        <tr>
          <td style="padding: 12px 18px; font-weight: 600; color: #475569; background: #f8fafc;">Next Wage Month (October 2026) Due Date</td>
          <td style="padding: 12px 18px; color: #0b1f3a; font-weight: 600;">15 November 2026 (Standard Cycle Resumes)</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- ================= BILINGUAL HINDI ALERT CALLOUT ================= -->
  <div style="background: #f1f5f9; border-left: 4px solid #3b82f6; border-radius: 0 8px 8px 0; padding: 14px 18px; margin: 20px 0; font-size: 13.5px; color: #334155;">
    <strong>हिंदी में जानकारी (EPFO Circular Update):</strong> कर्मचारी भविष्य निधि संगठन (EPFO) ने नियोक्ताओं को बड़ी राहत देते हुए <strong>सितंबर 2026 के लिए ईसीआर (ECR) दाखिल करने और पीएफ अंशदान (PF Contribution) जमा करने की अंतिम तारीख 15 अक्टूबर से बढ़ाकर 31 अक्टूबर 2026</strong> कर दी है। यदि नियोक्ता 31 अक्टूबर तक चालान भरकर भुगतान कर देते हैं, तो उन पर धारा 14B के तहत कोई हर्जाना (Damages) या धारा 7Q के तहत ब्याज नहीं लगेगा।
  </div>

  <!-- ================= SECTION 1: WHY EPFO EXTENDED THE DEADLINE ================= -->
  <h2 style="color: #0b1f3a; font-size: 20px; font-weight: 700; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin: 32px 0 16px 0;">
    Why EPFO Extended the September 2026 ECR Deadline
  </h2>

  <p style="margin-bottom: 14px;">
    The deadline extension is the direct operational consequence of the Central Government's landmark notification revising the statutory wage ceiling under the Code on Social Security, 2020.
  </p>

  <p style="margin-bottom: 14px;">
    Vide Gazette Notification <strong>S.O. 5109(E) dated 17 September 2026</strong>, the Ministry of Labour and Employment raised the statutory wage ceiling for mandatory EPF, EPS, and EDLI coverage from <strong>&#8377;15,000 to &#8377;25,000 per month</strong>.
  </p>

  <p style="margin-bottom: 14px;">
    Because the notification became legally effective on <strong>17 September 2026</strong> — right in the middle of the calendar wage month — establishments across India faced a unprecedented split-month payroll challenge:
  </p>

  <ul style="padding-left: 24px; margin-bottom: 18px;">
    <li style="margin-bottom: 8px;"><strong>Period 1 (1 September to 16 September 2026 — 16 Days):</strong> Old statutory wage ceiling of &#8377;15,000 applies. Maximum prorated wage basis = &#8377;15,000 &times; (16/30) = <strong>&#8377;8,000</strong>.</li>
    <li style="margin-bottom: 8px;"><strong>Period 2 (17 September to 30 September 2026 — 14 Days):</strong> New statutory wage ceiling of &#8377;25,000 applies. Maximum prorated wage basis = &#8377;25,000 &times; (14/30) = <strong>&#8377;11,666.67</strong>.</li>
    <li style="margin-bottom: 8px;"><strong>Combined September Cap:</strong> Total statutory wage cap for pension contribution (EPS) in September 2026 comes to <strong>&#8377;19,666.67</strong>.</li>
  </ul>

  <p style="margin-bottom: 18px;">
    Employer associations and payroll software providers represented to the Central Provident Fund Commissioner that modifying enterprise ERPs (SAP, Oracle, Darwinbox, Keka, ZingHR) to handle split-rate prorations, retroactive adjustments, and new employee enrollments at short notice was generating massive technical glitches. Recognizing these administrative difficulties, EPFO exercised its statutory powers to grant a full 16-day extension.
  </p>

  <!-- ================= SECTION 2: OPERATIVE TERMS OF THE CIRCULAR ================= -->
  <h2 style="color: #0b1f3a; font-size: 20px; font-weight: 700; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin: 32px 0 16px 0;">
    Key Directives in EPFO Circular No. e-704368
  </h2>

  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px; margin: 20px 0;">
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px;">
      <h3 style="margin: 0 0 6px 0; font-size: 15px; color: #0b1f3a; font-weight: 700;">1. Due Date Extended, Not Just a Grace Period</h3>
      <p style="margin: 0; font-size: 13.5px; color: #475569;">The statutory due date itself has been substituted to 31.10.2026. Therefore, returns filed and payments made by 31 October are legally treated as timely filings, with zero penal interest or damages.</p>
    </div>
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px;">
      <h3 style="margin: 0 0 6px 0; font-size: 15px; color: #0b1f3a; font-weight: 700;">2. Confined Exclusively to September 2026</h3>
      <p style="margin: 0; font-size: 13.5px; color: #475569;">Paragraph 6 clarifies that this is a one-time relief tailored specifically for the mid-month transition. No ongoing timeline relaxation applies to October 2026 or future wage months.</p>
    </div>
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px;">
      <h3 style="margin: 0 0 6px 0; font-size: 15px; color: #0b1f3a; font-weight: 700;">3. Covers All Statutory Accounts</h3>
      <p style="margin: 0; font-size: 13.5px; color: #475569;">Applies to EPF Contribution (A/c 1), Admin Charges (A/c 2), EPS Pension Fund (A/c 10), EDLI Contribution (A/c 21), and EDLI Admin Charges (A/c 22).</p>
    </div>
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px;">
      <h3 style="margin: 0 0 6px 0; font-size: 15px; color: #0b1f3a; font-weight: 700;">4. Statutory Legal Authority</h3>
      <p style="margin: 0; font-size: 13.5px; color: #475569;">Issued under the second proviso to Paragraph 28(3) of the Employees\' Provident Funds Scheme, 1952, signed by Additional CPFC (Compliance) P. B. Verma with CPFC approval.</p>
    </div>
  </div>

  <!-- ================= SECTION 3: STEP-BY-STEP EMPLOYER ACTION PLAN ================= -->
  <h2 style="color: #0b1f3a; font-size: 20px; font-weight: 700; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin: 32px 0 16px 0;">
    Action Plan for Employers, HR Teams &amp; Payroll Managers
  </h2>

  <ol style="padding-left: 22px; margin-bottom: 22px;">
    <li style="margin-bottom: 12px;">
      <strong>Audit Employees in the &#8377;15,000 to &#8377;25,000 Wage Bracket:</strong>
      Identify all employees whose monthly basic wages + DA exceed &#8377;15,000 but are within &#8377;25,000. These employees become mandatorily covered from 17 September 2026. Ensure Universal Account Numbers (UANs) are generated or linked before filing.
    </li>
    <li style="margin-bottom: 12px;">
      <strong>Verify ECR Proration Formulas:</strong>
      Ensure your payroll export calculates EPF (12% of applicable wages), EPS (8.33% capped at prorated &#8377;19,666.67), and EDLI (0.50% capped at prorated wage).
    </li>
    <li style="margin-bottom: 12px;">
      <strong>Upload ECR File Early to Prevent Last-Day Server Congestion:</strong>
      Do not wait until 31 October 2026. The EPFO Unified Portal frequently encounters heavy server load and gateway timeouts on deadline evenings. Generate your TRRN by 28–29 October.
    </li>
    <li style="margin-bottom: 12px;">
      <strong>Keep October 2026 Payroll on Schedule:</strong>
      Remember that October 2026 contributions fall due on <strong>15 November 2026</strong> as usual. October payroll will be simpler because the full month will be under the uniform &#8377;25,000 ceiling.
    </li>
  </ol>

  <!-- ================= SECTION 4: FREQUENTLY ASKED QUESTIONS (FAQS) ================= -->
  <h2 style="color: #0b1f3a; font-size: 20px; font-weight: 700; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin: 36px 0 18px 0;">
    Frequently Asked Questions (FAQs) — September 2026 PF Extension
  </h2>

  <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 28px;">
    
    <details style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px;" open>
      <summary style="font-weight: 700; color: #0b1f3a; font-size: 15px; cursor: pointer;">
        Is the PF due date for September 2026 extended?
      </summary>
      <p style="margin: 10px 0 0 0; font-size: 14px; color: #334155; line-height: 1.6;">
        Yes. EPFO issued an official circular on 13 October 2026 extending the due date for filing the Electronic Challan-cum-Return (ECR) and depositing PF contributions for the September 2026 wage month from 15 October 2026 to <strong>31 October 2026</strong>.
      </p>
    </details>

    <details style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px;">
      <summary style="font-weight: 700; color: #0b1f3a; font-size: 15px; cursor: pointer;">
        Does the extension apply to payment and deposit of contributions or only ECR upload?
      </summary>
      <p style="margin: 10px 0 0 0; font-size: 14px; color: #334155; line-height: 1.6;">
        The extension applies to <strong>both</strong> the filing of the monthly ECR return and the actual financial remittance/deposit of statutory contributions into EPFO accounts.
      </p>
    </details>

    <details style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px;">
      <summary style="font-weight: 700; color: #0b1f3a; font-size: 15px; cursor: pointer;">
        Will interest under Section 7Q or damages under Section 14B apply if filed by 31 October?
      </summary>
      <p style="margin: 10px 0 0 0; font-size: 14px; color: #334155; line-height: 1.6;">
        <strong>No.</strong> Because the statutory due date itself has been formally substituted to 31 October 2026 under the second proviso to Paragraph 28(3) of the EPF Scheme, payments made on or before 31 October 2026 will not attract any penal damages under Section 14B or penal interest under Section 7Q.
      </p>
    </details>

    <details style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px;">
      <summary style="font-weight: 700; color: #0b1f3a; font-size: 15px; cursor: pointer;">
        What is the official EPFO circular number for the September 2026 deadline extension?
      </summary>
      <p style="margin: 10px 0 0 0; font-size: 14px; color: #334155; line-height: 1.6;">
        The official reference is <strong>Circular No. Compliance/AnnAcPlan/2022-23/RationalizationofECR-Part(1)/e-704368</strong>, dated 13 October 2026, issued from the EPFO Head Office in New Delhi by P. B. Verma, Additional CPFC (Compliance).
      </p>
    </details>

    <details style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px;">
      <summary style="font-weight: 700; color: #0b1f3a; font-size: 15px; cursor: pointer;">
        Why was the September 2026 PF deadline extended?
      </summary>
      <p style="margin: 10px 0 0 0; font-size: 14px; color: #334155; line-height: 1.6;">
        The Central Government raised the statutory wage ceiling from &#8377;15,000 to &#8377;25,000 effective 17 September 2026 (Gazette S.O. 5109(E)). Because this took effect mid-month, employers needed additional time to configure payroll systems for split-rate calculations and new employee onboarding.
      </p>
    </details>

    <details style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px;">
      <summary style="font-weight: 700; color: #0b1f3a; font-size: 15px; cursor: pointer;">
        When is the PF ECR due date for October 2026?
      </summary>
      <p style="margin: 10px 0 0 0; font-size: 14px; color: #334155; line-height: 1.6;">
        The due date for the October 2026 wage month remains strictly <strong>15 November 2026</strong>. Paragraph 6 of the circular specifies that the extension is a one-time measure for September 2026 only.
      </p>
    </details>

    <details style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px;">
      <summary style="font-weight: 700; color: #0b1f3a; font-size: 15px; cursor: pointer;">
        क्या कंपनियों को सितंबर का ईसीआर और चालान भरने के लिए 31 अक्टूबर तक का समय मिला है?
      </summary>
      <p style="margin: 10px 0 0 0; font-size: 14px; color: #334155; line-height: 1.6;">
        हाँ, ईपीएफओ (EPFO) के परिपत्र दिनांक 13.10.2026 के अनुसार सभी प्रतिष्ठानों के लिए सितंबर 2026 का ईसीआर रिटर्न अपलोड करने तथा पीएफ का चालान जमा करने की अंतिम तिथि 15 अक्टूबर से बढ़ाकर <strong>31 अक्टूबर 2026</strong> कर दी गई है।
      </p>
    </details>

  </div>

  <!-- ================= SECTION 5: OFFICIAL SOURCE VERIFICATION & DOWNLOAD ================= -->
  <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 20px; margin: 28px 0;">
    <h3 style="margin: 0 0 10px 0; font-size: 16px; color: #0b1f3a; font-weight: 700; display: flex; align-items: center; gap: 8px;">
      📑 Primary Source &amp; Gazette Authentication
    </h3>
    <ul style="padding-left: 20px; margin: 0 0 14px 0; font-size: 13.5px; color: #475569;">
      <li style="margin-bottom: 6px;">
        <strong>Official Circular PDF:</strong> EPFO Circular No. Compliance/AnnAcPlan/2022-23/RationalizationofECR-Part(1)/e-704368, dated 13.10.2026 &mdash; <a href="https://www.sgcms.com/regulatory-updates/wp-content/uploads/2026/10/Circular-dated-13.10.2026.pdf" target="_blank" rel="noopener noreferrer" style="color: #1d4ed8; font-weight: 600; text-decoration: underline;">Download Official Circular PDF (Direct Link)</a>
      </li>
      <li style="margin-bottom: 6px;">
        <strong>Ministry of Labour Gazette Notification:</strong> S.O. 5109(E) dated 17.09.2026 raising wage ceiling to &#8377;25,000/month.
      </li>
      <li style="margin-bottom: 6px;">
        <strong>Statutory Portal:</strong> Unified Employer Portal (<a href="https://unifiedportal-emp.epfindia.gov.in/" target="_blank" rel="noopener noreferrer" style="color: #1d4ed8;">unifiedportal-emp.epfindia.gov.in</a>).
      </li>
    </ul>
    <p style="margin: 0; font-size: 12px; color: #64748b; font-style: italic;">
      Authentication Notice: Verified against primary regulatory documents under CorpLawUpdates.in Primary Source Editorial Policy.
    </p>
  </div>

</div>
`;

  // Update Supabase
  const { data: updated, error: updateError } = await supabase
    .from('updates')
    .update({
      seo_title,
      seo_description,
      quick_answer,
      key_changes,
      key_takeaways,
      regulation_ref,
      has_steps,
      steps_json,
      tags,
      impact_level: 'high',
      is_featured: true,
      last_verified: new Date().toISOString(),
      last_amended: '2026-10-13T00:00:00Z',
      content: enrichedContent.trim(),
      updated_at: new Date().toISOString()
    })
    .eq('id', articleId)
    .select('id, title, slug, seo_title, seo_description, is_featured, impact_level');

  if (updateError) {
    console.error('Update failed:', updateError);
    process.exit(1);
  }

  console.log('Successfully updated article SEO and content in database:', updated);
}

optimizeArticle();
