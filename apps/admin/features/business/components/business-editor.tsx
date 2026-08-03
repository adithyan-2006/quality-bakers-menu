'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminBusiness, BusinessStatus } from '../repositories/business-repo';
import { getBusinessAction, updateBusinessAction } from '../actions/business-actions';
import { AdminMedia } from '../../media/repositories/media-repo';
import { CollapsibleSection } from '../../../components/ui/collapsible-section';
import { ImagePickerModal } from '../../../components/modals/image-picker-modal';
import { BusinessHoursEditor } from './business-hours-editor';
import { Image as ImageIcon, X } from 'lucide-react';

const ImagePreview = ({
  url,
  target,
  rounded = false,
  onOpenPicker,
  onClear,
}: {
  url: string;
  target: 'logo' | 'favicon' | 'coverImage';
  rounded?: boolean;
  onOpenPicker: (target: 'logo' | 'favicon' | 'coverImage') => void;
  onClear: () => void;
}) => {
  if (url) {
    return (
      <div
        className={`relative group overflow-hidden border border-stone-200 dark:border-stone-800 w-full h-48 bg-stone-100 dark:bg-stone-900 ${rounded ? 'rounded-full aspect-square w-48 mx-auto' : 'rounded-lg'}`}
      >
        {/* eslint-disable-next-line */}
        <img src={url} alt="Preview" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => onOpenPicker(target)}
            className="px-3 py-1.5 bg-white text-stone-900 text-sm font-medium rounded shadow-sm"
          >
            Change
          </button>
          <button
            type="button"
            onClick={onClear}
            className="p-1.5 bg-rose-600 text-white rounded shadow-sm"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }
  return (
    <button
      type="button"
      onClick={() => onOpenPicker(target)}
      className={`w-full h-48 border-2 border-dashed border-stone-300 dark:border-stone-700 flex flex-col items-center justify-center text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-900 transition-colors ${rounded ? 'rounded-full aspect-square w-48 mx-auto' : 'rounded-lg'}`}
    >
      <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
      <span className="text-sm font-medium">Choose {target}</span>
    </button>
  );
};

