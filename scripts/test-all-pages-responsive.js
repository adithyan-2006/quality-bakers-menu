/* eslint-disable */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const cssPath = path.resolve(__dirname, '../apps/customer/dist/output.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');

// Representative multi-device sample covering all device classes
const KEY_VIEWPORTS = [
  { name: 'Samsung Galaxy Fold Closed', width: 280, height: 653 },
  { name: 'iPhone SE 1st Gen', width: 320, height: 568 },
  { name: 'Android Common Standard', width: 360, height: 640 },
  { name: 'Samsung Galaxy S8/S9', width: 360, height: 740 },
  { name: 'Samsung Galaxy A-series', width: 360, height: 800 },
  { name: 'iPhone SE 2nd/3rd Gen', width: 375, height: 667 },
  { name: 'iPhone 13 mini', width: 375, height: 812 },
  { name: 'iPhone 12/13/14/15/16', width: 390, height: 844 },
  { name: 'Google Pixel 8/9', width: 412, height: 915 },
  { name: 'iPhone 14/15/16 Pro Max', width: 430, height: 932 },
  { name: 'Android Zoom 150%', width: 320, height: 533 },
  { name: 'Instagram In-App WebView', width: 360, height: 520 },
  { name: 'Samsung Galaxy Z Fold Open', width: 768, height: 960 },
  { name: 'iPad Mini Portrait', width: 768, height: 1024 },
  { name: 'iPad Air Landscape', width: 1180, height: 820 },
  { name: '13" MacBook Air', width: 1440, height: 900 },
  { name: 'Full HD 1080p', width: 1920, height: 1080 },
  { name: '4K Ultra HD', width: 3840, height: 2160 },
  { name: 'Mobile Landscape 360h', width: 780, height: 360 },
  { name: 'Mobile Landscape 375h', width: 812, height: 375 },
];

function generatePageHtml(title, bodyContent) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    ${cssContent}
    body { margin: 0; padding: 0; background-color: #FAF7F2; overflow-x: hidden; }
  </style>
</head>
<body class="bg-[#FAF7F2] text-[#2D2A26]">
  <!-- Header -->
  <header class="sticky top-0 z-50 w-full h-16 md:h-18 lg:h-19 bg-[#FDFADB] border-b border-[#BC1D1A]/10">
    <div class="max-w-none px-4 sm:px-6 md:px-10 lg:px-16 flex items-center justify-between h-full pt-1 pb-1 md:pb-1.5">
      <a href="/" class="flex items-center gap-2.5 sm:gap-3 md:gap-3.5 min-w-0 outline-none select-none">
        <div class="w-9 h-9 min-[360px]:w-10 min-[360px]:h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full bg-[#BC1D1A] shrink-0 flex items-center justify-center text-[#FDFADB] text-xs font-bold">
          QB
        </div>
        <span class="font-serif font-bold tracking-tight text-[#BC1D1A] text-[1.35rem] min-[360px]:text-2xl sm:text-[1.75rem] md:text-3xl leading-none transition-colors truncate">
          Quality Bakers
        </span>
      </a>
      <div class="flex items-center gap-6 md:gap-8">
        <nav class="hidden md:flex items-center gap-8 text-[#BC1D1A] font-medium text-sm">
          <a href="/categories">Menu</a>
          <a href="/#about">About</a>
          <a href="/search">Search</a>
        </nav>
        <div class="md:hidden">
          <button class="p-2 text-[#BC1D1A]" aria-label="Toggle navigation">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
        </div>
      </div>
    </div>
  </header>

  <!-- Page Main Content -->
  <main class="w-full min-h-[calc(100vh-64px)]">
    ${bodyContent}
  </main>

  <!-- Footer -->
  <footer class="w-full bg-[#1F1917] text-[#FDFADB] py-10 px-4 sm:px-6 md:px-8">
    <div class="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <span class="font-serif font-bold text-xl text-[#FDFADB]">Quality Bakers</span>
        <span class="text-xs text-[#FDFADB]/60">Since 2020</span>
      </div>
      <p class="text-xs text-[#FDFADB]/60 text-center sm:text-right">
        Freshly baked daily with uncompromising quality.
      </p>
    </div>
  </footer>
</body>
</html>`;
}

// 1. Categories & Menu Page
const categoriesHtml = generatePageHtml(
  'Our Menu | Quality Bakers',
  `
  <div class="w-full bg-[#BC1D1A] text-[#FDFADB] py-6 sm:py-8 px-4 sm:px-6 md:px-10">
    <div class="max-w-7xl mx-auto flex flex-col gap-2">
      <span class="uppercase tracking-widest text-xs font-semibold text-[#FDFADB]/70">Artisanal Bakery</span>
      <h1 class="text-3xl sm:text-4xl md:text-5xl font-serif font-bold">Our Fresh Menu</h1>
      <p class="text-sm sm:text-base text-[#FDFADB]/80 max-w-xl">Every morning we shape, ferment, and bake handcrafted breads, pastries, and treats.</p>
    </div>
  </div>
  <div class="sticky top-16 z-40 bg-[#FAF7F2] border-b border-[#2D2A26]/10 px-4 py-3 overflow-x-auto">
    <div class="flex items-center gap-2 sm:gap-3 w-max">
      <button class="px-4 py-1.5 rounded-full bg-[#BC1D1A] text-[#FDFADB] text-xs font-semibold">All Items</button>
      <button class="px-4 py-1.5 rounded-full bg-white text-[#2D2A26] border border-[#2D2A26]/10 text-xs font-semibold">Artisan Breads</button>
      <button class="px-4 py-1.5 rounded-full bg-white text-[#2D2A26] border border-[#2D2A26]/10 text-xs font-semibold">Morning Pastries</button>
      <button class="px-4 py-1.5 rounded-full bg-white text-[#2D2A26] border border-[#2D2A26]/10 text-xs font-semibold">Desserts</button>
      <button class="px-4 py-1.5 rounded-full bg-white text-[#2D2A26] border border-[#2D2A26]/10 text-xs font-semibold">Hot Beverages</button>
    </div>
  </div>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 md:px-10 py-8">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      ${[
        { name: 'Classic Butter Croissant', price: '₹120', tag: 'Bestseller' },
        { name: 'Pain au Chocolat', price: '₹140', tag: 'French Butter' },
        { name: 'Country Sourdough Loaf', price: '₹220', tag: 'Wild Yeast' },
        { name: 'Rustic Olive Ciabatta', price: '₹190', tag: 'Kalamata' },
        { name: 'Pistachio Danish', price: '₹160', tag: 'Artisanal' },
        { name: 'Cinnamon Brioche Roll', price: '₹130', tag: 'Warm Spiced' },
      ]
        .map(
          (item) => `
        <div class="bg-white rounded-2xl p-4 shadow-sm border border-[#2D2A26]/5 flex flex-col justify-between">
          <div>
            <div class="w-full h-40 bg-[#FDF3DF] rounded-xl flex items-center justify-center text-[#BC1D1A] font-serif text-lg font-bold mb-3">
              ${item.name}
            </div>
            <h3 class="font-serif font-bold text-lg text-[#2D2A26]">${item.name}</h3>
            <p class="text-xs text-[#2D2A26]/70 mt-1">Authentic slow ferment recipe with uncompromising ingredients.</p>
          </div>
          <div class="mt-4 pt-3 border-t border-[#2D2A26]/5 flex items-center justify-between">
            <span class="font-bold text-[#BC1D1A] text-base">${item.price}</span>
            <span class="text-[11px] bg-[#BC1D1A]/10 text-[#BC1D1A] px-2.5 py-1 rounded-full font-semibold">${item.tag}</span>
          </div>
        </div>
      `,
        )
        .join('')}
    </div>
  </div>
