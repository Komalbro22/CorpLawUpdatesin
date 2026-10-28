# CorpLawUpdates Admin API Key Reference (for AI Agent "Muse")

This document details the scoped API-key access to the CorpLawUpdates Admin API, including transport, security model, scopes, rate limits, and endpoint specifications.

---

## 1. Authentication & Security Model

### Transport
- **Base URL**: `https://www.corplawupdates.in` (or local `http://localhost:3000`)
- **Header**:
  ```http
  Authorization: Bearer clk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  ```
- **Header-Only Transport**: API keys are accepted **exclusively** via the `Authorization: Bearer` header. Any attempt to pass keys in query strings (e.g. `?key=...` or `?api_key=...`) is immediately rejected with `400 Bad Request`.
- **Browser Lockout**: Key-authenticated endpoints are server-to-server only; no CORS headers (`Access-Control-Allow-Origin`, etc.) are returned for API key authentication.
- **Serverless Rate Limiting**: If Upstash Redis is configured, sliding-window limits are enforced globally. When Upstash is absent, the in-memory fallback operates on a per-serverless-instance basis (best-effort). The IP-based invalid key throttle is persisted to the database to ensure protection across cold starts and instances.

### Granular Permission Scopes
Every route strictly verifies that the API key holds the required permission scope. A key lacking the required scope receives `403 Forbidden`.

| Scope | Description | Allowed Operations |
| :--- | :--- | :--- |
| `articles:read` | Read Articles | List articles, get single article |
| `articles:write` | Create & Edit Articles | Create articles, partial update (`PUT`/`PATCH`) |
| `articles:publish` | Publish / Unpublish | Transition status to published or draft |
| `articles:delete` | Delete Drafts | Delete **drafts only** (refuses published) |
| `glossary:read` | Read Glossary | List terms, get single term |
| `glossary:write` | Create & Edit Terms | Create, partial update, verify/unverify |
| `glossary:delete` | Delete Terms | Delete **unpublished/unverified only** |
| `media:read` | List Media | List files in `article-images` bucket |
| `media:write` | Upload Media | Upload images (WebP/JPEG/PNG/GIF ≤ 5 MB) |
| `media:delete` | Delete Media | Remove image from bucket |
| `newsletter:read` | Read Newsletter | List campaigns, get single campaign stats |
| `newsletter:write` | Create & Test | Create campaign draft, send test email |
| `newsletter:send` | Send Live Campaign | Dispatch batch email to all active subscribers |
| `subscribers:read` | Read Subscribers | List subscribers, stats, CSV export |
| `subscribers:write` | Manage Subscribers | Add subscriber, update status (unsubscribe) |
| `feedback:read` | Read Feedback | List reader feedback, stats, get single item |
| `feedback:write` | Update Feedback | Update status (processed/resolved) & notes |
| `partner-interests:read` | Read Partner Interests | List partner applications, get single lead, stats |
| `partner-interests:write` | Update Partner Status & Notes | Transition status (pending/reviewed/contacted/onboarded) & notes only |
| `analytics:read` | Read Analytics | Read-only article views & CMS totals |
| `audit:read` | Read Audit Log | Read API write audit records |

### Safety Hard Limits
Regardless of assigned scopes, API keys:
1. **Can NEVER delete a published article or verified glossary term.** If an API key attempts to delete a published record, the server returns `403 Forbidden`. Deletes apply to drafts/unpublished items only.
2. **Can NEVER touch user accounts, roles, or passwords.**
3. **Can NEVER modify site settings or rate limiting policies.**
4. **Can NEVER create, view, or revoke API keys** (restricted to Super Admin session cookies).
5. **Can NEVER delete partner interest submissions.** API keys attempting `DELETE /api/admin/partner-interests/<id>` receive `403 Forbidden`. Lead deletions are restricted to admin UI sessions only.

---

## 2. Security Checklist

