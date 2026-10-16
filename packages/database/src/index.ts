import { PrismaClient } from '@prisma/client';

function getOptimizedDatabaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL;
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    let changed = false;
    // For PgBouncer transaction mode pooler (port 6543)
    if (parsed.port === '6543' && !parsed.searchParams.has('pgbouncer')) {
      parsed.searchParams.set('pgbouncer', 'true');
      changed = true;
    }
    // Prevent connection exhaustion by capping pool limit
    if (!parsed.searchParams.has('connection_limit')) {
      parsed.searchParams.set('connection_limit', '10');
      changed = true;
    }
    // Extend connection pool timeout to 30s to prevent timeouts during cold start/compilation
    if (!parsed.searchParams.has('pool_timeout')) {
      parsed.searchParams.set('pool_timeout', '30');
      changed = true;
    }
    return changed ? parsed.toString() : url;
  } catch {
    return url;
  }
}

const prismaClientSingleton = () => {
  const optimizedUrl = getOptimizedDatabaseUrl();
  return new PrismaClient(
    optimizedUrl
      ? {
          datasources: {
            db: {
              url: optimizedUrl,
            },
          },
        }
      : undefined,
  );
};

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export * from '@prisma/client';
export { Prisma } from '@prisma/client';

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;
