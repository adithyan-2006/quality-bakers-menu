import type { Metadata } from 'next';
import { MenuEngine } from '../../features/menu/menu-engine';

export const metadata: Metadata = {
  title: 'Our Menu',
  description: 'Browse our complete menu of artisanal beverages and bakery items.',
};

export const revalidate = 60;

export default function CategoriesPage() {
  return <MenuEngine />;
}
