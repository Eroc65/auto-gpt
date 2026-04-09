param(
  [string]$PythonExe = "",
  [string]$SuppressionList = "docs/ads/GOFIELDWISE_SUPPRESSION_LIST.csv",
  [string[]]$InputFiles = @(
    "docs/ads/GOFIELDWISE_LEADLAUNCH_DALLAS_COLD_EMAIL_LIST.csv",
    "docs/ads/GOFIELDWISE_LEADLAUNCH_HOUSTON_COLD_EMAIL_LIST.csv"
  ),
  [string]$OutputSuffix = "_filtered",
  [string]$ReportPath = "docs/ads/reports/suppression_report.json"
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
    "scripts/apply_email_suppression.py",
    "--suppression-list", $SuppressionList,
    "--suffix", $OutputSuffix,
    "--report", $ReportPath,
    "--inputs"
  ) + $InputFiles

  & $python @argsList

  if ($LASTEXITCODE -ne 0) {
    throw "Suppression filter failed with exit code $LASTEXITCODE"
  }
}
finally {
  Pop-Location
}
