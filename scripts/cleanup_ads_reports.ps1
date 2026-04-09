param(
  [string]$ReportsDir = "docs/ads/reports",
  [int]$RetentionDays = 30,
  [switch]$WhatIf
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
$targetDir = Join-Path $repoRoot $ReportsDir

if (-not (Test-Path $targetDir)) {
  throw "Reports directory not found: $targetDir"
}

$patterns = @(
  "ads_daily_pipeline_*.log",
  "ads_weekly_report_*.md",
  "ads_weekly_report_*.csv",
  "leadlaunch_kpi_snapshot_*.json",
  "leadlaunch_kpi_daily_*.md",
  "leadlaunch_kpi_weekly_*.md",
  "leadlaunch_morning_ops_*.log"
)

$cutoff = (Get-Date).AddDays(-1 * $RetentionDays)
$removed = 0

Write-Host "Starting report cleanup in $targetDir (retention=${RetentionDays}d, cutoff=$($cutoff.ToString('s')))"

foreach ($pattern in $patterns) {
  $files = Get-ChildItem -Path $targetDir -Filter $pattern -File -ErrorAction SilentlyContinue |
    Where-Object { $_.LastWriteTime -lt $cutoff }

  foreach ($file in $files) {
    if ($WhatIf) {
      Write-Host "[WhatIf] Would remove $($file.FullName)"
    }
    else {
      Remove-Item -Path $file.FullName -Force
      Write-Host "Removed $($file.FullName)"
      $removed += 1
    }
  }
}

if ($WhatIf) {
  Write-Host "REPORT_CLEANUP_OK: dry_run=true"
}
else {
  Write-Host "REPORT_CLEANUP_OK: removed=$removed retention_days=$RetentionDays"
}
