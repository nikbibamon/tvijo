import { NextResponse } from 'next/server';
import { fetchPublicRelease } from '@/lib/tvijo-extension-release';
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export async function GET() {
  const release=await fetchPublicRelease(true);
  return NextResponse.json(release || {status:'unavailable'}, {status:release?200:503,
    headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
}
