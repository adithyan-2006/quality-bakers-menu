import { getPlaceholderProducts } from '../config/categories';
import type { MenuProduct } from '../types';

/**
 * Product Repository
 *
 * The single data-access layer for product data.
 * Layout components and CategorySection ONLY call this — never the config directly.
 *
 * Today: returns placeholder data keyed by category slug.
 * Future: replace the private `_source` with an API fetch.
 *         Only this file changes. No layout or rendering code requires modification.
 *
 * API migration example:
 *   async function getProductsForCategory(slug: string): Promise<MenuProduct[]> {
 *     const res = await fetch(`/api/products?category=${slug}`, { next: { revalidate: 60 } });
 *     return res.json();
 *   }
 */

export const ProductRepository = {
  /**
   * Returns all products for a given category slug, sorted by their natural order.
   * Primary method used by CategorySection and LayoutEngine.
   */
  getProductsForCategory(categorySlug: string, limit?: number): MenuProduct[] {
    return getPlaceholderProducts(categorySlug, limit);
  },

  /**
   * Returns the hero/spotlight product for a category.
   * When heroProductId is present on the config, this resolves that specific product.
   * Falls back to the first product in the category.
   */
  getHeroProduct(categorySlug: string, heroProductId?: string): MenuProduct | undefined {
    const products = getPlaceholderProducts(categorySlug);
    if (heroProductId) {
      return products.find((p) => p.id === heroProductId) ?? products[0];
    }
    return products[0];
  },

  /**
   * Returns featured products across all categories, up to the given limit.
   * Used by homepage popular preview sections.
   * Today: returns the first product from each of the given slugs.
   */
  getFeaturedProducts(categorySlugs: string[], limitPerCategory = 1): MenuProduct[] {
    return categorySlugs.flatMap((slug) => getPlaceholderProducts(slug, limitPerCategory));
  },
} as const;
