'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AdminCategory } from '../repositories/category-repo';
import { GripVertical, Edit2, Eye, EyeOff, LayoutTemplate, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@qbm/ui';

interface CategoryListItemProps {
  category: AdminCategory;
  onToggleVisibility: (id: string) => void;
  onDelete?: () => void;
}

const LAYOUT_NAMES: Record<string, string> = {
  'editorial-grid': 'Classic Grid',
  spotlight: 'Featured Layout',
  'gallery-wall': 'Gallery Layout',
  'magazine-split': 'Magazine Layout',
  alternating: 'Alternating Layout',
};

export function CategoryListItem({
  category,
  onToggleVisibility,
  onDelete,
}: CategoryListItemProps) {
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
        'relative flex items-center gap-4 bg-white/85 backdrop-blur-md border border-black/[0.08] rounded-2xl p-4 shadow-glass group transition-all',
        isDragging && 'opacity-50 shadow-md ring-2 ring-black/10 scale-[1.01] z-10',
        !category.isVisible && 'grayscale-[0.5] opacity-75',
      )}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-2 -ml-2 text-stone-400 hover:text-black transition-colors focus:outline-none focus:ring-2 focus:ring-black rounded-lg"
        aria-label={`Reorder ${category.name}`}
      >
        <GripVertical className="w-5 h-5" />
      </div>

      {/* Cover Image */}
      <div className="hidden sm:block flex-shrink-0 w-24 h-24 bg-black/[0.04] rounded-xl overflow-hidden border border-black/[0.08] relative">
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
          <h3 className="text-base font-bold text-black truncate">{category.name}</h3>
          {category.isFeatured && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-black text-white">
              Featured
            </span>
          )}
          <span
            className={cn(
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold',
              category.status === 'published'
                ? 'bg-black text-white'
                : category.status === 'draft'
                  ? 'bg-black/[0.05] text-stone-800 border border-black/[0.08]'
                  : 'bg-rose-100 text-rose-800',
            )}
          >
            {category.status.charAt(0).toUpperCase() + category.status.slice(1)}
          </span>
        </div>

        <p className="text-xs text-stone-600 font-medium truncate mb-2">
          {category.description || 'No description provided.'}
        </p>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-stone-500">
          <span className="flex items-center">
            <span className="font-semibold mr-1 text-stone-800">Layout:</span> {layoutName}
          </span>
          <span className="hidden md:flex items-center">
            <span className="font-semibold mr-1 text-stone-800">Theme:</span>{' '}
            <span className="capitalize">{category.theme}</span>
          </span>
          <span className="flex items-center">
            <span className="font-semibold mr-1 text-stone-800">Products:</span>{' '}
            {category.productCount}
          </span>
          <span className="hidden lg:flex items-center">
            <span className="font-semibold mr-1 text-stone-800">Updated:</span> {updatedDate}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pl-4 border-l border-black/[0.06]">
        <button
          onClick={() => onToggleVisibility(category.id)}
          className="p-2 text-stone-600 hover:text-black hover:bg-black/5 rounded-xl border border-black/[0.06] transition-all"
          aria-label={category.isVisible ? 'Hide Category' : 'Show Category'}
          title={category.isVisible ? 'Hide Category' : 'Show Category'}
        >
          {category.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>

        <Link
          href={`/categories/${category.id}/preview`}
          className="p-2 text-stone-600 hover:text-black hover:bg-black/5 rounded-xl border border-black/[0.06] transition-all"
          aria-label={`Preview ${category.name}`}
          title="Preview Category"
        >
          <Eye className="w-4 h-4" />
        </Link>

        <Link
          href={`/categories/${category.id}/edit`}
          className="p-2 text-stone-600 hover:text-black hover:bg-black/5 rounded-xl border border-black/[0.06] transition-all"
          aria-label={`Edit ${category.name}`}
          title="Edit Category"
        >
          <Edit2 className="w-4 h-4" />
        </Link>

        {onDelete && (
          <button
            onClick={onDelete}
            className="p-2 text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition-all"
            aria-label={`Delete ${category.name}`}
            title="Delete Category"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
