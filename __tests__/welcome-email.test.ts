import { generateWelcomeEmail } from '@/lib/email-templates/welcome'

describe('Welcome Email Induction Briefing Template', () => {
  const sampleArticles = [
    {
      title: 'Cabinet Approves Higher EPFO Wage Ceiling of ₹25,000 Effective 17 September 2026',
      slug: 'cabinet-approves-epfo-wage-ceiling-25000-september-2026',
      summary: 'Union cabinet approves hike in mandatory wage ceiling from ₹15,000 to ₹25,000 bringing 51 lakh workers under PF cover.',
      category: 'LABOUR',
      published_at: '2026-09-17T10:00:00Z',
    },
    {
      title: 'IFSCA Adds UAE, Singapore, Australia and EU to Specified Jurisdictions',
      slug: 'ifsca-adds-uae-singapore-australia-eu-specified-jurisdictions',
      summary: 'IFSCA circular permits capital market intermediaries to distribute products to retail investors in specified countries.',
      category: 'IFSCA',
      published_at: '2026-09-18T14:00:00Z',
    },
  ]

  it('renders the executive masthead with obsidian slate and champagne gold accents', () => {
    const html = generateWelcomeEmail({
      email: 'counsel@corporation.com',
      unsubscribeToken: 'unsub-token-12345',
      recentArticles: sampleArticles,
    })

    // Obsidian Slate & Gold accents
    expect(html).toContain('#0B132B')
    expect(html).toContain('#D4AF37')
    expect(html).toContain('CorpLawUpdates')
    expect(html).toContain('MEMBER INDUCTION')
    expect(html).toContain('counsel@corporation.com')
  })

  it('renders the 3 Core Value Pillars (what to expect every Monday)', () => {
    const html = generateWelcomeEmail({
      email: 'partner@legal.com',
      unsubscribeToken: 'token-abc',
      recentArticles: sampleArticles,
    })

    expect(html).toContain('WHAT TO EXPECT EVERY MONDAY MORNING')
    expect(html).toContain('The 60-Second Executive Memo')
    expect(html).toContain('Why It Matters for Practice')
    expect(html).toContain('Statutory Deadlines Ahead')
  })

  it('renders the Day 1 Practitioner Tool Deck', () => {
    const html = generateWelcomeEmail({
      email: 'ca.firm@gmail.com',
      unsubscribeToken: 'token-xyz',
      recentArticles: sampleArticles,
    })

    expect(html).toContain('DAY-ONE ESSENTIAL TOOL DECK')
    expect(html).toContain('MCA Late Filing Fee & Delay Penalty Calculator')
    expect(html).toContain('/tools/fee-calculator')
    expect(html).toContain('2026 Interactive Statutory Compliance Calendar')
    expect(html).toContain('/calendar')
    expect(html).toContain('Corporate Legal Document & Resolution Generator')
    expect(html).toContain('/documents')
  })

  it('renders recent regulatory intelligence cards with category tags', () => {
    const html = generateWelcomeEmail({
      email: 'cs.student@icai.org',
      unsubscribeToken: 'token-recent',
      recentArticles: sampleArticles,
    })

    expect(html).toContain('RECENT INTELLIGENCE BRIEFINGS')
    expect(html).toContain('Cabinet Approves Higher EPFO Wage Ceiling of ₹25,000')
    expect(html).toContain('IFSCA Adds UAE, Singapore, Australia and EU')
    expect(html).toContain('Labour Law')
    expect(html).toContain('IFSCA (GIFT City)')
  })

  it('handles empty recent articles without crashing or broken layout', () => {
    const html = generateWelcomeEmail({
      email: 'empty@test.com',
      unsubscribeToken: 'token-empty',
      recentArticles: [],
    })

    expect(html).toContain('CorpLawUpdates')
    expect(html).toContain('empty@test.com')
    expect(html).not.toContain('RECENT INTELLIGENCE BRIEFINGS')
  })

  it('includes verified mobile broadcast channel buttons (WhatsApp & Telegram)', () => {
    const html = generateWelcomeEmail({
      email: 'practitioner@law.in',
      unsubscribeToken: 'token-mobile',
      recentArticles: sampleArticles,
    })

    expect(html).toContain('https://whatsapp.com/channel/0029VbCfcUEEgGfGLWOTvV1A')
    expect(html).toContain('https://t.me/corplawupdate')
  })

  it('renders a secure, functional unsubscribe link in the footer', () => {
    const html = generateWelcomeEmail({
      email: 'unsubscribe.me@example.com',
      unsubscribeToken: 'secret-token-999',
      recentArticles: sampleArticles,
    })

    expect(html).toContain('/api/unsubscribe?email=unsubscribe.me%40example.com&token=secret-token-999')
    expect(html).toContain('Unsubscribe or Update Subscription Preferences')
  })
})
