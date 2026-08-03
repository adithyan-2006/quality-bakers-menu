import { getMediaLibraryAction } from '../../../features/media/actions/media-actions';
import { MediaGrid } from '../../../features/media/components/media-grid';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default async function MediaLibraryPage() {
  const media = await getMediaLibraryAction();

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Media Library</h2>
          <p className="text-stone-500">Manage all your product and category images centrally.</p>
        </div>
        <Link
          href="/media/upload"
          className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 text-stone-50 rounded-md font-medium text-sm hover:bg-stone-800 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Upload Image
        </Link>
      </div>

      <MediaGrid initialMedia={media} />
    </div>
  );
}
