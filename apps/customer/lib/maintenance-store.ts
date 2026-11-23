import fs from 'fs';
import path from 'path';
import {
  MaintenanceConfig,
  DEFAULT_MAINTENANCE_MESSAGE,
  DEFAULT_RETRY_AFTER_SECONDS,
} from '@qbm/config';

function getCandidateDirectories(): string[] {
  const dirs = new Set<string>();
  const cwd = process.cwd();
  dirs.add(cwd);

  const root = path.resolve(cwd, '..', '..');
  dirs.add(root);

  const customerDir = path.resolve(root, 'apps', 'customer');
  dirs.add(customerDir);

  const adminDir = path.resolve(root, 'apps', 'admin');
  dirs.add(adminDir);

  return Array.from(dirs);
}

export function getMaintenanceStatus(): MaintenanceConfig {
  const dirs = getCandidateDirectories();

  if (process.env.MAINTENANCE_FLAG_PATH && fs.existsSync(process.env.MAINTENANCE_FLAG_PATH)) {
    try {
      const data = fs.readFileSync(process.env.MAINTENANCE_FLAG_PATH, 'utf-8');
      const parsed = JSON.parse(data);
      return {
        enabled: Boolean(parsed.enabled),
        activatedAt: parsed.activatedAt || null,
        deactivatedAt: parsed.deactivatedAt || null,
        activatedBy: parsed.activatedBy || null,
        message: parsed.message || DEFAULT_MAINTENANCE_MESSAGE,
        retryAfter: parsed.retryAfter || DEFAULT_RETRY_AFTER_SECONDS,
      };
    } catch {
      // Fallback
    }
  }

  for (const dir of dirs) {
    const jsonPath = path.join(dir, 'maintenance.json');
    if (fs.existsSync(jsonPath)) {
      try {
        const raw = fs.readFileSync(jsonPath, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          enabled: Boolean(parsed.enabled),
          activatedAt: parsed.activatedAt || null,
          deactivatedAt: parsed.deactivatedAt || null,
          activatedBy: parsed.activatedBy || null,
          message: parsed.message || DEFAULT_MAINTENANCE_MESSAGE,
          retryAfter: parsed.retryAfter || DEFAULT_RETRY_AFTER_SECONDS,
        };
      } catch (err) {
        console.warn(`[MaintenanceStore] Failed to read ${jsonPath}:`, err);
      }
    }
  }

  for (const dir of dirs) {
    const flagPath = path.join(dir, 'maintenance.flag');
    if (fs.existsSync(flagPath)) {
      return {
        enabled: true,
        activatedAt: new Date().toISOString(),
        message: DEFAULT_MAINTENANCE_MESSAGE,
        retryAfter: DEFAULT_RETRY_AFTER_SECONDS,
      };
    }
  }

  return {
    enabled: false,
    message: DEFAULT_MAINTENANCE_MESSAGE,
    retryAfter: DEFAULT_RETRY_AFTER_SECONDS,
  };
}

export function setMaintenanceStatus(
  input: Partial<MaintenanceConfig> & { enabled: boolean },
  actorEmail?: string,
): MaintenanceConfig {
  const now = new Date().toISOString();
  const current = getMaintenanceStatus();

  const updated: MaintenanceConfig = {
    enabled: input.enabled,
    activatedAt: input.enabled ? current.activatedAt || now : null,
    deactivatedAt: input.enabled ? null : now,
    activatedBy: actorEmail || input.activatedBy || current.activatedBy || 'Administrator',
    message: input.message || current.message || DEFAULT_MAINTENANCE_MESSAGE,
    retryAfter: input.retryAfter || current.retryAfter || DEFAULT_RETRY_AFTER_SECONDS,
  };

  const dirs = getCandidateDirectories();
  const jsonContent = JSON.stringify(updated, null, 2);

  for (const dir of dirs) {
    try {
      if (!fs.existsSync(dir)) continue;

      const jsonPath = path.join(dir, 'maintenance.json');
      fs.writeFileSync(jsonPath, jsonContent, 'utf-8');

      const flagPath = path.join(dir, 'maintenance.flag');
      if (updated.enabled) {
        fs.writeFileSync(flagPath, `${now}\n${updated.activatedBy}\n`, 'utf-8');
      } else if (fs.existsSync(flagPath)) {
        fs.unlinkSync(flagPath);
      }
    } catch (err) {
      console.warn(`[MaintenanceStore] Error persisting flag in ${dir}:`, err);
    }
  }

  return updated;
}
