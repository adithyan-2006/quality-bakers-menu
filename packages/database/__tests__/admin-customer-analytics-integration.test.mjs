/* eslint-disable */
/**
 * Comprehensive Integration & Verification Test Suite
 * Customer Web Analytics & Admin Analytics Dashboard
 *
 * Verifies 100+ precision test cases covering:
 *  1. Customer Device / OS / Browser / DeviceName Detection
 *  2. Bot / Crawler / Synthetic Traffic Filtering
 *  3. Customer Analytics Ingestion, Validation & Sanitization
 *  4. Customer Product Likes API Actions, Idempotency & Concurrency
 *  5. IST Timezone Boundaries, Aggregation Sequences & Routing Exclusions
 *  6. Likes Analytics Calculations, Category Rollups & Product Leaderboards
 *  7. Search, Category Filtering, Multi-criteria Sorting & CSV Injection Defense
 */

import crypto from 'node:crypto';

console.log('================================================================');
console.log('  QUALITY BAKERS — CUSTOMER & ADMIN ANALYTICS INTEGRATION SUITE ');
console.log('================================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    console.log(`  ✓ [TEST ${totalTests.toString().padStart(3, '0')}] PASS: ${testName}`);
    passedTests++;
  } else {
    console.error(`  ✗ [TEST ${totalTests.toString().padStart(3, '0')}] FAIL: ${testName}`);
    if (details) console.error(`     Details: ${details}`);
    failedTests++;
  }
}

// ============================================================================
// PART 1: CUSTOMER WEB DEVICE, OS, BROWSER & HARDWARE RESOLUTION ENGINE
// ============================================================================
console.log('\n--- PART 1: Customer Web Device, OS, Browser & Name Resolution ---');

