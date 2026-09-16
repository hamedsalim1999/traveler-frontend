#!/bin/sh
# Runs automatically as part of the base nginx image's entrypoint (anything
# executable in /docker-entrypoint.d/ runs before nginx starts). Renders
# config.js from the API_URL env var so the same built image can point at
# any backend without a rebuild — see src/lib/config.ts.
set -eu

: "${API_URL:=}"
envsubst '${API_URL}' \
  < /usr/share/nginx/html/config.js.template \
  > /usr/share/nginx/html/config.js
