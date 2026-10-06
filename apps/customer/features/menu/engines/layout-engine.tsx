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
 * Desktop Layout Registry — Open/Closed for Extension
 *
 * Maps LayoutType → Desktop Layout Component.
 * Restores the previous visual editorial desktop arrangement for PC/desktop.
 */
const DESKTOP_LAYOUT_REGISTRY: Record<LayoutType, LayoutComponent> = {
  'editorial-grid': EditorialGrid,
  'pinterest-grid': PinterestGrid,
  'magazine-split': MagazineSplit,
  'gallery-wall': GalleryWall,
  spotlight: Spotlight,
  'alternating-layout': AlternatingLayout,
};

const DEFAULT_DESKTOP_LAYOUT: LayoutComponent = EditorialGrid;

interface LayoutEngineProps extends LayoutComponentProps {
  layoutType: LayoutType;
}

/**
 * Layout Engine — Server Component
 *
 * Responsively renders:
 * - Mobile & Tablet (< lg): SingleColumnStack (untouched, one card per row stack)
 * - PC / Desktop (lg+): Restored category-specific desktop layout
 */
export function LayoutEngine({
  layoutType,
  products,
  themeClasses,
  animationConfig,
}: LayoutEngineProps) {
  const DesktopLayout = DESKTOP_LAYOUT_REGISTRY[layoutType] ?? DEFAULT_DESKTOP_LAYOUT;

  return (
    <>
      {/* Mobile & Tablet (< lg): Current single-column stack, completely untouched */}
      <div className="block lg:hidden">
        <SingleColumnStack
          products={products}
          themeClasses={themeClasses}
          animationConfig={animationConfig}
        />
      </div>

      {/* PC / Desktop (lg+): Previous desktop layout restored */}
      <div className="hidden lg:block">
        <DesktopLayout
          products={products}
          themeClasses={themeClasses}
          animationConfig={animationConfig}
        />
      </div>
    </>
  );
}
