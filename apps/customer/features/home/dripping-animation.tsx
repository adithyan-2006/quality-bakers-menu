import * as React from 'react';

/**
 * TeardropSvg
 *
 * Vector SVG teardrop matching the exact silhouette and structure from the user reference:
 * - Pure conical tapered apex at the top seamlessly emerging from the wave crust
 * - Voluptuous bulbous bottom with rich 3D shading
 * - Curved specular crescent highlight stroke inside the bulb
 * - Specular dome glint and ambient bottom rim
 * - Multi-tier color shading matching the melted header bottom:
 *   ivory cream (#FFFDF7) -> rich cream (#FFF7EE) -> warm fondant (#FDF3DF) ->
 *   golden apricot (#F7D8B6) -> honey peach (#F0BA8E) -> warm caramel (#EAA97B)
 */
function TeardropSvg({ variant = 1 }: { variant?: 1 | 2 | 3 }) {
  // Variant 1: Pure classic teardrop (Center Hero Droplet)
  // Variant 2: Elongated stretched teardrop (Left Secondary Droplet)
  // Variant 3: Organic curved teardrop (Right Secondary Droplet)
  const pathD =
    variant === 2
      ? 'M 12,0.5 C 11.8,4.5 7.5,14 5,20 C 3.2,25 4.5,31 7.2,34 C 8.8,35.5 10.4,36 12,36 C 13.6,36 15.2,35.5 16.8,34 C 19.5,31 20.8,25 19,20 C 16.5,14 12.2,4.5 12,0.5 Z'
      : variant === 3
        ? 'M 12,1 C 13,5 11,13 6,18 C 3.5,22 3.5,25.5 3.5,27 C 3.5,32 7.5,35.5 12,35.5 C 16.5,35.5 20.5,32 20.5,27 C 20.5,23.5 18.5,19.5 15.5,14.5 C 13,10 12.2,4.5 12,1 Z'
        : 'M 12,1 C 11.5,5 5,16 5,23 C 5,30 8.2,35 12,35 C 15.8,35 19,30 19,23 C 19,16 12.5,5 12,1 Z';

  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 24 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full block"
      aria-hidden="true"
    >
      {/* Base Teardrop Body with rich melting cream vertical shading */}
      <path d={pathD} fill="url(#cream-drip-body-grad)" />

      {/* 3D Specular Dome Glint */}
      <path d={pathD} fill="url(#cream-drip-top-glint)" />

      {/* Ambient Reflected Rim */}
      <path d={pathD} fill="url(#cream-drip-bottom-rim)" />

      {/* Reference Crescent Highlight Stroke */}
      <path
        d="M 17.2,21.5 C 18.8,25 17.8,29.8 14.2,32.8"
        stroke="#FFFFFF"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
        opacity="0.95"
      />

      {/* Apex Specular Glint */}
      <ellipse
        cx="11.2"
        cy="12"
        rx="2.0"
        ry="4.5"
        fill="#FFFFFF"
        opacity="0.85"
        transform="rotate(-5 11.2 12)"
      />
    </svg>
  );
}

/**
 * DrippingAnimation
 *
 * Living artisanal dripping animation where organic 3D cream teardrops swell gracefully from
 * the lower crusts of the melting header waves, fall smoothly under continuous gravity
 * across the home page and over the marquee banner, executing a natural liquid splash animation
 * upon hitting the bottom baseline of the home section.
 */
interface DrippingAnimationProps {
  /**
   * Whether the dripping animation is active.
   * Defaults to false to stop the animation while keeping all assets and logic intact.
   */
  enabled?: boolean;
}

export function DrippingAnimation({ enabled = false }: DrippingAnimationProps = {}) {
  if (!enabled) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-30" aria-hidden="true">
      {/* Shared Root SVG Defs (Never display:none, always resolved globally for all viewports) */}
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <linearGradient id="cream-drip-body-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFDF7" />
            <stop offset="25%" stopColor="#FFF7EE" />
            <stop offset="50%" stopColor="#FDF3DF" />
            <stop offset="72%" stopColor="#F7D8B6" />
            <stop offset="88%" stopColor="#F0BA8E" />
            <stop offset="100%" stopColor="#EAA97B" />
          </linearGradient>
          <radialGradient id="cream-drip-top-glint" cx="44%" cy="32%" r="45%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="45%" stopColor="#FFF9F2" stopOpacity="0.65" />
            <stop offset="85%" stopColor="#FDF3DF" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="cream-drip-bottom-rim" cx="50%" cy="92%" r="35%">
            <stop offset="0%" stopColor="#FFFDF7" stopOpacity="0.80" />
            <stop offset="50%" stopColor="#F7D8B6" stopOpacity="0.30" />
            <stop offset="100%" stopColor="#F7D8B6" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>

      {/* Lane 1: Left Wave Nadir (x ≈ 14.4% mobile / 14.0% desktop) - Medium Droplet */}
      <div className="drip-lane lane-drip-1 block left-[14.4%] md:left-[14.0%]">
        <div className="cream-drip-drop">
          <TeardropSvg variant={2} />
        </div>
        <div className="cream-splash-target">
          <div className="cream-splash-ring" />
          <div className="cream-splash-bead bead-l" />
          <div className="cream-splash-bead bead-r" />
        </div>
      </div>

      {/* Lane 3: Center Deep Wave Nadir (x ≈ 46.55% mobile / 45.8% desktop) - Primary Voluptuous Cream Droplet */}
      <div className="drip-lane lane-drip-3 block left-[46.55%] md:left-[45.8%]">
        <div className="cream-drip-drop">
          <TeardropSvg variant={1} />
        </div>
        <div className="cream-splash-target">
          <div className="cream-splash-ring" />
          <div className="cream-splash-bead bead-l" />
          <div className="cream-splash-bead bead-c" />
          <div className="cream-splash-bead bead-r" />
        </div>
      </div>

      {/* Lane 5: Right Wave Nadir (x ≈ 89.1% mobile / 83.3% desktop) - Organic Teardrop Droplet */}
      <div className="drip-lane lane-drip-5 block left-[89.1%] md:left-[83.3%]">
        <div className="cream-drip-drop">
          <TeardropSvg variant={3} />
        </div>
        <div className="cream-splash-target">
          <div className="cream-splash-ring" />
          <div className="cream-splash-bead bead-l" />
          <div className="cream-splash-bead bead-c" />
          <div className="cream-splash-bead bead-r" />
        </div>
      </div>
    </div>
  );
}
