/**
 * Menu Experience Engine — Type Definitions
 *
 * These types are local to the customer application.
 * They are presentation-layer types, NOT database entity types.
 * The DB entity types live in @qbm/types.
 *
 * When the API is connected, these will be consumed by a mapper:
 * API response → MenuCategoryConfig
 */

// ─── Layout ──────────────────────────────────────────────────────────────────

/**
 * Controls ONLY which product grid layout is used.
 * Has no knowledge of category identity or theme.
 */
export type LayoutType =
  | 'editorial-grid'
  | 'pinterest-grid'
  | 'magazine-split'
  | 'gallery-wall'
  | 'spotlight'
  | 'alternating-layout';

// ─── Theme / Display ─────────────────────────────────────────────────────────

/**
 * Controls ONLY the visual style (typography, spacing, accents).
 * Has no knowledge of layout or animation.
 */
export type DisplayStyle =
  'luxury' | 'fresh' | 'minimal' | 'cafe' | 'classic' | 'healthy' | 'warm' | 'modern' | 'dark';

// ─── Animation ───────────────────────────────────────────────────────────────

/**
 * Level 1: CSS-based entrance animation preset.
 * Controls ONLY how elements enter the viewport.
 * Resolved by AnimationEngine into AnimationConfig.
 */
export type AnimationPreset = 'fade' | 'reveal' | 'slide' | 'scale' | 'stagger' | 'none';

/**
 * Level 2: Scroll behaviour for future premium editorial effects.
 * 'standard'  → default CSS IntersectionObserver approach.
 * 'immersive' → signals that this section may use scroll-linked effects
 *               (e.g. Framer Motion parallax). Loaded lazily — never affects
 *               the main bundle.
 */
export type ScrollBehavior = 'standard' | 'immersive';

/**
 * Resolved animation configuration consumed by MotionWrapper.
 * MotionWrapper has no knowledge of presets — it only reads this config.
 */
export interface AnimationConfig {
  /** CSS class applied when the element enters the viewport. */
  enterClass: string;
  /** Initial opacity before entering. */
  initialOpacity: number;
  /** Base transition delay in ms for staggered children. */
  staggerDelayMs: number;
  /** Whether this preset staggers child elements. */
  isStaggered: boolean;
}

// ─── Theme Classes ────────────────────────────────────────────────────────────

/**
 * Resolved theme class map consumed by layout components.
 * Layout components receive this — they never call ThemeEngine directly.
 */
export interface ThemeClasses {
  section: string;
  heading: string;
  subheading: string;
  description: string;
  card: string;
  cardHover: string;
  badge: string;
  accent: string;
  divider: string;
  price: string;
}

// ─── Product ─────────────────────────────────────────────────────────────────

/**
 * Presentation-layer product model used by the Menu Engine.
 * Intentionally excludes price (not shown in menu browsing).
 * Maps from the full Product entity when the API is connected.
 */
export interface MenuProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
  badge?: string;
  price?: string;
  categorySlug: string;
}

// ─── Category Configuration ───────────────────────────────────────────────────

/**
 * The single source of truth for how a category is presented.
 * Every field has exactly ONE responsibility.
 *
 * Admin Panel will later allow editing:
 *   - name, slug, description, coverImage    → business content
 *   - displayOrder, isVisible, isFeatured    → business configuration
 *   - featuredOnHome, heroProductId          → business configuration
 *
 * Admin Panel will NOT control:
 *   - layoutType, displayStyle, animationPreset, scrollBehavior
 *   → These belong to the design system (developer-controlled)
 */
export interface MenuCategoryConfig {
  // Identity
  id: string;
  name: string;
  slug: string;
  description: string;

  // Media
  coverImage?: string;

  // Ordering (Admin-controlled at runtime)
  displayOrder: number;

  // Layout engine (design-system controlled)
  layoutType: LayoutType;

  // Theme engine (design-system controlled)
  displayStyle: DisplayStyle;
  accentColor?: string;

  // Animation engine (design-system controlled)
  animationPreset: AnimationPreset;
  scrollBehavior: ScrollBehavior;

  // Content
  heroProductId?: string;

  // Visibility (Admin-controlled at runtime)
  isVisible: boolean;
  isFeatured: boolean;
  featuredOnHome: boolean;

  // Timestamps
  createdAt: string;
  updatedAt: string;
}
