'use client';

import { useState, useCallback } from 'react';
import { UploadCloud, CheckCircle2 } from 'lucide-react';
import { MediaRepository } from '../repositories/media-repo';
import { useRouter } from 'next/navigation';

export function MediaUploadArea() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const simulateUpload = useCallback(
    async (file: File) => {
      setIsUploading(true);
      try {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 1500));
        await MediaRepository.simulateUpload(file);
        router.push('/media');
        router.refresh();
      } catch (e) {
        console.error(e);
        setIsUploading(false);
      }
    },
    [router],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        if (file) {
          simulateUpload(file);
        }
      }
    },
    [simulateUpload],
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file) {
        simulateUpload(file);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-8 shadow-sm">
      <div className="max-w-2xl mx-auto">
        {/* Banner */}
        <div className="mb-8 p-4 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-lg flex items-start gap-4">
          <div className="p-2 bg-white dark:bg-stone-900 rounded-md shadow-sm border border-stone-200 dark:border-stone-800">
            <CheckCircle2 className="w-5 h-5 text-stone-900 dark:text-stone-50" />
          </div>
          <div>
            <h4 className="font-medium text-stone-900 dark:text-stone-50">
              Cloudinary Integration Ready for Sprint 4
            </h4>
            <p className="text-sm text-stone-500 mt-1">
              The architecture is prepared. For Sprint 3.3, uploading a file here will simulate a
              Cloudinary upload using mock repository data and redirect you to the Media Library.
            </p>
          </div>
        </div>

        {/* Upload Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center text-center transition-all duration-200
            ${
              isDragging
                ? 'border-stone-900 dark:border-stone-50 bg-stone-50 dark:bg-stone-800'
                : 'border-stone-300 dark:border-stone-700 hover:border-stone-400 dark:hover:border-stone-600 bg-white dark:bg-stone-900/50'
            }
            ${isUploading ? 'opacity-50 cursor-wait pointer-events-none' : 'cursor-pointer'}
          `}
          onClick={() => !isUploading && document.getElementById('file-upload')?.click()}
        >
          <UploadCloud
            className={`w-12 h-12 mb-4 ${isDragging ? 'text-stone-900 dark:text-stone-50' : 'text-stone-400'}`}
          />

          <h3 className="text-lg font-medium text-stone-900 dark:text-stone-50 mb-2">
            {isUploading ? 'Uploading to Mock Cloudinary...' : 'Click or drag image to upload'}
          </h3>

          <p className="text-sm text-stone-500 max-w-sm">
            SVG, PNG, JPG or GIF (max. 10MB). High resolution recommended for Hero placements.
          </p>

          <input
            id="file-upload"
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileInput}
          />

          {!isUploading && (
            <button className="mt-8 px-6 py-2 bg-stone-900 dark:bg-stone-50 text-stone-50 dark:text-stone-900 rounded-md font-medium text-sm hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors shadow-sm pointer-events-none">
              Browse Files
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
