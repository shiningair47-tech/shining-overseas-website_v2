# Shining Overseas — Next.js Site

BAIRA-licensed overseas recruitment agency website. Migrated from Reflex (Python) to Next.js for Vercel deployment.

## Stack
- Next.js 14 (App Router)
- TypeScript
- Supabase (same DB as original Reflex app — fully backward compatible)
- bcryptjs for password hashing (matches original bcrypt format)

## Environment Variables (set these in Vercel)
```
SUPABASE_URL=https://llnhunfeedfcasxwiewt.supabase.co
SUPABASE_KEY=<service role key — NOT the publishable key>
NEXT_PUBLIC_APP_URL=https://shiningoverseas.com
```

## Pages
- `/` — Homepage (circulars, flights, awards, testimonials, contact form)
- `/login` — Staff / Influencer / Admin login
- `/portal` — Staff & Influencer dashboard
- `/builder` — Digital ID page builder (4-step wizard)
- `/site-admin` — Admin panel (7 tabs: Circulars, Flights, Awards, Testimonials, Accounts, Digital ID, Site Settings)
- `/p/[slug]` — Public Digital ID page (referral code based)
- `/student-visa` — Student visa info page

## Local Development
```bash
npm install
npm run dev
```

## Build
```bash
npm run build
npm run start
```
