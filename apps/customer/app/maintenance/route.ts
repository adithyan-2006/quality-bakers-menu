import { NextResponse } from 'next/server';
import { MAINTENANCE_HTML, DEFAULT_RETRY_AFTER_SECONDS } from '@qbm/config';
import { getMaintenanceStatus } from '@/lib/maintenance-store';

export const dynamic = 'force-dynamic';

export function GET() {
  const status = getMaintenanceStatus();
  return new NextResponse(MAINTENANCE_HTML, {
    status: 503,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Retry-After': String(status.retryAfter || DEFAULT_RETRY_AFTER_SECONDS),
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
      'X-Maintenance-Mode': status.enabled ? 'active' : 'preview',
    },
  });
}
