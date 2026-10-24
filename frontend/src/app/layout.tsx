import './globals.css';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { Suspense } from 'react';
import PageTracker from '@/components/tracking/PageTracker';
import ChunkErrorReload from '@/components/system/ChunkErrorReload';
import { SiteThemeProvider } from '@/components/theme/SiteThemeProvider';
import { GoogleAnalytics } from '@/components/analytics/GoogleAnalytics';
import { SentryProvider } from '@/components/analytics/SentryProvider';
import { LOCALES, LOCALE_META, DEFAULT_LOCALE, isValidLocale } from '@/i18n/config';

/* Font: self-hosted Inter wired in globals.css (@font-face + --font-sans). */

export const metadata: Metadata = {
  title: {
    default: 'Tvijo — AI Technology Platform',
    template: '%s | Tvijo',
  },
  description:
    'AI technology platform for automation, knowledge systems, product operations, and intelligent software workflows.',
  keywords: [
    'AI automation', 'technology platform', 'knowledge systems', 'product operations',
    'workflow automation', 'AI agents', 'software infrastructure', 'operational intelligence',
    'knowledge graph', 'internal tools', 'process automation', 'product analytics',
  ],
  authors: [{ name: 'Tvijo' }],
  creator: 'Tvijo',
  metadataBase: new URL('https://tvijo.com'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: ['ru_RU', 'hi_IN', 'ko_KR', 'ja_JP', 'zh_CN', 'de_DE', 'es_ES', 'pt_PT', 'nl_NL', 'uk_UA'],
    url: 'https://tvijo.com',
    siteName: 'Tvijo',
    title: 'Tvijo — AI Technology Platform',
    description:
      'AI automation, knowledge systems, product operations, and intelligent software workflows.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Tvijo — AI Technology Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tvijo — AI Technology Platform',
    description:
      'AI automation, knowledge systems, product operations, and intelligent software workflows.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  alternates: (() => {
    const languages: Record<string, string> = {};
    for (const loc of LOCALES) {
      languages[LOCALE_META[loc].hreflang] = `https://tvijo.com/${loc}`;
    }
    languages['x-default'] = `https://tvijo.com/${DEFAULT_LOCALE}`;
    return {
      canonical: 'https://tvijo.com',
      languages,
    };
  })(),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const requestedLocale = headers().get('x-tvijo-locale') || DEFAULT_LOCALE;
  const documentLocale = isValidLocale(requestedLocale)
    ? requestedLocale
    : DEFAULT_LOCALE;

  return (
    <html lang={documentLocale} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="theme-color" content="#0A0A0F" />
        {/* До React: сразу выставить тему из localStorage тем же ключом, что и SiteThemeProvider */}
        <script
          dangerouslySetInnerHTML={{
            __html: `!function(){try{var d=document.documentElement;var t=localStorage.getItem('tvijo-theme');d.classList.remove('light','dark');if(t==='light'){d.classList.add('light');d.style.colorScheme='light';}else{d.classList.add('dark');d.style.colorScheme='dark';}var u=localStorage.getItem('tvijo-ui-mode');d.dataset.ui=u==='simple'||u==='rich'?u:'rich';var seg=location.pathname.split('/')[1];if(seg&&seg.length===2)d.lang=seg;}catch(e){document.documentElement.classList.add('dark');document.documentElement.dataset.ui='rich';}}();`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Tvijo',
              url: 'https://tvijo.com',
              description: 'AI technology platform for automation, knowledge systems, product operations, and intelligent software workflows.',
              potentialAction: {
                '@type': 'SearchAction',
                target: 'https://tvijo.com/en/kb?q={search_term_string}',
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </head>
      <body className="font-sans">
        <GoogleAnalytics />
        <SentryProvider>
          <SiteThemeProvider>
            <ChunkErrorReload />
            <Suspense fallback={null}>
              <PageTracker />
            </Suspense>
            {children}
          </SiteThemeProvider>
        </SentryProvider>
      </body>
    </html>
  );
}
