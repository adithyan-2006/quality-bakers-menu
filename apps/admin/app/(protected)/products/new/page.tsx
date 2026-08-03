import { ProductForm } from '../../../../features/products/components/product-form';
import { getCategoriesAction } from '../../../../features/categories/actions/category-actions';

export default async function NewProductPage() {
  const categories = await getCategoriesAction();

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Add New Product</h2>
        <p className="text-stone-500">Create a new product for your menu.</p>
      </div>

      <ProductForm categories={categories} />
    </div>
  );
}
