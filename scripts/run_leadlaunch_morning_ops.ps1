param(
  [string]$PythonExe = "",
  [string]$ReplyExportPath = "docs/ads/reports/replies_export.csv",
  [string]$SuppressionList = "docs/ads/GOFIELDWISE_SUPPRESSION_LIST.csv",
  [string[]]$LeadFiles = @(
    "docs/ads/GOFIELDWISE_LEADLAUNCH_DALLAS_COLD_EMAIL_LIST.csv",
    "docs/ads/GOFIELDWISE_LEADLAUNCH_HOUSTON_COLD_EMAIL_LIST.csv"
  ),
  [int]$WindowDays = 7,
  [string]$AsOf = "",
  [string]$LogDir = "docs/ads/reports",
  [switch]$RequireReplyExport
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
$logDirectory = Join-Path $repoRoot $LogDir
if (-not (Test-Path $logDirectory)) {
  New-Item -ItemType Directory -Path $logDirectory -Force | Out-Null
}

$dateStamp = Get-Date -Format "yyyyMMdd"
$logPath = Join-Path $logDirectory "leadlaunch_morning_ops_$dateStamp.log"

function Write-Log {
  param([string]$Message)
  "[$(Get-Date -Format o)] $Message" | Tee-Object -FilePath $logPath -Append
}

Push-Location $repoRoot
try {
  $dailyComplianceScript = Join-Path $PSScriptRoot "run_daily_compliance.ps1"
  $kpiScript = Join-Path $PSScriptRoot "run_leadlaunch_kpi.ps1"

  if (-not (Test-Path $dailyComplianceScript)) {
    throw "Missing script: $dailyComplianceScript"
  }
  if (-not (Test-Path $kpiScript)) {
    throw "Missing script: $kpiScript"
  }

  Write-Log "START Daily compliance"
  $replyExportExists = Test-Path $ReplyExportPath
  if ($RequireReplyExport -and -not $replyExportExists) {
    throw "Reply export file required but missing: $ReplyExportPath"
  }

  if ($replyExportExists) {
    Write-Log "Using reply export: $ReplyExportPath"
    & $dailyComplianceScript `
      -PythonExe $PythonExe `
      -SuppressionList $SuppressionList `
      -ReplyExportFiles $ReplyExportPath `
      -LeadFiles $LeadFiles
  }
  else {
    Write-Log "Reply export not found, running compliance without explicit ingest file"
    & $dailyComplianceScript `
      -PythonExe $PythonExe `
      -SuppressionList $SuppressionList `
      -LeadFiles $LeadFiles
  }

  if ($LASTEXITCODE -ne 0) {
    throw "Daily compliance failed with exit code $LASTEXITCODE"
  }
  Write-Log "OK Daily compliance"

  Write-Log "START KPI summary generation"
  & $kpiScript `
    -PythonExe $PythonExe `
    -InputFiles $LeadFiles `
    -SuppressionList $SuppressionList `
    -FilterReport "docs/ads/reports/suppression_report.json" `
    -OutputDir "docs/ads/reports" `
    -WindowDays $WindowDays `
    -AsOf $AsOf

  if ($LASTEXITCODE -ne 0) {
    throw "KPI generation failed with exit code $LASTEXITCODE"
  }
  Write-Log "OK KPI summary generation"

  Write-Log "COMPLETE morning operations"
  Write-Host "LEADLAUNCH_MORNING_OPS_OK: log=$logPath"
}
finally {
  Pop-Location
}
