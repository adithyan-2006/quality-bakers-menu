'use server';

import { AuthRepository } from '../repositories/auth-repository';

export async function loginAction(email: string, password: string) {
  return AuthRepository.login(email, password);
}

export async function logoutAction() {
  return AuthRepository.logout();
}

export async function getCurrentUserAction() {
  return AuthRepository.getCurrentUser();
}

export async function requestPasswordResetAction(email: string) {
  return AuthRepository.requestPasswordReset(email);
}
