param(
    [string]$LocalApiBaseUrl = "http://127.0.0.1:8001",
    [string]$ApexUrl = "https://gofieldwise.com",
    [string]$WwwUrl = "https://www.gofieldwise.com",
    [string]$ExpectedBrandText = "GoFieldwise"
)

$ErrorActionPreference = "Stop"

function Get-PythonCommand {
    if (Test-Path ".venv\Scripts\python.exe") {
        return (Resolve-Path ".venv\Scripts\python.exe").Path
    }

    $py = Get-Command python -ErrorAction SilentlyContinue
    if ($py) {
        return $py.Source
    }

    throw "Python executable not found."
}

function Wait-ForHttpReady {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Url,
        [int]$MaxSeconds = 25
    )

    $deadline = (Get-Date).AddSeconds($MaxSeconds)
    while ((Get-Date) -lt $deadline) {
        try {
            $null = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 3
            return
        }
        catch {
            Start-Sleep -Milliseconds 600
        }
    }

    throw "Timed out waiting for API readiness at $Url"
}

function Test-LiveUrl {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Url,
        [Parameter(Mandatory = $true)]
        [string]$ExpectedText
    )

    $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 20
    if ($response.StatusCode -ne 200) {
        throw "$Url returned HTTP $($response.StatusCode)"
    }

    if ($response.Content -notmatch [regex]::Escape($ExpectedText)) {
        throw "$Url did not include expected text '$ExpectedText'"
    }

    return $response.BaseResponse.ResponseUri.AbsoluteUri
}

$python = Get-PythonCommand
Write-Output "READINESS: using python at $python"

Write-Output "READINESS: running backend pytest suite"
Push-Location backend
try {
    & $python -m pytest -q
    if ($LASTEXITCODE -ne 0) {
        throw "Backend test suite failed with exit code $LASTEXITCODE"
    }
}
finally {
    Pop-Location
}

Write-Output "READINESS: starting local API"
$server = Start-Process -FilePath $python -ArgumentList @("-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8001") -WorkingDirectory (Join-Path (Get-Location) "backend") -PassThru -WindowStyle Hidden

try {
    Wait-ForHttpReady -Url "$LocalApiBaseUrl/docs"

    Write-Output "READINESS: running auth smoke"
    $env:SMOKE_AUTH_BASE_URL = $LocalApiBaseUrl
    & $python "backend\scripts\smoke_auth.py"
    if ($LASTEXITCODE -ne 0) {
        throw "Auth smoke failed with exit code $LASTEXITCODE"
    }
}
finally {
    if ($server -and -not $server.HasExited) {
        Stop-Process -Id $server.Id -Force
    }
    Remove-Item Env:SMOKE_AUTH_BASE_URL -ErrorAction SilentlyContinue
}

Write-Output "READINESS: validating live apex and www"
$apexResolved = Test-LiveUrl -Url $ApexUrl -ExpectedText $ExpectedBrandText
$wwwResolved = Test-LiveUrl -Url $WwwUrl -ExpectedText $ExpectedBrandText

if ($wwwResolved -notlike "$ApexUrl*") {
    throw "www URL did not resolve to apex URL. Resolved to: $wwwResolved"
}

Write-Output "READINESS_OK"
Write-Output "APEX_RESOLVED=$apexResolved"
Write-Output "WWW_RESOLVED=$wwwResolved"