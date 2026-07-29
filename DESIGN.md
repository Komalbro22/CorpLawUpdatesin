---
version: alpha
name: CorpLawUpdates
description: Design system for CorpLawUpdates.in — Indian corporate law, tax, MCA, SEBI, and RBI compliance platform.
colors:
  bg-primary: "#F8FAFC"
  bg-secondary: "#FFFFFF"
  bg-card: "#FFFFFF"
  bg-nav: "#FFFFFF"
  bg-hover: "#F1F5F9"
  text-primary: "#0F172A"
  text-secondary: "#334155"
  text-muted: "#64748B"
  text-subtle: "#94A3B8"
  border-default: "#E2E8F0"
  border-light: "#F1F5F9"
  navy: "#0B1F3A"
  gold: "#C9A84C"
  gold-hover: "#B8963B"
  category-mca: "#3B82F6"
  category-sebi: "#10B981"
  category-rbi: "#8B5CF6"
  category-nclt: "#F97316"
  category-ibc: "#EF4444"
  category-fema: "#14B8A6"
  category-cci: "#6366F1"
  category-labour: "#F59E0B"
  dark-bg-primary: "#040814"
  dark-bg-card: "#0E1626"
  dark-bg-surface: "#111827"
typography:
  heading:
    fontFamily: Outfit
  body:
    fontFamily: Source Sans Pro
  sans:
    fontFamily: Inter
  serif:
    fontFamily: Playfair Display
  mono:
    fontFamily: JetBrains Mono
rounded:
  card: 12px
  badge: 6px
  button: 8px
spacing:
  container: 1280px
  card-padding: 1.25rem
  header-height: 4rem
---

# Overview

CorpLawUpdates.in provides real-time corporate regulatory updates, circular breakdowns, and statutory compliance tools for Company Secretaries (CS), Chartered Accountants (CA), and corporate compliance professionals in India.

## Colors

- **Primary Dark / Navy**: `#0B1F3A` / `#0F172A` — Used for main navigation, high-contrast headers, and dark mode containers.
- **Brand Accent / Gold**: `#C9A84C` (Hover: `#B8963B`) — Used for key action highlights, badges, active tabs, and primary CTAs.
- **Neutral Light Backgrounds**: `#F8FAFC` (Page background), `#FFFFFF` (Card & Surface background), `#F1F5F9` (Hover background).
- **Text Scale**: `#0F172A` (Primary text), `#334155` (Secondary text), `#64748B` (Muted caption text), `#94A3B8` (Subtle metadata).
- **Regulatory Category Colors**:
  - MCA (Ministry of Corporate Affairs): `#3B82F6` (Blue)
  - SEBI (Securities and Exchange Board of India): `#10B981` (Emerald)
  - RBI (Reserve Bank of India): `#8B5CF6` (Violet)
  - NCLT (National Company Law Tribunal): `#F97316` (Orange)
  - IBC (Insolvency and Bankruptcy Code): `#EF4444` (Red)
  - FEMA (Foreign Exchange Management Act): `#14B8A6` (Teal)
  - CCI (Competition Commission of India): `#6366F1` (Indigo)
  - Labour Law (Ministry of Labour & Employment / Labour Codes): `#F59E0B` (Amber)

## Typography

- **Heading Scale**: `Outfit` (`var(--font-outfit)`), fallback `Lora` or `sans-serif`. Used for all H1–H6 elements.
- **Body Content**: `Source Sans Pro` (`var(--font-source-sans)`), fallback `Arial`, `sans-serif`. Used for main reading typography and statutory circular texts.
- **Interface & Controls**: `Inter` (`var(--font-inter)`), fallback `system-ui`. Used for navigation links, inputs, filter dropdowns, and button labels.
- **Serif Accents**: `Playfair Display` (`var(--font-playfair)`), fallback `Georgia`. Used sparingly for quote highlights and editorial subtitles.
- **Monospace Code / Reference**: `JetBrains Mono` (`var(--font-jetbrains-mono)`), fallback `monospace`. Used for section reference codes (e.g. Sec 185, Rule 3(1)).

## Layout & Structure

- **Max Container Width**: `1280px` (`max-w-7xl` centered with `mx-auto px-4 sm:px-6 lg:px-8`).
- **Grid Patterns**:
  - Homepage Hero: Asymmetric 2-column layout (70% main feed, 30% sticky sidebar / ROC deadline widget).
  - Updates Listing: 3-column responsive grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`).
  - Article Page: 12-column layout (8 columns main article content + TOC, 4 columns sidebar tools & related updates).
- **Borders & Radii**:
  - Cards: `12px` (`rounded-xl` or custom `rounded-card`).
  - Badges & Pills: `6px` (`rounded-md` or `rounded-full` for status tags).
  - Inputs & Buttons: `8px` (`rounded-lg`).

## Component Specifications

- **Navbar (`components/Navbar.tsx`)**: Sticky header with brand logo (`CorpLawUpdates.in`), regulatory category navigation links, global search bar (`GlobalSearch.tsx`), dark mode toggle (`DarkModeToggle.tsx`), notification bell (`NotificationBell.tsx`), and mobile menu drawer.
- **Update Card (`components/UpdateCard.tsx`)**: Regulatory update item with Category Badge, Date tag, Statutory section badge, title link, brief summary excerpt, and reading time indicator.
- **Article Layout (`app/updates/[slug]/page.tsx`)**: Includes breadcrumbs, article metadata, category badge, font size controls, share buttons (`ArticleActions.tsx`), table of contents (`TableOfContents.tsx`), statutory text markdown renderer (`MarkdownRenderer.tsx`), and compliance modal triggers.
- **Glossary Listing (`app/glossary/page.tsx`)**: Alphabetical filter bar, search filter, term definitions card list, and schema definition structured data.
- **Footer (`components/Footer.tsx`)**: Multi-column layout with quick links, category links, legal disclaimers, newsletter subscription form, and social links.

## Do's and Don'ts

### Do's
- Maintain high contrast ratios for statutory text and regulatory circular code snippets (minimum 4.5:1 WCAG AA).
- Preserve category badge color mappings consistently across all list cards, article pages, and search filters.
- Ensure all interactive elements retain focus outline rings (`outline-2 outline-offset-2 outline-[var(--ring-focus)]`).

### Don'ts
- Do not mix arbitrary ad-hoc Tailwind colors (e.g. `bg-amber-300`, `text-indigo-400`) outside the defined category and brand color tokens.
- Do not remove semantic HTML headers (`<h1>` per page, hierarchical `<h2>`, `<h3>`).
- Do not add heavy JavaScript animation libraries; stick to CSS transitions and hardware-accelerated transforms.
