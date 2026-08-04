'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AdminProduct,
  BadgeType,
  AvailabilityStatus,
  ProductStatus,
} from '../repositories/product-repo';
import { createProductAction, updateProductAction } from '../actions/product-actions';
import { AdminCategory } from '../../categories/repositories/category-repo';
import { MediaPicker } from '../../media/components/media-picker';

interface ProductFormProps {
  initialData?: AdminProduct;
  categories: AdminCategory[];
}

export function ProductForm({ initialData, categories }: ProductFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState(initialData?.name || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [shortDescription, setShortDescription] = useState(initialData?.shortDescription || '');
  const [price, setPrice] = useState<number>(initialData?.price || 0);
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || categories[0]?.id || '');
  const [imageId, setImageId] = useState(initialData?.imageId || '');
  const [galleryIds, setGalleryIds] = useState<string[]>(initialData?.galleryIds || []);
  const [badge, setBadge] = useState<BadgeType>(initialData?.badge || 'none');
  const [isFeatured, setIsFeatured] = useState(initialData?.isFeatured || false);
  const [isVisible, setIsVisible] = useState(initialData?.isVisible ?? true);
  const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityStatus>(
    initialData?.availabilityStatus || 'available',
  );
  const [status, setStatus] = useState<ProductStatus>(initialData?.status || 'draft');

  // Derived price display state (optional simple formatting for UX)
  const priceDisplay = price ? price.toString() : '';

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    if (!isEditing) {
      setSlug(
        newName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, ''),
      );
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      setPrice(val);
    } else if (e.target.value === '') {
      setPrice(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data = {
      name,
      slug,
      shortDescription,
      price,
      categoryId,
      imageId,
      galleryIds,
      badge,
      isFeatured,
      isVisible,
      availabilityStatus,
      status,
    };

    try {
      if (isEditing && initialData) {
        await updateProductAction(initialData.id, data);
      } else {
        await createProductAction(data);
      }
      router.push('/products');
      router.refresh();
    } catch (error) {
      console.error('Failed to save product', error);
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6 md:p-8 shadow-sm">
        <h3 className="text-lg font-medium text-stone-900 dark:text-stone-50 mb-6 border-b border-stone-200 dark:border-stone-800 pb-4">
          Basic Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-stone-700 dark:text-stone-300"
            >
              Product Name *
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={handleNameChange}
              className="w-full rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 px-3 py-2 text-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-500"
              placeholder="e.g. Vanilla Scoop"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="price"
              className="block text-sm font-medium text-stone-700 dark:text-stone-300"
            >
              Price (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500">₹</span>
              <input
                id="price"
                type="number"
                step="0.01"
                min="0"
                required
                value={priceDisplay}
                onChange={handlePriceChange}
                className="w-full pl-8 rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 px-3 py-2 text-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-500"
                placeholder="180.00"
              />
            </div>
          </div>

          <div className="md:col-span-2 space-y-2">
            <label
              htmlFor="shortDescription"
              className="block text-sm font-medium text-stone-700 dark:text-stone-300"
            >
              Short Description *
            </label>
            <textarea
              id="shortDescription"
              required
              rows={2}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="w-full rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 px-3 py-2 text-sm placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-500 resize-none"
              placeholder="A brief description for the product card..."
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label
              htmlFor="categoryId"
              className="block text-sm font-medium text-stone-700 dark:text-stone-300"
            >
              Category *
            </label>
            <select
              id="categoryId"
              required
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-500"
            >
              <option value="" disabled>
                Select a Category...
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6 border-b border-stone-200 dark:border-stone-800 pb-4">
          <h3 className="text-lg font-medium text-stone-900 dark:text-stone-50 flex items-center gap-2">
            Hero Image
          </h3>
        </div>

        <MediaPicker
          value={imageId}
          onChange={(val) => setImageId(val as string)}
          multiple={false}
        />
      </div>

      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6 border-b border-stone-200 dark:border-stone-800 pb-4">
          <h3 className="text-lg font-medium text-stone-900 dark:text-stone-50 flex items-center gap-2">
            Gallery Images
          </h3>
        </div>

        <MediaPicker
          value={galleryIds}
          onChange={(val) => setGalleryIds(val as string[])}
          multiple={true}
        />
      </div>

      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-6 md:p-8 shadow-sm">
        <h3 className="text-lg font-medium text-stone-900 dark:text-stone-50 mb-6 border-b border-stone-200 dark:border-stone-800 pb-4">
          Presentation & Availability
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label
              htmlFor="badge"
              className="block text-sm font-medium text-stone-700 dark:text-stone-300"
            >
              Badge
            </label>
            <select
              id="badge"
              value={badge}
              onChange={(e) => setBadge(e.target.value as BadgeType)}
              className="w-full rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-500"
            >
              <option value="none">No Badge</option>
              <option value="signature">Signature</option>
              <option value="best-seller">Best Seller</option>
              <option value="new">New</option>
              <option value="seasonal">Seasonal</option>
              <option value="chefs-choice">Chef's Choice</option>
            </select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="availabilityStatus"
              className="block text-sm font-medium text-stone-700 dark:text-stone-300"
            >
              Availability
            </label>
            <select
              id="availabilityStatus"
              value={availabilityStatus}
              onChange={(e) => setAvailabilityStatus(e.target.value as AvailabilityStatus)}
              className="w-full rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-500"
            >
              <option value="available">Available</option>
              <option value="out-of-stock">Out of Stock</option>
              <option value="seasonal">Seasonal (Unavailable)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="status"
              className="block text-sm font-medium text-stone-700 dark:text-stone-300"
            >
              Publishing Status
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ProductStatus)}
              className="w-full rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-stone-500"
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>
        </div>

        <div className="mt-6 space-y-4 pt-6 border-t border-stone-100 dark:border-stone-800">
          <label className="flex items-start gap-3 p-4 border border-stone-200 dark:border-stone-800 rounded-lg cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                checked={isVisible}
                onChange={(e) => setIsVisible(e.target.checked)}
                className="w-4 h-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-stone-900 dark:text-stone-50">
                Visible on Website
              </span>
              <span className="text-sm text-stone-500">
                Uncheck to hide this product globally regardless of availability.
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 p-4 border border-stone-200 dark:border-stone-800 rounded-lg cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
            <div className="flex items-center h-5">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-stone-900 dark:text-stone-50">
                Featured Product
              </span>
              <span className="text-sm text-stone-500">
                Highlight this product in the featured category grid.
              </span>
            </div>
          </label>
        </div>
      </div>

      <div className="flex items-center justify-end gap-4 pt-4">
        <button
          type="button"
          onClick={() => router.push('/products')}
          className="px-4 py-2 text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-md transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-stone-900 dark:bg-stone-50 text-stone-50 dark:text-stone-900 rounded-md font-medium text-sm hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Product'}
        </button>
      </div>
    </form>
  );
}
