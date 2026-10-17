import { CustomerRepository } from '../repositories/customer-repository';
import { FooterBrandLink, FooterQuickLinks } from './footer-nav';

// Continuous rhythmic cubic Bezier wave contours calibrated from Reference Image 2:
const DESKTOP_WAVE_PATH =
  'M 0,52 C 32,52 39,42 70,42 C 106,42 114,64 150,64 C 231,64 249,40 330,40 C 411,40 429,66 510,66 C 591,66 609,40 690,40 C 771,40 789,70 870,70 C 951,70 969,40 1050,40 C 1136,40 1155,78 1240,78 C 1303,78 1317,42 1380,42 C 1407,42 1413,50 1440,50';

const DESKTOP_CREAM_BODY =
  'M 0,420 L 1440,420 L 1440,50 C 1413,50 1407,42 1380,42 C 1317,42 1303,78 1240,78 C 1155,78 1136,40 1050,40 C 969,40 951,70 870,70 C 789,70 771,40 690,40 C 609,40 591,66 510,66 C 429,66 411,40 330,40 C 249,40 231,64 150,64 C 114,64 106,42 70,42 C 39,42 32,52 0,52 Z';

const MOBILE_WAVE_PATH =
  'M 0,52 C 29,52 36,42 65,42 C 99,42 106,66 140,66 C 181,66 190,40 230,40 C 271,40 280,68 320,68 C 361,68 370,40 410,40 C 442,40 449,64 480,64 C 500,64 505,50 525,50';

const MOBILE_CREAM_BODY =
  'M 0,450 L 525,450 L 525,50 C 505,50 500,64 480,64 C 449,64 442,40 410,40 C 370,40 361,68 320,68 C 280,68 271,40 230,40 C 190,40 181,66 140,66 C 106,66 99,42 65,42 C 36,42 29,52 0,52 Z';

