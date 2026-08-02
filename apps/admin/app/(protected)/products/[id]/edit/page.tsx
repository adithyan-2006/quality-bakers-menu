import { ProductRepository } from '../../../../../features/products/repositories/product-repo';
import { CategoryRepository } from '../../../../../features/categories/repositories/category-repo';
import { ProductForm } from '../../../../../features/products/components/product-form';
import { notFound } from 'next/navigation';

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    ProductRepository.getProduct(id),
    CategoryRepository.getCategories(),
  ]);

  if (!product) {
    notFound();
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Edit Product</h2>
        <p className="text-stone-500">Update details for {product.name}.</p>
      </div>

      <ProductForm initialData={product} categories={categories} />
    </div>
  );
}
