'use client';

/**
 * Google Tag Manager + GA4 Consent Mode — Next.js App Router.
 * Generation: GEN-ANALYTICS-002 (2026-11-06)
 *
 * Since 2026-11-06 the site loads one GTM container (GTM-THJ9B2XG) instead of
 * injecting gtag.js directly. GA4 (G-YMN2B82M95) and every other marketing tag
 * live inside the container, so the page ships a single bootstrap and the tag
 * configuration is changed without a deploy.
 *
 * Consent Mode v2 defaults are queued in the dataLayer *before* the container
 * loads, so the container never receives hits from a visitor who has not
 * accepted analytics cookies.
 *
 * Container requirements (docs/ANALYTICS_GTM_RU.md):
 *   1. Google tag / GA4 Configuration, `send_page_view = false`;
 *   2. GA4 Event tag `page_view` on Custom Event = `page_view`, with
 *      page_path / page_location / page_title / locale mapped to GA4 params.
 */

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Suspense } from 'react';
import { parseLocale } from '@/i18n/config';

// Production container is the default so a deploy cannot lose analytics when an
// optional public env var is missing; staging can override it.
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || 'GTM-THJ9B2XG';
const CONSENT_KEY = 'tvijo-analytics-consent';

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

/** Consent defaults must be queued before gtm.js executes (Consent Mode v2). */
const GTM_CONSENT_DEFAULTS = `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  window.gtag = gtag;
  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    wait_for_update: 500
  });
`;

const GTM_SNIPPET = `
  (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
  var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
  j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})
  (window,document,'script','dataLayer','${GTM_ID}');
`;

/**
 * Fires a custom event into the GTM dataLayer. GA4 tags subscribe to these
 * event names inside the container, so this call site never depends on gtag.js
 * being present.
 */
export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: name, ...(params || {}) });
}

/** Queues a gtag-style command (used by Consent Mode updates). */
function gtagConsent(state: 'granted' | 'denied') {
  if (typeof window === 'undefined') return;
  window.gtag?.('consent', 'update', {
    ad_storage: state,
    ad_user_data: state,
    ad_personalization: state,
    analytics_storage: state,
  });
}

export function GoogleAnalytics() {
  if (!GTM_ID) return null;

  return (
    <>
      {/* Consent defaults are queued before the container snippet runs. */}
      <Script id="gtm-consent-defaults" strategy="beforeInteractive">
        {GTM_CONSENT_DEFAULTS}
      </Script>
      <Script id="google-tag-manager" strategy="afterInteractive">
        {GTM_SNIPPET}
      </Script>
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
          title="Google Tag Manager"
        />
      </noscript>
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
    const saved = window.localStorage.getItem(CONSENT_KEY);
    setVisible(saved === null);
    if (saved === 'granted') {
      gtagConsent('granted');
    }
  }, []);

  const setConsent = (granted: boolean) => {
    window.localStorage.setItem(CONSENT_KEY, granted ? 'granted' : 'denied');
    gtagConsent(granted ? 'granted' : 'denied');
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

/**
 * App Router does not emit a page view on client-side navigation. Pushing the
 * event here (instead of calling gtag('config')) keeps a single page_view per
 * navigation once the container's GA4 event tag is configured.
 */
function AnalyticsRouteTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!GTM_ID) return;
    const query = searchParams?.toString();
    const pagePath = pathname + (query ? `?${query}` : '');
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'page_view',
      page_path: pagePath,
      page_location: window.location.href,
      page_title: document.title,
      locale: parseLocale(pathname),
    });
  }, [pathname, searchParams]);

  return null;
}
