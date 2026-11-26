import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { LOCALES, DEFAULT_LOCALE } from '@/i18n/config';

const LOCALE_PATTERN = LOCALES.join('|');

/**
 * 2026-11-06: publishes EN and RU only. Every other locale route used to render
 * English with `canonical` pointing at /en, which is duplicate content, and it
 * filled the sitemap with 200+ URLs Google was told not to index. Those routes
 * now permanently redirect to /en.
 */
const PUBLISHED_LOCALES: readonly string[] = ['en', 'ru'];

/**
 * Redirects must never carry the internal upstream address. The app runs behind
 * nginx on 127.0.0.1:<port>, so `request.url` is `http://localhost:<port>/...`
 * and an absolute Location leaked it to browsers and crawlers. A relative
 * Location (RFC 7231 §7.1.2 allows it) is resolved against the public host.
 */
const PUBLIC_ORIGIN = 'https://tvijo.com';

function redirect(pathname: string, status: 307 | 308) {
  // Absolute URL on the public origin: `request.url` inside the container is
  // http://localhost:<port>, and NextResponse.redirect rejects a relative Location.
  return NextResponse.redirect(new URL(pathname, PUBLIC_ORIGIN), status);
}

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
    const response = redirect(`/${DEFAULT_LOCALE}`, 307);
    response.headers.set('Cache-Control', 'no-store');
    return response;
  }

  // Unpublished locales (hi, ko, ja, zh, de, es, pt, nl, uk) → English.
  const firstSegment = pathname.split('/')[1];
  if (
    firstSegment &&
    LOCALES.includes(firstSegment as (typeof LOCALES)[number]) &&
    !PUBLISHED_LOCALES.includes(firstSegment)
  ) {
    const rest = pathname.slice(firstSegment.length + 1);
    return redirect(`/${DEFAULT_LOCALE}${rest}`, 308);
  }

  // Hide legacy public signals surface from normal users (308 permanent).
  const hiddenSignalsMatch = pathname.match(new RegExp(`^\\/(${LOCALE_PATTERN})\\/signals\\/?$`));
  if (hiddenSignalsMatch) {
    return redirect(`/${hiddenSignalsMatch[1]}`, 308);
  }

  // Keep public page URLs canonical without touching proxied API paths.
  if (pathname.length > 1 && pathname.endsWith('/') && pathname !== '/ua/') {
    const trimmed = pathname.replace(/\/+$/, '');
    return redirect(`${trimmed}${request.nextUrl.search}`, 308);
  }

  // Pass the route locale to the root server layout. The root layout sits
  // above `[locale]`, so it cannot read that route param directly; without
  // this header the server-rendered document always claims `lang="en"` and
  // only corrects itself after client JavaScript runs.
  const requestHeaders = new Headers(request.headers);
  const segment = pathname.split('/')[1];
  const routeLocale = segment === 'ua' ? 'uk' : segment;
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
