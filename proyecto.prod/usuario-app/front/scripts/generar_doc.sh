#!/bin/bash

set -e

if [ -z "$VERSION_NUEVA" ]; then
  if [ -n "$1" ]; then
    VERSION_NUEVA="$1"
  else
    echo "Error: VERSION_NUEVA no definida. Usa: ./scripts/generar_doc.sh <versión> o export VERSION_NUEVA=..."
    exit 1
  fi
fi

if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
else
    echo "Error: .env no encontrado"
    exit 1
fi

mkdir -p ./doc

CAMBIOS_GIT=$(git diff HEAD~1 HEAD)
HISTORIAL=$(git log -1 --pretty=format:"%h - %s")

PROMPT="Actúa como un Documentalista Técnico Senior.

Versión liberada: $VERSION_NUEVA
Tipo de cambio: $TIPO_CAMBIO

Genera un informe de actualización que incluya:
- de titulo añadele como (Release Notes $VERSION_NUEVA)
- añadele el nombre del proyecto ($NAME_PROJECT) el titulo debe ser unico y descriptivo
- el Nombre del Autor responsable ($NAME_AUTOR)
- añdele la fecha $(date +%Y/%m/%d)
- emoticones: para destacar secciones importantes visualmente que sea más atractivo
- formato Markdown: usa encabezados, listas y negritas para mejorar la legibilidad
El informe debe contener las siguientes secciones:
- Versión: $VERSION_NUEVA
- Tipo de Release: $TIPO_CAMBIO
- Resumen Ejecutivo
- correcciones y mejoras 
- correcion de errores (bugs)
- mejoras funcionales
- posibles vulnerabilidades de seguridad
- mejoras de rendimiento (performance)
- Detalles Técnicos
- los archivos afectados / modificados
- Impacto
- Riesgos o notas relevantes

Cambios detectados:
$CAMBIOS_GIT

Commit asociado:
$HISTORIAL
"

enviar_a_groq() {

    PAYLOAD=$(jq -n \
      --arg model "$GROQ_MODEL" \
      --arg prompt "$PROMPT" \
      '{
        model: $model,
        messages: [
          {role:"system",content:"Eres un experto en documentación técnica."},
          {role:"user",content:$prompt}
        ],
        temperature: 0.2
      }')

    RESPONSE=$(curl --fail \
        --silent \
        --show-error \
        --connect-timeout 10 \
        --max-time 30 \
        "$GROQ_URL" \
        -H "Authorization: Bearer $GROQ_API_KEY" \
        -H "Content-Type: application/json" \
        -d "$PAYLOAD")

    CONTENT=$(echo "$RESPONSE" | jq -r '.choices[0].message.content' | sed 's/<think>.*<\/think>//g; /<think>/,/<\/think>/d')

    if [ -z "$CONTENT" ] || [ "$CONTENT" = "null" ]; then
        echo "Respuesta inválida de Groq"
        return 1
    fi

    echo "$CONTENT"
}

echo "Generando documentación..."
if ! INFORME=$(enviar_a_groq); then
    echo "Fallback: generando documentación básica"
    INFORME="# Release $VERSION_NUEVA

## Resumen
Cambios detectados automáticamente.

## Commit
$(git log -1 --pretty=format:"- %s")
"
fi

ARCHIVO="./doc/release_${VERSION_NUEVA}_$(date +%Y%m%d_%H%M).md"
echo "$INFORME" > "$ARCHIVO"

echo "Release notes creadas: $ARCHIVO"
