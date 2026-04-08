param(
  [string]$TaskName = "FrontDeskPro-Ads-Automation-Daily",
  [string]$RunAt = "06:00",
  [string]$RepoRoot = "C:\Users\erock\FrontDesk Pro"
)

$pipelineScript = Join-Path $RepoRoot "scripts\run_ads_daily_pipeline.ps1"
if (-not (Test-Path $pipelineScript)) {
  throw "Pipeline script not found: $pipelineScript"
}

$existing = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($existing) {
  Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
}

$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$pipelineScript`""
$trigger = New-ScheduledTaskTrigger -Daily -At $RunAt
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited

Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Principal $principal -Description "FrontDesk Pro daily ads automation pipeline" | Out-Null

Write-Host "Installed scheduled task: $TaskName at $RunAt"
Write-Host "Use 'Get-ScheduledTask -TaskName $TaskName | Format-List *' to verify."
