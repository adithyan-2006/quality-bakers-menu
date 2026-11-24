import { NextResponse } from 'next/server';
import { getMaintenanceStatus } from '@/lib/maintenance-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const status = await getMaintenanceStatus();
  return NextResponse.json(status, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}

export async function HEAD() {
  const status = await getMaintenanceStatus();
  if (status.enabled) {
    return new NextResponse(null, {
      status: 503,
      headers: {
        'Retry-After': String(status.retryAfter || 300),
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  }
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
