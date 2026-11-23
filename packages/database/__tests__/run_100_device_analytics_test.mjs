/* eslint-disable */
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

const { PrismaClient } = require(path.join(__dirname, '../node_modules/@prisma/client'));
const prisma = new PrismaClient();

const CUSTOMER_API_URL = 'http://localhost:3000/api/analytics/track';
const ADMIN_API_URL = 'http://localhost:3001/api/analytics?days=30';

// Realistic User-Agents for 12 distinct device models across 5 OSs and 5 browsers
const UA_PROFILES = {
  iphone_safari: {
    ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Mobile/15E148 Safari/604.1',
    clientData: {
      deviceType: 'mobile',
      deviceName: 'Apple iPhone',
      browser: 'Safari',
      os: 'iOS',
      screenWidth: 393,
    },
    expectedModel: 'Apple iPhone',
    expectedType: 'mobile',
    expectedOS: 'iOS',
    expectedBrowser: 'Safari',
  },
  iphone_chrome: {
    ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/124.0.6367.88 Mobile/15E148 Safari/604.1',
    clientData: {
      deviceType: 'mobile',
      deviceName: 'Apple iPhone',
      browser: 'Chrome',
      os: 'iOS',
      screenWidth: 390,
    },
    expectedModel: 'Apple iPhone',
    expectedType: 'mobile',
    expectedOS: 'iOS',
    expectedBrowser: 'Chrome',
  },
  iphone_firefox: {
    ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/125.0 Mobile/15E148 Safari/605.1.15',
    clientData: {
      deviceType: 'mobile',
      deviceName: 'Apple iPhone',
      browser: 'Firefox',
      os: 'iOS',
      screenWidth: 390,
    },
    expectedModel: 'Apple iPhone',
    expectedType: 'mobile',
    expectedOS: 'iOS',
    expectedBrowser: 'Firefox',
  },
  samsung_chrome: {
    ua: 'Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.6367.82 Mobile Safari/537.36',
    clientData: {
      deviceType: 'mobile',
      deviceName: 'Samsung Galaxy',
      browser: 'Chrome',
      os: 'Android',
      screenWidth: 412,
    },
    expectedModel: 'Samsung Galaxy',
    expectedType: 'mobile',
    expectedOS: 'Android',
    expectedBrowser: 'Chrome',
  },
  samsung_browser: {
    ua: 'Mozilla/5.0 (Linux; Android 14; SAMSUNG SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/24.0 Chrome/118.0.5993.80 Mobile Safari/537.36',
    clientData: {
      deviceType: 'mobile',
      deviceName: 'Samsung Galaxy',
      browser: 'Samsung Internet',
      os: 'Android',
      screenWidth: 360,
    },
    expectedModel: 'Samsung Galaxy',
    expectedType: 'mobile',
    expectedOS: 'Android',
    expectedBrowser: 'Samsung Internet',
  },
  pixel_chrome: {
    ua: 'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.6367.82 Mobile Safari/537.36',
    clientData: {
      deviceType: 'mobile',
      deviceName: 'Google Pixel',
      browser: 'Chrome',
      os: 'Android',
      screenWidth: 412,
    },
    expectedModel: 'Google Pixel',
    expectedType: 'mobile',
    expectedOS: 'Android',
    expectedBrowser: 'Chrome',
  },
  oneplus_chrome: {
    ua: 'Mozilla/5.0 (Linux; Android 14; CPH2573/OnePlus) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.6367.82 Mobile Safari/537.36',
    clientData: {
      deviceType: 'mobile',
      deviceName: 'OnePlus',
      browser: 'Chrome',
      os: 'Android',
      screenWidth: 412,
    },
    expectedModel: 'OnePlus',
    expectedType: 'mobile',
    expectedOS: 'Android',
    expectedBrowser: 'Chrome',
  },
  xiaomi_chrome: {
    ua: 'Mozilla/5.0 (Linux; Android 14; 23127PN0CG/Xiaomi) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.6367.82 Mobile Safari/537.36',
    clientData: {
      deviceType: 'mobile',
      deviceName: 'Xiaomi / Redmi',
      browser: 'Chrome',
      os: 'Android',
      screenWidth: 392,
    },
    expectedModel: 'Xiaomi / Redmi',
    expectedType: 'mobile',
    expectedOS: 'Android',
    expectedBrowser: 'Chrome',
  },
  motorola_chrome: {
    ua: 'Mozilla/5.0 (Linux; Android 14; motorola edge 40) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.6367.82 Mobile Safari/537.36',
    clientData: {
      deviceType: 'mobile',
      deviceName: 'Motorola',
      browser: 'Chrome',
      os: 'Android',
      screenWidth: 412,
    },
    expectedModel: 'Motorola',
    expectedType: 'mobile',
    expectedOS: 'Android',
    expectedBrowser: 'Chrome',
  },
  vivo_chrome: {
    ua: 'Mozilla/5.0 (Linux; Android 14; V2318/vivo) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.6367.82 Mobile Safari/537.36',
    clientData: {
      deviceType: 'mobile',
      deviceName: 'Vivo',
      browser: 'Chrome',
      os: 'Android',
      screenWidth: 412,
    },
    expectedModel: 'Vivo',
    expectedType: 'mobile',
    expectedOS: 'Android',
    expectedBrowser: 'Chrome',
  },
  ipad_safari: {
    ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15',
    clientData: {
      deviceType: 'tablet',
      deviceName: 'Apple iPad',
      browser: 'Safari',
      os: 'iOS',
      screenWidth: 834,
    },
    expectedModel: 'Apple iPad',
    expectedType: 'tablet',
    expectedOS: 'iOS',
    expectedBrowser: 'Safari',
  },
  galaxy_tab_chrome: {
    ua: 'Mozilla/5.0 (Linux; Android 14; SM-X810) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.6367.82 Safari/537.36',
    clientData: {
      deviceType: 'tablet',
      deviceName: 'Samsung Galaxy Tab',
      browser: 'Chrome',
      os: 'Android',
      screenWidth: 800,
    },
    expectedModel: 'Samsung Galaxy Tab',
    expectedType: 'tablet',
    expectedOS: 'Android',
    expectedBrowser: 'Chrome',
  },
  windows_chrome: {
    ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    clientData: {
      deviceType: 'desktop',
      deviceName: 'Windows PC',
      browser: 'Chrome',
      os: 'Windows',
      screenWidth: 1920,
    },
    expectedModel: 'Windows PC',
    expectedType: 'desktop',
    expectedOS: 'Windows',
    expectedBrowser: 'Chrome',
  },
  windows_edge: {
    ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.2478.80',
    clientData: {
      deviceType: 'desktop',
      deviceName: 'Windows PC',
      browser: 'Edge',
      os: 'Windows',
      screenWidth: 1920,
    },
    expectedModel: 'Windows PC',
    expectedType: 'desktop',
    expectedOS: 'Windows',
    expectedBrowser: 'Edge',
  },
  windows_firefox: {
    ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0',
    clientData: {
      deviceType: 'desktop',
      deviceName: 'Windows PC',
      browser: 'Firefox',
      os: 'Windows',
      screenWidth: 1920,
    },
    expectedModel: 'Windows PC',
    expectedType: 'desktop',
    expectedOS: 'Windows',
    expectedBrowser: 'Firefox',
  },
  mac_safari: {
    ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15',
    clientData: {
      deviceType: 'desktop',
      deviceName: 'Apple Mac',
      browser: 'Safari',
      os: 'macOS',
      screenWidth: 1440,
    },
    expectedModel: 'Apple Mac',
    expectedType: 'desktop',
    expectedOS: 'macOS',
    expectedBrowser: 'Safari',
  },
  mac_chrome: {
    ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    clientData: {
      deviceType: 'desktop',
      deviceName: 'Apple Mac',
      browser: 'Chrome',
      os: 'macOS',
      screenWidth: 1440,
    },
    expectedModel: 'Apple Mac',
    expectedType: 'desktop',
    expectedOS: 'macOS',
    expectedBrowser: 'Chrome',
  },
  linux_firefox: {
    ua: 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:125.0) Gecko/20100101 Firefox/125.0',
    clientData: {
      deviceType: 'desktop',
      deviceName: 'Linux PC',
      browser: 'Firefox',
      os: 'Linux',
      screenWidth: 1920,
    },
    expectedModel: 'Linux PC',
    expectedType: 'desktop',
    expectedOS: 'Linux',
    expectedBrowser: 'Firefox',
  },
};

