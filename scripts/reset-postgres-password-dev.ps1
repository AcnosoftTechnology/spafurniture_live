# Resets local PostgreSQL 17 "postgres" user password to match .env (dev only).
# Run PowerShell as Administrator.
param(
    [string]$NewPassword = "postgres"
)

$PgData = "C:\Program Files\PostgreSQL\17\data"
$PgBin = "C:\Program Files\PostgreSQL\17\bin"
$PgHba = Join-Path $PgData "pg_hba.conf"
$PgCtl = Join-Path $PgBin "pg_ctl.exe"
$Psql = Join-Path $PgBin "psql.exe"

if (-not (Test-Path $PgHba)) {
    Write-Error "PostgreSQL 17 data folder not found."
    exit 1
}

$backup = "$PgHba.bak.$(Get-Date -Format 'yyyyMMddHHmmss')"
Copy-Item $PgHba $backup
Write-Host "Backed up pg_hba.conf to $backup"

$content = Get-Content $PgHba -Raw
$trustBlock = @"
# TYPE  DATABASE        USER            ADDRESS                 METHOD
local   all             all                                     trust
host    all             all             127.0.0.1/32            trust
host    all             all             ::1/128                 trust
"@

# Replace auth lines (local + host for all)
$content = $content -replace '(?m)^local\s+all\s+all\s+scram-sha-256\s*$', 'local   all             all                                     trust'
$content = $content -replace '(?m)^host\s+all\s+all\s+127\.0\.0\.1/32\s+scram-sha-256\s*$', 'host    all             all             127.0.0.1/32            trust'
$content = $content -replace '(?m)^host\s+all\s+all\s+::1/128\s+scram-sha-256\s*$', 'host    all             all             ::1/128                 trust'
Set-Content $PgHba $content -NoNewline

& $PgCtl restart -D $PgData
Start-Sleep -Seconds 3

$sql = "ALTER USER postgres WITH PASSWORD '$NewPassword';"
& $Psql -U postgres -h 127.0.0.1 -d postgres -c $sql
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to set password. Restore backup: Copy-Item '$backup' '$PgHba' -Force"
    exit 1
}

# Restore scram-sha-256
$restored = Get-Content $backup -Raw
Set-Content $PgHba $restored -NoNewline
& $PgCtl restart -D $PgData

Write-Host ""
Write-Host "Done. postgres password is now: $NewPassword"
Write-Host "Your .env should use:"
Write-Host "DATABASE_URL=`"postgresql://postgres:${NewPassword}@localhost:5432/spafurniture?schema=public`""
