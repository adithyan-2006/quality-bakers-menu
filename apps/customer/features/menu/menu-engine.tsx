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
 */
export async function MenuEngine() {
  const categories = await CategoryRepository.getVisible();
  const navItems = categories.map(({ id, name, slug }) => ({ id, name, slug }));

  // Fetch all products in a single batched query to eliminate connection pool pressure
  const categorySlugs = categories.map((c) => c.slug);
  const productsBySlug = await ProductRepository.getProductsForCategories(categorySlugs);

  const categoryProducts = categories.map((config) => ({
    config,
    products: productsBySlug[config.slug] || [],
  }));

  return (
    <div className="flex flex-col w-full bg-[#BC1D1A]">
      <CategoryNav categories={navItems} />
      <div className="flex flex-col">
        {categoryProducts.map(({ config, products }) => (
          <CategorySection key={config.id} config={config} products={products} />
        ))}
      </div>
    </div>
  );
}
