import { AdminMedia } from './media-repo';
import { prisma } from '@qbm/database';
import { RepositoryError, NotFoundError } from '../../../lib/errors';
import { AuditService } from '../../audit/services/audit-service';

function mapPrismaMedia(media: any): AdminMedia {
  return {
    id: media.id,
    fileName: media.fileName,
    displayName: media.fileName.split('.')[0] || 'Image',
    altText: media.altText || '',
    type: 'image',
    imageUrl: media.optimizedUrl || media.originalUrl || '',
    thumbnailUrl: media.optimizedUrl || media.originalUrl || '',
    size: media.sizeBytes || 0,
    width: media.width || 800,
    height: media.height || 600,
    isUsed: false,
    usedBy: [],
    tags: media.tags || [],
    status: 'ready',
    uploadedAt: media.uploadedAt?.toISOString() || new Date().toISOString(),
    updatedAt: media.updatedAt?.toISOString() || new Date().toISOString(),
  };
}

export const PrismaMediaRepository = {
  getMedia: async (options?: { folder?: string; search?: string }): Promise<AdminMedia[]> => {
    try {
      const where: any = {};
      if (options?.search) {
        where.fileName = { contains: options.search, mode: 'insensitive' };
      }

      const media = await prisma.media.findMany({
        where,
        orderBy: { uploadedAt: 'desc' },
      });
      return media.map(mapPrismaMedia);
    } catch (error: any) {
      throw new RepositoryError('Failed to fetch media', error);
    }
  },

  getMediaById: async (id: string): Promise<AdminMedia | null> => {
    try {
      const media = await prisma.media.findUnique({ where: { id } });
      if (!media) return null;
      return mapPrismaMedia(media);
    } catch (error: any) {
      throw new RepositoryError('Failed to fetch media', error);
    }
  },

  updateMedia: async (id: string, data: Partial<AdminMedia>): Promise<AdminMedia> => {
    try {
      const current = await PrismaMediaRepository.getMediaById(id);
      if (!current) throw new NotFoundError(`Media ${id} not found`);

      const updateData: any = {
        altText: data.altText,
      };
      if (updateData.altText === undefined) {
        delete updateData.altText;
      }

      const updated = await prisma.media.update({
        where: { id },
        data: updateData,
      });
      const result = mapPrismaMedia(updated);
      await AuditService.logAction('system', 'UPDATE', 'MEDIA', result.id, current, result);
      return result;
    } catch (error: any) {
      throw new RepositoryError('Failed to update media', error);
    }
  },

  deleteMedia: async (id: string): Promise<void> => {
    try {
      const current = await PrismaMediaRepository.getMediaById(id);
      if (!current) throw new NotFoundError(`Media ${id} not found`);

      await prisma.media.delete({ where: { id } });
      await AuditService.logAction('system', 'DELETE', 'MEDIA', id, current, null);
    } catch (error: any) {
      throw new RepositoryError('Failed to delete media', error);
    }
  },

  simulateUpload: async (file: File): Promise<AdminMedia> => {
    try {
      const id = `media_${Date.now()}`;
      const url =
        'https://images.unsplash.com/photo-1495147466023-e6a463722526?w=1600&h=1200&fit=crop'; // Hardcoded mock url for SSR

      const created = await prisma.media.create({
        data: {
          id,
          publicId: `mock_${id}`,
          fileName: file.name,
          originalUrl: url,
          optimizedUrl: url,
          sizeBytes: file.size,
          format: file.type.split('/')[1] || 'jpeg',
        },
      });

      const result = mapPrismaMedia(created);
      await AuditService.logAction('system', 'CREATE', 'MEDIA', result.id, null, result);
      return result;
    } catch (error: any) {
      throw new RepositoryError('Failed to upload media', error);
    }
  },
};
