import { AdminHomepage } from './homepage-repo';
export const PrismaHomepageRepository = {
  getHomepage: async (): Promise<AdminHomepage> => {
    throw new Error('Not implemented in Prisma yet');
  },

  updateHomepage: async (_data: Partial<AdminHomepage>): Promise<AdminHomepage> => {
    throw new Error('Not implemented in Prisma yet');
  },
};