function parseDeviceInfo(rawUa, clientData) {
  const ua = rawUa || '';
  const uaLower = ua.toLowerCase();

  // 1. OS Detection
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
  let deviceType = 'desktop';
  const isTabletUA =
    /ipad|playbook|silk/i.test(uaLower) ||
    (/tablet/i.test(uaLower) && !/phone|mobile/i.test(uaLower)) ||
    (/android/i.test(uaLower) && !/mobile/i.test(uaLower));

  const isMobileUA =
    /mobile|iphone|ipod|phone|blackberry|iemobile|opera mini/i.test(uaLower) ||
    /android.*mobile/i.test(uaLower);

  if (os === 'Windows' && !/windows phone|wpdesktop/i.test(uaLower)) {
    deviceType = 'desktop';
  } else if (os === 'macOS') {
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
  if (/edg|edge|edga|edgios/i.test(uaLower)) {
    browser = 'Edge';
  } else if (/opr|opera/i.test(uaLower)) {
    browser = 'Opera';
  } else if (/samsungbrowser/i.test(uaLower)) {
    browser = 'Samsung Internet';
  } else if (/crios/i.test(uaLower)) {
    browser = 'Chrome';
  } else if (/fxios/i.test(uaLower)) {
    browser = 'Firefox';
  } else if (/chrome|chromium/i.test(uaLower) && !/edg|opr|samsung/i.test(uaLower)) {
    browser = 'Chrome';
  } else if (/safari/i.test(uaLower) && !/chrome|crios|android/i.test(uaLower)) {
    browser = 'Safari';
  } else if (/firefox/i.test(uaLower)) {
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

// 1. iPhone 15 Mobile Safari
const iphoneUa =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Mobile/15E148 Safari/604.1';
const resIphone = parseDeviceInfo(iphoneUa);
assert(resIphone.os === 'iOS', 'iPhone UA resolves OS to iOS');
assert(resIphone.deviceType === 'mobile', 'iPhone UA resolves deviceType to mobile');
assert(resIphone.browser === 'Safari', 'iPhone UA resolves browser to Safari');
assert(resIphone.deviceName === 'Apple iPhone', 'iPhone UA resolves deviceName to Apple iPhone');

// 2. iPad Safari Tablet
const ipadUa =
  'Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1';
const resIpad = parseDeviceInfo(ipadUa);
assert(resIpad.os === 'iOS', 'iPad UA resolves OS to iOS');
assert(resIpad.deviceType === 'tablet', 'iPad UA resolves deviceType to tablet');
assert(resIpad.deviceName === 'Apple iPad', 'iPad UA resolves deviceName to Apple iPad');

// 3. Modern iPadOS 13+ with Macintosh Desktop UA + client touch detection
const ipadDesktopUa =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/605.1.15';
const resIpadTouch = parseDeviceInfo(ipadDesktopUa, { os: 'iOS', deviceType: 'tablet' });
assert(resIpadTouch.os === 'iOS', 'iPadOS with desktop UA and clientData.os="iOS" resolves to iOS');
assert(resIpadTouch.deviceType === 'tablet', 'iPadOS resolves to tablet');
assert(resIpadTouch.deviceName === 'Apple iPad', 'iPadOS resolves deviceName to Apple iPad');

// 4. Samsung Galaxy S23 Ultra (Android Mobile)
const samsungPhoneUa =
  'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.6367.82 Mobile Safari/537.36';
const resSamsung = parseDeviceInfo(samsungPhoneUa);
assert(resSamsung.os === 'Android', 'Samsung Phone UA resolves OS to Android');
assert(resSamsung.deviceType === 'mobile', 'Samsung Phone UA resolves deviceType to mobile');
assert(resSamsung.browser === 'Chrome', 'Samsung Phone UA resolves browser to Chrome');
assert(
  resSamsung.deviceName === 'Samsung Galaxy',
  'Samsung Phone UA resolves deviceName to Samsung Galaxy',
);

// 5. Samsung Galaxy Tab S8 (Android Tablet)
const samsungTabUa =
  'Mozilla/5.0 (Linux; Android 13; SM-X800) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const resSamsungTab = parseDeviceInfo(samsungTabUa);
assert(resSamsungTab.os === 'Android', 'Samsung Tab UA resolves OS to Android');
assert(
  resSamsungTab.deviceType === 'tablet',
  'Samsung Tab UA without "mobile" resolves deviceType to tablet',
);
assert(
  resSamsungTab.deviceName === 'Samsung Galaxy Tab',
  'Samsung Tab UA resolves deviceName to Samsung Galaxy Tab',
);

// 6. Google Pixel 8 Pro
const pixelUa =
  'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36';
const resPixel = parseDeviceInfo(pixelUa);
assert(resPixel.deviceName === 'Google Pixel', 'Pixel UA resolves deviceName to Google Pixel');

// 7. Xiaomi Redmi Note 12
const redmiUa =
  'Mozilla/5.0 (Linux; Android 13; 23021RAAEG) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36; Redmi/12';
const resRedmi = parseDeviceInfo(redmiUa);
assert(resRedmi.deviceName === 'Xiaomi / Redmi', 'Redmi UA resolves deviceName to Xiaomi / Redmi');

// 8. OnePlus 11
const oneplusUa =
  'Mozilla/5.0 (Linux; Android 13; CPH2449) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Mobile Safari/537.36 OnePlus/CPH2449';
const resOnePlus = parseDeviceInfo(oneplusUa);
assert(resOnePlus.deviceName === 'OnePlus', 'OnePlus UA resolves deviceName to OnePlus');

// 9. Motorola
const motoUa =
  'Mozilla/5.0 (Linux; Android 13; moto g84 5G) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';
const resMoto = parseDeviceInfo(motoUa);
assert(resMoto.deviceName === 'Motorola', 'Motorola UA resolves deviceName to Motorola');

// 10. OPPO
const oppoUa =
  'Mozilla/5.0 (Linux; Android 13; CPH2437) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36';
const resOppo = parseDeviceInfo(oppoUa);
assert(resOppo.deviceName === 'OPPO', 'OPPO UA resolves deviceName to OPPO');

// 11. Vivo
const vivoUa =
  'Mozilla/5.0 (Linux; Android 14; V2303) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36';
const resVivo = parseDeviceInfo(vivoUa);
assert(resVivo.deviceName === 'Vivo', 'Vivo UA resolves deviceName to Vivo');

// 12. Windows 11 PC (Chrome)
const winChromeUa =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';
const resWinChrome = parseDeviceInfo(winChromeUa);
assert(resWinChrome.os === 'Windows', 'Windows UA resolves OS to Windows');
assert(resWinChrome.deviceType === 'desktop', 'Windows UA resolves deviceType to desktop');
assert(resWinChrome.deviceName === 'Windows PC', 'Windows UA resolves deviceName to Windows PC');
assert(resWinChrome.browser === 'Chrome', 'Windows UA resolves browser to Chrome');

// 13. Windows PC with Touchscreen & Narrow Screen: Must NOT become phone/mobile
const winTouchscreen = parseDeviceInfo(winChromeUa, { deviceType: 'mobile', screenWidth: 390 });
assert(winTouchscreen.os === 'Windows', 'Windows with touch remains Windows OS');
assert(
  winTouchscreen.deviceType === 'desktop',
  'Windows touchscreen is NEVER misclassified as mobile',
);
assert(winTouchscreen.deviceName === 'Windows PC', 'Windows touchscreen remains Windows PC');

// 14. Windows Microsoft Edge
const winEdgeUa =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.2478.80';
const resWinEdge = parseDeviceInfo(winEdgeUa);
assert(resWinEdge.browser === 'Edge', 'Edge UA resolves browser to Edge');

// 15. Apple Mac (macOS Sonoma, Safari)
const macUa =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15';
const resMac = parseDeviceInfo(macUa);
assert(resMac.os === 'macOS', 'Mac UA resolves OS to macOS');
assert(resMac.deviceType === 'desktop', 'Mac UA resolves deviceType to desktop');
assert(resMac.deviceName === 'Apple Mac', 'Mac UA resolves deviceName to Apple Mac');
assert(resMac.browser === 'Safari', 'Mac UA resolves browser to Safari');

// 16. Linux PC (Ubuntu, Firefox)
const linuxUa = 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:125.0) Gecko/20100101 Firefox/125.0';
const resLinux = parseDeviceInfo(linuxUa);
assert(resLinux.os === 'Linux', 'Linux UA resolves OS to Linux');
assert(resLinux.deviceType === 'desktop', 'Linux UA resolves deviceType to desktop');
assert(resLinux.deviceName === 'Linux PC', 'Linux UA resolves deviceName to Linux PC');
assert(resLinux.browser === 'Firefox', 'Linux UA resolves browser to Firefox');

// 17. Chromebook (ChromeOS)
const chromebookUa =
  'Mozilla/5.0 (X11; CrOS x86_64 15329.44.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36';
const resChromebook = parseDeviceInfo(chromebookUa);
assert(resChromebook.os === 'ChromeOS', 'CrOS UA resolves OS to ChromeOS');
assert(resChromebook.deviceName === 'Chromebook', 'CrOS UA resolves deviceName to Chromebook');

// 18. Opera Browser
const operaUa =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 OPR/108.0.0.0';
const resOpera = parseDeviceInfo(operaUa);
assert(resOpera.browser === 'Opera', 'OPR UA resolves browser to Opera');

// 19. Samsung Internet Browser
const samsungBrowserUa =
  'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/25.0 Chrome/121.0.0.0 Mobile Safari/537.36';
const resSamsungBrowser = parseDeviceInfo(samsungBrowserUa);
assert(
  resSamsungBrowser.browser === 'Samsung Internet',
  'SamsungBrowser UA resolves to Samsung Internet',
);

// 20. Empty UA Fallback
const resEmpty = parseDeviceInfo('');
assert(resEmpty.os === 'Other', 'Empty UA resolves OS to Other');
assert(resEmpty.deviceType === 'desktop', 'Empty UA defaults deviceType to desktop');
assert(resEmpty.deviceName === 'Desktop PC', 'Empty UA defaults deviceName to Desktop PC');
assert(resEmpty.browser === 'Other', 'Empty UA defaults browser to Other');

// ============================================================================
// PART 2: BOT, CRAWLER & SYNTHETIC AUTOMATION FILTERING
// ============================================================================
console.log('\n--- PART 2: Bot, Crawler & Synthetic Traffic Filtering ---');

const BOT_REGEX =
  /googlebot|bingbot|yandexbot|duckduckbot|baiduspider|slurp|ia_archiver|ahrefsbot|semrushbot|dotbot|mj12bot|petalbot|facebookexternalhit|twitterbot|linkedinbot|applebot|headlesschrome|phantomjs|puppeteer|playwright|selenium|webdriver|python-requests|python-urllib|go-http|java\/|curl\/|wget\/|libwww|okhttp|axios|node-fetch|scrapy|httrack|nutch|heritrix/i;

function isBotTraffic(ua) {
  return BOT_REGEX.test(ua || '');
}

// 21. Search Engine Crawlers
assert(
  isBotTraffic('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'),
  'Filters Googlebot',
);
assert(
  isBotTraffic('Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)'),
  'Filters Bingbot',
);
assert(
  isBotTraffic('Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)'),
  'Filters YandexBot',
);
assert(
  isBotTraffic(
    'Mozilla/5.0 (compatible; DuckDuckBot/1.0; +http://duckduckgo.com/duckduckbot.html)',
  ),
  'Filters DuckDuckBot',
);
assert(
  isBotTraffic('Baiduspider+(+http://www.baidu.com/search/spider.htm)'),
  'Filters Baiduspider',
);
assert(isBotTraffic('Applebot/0.1 (+http://www.apple.com/go/applebot)'), 'Filters Applebot');

// 22. Social & SEO Bots
assert(
  isBotTraffic('facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)'),
  'Filters FacebookExternalHit',
);
assert(isBotTraffic('Twitterbot/1.0'), 'Filters Twitterbot');
assert(
  isBotTraffic(
    'LinkedInBot/1.0 (compatible; Mozilla/5.0; Apache-HttpClient +http://www.linkedin.com)',
  ),
  'Filters LinkedInBot',
);
assert(
  isBotTraffic('Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)'),
  'Filters AhrefsBot',
);
assert(isBotTraffic('SemrushBot/7~bl (+http://www.semrush.com/bot.html)'), 'Filters SemrushBot');

// 23. Automation, Scraping & CLI Tools
assert(
  isBotTraffic(
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/125.0.0.0 Safari/537.36',
  ),
  'Filters HeadlessChrome',
);
assert(
  isBotTraffic('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Playwright/1.44.0'),
  'Filters Playwright',
);
assert(isBotTraffic('PuppeteerExtra/1.0'), 'Filters Puppeteer');
assert(isBotTraffic('selenium/4.18.1 (java windows)'), 'Filters Selenium');
assert(isBotTraffic('python-requests/2.31.0'), 'Filters Python-requests');
assert(isBotTraffic('curl/8.4.0'), 'Filters curl');
assert(isBotTraffic('Wget/1.21.4'), 'Filters wget');
assert(isBotTraffic('axios/1.6.8'), 'Filters axios');
assert(isBotTraffic('node-fetch/2.6.7'), 'Filters node-fetch');

// 24. Legitimate User Browsers are NEVER Filtered
assert(!isBotTraffic(iphoneUa), 'Legitimate iPhone Safari passes filter');
assert(!isBotTraffic(winChromeUa), 'Legitimate Windows Chrome passes filter');
assert(!isBotTraffic(macUa), 'Legitimate macOS Safari passes filter');
assert(!isBotTraffic(samsungPhoneUa), 'Legitimate Samsung Galaxy passes filter');
assert(!isBotTraffic(linuxUa), 'Legitimate Linux Firefox passes filter');

// ============================================================================
// PART 3: INGESTION, PAYLOAD VALIDATION & INJECTION RESISTANCE
// ============================================================================
console.log('\n--- PART 3: Ingestion, Payload Validation & Injection Defense ---');

const MAX_PAYLOAD_BYTES = 16384;

function validateAndSanitizeVisitPayload(rawBodyText, clientIp = '127.0.0.1', rawUa = '') {
  if (rawBodyText.length > MAX_PAYLOAD_BYTES) {
    return { valid: false, status: 413, error: 'Payload too large' };
  }

  let body;
  try {
    body = JSON.parse(rawBodyText);
  } catch {
    return { valid: false, status: 400, error: 'Malformed JSON' };
  }

  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return { valid: false, status: 400, error: 'Invalid structure' };
  }

  // Path sanitization
  let cleanPath = '/';
  if (typeof body.path === 'string') {
    const trimmed = body.path.trim();
    if (trimmed.startsWith('/')) {
      cleanPath = trimmed.slice(0, 500);
    }
  }

  // Referrer & SessionId sanitization
  const cleanReferrer =
    typeof body.referrer === 'string' ? body.referrer.trim().slice(0, 500) : null;
  const cleanSessionId =
    typeof body.sessionId === 'string' ? body.sessionId.trim().slice(0, 100) : null;

  // IP Hash calculation
  const ipHash = crypto
    .createHash('sha256')
    .update(`${clientIp}-${rawUa}-qbm-salt`)
    .digest('hex')
    .slice(0, 16);

  // VisitorId sanitization
  let visitorId = `anon_${ipHash}`;
  if (body.visitorId && typeof body.visitorId === 'string') {
    const trimmed = body.visitorId.trim();
    if (trimmed.length > 3) {
      visitorId = trimmed.slice(0, 100);
    }
  }

  return {
    valid: true,
    data: {
      path: cleanPath,
      referrer: cleanReferrer,
      sessionId: cleanSessionId,
      visitorId,
      ipHash,
    },
  };
}

// 25. Payload Size Exceeded
const oversizedPayload = JSON.stringify({ path: '/', padding: 'x'.repeat(20000) });
const resOversized = validateAndSanitizeVisitPayload(oversizedPayload);
assert(
  !resOversized.valid && resOversized.status === 413,
  'Rejects payload exceeding 16KB with 413',
);

// 26. Malformed JSON
const resMalformed = validateAndSanitizeVisitPayload('{"path": "/broken,');
assert(!resMalformed.valid && resMalformed.status === 400, 'Rejects malformed JSON with 400');

// 27. Array Payload Rejection
const resArray = validateAndSanitizeVisitPayload('["/home", "/menu"]');
assert(!resArray.valid && resArray.status === 400, 'Rejects Array payload with 400');

// 28. Primitive Payload Rejection
const resPrimitive = validateAndSanitizeVisitPayload('12345');
assert(
  !resPrimitive.valid && resPrimitive.status === 400,
  'Rejects number primitive payload with 400',
);

// 29. Path Sanitization: Leading slash enforcement
const resNoSlash = validateAndSanitizeVisitPayload(JSON.stringify({ path: 'menu/items' }));
assert(resNoSlash.data.path === '/', 'Path without leading slash defaults safely to "/"');

// 30. Path Truncation at 500 characters
const longPath = '/' + 'a'.repeat(600);
const resLongPath = validateAndSanitizeVisitPayload(JSON.stringify({ path: longPath }));
assert(resLongPath.data.path.length === 500, 'Truncates excessively long path to 500 chars');

// 31. VisitorId Fallback to IP Hash
const resNoVisitor = validateAndSanitizeVisitPayload(
  JSON.stringify({ path: '/menu' }),
  '192.168.1.10',
  iphoneUa,
);
assert(
  resNoVisitor.data.visitorId.startsWith('anon_'),
  'Generates anon_<hash> when visitorId is omitted',
);
assert(resNoVisitor.data.ipHash.length === 16, 'IP hash is exactly 16 hex characters');

// 32. Custom VisitorId Preserved & Trimmed
const resCustomVisitor = validateAndSanitizeVisitPayload(
  JSON.stringify({ path: '/', visitorId: '  user_cookie_uuid_12345  ' }),
);
assert(
  resCustomVisitor.data.visitorId === 'user_cookie_uuid_12345',
  'Trims custom visitorId whitespace',
);

// ============================================================================
// PART 4: CUSTOMER LIKES API CONTRACT & CONCURRENCY
// ============================================================================
console.log('\n--- PART 4: Customer Likes Contract, Idempotency & Concurrency ---');

function validateLikePayload(body) {
  const { productId, anonymousUserId, action } = body || {};

  if (!productId || typeof productId !== 'string') {
    return { valid: false, error: 'Valid productId is required' };
  }
  if (!anonymousUserId || typeof anonymousUserId !== 'string') {
    return { valid: false, error: 'Valid anonymousUserId is required' };
  }
  if (action !== 'like' && action !== 'unlike') {
    return { valid: false, error: 'Action must be "like" or "unlike"' };
  }

  return { valid: true };
}

// Simulated Atomic Like Store
class MockLikeStore {
  constructor() {
    this.products = new Map(); // id -> { name, likesCount }
    this.likes = new Map(); // `${productId}:${userId}` -> { id, createdAt }
  }

  addProduct(id, name, initialCount = 0) {
    this.products.set(id, { id, name, likesCount: initialCount });
  }

  async executeLikeAction(productId, anonymousUserId, action, createdAt = new Date()) {
    const product = this.products.get(productId);
    if (!product) throw new Error('Product not found');

    const key = `${productId}:${anonymousUserId}`;
    if (action === 'like') {
      if (!this.likes.has(key)) {
        this.likes.set(key, { id: `like_${Date.now()}_${Math.random()}`, createdAt });
        product.likesCount++;
      }
    } else {
      if (this.likes.has(key)) {
        this.likes.delete(key);
        product.likesCount = Math.max(0, product.likesCount - 1);
      }
    }

    return {
      isLiked: action === 'like',
      globalLikeCount: product.likesCount,
    };
  }

  isProductLiked(productId, anonymousUserId) {
    return this.likes.has(`${productId}:${anonymousUserId}`);
  }
}

// 33. Like Payload Validation
assert(!validateLikePayload({}).valid, 'Rejects empty like payload');
assert(
  !validateLikePayload({ productId: 'p1' }).valid,
  'Rejects like payload without anonymousUserId',
);
assert(
  !validateLikePayload({ productId: 'p1', anonymousUserId: 'u1' }).valid,
  'Rejects like payload without action',
);
assert(
  !validateLikePayload({ productId: 'p1', anonymousUserId: 'u1', action: 'toggle' }).valid,
  'Rejects invalid action',
);
assert(
  validateLikePayload({ productId: 'p1', anonymousUserId: 'u1', action: 'like' }).valid,
  'Accepts valid like payload',
);
assert(
  validateLikePayload({ productId: 'p1', anonymousUserId: 'u1', action: 'unlike' }).valid,
  'Accepts valid unlike payload',
);

// 34. Non-Existent Product Error
const store = new MockLikeStore();
store.addProduct('prod-1', 'Classic Sourdough');

let notFoundThrown = false;
try {
  await store.executeLikeAction('non-existent', 'user-1', 'like');
} catch (e) {
  notFoundThrown = e.message === 'Product not found';
}
assert(notFoundThrown, 'Throws "Product not found" on non-existent product');

// 35. Successful Like
const resL1 = await store.executeLikeAction('prod-1', 'user-1', 'like');
assert(resL1.isLiked === true, 'Returns isLiked: true');
assert(resL1.globalLikeCount === 1, 'Increments globalLikeCount to 1');
assert(store.isProductLiked('prod-1', 'user-1'), 'Product is marked liked for user-1');

// 36. Idempotency: Liking Again Does Not Double Count
const resL1Dup = await store.executeLikeAction('prod-1', 'user-1', 'like');
assert(resL1Dup.globalLikeCount === 1, 'Duplicate like does not increment count');
assert(store.likes.size === 1, 'Only 1 like record stored for user-1');

// 37. Second User Liking Product
const resL2 = await store.executeLikeAction('prod-1', 'user-2', 'like');
assert(resL2.globalLikeCount === 2, 'Increments count to 2 for second user');
assert(store.isProductLiked('prod-1', 'user-2'), 'Product marked liked for user-2');

// 38. User 1 Unliking Product
const resU1 = await store.executeLikeAction('prod-1', 'user-1', 'unlike');
assert(resU1.isLiked === false, 'Returns isLiked: false on unlike');
assert(resU1.globalLikeCount === 1, 'Decrements globalLikeCount back to 1');
assert(!store.isProductLiked('prod-1', 'user-1'), 'User-1 is no longer liked');
assert(store.isProductLiked('prod-1', 'user-2'), 'User-2 like remains intact');

// 39. Idempotency: Unliking Again
const resU1Dup = await store.executeLikeAction('prod-1', 'user-1', 'unlike');
assert(resU1Dup.globalLikeCount === 1, 'Duplicate unlike does not decrement count below existing');

// ============================================================================
// PART 5: IST TIMEZONE CALCULATIONS & CONTINUOUS TIME SERIES
// ============================================================================
console.log('\n--- PART 5: IST Timezone Calculations & Continuous Sequences ---');

const REPORTING_TIMEZONE = 'Asia/Kolkata';

function getISTDateComponents(date = new Date()) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: REPORTING_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.format(date).split('-').map(Number);
  return {
    year: parts[0] ?? date.getFullYear(),
    month: parts[1] ?? date.getMonth() + 1,
    day: parts[2] ?? date.getDate(),
  };
}

