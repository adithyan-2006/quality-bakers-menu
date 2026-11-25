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
    <div className="bg-white/80 backdrop-blur-md border border-black/[0.07] rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.03),inset_0_1px_0_0_rgba(255,255,255,0.9)] overflow-hidden mb-6">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 bg-black/[0.02] hover:bg-black/[0.04] transition-colors focus:outline-none"
      >
        <h3 className="text-lg font-semibold text-stone-900">{title}</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-stone-500">{isOpen ? 'Close' : 'Edit'}</span>
          {isOpen ? (
            <ChevronDown className="w-5 h-5 text-stone-400" />
          ) : (
            <ChevronRight className="w-5 h-5 text-stone-400" />
          )}
        </div>
      </button>

      {isOpen && <div className="p-6 md:p-8 border-t border-black/[0.06]">{children}</div>}
    </div>
  );
}
