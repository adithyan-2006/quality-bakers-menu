/* eslint-disable */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

// Load compiled CSS
const cssPath = path.resolve(__dirname, '../apps/customer/dist/output.css');
const cssContent = fs.readFileSync(cssPath, 'utf8');

// 100+ Device profiles spanning ultra-compact phones, standard phones, flagships,
// webviews, display-zoom scaled screens, foldables, tablets, laptops, desktops, and landscape orientations.
const DEVICE_PROFILES = [
  // 1. Ultra-compact & Small Phones (< 360px width)
  {
    name: 'Samsung Galaxy Fold (Cover Closed 280w)',
    width: 280,
    height: 653,
    category: 'Ultra-Compact',
  },
  {
    name: 'Samsung Galaxy Fold (Cover Closed 320w)',
    width: 320,
    height: 653,
    category: 'Ultra-Compact',
  },
  { name: 'iPhone 4 / 4S', width: 320, height: 480, category: 'Ultra-Compact' },
  { name: 'iPhone 5 / 5S / 5C / SE 1st Gen', width: 320, height: 568, category: 'Ultra-Compact' },
  {
    name: 'JioPhone / KaiOS Smart Feature Phone',
    width: 320,
    height: 533,
    category: 'Ultra-Compact',
  },
  { name: 'Alcatel / Compact Android', width: 320, height: 600, category: 'Ultra-Compact' },
  { name: 'Unihertz Jelly / Ultra-mini phone', width: 340, height: 580, category: 'Ultra-Compact' },
  { name: 'Android Small Phone (340x640)', width: 340, height: 640, category: 'Ultra-Compact' },
  { name: 'Samsung Galaxy Pocket / Core', width: 320, height: 500, category: 'Ultra-Compact' },
  { name: 'LG K3 / Compact', width: 320, height: 570, category: 'Ultra-Compact' },

  // 2. Budget, Motorola & Mid-range Phones (360px - 412px width)
  {
    name: 'Motorola Moto G34 5G (Chrome Full Viewport)',
    width: 360,
    height: 748,
    category: 'Motorola G34 5G',
  },
  {
    name: 'Motorola Moto G34 5G (Chrome URL Bar Active)',
    width: 360,
    height: 684,
    simulatedChromeBarExtraVh: 64,
    category: 'Motorola G34 5G',
  },
  {
    name: 'Motorola Moto G34 5G (Chrome + Gesture + Large Text)',
    width: 360,
    height: 650,
    simulatedChromeBarExtraVh: 64,
    category: 'Motorola G34 5G',
  },
  {
    name: 'Motorola Moto G34 5G (Smallest Width 412dp Chrome)',
    width: 412,
    height: 775,
    simulatedChromeBarExtraVh: 64,
    category: 'Motorola G34 5G',
  },
  {
    name: 'Motorola Moto G34 5G (Landscape Chrome)',
    width: 748,
    height: 310,
    simulatedChromeBarExtraVh: 50,
    category: 'Motorola G34 5G',
  },
  { name: 'Samsung Galaxy S8 / S9 / J7', width: 360, height: 740, category: 'Compact Mobile' },
  {
    name: 'Samsung Galaxy A10 / A20 / A30 / A50',
    width: 360,
    height: 800,
    category: 'Compact Mobile',
  },
  { name: 'Samsung Galaxy S10e', width: 360, height: 760, category: 'Compact Mobile' },
  { name: 'Samsung Galaxy S20 / S21 (FHD)', width: 360, height: 780, category: 'Compact Mobile' },
  { name: 'Moto G4 / G5 / G6', width: 360, height: 640, category: 'Compact Mobile' },
  { name: 'Xiaomi Redmi 5 / 6 / Go', width: 360, height: 640, category: 'Compact Mobile' },
  { name: 'Oppo A3s / A5s', width: 360, height: 760, category: 'Compact Mobile' },
  { name: 'Vivo Y11 / Y12', width: 360, height: 754, category: 'Compact Mobile' },
  { name: 'Realme C2 / C3', width: 360, height: 780, category: 'Compact Mobile' },
  { name: 'Android Common Standard 360x640', width: 360, height: 640, category: 'Compact Mobile' },
  { name: 'Android Tall 360x820', width: 360, height: 820, category: 'Compact Mobile' },
  { name: 'Android Extra-Tall 360x880', width: 360, height: 880, category: 'Compact Mobile' },

  // 3. Apple iPhones (375px - 414px width)
  {
    name: 'iPhone 6 / 6S / 7 / 8 / SE 2020 / SE 2022',
    width: 375,
    height: 667,
    category: 'iPhone Standard',
  },
  { name: 'iPhone X / XS / 11 Pro', width: 375, height: 812, category: 'iPhone Standard' },
  { name: 'iPhone 12 mini / 13 mini', width: 375, height: 812, category: 'iPhone Standard' },
  { name: 'iPhone 6 Plus / 7 Plus / 8 Plus', width: 414, height: 736, category: 'iPhone Plus' },
  { name: 'iPhone XR / 11', width: 414, height: 896, category: 'iPhone Plus' },
  { name: 'iPhone XS Max / 11 Pro Max', width: 414, height: 896, category: 'iPhone Plus' },
  {
    name: 'iPhone 12 / 12 Pro / 13 / 13 Pro / 14',
    width: 390,
    height: 844,
    category: 'iPhone Modern',
  },
  { name: 'iPhone 14 Pro / 15 / 15 Pro / 16', width: 393, height: 852, category: 'iPhone Modern' },
  {
    name: 'iPhone 12 Pro Max / 13 Pro Max / 14 Plus',
    width: 428,
    height: 926,
    category: 'iPhone Max',
  },
  {
    name: 'iPhone 14 Pro Max / 15 Plus / 15 Pro Max',
    width: 430,
    height: 932,
    category: 'iPhone Max',
  },
  { name: 'iPhone 16 Plus / 16 Pro Max', width: 430, height: 932, category: 'iPhone Max' },

  // 4. Android Flagships & Modern Androids (384px - 412px width)
  { name: 'Google Pixel 4 / 4a / 5', width: 393, height: 851, category: 'Android Flagship' },
  {
    name: 'Google Pixel 6 / 6 Pro / 7 / 7 Pro',
    width: 412,
    height: 892,
    category: 'Android Flagship',
  },
  {
    name: 'Google Pixel 8 / 8 Pro / 9 / 9 Pro',
    width: 412,
    height: 915,
    category: 'Android Flagship',
  },
  {
    name: 'Samsung Galaxy S20+ / S21+ / S22+',
    width: 384,
    height: 832,
    category: 'Android Flagship',
  },
  {
    name: 'Samsung Galaxy S22 Ultra / S23 Ultra / S24 Ultra',
    width: 412,
    height: 915,
    category: 'Android Flagship',
  },
  {
    name: 'Samsung Galaxy Note 10 / Note 20',
    width: 412,
    height: 869,
    category: 'Android Flagship',
  },
  { name: 'OnePlus 7 / 8 / 9 / 10 Pro', width: 412, height: 919, category: 'Android Flagship' },
  { name: 'OnePlus 11 / 12', width: 412, height: 915, category: 'Android Flagship' },
  { name: 'Xiaomi Mi 11 / 12 / 13 / 14', width: 393, height: 873, category: 'Android Flagship' },
  {
    name: 'Redmi Note 10 / 11 / 12 / 13 Pro',
    width: 392,
    height: 872,
    category: 'Android Mid-range',
  },
  {
    name: 'Oppo Find X5 / Reno 8 / Reno 10',
    width: 393,
    height: 873,
    category: 'Android Flagship',
  },
  { name: 'Vivo X80 / X90 / V27', width: 393, height: 873, category: 'Android Flagship' },
  {
    name: 'Sony Xperia 1 III / IV / V (21:9 Ultra Tall)',
    width: 384,
    height: 960,
    category: 'Android Ultra-Tall',
  },
  {
    name: 'Sony Xperia 5 IV (21:9 Ultra Tall)',
    width: 411,
    height: 960,
    category: 'Android Ultra-Tall',
  },

  // 5. Mobile In-App Browsers & WebViews (Reduced available height due to URL bars & system bars)
  {
    name: 'Instagram / WhatsApp In-App Browser (360x520)',
    width: 360,
    height: 520,
    category: 'In-App WebView',
  },
  {
    name: 'Instagram In-App Browser (360x540)',
    width: 360,
    height: 540,
    category: 'In-App WebView',
  },
  {
    name: 'Chrome Mobile with Large Address Bar (360x560)',
    width: 360,
    height: 560,
    category: 'In-App WebView',
  },
  {
    name: 'Chrome Mobile with Top & Bottom Bars (375x540)',
    width: 375,
    height: 540,
    category: 'In-App WebView',
  },
  {
    name: 'Safari iOS with Tab Bar Active (375x580)',
    width: 375,
    height: 580,
    category: 'In-App WebView',
  },
  {
    name: 'Facebook In-App Browser (375x600)',
    width: 375,
    height: 600,
    category: 'In-App WebView',
  },
  {
    name: 'Twitter / X In-App Browser (390x650)',
    width: 390,
    height: 650,
    category: 'In-App WebView',
  },
  {
    name: 'LinkedIn In-App Browser (390x680)',
    width: 390,
    height: 680,
    category: 'In-App WebView',
  },
  { name: 'Telegram Webview (393x700)', width: 393, height: 700, category: 'In-App WebView' },
  {
    name: 'Android Chrome Multi-tab UI (412x720)',
    width: 412,
    height: 720,
    category: 'In-App WebView',
  },
  {
    name: 'Android Chrome Bottom Bar Mode (412x750)',
    width: 412,
    height: 750,
    category: 'In-App WebView',
  },
  {
    name: 'Safari iOS Tab Bar Mode (428x760)',
    width: 428,
    height: 760,
    category: 'In-App WebView',
  },
  {
    name: 'Safari iOS Tab Bar Mode (430x780)',
    width: 430,
    height: 780,
    category: 'In-App WebView',
  },

  // 6. Android Display Zoom & Accessibility Large Text Modes
  {
    name: 'Android Display Zoom 150% on 1080p (320x533)',
    width: 320,
    height: 533,
    category: 'Display Zoom',
  },
  {
    name: 'Android Display Zoom 140% (340x600)',
    width: 340,
    height: 600,
    category: 'Display Zoom',
  },
  {
    name: 'Android Display Zoom 130% (360x580)',
    width: 360,
    height: 580,
    category: 'Display Zoom',
  },
  { name: 'Android Font Scale Large (380x620)', width: 380, height: 620, category: 'Display Zoom' },
  {
    name: 'Android Font Scale Largest (390x640)',
    width: 390,
    height: 640,
    category: 'Display Zoom',
  },
  {
    name: 'Android Display Zoom 125% (400x680)',
    width: 400,
    height: 680,
    category: 'Display Zoom',
  },

  // 7. Foldable Devices
  { name: 'Samsung Galaxy Z Flip (Cover Screen)', width: 300, height: 512, category: 'Foldable' },
  {
    name: 'Samsung Galaxy Z Flip 3/4/5 (Inner Unfolded)',
    width: 412,
    height: 1004,
    category: 'Foldable',
  },
  { name: 'Motorola Razr 40 (Inner Unfolded)', width: 412, height: 1056, category: 'Foldable' },
  {
    name: 'Samsung Galaxy Z Fold 3/4 (Inner Unfolded)',
    width: 768,
    height: 960,
    category: 'Foldable',
  },
  {
    name: 'Samsung Galaxy Z Fold 5/6 (Inner Unfolded)',
    width: 884,
    height: 1104,
    category: 'Foldable',
  },
  { name: 'Google Pixel Fold (Inner Screen)', width: 840, height: 700, category: 'Foldable' },
  { name: 'OnePlus Open (Inner Screen)', width: 884, height: 1072, category: 'Foldable' },
  { name: 'Microsoft Surface Duo (Single Screen)', width: 540, height: 720, category: 'Foldable' },
  { name: 'Microsoft Surface Duo (Dual Screen)', width: 1114, height: 705, category: 'Foldable' },

  // 8. Tablets (Portrait & Landscape)
  { name: 'iPad Mini (Portrait)', width: 768, height: 1024, category: 'Tablet Portrait' },
  { name: 'iPad Mini (Landscape)', width: 1024, height: 768, category: 'Tablet Landscape' },
  { name: 'iPad 9th / 10th Gen (Portrait)', width: 810, height: 1080, category: 'Tablet Portrait' },
  { name: 'iPad Air 10.9" (Portrait)', width: 820, height: 1180, category: 'Tablet Portrait' },
  { name: 'iPad Air 10.9" (Landscape)', width: 1180, height: 820, category: 'Tablet Landscape' },
  { name: 'iPad Pro 11" (Portrait)', width: 834, height: 1194, category: 'Tablet Portrait' },
  { name: 'iPad Pro 11" (Landscape)', width: 1194, height: 834, category: 'Tablet Landscape' },
  { name: 'iPad Pro 12.9" (Portrait)', width: 1024, height: 1366, category: 'Tablet Portrait' },
  { name: 'iPad Pro 12.9" (Landscape)', width: 1366, height: 1024, category: 'Tablet Landscape' },
  {
    name: 'Samsung Galaxy Tab S7 / S8 (Portrait)',
    width: 800,
    height: 1280,
    category: 'Tablet Portrait',
  },
  {
    name: 'Samsung Galaxy Tab S7 / S8 (Landscape)',
    width: 1280,
    height: 800,
    category: 'Tablet Landscape',
  },
  {
    name: 'Google Pixel Tablet (Landscape)',
    width: 1280,
    height: 800,
    category: 'Tablet Landscape',
  },
  { name: 'Amazon Fire HD 8 (Portrait)', width: 600, height: 960, category: 'Tablet Portrait' },
  { name: 'Amazon Fire HD 10 (Portrait)', width: 800, height: 1280, category: 'Tablet Portrait' },
  {
    name: 'Microsoft Surface Pro 8/9 (Portrait)',
    width: 912,
    height: 1368,
    category: 'Tablet Portrait',
  },
  {
    name: 'Microsoft Surface Pro 8/9 (Landscape)',
    width: 1368,
    height: 912,
    category: 'Tablet Landscape',
  },

  // 9. Laptops & Desktop Displays
  { name: 'Netbook Display (1024x600)', width: 1024, height: 600, category: 'Desktop/Laptop' },
  { name: 'Standard XGA Monitor (1024x768)', width: 1024, height: 768, category: 'Desktop/Laptop' },
  {
    name: '11" MacBook Air / Chromebook (1366x768)',
    width: 1366,
    height: 768,
    category: 'Desktop/Laptop',
  },
  { name: '13" MacBook Air (1440x900)', width: 1440, height: 900, category: 'Desktop/Laptop' },
  { name: 'HD 720p Display (1280x720)', width: 1280, height: 720, category: 'Desktop/Laptop' },
  {
    name: 'WXGA Standard Display (1280x800)',
    width: 1280,
    height: 800,
    category: 'Desktop/Laptop',
  },
  {
    name: 'SXGA Desktop Monitor (1280x1024)',
    width: 1280,
    height: 1024,
    category: 'Desktop/Laptop',
  },
  {
    name: 'Windows 1080p at 125% DPI Scale (1536x864)',
    width: 1536,
    height: 864,
    category: 'Desktop/Laptop',
  },
  { name: 'HD+ Monitor (1600x900)', width: 1600, height: 900, category: 'Desktop/Laptop' },
  { name: 'WSXGA+ Display (1680x1050)', width: 1680, height: 1050, category: 'Desktop/Laptop' },
  {
    name: '16" MacBook Pro Retina Scaled (1728x1117)',
    width: 1728,
    height: 1117,
    category: 'Desktop/Laptop',
  },
  {
    name: 'Full HD 1080p Monitor (1920x1080)',
    width: 1920,
    height: 1080,
    category: 'Desktop/Laptop',
  },
  { name: 'QWXGA Monitor (2048x1152)', width: 2048, height: 1152, category: 'Desktop/Laptop' },
  {
    name: 'Surface Laptop 3:2 Ratio (2256x1504)',
    width: 2256,
    height: 1504,
    category: 'Desktop/Laptop',
  },
  {
    name: '2K QHD 1440p Monitor (2560x1440)',
    width: 2560,
    height: 1440,
    category: 'Desktop/Laptop',
  },
  {
    name: '13" MacBook Pro Retina (2560x1600)',
    width: 2560,
    height: 1600,
    category: 'Desktop/Laptop',
  },
  {
    name: '14" MacBook Pro Liquid Retina (3024x1964)',
    width: 3024,
    height: 1964,
    category: 'Desktop/Laptop',
  },
  {
    name: '16" MacBook Pro Liquid Retina (3456x2234)',
    width: 3456,
    height: 2234,
    category: 'Desktop/Laptop',
  },
  {
    name: '4K Ultra HD Display (3840x2160)',
    width: 3840,
    height: 2160,
    category: 'Desktop/Laptop',
  },

  // 10. Mobile Landscape Orientations
  {
    name: 'iPhone 5/SE 1st Gen (Landscape)',
    width: 568,
    height: 320,
    category: 'Mobile Landscape',
  },
  { name: 'Galaxy S8 / S9 (Landscape)', width: 740, height: 360, category: 'Mobile Landscape' },
  { name: 'Galaxy S20 / S21 (Landscape)', width: 780, height: 360, category: 'Mobile Landscape' },
  { name: 'Galaxy A-series (Landscape)', width: 800, height: 360, category: 'Mobile Landscape' },
  { name: 'iPhone 6/7/8/SE (Landscape)', width: 667, height: 375, category: 'Mobile Landscape' },
  {
    name: 'iPhone X / XS / 11 Pro (Landscape)',
    width: 812,
    height: 375,
    category: 'Mobile Landscape',
  },
  {
    name: 'iPhone 12 / 13 / 14 (Landscape)',
    width: 844,
    height: 390,
    category: 'Mobile Landscape',
  },
  {
    name: 'iPhone 14 Pro / 15 / 16 (Landscape)',
    width: 852,
    height: 393,
    category: 'Mobile Landscape',
  },
  { name: 'iPhone 8 Plus (Landscape)', width: 736, height: 414, category: 'Mobile Landscape' },
  { name: 'iPhone 11 / XR (Landscape)', width: 896, height: 414, category: 'Mobile Landscape' },
  {
    name: 'Google Pixel 7 / 8 / 9 (Landscape)',
    width: 915,
    height: 412,
    category: 'Mobile Landscape',
  },
  { name: 'iPhone 13 Pro Max (Landscape)', width: 926, height: 428, category: 'Mobile Landscape' },
  {
    name: 'iPhone 15/16 Pro Max (Landscape)',
    width: 932,
    height: 430,
    category: 'Mobile Landscape',
  },
];

