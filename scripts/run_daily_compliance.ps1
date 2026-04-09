param(
  [string]$PythonExe = "",
  [string]$SuppressionList = "docs/ads/GOFIELDWISE_SUPPRESSION_LIST.csv",
  [string[]]$ReplyExportFiles = @(),
  [string[]]$LeadFiles = @(
    "docs/ads/GOFIELDWISE_LEADLAUNCH_DALLAS_COLD_EMAIL_LIST.csv",
    "docs/ads/GOFIELDWISE_LEADLAUNCH_HOUSTON_COLD_EMAIL_LIST.csv"
  ),
  [string]$OutputSuffix = "_filtered",
  [string]$IngestReportPath = "docs/ads/reports/suppression_update_report.json",
  [string]$FilterReportPath = "docs/ads/reports/suppression_report.json",
  [switch]$SkipIngest,
  [switch]$SkipFilter
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot
$ingestWrapper = Join-Path $PSScriptRoot "run_suppression_ingest.ps1"
$filterWrapper = Join-Path $PSScriptRoot "run_suppression_filter.ps1"
$didRunIngest = $false
$didRunFilter = $false

if ($SkipIngest -and $SkipFilter) {
  throw "Both -SkipIngest and -SkipFilter were set. At least one step must run."
}

if (-not (Test-Path $ingestWrapper)) {
  throw "Missing wrapper: $ingestWrapper"
}

if (-not (Test-Path $filterWrapper)) {
  throw "Missing wrapper: $filterWrapper"
}

Push-Location $repoRoot
try {
  if (-not $SkipIngest) {
    if ($ReplyExportFiles -and $ReplyExportFiles.Count -gt 0) {
      Write-Host "Running unsubscribe reply ingest..."
      & $ingestWrapper `
        -PythonExe $PythonExe `
        -SuppressionList $SuppressionList `
        -InputFiles $ReplyExportFiles `
        -ReportPath $IngestReportPath

      if ($LASTEXITCODE -ne 0) {
        throw "Reply ingest failed with exit code $LASTEXITCODE"
      }

      $didRunIngest = $true
    }
    else {
      Write-Host "No -ReplyExportFiles provided. Skipping ingest step."
    }
  }

  if (-not $SkipFilter) {
    Write-Host "Running suppression filter on outbound lead files..."
    & $filterWrapper `
      -PythonExe $PythonExe `
      -SuppressionList $SuppressionList `
      -InputFiles $LeadFiles `
      -OutputSuffix $OutputSuffix `
      -ReportPath $FilterReportPath

    if ($LASTEXITCODE -ne 0) {
      throw "Suppression filter failed with exit code $LASTEXITCODE"
    }

    $didRunFilter = $true
  }

  if (-not $didRunIngest -and -not $didRunFilter) {
    throw "No compliance steps executed. Provide -ReplyExportFiles and/or remove -SkipFilter."
  }

  Write-Host "DAILY_COMPLIANCE_OK: suppression_list=$SuppressionList ingest_report=$IngestReportPath filter_report=$FilterReportPath"
}
finally {
  Pop-Location
}
