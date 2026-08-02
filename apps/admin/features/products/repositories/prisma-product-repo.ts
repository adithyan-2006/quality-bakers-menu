import { AdminProduct } from './product-repo';
export const PrismaProductRepository = {
  getProducts: async (): Promise<AdminProduct[]> => {
    throw new Error('Not implemented in Prisma yet');
  },

  getProduct: async (_id: string): Promise<AdminProduct | null> => {
    throw new Error('Not implemented in Prisma yet');
  },

  createProduct: async (_data: Partial<AdminProduct>): Promise<AdminProduct> => {
    throw new Error('Not implemented in Prisma yet');
  },

  updateProduct: async (_id: string, _data: Partial<AdminProduct>): Promise<AdminProduct> => {
    throw new Error('Not implemented in Prisma yet');
  },

  duplicateProduct: async (_id: string): Promise<AdminProduct> => {
    throw new Error('Not implemented in Prisma yet');
  },

  updateDisplayOrder: async (_items: { id: string; displayOrder: number }[]): Promise<void> => {
    throw new Error('Not implemented in Prisma yet');
  },
};
