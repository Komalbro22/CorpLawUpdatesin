# Admin Panel Enhancements - Functions & Features Plan

## Overview of Sections
1. **Section 1: Database** - Create `site_settings` table and RLS policies (SQL to run).
2. **Section 2: Types & Utils** - Define `SiteSetting` type and create utility functions in `lib/settings.ts`.
3. **Section 3: Settings API Route** - Create `app/api/admin/settings/route.ts` (GET and POST).
4. **Section 4: Analytics API Route** - Create `app/api/admin/analytics/route.ts` (GET overview, top articles, etc.).
5. **Section 5: Admin Analytics Page** - Create `app/admin/analytics/page.tsx`.
6. **Section 6: Admin Settings Page** - Create `app/admin/settings/page.tsx`.
7. **Section 7: Make WhatsApp Button Dynamic** - Create `app/api/settings/whatsapp/route.ts` (GET) and update `components/WhatsAppButton.tsx`.
8. **Section 8: Add Announcement Bar** - Create `components/AnnouncementBar.tsx` and add to `app/layout.tsx`.
9. **Section 9: Update Admin Sidebar** - Add new links in `app/admin/layout.tsx`.
10. **Section 10: Google Analytics** - Conditionally inject GA4 script in `app/layout.tsx`.

## Core Functions & Methods to Implement

### Database & Utils
- `getAllSettings(): Promise<Record<string, string>>` 
- `getSetting(key: string): Promise<string>`
- `updateSetting(key: string, value: string): Promise<boolean>`

### API Route Methods
- **Admin Settings (`app/api/admin/settings/route.ts`)**:
  - `GET()`: Fetches all site settings for admin (requires admin session).
  - `POST(request: Request)`: Updates a specific site setting via `key`/`value` (requires admin session).
- **Admin Analytics (`app/api/admin/analytics/route.ts`)**:
  - `GET()`: Fetches app analytics such as total articles, subscribers, views, top articles, category breakdown.
- **Public WhatsApp URL (`app/api/settings/whatsapp/route.ts`)**:
  - `GET()`: Fetches public WhatsApp channel settings without requiring auth.

### React Components
- `AnalyticsPage()`: Admin dashboard for displaying performance metrics.
- `SettingsPage()`: Admin UI to view and update site settings.
- `WhatsAppButton()`: Dynamic client floated button for joining WA.
- `AnnouncementBar()`: Dynamic server side banner at the top of the app.
- `RootLayout()`: Updates to inject GA4 and AnnouncementBar.