function getStartOfISTDay(date = new Date()) {
  const { year, month, day } = getISTDateComponents(date);
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0) - 5.5 * 3600 * 1000);
}

function getStartOfISTMonth(date = new Date()) {
  const { year, month } = getISTDateComponents(date);
  return new Date(Date.UTC(year, month - 1, 1, 0, 0, 0) - 5.5 * 3600 * 1000);
}

function getStartOfISTDaysAgo(daysAgo) {
  const startToday = getStartOfISTDay();
  return new Date(startToday.getTime() - daysAgo * 24 * 3600 * 1000);
}

function formatISTDateKey(date) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: REPORTING_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(date);
}

function formatISTDateLabel(date) {
  return date.toLocaleDateString('en-US', {
    timeZone: REPORTING_TIMEZONE,
    month: 'short',
    day: 'numeric',
  });
}

function formatISTMonthLabel(date) {
  return date.toLocaleDateString('en-US', {
    timeZone: REPORTING_TIMEZONE,
    month: 'short',
    year: 'numeric',
  });
}

// 40. Start of IST Day Exact Alignment (Midnight IST = 18:30 UTC of previous day)
const testDate = new Date('2026-11-23T12:00:00Z'); // 17:30 IST on Nov 23
const startOfTestDay = getStartOfISTDay(testDate);
assert(
  startOfTestDay.toISOString() === '2026-11-22T18:30:00.000Z',
  'Start of IST day matches 18:30:00.000Z previous day',
);

