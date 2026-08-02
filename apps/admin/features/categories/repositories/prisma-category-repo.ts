import { AdminCategory } from './category-repo';
export const PrismaCategoryRepository = {
  getCategories: async (): Promise<AdminCategory[]> => {
    // This will be implemented fully in Sprint 4.1
    throw new Error('Not implemented in Prisma yet');
  },

  getCategory: async (_id: string): Promise<AdminCategory | null> => {
    throw new Error('Not implemented in Prisma yet');
  },

  createCategory: async (_data: Partial<AdminCategory>): Promise<AdminCategory> => {
    throw new Error('Not implemented in Prisma yet');
  },

  updateCategory: async (_id: string, _data: Partial<AdminCategory>): Promise<AdminCategory> => {
    throw new Error('Not implemented in Prisma yet');
  },

  updateDisplayOrder: async (_items: { id: string; displayOrder: number }[]): Promise<void> => {
    throw new Error('Not implemented in Prisma yet');
  },
};
