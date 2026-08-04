$ErrorActionPreference = "Stop"

$projectRoot = $PSScriptRoot
$pidsFile = Join-Path $projectRoot "proyecto.prod\usuario-app\.run-logs\procesos.json"

if (-not (Test-Path -LiteralPath $pidsFile)) {
  Write-Host "No hay procesos registrados para detener."
  exit 0
}

$processes = Get-Content -Raw -LiteralPath $pidsFile | ConvertFrom-Json
foreach ($process in $processes) {
  if (Get-Process -Id $process.pid -ErrorAction SilentlyContinue) {
    taskkill.exe /PID $process.pid /T /F | Out-Null
    Write-Host "Detenido: $($process.nombre)"
  }
}

Remove-Item -LiteralPath $pidsFile -Force
Write-Host "Todas las aplicaciones fueron detenidas." -ForegroundColor Green
