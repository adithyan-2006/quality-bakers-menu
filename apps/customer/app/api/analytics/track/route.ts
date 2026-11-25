import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@qbm/database';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

function parseDeviceInfo(
  rawUa: string,
  clientData?: {
    deviceType?: string | undefined;
    deviceName?: string | undefined;
    browser?: string | undefined;
    os?: string | undefined;
    screenWidth?: number | undefined;
  },
) {
  const ua = rawUa || '';
  const uaLower = ua.toLowerCase();

  // 1. OS Detection (User-Agent primary, clientData fallback)
  let os = 'Other';
  if (/iphone|ipod/i.test(uaLower)) {
    os = 'iOS';
  } else if (/ipad/i.test(uaLower)) {
    os = 'iOS';
  } else if (/android/i.test(uaLower)) {
    os = 'Android';
  } else if (/windows/i.test(uaLower)) {
    os = 'Windows';
  } else if (/macintosh|mac os x/i.test(uaLower)) {
    // iPadOS 13+ sends desktop Macintosh UA, but client touch detection identifies iOS
    if (clientData?.os === 'iOS') {
      os = 'iOS';
    } else {
      os = 'macOS';
    }
  } else if (/cros/i.test(uaLower)) {
    os = 'ChromeOS';
  } else if (/linux/i.test(uaLower)) {
    os = 'Linux';
  } else if (clientData?.os && clientData.os !== 'Other') {
    os = clientData.os;
  }

  // 2. Device Type Classification
  let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';

  const isTabletUA =
    /ipad|playbook|silk/i.test(uaLower) ||
    (/tablet/i.test(uaLower) && !/phone|mobile/i.test(uaLower)) ||
    (/android/i.test(uaLower) && !/mobile/i.test(uaLower));

  const isMobileUA =
    /mobile|iphone|ipod|phone|blackberry|iemobile|opera mini/i.test(uaLower) ||
    /android.*mobile/i.test(uaLower);

  if (os === 'Windows' && !/windows phone|wpdesktop/i.test(uaLower)) {
    // Windows desktop/laptop must NEVER be classified as a phone, even if it has a touchscreen or narrow window
    deviceType = 'desktop';
  } else if (os === 'macOS') {
    // Macs are always desktop
    deviceType = 'desktop';
  } else if (isTabletUA || (os === 'iOS' && clientData?.deviceType === 'tablet')) {
    deviceType = 'tablet';
  } else if (
    isMobileUA ||
    os === 'iOS' ||
    (os === 'Android' && clientData?.deviceType !== 'tablet')
  ) {
    deviceType = 'mobile';
  } else if (clientData?.deviceType === 'mobile' || clientData?.deviceType === 'tablet') {
    deviceType = clientData.deviceType;
  }

  // 3. Browser Detection
  let browser = 'Other';
  if (/\b(?:edg|edga|edgios|edge)\//i.test(uaLower)) {
    browser = 'Edge';
  } else if (/\b(?:opr|opera)\//i.test(uaLower)) {
    browser = 'Opera';
  } else if (/samsungbrowser\//i.test(uaLower)) {
    browser = 'Samsung Internet';
  } else if (/crios\//i.test(uaLower)) {
    browser = 'Chrome';
  } else if (/fxios\//i.test(uaLower)) {
    browser = 'Firefox';
  } else if (
    /(?:chrome|chromium)\//i.test(uaLower) &&
    !/\b(?:edg|edga|edgios|edge)\//i.test(uaLower) &&
    !/\b(?:opr|opera)\//i.test(uaLower) &&
    !/samsungbrowser\//i.test(uaLower)
  ) {
    browser = 'Chrome';
  } else if (
    /safari\//i.test(uaLower) &&
    !/(?:chrome|crios|chromium)\//i.test(uaLower) &&
    !/android/i.test(uaLower)
  ) {
    browser = 'Safari';
  } else if (/firefox\//i.test(uaLower)) {
    browser = 'Firefox';
  } else if (clientData?.browser && clientData.browser !== 'Other') {
    browser = clientData.browser;
  }

  // 4. Honest Device Name Resolution
  let deviceName = 'Desktop PC';
  if (os === 'iOS') {
    deviceName = deviceType === 'tablet' || /ipad/i.test(uaLower) ? 'Apple iPad' : 'Apple iPhone';
  } else if (os === 'Android') {
    if (/samsung|sm-[a-z0-9]+/i.test(uaLower)) {
      deviceName = deviceType === 'tablet' ? 'Samsung Galaxy Tab' : 'Samsung Galaxy';
    } else if (/pixel/i.test(uaLower)) {
      deviceName = 'Google Pixel';
    } else if (/xiaomi|redmi|poco/i.test(uaLower)) {
      deviceName = 'Xiaomi / Redmi';
    } else if (/oneplus/i.test(uaLower)) {
      deviceName = 'OnePlus';
    } else if (/motorola|moto/i.test(uaLower)) {
      deviceName = 'Motorola';
    } else if (/oppo|cph[0-9]+/i.test(uaLower)) {
      deviceName = 'OPPO';
    } else if (/vivo|v[0-9]{4}/i.test(uaLower)) {
      deviceName = 'Vivo';
    } else {
      deviceName = deviceType === 'tablet' ? 'Android Tablet' : 'Android Phone';
    }
  } else if (os === 'macOS') {
    deviceName = 'Apple Mac';
  } else if (os === 'Windows') {
    deviceName = 'Windows PC';
  } else if (os === 'Linux') {
    deviceName = 'Linux PC';
  } else if (os === 'ChromeOS') {
    deviceName = 'Chromebook';
  } else if (deviceType === 'mobile') {
    deviceName = 'Mobile Device';
  } else if (deviceType === 'tablet') {
    deviceName = 'Tablet Device';
  } else {
    deviceName = 'Desktop PC';
  }

  return { deviceType, deviceName, browser, os };
}

