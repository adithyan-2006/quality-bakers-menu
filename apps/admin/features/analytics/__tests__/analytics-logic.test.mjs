/* eslint-disable */
/**
 * Analytics Logic Unit Tests
 *
 * Run with: node apps/admin/features/analytics/__tests__/analytics-logic.test.mjs
 *
 * Tests the pure business logic extracted from prisma-analytics-repo.ts and
 * the tracking route. No database or framework dependencies required.
 */

let passed = 0;
let failed = 0;

function assert(condition, label) {
  if (condition) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${label}`);
    failed++;
  }
}

function assertEqual(actual, expected, label) {
  if (actual === expected) {
    console.log(`  ✓ ${label}`);
    passed++;
  } else {
    console.error(
      `  ✗ FAIL: ${label} — expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`,
    );
    failed++;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers replicated from prisma-analytics-repo.ts
// ─────────────────────────────────────────────────────────────────────────────

function formatDateKey(date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDateLabel(date) {
  return date.toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric' });
}

function formatMonthKey(date) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Bot regex from the fixed tracking routes
// ─────────────────────────────────────────────────────────────────────────────

const BOT_REGEX =
  /googlebot|bingbot|yandexbot|duckduckbot|baiduspider|slurp|ia_archiver|ahrefsbot|semrushbot|dotbot|mj12bot|petalbot|facebookexternalhit|twitterbot|linkedinbot|applebot|headlesschrome|phantomjs|puppeteer|playwright|selenium|webdriver|python-requests|python-urllib|go-http|java\/|curl\/|wget\/|libwww|okhttp|axios|node-fetch|scrapy|httrack|nutch|heritrix/i;

// ─────────────────────────────────────────────────────────────────────────────
// CSV sanitizer from analytics-dashboard-view.tsx
// ─────────────────────────────────────────────────────────────────────────────

function sanitizeCsvCell(value) {
  const str = String(value);
  if (typeof value === 'number') return str;
  const escaped = str.replace(/"/g, '""');
  if (/^[=+\-@\t\r]/.test(escaped)) {
    return `"'${escaped}"`;
  }
  return `"${escaped}"`;
}

// ─────────────────────────────────────────────────────────────────────────────
// avgDailyVisits logic
// ─────────────────────────────────────────────────────────────────────────────

function computeAvgDailyVisits(dailyStats) {
  let sum = 0;
  for (const d of dailyStats) sum += d.visits;
  return dailyStats.length > 0 ? Math.round((sum / dailyStats.length) * 10) / 10 : 0;
}

// ─────────────────────────────────────────────────────────────────────────────
// peakDay logic
// ─────────────────────────────────────────────────────────────────────────────

function computePeakDay(dailyStats) {
  let peakDay = null;
  for (const d of dailyStats) {
    if (d.visits > 0 && (!peakDay || d.visits > peakDay.visits)) {
      peakDay = { date: d.label, visits: d.visits };
    }
  }
  return peakDay;
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST SUITE 1: Date formatting utilities
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n─── Suite 1: Date Formatting ───────────────────────────────────────────────');

const knownDate = new Date('2026-10-21T14:30:00Z');
assertEqual(formatDateKey(knownDate), '2026-10-21', 'formatDateKey produces YYYY-MM-DD in UTC');
assertEqual(formatMonthKey(knownDate), '2026-10', 'formatMonthKey produces YYYY-MM in UTC');

// Verify UTC not local (IST = UTC+5:30, so UTC date of 2026-10-17T20:00:00Z is still Oct 17)
const midnightIstAsUtc = new Date('2026-10-17T20:00:00Z'); // midnight IST = 18:30 UTC previous day is actually 2026-10-17T18:30:00Z
assertEqual(
  formatDateKey(new Date('2026-10-17T18:30:00Z')),
  '2026-10-17',
  'UTC date correct for IST midnight boundary',
);

// ─────────────────────────────────────────────────────────────────────────────
// TEST SUITE 2: Bot Filtering
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n─── Suite 2: Bot Filtering ─────────────────────────────────────────────────');

// Old bots (should still match)
assert(
  BOT_REGEX.test('Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'),
  'Googlebot detected',
);
assert(
  BOT_REGEX.test('Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)'),
  'Bingbot detected',
);
assert(
  BOT_REGEX.test('DuckDuckBot/1.0; (+http://duckduckgo.com/duckduckbot.html)'),
  'DuckDuckBot detected',
);

// NEW: headless / automation bots
assert(
  BOT_REGEX.test(
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/88.0 Safari/537.36',
  ),
  'HeadlessChrome detected',
);
assert(BOT_REGEX.test('python-requests/2.28.0'), 'python-requests detected');
assert(BOT_REGEX.test('curl/7.85.0'), 'curl detected');
assert(BOT_REGEX.test('axios/1.1.3'), 'axios detected');
assert(BOT_REGEX.test('python-urllib/3.11'), 'python-urllib detected');
assert(BOT_REGEX.test('Scrapy/2.7.0 (+https://scrapy.org)'), 'Scrapy detected');
assert(BOT_REGEX.test('AhrefsBot/7.0; +http://ahrefs.com/robot/'), 'AhrefsBot detected');
assert(BOT_REGEX.test('SemrushBot/7.0; +http://www.semrush.com/bot.html'), 'SemrushBot detected');

// Real browsers (should NOT match)
assert(
  !BOT_REGEX.test(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  ),
  'Chrome real browser not flagged',
);
assert(
  !BOT_REGEX.test(
    'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
  ),
  'Mobile Safari not flagged',
);

// ─────────────────────────────────────────────────────────────────────────────
// TEST SUITE 3: CSV Injection Protection
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n─── Suite 3: CSV Injection Sanitization ────────────────────────────────────');

// Formula injection characters must be escaped
const formulaPayload1 = '=SUM(1+1)';
const sanitized1 = sanitizeCsvCell(formulaPayload1);
assert(!sanitized1.startsWith('='), 'CSV cell starting with = is neutralized');
assert(sanitized1.includes("'=SUM(1+1)"), 'Formula prefixed with single-quote');

const formulaPayload2 = '+cmd|/C calc';
const sanitized2 = sanitizeCsvCell(formulaPayload2);
assert(!sanitized2.startsWith('+'), 'CSV cell starting with + is neutralized');

const formulaPayload3 = '-1+2+cmd|/C calc';
const sanitized3 = sanitizeCsvCell(formulaPayload3);
assert(!sanitized3.startsWith('-'), 'CSV cell starting with - is neutralized');

// Normal values should pass through
const normal = sanitizeCsvCell('Oct 21');
assert(normal.includes('Oct 21'), 'Normal date label passes through');

// Double-quote escaping
const withQuotes = sanitizeCsvCell('He said "hello"');
assert(withQuotes.includes('""'), 'Double-quotes are properly escaped');

// Numbers pass through unchanged (no wrapping)
assertEqual(sanitizeCsvCell(42), '42', 'Numeric values pass through as strings');
assertEqual(sanitizeCsvCell(0), '0', 'Zero passes through');

// ─────────────────────────────────────────────────────────────────────────────
// TEST SUITE 4: avgDailyVisits calculation
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n─── Suite 4: avgDailyVisits Calculation ───────────────────────────────────');

// 13 visits over 30 days = 0.4
const sparseStats = Array.from({ length: 30 }, (_, i) => ({
  date: `2026-10-${String(i + 1).padStart(2, '0')}`,
  label: `Oct ${i + 1}`,
  visits: i === 20 ? 13 : 0, // all 13 visits on Oct 21
  uniqueVisitors: i === 20 ? 2 : 0,
}));
assertEqual(
  computeAvgDailyVisits(sparseStats),
  0.4,
  'avgDailyVisits = 13/30 = 0.4 (includes zero days)',
);

// Empty array
assertEqual(computeAvgDailyVisits([]), 0, 'avgDailyVisits returns 0 for empty array');

// All visits on one day
const singleDayStat = [{ date: '2026-10-21', label: 'Oct 21', visits: 50, uniqueVisitors: 10 }];
assertEqual(computeAvgDailyVisits(singleDayStat), 50, 'avgDailyVisits = 50 when only one day');

// ─────────────────────────────────────────────────────────────────────────────
// TEST SUITE 5: peakDay computation
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n─── Suite 5: peakDay Computation ───────────────────────────────────────────');

assertEqual(computePeakDay([]), null, 'peakDay is null for empty stats');
assertEqual(
  computePeakDay([{ label: 'Oct 17', visits: 0, uniqueVisitors: 0 }]),
  null,
  'peakDay is null when all days have 0 visits',
);

const statsWithPeak = [
  { label: 'Oct 17', visits: 5, uniqueVisitors: 2 },
  { label: 'Oct 18', visits: 3, uniqueVisitors: 1 },
  { label: 'Oct 21', visits: 8, uniqueVisitors: 2 },
];
const peak = computePeakDay(statsWithPeak);
assertEqual(peak?.date, 'Oct 21', 'peakDay.date = "Oct 21" (human-readable label)');
assertEqual(peak?.visits, 8, 'peakDay.visits = 8');

// ─────────────────────────────────────────────────────────────────────────────
// TEST SUITE 6: totalUniqueDevices denominator
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n─── Suite 6: Device Percentage Denominator ─────────────────────────────────');

// Simulate the fixed device breakdown aggregation
const deviceRaw = [
  { device: 'desktop', visits: 10n, unique_devices: 2n },
  { device: 'mobile', visits: 3n, unique_devices: 2n },
];

const devices = {
  desktop: 0,
  mobile: 0,
  tablet: 0,
  other: 0,
  uniqueDesktop: 0,
  uniqueMobile: 0,
  uniqueTablet: 0,
  uniqueOther: 0,
  totalUniqueDevices: 0,
};
for (const dev of deviceRaw) {
  const dName = (dev.device || 'other').toLowerCase();
  const vCount = Number(dev.visits);
  const uCount = Number(dev.unique_devices);
  if (dName === 'desktop') {
    devices.desktop += vCount;
    devices.uniqueDesktop += uCount;
  } else if (dName === 'mobile') {
    devices.mobile += vCount;
    devices.uniqueMobile += uCount;
  } else if (dName === 'tablet') {
    devices.tablet += vCount;
    devices.uniqueTablet += uCount;
  } else {
    devices.other += vCount;
    devices.uniqueOther += uCount;
  }
}
devices.totalUniqueDevices =
  devices.uniqueDesktop + devices.uniqueMobile + devices.uniqueTablet + devices.uniqueOther;

assertEqual(
  devices.totalUniqueDevices,
  4,
  'totalUniqueDevices = sum of per-category uniques (2+2=4)',
);
const desktopPct = Math.round((devices.uniqueDesktop / devices.totalUniqueDevices) * 100);
const mobilePct = Math.round((devices.uniqueMobile / devices.totalUniqueDevices) * 100);
assertEqual(desktopPct + mobilePct, 100, 'Device percentages sum to 100%');

// ─────────────────────────────────────────────────────────────────────────────
// TEST SUITE 7: Session-once tracking (no recount on refresh/navigation)
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n─── Suite 7: Session-Once Visit Tracking ──────────────────────────────────');

function createBrowserSessionSimulator() {
  let localStorageVisitorId = null;
  let sessionStore = {};
  const recordedEvents = [];

  function openOrInteract(pathname, { navType = 'navigate', simulateFailure = false } = {}) {
    if (pathname === '/maintenance' || pathname === '/offline') {
      return false;
    }

    if (!localStorageVisitorId) {
      localStorageVisitorId = 'visitor_1';
    }
    if (!sessionStore.qbm_session_id) {
      sessionStore.qbm_session_id = `session_${recordedEvents.length + 1}_${Date.now()}`;
    }

    if (sessionStore.qbm_session_tracked === '1') {
      return false; // Ignore refresh or in-app navigation inside open session
    }

    if (
      navType === 'reload' &&
      !Object.prototype.hasOwnProperty.call(sessionStore, 'qbm_session_id')
    ) {
      return false;
    }

    sessionStore.qbm_session_tracked = '1';
    if (simulateFailure) {
      delete sessionStore.qbm_session_tracked;
      return false;
    }

    recordedEvents.push({
      path: pathname,
      visitorId: localStorageVisitorId,
      sessionId: sessionStore.qbm_session_id,
    });
    return true;
  }

  function closeWebsite() {
    sessionStore = {}; // Tab / browser close clears sessionStorage, preserves localStorage visitorId
  }

  return { openOrInteract, closeWebsite, getEvents: () => recordedEvents };
}

const sim = createBrowserSessionSimulator();
assert(sim.openOrInteract('/'), 'Initial website open on / is counted (visit 1)');
assert(!sim.openOrInteract('/', { navType: 'reload' }), 'Page refresh on / is NOT counted');
assert(
  !sim.openOrInteract('/categories'),
  'Navigating to /categories inside open site is NOT counted',
);
assert(!sim.openOrInteract('/products/red-velvet'), 'Navigating to product page is NOT counted');
assert(
  !sim.openOrInteract('/products/red-velvet', { navType: 'reload' }),
  'Refreshing product page is NOT counted',
);
assert(
  !sim.openOrInteract('/', { navType: 'back_forward' }),
  'Back/forward navigation is NOT counted',
);

sim.closeWebsite();
assert(
  sim.openOrInteract('/'),
  'Closing website and opening again counts as 2nd visit with new sessionId',
);
assertEqual(sim.getEvents().length, 2, 'Total session visits recorded = 2 after 1 close + reopen');
assertEqual(
  new Set(sim.getEvents().map((e) => e.visitorId)).size,
  1,
  'Unique visitors remains 1 across both sessions',
);
assertEqual(
  new Set(sim.getEvents().map((e) => e.sessionId)).size,
  2,
  'Recorded events have 2 distinct sessionIds',
);

const maintenanceSim = createBrowserSessionSimulator();
assert(!maintenanceSim.openOrInteract('/maintenance'), '/maintenance screen is not counted');
assert(!maintenanceSim.openOrInteract('/offline'), '/offline screen is not counted');
assert(
  maintenanceSim.openOrInteract('/'),
  'Real visit to / after maintenance clears is still counted once',
);

// Server-side session aggregation check (deduplicating legacy multi-row sessions)
function aggregateSessions(rows) {
  const uniqueSessions = new Set();
  const uniqueVisitors = new Set();
  for (const row of rows) {
    const trimmedSession = typeof row.sessionId === 'string' ? row.sessionId.trim() : '';
    const sessionKey = trimmedSession.length > 0 ? trimmedSession : row.id;
    uniqueSessions.add(sessionKey);
    uniqueVisitors.add(row.visitorId);
  }
  return { visits: uniqueSessions.size, uniqueVisitors: uniqueVisitors.size };
}

const legacyRows = [
  { id: 'r1', visitorId: 'v1', sessionId: 's1' },
  { id: 'r2', visitorId: 'v1', sessionId: 's1' }, // refresh
  { id: 'r3', visitorId: 'v1', sessionId: 's1' }, // navigation
  { id: 'r4', visitorId: 'v1', sessionId: 's2' }, // reopened website
  { id: 'r5', visitorId: 'v2', sessionId: null }, // null session fallback to id
  { id: 'r6', visitorId: 'v2', sessionId: '' }, // empty session fallback to id
];
const agg = aggregateSessions(legacyRows);
assertEqual(
  agg.visits,
  4,
  'SQL session aggregation collapses 3 same-session rows into 1 (total 4 visits)',
);
assertEqual(agg.uniqueVisitors, 2, 'Unique visitors stays 2');

// ─────────────────────────────────────────────────────────────────────────────
// Summary
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n════════════════════════════════════════════════════════════════════════════');
console.log(`  Results: ${passed} passed, ${failed} failed`);
console.log('════════════════════════════════════════════════════════════════════════════\n');

if (failed > 0) {
  process.exit(1);
}