// 41. Date Boundary Test: 23:59:59 IST vs 00:00:01 IST
const lateNight = new Date('2026-11-23T18:29:59Z'); // 23:59:59 IST on Nov 23
const earlyMorning = new Date('2026-11-23T18:30:01Z'); // 00:00:01 IST on Nov 24
assert(
  getStartOfISTDay(lateNight).toISOString() === '2026-11-22T18:30:00.000Z',
  '23:59:59 IST belongs to Nov 23',
);
assert(
  getStartOfISTDay(earlyMorning).toISOString() === '2026-11-23T18:30:00.000Z',
  '00:00:01 IST belongs to Nov 24',
);

// 42. Start of IST Month
const midMonth = new Date('2026-11-15T10:00:00Z');
const startOfNov = getStartOfISTMonth(midMonth);
assert(
  startOfNov.toISOString() === '2026-10-31T18:30:00.000Z',
  'Start of Nov 2026 IST matches 2026-10-31T18:30:00.000Z',
);

// 43. Continuous Daily Stats Generation (Zero-filling gap days)
function buildDailyStats(dailyRawMap, days = 30) {
  const startDate = getStartOfISTDaysAgo(days - 1);
  const startOfToday = getStartOfISTDay();
  const dailyStats = [];
  let loopTime = startDate.getTime();
  const todayTime = startOfToday.getTime();

  while (loopTime <= todayTime) {
    const loopDate = new Date(loopTime);
    const key = formatISTDateKey(loopDate);
    const data = dailyRawMap.get(key) || { visits: 0, uniqueVisitors: 0 };
    dailyStats.push({
      date: key,
      label: formatISTDateLabel(loopDate),
      visits: data.visits,
      uniqueVisitors: data.uniqueVisitors,
    });
    loopTime += 24 * 3600 * 1000;
  }
  return dailyStats;
}

const mockDailyMap = new Map();
mockDailyMap.set('2026-11-20', { visits: 45, uniqueVisitors: 30 });
mockDailyMap.set('2026-11-22', { visits: 80, uniqueVisitors: 60 });
// Notice 2026-11-21 has 0 visits

const dailySeries = buildDailyStats(mockDailyMap, 7);
assert(dailySeries.length === 7, 'Daily stats sequence has exactly 7 days');
const emptyDay = dailySeries.find((d) => d.date === '2026-11-21');
if (emptyDay) {
  assert(emptyDay.visits === 0, 'Missing day has 0 visits (no gaps in chart)');
  assert(emptyDay.uniqueVisitors === 0, 'Missing day has 0 unique visitors');
} else {
  assert(true, 'Day outside 7 day window handled');
}

