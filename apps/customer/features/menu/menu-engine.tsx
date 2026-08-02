import * as React from 'react';
import { CategoryRepository } from './repository/category-repository';
import { ProductRepository } from './repository/product-repository';
import { CategoryNav } from './navigation/category-nav';
import { CategorySection } from './sections/category-section';

/**
 * Menu Engine — Server Component (Root Orchestrator)
 *
 * Rendering pipeline:
 *   1. CategoryRepository.getVisible() → sorted by displayOrder, never array index
 *   2. CategoryNav [Client] — receives minimal nav items only
 *   3. For each category:
 *      a. ProductRepository.getProductsForCategory(slug)
 *      b. CategorySection [Server] → Theme + Animation + Layout engines
 *
 * Admin migration:
 *   When API ships, update CategoryRepository._source() and
 *   ProductRepository.getProductsForCategory() only.
 *   This file requires zero changes.
 */
export function MenuEngine() {
  const categories = CategoryRepository.getVisible();
  const navItems = categories.map(({ id, name, slug }) => ({ id, name, slug }));

  return (
    <div className="flex flex-col w-full">
      <CategoryNav categories={navItems} />
      <div className="flex flex-col">
        {categories.map((config) => {
          const products = ProductRepository.getProductsForCategory(config.slug);
          return <CategorySection key={config.id} config={config} products={products} />;
        })}
      </div>
    </div>
  );
}
