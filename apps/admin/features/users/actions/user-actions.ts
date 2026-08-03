'use server';

import { revalidatePath } from 'next/cache';
import { RepositoryFactory } from '../../../lib/repository-factory';
import { AdminUser } from '../repositories/user-repository';

export async function getUsersAction() {
  const repo = RepositoryFactory.getUserRepository();
  return await repo.getUsers();
}

export async function getUserByIdAction(id: string) {
  const repo = RepositoryFactory.getUserRepository();
  return await repo.getUserById(id);
}

export async function createUserAction(data: Partial<AdminUser>) {
  const repo = RepositoryFactory.getUserRepository();
  const result = await repo.createUser(data);
  revalidatePath('/users');
  revalidatePath('/', 'layout');
  return result;
}

export async function updateUserAction(id: string, data: Partial<AdminUser>) {
  const repo = RepositoryFactory.getUserRepository();
  const result = await repo.updateUser(id, data);
  revalidatePath('/users');
  revalidatePath('/', 'layout');
  return result;
}

export async function softDeleteUserAction(id: string) {
  const repo = RepositoryFactory.getUserRepository();
  await repo.softDeleteUser(id);
  revalidatePath('/users');
  revalidatePath('/', 'layout');
}
