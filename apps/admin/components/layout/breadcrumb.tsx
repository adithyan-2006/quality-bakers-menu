'use client';

import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';

export function Breadcrumb() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav className="flex text-sm text-stone-500 font-medium" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        <li className="inline-flex items-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center hover:text-stone-900 dark:hover:text-stone-50 transition-colors"
          >
            <Home className="w-4 h-4 mr-2" />
            Admin
          </Link>
        </li>
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;
          const href = `/${segments.slice(0, index + 1).join('/')}`;
          const label = segment.charAt(0).toUpperCase() + segment.slice(1);

          return (
            <li key={href}>
              <div className="flex items-center">
                <ChevronRight className="w-4 h-4 text-stone-400 mx-1" />
                {isLast ? (
                  <span className="text-stone-900 dark:text-stone-50" aria-current="page">
                    {label}
                  </span>
                ) : (
                  <Link
                    href={href}
                    className="hover:text-stone-900 dark:hover:text-stone-50 transition-colors"
                  >
                    {label}
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
