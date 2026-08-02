import { LoadingState } from '@qbm/ui';

export default function Loading() {
  return (
    <div className="flex h-[50vh] items-center justify-center">
      <LoadingState
        title="Loading Menu..."
        description="Please wait while we fetch the latest baked goods."
      />
    </div>
  );
}
