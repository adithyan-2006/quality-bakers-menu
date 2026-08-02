'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface CollapsibleSectionProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-sm overflow-hidden mb-6">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 bg-stone-50 dark:bg-stone-950/50 hover:bg-stone-100 dark:hover:bg-stone-900 transition-colors focus:outline-none"
      >
        <h3 className="text-lg font-medium text-stone-900 dark:text-stone-50">{title}</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-stone-500">{isOpen ? 'Close' : 'Edit'}</span>
          {isOpen ? (
            <ChevronDown className="w-5 h-5 text-stone-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-stone-400" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="p-6 md:p-8 border-t border-stone-200 dark:border-stone-800">{children}</div>
      )}
    </div>
  );
}
