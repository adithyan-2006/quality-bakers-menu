'use client';

import { Bell, User } from 'lucide-react';
import { Breadcrumb } from './breadcrumb';

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-stone-900/80 px-4 md:px-8 backdrop-blur-md">
      {/* Spacer for mobile sidebar toggle */}
      <div className="w-8 md:hidden" />

      <div className="flex flex-1 items-center gap-x-4 self-stretch lg:gap-x-6">
        <div className="flex flex-1">
          <Breadcrumb />
        </div>

        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <button type="button" className="-m-2.5 p-2.5 text-stone-400 hover:text-stone-500">
            <span className="sr-only">View notifications</span>
            <Bell className="h-5 w-5" aria-hidden="true" />
          </button>

          {/* Separator */}
          <div
            className="hidden lg:block lg:h-6 lg:w-px lg:bg-stone-200 dark:lg:bg-stone-800"
            aria-hidden="true"
          />

          {/* Profile dropdown placeholder */}
          <div className="flex items-center gap-x-4">
            <button type="button" className="-m-1.5 flex items-center p-1.5">
              <span className="sr-only">Open user menu</span>
              <div className="h-8 w-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center border border-stone-200 dark:border-stone-700">
                <User className="h-4 w-4 text-stone-500" />
              </div>
              <span className="hidden lg:flex lg:items-center">
                <span
                  className="ml-4 text-sm font-semibold leading-6 text-stone-900 dark:text-stone-50"
                  aria-hidden="true"
                >
                  Admin
                </span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
