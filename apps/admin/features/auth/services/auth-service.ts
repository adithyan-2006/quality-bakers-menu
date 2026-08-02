import { AuthRepository } from '../repositories/auth-repository';
import { AdminUser, AdminRole } from '../../users/repositories/user-repository';

export const AuthService = {
  login: async (email: string, password: string) => {
    return AuthRepository.login(email, password);
  },

  logout: async () => {
    return AuthRepository.logout();
  },

  getCurrentUser: async () => {
    return AuthRepository.getCurrentUser();
  },

  requestPasswordReset: async (email: string) => {
    return AuthRepository.requestPasswordReset(email);
  },

  hasPermission: (user: AdminUser | null, requiredRoles: AdminRole[]) => {
    if (!user) return false;
    if (user.role === 'Owner') return true; // Owner always has permission
    return requiredRoles.includes(user.role);
  },
};
