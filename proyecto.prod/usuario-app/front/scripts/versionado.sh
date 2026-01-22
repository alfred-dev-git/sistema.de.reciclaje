#!/bin/bash

set -e

if [ ! -f "package.json" ]; then
    echo "Error: No se encontró package.json."
    exit 1
fi

VERSION_ANTERIOR=$(jq -r '.version' package.json)
echo "Versión actual: $VERSION_ANTERIOR"

VERSION_LIMPIA=${VERSION_ANTERIOR/-SNAPSHOT/}
IFS='.' read -r MAJOR MINOR PATCH <<< "$VERSION_LIMPIA"

ULTIMO_COMMIT=$(git log -1 --format=%s)

if [[ "$ULTIMO_COMMIT" == *"BREAKING CHANGE:"* ]]; then
    VERSION_NUEVA="$((MAJOR + 1)).0.0"
    TIPO_CAMBIO="breaking"
elif [[ "$ULTIMO_COMMIT" == *"feat:"* ]]; then
    VERSION_NUEVA="$MAJOR.$((MINOR + 1)).0"
    TIPO_CAMBIO="feature"
elif [[ "$ULTIMO_COMMIT" == *"fix:"* ]]; then
    VERSION_NUEVA="$MAJOR.$MINOR.$((PATCH + 1))"
    TIPO_CAMBIO="fix"
else
    VERSION_NUEVA="$MAJOR.$MINOR.$((PATCH + 1))"
    TIPO_CAMBIO="patch"
fi

jq ".version = \"$VERSION_NUEVA\"" package.json > package.tmp && mv package.tmp package.json

export VERSION_ANTERIOR
export VERSION_NUEVA
export TIPO_CAMBIO

echo "Versión actualizada: $VERSION_ANTERIOR → $VERSION_NUEVA"
