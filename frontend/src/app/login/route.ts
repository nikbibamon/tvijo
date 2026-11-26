import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export function GET(request: NextRequest) {
  const locale = request.nextUrl.searchParams.get('lang');
  const demo = process.env.TVIJO_ORGANIZATION_DEMO_ORIGIN;
  const local = process.env.NODE_ENV === 'development' && demo && /^http:\/\/127\.0\.0\.1:[1-9][0-9]{0,4}$/.test(demo);
  const destination = local
    ? new URL('/organizations/sign-in', demo)
    : new URL('/organizations/sign-in', 'https://platform.tvijo.com');
  destination.searchParams.set('lang', locale === 'uk' || locale === 'ru' ? locale : 'en');
  if (locale === null) {
    const target = destination.href;
    return new NextResponse(`<!doctype html>
<html lang="en"><head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Organization sign-in · Tvijo</title>
  <meta http-equiv="refresh" content="0; url=${target}">
</head><body><main><a href="${target}">Continue to Tvijo organization sign-in</a></main></body></html>`, {
      headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }
  return NextResponse.redirect(destination, { status: 303, headers: { 'Cache-Control': 'no-store' } });
}
