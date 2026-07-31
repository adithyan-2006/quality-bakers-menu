import type { CategoryId, ISODateString } from '../common';

/**
 * Full Category entity representation.
 * Intended to represent the category as stored in the database.
 */
export interface Category {
  id: CategoryId;
  name: string;
  slug: string;
  description: string | null;
  /** Display order for sorting in UI */
  sortOrder: number;
  /** Whether the category is visible to customers */
  isActive: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}