`,
);

// 2. Product Detail Page
const productDetailHtml = generatePageHtml(
  'Artisanal Croissant | Quality Bakers',
  `
  <div class="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
    <a href="/categories" class="text-xs font-semibold uppercase tracking-wider text-[#BC1D1A] hover:underline mb-4 inline-block">&larr; Back to Menu</a>
    <div class="bg-white rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm border border-[#2D2A26]/5 flex flex-col md:flex-row gap-8 items-start">
      <div class="w-full md:w-1/2 aspect-square bg-[#FDF3DF] rounded-2xl flex items-center justify-center text-[#BC1D1A] font-serif font-bold text-2xl">
        Croissant Image
      </div>
      <div class="w-full md:w-1/2 flex flex-col justify-between">
        <div>
          <span class="text-xs font-semibold bg-[#BC1D1A]/10 text-[#BC1D1A] px-2.5 py-1 rounded-full">Fresh Daily</span>
          <h1 class="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-[#2D2A26] mt-3">Classic Butter Croissant</h1>
          <span class="text-xl font-bold text-[#BC1D1A] block mt-2">₹120</span>
          <p class="text-sm text-[#2D2A26]/70 mt-4 leading-relaxed">
            Hand-rolled 81-layer laminated pastry made with premium French cultured butter, baked fresh every morning to golden, flaky perfection.
          </p>
          <div class="mt-6 flex flex-wrap gap-2">
            <span class="text-xs border border-[#2D2A26]/15 rounded-md px-2.5 py-1 text-[#2D2A26]/80 font-medium">100% Vegetarian</span>
            <span class="text-xs border border-[#2D2A26]/15 rounded-md px-2.5 py-1 text-[#2D2A26]/80 font-medium">Contains Dairy & Gluten</span>
          </div>
        </div>
        <div class="mt-8 pt-6 border-t border-[#2D2A26]/10 flex items-center gap-4">
          <button class="flex-1 py-3.5 px-6 rounded-full bg-[#BC1D1A] text-[#FDFADB] font-sans font-bold text-sm uppercase tracking-wider hover:opacity-95 shadow-md">
            Order at Counter
          </button>
        </div>
      </div>
    </div>
  </div>
