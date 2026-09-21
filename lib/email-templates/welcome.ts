interface Article {
  title: string
  slug: string
  summary: string
  category: string
  published_at: string
}

interface WelcomeEmailProps {
  email: string
  unsubscribeToken: string
  recentArticles: Article[]
}

const categoryColors: Record<string, { bg: string; text: string; lightBg: string }> = {
  mca: { bg: '#2563EB', text: '#FFFFFF', lightBg: '#EFF6FF' },
  sebi: { bg: '#059669', text: '#FFFFFF', lightBg: '#ECFDF5' },
  rbi: { bg: '#7C3AED', text: '#FFFFFF', lightBg: '#F5F3FF' },
  nclt: { bg: '#EA580C', text: '#FFFFFF', lightBg: '#FFF7ED' },
  ibc: { bg: '#DC2626', text: '#FFFFFF', lightBg: '#FEF2F2' },
  fema: { bg: '#0D9488', text: '#FFFFFF', lightBg: '#F0FDFA' },
  cci: { bg: '#4F46E5', text: '#FFFFFF', lightBg: '#EEF2FF' },
  labour: { bg: '#D97706', text: '#FFFFFF', lightBg: '#FFFBEB' },
  ifsca: { bg: '#0891B2', text: '#FFFFFF', lightBg: '#ECFEFF' },
  income_tax: { bg: '#D97706', text: '#FFFFFF', lightBg: '#FFFBEB' },
}

const categoryLabels: Record<string, string> = {
  mca: 'MCA',
  sebi: 'SEBI',
  rbi: 'RBI',
  nclt: 'NCLT',
  ibc: 'IBC',
  fema: 'FEMA',
  cci: 'CCI',
  labour: 'Labour Law',
  ifsca: 'IFSCA (GIFT City)',
  income_tax: 'Income Tax',
}

