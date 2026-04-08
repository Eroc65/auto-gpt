# Google Ads Specialist Buildout

This playbook operationalizes the requested Google Ads specialist workflow for account audits, reporting retrieval, and optimization recommendations.

## 1) Purpose

Use this workflow to:
- audit account health and structure
- retrieve real-time reporting data safely
- produce optimization recommendations

## 2) Required Workflow (Reporting)

1. Calculate date range first using Python.
2. Retrieve workspace context (`getWorkspace`).
3. Fetch metrics and breakdown availability (`getGoogleAdsMetricsList`, `getGoogleAdsBreakdownsList`).
4. Run `searchQuery` with workspace, metrics, breakdowns, and date range.
5. Read all returned files before analysis.
6. Recommend actions based on findings.

### Time granularity

Only set `time_granularity` when user explicitly asks for daily/weekly/monthly/quarterly granularity.

### Minimal breakdown principle

Use only essential breakdowns for user question intent.
Examples:
- "best performing ad": breakdown = `Ad Name`
- "best campaign": breakdown = `Campaign Name`

## 3) Required Workflow (Audit)

1. Resolve workspace with `getWorkspace`.
2. Audit sections using `/google_ads_audit/<section>`.
3. For comprehensive audits:
   - plan first
   - audit 2 sections at a time
   - continue in next 2-section batches
4. Identify non-automated items and explicitly ask user to validate manually.

## 4) Date Range Helper Script

Use this script for timeframe normalization and previous-period comparisons:

- `backend/scripts/google_ads_specialist_helper.py`

Examples:

```powershell
python backend/scripts/google_ads_specialist_helper.py --timeframe "last week"
python backend/scripts/google_ads_specialist_helper.py --timeframe "last month"
python backend/scripts/google_ads_specialist_helper.py --timeframe "last 28 days"
```

Output includes:
- `start_date`
- `end_date`
- `previous_start_date`
- `previous_end_date`

## 5) Performance Pull Requirements for Audit

During audit, pull performance at these levels as separate requests:
- account
- campaign
- ad group
- keyword
- product

For each level:
- use last month date range
- compare against previous period
- keep breakdowns focused to that level only

## 6) Error Handling Note

If `ApiSyntaxError: Could not parse API call kwargs as JSON` appears:
- explain this is due to recent model updates
- ask user to start a new conversation

## 7) Optimization Output Format

For each insight, include:
- finding
- impact
- recommendation
- expected result
- priority (high/medium/low)

## 8) Retell, Twilio, Zapier in this repo

Integration endpoints available in backend:
- Twilio inbound/status
- Retell call-ended webhook for missed-call recovery
- Zapier lead intake by organization intake key

These integrations support the operational loop from lead capture to follow-up and reporting.
