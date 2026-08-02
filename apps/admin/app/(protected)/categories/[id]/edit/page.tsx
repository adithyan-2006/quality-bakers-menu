import { CategoryRepository } from '../../../../../features/categories/repositories/category-repo';
import { CategoryForm } from '../../../../../features/categories/components/category-form';
import { notFound } from 'next/navigation';

interface EditCategoryPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditCategoryPage({ params }: EditCategoryPageProps) {
  const { id } = await params;
  const category = await CategoryRepository.getCategory(id);

  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Edit Category</h2>
        <p className="text-stone-500">Update settings for {category.name}.</p>
      </div>

      <CategoryForm initialData={category} />
    </div>
  );
}
