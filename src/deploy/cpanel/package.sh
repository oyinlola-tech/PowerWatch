#!/usr/bin/env bash
# Builds the API and packs what the cPanel server needs into one zip.
# Dependencies are installed on the server ("Ensure Dependencies" in Application Manager),
# and secrets live in a .env file there, so neither is included.
#
# Usage (from src/): bash deploy/cpanel/package.sh [output.zip]
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
output="$(realpath -m "${1:-$root/deploy/cpanel/powerwatch-api.zip}")"
stage="$(mktemp -d)"
trap 'rm -rf "$stage"' EXIT

cd "$root"
rm -rf dist
npm run build

cp deploy/cpanel/app.js deploy/cpanel/npm-shell.sh package.json package-lock.json prisma.config.ts "$stage/"
cp deploy/cpanel/npmrc "$stage/.npmrc"
chmod 755 "$stage/npm-shell.sh"
cp -r prisma "$stage/prisma"
# Source maps and type declarations are not needed to run the server
rsync -a --exclude '*.map' --exclude '*.d.ts' dist/ "$stage/dist/"

rm -f "$output"
(cd "$stage" && zip -qr "$output" .)
echo "Created $output ($(du -h "$output" | cut -f1))"
