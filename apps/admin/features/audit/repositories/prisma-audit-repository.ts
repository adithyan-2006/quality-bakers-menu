import { AuditLogEntry } from './audit-repository';
import { prisma } from '@qbm/database';
import { RepositoryError } from '../../../lib/errors';

export const PrismaAuditRepository = {
  getLogs: async (limit: number = 50): Promise<AuditLogEntry[]> => {
    try {
      const logs = await prisma.auditLog.findMany({
        take: limit,
        orderBy: { timestamp: 'desc' },
      });

      return logs.map((log: any) => ({
        id: log.id,
        userId: log.userId || 'system',
        action: log.action,
        entity: log.entity,
        entityId: log.entityId,
        oldValue: log.oldValue ? JSON.stringify(log.oldValue) : undefined,
        newValue: log.newValue ? JSON.stringify(log.newValue) : undefined,
        timestamp: log.timestamp.toISOString(),
        ipAddress: log.ipAddress || undefined,
      }));
    } catch (error: any) {
      throw new RepositoryError('Failed to fetch audit logs', error);
    }
  },

  logAction: async (
    userId: string,
    action: string,
    entity: string,
    entityId?: string,
    oldValue?: any,
    newValue?: any,
  ): Promise<AuditLogEntry> => {
    try {
      const log = await prisma.auditLog.create({
        data: {
          userId: userId === 'system' ? null : userId,
          action,
          entity,
          entityId: entityId || 'unknown',
          oldValue: oldValue ? JSON.parse(JSON.stringify(oldValue)) : null,
          newValue: newValue ? JSON.parse(JSON.stringify(newValue)) : null,
        },
      });

      return {
        id: log.id,
        userId: log.userId || 'system',
        action: log.action,
        entity: log.entity,
        entityId: log.entityId,
        oldValue: log.oldValue ? JSON.stringify(log.oldValue) : undefined,
        newValue: log.newValue ? JSON.stringify(log.newValue) : undefined,
        timestamp: log.timestamp.toISOString(),
        ipAddress: log.ipAddress || undefined,
      };
    } catch (error: any) {
      throw new RepositoryError('Failed to create audit log', error);
    }
  },
};
