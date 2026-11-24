import fs from 'fs';
import path from 'path';
import {
  MaintenanceConfig,
  DEFAULT_MAINTENANCE_MESSAGE,
  DEFAULT_RETRY_AFTER_SECONDS,
} from '@qbm/config';
import { prisma } from '@qbm/database';

let cachedStatus: { config: MaintenanceConfig; expiresAt: number } | null = null;
const CACHE_TTL_MS = 2000;

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

function readLocalFileStatus(): MaintenanceConfig {
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

export async function getMaintenanceStatus(): Promise<MaintenanceConfig> {
  if (process.env.MAINTENANCE_MODE === 'true' || process.env.MAINTENANCE_MODE === '1') {
    return {
      enabled: true,
      activatedAt: null,
      deactivatedAt: null,
      activatedBy: 'Environment Variable (MAINTENANCE_MODE)',
      message: process.env.MAINTENANCE_MESSAGE || DEFAULT_MAINTENANCE_MESSAGE,
      retryAfter: DEFAULT_RETRY_AFTER_SECONDS,
    };
  }

  const now = Date.now();
  if (cachedStatus && now < cachedStatus.expiresAt) {
    return cachedStatus.config;
  }

  try {
    const record = await prisma.systemSetting.findUnique({
      where: { key: 'maintenance' },
    });

    if (record?.value) {
      const parsed = JSON.parse(record.value);
      const config: MaintenanceConfig = {
        enabled: Boolean(parsed.enabled),
        activatedAt: parsed.activatedAt || null,
        deactivatedAt: parsed.deactivatedAt || null,
        activatedBy: parsed.activatedBy || null,
        message: parsed.message || DEFAULT_MAINTENANCE_MESSAGE,
        retryAfter:
          typeof parsed.retryAfter === 'number' ? parsed.retryAfter : DEFAULT_RETRY_AFTER_SECONDS,
      };

      cachedStatus = { config, expiresAt: now + CACHE_TTL_MS };
      return config;
    }
  } catch (dbErr) {
    console.warn('[MaintenanceStore] Database query fallback:', dbErr);
  }

  const fileStatus = readLocalFileStatus();
  cachedStatus = { config: fileStatus, expiresAt: now + CACHE_TTL_MS };
  return fileStatus;
}

export function getMaintenanceStatusSync(): MaintenanceConfig {
  if (process.env.MAINTENANCE_MODE === 'true' || process.env.MAINTENANCE_MODE === '1') {
    return {
      enabled: true,
      message: process.env.MAINTENANCE_MESSAGE || DEFAULT_MAINTENANCE_MESSAGE,
      retryAfter: DEFAULT_RETRY_AFTER_SECONDS,
    };
  }

  if (cachedStatus && Date.now() < cachedStatus.expiresAt) {
    return cachedStatus.config;
  }

  return readLocalFileStatus();
}

export async function setMaintenanceStatus(
  input: Partial<MaintenanceConfig> & { enabled: boolean },
  actorEmail?: string,
): Promise<MaintenanceConfig> {
  const nowIso = new Date().toISOString();
  const current = await getMaintenanceStatus();

  const updated: MaintenanceConfig = {
    enabled: input.enabled,
    activatedAt: input.enabled ? current.activatedAt || nowIso : null,
    deactivatedAt: input.enabled ? null : nowIso,
    activatedBy: actorEmail || input.activatedBy || current.activatedBy || 'Administrator',
    message: input.message || current.message || DEFAULT_MAINTENANCE_MESSAGE,
    retryAfter: input.retryAfter || current.retryAfter || DEFAULT_RETRY_AFTER_SECONDS,
  };

  cachedStatus = { config: updated, expiresAt: Date.now() + CACHE_TTL_MS };

  try {
    const valueJson = JSON.stringify(updated);
    await prisma.systemSetting.upsert({
      where: { key: 'maintenance' },
      update: {
        value: valueJson,
        updatedAt: new Date(),
        updatedBy: updated.activatedBy ?? null,
      },
      create: {
        key: 'maintenance',
        value: valueJson,
        updatedAt: new Date(),
        updatedBy: updated.activatedBy ?? null,
      },
    });
  } catch (dbErr) {
    console.warn('[MaintenanceStore] Failed to update SystemSetting in DB:', dbErr);
  }

  try {
    const dirs = getCandidateDirectories();
    const jsonContent = JSON.stringify(updated, null, 2);

    for (const dir of dirs) {
      if (!fs.existsSync(dir)) continue;

      const jsonPath = path.join(dir, 'maintenance.json');
      fs.writeFileSync(jsonPath, jsonContent, 'utf-8');

      const flagPath = path.join(dir, 'maintenance.flag');
      if (updated.enabled) {
        fs.writeFileSync(flagPath, `${nowIso}\n${updated.activatedBy}\n`, 'utf-8');
      } else if (fs.existsSync(flagPath)) {
        fs.unlinkSync(flagPath);
      }
    }
  } catch {
    // Silently ignore serverless EROFS
  }

  return updated;
}
