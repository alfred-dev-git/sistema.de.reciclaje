#!/bin/sh
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$SCRIPT_DIR/.."
ADAPTER_DIR="$SCRIPT_DIR/adapters"

if [ ! -f "$ROOT_DIR/.vdg.conf" ]; then
  echo "Proyecto no inicializado. Ejecutá install.sh"
  exit 1
fi

. "$ROOT_DIR/.vdg.conf"

ADAPTER_PATH="$ADAPTER_DIR/$ADAPTER.sh"

if [ ! -f "$ADAPTER_PATH" ]; then
  echo "Adapter no encontrado: $ADAPTER_PATH"
  exit 1
fi

VERSION_ANTERIOR=$(sh "$ADAPTER_PATH" get)
export VERSION_ANTERIOR

echo "Versión actual: $VERSION_ANTERIOR"

IFS='.' read MAJOR MINOR PATCH <<EOF
$VERSION_ANTERIOR
EOF

COMMIT=$(git log -1 --format=%s)

if echo "$COMMIT" | grep -q "BREAKING CHANGE:"; then
  VERSION_NUEVA="$((MAJOR+1)).0.0"
  TIPO_CAMBIO="breaking"
elif echo "$COMMIT" | grep -q "feat:"; then
  VERSION_NUEVA="$MAJOR.$((MINOR+1)).0"
  TIPO_CAMBIO="feature"
elif echo "$COMMIT" | grep -q "fix:"; then
  VERSION_NUEVA="$MAJOR.$MINOR.$((PATCH+1))"
  TIPO_CAMBIO="fix"
else
  VERSION_NUEVA="$MAJOR.$MINOR.$((PATCH+1))"
  TIPO_CAMBIO="patch"
fi

export VERSION_NUEVA
export TIPO_CAMBIO

sh "$ADAPTER_PATH" set "$VERSION_NUEVA"

echo "$VERSION_ANTERIOR → $VERSION_NUEVA ($TIPO_CAMBIO)"
