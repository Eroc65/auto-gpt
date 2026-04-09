# GoFieldWise LeadLaunch Plumbing

## Campaign Objective
Convert cold outbound plumbing prospects into booked discovery calls for GoFieldWise LeadLaunch Plumbing.

## Target Persona
- Owner-operator plumbers (1-8 techs)
- Office manager for 6-20 tech shops
- Geography-first targeting in one metro region

## Offer Used in This Campaign
- LeadLaunch Starter: $999 setup + $129/month
- Promise: launch in 7-10 business days after content approval

## Sending Plan
- Volume: 20-40 new cold contacts per weekday
- Warm-up: start at 10/day for week 1, then scale
- Best send windows: 7:15-8:30 AM and 4:30-6:00 PM local
- Sequence length: 21 days

## Segmentation
- Segment A: No/weak website
- Segment B: Outdated site with weak mobile conversion
- Segment C: Better site, but no lead tracking and no service-area depth

## Deliverability Rules
- Use a dedicated sending domain and mailbox
- SPF, DKIM, DMARC required before first send
- Keep first email plain text
- Keep links to 1 max in first two touches
- Pause any contact that replies, even negative replies

## Cold + Nurture Sequence (21 days)

### Email 1 (Day 1) - Pattern Interrupt
Subject options:
- quick idea for {{company_name}}
- missed calls from your site?

Body:
Hi {{first_name}},

I was looking at {{company_name}} and noticed a few quick wins that could help turn more website visits into calls.

I help local plumbing companies launch conversion-focused sites fast under the GoFieldWise LeadLaunch program.

If useful, I can send a short 2-minute teardown with the top fixes I would prioritize.

Worth sending over?

- {{sender_name}}

If you prefer not to hear from me, reply "unsubscribe" or use this link: {{unsubscribe_url}}

Goal: reply with interest.

### Email 2 (Day 3) - Value Teardown
Subject options:
- 3 fixes I would make first
- quick teardown for {{company_name}}

Body:
Hi {{first_name}},

As promised, here are 3 improvements that usually lift call volume for plumbing companies:

1. Put click-to-call CTA above the fold on mobile.
2. Add dedicated pages for water heater, leak repair, and emergency service.
3. Add trust blocks (reviews, response-time promise, license/insured badges).

If you want, I can map this into a one-page launch plan for {{company_name}}.

- {{sender_name}}

If you prefer not to hear from me, reply "unsubscribe" or use this link: {{unsubscribe_url}}

Goal: get permission for plan call.

### Email 3 (Day 6) - Social Proof
Subject options:
- what happened after a similar launch
- example from another plumbing shop

Body:
Hi {{first_name}},

A plumbing team we helped had solid traffic but weak conversion.
After launch changes (mobile CTA + service pages + quote flow), they saw:

- higher call-through rate from mobile visitors
- more quote requests from emergency pages
- cleaner lead tracking by source

If you want, I can show what this would look like for {{company_name}} specifically.

Open to a 15-minute fit call next week?

- {{sender_name}}

If you prefer not to hear from me, reply "unsubscribe" or use this link: {{unsubscribe_url}}

Goal: book call.

### Email 4 (Day 10) - Offer Clarity
Subject options:
- simple pricing for plumbing site launch
- leadlaunch starter details

Body:
Hi {{first_name}},

Quick overview of the starter package most plumbing owners pick first:

- 5-page mobile-first website
- click-to-call and quote request flow
- local service-area setup
- launch in 7-10 business days

Price: $999 setup + $129/month maintenance.

If you want, I can send a sample page structure for {{company_name}}.

- {{sender_name}}

If you prefer not to hear from me, reply "unsubscribe" or use this link: {{unsubscribe_url}}

Goal: qualify budget and reduce ambiguity.

### Email 5 (Day 15) - Objection Handling
Subject options:
- if now is not the right time
- low-lift option

Body:
Hi {{first_name}},

Totally fair if now is not the right time for a full rebuild.

We can also start with a light conversion pass:
- homepage CTA cleanup
- emergency-service call flow
- quote form fixes

Then roll into full launch only if results justify it.

Want me to send the low-lift scope?

- {{sender_name}}

If you prefer not to hear from me, reply "unsubscribe" or use this link: {{unsubscribe_url}}

Goal: recover fence-sitters.

### Email 6 (Day 21) - Breakup / Permission
Subject options:
- close the loop?
- should I archive this

Body:
Hi {{first_name}},

I have not heard back, so I will close this out for now.

If improving website-to-call conversion is a priority later, reply with "plan" and I will send a 1-page launch outline for {{company_name}}.

Either way, wishing you a strong season.

- {{sender_name}}

If you prefer not to hear from me, reply "unsubscribe" or use this link: {{unsubscribe_url}}

Goal: final response and list hygiene.

## Post-Reply Nurture (for interested but not ready)
- Tag: Nurture-Warm
- Cadence: 1 email per week for 8 weeks
- Content rotation:
  1. Mobile conversion checklist
  2. Service page blueprint
  3. Before/after copy examples
  4. Missed-call recovery play
  5. Local SEO basics for plumbers
  6. How to track booked jobs by source
  7. FAQ on setup and maintenance
  8. Limited-time onboarding slot invite

## CRM Stages
- New
- Attempting Contact
- Replied - Interested
- Discovery Scheduled
- Proposal Sent
- Won
- Lost
- Nurture-Warm

## Required Fields in CRM
- company_name
- first_name
- email
- city
- segment
- lead_score
- current_website_status
- next_step
- next_touch_date

## Weekly KPI Targets
- Open rate >= 40%
- Reply rate >= 6%
- Positive reply rate >= 2%
- Booked call rate >= 1%
- Bounce rate < 3%

## Operating Rhythm
- Monday: load 100 new prospects into queue
- Tuesday-Thursday: active sending + same-day reply handling
- Friday: KPI review, copy tweaks, list cleanup

## Compliance Notes
- Include business identity and opt-out language
- Respect unsubscribe requests immediately
- Use only legally sourced business contact data
- Follow applicable laws (CAN-SPAM, CASL, GDPR where relevant)
- Update `docs/ads/GOFIELDWISE_SUPPRESSION_LIST.csv` daily and run `scripts/run_suppression_filter.ps1` before outbound sends.

## Required Footer on Every Outbound Email
Use this exact footer line in all cold and nurture emails:

If you prefer not to hear from me, reply "unsubscribe" or use this link: {{unsubscribe_url}}
