#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
OUTPUT_DIR="$ROOT_DIR/output"
LOG_FILE="$OUTPUT_DIR/cloudflare-tunnel.log"
URL_FILE="$OUTPUT_DIR/cloudflare-tunnel.url"
LABEL="com.temptrip.wishwall.cloudflared"
LOCAL_URL="${LOCAL_URL:-http://127.0.0.1:3000}"

mkdir -p "$OUTPUT_DIR"

if ! command -v cloudflared >/dev/null 2>&1; then
  echo "cloudflared not found. Install first: brew install cloudflared" >&2
  exit 1
fi

if ! curl -fsS "$LOCAL_URL" >/dev/null 2>&1; then
  echo "Local app not reachable at $LOCAL_URL" >&2
  exit 1
fi

launchctl remove "$LABEL" >/dev/null 2>&1 || true
rm -f "$URL_FILE"
: > "$LOG_FILE"

RUNNER_CMD="cd '$ROOT_DIR' && LOCAL_URL='$LOCAL_URL' exec ./scripts/run-cloudflare-tunnel.sh > '$LOG_FILE' 2>&1"
launchctl submit -l "$LABEL" -- /bin/zsh -lc "$RUNNER_CMD"

for _ in $(seq 1 45); do
  PUBLIC_URL="$(grep -Eo 'https://[-0-9a-z]+\.trycloudflare\.com' "$LOG_FILE" | head -n 1 || true)"
  HAS_CONNECTION=""
  if grep -q 'Registered tunnel connection' "$LOG_FILE" 2>/dev/null; then
    HAS_CONNECTION="yes"
  fi

  if [[ -n "$PUBLIC_URL" && -n "$HAS_CONNECTION" ]]; then
    printf '%s\n' "$PUBLIC_URL" > "$URL_FILE"
    echo "Tunnel ready: $PUBLIC_URL"
    echo "Submit: $PUBLIC_URL/submit"
    echo "Admin:  $PUBLIC_URL/admin"
    echo "Screen: $PUBLIC_URL/screen"
    exit 0
  fi

  sleep 1
done

echo "Tunnel did not become ready. Check log: $LOG_FILE" >&2
tail -n 80 "$LOG_FILE" >&2 || true
exit 1