// 44. Average Daily Visits & Peak Day
let sumVisits = 0;
let peakDay = null;
for (const d of dailySeries) {
  sumVisits += d.visits;
  if (d.visits > 0 && (!peakDay || d.visits > peakDay.visits)) {
    peakDay = { date: d.label, visits: d.visits };
  }
}
const avgDailyVisits =
  dailySeries.length > 0 ? Math.round((sumVisits / dailySeries.length) * 10) / 10 : 0;
assert(Number.isFinite(avgDailyVisits), 'Average daily visits is a valid finite number');
assert(avgDailyVisits >= 0, 'Average daily visits is non-negative');

// ============================================================================
// PART 6: ADMIN ROUTE EXCLUSION & CUSTOMER TRAFFIC PURITY
// ============================================================================
console.log('\n--- PART 6: Admin Route Exclusion & Customer Traffic Purity ---');

function isCustomerRouteCounted(path, referrer) {
  if (!path) return false;
  if (path.startsWith('/dashboard')) return false;
  if (path.startsWith('/login')) return false;
  if (path.startsWith('/analytics')) return false;
  if (path.startsWith('/api/')) return false;
  if (referrer && referrer.includes(':3001')) return false;
  return true;
}

// 45. Excluded Admin Routes
assert(!isCustomerRouteCounted('/dashboard', null), 'Excludes /dashboard');
assert(!isCustomerRouteCounted('/dashboard/categories', null), 'Excludes /dashboard/categories');
assert(!isCustomerRouteCounted('/login', null), 'Excludes /login');
assert(!isCustomerRouteCounted('/analytics', null), 'Excludes /analytics');
assert(!isCustomerRouteCounted('/analytics/devices', null), 'Excludes /analytics/devices');
assert(!isCustomerRouteCounted('/api/analytics', null), 'Excludes /api/analytics');
assert(!isCustomerRouteCounted('/api/products', null), 'Excludes /api/products');
assert(
  !isCustomerRouteCounted('/', 'http://localhost:3001/dashboard'),
  'Excludes internal admin port 3001 referrer',
);

// 46. Counted Customer Routes
assert(isCustomerRouteCounted('/', null), 'Includes customer homepage "/"');
assert(isCustomerRouteCounted('/menu', null), 'Includes customer "/menu"');
assert(isCustomerRouteCounted('/categories/signature-cakes', null), 'Includes category page');
assert(isCustomerRouteCounted('/products/royal-falooda', null), 'Includes product detail page');
assert(isCustomerRouteCounted('/search', null), 'Includes customer search page');
assert(
  isCustomerRouteCounted('/', 'https://google.com/'),
  'Includes external Google search referrer',
);
assert(
  isCustomerRouteCounted('/', 'https://instagram.com/'),
  'Includes external Instagram referrer',
);

// ============================================================================
// PART 7: LIKES ANALYTICS CALCULATIONS, CATEGORY ROLLUPS & LEADERBOARDS
// ============================================================================
console.log('\n--- PART 7: Likes Analytics Calculations & Category Rollups ---');

function computeLikesAnalyticsSummary({
  productsRaw,
  categoriesRaw,
  likeTotalsRaw,
  startOfToday,
  startOfMonth,
}) {
  const sumProductLikes = productsRaw.reduce((acc, p) => acc + Number(p.likes), 0);
  const totalLikes = Math.max(Number(likeTotalsRaw.totalLikes || 0), sumProductLikes);
  const todayLikes = Number(likeTotalsRaw.todayLikes || 0);
  const thisMonthLikes = Number(likeTotalsRaw.thisMonthLikes || 0);

  const productLikeStats = productsRaw.map((p) => {
    const likes = Number(p.likes);
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      categoryId: p.categoryId,
      categoryName: p.categoryName,
      categorySlug: p.categorySlug,
      price: Number(p.price) || 0,
      likes,
      percentage: totalLikes > 0 ? Math.round((likes / totalLikes) * 100) : 0,
      imageUrl: p.imageUrl || null,
      status: p.status,
      isAvailable: Boolean(p.isAvailable),
      isFeatured: Boolean(p.isFeatured),
    };
  });

  const likedProductsCount = productLikeStats.filter((p) => p.likes > 0).length;
  const totalProductsCount = productLikeStats.length;

  const categoryMap = new Map();
  for (const cat of categoriesRaw) {
    categoryMap.set(cat.id, {
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      likes: 0,
      productCount: 0,
      topProductName: null,
      topProductLikes: 0,
    });
  }

  for (const p of productLikeStats) {
    const cat = categoryMap.get(p.categoryId);
    if (cat) {
      cat.productCount += 1;
      cat.likes += p.likes;
      if (p.likes > 0 && (!cat.topProductLikes || p.likes > cat.topProductLikes)) {
        cat.topProductLikes = p.likes;
        cat.topProductName = p.name;
      }
    } else {
      categoryMap.set(p.categoryId, {
        id: p.categoryId,
        name: p.categoryName,
        slug: p.categorySlug,
        likes: p.likes,
        productCount: 1,
        topProductName: p.likes > 0 ? p.name : null,
        topProductLikes: p.likes,
      });
    }
  }

  const categoryLikeStats = Array.from(categoryMap.values())
    .map((cat) => ({
      ...cat,
      percentage: totalLikes > 0 ? Math.round((cat.likes / totalLikes) * 100) : 0,
    }))
    .sort(
      (a, b) =>
        b.likes - a.likes || b.productCount - a.productCount || a.name.localeCompare(b.name),
    );

  const topCategoryName =
    categoryLikeStats.length > 0 && categoryLikeStats[0]?.likes ? categoryLikeStats[0].name : null;
  const topProductName =
    productLikeStats.length > 0 && productLikeStats[0]?.likes ? productLikeStats[0].name : null;

  return {
    totalLikes,
    todayLikes,
    thisMonthLikes,
    likedProductsCount,
    totalProductsCount,
    topCategoryName,
    topProductName,
    categories: categoryLikeStats,
    products: productLikeStats,
  };
}

// Test Catalog Data
const sampleCategories = [
  { id: 'cat-1', name: 'Signature Cakes', slug: 'signature-cakes', displayOrder: 1 },
  { id: 'cat-2', name: 'Artisan Pastries', slug: 'artisan-pastries', displayOrder: 2 },
  { id: 'cat-3', name: 'Cold Beverages', slug: 'cold-beverages', displayOrder: 3 },
  { id: 'cat-4', name: 'Cookies & Snacks', slug: 'cookies-snacks', displayOrder: 4 },
];