export function generateWelcomeEmail({
  email,
  unsubscribeToken,
  recentArticles,
}: WelcomeEmailProps): string {
  const BASE_URL = 'https://www.corplawupdates.in'
  const unsubscribeUrl = 
    `${BASE_URL}/api/unsubscribe?email=${encodeURIComponent(email)}&token=${unsubscribeToken}`

  const articlesHtml = recentArticles && recentArticles.length > 0
    ? recentArticles.slice(0, 4).map((article, index) => {
        const catKey = (article.category || 'mca').toLowerCase()
        const color = categoryColors[catKey] || { bg: '#475569', text: '#FFFFFF', lightBg: '#F8FAFC' }
        const label = categoryLabels[catKey] || (article.category || 'REGULATORY').toUpperCase()
        const articleUrl = `${BASE_URL}/updates/${article.slug}`
        const dateStr = article.published_at 
          ? new Date(article.published_at).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
          : 'Recent Update'

        let cleanSummary = (article.summary || '').replace(/<[^>]*>/g, '').trim()
        if (cleanSummary.length > 140) {
          cleanSummary = cleanSummary.slice(0, 137) + '...'
        }

        return `
          <tr>
            <td style="padding:${index === 0 ? '0' : '14px'} 0 0 0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FFFFFF;border-radius:10px;border:1px solid #CBD5E1;border-left:4px solid ${color.bg};overflow:hidden;border-collapse:collapse;">
                <tr>
                  <td style="padding:16px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:8px;border-collapse:collapse;">
                      <tr>
                        <td>
                          <span style="background:${color.lightBg};color:${color.bg};border:1px solid ${color.bg}30;font-size:10px;font-weight:800;padding:2px 8px;border-radius:4px;letter-spacing:0.5px;text-transform:uppercase;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                            ${label}
                          </span>
                        </td>
                        <td align="right" style="font-size:11px;color:#94A3B8;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                          ${dateStr}
                        </td>
                      </tr>
                    </table>
                    <h3 style="margin:0 0 8px 0;font-family:Georgia,'Times New Roman',serif;font-size:16px;font-weight:700;color:#0F172A;line-height:1.4;">
                      <a href="${articleUrl}" style="color:#0F172A;text-decoration:none;">
                        ${article.title}
                      </a>
                    </h3>
                    ${cleanSummary ? `
                      <p style="margin:0 0 12px 0;font-size:13px;color:#475569;line-height:1.5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                        ${cleanSummary}
                      </p>
                    ` : ''}
                    <div style="text-align:right;">
                      <a href="${articleUrl}" style="font-size:12px;color:#0284C7;font-weight:700;text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                        Read Analysis & Circular →
                      </a>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        `
      }).join('')
    : ''

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Welcome to CorpLawUpdates.in</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td, h1, h2, h3, p, a, span { font-family: Arial, sans-serif !important; }
  </style>
  <![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#0B132B;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">

  <!-- Hidden Preheader -->
  <span style="display:none;font-size:0;line-height:0;max-height:0;mso-hide:all;opacity:0;overflow:hidden;">
    Welcome to CorpLawUpdates.in! Your executive regulatory digest is now active for ${email}.
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </span>

  <!-- Outer Canvas -->
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0B132B;border-collapse:collapse;">
    <tr>
      <td align="center" style="padding:28px 12px 40px;">

        <!-- Main Wrapper Card -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#FFFFFF;border-radius:14px;overflow:hidden;box-shadow:0 20px 40px rgba(0,0,0,0.3);border-collapse:collapse;">

          <!-- ── EXECUTIVE HEADER ── -->
          <tr>
            <td style="background:#0B132B;padding:36px 32px 30px;border-bottom:3px solid #D4AF37;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                <tr>
                  <td>
                    <!-- Brand Name -->
                    <span style="font-family:Georgia,'Times New Roman',Times,serif;font-size:24px;font-weight:700;color:#FFFFFF;letter-spacing:-0.5px;text-decoration:none;">
                      CorpLawUpdates<span style="color:#D4AF37;">.in</span>
                    </span>
                    <div style="font-size:10px;font-weight:700;color:#94A3B8;letter-spacing:1.8px;text-transform:uppercase;margin-top:3px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                      CORPORATE LAW INTELLIGENCE
                    </div>
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    <span style="border:1px solid #D4AF37;background:rgba(212,175,55,0.12);color:#D4AF37;font-size:10px;font-weight:800;letter-spacing:1px;padding:4px 10px;border-radius:4px;text-transform:uppercase;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;white-space:nowrap;">
                      ✦ MEMBER INDUCTION
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Headline Banner -->
              <div style="margin-top:28px;">
                <h1 style="margin:0 0 12px 0;font-family:Georgia,'Times New Roman',Times,serif;font-size:26px;font-weight:700;color:#FFFFFF;line-height:1.3;">
                  Welcome to India's Premier Corporate Law Intelligence Platform
                </h1>
                <p style="margin:0;font-size:14px;color:#CBD5E1;line-height:1.6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                  Your subscription is verified and active for <strong style="color:#FFFFFF;">${email}</strong>. Every Monday morning, our editorial desk delivers actionable, practitioner-grade regulatory analysis straight to your inbox.
                </p>
              </div>

              <!-- Regulator Coverage Pills -->
              <table cellpadding="0" cellspacing="4" border="0" style="margin-top:20px;border-collapse:collapse;">
                <tr>
                  ${[
                    'MCA & ROC',
                    'SEBI LODR',
                    'RBI & FEMA',
                    'NCLT & IBC',
                    'LABOUR & EPF'
                  ].map(pill => `
                    <td style="padding-right:6px;">
                      <span style="background:rgba(255,255,255,0.08);color:#E2E8F0;border:1px solid rgba(255,255,255,0.15);font-size:10px;font-weight:700;padding:3px 9px;border-radius:4px;display:inline-block;white-space:nowrap;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                        ${pill}
                      </span>
                    </td>
                  `).join('')}
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── WHAT YOU RECEIVE (3 CORE PILLARS) ── -->
          <tr>
            <td style="padding:28px 32px 20px;background:#FFFDF5;border-bottom:1px solid #FEF3C7;">
              <div style="color:#92400E;font-size:11px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;margin-bottom:8px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                ⚡ WHAT TO EXPECT EVERY MONDAY MORNING
              </div>
              <h2 style="margin:0 0 16px 0;font-family:Georgia,serif;font-size:18px;font-weight:700;color:#0F172A;line-height:1.3;">
                Curated for CS, CA, Legal Counsel & Compliance Officers
              </h2>

              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                <tr>
                  <td style="padding:8px 0;vertical-align:top;width:24px;font-size:16px;color:#D4AF37;">▸</td>
                  <td style="padding:8px 0;font-size:13px;color:#334155;line-height:1.5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                    <strong style="color:#0F172A;">The 60-Second Executive Memo:</strong> High-impact, board-level bullet takeaways summarizing every major circular without legal fluff.
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;vertical-align:top;width:24px;font-size:16px;color:#D4AF37;">▸</td>
                  <td style="padding:8px 0;font-size:13px;color:#334155;line-height:1.5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                    <strong style="color:#0F172A;">"Why It Matters for Practice":</strong> Specific governance obligations, corporate action items, and procedural checklists for company boards and advisory teams.
                  </td>
                </tr>
                <tr>
                  <td style="padding:8px 0;vertical-align:top;width:24px;font-size:16px;color:#D4AF37;">▸</td>
                  <td style="padding:8px 0;font-size:13px;color:#334155;line-height:1.5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                    <strong style="color:#0F172A;">Statutory Deadlines Ahead:</strong> Clear chronological reminders for upcoming ROC filings, GST returns, and SEBI compliance before late fees apply.
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── DAY 1 PRACTITIONER TOOL DECK ── -->
          <tr>
            <td style="padding:28px 32px;background:#F8FAFC;border-bottom:1px solid #E2E8F0;">
              <div style="color:#64748B;font-size:11px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;margin-bottom:6px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                🛠️ DAY-ONE ESSENTIAL TOOL DECK
              </div>
              <h2 style="margin:0 0 16px 0;font-family:Georgia,serif;font-size:18px;font-weight:700;color:#0F172A;">
                Instant Compliance Tools for Your Practice
              </h2>

              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                <!-- Tool 1 -->
                <tr>
                  <td style="padding:10px 14px;background:#FFFFFF;border:1px solid #E2E8F0;border-radius:8px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                      <tr>
                        <td>
                          <div style="font-size:14px;font-weight:700;color:#0F172A;font-family:Georgia,serif;">
                            🧮 MCA Late Filing Fee & Delay Penalty Calculator
                          </div>
                          <div style="font-size:12px;color:#64748B;margin-top:2px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                            Calculate statutory late filing fees under Section 403 instantly for Form AOC-4, MGT-7, and LLP Form 11.
                          </div>
                        </td>
                        <td align="right" style="padding-left:12px;white-space:nowrap;">
                          <a href="${BASE_URL}/tools/fee-calculator" style="display:inline-block;background:#0B132B;color:#FFFFFF;font-size:11px;font-weight:700;padding:6px 12px;border-radius:6px;text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                            Launch Tool →
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Spacer -->
                <tr><td height="10" style="line-height:10px;font-size:10px;">&nbsp;</td></tr>

                <!-- Tool 2 -->
                <tr>
                  <td style="padding:10px 14px;background:#FFFFFF;border:1px solid #E2E8F0;border-radius:8px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                      <tr>
                        <td>
                          <div style="font-size:14px;font-weight:700;color:#0F172A;font-family:Georgia,serif;">
                            📅 2026 Interactive Statutory Compliance Calendar
                          </div>
                          <div style="font-size:12px;color:#64748B;margin-top:2px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                            Search 40+ statutory due dates across MCA, SEBI, GST, Income Tax, and Labour Laws with 1-click Google Calendar sync.
                          </div>
                        </td>
                        <td align="right" style="padding-left:12px;white-space:nowrap;">
                          <a href="${BASE_URL}/calendar" style="display:inline-block;background:#0B132B;color:#FFFFFF;font-size:11px;font-weight:700;padding:6px 12px;border-radius:6px;text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                            Open Calendar →
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Spacer -->
                <tr><td height="10" style="line-height:10px;font-size:10px;">&nbsp;</td></tr>

                <!-- Tool 3 -->
                <tr>
                  <td style="padding:10px 14px;background:#FFFFFF;border:1px solid #E2E8F0;border-radius:8px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                      <tr>
                        <td>
                          <div style="font-size:14px;font-weight:700;color:#0F172A;font-family:Georgia,serif;">
                            📄 Corporate Legal Document & Resolution Generator
                          </div>
                          <div style="font-size:12px;color:#64748B;margin-top:2px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                            Draft customized board resolutions, bank loan authorizations, registered office shifts, and partnership deeds with live PDF export.
                          </div>
                        </td>
                        <td align="right" style="padding-left:12px;white-space:nowrap;">
                          <a href="${BASE_URL}/documents" style="display:inline-block;background:#0B132B;color:#FFFFFF;font-size:11px;font-weight:700;padding:6px 12px;border-radius:6px;text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                            Browse Templates →
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${articlesHtml ? `
            <!-- ── RECENT INTELLIGENCE BRIEFINGS ── -->
            <tr>
              <td style="padding:28px 32px;background:#FFFFFF;border-bottom:1px solid #E2E8F0;">
                <div style="color:#64748B;font-size:11px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;margin-bottom:6px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                  📋 RECENT INTELLIGENCE BRIEFINGS
                </div>
                <h2 style="margin:0 0 16px 0;font-family:Georgia,serif;font-size:18px;font-weight:700;color:#0F172A;">
                  Top Regulatory Updates Right Now
                </h2>

                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                  ${articlesHtml}
                </table>

                <div style="text-align:center;margin-top:20px;">
                  <a href="${BASE_URL}/updates" style="display:inline-block;background:#0B132B;color:#FFFFFF;font-size:13px;font-weight:700;padding:11px 24px;border-radius:8px;text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                    View All 180+ Published Updates →
                  </a>
                </div>
              </td>
            </tr>
          ` : ''}

          <!-- ── MOBILE BROADCAST CHANNELS ── -->
          <tr>
            <td style="padding:24px 32px;background:#F0FDF4;border-bottom:1px solid #BBF7D0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                <tr>
                  <td>
                    <div style="font-size:10px;font-weight:800;color:#166534;letter-spacing:1px;text-transform:uppercase;margin-bottom:3px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                      ⚡ REAL-TIME BREAKING NOTIFICATIONS
                    </div>
                    <div style="font-size:15px;font-weight:700;color:#14532D;font-family:Georgia,serif;margin-bottom:4px;">
                      Prefer instant alerts on your smartphone?
                    </div>
                    <p style="margin:0;font-size:12px;color:#15803D;line-height:1.5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                      Join 2,000+ corporate compliance practitioners in our verified WhatsApp and Telegram channels for instant circular alerts as they break.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top:14px;">
                    <table cellpadding="0" cellspacing="8" border="0" style="border-collapse:collapse;">
                      <tr>
                        <td>
                          <a href="https://whatsapp.com/channel/0029VbCfcUEEgGfGLWOTvV1A" style="display:inline-block;background:#25D366;color:#FFFFFF;font-size:12px;font-weight:700;padding:8px 16px;border-radius:6px;text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                            💬 Join WhatsApp Channel
                          </a>
                        </td>
                        <td>
                          <a href="https://t.me/corplawupdate" style="display:inline-block;background:#229ED9;color:#FFFFFF;font-size:12px;font-weight:700;padding:8px 16px;border-radius:6px;text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                            ✈️ Join Telegram Channel
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── EDITORIAL SIGN-OFF & SOCIAL ── -->
          <tr>
            <td style="padding:28px 32px 24px;background:#FFFFFF;border-bottom:1px solid #E2E8F0;">
              <p style="margin:0 0 4px 0;font-size:13px;color:#64748B;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                To high standards of corporate governance,
              </p>
              <p style="margin:0 0 20px 0;font-family:Georgia,serif;font-size:15px;font-weight:700;color:#0F172A;">
                The Editorial Board · CorpLawUpdates.in
              </p>

              <div style="font-size:10px;font-weight:800;color:#94A3B8;letter-spacing:1.2px;text-transform:uppercase;margin-bottom:10px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                CONNECT WITH US
              </div>
              <table cellpadding="0" cellspacing="6" border="0" style="border-collapse:collapse;">
                <tr>
                  <td>
                    <a href="https://linkedin.com/company/corplawupdates" style="display:inline-block;background:#0A66C2;color:#FFFFFF;font-size:11px;font-weight:700;padding:5px 12px;border-radius:4px;text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                      LinkedIn
                    </a>
                  </td>
                  <td>
                    <a href="https://twitter.com/corplawupdates" style="display:inline-block;background:#0F172A;color:#FFFFFF;font-size:11px;font-weight:700;padding:5px 12px;border-radius:4px;text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                      Twitter / X
                    </a>
                  </td>
                  <td>
                    <a href="${BASE_URL}/api/feed.xml" style="display:inline-block;background:#F97316;color:#FFFFFF;font-size:11px;font-weight:700;padding:5px 12px;border-radius:4px;text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
                      RSS Feed
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── REFINED FOOTER ── -->
          <tr>
            <td style="background:#0B132B;padding:28px 32px;text-align:center;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
              <p style="margin:0 0 8px 0;font-size:12px;color:#94A3B8;">
                You are receiving this induction briefing because you subscribed at <a href="${BASE_URL}" style="color:#D4AF37;text-decoration:none;font-weight:600;">corplawupdates.in</a>.
              </p>
              <p style="margin:0 0 14px 0;font-size:11px;color:#64748B;line-height:1.5;">
                India's Free Corporate Law Intelligence Platform · MCA · SEBI · RBI · NCLT · IBC · FEMA
              </p>
              <a href="${unsubscribeUrl}" style="font-size:11px;color:#94A3B8;text-decoration:underline;">
                Unsubscribe or Update Subscription Preferences
              </a>
              <p style="margin:14px 0 0 0;font-size:10px;color:#475569;line-height:1.5;">
                Disclaimer: The editorial content provided is for informational and educational purposes only and does not constitute formal legal advice.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
`
}
