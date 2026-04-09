param(
  [string]$TaskName = "FrontDeskPro-LeadLaunch-Compliance-Daily",
  [int]$MaxReportAgeHours = 30
)

$repoRoot = Split-Path -Parent $PSScriptRoot
$reportsDir = Join-Path $repoRoot "docs\ads\reports"

Write-Host "=== LeadLaunch Compliance Health Check ==="

$task = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if (-not $task) {
  Write-Host "[FAIL] Scheduled task not found: $TaskName"
  exit 1
}

$taskInfo = Get-ScheduledTaskInfo -TaskName $TaskName
Write-Host "[OK] Task found: $TaskName"
Write-Host "      State: $($task.State)"
Write-Host "      LastRunTime: $($taskInfo.LastRunTime)"
Write-Host "      LastTaskResult: $($taskInfo.LastTaskResult)"
Write-Host "      NextRunTime: $($taskInfo.NextRunTime)"

if (-not (Test-Path $reportsDir)) {
  Write-Host "[FAIL] Reports directory missing: $reportsDir"
  exit 1
}

$latestFilterReport = Join-Path $reportsDir "suppression_report.json"
if (Test-Path $latestFilterReport) {
  $filterAge = (Get-Date) - (Get-Item $latestFilterReport).LastWriteTime
  $filterAgeHours = [math]::Round($filterAge.TotalHours, 2)
  if ($filterAge.TotalHours -le $MaxReportAgeHours) {
    Write-Host "[OK] suppression_report.json updated recently ($filterAgeHours hours old)"
  } else {
    Write-Host "[WARN] suppression_report.json is stale ($filterAgeHours hours old)"
  }
} else {
  Write-Host "[WARN] suppression_report.json not found yet."
}

$latestIngestReport = Join-Path $reportsDir "suppression_update_report.json"
if (Test-Path $latestIngestReport) {
  $ingestAge = (Get-Date) - (Get-Item $latestIngestReport).LastWriteTime
  $ingestAgeHours = [math]::Round($ingestAge.TotalHours, 2)
  if ($ingestAge.TotalHours -le $MaxReportAgeHours) {
    Write-Host "[OK] suppression_update_report.json updated recently ($ingestAgeHours hours old)"
  } else {
    Write-Host "[WARN] suppression_update_report.json is stale ($ingestAgeHours hours old)"
  }
} else {
  Write-Host "[WARN] suppression_update_report.json not found yet."
}

$latestKpiSnapshot = Get-ChildItem -Path $reportsDir -Filter "leadlaunch_kpi_snapshot_*.json" -File -ErrorAction SilentlyContinue |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1

if ($latestKpiSnapshot) {
  $kpiAge = (Get-Date) - $latestKpiSnapshot.LastWriteTime
  $kpiAgeHours = [math]::Round($kpiAge.TotalHours, 2)
  if ($kpiAge.TotalHours -le $MaxReportAgeHours) {
    Write-Host "[OK] KPI snapshot updated recently: $($latestKpiSnapshot.Name) ($kpiAgeHours hours old)"
  } else {
    Write-Host "[WARN] KPI snapshot is stale: $($latestKpiSnapshot.Name) ($kpiAgeHours hours old)"
  }
} else {
  Write-Host "[WARN] No KPI snapshot found yet."
}

Write-Host "=== Health Check Complete ==="
