'use client';

import { ErrorState } from '@qbm/ui';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex h-[50vh] items-center justify-center">
      <ErrorState
        title="Something went wrong"
        message={error.message || 'An unexpected error occurred while loading this page.'}
        onRetry={reset}
      />
    </div>
  );
}
