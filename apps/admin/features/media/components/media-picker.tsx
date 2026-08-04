'use client';

import { useEffect, useState } from 'react';
import { X, Upload, Plus } from 'lucide-react';
import { AdminMedia } from '../repositories/media-repo';
import { MediaGrid } from './media-grid';
import { getMediaLibraryAction } from '../actions/media-actions';
import { Button } from '@qbm/ui';

interface MediaPickerProps {
  value?: string | string[]; // media ID or array of IDs
  multiple?: boolean;
  onChange: (value: any, mediaItems?: AdminMedia | AdminMedia[]) => void;
  trigger?: React.ReactNode;
}

export function MediaPicker({ value, multiple = false, onChange, trigger }: MediaPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mediaItems, setMediaItems] = useState<AdminMedia[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [prevValue, setPrevValue] = useState(value);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(Array.isArray(value) ? value : value ? [value] : []),
  );

  if (value !== prevValue) {
    setPrevValue(value);
    setSelectedIds(new Set(Array.isArray(value) ? value : value ? [value] : []));
  }

  // Ensure we load the selected media items even if the modal isn't open
  // so we can display their previews.
  useEffect(() => {
    const loadMedia = async () => {
      setIsLoading(true);
      try {
        const items = await getMediaLibraryAction();
        setMediaItems(items);
      } catch (e) {
        console.error('Failed to load media', e);
      } finally {
        setIsLoading(false);
      }
    };
    loadMedia();
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSelect = (media: AdminMedia) => {
    if (multiple) {
      const newSet = new Set(selectedIds);
      if (newSet.has(media.id)) {
        newSet.delete(media.id);
      } else {
        newSet.add(media.id);
      }
      setSelectedIds(newSet);
    } else {
      onChange(media.id, media);
      setIsOpen(false);
    }
  };

  const handleConfirm = () => {
    if (multiple) {
      const ids = Array.from(selectedIds);
      const items = ids.map((id) => selectedMediaMap.get(id)).filter(Boolean) as AdminMedia[];
      onChange(ids, items);
      setIsOpen(false);
    }
  };

  const selectedMediaMap = new Map<string, AdminMedia>();
  mediaItems.forEach((m) => selectedMediaMap.set(m.id, m));

  const renderPreview = () => {
    if (multiple) {
      const ids = Array.isArray(value) ? value : [];
      return (
        <div className="flex flex-wrap gap-4">
          {ids.map((id) => {
            const media = selectedMediaMap.get(id);
            if (!media) return null;
            return (
              <div
                key={id}
                className="relative w-24 h-24 rounded-lg overflow-hidden border border-stone-200 shadow-sm"
              >
                {/* eslint-disable-next-line */}
                <img
                  src={media.thumbnailUrl}
                  alt={media.displayName}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(ids.filter((i) => i !== id));
                  }}
                  className="absolute top-1 right-1 bg-white/80 rounded-full p-1 hover:bg-white transition-colors"
                >
                  <X className="w-3 h-3 text-stone-700" />
                </button>
              </div>
            );
          })}
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="w-24 h-24 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-stone-300 rounded-lg text-stone-500 hover:text-stone-700 hover:border-stone-400 hover:bg-stone-50 transition-colors"
          >
            <Plus className="w-6 h-6" />
            <span className="text-xs font-medium">Add Media</span>
          </button>
        </div>
      );
    } else {
      const media = value && typeof value === 'string' ? selectedMediaMap.get(value) : null;
      if (media) {
        return (
          <div className="relative w-full max-w-sm rounded-xl border border-stone-200 overflow-hidden shadow-sm group">
            {/* eslint-disable-next-line */}
            <img
              src={media.imageUrl || media.thumbnailUrl}
              alt={media.displayName}
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="bg-white text-stone-900 px-4 py-2 rounded-lg font-medium text-sm hover:bg-stone-100 transition-colors"
              >
                Change
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange('');
                }}
                className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-red-600 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        );
      }
      return (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="w-full max-w-sm h-48 flex flex-col items-center justify-center gap-3 border-2 border-dashed border-stone-300 rounded-xl text-stone-500 hover:text-stone-700 hover:border-stone-400 hover:bg-stone-50 transition-colors"
        >
          <Upload className="w-8 h-8" />
          <span className="font-medium">Select Image</span>
        </button>
      );
    }
  };

  return (
    <>
      {trigger ? (
        <div onClick={() => setIsOpen(true)} className="cursor-pointer">
          {trigger}
        </div>
      ) : (
        renderPreview()
      )}

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-6 lg:p-8">
          <div
            className="bg-stone-50 dark:bg-stone-950 w-full max-w-7xl h-[90vh] rounded-2xl shadow-2xl flex flex-col border border-stone-200 dark:border-stone-800"
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 rounded-t-2xl">
              <div>
                <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-50 tracking-tight">
                  Media Library
                </h2>
                <p className="text-sm text-stone-500 mt-1">
                  Select {multiple ? 'images' : 'an image'} for your content.
                </p>
              </div>
              <div className="flex items-center gap-4">
                {multiple && (
                  <Button onClick={handleConfirm} disabled={selectedIds.size === 0}>
                    Confirm Selection ({selectedIds.size})
                  </Button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-stone-400 hover:text-stone-900 dark:hover:text-stone-50 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-stone-500"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 min-h-0 relative">
              {isLoading ? (
                <div className="flex items-center justify-center h-64 text-stone-500">
                  Loading Media Library...
                </div>
              ) : (
                <MediaGrid
                  initialMedia={mediaItems}
                  isPickerMode={true}
                  onSelect={handleSelect}
                  selectedIds={
                    multiple
                      ? selectedIds
                      : new Set(value && typeof value === 'string' ? [value] : [])
                  }
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
