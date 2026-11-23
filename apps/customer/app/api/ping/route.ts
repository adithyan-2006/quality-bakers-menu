import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
};

export function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      online: true,
      timestamp: Date.now(),
    },
    {
      status: 200,
      headers: NO_CACHE_HEADERS,
    },
  );
}

export function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: NO_CACHE_HEADERS,
  });
}
