'use server';

import { cookies } from 'next/headers';
import { AuthRepository } from '../repositories/auth-repository';
import { requireAdminUser } from '../../../lib/auth';
import { AuthorizationError } from '../../../lib/errors';

export async function loginAction(email: string, password: string) {
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    throw new Error('Please enter a valid email address.');
  }
  if (!password || typeof password !== 'string' || password.trim().length === 0) {
    throw new Error('Password is required.');
  }

  const result = await AuthRepository.login(email, password);

  try {
    const cookieStore = await cookies();
    cookieStore.set('qbm_admin_session', result.session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60, // 24 hours
    });
  } catch (err) {
    console.error('[Auth Action] Failed to set session cookie:', (err as Error)?.message || err);
    try {
      await AuthRepository.logout(result.session.id);
    } catch {
      // Ignore cleanup error
    }
    throw new Error(
      'Authentication failed: Unable to establish a secure session cookie. Please ensure cookies are enabled in your browser.',
    );
  }

  return result;
}

export async function logoutAction() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('qbm_admin_session')?.value;
    cookieStore.delete('qbm_admin_session');
    if (sessionId) {
      await AuthRepository.logout(sessionId);
    }
  } catch {
    // Cookie store access error
  }
}

export async function getCurrentUserAction() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('qbm_admin_session')?.value;
    if (!sessionId) {
      return null;
    }
    return await AuthRepository.getCurrentUser(sessionId);
  } catch {
    return null;
  }
}

export async function requestPasswordResetAction(email: string) {
  return await AuthRepository.requestPasswordReset(email);
}

export async function changePasswordAction(userId: string, newPassword: string) {
  const currentUser = await requireAdminUser();
  if (currentUser.role !== 'Owner' && currentUser.id !== userId) {
    throw new AuthorizationError('Permission denied: You can only change your own password.');
  }
  return await AuthRepository.changePassword(userId, newPassword);
}
