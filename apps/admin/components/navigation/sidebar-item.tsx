'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LucideIcon } from 'lucide-react';
import { cn } from '@qbm/ui';

interface SidebarItemProps {
  icon: LucideIcon;
  label: string;
  href: string;
  onNavigate?: (() => void) | undefined;
}

export function SidebarItem({ icon: Icon, label, href, onNavigate }: SidebarItemProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      onMouseEnter={() => router.prefetch(href)}
      onFocus={() => router.prefetch(href)}
      onClick={() => onNavigate?.()}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150',
        isActive
          ? 'bg-black text-white shadow-sm font-semibold'
          : 'text-stone-600 hover:text-black hover:bg-black/[0.04]',
      )}
    >
      <Icon className={cn('w-4 h-4', isActive ? 'text-white' : 'text-stone-500')} />
      {label}
    </Link>
  );
}
