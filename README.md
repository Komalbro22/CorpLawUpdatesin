# CorpLawUpdates.in

India's Free Corporate Law Intelligence Platform

## Tech Stack
- Next.js 14 (App Router)
- Supabase (PostgreSQL + RLS + Storage)
- Tailwind CSS + @tailwindcss/typography
- Resend (email)
- Vercel (hosting)

## Setup Instructions

### 1. Clone and install
git clone [your-repo]
cd corplawupdates
npm install

### 2. Environment variables
cp .env.example .env.local
Fill in all values in .env.local

### 3. Database setup
Go to Supabase SQL Editor
Run: supabase/migrations/001_initial.sql

### 4. Run locally
npm run dev

### 5. Deploy to Vercel
- Connect GitHub repo to Vercel
- Add all env vars from .env.example in Vercel dashboard
- Deploy

## Admin Panel
Access at: /admin/login
Password: set in ADMIN_PASSWORD env var

## Adding Content
Login to /admin → New Article → Write in Markdown → Publish
