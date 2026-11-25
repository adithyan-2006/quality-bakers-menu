'use server';

import { revalidatePath } from 'next/cache';
import { RepositoryFactory } from '../../../lib/repository-factory';
import { requireAdminUser } from '../../../lib/auth';

export async function getMediaLibraryAction() {
  await requireAdminUser();
  const repo = RepositoryFactory.getMediaRepository();
  return await repo.getMedia();
}

export async function getMediaByIdAction(id: string) {
  await requireAdminUser();
  const repo = RepositoryFactory.getMediaRepository();
  return await repo.getMediaById(id);
}

export async function uploadMediaAction(formData: FormData) {
  await requireAdminUser(['Owner', 'Manager']);
  const file = formData.get('file') as File;
  if (!file) throw new Error('No file provided');

  const repo = RepositoryFactory.getMediaRepository();
  const folder = formData.get('folder') as string | undefined;
  const result = await repo.uploadMedia(file, folder);
  revalidatePath('/media');
  revalidatePath('/', 'layout');
  return result;
}

export async function deleteMediaAction(id: string) {
  await requireAdminUser(['Owner', 'Manager']);
  const repo = RepositoryFactory.getMediaRepository();
  await repo.deleteMedia(id);
  revalidatePath('/media');
  revalidatePath('/', 'layout');
}
