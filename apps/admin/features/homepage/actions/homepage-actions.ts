'use server';

import { revalidatePath } from 'next/cache';
import { RepositoryFactory } from '../../../lib/repository-factory';
import { AdminHomepage } from '../repositories/homepage-repo';

export async function getHomepageAction() {
  const repo = RepositoryFactory.getHomepageRepository();
  return await repo.getHomepage();
}

export async function updateHomepageAction(data: AdminHomepage) {
  const repo = RepositoryFactory.getHomepageRepository();
  const result = await repo.updateHomepage(data);
  revalidatePath('/homepage');
  revalidatePath('/', 'layout');
  return result;
}