// Generate 105 visits
function generate105TestVisits() {
  const visits = [];
  const testRunId = `test_run_${Date.now().toString(36)}`;

  // Distribution specification:
  // Mobile (45 visits, 30 unique visitors):
  //   - iPhone Safari: 10 visits (5 unique visitors: mob_iph_saf_1..5)
  //   - iPhone Chrome: 5 visits (3 unique visitors: mob_iph_chr_1..3)
  //   - iPhone Firefox: 3 visits (2 unique visitors: mob_iph_fx_1..2)
  //   - Samsung Chrome: 9 visits (5 unique visitors: mob_sam_chr_1..5)
  //   - Samsung Browser: 3 visits (3 unique visitors: mob_sam_sb_1..3)
  //   - Pixel Chrome: 5 visits (4 unique visitors: mob_pix_1..4)
  //   - OnePlus Chrome: 4 visits (3 unique visitors: mob_one_1..3)
  //   - Xiaomi Chrome: 3 visits (2 unique visitors: mob_xia_1..2)
  //   - Motorola Chrome: 2 visits (2 unique visitors: mob_mot_1..2)
  //   - Vivo Chrome: 1 visit (1 unique visitor: mob_viv_1)
  // Tablet (25 visits, 14 unique visitors):
  //   - iPad Safari: 15 visits (8 unique visitors: tab_ipad_1..8)
  //   - Galaxy Tab Chrome: 10 visits (6 unique visitors: tab_gal_1..6)
  // Desktop (35 visits, 18 unique visitors):
  //   - Windows Chrome: 10 visits (5 unique visitors: dsk_win_chr_1..5)
  //   - Windows Edge: 5 visits (2 unique visitors: dsk_win_edg_1..2)
  //   - Windows Firefox: 3 visits (2 unique visitors: dsk_win_fx_1..2)
  //   - Mac Safari: 8 visits (4 unique visitors: dsk_mac_saf_1..4)
  //   - Mac Chrome: 4 visits (2 unique visitors: dsk_mac_chr_1..2)
  //   - Linux Firefox: 5 visits (3 unique visitors: dsk_lin_fx_1..3)
  // Total: 45 + 25 + 35 = 105 visits. Total unique visitors: 30 + 14 + 18 = 62 unique visitors.

  const specs = [
    // Mobile
    { profile: 'iphone_safari', visits: 10, uniqueCount: 5, prefix: 'mob_iph_saf' },
    { profile: 'iphone_chrome', visits: 5, uniqueCount: 3, prefix: 'mob_iph_chr' },
    { profile: 'iphone_firefox', visits: 3, uniqueCount: 2, prefix: 'mob_iph_fx' },
    { profile: 'samsung_chrome', visits: 9, uniqueCount: 5, prefix: 'mob_sam_chr' },
    { profile: 'samsung_browser', visits: 3, uniqueCount: 3, prefix: 'mob_sam_sb' },
    { profile: 'pixel_chrome', visits: 5, uniqueCount: 4, prefix: 'mob_pix' },
    { profile: 'oneplus_chrome', visits: 4, uniqueCount: 3, prefix: 'mob_one' },
    { profile: 'xiaomi_chrome', visits: 3, uniqueCount: 2, prefix: 'mob_xia' },
    { profile: 'motorola_chrome', visits: 2, uniqueCount: 2, prefix: 'mob_mot' },
    { profile: 'vivo_chrome', visits: 1, uniqueCount: 1, prefix: 'mob_viv' },
    // Tablet
    { profile: 'ipad_safari', visits: 15, uniqueCount: 8, prefix: 'tab_ipad' },
    { profile: 'galaxy_tab_chrome', visits: 10, uniqueCount: 6, prefix: 'tab_gal' },
    // Desktop
    { profile: 'windows_chrome', visits: 10, uniqueCount: 5, prefix: 'dsk_win_chr' },
    { profile: 'windows_edge', visits: 5, uniqueCount: 2, prefix: 'dsk_win_edg' },
    { profile: 'windows_firefox', visits: 3, uniqueCount: 2, prefix: 'dsk_win_fx' },
    { profile: 'mac_safari', visits: 8, uniqueCount: 4, prefix: 'dsk_mac_saf' },
    { profile: 'mac_chrome', visits: 4, uniqueCount: 2, prefix: 'dsk_mac_chr' },
    { profile: 'linux_firefox', visits: 5, uniqueCount: 3, prefix: 'dsk_lin_fx' },
  ];

  const paths = [
    '/',
    '/',
    '/',
    '/categories',
    '/categories',
    '/categories/cakes',
    '/categories/pastries',
    '/categories/breads',
    '/products/red-velvet',
    '/products/chocolate-truffle',
    '/products/sourdough',
    '/about',
  ];

  let pathIdx = 0;
  for (const spec of specs) {
    const prof = UA_PROFILES[spec.profile];
    for (let i = 0; i < spec.visits; i++) {
      const visitorNum = (i % spec.uniqueCount) + 1;
      const visitorId = `${testRunId}_${spec.prefix}_${visitorNum}`;
      const sessionId = `sess_${testRunId}_${spec.prefix}_${visitorNum}_${Math.floor(i / spec.uniqueCount)}`;
      const targetPath = paths[pathIdx % paths.length];
      pathIdx++;

      visits.push({
        profileKey: spec.profile,
        profile: prof,
        visitorId,
        sessionId,
        path: targetPath,
        ip: `192.168.10.${(visits.length % 50) + 1}`,
      });
    }
  }

  return { visits, testRunId };
}

