import { AdminCategory } from './category-repo';
import { prisma } from '@qbm/database';
import { RepositoryError, NotFoundError } from '../../../lib/errors';
import { AuditService } from '../../audit/services/audit-service';

function mapPrismaCategory(cat: any): AdminCategory {
  return {
    id: cat.id,
    slug: cat.slug,
    name: cat.name,
    description: cat.description,
    coverImage: cat.coverImage?.optimizedUrl || cat.coverImage?.originalUrl || '',
    coverImageId: cat.coverImageId,
    theme: cat.theme as any,
    layoutType: cat.layoutType as any,
    animationPreset: cat.animationPreset as any,
    displayOrder: cat.displayOrder,
    isFeatured: cat.isFeatured,
    isVisible: cat.isVisible,
    accentColor: cat.accentColor || '',
    status: cat.status === 'PUBLISHED' ? 'published' : cat.status === 'HIDDEN' ? 'hidden' : 'draft',
    productCount: cat._count?.products || 0,
    createdAt: cat.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: cat.updatedAt?.toISOString() || new Date().toISOString(),
    publishedAt: cat.publishedAt?.toISOString() || undefined,
    deletedAt: cat.deletedAt?.toISOString() || undefined,
  };
}

export const PrismaCategoryRepository = {
  getCategories: async (): Promise<AdminCategory[]> => {
    try {
      const categories = await prisma.category.findMany({
        orderBy: { displayOrder: 'asc' },
        include: {
          coverImage: true,
          _count: {
            select: { products: true },
          },
        },
      });
      return categories.map(mapPrismaCategory);
    } catch (error: any) {
      throw new RepositoryError('Failed to fetch categories', error);
    }
  },

  getCategory: async (id: string): Promise<AdminCategory | null> => {
    try {
      const category = await prisma.category.findUnique({
        where: { id },
        include: {
          coverImage: true,
          _count: {
            select: { products: true },
          },
        },
      });
      if (!category) return null;
      return mapPrismaCategory(category);
    } catch (error: any) {
      throw new RepositoryError('Failed to fetch category', error);
    }
  },

  createCategory: async (data: Partial<AdminCategory>): Promise<AdminCategory> => {
    try {
      // Find max displayOrder
      const maxOrderCat = await prisma.category.findFirst({
        orderBy: { displayOrder: 'desc' },
      });
      const nextOrder = maxOrderCat ? maxOrderCat.displayOrder + 1 : 0;

      const created = await prisma.category.create({
        data: {
          name: data.name || 'New Category',
          slug: data.slug || `new-category-${Date.now()}`,
          description: data.description || '',
          coverImageId: data.coverImageId === '' ? null : data.coverImageId || null,
          theme: data.theme || 'classic',
          layoutType: data.layoutType || 'editorial-grid',
          animationPreset: data.animationPreset || 'fade-up',
          displayOrder: nextOrder,
          isFeatured: data.isFeatured || false,
          isVisible: data.isVisible !== false,
          accentColor: data.accentColor === undefined ? null : data.accentColor,
          status:
            data.status === 'published'
              ? 'PUBLISHED'
              : data.status === 'hidden'
                ? 'HIDDEN'
                : 'DRAFT',
        },
        include: {
          coverImage: true,
          _count: { select: { products: true } },
        },
      });

      // Synchronize with Homepage Featured Categories
      if (data.isFeatured) {
        const hp = await prisma.homepage.findFirst();
        if (hp) {
          const maxHpOrder = await prisma.homepageFeaturedCategory.findFirst({
            where: { homepageId: hp.id },
            orderBy: { displayOrder: 'desc' },
          });
          await prisma.homepageFeaturedCategory.upsert({
            where: {
              homepageId_categoryId: {
                homepageId: hp.id,
                categoryId: created.id,
              },
            },
            create: {
              homepageId: hp.id,
              categoryId: created.id,
              displayOrder: (maxHpOrder?.displayOrder ?? -1) + 1,
            },
            update: {},
          });
        }
      }

      const result = mapPrismaCategory(created);
      await AuditService.logAction('system', 'CREATE', 'CATEGORY', result.id, null, result);
      return result;
    } catch (error: any) {
      throw new RepositoryError('Failed to create category', error);
    }
  },

  updateCategory: async (id: string, data: Partial<AdminCategory>): Promise<AdminCategory> => {
    try {
      const current = await PrismaCategoryRepository.getCategory(id);
      if (!current) throw new NotFoundError(`Category ${id} not found`);

      const updateData: any = {
        name: data.name,
        slug: data.slug,
        description: data.description,
        coverImageId: data.coverImageId === '' ? null : data.coverImageId,
        theme: data.theme,
        layoutType: data.layoutType,
        animationPreset: data.animationPreset,
        displayOrder: data.displayOrder,
        isFeatured: data.isFeatured,
        isVisible: data.isVisible,
        accentColor: data.accentColor,
        status:
          data.status === 'published'
            ? 'PUBLISHED'
            : data.status === 'hidden'
              ? 'HIDDEN'
              : data.status === 'draft'
                ? 'DRAFT'
                : undefined,
      };

      Object.keys(updateData).forEach(
        (key) => updateData[key] === undefined && delete updateData[key],
      );

      const updated = await prisma.category.update({
        where: { id },
        data: updateData,
        include: {
          coverImage: true,
          _count: { select: { products: true } },
        },
      });

      // Synchronize with Homepage Featured Categories
      if (data.isFeatured !== undefined) {
        const hp = await prisma.homepage.findFirst();
        if (hp) {
          if (data.isFeatured) {
            const maxHpOrder = await prisma.homepageFeaturedCategory.findFirst({
              where: { homepageId: hp.id },
              orderBy: { displayOrder: 'desc' },
            });
            await prisma.homepageFeaturedCategory.upsert({
              where: {
                homepageId_categoryId: {
                  homepageId: hp.id,
                  categoryId: id,
                },
              },
              create: {
                homepageId: hp.id,
                categoryId: id,
                displayOrder: (maxHpOrder?.displayOrder ?? -1) + 1,
              },
              update: {},
            });
          } else {
            await prisma.homepageFeaturedCategory.deleteMany({
              where: {
                homepageId: hp.id,
                categoryId: id,
              },
            });
          }
        }
      }

      const result = mapPrismaCategory(updated);
      await AuditService.logAction('system', 'UPDATE', 'CATEGORY', result.id, current, result);
      return result;
    } catch (error: any) {
      throw new RepositoryError('Failed to update category', error);
    }
  },

  deleteCategory: async (id: string): Promise<void> => {
    try {
      const current = await prisma.category.findUnique({
        where: { id },
        include: { _count: { select: { products: true } } },
      });
      if (!current) throw new NotFoundError(`Category ${id} not found`);

      if (current._count.products > 0) {
        throw new Error(
          'This category contains products. Remove or move those products before deleting the category.',
        );
      }

      await prisma.category.delete({ where: { id } });
      await AuditService.logAction('system', 'DELETE', 'CATEGORY', id, current, null);
    } catch (error: any) {
      if (error instanceof NotFoundError || error.message.includes('contains products')) {
        throw error;
      }
      throw new RepositoryError('Failed to delete category', error);
    }
  },

  updateDisplayOrder: async (items: { id: string; displayOrder: number }[]): Promise<void> => {
    try {
      await prisma.$transaction(
        items.map((item) =>
          prisma.category.update({
            where: { id: item.id },
            data: { displayOrder: item.displayOrder },
          }),
        ),
      );
      await AuditService.logAction('system', 'REORDER', 'CATEGORY');
    } catch (error: any) {
      throw new RepositoryError('Failed to update display order', error);
    }
  },
};