- [x] **Key Generation Entropy**: Generated using 32 cryptographically random bytes (256 bits of entropy) resulting in `clk_` + 64 hex characters.
- [x] **One-Time Display**: Displayed to Super Admin exactly once upon creation or regeneration; never stored or retrievable in plain text.
- [x] **Secure Storage**: Server stores only the SHA-256 hash (`key_hash`) and an 8-character identification prefix (`prefix`).
- [x] **Transport Enforcement**: Key accepted exclusively via `Authorization: Bearer <key>`. Query string keys are rejected.
- [x] **Scope Enforcement**: Opt-in per route; missing scope returns `403 Forbidden` with the missing scope name.
- [x] **Published Article & Term Protection**: `DELETE` on any published article or verified glossary term returns `403 Forbidden`.
- [x] **Rate Limiting**: 300 req/hour standard per key, 5 req/hour for newsletter dispatch. Returns `429 Too Many Requests` with `Retry-After`.
- [x] **IP Throttle**: 10 invalid key attempts from an IP locks out the IP for 15 minutes.
- [x] **Audit Log**: All write, publish, delete, and send events are logged to `api_audit_log` with key name, action, entity, timestamp, IP, and status.
- [x] **Zero Seeded Keys**: System ships with zero valid keys. Production key is generated by Komal in Admin Settings.

---

## 3. Endpoints Specification

### 0. Identity & Health

#### `GET /api/admin/whoami`
Tests connection and returns identity.
- **Required Scope**: Any valid API key or admin session.
- **Response (API Key)**:
  ```json
  {
    "type": "api_key",
    "key_name": "Muse AI Production Agent",
    "prefix": "clk_8f3a9e1b",
    "scopes": ["articles:read", "articles:write", "articles:publish"],
    "server_time": "2026-10-24T09:30:00.000Z"
  }
  ```

---

### 1. Articles

#### `GET /api/admin/articles`
- **Required Scope**: `articles:read`
- **Query Params**: `?status=all|published|draft&category=MCA&search=rules&limit=20&offset=0`
- **Response**:
  ```json
  {
    "items": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "title": "MCA Clarification on Fast Track Mergers",
        "slug": "mca-clarification-fast-track-mergers-2026",
        "category": "MCA",
        "summary": "Key amendments to Section 233...",
        "published_at": "2026-10-20T10:00:00.000Z",
        "effective_date": "2026-11-01",
        "last_verified": "2026-10-24"
      }
    ],
    "total": 1,
    "categoryCounts": { "MCA": 45, "SEBI": 30 }
  }
  ```

#### `GET /api/admin/articles/<id>`
- **Required Scope**: `articles:read`
- **Response**: Full article record including `content` HTML body and all metadata fields.

#### `POST /api/admin/articles`
- **Required Scope**: `articles:write`
- **Headers**: `Idempotency-Key: <unique-uuid>` (optional but recommended for safe retries)
- **Quality Gate Note**: If `noindex` is not explicitly provided, articles under 800 words automatically default to `noindex: true`.
- **Request Body**:
  ```json
  {
    "title": "RBI Releases Revised Liquidity Coverage Framework",
    "slug": "rbi-revised-liquidity-coverage-framework-2026",
    "category": "RBI",
    "summary": "Mandatory runoff rates revised for retail deposits.",
    "content": "<p>Full article body HTML...</p>",
    "effective_date": "2026-12-01",
    "last_verified": "2026-10-24",
    "impact_level": "High",
    "key_change": "Increased runoff rate on non-operational deposits.",
    "key_takeaways": ["Takeaway 1", "Takeaway 2"],
    "tags": ["RBI", "Banking", "Liquidity"],
    "source_name": "Reserve Bank of India",
    "source_url": "https://www.rbi.org.in/notif/2026/10",
    "published_at": null
  }
  ```
- **Response**: `201 Created` with created article record.

#### `POST /api/admin/articles/bulk`
- **Required Scope**: `articles:write`
- **Batch Limit**: 1 to 50 articles per request (serverless timeout safeguard).
- **Quality Gate**: Content < 800 words defaults to `noindex: true` unless explicitly set. Content >= 800 words defaults to `noindex: false` and triggers Google Indexing & IndexNow if published.
- **Request Body**:
  ```json
  {
    "articles": [
      {
        "title": "MCA Extends Due Date for Form MGT-7 and AOC-4",
        "slug": "mca-extends-due-date-mgt7-aoc4-2026",
        "summary": "Extension granted till 30 November 2026.",
        "content": "<p>Detailed circular analysis...</p>",
        "category": "MCA",
        "tags": ["MCA", "MGT-7"],
        "key_change_pill": "Extension Granted",
        "tldr": ["Deadline moved to Nov 30"],
        "last_verified_date": "2026-10-24"
      }
    ],
    "on_conflict": "skip"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "total": 1,
    "succeeded": 1,
    "failed": 0,
    "skipped": 0,
    "results": [
      {
        "index": 0,
        "title": "MCA Extends Due Date for Form MGT-7 and AOC-4",
        "slug": "mca-extends-due-date-mgt7-aoc4-2026",
        "status": "created",
        "word_count": 890,
        "noindex": false,
        "is_indexed": false
      }
    ]
  }
  ```

