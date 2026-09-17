import { AdminProduct } from './product-repo';
import { prisma } from '@qbm/database';
import { RepositoryError, NotFoundError } from '../../../lib/errors';
import { AuditService } from '../../audit/services/audit-service';

function mapPrismaProduct(prod: any): AdminProduct {
  return {
    id: prod.id,
    slug: prod.slug,
    name: prod.name,
    shortDescription: prod.shortDescription,
    longDescription: prod.longDescription || '',
    price: prod.price,
    categoryId: prod.categoryId,
    image: prod.image?.optimizedUrl || prod.image?.originalUrl || '',
    imageId: prod.imageId || undefined,
    galleryIds: prod.gallery?.map((g: any) => g.mediaId) || [],
    galleryImages:
      prod.gallery?.map((g: any) => g.media?.optimizedUrl || g.media?.originalUrl || '') || [],
    badge: (prod.badge === 'NONE'
      ? 'none'
      : prod.badge === 'SIGNATURE'
        ? 'signature'
        : prod.badge === 'BEST_SELLER'
          ? 'best-seller'
          : prod.badge === 'NEW'
            ? 'new'
            : prod.badge === 'SEASONAL'
              ? 'seasonal'
              : 'chefs-choice') as any,
    isFeatured: prod.isFeatured,
    isSignature: prod.isSignature,
    signatureOrder: prod.signatureOrder,
    isVisible: prod.isVisible,
    availabilityStatus:
      prod.availabilityStatus === 'AVAILABLE'
        ? 'available'
        : prod.availabilityStatus === 'OUT_OF_STOCK'
          ? 'out-of-stock'
          : 'seasonal',
    status:
      prod.status === 'PUBLISHED' ? 'published' : prod.status === 'HIDDEN' ? 'hidden' : 'draft',
    displayOrder: prod.displayOrder,
    createdAt: prod.createdAt.toISOString(),
    updatedAt: prod.updatedAt.toISOString(),
    publishedAt: prod.publishedAt?.toISOString(),
    deletedAt: prod.deletedAt?.toISOString(),
  };
}

