param(
  [string]$PythonExe = "",
  [string[]]$InputFiles = @(
    "docs/ads/GOFIELDWISE_LEADLAUNCH_DALLAS_COLD_EMAIL_LIST.csv",
    "docs/ads/GOFIELDWISE_LEADLAUNCH_HOUSTON_COLD_EMAIL_LIST.csv"
  ),
  [string]$SuppressionList = "docs/ads/GOFIELDWISE_SUPPRESSION_LIST.csv",
  [string]$FilterReport = "docs/ads/reports/suppression_report.json",
  [string]$OutputDir = "docs/ads/reports",
  [int]$WindowDays = 7,
  [string]$AsOf = ""
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot

function Resolve-Python {
  param([string]$ExplicitPythonExe)

  if ($ExplicitPythonExe -and $ExplicitPythonExe.Trim().Length -gt 0) {
    return $ExplicitPythonExe
  }

  $venvPython = Join-Path $repoRoot ".venv\Scripts\python.exe"
  if (Test-Path $venvPython) {
    return $venvPython
  }

  if ($env:ADS_AUTOMATION_PYTHON -and $env:ADS_AUTOMATION_PYTHON.Trim().Length -gt 0) {
    return $env:ADS_AUTOMATION_PYTHON
  }

  $py = Get-Command python -ErrorAction SilentlyContinue
  if ($py) {
    return $py.Source
  }

  throw "Python executable not found. Pass -PythonExe or set ADS_AUTOMATION_PYTHON."
}

$python = Resolve-Python -ExplicitPythonExe $PythonExe

Push-Location $repoRoot
try {
  $argsList = @(
    "scripts/generate_leadlaunch_kpi_report.py",
    "--inputs"
  ) + $InputFiles + @(
    "--suppression-list", $SuppressionList,
    "--filter-report", $FilterReport,
    "--output-dir", $OutputDir,
    "--window-days", "$WindowDays"
  )

  if ($AsOf -and $AsOf.Trim().Length -gt 0) {
    $argsList += @("--as-of", $AsOf)
  }

  & $python @argsList

  if ($LASTEXITCODE -ne 0) {
    throw "LeadLaunch KPI generation failed with exit code $LASTEXITCODE"
  }
}
finally {
  Pop-Location
}
