#!/bin/sh

NAME="Version Documentation Generator"
VERSION="1.0.0"
DESCRIPTION="Generates release documentation based on git changes using Groq AI."
AUTHOR="Leandro Joel Ramos"

find_project_root() {
  DIR="$PWD"

  while [ "$DIR" != "/" ]; do
    if [ -f "$DIR/.vdg.conf" ]; then
      echo "$DIR"
      return 0
    fi
    DIR="$(dirname "$DIR")"
  done

  return 1
}

case "$1" in
  --version|-v)
    echo "VDG $VERSION"
    exit 0
    ;;
  --info)
    echo "Name: $NAME"
    echo "Version: $VERSION"
    echo "Description: $DESCRIPTION"
    echo "Author: $AUTHOR"
    exit 0
    ;;
  generate)
    PROJECT_ROOT="$(find_project_root)"

    if [ -z "$PROJECT_ROOT" ]; then
      echo "No se encontró un proyecto VDG (.vdg.conf)"
      exit 1
    fi

    RELEASE_SCRIPT="$PROJECT_ROOT/scripts/release.sh"

    if [ ! -f "$RELEASE_SCRIPT" ]; then
      echo "Falta scripts/release.sh en el proyecto"
      exit 1
    fi

    (cd "$PROJECT_ROOT" && sh "$RELEASE_SCRIPT")
    exit $?
    ;;
esac

echo "Uso:"
echo "  VDG --version | -v"
echo "  VDG --info"
echo "  VDG generate"
exit 1