export const PrismaProductRepository = {
  getProducts: async (options?: {
    search?: string;
    categoryId?: string;
    page?: number;
    limit?: number;
  }): Promise<AdminProduct[]> => {
    try {
      const page = options?.page ?? 1;
      const limit = options?.limit ?? 50;
      const skip = (page - 1) * limit;

      const where: any = {};
      if (options?.search) {
        where.name = { contains: options.search, mode: 'insensitive' };
      }
      if (options?.categoryId) {
        where.categoryId = options.categoryId;
      }

      const products = await prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { displayOrder: 'asc' },
        include: {
          image: true,
          gallery: { include: { media: true }, orderBy: { displayOrder: 'asc' } },
        },
      });
      return products.map(mapPrismaProduct);
    } catch (error: any) {
      throw new RepositoryError('Failed to fetch products', error);
    }
  },

  getProduct: async (id: string): Promise<AdminProduct | null> => {
    try {
      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          image: true,
          gallery: { include: { media: true }, orderBy: { displayOrder: 'asc' } },
        },
      });
      if (!product) return null;
      return mapPrismaProduct(product);
    } catch (error: any) {
      throw new RepositoryError('Failed to fetch product', error);
    }
  },

  createProduct: async (data: Partial<AdminProduct>): Promise<AdminProduct> => {
    try {
      const maxOrderProd = await prisma.product.findFirst({
        orderBy: { displayOrder: 'desc' },
      });
      const nextOrder = maxOrderProd ? maxOrderProd.displayOrder + 1 : 0;

      const created = await prisma.product.create({
        data: {
          name: data.name || 'New Product',
          slug: data.slug || `new-product-${Date.now()}`,
          shortDescription: data.shortDescription || '',
          longDescription: data.longDescription || '',
          price: data.price || 0,
          categoryId: data.categoryId || '',
          imageId: data.imageId || null,
          ...(data.galleryIds?.length
            ? {
                gallery: {
                  create: data.galleryIds.map((id, index) => ({
                    mediaId: id,
                    displayOrder: index,
                  })),
                },
              }
            : {}),
          badge:
            data.badge === 'signature'
              ? 'SIGNATURE'
              : data.badge === 'best-seller'
                ? 'BEST_SELLER'
                : data.badge === 'new'
                  ? 'NEW'
                  : data.badge === 'seasonal'
                    ? 'SEASONAL'
                    : data.badge === 'chefs-choice'
                      ? 'CHEFS_CHOICE'
                      : 'NONE',
          isFeatured: data.isFeatured || false,
          isSignature: data.isSignature || false,
          signatureOrder: data.signatureOrder || null,
          isVisible: data.isVisible !== false,
          availabilityStatus:
            data.availabilityStatus === 'out-of-stock'
              ? 'OUT_OF_STOCK'
              : data.availabilityStatus === 'seasonal'
                ? 'SEASONAL'
                : 'AVAILABLE',
          status:
            data.status === 'published'
              ? 'PUBLISHED'
              : data.status === 'hidden'
                ? 'HIDDEN'
                : 'DRAFT',
          displayOrder: data.displayOrder ?? nextOrder,
        },
        include: {
          image: true,
          gallery: { include: { media: true }, orderBy: { displayOrder: 'asc' } },
        },
      });
      const result = mapPrismaProduct(created);
      await AuditService.logAction('system', 'CREATE', 'PRODUCT', result.id, null, result);
      return result;
    } catch (error: any) {
      throw new RepositoryError('Failed to create product', error);
    }
  },

  updateProduct: async (id: string, data: Partial<AdminProduct>): Promise<AdminProduct> => {
    try {
      const current = await PrismaProductRepository.getProduct(id);
      if (!current) throw new NotFoundError(`Product ${id} not found`);

      const updateData: any = {
        name: data.name,
        slug: data.slug,
        shortDescription: data.shortDescription,
        longDescription: data.longDescription,
        price: data.price,
        categoryId: data.categoryId === '' ? undefined : data.categoryId,
        imageId: data.imageId === '' ? null : data.imageId,
        badge:
          data.badge === 'signature'
            ? 'SIGNATURE'
            : data.badge === 'best-seller'
              ? 'BEST_SELLER'
              : data.badge === 'new'
                ? 'NEW'
                : data.badge === 'seasonal'
                  ? 'SEASONAL'
                  : data.badge === 'chefs-choice'
                    ? 'CHEFS_CHOICE'
                    : data.badge
                      ? 'NONE'
                      : undefined,
        isFeatured: data.isFeatured,
        isSignature: data.isSignature,
        signatureOrder: data.signatureOrder,
        isVisible: data.isVisible,
        availabilityStatus:
          data.availabilityStatus === 'out-of-stock'
            ? 'OUT_OF_STOCK'
            : data.availabilityStatus === 'seasonal'
              ? 'SEASONAL'
              : data.availabilityStatus
                ? 'AVAILABLE'
                : undefined,
        status:
          data.status === 'published'
            ? 'PUBLISHED'
            : data.status === 'hidden'
              ? 'HIDDEN'
              : data.status
                ? 'DRAFT'
                : undefined,
        displayOrder: data.displayOrder,
      };

      Object.keys(updateData).forEach(
        (key) => updateData[key] === undefined && delete updateData[key],
      );

      // Handle gallery updates
      if (data.galleryIds !== undefined) {
        updateData.gallery = {
          deleteMany: {},
          create: data.galleryIds.map((id, index) => ({ mediaId: id, displayOrder: index })),
        };
      }

      const updated = await prisma.product.update({
        where: { id },
        data: updateData,
        include: {
          image: true,
          gallery: { include: { media: true }, orderBy: { displayOrder: 'asc' } },
        },
      });
      const result = mapPrismaProduct(updated);
      await AuditService.logAction('system', 'UPDATE', 'PRODUCT', result.id, current, result);
      return result;
    } catch (error: any) {
      throw new RepositoryError('Failed to update product', error);
    }
  },

  duplicateProduct: async (id: string): Promise<AdminProduct> => {
    try {
      const source = await prisma.product.findUnique({ where: { id }, include: { gallery: true } });
      if (!source) throw new NotFoundError(`Product ${id} not found`);

      const newName = `${source.name} (Copy)`;
      const newSlug = `${source.slug}-copy-${Date.now()}`;

      const maxOrderProd = await prisma.product.findFirst({
        orderBy: { displayOrder: 'desc' },
      });
      const nextOrder = maxOrderProd ? maxOrderProd.displayOrder + 1 : 0;

      const duplicated = await prisma.$transaction(async (tx: any) => {
        return tx.product.create({
          data: {
            name: newName,
            slug: newSlug,
            shortDescription: source.shortDescription,
            longDescription: source.longDescription,
            price: source.price,
            categoryId: source.categoryId,
            imageId: source.imageId,
            badge: source.badge,
            isFeatured: source.isFeatured,
            isSignature: source.isSignature,
            signatureOrder: source.signatureOrder,
            isVisible: source.isVisible,
            availabilityStatus: source.availabilityStatus,
            status: 'DRAFT', // duplicated is always draft
            displayOrder: nextOrder,
            ...(source.gallery?.length
              ? {
                  gallery: {
                    create: source.gallery.map((g) => ({
                      mediaId: g.mediaId,
                      displayOrder: g.displayOrder,
                    })),
                  },
                }
              : {}),
          },
          include: {
            image: true,
            gallery: { include: { media: true }, orderBy: { displayOrder: 'asc' } },
          },
        });
      });

      const result = mapPrismaProduct(duplicated);
      await AuditService.logAction('system', 'DUPLICATE', 'PRODUCT', result.id, null, result);
      return result;
    } catch (error: any) {
      throw new RepositoryError('Failed to duplicate product', error);
    }
  },

  updateDisplayOrder: async (items: { id: string; displayOrder: number }[]): Promise<void> => {
    try {
      await prisma.$transaction(
        items.map((item) =>
          prisma.product.update({
            where: { id: item.id },
            data: { displayOrder: item.displayOrder },
          }),
        ),
      );
      await AuditService.logAction('system', 'REORDER', 'PRODUCT');
    } catch (error: any) {
      throw new RepositoryError('Failed to update product display order', error);
    }
  },
  deleteProduct: async (id: string): Promise<void> => {
    try {
      const current = await PrismaProductRepository.getProduct(id);
      if (!current) throw new NotFoundError(`Product ${id} not found`);

      await prisma.product.delete({ where: { id } });
      await AuditService.logAction('system', 'DELETE', 'PRODUCT', id, current, null);
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      throw new RepositoryError('Failed to delete product', error);
    }
  },
};
