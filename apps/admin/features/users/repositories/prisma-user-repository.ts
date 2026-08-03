import { AdminUser } from './user-repository';
import { prisma } from '@qbm/database';
import { RepositoryError, NotFoundError } from '../../../lib/errors';
import { AuditService } from '../../audit/services/audit-service';

function mapPrismaUser(user: any): AdminUser {
  return {
    id: user.id,
    name: user.name || '',
    email: user.email,
    avatar: user.image || '',
    role: user.role === 'OWNER' ? 'Owner' : user.role === 'MANAGER' ? 'Manager' : 'Staff',
    status:
      user.status === 'ACTIVE' ? 'Active' : user.status === 'INACTIVE' ? 'Inactive' : 'Disabled',
    phone: user.phone || '',
    lastLogin: user.lastLogin?.toISOString() || null,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
    deletedAt: user.deletedAt?.toISOString() || null,
  };
}

export const PrismaUserRepository = {
  getUsers: async (): Promise<AdminUser[]> => {
    try {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
      });
      return users.map(mapPrismaUser);
    } catch (error: any) {
      throw new RepositoryError('Failed to fetch users', error);
    }
  },

  getUserById: async (id: string): Promise<AdminUser | null> => {
    try {
      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) return null;
      return mapPrismaUser(user);
    } catch (error: any) {
      throw new RepositoryError('Failed to fetch user', error);
    }
  },

  getUserByEmail: async (email: string): Promise<AdminUser | null> => {
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) return null;
      return mapPrismaUser(user);
    } catch (error: any) {
      throw new RepositoryError('Failed to fetch user by email', error);
    }
  },

  createUser: async (data: Partial<AdminUser>): Promise<AdminUser> => {
    try {
      const created = await prisma.user.create({
        data: {
          name: data.name || 'New User',
          email: data.email || `user-${Date.now()}@qualitybakers.com`,
          image: data.avatar || null,
          role: data.role === 'Owner' ? 'OWNER' : data.role === 'Manager' ? 'MANAGER' : 'STAFF',
          status:
            data.status === 'Active'
              ? 'ACTIVE'
              : data.status === 'Inactive'
                ? 'INACTIVE'
                : data.status === 'Disabled'
                  ? 'DISABLED'
                  : 'ACTIVE',
          phone: data.phone || null,
        },
      });
      const result = mapPrismaUser(created);
      await AuditService.logAction('system', 'CREATE', 'USER', result.id, null, result);
      return result;
    } catch (error: any) {
      throw new RepositoryError('Failed to create user', error);
    }
  },

  updateUser: async (id: string, data: Partial<AdminUser>): Promise<AdminUser> => {
    try {
      const current = await PrismaUserRepository.getUserById(id);
      if (!current) throw new NotFoundError(`User ${id} not found`);

      const updateData: any = {
        name: data.name,
        email: data.email,
        image: data.avatar,
        role:
          data.role === 'Owner'
            ? 'OWNER'
            : data.role === 'Manager'
              ? 'MANAGER'
              : data.role === 'Staff'
                ? 'STAFF'
                : undefined,
        status:
          data.status === 'Active'
            ? 'ACTIVE'
            : data.status === 'Inactive'
              ? 'INACTIVE'
              : data.status === 'Disabled'
                ? 'DISABLED'
                : undefined,
        phone: data.phone,
      };
      Object.keys(updateData).forEach(
        (key) => updateData[key] === undefined && delete updateData[key],
      );

      const updated = await prisma.user.update({
        where: { id },
        data: updateData,
      });
      const result = mapPrismaUser(updated);
      await AuditService.logAction('system', 'UPDATE', 'USER', result.id, current, result);
      return result;
    } catch (error: any) {
      throw new RepositoryError('Failed to update user', error);
    }
  },

  softDeleteUser: async (id: string): Promise<void> => {
    try {
      const current = await PrismaUserRepository.getUserById(id);
      if (!current) throw new NotFoundError(`User ${id} not found`);

      await prisma.user.update({
        where: { id },
        data: {
          status: 'INACTIVE',
          deletedAt: new Date(),
        },
      });
      await AuditService.logAction('system', 'SOFT_DELETE', 'USER', id, current, {
        status: 'inactive',
      });
    } catch (error: any) {
      throw new RepositoryError('Failed to soft delete user', error);
    }
  },
};
