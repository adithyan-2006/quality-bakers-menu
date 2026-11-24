'use server';

import { revalidatePath } from 'next/cache';
import { RepositoryFactory } from '../../../lib/repository-factory';
import { revalidateCustomerApp } from '../../../lib/revalidate-customer';
import { requireAdminUser } from '../../../lib/auth';

export async function getCategoriesAction() {
  await requireAdminUser();
  return await RepositoryFactory.getCategoryRepository().getCategories();
}

export async function getCategoryAction(id: string) {
  await requireAdminUser();
  return await RepositoryFactory.getCategoryRepository().getCategory(id);
}

export async function createCategoryAction(data: any) {
  await requireAdminUser(['Owner', 'Manager']);
  const result = await RepositoryFactory.getCategoryRepository().createCategory(data);
  revalidatePath('/categories');
  return result;
}

export async function updateCategoryAction(id: string, data: any) {
  await requireAdminUser(['Owner', 'Manager']);
  const result = await RepositoryFactory.getCategoryRepository().updateCategory(id, data);
  revalidatePath('/categories');

  // Cross-app revalidation
  await revalidateCustomerApp();

  return result;
}

export async function updateCategoryDisplayOrderAction(items: any[]) {
  await requireAdminUser(['Owner', 'Manager']);
  const result = await RepositoryFactory.getCategoryRepository().updateDisplayOrder(items);
  revalidatePath('/categories');
  return result;
}

export async function deleteCategoryAction(id: string) {
  try {
    await requireAdminUser(['Owner', 'Manager']);
    await RepositoryFactory.getCategoryRepository().deleteCategory(id);
    revalidatePath('/categories');

    // Cross-app revalidation
    await revalidateCustomerApp();

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
