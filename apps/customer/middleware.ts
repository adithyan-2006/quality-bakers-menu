import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import {
  isMaintenanceWhitelisted,
  hasAdminBypass,
  MAINTENANCE_HTML,
  DEFAULT_RETRY_AFTER_SECONDS,
} from '@qbm/config';

let cachedMaintenance = {
  enabled: false,
  retryAfter: DEFAULT_RETRY_AFTER_SECONDS,
  lastChecked: 0,
};

const CACHE_TTL_MS = 800; // 800ms TTL for near real-time updates

async function fetchMaintenanceState(
  origin: string,
): Promise<{ enabled: boolean; retryAfter: number }> {
  const now = Date.now();
  if (now - cachedMaintenance.lastChecked < CACHE_TTL_MS) {
    return {
      enabled: cachedMaintenance.enabled,
      retryAfter: cachedMaintenance.retryAfter,
    };
  }

  try {
    const res = await fetch(`${origin}/api/maintenance/status`, {
      method: 'GET',
      cache: 'no-store',
      headers: { 'x-internal-middleware': '1' },
    });

    if (res.ok) {
      const data = await res.json();
      cachedMaintenance = {
        enabled: Boolean(data.enabled),
        retryAfter:
          typeof data.retryAfter === 'number' ? data.retryAfter : DEFAULT_RETRY_AFTER_SECONDS,
        lastChecked: now,
      };
    }
  } catch {
    // If status endpoint is temporarily unreachable, maintain previous state
  }

  return {
    enabled: cachedMaintenance.enabled,
    retryAfter: cachedMaintenance.retryAfter,
  };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Whitelisted system and admin endpoints are ALWAYS accessible
  if (isMaintenanceWhitelisted(pathname) || pathname === '/maintenance') {
    return NextResponse.next();
  }

  // 2. Administrator bypass ONLY if explicitly requested via query param or header
  // This ensures that when an admin visits the customer site in the same browser,
  // they see the true fallback maintenance page as regular visitors do.
  const searchParams = request.nextUrl.searchParams;
  const isExplicitBypass =
    searchParams.has('preview') ||
    searchParams.has('bypass') ||
    request.headers.has('x-maintenance-bypass');

  if (isExplicitBypass) {
    const cookieHeader = request.headers.get('cookie');
    if (hasAdminBypass(cookieHeader) || request.headers.has('x-maintenance-bypass')) {
      return NextResponse.next();
    }
  }

  // 3. Check maintenance mode
  const { enabled, retryAfter } = await fetchMaintenanceState(request.nextUrl.origin);

  if (enabled) {
    const acceptHeader = request.headers.get('accept') || '';
    const isHtmlRequest = acceptHeader.includes('text/html') || !pathname.startsWith('/api/');

    if (isHtmlRequest) {
      return new NextResponse(MAINTENANCE_HTML, {
        status: 503,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Retry-After': String(retryAfter),
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
          'X-Maintenance-Mode': 'active',
        },
      });
    }

    return NextResponse.json(
      {
        error: 'Service Unavailable',
        message: 'The system is undergoing maintenance. Please try again shortly.',
        retryAfter,
      },
      {
        status: 503,
        headers: {
          'Retry-After': String(retryAfter),
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'X-Maintenance-Mode': 'active',
        },
      },
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|sw.js|offline.html|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
