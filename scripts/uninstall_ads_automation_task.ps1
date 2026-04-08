param(
  [string]$TaskName = "FrontDeskPro-Ads-Automation-Daily"
)

$existing = Get-ScheduledTask -TaskName $TaskName -ErrorAction SilentlyContinue
if ($existing) {
  Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false
  Write-Host "Deleted scheduled task: $TaskName"
} else {
  Write-Host "Scheduled task not found: $TaskName"
}
