#!/bin/sh

FILE="pyproject.toml"

case "$1" in
  get)
    [ -f "$FILE" ] || { echo "pyproject.toml no encontrado"; exit 1; }
    grep '^version' "$FILE" | sed 's/.*= "\(.*\)"/\1/'
    ;;
  set)
    [ -f "$FILE" ] || { echo "pyproject.toml no encontrado"; exit 1; }
    sed -i "s/^version = .*/version = \"$2\"/" "$FILE"
    ;;
  *)
    echo "Uso: $0 {get|set <version>}"
    exit 1
    ;;
esac
