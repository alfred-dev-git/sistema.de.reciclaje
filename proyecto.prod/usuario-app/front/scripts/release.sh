#!/bin/sh
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$SCRIPT_DIR/.."

echo "=== VDG Release ==="

. "$ROOT_DIR/.vdg.conf"

. "$SCRIPT_DIR/versionado.sh"
. "$SCRIPT_DIR/generar_doc.sh"

echo
echo "Release $VERSION_NUEVA completado"
