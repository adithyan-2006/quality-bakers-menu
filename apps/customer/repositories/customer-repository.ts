import { prisma } from '@qbm/database';

export class CustomerRepository {
  /**
   * Fetches the global business settings, including contact details,
   * social links, and the logo.
   */
  static async getBusiness() {
    try {
      return await prisma.business.findFirst({
        include: { logo: true },
      });
    } catch (error) {
      console.error('[CustomerRepository] Failed to fetch business:', error);
      return null;
    }
  }

  /**
   * Fetches the homepage data including hero/about images and featured categories.
   */
  static async getHomepage() {
    try {
      const hp = await prisma.homepage.findFirst({
        include: {
          heroImage: true,
          aboutImage: true,
          featuredCategories: {
            orderBy: { displayOrder: 'asc' },
            include: {
              category: {
                include: { coverImage: true },
              },
            },
          },
        },
      });

      if (!hp) return null;

      // Extract the nested categories from the explicit junction table
      const mappedCategories = hp.featuredCategories.map((fc) => fc.category);

      // Create a mapped object that overrides the featuredCategories type
      // while preserving all other Prisma Homepage fields for EditorialIntro.
      const result: Omit<typeof hp, 'featuredCategories'> & {
        featuredCategories: typeof mappedCategories;
      } = {
        ...hp,
        featuredCategories: mappedCategories,
      };

      return result;
    } catch (error) {
      console.error('[CustomerRepository] Failed to fetch homepage:', error);
      return null;
    }
  }

  /**
   * Fetches up to 4 popular/featured products.
   * Priority:
   * 1. Published products marked as isFeatured
   * 2. If < 4 featured products exist, fill the rest with newest published products
   */
  static async getPopularProducts() {
    try {
      // 1. Fetch featured products first
      const featuredProducts = await prisma.product.findMany({
        where: {
          status: 'PUBLISHED',
          isFeatured: true,
        },
        take: 4,
        orderBy: { updatedAt: 'desc' },
        include: { image: true, category: true },
      });

      // 2. If we have fewer than 4, fill the remaining slots
      if (featuredProducts.length < 4) {
        const remainingLimit = 4 - featuredProducts.length;
        const featuredIds = featuredProducts.map((p) => p.id);

        const newestProducts = await prisma.product.findMany({
          where: {
            status: 'PUBLISHED',
            id: { notIn: featuredIds },
          },
          take: remainingLimit,
          orderBy: { createdAt: 'desc' },
          include: { image: true, category: true },
        });

        return [...featuredProducts, ...newestProducts];
      }

      return featuredProducts;
    } catch (error) {
      console.error('[CustomerRepository] Failed to fetch popular products:', error);
      return [];
    }
  }
}
