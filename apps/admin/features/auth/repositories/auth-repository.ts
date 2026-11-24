import crypto from 'crypto';
import { prisma, verifyPassword, hashPassword } from '@qbm/database';
import { AdminRole, AdminUser } from '../../users/repositories/user-repository';
import { RepositoryFactory } from '../../../lib/repository-factory';

export interface AuthSession {
  id: string;
  userId: string;
  role: AdminRole;
  expiresAt: string;
  createdAt: string;
}

function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET || process.env.AUTH_SECRET;
  if (!secret || secret.trim().length < 32) {
    throw new Error(
      '[AuthRepository] Authentication configuration error: ADMIN_SESSION_SECRET is missing or invalid. A secret with at least 32 characters must be configured in environment variables.',
    );
  }
  return secret.trim();
}

function signSessionToken(session: Omit<AuthSession, 'id'> & { id?: string }): string {
  const secret = getSessionSecret();
  const payload = JSON.stringify({
    uid: session.userId,
    role: session.role,
    exp: session.expiresAt,
    iat: session.createdAt,
    nonce: crypto.randomBytes(8).toString('hex'),
  });
  const encoded = Buffer.from(payload, 'utf8').toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(encoded).digest('base64url');
  return `sess_${encoded}.${signature}`;
}

function parseAndVerifySessionToken(token: string): AuthSession | null {
  if (!token || typeof token !== 'string' || !token.startsWith('sess_')) return null;
  const parts = token.substring(5).split('.');
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;
  const encoded = parts[0];
  const signature = parts[1];

  let secret: string;
  try {
    secret = getSessionSecret();
  } catch (err) {
    console.error('[AuthRepository] Failed to resolve session secret for verification:', err);
    return null;
  }

  const expectedSignature = crypto.createHmac('sha256', secret).update(encoded).digest('base64url');

  const sigBuffer = Buffer.from(signature, 'base64url');
  const expectedBuffer = Buffer.from(expectedSignature, 'base64url');

  if (sigBuffer.length !== expectedBuffer.length) {
    return null;
  }

  if (!crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
    return null;
  }

  try {
    const json = Buffer.from(encoded, 'base64url').toString('utf8');
    const data = JSON.parse(json);
    if (!data.uid || !data.exp) return null;

    if (new Date(data.exp) <= new Date()) {
      return null;
    }

    return {
      id: token,
      userId: data.uid,
      role: data.role,
      expiresAt: data.exp,
      createdAt: data.iat || new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export const AuthRepository = {
  login: async (
    email: string,
    password: string,
  ): Promise<{ session: AuthSession; user: AdminUser }> => {
    if (!email || !email.trim()) {
      throw new Error('Email is required');
    }
    if (!password || !password.trim()) {
      throw new Error('Password is required');
    }

    const cleanEmail = email.trim().toLowerCase();

    let dbUser: {
      id: string;
      email: string;
      role: any;
      status: any;
      passwordHash: string | null;
    } | null = null;

    try {
      dbUser = await prisma.user.findUnique({
        where: { email: cleanEmail },
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          passwordHash: true,
        },
      });
    } catch (dbErr) {
      console.error('[AuthRepository] Database error during user lookup:', dbErr);
      throw new Error('Authentication service error: Unable to process login.');
    }

    if (!dbUser || dbUser.status !== 'ACTIVE' || !dbUser.passwordHash) {
      throw new Error('Invalid credentials');
    }

    let isPasswordValid = false;
    try {
      isPasswordValid = await verifyPassword(password, dbUser.passwordHash);
    } catch (verifyErr) {
      console.error('[AuthRepository] Password verification failure:', verifyErr);
      isPasswordValid = false;
    }

    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const user = await RepositoryFactory.getUserRepository().getUserById(dbUser.id);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

    const signedToken = signSessionToken({
      userId: user.id,
      role: user.role,
      createdAt: now.toISOString(),
      expiresAt,
    });

    const session: AuthSession = {
      id: signedToken,
      userId: user.id,
      role: user.role,
      createdAt: now.toISOString(),
      expiresAt,
    };

    // Durable server-side session persistence in PostgreSQL
    try {
      await prisma.session.create({
        data: {
          sessionToken: signedToken,
          userId: user.id,
          expires: new Date(expiresAt),
        },
      });
    } catch (err) {
      console.error('[AuthRepository] Failed to persist session to database:', err);
      throw new Error('Authentication service error: Failed to record session.');
    }

    // Update last login timestamp
    try {
      await RepositoryFactory.getUserRepository().updateUser(user.id, {
        lastLogin: new Date().toISOString(),
      });
    } catch (updateErr) {
      console.warn('[AuthRepository] Failed to update lastLogin timestamp:', updateErr);
    }

    return { session, user };
  },

  logout: async (sessionId?: string): Promise<void> => {
    if (!sessionId || typeof sessionId !== 'string') {
      return;
    }

    // Durable server-side session revocation in PostgreSQL
    try {
      await prisma.session.deleteMany({
        where: { sessionToken: sessionId },
      });
    } catch (err) {
      console.warn('[AuthRepository] Failed to delete session from database on logout:', err);
    }
  },

  getCurrentUser: async (sessionId?: string): Promise<AdminUser | null> => {
    if (!sessionId || typeof sessionId !== 'string') {
      return null;
    }

    // 1. Stateless cryptographical & expiry gate
    const tokenData = parseAndVerifySessionToken(sessionId);
    if (!tokenData) {
      return null;
    }

    // 2. Durable database check (server-side revocation check and active status check)
    try {
      const dbSession = await prisma.session.findUnique({
        where: { sessionToken: sessionId },
        include: { user: true },
      });

      if (!dbSession) {
        // Session was revoked (logged out) or deleted
        return null;
      }

      if (new Date(dbSession.expires) <= new Date()) {
        // Expired in database
        await prisma.session.deleteMany({ where: { sessionToken: sessionId } }).catch(() => {});
        return null;
      }

      if (dbSession.user.status !== 'ACTIVE') {
        // Administrator was disabled or deactivated
        await prisma.session.deleteMany({ where: { sessionToken: sessionId } }).catch(() => {});
        return null;
      }

      return await RepositoryFactory.getUserRepository().getUserById(dbSession.userId);
    } catch (err) {
      console.error('[AuthRepository] Error retrieving current user from database:', err);
      return null;
    }
  },

  changePassword: async (userId: string, newPassword: string): Promise<void> => {
    if (!userId || typeof userId !== 'string') {
      throw new Error('User ID is required.');
    }
    if (!newPassword || typeof newPassword !== 'string' || newPassword.trim().length < 8) {
      throw new Error('Password must be at least 8 characters long.');
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, status: true },
    });

    if (!targetUser) {
      throw new Error('User not found.');
    }

    const hashedPassword = await hashPassword(newPassword.trim());

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashedPassword },
    });

    // Invalidate existing sessions for this user so they must re-authenticate with the new password
    await prisma.session
      .deleteMany({
        where: { userId },
      })
      .catch((err) => {
        console.warn(
          '[AuthRepository] Failed to invalidate old sessions after password change:',
          err,
        );
      });
  },

  requestPasswordReset: async (_email: string): Promise<void> => {
    // Self-service email reset is not configured (no external email delivery service).
    // Avoid misleading success states or unauthenticated credential exposure.
    throw new Error(
      'Self-service password reset is disabled. Please contact the store owner or system administrator to reset administrative credentials.',
    );
  },

  verifySession: async (sessionId?: string): Promise<boolean> => {
    if (!sessionId || typeof sessionId !== 'string') {
      return false;
    }

    // 1. Stateless cryptographical & expiry gate
    const tokenData = parseAndVerifySessionToken(sessionId);
    if (!tokenData) {
      return false;
    }

    // 2. Durable database check (server-side revocation check and active status check)
    try {
      const dbSession = await prisma.session.findUnique({
        where: { sessionToken: sessionId },
        include: { user: true },
      });

      if (!dbSession) {
        // Session was revoked (logged out) or deleted
        return false;
      }

      if (new Date(dbSession.expires) <= new Date()) {
        await prisma.session.deleteMany({ where: { sessionToken: sessionId } }).catch(() => {});
        return false;
      }

      if (dbSession.user.status !== 'ACTIVE') {
        await prisma.session.deleteMany({ where: { sessionToken: sessionId } }).catch(() => {});
        return false;
      }

      return true;
    } catch (err) {
      console.error('[AuthRepository] Database session verification error:', err);
      return false;
    }
  },
};