// Comprehensive bot/crawler/automation user-agent filter.
// Covers major search crawlers, headless browsers, CLI tools, and synthetic monitors.
const BOT_REGEX =
  /googlebot|bingbot|yandexbot|duckduckbot|baiduspider|slurp|ia_archiver|ahrefsbot|semrushbot|dotbot|mj12bot|petalbot|facebookexternalhit|twitterbot|linkedinbot|applebot|headlesschrome|phantomjs|puppeteer|playwright|selenium|webdriver|python-requests|python-urllib|go-http|java\/|curl\/|wget\/|libwww|okhttp|axios|node-fetch|scrapy|httrack|nutch|heritrix/i;

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

const MAX_PAYLOAD_BYTES = 16384; // 16 KB max payload size for tracking
const SESSION_DEDUPE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const MAX_CACHED_SESSIONS = 2000;
const recentTrackedSessions = new Map<string, number>();

function isSessionRecentlyTracked(sessionId: string | null): boolean {
  if (!sessionId) return false;
  const recordedAt = recentTrackedSessions.get(sessionId);
  if (!recordedAt) return false;
  if (Date.now() - recordedAt > SESSION_DEDUPE_TTL_MS) {
    recentTrackedSessions.delete(sessionId);
    return false;
  }
  return true;
}

function recordTrackedSession(sessionId: string | null): void {
  if (!sessionId) return;
  const now = Date.now();
  if (recentTrackedSessions.size >= MAX_CACHED_SESSIONS) {
    // Evict expired entries first, or oldest key in insertion order
    for (const [key, ts] of recentTrackedSessions) {
      if (now - ts > SESSION_DEDUPE_TTL_MS) {
        recentTrackedSessions.delete(key);
      }
    }
    if (recentTrackedSessions.size >= MAX_CACHED_SESSIONS) {
      const oldestKey = recentTrackedSessions.keys().next().value;
      if (oldestKey) recentTrackedSessions.delete(oldestKey);
    }
  }
  recentTrackedSessions.set(sessionId, now);
}

