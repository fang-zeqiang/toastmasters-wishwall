#!/usr/bin/env bash

set -euo pipefail

LOCAL_URL="${LOCAL_URL:-http://127.0.0.1:3000}"
CLOUDFLARED_BIN="${CLOUDFLARED_BIN:-}"

if [[ -z "$CLOUDFLARED_BIN" ]]; then
  for candidate in /opt/homebrew/bin/cloudflared /opt/homebrew/opt/cloudflared/bin/cloudflared /usr/local/bin/cloudflared; do
    if [[ -x "$candidate" ]]; then
      CLOUDFLARED_BIN="$candidate"
      break
    fi
  done
fi

if [[ -z "$CLOUDFLARED_BIN" ]]; then
  echo "cloudflared binary not found" >&2
  exit 1
fi

exec "$CLOUDFLARED_BIN" tunnel --no-autoupdate --protocol http2 --url "$LOCAL_URL"
