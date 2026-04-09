param(
  [string]$TaskName = "FrontDeskPro-LeadLaunch-Compliance-Daily",
  [string]$RunAt = "07:00",
  [string]$RepoRoot = "C:\Users\erock\FrontDesk Pro",
  [string]$ReplyExportPath = "docs/ads/reports/replies_export.csv"
)

$pipelineScript = Join-Path $RepoRoot "scripts\run_daily_compliance.ps1"
if (-not (Test-Path $pipelineScript)) {
  throw "Pipeline script not found: $pipelineScript"
}

$existing = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($existing) {
  Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
}

$arguments = "-NoProfile -ExecutionPolicy Bypass -File `"$pipelineScript`" -ReplyExportFiles `"$ReplyExportPath`""
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument $arguments
$trigger = New-ScheduledTaskTrigger -Daily -At $RunAt
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited

Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Principal $principal -Description "FrontDesk Pro daily LeadLaunch compliance pipeline" | Out-Null

Write-Host "Installed scheduled task: $TaskName at $RunAt"
Write-Host "Reply export input: $ReplyExportPath"
Write-Host "Use 'Get-ScheduledTask -TaskName $TaskName | Format-List *' to verify."
