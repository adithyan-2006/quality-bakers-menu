import type { ProductId, CategoryId } from '../common';
import type { ProductStatus } from './entity';

/**
 * Lightweight Product representation for lists.
 * Intended to be returned in catalog and search endpoints.
 */
export interface ProductSummary {
  id: ProductId;
  categoryId: CategoryId;
  name: string;
  slug: string;
  price: number;
  status: ProductStatus;
  sortOrder: number;
  /** URL for the primary thumbnail image */
  thumbnailUrl: string | null;
}

/**
 * Input payload for creating a new Product.
 * Intended to be validated against request bodies.
 */
export interface CreateProductInput {
  categoryId: CategoryId;
  name: string;
  description?: string;
  price: number;
  status?: ProductStatus;
  ingredients?: string[];
  allergens?: string[];
  sortOrder?: number;
}

/**
 * Input payload for updating an existing Product.
 * Intended to be validated against request bodies.
 */
export interface UpdateProductInput {
  categoryId?: CategoryId;
  name?: string;
  description?: string;
  price?: number;
  status?: ProductStatus;
  ingredients?: string[];
  allergens?: string[];
  sortOrder?: number;
}
