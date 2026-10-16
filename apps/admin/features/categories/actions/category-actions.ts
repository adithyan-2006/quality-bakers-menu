'use server';

import { revalidatePath } from 'next/cache';
import { RepositoryFactory } from '../../../lib/repository-factory';
import { revalidateCustomerApp } from '../../../lib/revalidate-customer';

export async function getCategoriesAction() {
  return await RepositoryFactory.getCategoryRepository().getCategories();
}

export async function getCategoryAction(id: string) {
  return await RepositoryFactory.getCategoryRepository().getCategory(id);
}

export async function createCategoryAction(data: any) {
  const result = await RepositoryFactory.getCategoryRepository().createCategory(data);
  revalidatePath('/categories');
  revalidatePath('/homepage');

  // Cross-app revalidation
  await revalidateCustomerApp();

  return result;
}

export async function updateCategoryAction(id: string, data: any) {
  const result = await RepositoryFactory.getCategoryRepository().updateCategory(id, data);
  revalidatePath('/categories');
  revalidatePath('/homepage');

  // Cross-app revalidation
  await revalidateCustomerApp();

  return result;
}

export async function updateCategoryDisplayOrderAction(items: any[]) {
  const result = await RepositoryFactory.getCategoryRepository().updateDisplayOrder(items);
  revalidatePath('/categories');

  // Cross-app revalidation
  await revalidateCustomerApp();

  return result;
}

export async function deleteCategoryAction(id: string) {
  try {
    await RepositoryFactory.getCategoryRepository().deleteCategory(id);
    revalidatePath('/categories');

    // Cross-app revalidation
    await revalidateCustomerApp();

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
