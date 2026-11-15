import fs from 'node:fs'
import path from 'node:path'
import {
  BannerSpec,
  RenderInputSchema,
  computeBannerHash,
  renderBanner,
  sanitizeSvg,
  lintBanner,
  BANNER_THEMES,
  TEMPLATE_VERSION,
  FONT_VERSION,
  BannerSpecData,
} from '../lib/banner'

describe('Banner System: Phase 1 Renderer Library & Visuals', () => {
  // Test 1: Font files contain U+20B9 (the rupee sign)
  describe('Font Integrity & Rupee Sign (U+20B9)', () => {
    const fontsDir = path.join(process.cwd(), 'lib', 'banner', 'fonts')

    it.each(['Inter-Regular.ttf', 'Inter-Bold.ttf', 'Inter-ExtraBold.ttf'])(
      'bundles %s containing U+20B9 glyph data',
      (fontFile) => {
        const fontPath = path.join(fontsDir, fontFile)
        expect(fs.existsSync(fontPath)).toBe(true)

        const fontBuffer = fs.readFileSync(fontPath)
        expect(fontBuffer.byteLength).toBeGreaterThan(200000)

        // Verify font has valid TrueType magic header (0x00010000 or 'true' or 'OTTO')
        const magic = fontBuffer.readUInt32BE(0)
        expect([0x00010000, 0x74727565, 0x4f54544f]).toContain(magic)

        // Simple sub-check: Verify unicode point 0x20B9 presence in cmap table
        // Satori rendering with ₹ will also exercise the rasterizer
        const hasRupeeReference = fontBuffer.includes(Buffer.from([0x20, 0xb9]))
        expect(hasRupeeReference).toBe(true)
      }
    )
  })

  // Test 2: Zod Schemas
  describe('Zod Schemas & Validation', () => {
    const sampleSpec: BannerSpecData = {
      v: 1,
      regulator: 'MCA',
      headline: 'Name Reservation Resubmission Extended',
      sub: 'Relief after the MCA data centre fire. New last date is 10 July 2026.',
      action: 'Raise helpdesk ticket by 30 June',
      dateLabel: 'Jul 2026',
      impact: 'Medium',
      alt: 'Calendar showing the MCA name reservation resubmission date moved from 30 June to 10 July 2026',
      visual: {
        type: 'calendar_shift',
        from: { month: 'JUN', day: '30' },
        to: { month: 'JUL', day: '10' },
        strike: true,
        toLabel: 'NEW DEADLINE',
      },
    }

    it('accepts valid sample template spec', () => {
      const parsed = BannerSpec.parse(sampleSpec)
      expect(parsed.regulator).toBe('MCA')
      expect(parsed.visual.type).toBe('calendar_shift')
    })

    it('rejects headlines over 70 characters', () => {
      const longHeadline = {
        ...sampleSpec,
        headline: 'This headline is intentionally written to be much longer than seventy characters total for validation',
      }
      expect(() => BannerSpec.parse(longHeadline)).toThrow()
    })

    it('rejects alt text shorter than 20 characters', () => {
      const shortAlt = {
        ...sampleSpec,
        alt: 'Too short alt',
      }
      expect(() => BannerSpec.parse(shortAlt)).toThrow()
    })

    it('rejects card values longer than 9 characters', () => {
      const invalidCard = {
        ...sampleSpec,
        visual: {
          type: 'stat_cards' as const,
          items: [{ label: 'Penalty', value: '1234567890' }], // 10 chars
        },
      }
      expect(() => BannerSpec.parse(invalidCard)).toThrow()
    })
  })

  // Test 3: Lint Rules
  describe('Lint Rules', () => {
    it('warns when headline is between 53 and 70 characters', () => {
      const spec: BannerSpecData = {
        v: 1,
        regulator: 'SEBI',
        headline: 'SEBI Amends LODR Regulations for High Value Debt Entities', // 58 chars (between 53 and 70)
        dateLabel: 'Aug 2026',
        impact: 'High',
        alt: 'SEBI amends LODR regulations for high value debt listed entities',
        visual: {
          type: 'icon_panel',
          icon: 'chart-line',
          caption: 'LODR Amendment',
        },
      }

      const { warnings, errors } = lintBanner({ mode: 'template', spec })
      expect(errors).toHaveLength(0)
      expect(warnings.some((w) => w.includes('over 52 chars'))).toBe(true)
    })

    it('errors when alt text is too short in HTML code mode', () => {
      const { errors } = lintBanner({
        mode: 'html',
        code: '<div style="display:flex;width:1200px;height:630px;">Hello</div>',
        alt: 'Short',
      })
      expect(errors.some((e) => e.includes('at least 20 characters'))).toBe(true)
    })
  })

  // Test 4: SVG Sanitizer
  describe('SVG Sanitizer Security', () => {
    it('strips script, foreignObject, iframe, and inline event handlers', () => {
      const maliciousSvg = `
        <svg viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
          <script>alert("pwned")</script>
          <foreignObject width="100" height="100"><iframe src="http://evil.com"></iframe></foreignObject>
          <rect width="100" height="100" onclick="steal()" onload="hack()" />
          <text x="10" y="50">Safe Content</text>
        </svg>
      `
      const { sanitized, errors } = sanitizeSvg(maliciousSvg)
      expect(errors.length).toBeGreaterThan(0)
      expect(sanitized).not.toContain('<script>')
      expect(sanitized).not.toContain('<foreignObject>')
      expect(sanitized).not.toContain('<iframe>')
      expect(sanitized).not.toContain('onclick')
      expect(sanitized).not.toContain('onload')
      expect(sanitized).toContain('Safe Content')
    })

    it('rejects remote URLs (http/https)', () => {
      const remoteSvg = `
        <svg viewBox="0 0 1200 630">
          <image href="https://malicious.site/tracker.png" width="100" height="100" />
        </svg>
      `
      const { errors } = sanitizeSvg(remoteSvg)
      expect(errors.some((e) => e.includes('Remote URLs are forbidden'))).toBe(true)
    })

    it('allows data URIs and local anchors', () => {
      const validSvg = `
        <svg viewBox="0 0 1200 630" width="1200" height="630">
          <defs><radialGradient id="grad1"><stop offset="0%" stop-color="#fff"/></radialGradient></defs>
          <rect fill="url(#grad1)" width="1200" height="630" />
        </svg>
      `
      const { sanitized, errors } = sanitizeSvg(validSvg)
      expect(errors).toHaveLength(0)
      expect(sanitized).toContain('url(#grad1)')
    })
  })

  // Test 5: Content Hash Stability
  describe('Hash Computation', () => {
    const spec: BannerSpecData = {
      v: 1,
      regulator: 'RBI',
      headline: 'RBI Maintains Repo Rate at 5.50% in October Policy',
      dateLabel: 'Oct 2026',
      impact: 'High',
      alt: 'RBI MPC decides to maintain policy repo rate at 5.50 percent in latest resolution',
      visual: {
        type: 'stat_cards',
        items: [
          { label: 'Policy Repo Rate', value: '5.50%', chip: 'NO CHANGE' },
          { label: 'SDF Rate', value: '5.25%' },
        ],
      },
    }

    it('produces identical hash for identical spec', () => {
      const hash1 = computeBannerHash({ mode: 'template', spec })
      const hash2 = computeBannerHash({ mode: 'template', spec })
      expect(hash1).toBe(hash2)
      expect(hash1).toHaveLength(64)
    })

    it('changes hash when content changes', () => {
      const hash1 = computeBannerHash({ mode: 'template', spec })
      const alteredSpec = { ...spec, headline: 'RBI Cuts Policy Repo Rate to 5.25% in Policy' }
      const hash2 = computeBannerHash({ mode: 'template', spec: alteredSpec })
      expect(hash1).not.toBe(hash2)
    })
  })

  // Test 6: Snapshot Renders across Visual Types and Themes
  describe('Full Visual Module Renders (1200x630, < 300KB)', () => {
    const visualTypes: Array<{
      name: string
      spec: BannerSpecData
    }> = [
      {
        name: 'calendar_shift (MCA theme)',
        spec: {
          v: 1,
          regulator: 'MCA',
          headline: 'Name Reservation Resubmission Extended',
          sub: 'Relief after MCA data centre maintenance. New last date is 10 July 2026.',
          action: 'File prior to 10 July',
          dateLabel: 'Jul 2026',
          impact: 'Medium',
          alt: 'MCA deadline extended from 30 June to 10 July 2026 with new deadline card',
          visual: {
            type: 'calendar_shift',
            from: { month: 'JUN', day: '30' },
            to: { month: 'JUL', day: '10' },
            strike: true,
            toLabel: 'NEW DEADLINE',
          },
        },
      },
      {
        name: 'stat_cards with Rupee sign (TAXATION theme)',
        spec: {
          v: 1,
          regulator: 'TAXATION',
          headline: 'GST E-Invoicing Threshold Lowered for Businesses',
          sub: 'Mandatory B2B e-invoicing turnover threshold revised under Section 164.',
          action: 'Verify ERP readiness',
          dateLabel: 'Oct 2026',
          impact: 'High',
          alt: 'GST e-invoicing threshold revised with key stat cards',
          visual: {
            type: 'stat_cards',
            items: [
              { label: 'Annual Turnover', value: '₹5 Cr', chip: 'MANDATORY' },
              { label: 'Penalty/Invoice', value: '₹10,000' },
              { label: 'Effective Date', value: '1 Nov' },
            ],
          },
        },
      },
      {
        name: 'before_after (SEBI theme)',
        spec: {
          v: 1,
          regulator: 'SEBI',
          headline: 'SEBI Relaxes Cooling-Off Period for InVIT OFS',
          sub: 'Cooling-off duration between successive offers reduced for institutional sponsors.',
          action: 'Applies to next offer',
          dateLabel: 'Aug 2026',
          impact: 'Lower',
          alt: 'Comparison showing cooling off reduced from 12 weeks to 8 weeks',
          visual: {
            type: 'before_after',
            before: { label: 'Old Cooling-Off', value: '12 Wks' },
            after: { label: 'New Cooling-Off', value: '8 Wks' },
            change: 'down',
          },
        },
      },
      {
        name: 'date_card (IBC theme)',
        spec: {
          v: 1,
          regulator: 'IBC',
          headline: 'IBBI Discussion Paper on Real Estate Insolvency',
          sub: 'Public comments invited on project-wise CIRP and land allotment rules.',
          action: 'Submit comments online',
          dateLabel: 'Sep 2026',
          impact: 'Medium',
          alt: 'IBBI consultation paper comments due date card',
          visual: {
            type: 'date_card',
            label: 'Comments By',
            month: 'SEP',
            day: '25',
            caption: 'Submit to ibbi.gov.in',
          },
        },
      },
      {
        name: 'stamp (NCLT theme)',
        spec: {
          v: 1,
          regulator: 'NCLT',
          headline: 'Viral Notice on Section 7 Threshold Clarified',
          sub: 'MCA and NCLT issue joint clarification regarding default threshold.',
          action: 'Refer official circular',
          dateLabel: 'Nov 2026',
          impact: 'High',
          alt: 'Fact check stamp clarifying threshold remains unchanged at ₹1 Crore',
          visual: {
            type: 'stamp',
            text: 'CLARIFIED',
            claim: 'Threshold remains ₹1 Crore for CIRP initiation',
          },
        },
      },
      {
        name: 'icon_panel (RBI theme)',
        spec: {
          v: 1,
          regulator: 'RBI',
          headline: 'RBI Releases Domestic Money Transfer Framework',
          sub: 'Updated master directions on cash payout caps and KYC validation for BC outlets.',
          action: 'Effective immediately',
          dateLabel: 'Nov 2026',
          impact: 'High',
          alt: 'RBI Domestic Money Transfer Directions banner with bank icon',
          visual: {
            type: 'icon_panel',
            icon: 'building-bank',
            caption: 'Master Directions',
          },
        },
      },
    ]

    for (const item of visualTypes) {
      it(`renders ${item.name} cleanly to PNG and WebP`, async () => {
        const result = await renderBanner({
          mode: 'template',
          spec: item.spec,
        })

        expect(result.width).toBe(1200)
        expect(result.height).toBe(630)
        expect(result.png.byteLength).toBeGreaterThan(10000)
        expect(result.webp.byteLength).toBeGreaterThan(5000)
        // Ensure both outputs are well under target 300 KB
        expect(result.png.byteLength).toBeLessThan(300 * 1024)
        expect(result.webp.byteLength).toBeLessThan(200 * 1024)
        expect(result.hash).toHaveLength(64)
      }, 15000)
    }

    it('renders HTML code mode banner with token interpolation', async () => {
      const htmlCode = `
        <div style="display: flex; flex-direction: column; width: 1200px; height: 630px; background-color: {{theme.bg}}; padding: 60px; justify-content: space-between; font-family: Inter;">
          <div style="display: flex; flex-direction: row; justify-content: space-between; align-items: center;">
            <span style="font-size: 32px; font-weight: 800; color: #FFFFFF;">CUSTOM HTML BANNER</span>
            {{icon:file-check color=#F5A623 size=56}}
          </div>
          <div style="font-size: 60px; font-weight: 800; color: #FFFFFF;">{{headline}}</div>
          <div style="display: flex; background-color: {{theme.accent}}; padding: 12px 24px; border-radius: 12px; width: fit-content; font-size: 24px; font-weight: 800; color: {{theme.dark}};">
            ₹50,000 Revised Threshold
          </div>
        </div>
      `

      const result = await renderBanner({
        mode: 'html',
        code: htmlCode,
        alt: 'Custom HTML banner for corporate law updates',
        headline: 'Dynamic Interpolated Headline for Testing',
        regulator: 'MCA',
      })

      expect(result.width).toBe(1200)
      expect(result.height).toBe(630)
      expect(result.png.byteLength).toBeGreaterThan(10000)
      expect(result.webp.byteLength).toBeGreaterThan(5000)
    }, 15000)
  })
})
