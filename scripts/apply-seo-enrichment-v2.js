const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function applyUpdates() {
  console.log('--- Applying updates to Supabase ---');

  // 1. EPFO ECR Deadline Article
  const { data: epfoCurrent, error: epfoFetchErr } = await supabase
    .from('updates')
    .select('id, content, seo_description')
    .eq('slug', 'epfo-september-2026-ecr-deadline-extended-31-october-2026')
    .single();

  if (epfoFetchErr || !epfoCurrent) {
    console.error('Failed to fetch EPFO record:', epfoFetchErr);
    process.exit(1);
  }

  const newEpfoMeta = 'EPFO circular dated 13 Oct 2026 extends September 2026 ECR filing & PF contribution deposit (PF due date) to 31 October 2026. Get official PDF, wage ceiling rules & FAQs. सितंबर ECR अब 31 अक्टूबर तक।';

  const epfoSection = `
  <!-- ================= PF DUE DATE FOR SEPTEMBER 2026 ================= -->
  <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px 24px; margin: 0 0 26px 0;">
    <h2 style="font-size: 20px; font-weight: 700; color: #0b1f3a; margin-top: 0; margin-bottom: 12px;">PF due date for September 2026</h2>
    <p style="margin: 0 0 12px 0; font-size: 15px; color: #334155; line-height: 1.7;">
      The statutory PF due date for September 2026 has been officially extended to <strong>31 October 2026</strong>. All employers and establishments registered under the EPF &amp; MP Act, 1952 can now file their monthly Electronic Challan-cum-Return (ECR) and deposit both employer and employee provident fund contributions without attracting interest under Section 7Q or damages under Section 14B up to 31 October 2026.
    </p>
    <p style="margin: 0; font-size: 15px; color: #0b1f3a; line-height: 1.7; background: #f8fafc; border-left: 4px solid #c9a84c; padding: 12px 16px; border-radius: 4px; font-weight: 500;">
      सितंबर 2026 का ECR और PF योगदान जमा करने की अंतिम तिथि 31 अक्टूबर 2026 तक बढ़ा दी गई है।
    </p>
  </div>
`;

  let updatedEpfoContent = epfoCurrent.content;
  if (!updatedEpfoContent.includes('<h2>PF due date for September 2026</h2>')) {
    const target = '<!-- ================= QUICK STATUTORY DUE DATE COMPARISON TABLE ================= -->';
    if (updatedEpfoContent.includes(target)) {
      updatedEpfoContent = updatedEpfoContent.replace(target, epfoSection + '\n  ' + target);
    } else {
      console.error('Could not find target in EPFO content');
      process.exit(1);
    }
  }

  const { error: epfoErr } = await supabase
    .from('updates')
    .update({
      seo_description: newEpfoMeta,
      content: updatedEpfoContent
    })
    .eq('id', epfoCurrent.id);

  if (epfoErr) {
    console.error('EPFO update error:', epfoErr);
    process.exit(1);
  }
  console.log('EPFO update: SUCCESS');

  // 2. MCA21 Glossary Page
  const { data: mca21Current, error: mca21FetchErr } = await supabase
    .from('glossary')
    .select('id, extended_note')
    .eq('slug', 'mca21')
    .single();

  if (mca21FetchErr || !mca21Current) {
    console.error('Failed to fetch MCA21 record:', mca21FetchErr);
    process.exit(1);
  }

  const mca21LoginSection = `
<!-- ═══════════════════════════════════════════════ -->
<!-- HOW TO LOGIN TO MCA21 V3 PORTAL -->
<!-- ═══════════════════════════════════════════════ -->

<h2>How to login to MCA21 V3 portal (step-by-step)</h2>

<div class="steps">

  <div class="step">
    <div class="step-n">1</div>
    <div class="step-b">
      <span class="step-tag">Step 1 — Official Website</span>
      <h5>Go to www.mca.gov.in</h5>
      <p>Visit the official Ministry of Corporate Affairs portal at <strong><a href="https://www.mca.gov.in" target="_blank" rel="noopener noreferrer">www.mca.gov.in</a></strong> on a desktop browser (Chrome or Edge recommended).</p>
    </div>
  </div>

  <div class="step">
    <div class="step-n">2</div>
    <div class="step-b">
      <span class="step-tag">Step 2 — Access Login</span>
      <h5>Click on "Sign In / Sign Up"</h5>
      <p>Click the <strong>"Sign In / Sign Up"</strong> button in the top navigation bar to open the MCA21 V3 authentication page.</p>
    </div>
  </div>

  <div class="step">
    <div class="step-n">3</div>
    <div class="step-b">
      <span class="step-tag">Step 3 — Credentials</span>
      <h5>Enter User ID &amp; Password</h5>
      <p>Select your user category (Registered User or Business User). Enter your registered <strong>User ID</strong> and <strong>Password</strong>, then enter the CAPTCHA characters shown.</p>
    </div>
  </div>

  <div class="step">
    <div class="step-n">4</div>
    <div class="step-b">
      <span class="step-tag">Step 4 — OTP Authentication</span>
      <h5>Enter OTP to Access Portal</h5>
      <p>Enter the One-Time Password (OTP) received on your registered mobile number and email ID. Click <strong>"Login"</strong> to securely enter the MCA21 V3 portal dashboard.</p>
    </div>
  </div>

</div>
`;

  let updatedMca21Note = mca21Current.extended_note;
  if (!updatedMca21Note.includes('How to login to MCA21 V3 portal')) {
    const targetH2 = '<h2>Associate DSC on MCA21 Before Filing</h2>';
    if (updatedMca21Note.includes(targetH2)) {
      updatedMca21Note = updatedMca21Note.replace(targetH2, mca21LoginSection + '\n' + targetH2);
    } else {
      console.error('Could not find target in MCA21 extended_note');
      process.exit(1);
    }
  }

  const { error: mca21Err } = await supabase
    .from('glossary')
    .update({ extended_note: updatedMca21Note })
    .eq('id', mca21Current.id);

  if (mca21Err) {
    console.error('MCA21 update error:', mca21Err);
    process.exit(1);
  }
  console.log('MCA21 update: SUCCESS');

  // 3. REC-PFC Merger Article
  const newRecTitle = 'RBI Grants No Objection Certificate for REC Limited–PFC Merger: What the 15 October Clearance Means';
  const newRecSeoTitle = 'RBI Clears REC Limited–PFC Merger: NoC Issued, Shareholder & NCLT Nod Pending';
  const { error: recErr } = await supabase
    .from('updates')
    .update({
      title: newRecTitle,
      seo_title: newRecSeoTitle
    })
    .eq('slug', 'rbi-noc-rec-pfc-merger-october-2026');

  if (recErr) {
    console.error('REC update error:', recErr);
    process.exit(1);
  }
  console.log('REC-PFC update: SUCCESS');

  // 4. IDBI Bank Fairfax Strategic Sale Article
  const newIdbiTitle = 'Government Approves Strategic Sale of IDBI Bank to Fairfax (CCEA): 60.72% Stake for ₹52,878 Crore';
  const newIdbiSeoTitle = 'Government Approves Strategic Sale of IDBI Bank to Fairfax (CCEA): 60.72% Stake for ₹52,878 Crore';
  const { error: idbiErr } = await supabase
    .from('updates')
    .update({
      title: newIdbiTitle,
      seo_title: newIdbiSeoTitle
    })
    .eq('slug', 'idbi-bank-fairfax-strategic-sale-ccea-approval-2026');

  if (idbiErr) {
    console.error('IDBI update error:', idbiErr);
    process.exit(1);
  }
  console.log('IDBI update: SUCCESS');

  // 5. MCA Annual Filing FY 2025-26 Article
  const newMcaMeta = 'MCA has not extended FY 2025-26 annual filing deadlines — latest news. AOC-4 and MGT-7 due dates, ADT-1, Rs 100/day penalty, and what ICSI asked for.';
  const { error: mcaErr } = await supabase
    .from('updates')
    .update({
      seo_description: newMcaMeta
    })
    .eq('slug', 'mca-annual-filing-no-extension-fy-2025-26');

  if (mcaErr) {
    console.error('MCA Annual Filing update error:', mcaErr);
    process.exit(1);
  }
  console.log('MCA Annual Filing update: SUCCESS');

  console.log('--- All 5 updates applied successfully ---');
}

applyUpdates().catch((err) => {
  console.error('Unhandled script error:', err);
  process.exit(1);
});
