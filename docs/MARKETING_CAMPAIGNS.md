# GoFieldwise Campaign Launch Kit

Omnichannel assets:
- `docs/ads/OMNICHANNEL_AD_SYSTEM.md`
- `docs/ads/AD_COPY_OMNICHANNEL.md`
- `docs/ads/UTM_TRACKING_TEMPLATE.csv`
- `docs/ads/GOFIELDWISE_LEADLAUNCH_COLD_EMAIL_LIST_TEMPLATE.csv`
- `docs/ads/GOFIELDWISE_LEADLAUNCH_EMAIL_NURTURE_CAMPAIGN.md`

LeadLaunch plumbing launch assets:
- Cold list template: `docs/ads/GOFIELDWISE_LEADLAUNCH_COLD_EMAIL_LIST_TEMPLATE.csv`
- 21-day nurture sequence: `docs/ads/GOFIELDWISE_LEADLAUNCH_EMAIL_NURTURE_CAMPAIGN.md`
- Dallas cold list starter: `docs/ads/GOFIELDWISE_LEADLAUNCH_DALLAS_COLD_EMAIL_LIST.csv`
- Dallas send calendar: `docs/ads/GOFIELDWISE_LEADLAUNCH_DALLAS_SEND_CALENDAR.md`
- Houston cold list starter: `docs/ads/GOFIELDWISE_LEADLAUNCH_HOUSTON_COLD_EMAIL_LIST.csv`
- Houston send calendar: `docs/ads/GOFIELDWISE_LEADLAUNCH_HOUSTON_SEND_CALENDAR.md`
- Compliant lead prospecting workflow: `docs/ads/GOFIELDWISE_COMPLIANT_LEAD_PROSPECTING.md`
- Prospecting wrapper script: `scripts/run_lead_prospecting.ps1`
- Weekly operating cadence: `docs/ads/GOFIELDWISE_LEADLAUNCH_WEEKLY_OPERATING_CADENCE.md`
- Suppression list: `docs/ads/GOFIELDWISE_SUPPRESSION_LIST.csv`
- Suppression filter script: `scripts/apply_email_suppression.py`
- Suppression wrapper: `scripts/run_suppression_filter.ps1`

## Channel Order
1. Email sequence first (fastest launch, lowest spend)
2. Google Ads second (high intent demand capture)
3. Facebook/Instagram third (retargeting and broader awareness)

## Google Ads

### Campaign: Industry Intent
- Objective: Leads
- Bid strategy: Maximize conversions (switch to tCPA after 20+ conversions)
- Location: United States
- Schedule: 6am-9pm local business hours

### Ad Groups and Keywords
- Plumbing
  - plumbing scheduling software
  - plumbing dispatch software
  - plumber job management software
- HVAC
  - hvac dispatch software
  - hvac scheduling software
  - hvac service management software
- Electrical
  - electrician scheduling software
  - electrical contractor software
  - electrical dispatch software
- Landscaping
  - landscaping scheduling software
  - landscaping service software
  - lawn care dispatch software
- Cleaning
  - cleaning business scheduling software
  - cleaning dispatch software
  - cleaning service management software

### RSA Copy Template
- Headline 1: GoFieldwise for {Industry}
- Headline 2: Never Miss a {Industry} Call
- Headline 3: 200/mo Flat Rate
- Description 1: AI answers calls 24/7, books jobs, and dispatches techs.
- Description 2: Automated invoicing and payments. Try the live demo.
- Final URL: https://gofieldwise.com/{industry-slug}

### Negative Keywords (starter)
- jobs
- salary
- free templates
- open source
- course
- training

## Facebook and Instagram

### Audience
- Business owners and admins in home services
- Interests: Small business software, contractor tools, home services
- Geography: United States

### Creative Brief
- Visual: Technician using phone in a service truck
- Headline: Stop Missing {Industry} Calls
- Primary text: GoFieldwise handles calls, scheduling, and invoicing automatically. Focus on the work that pays.
- CTA: Learn More
- Landing page: https://gofieldwise.com/{industry-slug}

## Email Sequence

### Email 1: Welcome
- Subject: Your GoFieldwise Demo is Ready
- Goal: Demo click
- Body:
  - Thanks for checking out GoFieldwise for {Industry}
  - Demo link: {Demo Link}
  - Highlights: 24/7 call answer, auto booking, dispatch, instant invoicing

### Email 2: Social Proof (Day 3)
- Subject: How Dave grew his plumbing business
- Goal: Case study click + demo revisit
- Body:
  - Before and after outcomes
  - Link to story or testimonial
  - CTA: Try Demo

### Email 3: Offer (Day 7)
- Subject: Last chance: Free setup this week
- Goal: Call booking
- Body:
  - 48-hour setup incentive
  - CTA: Book now
  - Secondary CTA: Try demo first

## UTM Template
Use this format on every paid link:
https://gofieldwise.com/{industry-slug}?utm_source={source}&utm_medium={medium}&utm_campaign={campaign}&utm_content={creative}

## Launch Checklist
- Confirm each ad points to correct industry page
- Confirm phone number appears above fold on landing pages
- Install conversion events for demo clicks and call clicks
- Verify one thank-you event per conversion path
- Review search terms daily for week 1 and add negatives
