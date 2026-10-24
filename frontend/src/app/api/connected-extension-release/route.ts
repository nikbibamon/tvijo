import { NextResponse } from 'next/server';
import { fetchPublicRelease } from '@/lib/tvijo-extension-release';
export const revalidate = 60;
export async function GET() {
  const release=await fetchPublicRelease();
  return NextResponse.json(release || {status:'unavailable'}, {status:release?200:503,
    headers:{'Cache-Control':'public, max-age=60','X-Content-Type-Options':'nosniff'}});
}
