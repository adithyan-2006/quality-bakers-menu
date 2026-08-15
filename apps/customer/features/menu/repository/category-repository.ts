import { prisma } from '@qbm/database';
import type { MenuCategoryConfig, LayoutType, DisplayStyle, AnimationPreset } from '../types';

/**
 * Category Repository
 *
 * Connected to Prisma Database.
 */

function mapCategory(c: any): MenuCategoryConfig {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description || '',
    coverImage: c.coverImage?.optimizedUrl || c.coverImage?.originalUrl || undefined,
    displayOrder: c.displayOrder,
    isVisible: c.isVisible && c.status === 'PUBLISHED',
    isFeatured: c.isFeatured,
    featuredOnHome: c.isFeatured, // mapped as fallback
    layoutType: (c.layoutType as LayoutType) || 'editorial-grid',
    displayStyle: (c.theme as DisplayStyle) || 'classic',
    animationPreset: (c.animationPreset as AnimationPreset) || 'fade-up',
    scrollBehavior: 'standard',
    createdAt: c.createdAt ? c.createdAt.toISOString() : new Date().toISOString(),
    updatedAt: c.updatedAt ? c.updatedAt.toISOString() : new Date().toISOString(),
  };
}

export const CategoryRepository = {
  /**
   * Returns all categories sorted by displayOrder.
   */
  async getAll(): Promise<MenuCategoryConfig[]> {
    const categories = await prisma.category.findMany({
      include: { coverImage: true },
      orderBy: { displayOrder: 'asc' },
    });
    return categories.map(mapCategory);
  },

  /**
   * Returns only visible categories sorted by displayOrder.
   * This is the primary method used by MenuEngine.
   */
  async getVisible(): Promise<MenuCategoryConfig[]> {
    const categories = await prisma.category.findMany({
      where: { isVisible: true, status: 'PUBLISHED' },
      include: { coverImage: true },
      orderBy: { displayOrder: 'asc' },
    });
    return categories.map(mapCategory);
  },

  /**
   * Returns featured categories sorted by displayOrder.
   * Used by future homepage dynamic data loading.
   */
  async getFeatured(): Promise<MenuCategoryConfig[]> {
    const categories = await prisma.category.findMany({
      where: { isVisible: true, status: 'PUBLISHED', isFeatured: true },
      include: { coverImage: true },
      orderBy: { displayOrder: 'asc' },
    });
    return categories.map(mapCategory);
  },

  /**
   * Returns categories marked for homepage display, sorted by displayOrder.
   */
  async getFeaturedOnHome(): Promise<MenuCategoryConfig[]> {
    const categories = await prisma.category.findMany({
      where: { isVisible: true, status: 'PUBLISHED', isFeatured: true },
      include: { coverImage: true },
      orderBy: { displayOrder: 'asc' },
    });
    return categories.map(mapCategory);
  },

  /**
   * Returns a single category by slug, or undefined if not found.
   */
  async getBySlug(slug: string): Promise<MenuCategoryConfig | undefined> {
    const category = await prisma.category.findUnique({
      where: { slug },
      include: { coverImage: true },
    });
    return category ? mapCategory(category) : undefined;
  },

  /**
   * Returns a single category by id, or undefined if not found.
   */
  async getById(id: string): Promise<MenuCategoryConfig | undefined> {
    const category = await prisma.category.findUnique({
      where: { id },
      include: { coverImage: true },
    });
    return category ? mapCategory(category) : undefined;
  },
} as const;
