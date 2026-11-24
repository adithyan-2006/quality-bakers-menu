import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsRepository } from '../../../features/analytics/repositories/prisma-analytics-repo';
import { AuthRepository } from '../../../features/auth/repositories/auth-repository';
import { requireAdminUser } from '../../../lib/auth';
import { AuthorizationError } from '../../../lib/errors';

export const dynamic = 'force-dynamic';

function isTimingSafeMatch(token: string, secret: string): boolean {
  if (!token || !secret) return false;
  const tokenBuf = Buffer.from(token, 'utf8');
  const secretBuf = Buffer.from(secret, 'utf8');
  if (tokenBuf.length !== secretBuf.length) return false;
  return crypto.timingSafeEqual(tokenBuf, secretBuf);
}

export async function GET(request: NextRequest) {
  try {
    let isAuthorized = false;

    // 1. Primary: Centralized session cookie verification via requireAdminUser
    try {
      const user = await requireAdminUser();
      if (user) {
        isAuthorized = true;
      }
    } catch (authErr) {
      if (authErr instanceof AuthorizationError) {
        return NextResponse.json(
          { error: 'Forbidden: Insufficient permissions to access analytics' },
          { status: 403 },
        );
      }
      // If AuthenticationError (e.g. no cookie or invalid cookie), proceed to check Bearer token if present
    }

    // 2. Secondary: Optional Bearer token for automated testing and authorized services
    if (!isAuthorized) {
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7).trim();
        if (token) {
          const apiSecret = process.env.ADMIN_API_SECRET;
          const matchesSecret = apiSecret ? isTimingSafeMatch(token, apiSecret) : false;
          const isValidSessionToken = await AuthRepository.verifySession(token);

          if (matchesSecret || isValidSessionToken) {
            isAuthorized = true;
          }
        }
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin authentication required to access analytics' },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const daysParam = searchParams.get('days');
    const days = daysParam ? parseInt(daysParam, 10) : 30;

    const summary = await AnalyticsRepository.getSummary(isNaN(days) ? 30 : days);
    return NextResponse.json(summary);
  } catch (error) {
    console.error('[Admin Analytics API] Error fetching analytics summary:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
