'use client';

import { useState } from 'react';
import { PortalApiError, portalApiFetch } from '@/lib/portal-auth-fetch';
import { getSandboxCopy } from '@/i18n/sandbox';
import type { Locale } from '@/i18n/config';

/**
 * One-time entry into the user's personal DSH sandbox (APP-013-p2 tail).
 *
 * The launch URL is single-use and lives for 60 seconds: it is opened
 * immediately and never stored. Every failure state has its own honest
 * wording — "not connected yet" (503), "not for this account" (403),
 * "suspended" (409) — because those are different situations for the user.
 */
export default function SandboxLaunchButton({ locale }: { locale: Locale }) {
  const copy = getSandboxCopy(locale);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function launch() {
    setBusy(true);
    setStatus(null);
    try {
      const res = await portalApiFetch<{ url: string }>(
        '/workspace/sandbox/launch/', { method: 'POST' });
      window.location.assign(res.url);
      // Navigation unmounts this component; keep the busy state until then.
      return;
    } catch (error) {
      if (error instanceof PortalApiError) {
        if (error.status === 503) setStatus(copy.notConfigured);
        else if (error.status === 403) setStatus(copy.notAvailable);
        else if (error.status === 409) setStatus(copy.suspended);
        else setStatus(copy.genericError);
      } else {
        setStatus(copy.genericError);
      }
      setBusy(false);
    }
  }

  const label = status ?? (busy ? copy.launching : copy.button);
  return (
    <span className="twk-sandbox-launch" aria-live="polite">
      <button
        type="button"
        className="twk-sandbox-button"
        disabled={busy}
        title={copy.button}
        aria-label={copy.button}
        onClick={() => { void launch(); }}
      >
        {label}
      </button>
    </span>
  );
}
