'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { AdminMedia, MediaRepository } from '../../features/media/repositories/media-repo';
import { MediaGrid } from '../../features/media/components/media-grid';

interface ImagePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: AdminMedia) => void;
}

export function ImagePickerModal({ isOpen, onClose, onSelect }: ImagePickerModalProps) {
  const [mediaItems, setMediaItems] = useState<AdminMedia[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line
      setIsLoading(true);
      MediaRepository.getMedia()
        .then(setMediaItems)
        .catch(console.error)
        .finally(() => setIsLoading(false));

      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 md:p-6 lg:p-8">
      {/* Modal Container */}
      <div
        className="bg-stone-50 dark:bg-stone-950 w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col border border-stone-200 dark:border-stone-800"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 rounded-t-2xl">
          <div>
            <h2
              id="modal-title"
              className="text-xl font-semibold text-stone-900 dark:text-stone-50 tracking-tight"
            >
              Select Image
            </h2>
            <p className="text-sm text-stone-500 mt-1">
              Browse your media library to find the perfect image.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-900 dark:hover:text-stone-50 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-stone-500"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-64 text-stone-500">
              Loading Media Library...
            </div>
          ) : (
            <MediaGrid
              initialMedia={mediaItems}
              isPickerMode={true}
              onSelect={(media) => {
                onSelect(media);
                onClose();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
