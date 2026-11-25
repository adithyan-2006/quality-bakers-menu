import { getProductAction } from '../../../../../features/products/actions/product-actions';
import { getCategoryAction } from '../../../../../features/categories/actions/category-actions';
import { notFound } from 'next/navigation';
import { ProductPreviewCard } from '../../../../../features/products/components/product-preview-card';
import Link from 'next/link';
import { ArrowLeft, Edit2 } from 'lucide-react';

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

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/products"
            className="p-2 text-stone-600 hover:text-black bg-white/80 backdrop-blur-md border border-black/[0.08] rounded-xl shadow-glass transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-black">
              Preview: {product.name}
            </h2>
            <p className="text-stone-600 text-sm">
              This is how your product will appear on the customer website.
            </p>
          </div>
        </div>
        <Link
          href={`/products/${product.id}/edit`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-black hover:bg-neutral-800 text-white rounded-xl font-medium text-sm transition-all shadow-glass"
        >
          <Edit2 className="w-4 h-4" />
          Edit Product
        </Link>
      </div>

      <div className="bg-white/70 backdrop-blur-md border border-black/[0.08] rounded-2xl overflow-hidden shadow-glass p-8 md:p-12 min-h-[600px] flex items-center justify-center relative">
        {/* Mock Customer Interface displaying the actual ProductCard */}
        <div className="w-full max-w-sm mx-auto">
          <div className="mb-6 text-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-2">
              Live Component Preview
            </h3>
          </div>

          <ProductPreviewCard product={customerProduct} />

          <div className="mt-12 bg-white/80 backdrop-blur-md p-6 rounded-2xl border border-black/[0.08] shadow-glass">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-4">
              Metadata
            </h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
              <div>
                <dt className="text-stone-600 font-medium">Category</dt>
                <dd className="font-bold text-black">{category?.name || 'Uncategorized'}</dd>
              </div>
              <div>
                <dt className="text-stone-600 font-medium">Availability</dt>
                <dd className="font-bold text-black capitalize">
                  {product.availabilityStatus.replace('-', ' ')}
                </dd>
              </div>
              <div>
                <dt className="text-stone-600 font-medium">Status</dt>
                <dd className="font-bold text-black capitalize">{product.status}</dd>
              </div>
              <div>
                <dt className="text-stone-600 font-medium">Featured</dt>
                <dd className="font-bold text-black">{product.isFeatured ? 'Yes' : 'No'}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
