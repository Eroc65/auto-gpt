# FrontDesk Pro Frontend

This is the Next.js frontend for FrontDesk Pro.

- Next.js
- React

## Current UI Slice

The frontend includes a Dispatch Assistant page at `/` that is wired to backend scheduling APIs:

- conflict check: `GET /api/jobs/scheduling/conflict`
- next-slot suggestion: `GET /api/jobs/scheduling/next-slot`
- dispatch action: `PATCH /api/jobs/{job_id}/dispatch`
- optional conflict buffer control: `buffer_minutes` (for conflict and next-slot queries)

The UI also includes a lightweight auth helper:

- signup + login flow to acquire token
- login-only flow for existing users
- token persistence in local storage for faster repeated testing

Business-hours note shown in the UI:

- default technician window is 8:00 AM to 7:00 PM Central, Monday to Friday

The frontend also includes a Lead Inbox page at `/leads`:

- list leads by organization
- mark lead contacted
- qualify lead with quick defaults (role-gated)
- book qualified leads to a technician/time (role-gated)
- role indicator via `/api/auth/me`
- lead activity timeline via `/api/leads/{lead_id}/activity`
- activity filters by action and rolling time window
- owner/admin role management panel backed by `/api/auth/users` and `/api/auth/users/{user_id}/role`
- role audit history panel with JSON filtering and CSV export

And a Metrics page at `/metrics`:

- daily intake, qualified, and booked conversion timeline
- conversion rates for selected day range
- recommended next action guidance from backend metrics

## Structure

- `pages/` — routes (`index.js`, `_app.js`)
	- includes `leads.js` for operator lead queue workflow
	- includes `metrics.js` for conversion reporting workflow
- `components/` — UI (`DispatchAssistant.js`)
- `lib/` — API helpers (`api.js`)
- `styles/` — global styles (`globals.css`)

## Setup

1. Install Node.js 18+ (includes `npm`).
2. Install dependencies:
	- `npm install`
	- if PowerShell blocks npm.ps1, use: `& "C:\Program Files\nodejs\npm.cmd" install`
3. Configure API base URL (optional):
	- PowerShell: `$env:NEXT_PUBLIC_API_BASE_URL="http://localhost:8001"`
4. Configure public intake routing (required for lead form):
	- Preferred: `$env:NEXT_PUBLIC_INTAKE_KEY="org_xxx"`
	- Legacy fallback: `$env:NEXT_PUBLIC_INTAKE_ORG_ID="1"`
5. Optional business contact overrides:
	- `$env:NEXT_PUBLIC_BOOKING_URL="https://cal.com/frontdeskpro/demo"`
	- `$env:NEXT_PUBLIC_SALES_PHONE="+1 (555) 010-2024"`
6. Start dev server:
	- `npm run dev`
	- PowerShell fallback: `& "C:\Program Files\nodejs\npm.cmd" run dev`
7. Open:
	- `http://localhost:3000`

## Build Validation

- `npm run build`
- PowerShell fallback: `& "C:\Program Files\nodejs\npm.cmd" run build`

## UI Smoke Test

- `npm run test:e2e`
- PowerShell fallback: `& "C:\Program Files\nodejs\npm.cmd" run test:e2e`
- Lead inbox only: `npx playwright test tests/leads-inbox.spec.js`
- Metrics only: `npx playwright test tests/metrics.spec.js`

## GoFieldwise Language Direction

- Frontend should continue in JavaScript/TypeScript with Next.js and React.
- TypeScript adoption is encouraged for new UI modules with complex state, API typing, and shared component contracts.
- Backend AI and integration logic remains Python-first in the FastAPI service.