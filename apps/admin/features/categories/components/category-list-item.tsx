'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AdminCategory } from '../repositories/category-repo';
import { GripVertical, Edit2, Eye, EyeOff, LayoutTemplate } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@qbm/ui';

interface CategoryListItemProps {
  category: AdminCategory;
  onToggleVisibility: (id: string) => void;
}

const LAYOUT_NAMES: Record<string, string> = {
  'editorial-grid': 'Classic Grid',
  spotlight: 'Featured Layout',
  'gallery-wall': 'Gallery Layout',
  'magazine-split': 'Magazine Layout',
  alternating: 'Alternating Layout',
};

export function CategoryListItem({ category, onToggleVisibility }: CategoryListItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: category.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const layoutName = LAYOUT_NAMES[category.layoutType] || category.layoutType;

  // Format dates for bakery owner friendly view
  const updatedDate = new Date(category.updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative flex items-center gap-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-4 shadow-sm group transition-all',
        isDragging &&
          'opacity-50 shadow-md ring-2 ring-stone-900/10 dark:ring-stone-50/10 scale-[1.01] z-10',
        !category.isVisible && 'bg-stone-50/50 dark:bg-stone-900/50 grayscale-[0.5] opacity-80',
      )}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-2 -ml-2 text-stone-400 hover:text-stone-900 dark:hover:text-stone-50 transition-colors focus:outline-none focus:ring-2 focus:ring-stone-400 rounded"
        aria-label={`Reorder ${category.name}`}
      >
        <GripVertical className="w-5 h-5" />
      </div>

      {/* Cover Image */}
      <div className="hidden sm:block flex-shrink-0 w-24 h-24 bg-stone-100 dark:bg-stone-800 rounded-lg overflow-hidden border border-stone-200 dark:border-stone-700 relative">
        {category.coverImage ? (
          // Use regular img tag here to avoid strict next/image domain checks during prototype
          <img
            src={category.coverImage}
            alt={category.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <LayoutTemplate className="w-6 h-6 text-stone-400" />
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center gap-3 mb-1">
          <h3 className="text-base font-semibold text-stone-900 dark:text-stone-50 truncate">
            {category.name}
          </h3>
          {category.isFeatured && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-400">
              Featured
            </span>
          )}
          <span
            className={cn(
              'inline-flex items-center px-2 py-0.5 rounded text-xs font-medium',
              category.status === 'published'
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-400'
                : category.status === 'draft'
                  ? 'bg-stone-100 text-stone-800 dark:bg-stone-500/10 dark:text-stone-400'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-500/10 dark:text-rose-400',
            )}
          >
            {category.status.charAt(0).toUpperCase() + category.status.slice(1)}
          </span>
        </div>

        <p className="text-sm text-stone-500 dark:text-stone-400 truncate mb-2">
          {category.description || 'No description provided.'}
        </p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-stone-500 dark:text-stone-400">
          <span className="flex items-center">
            <span className="font-medium mr-1 text-stone-700 dark:text-stone-300">Layout:</span>{' '}
            {layoutName}
          </span>
          <span className="hidden md:flex items-center">
            <span className="font-medium mr-1 text-stone-700 dark:text-stone-300">Theme:</span>{' '}
            <span className="capitalize">{category.theme}</span>
          </span>
          <span className="flex items-center">
            <span className="font-medium mr-1 text-stone-700 dark:text-stone-300">Products:</span>{' '}
            {category.productCount}
          </span>
          <span className="hidden lg:flex items-center">
            <span className="font-medium mr-1 text-stone-700 dark:text-stone-300">Updated:</span>{' '}
            {updatedDate}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pl-4 border-l border-stone-200 dark:border-stone-800">
        <button
          onClick={() => onToggleVisibility(category.id)}
          className="p-2 text-stone-500 hover:text-stone-900 dark:hover:text-stone-50 transition-colors focus:outline-none focus:ring-2 focus:ring-stone-400 rounded-md bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700"
          aria-label={category.isVisible ? 'Hide Category' : 'Show Category'}
          title={category.isVisible ? 'Hide Category' : 'Show Category'}
        >
          {category.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>

        <Link
          href={`/categories/${category.id}/preview`}
          className="p-2 text-stone-500 hover:text-stone-900 dark:hover:text-stone-50 transition-colors focus:outline-none focus:ring-2 focus:ring-stone-400 rounded-md bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700"
          aria-label={`Preview ${category.name}`}
          title="Preview Category"
        >
          <Eye className="w-4 h-4" />
        </Link>

        <Link
          href={`/categories/${category.id}/edit`}
          className="p-2 text-stone-500 hover:text-stone-900 dark:hover:text-stone-50 transition-colors focus:outline-none focus:ring-2 focus:ring-stone-400 rounded-md bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700"
          aria-label={`Edit ${category.name}`}
          title="Edit Category"
        >
          <Edit2 className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
