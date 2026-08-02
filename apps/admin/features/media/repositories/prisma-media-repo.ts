import { AdminMedia } from './media-repo';
export const PrismaMediaRepository = {
  getMedia: async (): Promise<AdminMedia[]> => {
    throw new Error('Not implemented in Prisma yet');
  },

  getMediaById: async (_id: string): Promise<AdminMedia | null> => {
    throw new Error('Not implemented in Prisma yet');
  },

  updateMedia: async (_id: string, _data: Partial<AdminMedia>): Promise<AdminMedia> => {
    throw new Error('Not implemented in Prisma yet');
  },

  deleteMedia: async (_id: string): Promise<void> => {
    throw new Error('Not implemented in Prisma yet');
  },

  simulateUpload: async (_file: File): Promise<AdminMedia> => {
    throw new Error('Not implemented in Prisma yet');
  },
};
