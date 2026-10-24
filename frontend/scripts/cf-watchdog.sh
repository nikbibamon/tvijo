#!/usr/bin/env bash
# Optional cron: verify Cloudflare token + production chunk health.
# Usage: ./scripts/cf-watchdog.sh [site_url]
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
npm run -s cf:verify
bash scripts/check-production-assets.sh "${1:-https://tvijo.com}"
