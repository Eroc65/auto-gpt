# GoFieldWise LeadLaunch Plumbing
## Exact Weekly Operating Cadence (Dallas + Houston)

This is the day-by-day operating model for one sender mailbox, one caller, and one proposal closer.

## Team Roles
- Outbound Specialist: sends cold emails and handles follow-ups.
- Data Assistant: sources/cleans contacts and updates CRM fields.
- Sales Closer: runs discovery calls and sends proposals.

## Daily Contact Quotas (per city)
- New contacts: 20/day
- Follow-ups: 30 to 45/day
- Live call attempts: 5/day (warm replies and recent opens)

Running Dallas + Houston in parallel:
- New contacts total/day: 40
- Follow-ups total/day: 60 to 90
- Live call attempts total/day: 10

## Contact Priority by Segment
- Segment A (score 85+): no/weak website, high urgency pain points.
- Segment B (score 75-84): outdated site, low conversion.
- Segment C (score <75): decent site but weak tracking/service depth.

Always contact in this order: Segment A -> Segment B -> Segment C.

## Weekly Schedule

### Monday (List Build + Launch Day)
Who to contact:
- Dallas Segment A: 20 new
- Houston Segment A: 20 new

Actions:
- Generate or refresh city prospect lists.
- Run suppression filter before any outbound send.
- Verify business name, site, and contact route.
- Send Email 1 to all new contacts.
- Process all same-day replies.

### Tuesday (Follow-Up Wave 1)
Who to contact:
- Dallas Segment A/B: 20 new
- Houston Segment A/B: 20 new
- Monday cohort non-responders: Email 2

Actions:
- Send Email 1 to new contacts.
- Send Email 2 to Monday non-responders.
- Call top 5 warm leads per city.

### Wednesday (Conversation Day)
Who to contact:
- Dallas Segment B: 20 new
- Houston Segment B: 20 new
- Tuesday cohort non-responders: Email 2

Actions:
- Send Email 1 to new contacts.
- Send Email 2 to Tuesday non-responders.
- Book and run discovery calls from warm replies.

### Thursday (Proof + Follow-Up Wave 2)
Who to contact:
- Dallas Segment B/C: 20 new
- Houston Segment B/C: 20 new
- Monday cohort non-responders: Email 3
- Wednesday cohort non-responders: Email 2

Actions:
- Send Email 1 to new contacts.
- Continue follow-up cadence by cohort date.
- Send social proof touch (Email 3) to eligible cohort.

### Friday (Pipeline and Close Day)
Who to contact:
- Dallas Segment C: 20 new
- Houston Segment C: 20 new
- Tuesday/Wednesday eligible cohorts: Email 4 or Email 5

Actions:
- Send Email 1 to new contacts.
- Advance mature cohorts to Email 4/5.
- Send proposals for all completed discovery calls.
- Tag non-responders by stage and prep next week queue.

## Response-Time SLA
- Replies during business hours: respond within 2 hours.
- New positive replies after 5 PM: respond by 9 AM next day.
- Unsubscribe requests: suppress immediately (same day).

## Compliance Controls
- Every outbound email must include unsubscribe text and working unsubscribe URL.
- Process opt-out requests immediately and suppress future sends.
- Send only to lawfully sourced business contacts.
- Include sender identity and business address/footer in every email.
- Run `scripts/run_daily_compliance.ps1` before each outbound batch.
- The wrapper auto-ingests `docs/ads/reports/replies_export.csv` if present, or you can pass `-ReplyExportFiles <reply_export.csv>` explicitly.

## Mandatory Unsubscribe Footer
If you prefer not to hear from me, reply "unsubscribe" or use this link: {{unsubscribe_url}}

## KPI Targets by Friday EOD
- Open rate >= 40%
- Reply rate >= 6%
- Positive reply rate >= 2%
- Discovery calls booked >= 4 total (both cities)
- Unsubscribe processing time: same day
