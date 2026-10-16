import { prisma } from '@qbm/database';
import { formatBadge } from '@qbm/ui';
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
    badge: formatBadge(p.badge),
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
   * Returns featured products across all categories, up to the given limit per category.
   * Fetches matching products in a single batched query to eliminate N+1 query overhead,
   * while preserving per-category limits and categorySlugs input ordering.
   */
  async getFeaturedProducts(categorySlugs: string[], limitPerCategory = 1): Promise<MenuProduct[]> {
    if (!categorySlugs.length || limitPerCategory <= 0) {
      return [];
    }

    const products = await prisma.product.findMany({
      where: {
        category: { slug: { in: categorySlugs } },
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
    });

    const productsByCategory = new Map<string, MenuProduct[]>();
    for (const p of products) {
      const slug = p.category?.slug;
      if (!slug) continue;
      let group = productsByCategory.get(slug);
      if (!group) {
        group = [];
        productsByCategory.set(slug, group);
      }
      if (group.length < limitPerCategory) {
        group.push(mapProduct(p));
      }
    }

    const results: MenuProduct[] = [];
    for (const slug of categorySlugs) {
      const categoryProducts = productsByCategory.get(slug);
      if (categoryProducts) {
        results.push(...categoryProducts);
      }
    }

    return results;
  },

  /**
   * Returns all products grouped by category slug in a single query.
   * Eliminates connection pool pressure and N+1 queries.
   */
  async getProductsForCategories(categorySlugs: string[]): Promise<Record<string, MenuProduct[]>> {
    if (!categorySlugs.length) return {};
    const products = await prisma.product.findMany({
      where: {
        category: { slug: { in: categorySlugs } },
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
    });

    const result: Record<string, MenuProduct[]> = {};
    for (const slug of categorySlugs) {
      result[slug] = [];
    }
    for (const p of products) {
      const slug = p.category?.slug;
      if (slug && result[slug]) {
        result[slug].push(mapProduct(p));
      }
    }
    return result;
  },
} as const;
