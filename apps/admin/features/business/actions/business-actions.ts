'use server';

import { revalidatePath } from 'next/cache';
import { RepositoryFactory } from '../../../lib/repository-factory';
import { AdminBusiness } from '../repositories/business-repo';

export async function getBusinessAction() {
  const repo = RepositoryFactory.getBusinessRepository();
  return await repo.getBusiness();
}

export async function updateBusinessAction(data: AdminBusiness) {
  const repo = RepositoryFactory.getBusinessRepository();
  const result = await repo.updateBusiness(data);
  revalidatePath('/business');
  revalidatePath('/', 'layout');
  return result;
}
