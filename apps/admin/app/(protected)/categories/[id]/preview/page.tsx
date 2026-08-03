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
            className="p-2 text-stone-500 hover:text-stone-900 dark:hover:text-stone-50 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-md shadow-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Preview: {category.name}</h2>
            <p className="text-stone-500">
              This is how your category will appear on the customer website.
            </p>
          </div>
        </div>
        <Link
          href={`/categories/${category.id}/edit`}
          className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 text-stone-50 rounded-md font-medium text-sm hover:bg-stone-800 transition-colors shadow-sm"
        >
          <Edit2 className="w-4 h-4" />
          Edit Category
        </Link>
      </div>

      <div className="bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden shadow-inner p-8 md:p-12 min-h-[600px] flex items-center justify-center relative">
        {/* Mock Customer Interface */}
        <div className="w-full max-w-3xl mx-auto bg-white dark:bg-stone-950 rounded-2xl shadow-xl overflow-hidden">
          <div className="h-64 relative bg-stone-200 dark:bg-stone-800">
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
            <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-500 mb-6">
              Configuration Preview
            </h3>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6 text-sm">
              <div>
                <dt className="text-stone-500 dark:text-stone-400">Theme</dt>
                <dd className="font-medium text-stone-900 dark:text-stone-50 capitalize">
                  {category.theme}
                </dd>
              </div>
              <div>
                <dt className="text-stone-500 dark:text-stone-400">Layout Engine</dt>
                <dd className="font-medium text-stone-900 dark:text-stone-50">{layoutName}</dd>
              </div>
              <div>
                <dt className="text-stone-500 dark:text-stone-400">Animation</dt>
                <dd className="font-medium text-stone-900 dark:text-stone-50 capitalize">
                  {category.animationPreset.replace('-', ' ')}
                </dd>
              </div>
              <div>
                <dt className="text-stone-500 dark:text-stone-400">Accent Color</dt>
                <dd className="font-medium text-stone-900 dark:text-stone-50">
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

            <div className="mt-8 pt-8 border-t border-stone-100 dark:border-stone-800 flex gap-4">
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
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
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
