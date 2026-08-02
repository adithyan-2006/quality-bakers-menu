import type { Metadata } from 'next';
import { MenuEngine } from '../../features/menu/menu-engine';

export const metadata: Metadata = {
  title: 'Our Menu',
  description: 'Browse our complete menu of artisanal beverages and bakery items.',
};

export default function CategoriesPage() {
  return <MenuEngine />;
}