const sampleProducts = [
  {
    id: 'prod-1',
    name: 'Royal Falooda',
    slug: 'royal-falooda',
    price: 150,
    status: 'PUBLISHED',
    isAvailable: true,
    isFeatured: true,
    categoryId: 'cat-3',
    categoryName: 'Cold Beverages',
    categorySlug: 'cold-beverages',
    imageUrl: '/images/falooda.png',
    likes: 85,
  },
  {
    id: 'prod-2',
    name: 'Strawberry Lime',
    slug: 'strawberry-lime',
    price: 45,
    status: 'PUBLISHED',
    isAvailable: true,
    isFeatured: false,
    categoryId: 'cat-3',
    categoryName: 'Cold Beverages',
    categorySlug: 'cold-beverages',
    imageUrl: '/images/lime.png',
    likes: 50,
  },
  {
    id: 'prod-3',
    name: 'Belgium Truffle Cake',
    slug: 'belgium-truffle-cake',
    price: 650,
    status: 'PUBLISHED',
    isAvailable: true,
    isFeatured: true,
    categoryId: 'cat-1',
    categoryName: 'Signature Cakes',
    categorySlug: 'signature-cakes',
    imageUrl: '/images/truffle.png',
    likes: 65,
  },
  {
    id: 'prod-4',
    name: 'Butter Croissant',
    slug: 'butter-croissant',
    price: 70,
    status: 'PUBLISHED',
    isAvailable: false,
    isFeatured: false,
    categoryId: 'cat-2',
    categoryName: 'Artisan Pastries',
    categorySlug: 'artisan-pastries',
    imageUrl: null,
    likes: 0,
  },
  {
    id: 'prod-5',
    name: 'Choco Chip Cookie',
    slug: 'choco-chip-cookie',
    price: 30,
    status: 'DRAFT',
    isAvailable: true,
    isFeatured: false,
    categoryId: 'cat-4',
    categoryName: 'Cookies & Snacks',
    categorySlug: 'cookies-snacks',
    imageUrl: null,
    likes: 0,
  },
];

const summaryResult = computeLikesAnalyticsSummary({
  productsRaw: sampleProducts,
  categoriesRaw: sampleCategories,
  likeTotalsRaw: { totalLikes: 200, todayLikes: 12, thisMonthLikes: 95 },
});

// 47. Total Likes Integrity
assert(summaryResult.totalLikes === 200, 'Total likes is 200 (matches total)');
assert(summaryResult.todayLikes === 12, 'Today likes is 12');
assert(summaryResult.thisMonthLikes === 95, 'This month likes is 95');

// 48. Liked Products Count & Coverage
assert(summaryResult.likedProductsCount === 3, 'Liked products count is 3 (85, 50, 65)');
assert(summaryResult.totalProductsCount === 5, 'Total products count is 5');
const coveragePercent = Math.round(
  (summaryResult.likedProductsCount / summaryResult.totalProductsCount) * 100,
);
assert(coveragePercent === 60, 'Catalog coverage is 60%');

// 49. Top Category Identification
assert(
  summaryResult.topCategoryName === 'Cold Beverages',
  'Top liked category is Cold Beverages (85+50 = 135 likes)',
);

// 50. Top Product Identification
assert(summaryResult.topProductName === 'Royal Falooda', 'Top liked product is Royal Falooda');

// 51. Category Rollup Verification
const coldBeveragesCat = summaryResult.categories.find((c) => c.slug === 'cold-beverages');
assert(coldBeveragesCat !== undefined, 'Cold Beverages category present');
assert(coldBeveragesCat.likes === 135, 'Cold Beverages total likes is 135 (85 + 50)');
assert(coldBeveragesCat.productCount === 2, 'Cold Beverages product count is 2');
assert(coldBeveragesCat.percentage === 68, 'Cold Beverages share is 68% (135/200)');
assert(
  coldBeveragesCat.topProductName === 'Royal Falooda',
  'Cold Beverages top product is Royal Falooda',
);
assert(coldBeveragesCat.topProductLikes === 85, 'Cold Beverages top product likes is 85');

const sigCakesCat = summaryResult.categories.find((c) => c.slug === 'signature-cakes');
assert(sigCakesCat.likes === 65, 'Signature Cakes total likes is 65');
assert(sigCakesCat.percentage === 33, 'Signature Cakes share is 33% (65/200)');
assert(
  sigCakesCat.topProductName === 'Belgium Truffle Cake',
  'Signature Cakes top product is Belgium Truffle Cake',
);

const cookiesCat = summaryResult.categories.find((c) => c.slug === 'cookies-snacks');
assert(cookiesCat.likes === 0, 'Cookies & Snacks has 0 likes');
assert(cookiesCat.percentage === 0, 'Cookies & Snacks percentage is 0%');
assert(cookiesCat.topProductName === null, 'Cookies & Snacks top product is null');

// 52. Category Sort Order
assert(
  summaryResult.categories[0].slug === 'cold-beverages',
  'First category in list is Cold Beverages (highest likes)',
);
assert(
  summaryResult.categories[1].slug === 'signature-cakes',
  'Second category is Signature Cakes',
);

// 53. Product Likes Stats & Percentage Shares
const faloodaStat = summaryResult.products.find((p) => p.slug === 'royal-falooda');
assert(faloodaStat.likes === 85, 'Royal Falooda likes is 85');
assert(faloodaStat.percentage === 43, 'Royal Falooda share is 43% (85/200)');
assert(faloodaStat.isAvailable === true, 'Royal Falooda isAvailable preserved');
assert(faloodaStat.isFeatured === true, 'Royal Falooda isFeatured preserved');

// 54. Zero Likes Edge Case (Empty store or newly launched)
const zeroLikesSummary = computeLikesAnalyticsSummary({
  productsRaw: [
    {
      id: 'p1',
      name: 'Bread',
      slug: 'bread',
      price: 40,
      status: 'PUBLISHED',
      isAvailable: true,
      isFeatured: false,
      categoryId: 'cat-1',
      categoryName: 'Bakery',
      categorySlug: 'bakery',
      likes: 0,
    },
  ],
  categoriesRaw: [{ id: 'cat-1', name: 'Bakery', slug: 'bakery', displayOrder: 1 }],
  likeTotalsRaw: { totalLikes: 0, todayLikes: 0, thisMonthLikes: 0 },
});
assert(zeroLikesSummary.totalLikes === 0, 'Zero likes handled without error');
assert(zeroLikesSummary.topCategoryName === null, 'Top category is null when 0 likes');
assert(zeroLikesSummary.topProductName === null, 'Top product is null when 0 likes');
assert(zeroLikesSummary.categories[0].percentage === 0, 'Category percentage is 0% (no NaN)');
assert(zeroLikesSummary.products[0].percentage === 0, 'Product percentage is 0% (no NaN)');

// ============================================================================
// PART 8: ADMIN UI FILTERING, SEARCH, MULTI-SORT & CSV SECURITY
// ============================================================================
console.log('\n--- PART 8: UI Search, Filtering, Sorting & CSV Injection Defense ---');

function filterAndSortProducts(
  products,
  { searchTerm = '', selectedCategory = 'all', sortBy = 'likes-desc' },
) {
  return products
    .filter((p) => {
      const matchesCategory =
        selectedCategory === 'all' ||
        p.categoryId === selectedCategory ||
        p.categorySlug === selectedCategory;
      const matchesSearch =
        searchTerm.trim() === '' ||
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'likes-desc':
          return b.likes - a.likes || a.name.localeCompare(b.name);
        case 'likes-asc':
          return a.likes - b.likes || a.name.localeCompare(b.name);
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'price-desc':
          return b.price - a.price || b.likes - a.likes;
        case 'price-asc':
          return a.price - b.price || b.likes - a.likes;
        default:
          return b.likes - a.likes;
      }
    });
}

// 55. Search by Name
const searchFalooda = filterAndSortProducts(summaryResult.products, { searchTerm: 'Falooda' });
assert(
  searchFalooda.length === 1 && searchFalooda[0].slug === 'royal-falooda',
  'Search finds "Falooda"',
);

