'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { deleteMediaAction } from '../actions/media-actions';
import { Dialog, Toast } from '@qbm/ui';

interface DeleteMediaButtonProps {
  mediaId: string;
}

export function DeleteMediaButton({ mediaId }: DeleteMediaButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{
    title: string;
    description: string;
    variant: 'success' | 'destructive';
  } | null>(null);
  const router = useRouter();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteMediaAction(mediaId);
      setToast({
        title: 'Success',
        description: 'Image deleted successfully.',
        variant: 'success',
      });
      setIsOpen(false);
      router.push('/media');
      router.refresh();
    } catch {
      setToast({
        title: 'Error',
        description: 'Failed to delete image.',
        variant: 'destructive',
      });
      setIsDeleting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        disabled={isDeleting}
        className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
      >
        <Trash2 className="w-4 h-4" />
        {isDeleting ? 'Deleting...' : 'Delete Image'}
      </button>

      <Dialog open={isOpen} onClose={() => !isDeleting && setIsOpen(false)}>
        <Dialog.Content className="sm:max-w-md">
          <Dialog.Header>
            <Dialog.Title>Delete Image?</Dialog.Title>
            <Dialog.Description>This image will be permanently removed from:</Dialog.Description>
            <div className="space-y-4 mt-4 text-sm text-muted-foreground">
              <ul className="list-disc pl-4 space-y-1">
                <li>Cloudinary</li>
                <li>PostgreSQL</li>
                <li>Media Library</li>
              </ul>
              <p className="font-semibold text-rose-500">This action cannot be undone.</p>
            </div>
          </Dialog.Header>

          <Dialog.Footer className="mt-6">
            <button
              onClick={() => setIsOpen(false)}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 dark:text-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-medium text-white bg-rose-500 hover:bg-rose-600 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isDeleting ? 'Deleting...' : 'Delete Permanently'}
            </button>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>

      {toast && (
        <div className="fixed bottom-4 right-4 z-[9999]">
          <Toast
            title={toast.title}
            description={toast.description}
            variant={toast.variant}
            onClose={() => setToast(null)}
          />
        </div>
      )}
    </>
  );
}
