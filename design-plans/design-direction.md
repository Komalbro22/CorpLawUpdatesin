# CorpLawUpdates.in — Visual Design Direction & Token Architecture

## Target Audience & Product Context
- **Audience**: Company Secretaries (CS), Chartered Accountants (CA), Compliance Officers, Corporate Lawyers, and CFOs.
- **Core Need**: High visual authority, instant statutory scanning, zero distraction, fast identification of regulators (MCA, SEBI, RBI, NCLT, IBC, FEMA), and seamless reading of dense circulars & statutory compliance updates.

---

## 1. Token System & Design Architecture

### A. Color Palette (6 Core Tokens + Regulator Signatures)

| Token Name | Light Value | Dark Value | Usage & Intent |
| :--- | :--- | :--- | :--- |
| **`navy-deep`** | `#081427` | `#040814` | Primary brand anchor. Used for main navigation, footer, hero structure, and high-trust headers. |
| **`gold-statutory`**| `#B45309` (Text/Border)<br>`#C9A84C` (Fill) | `#F59E0B` | Primary accent for CTAs, active navigation indicators, key statutory highlights, and verification badges. |
| **`surface-canvas`**| `#F8FAFC` | `#080E1A` | Main page canvas background — crisp, low eye-strain neutral. |
| **`surface-card`**  | `#FFFFFF` | `#0E1626` | Card and content container surface with subtle 1px border. |
| **`text-main`**     | `#0F172A` | `#F8FAFC` | High-contrast primary text for statutory titles and body copy. |
| **`text-muted`**    | `#64748B` | `#94A3B8` | Subtitles, reading time, publication date, and secondary metadata. |

#### Dedicated Regulator Accent Tokens
- **MCA** (Ministry of Corporate Affairs): `Blue-600` (`#2563EB`)
- **SEBI** (Securities & Exchange Board): `Emerald-600` (`#059669`)
- **RBI** (Reserve Bank of India): `Violet-600` (`#7C3AED`)
- **NCLT** (National Company Law Tribunal): `Orange-600` (`#EA580C`)
- **IBC** (Insolvency & Bankruptcy Code): `Red-600` (`#DC2626`)
- **FEMA** (Foreign Exchange Management): `Teal-600` (`#0D9488`)

---

### B. Typography Hierarchy & Pairings

1. **Headings & Titles**: `Outfit` (`var(--font-outfit)`)
   - Geometric precision with clean, modern clarity.
   - H1: `text-4xl md:text-5xl font-bold tracking-tight leading-tight`
   - H2: `text-2xl md:text-3xl font-bold tracking-tight`
   - H3: `text-lg md:text-xl font-semibold`
2. **Statutory Reading Content**: `Source Sans 3` (`var(--font-source-sans)`)
   - Humanist sans designed for high readability in dense legal paragraphs and circular breakdowns.
3. **UI Controls & Navigation**: `Inter` (`var(--font-inter)`)
   - Standard interface typography for navigation items, search inputs, dropdowns, and button labels.
4. **Statutory Citations & Monospace Tags**: `JetBrains Mono` (`var(--font-jetbrains-mono)`)
   - Used for section reference codes (e.g. `Sec 185(1)`), MCA form codes (e.g. `PAS-3`, `MGT-7A`), and circular reference numbers.

---

### C. Spacing & Density Scale
- **Base Grid**: 4px micro-grid.
- **Card Padding**: `p-5 md:p-6` (compact, professional density for high information display).
- **Grid Layouts**:
  - Container Max Width: `1280px` (`max-w-7xl`).
  - Feed Cards: 3-column grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`).

---

## 2. Signature Product Element: "The Statutory Gazette Ledger Rail"

Instead of generic AI decorative flourishes (blobs, waves, or neon glows), CorpLawUpdates will feature a signature visual component tied directly to Indian statutory reporting:

### **The Gazette Ledger Rail (`components/shared/GazetteLedgerRail.tsx`)**
- A distinctive 4px vertical accent rail embedded on every update card and article hero.
- The rail dynamically inherits the **Regulator's Brand Color** (MCA Blue, SEBI Emerald, RBI Violet, etc.).
- Embedded alongside the rail is a monospaced **Statutory Section Tag** (e.g., `[Circular 04/2026]`) and an interactive **Impact Indicator** (`⚡ Mandatory Compliance` / `ℹ️ Informational`).
- **Why this fits**: Instantly allows Company Secretaries and CAs to visually scan dense feeds, instantly recognize the issuing regulator, and gauge compliance urgency within milliseconds.

---

## 3. Implementation Order & Safety Rules

Once approved, implementation will proceed in strict order:
1. **Design Tokens**: Tailwind config & CSS custom variables (`tailwind.config.ts`, `app/globals.css`).
2. **Shared Components**: `Navbar`, `Footer`, `Button`, `UpdateCard`, `CategoryBadge`, `ArticleLayout`.
3. **Pilot Page**: Homepage (`/`). STOP and present for review.
4. **Full Rollout**: Article page template (`/updates/[slug]`), Glossary page (`/glossary`), Tools, Calendar.

### Non-Negotiable Safety Checklist
- ❌ **NEVER modify**: SEO metadata, JSON-LD schemas, `sitemap.xml`, `robots.txt`, `llms.txt`, Supabase queries, or URL routes.
- ✅ **Run `npm run build` and `npm run lint`** after EVERY step.
