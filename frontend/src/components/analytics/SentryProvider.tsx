'use client';

/**
 * Sentry Browser SDK — lightweight error tracking for Next.js frontend.
 * Generation: GEN-ANALYTICS-002
 *
 * Loads Sentry from CDN if SENTRY_DSN is set via NEXT_PUBLIC_SENTRY_DSN.
 * Captures errors, unhandled rejections, and performance spans.
 */

import Script from 'next/script';
import { useEffect } from 'react';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || '';
const SENTRY_ENV = process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || 'production';

export function SentryProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!SENTRY_DSN || typeof window === 'undefined') return;

    // @ts-ignore
    if (window.Sentry?._initialized) return;

    const initSentry = () => {
      // @ts-ignore
      if (!window.Sentry) return;
      // @ts-ignore
      window.Sentry.init({
        dsn: SENTRY_DSN,
        environment: SENTRY_ENV,
        tracesSampleRate: 0.1,
        replaysSessionSampleRate: 0.0,
        beforeSend(event: any) {
          // Scrub PII
          if (event.request?.headers?.Cookie) {
            event.request.headers.Cookie = '[Filtered]';
          }
          return event;
        },
      });
      // @ts-ignore
      window.Sentry._initialized = true;
    };

    if (document.readyState === 'complete') {
      initSentry();
    } else {
      window.addEventListener('load', initSentry);
      return () => window.removeEventListener('load', initSentry);
    }
  }, []);

  if (!SENTRY_DSN) return <>{children}</>;

  return (
    <>
      <Script
        strategy="afterInteractive"
        src="https://browser.sentry-cdn.com/8.7.0/bundle.tracing.min.js"
        integrity="sha384-"
        crossOrigin="anonymous"
      />
      {children}
    </>
  );
}
