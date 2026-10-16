import { EmptyState, buttonVariants } from '@qbm/ui';
import { TopScrollLink } from '../components/top-scroll-link';

export default function NotFound() {
  return (
    <div className="flex h-[50vh] items-center justify-center">
      <EmptyState
        title="Page Not Found"
        description="The page you are looking for does not exist or has been moved."
        action={
          <TopScrollLink href="/" className={buttonVariants({ variant: 'primary' })}>
            Return Home
          </TopScrollLink>
        }
      />
    </div>
  );
}
