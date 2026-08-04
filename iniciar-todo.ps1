$ErrorActionPreference = "Stop"

$projectRoot = $PSScriptRoot
$logsDir = Join-Path $projectRoot "proyecto.prod\usuario-app\.run-logs"
$pidsFile = Join-Path $logsDir "procesos.json"
$requiredPorts = @(3000, 3001, 5173, 8080, 8081, 8082)

New-Item -ItemType Directory -Force -Path $logsDir | Out-Null

$listening = netstat -ano
foreach ($port in $requiredPorts) {
  if ($listening -match ":$port\s+.*LISTENING") {
    throw "El puerto $port ya está ocupado. Ejecutá .\detener-todo.ps1 o cerrá el proceso que lo utiliza."
  }
}

$ipLine = ipconfig | Select-String -Pattern "IPv4" | Select-Object -First 1
$localIp = if ($ipLine -and $ipLine.Line -match "(\d{1,3}(?:\.\d{1,3}){3})") {
  $Matches[1]
} else {
  "127.0.0.1"
}

function Start-ProjectProcess {
  param(
    [string]$Name,
    [string]$WorkingDirectory,
    [string[]]$Arguments,
    [hashtable]$Environment = @{}
  )

  $previousValues = @{}
  foreach ($key in $Environment.Keys) {
    $previousValues[$key] = [Environment]::GetEnvironmentVariable($key, "Process")
    [Environment]::SetEnvironmentVariable($key, [string]$Environment[$key], "Process")
  }

  try {
    $process = Start-Process `
      -FilePath "npm.cmd" `
      -ArgumentList $Arguments `
      -WorkingDirectory $WorkingDirectory `
      -WindowStyle Hidden `
      -RedirectStandardOutput (Join-Path $logsDir "$Name.out.log") `
      -RedirectStandardError (Join-Path $logsDir "$Name.err.log") `
      -PassThru
  } finally {
    foreach ($key in $Environment.Keys) {
      [Environment]::SetEnvironmentVariable($key, $previousValues[$key], "Process")
    }
  }

  [PSCustomObject]@{ nombre = $Name; pid = $process.Id }
}

$processes = @()
$processes += Start-ProjectProcess "admin-back" "$projectRoot\proyecto.prod\admin-web\back-end" @("run", "dev")
$processes += Start-ProjectProcess "admin-front" "$projectRoot\proyecto.prod\admin-web\front-end" @("run", "dev", "--", "--host", "0.0.0.0", "--port", "5173")
$processes += Start-ProjectProcess "usuario-back" "$projectRoot\proyecto.prod\usuario-app\back" @("run", "dev")
$processes += Start-ProjectProcess "usuario-front" "$projectRoot\proyecto.prod\usuario-app\front" @("start", "--", "--port", "8081", "--go", "--offline") @{
  EXPO_OFFLINE = "1"
  EXPO_PUBLIC_API_URL = "http://${localIp}:3000/api"
}
$processes += Start-ProjectProcess "recolector-back" "$projectRoot\proyecto.prod\recolector-app\back-end" @("run", "dev") @{
  PORT = "3001"
}
$processes += Start-ProjectProcess "recolector-front" "$projectRoot\proyecto.prod\recolector-app\front-end" @("start", "--", "--port", "8082", "--go", "--offline") @{
  EXPO_OFFLINE = "1"
  API_URL = "http://${localIp}:3001/api"
}

$processes | ConvertTo-Json | Set-Content -Encoding UTF8 $pidsFile

Write-Host "Aplicaciones iniciadas correctamente." -ForegroundColor Green
Write-Host "Admin web:       http://localhost:5173"
Write-Host "Contribuyente:   exp://${localIp}:8081"
Write-Host "Recolector:      exp://${localIp}:8082"
Write-Host "Logs:            $logsDir"
Write-Host "Para detenerlas: .\detener-todo.ps1"
