param(
  [string]$TaskName = "FrontDeskPro-Ads-Automation-Daily",
  [int]$MaxReportAgeHours = 30
)

$repoRoot = Split-Path -Parent $PSScriptRoot
$reportsDir = Join-Path $repoRoot "docs\ads\reports"

Write-Host "=== Ads Automation Health Check ==="

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

$latestReport = Get-ChildItem -Path $reportsDir -Filter "ads_weekly_report_*.md" -File |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1

if (-not $latestReport) {
  Write-Host "[WARN] No markdown report found yet in $reportsDir"
} else {
  $age = (Get-Date) - $latestReport.LastWriteTime
  $ageHours = [math]::Round($age.TotalHours, 2)
  if ($age.TotalHours -le $MaxReportAgeHours) {
    Write-Host "[OK] Latest report: $($latestReport.Name) ($ageHours hours old)"
  } else {
    Write-Host "[WARN] Latest report is stale: $($latestReport.Name) ($ageHours hours old)"
  }
}

$latestLog = Get-ChildItem -Path $reportsDir -Filter "ads_daily_pipeline_*.log" -File |
  Sort-Object LastWriteTime -Descending |
  Select-Object -First 1

if ($latestLog) {
  Write-Host "[OK] Latest pipeline log: $($latestLog.Name)"
} else {
  Write-Host "[WARN] No pipeline logs found yet."
}

Write-Host "=== Health Check Complete ==="
