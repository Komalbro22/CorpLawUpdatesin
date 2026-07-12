---
name: CorpLawUpdates
colors:
  navy: '#0F172A'
  brand-navy: '#0B1F3A'
  slate-blue: '#1E3A5F'
  interactive-blue: '#2E5F8A'
  gold: '#C9A84C'
  gold-dark: '#B45309'
  cream: '#F5F0E8'
  surface: '#FFFFFF'
  text: '#0F172A'
  text-muted: '#64748B'
  border: '#E2E8F0'
  success: '#16A34A'
  warning: '#F59E0B'
  error: '#DC2626'
typography:
  display:
    fontFamily: 'Outfit, Lora, sans-serif'
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
  headline:
    fontFamily: 'Outfit, Lora, sans-serif'
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
  body:
    fontFamily: 'Source Sans, Arial, sans-serif'
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  label:
    fontFamily: 'Inter, system-ui, sans-serif'
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  badge: 6px
  control: 8px
  card: 12px
  pill: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  section: 64px
---

# Design System: CorpLawUpdates

## 1. Visual Theme & Atmosphere

CorpLawUpdates uses an editorial legal-intelligence aesthetic: deep navy establishes authority, muted slate supports dense regulatory information, and restrained gold gives calls to action a premium but professional emphasis. Public surfaces are clean, bright and card-based, with generous white space around high-density content.

The admin interface shifts toward a compact productivity dashboard with slate surfaces, amber highlights and occasional glass/glow effects. The two systems are recognizably related but should share tokens more consistently; functional clarity should take priority over decorative glow.

## 2. Color Palette & Roles

### Primary Foundation

- **Authority Navy `#0F172A` / `#0B1F3A`:** headings, navigation and strong brand surfaces.
- **Paper White `#FFFFFF`:** cards, forms and editorial reading surfaces.
- **Legal Cream `#F5F0E8`:** warm supporting background and branded contrast.
- **Slate Border `#E2E8F0`:** quiet separation without heavy elevation.

### Accent & Interactive

- **Regulatory Gold `#C9A84C`:** primary CTAs, highlights and premium brand moments.
- **Accessible Ochre `#B45309`:** gold-toned text and controls where contrast is required.
- **Interactive Blue `#2E5F8A`:** links and information-oriented interactions.

### Typography & Text Hierarchy

- **Ink Navy `#0F172A`:** primary text and headings.
- **Slate `#64748B`:** metadata, summaries and secondary labels.
- Avoid light gold for small text on white; use ochre or navy instead.

### Functional States

- **Verified Green `#16A34A`**, **Warning Amber `#F59E0B`**, **Error Red `#DC2626`**.
- Regulator colors are category aids and must always be paired with text, never used as the only signal.

## 3. Typography Rules

### Hierarchy & Weights

Display and section headings use the configured editorial heading family (Outfit/Lora fallback) at bold weights. Body copy uses Source Sans/Arial for long-form readability; UI labels and admin controls use Inter/system UI. Article titles should use tighter line height than body text, while legal explanations should remain near 1.6 line height.

### Spacing Principles

Use a 4px base grid with most layout decisions on an 8px rhythm. Metadata clusters should be compact; reading content, section transitions and primary actions should receive more space. Avoid stacking multiple badges, dates and icons without a clear first-to-last reading order.

## 4. Component Stylings

### Buttons

Primary buttons use navy or gold fill, high-contrast text, 8px corners and a minimum 44px touch height. Secondary buttons use white surfaces with slate borders. Focus states need a consistent two-pixel visible ring; hover motion should remain subtle and under 200ms.

### Cards & Regulatory Updates

Cards use 12px corners, a hairline slate border and low ambient shadow. Hover elevation can increase gently, but legal metadata should not move. Update cards prioritize regulator, impact, title, concise summary, source/effective date, then views and reading time.

### Navigation

Public navigation is horizontal on desktop and collapses on mobile. Navy carries authority; gold indicates the highest-value action. Admin navigation uses grouped sections and an amber active rail. Pending work should appear as small count badges.

### Inputs & Forms

Inputs use persistent labels, 44px minimum height, white surfaces, slate borders and a navy/blue focus ring. Error copy appears directly below the field with an icon and repair instruction. Long admin forms should support sticky save state and section navigation.

### Legal Intelligence Components

Quick answers, effective-date callouts, key changes, source citations and verified badges are the signature components. They should share a strict semantic order and distinguish issue date, effective date, last verified date and superseded status.

## 5. Layout Principles

### Grid & Structure

Use a centered editorial container (approximately 1200–1280px) with narrower 720–800px measure for article body text. Home and listing pages use responsive card grids; admin uses a fixed 260px desktop sidebar and fluid workspace.

### Whitespace Strategy

Major public sections need 56–72px separation on desktop and 36–48px on mobile. Cards use 20–24px internal padding. Admin tables may be denser, but controls and touch targets remain at least 44px.

### Alignment & Visual Balance

Keep long-form and operational content left aligned. Reserve centered alignment for short hero statements. Regulatory category color should guide scanning without overwhelming the navy/gold brand hierarchy.

### Responsive Behavior & Touch

Collapse multi-column grids progressively, keep search and primary actions discoverable, and avoid duplicate interactive controls in the accessibility tree. Tables should switch to labeled cards or intentional horizontal scrolling with a visible cue.

## 6. Design System Notes for Stitch Generation

### Language to Use

Authoritative, editorial, precise, trustworthy, calm, information-rich, Indian regulatory intelligence, warm navy-and-gold, accessible legal-tech.

### Color References

Use Authority Navy for structure, Paper White for reading, Regulatory Gold sparingly for primary action, and regulator colors only as labeled taxonomy accents.

### Component Prompts

- “Create a regulatory update card with regulator and impact badges, strong editorial title, two-line summary, official source citation, effective date, reading time and accessible view count.”
- “Create an admin publishing workspace with grouped sidebar, command search, sticky draft status, SEO checklist, source validation and responsive article preview.”
- “Create a verified legal quick-answer panel showing scope, effective date, action required, deadline, penalty, exceptions and primary-source links.”

### Incremental Iteration

Start with content hierarchy and accessibility, then tune density and responsive behavior. Add motion only to navigation, disclosure and status feedback; keep the article reading surface visually stable.
