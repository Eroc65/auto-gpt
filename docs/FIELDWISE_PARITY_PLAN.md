# FrontDesk Pro Feature Master Spec (Fieldwise Parity + Beyond)

## Product Statement
FrontDesk Pro is AI-first front desk software for trades businesses. It must match Fieldwise operational capability and also ship the advanced sections listed below, including areas Fieldwise has not yet completed.

## Core Feature Inventory

### AI Receptionist - Adrian
- Retell AI + Twilio voice intake.
- Trade-specific conditional intake for HVAC, Plumbing, Electrical, and General.
- 120-second demo cap for sandbox callers.
- Urgency auto-escalation for emergency scenarios.
- Post-call extraction for name, service type, address, and urgency.
- Live extraction feed on landing page.
- Gemini 2.0 Flash for cost-optimized orchestration.
- Phone number reference: +1 (602) 932-0967.

### SMS Infrastructure (Twilio)
- A2P 10DLC-compliant messaging.
- Inbound and outbound SMS via Twilio Messaging Service.
- Post-call SMS confirmations.
- Job-status automated texts (on-the-way, confirmation, invoice).
- Missed-call text-back.
- A2P starter brand registration support.

### Dead Lead Auto-Recovery
- 30-minute non-conversion auto follow-up SMS.
- 1-hour recovery email with recap and booking link.
- 24-hour nudge SMS.
- Stop triggers: booked, replied, called back, or marked not interested.
- Lead recovery state labels: Recovering, Recovered, Lost.

### Lead Management and Outreach
- Oklahoma business scraper (CIB, SOS, ORCA, YellowPages).
- Outreach leads table with source tracking.
- Dynamic trade filter.
- Deduplication logic.
- Admin controls for scraper runs.

### Ads Performance Dashboard
- Traffic source breakdown (Meta, Twitter, Direct, Organic).
- Cost Per Lead (CPL) calculator.
- UTM tracking on Meta Ads.
- Date range filters (7d, 30d, 90d).
- Color-coded CPL thresholds.

### Admin Dashboard
- Unified admin navigation (Dashboard, Leads, Analytics, Ads Management).
- Admin login gate.
- Call logs with quality scores and extraction data.
- Visitor analytics (traffic sources, CTA clicks, scroll depth, funnel).
- Warm leads management.

### Ads Management Page
- Meta Ads status and daily spend.
- Twitter activity.
- Cold email tracking.
- UTM references.

### Invoice Dunning Automation
- Auto-reminders for unpaid invoices (Day 1, 7, 14).
- SMS and email reminders.
- Overdue invoice dashboard with dunning status.
- Manual overrides: skip, pause, escalate.
- Auto-stop when payment is received.

### Authentication and Security
- Forgot password flow with reset link and 1-hour expiry.
- Forgot username/email recovery by business name.
- Shared recovery support across live, trial, demo, and admin login paths.

### Upgrade and Subscription
- Stripe checkout for $200/month plan.
- Upgrade page with feature summary.
- Post-subscription dashboard experience.
- Cancellation at period end.
- Account settings with plan details.

### SEO and Indexing
- sitemap.xml and robots.txt.
- Meta tags and Open Graph tags on all pages.
- JSON-LD (LocalBusiness and SoftwareApplication).
- Canonical URLs.
- SPA catch-all routes to avoid crawler 404s.

### Legal and Compliance
- Privacy Policy with A2P SMS compliance language.
- Terms of Service with HELP and STOP instructions.
- Cookie Policy page.
- CCPA Do Not Share opt-out page.

### Landing Page
- Phone-based Call Adrian demo.
- Live extraction feed.
- Switch in 24 Hours positioning.
- Competitor comparison table.
- 9-step animated How It Works section.
- Proof section with screenshots.
- Social profile links in footer.
- Hero messaging: Built for the first van. Ready for the full crew.
- Nationwide targeting copy.
- Meta Pixel tracking (ID: 938510368760818).

### Multi-Tenant Architecture
- Twilio subaccounts per tenant.
- Per-tenant phone numbers.
- Per-tenant Retell agents and knowledge bases.
- Tenant provisioning API.
- Messaging service per tenant.

## Confirmed Not Built Yet
- Native app store distribution pipeline (App Store and Google Play publishing).

## FrontDesk Pro Current Delta
- Marketing campaign backend foundation is in place for review and reactivation campaign creation and launch APIs.
- Review Harvester baseline automation is live: completing a job auto-creates an SMS review request reminder.
- Re-activation Engine baseline automation is live: `/api/marketing/reactivation/run` queues SMS reminders for customers with no completed job in the configured lookback window.
- AI Guide backend toggle is live: `/api/org/ai-guide`.
- Contextual in-app help backend is live: `/api/help/articles`.
- Tribal coaching backend is live: `/api/coaching/snippets`.
- Done-for-you marketing service packaging baseline is live: `/api/marketing/service-packages`.
- Public status page endpoint is live: `/api/status`.
- Native mobile starter scaffold is live in `mobile/` with Expo app metadata and base app entrypoint.
- Native release scaffolding now includes EAS build config in `mobile/eas.json`.
- Twilio webhook and tenant communication profile APIs are live for multi-tenant messaging and STOP suppression.
- OpenAI audio/voice decision guidance is now documented for implementation in `docs/GOFIELDWISE_AI_AUDIO_PLAYBOOK.md`.

## Build Step Completion Snapshot
1. Twilio delivery + webhook + suppression: implemented.
2. Frontend surfaces for platform controls: implemented (`/platform`, `/status`).
3. Mobile release scaffolding: implemented (Expo + EAS config).
4. Multi-tenant voice/SMS profile scaffolding: implemented (`/api/org/comm-profile`).
5. Operational status exposure: implemented (`/api/status` + `/status` page).

External prerequisites still required for full production activation:
- Real Twilio and Retell credentials per tenant.
- App Store and Google Play signing and publisher accounts.

## Delivery Phases
1. Foundation parity hardening: receptionist, SMS, dunning, auth recovery, admin analytics baseline.
2. Growth systems: outreach scraper, ads dashboard, ads management, UTM and CPL instrumentation.
3. Beyond parity: multitenant voice stack hardening and coaching intelligence expansion.
4. Platform maturity: native app store release workflow and managed service operations tooling.
