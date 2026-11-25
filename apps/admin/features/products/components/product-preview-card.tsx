import * as React from 'react';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import { formatBadge } from '@qbm/ui';

export interface ProductPreviewCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description?: string | null | undefined;
    price: string;
    image?: string | null | undefined;
    badge?: string | null | undefined;
  };
}

export function ProductPreviewCard({ product }: ProductPreviewCardProps) {
  const displayBadge = product.badge ? formatBadge(product.badge) : null;

  return (
    <article className="w-full h-full max-w-[340px] mx-auto select-none">
      <div className="group flex flex-col w-full h-full rounded-3xl overflow-hidden border-0 border-transparent bg-white shadow-sm ring-1 ring-black/5 hover:shadow-md hover:ring-black/10 transition-all duration-300">
        <div className="relative overflow-hidden bg-[#F5F2EA] rounded-t-3xl aspect-[16/10] w-full">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, 340px"
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">
              No Image
            </div>
          )}
          {displayBadge && (
            <div className="absolute top-3.5 left-3.5 bg-[#FDFADB] px-3.5 py-1 rounded-full shadow-sm z-10">
              <span className="text-[10px] uppercase tracking-[0.1em] text-[#BC1D1A] font-bold">
                {displayBadge}
              </span>
            </div>
          )}
        </div>

        <div className="flex flex-col flex-1 p-4 bg-[#FDFADB] rounded-b-3xl">
          <h3 className="leading-tight text-xl font-serif font-bold mb-1.5 text-[#BC1D1A]">
            {product.name}
          </h3>
          {product.description && (
            <p className="line-clamp-2 text-sm leading-relaxed text-[#BC1D1A]/70 mb-3">
              {product.description}
            </p>
          )}

          <div className="mt-auto pt-2 border-t border-black/10 flex items-center justify-between">
            <span className="font-bold font-sans tracking-wide text-sm text-[#262522]">
              {product.price}
            </span>
            <div className="inline-flex items-center gap-1.5 text-xs text-[#BC1D1A]/70 font-medium">
              <Heart className="w-4 h-4 fill-current" />
              <span>Preview</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
