process.env.ADMIN_PASSWORD = 'test-admin-password-1234'
process.env.ADMIN_SECRET_SALT = 'test-salt-abcdef'
process.env.NEXT_PUBLIC_SITE_URL = 'https://www.corplawupdates.in'
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test-supabase.co'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key'

jest.mock('@/lib/supabase-server', () => ({
    supabaseAdmin: {
        from: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnThis(),
            insert: jest.fn().mockReturnThis(),
            update: jest.fn().mockReturnThis(),
            delete: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: null, error: null }),
        }),
    },
}))

import {
    buildNewsletterTemplateHtml,
    buildWeeklyDigestHtml,
    buildEmailHtml,
    markdownToHtml
} from '@/lib/newsletter'

describe('Newsletter & Email Template Engine', () => {
    const sampleArticles = [
        {
            id: '1',
            title: 'MCA Mandates Dematerialisation for Private Companies',
            slug: 'mca-demat-mandate-private-companies',
            category: 'MCA',
            impact_level: 'high',
            published_at: '2026-09-18T10:00:00Z',
            summary: 'The Ministry of Corporate Affairs has notified amendments requiring private companies to dematerialise securities.',
            key_change: 'All private companies must issue securities only in dematerialised form by the statutory deadline.',
            source_name: 'MCA Notification G.S.R. 802(E)'
        },
        {
            id: '2',
            title: 'SEBI Clarifies ESG Rating Provider Regulations',
            slug: 'sebi-esg-rating-provider-regulations',
            category: 'SEBI',
            impact_level: 'medium',
            published_at: '2026-09-19T14:30:00Z',
            summary: 'SEBI circular regarding disclosure requirements for certified ESG rating agencies.',
            source_name: 'SEBI/HO/DDHS/2026/04'
        },
        {
            id: '3',
            title: 'RBI Revises Master Direction on Overseas Direct Investment',
            slug: 'rbi-overseas-direct-investment-revisions',
            category: 'RBI',
            impact_level: 'low',
            published_at: '2026-09-20T09:00:00Z',
            summary: 'RBI updates reporting requirements under FEMA for outbound investments by Indian entities.',
            source_name: 'RBI/2026-27/45'
        }
    ]

    const sampleDeadlines = [
        {
            id: 'd1',
            form_name: 'DIR-3 KYC',
            compliance_title: 'Annual KYC of Directors holding active DIN',
            regulator: 'MCA',
            due_date: '30 September 2026',
            applicable_to: 'All DIN holders'
        },
        {
            id: 'd2',
            form_name: 'GSTR-3B',
            compliance_title: 'Monthly Summary GST Return',
            regulator: 'GST',
            due_date: '20 October 2026',
            applicable_to: 'Registered GST taxpayers'
        }
    ]

    describe('buildNewsletterTemplateHtml', () => {
        it('renders the executive masthead with midnight slate and champagne gold accents', () => {
            const html = buildNewsletterTemplateHtml({
                subject: 'Weekly Corporate Law Briefing',
                previewText: 'Key updates from MCA, SEBI & RBI',
                articles: sampleArticles,
                unsubscribeUrl: 'https://www.corplawupdates.in/api/unsubscribe?token=test123'
            })

            // Obsidian & Gold styling
            expect(html).toContain('#0B132B')
            expect(html).toContain('#D4AF37')
            expect(html).toContain('CorpLawUpdates')
            expect(html).toContain('EXECUTIVE BRIEFING')
            expect(html).toContain('Weekly Corporate Law Briefing')
        })

        it('includes the 60-Second Executive Memo with bullet takeaways', () => {
            const html = buildNewsletterTemplateHtml({
                subject: 'Executive Edition',
                previewText: 'Takeaways for General Counsel',
                articles: sampleArticles,
                unsubscribeUrl: '#'
            })

            expect(html).toContain('60-SECOND EXECUTIVE MEMO')
            expect(html).toContain('MCA:')
            expect(html).toContain('SEBI:')
            expect(html).toContain('RBI:')
        })

        it('supports custom introMessage in the 60-Second Executive Memo', () => {
            const customIntro = '• Key board decisions due before Q3 close\n• Revised ROC fee schedules effective next Monday'
            const html = buildNewsletterTemplateHtml({
                subject: 'Partner Digest',
                previewText: 'Custom notes',
                introMessage: customIntro,
                articles: sampleArticles,
                unsubscribeUrl: '#'
            })

            expect(html).toContain('Key board decisions due before Q3 close')
            expect(html).toContain('Revised ROC fee schedules effective next Monday')
        })

        it('renders the Lead Story with hero editorial treatment and Why It Matters box', () => {
            const html = buildNewsletterTemplateHtml({
                subject: 'Regulatory Intelligence',
                previewText: 'Top story inside',
                articles: sampleArticles,
                unsubscribeUrl: '#'
            })

            expect(html).toContain('LEAD STORY')
            expect(html).toContain('MCA Mandates Dematerialisation for Private Companies')
            expect(html).toContain('Why It Matters for Practice')
            expect(html).toContain('All private companies must issue securities only in dematerialised form')
            expect(html).toContain('Read Analysis & Circular →')
        })

        it('renders the Regulatory Radar secondary cards with distinct styling', () => {
            const html = buildNewsletterTemplateHtml({
                subject: 'Weekly Briefing',
                previewText: 'Radar',
                articles: sampleArticles,
                unsubscribeUrl: '#'
            })

            expect(html).toContain('Regulatory Radar & Practice Updates')
            expect(html).toContain('SEBI Clarifies ESG Rating Provider Regulations')
            expect(html).toContain('RBI Revises Master Direction on Overseas Direct Investment')
        })

        it('renders live statutory deadlines when provided', () => {
            const html = buildNewsletterTemplateHtml({
                subject: 'Deadlines Digest',
                previewText: 'Deadlines included',
                articles: sampleArticles,
                unsubscribeUrl: '#',
                upcomingDeadlines: sampleDeadlines
            })

            expect(html).toContain('Upcoming Statutory Deadlines')
            expect(html).toContain('DIR-3 KYC')
            expect(html).toContain('GSTR-3B')
            expect(html).toContain('30 September')
        })

        it('renders fallback compliance calendar card when no upcoming deadlines are passed', () => {
            const html = buildNewsletterTemplateHtml({
                subject: 'Calendar CTA Test',
                previewText: 'No deadlines passed',
                articles: sampleArticles,
                unsubscribeUrl: '#',
                upcomingDeadlines: []
            })

            expect(html).toContain('Interactive Compliance Calendar 2026')
            expect(html).toContain('/calendar')
        })

        it('renders practitioner tool spotlight and forward to colleague callout', () => {
            const html = buildNewsletterTemplateHtml({
                subject: 'Tool & Share Test',
                previewText: 'Tools',
                articles: sampleArticles,
                unsubscribeUrl: '#'
            })

            expect(html).toContain('PRACTITIONER TOOL SPOTLIGHT')
            expect(html).toContain('MCA Late Filing Fee & Delay Penalty Calculator')
            expect(html).toContain('/tools/fee-calculator')
            expect(html).toContain('Enjoying this regulatory briefing?')
            expect(html).toContain('Forward this issue to a fellow CA, CS, or legal colleague')
        })

        it('renders valid unsubscribe link in footer', () => {
            const unsub = 'https://www.corplawupdates.in/api/unsubscribe?email=lawyer@corp.com&token=secret'
            const html = buildNewsletterTemplateHtml({
                subject: 'Unsubscribe Test',
                previewText: 'Check link',
                articles: sampleArticles,
                unsubscribeUrl: unsub
            })

            expect(html).toContain(unsub)
            expect(html).toContain('Unsubscribe or Update Subscription Preferences')
        })

        it('handles empty articles gracefully without throwing', () => {
            const html = buildNewsletterTemplateHtml({
                subject: 'Empty Update Test',
                previewText: 'Quiet week',
                articles: [],
                unsubscribeUrl: '#'
            })

            expect(html).toContain('CorpLawUpdates')
            expect(html).toContain('Weekly Intelligence Breakdown (0 Updates)')
            expect(html).toContain('Interactive Compliance Calendar 2026')
        })
    })

    describe('buildWeeklyDigestHtml', () => {
        const weeklyEntries = [
            {
                regulator: 'mca',
                form_name: 'DPT-3',
                compliance_title: 'Return of Deposits or particulars not considered as deposit',
                due_date: '30 June 2026',
                applicable_to: 'All Companies other than Government companies',
                regulation_reference: 'Rule 16 of Companies (Acceptance of Deposits) Rules, 2014',
                penalty: '₹5,000 plus ₹500/day during which default continues'
            },
            {
                regulator: 'gst',
                form_name: 'GSTR-1',
                compliance_title: 'Details of Outward Supplies',
                due_date: '11 July 2026',
                applicable_to: 'Regular Taxpayers with turnover > ₹5 Crore',
                penalty: '₹50/day (₹20/day for NIL return)'
            }
        ]

        it('renders grouped compliance deadlines with regulator branding', () => {
            const html = buildWeeklyDigestHtml({
                startDateStr: '29 Jun 2026',
                endDateStr: '5 Jul 2026',
                entries: weeklyEntries,
                unsubscribeUrl: 'https://www.corplawupdates.in/api/unsubscribe?token=digest123'
            })

            expect(html).toContain('STATUTORY DIGEST')
            expect(html).toContain('Weekly Compliance Deadlines Alert')
            expect(html).toContain('29 Jun 2026 to 5 Jul 2026')
            expect(html).toContain('MCA / ROC / LLP Filings')
            expect(html).toContain('DPT-3')
            expect(html).toContain('GST Statutory Returns')
            expect(html).toContain('GSTR-1')
        })

        it('displays penalty warnings prominently in soft rose warning callouts', () => {
            const html = buildWeeklyDigestHtml({
                startDateStr: '29 Jun 2026',
                endDateStr: '5 Jul 2026',
                entries: weeklyEntries,
                unsubscribeUrl: '#'
            })

            expect(html).toContain('Statutory Penalty for Delay:')
            expect(html).toContain('₹5,000 plus ₹500/day')
            expect(html).toContain('#FFF1F2')
            expect(html).toContain('#EF4444')
        })

        it('renders celebratory empty state when 0 deadlines are scheduled for the week', () => {
            const html = buildWeeklyDigestHtml({
                startDateStr: '10 Aug 2026',
                endDateStr: '16 Aug 2026',
                entries: [],
                unsubscribeUrl: '#'
            })

            expect(html).toContain('No Statutory Deadlines This Week')
            expect(html).toContain('🎉')
            expect(html).toContain('Enjoy a compliant, productive week!')
        })
    })

    describe('buildEmailHtml', () => {
        it('renders official notice layout with sanitized html content', () => {
            const html = buildEmailHtml({
                subject: 'Platform Scheduled Maintenance',
                previewText: 'Brief maintenance window notice',
                bodyHtml: '<p>Dear Practitioners,</p><p>We will undergo a 15-minute maintenance window on Sunday at 2 AM IST.</p>',
                unsubscribeUrl: 'https://www.corplawupdates.in/api/unsubscribe?token=email123'
            })

            expect(html).toContain('OFFICIAL NOTICE')
            expect(html).toContain('Platform Scheduled Maintenance')
            expect(html).toContain('Dear Practitioners')
            expect(html).toContain('#0B132B')
            expect(html).toContain('#D4AF37')
            expect(html).toContain('https://www.corplawupdates.in/api/unsubscribe?token=email123')
        })
    })

    describe('markdownToHtml', () => {
        it('converts markdown headings, lists, bold, and links', () => {
            const md = '## Key Amendment\n\n- Point 1\n- Point 2\n\nRead more at [CorpLawUpdates](https://www.corplawupdates.in).'
            const html = markdownToHtml(md)

            expect(html).toContain('<h2>Key Amendment</h2>')
            expect(html).toContain('<li>Point 1</li>')
            expect(html).toContain('<li>Point 2</li>')
            expect(html).toContain('<a href="https://www.corplawupdates.in"')
        })
    })
})
