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
