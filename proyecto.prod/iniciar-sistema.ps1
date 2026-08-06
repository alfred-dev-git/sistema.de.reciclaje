$ErrorActionPreference = "Stop"

$raiz = Split-Path -Parent $MyInvocation.MyCommand.Path
$estadoDir = Join-Path $env:TEMP "recolectapp-sistema"
$logsDir = Join-Path $estadoDir "logs"
$pidFile = Join-Path $estadoDir "procesos.json"

New-Item -ItemType Directory -Force -Path $logsDir | Out-Null

if (Test-Path $pidFile) {
  Write-Host "Ya existe una sesión registrada. Ejecutá primero .\apagar-sistema.ps1" -ForegroundColor Yellow
  exit 1
}

$ip = (ipconfig | Select-String "IPv4" | ForEach-Object {
  if ($_.Line -match '(\d{1,3}(?:\.\d{1,3}){3})') { $Matches[1] }
} | Where-Object { $_ -notlike "169.254.*" -and $_ -ne "127.0.0.1" } | Select-Object -First 1)

if (-not $ip) { throw "No se pudo detectar la dirección IPv4 de la PC." }

function Iniciar-Proceso {
  param([string]$Nombre, [string]$Carpeta, [string[]]$Argumentos, [hashtable]$Variables = @{})
  $anteriores = @{}
  foreach ($clave in $Variables.Keys) {
    $anteriores[$clave] = [Environment]::GetEnvironmentVariable($clave, "Process")
    [Environment]::SetEnvironmentVariable($clave, $Variables[$clave], "Process")
  }
  try {
    $proceso = Start-Process npm.cmd -ArgumentList $Argumentos -WorkingDirectory $Carpeta `
      -WindowStyle Hidden -PassThru `
      -RedirectStandardOutput (Join-Path $logsDir "$Nombre.log") `
      -RedirectStandardError (Join-Path $logsDir "$Nombre-error.log")
    return [pscustomobject]@{ nombre = $Nombre; pid = $proceso.Id }
  } finally {
    foreach ($clave in $Variables.Keys) {
      [Environment]::SetEnvironmentVariable($clave, $anteriores[$clave], "Process")
    }
  }
}

$procesos = @()
$procesos += Iniciar-Proceso "admin-back" (Join-Path $raiz "admin-web\back-end") @("run", "dev")
$procesos += Iniciar-Proceso "admin-front" (Join-Path $raiz "admin-web\front-end") @("run", "dev", "--", "--host", "0.0.0.0")
$procesos += Iniciar-Proceso "usuario-back" (Join-Path $raiz "usuario-app\back") @("run", "dev")
$procesos += Iniciar-Proceso "usuario-front" (Join-Path $raiz "usuario-app\front") @("start", "--", "--lan", "--port", "8081", "--clear") @{ EXPO_PUBLIC_API_URL = "http://${ip}:3000/api" }
$procesos += Iniciar-Proceso "recolector-back" (Join-Path $raiz "recolector-app\back-end") @("run", "dev") @{ PORT = "3001" }
$procesos += Iniciar-Proceso "recolector-front" (Join-Path $raiz "recolector-app\front-end") @("start", "--", "--lan", "--port", "8082", "--clear") @{ API_URL = "http://${ip}:3001/api" }

$procesos | ConvertTo-Json | Set-Content -Encoding UTF8 $pidFile
Start-Sleep -Seconds 5

Write-Host "Sistema iniciado." -ForegroundColor Green
Write-Host "Admin:              http://${ip}:5173"
Write-Host "Expo Contribuyentes: exp://${ip}:8081"
Write-Host "Expo Recolectores:   exp://${ip}:8082"
Write-Host "Logs: $logsDir"

