import { AdminRole, AdminUser, UserRepository } from '../../users/repositories/user-repository';

export interface AuthSession {
  id: string;
  userId: string;
  role: AdminRole;
  expiresAt: string;
  createdAt: string;
}

// Mock session state
let currentSession: AuthSession | null = null;

export const AuthRepository = {
  login: async (
    email: string,
    _password: string,
  ): Promise<{ session: AuthSession; user: AdminUser }> => {
    // Mock validation
    const user = await UserRepository.getUserByEmail(email);
    if (!user) throw new Error('Invalid credentials');
    if (user.status !== 'Active') throw new Error('Account is disabled');

    // In a real app we'd check password here. For mock, any password works.

    const session: AuthSession = {
      id: `sess_${Date.now()}`,
      userId: user.id,
      role: user.role,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    };

    currentSession = session;

    // Update last login
    await UserRepository.updateUser(user.id, { lastLogin: new Date().toISOString() });

    return { session, user };
  },

  logout: async (): Promise<void> => {
    currentSession = null;
  },

  getCurrentUser: async (): Promise<AdminUser | null> => {
    if (!currentSession) return null;

    // Check expiry
    if (new Date(currentSession.expiresAt) < new Date()) {
      currentSession = null;
      return null;
    }

    return await UserRepository.getUserById(currentSession.userId);
  },

  changePassword: async (userId: string, _newPassword: string): Promise<void> => {
    // Mock change password
    console.log(`Password changed for user ${userId}`);
  },

  requestPasswordReset: async (email: string): Promise<void> => {
    // Mock email send
    const user = await UserRepository.getUserByEmail(email);
    if (!user) throw new Error('If the email exists, a reset link will be sent.');
    console.log(`Password reset link sent to ${email}`);
  },

  verifySession: async (): Promise<boolean> => {
    if (!currentSession) return false;
    return new Date(currentSession.expiresAt) > new Date();
  },
};