export async function POST(request: NextRequest) {
  try {
    const rawUa = request.headers.get('user-agent') || '';

    if (BOT_REGEX.test(rawUa)) {
      return NextResponse.json({ success: true, skipped: 'crawler' });
    }

    // 1. Enforce payload size limit via Content-Length header if present
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength, 10) > MAX_PAYLOAD_BYTES) {
      return NextResponse.json(
        { error: 'Payload too large. Maximum allowed size is 16KB.' },
        { status: 413, headers: { 'Access-Control-Allow-Origin': '*' } },
      );
    }

    let text = '';
    try {
      text = await request.text();
    } catch {
      return NextResponse.json(
        { error: 'Failed to read request body.' },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } },
      );
    }

    // Enforce payload size limit on actual body text
    if (text.length > MAX_PAYLOAD_BYTES) {
      return NextResponse.json(
        { error: 'Payload too large. Maximum allowed size is 16KB.' },
        { status: 413, headers: { 'Access-Control-Allow-Origin': '*' } },
      );
    }

    let body: any = {};
    if (text && text.trim().length > 0) {
      try {
        body = JSON.parse(text);
      } catch {
        return NextResponse.json(
          { error: 'Malformed JSON payload.' },
          { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } },
        );
      }
    }

    // Validate that body is a non-null plain JSON object (not an array or primitive)
    if (typeof body !== 'object' || body === null || Array.isArray(body)) {
      return NextResponse.json(
        { error: 'Invalid payload structure: JSON object expected.' },
        { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } },
      );
    }

    const {
      path,
      referrer: clientReferrer,
      visitorId: clientVisitorId,
      sessionId,
      deviceType: clientDeviceType,
      deviceName: clientDeviceName,
      browser: clientBrowser,
      os: clientOs,
      screenWidth,
    } = body;

    // Validate and limit path: must start with '/' and limited to max 500 characters
    let cleanPath = '/';
    if (typeof path === 'string') {
      const trimmedPath = path.trim();
      if (trimmedPath.startsWith('/')) {
        cleanPath = trimmedPath.slice(0, 500);
      }
    }

    const validScreenWidth =
      typeof screenWidth === 'number' &&
      Number.isFinite(screenWidth) &&
      screenWidth > 0 &&
      screenWidth < 10000
        ? screenWidth
        : undefined;

    const resolved = parseDeviceInfo(rawUa, {
      deviceType: typeof clientDeviceType === 'string' ? clientDeviceType.slice(0, 50) : undefined,
      deviceName: typeof clientDeviceName === 'string' ? clientDeviceName.slice(0, 100) : undefined,
      browser: typeof clientBrowser === 'string' ? clientBrowser.slice(0, 50) : undefined,
      os: typeof clientOs === 'string' ? clientOs.slice(0, 50) : undefined,
      screenWidth: validScreenWidth,
    });

    if (cleanPath === '/maintenance' || cleanPath === '/offline') {
      return NextResponse.json(
        { success: true, skipped: 'system_fallback' },
        { headers: { 'Access-Control-Allow-Origin': '*' } },
      );
    }

    const rawReferrer = clientReferrer || request.headers.get('referer') || null;
    const cleanReferrer = typeof rawReferrer === 'string' ? rawReferrer.trim().slice(0, 500) : null;
    const trimmedSessionId = typeof sessionId === 'string' ? sessionId.trim() : '';
    const cleanSessionId = trimmedSessionId.length > 0 ? trimmedSessionId.slice(0, 100) : null;

    if (isSessionRecentlyTracked(cleanSessionId)) {
      return NextResponse.json(
        { success: true, skipped: 'session_duplicate' },
        { headers: { 'Access-Control-Allow-Origin': '*' } },
      );
    }

    const forwarded = request.headers.get('x-forwarded-for');
    const firstIp = forwarded ? forwarded.split(',')[0] : undefined;
    const realIp = firstIp ? firstIp.trim() : '127.0.0.1';
    const ipHash = crypto
      .createHash('sha256')
      .update(`${realIp}-${rawUa}-qbm-salt`)
      .digest('hex')
      .slice(0, 16);

    // Validate and limit visitorId: limited to max 100 characters after validation
    let visitorId = `anon_${ipHash}`;
    if (clientVisitorId && typeof clientVisitorId === 'string') {
      const trimmed = clientVisitorId.trim();
      if (trimmed.length > 3) {
        visitorId = trimmed.slice(0, 100);
      }
    }

    // Never persist dummy test visitors into the production database
    if (visitorId.startsWith('test_') || visitorId.startsWith('mock_')) {
      return NextResponse.json(
        { success: true, skipped: 'test' },
        { headers: { 'Access-Control-Allow-Origin': '*' } },
      );
    }

    const id = `cmv_${Date.now().toString(36)}_${crypto.randomBytes(6).toString('hex')}`;

    try {
      await prisma.$executeRaw`
        INSERT INTO "WebsiteVisit" (
          "id", "path", "referrer", "visitorId", "sessionId", 
          "deviceType", "deviceName", "browser", "os", "ipHash", "createdAt"
        ) VALUES (
          ${id},
          ${cleanPath},
          ${cleanReferrer},
          ${visitorId},
          ${cleanSessionId},
          ${resolved.deviceType},
          ${resolved.deviceName},
          ${resolved.browser},
          ${resolved.os},
          ${ipHash},
          NOW()
        )
      `;
      recordTrackedSession(cleanSessionId);
    } catch (dbErr) {
      console.warn('[Customer Analytics Track] Raw tracking insert failed:', dbErr);
    }

    return NextResponse.json(
      { success: true },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      },
    );
  } catch (error) {
    console.error('[Analytics Track] Failed to track website visit:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
