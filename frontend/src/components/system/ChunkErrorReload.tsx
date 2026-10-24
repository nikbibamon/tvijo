'use client';

/**
 * ChunkLoadError recovery.
 *
 * After a new deploy, an already-open tab still references the previous build's
 * hashed chunks (`/_next/static/chunks/c-*.js`, CSS). Those 404 → `ChunkLoadError`
 * → React error #423 (hydration aborted). This catches that class of error and
 * does a single guarded reload to pull the current HTML + chunks.
 *
 * The sessionStorage guard prevents reload loops if a chunk is genuinely missing
 * (e.g. CDN not yet purged): it reloads at most once per 20s window.
 */

import { useEffect } from 'react';

const GUARD_KEY = 'tvijo-chunk-reload-at';
const WINDOW_MS = 20_000;

function isChunkError(msg?: string | null): boolean {
  if (!msg) return false;
  return /ChunkLoadError|Loading chunk [\w-]+ failed|Loading CSS chunk|error loading dynamically imported module|Importing a module script failed/i.test(
    msg,
  );
}

function reloadOnce(): void {
  try {
    const last = Number(sessionStorage.getItem(GUARD_KEY) || '0');
    if (Date.now() - last < WINDOW_MS) return; // already tried recently — avoid loop
    sessionStorage.setItem(GUARD_KEY, String(Date.now()));
  } catch {
    /* sessionStorage unavailable — fall through to a single reload */
  }
  window.location.reload();
}

export default function ChunkErrorReload(): null {
  useEffect(() => {
    const onError = (e: ErrorEvent) => {
      const err = e?.error as Error | undefined;
      if (isChunkError(e?.message) || isChunkError(err?.name) || isChunkError(err?.message)) {
        reloadOnce();
      }
    };
    const onRejection = (e: PromiseRejectionEvent) => {
      const r = e?.reason as { name?: string; message?: string } | string | undefined;
      if (typeof r === 'string') {
        if (isChunkError(r)) reloadOnce();
      } else if (isChunkError(r?.name) || isChunkError(r?.message)) {
        reloadOnce();
      }
    };
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  }, []);
  return null;
}