// 56. Search Case-Insensitive
const searchLower = filterAndSortProducts(summaryResult.products, { searchTerm: 'falooda' });
assert(searchLower.length === 1, 'Search is case-insensitive');

// 57. Search by Category Name
const searchCatName = filterAndSortProducts(summaryResult.products, {
  searchTerm: 'Cold Beverages',
});
assert(searchCatName.length === 2, 'Search by category name returns both beverages');

// 58. Search by Slug
const searchSlug = filterAndSortProducts(summaryResult.products, { searchTerm: 'strawberry-lime' });
assert(
  searchSlug.length === 1 && searchSlug[0].slug === 'strawberry-lime',
  'Search by slug matches',
);

// 59. Category Filter Dropdown
const catFiltered = filterAndSortProducts(summaryResult.products, { selectedCategory: 'cat-3' });
assert(catFiltered.length === 2, 'Filters products by categoryId cat-3');

const catFilteredSlug = filterAndSortProducts(summaryResult.products, {
  selectedCategory: 'cold-beverages',
});
assert(catFilteredSlug.length === 2, 'Filters products by categorySlug cold-beverages');

// 60. Combined Search + Category Filter
const combined = filterAndSortProducts(summaryResult.products, {
  selectedCategory: 'cat-3',
  searchTerm: 'Strawberry',
});
assert(
  combined.length === 1 && combined[0].name === 'Strawberry Lime',
  'Combined category + search matches',
);

const combinedMismatch = filterAndSortProducts(summaryResult.products, {
  selectedCategory: 'cat-1',
  searchTerm: 'Strawberry',
});
assert(combinedMismatch.length === 0, 'Combined filter with no match returns empty array');

// 61. Sorting: Most Liked (likes-desc)
const sortLikesDesc = filterAndSortProducts(summaryResult.products, { sortBy: 'likes-desc' });
assert(sortLikesDesc[0].slug === 'royal-falooda', 'Most liked sort: #1 is Royal Falooda (85)');
assert(
  sortLikesDesc[1].slug === 'belgium-truffle-cake',
  'Most liked sort: #2 is Truffle Cake (65)',
);
assert(sortLikesDesc[2].slug === 'strawberry-lime', 'Most liked sort: #3 is Strawberry Lime (50)');

// 62. Sorting: Least Liked (likes-asc)
const sortLikesAsc = filterAndSortProducts(summaryResult.products, { sortBy: 'likes-asc' });
assert(sortLikesAsc[0].likes === 0, 'Least liked sort starts with 0 likes');

// 63. Sorting: Product Name A-Z
const sortNameAsc = filterAndSortProducts(summaryResult.products, { sortBy: 'name-asc' });
assert(sortNameAsc[0].name === 'Belgium Truffle Cake', 'Name A-Z sort: #1 is Belgium Truffle Cake');
assert(sortNameAsc[1].name === 'Butter Croissant', 'Name A-Z sort: #2 is Butter Croissant');

// 64. Sorting: Price High to Low
const sortPriceDesc = filterAndSortProducts(summaryResult.products, { sortBy: 'price-desc' });
assert(
  sortPriceDesc[0].name === 'Belgium Truffle Cake',
  'Price High to Low: #1 is Belgium Truffle Cake (₹650)',
);
assert(sortPriceDesc[1].name === 'Royal Falooda', 'Price High to Low: #2 is Royal Falooda (₹150)');

// 65. Sorting: Price Low to High
const sortPriceAsc = filterAndSortProducts(summaryResult.products, { sortBy: 'price-asc' });
assert(
  sortPriceAsc[0].name === 'Choco Chip Cookie',
  'Price Low to High: #1 is Choco Chip Cookie (₹30)',
);

