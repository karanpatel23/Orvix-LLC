# ORVIX LLC Website

## 1) Install dependencies
`npm install`

## 2) Run dev server
`npm run dev`

## 3) Build project
`npm run build`

## 4) Configure environment variables
Copy `.env.example` to `.env.local` and set either Resend (`RESEND_API_KEY`) or SMTP (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`) plus `CONTACT_FROM_EMAIL`.

## 5) Deploy on Vercel
Import repo in Vercel, set environment variables, and deploy.

## 6) Connect GoDaddy domain
In Vercel: Project → Settings → Domains → add domain. Then copy DNS records from Vercel and create/update matching records in GoDaddy DNS manager.

## 7) Update company/product settings
Edit `lib/data.ts` for company profile, products, navigation, and disclaimers.
Edit `app/globals.css` and `tailwind.config.ts` for brand colors.
