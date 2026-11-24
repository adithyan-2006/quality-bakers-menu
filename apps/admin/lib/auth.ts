import { cookies } from 'next/headers';
import { AuthRepository } from '../features/auth/repositories/auth-repository';
import { AdminRole, AdminUser } from '../features/users/repositories/user-repository';
import { AuthService } from '../features/auth/services/auth-service';
import { AuthenticationError, AuthorizationError } from './errors';

export const ADMIN_SESSION_COOKIE = 'qbm_admin_session';

type SessionTokenResolver = () => Promise<string | undefined>;

const defaultSessionTokenResolver: SessionTokenResolver = async () => {
  const cookieStore = await cookies();
  return cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
};

let activeSessionTokenResolver: SessionTokenResolver = defaultSessionTokenResolver;

/**
 * Test hook allowing automated unit and integration tests to simulate request cookies.
 * Disabled in production environments.
 */
export function __setSessionTokenResolverForTesting(resolver: SessionTokenResolver | null) {
  if (process.env.NODE_ENV !== 'production') {
    activeSessionTokenResolver = resolver || defaultSessionTokenResolver;
  }
}

/**
 * Validates that the current server-side request originates from an active,
 * authenticated administrator session. Optionally enforces role-based access.
 *
 * @param allowedRoles Optional list of roles permitted to perform the action.
 *                     If omitted, any active administrator ('Owner', 'Manager', 'Staff') is permitted.
 * @returns Trusted AdminUser from database with verified ID and role.
 * @throws AuthenticationError if unauthenticated, expired, revoked, or inactive.
 * @throws AuthorizationError if authenticated but lacking the required role.
 */
export async function requireAdminUser(allowedRoles?: AdminRole[]): Promise<AdminUser> {
  let sessionToken: string | undefined;

  try {
    sessionToken = await activeSessionTokenResolver();
  } catch (err) {
    console.error('[requireAdminUser] Failed to read session cookie from request context:', err);
    throw new AuthenticationError('Authentication required: Failed to read session context.');
  }

  if (!sessionToken || typeof sessionToken !== 'string' || sessionToken.trim().length === 0) {
    throw new AuthenticationError('Authentication required: No active session found.');
  }

  let user: AdminUser | null = null;
  try {
    user = await AuthRepository.getCurrentUser(sessionToken);
  } catch (err) {
    console.error('[requireAdminUser] Exception during session verification:', err);
    throw new AuthenticationError('Authentication failed: Unable to verify session.');
  }

  if (!user) {
    throw new AuthenticationError(
      'Authentication required: Session is invalid, expired, or revoked.',
    );
  }

  if (user.status !== 'Active') {
    throw new AuthenticationError('Authentication required: Account is not active.');
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const hasPermission = AuthService.hasPermission(user, allowedRoles);
    if (!hasPermission) {
      throw new AuthorizationError(
        `Permission denied: Operation requires one of the following roles: ${allowedRoles.join(', ')}.`,
      );
    }
  }

  return user;
}

/**
 * Convenience helper to enforce specific role requirements.
 */
export async function requireAdminRole(allowedRoles: AdminRole[]): Promise<AdminUser> {
  return requireAdminUser(allowedRoles);
}
