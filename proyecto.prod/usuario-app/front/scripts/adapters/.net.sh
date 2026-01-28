#!/bin/sh

FILE=$(ls *.csproj 2>/dev/null | head -n 1)

[ -n "$FILE" ] || { echo "Archivo .csproj no encontrado"; exit 1; }

case "$1" in
  get)
    grep -m1 "<Version>" "$FILE" \
      | sed 's/.*<Version>\(.*\)<\/Version>.*/\1/'
    ;;
  set)
    sed -i "0,/<Version>.*<\/Version>/s//<Version>$2<\/Version>/" "$FILE"
    ;;
  *)
    echo "Uso: $0 {get|set <version>}"
    exit 1
    ;;
esac
