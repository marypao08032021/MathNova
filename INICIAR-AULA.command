#!/bin/bash
set -euo pipefail

export PATH="$PATH:/opt/homebrew/bin:/usr/local/bin"
project_dir="${1:-$HOME/Desktop/mathnova}"

if ! command -v node >/dev/null 2>&1; then
  echo "No se encontró Node.js. Abre Terminal y ejecuta este archivo desde allí."
  read -r -p "Presiona Enter para cerrar... " respuesta
  exit 1
fi

if [[ ! -f "$project_dir/server/scripts/iniciar-aula.cjs" ]]; then
  echo "No se encontró el iniciador de MathNova en: $project_dir"
  echo "Comprueba la carpeta del proyecto y la instalación del aula offline."
  read -r -p "Presiona Enter para cerrar... " respuesta
  exit 1
fi

echo "MathNova — Aula offline"
echo "PostgreSQL debe estar iniciado. Mantén esta ventana abierta."
echo "Para detener el servidor, presiona Control+C."
cd "$project_dir/server"
if command -v caffeinate >/dev/null 2>&1; then
  exec caffeinate -i node "$project_dir/server/scripts/iniciar-aula.cjs"
fi
exec node "$project_dir/server/scripts/iniciar-aula.cjs"
