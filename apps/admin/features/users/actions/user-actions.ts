'use server';

import { revalidatePath } from 'next/cache';
import { RepositoryFactory } from '../../../lib/repository-factory';
import { AdminUser } from '../repositories/user-repository';
import { requireAdminUser, requireAdminRole } from '../../../lib/auth';
import { AuthorizationError } from '../../../lib/errors';

export async function getUsersAction() {
  await requireAdminRole(['Owner']);
  const repo = RepositoryFactory.getUserRepository();
  return await repo.getUsers();
}

export async function getUserByIdAction(id: string) {
  const currentUser = await requireAdminUser();
  if (currentUser.role !== 'Owner' && currentUser.id !== id) {
    throw new AuthorizationError('Permission denied: You can only view your own profile.');
  }
  const repo = RepositoryFactory.getUserRepository();
  return await repo.getUserById(id);
}

export async function createUserAction(data: Partial<AdminUser>) {
  await requireAdminRole(['Owner']);
  const repo = RepositoryFactory.getUserRepository();
  const result = await repo.createUser(data);
  revalidatePath('/users');
  revalidatePath('/', 'layout');
  return result;
}

export async function updateUserAction(id: string, data: Partial<AdminUser>) {
  const currentUser = await requireAdminUser();

  // 1. Non-Owner users can only update their own profile and cannot escalate role or status
  if (currentUser.role !== 'Owner') {
    if (currentUser.id !== id) {
      throw new AuthorizationError('Permission denied: You can only update your own profile.');
    }
    if (data.role && data.role !== currentUser.role) {
      throw new AuthorizationError('Permission denied: You cannot change your own role.');
    }
    if (data.status && data.status !== currentUser.status) {
      throw new AuthorizationError('Permission denied: You cannot change your own status.');
    }
  }

  // 2. Safeguard Owner account integrity (matching UI business rules)
  if (currentUser.role === 'Owner') {
    const targetUser = await RepositoryFactory.getUserRepository().getUserById(id);
    if (targetUser?.role === 'Owner') {
      if (data.role && data.role !== 'Owner') {
        throw new AuthorizationError('Permission denied: Owner role cannot be changed directly.');
      }
      if (data.status && data.status !== 'Active') {
        throw new AuthorizationError('Permission denied: Owner account cannot be disabled.');
      }
    }
  }

  const repo = RepositoryFactory.getUserRepository();
  const result = await repo.updateUser(id, data);
  revalidatePath('/users');
  revalidatePath('/', 'layout');
  return result;
}

export async function softDeleteUserAction(id: string) {
  await requireAdminRole(['Owner']);

  const targetUser = await RepositoryFactory.getUserRepository().getUserById(id);
  if (targetUser?.role === 'Owner') {
    throw new AuthorizationError('Permission denied: Cannot deactivate the Owner account.');
  }

  const repo = RepositoryFactory.getUserRepository();
  await repo.softDeleteUser(id);
  revalidatePath('/users');
  revalidatePath('/', 'layout');
}
