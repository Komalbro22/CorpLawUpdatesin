interface Article {
  title: string
  slug: string
  summary: string
  category: string
  published_at: string
}

interface WelcomeEmailProps {
  unsubscribeToken: string
  recentArticles: Article[]
}

const categoryColors: Record<string, string> = {
  mca: '#3B82F6',
  sebi: '#10B981',
  rbi: '#8B5CF6',
  nclt: '#F97316',
  ibc: '#EF4444',
  fema: '#14B8A6',
  income_tax: '#F59E0B',
}

const categoryLabels: Record<string, string> = {
  mca: 'MCA',
  sebi: 'SEBI',
  rbi: 'RBI',
  nclt: 'NCLT',
  ibc: 'IBC',
  fema: 'FEMA',
  income_tax: 'Income Tax',
}

export function generateWelcomeEmail({
  unsubscribeToken,
  recentArticles,
}: WelcomeEmailProps): string {
  const BASE_URL = 'https://www.corplawupdates.in'
  const unsubscribeUrl = 
    `${BASE_URL}/unsubscribe?token=${unsubscribeToken}`

  const articlesHtml = recentArticles
    .slice(0, 5)
    .map((article, index) => {
      const color = categoryColors[
        article.category.toLowerCase()
      ] || '#6B7280'
      const label = categoryLabels[
        article.category.toLowerCase()
      ] || article.category.toUpperCase()
      const articleUrl = 
        `${BASE_URL}/updates/${article.slug}`
      const date = new Date(article.published_at)
        .toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })

      return `
        <tr>
          <td style="padding: ${index === 0 ? '0' : '20px'} 0 0 0;">
            <table width="100%" cellpadding="0" 
                   cellspacing="0" border="0"
                   style="background:#ffffff;
                          border-radius:12px;
                          border:1px solid #E2E8F0;
                          overflow:hidden;">
              <tr>
                <td style="padding:20px 24px;">
                  
                  <!-- Category badge -->
                  <div style="margin-bottom:10px;">
                    <span style="background:${color}20;
                                 color:${color};
                                 font-size:11px;
                                 font-weight:700;
                                 padding:3px 10px;
                                 border-radius:20px;
                                 text-transform:uppercase;
                                 letter-spacing:0.5px;">
                      ${label}
                    </span>
                  </div>

                  <!-- Title -->
                  <h3 style="margin:0 0 8px 0;
                             font-family:Georgia,serif;
                             font-size:17px;
                             font-weight:700;
                             color:#0F172A;
                             line-height:1.4;">
                    <a href="${articleUrl}"
                       style="color:#0F172A;
                              text-decoration:none;">
                      ${article.title}
                    </a>
                  </h3>

                  <!-- Summary -->
                  <p style="margin:0 0 14px 0;
                            font-size:14px;
                            color:#475569;
                            line-height:1.6;">
                    ${article.summary.length > 150 
                      ? article.summary.slice(0, 147) + '...'
                      : article.summary}
                  </p>

                  <!-- Date + Read more -->
                  <table width="100%" cellpadding="0"
                         cellspacing="0" border="0">
                    <tr>
                      <td style="font-size:12px;
                                 color:#94A3B8;">
                        ${date}
                      </td>
                      <td align="right">
                        <a href="${articleUrl}"
                           style="font-size:13px;
                                  color:#F59E0B;
                                  font-weight:600;
                                  text-decoration:none;">
                          Read full article →
                        </a>
                      </td>
                    </tr>
                  </table>

                </td>
              </tr>
            </table>
          </td>
        </tr>
      `
    })
    .join('')

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" 
        content="width=device-width,initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Welcome to CorpLawUpdates.in</title>
