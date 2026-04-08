param(
  [string]$AsOf = "",
  [int]$WindowDays = 7
)

$repoRoot = Split-Path -Parent $PSScriptRoot
$scriptPath = Join-Path $repoRoot "backend\scripts\ads_automation.py"

if ($AsOf -and $AsOf.Trim().Length -gt 0) {
  python $scriptPath --window-days $WindowDays --as-of $AsOf
} else {
  python $scriptPath --window-days $WindowDays
}
