import * as React from 'react';
import type { LayoutType, MenuProduct, ThemeClasses, AnimationConfig } from '../types';
import { SingleColumnStack } from '../layouts/single-column-stack';
import { EditorialGrid } from '../layouts/editorial-grid';
import { PinterestGrid } from '../layouts/pinterest-grid';
import { MagazineSplit } from '../layouts/magazine-split';
import { GalleryWall } from '../layouts/gallery-wall';
import { Spotlight } from '../layouts/spotlight';
import { AlternatingLayout } from '../layouts/alternating-layout';

/**
 * Shared props contract for every layout component.
 * Layouts must ONLY accept this interface — nothing more.
 * They must never know which category they are rendering.
 */
export interface LayoutComponentProps {
  products: MenuProduct[];
  themeClasses: ThemeClasses;
  animationConfig: AnimationConfig;
}

type LayoutComponent = (props: LayoutComponentProps) => React.ReactElement | null;

/**
 * Responsive Layout Registry — Open/Closed for Extension
 *
 * Maps LayoutType → Category Layout Component.
 * Each layout is inherently responsive from mobile to tablet to desktop.
 */
const LAYOUT_REGISTRY: Record<string, LayoutComponent> = {
  'editorial-grid': EditorialGrid,
  'pinterest-grid': PinterestGrid,
  'magazine-split': MagazineSplit,
  'gallery-wall': GalleryWall,
  spotlight: Spotlight,
  'alternating-layout': AlternatingLayout,
  'single-column-stack': SingleColumnStack,
};

const DEFAULT_LAYOUT: LayoutComponent = EditorialGrid;

interface LayoutEngineProps extends LayoutComponentProps {
  layoutType: LayoutType;
}

/**
 * Layout Engine — Server Component
 *
 * Renders a single responsive component tree for the category.
 * Each category-specific layout adapts across:
 * - Mobile (< 640px / < 768px): comfortable single-column reading and touch targets
 * - Tablet (768px–1023px): category-tailored 2-column or split layouts
 * - Desktop (1024px+): full multi-column editorial presentation
 *
 * Eliminates duplicate DOM rendering, duplicate Next.js images, and duplicate
 * interactive like-button state.
 */
export function LayoutEngine({
  layoutType,
  products,
  themeClasses,
  animationConfig,
}: LayoutEngineProps) {
  const Layout = LAYOUT_REGISTRY[layoutType] ?? DEFAULT_LAYOUT;

  return (
    <Layout products={products} themeClasses={themeClasses} animationConfig={animationConfig} />
  );
}
