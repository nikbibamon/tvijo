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
  return NextResponse.redirect(destination, { status: 303, headers: { 'Cache-Control': 'no-store' } });
}
