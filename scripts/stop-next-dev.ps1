# Stops stray Next.js dev servers for this project (fixes "Another next dev server is already running").
$lockPath = Join-Path $PSScriptRoot (Join-Path ".." (Join-Path ".next" (Join-Path "dev" "lock")))
if (Test-Path $lockPath) {
  try {
    $lock = Get-Content $lockPath -Raw | ConvertFrom-Json
    if ($lock.pid) {
      Stop-Process -Id $lock.pid -Force -ErrorAction SilentlyContinue
      Write-Host "Stopped Next dev PID $($lock.pid)"
    }
  } catch {
    Write-Host "Could not read dev lock file."
  }
  Remove-Item $lockPath -Force -ErrorAction SilentlyContinue
}

foreach ($port in 3000, 3001, 3002) {
  Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue |
    ForEach-Object {
      Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
      Write-Host "Freed port $port (PID $($_.OwningProcess))"
    }
}

Write-Host "Done. Run: npm run dev"
