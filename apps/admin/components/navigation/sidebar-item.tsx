'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LucideIcon } from 'lucide-react';
import { cn } from '@qbm/ui';

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
}

export function SidebarItem({ icon: Icon, label, href }: SidebarItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
        isActive
          ? 'bg-stone-100 dark:bg-stone-800 text-stone-900 dark:text-stone-50'
          : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-50 hover:bg-stone-50 dark:hover:bg-stone-800/50',
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </Link>
  );
}