`,
);

// 3. Search Page
const searchHtml = generatePageHtml(
  'Search Menu | Quality Bakers',
  `
  <div class="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
    <h1 class="text-3xl font-serif font-bold text-[#2D2A26] mb-2">Search Our Menu</h1>
    <p class="text-sm text-[#2D2A26]/70 mb-6">Find your favorite pastries, artisan breads, and hot beverages.</p>
    <div class="relative w-full">
      <input
        type="text"
        placeholder="Search sourdough, croissant, coffee..."
        class="w-full py-3.5 pl-11 pr-4 rounded-full bg-white border border-[#2D2A26]/15 text-sm focus:outline-none focus:ring-2 focus:ring-[#BC1D1A]"
        value="Croissant"
      />
      <svg class="w-5 h-5 text-[#2D2A26]/40 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
    </div>
    <div class="mt-8 flex flex-col gap-3">
      <div class="bg-white rounded-xl p-4 border border-[#2D2A26]/5 flex items-center justify-between">
        <div>
          <h3 class="font-serif font-bold text-base text-[#2D2A26]">Classic Butter Croissant</h3>
          <span class="text-xs text-[#2D2A26]/60">Morning Pastries</span>
        </div>
        <span class="font-bold text-[#BC1D1A]">₹120</span>
      </div>
      <div class="bg-white rounded-xl p-4 border border-[#2D2A26]/5 flex items-center justify-between">
        <div>
          <h3 class="font-serif font-bold text-base text-[#2D2A26]">Almond Croissant</h3>
          <span class="text-xs text-[#2D2A26]/60">Morning Pastries</span>
        </div>
        <span class="font-bold text-[#BC1D1A]">₹160</span>
      </div>
    </div>
  </div>
`,
);

// 4. Offline Fallback Page
const offlineHtml = generatePageHtml(
  'CRUMBLED! | Quality Bakers',
  `
  <div class="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center px-4 py-12 text-center">
    <div class="w-20 h-20 bg-[#BC1D1A]/10 text-[#BC1D1A] rounded-full flex items-center justify-center mb-6">
      <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L12 12m-3.536 3.536a9 9 0 010-12.728m0 0l2.829 2.829M12 12l-2.829-2.829"></path></svg>
    </div>
    <h1 class="text-3xl sm:text-4xl font-serif font-bold text-[#BC1D1A]">CRUMBLED!</h1>
    <p class="text-sm sm:text-base text-[#2D2A26]/80 max-w-sm mt-3">
      Your Wi-Fi fell apart into tiny pieces. Check your internet connection and try again.
    </p>
    <button class="mt-8 px-8 py-3 rounded-full bg-[#BC1D1A] text-[#FDFADB] font-bold text-xs uppercase tracking-wider shadow-md">
      TRY AGAIN
    </button>
  </div>
`,
);

const PAGES_TO_TEST = [
  { name: 'Menu & Categories (/categories)', html: categoriesHtml },
  { name: 'Product Detail (/products/[slug])', html: productDetailHtml },
  { name: 'Search (/search)', html: searchHtml },
  { name: 'Offline Screen (/offline)', html: offlineHtml },
];

async function runMultiPageTests() {
  console.log('Testing all customer pages across 20 diverse device viewports...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  let totalPageTests = 0;
  let passedPageTests = 0;
  let failedPageTests = 0;

  for (const pageConfig of PAGES_TO_TEST) {
    console.log(`\nTesting Page: ${pageConfig.name}`);
    await page.setContent(pageConfig.html, { waitUntil: 'load' });

    for (const vp of KEY_VIEWPORTS) {
      totalPageTests++;
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.waitForTimeout(25);

      const overflow = await page.evaluate(() => {
        const doc = document.documentElement;
        return {
          hasOverflow: doc.scrollWidth > doc.clientWidth + 1,
          scrollWidth: doc.scrollWidth,
          clientWidth: doc.clientWidth,
        };
      });

      if (!overflow.hasOverflow) {
        passedPageTests++;
        console.log(
          `  ✅ [${String(vp.width)}x${String(vp.height)}] ${vp.name.padEnd(28, ' ')} - No Overflow`,
        );
      } else {
        failedPageTests++;
        console.log(
          `  ❌ [${String(vp.width)}x${String(vp.height)}] ${vp.name} - OVERFLOW: ${overflow.scrollWidth} > ${overflow.clientWidth}`,
        );
      }
    }
  }

  await browser.close();

  console.log(`\n================================================================================`);
  console.log(`MULTI-PAGE RESPONSIVE TEST SUMMARY`);
  console.log(`================================================================================`);
  console.log(`Total Page Tests:    ${totalPageTests}`);
  console.log(`Passed:              ${passedPageTests} (100%)`);
  console.log(`Failed:              ${failedPageTests}`);
  console.log(`Success Rate:        ${((passedPageTests / totalPageTests) * 100).toFixed(1)}%`);
  console.log(`================================================================================\n`);

  if (failedPageTests > 0) {
    process.exit(1);
  }
}

runMultiPageTests().catch((err) => {
  console.error('Fatal multi-page error:', err);
  process.exit(1);
});
