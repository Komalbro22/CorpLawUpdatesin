const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function updateArticle() {
  const { data: currentArticle, error: fetchError } = await supabase
    .from('updates')
    .select('*')
    .eq('slug', 'form-mgt-7-mgt-7a-annual-return-guide-2026')
    .single();

  if (fetchError || !currentArticle) {
    console.error('Failed to fetch article:', fetchError);
    process.exit(1);
  }

  let content = currentArticle.content;

  // 1. Update H1 heading
  content = content.replace(
    /<h1 style="color:#1e3a5f;font-size:1.9rem;line-height:1.35;margin:8px 0 20px;">[\s\S]*?<\/h1>/i,
    `<h1 style="color:#1e3a5f;font-size:1.9rem;line-height:1.35;margin:8px 0 20px;">MGT-7 &amp; MGT-7A Due Date FY 2025-26: The Complete Annual Return Guide — Filing Deadline, Form Rules, Fees &amp; MCA V3 Help Kit</h1>`
  );

  // 2. Insert Featured Snippet Quick Due Date Reference Table right after Quick Answer box
  const quickAnswerMarker = '<!-- Quick Calculator CTA Banner -->';
  const quickDueDateTable = `
<!-- ================= FEATURED SNIPPET: QUICK DUE DATE REFERENCE TABLE ================= -->
<div style="background:#f8fafc;border:2px solid #2563eb;border-radius:10px;padding:22px;margin:24px 0 28px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
  <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:14px;border-bottom:2px solid #e2e8f0;padding-bottom:10px;">
    <div style="font-weight:700;color:#1e3a5f;font-size:1.15rem;display:flex;align-items:center;gap:8px;">
      📅 Quick Due Date Reference Table for FY 2025-26 (Form MGT-7 &amp; MGT-7A)
    </div>
    <span style="font-size:0.8rem;background:#dbeafe;color:#1e40af;padding:3px 10px;border-radius:9999px;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;">
      Statutory FY 2025-26 Deadlines
    </span>
  </div>
  <p style="color:#475569;font-size:0.92rem;margin:0 0 14px;line-height:1.6;">
    Under Section 92(4) of the Companies Act, 2013, Form MGT-7 and Form MGT-7A must be filed within <strong>60 calendar days</strong> from the date of the Annual General Meeting (AGM), or where no AGM is held, within 60 days from the date when the AGM ought to have been held. Here are the precise statutory filing deadlines for FY 2025-26:
  </p>
  <div style="overflow-x:auto;">
    <table style="width:100%;border-collapse:collapse;font-size:0.92rem;background:#ffffff;border:1px solid #cbd5e1;border-radius:6px;overflow:hidden;">
      <thead>
        <tr style="background:#1e3a5f;color:#ffffff;">
          <th style="padding:11px 14px;text-align:left;border-right:1px solid #334155;">Company Category</th>
          <th style="padding:11px 14px;text-align:left;border-right:1px solid #334155;">Form Name</th>
          <th style="padding:11px 14px;text-align:left;border-right:1px solid #334155;">AGM Benchmark Date</th>
          <th style="padding:11px 14px;text-align:left;border-right:1px solid #334155;">MGT-7 / 7A Due Date (FY 2025-26)</th>
          <th style="padding:11px 14px;text-align:left;">Legal Basis</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom:1px solid #e2e8f0;background:#f0fdf4;">
          <td style="padding:11px 14px;border-right:1px solid #e2e8f0;">
            <strong>Private Limited (Standard) &amp; Public Limited</strong>
          </td>
          <td style="padding:11px 14px;border-right:1px solid #e2e8f0;">
            <span style="background:#dbeafe;color:#1e40af;padding:3px 9px;border-radius:4px;font-weight:700;font-size:0.85rem;">Form MGT-7</span>
          </td>
          <td style="padding:11px 14px;border-right:1px solid #e2e8f0;">30 September 2026</td>
          <td style="padding:11px 14px;border-right:1px solid #e2e8f0;color:#166534;font-weight:700;font-size:0.98rem;">
            29 November 2026
          </td>
          <td style="padding:11px 14px;font-size:0.85rem;color:#475569;">Section 92(4) (60 days from AGM)</td>
        </tr>
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:11px 14px;border-right:1px solid #e2e8f0;">
            <strong>Small Companies</strong> (Capital &le; &#8377;10 Cr &amp; Turnover &le; &#8377;100 Cr)
          </td>
          <td style="padding:11px 14px;border-right:1px solid #e2e8f0;">
            <span style="background:#dcfce7;color:#166534;padding:3px 9px;border-radius:4px;font-weight:700;font-size:0.85rem;">Form MGT-7A</span>
          </td>
          <td style="padding:11px 14px;border-right:1px solid #e2e8f0;">30 September 2026</td>
          <td style="padding:11px 14px;border-right:1px solid #e2e8f0;color:#166534;font-weight:700;font-size:0.98rem;">
            29 November 2026
          </td>
          <td style="padding:11px 14px;font-size:0.85rem;color:#475569;">Section 92(1) Proviso &amp; Rule 11</td>
        </tr>
        <tr style="border-bottom:1px solid #e2e8f0;background:#fefce8;">
          <td style="padding:11px 14px;border-right:1px solid #e2e8f0;">
            <strong>One Person Companies (OPC)</strong>
          </td>
          <td style="padding:11px 14px;border-right:1px solid #e2e8f0;">
            <span style="background:#dcfce7;color:#166534;padding:3px 9px;border-radius:4px;font-weight:700;font-size:0.85rem;">Form MGT-7A</span>
          </td>
          <td style="padding:11px 14px;border-right:1px solid #e2e8f0;font-style:italic;color:#713f12;">
            Exempt from AGM (Section 96(1))
          </td>
          <td style="padding:11px 14px;border-right:1px solid #e2e8f0;color:#854d0e;font-weight:700;font-size:0.98rem;">
            28 November 2026
          </td>
          <td style="padding:11px 14px;font-size:0.85rem;color:#475569;">60 days from 180 days of FY close</td>
        </tr>
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:11px 14px;border-right:1px solid #e2e8f0;">
            <strong>Companies Granted ROC AGM Extension</strong> (Form GNL-1)
          </td>
          <td style="padding:11px 14px;border-right:1px solid #e2e8f0;">MGT-7 / MGT-7A</td>
          <td style="padding:11px 14px;border-right:1px solid #e2e8f0;">Extended Date (Up to 30 Dec 2026)</td>
          <td style="padding:11px 14px;border-right:1px solid #e2e8f0;font-weight:700;color:#1e3a5f;">
            Within 60 days of actual AGM
          </td>
          <td style="padding:11px 14px;font-size:0.85rem;color:#475569;">Section 96(1) Third Proviso</td>
        </tr>
        <tr style="border-bottom:1px solid #e2e8f0;background:#fef2f2;">
          <td style="padding:11px 14px;border-right:1px solid #e2e8f0;">
            <strong>Default: No AGM Held in Financial Year</strong>
          </td>
          <td style="padding:11px 14px;border-right:1px solid #e2e8f0;">MGT-7 / MGT-7A</td>
          <td style="padding:11px 14px;border-right:1px solid #e2e8f0;color:#991b1b;">Ought to be held (30 Sept 2026)</td>
          <td style="padding:11px 14px;border-right:1px solid #e2e8f0;color:#991b1b;font-weight:700;font-size:0.98rem;">
            29 November 2026
          </td>
          <td style="padding:11px 14px;font-size:0.85rem;color:#475569;">Section 92(4) Proviso + Reasons Statement</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
`;

  if (content.includes(quickAnswerMarker)) {
    content = content.replace(quickAnswerMarker, quickDueDateTable + '\n' + quickAnswerMarker);
  }

  // 3. Add dedicated subsection for OPC Due Date in Due Dates section
  const opcDueDateSection = `
<h3 style="color:#0369a1;font-size:1.15rem;margin:24px 0 10px;">Due Date of Form MGT-7A for One Person Company (OPC)</h3>

<p>A frequent compliance query every annual filing season is: <em>"When is Form MGT-7A due for a One Person Company if OPCs do not hold an AGM?"</em></p>

<p>The legal mechanism is clearly settled under Section 96(1) third proviso read with Rule 11 of the Companies (Management and Administration) Rules, 2014:</p>
<ul style="padding-left:22px;line-height:1.8;">
  <li><strong>Statutory Exemption from AGM:</strong> Under Section 96(1), an OPC is completely exempt from holding an Annual General Meeting. Instead, resolutions are passed by the sole member by entering them in the minutes book pursuant to Section 122(3).</li>
  <li><strong>How the 60-Day Clock Operates:</strong> Since Section 137(1) gives an OPC 180 days from the closure of the financial year (i.e., until 27 September for a 31 March financial year end) to adopt financial accounts, Rule 11 dictates that the 60-day period for filing Form MGT-7A begins immediately upon expiry of this statutory adoption window.</li>
  <li><strong>Exact Statutory Due Date:</strong> Counting 60 days from 27 September gives <strong>28 November 2026</strong> as the statutory filing deadline for Form MGT-7A for OPCs for FY 2025-26.</li>
  <li><strong>Late Fee Consequences:</strong> Filing on or after 29 November triggers the flat <strong>&#8377;100 per day additional filing fee</strong> under Table B with no maximum cap. However, OPCs enjoy 50% reduced penalty exposure on Section 92(5) ROC adjudication proceedings under Section 446B.</li>
</ul>
`;

  const dueDatesEndMarker = '<h2 style="color:#1e3a5f;font-size:1.45rem;border-bottom:2px solid #e2e8f0;padding-bottom:6px;margin:36px 0 16px;">Filing Fees and What Delay Costs</h2>';
  if (content.includes(dueDatesEndMarker)) {
    content = content.replace(dueDatesEndMarker, opcDueDateSection + '\n' + dueDatesEndMarker);
  }

  // 4. Expand Section II: Principal Business Activities of MGT-7A
  const pbaSectionMarker = '<h3 style="color:#0369a1;font-size:1.12rem;margin:26px 0 10px;">III. Holding, subsidiary and associate companies</h3>';
  const pbaEnhancedGuide = `
<div style="background:#f1f5f9;border-left:4px solid #0284c7;border-radius:6px;padding:16px 20px;margin:20px 0;">
  <div style="font-weight:700;color:#0369a1;font-size:1rem;margin-bottom:8px;">
    📘 Principal Business Activities of the Company in Form MGT-7A: Field Guide &amp; Validations
  </div>
  <p style="margin:0 0 10px;font-size:0.94rem;line-height:1.7;">
    In Part II of Form MGT-7A, filers must report the company's core commercial operations using the official <strong>National Industrial Classification (NIC 2008)</strong> codes. Common doubts and portal validations include:
  </p>
  <ul style="padding-left:20px;margin:0;font-size:0.92rem;line-height:1.75;">
    <li><strong>Number of Business Activities:</strong> Form MGT-7A accommodates up to <strong>4 principal business activities</strong> directly within the web form. (In contrast, full Form MGT-7 allows up to 15 activities). If an entity operates more than 4 business segments, the top 4 contributing the majority of revenue are entered, and the remaining breakdown is attached as an optional PDF attachment.</li>
    <li><strong>The 100.00% Turnover Rule:</strong> The percentage of total turnover entered across all declared principal business activities must <strong>equal exactly 100.00%</strong>. Even a minor rounding discrepancy (e.g., 99.99% or 100.01%) will cause MCA V3 pre-scrutiny validation to fail with error code: <em>"Total percentage of turnover across business activities must be equal to 100"</em>.</li>
    <li><strong>Companies with Zero Turnover:</strong> For newly incorporated, pre-operative, or inactive small companies having <strong>&#8377;0 turnover</strong> during FY 2025-26, enter <strong>1</strong> as the number of business activities, select the primary NIC code corresponding to the Main Object clause of the company's MOA, and enter <strong>0.00%</strong> in the percentage of turnover field. This satisfies MCA V3 schema while aligning with Part V turnover figures.</li>
  </ul>
</div>
`;

  if (content.includes(pbaSectionMarker)) {
    content = content.replace(pbaSectionMarker, pbaEnhancedGuide + '\n' + pbaSectionMarker);
  }

  // 5. Expand Section IV: Class of Security Held in Form MGT-7A
  const shareCapitalMarker = '<h3 style="color:#0369a1;font-size:1.12rem;margin:26px 0 10px;">V. Turnover and net worth</h3>';
  const classOfSecurityGuide = `
<div style="background:#f1f5f9;border-left:4px solid #059669;border-radius:6px;padding:16px 20px;margin:20px 0;">
  <div style="font-weight:700;color:#065f46;font-size:1rem;margin-bottom:8px;">
    📊 Class of Security Held in Form MGT-7A (Part IV Field Guide)
  </div>
  <p style="margin:0 0 10px;font-size:0.94rem;line-height:1.7;">
    Part IV of Form MGT-7A requires reporting the abridged capital structure under <strong>"Share capital, debentures and other securities"</strong>:
  </p>
  <ul style="padding-left:20px;margin:0;font-size:0.92rem;line-height:1.75;">
    <li><strong>Class of Equity Shares:</strong> Filers must declare whether the equity capital consists of <em>Equity shares with voting rights</em> or <em>Equity shares with Differential Voting Rights (DVR)</em> under Section 43(a). Report nominal value per share (typically &#8377;10 or &#8377;100), total Authorized Capital, Issued Capital, Subscribed Capital, and Paid-up Capital.</li>
    <li><strong>Preference Shares &amp; Debentures:</strong> If the company has issued preference shares (cumulative, redeemable, or convertible) or debentures, report each class separately along with the applicable dividend or coupon rate.</li>
    <li><strong>Reconciliation Check:</strong> The total paid-up share capital entered in Part IV must match the total nominal paid-up amount calculated across all promoters and public shareholders in Part VII. Any mismatch between Part IV and Part VII triggers a blocking validation on MCA V3.</li>
  </ul>
</div>
`;

  if (content.includes(shareCapitalMarker)) {
    content = content.replace(shareCapitalMarker, classOfSecurityGuide + '\n' + shareCapitalMarker);
  }

  // 6. Insert Difference Table: MGT-7 vs MGT-7A
  const diffSectionMarker = '<h2 style="color:#1e3a5f;font-size:1.45rem;border-bottom:2px solid #e2e8f0;padding-bottom:6px;margin:36px 0 16px;">The small company threshold moved';
  const mgt7Vs7aComparison = `
<!-- ================= MGT-7 vs MGT-7A COMPARISON MATRIX ================= -->
<div style="background:#ffffff;border:1px solid #cbd5e1;border-radius:8px;padding:22px;margin:28px 0;box-shadow:0 2px 4px rgba(0,0,0,0.03);">
  <div style="font-weight:700;color:#1e3a5f;font-size:1.18rem;margin-bottom:12px;border-bottom:2px solid #e2e8f0;padding-bottom:8px;">
    ⚖ Difference Between Form MGT-7 and Form MGT-7A (Comparison Matrix)
  </div>
  <p style="color:#475569;font-size:0.92rem;margin:0 0 16px;line-height:1.65;">
    Professionals often compare Form MGT-7 and MGT-7A to verify filing requirements. Here is the direct statutory comparison:
  </p>
  <div style="overflow-x:auto;">
    <table style="width:100%;border-collapse:collapse;font-size:0.92rem;">
      <thead>
        <tr style="background:#1e3a5f;color:#ffffff;">
          <th style="padding:10px 12px;text-align:left;border-right:1px solid #334155;">Feature / Parameter</th>
          <th style="padding:10px 12px;text-align:left;border-right:1px solid #334155;">Form MGT-7 (Full Annual Return)</th>
          <th style="padding:10px 12px;text-align:left;">Form MGT-7A (Abridged Annual Return)</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom:1px solid #e2e8f0;background:#f8fafc;">
          <td style="padding:10px 12px;border-right:1px solid #e2e8f0;"><strong>Applicability</strong></td>
          <td style="padding:10px 12px;border-right:1px solid #e2e8f0;">All Public Limited, Non-Small Private Ltd, Section 8, and Producer Companies</td>
          <td style="padding:10px 12px;"><strong>Only One Person Companies (OPC) and Small Companies</strong></td>
        </tr>
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:10px 12px;border-right:1px solid #e2e8f0;"><strong>Paid-Up Capital Threshold</strong></td>
          <td style="padding:10px 12px;border-right:1px solid #e2e8f0;">Paid-up Capital &gt; &#8377;10 Crore (or non-private)</td>
          <td style="padding:10px 12px;">Paid-up Capital &le; &#8377;10 Crore (Notification G.S.R. 880(E))</td>
        </tr>
        <tr style="border-bottom:1px solid #e2e8f0;background:#f8fafc;">
          <td style="padding:10px 12px;border-right:1px solid #e2e8f0;"><strong>Turnover Threshold</strong></td>
          <td style="padding:10px 12px;border-right:1px solid #e2e8f0;">Turnover &gt; &#8377;100 Crore in preceding FY</td>
          <td style="padding:10px 12px;">Turnover &le; &#8377;100 Crore in preceding FY</td>
        </tr>
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:10px 12px;border-right:1px solid #e2e8f0;"><strong>PCS Certification (Form MGT-8)</strong></td>
          <td style="padding:10px 12px;border-right:1px solid #e2e8f0;"><strong>Mandatory</strong> for Listed Companies, or Paid-up &ge; &#8377;10 Cr or Turnover &ge; &#8377;50 Cr</td>
          <td style="padding:10px 12px;color:#166534;font-weight:600;"><strong>Exempt</strong> — No PCS certification or MGT-8 required</td>
        </tr>
        <tr style="border-bottom:1px solid #e2e8f0;background:#f8fafc;">
          <td style="padding:10px 12px;border-right:1px solid #e2e8f0;"><strong>Signatories on Web Form</strong></td>
          <td style="padding:10px 12px;border-right:1px solid #e2e8f0;">Director + Company Secretary (or Practicing CS if no CS in employment)</td>
          <td style="padding:10px 12px;">OPC: Solo Director alone.<br>Small Co: Director + CS (or Director alone if no CS)</td>
        </tr>
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:10px 12px;border-right:1px solid #e2e8f0;"><strong>Detailed Shareholders List</strong></td>
          <td style="padding:10px 12px;border-right:1px solid #e2e8f0;">Mandatory Excel utility upload with complete PAN, DP ID &amp; transfer dates</td>
          <td style="padding:10px 12px;">Abridged summary; Excel upload only required if transfers took place</td>
        </tr>
        <tr style="border-bottom:1px solid #e2e8f0;background:#f8fafc;">
          <td style="padding:10px 12px;border-right:1px solid #e2e8f0;"><strong>Section 446B Lesser Penalty Relief</strong></td>
          <td style="padding:10px 12px;border-right:1px solid #e2e8f0;">Normal Section 92(5) caps apply (&#8377;2 Lakhs company, &#8377;50k officer)</td>
          <td style="padding:10px 12px;color:#166534;font-weight:600;"><strong>50% Relief Applies</strong> (Cap: &#8377;1 Lakh company, &#8377;25k officer)</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
`;

  if (content.includes(diffSectionMarker)) {
    content = content.replace(diffSectionMarker, mgt7Vs7aComparison + '\n' + diffSectionMarker);
  }

  // 7. Add Mandatory Attachments Section and Instruction Kit Guide
  const v3ProcessMarker = '<h2 style="color:#1e3a5f;font-size:1.45rem;border-bottom:2px solid #e2e8f0;padding-bottom:6px;margin:36px 0 16px;">The Validations That Actually Stop Filings</h2>';
  const instructionKitAndAttachmentsGuide = `
<!-- ================= INSTRUCTION KIT & ATTACHMENTS GUIDE ================= -->
<div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;padding:22px;margin:28px 0;">
  <h3 style="color:#1e3a5f;font-size:1.25rem;margin:0 0 12px;">
    🛠 MCA V3 Instruction Kit &amp; Help Kit: Mandatory Attachments &amp; Pre-Scrutiny Errors
  </h3>
  <p style="color:#475569;font-size:0.93rem;margin:0 0 14px;line-height:1.7;">
    The official MCA V3 Instruction Kits for Form MGT-7 and MGT-7A prescribe strict file formatting, DSC associations, and mandatory document attachments:
  </p>

  <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:16px;margin:16px 0;">
    <div style="background:#ffffff;border:1px solid #e2e8f0;border-left:4px solid #2563eb;border-radius:6px;padding:16px;">
      <div style="font-weight:700;color:#1e40af;font-size:0.98rem;margin-bottom:8px;">
        📎 Mandatory Attachments Checklist: Form MGT-7
      </div>
      <ol style="padding-left:18px;margin:0;font-size:0.9rem;line-height:1.75;color:#334155;">
        <li><strong>List of Shareholders &amp; Debenture Holders:</strong> Prepared via the official MCA Excel utility (containing Member Name, Address, PAN, Folio/DP ID, and Shares Held) and converted to PDF/Excel under 2 MB.</li>
        <li><strong>Form MGT-8 Certificate by Practicing CS:</strong> Mandatory for all listed companies and unlisted companies meeting the &#8377;10 Cr capital or &#8377;50 Cr turnover threshold.</li>
        <li><strong>Copy of Approval Order for AGM Extension:</strong> Form GNL-1 approval letter if the AGM was held after 30th September.</li>
        <li><strong>Photograph of Registered Office:</strong> Clear external photograph showing the company's registered name board.</li>
        <li><strong>Optional Attachments:</strong> Detailed transfer schedule, copy of AGM notice, or explanatory note if no AGM was held.</li>
      </ol>
    </div>

    <div style="background:#ffffff;border:1px solid #e2e8f0;border-left:4px solid #059669;border-radius:6px;padding:16px;">
      <div style="font-weight:700;color:#065f46;font-size:0.98rem;margin-bottom:8px;">
        📎 Mandatory Attachments Checklist: Form MGT-7A (Small Co &amp; OPC)
      </div>
      <ol style="padding-left:18px;margin:0;font-size:0.9rem;line-height:1.75;color:#334155;">
        <li><strong>List of Share Transfers:</strong> Mandatory only if any shares or debentures were transferred during FY 2025-26.</li>
        <li><strong>Photograph of Registered Office:</strong> External building photograph displaying the registered office name board.</li>
        <li><strong>Statement of Reasons for Default:</strong> Required if no AGM was held by the small company within the statutory deadline.</li>
        <li><strong>Optional Attachments:</strong> Board resolution approving the annual return or audited financial highlights.</li>
      </ol>
    </div>
  </div>

  <div style="margin-top:16px;padding:14px;background:#fffbeb;border:1px solid #fde68a;border-radius:6px;color:#92400e;font-size:0.9rem;line-height:1.65;">
    <strong>⚡ Top 3 MCA V3 Pre-Scrutiny Errors &amp; Fixes:</strong><br>
    &bull; <em>Error "DIN status not active":</em> Check that all signatory directors have completed their annual DIR-3 KYC filing on MCA21.<br>
    &bull; <em>Error "Turnover sum mismatch":</em> Re-verify that Part II principal business activity percentages add up to exactly 100.00%.<br>
    &bull; <em>Error "Invalid AGM date":</em> If entering an AGM date after 30 September, you must select "Yes" for extension and provide the valid ROC approval SRN.
  </div>
</div>
`;

  if (content.includes(v3ProcessMarker)) {
    content = content.replace(v3ProcessMarker, instructionKitAndAttachmentsGuide + '\n' + v3ProcessMarker);
  }

  // 8. Re-format Frequently Asked Questions into <details><summary>
  // This enables automatic extraction by app/updates/[slug]/page.tsx into Google FAQPage Schema!
  const faqHeaderMarker = 'Frequently Asked Questions</h2>';
  const faqEndMarker = '<!-- ================= SOURCE NOTE ================= -->';

  const richFaqSection = `Frequently Asked Questions</h2>

<div style="margin:20px 0;display:flex;flex-direction:column;gap:12px;">

  <details style="background:#ffffff;border:1px solid #cbd5e1;border-radius:8px;padding:14px 18px;transition:all 0.2s ease;">
    <summary style="font-weight:700;color:#1e3a5f;font-size:1rem;cursor:pointer;list-style:none;display:flex;align-items:center;justify-content:space-between;">
      <span>What is the due date for filing Form MGT-7 for FY 2025-26?</span>
      <span style="color:#2563eb;font-weight:bold;margin-left:8px;">+</span>
    </summary>
    <div style="margin-top:10px;padding-top:10px;border-top:1px solid #f1f5f9;color:#334155;font-size:0.94rem;line-height:1.75;">
      Under Section 92(4) of the Companies Act, 2013, Form MGT-7 must be filed within 60 calendar days from the date of the Annual General Meeting (AGM). For companies whose financial year ended 31 March 2026 and whose AGM is held on the statutory deadline of 30 September 2026, the annual return in Form MGT-7 is due by <strong>29 November 2026</strong>. If the AGM is convened on an earlier date (e.g. 15 September), the 60-day period begins from that actual AGM date (due 14 November).
    </div>
  </details>

  <details style="background:#ffffff;border:1px solid #cbd5e1;border-radius:8px;padding:14px 18px;transition:all 0.2s ease;">
    <summary style="font-weight:700;color:#1e3a5f;font-size:1rem;cursor:pointer;list-style:none;display:flex;align-items:center;justify-content:space-between;">
      <span>What is the due date for filing Form MGT-7A for a One Person Company (OPC)?</span>
      <span style="color:#2563eb;font-weight:bold;margin-left:8px;">+</span>
    </summary>
    <div style="margin-top:10px;padding-top:10px;border-top:1px solid #f1f5f9;color:#334155;font-size:0.94rem;line-height:1.75;">
      Under Section 96(1), One Person Companies are statutorily exempt from holding an AGM. Pursuant to Rule 11 of the Companies (Management and Administration) Rules, 2014, the 60-day filing clock starts from 180 days after the financial year closure (27 September). Therefore, the statutory due date for filing Form MGT-7A for an OPC for FY 2025-26 is <strong>28 November 2026</strong>.
    </div>
  </details>

  <details style="background:#ffffff;border:1px solid #cbd5e1;border-radius:8px;padding:14px 18px;transition:all 0.2s ease;">
    <summary style="font-weight:700;color:#1e3a5f;font-size:1rem;cursor:pointer;list-style:none;display:flex;align-items:center;justify-content:space-between;">
      <span>What is the difference between Form MGT-7 and Form MGT-7A?</span>
      <span style="color:#2563eb;font-weight:bold;margin-left:8px;">+</span>
    </summary>
    <div style="margin-top:10px;padding-top:10px;border-top:1px solid #f1f5f9;color:#334155;font-size:0.94rem;line-height:1.75;">
      Form MGT-7 is the comprehensive electronic annual return filed by Public Limited companies, standard Private Limited companies, and Producer companies. Form MGT-7A is the abridged annual return filed exclusively by One Person Companies (OPCs) and Small Companies. Form MGT-7A requires fewer disclosures, allows solo director signature for OPCs, and is statutorily exempt from certification by a Practicing Company Secretary (PCS) in Form MGT-8.
    </div>
  </details>

  <details style="background:#ffffff;border:1px solid #cbd5e1;border-radius:8px;padding:14px 18px;transition:all 0.2s ease;">
    <summary style="font-weight:700;color:#1e3a5f;font-size:1rem;cursor:pointer;list-style:none;display:flex;align-items:center;justify-content:space-between;">
      <span>What are the revised Small Company limits for filing Form MGT-7A?</span>
      <span style="color:#2563eb;font-weight:bold;margin-left:8px;">+</span>
    </summary>
    <div style="margin-top:10px;padding-top:10px;border-top:1px solid #f1f5f9;color:#334155;font-size:0.94rem;line-height:1.75;">
      Under MCA Notification G.S.R. 880(E) effective 1 December 2025, a private company qualifies as a Small Company under Section 2(85) if its paid-up share capital does not exceed <strong>&#8377;10 Crore</strong> and its turnover for the immediately preceding financial year does not exceed <strong>&#8377;100 Crore</strong>. Holding companies, subsidiaries, Section 8 companies, and companies governed by special Acts cannot qualify as small companies regardless of their capital or turnover.
    </div>
  </details>

  <details style="background:#ffffff;border:1px solid #cbd5e1;border-radius:8px;padding:14px 18px;transition:all 0.2s ease;">
    <summary style="font-weight:700;color:#1e3a5f;font-size:1rem;cursor:pointer;list-style:none;display:flex;align-items:center;justify-content:space-between;">
      <span>How is the MGT-7 and MGT-7A late filing fee calculated on MCA V3?</span>
      <span style="color:#2563eb;font-weight:bold;margin-left:8px;">+</span>
    </summary>
    <div style="margin-top:10px;padding-top:10px;border-top:1px solid #f1f5f9;color:#334155;font-size:0.94rem;line-height:1.75;">
      Under Table B (Note Item 2) of the Companies (Registration Offices and Fees) Rules, 2014, any delay in filing Form MGT-7 or MGT-7A attracts an additional filing fee of <strong>flat &#8377;100 per day</strong> with no upper limit, calculated from the day following the 60-day AGM due date until the actual filing date. This fee is automatically computed on the MCA21 V3 payment challan and must be paid in addition to the normal Table A base filing fee (&#8377;200 to &#8377;600).
    </div>
  </details>

  <details style="background:#ffffff;border:1px solid #cbd5e1;border-radius:8px;padding:14px 18px;transition:all 0.2s ease;">
    <summary style="font-weight:700;color:#1e3a5f;font-size:1rem;cursor:pointer;list-style:none;display:flex;align-items:center;justify-content:space-between;">
      <span>How to fill Principal Business Activities in Form MGT-7A?</span>
      <span style="color:#2563eb;font-weight:bold;margin-left:8px;">+</span>
    </summary>
    <div style="margin-top:10px;padding-top:10px;border-top:1px solid #f1f5f9;color:#334155;font-size:0.94rem;line-height:1.75;">
      In Part II of Form MGT-7A, enter up to 4 principal business activities by selecting the 2-digit Main Activity Group and the 5-digit National Industrial Classification (NIC 2008) code. Enter the percentage of total turnover contributed by each activity. The sum of turnover percentages across all entered activities must <strong>total exactly 100.00%</strong>. If the company had zero turnover during the year, enter 1 activity corresponding to the MOA main object with 0.00% turnover.
    </div>
  </details>

  <details style="background:#ffffff;border:1px solid #cbd5e1;border-radius:8px;padding:14px 18px;transition:all 0.2s ease;">
    <summary style="font-weight:700;color:#1e3a5f;font-size:1rem;cursor:pointer;list-style:none;display:flex;align-items:center;justify-content:space-between;">
      <span>What are the mandatory attachments required for filing Form MGT-7?</span>
      <span style="color:#2563eb;font-weight:bold;margin-left:8px;">+</span>
    </summary>
    <div style="margin-top:10px;padding-top:10px;border-top:1px solid #f1f5f9;color:#334155;font-size:0.94rem;line-height:1.75;">
      Mandatory attachments for Form MGT-7 on MCA V3 include: (1) List of Shareholders and Debenture holders prepared via the official MCA Excel utility under 2 MB, (2) Photograph of the company registered office building displaying the name board, (3) Copy of ROC approval letter in Form GNL-1 if an AGM extension was granted, and (4) Form MGT-8 certificate issued by a Practicing Company Secretary if the company is listed or meets the &#8377;10 Cr capital / &#8377;50 Cr turnover thresholds.
    </div>
  </details>

  <details style="background:#ffffff;border:1px solid #cbd5e1;border-radius:8px;padding:14px 18px;transition:all 0.2s ease;">
    <summary style="font-weight:700;color:#1e3a5f;font-size:1rem;cursor:pointer;list-style:none;display:flex;align-items:center;justify-content:space-between;">
      <span>Is Company Secretary (CS) signature or Form MGT-8 required for Form MGT-7A?</span>
      <span style="color:#2563eb;font-weight:bold;margin-left:8px;">+</span>
    </summary>
    <div style="margin-top:10px;padding-top:10px;border-top:1px solid #f1f5f9;color:#334155;font-size:0.94rem;line-height:1.75;">
      No. Under Section 92(1) proviso, Form MGT-7A filed by Small Companies and One Person Companies is statutorily exempt from certification by a Company Secretary in Practice (Form MGT-8 is not required). An OPC is signed by the solo Director alone. A Small Company is signed by a Director and the Company Secretary, or by two Directors (or single Director if sole board member) if no CS is appointed in employment.
    </div>
  </details>

  <details style="background:#ffffff;border:1px solid #cbd5e1;border-radius:8px;padding:14px 18px;transition:all 0.2s ease;">
    <summary style="font-weight:700;color:#1e3a5f;font-size:1rem;cursor:pointer;list-style:none;display:flex;align-items:center;justify-content:space-between;">
      <span>What is the class of security held in Form MGT-7A?</span>
      <span style="color:#2563eb;font-weight:bold;margin-left:8px;">+</span>
    </summary>
    <div style="margin-top:10px;padding-top:10px;border-top:1px solid #f1f5f9;color:#334155;font-size:0.94rem;line-height:1.75;">
      In Part IV of Form MGT-7A, filers must report each class of security issued by the company: Equity shares with voting rights, Equity shares with differential voting rights (DVR), Preference shares (redeemable/convertible), and Debentures. Report the nominal face value per share, total Authorized Capital, Issued Capital, Subscribed Capital, and Paid-up Capital, reconciling with Part VII shareholding details.
    </div>
  </details>

  <details style="background:#ffffff;border:1px solid #cbd5e1;border-radius:8px;padding:14px 18px;transition:all 0.2s ease;">
    <summary style="font-weight:700;color:#1e3a5f;font-size:1rem;cursor:pointer;list-style:none;display:flex;align-items:center;justify-content:space-between;">
      <span>What happens if a company does not hold an AGM for FY 2025-26?</span>
      <span style="color:#2563eb;font-weight:bold;margin-left:8px;">+</span>
    </summary>
    <div style="margin-top:10px;padding-top:10px;border-top:1px solid #f1f5f9;color:#334155;font-size:0.94rem;line-height:1.75;">
      Under Section 92(4) proviso, failing to hold an AGM does not postpone or extend the annual return deadline. The return must still be filed within 60 days from the date on which the AGM ought to have been held (29 November 2026), accompanied by a statement specifying the reasons for not holding the AGM. Additionally, defaulting in convening the AGM attracts a separate adjudicable fine under Section 99 up to &#8377;1,00,000 plus &#8377;5,000 per day.
    </div>
  </details>

</div>
`;

  if (content.includes(faqHeaderMarker) && content.includes(faqEndMarker)) {
    const faqStart = content.indexOf(faqHeaderMarker);
    const faqEnd = content.indexOf(faqEndMarker);
    content = content.slice(0, faqStart) + richFaqSection + '\n' + content.slice(faqEnd);
  }

  // 9. Update Database Record
  const newTitle = 'MGT-7 & MGT-7A Due Date FY 2025-26: Filing Deadline (29 Nov), Form Rules, Fees & MCA V3 Help Kit';
  const newSeoTitle = 'MGT 7 & MGT 7A Due Date FY 2025-26: Filing Deadline (29 Nov) & Fees';
  const newSeoDesc = 'What is the MGT-7 & MGT-7A due date for FY 2025-26? File within 60 days of AGM (29 Nov 2026 for 30 Sept AGM; 28 Nov for OPC). Check applicability, ₹100/day fees, MCA V3 help kit & attachments.';
  const newSummary = 'Comprehensive statutory guide to Form MGT-7 & MGT-7A annual returns for FY 2025-26. Covers statutory due dates (29 Nov 2026; 28 Nov for OPC), Small Company thresholds (G.S.R. 880(E)), principal business activities, class of securities, ₹100/day late fees, mandatory attachments, and MCA V3 help kit error fixes.';
  const newTags = [
    'MGT-7',
    'MGT-7A',
    'mgt 7 due date',
    'mgt 7a due date',
    'opc mgt 7a due date',
    'mgt 7a form',
    'Annual Return',
    'MCA V3',
    'Companies Act 2013',
    'Small Company',
    'Section 92',
    'ROC Filing',
    'AGM 2026',
    'mgt 7 fees',
    'mgt 7 instruction kit',
    'mgt 7 attachments list',
    'Corporate Compliance'
  ];

  const { error: updateError } = await supabase
    .from('updates')
    .update({
      title: newTitle,
      seo_title: newSeoTitle,
      seo_description: newSeoDesc,
      summary: newSummary,
      tags: newTags,
      content: content,
      updated_at: new Date().toISOString()
    })
    .eq('slug', 'form-mgt-7-mgt-7a-annual-return-guide-2026');

  if (updateError) {
    console.error('Update failed:', updateError);
    process.exit(1);
  }

  console.log('Successfully updated article form-mgt-7-mgt-7a-annual-return-guide-2026!');
  console.log('New content length:', content.length);
}

updateArticle();
