/* eslint-disable */
import assert from 'assert';

function parseDeviceInfo(rawUa, clientData) {
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

const testProfiles = [
  {
    name: 'iPhone 15 Pro (Safari)',
    ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Mobile/15E148 Safari/604.1',
    clientData: {
      deviceType: 'mobile',
      deviceName: 'Apple iPhone',
      browser: 'Safari',
      os: 'iOS',
      screenWidth: 393,
    },
    expected: { os: 'iOS', deviceType: 'mobile', deviceName: 'Apple iPhone', browser: 'Safari' },
  },
  {
    name: 'iPhone 14 (Chrome CriOS)',
    ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/124.0.6367.88 Mobile/15E148 Safari/604.1',
    clientData: {
      deviceType: 'mobile',
      deviceName: 'Apple iPhone',
      browser: 'Chrome',
      os: 'iOS',
      screenWidth: 390,
    },
    expected: { os: 'iOS', deviceType: 'mobile', deviceName: 'Apple iPhone', browser: 'Chrome' },
  },
  {
    name: 'iPhone 13 (Firefox FxiOS)',
    ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/125.0 Mobile/15E148 Safari/605.1.15',
    clientData: {
      deviceType: 'mobile',
      deviceName: 'Apple iPhone',
      browser: 'Firefox',
      os: 'iOS',
      screenWidth: 390,
    },
    expected: { os: 'iOS', deviceType: 'mobile', deviceName: 'Apple iPhone', browser: 'Firefox' },
  },
  {
    name: 'Samsung Galaxy S24 Ultra (Chrome)',
    ua: 'Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.6367.82 Mobile Safari/537.36',
    clientData: {
      deviceType: 'mobile',
      deviceName: 'Samsung Galaxy',
      browser: 'Chrome',
      os: 'Android',
      screenWidth: 412,
    },
    expected: {
      os: 'Android',
      deviceType: 'mobile',
      deviceName: 'Samsung Galaxy',
      browser: 'Chrome',
    },
  },
  {
    name: 'Samsung Galaxy S23 (Samsung Internet)',
    ua: 'Mozilla/5.0 (Linux; Android 14; SAMSUNG SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/24.0 Chrome/118.0.5993.80 Mobile Safari/537.36',
    clientData: {
      deviceType: 'mobile',
      deviceName: 'Samsung Galaxy',
      browser: 'Samsung Internet',
      os: 'Android',
      screenWidth: 360,
    },
    expected: {
      os: 'Android',
      deviceType: 'mobile',
      deviceName: 'Samsung Galaxy',
      browser: 'Samsung Internet',
    },
  },
  {
    name: 'Google Pixel 8 Pro (Chrome)',
    ua: 'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.6367.82 Mobile Safari/537.36',
    clientData: {
      deviceType: 'mobile',
      deviceName: 'Google Pixel',
      browser: 'Chrome',
      os: 'Android',
      screenWidth: 412,
    },
    expected: {
      os: 'Android',
      deviceType: 'mobile',
      deviceName: 'Google Pixel',
      browser: 'Chrome',
    },
  },
  {
    name: 'OnePlus 12 (Chrome)',
    ua: 'Mozilla/5.0 (Linux; Android 14; CPH2573/OnePlus) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.6367.82 Mobile Safari/537.36',
    clientData: {
      deviceType: 'mobile',
      deviceName: 'OnePlus',
      browser: 'Chrome',
      os: 'Android',
      screenWidth: 412,
    },
    expected: { os: 'Android', deviceType: 'mobile', deviceName: 'OnePlus', browser: 'Chrome' },
  },
  {
    name: 'Xiaomi 14 (Chrome)',
    ua: 'Mozilla/5.0 (Linux; Android 14; 23127PN0CG/Xiaomi) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.6367.82 Mobile Safari/537.36',
    clientData: {
      deviceType: 'mobile',
      deviceName: 'Xiaomi / Redmi',
      browser: 'Chrome',
      os: 'Android',
      screenWidth: 392,
    },
    expected: {
      os: 'Android',
      deviceType: 'mobile',
      deviceName: 'Xiaomi / Redmi',
      browser: 'Chrome',
    },
  },
  {
    name: 'Motorola Edge 40 (Chrome)',
    ua: 'Mozilla/5.0 (Linux; Android 14; motorola edge 40) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.6367.82 Mobile Safari/537.36',
    clientData: {
      deviceType: 'mobile',
      deviceName: 'Motorola',
      browser: 'Chrome',
      os: 'Android',
      screenWidth: 412,
    },
    expected: { os: 'Android', deviceType: 'mobile', deviceName: 'Motorola', browser: 'Chrome' },
  },
  {
    name: 'Vivo V30 (Chrome)',
    ua: 'Mozilla/5.0 (Linux; Android 14; V2318/vivo) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.6367.82 Mobile Safari/537.36',
    clientData: {
      deviceType: 'mobile',
      deviceName: 'Vivo',
      browser: 'Chrome',
      os: 'Android',
      screenWidth: 412,
    },
    expected: { os: 'Android', deviceType: 'mobile', deviceName: 'Vivo', browser: 'Chrome' },
  },
  {
    name: 'iPad Pro (Desktop UA + client touch)',
    ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15',
    clientData: {
      deviceType: 'tablet',
      deviceName: 'Apple iPad',
      browser: 'Safari',
      os: 'iOS',
      screenWidth: 834,
    },
    expected: { os: 'iOS', deviceType: 'tablet', deviceName: 'Apple iPad', browser: 'Safari' },
  },
  {
    name: 'iPad Air (Traditional UA)',
    ua: 'Mozilla/5.0 (iPad; CPU OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1',
    clientData: {
      deviceType: 'tablet',
      deviceName: 'Apple iPad',
      browser: 'Safari',
      os: 'iOS',
      screenWidth: 820,
    },
    expected: { os: 'iOS', deviceType: 'tablet', deviceName: 'Apple iPad', browser: 'Safari' },
  },
  {
    name: 'Samsung Galaxy Tab S9 (Chrome)',
    ua: 'Mozilla/5.0 (Linux; Android 14; SM-X810) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.6367.82 Safari/537.36',
    clientData: {
      deviceType: 'tablet',
      deviceName: 'Samsung Galaxy Tab',
      browser: 'Chrome',
      os: 'Android',
      screenWidth: 800,
    },
    expected: {
      os: 'Android',
      deviceType: 'tablet',
      deviceName: 'Samsung Galaxy Tab',
      browser: 'Chrome',
    },
  },
  {
    name: 'Windows 11 PC (Chrome)',
    ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    clientData: {
      deviceType: 'desktop',
      deviceName: 'Windows PC',
      browser: 'Chrome',
      os: 'Windows',
      screenWidth: 1920,
    },
    expected: { os: 'Windows', deviceType: 'desktop', deviceName: 'Windows PC', browser: 'Chrome' },
  },
  {
    name: 'Windows 11 PC (Edge)',
    ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.2478.80',
    clientData: {
      deviceType: 'desktop',
      deviceName: 'Windows PC',
      browser: 'Edge',
      os: 'Windows',
      screenWidth: 1920,
    },
    expected: { os: 'Windows', deviceType: 'desktop', deviceName: 'Windows PC', browser: 'Edge' },
  },
  {
    name: 'Apple Mac (Safari)',
    ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15',
    clientData: {
      deviceType: 'desktop',
      deviceName: 'Apple Mac',
      browser: 'Safari',
      os: 'macOS',
      screenWidth: 1440,
    },
    expected: { os: 'macOS', deviceType: 'desktop', deviceName: 'Apple Mac', browser: 'Safari' },
  },
  {
    name: 'Linux PC (Firefox)',
    ua: 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:125.0) Gecko/20100101 Firefox/125.0',
    clientData: {
      deviceType: 'desktop',
      deviceName: 'Linux PC',
      browser: 'Firefox',
      os: 'Linux',
      screenWidth: 1920,
    },
    expected: { os: 'Linux', deviceType: 'desktop', deviceName: 'Linux PC', browser: 'Firefox' },
  },
];

let passCount = 0;
for (const p of testProfiles) {
  const result = parseDeviceInfo(p.ua, p.clientData);
  try {
    assert.deepStrictEqual(result, p.expected);
    console.log(`[PASS] ${p.name} -> ${JSON.stringify(result)}`);
    passCount++;
  } catch (err) {
    console.error(
      `[FAIL] ${p.name}: expected ${JSON.stringify(p.expected)}, got ${JSON.stringify(result)}`,
    );
  }
}

console.log(
  `\nTested ${testProfiles.length} profiles: ${passCount} PASSED, ${testProfiles.length - passCount} FAILED.`,
);
if (passCount !== testProfiles.length) {
  process.exit(1);
}
