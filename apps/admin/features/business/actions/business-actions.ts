'use server';

import { revalidatePath } from 'next/cache';
import { RepositoryFactory } from '../../../lib/repository-factory';
import { AdminBusiness } from '../repositories/business-repo';
import { requireAdminUser } from '../../../lib/auth';

export async function getBusinessAction() {
  await requireAdminUser();
  const repo = RepositoryFactory.getBusinessRepository();
  return await repo.getBusiness();
}

export async function updateBusinessAction(data: AdminBusiness) {
  await requireAdminUser(['Owner', 'Manager']);
  const repo = RepositoryFactory.getBusinessRepository();
  const result = await repo.updateBusiness(data);
  revalidatePath('/business');
  revalidatePath('/', 'layout');
  return result;
}
