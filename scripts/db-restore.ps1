# Restore PostgreSQL dump into DATABASE_URL from .env
# Usage: .\scripts\db-restore.ps1 -DumpFile ".\backups\spafurniture-20250604-120000.dump"

param(
  [Parameter(Mandatory = $true)]
  [string]$DumpFile,
  [string]$EnvFile = ".env"
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

if (-not (Test-Path $DumpFile)) {
  Write-Error "Dump file not found: $DumpFile"
}

if (-not (Test-Path $EnvFile)) {
  Write-Error "Missing $EnvFile"
}

$line = Get-Content $EnvFile | Where-Object { $_ -match '^\s*DATABASE_URL\s*=' } | Select-Object -First 1
$url = ($line -split '=', 2)[1].Trim().Trim('"').Trim("'")

$pgRestore = Get-Command pg_restore -ErrorAction SilentlyContinue
if (-not $pgRestore) {
  Write-Error "pg_restore not found. Add PostgreSQL bin to PATH."
}

Write-Host "Restoring $DumpFile into database from .env ..."
Write-Host "WARNING: --clean will drop existing objects. Press Ctrl+C to cancel."
Start-Sleep -Seconds 3

& pg_restore -d $url --clean --if-exists --no-owner $DumpFile
# pg_restore may exit 1 with harmless warnings; show exit code
Write-Host "pg_restore finished with exit code $LASTEXITCODE (non-zero warnings are common)"