console.log(`Loaded ${DEVICE_PROFILES.length} real-world device profiles.`);

// Read SVG content from both mobile and desktop marks
const mobileMarkContent = fs.readFileSync(
  path.resolve(
    __dirname,
    '../apps/customer/components/brand/quality-you-can-taste-mobile-mark.tsx',
  ),
  'utf8',
);
const mobilePathDMatch = mobileMarkContent.match(/d="([^"]+)"/);
const mobileMarkPathD = mobilePathDMatch ? mobilePathDMatch[1] : '';

const desktopMarkContent = fs.readFileSync(
  path.resolve(__dirname, '../apps/customer/components/brand/quality-you-can-taste-mark.tsx'),
  'utf8',
);
const desktopPathDMatch = desktopMarkContent.match(/d="([^"]+)"/);
const desktopMarkPathD = desktopPathDMatch ? desktopPathDMatch[1] : '';

// HTML Generator function matching the exact classes and DOM hierarchy of
// ScrollHeader + EditorialIntro + ScrollCue
function generateLandingPageHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quality Bakers - Landing Page</title>
  <style>
    ${cssContent}
    body {
      margin: 0;
      padding: 0;
      background-color: #BC1D1A;
      overflow-x: hidden;
    }
  </style>
</head>
<body class="bg-[#BC1D1A]">
  <!-- Header (matches ScrollHeader) -->
  <header class="sticky top-0 z-50 w-full bg-[#BC1D1A] h-[64px] md:h-[72px] lg:h-[76px] flex flex-col justify-center">
    <div class="w-full h-full max-w-none px-4 sm:px-6 md:px-10 lg:px-16 flex items-center justify-between pt-1 pb-1 md:pb-1.5 bg-[#FDFADB]">
      <a href="/" class="flex items-center gap-2.5 sm:gap-3 md:gap-3.5 min-w-0 outline-none select-none" id="brand-logo-link">
        <div id="brand-logo" class="w-9 h-9 min-[360px]:w-10 min-[360px]:h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full bg-[#BC1D1A] shrink-0 flex items-center justify-center text-[#FDFADB] text-xs font-bold">
          QB
        </div>
        <span id="brand-title" class="font-serif font-bold tracking-tight text-[#BC1D1A] text-[1.35rem] min-[360px]:text-2xl sm:text-[1.75rem] md:text-3xl leading-none transition-colors truncate">
          Quality Bakers
        </span>
      </a>
      <div class="flex items-center gap-6 md:gap-8">
        <nav class="hidden md:flex items-center gap-8 text-[#BC1D1A] font-medium text-sm">
          <a href="/categories">Menu</a>
          <a href="/#about">About</a>
          <a href="/search">Search</a>
        </nav>
        <div class="md:hidden" id="mobile-nav-trigger">
          <button class="p-2 text-[#BC1D1A]" aria-label="Toggle navigation">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
          </button>
        </div>
      </div>
    </div>
  </header>

  <!-- Hero Section (matches EditorialIntro exactly) -->
  <section
    id="home"
    class="hero-viewport-section relative w-full bg-[#BC1D1A] flex flex-col justify-between scroll-mt-[64px] md:scroll-mt-[72px] lg:scroll-mt-[76px] overflow-hidden"
  >
    <!-- Top Banner (Marquee) -->
    <div id="hero-marquee" class="hero-marquee-wrapper w-full z-20 relative mt-3.5 min-[360px]:mt-4 sm:mt-5 md:mt-6 shrink-0">
      <div class="hero-marquee-bar w-full border-b border-[#FDFADB]/15 py-2 min-[360px]:py-2.5 sm:py-3 md:py-3.5 flex items-center overflow-hidden flex-shrink-0 bg-[#BC1D1A]">
        <div class="flex whitespace-nowrap animate-marquee motion-reduce:animate-none w-max">
          <span class="flex items-center">
            <span class="text-[#FDFADB] uppercase text-[10px] sm:text-xs tracking-[0.25em] opacity-90 font-medium font-sans px-4">
              USE COLD MACERATED SPICED SYRUPS
            </span>
            <span class="text-[#FDFADB]/50 text-[10px] sm:text-xs px-2">✦</span>
            <span class="text-[#FDFADB] uppercase text-[10px] sm:text-xs tracking-[0.25em] opacity-90 font-medium font-sans px-4">
              FRESHLY BAKED DAILY
            </span>
            <span class="text-[#FDFADB]/50 text-[10px] sm:text-xs px-2">✦</span>
            <span class="text-[#FDFADB] uppercase text-[10px] sm:text-xs tracking-[0.25em] opacity-90 font-medium font-sans px-4">
              UNCOMPROMISING QUALITY
            </span>
            <span class="text-[#FDFADB]/50 text-[10px] sm:text-xs px-2">✦</span>
          </span>
        </div>
      </div>
    </div>

    <!-- Main Hero Content -->
    <div id="hero-content-container" class="hero-content-container mx-auto w-full max-w-7xl relative flex flex-col flex-1 px-4 sm:px-6 md:px-8 pt-2 pb-5 min-[360px]:pt-2 min-[360px]:pb-7 sm:py-6 md:py-8 justify-center min-h-0">
      <!-- MOBILE VIEW (< md) -->
      <div id="mobile-hero-layout" class="flex md:hidden flex-col items-start text-left w-full max-w-[360px] min-[390px]:max-w-[395px] min-[412px]:max-w-[420px] sm:max-w-[460px] mx-auto px-1 sm:px-2">
        <!-- Subtitle -->
        <div id="hero-subtitle" class="w-full">
          <div class="hero-mobile-subtitle flex items-center gap-2.5 sm:gap-3 w-full mb-2.5 min-[360px]:mb-3 sm:mb-4 select-none min-w-0">
            <span class="text-[#FDFADB]/95 uppercase font-sans text-[10.5px] min-[360px]:text-[11.5px] sm:text-[13px] tracking-[0.16em] min-[360px]:tracking-[0.22em] sm:tracking-[0.25em] font-semibold truncate">
              QUALITY BAKERS - SINCE 2020
            </span>
            <span class="h-[1px] flex-1 min-w-[16px] max-w-[68px] bg-[#FDFADB]/40 shrink-0"></span>
          </div>
        </div>

        <!-- Main Title SVG -->
        <h1 class="relative flex flex-col items-start w-full my-1 min-[360px]:my-1.5 sm:my-2" id="hero-title">
          <span class="sr-only">Quality you can taste</span>
          <svg
            id="hero-title-svg"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="-7.0 4.0 363.3 311.1"
            fill="currentColor"
            class="hero-title-mobile-svg w-full max-w-[295px] min-[360px]:max-w-[348px] min-[390px]:max-w-[376px] min-[412px]:max-w-[396px] sm:max-w-[440px] h-auto text-[#FDFADB] select-none filter drop-shadow-[0_4px_22px_rgba(0,0,0,0.25)]"
          >
            <path d="${mobileMarkPathD}" fill="currentColor" fill-rule="evenodd" />
          </svg>
        </h1>

        <!-- Explore Menu CTA Button -->
        <div class="w-full flex justify-start" id="hero-cta-wrapper">
          <a
            id="hero-cta-btn"
            href="/categories"
            class="hero-cta-button mt-5 min-[360px]:mt-6 sm:mt-7 inline-flex items-center justify-center px-8 min-[360px]:px-9 sm:px-11 py-3.5 min-[360px]:py-4 rounded-full bg-[#FDFADB] text-[#BC1D1A] font-sans font-bold text-[12.5px] min-[360px]:text-[13.5px] sm:text-sm uppercase tracking-[0.2em] shadow-[0_4px_14px_rgba(0,0,0,0.2)] select-none"
          >
            <span>EXPLORE MENU</span>
          </a>
        </div>
      </div>

      <!-- DESKTOP VIEW (>= md) -->
      <div id="desktop-hero-layout" class="hidden md:flex flex-col items-center justify-center text-center relative z-10 w-full max-w-6xl mx-auto px-4">
        <div id="desktop-hero-subtitle" class="hero-desktop-subtitle flex items-center justify-center gap-3 sm:gap-4 md:gap-5 w-full max-w-md md:max-w-xl mx-auto mb-3 sm:mb-4 md:mb-5">
          <span class="h-[1px] flex-1 max-w-[60px] sm:max-w-[80px] md:max-w-[110px] bg-[#FDFADB]/35"></span>
          <span class="text-[#FDFADB]/95 uppercase font-sans text-xs md:text-sm tracking-[0.24em] md:tracking-[0.3em] font-semibold whitespace-nowrap select-none">
            QUALITY BAKERS - SINCE 2020
          </span>
          <span class="h-[1px] flex-1 max-w-[60px] sm:max-w-[80px] md:max-w-[110px] bg-[#FDFADB]/35"></span>
        </div>
        <h1 class="relative flex flex-col items-center justify-center w-full my-1 sm:my-2" id="desktop-hero-title">
          <svg
            id="desktop-hero-svg"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="61.0 -0.0 874.3 136.0"
            fill="currentColor"
            class="hero-title-desktop-svg w-[96%] sm:w-[94%] md:w-[90%] max-w-[580px] sm:max-w-[760px] md:max-w-[920px] lg:max-w-[1020px] xl:max-w-[1100px] h-auto text-[#FDFADB] select-none filter drop-shadow-[0_4px_22px_rgba(0,0,0,0.22)]"
          >
            <path d="${desktopMarkPathD}" fill="currentColor" fill-rule="evenodd" />
          </svg>
        </h1>
        <div class="w-full flex justify-center">
          <a
            id="desktop-hero-cta-btn"
            href="/categories"
            class="hero-cta-button mt-6 sm:mt-7 md:mt-9 inline-flex items-center justify-center px-9 sm:px-11 md:px-12 py-3.5 sm:py-4 rounded-full bg-[#FDFADB] text-[#BC1D1A] font-sans font-bold text-xs sm:text-sm uppercase tracking-[0.2em] shadow-[0_4px_14px_rgba(0,0,0,0.2)] select-none"
          >
            <span>EXPLORE MENU</span>
          </a>
        </div>
      </div>
    </div>

    <!-- Bottom Scroll Cue Indicator -->
    <div id="scroll-cue-wrapper" class="hero-scroll-cue-wrapper w-full flex justify-center shrink-0 pb-3 min-[360px]:pb-4 sm:pb-5 md:pb-6 z-20 pointer-events-auto">
      <button
        id="scroll-cue-button"
        type="button"
        aria-label="Scroll to explore"
        class="group flex flex-col items-center justify-center cursor-pointer outline-none rounded-full py-1.5 px-4 select-none animate-scroll-jump"
      >
        <span id="scroll-cue-text" class="font-sans font-bold text-xs min-[360px]:text-[13px] tracking-[0.26em] pl-[0.26em] uppercase text-[#FDFADB] leading-none select-none block text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
          SCROLL
        </span>
        <svg
          id="scroll-cue-icon"
          class="w-4 h-4 text-[#FDFADB] mt-1 shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.75"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
    </div>
  </section>

  <!-- Categories / Menu Section to test scroll into view & page continuation -->
  <section id="signature" class="w-full bg-[#FAF7F2] py-12 px-4 sm:px-6 md:px-8 text-[#2D2A26]">
    <div class="max-w-7xl mx-auto">
      <h2 class="text-2xl sm:text-3xl font-serif font-bold text-[#BC1D1A] mb-6">Our Signature Creations</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div class="bg-white rounded-2xl p-4 shadow-sm border border-[#2D2A26]/5">
          <h3 class="font-serif font-bold text-lg text-[#2D2A26]">Artisanal Croissant</h3>
          <p class="text-sm text-[#2D2A26]/70 mt-1">Hand-rolled layered pastry with French butter.</p>
          <div class="mt-4 flex items-center justify-between">
            <span class="font-bold text-[#BC1D1A]">₹120</span>
            <span class="text-xs bg-[#BC1D1A]/10 text-[#BC1D1A] px-2 py-1 rounded-full font-medium">Fresh Daily</span>
          </div>
        </div>
        <div class="bg-white rounded-2xl p-4 shadow-sm border border-[#2D2A26]/5">
          <h3 class="font-serif font-bold text-lg text-[#2D2A26]">Sourdough Country Loaf</h3>
          <p class="text-sm text-[#2D2A26]/70 mt-1">Slow fermented 36-hour wild yeast artisan bread.</p>
          <div class="mt-4 flex items-center justify-between">
            <span class="font-bold text-[#BC1D1A]">₹220</span>
            <span class="text-xs bg-[#BC1D1A]/10 text-[#BC1D1A] px-2 py-1 rounded-full font-medium">Vegan</span>
          </div>
        </div>
        <div class="bg-white rounded-2xl p-4 shadow-sm border border-[#2D2A26]/5">
          <h3 class="font-serif font-bold text-lg text-[#2D2A26]">Dark Chocolate Ganache</h3>
          <p class="text-sm text-[#2D2A26]/70 mt-1">Single-origin 70% dark chocolate mousse pastry.</p>
          <div class="mt-4 flex items-center justify-between">
            <span class="font-bold text-[#BC1D1A]">₹180</span>
            <span class="text-xs bg-[#BC1D1A]/10 text-[#BC1D1A] px-2 py-1 rounded-full font-medium">Bestseller</span>
          </div>
        </div>
      </div>
    </div>
  </section>

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

