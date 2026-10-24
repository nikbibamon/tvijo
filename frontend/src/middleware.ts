import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { LOCALES, DEFAULT_LOCALE } from '@/i18n/config';

const LOCALE_PATTERN = LOCALES.join('|');

/**
 * Middleware: redirect bare `/` to the default locale and handle locale-aware
 * redirects for legacy surfaces.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bare `/` always lands on English.
  //
  // This used to sniff Accept-Language, which sent every Russian-locale browser to /ru
  // and made the English landing page unreachable for exactly the visitors it targets.
  //
  // 307, not 308: the old redirect was permanent, so browsers that already hit `/` have
  // it cached and would keep resolving to /ru no matter what this function returns.
  // A temporary redirect plus no-store lets those clients re-ask and recover.
  if (pathname === '/') {
    const response = NextResponse.redirect(new URL(`/${DEFAULT_LOCALE}`, request.url), 307);
    response.headers.set('Cache-Control', 'no-store');
    return response;
  }

  // Hide legacy public signals surface from normal users (308 permanent).
  const hiddenSignalsMatch = pathname.match(new RegExp(`^\\/(${LOCALE_PATTERN})\\/signals\\/?$`));
  if (hiddenSignalsMatch) {
    return NextResponse.redirect(new URL(`/${hiddenSignalsMatch[1]}`, request.url), 308);
  }

  // Keep public page URLs canonical without touching proxied API paths.
  if (pathname.length > 1 && pathname.endsWith('/')) {
    const url = new URL(request.url);
    url.pathname = pathname.replace(/\/+$/, '');
    return NextResponse.redirect(url, 308);
  }

  // Pass the route locale to the root server layout. The root layout sits
  // above `[locale]`, so it cannot read that route param directly; without
  // this header the server-rendered document always claims `lang="en"` and
  // only corrects itself after client JavaScript runs.
  const requestHeaders = new Headers(request.headers);
  const routeLocale = pathname.split('/')[1];
  requestHeaders.set(
    'x-tvijo-locale',
    LOCALES.includes(routeLocale as (typeof LOCALES)[number])
      ? routeLocale
      : DEFAULT_LOCALE,
  );
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    '/',
    '/:locale(en|ru|hi|ko|ja|zh|de|es|pt|nl|uk)/signals',
    '/((?!api|static|media|_next|favicon|og-image|robots|sitemap).*)',
  ],
};
