import { prisma } from '@qbm/database';
import type { MenuProduct } from '../types';

/**
 * Product Repository
 *
 * Connected to Prisma Database.
 */

function mapProduct(p: any): MenuProduct {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.shortDescription || p.description || '',
    image: p.image?.optimizedUrl || p.image?.originalUrl || undefined,
    badge: p.badge !== 'NONE' ? p.badge : undefined,
    price: p.price ? `₹${p.price}` : undefined,
    categorySlug: p.category?.slug || '',
    likeCount: p._count?.likes ?? p.likeCountRel?.count ?? 0,
  };
}

export const ProductRepository = {
  /**
   * Returns all products for a given category slug, sorted by their natural order.
   * Primary method used by CategorySection and LayoutEngine.
   */
  async getProductsForCategory(categorySlug: string, limit?: number): Promise<MenuProduct[]> {
    const products = await prisma.product.findMany({
      where: {
        category: { slug: categorySlug },
        isVisible: true,
        status: 'PUBLISHED',
      },
      include: {
        image: true,
        category: true,
        likeCountRel: true,
        _count: { select: { likes: true } },
      },
      orderBy: { displayOrder: 'asc' },
      ...(limit ? { take: limit } : {}),
    });
    return products.map(mapProduct);
  },

  /**
   * Returns the hero/spotlight product for a category.
   * When heroProductId is present on the config, this resolves that specific product.
   * Falls back to the first product in the category.
   */
  async getHeroProduct(
    categorySlug: string,
    heroProductId?: string,
  ): Promise<MenuProduct | undefined> {
    if (heroProductId) {
      const p = await prisma.product.findUnique({
        where: { id: heroProductId },
        include: {
          image: true,
          category: true,
          likeCountRel: true,
          _count: { select: { likes: true } },
        },
      });
      if (p && p.isVisible && p.status === 'PUBLISHED') {
        return mapProduct(p);
      }
    }
    const products = await this.getProductsForCategory(categorySlug, 1);
    return products[0];
  },

  /**
   * Returns featured products across all categories, up to the given limit.
   * Used by homepage popular preview sections.
   * Today: returns the first product from each of the given slugs.
   */
  async getFeaturedProducts(categorySlugs: string[], limitPerCategory = 1): Promise<MenuProduct[]> {
    const promises = categorySlugs.map((slug) =>
      this.getProductsForCategory(slug, limitPerCategory),
    );
    const results = await Promise.all(promises);
    return results.flat();
  },
} as const;