async function runTestSuite() {
  console.log('Starting Playwright Chromium...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const landingHtml = generateLandingPageHtml();
  await page.setContent(landingHtml, { waitUntil: 'load' });

  let passedTests = 0;
  let failedTests = 0;
  const testResults = [];

  console.log(`\n================================================================================`);
  console.log(`RUNNING 100+ RESPONSIVE DEVICE TESTS FOR QUALITY BAKERS CUSTOMER WEB`);
  console.log(`================================================================================\n`);

  for (let i = 0; i < DEVICE_PROFILES.length; i++) {
    const dev = DEVICE_PROFILES[i];
    await page.setViewportSize({ width: dev.width, height: dev.height });

    // Apply ScrollCue's runtime --hero-fit-height safeguard (matches scroll-cue.tsx)
    await page.evaluate(() => {
      const homeSection = document.getElementById('home');
      if (homeSection) {
        const header = document.querySelector('header');
        const headerHeight = header ? header.getBoundingClientRect().height : 64;
        const vpHeight = window.visualViewport?.height || window.innerHeight;
        const fitHeight = Math.max(240, Math.floor(vpHeight - headerHeight));
        homeSection.style.setProperty('--hero-fit-height', `${fitHeight}px`);
      }
    });

    // Allow CSS layout evaluation
    await page.waitForTimeout(35);

    const metrics = await page.evaluate((deviceInfo) => {
      const doc = document.documentElement;
      const scrollWidth = doc.scrollWidth;
      const clientWidth = doc.clientWidth;
      const hasHorizontalOverflow = scrollWidth > clientWidth + 1;

      // Header verification
      const headerLogo = document.getElementById('brand-logo');
      const headerTitle = document.getElementById('brand-title');
      const logoRect = headerLogo ? headerLogo.getBoundingClientRect() : null;
      const titleRect = headerTitle ? headerTitle.getBoundingClientRect() : null;

      // Marquee
      const marquee = document.getElementById('hero-marquee');
      const marqueeRect = marquee ? marquee.getBoundingClientRect() : null;

      // Hero Elements
      const isMobile = window.innerWidth < 768;
      const subtitle = isMobile
        ? document.getElementById('hero-subtitle')
        : document.getElementById('desktop-hero-subtitle');
      const subtitleRect = subtitle ? subtitle.getBoundingClientRect() : null;

      const titleSvg = isMobile
        ? document.getElementById('hero-title-svg')
        : document.getElementById('desktop-hero-svg');
      const titleSvgRect = titleSvg ? titleSvg.getBoundingClientRect() : null;

      const ctaBtn = isMobile
        ? document.getElementById('hero-cta-btn')
        : document.getElementById('desktop-hero-cta-btn');
      const ctaRect = ctaBtn ? ctaBtn.getBoundingClientRect() : null;

      // Scroll Cue Verification
      const scrollCueBtn = document.getElementById('scroll-cue-button');
      const scrollCueText = document.getElementById('scroll-cue-text');
      const scrollCueIcon = document.getElementById('scroll-cue-icon');
      const cueBtnRect = scrollCueBtn ? scrollCueBtn.getBoundingClientRect() : null;

      const effectiveVisibleHeight = window.innerHeight;
      const isCueInViewport = cueBtnRect ? cueBtnRect.bottom <= effectiveVisibleHeight + 2 : false;
      const cueTopDistance = cueBtnRect ? cueBtnRect.top : 0;
      const buttonBottomDistance = ctaRect ? ctaRect.bottom : 0;
      const gapBetweenButtonAndCue = cueTopDistance - buttonBottomDistance;
      const noButtonCueCollision = gapBetweenButtonAndCue >= 4;

      // Space above "QUALITY BAKERS - SINCE 2020" below marquee
      const topGapAboveSubtitle =
        marqueeRect && subtitleRect ? subtitleRect.top - marqueeRect.bottom : null;

      return {
        hasHorizontalOverflow,
        scrollWidth,
        clientWidth,
        isMobile,
        logoVisible: !!logoRect && logoRect.width > 0 && logoRect.height > 0,
        logoSize: logoRect
          ? { width: Math.round(logoRect.width), height: Math.round(logoRect.height) }
          : null,
        titleVisible: !!titleRect && titleRect.width > 0,
        titleText: headerTitle ? headerTitle.textContent.trim() : '',
        titleFontSize: titleRect ? window.getComputedStyle(headerTitle).fontSize : '',
        subtitleVisible: !!subtitleRect && subtitleRect.height > 0,
        topGapAboveSubtitle: topGapAboveSubtitle !== null ? Math.round(topGapAboveSubtitle) : null,
        titleSvgRect: titleSvgRect
          ? {
              width: Math.round(titleSvgRect.width),
              height: Math.round(titleSvgRect.height),
              top: Math.round(titleSvgRect.top),
              bottom: Math.round(titleSvgRect.bottom),
            }
          : null,
        ctaVisible: !!ctaRect && ctaRect.width > 0,
        ctaBottom: ctaRect ? Math.round(ctaRect.bottom) : null,
        isCueInViewport,
        gapBetweenButtonAndCue: Math.round(gapBetweenButtonAndCue),
        noButtonCueCollision,
        cueBottom: cueBtnRect ? Math.round(cueBtnRect.bottom) : null,
        cueText: scrollCueText ? scrollCueText.textContent.trim() : '',
        cueIconPresent: !!scrollCueIcon,
        windowHeight: window.innerHeight,
        simulatedChromeBarExtraVh: deviceInfo.simulatedChromeBarExtraVh || 0,
      };
    }, dev);

    // Assertions
    const issues = [];
    if (metrics.hasHorizontalOverflow) {
      issues.push(
        `Horizontal overflow detected: scrollWidth (${metrics.scrollWidth}px) > clientWidth (${metrics.clientWidth}px)`,
      );
    }
    if (!metrics.logoVisible) {
      issues.push(`Header logo not visible or zero size`);
    }
    if (!metrics.titleVisible) {
      issues.push(`Header shop name not visible`);
    }
    if (!metrics.ctaVisible) {
      issues.push(`Explore menu CTA button not visible`);
    }
    if (!metrics.isCueInViewport) {
      issues.push(
        `Scroll cue bottom (${metrics.cueBottom}px) is beyond viewport height (${metrics.windowHeight}px)`,
      );
    }
    if (!metrics.noButtonCueCollision) {
      issues.push(
        `Button and scroll cue collision or insufficient gap (${metrics.gapBetweenButtonAndCue}px)`,
      );
    }
    if (metrics.cueText !== 'SCROLL') {
      issues.push(`Scroll cue text is not "SCROLL": found "${metrics.cueText}"`);
    }
    if (!metrics.cueIconPresent) {
      issues.push(`Scroll cue chevron icon is missing`);
    }
    // Verify enlarged content on portrait smartphones >= 360px wide with >= 640px height (like Motorola G34 5G)
    if (metrics.isMobile && dev.width >= 360 && dev.height >= 640) {
      if (!metrics.titleSvgRect || metrics.titleSvgRect.width < 305) {
        issues.push(
          `Mobile title SVG too small (${metrics.titleSvgRect ? metrics.titleSvgRect.width : 0}px < 305px)`,
        );
      }
      if (
        metrics.topGapAboveSubtitle !== null &&
        dev.height <= 850 &&
        metrics.topGapAboveSubtitle > 120
      ) {
        issues.push(
          `Excessive empty space above subtitle (${metrics.topGapAboveSubtitle}px > 120px)`,
        );
      }
    }

    const passed = issues.length === 0;
    if (passed) {
      passedTests++;
    } else {
      failedTests++;
    }

    const testResult = {
      index: i + 1,
      device: dev.name,
      category: dev.category,
      dimensions: `${dev.width}x${dev.height}`,
      passed,
      issues,
      metrics,
    };
    testResults.push(testResult);

    const dimStr = `${dev.width}x${dev.height}`;
    const statusBadge = passed ? '✅ PASS' : '❌ FAIL';
    console.log(
      `[${String(i + 1).padStart(3, ' ')}/${DEVICE_PROFILES.length}] ${statusBadge} | ${dimStr.padEnd(10, ' ')} | ${dev.category.padEnd(18, ' ')} | ${dev.name}`,
    );
    if (!passed) {
      console.log(`      ⚠️ Issues: ${issues.join('; ')}`);
    } else if (dev.category === 'Motorola G34 5G') {
      console.log(
        `      📏 Moto G34 Metrics: svg=${metrics.titleSvgRect?.width}x${metrics.titleSvgRect?.height}px, topGap=${metrics.topGapAboveSubtitle}px, ctaBottom=${metrics.ctaBottom}px, cueBottom=${metrics.cueBottom}/${metrics.windowHeight}px (gap=${metrics.gapBetweenButtonAndCue}px)`,
      );
    }
  }

  // Summary Report
  console.log(`\n================================================================================`);
  console.log(`TEST EXECUTION SUMMARY`);
  console.log(`================================================================================`);
  console.log(`Total Device Tests:  ${DEVICE_PROFILES.length}`);
  console.log(`Passed:              ${passedTests}`);
  console.log(`Failed:              ${failedTests}`);
  console.log(`Success Rate:        ${((passedTests / DEVICE_PROFILES.length) * 100).toFixed(1)}%`);
  console.log(`================================================================================\n`);

  await browser.close();

  // Save report to disk
  const reportPath = path.resolve(__dirname, '../responsive-test-report.json');
  fs.writeFileSync(
    reportPath,
    JSON.stringify(
      {
        totalTests: DEVICE_PROFILES.length,
        passed: passedTests,
        failed: failedTests,
        timestamp: new Date().toISOString(),
        results: testResults,
      },
      null,
      2,
    ),
    'utf8',
  );

  console.log(`Detailed test report saved to: ${reportPath}`);

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
