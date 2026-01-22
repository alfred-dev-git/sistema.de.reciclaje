#!/bin/bash

set -e

source ./scripts/versionado.sh
source ./scripts/generar_doc.sh

echo "Release $VERSION_NUEVA completado"
