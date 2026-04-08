param(
    [string]$ApexHost = "gofieldwise.com",
    [string]$WwwHost = "www.gofieldwise.com",
    [string]$ExpectedCname = "gofieldwise.onrender.com",
    [string]$ExpectedBrandText = "GoFieldwise",
    [string]$DeployHookUrl,
    [switch]$SkipDeployTrigger
)

$ErrorActionPreference = "Stop"

function Assert-Condition {
    param(
        [bool]$Condition,
        [string]$Message
    )

    if (-not $Condition) {
        throw $Message
    }
}

function Get-CanonicalCname {
    param([string]$DnsName)

    $record = Resolve-DnsName -Name $DnsName -Type CNAME -ErrorAction Stop | Select-Object -First 1
    return ($record.NameHost.TrimEnd('.')).ToLowerInvariant()
}

function Test-LiveHttp {
    param(
        [string]$Url,
        [string]$BrandText
    )

    $resp = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 25
    Assert-Condition ($resp.StatusCode -eq 200) "$Url returned HTTP $($resp.StatusCode)"
    Assert-Condition ($resp.Content -match [regex]::Escape($BrandText)) "$Url response missing expected brand text '$BrandText'"
    return $resp.BaseResponse.ResponseUri.AbsoluteUri
}

if (-not $SkipDeployTrigger) {
    if ([string]::IsNullOrWhiteSpace($DeployHookUrl)) {
        throw "Provide -DeployHookUrl or pass -SkipDeployTrigger."
    }

    Assert-Condition ($DeployHookUrl -match '^https://api\.render\.com/deploy/srv-[A-Za-z0-9]+\?key=[A-Za-z0-9]+$') "Deploy hook URL format is invalid."
    Write-Output "CUTOVER: triggering production deploy hook"
    $deployResp = Invoke-WebRequest -Uri $DeployHookUrl -Method Post -UseBasicParsing -TimeoutSec 25
    Assert-Condition ($deployResp.StatusCode -ge 200 -and $deployResp.StatusCode -lt 300) "Deploy hook call failed with HTTP $($deployResp.StatusCode)"
}

Write-Output "CUTOVER: waiting for DNS propagation window"
Start-Sleep -Seconds 15

Write-Output "CUTOVER: validating DNS"
$resolvedWwwCname = Get-CanonicalCname -DnsName $WwwHost
Assert-Condition ($resolvedWwwCname -eq $ExpectedCname.ToLowerInvariant()) "www CNAME expected '$ExpectedCname' but got '$resolvedWwwCname'"

$apexARecords = Resolve-DnsName -Name $ApexHost -Type A -ErrorAction Stop
Assert-Condition ($apexARecords.Count -ge 1) "No apex A records found for $ApexHost"

Write-Output "CUTOVER: validating live HTTPS responses"
$apexUrl = "https://$ApexHost"
$wwwUrl = "https://$WwwHost"
$apexResolved = Test-LiveHttp -Url $apexUrl -BrandText $ExpectedBrandText
$wwwResolved = Test-LiveHttp -Url $wwwUrl -BrandText $ExpectedBrandText
Assert-Condition ($wwwResolved -like "$apexUrl*") "www did not resolve to apex. Resolved URL: $wwwResolved"

Write-Output "CUTOVER_OK"
Write-Output "APEX_RESOLVED=$apexResolved"
Write-Output "WWW_RESOLVED=$wwwResolved"
Write-Output "WWW_CNAME=$resolvedWwwCname"