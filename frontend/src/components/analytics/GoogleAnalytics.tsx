'use client';

/**
 * Google Analytics 4 — gtag.js injection for Next.js App Router.
 * Generation: GEN-ANALYTICS-001
 *
 * Tracks page views automatically via gtag('config') on route change.
 * NEXT_PUBLIC_GA_ID can override the production measurement ID.
 */

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Suspense } from 'react';
import { parseLocale } from '@/i18n/config';

// Keep analytics enabled in production even when the deployment environment
// does not expose the optional public env var. It can still be overridden for
// staging or another GA4 property with NEXT_PUBLIC_GA_ID.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-YMN2B82M95';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

/** Fires a GA4 event. No-ops until NEXT_PUBLIC_GA_ID is set and gtag.js has loaded. */
export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('event', name, params);
}

export function GoogleAnalytics() {
  if (!GA_ID) return null;

  return (
    <>
      {/* Consent Mode defaults must be queued before gtag.js loads. */}
      <Script id="google-consent-defaults" strategy="beforeInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('consent', 'default', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'denied',
            wait_for_update: 500
          });
        `}
      </Script>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}', {
            page_title: document.title,
            page_location: window.location.href,
            // Page views are sent explicitly below and on App Router changes.
            // This prevents a duplicate view on the initial page load.
            send_page_view: false,
            custom_map: {
              custom_parameter_1: 'section',
              custom_parameter_2: 'locale'
            }
          });
          gtag('event', 'page_view', {
            locale: location.pathname.split('/')[1] || 'en',
            page_path: location.pathname + location.search,
          });
        `}
      </Script>
      <Suspense fallback={null}>
        <AnalyticsRouteTracker />
      </Suspense>
      <ConsentBanner />
    </>
  );
}

function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem('tvijo-analytics-consent');
    setVisible(saved === null);
    if (saved === 'granted') {
      window.gtag?.('consent', 'update', {
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted',
        analytics_storage: 'granted',
      });
    }
  }, []);

  const setConsent = (granted: boolean) => {
    window.localStorage.setItem('tvijo-analytics-consent', granted ? 'granted' : 'denied');
    window.gtag?.('consent', 'update', {
      ad_storage: granted ? 'granted' : 'denied',
      ad_user_data: granted ? 'granted' : 'denied',
      ad_personalization: granted ? 'granted' : 'denied',
      analytics_storage: granted ? 'granted' : 'denied',
    });
    setVisible(false);
  };

  // `data-consent-banner` on <html> lets fixed UI elsewhere (the workspace
  // assistant launcher) move out from under this banner while it is up.
  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    document.documentElement.dataset.consentBanner = visible ? 'visible' : 'hidden';
    return () => { delete document.documentElement.dataset.consentBanner; };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Analytics cookies"
      className="tvijo-cookie-consent fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-2xl rounded-2xl border border-slate-700 bg-slate-950 p-5 text-white shadow-2xl"
    >
      <p className="text-sm leading-6 text-slate-200">
        We use analytics cookies to understand how Tvijo is used and improve the site.
        You can accept or decline analytics tracking.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" onClick={() => setConsent(true)} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold hover:bg-blue-500">
          Accept analytics
        </button>
        <button type="button" onClick={() => setConsent(false)} className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800">
          Decline
        </button>
      </div>
    </div>
  );
}

function AnalyticsRouteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!GA_ID || !window.gtag) return;
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    const locale = parseLocale(pathname);
    window.gtag('config', GA_ID, {
      page_title: document.title,
      page_location: window.location.href,
      page_path: url,
    });
    window.gtag('event', 'page_view', {
      locale,
      page_path: url,
    });
  }, [pathname, searchParams]);

  return null;
}
