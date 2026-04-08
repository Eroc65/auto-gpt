param(
  [string]$Repo = "Eroc65/auto-gpt",
  [string]$WorkflowName = "Integration Secrets Check",
  [string]$Ref = "",
  [switch]$WaitForCompletion = $true,
  [switch]$ShowLogs = $true
)

$ErrorActionPreference = "Stop"

function Require-Gh {
  if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    throw "GitHub CLI (gh) is not installed or not in PATH."
  }
  $null = gh auth status 2>$null
  if ($LASTEXITCODE -ne 0) {
    throw "GitHub CLI is not authenticated. Run: gh auth login"
  }
}

function Get-LatestRun {
  param(
    [string]$RepoName,
    [string]$Workflow,
    [int]$Limit = 1
  )

  $json = gh run list --repo $RepoName --workflow $Workflow --limit $Limit --json databaseId,status,conclusion,displayTitle,createdAt,url
  if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($json)) {
    return $null
  }

  $runs = $json | ConvertFrom-Json
  if (-not $runs) {
    return $null
  }

  if ($runs -is [System.Array]) {
    return $runs[0]
  }

  return $runs
}

Require-Gh

$triggerAt = Get-Date
Write-Host "Triggering workflow '$WorkflowName' in $Repo ..."
if ([string]::IsNullOrWhiteSpace($Ref)) {
  gh workflow run $WorkflowName --repo $Repo
} else {
  gh workflow run $WorkflowName --repo $Repo --ref $Ref
}
if ($LASTEXITCODE -ne 0) {
  throw "Failed to trigger workflow '$WorkflowName' for $Repo"
}

$run = $null
for ($i = 0; $i -lt 20; $i++) {
  $run = Get-LatestRun -RepoName $Repo -Workflow $WorkflowName -Limit 1
  if ($run -and $run.createdAt) {
    $runCreated = Get-Date $run.createdAt
    if ($runCreated -ge $triggerAt.AddMinutes(-1)) {
      break
    }
  }
  Start-Sleep -Seconds 2
}

if (-not $run) {
  throw "Triggered workflow but could not resolve latest run details."
}

Write-Host "Run ID: $($run.databaseId)"
Write-Host "Status: $($run.status)"
Write-Host "Conclusion: $($run.conclusion)"
Write-Host "URL: $($run.url)"

$watchExit = 0
if ($WaitForCompletion) {
  Write-Host "Watching run until completion..."
  gh run watch $run.databaseId --repo $Repo --exit-status
  $watchExit = $LASTEXITCODE
}

if ($ShowLogs) {
  Write-Host "Fetching run logs..."
  gh run view $run.databaseId --repo $Repo --log
}

if ($watchExit -ne 0) {
  throw "Workflow run completed with failure status (exit=$watchExit)."
}

Write-Host "INTEGRATION_SECRETS_CHECK_TRIGGER_OK"
