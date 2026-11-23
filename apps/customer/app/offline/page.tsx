import type { Metadata } from 'next';
import { OfflineFallbackScreen } from '@/components/offline';

export const metadata: Metadata = {
  title: 'CRUMBLED! | Quality Bakers',
  description: 'Your Wi-Fi fell apart into tiny pieces. Check your connection and try again.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function OfflinePage() {
  return <OfflineFallbackScreen />;
}
