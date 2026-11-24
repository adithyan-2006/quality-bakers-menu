'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminCategory } from '../repositories/category-repo';
import { createCategoryAction, updateCategoryAction } from '../actions/category-actions';
import { MediaPicker } from '../../media/components/media-picker';

interface CategoryFormProps {
  initialData?: AdminCategory;
}

export function CategoryForm({ initialData }: CategoryFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [coverImageId, setCoverImageId] = useState(initialData?.coverImageId || '');
  const [theme, setTheme] = useState(initialData?.theme || 'classic');
  const [layoutType, setLayoutType] = useState(initialData?.layoutType || 'editorial-grid');
  const [animationPreset, setAnimationPreset] = useState(initialData?.animationPreset || 'fade-up');
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured || false);
  const [isVisible, setIsVisible] = useState(initialData?.isVisible ?? true);
  const [status, setStatus] = useState<'draft' | 'published' | 'hidden'>(
    initialData?.status || 'draft',
  );
  const [accentColor, setAccentColor] = useState(initialData?.accentColor || '');

  // Handlers
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    // Auto-generate slug only if not editing or if user hasn't manually overridden (simplified for prototype)
    if (!isEditing) {
      setSlug(
        newName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, ''),
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data = {
      name,
      slug,
      description,
      coverImageId,
      theme,
      layoutType,
      animationPreset,
      isFeatured,
      isVisible,
      status,
      accentColor,
    };

    try {
      if (isEditing && initialData) {
        await updateCategoryAction(initialData.id, data);
      } else {
        await createCategoryAction(data);
      }
      router.push('/categories');
    } catch (error) {
      console.error('Failed to save category', error);
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      <div className="bg-white/85 backdrop-blur-md border border-black/[0.08] rounded-2xl p-6 md:p-8 shadow-glass">
        <h3 className="text-lg font-bold text-black mb-6 border-b border-black/[0.06] pb-4">
          Basic Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-semibold text-stone-800">
              Category Name *
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={handleNameChange}
              className="w-full rounded-xl border border-black/[0.08] bg-white/80 text-black px-3.5 py-2 text-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-black transition-all"
              placeholder="e.g. Ice Cream Scoops"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="slug" className="block text-sm font-semibold text-stone-800">
              URL Slug *
            </label>
            <input
              id="slug"
              type="text"
              required
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full rounded-xl border border-black/[0.08] bg-white/80 text-black px-3.5 py-2 text-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-black transition-all"
              placeholder="e.g. ice-cream-scoops"
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label htmlFor="description" className="block text-sm font-semibold text-stone-800">
              Editorial Description
            </label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-black/[0.08] bg-white/80 text-black px-3.5 py-2 text-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-black transition-all resize-none"
              placeholder="A short, evocative description of this category for the customer..."
            />
          </div>
        </div>
      </div>

      <div className="bg-white/85 backdrop-blur-md border border-black/[0.08] rounded-2xl p-6 md:p-8 shadow-glass">
        <div className="flex items-center justify-between mb-6 border-b border-black/[0.06] pb-4">
          <h3 className="text-lg font-bold text-black flex items-center gap-2">Cover Image</h3>
        </div>

        <MediaPicker
          value={coverImageId}
          onChange={(val) => setCoverImageId(val as string)}
          multiple={false}
        />
      </div>

      <div className="bg-white/85 backdrop-blur-md border border-black/[0.08] rounded-2xl p-6 md:p-8 shadow-glass">
        <h3 className="text-lg font-bold text-black mb-6 border-b border-black/[0.06] pb-4">
          Presentation Settings
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="layoutType" className="block text-sm font-semibold text-stone-800">
              Menu Layout
            </label>
            <select
              id="layoutType"
              value={layoutType}
              onChange={(e) => setLayoutType(e.target.value)}
              className="w-full rounded-xl border border-black/[0.08] bg-white/80 text-black px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black transition-all font-medium"
            >
              <option value="editorial-grid">Classic Grid</option>
              <option value="spotlight">Featured Layout</option>
              <option value="gallery-wall">Gallery Layout</option>
              <option value="magazine-split">Magazine Layout</option>
              <option value="alternating">Alternating Layout</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="theme" className="block text-sm font-semibold text-stone-800">
              Color Theme
            </label>
            <select
              id="theme"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full rounded-xl border border-black/[0.08] bg-white/80 text-black px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black transition-all font-medium"
            >
              <option value="classic">Classic</option>
              <option value="warm">Warm</option>
              <option value="fresh">Fresh</option>
              <option value="vibrant">Vibrant</option>
              <option value="muted">Muted</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="animationPreset" className="block text-sm font-semibold text-stone-800">
              Entrance Animation
            </label>
            <select
              id="animationPreset"
              value={animationPreset}
              onChange={(e) => setAnimationPreset(e.target.value)}
              className="w-full rounded-xl border border-black/[0.08] bg-white/80 text-black px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black transition-all font-medium"
            >
              <option value="fade-up">Fade Up (Subtle)</option>
              <option value="reveal">Reveal (Elegant)</option>
              <option value="slide-in">Slide In (Dynamic)</option>
              <option value="pop">Pop (Playful)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label htmlFor="accentColor" className="block text-sm font-semibold text-stone-800">
              Custom Accent Color (Optional)
            </label>
            <input
              id="accentColor"
              type="text"
              value={accentColor}
              onChange={(e) => setAccentColor(e.target.value)}
              className="w-full rounded-xl border border-black/[0.08] bg-white/80 text-black px-3.5 py-2 text-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-black transition-all"
              placeholder="#FF5500"
            />
          </div>
        </div>
      </div>

      <div className="bg-white/85 backdrop-blur-md border border-black/[0.08] rounded-2xl p-6 md:p-8 shadow-glass">
        <h3 className="text-lg font-bold text-black mb-6 border-b border-black/[0.06] pb-4">
          Visibility & Placement
        </h3>

        <div className="grid grid-cols-1 gap-6 mb-6">
          <div className="space-y-2 max-w-md">
            <label htmlFor="status" className="block text-sm font-semibold text-stone-800">
              Publishing Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as 'draft' | 'published' | 'hidden')}
              className="w-full rounded-xl border border-black/[0.08] bg-white/80 text-black px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black transition-all font-medium"
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>
        </div>

        <div className="space-y-4 pt-6 border-t border-black/[0.06]">
          <label className="flex items-start gap-3 p-4 border border-black/[0.08] rounded-xl cursor-pointer hover:bg-black/[0.02] transition-colors">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                checked={isVisible}
                onChange={(e) => setIsVisible(e.target.checked)}
                className="w-4 h-4 rounded border-stone-300 text-black focus:ring-black"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-black">Visible on Website</span>
              <span className="text-xs text-stone-500 mt-0.5">
                Uncheck to hide this category from the customer menu immediately.
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 p-4 border border-black/[0.08] rounded-xl cursor-pointer hover:bg-black/[0.02] transition-colors">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded border-stone-300 text-black focus:ring-black"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-black">Feature on Homepage</span>
              <span className="text-xs text-stone-500 mt-0.5">
                Pin this category to the featured collections section of the home page.
              </span>
            </div>
          </label>
        </div>
      </div>

      <div className="flex items-center justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={() => router.push('/categories')}
          className="px-4 py-2 text-sm font-medium text-stone-700 hover:text-black hover:bg-black/5 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-black text-white rounded-lg font-medium text-sm hover:bg-stone-800 transition-all shadow-sm disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Category'}
        </button>
      </div>
    </form>
  );
}