export function BusinessEditor() {
  const router = useRouter();
  const [data, setData] = useState<AdminBusiness | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Image Picker State
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'logo' | 'favicon' | 'coverImage' | null>(null);

  useEffect(() => {
    getBusinessAction().then((res) => {
      setData(res);
      setIsLoading(false);
    });
  }, []);

  const handleSave = async (status: 'draft' | 'published' = 'published') => {
    if (!data) return;

    // Simple basic validation
    if (data.email && !/^\S+@\S+\.\S+$/.test(data.email)) {
      alert('Please enter a valid email address');
      return;
    }
    if (data.website && !/^https?:\/\//.test(data.website)) {
      alert('Website URL must start with http:// or https://');
      return;
    }

    setIsSaving(true);
    try {
      await updateBusinessAction({ ...data, status });
      router.refresh();
      alert(`Business settings saved as ${status}`);
    } catch (error) {
      console.error(error);
      alert('Failed to save business settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageSelect = (media: AdminMedia) => {
    if (!data || !pickerTarget) return;
    setData({ ...data, [pickerTarget]: media.imageUrl });
  };

  const openPicker = (target: 'logo' | 'favicon' | 'coverImage') => {
    setPickerTarget(target);
    setPickerOpen(true);
  };

  if (isLoading || !data) {
    return <div className="p-8 text-center text-stone-500">Loading Business Settings...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24">
      {/* Header Actions */}
      <div className="flex items-center justify-between sticky top-0 bg-stone-50/80 dark:bg-stone-950/80 backdrop-blur-md z-20 py-4 border-b border-stone-200 dark:border-stone-800 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Business Settings</h2>
          <p className="text-sm text-stone-500">Manage all global bakery information.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/business/preview')}
            className="px-4 py-2 text-sm font-medium text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-md transition-colors"
          >
            Preview
          </button>
          <button
            onClick={() => handleSave('draft')}
            disabled={isSaving}
            className="px-4 py-2 text-sm font-medium text-stone-700 dark:text-stone-300 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 rounded-md transition-colors"
          >
            Save Draft
          </button>
          <button
            onClick={() => handleSave('published')}
            disabled={isSaving}
            className="px-4 py-2 bg-stone-900 dark:bg-stone-50 text-stone-50 dark:text-stone-900 rounded-md font-medium text-sm hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors"
          >
            {isSaving ? 'Publishing...' : 'Publish Live'}
          </button>
        </div>
      </div>

      {/* 1. General Information */}
      <CollapsibleSection title="General Information" defaultOpen={true}>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Bakery Name</label>
            <input
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              className="w-full rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Tagline</label>
            <input
              value={data.tagline}
              onChange={(e) => setData({ ...data, tagline: e.target.value })}
              className="w-full rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={data.description}
              onChange={(e) => setData({ ...data, description: e.target.value })}
              rows={4}
              className="w-full rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 px-3 py-2 text-sm resize-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Business Status</label>
            <select
              value={data.businessStatus}
              onChange={(e) =>
                setData({ ...data, businessStatus: e.target.value as BusinessStatus })
              }
              className="w-full rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 px-3 py-2 text-sm"
            >
              <option value="Open">Open</option>
              <option value="Closed">Closed</option>
              <option value="Holiday">Holiday</option>
              <option value="Temporarily Closed">Temporarily Closed</option>
            </select>
          </div>
        </div>
      </CollapsibleSection>

      {/* 2. Brand Assets */}
      <CollapsibleSection title="Brand Assets">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2 text-center">
            <label className="text-sm font-medium">Logo</label>
            <ImagePreview
              url={data.logo}
              target="logo"
              rounded
              onOpenPicker={openPicker}
              onClear={() => handleImageSelect({ imageUrl: '' } as AdminMedia)}
            />
          </div>
          <div className="space-y-2 text-center">
            <label className="text-sm font-medium">Favicon</label>
            <ImagePreview
              url={data.favicon}
              target="favicon"
              rounded
              onOpenPicker={openPicker}
              onClear={() => handleImageSelect({ imageUrl: '' } as AdminMedia)}
            />
          </div>
          <div className="md:col-span-2 space-y-2 pt-4 border-t border-stone-100 dark:border-stone-800">
            <label className="text-sm font-medium">Cover Image</label>
            <p className="text-xs text-stone-500 mb-2">
              Used for generic social media previews when no other image is available.
            </p>
            <ImagePreview
              url={data.coverImage}
              target="coverImage"
              onOpenPicker={openPicker}
              onClear={() => handleImageSelect({ imageUrl: '' } as AdminMedia)}
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* 3. Contact Information */}
      <CollapsibleSection title="Contact Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Phone Number</label>
            <input
              type="tel"
              value={data.phone}
              onChange={(e) => setData({ ...data, phone: e.target.value })}
              className="w-full rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">WhatsApp Number</label>
            <input
              type="tel"
              value={data.whatsapp}
              onChange={(e) => setData({ ...data, whatsapp: e.target.value })}
              className="w-full rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address</label>
            <input
              type="email"
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
              className="w-full rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Website URL</label>
            <input
              type="url"
              placeholder="https://"
              value={data.website}
              onChange={(e) => setData({ ...data, website: e.target.value })}
              className="w-full rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* 4. Business Address */}
      <CollapsibleSection title="Business Address">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Street Address</label>
            <input
              value={data.street}
              onChange={(e) => setData({ ...data, street: e.target.value })}
              className="w-full rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">City</label>
              <input
                value={data.city}
                onChange={(e) => setData({ ...data, city: e.target.value })}
                className="w-full rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">State / Province</label>
              <input
                value={data.state}
                onChange={(e) => setData({ ...data, state: e.target.value })}
                className="w-full rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Postal Code</label>
              <input
                value={data.postalCode}
                onChange={(e) => setData({ ...data, postalCode: e.target.value })}
                className="w-full rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Country</label>
              <input
                value={data.country}
                onChange={(e) => setData({ ...data, country: e.target.value })}
                className="w-full rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="pt-4 border-t border-stone-100 dark:border-stone-800 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Google Maps URL</label>
              <input
                type="url"
                value={data.googleMapsUrl}
                onChange={(e) => setData({ ...data, googleMapsUrl: e.target.value })}
                placeholder="https://maps.google.com/..."
                className="w-full rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 px-3 py-2 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={data.latitude || ''}
                  onChange={(e) =>
                    setData({
                      ...data,
                      latitude: e.target.value ? parseFloat(e.target.value) : null,
                    })
                  }
                  className="w-full rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 px-3 py-2 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={data.longitude || ''}
                  onChange={(e) =>
                    setData({
                      ...data,
                      longitude: e.target.value ? parseFloat(e.target.value) : null,
                    })
                  }
                  className="w-full rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* 5. Business Hours */}
      <CollapsibleSection title="Business Hours">
        <BusinessHoursEditor value={data.hours} onChange={(hours) => setData({ ...data, hours })} />
      </CollapsibleSection>

      {/* 6. Social Media */}
      <CollapsibleSection title="Social Media">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(['instagram', 'facebook', 'youtube', 'x', 'threads', 'linkedin'] as const).map(
            (platform) => (
              <div key={platform} className="space-y-2">
                <label className="text-sm font-medium capitalize">
                  {platform === 'x' ? 'X (Twitter)' : platform}
                </label>
                <input
                  type="url"
                  placeholder={`https://${platform === 'x' ? 'twitter' : platform}.com/...`}
                  value={data[platform]}
                  onChange={(e) => setData({ ...data, [platform]: e.target.value })}
                  className="w-full rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 px-3 py-2 text-sm"
                />
              </div>
            ),
          )}
        </div>
      </CollapsibleSection>

      {/* 7. SEO */}
      <CollapsibleSection title="Search Engine Optimization (SEO)">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium">SEO Title</label>
              <span
                className={`text-xs ${data.seoTitle.length > 60 ? 'text-amber-500' : 'text-stone-500'}`}
              >
                {data.seoTitle.length} / 60
              </span>
            </div>
            <input
              value={data.seoTitle}
              onChange={(e) => setData({ ...data, seoTitle: e.target.value })}
              className="w-full rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 px-3 py-2 text-sm"
            />
            <p className="text-xs text-stone-500">
              The title that appears in search engine results.
            </p>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-sm font-medium">SEO Description</label>
              <span
                className={`text-xs ${data.seoDescription.length > 160 ? 'text-amber-500' : 'text-stone-500'}`}
              >
                {data.seoDescription.length} / 160
              </span>
            </div>
            <textarea
              value={data.seoDescription}
              onChange={(e) => setData({ ...data, seoDescription: e.target.value })}
              rows={3}
              className="w-full rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 px-3 py-2 text-sm resize-none"
            />
            <p className="text-xs text-stone-500">
              The description snippet that appears below the title.
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Keywords</label>
            <input
              value={data.keywords}
              onChange={(e) => setData({ ...data, keywords: e.target.value })}
              placeholder="bakery, artisan, bread, comma separated"
              className="w-full rounded-md border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950 px-3 py-2 text-sm"
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* Image Picker Modal */}
      <ImagePickerModal
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleImageSelect}
      />
    </div>
  );
}
