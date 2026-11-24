import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isMaintenanceWhitelisted } from '@qbm/config';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Whitelist all admin paths, auth paths, and maintenance routes
  if (
    isMaintenanceWhitelisted(pathname) ||
    pathname === '/' ||
    pathname === '/maintenance' ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/products') ||
    pathname.startsWith('/categories') ||
    pathname.startsWith('/appearance') ||
    pathname.startsWith('/business') ||
    pathname.startsWith('/homepage') ||
    pathname.startsWith('/media') ||
    pathname.startsWith('/users') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/analytics')
  ) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
