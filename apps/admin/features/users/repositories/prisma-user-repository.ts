import { AdminUser } from './user-repository';
export const PrismaUserRepository = {
  getUsers: async (): Promise<AdminUser[]> => {
    throw new Error('Not implemented in Prisma yet');
  },

  getUserById: async (_id: string): Promise<AdminUser | null> => {
    throw new Error('Not implemented in Prisma yet');
  },

  getUserByEmail: async (_email: string): Promise<AdminUser | null> => {
    throw new Error('Not implemented in Prisma yet');
  },

  createUser: async (_data: Partial<AdminUser>): Promise<AdminUser> => {
    throw new Error('Not implemented in Prisma yet');
  },

  updateUser: async (_id: string, _data: Partial<AdminUser>): Promise<AdminUser> => {
    throw new Error('Not implemented in Prisma yet');
  },

  softDeleteUser: async (_id: string): Promise<void> => {
    throw new Error('Not implemented in Prisma yet');
  },
};
