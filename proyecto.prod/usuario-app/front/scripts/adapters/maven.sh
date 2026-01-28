#!/bin/sh

FILE="pom.xml"

case "$1" in
  get)
    [ -f "$FILE" ] || { echo "pom.xml no encontrado"; exit 1; }
    grep -m1 "<version>" "$FILE" \
      | sed 's/.*<version>\(.*\)<\/version>.*/\1/'
    ;;
  set)
    [ -f "$FILE" ] || { echo "pom.xml no encontrado"; exit 1; }
    sed -i "0,/<version>.*<\/version>/s//<version>$2<\/version>/" "$FILE"
    ;;
  *)
    echo "Uso: $0 {get|set <version>}"
    exit 1
    ;;
esac
