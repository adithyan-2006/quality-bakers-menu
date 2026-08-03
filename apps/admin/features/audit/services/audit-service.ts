import { RepositoryFactory } from '../../../lib/repository-factory';

export class AuditService {
  static async logAction(
    userId: string,
    action: string,
    entity: string,
    entityId?: string,
    oldValue?: any,
    newValue?: any,
  ) {
    try {
      const repo = RepositoryFactory.getAuditRepository();
      await repo.logAction(userId, action, entity, entityId, oldValue, newValue);
    } catch (error) {
      console.error('[AuditService] Failed to log action:', error);
      // We do not throw here to prevent audit logging failures from breaking the main transaction
    }
  }
}
