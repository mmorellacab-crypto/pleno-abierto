#!/usr/bin/env bash
# Guarda capturas de pantalla en la rama «capturas» (no toca main). Uso: publicar-capturas.sh <carpeta> <destino>
set -eu
ORIGEN="$1"; DESTINO="$2"
[ -d "$ORIGEN" ] || { echo "Sin capturas"; exit 0; }
TMP=$(mktemp -d)
URL="https://x-access-token:${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.git"
if git ls-remote --exit-code --heads "$URL" capturas >/dev/null 2>&1; then
  git clone -q --depth 1 --branch capturas "$URL" "$TMP"
else
  git init -q "$TMP" && git -C "$TMP" checkout -q --orphan capturas
fi
rm -rf "$TMP/$DESTINO" && mkdir -p "$TMP/$DESTINO" && cp -R "$ORIGEN"/. "$TMP/$DESTINO/"
cd "$TMP"
git config user.name "github-actions[bot]"
git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
git add -A
git commit -q -m "Capturas $DESTINO ($GITHUB_SHA)" || { echo "Sin cambios"; exit 0; }
git push -q "$URL" HEAD:capturas
