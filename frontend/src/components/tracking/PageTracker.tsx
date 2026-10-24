'use client';

/**
 * Page Visit Tracker — records every page view to our DB.
 * Generation: GEN-DATA-001
 *
 * - Works for both auth and anon users
 * - Generates persistent session_id (localStorage)
 * - Captures UTM params from URL
 * - Tracks time on page (duration_sec)
 * - Silent fail — never breaks UX
 */

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackPageVisit } from '@/services/trading-api';
import { parseLocale } from '@/i18n/config';

function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  let sid = localStorage.getItem('cb_session_id');
  if (!sid) {
    sid = crypto.randomUUID?.() || Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('cb_session_id', sid);
  }
  return sid;
}

export default function PageTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const enterTime = useRef<number>(Date.now());
  const lastPath = useRef<string>('');

  useEffect(() => {
    // Skip tracking for API routes, static assets
    if (!pathname || pathname.startsWith('/api') || pathname.startsWith('/_next')) return;

    const now = Date.now();
    const sessionId = getSessionId();

    // Send duration for previous page
    if (lastPath.current && lastPath.current !== pathname) {
      const duration = Math.round((now - enterTime.current) / 1000);
      if (duration > 0 && duration < 3600) {
        trackPageVisit({
          path: lastPath.current,
          session_id: sessionId,
          duration_sec: duration,
          locale: parseLocale(lastPath.current),
        });
      }
    }

    // Track new page visit
    enterTime.current = now;
    lastPath.current = pathname;

    // Save UTM params on first visit
    const utm_source = searchParams.get('utm_source') || '';
    const utm_medium = searchParams.get('utm_medium') || '';
    const utm_campaign = searchParams.get('utm_campaign') || '';

    // Store UTMs in session for later use
    if (utm_source) {
      sessionStorage.setItem('utm_source', utm_source);
      sessionStorage.setItem('utm_medium', utm_medium);
      sessionStorage.setItem('utm_campaign', utm_campaign);
    }

    trackPageVisit({
      path: pathname,
      session_id: sessionId,
      referrer: typeof document !== 'undefined' ? document.referrer : '',
      utm_source: utm_source || sessionStorage.getItem('utm_source') || '',
      utm_medium: utm_medium || sessionStorage.getItem('utm_medium') || '',
      utm_campaign: utm_campaign || sessionStorage.getItem('utm_campaign') || '',
      locale: parseLocale(pathname),
    });
  }, [pathname, searchParams]);

  // Track duration on page unload
  useEffect(() => {
    const handleUnload = () => {
      if (!lastPath.current) return;
      const duration = Math.round((Date.now() - enterTime.current) / 1000);
      if (duration > 0 && duration < 3600) {
        const sessionId = getSessionId();
        // Use sendBeacon for reliable unload tracking
        const data = JSON.stringify({
          path: lastPath.current,
          session_id: sessionId,
          duration_sec: duration,
          locale: parseLocale(lastPath.current),
        });
        const API_BASE = process.env.NEXT_PUBLIC_DJANGO_API_URL || '/api/v1';
        navigator.sendBeacon?.(`${API_BASE}/trading/track/`, new Blob([data], { type: 'application/json' }));
      }
    };

    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);

  return null; // invisible component
}
