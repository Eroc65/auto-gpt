# GoFieldwise Omnichannel Ad System

Goal: advertise everywhere with one consistent message system and measurable ROI.

Core positioning:
- GoFieldwise runs your field operation from first call to final payment.
- From call to cash, automated.

## 1) Channel Coverage and Role

1. Google Search:
- Role: high-intent demand capture.
- KPI: cost per qualified demo and booked-call rate.

2. Microsoft Ads (Bing + Yahoo search network):
- Role: lower-CPC demand capture with similar intent to Google.
- KPI: CPC and conversion parity against Google campaigns.

3. Meta (Facebook + Instagram):
- Role: attention, retargeting, and offer testing.
- KPI: CTR, CPL, retarget conversion rate.

4. Nextdoor:
- Role: neighborhood trust and local business owner/operator visibility.
- KPI: lead form starts and direct inquiry messages.

5. Blog/SEO distribution:
- Role: compounding inbound and retarget pool growth.
- KPI: organic traffic to service pages and demo CTA click-through.

6. Remarketing (Google Display + Meta):
- Role: recover undecided traffic and trial drop-off.
- KPI: return visitor conversion rate and ROAS.

Automation assets:
- `backend/scripts/ads_automation.py`
- `backend/scripts/ads_fetch_live.py`
- `backend/scripts/ads_notify.py`
- `docs/ads/AUTOMATION_CONFIG.json`
- `docs/ads/CONNECTORS_CONFIG.json`
- `.env.ads.example`
- `docs/ads/AUTOMATION_RUNBOOK.md`
- `scripts/run_ads_automation.ps1`
- `scripts/run_ads_daily_pipeline.ps1`
- `scripts/install_ads_automation_task.ps1`

## 2) Budget Split (Starter)

Recommended baseline monthly budget: $3,000

- Google Search: 40% ($1,200)
- Microsoft Ads (Bing/Yahoo): 15% ($450)
- Meta: 30% ($900)
- Nextdoor: 10% ($300)
- Content distribution and blog amplification: 5% ($150)

Reallocation rule (weekly):
- Increase budget to channels above 3.0x ROAS and below target CPL.
- Cut budget from channels below 1.5x ROAS after two optimization cycles.

## 3) Offer Ladder

Use one primary offer and two alternates across all channels.

Primary:
- 14-day trial with AI missed-call recovery setup.

Alternate A:
- Live interactive demo of AI call-to-booking workflow.

Alternate B:
- Missed-call revenue audit.

## 4) Landing Route Strategy

Use existing route structure:
- Main conversion page: /platform
- Demo path: /dispatch-assistant
- Industry pages: /plumbing, /hvac, /electrical, /landscaping, /cleaning-services

Routing rule:
- Search traffic to industry-specific pages when keyword intent is explicit.
- Meta and Nextdoor to /platform unless ad is industry-specific.

## 5) Campaign Architecture

### Google Search

Campaigns:
- Brand: gofieldwise, go field wise, front desk ai operations.
- Non-brand by trade: plumbing, hvac, electrical, landscaping, cleaning.
- Competitor alternatives: jobber alternative, housecall pro alternative, servicetitan alternative.

Ad groups:
- emergency intent
- scheduling/dispatch intent
- invoicing/payment intent

Negative keywords starter:
- jobs
- salary
- free course
- template
- open source
- tutorial

### Microsoft Ads (Bing + Yahoo)

Mirror Google campaign architecture.

Adjustments:
- Start with manual CPC or maximize clicks for week 1 if volume is low.
- Import top-performing Google RSAs and sitelinks after week 1.

### Meta

Campaign sets:
- prospecting (broad + interest stack)
- retargeting (site visitors, engaged users)

Creative mix:
- 40% pain-point static ads
- 30% before/after proof ads
- 30% short demo motion/video clips

### Nextdoor

Campaign themes:
- neighborhood missed-call problem
- local business reliability and response speed

Post cadence:
- 2 educational posts/week
- 1 offer post/week

### Blog Distribution

Cadence:
- 2 posts/week tied to conversion intent.

Templates:
- "Where missed calls cost [trade] businesses jobs"
- "How to reduce speed-to-lead under 60 seconds"
- "[Competitor] vs GoFieldwise for small field teams"

## 6) Tracking and Attribution

UTM schema:
- utm_source
- utm_medium
- utm_campaign
- utm_content
- utm_term

Example:
https://gofieldwise.com/platform?utm_source=google&utm_medium=cpc&utm_campaign=us_search_plumbing_intent&utm_content=rsa_v1&utm_term=plumbing_dispatch_software

Use docs/ads/UTM_TRACKING_TEMPLATE.csv to generate links consistently.

## 7) Weekly Optimization Loop

Monday:
- Pull channel KPIs and update dashboard snapshots.

Wednesday:
- Pause bottom 20% ads by CPA/CPL.
- Launch two new creative variants per active channel.

Friday:
- Reallocate budget to best ROAS channels.
- Document learnings and next week tests.

## 8) KPI Targets (First 60 Days)

- Click-to-lead rate: >= 4.0%
- Lead-to-demo rate: >= 25%
- Lead-to-trial rate: >= 12%
- First response SLA: <= 10 minutes
- ROAS target: >= 3.0x

## 9) Launch Checklist

- [ ] All ads use locked brand colors and message stack.
- [ ] All links have UTM params.
- [ ] Conversion events tracked for demo click, call click, and trial start.
- [ ] Weekly snapshot process active in admin dashboard.
- [ ] One owner assigned per channel for accountability.
