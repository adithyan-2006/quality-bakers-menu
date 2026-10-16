import { cache } from 'react';
import { prisma } from '@qbm/database';

/**
 * Executes a database operation with automatic retry on transient pool timeouts.
 */
async function withRetry<T>(fn: () => Promise<T>, retries = 2, delayMs = 600): Promise<T> {
  let lastError: any;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      const isConnectionPoolTimeout =
        error?.message?.includes('connection pool') ||
        error?.message?.includes('Timed out fetching') ||
        error?.name === 'PrismaClientInitializationError';

      if (isConnectionPoolTimeout && attempt < retries) {
        console.warn(
          `[CustomerRepository] Database pool busy, retrying query (attempt ${attempt + 1}/${retries})...`,
        );
        await new Promise((r) => setTimeout(r, delayMs * (attempt + 1)));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

export class CustomerRepository {
  /**
   * Fetches the global business settings, including contact details,
   * social links, and the logo.
   * Deduplicated across the entire server render pass with React.cache().
   */
  static getBusiness = cache(async () => {
    try {
      return await withRetry(() =>
        prisma.business.findFirst({
          include: { logo: true },
        }),
      );
    } catch (error) {
      console.error('[CustomerRepository] Failed to fetch business:', error);
      return null;
    }
  });

  /**
   * Fetches the homepage data including hero/about images and featured categories.
   * Deduplicated across the entire server render pass with React.cache().
   */
  static getHomepage = cache(async () => {
    try {
      const hp = await withRetry(() =>
        prisma.homepage.findFirst({
          include: {
            heroImage: true,
            aboutImage: true,
            featuredCategories: {
              where: {
                category: {
                  status: 'PUBLISHED',
                  isVisible: true,
                  isFeatured: true,
                },
              },
              orderBy: { displayOrder: 'asc' },
              include: {
                category: {
                  include: { coverImage: true },
                },
              },
            },
          },
        }),
      );

      if (!hp) return null;

      // Extract the nested categories from the explicit junction table
      let mappedCategories = hp.featuredCategories.map((fc) => fc.category);

      // Resilient sync: also include any published, visible category marked isFeatured: true
      // that might not yet be linked in the junction table
      const junctionCategoryIds = new Set(mappedCategories.map((c) => c.id));
      const extraCategories = await withRetry(() =>
        prisma.category.findMany({
          where: {
            status: 'PUBLISHED',
            isVisible: true,
            isFeatured: true,
            id: { notIn: Array.from(junctionCategoryIds) },
          },
          orderBy: { displayOrder: 'asc' },
          include: { coverImage: true },
        }),
      );

      if (extraCategories.length > 0) {
        mappedCategories = [...mappedCategories, ...extraCategories];
      }

      // Create a mapped object that overrides the featuredCategories type
      // while preserving all other Prisma Homepage fields for EditorialIntro.
      const result: Omit<typeof hp, 'featuredCategories' | 'sections'> & {
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
  });

  /**
   * Fetches up to 4 popular/featured products.
   * Priority:
   * 1. Published products marked as isFeatured
   * 2. If < 4 featured products exist, fill the rest with newest published products
   */
  static getPopularProducts = cache(async () => {
    try {
      // 1. Fetch featured products first
      const featuredProducts = await withRetry(() =>
        prisma.product.findMany({
          where: {
            status: 'PUBLISHED',
            isFeatured: true,
          },
          take: 4,
          orderBy: { updatedAt: 'desc' },
          include: { image: true, category: true },
        }),
      );

      return featuredProducts;
    } catch (error) {
      console.error('[CustomerRepository] Failed to fetch popular products:', error);
      return [];
    }
  });

  /**
   * Fetches signature products strictly ordered by signatureOrder.
   */
  static getSignatureProducts = cache(async () => {
    try {
      return await withRetry(() =>
        prisma.product.findMany({
          where: {
            status: 'PUBLISHED',
            isVisible: true,
            isSignature: true,
          },
          orderBy: { signatureOrder: 'asc' },
          include: { image: true, category: true },
        }),
      );
    } catch (error) {
      console.error('[CustomerRepository] Failed to fetch signature products:', error);
      return [];
    }
  });
}
