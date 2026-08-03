'use server';

import { revalidatePath } from 'next/cache';
import { RepositoryFactory } from '../../../lib/repository-factory';

export async function getMediaLibraryAction() {
  const repo = RepositoryFactory.getMediaRepository();
  return await repo.getMedia();
}

export async function getMediaByIdAction(id: string) {
  const repo = RepositoryFactory.getMediaRepository();
  return await repo.getMediaById(id);
}

export async function uploadMediaAction(formData: FormData) {
  const file = formData.get('file') as File;
  if (!file) throw new Error('No file provided');

  const repo = RepositoryFactory.getMediaRepository();
  const result = await repo.simulateUpload(file);
  revalidatePath('/media');
  revalidatePath('/', 'layout');
  return result;
}

export async function deleteMediaAction(id: string) {
  const repo = RepositoryFactory.getMediaRepository();
  await repo.deleteMedia(id);
  revalidatePath('/media');
  revalidatePath('/', 'layout');
}
