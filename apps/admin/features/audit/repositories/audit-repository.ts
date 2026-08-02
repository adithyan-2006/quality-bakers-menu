export interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId?: string | undefined;
  oldValue?: string | undefined;
  newValue?: string | undefined;
  timestamp: string;
  ipAddress?: string | undefined;
}

const mockAuditLogs: AuditLogEntry[] = [];

export const AuditRepository = {
  logAction: async (
    userId: string,
    action: string,
    entity: string,
    entityId?: string,
    oldValue?: any,
    newValue?: any,
  ): Promise<AuditLogEntry> => {
    const entry: AuditLogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      userId,
      action,
      entity,
      entityId,
      oldValue: oldValue ? JSON.stringify(oldValue) : undefined,
      newValue: newValue ? JSON.stringify(newValue) : undefined,
      timestamp: new Date().toISOString(),
    };

    mockAuditLogs.unshift(entry);
    console.log(`[AUDIT] ${action} on ${entity} by user ${userId}`);

    return entry;
  },

  getLogs: async (limit: number = 50): Promise<AuditLogEntry[]> => {
    return mockAuditLogs.slice(0, limit);
  },
};
