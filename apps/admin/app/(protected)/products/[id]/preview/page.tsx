import { getProductAction } from '../../../../../features/products/actions/product-actions';
import { getCategoryAction } from '../../../../../features/categories/actions/category-actions';
import { notFound } from 'next/navigation';
import { ProductCard } from 'customer/features/menu/product/product-card';
import Link from 'next/link';
import { ArrowLeft, Edit2 } from 'lucide-react';
import type { MenuProduct } from 'customer/features/menu/types';

interface PreviewProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function PreviewProductPage({ params }: PreviewProductPageProps) {
  const { id } = await params;
  const product = await getProductAction(id);

  if (!product) {
    notFound();
  }

  const category = await getCategoryAction(product.categoryId);

  // Map AdminProduct to Customer MenuProduct format
  const customerProduct = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.shortDescription,
    price: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(
      product.price,
    ),
    image: product.image,
    badge: product.badge === 'none' ? undefined : product.badge,
  };

  // Mock theme classes for the preview (using a classic elegant theme)
  const previewThemeClasses = {
    section: 'bg-stone-50',
    card: 'bg-white shadow-sm ring-1 ring-black/5',
    cardHover: 'hover:shadow-md hover:ring-black/10 transition-all duration-300',
    badge:
      'bg-amber-100 text-amber-900 border border-amber-200 uppercase tracking-widest text-[10px] font-bold px-2.5 py-0.5 rounded-full',
    heading: 'font-serif text-stone-900',
    subheading: 'font-sans text-stone-600',
    description: 'font-sans text-stone-500 font-light',
    price: 'font-sans text-amber-700 font-medium',
    divider: 'border-stone-100',
    accent: 'bg-amber-100',
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/products"
            className="p-2 text-stone-500 hover:text-stone-900 dark:hover:text-stone-50 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-md shadow-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Preview: {product.name}</h2>
            <p className="text-stone-500">
              This is how your product will appear on the customer website.
            </p>
          </div>
        </div>
        <Link
          href={`/products/${product.id}/edit`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 text-stone-50 rounded-md font-medium text-sm hover:bg-stone-800 transition-colors shadow-sm"
        >
          <Edit2 className="w-4 h-4" />
          Edit Product
        </Link>
      </div>

      <div className="bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden shadow-inner p-8 md:p-12 min-h-[600px] flex items-center justify-center relative">
        {/* Mock Customer Interface displaying the actual ProductCard */}
        <div className="w-full max-w-sm mx-auto">
          <div className="mb-6 text-center">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-500 mb-2">
              Live Component Preview
            </h3>
          </div>

          <ProductCard
            product={customerProduct as MenuProduct}
            themeClasses={previewThemeClasses}
            presentationStyle="standard"
          />

          <div className="mt-12 bg-white dark:bg-stone-950 p-6 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-500 mb-4">
              Metadata
            </h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
              <div>
                <dt className="text-stone-500 dark:text-stone-400">Category</dt>
                <dd className="font-medium text-stone-900 dark:text-stone-50">
                  {category?.name || 'Uncategorized'}
                </dd>
              </div>
              <div>
                <dt className="text-stone-500 dark:text-stone-400">Availability</dt>
                <dd className="font-medium text-stone-900 dark:text-stone-50 capitalize">
                  {product.availabilityStatus.replace('-', ' ')}
                </dd>
              </div>
              <div>
                <dt className="text-stone-500 dark:text-stone-400">Status</dt>
                <dd className="font-medium text-stone-900 dark:text-stone-50 capitalize">
                  {product.status}
                </dd>
              </div>
              <div>
                <dt className="text-stone-500 dark:text-stone-400">Featured</dt>
                <dd className="font-medium text-stone-900 dark:text-stone-50">
                  {product.isFeatured ? 'Yes' : 'No'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
