#!/bin/zsh
# Deploy script for QualiData PWA
# Minifies all HTML and JS except manifest.json and service-worker.js, then copies all files to docs/

set -e

ROOT="$(dirname "$0")"
DOCS="$ROOT/docs"

# Clean docs folder
find "$DOCS" -mindepth 1 -delete

# Minify HTML and JS (except manifest.json, service-worker.js)
for f in $ROOT/*.html $ROOT/*.js; do
  [[ -e "$f" ]] || continue
  fname=$(basename "$f")
  if [[ "$fname" == "manifest.json" || "$fname" == "service-worker.js" ]]; then
    continue
  fi
  # Minify HTML
  if [[ "$fname" == *.html ]]; then
    npx html-minifier-terser --collapse-whitespace --remove-comments --minify-css true --minify-js true "$f" -o "$DOCS/$fname"
  # Minify JS
  elif [[ "$fname" == *.js ]]; then
    npx terser "$f" -c -m -o "$DOCS/$fname"
  fi
  echo "Minified: $fname"
done

# Copy manifest and service worker as-is
cp "$ROOT/manifest.json" "$DOCS/"
cp "$ROOT/service-worker.js" "$DOCS/"
echo "Copied: manifest.json and service-worker.js"

# Copy assets and icons if they exist
[[ -d "$ROOT/assets" ]] && cp -r "$ROOT/assets" "$DOCS/"
[[ -d "$ROOT/icons" ]] && cp -r "$ROOT/icons" "$DOCS/"
[[ -f "$ROOT/logo.png" ]] && cp "$ROOT/logo.png" "$DOCS/"

# Verify files in docs for functionality
ls -lh "$DOCS"

# End of script