#### `PUT / PATCH /api/admin/articles/<id>`
- **Required Scope**: `articles:write`
- **Partial Update**: Send only the fields to update. Untouched fields remain byte-for-byte identical.
- **Slug Conflict**: Returns `409 Conflict` if target slug is already taken.

#### `POST /api/admin/articles/<id>/publish`
- **Required Scope**: `articles:publish`
- **Headers**: `Idempotency-Key: <unique-uuid>`
- **Response**: `200 OK` — sets `published_at`, triggers `IndexNow`, Google Indexing, and cache revalidation.

#### `POST /api/admin/articles/<id>/unpublish`
- **Required Scope**: `articles:publish`
- **Response**: `200 OK` — sets `published_at: null` and revalidates cache.

#### `DELETE /api/admin/articles/<id>`
- **Required Scope**: `articles:delete`
- **Safety Restriction**: **Drafts only**. If the article has `published_at !== null`, returns `403 Forbidden`.

---

### 2. Glossary

#### `GET /api/admin/glossary`
- **Required Scope**: `glossary:read`
- **Query Params**: `?search=amalgamation&category=MCA&limit=50&offset=0`

#### `POST /api/admin/glossary`
- **Required Scope**: `glossary:write`
- **Quality Gate Note**: If `noindex` is not explicitly set to `false`, entries under 800 total words automatically receive `noindex: true`.
- **Request Body**:
  ```json
  {
    "term": "Small Company",
    "slug": "small-company",
    "definition": "A company meeting statutory capital thresholds under Section 2(85)...",
    "category": "MCA",
    "full_form": "Small Company under CA 2013",
    "seo_title": "What is a Small Company? Definition & Thresholds",
    "tldr": ["Paid up capital <= 4 Cr", "Turnover <= 40 Cr"],
    "is_verified": false
  }
  ```

#### `POST /api/admin/glossary/bulk`
- **Required Scope**: `glossary:write`
- **Batch Limit**: 1 to 100 glossary definitions per request (designed for batch uploads of 50-85+ terms).
- **Quality Gate**: Total words (definition + extended_note + faqs) < 800 words defaults to `noindex: true` and exclusion from `sitemap.xml`. Entries >= 800 words default to `noindex: false` and are eligible for search indexing.
- **Request Body**:
  ```json
  {
    "terms": [
      {
        "term": "Charge Satisfaction",
        "slug": "charge-satisfaction",
        "definition": "Complete discharge of a registered debt or mortgage...",
        "category": "MCA",
        "extended_note": "## Statutory Framework: Section 82 of Companies Act, 2013\n\nFull analysis...",
        "tldr": ["Form CHG-4 must be filed within 30 days"],
        "is_verified": true
      }
    ],
    "on_conflict": "skip"
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "total": 1,
    "succeeded": 1,
    "failed": 0,
    "skipped": 0,
    "results": [
      {
        "index": 0,
        "term": "Charge Satisfaction",
        "slug": "charge-satisfaction",
        "status": "created",
        "word_count": 910,
        "is_indexed": true
      }
    ]
  }
  ```

#### `PUT / PATCH /api/admin/glossary/<id>`
- **Required Scope**: `glossary:write`
- **Partial Save Rule**: Preserves existing structured metadata block (`<!-- METADATA ... METADATA -->`) and untouched fields.

#### `POST /api/admin/glossary/<id>/publish` & `unpublish`
- **Required Scope**: `glossary:write`
- Sets `is_verified: true` (published) or `false` (unpublished) with cache revalidation.

#### `DELETE /api/admin/glossary/<id>`
- **Required Scope**: `glossary:delete`
- **Safety Restriction**: Refuses deletion of verified/published terms with `403 Forbidden`.

---

### 3. Media & Uploads

