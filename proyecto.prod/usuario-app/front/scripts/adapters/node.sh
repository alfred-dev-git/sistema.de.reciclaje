#!/bin/sh

FILE="package.json"

case "$1" in
  get)
    [ -f "$FILE" ] || { echo "package.json no encontrado"; exit 1; }
    jq -r '.version' "$FILE"
    ;;
  set)
    [ -f "$FILE" ] || { echo "package.json no encontrado"; exit 1; }
    jq ".version = \"$2\"" "$FILE" > "$FILE.tmp" && mv "$FILE.tmp" "$FILE"
    ;;
  *)
    echo "Uso: $0 {get|set <version>}"
    exit 1
    ;;
esac
