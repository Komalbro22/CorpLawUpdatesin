const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  const wageCeilingArticleId = '536f6522-2343-4fd9-8eed-8dec76cc129e';
  const { data: article, error: fetchErr } = await supabase
    .from('updates')
    .select('content')
    .eq('id', wageCeilingArticleId)
    .single();

  if (fetchErr || !article) {
    console.error('Fetch error:', fetchErr);
    process.exit(1);
  }

  const targetStr = 'portal technical updates.\n  </div>\n</div>';
  if (!article.content.includes(targetStr)) {
    console.error('Target string not found');
    process.exit(1);
  }

  const callout = `
<!-- ================= DEADLINE EXTENSION CALLOUT ================= -->
<div style="background:#fffbeb;border:1px solid #fde68a;border-left:5px solid #d97706;border-radius:8px;padding:18px 22px;margin:24px 0;box-shadow:0 1px 3px rgba(0,0,0,0.04);">
  <div style="font-weight:700;color:#b45309;font-size:0.95rem;text-transform:uppercase;letter-spacing:0.04em;margin-bottom:6px;display:flex;align-items:center;gap:8px;">
    <span>⚡</span> September 2026 ECR Filing &amp; PF Due Date Extended to 31 October 2026
  </div>
  <div style="color:#1e293b;font-size:0.97rem;line-height:1.7;">
    To accommodate employer payroll software recalibration for the split-wage calculation (1–16 Sept @ ₹15,000 and 17–30 Sept @ ₹25,000), EPFO issued <strong>Circular No. e-704368 (dated 13 October 2026)</strong> officially extending the September 2026 ECR filing and contribution deposit deadline to <strong>31 October 2026</strong>. Penal damages under Section 14B and penal interest under Section 7Q are completely waived for all deposits made on or before 31 October.
    <div style="margin-top:10px;">
      👉 <a href="/updates/epfo-september-2026-ecr-deadline-extended-31-october-2026" style="color:#1a2a5e;font-weight:700;text-decoration:underline;">Read EPFO Circular e-704368: Full Extension Analysis, Split-Month Payroll Math &amp; Employer FAQs &rarr;</a>
    </div>
  </div>
</div>`;

  const newContent = article.content.replace(targetStr, targetStr + callout);

  const { error: updateErr } = await supabase
    .from('updates')
    .update({
      content: newContent,
      updated_at: new Date().toISOString()
    })
    .eq('id', wageCeilingArticleId);

  if (updateErr) {
    console.error('Update failed:', updateErr);
    process.exit(1);
  }

  console.log('Successfully updated wage ceiling article with internal link callout!');
}

run();
