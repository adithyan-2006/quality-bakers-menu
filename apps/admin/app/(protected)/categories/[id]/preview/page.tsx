import { getCategoryAction } from '../../../../../features/categories/actions/category-actions';
import { notFound } from 'next/navigation';
import { cn } from '@qbm/ui';
import Link from 'next/link';
import { ArrowLeft, Edit2 } from 'lucide-react';

interface PreviewCategoryPageProps {
  params: Promise<{ id: string }>;
}

const LAYOUT_NAMES: Record<string, string> = {
  'editorial-grid': 'Classic Grid',
  spotlight: 'Featured Layout',
  'gallery-wall': 'Gallery Layout',
  'magazine-split': 'Magazine Layout',
  alternating: 'Alternating Layout',
};

export default async function PreviewCategoryPage({ params }: PreviewCategoryPageProps) {
  const { id } = await params;
  const category = await getCategoryAction(id);

  if (!category) {
    notFound();
  }

  const layoutName = LAYOUT_NAMES[category.layoutType] || category.layoutType;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/categories"
            className="p-2 text-stone-600 hover:text-black bg-white/80 backdrop-blur-md border border-black/[0.08] rounded-xl shadow-glass transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-black">
              Preview: {category.name}
            </h2>
            <p className="text-stone-600 text-sm">
              This is how your category will appear on the customer website.
            </p>
          </div>
        </div>
        <Link
          href={`/categories/${category.id}/edit`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-black hover:bg-neutral-800 text-white rounded-xl font-medium text-sm transition-all shadow-glass"
        >
          <Edit2 className="w-4 h-4" />
          Edit Category
        </Link>
      </div>

      <div className="bg-white/70 backdrop-blur-md border border-black/[0.08] rounded-2xl overflow-hidden shadow-glass p-8 md:p-12 min-h-[600px] flex items-center justify-center relative">
        {/* Mock Customer Interface */}
        <div className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-black/[0.08]">
          <div className="h-64 relative bg-stone-200">
            {category.coverImage && (
              <img
                src={category.coverImage}
                alt={category.name}
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="text-center text-white px-6">
                <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-tight mb-4">
                  {category.name}
                </h1>
                <p className="text-lg text-white/90 max-w-xl mx-auto font-sans font-light">
                  {category.description || 'Experience our carefully crafted selection.'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-8">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-600 mb-6">
              Configuration Preview
            </h3>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6 text-sm">
              <div>
                <dt className="text-stone-600 font-medium">Theme</dt>
                <dd className="font-bold text-black capitalize">{category.theme}</dd>
              </div>
              <div>
                <dt className="text-stone-600 font-medium">Layout Engine</dt>
                <dd className="font-bold text-black">{layoutName}</dd>
              </div>
              <div>
                <dt className="text-stone-600 font-medium">Animation</dt>
                <dd className="font-bold text-black capitalize">
                  {category.animationPreset.replace('-', ' ')}
                </dd>
              </div>
              <div>
                <dt className="text-stone-600 font-medium">Accent Color</dt>
                <dd className="font-bold text-black">
                  {category.accentColor ? (
                    <span className="flex items-center gap-2">
                      <span
                        className="w-4 h-4 rounded-full border border-stone-200"
                        style={{ backgroundColor: category.accentColor }}
                      />
                      {category.accentColor}
                    </span>
                  ) : (
                    'Default'
                  )}
                </dd>
              </div>
            </dl>

            <div className="mt-8 pt-8 border-t border-black/[0.06] flex gap-4">
              <span
                className={cn(
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  category.isVisible
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-stone-100 text-stone-800',
                )}
              >
                {category.isVisible ? 'Currently Visible' : 'Currently Hidden'}
              </span>
              {category.isFeatured && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-black text-white">
                  Featured Collection
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
