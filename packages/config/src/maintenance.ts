import { MAINTENANCE_HTML } from './maintenance-html';

export { MAINTENANCE_HTML };

export interface MaintenanceConfig {
  enabled: boolean;
  activatedAt?: string | null;
  deactivatedAt?: string | null;
  activatedBy?: string | null;
  message?: string;
  retryAfter?: number;
}

export const DEFAULT_MAINTENANCE_MESSAGE =
  "We're performing a rapid reboot. Please refresh your browser shortly.";

export const DEFAULT_RETRY_AFTER_SECONDS = 300;

/**
 * Routes that must ALWAYS remain accessible even when maintenance mode is active.
 * Guarantees administrators can login, manage the system, and turn maintenance mode back off.
 */
export const MAINTENANCE_WHITELISTED_PREFIXES = [
  '/_next',
  '/admin',
  '/login',
  '/forgot-password',
  '/api/admin',
  '/api/maintenance',
  '/api/auth',
  '/api/revalidate',
  '/api/ping',
] as const;

export const MAINTENANCE_WHITELISTED_EXACT = [
  '/maintenance.html',
  '/offline.html',
  '/sw.js',
  '/favicon.ico',
  '/apple-icon.png',
  '/icon.png',
  '/icon-192.png',
  '/icon-512.png',
  '/robots.txt',
  '/sitemap.xml',
] as const;

/**
 * Checks whether a given request path is whitelisted from maintenance mode interception.
 */
export function isMaintenanceWhitelisted(pathname: string): boolean {
  if (!pathname) return false;

  // Exact matches
  if (MAINTENANCE_WHITELISTED_EXACT.some((exact) => pathname === exact)) {
    return true;
  }

  // Prefix matches
  if (
    MAINTENANCE_WHITELISTED_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(prefix + '/'),
    )
  ) {
    return true;
  }

  return false;
}

/**
 * Checks if request headers or cookies indicate an administrator session that should bypass maintenance mode.
 */
export function hasAdminBypass(cookieHeader: string | null | undefined): boolean {
  if (!cookieHeader) return false;
  return (
    cookieHeader.includes('qbm_admin_session=') || cookieHeader.includes('maintenance_bypass=')
  );
}
