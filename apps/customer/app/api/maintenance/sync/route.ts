import { NextRequest, NextResponse } from 'next/server';
import { setMaintenanceStatus } from '@/lib/maintenance-store';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body.enabled !== 'boolean') {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const updated = await setMaintenanceStatus(body);
    return NextResponse.json({ success: true, status: updated });
  } catch (err) {
    console.error('[API /api/maintenance/sync] Error:', err);
    return NextResponse.json({ error: 'Failed to sync' }, { status: 500 });
  }
}
