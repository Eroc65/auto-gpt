param(
  [string]$PythonExe = "",
  [string]$ApiKeyEnv = "GOOGLE_MAPS_API_KEY",
  [int]$MaxResults = 60,
  [switch]$Dallas,
  [switch]$Houston
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

function Invoke-Prospector {
  param(
    [string]$Python,
    [string]$Query,
    [string]$City,
    [string]$State,
    [string]$Trade,
    [string]$OutputPath,
    [int]$Limit,
    [string]$ApiEnvName
  )

  Write-Host "=== START Prospecting $City ==="
  & $Python "scripts/google_places_prospector.py" `
    --query $Query `
    --city $City `
    --state $State `
    --trade $Trade `
    --max-results "$Limit" `
    --api-key-env $ApiEnvName `
    --output $OutputPath

  if ($LASTEXITCODE -ne 0) {
    throw "Prospecting failed for $City (exit=$LASTEXITCODE)."
  }

  Write-Host "=== OK Prospecting $City ==="
}

$apiKey = [Environment]::GetEnvironmentVariable($ApiKeyEnv)
if (-not $apiKey -or $apiKey.Trim().Length -eq 0) {
  throw "Missing API key. Set environment variable '$ApiKeyEnv' before running."
}

$python = Resolve-Python -ExplicitPythonExe $PythonExe

$runDallas = $Dallas -or (-not $Dallas -and -not $Houston)
$runHouston = $Houston -or (-not $Dallas -and -not $Houston)

Push-Location $repoRoot
try {
  if ($runDallas) {
    Invoke-Prospector -Python $python -Query "plumber in Dallas, TX" -City "Dallas" -State "TX" -Trade "Plumbing" -Limit $MaxResults -ApiEnvName $ApiKeyEnv -OutputPath "docs/ads/GOFIELDWISE_LEADLAUNCH_DALLAS_COLD_EMAIL_LIST_REAL.csv"
  }

  if ($runHouston) {
    Invoke-Prospector -Python $python -Query "plumber in Houston, TX" -City "Houston" -State "TX" -Trade "Plumbing" -Limit $MaxResults -ApiEnvName $ApiKeyEnv -OutputPath "docs/ads/GOFIELDWISE_LEADLAUNCH_HOUSTON_COLD_EMAIL_LIST_REAL.csv"
  }

  Write-Host "LEAD_PROSPECTING_OK"
}
finally {
  Pop-Location
}
