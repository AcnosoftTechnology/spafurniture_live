# Start PostgreSQL 17 on Windows (run PowerShell as Administrator for -RegisterService)
param(
    [switch]$RegisterService
)

$PgRoot = "C:\Program Files\PostgreSQL\17"
$PgBin = Join-Path $PgRoot "bin"
$PgData = Join-Path $PgRoot "data"
$ServiceName = "postgresql-x64-17"
$PgCtl = Join-Path $PgBin "pg_ctl.exe"

if (-not (Test-Path $PgCtl)) {
    Write-Error "PostgreSQL 17 not found at $PgRoot"
    exit 1
}

if ($RegisterService) {
    Write-Host "Registering Windows service '$ServiceName' (requires Administrator)..."
    & $PgCtl register -N $ServiceName -D $PgData
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    Set-Service -Name $ServiceName -StartupType Automatic
    Start-Service -Name $ServiceName
    Write-Host "Service started."
} else {
    $status = & $PgCtl status -D $PgData 2>&1
    if ($status -match "server is running") {
        Write-Host "PostgreSQL is already running."
    } else {
        Write-Host "Starting PostgreSQL..."
        & $PgCtl start -D $PgData -l (Join-Path $PgData "log\startup.log")
        Start-Sleep -Seconds 2
        & $PgCtl status -D $PgData
    }
}

Write-Host ""
Write-Host "Test connection (enter YOUR postgres password from install):"
Write-Host "  psql -U postgres -h 127.0.0.1 -c `"CREATE DATABASE spafurniture;`""
Write-Host ""
Write-Host "Then update .env DATABASE_URL with your real password."
