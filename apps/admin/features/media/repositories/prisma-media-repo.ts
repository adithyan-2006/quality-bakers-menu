import { AdminMedia } from './media-repo';
import { prisma } from '@qbm/database';
import { RepositoryError, NotFoundError, ValidationError } from '../../../lib/errors';
import { AuditService } from '../../audit/services/audit-service';
import { Buffer } from 'buffer';

// Helper to get cloudinary dynamically and hide it from webpack static analysis in client bundles
function getCloudinary() {
  if (typeof window !== 'undefined') {
    throw new Error('Cloudinary cannot be used on the client');
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const cloudinary = require('cloudi' + 'nary').v2;
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  return cloudinary;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

function mapPrismaMedia(media: any): AdminMedia {
  return {
    id: media.id,
    fileName: media.fileName,
    displayName: media.fileName.split('.')[0] || 'Image',
    altText: media.altText || '',
    type: 'image',
    imageUrl: media.optimizedUrl || media.originalUrl || '',
    thumbnailUrl: media.thumbnailUrl || media.optimizedUrl || media.originalUrl || '',
    secureUrl: media.secureUrl,
    resourceType: media.resourceType,
    version: media.version,
    size: media.sizeBytes || 0,
    width: media.width || 800,
    height: media.height || 600,
    isUsed: media.isUsed || false,
    usedBy: [],
    tags: media.tags || [],
    status: media.status === 'READY' ? 'ready' : media.status === 'ERROR' ? 'error' : 'processing',
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
      const current = await prisma.media.findUnique({ where: { id } });
      if (!current) throw new NotFoundError(`Media ${id} not found`);

      // Delete from Cloudinary if it's a real Cloudinary asset
      if (current.publicId && !current.publicId.startsWith('mock_')) {
        const cloudinary = getCloudinary();
        await cloudinary.uploader.destroy(current.publicId);
      }

      await prisma.media.delete({ where: { id } });
      await AuditService.logAction('system', 'DELETE', 'MEDIA', id, current, null);
    } catch (error: any) {
      if (error instanceof NotFoundError) throw error;
      throw new RepositoryError('Failed to delete media', error);
    }
  },

  uploadMedia: async (
    file: File,
    folder: string = 'quality-bakers/general',
  ): Promise<AdminMedia> => {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      throw new ValidationError(`Unsupported file format: ${file.type}`);
    }

    if (file.size > MAX_FILE_SIZE) {
      throw new ValidationError(`File is too large (max 10MB)`);
    }

    let uploadResult: any;
    try {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const cloudinary = getCloudinary();
      uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            fetch_format: 'auto',
            quality: 'auto',
          },
          (error: any, result: any) => {
            if (error) return reject(error);
            resolve(result);
          },
        );
        uploadStream.end(buffer);
      });
    } catch (error: any) {
      throw new RepositoryError('Failed to upload media to Cloudinary', error);
    }

    try {
      const id = `media_${Date.now()}`;

      const created = await prisma.media.create({
        data: {
          id,
          publicId: uploadResult.public_id,
          fileName: file.name,
          originalUrl: uploadResult.url,
          optimizedUrl: uploadResult.secure_url,
          secureUrl: uploadResult.secure_url,
          thumbnailUrl: uploadResult.secure_url.replace('/upload/', '/upload/w_400,h_400,c_fill/'),
          resourceType: uploadResult.resource_type,
          version: uploadResult.version,
          width: uploadResult.width,
          height: uploadResult.height,
          sizeBytes: uploadResult.bytes,
          format: uploadResult.format,
          status: 'READY',
        },
      });

      const result = mapPrismaMedia(created);
      await AuditService.logAction('system', 'CREATE', 'MEDIA', result.id, null, result);
      return result;
    } catch (error: any) {
      // Rollback Cloudinary upload if Prisma persistence fails
      if (uploadResult?.public_id) {
        const cloudinary = getCloudinary();
        await cloudinary.uploader.destroy(uploadResult.public_id).catch(() => {});
      }
      throw new RepositoryError('Failed to save media record to database', error);
    }
  },
};
