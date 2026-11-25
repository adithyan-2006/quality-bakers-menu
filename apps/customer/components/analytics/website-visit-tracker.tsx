'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';

const VISITOR_ID_KEY = 'qbm_visitor_id';
const SESSION_ID_KEY = 'qbm_session_id';
const SESSION_TRACKED_KEY = 'qbm_session_tracked';
const EXCLUDED_PATHS = new Set(['/maintenance', '/offline']);

// In-memory fallback for environments where sessionStorage throws (e.g. restricted WebViews)
let fallbackSessionId = '';
let fallbackSessionTracked = false;

function generateId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function getOrCreateVisitorId(): string {
  if (typeof window === 'undefined') return '';
  try {
    let id = localStorage.getItem(VISITOR_ID_KEY);
    if (!id) {
      id = localStorage.getItem('qbm_anonymous_user_id');
    }
    if (!id || id.trim().length === 0) {
      id = generateId('v');
      localStorage.setItem(VISITOR_ID_KEY, id);
    }
    return id;
  } catch {
    return `anon_${Math.random().toString(36).substring(2, 9)}`;
  }
}

function getOrCreateSessionState(): {
  sessionId: string;
  canUseSessionStorage: boolean;
} {
  if (typeof window === 'undefined') {
    return { sessionId: '', canUseSessionStorage: false };
  }
  try {
    let id = sessionStorage.getItem(SESSION_ID_KEY);
    if (!id || id.trim().length === 0) {
      id = generateId('s');
      sessionStorage.setItem(SESSION_ID_KEY, id);
    }
    return { sessionId: id, canUseSessionStorage: true };
  } catch {
    if (!fallbackSessionId) {
      fallbackSessionId = generateId('s');
    }
    return { sessionId: fallbackSessionId, canUseSessionStorage: false };
  }
}

function isReloadNavigation(): boolean {
  if (typeof performance === 'undefined' || typeof performance.getEntriesByType !== 'function') {
    return false;
  }
  try {
    const entries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    return entries.length > 0 && entries[0]?.type === 'reload';
  } catch {
    return false;
  }
}

/**
 * Robust client-side device, device name, browser, and OS detection
 */
