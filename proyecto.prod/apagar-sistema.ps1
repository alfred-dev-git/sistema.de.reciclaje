$estadoDir = Join-Path $env:TEMP "recolectapp-sistema"
$pidFile = Join-Path $estadoDir "procesos.json"

function Detener-Arbol {
  param([int]$PidRaiz)
  $hijos = Get-CimInstance Win32_Process -ErrorAction SilentlyContinue |
    Where-Object { $_.ParentProcessId -eq $PidRaiz }
  foreach ($hijo in $hijos) { Detener-Arbol -PidRaiz $hijo.ProcessId }
  Stop-Process -Id $PidRaiz -Force -ErrorAction SilentlyContinue
}

if (Test-Path $pidFile) {
  $procesos = @(Get-Content $pidFile -Raw | ConvertFrom-Json)
  foreach ($proceso in $procesos) {
    Detener-Arbol -PidRaiz ([int]$proceso.pid)
  }
  Remove-Item -LiteralPath $pidFile -Force
  Write-Host "Sistema detenido correctamente." -ForegroundColor Green
} else {
  $puertos = @(3000, 3001, 5173, 8080, 8081, 8082)
  $lineas = netstat -ano | Select-String "LISTENING"
  $pidsDetectados = foreach ($linea in $lineas) {
    if ($linea.Line -match '^\s*TCP\s+\S+:(\d+)\s+\S+\s+LISTENING\s+(\d+)\s*$') {
      if ($puertos -contains [int]$Matches[1]) { [int]$Matches[2] }
    }
  }

  foreach ($pidDetectado in @($pidsDetectados | Sort-Object -Unique)) {
    $objetivo = $pidDetectado
    $actual = Get-CimInstance Win32_Process -Filter "ProcessId=$pidDetectado" -ErrorAction SilentlyContinue
    while ($actual) {
      $padre = Get-CimInstance Win32_Process -Filter "ProcessId=$($actual.ParentProcessId)" -ErrorAction SilentlyContinue
      if (-not $padre -or $padre.Name -notin @("node.exe", "cmd.exe")) { break }
      $objetivo = $padre.ProcessId
      $actual = $padre
    }
    Detener-Arbol -PidRaiz $objetivo
  }

  if (@($pidsDetectados).Count -gt 0) {
    Write-Host "Sistema detectado por puertos y detenido correctamente." -ForegroundColor Green
  } else {
    Write-Host "No se encontraron procesos activos del sistema." -ForegroundColor Yellow
  }
}