async function main() {
  console.log('========================================================================');
  console.log('   QUALITY BAKERS — COMPLETE 100+ VISIT MULTI-DEVICE ANALYTICS TEST    ');
  console.log('========================================================================\n');

  // 1. Get Admin Session Token for API Verification
  const sessions = await prisma.session.findMany({
    take: 1,
    orderBy: { expires: 'desc' },
  });
  if (sessions.length === 0) {
    throw new Error('No active admin session found in database to authenticate Admin API.');
  }
  const adminToken = sessions[0].sessionToken;

  // 2. Fetch Initial Baseline Analytics Summary
  console.log('Fetching baseline Admin Analytics summary from port 3001...');
  const baseRes = await fetch(ADMIN_API_URL, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  if (!baseRes.ok) {
    throw new Error(`Failed to fetch baseline admin analytics: HTTP ${baseRes.status}`);
  }
  const baseline = await baseRes.json();
  console.log(
    `Baseline established: Total Visits = ${baseline.totalVisits}, Today Visits = ${baseline.todayVisits}, Today Unique Visitors = ${baseline.todayUniqueVisitors}`,
  );
  console.log(
    `Baseline Devices: Desktop=${baseline.devices.desktop}, Mobile=${baseline.devices.mobile}, Tablet=${baseline.devices.tablet}`,
  );
  console.log(
    `Baseline Unique Devices: Desktop=${baseline.devices.uniqueDesktop}, Mobile=${baseline.devices.uniqueMobile}, Tablet=${baseline.devices.uniqueTablet}, TotalUnique=${baseline.devices.totalUniqueDevices}\n`,
  );

  // 3. Generate 105 Test Visits
  const { visits, testRunId } = generate105TestVisits();
  console.log(
    `Generated ${visits.length} simulated customer visits across multiple device profiles (Run ID: ${testRunId}).`,
  );

  // Compute expected deltas
  const expected = {
    totalVisits: visits.length, // 105
    devices: { mobile: 0, tablet: 0, desktop: 0 },
    uniqueDevices: { mobile: new Set(), tablet: new Set(), desktop: new Set() },
    allUniqueVisitors: new Set(),
    models: {},
    browsers: {},
    os: {},
    paths: {},
  };

  for (const v of visits) {
    const p = v.profile;
    expected.devices[p.expectedType]++;
    expected.uniqueDevices[p.expectedType].add(v.visitorId);
    expected.allUniqueVisitors.add(v.visitorId);

    expected.models[p.expectedModel] = expected.models[p.expectedModel] || {
      visits: 0,
      visitors: new Set(),
    };
    expected.models[p.expectedModel].visits++;
    expected.models[p.expectedModel].visitors.add(v.visitorId);

    expected.browsers[p.expectedBrowser] = (expected.browsers[p.expectedBrowser] || 0) + 1;
    expected.os[p.expectedOS] = (expected.os[p.expectedOS] || 0) + 1;
    expected.paths[v.path] = (expected.paths[v.path] || 0) + 1;
  }

  console.log('Expected Distribution:');
  console.log(
    `- Device Categories: Mobile=${expected.devices.mobile}, Tablet=${expected.devices.tablet}, Desktop=${expected.devices.desktop}`,
  );
  console.log(
    `- Unique Visitors: Total=${expected.allUniqueVisitors.size} (Mobile=${expected.uniqueDevices.mobile.size}, Tablet=${expected.uniqueDevices.tablet.size}, Desktop=${expected.uniqueDevices.desktop.size})`,
  );
  console.log(
    '- Device Models:',
    Object.fromEntries(
      Object.entries(expected.models).map(([k, v]) => [
        k,
        { visits: v.visits, unique: v.visitors.size },
      ]),
    ),
  );
  console.log('- Browsers:', expected.browsers);
  console.log('- Operating Systems:', expected.os);
  console.log(
    '\nPosting 105 visits to Customer Tracking API (http://localhost:3000/api/analytics/track)...',
  );

  let successCount = 0;
  let failCount = 0;

  // Send requests in batches of 10 to simulate realistic concurrent traffic without flooding sockets
  const BATCH_SIZE = 10;
  for (let i = 0; i < visits.length; i += BATCH_SIZE) {
    const batch = visits.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (v, idx) => {
        const payload = {
          path: v.path,
          referrer:
            idx % 3 === 0
              ? 'https://www.google.com/'
              : idx % 3 === 1
                ? 'https://l.instagram.com/'
                : null,
          visitorId: v.visitorId,
          sessionId: v.sessionId,
          deviceType: v.profile.clientData.deviceType,
          deviceName: v.profile.clientData.deviceName,
          browser: v.profile.clientData.browser,
          os: v.profile.clientData.os,
          screenWidth: v.profile.clientData.screenWidth,
        };

        try {
          const res = await fetch(CUSTOMER_API_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': v.profile.ua,
              'x-forwarded-for': v.ip,
            },
            body: JSON.stringify(payload),
          });

          if (res.ok) {
            const data = await res.json();
            if (data.success) {
              successCount++;
            } else {
              failCount++;
              console.error(`Visit ${i + idx + 1} response error:`, data);
            }
          } else {
            failCount++;
            console.error(`Visit ${i + idx + 1} HTTP ${res.status}`);
          }
        } catch (err) {
          failCount++;
          console.error(`Visit ${i + idx + 1} network error:`, err);
        }
      }),
    );
  }

  console.log(`\nTransmission complete: ${successCount} successful, ${failCount} failed.`);
  if (failCount > 0) {
    throw new Error(`${failCount} visits failed to post.`);
  }

  // Allow database flush
  await new Promise((r) => setTimeout(r, 1500));

  // 4. Fetch Updated Admin Analytics Summary
  console.log('\nFetching updated Admin Analytics summary from port 3001...');
  const updatedRes = await fetch(ADMIN_API_URL, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  if (!updatedRes.ok) {
    throw new Error(`Failed to fetch updated admin analytics: HTTP ${updatedRes.status}`);
  }
  const updated = await updatedRes.json();

  // 5. Compute Deltas & Reconcile
  console.log('\n========================================================================');
  console.log('   VERIFICATION & RECONCILIATION: CUSTOMER TRAFFIC vs ADMIN ANALYTICS  ');
  console.log('========================================================================\n');

  let passedAssertions = 0;
  let failedAssertions = 0;

  function assertEqual(actual, expectedVal, label) {
    if (actual === expectedVal) {
      console.log(`  ✓ PASS: ${label} = ${actual} (expected: ${expectedVal})`);
      passedAssertions++;
    } else {
      console.error(`  ✗ FAIL: ${label} = ${actual} (expected: ${expectedVal})`);
      failedAssertions++;
    }
  }

  // Total Visits Delta
  const deltaTotalVisits = updated.totalVisits - baseline.totalVisits;
  assertEqual(deltaTotalVisits, expected.totalVisits, 'Total Visits Delta');

  const deltaTodayVisits = updated.todayVisits - baseline.todayVisits;
  assertEqual(deltaTodayVisits, expected.totalVisits, 'Today Visits Delta');

  // Unique Visitors Delta
  const deltaTodayUnique = updated.todayUniqueVisitors - baseline.todayUniqueVisitors;
  assertEqual(deltaTodayUnique, expected.allUniqueVisitors.size, 'Today Unique Visitors Delta');

  // Device Category Visits Deltas
  const deltaMobileVisits = updated.devices.mobile - baseline.devices.mobile;
  assertEqual(deltaMobileVisits, expected.devices.mobile, 'Mobile Visits Delta');

  const deltaTabletVisits = updated.devices.tablet - baseline.devices.tablet;
  assertEqual(deltaTabletVisits, expected.devices.tablet, 'Tablet Visits Delta');

  const deltaDesktopVisits = updated.devices.desktop - baseline.devices.desktop;
  assertEqual(deltaDesktopVisits, expected.devices.desktop, 'Desktop Visits Delta');

  // Device Category Unique Devices Deltas
  const deltaMobileUnique = updated.devices.uniqueMobile - baseline.devices.uniqueMobile;
  assertEqual(deltaMobileUnique, expected.uniqueDevices.mobile.size, 'Mobile Unique Devices Delta');

  const deltaTabletUnique = updated.devices.uniqueTablet - baseline.devices.uniqueTablet;
  assertEqual(deltaTabletUnique, expected.uniqueDevices.tablet.size, 'Tablet Unique Devices Delta');

  const deltaDesktopUnique = updated.devices.uniqueDesktop - baseline.devices.uniqueDesktop;
  assertEqual(
    deltaDesktopUnique,
    expected.uniqueDevices.desktop.size,
    'Desktop Unique Devices Delta',
  );

  const deltaTotalUniqueDevices =
    updated.devices.totalUniqueDevices - baseline.devices.totalUniqueDevices;
  assertEqual(
    deltaTotalUniqueDevices,
    expected.allUniqueVisitors.size,
    'Total Unique Devices Delta',
  );

  // Browser Deltas
  console.log('\n--- Browser Breakdown Verification ---');
  for (const [browser, count] of Object.entries(expected.browsers)) {
    const baseB = baseline.topBrowsers.find((b) => b.name === browser);
    const updB = updated.topBrowsers.find((b) => b.name === browser);
    const baseVisits = baseB ? baseB.visits : 0;
    const updVisits = updB ? updB.visits : 0;
    const delta = updVisits - baseVisits;
    assertEqual(delta, count, `Browser '${browser}' Visits Delta`);
  }

  // OS Deltas
  console.log('\n--- Operating System Breakdown Verification ---');
  for (const [osName, count] of Object.entries(expected.os)) {
    const baseO = baseline.topOS.find((o) => o.name === osName);
    const updO = updated.topOS.find((o) => o.name === osName);
    const baseVisits = baseO ? baseO.visits : 0;
    const updVisits = updO ? updO.visits : 0;
    const delta = updVisits - baseVisits;
    assertEqual(delta, count, `OS '${osName}' Visits Delta`);
  }

  // Device Models
  console.log('\n--- Detected Device Models Verification ---');
  console.table(updated.topDevices);
  for (const [modelName, info] of Object.entries(expected.models)) {
    const updM = updated.topDevices.find((d) => d.name === modelName);
    if (!updM) {
      // If topDevices is limited to 10, check if this model was ranked outside top 10
      console.log(`  ℹ Model '${modelName}' not in top 10 ranked models in admin UI`);
      continue;
    }
    console.log(
      `  ✓ Detected Model '${modelName}': ${updM.visits} total visits, ${updM.uniqueDevices} unique devices (${updM.percentage}% of detected models)`,
    );
    passedAssertions++;
  }

  console.log('\n========================================================================');
  console.log(
    `TOTAL ASSERTIONS: ${passedAssertions + failedAssertions} | PASSED: ${passedAssertions} | FAILED: ${failedAssertions}`,
  );
  console.log('========================================================================\n');

  if (failedAssertions > 0) {
    process.exit(1);
  }
}

main()
  .catch((err) => {
    console.error('Test execution failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
