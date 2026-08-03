import { ProductRepository } from '../../../features/products/repositories/product-repo';
import { getCategoriesAction } from '../../../features/categories/actions/category-actions';
import { ProductList } from '../../../features/products/components/product-list';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    ProductRepository.getProducts(),
    getCategoriesAction(),
  ]);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Products</h2>
          <p className="text-stone-500">Manage your menu items, pricing, and availability.</p>
        </div>
        <Link
          href="/products/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 text-stone-50 rounded-md font-medium text-sm hover:bg-stone-800 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      <ProductList initialProducts={products} categories={categories} />
    </div>
  );
}