function getClientDeviceDetails(): {
  deviceType: 'mobile' | 'tablet' | 'desktop';
  deviceName: string;
  browser: string;
  os: string;
  screenWidth: number;
} {
  if (typeof window === 'undefined') {
    return {
      deviceType: 'desktop',
      deviceName: 'Desktop PC',
      browser: 'Other',
      os: 'Other',
      screenWidth: 1200,
    };
  }

  const ua = (navigator.userAgent || '').toLowerCase();
  const screenWidth = Math.min(window.innerWidth || 1200, window.screen?.width || 1200);
  const hasTouch =
    (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) || 'ontouchstart' in window;

  // 1. Client OS Detection (User-Agent primary)
  let os = 'Other';
  let isIPadDesktop = false;

  if (/iphone|ipod/i.test(ua)) {
    os = 'iOS';
  } else if (/ipad/i.test(ua)) {
    os = 'iOS';
  } else if (/macintosh|mac os x/i.test(ua)) {
    // Modern iPadOS (iOS 13+) reports Macintosh desktop UA, but has multi-touch capability
    if (hasTouch && navigator.maxTouchPoints > 1) {
      os = 'iOS';
      isIPadDesktop = true;
    } else {
      os = 'macOS';
    }
  } else if (/android/i.test(ua)) {
    os = 'Android';
  } else if (/windows/i.test(ua)) {
    os = 'Windows';
  } else if (/cros/i.test(ua)) {
    os = 'ChromeOS';
  } else if (/linux/i.test(ua)) {
    os = 'Linux';
  }

  // 2. Device Type Detection
  let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';

  if (os === 'Windows' || os === 'macOS' || os === 'Linux' || os === 'ChromeOS') {
    // Desktop platforms are ALWAYS desktop. Touchscreen Windows laptops, 2-in-1s, or narrowed
    // browser windows must never be classified as mobile phones or 'Windows Mobile'.
    deviceType = 'desktop';
  } else if (
    isIPadDesktop ||
    /ipad|playbook|silk/i.test(ua) ||
    (os === 'Android' && !/mobile/i.test(ua) && screenWidth >= 600)
  ) {
    deviceType = 'tablet';
  } else if (os === 'iOS' || os === 'Android' || /mobile|phone|blackberry|opera mini/i.test(ua)) {
    deviceType = 'mobile';
  } else {
    deviceType = 'desktop';
  }

  // 3. Client Browser
  let browser = 'Other';
  if (/\b(?:edg|edga|edgios|edge)\//i.test(ua)) {
    browser = 'Edge';
  } else if (/\b(?:opr|opera)\//i.test(ua)) {
    browser = 'Opera';
  } else if (/samsungbrowser\//i.test(ua)) {
    browser = 'Samsung Internet';
  } else if (/crios\//i.test(ua)) {
    browser = 'Chrome';
  } else if (/fxios\//i.test(ua)) {
    browser = 'Firefox';
  } else if (
    /(?:chrome|chromium)\//i.test(ua) &&
    !/\b(?:edg|edga|edgios|edge)\//i.test(ua) &&
    !/\b(?:opr|opera)\//i.test(ua) &&
    !/samsungbrowser\//i.test(ua)
  ) {
    browser = 'Chrome';
  } else if (
    /safari\//i.test(ua) &&
    !/(?:chrome|crios|chromium)\//i.test(ua) &&
    !/android/i.test(ua)
  ) {
    browser = 'Safari';
  } else if (/firefox\//i.test(ua)) {
    browser = 'Firefox';
  }

  // 4. Specific Device Name
  let deviceName = 'Desktop PC';
  const uaData = (navigator as unknown as { userAgentData?: { model?: string } }).userAgentData;
  const clientModel = uaData?.model || '';

  if (os === 'iOS') {
    deviceName =
      deviceType === 'tablet' || isIPadDesktop || /ipad/i.test(ua) ? 'Apple iPad' : 'Apple iPhone';
  } else if (os === 'Android') {
    if (clientModel) {
      deviceName = `Android (${clientModel})`;
    } else if (/samsung|sm-[a-z0-9]+/i.test(ua)) {
      deviceName = deviceType === 'tablet' ? 'Samsung Galaxy Tab' : 'Samsung Galaxy';
    } else if (/pixel/i.test(ua)) {
      deviceName = 'Google Pixel';
    } else if (/xiaomi|redmi|poco/i.test(ua)) {
      deviceName = 'Xiaomi / Redmi';
    } else if (/oneplus/i.test(ua)) {
      deviceName = 'OnePlus';
    } else if (/motorola|moto/i.test(ua)) {
      deviceName = 'Motorola';
    } else if (/oppo|cph[0-9]+/i.test(ua)) {
      deviceName = 'OPPO';
    } else if (/vivo|v[0-9]{4}/i.test(ua)) {
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
  }

  return { deviceType, deviceName, browser, os, screenWidth };
}

function markSessionTracked(canUseSessionStorage: boolean, tracked: boolean): void {
  fallbackSessionTracked = tracked;
  if (!canUseSessionStorage) return;
  try {
    if (tracked) {
      sessionStorage.setItem(SESSION_TRACKED_KEY, '1');
    } else {
      sessionStorage.removeItem(SESSION_TRACKED_KEY);
    }
  } catch {
    // Ignore storage errors in restricted environments
  }
}

export function WebsiteVisitTracker() {
  const pathname = usePathname() || '/';
  const trackingInFlightRef = React.useRef(false);

  React.useEffect(() => {
    if (EXCLUDED_PATHS.has(pathname) || trackingInFlightRef.current || fallbackSessionTracked) {
      return;
    }

    const { sessionId, canUseSessionStorage } = getOrCreateSessionState();

    // Once counted for the current browser/tab session, neither refreshes nor in-app
    // actions re-trigger a visit until the user closes and reopens the website.
    let alreadyTracked = false;
    if (canUseSessionStorage) {
      try {
        alreadyTracked = sessionStorage.getItem(SESSION_TRACKED_KEY) === '1';
      } catch {
        alreadyTracked = false;
      }
    }

    if (alreadyTracked) {
      fallbackSessionTracked = true;
      return;
    }

    // Fallback when sessionStorage is unavailable (e.g. strict WebViews): do not count reloads
    if (!canUseSessionStorage && isReloadNavigation()) {
      fallbackSessionTracked = true;
      return;
    }

    trackingInFlightRef.current = true;
    markSessionTracked(canUseSessionStorage, true);

    const visitorId = getOrCreateVisitorId();
    const clientDetails = getClientDeviceDetails();
    const referrer = typeof document !== 'undefined' ? document.referrer : '';

    const payload = JSON.stringify({
      path: pathname,
      referrer,
      visitorId,
      sessionId,
      deviceType: clientDetails.deviceType,
      deviceName: clientDetails.deviceName,
      browser: clientDetails.browser,
      os: clientDetails.os,
      screenWidth: clientDetails.screenWidth,
    });

    fetch('/api/analytics/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: payload,
      keepalive: true,
    })
      .then((res) => {
        trackingInFlightRef.current = false;
        if (!res.ok && res.status >= 500) {
          markSessionTracked(canUseSessionStorage, false);
        }
      })
      .catch(() => {
        trackingInFlightRef.current = false;
        markSessionTracked(canUseSessionStorage, false);
      });
  }, [pathname]);

  return null;
}
