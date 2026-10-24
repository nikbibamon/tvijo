#!/usr/bin/env bash
# GEN-DEPLOY-004 — прод-деплой frontend: safe stop -> ci/build -> restart.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

name="${PM2_NEXT_APP:-tvijo-web}"
port="${NEXT_PORT:-3000}"

if ! command -v pm2 >/dev/null 2>&1; then
  echo "deploy_prod.sh: pm2 не найден" >&2
  exit 1
fi

if pm2 describe "$name" >/dev/null 2>&1; then
  echo "==> pm2 stop $name"
  pm2 stop "$name"
else
  echo "==> pm2 process $name will be created after build"
fi

echo "==> npm ci"
npm ci

echo "==> npm run build"
npm run build

echo "==> pm2 recreate $name on :$port"
pm2 delete "$name" >/dev/null 2>&1 || true

# `pm2 stop/delete` kills the supervised process but its next-server grandchild can
# survive and keep :$port bound. The new pm2 process then dies on EADDRINUSE and
# restart-loops into "errored", while the orphan quietly serves a stale build.
# Free the port before starting, or the deploy silently doesn't take effect.
for _ in {1..10}; do
  holders="$(ss -ltnp 2>/dev/null | grep ":${port} " | grep -oP 'pid=\K[0-9]+' | sort -u || true)"
  [[ -z "$holders" ]] && break
  echo "   :$port still held by pid(s): $holders — terminating orphan"
  # shellcheck disable=SC2086
  kill $holders 2>/dev/null || true
  sleep 2
  still="$(ss -ltnp 2>/dev/null | grep ":${port} " | grep -oP 'pid=\K[0-9]+' | sort -u || true)"
  # shellcheck disable=SC2086
  [[ -n "$still" ]] && kill -9 $still 2>/dev/null || true
  sleep 1
done

pm2 start node --name "$name" -- node_modules/next/dist/bin/next start -p "$port"
pm2 save

# A pm2 process that lost the port race reports "errored"/restart-loops. Catch it here
# instead of letting a healthy-looking curl (served by an orphan) mask a failed deploy.
sleep 3
if ! pm2 describe "$name" | grep -q "online"; then
  echo "deploy_prod.sh: pm2 $name is not online after start" >&2
  pm2 logs "$name" --lines 40 --nostream || true
  exit 1
fi

echo "==> healthcheck :$port"
for _ in {1..20}; do
  code="$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:${port}/en" || true)"
  if [[ "$code" == "200" ]]; then
    echo "frontend healthcheck ok (200)"
    # New build = new hashed chunk names. Purge the Cloudflare edge cache so it
    # stops serving stale HTML that references the previous build's chunks
    # (the root cause of ChunkLoadError / 404 on /_next/static/chunks/c-*.js).
    # Non-fatal: a missing CF token must never fail an otherwise-healthy deploy.
    if [[ "${SKIP_CF_PURGE:-0}" != "1" ]]; then
      echo "==> npm run cf:purge"
      npm run cf:purge || echo "deploy_prod.sh: cf:purge skipped/failed (non-fatal)" >&2
    fi
    # Ensure WAF skip rule for /_next/static/* is in place (idempotent).
    # Prevents Cloudflare managed WAF from returning 400 on minified JS/CSS chunks.
    if [[ "${SKIP_CF_WAF_SKIP:-0}" != "1" ]]; then
      echo "==> npm run cf:waf-skip"
      npm run cf:waf-skip || echo "deploy_prod.sh: cf:waf-skip skipped/failed (non-fatal)" >&2
    fi
    exit 0
  fi
  sleep 1
done

echo "deploy_prod.sh: healthcheck failed on :$port" >&2
pm2 logs "$name" --lines 80 --nostream || true
exit 1
