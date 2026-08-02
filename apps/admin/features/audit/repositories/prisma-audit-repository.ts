import { AuditLogEntry } from './audit-repository';
export const PrismaAuditRepository = {
  getLogs: async (): Promise<AuditLogEntry[]> => {
    throw new Error('Not implemented in Prisma yet');
  },

  logAction: async (
    _userId: string,
    _action: string,
    _entityType: string,
    _entityId: string,
    _details?: string,
  ): Promise<AuditLogEntry> => {
    throw new Error('Not implemented in Prisma yet');
  },
};
