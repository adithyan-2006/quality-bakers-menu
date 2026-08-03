import { getCategoriesAction } from '../../../features/categories/actions/category-actions';
import { CategoryList } from '../../../features/categories/components/category-list';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default async function CategoriesPage() {
  const categories = await getCategoriesAction();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Categories</h2>
          <p className="text-stone-500">Manage your menu categories and their display order.</p>
        </div>
        <Link
          href="/categories/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 text-stone-50 rounded-md font-medium text-sm hover:bg-stone-800 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </Link>
      </div>

      <CategoryList initialCategories={categories} />
    </div>
  );
}
