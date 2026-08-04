import { getMediaByIdAction } from '../../../../features/media/actions/media-actions';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Image as ImageIcon,
  Link as LinkIcon,
  Cloud,
  Tag,
  ShieldCheck,
  Box,
} from 'lucide-react';
import { cn } from '@qbm/ui';
import { DeleteMediaButton } from '../../../../features/media/components/delete-media-button';

interface MediaPreviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function MediaPreviewPage({ params }: MediaPreviewPageProps) {
  const { id } = await params;
  const media = await getMediaByIdAction(id);

  if (!media) {
    notFound();
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/media"
            className="p-2 text-stone-500 hover:text-stone-900 dark:hover:text-stone-50 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-md shadow-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">{media.displayName}</h2>
            <p className="text-stone-500">{media.fileName}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Image Preview */}
        <div className="lg:col-span-2 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden shadow-inner p-4 md:p-8 flex items-center justify-center min-h-[400px]">
          <img
            src={media.imageUrl}
            alt={media.altText || media.displayName}
            className="max-w-full max-h-[600px] object-contain rounded-lg shadow-md"
          />
        </div>

        {/* Metadata Panel */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-sm p-6 space-y-6">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-500 mb-4 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> File Details
              </h3>
              <dl className="grid grid-cols-2 gap-y-4 text-sm">
                <div>
                  <dt className="text-stone-500">Dimensions</dt>
                  <dd className="font-medium text-stone-900 dark:text-stone-50">
                    {media.width} × {media.height} px
                  </dd>
                </div>
                <div>
                  <dt className="text-stone-500">File Size</dt>
                  <dd className="font-medium text-stone-900 dark:text-stone-50">
                    {formatBytes(media.size)}
                  </dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-stone-500">Alt Text</dt>
                  <dd className="font-medium text-stone-900 dark:text-stone-50 italic">
                    {media.altText || 'Not specified'}
                  </dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-stone-500 mb-2">Tags</dt>
                  <dd className="flex flex-wrap gap-2">
                    {media.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 px-2 py-1 rounded text-xs font-medium"
                      >
                        <Tag className="w-3 h-3" /> {tag}
                      </span>
                    ))}
                    {media.tags.length === 0 && <span className="text-stone-400">No tags</span>}
                  </dd>
                </div>
              </dl>
            </div>

            <hr className="border-stone-100 dark:border-stone-800" />

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-500 mb-4 flex items-center gap-2">
                <LinkIcon className="w-4 h-4" /> Usage
              </h3>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'w-2 h-2 rounded-full',
                      media.isUsed ? 'bg-emerald-500' : 'bg-stone-300 dark:bg-stone-700',
                    )}
                  />
                  <span className="font-medium text-sm text-stone-900 dark:text-stone-50">
                    {media.isUsed ? `Used by ${media.usedBy.length} items` : 'Currently Unused'}
                  </span>
                </div>

                {media.isUsed && (
                  <ul className="space-y-2 mt-3">
                    {media.usedBy.map((usage, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 text-sm bg-stone-50 dark:bg-stone-950 p-2 rounded-md border border-stone-100 dark:border-stone-800"
                      >
                        <Box className="w-4 h-4 text-stone-400 mt-0.5" />
                        <div>
                          <p className="font-medium text-stone-900 dark:text-stone-50">
                            {usage.name}
                          </p>
                          <p className="text-xs text-stone-500 capitalize">{usage.type}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <hr className="border-stone-100 dark:border-stone-800" />

            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-stone-500 mb-4 flex items-center gap-2">
                <Cloud className="w-4 h-4" /> Provider Status
              </h3>
              <div className="flex items-center gap-3 bg-stone-50 dark:bg-stone-950 p-3 rounded-lg border border-stone-200 dark:border-stone-800">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <div className="text-sm">
                  <p className="font-medium text-stone-900 dark:text-stone-50">Cloudinary Ready</p>
                  <p className="text-stone-500 text-xs">Waiting for Sprint 4 Integration</p>
                </div>
              </div>
            </div>

            <hr className="border-stone-100 dark:border-stone-800" />

            {/* Danger Zone */}
            <div className="flex justify-end">
              <DeleteMediaButton mediaId={media.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
