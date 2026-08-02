import * as React from 'react';
import type { LayoutType, MenuProduct, ThemeClasses, AnimationConfig } from '../types';
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
 * Layout Registry — Open/Closed for Extension
 *
 * Maps LayoutType → Layout Component.
 * NO switch statements. NO imperative dispatch logic.
 *
 * To add a new layout:
 *   1. Create the component implementing LayoutComponentProps
 *   2. Add the entry here
 *   3. Add the key to the LayoutType union type
 *   That is all. LayoutEngine requires no other changes.
 *
 * Future: entries can be wrapped in React.lazy() / next/dynamic()
 * here without changing the public LayoutEngine API.
 * Example: 'masonry': React.lazy(() => import('../layouts/masonry'))
 */
const LAYOUT_REGISTRY: Record<LayoutType, LayoutComponent> = {
  'editorial-grid': EditorialGrid,
  'pinterest-grid': PinterestGrid,
  'magazine-split': MagazineSplit,
  'gallery-wall': GalleryWall,
  spotlight: Spotlight,
  'alternating-layout': AlternatingLayout,
};

const DEFAULT_LAYOUT: LayoutComponent = EditorialGrid;

interface LayoutEngineProps extends LayoutComponentProps {
  layoutType: LayoutType;
}

/**
 * Layout Engine — Server Component
 *
 * Resolves layoutType to a Layout Component via the registry.
 * Falls back to EditorialGrid for any unregistered type.
 *
 * Public API is intentionally stable:
 *   { layoutType, products, themeClasses, animationConfig }
 * This contract will not change even if internals switch to lazy loading.
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
