# Full PostgreSQL backup using DATABASE_URL from .env
# Usage: .\scripts\db-backup.ps1

param(
  [string]$EnvFile = ".env",
  [string]$OutDir = "backups"
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

if (-not (Test-Path $EnvFile)) {
  Write-Error "Missing $EnvFile. Set DATABASE_URL first."
}

$line = Get-Content $EnvFile | Where-Object { $_ -match '^\s*DATABASE_URL\s*=' } | Select-Object -First 1
if (-not $line) {
  Write-Error "DATABASE_URL not found in $EnvFile"
}

$url = ($line -split '=', 2)[1].Trim().Trim('"').Trim("'")

$pgDump = Get-Command pg_dump -ErrorAction SilentlyContinue
if (-not $pgDump) {
  Write-Error "pg_dump not found. Add PostgreSQL bin to PATH (e.g. C:\Program Files\PostgreSQL\17\bin)"
}

New-Item -ItemType Directory -Force -Path $OutDir | Out-Null
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
$outFile = Join-Path $OutDir "spafurniture-$stamp.dump"

Write-Host "Backing up to $outFile ..."
& pg_dump $url -Fc --no-owner -f $outFile
if ($LASTEXITCODE -ne 0) {
  Write-Error "pg_dump failed with exit code $LASTEXITCODE"
}

Write-Host "Done: $outFile"
