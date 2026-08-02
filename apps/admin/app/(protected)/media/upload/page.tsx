import { MediaUploadArea } from '../../../../features/media/components/media-upload-area';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function MediaUploadPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link
          href="/media"
          className="p-2 text-stone-500 hover:text-stone-900 dark:hover:text-stone-50 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-md shadow-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Upload Media</h2>
          <p className="text-stone-500">Add new images to your library.</p>
        </div>
      </div>

      <MediaUploadArea />
    </div>
  );
}
