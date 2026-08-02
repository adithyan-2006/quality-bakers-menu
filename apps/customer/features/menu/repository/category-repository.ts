import { CATEGORIES } from '../config/categories';
import type { MenuCategoryConfig } from '../types';

/**
 * Category Repository
 *
 * The single data-access layer for category configuration.
 * MenuEngine and CategorySection ONLY call this — never the config directly.
 *
 * Today: reads from the static config array.
 * Future: replace the private `_source` with an API fetch.
 *         Only this file changes. No rendering code requires modification.
 *
 * API migration example:
 *   async function _source(): Promise<MenuCategoryConfig[]> {
 *     const res = await fetch('/api/categories', { next: { revalidate: 60 } });
 *     return res.json();
 *   }
 */

/** @internal */
function _source(): MenuCategoryConfig[] {
  return CATEGORIES;
}

function _sortByOrder(categories: MenuCategoryConfig[]): MenuCategoryConfig[] {
  return [...categories].sort((a, b) => a.displayOrder - b.displayOrder);
}

export const CategoryRepository = {
  /**
   * Returns all categories sorted by displayOrder.
   */
  getAll(): MenuCategoryConfig[] {
    return _sortByOrder(_source());
  },

  /**
   * Returns only visible categories sorted by displayOrder.
   * This is the primary method used by MenuEngine.
   */
  getVisible(): MenuCategoryConfig[] {
    return _sortByOrder(_source().filter((c) => c.isVisible));
  },

  /**
   * Returns featured categories sorted by displayOrder.
   * Used by future homepage dynamic data loading.
   */
  getFeatured(): MenuCategoryConfig[] {
    return _sortByOrder(_source().filter((c) => c.isVisible && c.isFeatured));
  },

  /**
   * Returns categories marked for homepage display, sorted by displayOrder.
   */
  getFeaturedOnHome(): MenuCategoryConfig[] {
    return _sortByOrder(_source().filter((c) => c.isVisible && c.featuredOnHome));
  },

  /**
   * Returns a single category by slug, or undefined if not found.
   */
  getBySlug(slug: string): MenuCategoryConfig | undefined {
    return _source().find((c) => c.slug === slug);
  },

  /**
   * Returns a single category by id, or undefined if not found.
   */
  getById(id: string): MenuCategoryConfig | undefined {
    return _source().find((c) => c.id === id);
  },
} as const;
