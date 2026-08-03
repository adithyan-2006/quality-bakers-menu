'use strict';
'use server';

import { RepositoryFactory } from '../../../lib/repository-factory';
import { AdminProduct } from '../repositories/product-repo';
import { revalidatePath } from 'next/cache';

export async function getProductsAction(): Promise<AdminProduct[]> {
  return await RepositoryFactory.getProductRepository().getProducts();
}

export async function getProductAction(id: string): Promise<AdminProduct | null> {
  return await RepositoryFactory.getProductRepository().getProduct(id);
}

export async function createProductAction(data: Partial<AdminProduct>): Promise<AdminProduct> {
  const result = await RepositoryFactory.getProductRepository().createProduct(data);
  revalidatePath('/products');
  return result;
}

export async function updateProductAction(
  id: string,
  data: Partial<AdminProduct>,
): Promise<AdminProduct> {
  const result = await RepositoryFactory.getProductRepository().updateProduct(id, data);
  revalidatePath('/products');
  return result;
}

export async function updateProductDisplayOrderAction(
  items: { id: string; displayOrder: number }[],
): Promise<void> {
  const result = await RepositoryFactory.getProductRepository().updateDisplayOrder(items);
  revalidatePath('/products');
  return result;
}

export async function duplicateProductAction(id: string): Promise<AdminProduct> {
  const result = await RepositoryFactory.getProductRepository().duplicateProduct(id);
  revalidatePath('/products');
  return result;
}
