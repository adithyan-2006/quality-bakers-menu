import type { CategoryId } from '../common';

/**
 * Lightweight Category representation for lists and relationships.
 * Intended to be returned in list endpoints.
 */
export interface CategorySummary {
  id: CategoryId;
  name: string;
  slug: string;
  sortOrder: number;
  isActive: boolean;
}

/**
 * Input payload for creating a new Category.
 * Intended to be validated against request bodies.
 */
export interface CreateCategoryInput {
  name: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
}

/**
 * Input payload for updating an existing Category.
 * Intended to be validated against request bodies.
 */
export interface UpdateCategoryInput {
  name?: string;
  description?: string;
  isActive?: boolean;
  sortOrder?: number;
}
