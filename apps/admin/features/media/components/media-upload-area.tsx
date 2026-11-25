'use client';

import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { UploadCloud, CheckCircle2 } from 'lucide-react';
import { uploadMediaAction } from '../actions/media-actions';
import { useRouter } from 'next/navigation';

export function MediaUploadArea() {
  const router = useRouter();
  const queryClient = useQueryClient();
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

  const uploadMedia = useCallback(
    async (file: File) => {
      setIsUploading(true);
      try {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const formData = new FormData();
        formData.append('file', file);
        await uploadMediaAction(formData);
        await queryClient.invalidateQueries({ queryKey: ['admin-media-library'] });
        router.push('/media');
        router.refresh();
      } catch (e) {
        console.error(e);
        setIsUploading(false);
      }
    },
    [router, queryClient],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        if (file) {
          uploadMedia(file);
        }
      }
    },
    [uploadMedia],
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file) {
        uploadMedia(file);
      }
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-md border border-black/[0.08] rounded-2xl p-8 shadow-glass">
      <div className="max-w-2xl mx-auto">
        {/* Banner */}
        <div className="mb-8 p-4 bg-black/[0.02] border border-black/[0.06] rounded-xl flex items-start gap-4">
          <div className="p-2 bg-white rounded-lg shadow-sm border border-black/[0.08]">
            <CheckCircle2 className="w-5 h-5 text-black" />
          </div>
          <div>
            <h4 className="font-semibold text-black">Cloudinary Integration Ready for Sprint 4</h4>
            <p className="text-sm text-stone-600 mt-1">
              The architecture is prepared. Uploading a file here will perform a Cloudinary upload
              and redirect you to the Media Library.
            </p>
          </div>
        </div>

        {/* Upload Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center text-center transition-all duration-200
            ${
              isDragging
                ? 'border-black bg-black/[0.03] shadow-glass'
                : 'border-black/[0.12] hover:border-black/30 bg-white/60 hover:bg-white/90'
            }
            ${isUploading ? 'opacity-50 cursor-wait pointer-events-none' : 'cursor-pointer'}
          `}
          onClick={() => !isUploading && document.getElementById('file-upload')?.click()}
        >
          <UploadCloud
            className={`w-12 h-12 mb-4 ${isDragging ? 'text-black' : 'text-stone-500'}`}
          />

          <h3 className="text-lg font-bold text-black mb-2">
            {isUploading ? 'Uploading to Cloudinary...' : 'Click or drag image to upload'}
          </h3>

          <p className="text-sm text-stone-600 max-w-sm">
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
            <button className="mt-8 px-6 py-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl font-semibold text-sm transition-all shadow-sm pointer-events-none">
              Browse Files
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
