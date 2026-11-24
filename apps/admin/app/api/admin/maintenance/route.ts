import { NextRequest, NextResponse } from 'next/server';
import { requireAdminUser } from '@/lib/auth';
import { AuthenticationError, AuthorizationError } from '@/lib/errors';
import { getMaintenanceStatus, setMaintenanceStatus } from '@/lib/maintenance-store';
import { revalidateCustomerApp } from '@/lib/revalidate-customer';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/maintenance
 * Returns current maintenance mode state.
 * Accessible to any authenticated administrator.
 */
export async function GET() {
  try {
    await requireAdminUser();
    const status = await getMaintenanceStatus();
    return NextResponse.json(status);
  } catch (err) {
    if (err instanceof AuthenticationError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    console.error('[API /api/admin/maintenance] GET Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * POST /api/admin/maintenance
 * Toggles maintenance mode ON or OFF.
 * Restricted to Owner and Manager roles.
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireAdminUser(['Owner', 'Manager']);

    const body = await request.json().catch(() => null);
    if (!body || typeof body.enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request body. "enabled" (boolean) is required.' },
        { status: 400 },
      );
    }

    const previousStatus = await getMaintenanceStatus();

    // Persist new state to database and local maintenance.json/maintenance.flag
    const updatedStatus = await setMaintenanceStatus(
      {
        enabled: body.enabled,
        message: body.message,
        retryAfter: typeof body.retryAfter === 'number' ? body.retryAfter : undefined,
      },
      user.email,
    );

    // Sync state with Customer App (with 1.5s timeout so it never blocks or hangs)
    const revalSecret = process.env.REVALIDATION_SECRET || '';
    const syncTargets = Array.from(
      new Set(['http://localhost:3000', process.env.CUSTOMER_APP_URL].filter(Boolean)),
    ) as string[];

    for (const targetUrl of syncTargets) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1500);

        fetch(`${targetUrl}/api/maintenance/sync`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-sync-secret': revalSecret,
          },
          body: JSON.stringify(updatedStatus),
          cache: 'no-store',
          signal: controller.signal,
        })
          .then(() => clearTimeout(timeoutId))
          .catch(() => clearTimeout(timeoutId));
      } catch {
        // Silently continue
      }
    }

    // Trigger customer ISR cache revalidation in background
    revalidateCustomerApp().catch((revalErr) => {
      console.warn('[Maintenance] Revalidate warning:', revalErr);
    });

    console.log(
      `[Maintenance] State changed to ${updatedStatus.enabled ? 'ACTIVE' : 'INACTIVE'} by ${user.email}`,
    );

    return NextResponse.json({
      success: true,
      previous: previousStatus.enabled,
      current: updatedStatus,
    });
  } catch (err) {
    if (err instanceof AuthenticationError) {
      return NextResponse.json({ error: err.message }, { status: 401 });
    }
    if (err instanceof AuthorizationError) {
      return NextResponse.json({ error: err.message }, { status: 403 });
    }
    console.error('[API /api/admin/maintenance] POST Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
