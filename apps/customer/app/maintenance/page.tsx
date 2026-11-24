import type { Metadata } from 'next';
import { MaintenanceFallbackScreen } from '@/components/maintenance';
import { getMaintenanceStatus } from '@/lib/maintenance-store';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Under Maintenance | Quality Bakers',
  description: 'Our digital ovens are currently being fine-tuned. We will be back shortly.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function MaintenancePage() {
  const status = await getMaintenanceStatus();

  return (
    <MaintenanceFallbackScreen
      message={status.message}
      retryAfter={status.retryAfter}
      fullScreen={true}
    />
  );
}
