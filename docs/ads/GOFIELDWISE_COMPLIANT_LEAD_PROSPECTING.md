# GoFieldWise Compliant Lead Prospecting

This workflow helps you build local business prospect lists fast while staying compliant.

## Important Policy
- Do not scrape email addresses from Google Maps or business websites.
- Do not harvest personal data without lawful basis.
- Use official APIs and public business metadata only.
- Add contact emails manually from lawful, explicit business contact sources.

## What the Script Does
Script: [scripts/google_places_prospector.py](scripts/google_places_prospector.py)

- Uses Google Places API to find businesses by city/trade query.
- Exports a CRM-ready CSV with company name, phone, website, rating, and lead score.
- Leaves the email field blank by design.

## Prerequisites
1. Enable Google Places API in your Google Cloud project.
2. Create an API key with restrictions.
3. Set environment variable:
   - PowerShell: $env:GOOGLE_MAPS_API_KEY="your_key_here"

## Usage
Dallas plumbers example:

python scripts/google_places_prospector.py \
  --query "plumber in Dallas, TX" \
  --city Dallas \
  --state TX \
  --trade Plumbing \
  --max-results 60 \
  --output docs/ads/GOFIELDWISE_LEADLAUNCH_DALLAS_COLD_EMAIL_LIST_REAL.csv

Houston plumbers example:

python scripts/google_places_prospector.py \
  --query "plumber in Houston, TX" \
  --city Houston \
  --state TX \
  --trade Plumbing \
  --max-results 60 \
  --output docs/ads/GOFIELDWISE_LEADLAUNCH_HOUSTON_COLD_EMAIL_LIST_REAL.csv

## One-Command Wrapper (Dallas + Houston)
Script: [scripts/run_lead_prospecting.ps1](scripts/run_lead_prospecting.ps1)

Run both cities:

powershell -NoProfile -ExecutionPolicy Bypass -File .\\scripts\\run_lead_prospecting.ps1

Run Dallas only:

powershell -NoProfile -ExecutionPolicy Bypass -File .\\scripts\\run_lead_prospecting.ps1 -Dallas

Run Houston only:

powershell -NoProfile -ExecutionPolicy Bypass -File .\\scripts\\run_lead_prospecting.ps1 -Houston

Custom result size:

powershell -NoProfile -ExecutionPolicy Bypass -File .\\scripts\\run_lead_prospecting.ps1 -MaxResults 100

Run both cities + apply suppression list:

powershell -NoProfile -ExecutionPolicy Bypass -File .\\scripts\\run_lead_prospecting.ps1 -ApplySuppression

## Suppression Automation
Suppression list file:
- [docs/ads/GOFIELDWISE_SUPPRESSION_LIST.csv](docs/ads/GOFIELDWISE_SUPPRESSION_LIST.csv)

Manual suppression filter run:

powershell -NoProfile -ExecutionPolicy Bypass -File .\\scripts\\run_suppression_filter.ps1

Outputs:
- Filtered files with `_filtered` suffix
- JSON report: `docs/ads/reports/suppression_report.json`

Auto-ingest unsubscribe replies from export CSVs:

powershell -NoProfile -ExecutionPolicy Bypass -File .\\scripts\\run_suppression_ingest.ps1 -InputFiles "docs/ads/reports/replies_export.csv"

Ingest output:
- Updated suppression list with new unsubscribe emails
- JSON report: `docs/ads/reports/suppression_update_report.json`

Run daily compliance (ingest replies + filter outbound lists):

powershell -NoProfile -ExecutionPolicy Bypass -File .\\scripts\\run_daily_compliance.ps1 -ReplyExportFiles "docs/ads/reports/replies_export.csv"

Or run daily compliance with automatic default reply export detection:

powershell -NoProfile -ExecutionPolicy Bypass -File .\\scripts\\run_daily_compliance.ps1

If `docs/ads/reports/replies_export.csv` exists, it is auto-ingested.

Daily wrapper output:
- Updated suppression list with new unsubscribe emails (when reply exports are provided)
- Filtered outbound CSVs with `_filtered` suffix
- JSON reports: `docs/ads/reports/suppression_update_report.json` and `docs/ads/reports/suppression_report.json`

VS Code task options:
- `leadlaunch: daily compliance` (auto-detects `docs/ads/reports/replies_export.csv` when present)
- `leadlaunch: daily compliance (explicit replies_export)` (always passes explicit reply export path)

## Outreach Workflow
1. Generate list with script.
2. Manually verify website quality and fit.
3. Add valid business contact route (email, form, or phone).
4. Start sequence from:
   - [docs/ads/GOFIELDWISE_LEADLAUNCH_EMAIL_NURTURE_CAMPAIGN.md](docs/ads/GOFIELDWISE_LEADLAUNCH_EMAIL_NURTURE_CAMPAIGN.md)

## Suggested Next Steps
- Add one virtual assistant SOP for contact verification.
- Run weekly list refresh for each city.
- Track conversion by city and segment (A/B/C).
- Keep suppression list updated daily from unsubscribe replies.
