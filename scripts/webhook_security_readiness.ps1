param(
  [string]$PythonExe = "",
  [int]$OrgId = 0,
  [switch]$RequireSigningSecrets,
  [switch]$RequireRetellApiKey,
  [switch]$RequireZapierApiKey,
  [switch]$SkipPlatformTests
)

$ErrorActionPreference = "Continue"

$repoRoot = Split-Path -Parent $PSScriptRoot
$backendRoot = Join-Path $repoRoot "backend"

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

function Invoke-Step {
  param(
    [string]$Name,
    [string]$Executable,
    [string[]]$Arguments
  )

  Write-Host "=== START $Name ==="
  & $Executable @Arguments 2>&1 | Out-Host
  $exitCode = $LASTEXITCODE
  if ($exitCode -eq 0) {
    Write-Host "=== OK $Name ==="
  } else {
    Write-Host "=== FAIL $Name (exit=$exitCode) ==="
  }
  return $exitCode
}

$python = Resolve-Python -ExplicitPythonExe $PythonExe

$auditExit = 0
$testsExit = 0

Push-Location $backendRoot
try {
  $auditArgs = @("scripts/webhook_env_audit.py", "--check")
  if ($OrgId -gt 0) {
    $auditArgs += @("--org-id", "$OrgId")
  }
  if ($RequireSigningSecrets) {
    $auditArgs += "--require-signing-secrets"
  }
  if ($RequireRetellApiKey) {
    $auditArgs += "--require-retell-api-key"
  }
  if ($RequireZapierApiKey) {
    $auditArgs += "--require-zapier-api-key"
  }

  $auditExit = Invoke-Step -Name "WebhookEnvAudit" -Executable $python -Arguments $auditArgs

  if (-not $SkipPlatformTests) {
    $testsExit = Invoke-Step -Name "PlatformIntegrationTests" -Executable $python -Arguments @("-m", "pytest", "tests/test_platform_features.py", "-q")
  }
}
finally {
  Pop-Location
}

$testsPassed = $SkipPlatformTests -or ($testsExit -eq 0)
$allPassed = ($auditExit -eq 0) -and $testsPassed

Write-Host ""
Write-Host "Webhook Security Readiness Summary"
Write-Host "================================="
Write-Host "Python: $python"
Write-Host "Webhook env audit: $(if ($auditExit -eq 0) { 'PASS' } else { 'FAIL' })"
Write-Host "Platform tests: $(if ($SkipPlatformTests) { 'SKIPPED' } elseif ($testsExit -eq 0) { 'PASS' } else { 'FAIL' })"
Write-Host "Require signing secrets: $(if ($RequireSigningSecrets) { 'YES' } else { 'NO' })"
Write-Host "Require Retell API key: $(if ($RequireRetellApiKey) { 'YES' } else { 'NO' })"
Write-Host "Require Zapier API key: $(if ($RequireZapierApiKey) { 'YES' } else { 'NO' })"
Write-Host "Org scope: $(if ($OrgId -gt 0) { $OrgId } else { 'ALL' })"

if ($allPassed) {
  Write-Host "WEBHOOK_SECURITY_READINESS_OK"
  exit 0
}

Write-Host "WEBHOOK_SECURITY_READINESS_FAIL"
exit 1
