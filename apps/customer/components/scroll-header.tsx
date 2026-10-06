'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@qbm/ui';
import { MobileNav } from './mobile-nav';
import { ContentContainer } from './layout/content-container';

const DEFAULT_LOGO = '/images/quality-bakers-logo.png';

interface ScrollHeaderProps {
  businessName?: string;
  logoUrl?: string | null;
  children?: React.ReactNode;
}

export function ScrollHeader({
  businessName = 'Quality Bakers',
  logoUrl = DEFAULT_LOGO,
  children,
}: ScrollHeaderProps) {
  const effectiveLogo = logoUrl || DEFAULT_LOGO;

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full bg-transparent',
        'h-[64px] md:h-[78px] lg:h-[82px]',
        'flex flex-col justify-center',
      )}
    >
      {/* Shared SVG Defs for 3D Shading, Underside Bevel & Specular Gloss */}
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          {/* Multi-Layer Realistic Shadow Filter for authentic physical elevation above red */}
          <filter
            id="cream-multi-shadow"
            x="-5%"
            y="-10%"
            width="110%"
            height="180%"
            colorInterpolationFilters="sRGB"
          >
            {/* Close contact shadow: dark warm red-brown hugging the contour */}
            <feDropShadow
              dx="0"
              dy="2.5"
              stdDeviation="1.8"
              floodColor="#320604"
              floodOpacity="0.48"
            />
            {/* Mid-distance ambient shadow: soft diffusion */}
            <feDropShadow
              dx="0"
              dy="6.5"
              stdDeviation="5.0"
              floodColor="#4C0F08"
              floodOpacity="0.26"
            />
            {/* Soft wide ambient drop */}
            <feDropShadow
              dx="0"
              dy="13"
              stdDeviation="10.0"
              floodColor="#400A05"
              floodOpacity="0.12"
            />
          </filter>

          {/* Soft Gaussian blur for the specular highlight */}
          <filter id="specular-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.4" />
          </filter>

          {/* Crisp core highlight blur */}
          <filter id="core-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="0.6" />
          </filter>

          {/* Warm underside shading gradient inside cream */}
          <linearGradient id="warm-bevel-stroke" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#EED7B5" stopOpacity="0.1" />
            <stop offset="50%" stopColor="#DEB777" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#C28738" stopOpacity="0.85" />
          </linearGradient>

          {/* Cream body subtle 3D vertical gradient */}
          <linearGradient id="cream-body-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFF6E5" />
            <stop offset="70%" stopColor="#FFF1D8" />
            <stop offset="100%" stopColor="#FCE9C8" />
          </linearGradient>

          {/* Pearl droplet radial gradient */}
          <radialGradient id="drop-grad" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="40%" stopColor="#FFF1D8" />
            <stop offset="80%" stopColor="#E5C79E" />
            <stop offset="100%" stopColor="#BF8948" />
          </radialGradient>
        </defs>
      </svg>

      {/* Desktop Cream Header SVG (viewBox 0 0 1440 160) */}
      <svg
        className="cream-svg-desktop absolute inset-x-0 top-0 w-full h-[155px] lg:h-[160px] pointer-events-none -z-10 overflow-visible hidden lg:block"
        viewBox="0 0 1440 160"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <clipPath id="cream-desktop-clip">
            <path
              d="M 0,0
                 L 1440,0
                 L 1440,114
                 C 1400,114 1380,125 1350,125
                 C 1315,125 1295,110 1260,110
                 C 1225,110 1205,127 1170,127
                 C 1145,127 1130,115 1115,115
                 C 1110,115 1106,122 1104,134
                 C 1101,144 1098,154 1090,154
                 C 1082,154 1079,144 1076,134
                 C 1074,122 1070,115 1055,115
                 C 1025,115 1005,126 970,126
                 C 935,126 920,112 880,112
                 C 845,112 830,130 795,140
                 C 788,142 781,143 774,143
                 C 767,143 760,142 752,140
                 C 720,130 705,112 670,112
                 C 640,112 625,124 595,124
                 C 565,124 550,136 520,138
                 C 510,139 500,139 490,138
                 C 460,135 445,122 415,122
                 C 385,122 370,130 340,130
                 C 310,130 295,110 260,110
                 C 230,110 215,120 195,130
                 C 185,135 175,137 165,137
                 C 155,137 145,135 135,130
                 C 110,118 95,112 65,112
                 C 35,112 20,120 0,120
                 Z"
            />
          </clipPath>
        </defs>

        {/* LAYER 1: BASE CREAM BODY (#FFF1D8 with subtle 3D gradient + multi-layer contact & ambient shadows) */}
        <path
          d="M 0,0
             L 1440,0
             L 1440,114
             C 1400,114 1380,125 1350,125
             C 1315,125 1295,110 1260,110
             C 1225,110 1205,127 1170,127
             C 1145,127 1130,115 1115,115
             C 1110,115 1106,122 1104,134
             C 1101,144 1098,154 1090,154
             C 1082,154 1079,144 1076,134
             C 1074,122 1070,115 1055,115
             C 1025,115 1005,126 970,126
             C 935,126 920,112 880,112
             C 845,112 830,130 795,140
             C 788,142 781,143 774,143
             C 767,143 760,142 752,140
             C 720,130 705,112 670,112
             C 640,112 625,124 595,124
             C 565,124 550,136 520,138
             C 510,139 500,139 490,138
             C 460,135 445,122 415,122
             C 385,122 370,130 340,130
             C 310,130 295,110 260,110
             C 230,110 215,120 195,130
             C 185,135 175,137 165,137
             C 155,137 145,135 135,130
             C 110,118 95,112 65,112
             C 35,112 20,120 0,120
             Z"
          fill="url(#cream-body-grad)"
          filter="url(#cream-multi-shadow)"
        />

        {/* INNER 3D SHADING & HIGHLIGHT GROUP (Strictly clipped inside the cream body) */}
        <g clipPath="url(#cream-desktop-clip)">
          {/* LAYER 2: WARM UNDERSIDE BEVEL SHADING (Clipped inside cream, giving 3D convex thickness to the rim) */}
          <path
            d="M 0,120
               C 20,120 35,112 65,112
               C 95,112 110,118 135,130
               C 145,135 155,137 165,137
               C 175,137 185,135 195,130
               C 215,120 230,110 260,110
               C 295,110 310,130 340,130
               C 370,130 385,122 415,122
               C 445,122 460,135 490,138
               C 500,139 510,139 520,138
               C 550,136 565,124 595,124
               C 625,124 640,112 670,112
               C 705,112 720,130 752,140
               C 760,142 767,143 774,143
               C 781,143 788,142 795,140
               C 830,130 845,112 880,112
               C 920,112 935,126 970,126
               C 1005,126 1025,115 1055,115
               C 1070,115 1074,122 1076,134
               C 1079,144 1082,154 1090,154
               C 1098,154 1101,144 1104,134
               C 1106,122 1110,115 1115,115
               C 1130,115 1145,127 1170,127
               C 1205,127 1225,110 1260,110
               C 1295,110 1315,125 1350,125
               C 1380,125 1400,114 1440,114"
            fill="none"
            stroke="url(#warm-bevel-stroke)"
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.8"
          />

          {/* LAYER 3: SPECULAR HIGHLIGHT TUBE (Running 5-7px inside the rim to form 3D rolled cushion) */}
          <path
            d="M 0,114.5
               C 20,114.5 35,106.5 65,106.5
               C 95,106.5 110,112.5 135,124.5
               C 145,129.5 155,131.5 165,131.5
               C 175,131.5 185,129.5 195,124.5
               C 215,114.5 230,104.5 260,104.5
               C 295,104.5 310,124.5 340,124.5
               C 370,124.5 385,116.5 415,116.5
               C 445,116.5 460,129.5 490,132.5
               C 500,133.5 510,133.5 520,132.5
               C 550,130.5 565,118.5 595,118.5
               C 625,118.5 640,106.5 670,106.5
               C 705,106.5 720,124.5 752,134.5
               C 760,136.5 767,137.5 774,137.5
               C 781,137.5 788,136.5 795,134.5
               C 830,124.5 845,106.5 880,106.5
               C 920,106.5 935,120.5 970,120.5
               C 1005,120.5 1025,109.5 1055,109.5
               C 1070,109.5 1073,116.5 1075,128.5
               C 1078,138.5 1081,148.5 1090,148.5
               C 1099,148.5 1102,138.5 1105,128.5
               C 1107,116.5 1110,109.5 1115,109.5
               C 1130,109.5 1145,121.5 1170,121.5
               C 1205,121.5 1225,104.5 1260,104.5
               C 1295,104.5 1315,119.5 1350,119.5
               C 1380,119.5 1400,108.5 1440,108.5"
            fill="none"
            stroke="rgba(255, 255, 255, 0.72)"
            strokeWidth="4.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#specular-glow)"
          />

          {/* Crisp core glossy filament */}
          <path
            d="M 0,114.5
               C 20,114.5 35,106.5 65,106.5
               C 95,106.5 110,112.5 135,124.5
               C 145,129.5 155,131.5 165,131.5
               C 175,131.5 185,129.5 195,124.5
               C 215,114.5 230,104.5 260,104.5
               C 295,104.5 310,124.5 340,124.5
               C 370,124.5 385,116.5 415,116.5
               C 445,116.5 460,129.5 490,132.5
               C 500,133.5 510,133.5 520,132.5
               C 550,130.5 565,118.5 595,118.5
               C 625,118.5 640,106.5 670,106.5
               C 705,106.5 720,124.5 752,134.5
               C 760,136.5 767,137.5 774,137.5
               C 781,137.5 788,136.5 795,134.5
               C 830,124.5 845,106.5 880,106.5
               C 920,106.5 935,120.5 970,120.5
               C 1005,120.5 1025,109.5 1055,109.5
               C 1070,109.5 1073,116.5 1075,128.5
               C 1078,138.5 1081,148.5 1090,148.5
               C 1099,148.5 1102,138.5 1105,128.5
               C 1107,116.5 1110,109.5 1115,109.5
               C 1130,109.5 1145,121.5 1170,121.5
               C 1205,121.5 1225,104.5 1260,104.5
               C 1295,104.5 1315,119.5 1350,119.5
               C 1380,119.5 1400,108.5 1440,108.5"
            fill="none"
            stroke="rgba(255, 255, 255, 0.95)"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#core-glow)"
          />

          {/* Vertical specular glossy reflections down the drips */}
          <path
            d="M 165,125 L 165,134"
            stroke="rgba(255, 255, 255, 0.85)"
            strokeWidth="2.6"
            strokeLinecap="round"
            filter="url(#specular-glow)"
          />
          <path
            d="M 505,126 L 505,136"
            stroke="rgba(255, 255, 255, 0.85)"
            strokeWidth="2.6"
            strokeLinecap="round"
            filter="url(#specular-glow)"
          />
          <path
            d="M 774,130 L 774,141"
            stroke="rgba(255, 255, 255, 0.9)"
            strokeWidth="3.0"
            strokeLinecap="round"
            filter="url(#specular-glow)"
          />
          {/* Signature deep drip highlight and bulb gleam */}
          <path
            d="M 1089,122 L 1089,146"
            stroke="rgba(255, 255, 255, 0.92)"
            strokeWidth="3.0"
            strokeLinecap="round"
            filter="url(#specular-glow)"
          />
          <ellipse
            cx="1089"
            cy="148"
            rx="3.0"
            ry="2.2"
            fill="#FFFFFF"
            opacity="0.95"
            filter="url(#core-glow)"
          />
        </g>

        {/* SECONDARY DETACHED PEARL DROPLET (Matching reference suspended bead at x=105) */}
        <ellipse
          cx="105"
          cy="125"
          rx="5.5"
          ry="6.2"
          fill="url(#drop-grad)"
          filter="url(#cream-multi-shadow)"
        />
        <ellipse cx="103.5" cy="123" rx="2.0" ry="1.5" fill="#FFFFFF" opacity="0.95" />
      </svg>

      {/* Tablet Cream Header SVG (viewBox 0 0 768 140) */}
      <svg
        className="cream-svg-tablet absolute inset-x-0 top-0 w-full h-[135px] md:h-[140px] pointer-events-none -z-10 overflow-visible hidden md:max-lg:block"
        viewBox="0 0 768 140"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <clipPath id="cream-tablet-clip">
            <path
              d="M 0,0
                 L 768,0
                 L 768,104
                 C 740,104 725,116 700,116
                 C 675,116 660,102 635,102
                 C 625,102 618,108 615,118
                 C 612,126 608,136 600,136
                 C 592,136 588,126 585,118
                 C 582,108 575,102 560,102
                 C 535,102 520,118 490,118
                 C 460,118 445,102 410,102
                 C 375,102 360,126 325,126
                 C 290,126 275,104 240,104
                 C 205,104 190,122 155,122
                 C 125,122 110,102 80,102
                 C 50,102 30,110 0,110
                 Z"
            />
          </clipPath>
        </defs>

        <path
          d="M 0,0
             L 768,0
             L 768,104
             C 740,104 725,116 700,116
             C 675,116 660,102 635,102
             C 625,102 618,108 615,118
             C 612,126 608,136 600,136
             C 592,136 588,126 585,118
             C 582,108 575,102 560,102
             C 535,102 520,118 490,118
             C 460,118 445,102 410,102
             C 375,102 360,126 325,126
             C 290,126 275,104 240,104
             C 205,104 190,122 155,122
             C 125,122 110,102 80,102
             C 50,102 30,110 0,110
             Z"
          fill="url(#cream-body-grad)"
          filter="url(#cream-multi-shadow)"
        />

        <g clipPath="url(#cream-tablet-clip)">
          <path
            d="M 0,110
               C 30,110 50,102 80,102
               C 110,102 125,122 155,122
               C 190,122 205,104 240,104
               C 275,104 290,126 325,126
               C 360,126 375,102 410,102
               C 445,102 460,118 490,118
               C 520,118 535,102 560,102
               C 575,102 582,108 585,118
               C 588,126 592,136 600,136
               C 608,136 612,126 615,118
               C 618,108 625,102 635,102
               C 660,102 675,116 700,116
               C 725,116 740,104 768,104"
            fill="none"
            stroke="url(#warm-bevel-stroke)"
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.8"
          />
          <path
            d="M 0,105
               C 30,105 50,97 80,97
               C 110,97 125,117 155,117
               C 190,117 205,99 240,99
               C 275,99 290,121 325,121
               C 360,121 375,97 410,97
               C 445,97 460,113 490,113
               C 520,113 535,97 560,97
               C 575,97 581,103 584,113
               C 587,121 591,131 600,131
               C 609,131 613,121 616,113
               C 619,103 625,97 635,97
               C 660,97 675,111 700,111
               C 725,111 740,99 768,99"
            fill="none"
            stroke="rgba(255, 255, 255, 0.72)"
            strokeWidth="3.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#specular-glow)"
          />
          <path
            d="M 0,105
               C 30,105 50,97 80,97
               C 110,97 125,117 155,117
               C 190,117 205,99 240,99
               C 275,99 290,121 325,121
               C 360,121 375,97 410,97
               C 445,97 460,113 490,113
               C 520,113 535,97 560,97
               C 575,97 581,103 584,113
               C 587,121 591,131 600,131
               C 609,131 613,121 616,113
               C 619,103 625,97 635,97
               C 660,97 675,111 700,111
               C 725,111 740,99 768,99"
            fill="none"
            stroke="rgba(255, 255, 255, 0.95)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#core-glow)"
          />
          <path
            d="M 599,109 L 599,129"
            stroke="rgba(255, 255, 255, 0.9)"
            strokeWidth="2.6"
            strokeLinecap="round"
            filter="url(#specular-glow)"
          />
          <ellipse
            cx="599"
            cy="130"
            rx="2.6"
            ry="2.0"
            fill="#FFFFFF"
            opacity="0.95"
            filter="url(#core-glow)"
          />
        </g>
        <ellipse
          cx="65"
          cy="115"
          rx="5.0"
          ry="5.6"
          fill="url(#drop-grad)"
          filter="url(#cream-multi-shadow)"
        />
        <ellipse cx="63.5" cy="113.2" rx="1.8" ry="1.3" fill="#FFFFFF" opacity="0.95" />
      </svg>

      {/* Mobile Cream Header SVG (viewBox 0 0 390 115) */}
      <svg
        className="cream-svg-mobile absolute inset-x-0 top-0 w-full h-[115px] pointer-events-none -z-10 overflow-visible block md:hidden"
        viewBox="0 0 390 115"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <clipPath id="cream-mobile-clip">
            <path
              d="M 0,0
                 L 390,0
                 L 390,84
                 C 370,84 358,94 340,94
                 C 325,94 316,84 306,84
                 C 301,84 297,90 295,98
                 C 292,104 288,110 282,110
                 C 276,110 272,104 269,98
                 C 267,90 263,84 254,84
                 C 235,84 220,98 195,98
                 C 170,98 155,82 130,82
                 C 105,82 92,96 68,96
                 C 45,96 30,86 0,86
                 Z"
            />
          </clipPath>
        </defs>

        <path
          d="M 0,0
             L 390,0
             L 390,84
             C 370,84 358,94 340,94
             C 325,94 316,84 306,84
             C 301,84 297,90 295,98
             C 292,104 288,110 282,110
             C 276,110 272,104 269,98
             C 267,90 263,84 254,84
             C 235,84 220,98 195,98
             C 170,98 155,82 130,82
             C 105,82 92,96 68,96
             C 45,96 30,86 0,86
             Z"
          fill="url(#cream-body-grad)"
          filter="url(#cream-multi-shadow)"
        />

        <g clipPath="url(#cream-mobile-clip)">
          <path
            d="M 0,86
               C 30,86 45,96 68,96
               C 92,96 105,82 130,82
               C 155,82 170,98 195,98
               C 220,98 235,84 254,84
               C 263,84 267,90 269,98
               C 272,104 276,110 282,110
               C 288,110 292,104 295,98
               C 297,90 301,84 306,84
               C 316,84 325,94 340,94
               C 358,94 370,84 390,84"
            fill="none"
            stroke="url(#warm-bevel-stroke)"
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.8"
          />
          <path
            d="M 0,81.5
               C 30,81.5 45,91.5 68,91.5
               C 92,91.5 105,77.5 130,77.5
               C 155,77.5 170,93.5 195,93.5
               C 220,93.5 235,79.5 254,79.5
               C 263,79.5 267,85.5 269,93.5
               C 272,99.5 276,105.5 282,105.5
               C 288,105.5 292,99.5 295,93.5
               C 297,85.5 301,79.5 306,79.5
               C 316,79.5 325,89.5 340,89.5
               C 358,89.5 370,79.5 390,79.5"
            fill="none"
            stroke="rgba(255, 255, 255, 0.72)"
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#specular-glow)"
          />
          <path
            d="M 0,81.5
               C 30,81.5 45,91.5 68,91.5
               C 92,91.5 105,77.5 130,77.5
               C 155,77.5 170,93.5 195,93.5
               C 220,93.5 235,79.5 254,79.5
               C 263,79.5 267,85.5 269,93.5
               C 272,99.5 276,105.5 282,105.5
               C 288,105.5 292,99.5 295,93.5
               C 297,85.5 301,79.5 306,79.5
               C 316,79.5 325,89.5 340,89.5
               C 358,89.5 370,79.5 390,79.5"
            fill="none"
            stroke="rgba(255, 255, 255, 0.95)"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#core-glow)"
          />
          <path
            d="M 281,91 L 281,104"
            stroke="rgba(255, 255, 255, 0.9)"
            strokeWidth="2.2"
            strokeLinecap="round"
            filter="url(#specular-glow)"
          />
          <ellipse
            cx="281"
            cy="105"
            rx="2.2"
            ry="1.6"
            fill="#FFFFFF"
            opacity="0.95"
            filter="url(#core-glow)"
          />
        </g>
        <ellipse
          cx="40"
          cy="94"
          rx="4.2"
          ry="4.8"
          fill="url(#drop-grad)"
          filter="url(#cream-multi-shadow)"
        />
        <ellipse cx="38.8" cy="92.5" rx="1.5" ry="1.1" fill="#FFFFFF" opacity="0.95" />
      </svg>

      <ContentContainer className="flex items-center justify-between h-full">
        <Link
          href="/"
          className="flex items-center gap-2 sm:gap-2.5 md:gap-3 outline-none focus-visible:ring-2 focus-visible:ring-[#A71920] rounded-sm"
        >
          <div className="relative flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10">
            <Image
              src={effectiveLogo}
              alt={businessName}
              fill
              sizes="(max-width: 640px) 32px, (max-width: 768px) 36px, 40px"
              className="object-contain"
              priority
              unoptimized
            />
          </div>
          <span className="font-serif font-bold tracking-tight text-[#A71920] text-2xl md:text-3xl">
            {businessName}
          </span>
        </Link>
        <div className="flex items-center gap-6 md:gap-8">
          <div className="hidden md:flex items-center gap-8">{children}</div>
          <div className="-mr-2 sm:-mr-2.5">
            <MobileNav />
          </div>
        </div>
      </ContentContainer>
    </header>
  );
}
