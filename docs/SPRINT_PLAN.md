# FrontDesk Pro — Sprint Plan (v1)

Related roadmap:
- [Fieldwise Parity and Beyond Plan](./FIELDWISE_PARITY_PLAN.md)
- [GoFieldwise AI Audio Playbook](./GOFIELDWISE_AI_AUDIO_PLAYBOOK.md)

## Next 2 Sprints — FrontDesk Pro Execution Plan

Execution artifacts for Sprint A:
- [ISSUES_IMPORT_SPRINT_A.csv](../.github/ISSUES_IMPORT_SPRINT_A.csv)
- [ISSUE_BODIES_SPRINT_A.md](../.github/ISSUE_BODIES_SPRINT_A.md)

Execution artifacts for Sprint B:
- [ISSUES_IMPORT_SPRINT_B.csv](../.github/ISSUES_IMPORT_SPRINT_B.csv)
- [ISSUE_BODIES_SPRINT_B.md](../.github/ISSUE_BODIES_SPRINT_B.md)

### Sprint A (2 weeks) — Dispatch to Completion Reliability
Goal: close the loop from assignment to completed work with customer-visible status and auditability.

Scope:
- Job lifecycle events: `on_my_way`, `started`, `completed` timestamps.
- Technician quick actions API for status transitions.
- Customer notification hooks for status changes (internal first, pluggable SMS/email adapter).
- Job activity timeline (who changed what and when).
- Mobile-first action flow for technician job card.

Stories:
- As an owner, I can see when a technician is en route, has started, and has completed a job.
- As a technician, I can update status in one tap from mobile.
- As a customer, I receive clear status updates during service.
- As an admin, I can audit all dispatch/status changes by user and timestamp.

Acceptance Criteria:
- Status transition rules are enforced server-side.
- Protected routes reject cross-organization access for all lifecycle endpoints.
- Activity timeline includes actor, action, previous state, new state, timestamp.
- Mobile flow supports complete lifecycle in <=3 taps from job detail.
- Regression tests cover success/failure transitions and org scoping.

Validation:
- Backend tests for lifecycle transitions and audit events.
- API smoke script for end-to-end dispatch -> complete flow.
- Frontend e2e for technician action flow on mobile viewport.

Definition of Done:
- Feature behind no manual DB patching.
- Migration path validated on fresh and existing DB.
- CI green with targeted and full regression tests.

### Sprint B (2 weeks) — Invoice & Collections Automation
Goal: reduce missed revenue by automating invoice issuance and collection follow-up.

Scope:
- Auto-generate invoice on job completion when eligible.
- Payment-link field and status tracking (`unpaid`, `paid`, `void`, `overdue`).
- Reminder escalation cadence (day 0, day 3, day 7, day 14).
- Dashboard cards: unpaid total, overdue count, aging buckets.
- Collection reminder suppression when invoice is paid.

Stories:
- As an owner, I get an invoice out immediately after work is complete.
- As an owner, I can see what is overdue and what to chase first.
- As a team member, reminders stop automatically when payment arrives.

Acceptance Criteria:
- Completion triggers invoice creation exactly once per eligible job.
- Reminder escalation is deterministic and idempotent.
- Re-opened invoices reactivate collection reminders.
- Dashboard metrics match underlying invoice/reminder state.
- All invoice/reminder queries are organization-scoped.

Validation:
- Unit + integration tests for auto-invoice and escalation logic.
- Deterministic smoke script for completion -> invoice -> escalation -> paid suppression.
- CI job includes focused collections regression gate before full suite.

Definition of Done:
- No duplicate invoices from repeated completion actions.
- Reminder lifecycle verified across paid/unpaid transitions.
- Release notes updated with operational behavior and rollback notes.

### Sprint C (2 weeks) — Voice Intake And Audio Agent Foundation
Goal: operationalize voice intake and transcript reliability with organization-safe audio pipelines.

Scope:
- Add transcription-first API path for voicemail and recorded call ingestion.
- Add structured extraction from transcript (name, service type, urgency, address, callback number).
- Add deterministic speech output path for controlled customer messaging.
- Add runtime model-routing policy: realtime for live calls, chained mode for deterministic script control.

Stories:
- As an owner, I can review transcript and extracted intake details immediately after a call.
- As a dispatcher, I can use AI-assisted summaries without losing call context.
- As an admin, I can audit which model path produced each transcript and response.

Acceptance Criteria:
- Voice/transcript records are organization-scoped and auth-protected.
- Transcription + extraction pipeline is deterministic and test-covered.
- Controlled speech output can be generated from approved message templates.
- API selection logic follows the audio playbook.

Validation:
- Backend tests for auth, org scoping, and extraction correctness.
- Smoke script for transcription -> extraction -> controlled speech roundtrip.
- Failure-path tests for missing audio, invalid format, and provider timeout handling.

