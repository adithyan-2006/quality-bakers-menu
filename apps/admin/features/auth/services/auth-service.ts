import {
  loginAction,
  logoutAction,
  getCurrentUserAction,
  requestPasswordResetAction,
  changePasswordAction,
} from '../actions/auth-actions';
import { AdminUser, AdminRole } from '../../users/repositories/user-repository';

export const AuthService = {
  login: async (email: string, password: string) => {
    return loginAction(email, password);
  },

  logout: async () => {
    return logoutAction();
  },

  getCurrentUser: async () => {
    return getCurrentUserAction();
  },

  requestPasswordReset: async (email: string) => {
    return requestPasswordResetAction(email);
  },

  changePassword: async (userId: string, newPassword: string) => {
    return changePasswordAction(userId, newPassword);
  },

  hasPermission: (user: AdminUser | null, requiredRoles: AdminRole[]) => {
    if (!user) return false;
    if (user.role === 'Owner') return true; // Owner always has permission
    return requiredRoles.includes(user.role);
  },
};
