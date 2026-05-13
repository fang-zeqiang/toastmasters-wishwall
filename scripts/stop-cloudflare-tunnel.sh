#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
OUTPUT_DIR="$ROOT_DIR/output"
URL_FILE="$OUTPUT_DIR/cloudflare-tunnel.url"
LOG_FILE="$OUTPUT_DIR/cloudflare-tunnel.log"
LABEL="com.temptrip.wishwall.cloudflared"

launchctl remove "$LABEL" >/dev/null 2>&1 || true
pkill -f 'cloudflared tunnel --no-autoupdate --protocol http2 --url http://127.0.0.1:3000' >/dev/null 2>&1 || true
rm -f "$URL_FILE"
echo "Tunnel stopped. Log kept at $LOG_FILE"