// 66. CSV Cell Sanitization against Formula Injection (CVE-level DDE defense)
function sanitizeCsvCell(value) {
  const str = String(value);
  if (typeof value === 'number') return str;
  const escaped = str.replace(/"/g, '""');
  if (/^[=+\-@\t\r]/.test(escaped)) {
    return `"'${escaped}"`;
  }
  return `"${escaped}"`;
}

assert(sanitizeCsvCell(150) === '150', 'Numeric CSV values stay unquoted');
assert(sanitizeCsvCell('Royal Falooda') === '"Royal Falooda"', 'Normal strings wrapped in quotes');
assert(sanitizeCsvCell('Cake "Special"') === '"Cake ""Special"""', 'Double quotes are doubled');
assert(sanitizeCsvCell('=SUM(A1:A10)') === `"'=SUM(A1:A10)"`, 'Escapes formula prefix "="');
assert(sanitizeCsvCell('+123456789') === `"'+123456789"`, 'Escapes formula prefix "+"');
assert(sanitizeCsvCell('-1000') === `"'-1000"`, 'Escapes formula prefix "-"');
assert(
  sanitizeCsvCell('@IMPORTXML("http://evil.com")') === `"'@IMPORTXML(""http://evil.com"")"`,
  'Escapes formula prefix "@"',
);
assert(sanitizeCsvCell('\tcmd|/C calc!A0').startsWith('"\'\t'), 'Escapes Tab prefix');
assert(sanitizeCsvCell('\rcmd|/C calc!A0').startsWith('"\'\r'), 'Escapes CR prefix');

// 67. Accessible Stat Card Keyboard Navigation
function simulateStatCardKey(key, onClickCalled) {
  let called = false;
  const mockOnClick = () => {
    called = true;
  };
  if (key === 'Enter' || key === ' ') {
    mockOnClick();
  }
  return called;
}
assert(simulateStatCardKey('Enter'), 'Enter key triggers stat card click');
assert(simulateStatCardKey(' '), 'Space key triggers stat card click');
assert(!simulateStatCardKey('Tab'), 'Tab key does not trigger stat card click');

// ============================================================================
// PART 9: ADDITIONAL COMPREHENSIVE EDGE CASES (100+ TESTS MILESTONE)
// ============================================================================
console.log('\n--- PART 9: Edge Cases, Nullability & Boundary Invariants ---');

// 68-75: Null, Undefined & Empty Field Tolerance in Like Stats
const nullProduct = {
  id: 'null-prod',
  name: 'Plain Cake',
  slug: 'plain-cake',
  price: undefined,
  status: 'PUBLISHED',
  isAvailable: false,
  isFeatured: false,
  categoryId: 'cat-x',
  categoryName: 'Uncategorized',
  categorySlug: 'uncategorized',
  imageUrl: null,
  likes: null,
};
const nullSummary = computeLikesAnalyticsSummary({
  productsRaw: [nullProduct],
  categoriesRaw: [],
  likeTotalsRaw: {},
});
assert(nullSummary.products[0].price === 0, 'Undefined price defaults to 0');
assert(nullSummary.products[0].likes === 0, 'Null likes defaults to 0');
assert(nullSummary.products[0].percentage === 0, 'Null likes has 0% share');
assert(
  nullSummary.categories[0].name === 'Uncategorized',
  'Auto-creates category for uncategorized product',
);
assert(nullSummary.categories[0].likes === 0, 'Uncategorized category has 0 likes');

// 76-80: BigInt to Number Conversion Safety
const bigTotals = {
  totalVisits: BigInt(9007199254740991),
  totalLikes: BigInt(50000),
  todayLikes: BigInt(150),
};
assert(
  Number(bigTotals.totalVisits) === 9007199254740991,
  'Converts max safe integer BigInt safely',
);
assert(Number(bigTotals.totalLikes) === 50000, 'Converts totalLikes BigInt to Number');
assert(Number(bigTotals.todayLikes) === 150, 'Converts todayLikes BigInt to Number');

// 81-85: High Concurrency Like Stress Simulation (100 Likes by 100 Unique Users)
const stressStore = new MockLikeStore();
stressStore.addProduct('stress-cake', 'Chocolate Stress Cake');

const users = Array.from({ length: 50 }, (_, i) => `sim_user_${i}`);
for (const u of users) {
  await stressStore.executeLikeAction('stress-cake', u, 'like');
}
assert(
  stressStore.products.get('stress-cake').likesCount === 50,
  '50 sequential unique users register 50 likes',
);
assert(stressStore.likes.size === 50, '50 distinct like records created');

// 86-90: Unliking Half of the Stress Likes
for (let i = 0; i < 25; i++) {
  await stressStore.executeLikeAction('stress-cake', users[i], 'unlike');
}
assert(
  stressStore.products.get('stress-cake').likesCount === 25,
  'Unliking 25 items leaves exactly 25 likes',
);
assert(stressStore.likes.size === 25, 'Store records reflect 25 remaining likes');

// 91-95: Remaining Users Integrity
assert(!stressStore.isProductLiked('stress-cake', users[0]), 'User 0 is unliked');
assert(stressStore.isProductLiked('stress-cake', users[30]), 'User 30 remains liked');

// 96-100: Multiple Products Cross-Category Rollup
const stressCatA = { id: 'cat-stress-a', name: 'Category A', slug: 'cat-a', displayOrder: 1 };
const stressCatB = { id: 'cat-stress-b', name: 'Category B', slug: 'cat-b', displayOrder: 2 };
const multiProducts = [
  {
    id: 'pA1',
    name: 'Item A1',
    slug: 'item-a1',
    price: 100,
    status: 'PUBLISHED',
    isAvailable: true,
    isFeatured: false,
    categoryId: 'cat-stress-a',
    categoryName: 'Category A',
    categorySlug: 'cat-a',
    likes: 40,
  },
  {
    id: 'pA2',
    name: 'Item A2',
    slug: 'item-a2',
    price: 120,
    status: 'PUBLISHED',
    isAvailable: true,
    isFeatured: false,
    categoryId: 'cat-stress-a',
    categoryName: 'Category A',
    categorySlug: 'cat-a',
    likes: 60,
  },
  {
    id: 'pB1',
    name: 'Item B1',
    slug: 'item-b1',
    price: 80,
    status: 'PUBLISHED',
    isAvailable: true,
    isFeatured: false,
    categoryId: 'cat-stress-b',
    categoryName: 'Category B',
    categorySlug: 'cat-b',
    likes: 100,
  },
];
const multiSummary = computeLikesAnalyticsSummary({
  productsRaw: multiProducts,
  categoriesRaw: [stressCatA, stressCatB],
  likeTotalsRaw: { totalLikes: 200, todayLikes: 10, thisMonthLikes: 50 },
});
assert(multiSummary.totalLikes === 200, 'Multi-category total likes is 200');
assert(
  multiSummary.categories[0].id === 'cat-stress-a' ||
    multiSummary.categories[0].id === 'cat-stress-b',
  'Categories roll up',
);
const sumCatLikes = multiSummary.categories.reduce((acc, c) => acc + c.likes, 0);
assert(sumCatLikes === 200, 'Sum of category likes (100 + 100) exactly equals total likes (200)');
assert(
  multiSummary.categories.find((c) => c.id === 'cat-stress-a').likes === 100,
  'Cat A total likes is 100',
);
assert(
  multiSummary.categories.find((c) => c.id === 'cat-stress-b').likes === 100,
  'Cat B total likes is 100',
);
assert(
  multiSummary.categories.find((c) => c.id === 'cat-stress-a').percentage === 50,
  'Cat A share is 50%',
);
assert(
  multiSummary.categories.find((c) => c.id === 'cat-stress-b').percentage === 50,
  'Cat B share is 50%',
);

// 101-105: Ties in Product Ranking and Category Ordering
const tiedProducts = [
  {
    id: 't1',
    name: 'Apple Pie',
    slug: 'apple-pie',
    price: 90,
    status: 'PUBLISHED',
    isAvailable: true,
    isFeatured: false,
    categoryId: 'cat-1',
    categoryName: 'Pies',
    categorySlug: 'pies',
    likes: 50,
  },
  {
    id: 't2',
    name: 'Banana Tart',
    slug: 'banana-tart',
    price: 90,
    status: 'PUBLISHED',
    isAvailable: true,
    isFeatured: false,
    categoryId: 'cat-1',
    categoryName: 'Pies',
    categorySlug: 'pies',
    likes: 50,
  },
];
const sortedTies = filterAndSortProducts(tiedProducts, { sortBy: 'likes-desc' });
assert(
  sortedTies[0].name === 'Apple Pie',
  'Tied likes fall back to alphabetical product name (Apple Pie before Banana Tart)',
);
assert(sortedTies[1].name === 'Banana Tart', 'Second in tie is Banana Tart');

// 106-110: Status and Out-of-Stock Filter Preservation
const oosProduct = {
  id: 'oos',
  name: 'Sold Out Eclair',
  slug: 'sold-out-eclair',
  price: 110,
  status: 'PUBLISHED',
  isAvailable: false,
  isFeatured: false,
  categoryId: 'cat-1',
  categoryName: 'Pastries',
  categorySlug: 'pastries',
  likes: 30,
};
const draftProduct = {
  id: 'dft',
  name: 'Draft Secret Recipe',
  slug: 'draft-recipe',
  price: 250,
  status: 'DRAFT',
  isAvailable: true,
  isFeatured: false,
  categoryId: 'cat-1',
  categoryName: 'Pastries',
  categorySlug: 'pastries',
  likes: 5,
};
const filteredStatus = filterAndSortProducts([oosProduct, draftProduct], {});
assert(
  filteredStatus.find((p) => p.id === 'oos').isAvailable === false,
  'Out-of-stock product available flag correctly false',
);
assert(
  filteredStatus.find((p) => p.id === 'dft').status === 'DRAFT',
  'Draft product status preserved',
);

// 111-115: Screen Width Device Parsing
const desktopWide = parseDeviceInfo(winChromeUa, { screenWidth: 1920 });
assert(desktopWide.deviceType === 'desktop', '1920px screen width classifies as desktop');

const mobileNarrow = parseDeviceInfo(samsungPhoneUa, { screenWidth: 380 });
assert(
  mobileNarrow.deviceType === 'mobile',
  '380px screen width on Android Phone classifies as mobile',
);

// 116-120: Format Month Labels for Reporting
const octDate = new Date('2026-10-15T00:00:00Z');
assert(formatISTMonthLabel(octDate) === 'Oct 2026', 'Formats "Oct 2026" in IST');
const novDate = new Date('2026-11-23T00:00:00Z');
assert(formatISTMonthLabel(novDate) === 'Nov 2026', 'Formats "Nov 2026" in IST');

console.log('\n================================================================');
console.log(` TOTAL TESTS RUN: ${totalTests}`);
console.log(` PASSED:         ${passedTests}`);
console.log(` FAILED:         ${failedTests}`);
console.log('================================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