#### `POST /api/admin/media/upload`
- **Required Scope**: `media:write`
- **Content-Type**: `multipart/form-data` (`file` field, WebP/JPEG/PNG/GIF ≤ 5 MB)
- **Response**:
  ```json
  {
    "url": "https://<supabase-project>.supabase.co/storage/v1/object/public/article-images/1729760000-rbi-chart.png",
    "path": "1729760000-rbi-chart.png",
    "width": 1200,
    "height": 630,
    "size": 184520
  }
  ```

#### `GET /api/admin/media`
- **Required Scope**: `media:read`
- **Query Params**: `?limit=50&offset=0&search=rbi`

#### `DELETE /api/admin/media/<path>`
- **Required Scope**: `media:delete`

---

### 4. Newsletter

#### `GET /api/admin/newsletter/campaigns`
- **Required Scope**: `newsletter:read`

#### `POST /api/admin/newsletter/campaigns`
- **Required Scope**: `newsletter:write`
- **Request Body**:
  ```json
  {
    "subject": "CorpLawUpdates Digest: Week 43",
    "html": "<h2>Top Corporate Law Changes</h2><p>Here are this week's highlights...</p>"
  }
  ```

#### `POST /api/admin/newsletter/campaigns/<id>/test`
- **Required Scope**: `newsletter:write`
- **Request Body**: `{ "testEmail": "editor@corplawupdates.in" }`

#### `POST /api/admin/newsletter/campaigns/<id>/send`
- **Required Scope**: `newsletter:send` (Separate, revocable scope)
- **Double-Send Protection**: Idempotent. If the campaign is already sent, immediately returns `{ success: true, already_sent: true }` without sending again.
- **Guarantees**: Excludes unsubscribed users, includes one-click unsubscribe links, dispatches via Resend/active email provider.

---

### 5. Subscribers

#### `GET /api/admin/subscribers`
- **Required Scope**: `subscribers:read`
- **Query Params**: `?status=active|inactive&search=test@&limit=50&offset=0`

#### `GET /api/admin/subscribers/stats`
- **Required Scope**: `subscribers:read`
- **Response**: `{ "totalActive": 1420, "totalInactive": 45, "newThisWeek": 28, "newThisMonth": 110 }`

#### `GET /api/admin/subscribers/export`
- **Required Scope**: `subscribers:read`
- Returns CSV attachment. Audit-logged without writing emails into logs.

#### `POST /api/admin/subscribers`
- **Required Scope**: `subscribers:write`
- **Request Body**: `{ "email": "user@example.com", "source": "api" }`

#### `PATCH /api/admin/subscribers/<id>`
- **Required Scope**: `subscribers:write`
- **Request Body**: `{ "is_active": false }` (e.g. manual unsubscribe)

---

### 6. Reader Feedback

#### `GET /api/admin/feedback`
- **Required Scope**: `feedback:read`
- **Query Params**: `?status=unprocessed|processed|resolved&type=article|calculator&limit=20`

#### `GET /api/admin/feedback/stats`
- **Required Scope**: `feedback:read`
- **Response**: `{ "total": 85, "positive": 60, "negative": 25, "unprocessed": 12, "helpful_percentage": 71 }`

#### `PATCH /api/admin/feedback/<id>`
- **Required Scope**: `feedback:write`
- **Request Body**: `{ "status": "resolved", "note": "Clarified in latest article update" }`

---

### 7. Analytics

#### `GET /api/admin/analytics/overview`
- **Required Scope**: `analytics:read`
- Returns native CMS counts: `total_articles`, `total_views`, `total_subscribers`, `articles_this_week`, `pending_feedback`, `top_articles`.

#### `GET /api/admin/analytics/articles`
- **Required Scope**: `analytics:read`
- **Query Params**: `?sort=views_desc&limit=50&offset=0`

#### `GET /api/admin/analytics/articles/<id>`
- **Required Scope**: `analytics:read`

---

### 8. Audit Log

#### `GET /api/admin/audit-log`
- **Required Scope**: `audit:read`
- **Query Params**: `?key=Muse&action=article:create&status=success&limit=50&offset=0`

---

### 9. Partner Interests

