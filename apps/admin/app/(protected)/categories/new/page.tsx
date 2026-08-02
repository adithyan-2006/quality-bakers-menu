import { CategoryForm } from '../../../../features/categories/components/category-form';

export default function NewCategoryPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Add New Category</h2>
        <p className="text-stone-500">Create a new menu category for your customers.</p>
      </div>

      <CategoryForm />
    </div>
  );
}
