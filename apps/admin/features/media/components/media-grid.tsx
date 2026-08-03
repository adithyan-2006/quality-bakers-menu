'use client';

import { useState, useMemo } from 'react';
import { AdminMedia } from '../repositories/media-repo';
import { deleteMediaAction } from '../actions/media-actions';
import { Search, Link as LinkIcon, Trash2, Eye, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@qbm/ui';

interface MediaGridProps {
  initialMedia: AdminMedia[];
  onSelect?: (media: AdminMedia) => void;
  isPickerMode?: boolean;
}

export function MediaGrid({ initialMedia, onSelect, isPickerMode = false }: MediaGridProps) {
  const [mediaItems, setMediaItems] = useState(initialMedia);
  const [searchQuery, setSearchQuery] = useState('');

  // Filters
  const [filterUsage, setFilterUsage] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  const filteredAndSortedMedia = useMemo(() => {
    let result = [...mediaItems];

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (m) =>
          m.fileName.toLowerCase().includes(q) ||
          m.displayName.toLowerCase().includes(q) ||
          m.altText.toLowerCase().includes(q) ||
          m.tags.some((tag) => tag.toLowerCase().includes(q)),
      );
    }

    // Filter Usage
    if (filterUsage === 'used') {
      result = result.filter((m) => m.isUsed);
    } else if (filterUsage === 'unused') {
      result = result.filter((m) => !m.isUsed);
    }

    // Filter Type (Product/Category)
    if (filterType === 'product') {
      result = result.filter((m) => m.usedBy.some((u) => u.type === 'product'));
    } else if (filterType === 'category') {
      result = result.filter((m) => m.usedBy.some((u) => u.type === 'category'));
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      } else {
        return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
      }
    });

    return result;
  }, [mediaItems, searchQuery, filterUsage, filterType, sortBy]);

  const handleDelete = async (id: string) => {
    try {
      await deleteMediaAction(id);
      setMediaItems((prev) => prev.filter((m) => m.id !== id));
    } catch (e: any) {
      alert(e.message);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by filename, display name, tags, or alt text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 text-sm focus:outline-none focus:ring-2 focus:ring-stone-500"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            className="px-3 py-2 text-sm rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 text-stone-700 dark:text-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-500"
            value={filterUsage}
            onChange={(e) => setFilterUsage(e.target.value)}
          >
            <option value="all">All Usage</option>
            <option value="used">Images In Use</option>
            <option value="unused">Unused Images</option>
          </select>
          <select
            className="px-3 py-2 text-sm rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 text-stone-700 dark:text-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-500"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="product">Product Images</option>
            <option value="category">Category Images</option>
          </select>
          <select
            className="px-3 py-2 text-sm rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 text-stone-700 dark:text-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-500"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
          >
            <option value="newest">Sort: Newest</option>
            <option value="oldest">Sort: Oldest</option>
          </select>
        </div>
      </div>

      {filteredAndSortedMedia.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-sm">
          <p className="text-stone-500">No media found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {filteredAndSortedMedia.map((media) => (
            <div
              key={media.id}
              className="group flex flex-col bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 overflow-hidden shadow-sm hover:shadow-md hover:border-stone-300 dark:hover:border-stone-700 transition-all"
            >
              {/* Thumbnail Container */}
              <div
                className={cn(
                  'relative aspect-square bg-stone-100 dark:bg-stone-950 overflow-hidden',
                  isPickerMode && 'cursor-pointer',
                )}
                onClick={() => {
                  if (isPickerMode && onSelect) onSelect(media);
                }}
              >
                {/* eslint-disable-next-line */}
                <img
                  src={media.thumbnailUrl}
                  alt={media.altText || media.displayName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {media.isUsed && (
                  <div className="absolute top-2 left-2 bg-stone-900/80 backdrop-blur-sm text-stone-50 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md">
                    In Use
                  </div>
                )}

                {!isPickerMode && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <Link
                      href={`/media/${media.id}`}
                      className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-colors"
                      title="Preview"
                    >
                      <Eye className="w-5 h-5" />
                    </Link>
                  </div>
                )}

                {isPickerMode && (
                  <div className="absolute inset-0 bg-stone-900/0 hover:bg-stone-900/10 transition-colors flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 bg-white text-stone-900 px-4 py-2 rounded-lg font-medium text-sm shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all duration-200">
                      Select Image
                    </div>
                  </div>
                )}
              </div>

              {/* Metadata */}
              <div className="p-3 md:p-4 flex flex-col gap-1 border-t border-stone-100 dark:border-stone-800">
                <h4
                  className="font-medium text-sm text-stone-900 dark:text-stone-50 truncate"
                  title={media.displayName}
                >
                  {media.displayName}
                </h4>
                <div className="flex items-center justify-between text-xs text-stone-500">
                  <span>{formatBytes(media.size)}</span>
                  <span>
                    {media.width}x{media.height}
                  </span>
                </div>
              </div>

              {/* Actions (Only in Dam Mode) */}
              {!isPickerMode && (
                <div className="px-3 md:px-4 py-3 bg-stone-50 dark:bg-stone-950 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-2">
                    <button
                      className="text-stone-400 hover:text-stone-900 dark:hover:text-stone-50 transition-colors"
                      title="Copy URL (Future)"
                    >
                      <LinkIcon className="w-4 h-4" />
                    </button>
                  </div>

                  {media.isUsed ? (
                    <Link
                      href={`/media/${media.id}`}
                      className="text-stone-400 hover:text-amber-600 transition-colors"
                      title={`Used in ${media.usedBy.length} items. View usage to delete.`}
                    >
                      <ShieldAlert className="w-4 h-4" />
                    </Link>
                  ) : (
                    <button
                      onClick={() => handleDelete(media.id)}
                      className="text-stone-400 hover:text-rose-600 transition-colors"
                      title="Delete Image"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