#### `GET /api/admin/partner-interests`
- **Required Scope**: `partner-interests:read`
- **Query Params**:
  - `status`: `all` | `pending` | `reviewed` | `contacted` | `onboarded` | `rejected` (default: `all`)
  - `partnership_type`: Filter by interest (e.g. `Sponsored Article`, `Featured Partner Listing`, `Product or Service Promotion`, `Referral Partnership`)
  - `service`: Filter by compliance service category
  - `since`: ISO timestamp string (e.g. `2026-10-28T00:00:00.000Z`) to fetch leads created after a specific time
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 25, hard cap: 100)
  - `search`: Search query string across firm name, contact, qualification, notes
- **Example Response**:
  ```json
  {
    "items": [
      {
        "id": "520f344b-5bde-4da0-b3b4-031f3cc31617",
        "firm_or_individual_name": "komal",
        "qualification": "CS",
        "experience_years": 5,
        "website": "https://example.com",
        "services": ["demo"],
        "services_offered": ["demo"],
        "partnership_types": ["Sponsored Article"],
        "partnership_interests": ["Sponsored Article"],
        "product_description": "demo tool",
        "product_service_description": "demo tool",
        "message": "Interested in partnering",
        "contact_preference": "Email",
        "preferred_contact_method": "Email",
        "contact_value": "komal@example.com",
        "contact_details": "komal@example.com",
        "status": "pending",
        "created_at": "2026-10-28T13:06:36.608Z",
        "submission_date": "2026-10-28T13:06:36.608Z",
        "additional_notes": "Demo note",
        "note": "Demo note"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 25,
    "stats": {
      "total": 1,
      "pending": 1,
      "reviewed": 0,
      "contacted": 0,
      "onboarded": 0
    }
  }
  ```

#### `GET /api/admin/partner-interests/<id>`
- **Required Scope**: `partner-interests:read`
- **Response**: Single partner interest item with all fields and aliases.

#### `GET /api/admin/partner-interests/stats`
- **Required Scope**: `partner-interests:read`
- **Response**:
  ```json
  {
    "total": 1,
    "pending": 1,
    "reviewed": 0,
    "contacted": 0,
    "onboarded": 0
  }
  ```

#### `PATCH /api/admin/partner-interests/<id>`
- **Required Scope**: `partner-interests:write`
- **Allowed Fields Only**: `status`, `note` (unknown fields return `400 Bad Request` naming the unrecognized field)
- **Allowed Statuses**: `pending`, `reviewed`, `contacted`, `onboarded`, `rejected`
- **Audit Logging**: Every status transition is automatically logged in `api_audit_log` with the actor key name, timestamp, and old/new status.
- **Request Body**:
  ```json
  {
    "status": "reviewed",
    "note": "Initial outreach initiated via email."
  }
  ```
- **Response**: `200 OK` with updated partner interest record.

#### `DELETE /api/admin/partner-interests/<id>`
- **Safety Hard Limit**: API keys cannot delete partner interest submissions. Returns `403 Forbidden`. Deletions must be performed manually in the admin dashboard by a logged-in Super Admin.

---

## 4. The 800-Word Quality Gate & Indexing Protection

To prevent Google AdSense **"Low-Value Content"** rejections and Google Search **"Thin Content"** algorithmic downgrades, CorpLawUpdates enforces an automated 800-Word Quality Gate:

1. **Threshold**: 800 words of substantive corporate law content.
   - For **Articles**: Calculated from `content` + `summary` (HTML tags stripped).
   - For **Glossary Terms**: Calculated across `definition` + clean `extended_note` (metadata comments excluded) + `faqs` (questions and answers).
2. **Automated Enforcement**:
   - If an article or glossary entry contains **< 800 words**, the API automatically assigns `noindex: true`.
   - The public webpage renders `<meta name="robots" content="noindex, follow">`.
   - The URL is **excluded** from `sitemap.xml` so Search Console reports zero crawl errors.
   - External submission to Google Indexing API and IndexNow is suppressed.
   - Readers and internal cross-linkers can still read and link to the content.
3. **Indexable Content (>= 800 words)**:
   - Eligible for public indexing (`noindex: false`).
   - Automatically dispatched to Google Indexing API and IndexNow upon publication.
   - Included in `sitemap.xml`.
4. **Explicit Override**:
   - Authors can explicitly pass `"noindex": false` in the API payload if a specific short statutory update must be indexed regardless of word count.

