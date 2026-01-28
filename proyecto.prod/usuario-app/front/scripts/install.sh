#!/bin/sh
set -e

echo "=== Instalador & Versionador VDG ==="
echo

# =========================
# Selección de SO
# =========================
echo "Seleccioná tu sistema:"
echo "1) Linux"
echo "2) Windows (Git Bash)"
printf "> "
read OS_OPT

case "$OS_OPT" in
  1) OS="linux" ;;
  2) OS="windows" ;;
  *) echo "Opción inválida"; exit 1 ;;
esac

# =========================
# Instalación jq
# =========================
echo
echo "Instalando jq..."

if ! command -v jq >/dev/null 2>&1; then
  if [ "$OS" = "linux" ]; then
    curl -fsSL https://github.com/jqlang/jq/releases/latest/download/jq-linux-amd64 -o jq
    chmod +x jq
    sudo mv jq /usr/local/bin/jq
  else
    echo "Ejecutar Git Bash como ADMIN"
    curl -fsSL https://github.com/jqlang/jq/releases/latest/download/jq-windows-amd64.exe -o jq.exe
    mv jq.exe /c/Windows/System32/jq.exe
  fi
else
  echo "jq ya está instalado"
fi

jq --version

# =========================
# Configuración proyecto
# =========================
echo
echo "Selecciona la tecnología de tu proyecto:"
echo "1) Node"
echo "2) Python"
echo "3) Java"
echo "4) .NET"
echo "5) Otro"
printf "> "
read OPT

case "$OPT" in
  1) TECH="node";   VERSION_FILE="package.json" ;;
  2) TECH="python"; VERSION_FILE="pyproject.toml" ;;
  3) TECH="java";   VERSION_FILE="pom.xml" ;;
  4) TECH="dotnet"; VERSION_FILE="*.csproj" ;;
  5) TECH="other";  VERSION_FILE="" ;;
  *) echo "Opción inválida"; exit 1 ;;
esac

cat > .vdg.conf <<EOF
TECH=$TECH
VERSION_FILE=$VERSION_FILE
ADAPTER=$TECH
EOF

echo
echo "Proyecto inicializado"
echo "  Tecnología : $TECH"
echo "  Archivo    : $VERSION_FILE"

# =========================
# Instalar comando VDG
# =========================
echo
echo "Instalando comando global VDG..."

VDG_SOURCE="$(pwd)/scripts/app.sh"

if [ ! -f "$VDG_SOURCE" ]; then
  echo "No se encontró el archivo 'app'"
  exit 1
fi

chmod +x "$VDG_SOURCE"
chmod +x scripts/release.sh

if [ "$OS" = "linux" ]; then
  sudo cp "$VDG_SOURCE" /usr/local/bin/VDG
  sudo chmod +x /usr/local/bin/VDG
else
  mkdir -p /usr/local/bin
  cp "$VDG_SOURCE" /usr/local/bin/VDG
  chmod +x /usr/local/bin/VDG
fi

# =========================
# Verificación
# =========================
echo
if command -v VDG >/dev/null 2>&1; then
  echo "VDG instalado correctamente"
  VDG --version
else
  echo "VDG no está en el PATH"
  echo "Reiniciá la terminal o ejecutá:"
  echo "export PATH=\$PATH:/usr/local/bin"
fi

echo
echo "Instalación finalizada"
echo "Ahora podés usar:"
echo "  VDG --version"
echo "  VDG --info"
echo "  VDG generate"
