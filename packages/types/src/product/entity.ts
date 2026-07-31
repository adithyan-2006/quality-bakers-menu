import type { ProductId, CategoryId, ISODateString } from '../common';
import type { ImageUpload } from '../image';
import type { CategorySummary } from '../category/dto';

/**
 * Lifecycle status of a Product.
 * Intended to track product visibility and availability.
 */
export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

/**
 * Full Product entity representation.
 * Intended to represent the product as stored and returned by detail endpoints.
 */
export interface Product {
  id: ProductId;
  categoryId: CategoryId;
  name: string;
  slug: string;
  description: string | null;
  /** Price in decimal format */
  price: number;
  status: ProductStatus;
  /** List of ingredients (optional) */
  ingredients: string[] | null;
  /** List of allergens (optional) */
  allergens: string[] | null;
  /** Array of associated images */
  images: ImageUpload[];
  /** Display order within its category */
  sortOrder: number;
  createdAt: ISODateString;
  updatedAt: ISODateString;
  /** Reference to the parent category */
  category?: CategorySummary;
}
