param(
  [string]$PythonExe = "",
  [string]$SuppressionList = "docs/ads/GOFIELDWISE_SUPPRESSION_LIST.csv",
  [string[]]$InputFiles,
  [string]$ReportPath = "docs/ads/reports/suppression_update_report.json",
  [string]$Source = "reply_export",
  [string]$Reason = "unsubscribe"
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

if (-not $InputFiles -or $InputFiles.Count -eq 0) {
  throw "Pass at least one reply export CSV via -InputFiles."
}

$python = Resolve-Python -ExplicitPythonExe $PythonExe

Push-Location $repoRoot
try {
  $argsList = @(
    "scripts/update_suppression_from_replies.py",
    "--suppression-list", $SuppressionList,
    "--source", $Source,
    "--reason", $Reason,
    "--report", $ReportPath,
    "--inputs"
  ) + $InputFiles

  & $python @argsList

  if ($LASTEXITCODE -ne 0) {
    throw "Suppression ingest failed with exit code $LASTEXITCODE"
  }
}
finally {
  Pop-Location
}
