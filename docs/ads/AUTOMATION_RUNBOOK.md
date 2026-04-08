# Ads Automation Runbook

This runbook executes the full v1 automation loop:
- ingest channel metrics
- apply budget rules
- generate weekly markdown and CSV reports

Optional live pipeline:
- fetch channel metrics from HTTP JSON endpoints before report generation

## Files

- Script: `backend/scripts/ads_automation.py`
- Live fetch script: `backend/scripts/ads_fetch_live.py`
- Config: `docs/ads/AUTOMATION_CONFIG.json`
- Connector config: `docs/ads/CONNECTORS_CONFIG.json`
- Env template: `.env.ads.example`
- Mapping smoke test: `backend/scripts/smoke_ads_mapping.py`
- Native sample payloads: `docs/ads/sample_payloads/`
- Input folder: `docs/ads/channel_exports/`
- Outputs: `docs/ads/reports/`
- PowerShell wrapper: `scripts/run_ads_automation.ps1`
- Full daily wrapper: `scripts/run_ads_daily_pipeline.ps1`
- Task install script: `scripts/install_ads_automation_task.ps1`
- Task uninstall script: `scripts/uninstall_ads_automation_task.ps1`
- Health check script: `scripts/check_ads_automation_health.ps1`
- Notification script: `backend/scripts/ads_notify.py`

## Input CSV format

Each channel file should include:
- `date`
- `impressions`
- `clicks`
- `spend`
- `revenue`
- `leads`
- `qualified_leads`

Examples:
- `google.csv`
- `microsoft.csv`
- `meta.csv`
- `nextdoor.csv`
- `blog.csv`

## Run commands

From repo root:

```powershell
python backend/scripts/ads_automation.py --window-days 7
```

For a fixed report date:

```powershell
python backend/scripts/ads_automation.py --window-days 7 --as-of 2026-04-07
```

Using wrapper:

```powershell
./scripts/run_ads_automation.ps1 -WindowDays 7
```

Validate channel field mappings without live endpoints:

```powershell
python backend/scripts/smoke_ads_mapping.py
```

Run full daily pipeline (fetch + report):

```powershell
./scripts/run_ads_daily_pipeline.ps1 -WindowDays 7
```

Send summary notification manually:

```powershell
python backend/scripts/ads_notify.py --as-of 2026-04-07
```

If task runtime cannot resolve Python, provide explicit executable:

```powershell
./scripts/run_ads_daily_pipeline.ps1 -WindowDays 7 -PythonExe "C:\Path\To\python.exe"
```

## Live connector environment variables

Set these per channel as needed:

- `GOOGLE_ADS_REPORT_URL`
- `GOOGLE_ADS_REPORT_TOKEN`
- `MICROSOFT_ADS_REPORT_URL`
- `MICROSOFT_ADS_REPORT_TOKEN`
- `META_ADS_REPORT_URL`
- `META_ADS_REPORT_TOKEN`
- `NEXTDOOR_REPORT_URL`
- `NEXTDOOR_REPORT_TOKEN`
- `BLOG_REPORT_URL`
- `BLOG_REPORT_TOKEN`

Notification settings:

- `ADS_SLACK_WEBHOOK_URL`
- `ADS_NOTIFY_EMAIL_TO`
- `ADS_SMTP_HOST`
- `ADS_SMTP_PORT`
- `ADS_SMTP_USERNAME`
- `ADS_SMTP_PASSWORD`
- `ADS_SMTP_FROM`
- `ADS_SMTP_USE_TLS`

Quick setup:

1. Copy `.env.ads.example` values into your secure local environment management method.
2. Set endpoint URL + token per channel.
3. Run `./scripts/run_ads_daily_pipeline.ps1`.

Endpoint contract:
- Returns JSON array of rows, or object with `data` array.
- Row fields: `date`, `impressions`, `clicks`, `spend`, `revenue`, `leads`, `qualified_leads`.

Field mapping support:
- `docs/ads/CONNECTORS_CONFIG.json` supports `field_map` for native payload keys.
- Dot notation is supported for nested values (example: `metrics.clicks`).
- `static_values` can be used when a field should be constant.

## Schedule daily task on Windows

Install 6:00 AM daily task:

```powershell
./scripts/install_ads_automation_task.ps1 -RunAt "06:00"
```

Verify:

```powershell
schtasks /Query /TN FrontDeskPro-Ads-Automation-Daily /V /FO LIST
```

Health check:

```powershell
./scripts/check_ads_automation_health.ps1
```

Remove task:

```powershell
./scripts/uninstall_ads_automation_task.ps1
```

## Output files

- `docs/ads/reports/ads_weekly_report_YYYYMMDD.md`
- `docs/ads/reports/ads_weekly_report_YYYYMMDD.csv`

## Rule tuning

Edit `docs/ads/AUTOMATION_CONFIG.json`:
- budgets by channel
- target CPL by channel
- scale/cut thresholds
- minimum leads before budget change

## Suggested schedule

- Daily 6:00 AM local: run ingestion + report generation.
- Monday: execute budget updates from recommendations.
- Wednesday: creative pause/scale cycle.
- Friday: close loop with summary and next test plan.
