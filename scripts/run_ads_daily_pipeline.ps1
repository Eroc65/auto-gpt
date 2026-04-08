param(
  [int]$WindowDays = 7,
  [string]$AsOf = "",
  [string]$PythonExe = ""
)

$repoRoot = Split-Path -Parent $PSScriptRoot
$logsDir = Join-Path $repoRoot "docs\ads\reports"
if (-not (Test-Path $logsDir)) {
  New-Item -ItemType Directory -Path $logsDir -Force | Out-Null
}

if ($PythonExe -and $PythonExe.Trim().Length -gt 0) {
  $python = $PythonExe
} elseif ($env:ADS_AUTOMATION_PYTHON -and $env:ADS_AUTOMATION_PYTHON.Trim().Length -gt 0) {
  $python = $env:ADS_AUTOMATION_PYTHON
} else {
  $cmd = Get-Command python -ErrorAction SilentlyContinue
  if (-not $cmd) {
    throw "Python executable not found. Set ADS_AUTOMATION_PYTHON or pass -PythonExe."
  }
  $python = $cmd.Source
}

$dateStamp = Get-Date -Format "yyyyMMdd"
$logPath = Join-Path $logsDir "ads_daily_pipeline_$dateStamp.log"

function Invoke-Step {
  param(
    [string]$Name,
    [string]$Executable,
    [string[]]$Arguments
  )

  "[$(Get-Date -Format o)] START $Name" | Tee-Object -FilePath $logPath -Append
  & $Executable @Arguments 2>&1 | Tee-Object -FilePath $logPath -Append
  if ($LASTEXITCODE -ne 0) {
    "[$(Get-Date -Format o)] FAIL $Name exit=$LASTEXITCODE" | Tee-Object -FilePath $logPath -Append
    throw "$Name failed with exit code $LASTEXITCODE"
  }
  "[$(Get-Date -Format o)] OK $Name" | Tee-Object -FilePath $logPath -Append
}

Push-Location $repoRoot
try {
  $fetchScript = Join-Path $repoRoot "backend\scripts\ads_fetch_live.py"
  $automationScript = Join-Path $repoRoot "backend\scripts\ads_automation.py"
  $notifyScript = Join-Path $repoRoot "backend\scripts\ads_notify.py"

  Invoke-Step -Name "FetchLiveMetrics" -Executable $python -Arguments @($fetchScript)

  if ($AsOf -and $AsOf.Trim().Length -gt 0) {
    Invoke-Step -Name "GenerateWeeklyReport" -Executable $python -Arguments @(
      $automationScript,
      "--window-days",
      "$WindowDays",
      "--as-of",
      $AsOf
    )
  } else {
    Invoke-Step -Name "GenerateWeeklyReport" -Executable $python -Arguments @(
      $automationScript,
      "--window-days",
      "$WindowDays"
    )
  }

  if ($AsOf -and $AsOf.Trim().Length -gt 0) {
    Invoke-Step -Name "SendNotifications" -Executable $python -Arguments @(
      $notifyScript,
      "--as-of",
      $AsOf
    )
  } else {
    Invoke-Step -Name "SendNotifications" -Executable $python -Arguments @($notifyScript)
  }

  "[$(Get-Date -Format o)] COMPLETE Ads daily pipeline" | Tee-Object -FilePath $logPath -Append
}
finally {
  Pop-Location
}