</head>
<body style="margin:0;padding:0;background:#F1F5F9;
             font-family:Arial,Helvetica,sans-serif;">

  <!-- Preheader text (hidden) -->
  <span style="display:none;max-height:0;overflow:hidden;">
    Welcome! Your free corporate law digest is here. 
    MCA, SEBI, RBI updates every week.
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </span>

  <table width="100%" cellpadding="0" 
         cellspacing="0" border="0"
         style="background:#F1F5F9;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        
        <!-- Main container -->
        <table width="600" cellpadding="0" 
               cellspacing="0" border="0"
               style="max-width:600px;width:100%;">

          <!-- ── HEADER ── -->
          <tr>
            <td>
              <table width="100%" cellpadding="0"
                     cellspacing="0" border="0"
                     style="background:#0F172A;
                            border-radius:16px 16px 0 0;
                            overflow:hidden;">
                <tr>
                  <td style="padding:32px 32px 28px;">
                    
                    <!-- Logo -->
                    <table width="100%" cellpadding="0"
                           cellspacing="0" border="0">
                      <tr>
                        <td>
                          <span style="font-size:22px;
                                       font-weight:900;
                                       color:#ffffff;
                                       font-family:Georgia,serif;
                                       letter-spacing:-0.5px;">
                            CorpLawUpdates
                            <span style="color:#F59E0B;">.</span>
                            in
                          </span>
                        </td>
                        <td align="right">
                          <span style="background:#F59E0B20;
                                       color:#F59E0B;
                                       font-size:11px;
                                       font-weight:700;
                                       padding:4px 10px;
                                       border-radius:20px;
                                       letter-spacing:0.5px;">
                            FREE FOREVER
                          </span>
                        </td>
                      </tr>
                    </table>

                    <!-- Welcome message -->
                    <h1 style="margin:24px 0 10px;
                               font-size:28px;
                               font-weight:800;
                               color:#ffffff;
                               font-family:Georgia,serif;
                               line-height:1.2;">
                      Welcome to India's Free<br>
                      <span style="color:#F59E0B;">
                        Corporate Law Platform!
                      </span>
                    </h1>

                    <p style="margin:0;
                              font-size:15px;
                              color:#94A3B8;
                              line-height:1.6;">
                      You're now subscribed to weekly updates on 
                      MCA, SEBI, RBI, NCLT, IBC and FEMA 
                      regulations. No spam. Unsubscribe anytime.
                    </p>

                  </td>
                </tr>

                <!-- Regulator pills -->
                <tr>
                  <td style="padding:0 32px 28px;">
                    <table cellpadding="0" 
                           cellspacing="4" border="0">
                      <tr>
                        ${[
                          ['MCA','#3B82F6'],
                          ['SEBI','#10B981'],
                          ['RBI','#8B5CF6'],
                          ['NCLT','#F97316'],
                          ['IBC','#EF4444'],
                          ['FEMA','#14B8A6'],
                        ].map(([label, color]) => `
                          <td>
                            <span style="background:${color}25;
                                         color:${color};
                                         font-size:11px;
                                         font-weight:700;
                                         padding:4px 10px;
                                         border-radius:20px;
                                         display:inline-block;">
                              ${label}
                            </span>
                          </td>
                        `).join('')}
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- ── WHAT YOU GET ── -->
          <tr>
            <td>
              <table width="100%" cellpadding="0"
                     cellspacing="0" border="0"
                     style="background:#FFF7ED;
                            border-left:4px solid #F59E0B;">
                <tr>
                  <td style="padding:20px 28px;">
                    <p style="margin:0;
                              font-size:14px;
                              color:#92400E;
                              font-weight:700;">
                      📬 What you'll receive every week:
                    </p>
                    <table width="100%" cellpadding="0"
                           cellspacing="0" border="0"
                           style="margin-top:12px;">
                      <tr>
                        <td width="50%" valign="top"
                            style="font-size:13px;
                                   color:#78350F;
                                   padding-right:8px;">
                          ✅ MCA circulars & notifications<br>
                          ✅ SEBI regulations & guidelines<br>
                          ✅ RBI policy updates
                        </td>
                        <td width="50%" valign="top"
                            style="font-size:13px;
                                   color:#78350F;">
                          ✅ NCLT/IBC landmark orders<br>
                          ✅ FEMA compliance updates<br>
                          ✅ Compliance deadline alerts
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── RECENT ARTICLES ── -->
          <tr>
            <td style="background:#F8FAFC;
                       padding:28px 24px 8px;">
              <h2 style="margin:0 0 20px;
                         font-size:18px;
                         font-weight:800;
                         color:#0F172A;
                         font-family:Georgia,serif;">
                📋 Recent Updates You May Have Missed
              </h2>
              
              <table width="100%" cellpadding="0"
                     cellspacing="0" border="0">
                ${articlesHtml}
              </table>
            </td>
          </tr>

          <!-- ── VIEW ALL BUTTON ── -->
          <tr>
            <td style="background:#F8FAFC;
                       padding:20px 24px 32px;
                       text-align:center;">
              <a href="${BASE_URL}/updates"
                 style="display:inline-block;
                        background:#F59E0B;
                        color:#0F172A;
                        font-weight:800;
                        font-size:14px;
                        padding:14px 32px;
                        border-radius:10px;
                        text-decoration:none;
                        letter-spacing:0.3px;">
                View All Updates →
              </a>
            </td>
          </tr>

          <!-- ── COMPLIANCE CALENDAR CTA ── -->
          <tr>
            <td style="padding:0 24px 24px;">
              <table width="100%" cellpadding="0"
                     cellspacing="0" border="0"
                     style="background:#0F172A;
                            border-radius:12px;
                            overflow:hidden;">
                <tr>
                  <td style="padding:24px 28px;">
                    <table width="100%" cellpadding="0"
                           cellspacing="0" border="0">
                      <tr>
                        <td>
                          <p style="margin:0 0 4px;
                                    font-size:16px;
                                    font-weight:800;
                                    color:#ffffff;
                                    font-family:Georgia,serif;">
                            📅 Free Compliance Calendar 2026
                          </p>
                          <p style="margin:0;
                                    font-size:13px;
                                    color:#94A3B8;">
                            39 deadlines — MCA, SEBI, RBI, 
                            FEMA & Income Tax
                          </p>
                        </td>
                        <td align="right" 
                            style="padding-left:16px;
                                   white-space:nowrap;">
                          <a href="${BASE_URL}/calendar"
                             style="display:inline-block;
                                    background:#F59E0B;
                                    color:#0F172A;
                                    font-weight:700;
                                    font-size:13px;
                                    padding:10px 20px;
                                    border-radius:8px;
                                    text-decoration:none;">
                            Open Calendar
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── SOCIAL LINKS ── -->
          <tr>
            <td style="padding:0 24px 24px;">
              <table width="100%" cellpadding="0"
                     cellspacing="0" border="0"
                     style="background:#ffffff;
                            border-radius:12px;
                            border:1px solid #E2E8F0;">
                <tr>
                  <td style="padding:20px 24px;
                             text-align:center;">
                    <p style="margin:0 0 14px;
                              font-size:13px;
                              color:#64748B;
                              font-weight:600;">
                      FOLLOW US FOR DAILY UPDATES
                    </p>
                    <table cellpadding="0" 
                           cellspacing="8" border="0"
                           align="center">
                      <tr>
                        <!-- Twitter/X -->
                        <td>
                          <a href="https://twitter.com/corplawupdates"
                             style="display:inline-block;
                                    background:#000000;
                                    color:#ffffff;
                                    font-size:12px;
                                    font-weight:700;
                                    padding:8px 16px;
                                    border-radius:8px;
                                    text-decoration:none;">
                            𝕏 Twitter
                          </a>
                        </td>
                        <!-- LinkedIn -->
                        <td>
                          <a href="https://linkedin.com/company/corplawupdates"
                             style="display:inline-block;
                                    background:#0A66C2;
                                    color:#ffffff;
                                    font-size:12px;
                                    font-weight:700;
                                    padding:8px 16px;
                                    border-radius:8px;
                                    text-decoration:none;">
                            in LinkedIn
                          </a>
                        </td>
                        <!-- WhatsApp -->
                        <td>
                          <a href="https://whatsapp.com/channel/corplawupdates"
                             style="display:inline-block;
                                    background:#25D366;
                                    color:#ffffff;
                                    font-size:12px;
                                    font-weight:700;
                                    padding:8px 16px;
                                    border-radius:8px;
                                    text-decoration:none;">
                            💬 WhatsApp
                          </a>
                        </td>
                        <!-- RSS -->
                        <td>
                          <a href="${BASE_URL}/api/feed.xml"
                             style="display:inline-block;
                                    background:#F97316;
                                    color:#ffffff;
                                    font-size:12px;
                                    font-weight:700;
                                    padding:8px 16px;
                                    border-radius:8px;
                                    text-decoration:none;">
                            ◉ RSS
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── FOOTER ── -->
          <tr>
            <td>
              <table width="100%" cellpadding="0"
                     cellspacing="0" border="0"
                     style="background:#0F172A;
                            border-radius:0 0 16px 16px;">
                <tr>
                  <td style="padding:24px 32px;
                             text-align:center;">
                    
                    <p style="margin:0 0 8px;
                              font-size:13px;
                              color:#94A3B8;">
                      You're receiving this because you 
                      subscribed at 
                      <a href="${BASE_URL}"
                         style="color:#F59E0B;
                                text-decoration:none;">
                        corplawupdates.in
                      </a>
                    </p>

                    <p style="margin:0 0 16px;
                              font-size:12px;
                              color:#64748B;">
                      India's Free Corporate Law 
                      Intelligence Platform<br>
                      MCA · SEBI · RBI · NCLT · 
                      IBC · FEMA
                    </p>

                    <a href="${unsubscribeUrl}"
                       style="font-size:12px;
                              color:#64748B;
                              text-decoration:underline;">
                      Unsubscribe from this newsletter
                    </a>

                    <p style="margin:12px 0 0;
                              font-size:11px;
                              color:#334155;">
                      Not legal advice · 
                      For informational purposes only
                    </p>

                  </td>
                </tr>
              </table>
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