export async function Footer() {
  const business = await CustomerRepository.getBusiness();
  const currentYear = new Date().getFullYear();

  const businessName = business?.name || 'Quality Bakers';
  const logoUrl =
    (business?.logo ? business.logo.secureUrl || business.logo.originalUrl : null) ||
    '/images/quality-bakers-logo.png';
  const tagline =
    business?.tagline ||
    'Baked with love, served with happiness. Bringing sweet moments to your everyday life.';

  const mapsUrl =
    business?.googleMapsUrl && business.googleMapsUrl !== 'https://maps.google.com'
      ? business.googleMapsUrl
      : 'https://maps.app.goo.gl/7b6qojCh9BaWQjfX7?g_st=atm';

  const locationText = 'Quality Bakers';

  const phoneText = business?.phone || '+91 9747995870';
  const phoneTel = phoneText.replace(/[^0-9+]/g, '');

  const emailText = business?.email || 'hello.qualitybakers@gmail.com';

  const instagramUrl =
    business?.instagram && business.instagram !== 'https://instagram.com'
      ? business.instagram
      : 'https://www.instagram.com/quality_bakers_sooranad?rpxt=MXY4MG9waTB3ZHAzNg==';
  const whatsappNumber = (business?.whatsapp || business?.phone || '919747995870').replace(
    /[^0-9]/g,
    '',
  );
  const whatsappUrl = business?.whatsapp?.startsWith('http')
    ? business.whatsapp
    : `https://wa.me/${whatsappNumber}`;

  return (
    <footer className="relative isolate w-full bg-[#BC1D1A] overflow-visible mt-auto pt-[82px] pb-6 md:pt-32 md:pb-12 text-[#BC1D1A]">
      {/* Shared SVG Defs for 3D Shading, Undercut Crease, Specular Sheen & Spherical Pearls */}
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          {/* Cream Body Vertical Gradient (Soft Clotted Cream) */}
          <linearGradient id="footer-cream-fill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFDF7" />
            <stop offset="25%" stopColor="#FAF1E1" />
            <stop offset="60%" stopColor="#F5E4CE" />
            <stop offset="100%" stopColor="#EED3B8" />
          </linearGradient>

          {/* Upward Velvety Deep Shadow onto #BC1D1A Red Background */}
          <filter
            id="footer-shadow-up"
            x="-5%"
            y="-50%"
            width="110%"
            height="280%"
            colorInterpolationFilters="sRGB"
          >
            <feDropShadow
              dx="0"
              dy="-2.0"
              stdDeviation="1.8"
              floodColor="#480505"
              floodOpacity="0.65"
            />
            <feDropShadow
              dx="0"
              dy="-5.0"
              stdDeviation="4.5"
              floodColor="#660808"
              floodOpacity="0.45"
            />
            <feDropShadow
              dx="0"
              dy="-10.0"
              stdDeviation="8.5"
              floodColor="#7D0D0D"
              floodOpacity="0.22"
            />
          </filter>

          {/* Slender Undercut Crease Blur */}
          <filter
            id="footer-roll-undercut"
            x="-20%"
            y="-30%"
            width="140%"
            height="220%"
            colorInterpolationFilters="sRGB"
          >
            <feGaussianBlur stdDeviation="2.4" />
          </filter>

          {/* Specular and Bevel Soft Blurs */}
          <filter id="footer-sheen-diffuse" x="-20%" y="-30%" width="140%" height="200%">
            <feGaussianBlur stdDeviation="3.0" />
          </filter>
          <filter id="footer-sheen-gloss" x="-20%" y="-30%" width="140%" height="200%">
            <feGaussianBlur stdDeviation="1.2" />
          </filter>
          <filter id="footer-highlight-soft" x="-20%" y="-30%" width="140%" height="200%">
            <feGaussianBlur stdDeviation="0.5" />
          </filter>

          {/* Mobile Scale Soft Blurs */}
          <filter id="footer-m-undercut" x="-20%" y="-30%" width="140%" height="220%">
            <feGaussianBlur stdDeviation="1.8" />
          </filter>
          <filter id="footer-m-diffuse" x="-20%" y="-30%" width="140%" height="200%">
            <feGaussianBlur stdDeviation="2.2" />
          </filter>
          <filter id="footer-m-gloss" x="-20%" y="-30%" width="140%" height="200%">
            <feGaussianBlur stdDeviation="0.9" />
          </filter>

          {/* 3D Spherical Pearl Radial Gradient */}
          <radialGradient id="footer-pearl-grad" cx="32%" cy="28%" r="68%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="22%" stopColor="#FFFFFF" />
            <stop offset="42%" stopColor="#FFFBF2" />
            <stop offset="68%" stopColor="#F4E2CC" />
            <stop offset="86%" stopColor="#D7A97D" />
            <stop offset="96%" stopColor="#C28A58" />
            <stop offset="100%" stopColor="#DDB289" />
          </radialGradient>

          {/* Pearl Contact Shadow Filters */}
          <filter id="footer-pearl-shadow-diffuse" x="-80%" y="-80%" width="260%" height="260%">
            <feGaussianBlur stdDeviation="7.0" />
          </filter>
          <filter id="footer-pearl-shadow-tight" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" />
          </filter>

          {/* Desktop Clip Path */}
          <clipPath id="footer-cream-desktop-clip">
            <path d={DESKTOP_CREAM_BODY} />
          </clipPath>

          {/* Mobile Clip Path */}
          <clipPath id="footer-cream-mobile-clip">
            <path d={MOBILE_CREAM_BODY} />
          </clipPath>
        </defs>
      </svg>

      {/* Desktop & Tablet Cream Footer SVG (viewBox 0 0 1440 420) */}
      <svg
        className="footer-cream-svg-desktop absolute inset-0 w-full h-full pointer-events-none -z-10 overflow-visible hidden md:block"
        viewBox="0 0 1440 420"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {/* Base Cream Body with velvety upward cast shadow */}
        <path
          d={DESKTOP_CREAM_BODY}
          fill="url(#footer-cream-fill)"
          filter="url(#footer-shadow-up)"
        />

        {/* The 3D Liquid Cream Slender Bevel Roll */}
        <g clipPath="url(#footer-cream-desktop-clip)">
          {/* 1. Soft subtle warm undercut crease */}
          <path
            d={DESKTOP_WAVE_PATH}
            fill="none"
            stroke="#91522A"
            strokeWidth="10.0"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#footer-roll-undercut)"
            transform="translate(0, 5.5)"
            opacity="0.24"
          />

          {/* 2. Warm golden-apricot foundation roll */}
          <path
            d={DESKTOP_WAVE_PATH}
            fill="none"
            stroke="#F7D8B6"
            strokeWidth="14.0"
            strokeLinecap="round"
            strokeLinejoin="round"
            transform="translate(0, 2.5)"
            opacity="0.65"
          />

          {/* 3. Rich warm honey-apricot bevel rim */}
          <path
            d={DESKTOP_WAVE_PATH}
            fill="none"
            stroke="#F0BA8E"
            strokeWidth="8.0"
            strokeLinecap="round"
            strokeLinejoin="round"
            transform="translate(0, 1.2)"
            opacity="0.75"
          />

          {/* 4. Delicate warm caramel contact rim along the edge */}
          <path
            d={DESKTOP_WAVE_PATH}
            fill="none"
            stroke="#EAA97B"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.70"
          />

          {/* 5. Wide soft specular glow */}
          <path
            d={DESKTOP_WAVE_PATH}
            fill="none"
            stroke="rgba(255, 255, 255, 0.45)"
            strokeWidth="9.0"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#footer-sheen-diffuse)"
            transform="translate(0, 2.0)"
          />

          {/* 6. Focused specular gloss streak */}
          <path
            d={DESKTOP_WAVE_PATH}
            fill="none"
            stroke="rgba(255, 255, 255, 0.70)"
            strokeWidth="4.0"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#footer-sheen-gloss)"
            transform="translate(0, 1.5)"
          />

          {/* 7. Soft luminous specular core highlight */}
          <path
            d={DESKTOP_WAVE_PATH}
            fill="none"
            stroke="rgba(255, 255, 255, 0.95)"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#footer-highlight-soft)"
            transform="translate(0, 1.0)"
          />
        </g>

        {/* 3D Spherical Pearls & Droplets Matching Image 2 Reference Exact Layout */}
        <g>
          {/* PEARL 1: Left Rim Pearl (in trough at x=138, y=68) */}
          <ellipse
            cx="138"
            cy="74"
            rx="10"
            ry="5"
            fill="#9E5F36"
            opacity="0.30"
            filter="url(#footer-pearl-shadow-diffuse)"
          />
          <circle cx="138" cy="68" r="8" fill="url(#footer-pearl-grad)" />
          <ellipse cx="135.5" cy="65" rx="2.8" ry="1.7" fill="#FFFFFF" opacity="0.95" />
          <circle cx="134" cy="63.5" r="0.9" fill="#FFFFFF" />

          {/* TWO SMALL BEADS in Trough between Quick Links and Get in Touch */}
          {/* Bead A */}
          <ellipse
            cx="855"
            cy="84"
            rx="8"
            ry="4"
            fill="#9E5F36"
            opacity="0.30"
            filter="url(#footer-pearl-shadow-diffuse)"
          />
          <circle cx="855" cy="79" r="6.5" fill="url(#footer-pearl-grad)" />
          <ellipse cx="853" cy="76" rx="2.4" ry="1.5" fill="#FFFFFF" opacity="0.95" />
          {/* Bead B */}
          <ellipse
            cx="878"
            cy="98"
            rx="9"
            ry="4.5"
            fill="#9E5F36"
            opacity="0.30"
            filter="url(#footer-pearl-shadow-diffuse)"
          />
          <circle cx="878" cy="92" r="7.5" fill="url(#footer-pearl-grad)" />
          <ellipse cx="875.5" cy="88.5" rx="2.8" ry="1.7" fill="#FFFFFF" opacity="0.95" />

          {/* PEARL 3: THE LARGE FLOATING 3D SPHERE IN IMAGE 2 (to the right of Get in Touch in scoop) */}
          <ellipse
            cx="1267"
            cy="163"
            rx="24"
            ry="11"
            fill="#9E5F36"
            opacity="0.35"
            filter="url(#footer-pearl-shadow-diffuse)"
          />
          <ellipse
            cx="1266"
            cy="158"
            rx="15"
            ry="5.5"
            fill="#662A12"
            opacity="0.28"
            filter="url(#footer-pearl-shadow-tight)"
          />
          <circle cx="1265" cy="145" r="17.5" fill="url(#footer-pearl-grad)" />
          <ellipse
            cx="1259.5"
            cy="138"
            rx="6.2"
            ry="4.0"
            fill="#FFFFFF"
            opacity="0.95"
            filter="url(#footer-highlight-soft)"
          />
          <circle cx="1257" cy="135.5" r="1.8" fill="#FFFFFF" />
          <path
            d="M 1251,156 A 16 16 0 0 0 1279,156 A 16 14 0 0 1 1251,156 Z"
            fill="#FFF2E2"
            opacity="0.75"
          />

          {/* PEARL 4: Far Right Crest Pearl (x=1375, y=48) */}
          <ellipse
            cx="1376"
            cy="55"
            rx="12"
            ry="6"
            fill="#9E5F36"
            opacity="0.30"
            filter="url(#footer-pearl-shadow-diffuse)"
          />
          <ellipse
            cx="1375"
            cy="52"
            rx="8"
            ry="3.8"
            fill="#662A12"
            opacity="0.28"
            filter="url(#footer-pearl-shadow-tight)"
          />
          <circle cx="1375" cy="48" r="9.0" fill="url(#footer-pearl-grad)" />
          <ellipse cx="1372" cy="44" rx="3.5" ry="2.2" fill="#FFFFFF" opacity="0.95" />
          <circle cx="1370" cy="42.5" r="1.1" fill="#FFFFFF" />
        </g>
      </svg>

      {/* Mobile Cream Footer SVG (viewBox 0 0 525 450) */}
      <svg
        className="footer-cream-svg-mobile absolute inset-0 w-full h-full pointer-events-none -z-10 overflow-visible md:hidden"
        viewBox="0 0 525 450"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        {/* Base Mobile Cream Body */}
        <path
          d={MOBILE_CREAM_BODY}
          fill="url(#footer-cream-fill)"
          filter="url(#footer-shadow-up)"
        />

        {/* The 3D Liquid Cream Slender Roll for Mobile */}
        <g clipPath="url(#footer-cream-mobile-clip)">
          <path
            d={MOBILE_WAVE_PATH}
            fill="none"
            stroke="#91522A"
            strokeWidth="7.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#footer-m-undercut)"
            transform="translate(0, 4.0)"
            opacity="0.24"
          />
          <path
            d={MOBILE_WAVE_PATH}
            fill="none"
            stroke="#F7D8B6"
            strokeWidth="10.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            transform="translate(0, 1.8)"
            opacity="0.65"
          />
          <path
            d={MOBILE_WAVE_PATH}
            fill="none"
            stroke="#F0BA8E"
            strokeWidth="6.0"
            strokeLinecap="round"
            strokeLinejoin="round"
            transform="translate(0, 0.9)"
            opacity="0.75"
          />
          <path
            d={MOBILE_WAVE_PATH}
            fill="none"
            stroke="#EAA97B"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.70"
          />
          <path
            d={MOBILE_WAVE_PATH}
            fill="none"
            stroke="rgba(255, 255, 255, 0.45)"
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#footer-m-diffuse)"
            transform="translate(0, 1.5)"
          />
          <path
            d={MOBILE_WAVE_PATH}
            fill="none"
            stroke="rgba(255, 255, 255, 0.70)"
            strokeWidth="3.0"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#footer-m-gloss)"
            transform="translate(0, 1.1)"
          />
          <path
            d={MOBILE_WAVE_PATH}
            fill="none"
            stroke="rgba(255, 255, 255, 0.95)"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            transform="translate(0, 0.7)"
          />
        </g>

        {/* Mobile 3D Pearls */}
        <g>
          <ellipse
            cx="65"
            cy="46"
            rx="8"
            ry="4"
            fill="#9E5F36"
            opacity="0.30"
            filter="url(#footer-pearl-shadow-diffuse)"
          />
          <circle cx="65" cy="42" r="6.5" fill="url(#footer-pearl-grad)" />
          <ellipse cx="62.5" cy="39.5" rx="2.4" ry="1.5" fill="#FFFFFF" opacity="0.95" />

          <ellipse
            cx="320"
            cy="72"
            rx="10"
            ry="5"
            fill="#9E5F36"
            opacity="0.30"
            filter="url(#footer-pearl-shadow-diffuse)"
          />
          <circle cx="320" cy="68" r="7.5" fill="url(#footer-pearl-grad)" />
          <ellipse cx="317.5" cy="64.5" rx="2.8" ry="1.7" fill="#FFFFFF" opacity="0.95" />

          <ellipse
            cx="460"
            cy="72"
            rx="14"
            ry="7"
            fill="#9E5F36"
            opacity="0.30"
            filter="url(#footer-pearl-shadow-diffuse)"
          />
          <circle cx="460" cy="65" r="11" fill="url(#footer-pearl-grad)" />
          <ellipse cx="456.5" cy="60.5" rx="4.0" ry="2.5" fill="#FFFFFF" opacity="0.95" />
        </g>
      </svg>

      {/* Main Content Layout Container (No Vertical Separation Lines!) */}
      <div className="max-w-6xl mx-auto px-6 md:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr_1fr] items-start gap-5 md:gap-12 lg:gap-16">
          {/* Column 1: Brand & Tagline & Circular Social Badges */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <FooterBrandLink businessName={businessName} logoUrl={logoUrl} />
            <p className="text-[#BC1D1A]/85 text-xs lg:text-sm font-light leading-relaxed max-w-xs mb-3.5 md:mb-5">
              {tagline}
            </p>
            {/* Social Icons (Instagram and WhatsApp, red inner design without circular background) */}
            <div className="flex items-center gap-4">
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="text-[#BC1D1A] hover:text-[#8E100D] transition-transform hover:scale-110 active:scale-95"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="text-[#BC1D1A] hover:text-[#8E100D] transition-transform hover:scale-110 active:scale-95"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links (Hidden on mobile) */}
          <div className="hidden md:flex flex-col items-center md:items-start text-center md:text-left">
            <h3 className="font-serif text-lg lg:text-xl font-bold text-[#BC1D1A] mb-3.5 tracking-tight">
              Quick Links
            </h3>
            <FooterQuickLinks />
          </div>

          {/* Column 3: Get in Touch */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <h3 className="font-serif text-base md:text-lg lg:text-xl font-bold text-[#BC1D1A] mb-2 md:mb-3.5 tracking-tight">
              Get in Touch
            </h3>
            <ul className="flex flex-col space-y-2 md:space-y-3 text-xs lg:text-sm text-[#BC1D1A]/85 font-light">
              <li className="flex items-center gap-3">
                <svg
                  className="w-4 h-4 text-[#BC1D1A] shrink-0 fill-current"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 0c-4.198 0-8 3.403-8 7.602 0 6.243 6.377 11.484 7.509 15.688.163.606.818.606.982 0 1.132-4.204 7.509-9.445 7.509-15.688 0-4.199-3.801-7.602-8-7.602zm0 11c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3z" />
                </svg>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#8E100D] hover:underline transition-colors"
                >
                  {locationText}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <svg
                  className="w-4 h-4 text-[#BC1D1A] shrink-0 fill-current"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M20 22.621l-3.521-6.795c-.008.004-1.974.97-2.064 1.011-2.24 1.086-6.799-7.82-4.609-8.994l2.083-1.026-3.493-6.817-2.106 1.039c-7.202 3.755 4.233 25.982 11.6 22.615l2.109-1.028h.001z" />
                </svg>
                <a
                  href={`tel:${phoneTel}`}
                  className="hover:text-[#8E100D] hover:underline transition-colors"
                >
                  {phoneText}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <svg
                  className="w-4 h-4 text-[#BC1D1A] shrink-0 fill-current"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#8E100D] hover:underline transition-colors"
                >
                  WhatsApp
                </a>
              </li>
              <li className="flex items-center gap-3">
                <svg
                  className="w-4 h-4 text-[#BC1D1A] shrink-0 fill-current"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M0 3v18h24v-18h-24zm6.623 7.929l-4.623 5.712v-9.458l4.623 3.746zm-4.141-5.929h19.035l-9.517 7.713-9.518-7.713zm5.694 7.188l3.824 3.099 3.83-3.104 5.612 6.817h-18.779l5.513-6.812zm9.208-1.264l4.616-3.741v9.348l-4.616-5.607z" />
                </svg>
                <a
                  href={`mailto:${emailText}`}
                  className="hover:text-[#8E100D] hover:underline transition-colors"
                >
                  {emailText}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Centered Heart Divider (Refined brand red) */}
        <div className="flex items-center justify-center my-3.5 md:my-8 w-full">
          <div className="flex-1 h-px bg-[#BC1D1A]/20"></div>
          <span className="px-4 text-[#BC1D1A] text-xs select-none">♥</span>
          <div className="flex-1 h-px bg-[#BC1D1A]/20"></div>
        </div>

        {/* Copyright */}
        <p className="text-xs text-[#BC1D1A]/75 font-light text-center">
          &copy; {currentYear} {businessName}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