Definition of Done:
- Operational logs include model path and request identifiers.
- Minimum one deterministic smoke command is documented and runnable.
- Rollback/fallback path is documented for realtime transport outages.

### Dependencies and Sequence
1. Finish Sprint A schema + API first.
2. Ship Sprint A UI and timeline.
3. Implement Sprint B invoice automation.
4. Implement Sprint B reminder escalation + dashboard.

### Risks and Mitigations
- Risk: stale local schema causes runtime failures.
	Mitigation: keep idempotent migrations and startup schema checks.
- Risk: notification provider instability.
	Mitigation: adapter interface + retry-safe internal queue.
- Risk: mobile UX friction slows adoption.
	Mitigation: mobile viewport e2e and tap-count acceptance checks.

### Exit Metrics
- Dispatch-to-complete timestamp coverage >= 95% of dispatched jobs.
- Auto-invoice rate >= 90% of completed eligible jobs.
- Overdue reminder send success >= 99% (internal channel baseline).
- Median time-to-dispatch update from technician < 2 minutes.

## Sprint 0 — Foundation
- Monorepo structure
- GitHub repo config
- Render/hosting setup
- Postgres provisioning
- Environment variable strategy
- R2-compatible storage config
- Initial DB schema/migrations
- Auth foundation
- Workspace/account model
- App shell, navigation, theme tokens
- Event logging base
- CI pipeline
- Staging/prod envs

## Sprint 1 — Org Setup, Dashboard, Core Models
- Org/user/tech/customer/job/estimate/invoice/reminder/note schema
- Org setup/onboarding form
- Dashboard shell
- Nav patterns
- User/org context
- Seed/demo data tools
- Event tracking

## Sprint 2 — Customers Module
- Customer CRUD, notes, history, job linking
- List/search/filter
- Add/edit forms
- Detail page
- Linked jobs/invoices/activity
- Communication log
- Mobile-friendly

## Sprint 3 — Jobs Module
- Job CRUD, status, tech assignment, notes, attachments
- List/filter
- Create/edit forms
- Detail page
- Status flow
- Mobile usability

## Sprint 4 — Scheduling/Calendar + Technicians/Team
- Tech/team CRUD
- Schedule/calendar views
- Assignment/reassignment
- Conflict indicators
- Mobile schedule
- Dashboard widgets

## Sprint 5 — Estimates, Invoices, Payments
- Estimate/invoice CRUD
- Convert estimate to invoice
- Invoice states
- Customer payment page
- Payment flow
- Filters/highlighting
- Dashboard unpaid/open

## Sprint 6 — Follow-Up/Reminder Engine
- Reminder engine schema/logic
- Reminder rules
- Reminder queue view
- Dashboard widget
- Snooze/dismiss/complete
- Notification hooks (in-app)
- Recurring rules

## Sprint 7 — AI Guide Phases 1–2
- AI Guide toggle
- Page overlays
- Guided flows
- Dismiss/skip/resume
- Business-focused copy
- Mobile support

## Sprint 8 — AI Guide Phase 3 + Dashboard Maturity
- Onboarding tracker
- Dashboard cards
- Empty states

## Sprint 9 — Mobile Optimization + Native App Prep
- Mobile audit/fixes
- Navigation/forms
- Mobile app shell
- Auth/session for mobile

## Sprint 10 — Marketing Site + Demo Path
- Homepage/pricing/demo/signup/support/SEO
- Proof sections/screenshots
- Analytics for funnel

## Sprint 11 — Reporting/Operational Visibility
- Dashboard/report views
- Date filters/exports
- Scheduled summary framework
- Admin/internal reporting

## Sprint 12 — Internal Automation Layer
- Internal task/approval model
- Automation dashboard
- Browser automation worker
- Research/content/SEO support
- Scheduled tasks
- Audit logs

## Deferred Roadmap — AI Visual Ads Growth Service
- Position as an additional sellable GoFieldwise managed service.
- Benchmark against specialized creative SaaS (including Kopa-style workflows) for speed, output quality, and measurable ROI.
- Required capability tracks:
	- Image generation pipeline (brand-consistent static creative at scale)
	- Design/layout system (placement-aware templates for Meta, TikTok, Google)
	- Video ad pipeline (short-form creative with scene timing and overlays)
	- Competitor ad intelligence (visual pattern and trend gap detection)
	- Creative performance analytics (attribute-level performance and refresh planning)
- Commercialization requirements:
	- Service packaging, checkout path, and SKU-level reporting
	- Clear deliverables, turnaround SLAs, and upsell attachment metrics
- Sales enablement (deferred):
	- One-page "GoFieldwise vs Kopa" sales script for owner-operators
	- Objection handling matrix (price, complexity, migration risk, proof)
	- Pricing anchor and close script for AI Visual Ads Growth upsell calls
