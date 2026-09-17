'use client';

import * as React from 'react';
import { Heart } from 'lucide-react';
import { cn } from '@qbm/ui';
import { useProductLike } from '../../likes/use-product-like';

export interface LikeButtonProps {
  productId: string;
  productName: string;
  className?: string | undefined;
  initialGlobalCount?: number | null | undefined;
}

export function LikeButton({
  productId,
  productName,
  className,
  initialGlobalCount,
}: LikeButtonProps) {
  const { isLiked, isHydrated, globalLikeCount, toggleLike } = useProductLike(
    productId,
    initialGlobalCount,
  );
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [animationType, setAnimationType] = React.useState<'like' | 'unlike' | null>(null);
  const animationTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // 1. Determine next state & trigger animation independently
    const nextState = !isLiked;
    setAnimationType(nextState ? 'like' : 'unlike');
    setIsAnimating(true);

    if (animationTimerRef.current) {
      clearTimeout(animationTimerRef.current);
    }
    const durationMs = nextState ? 750 : 520;
    animationTimerRef.current = setTimeout(() => {
      setIsAnimating(false);
      setAnimationType(null);
      animationTimerRef.current = null;
    }, durationMs);

    // 2. Trigger state & database API update independently (never blocked or delayed)
    toggleLike();
  };

  React.useEffect(() => {
    return () => {
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
      }
    };
  }, []);

  // Display count only if global count > 0. If 0 or null, hide completely.
  const displayCount =
    globalLikeCount !== null && globalLikeCount !== undefined && globalLikeCount > 0
      ? globalLikeCount
      : null;

  const showLiked = isHydrated && isLiked;

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <button
        type="button"
        onClick={handleClick}
        aria-label={showLiked ? `Unlike ${productName}` : `Like ${productName}`}
        aria-pressed={showLiked}
        className={cn(
          'group/like relative flex items-center justify-center',
          // Touch target: 36px x 36px, zero border, 100% transparent background, no red circular ring
          'w-9 h-9 p-0 bg-transparent border-0 rounded-full cursor-pointer outline-none select-none',
          'transition-transform duration-150 active:scale-90',
          'focus-visible:ring-1 focus-visible:ring-[#BC1D1A]/30',
        )}
      >
        {/* Floating Mini Hearts (when liking) */}
        {isAnimating && animationType === 'like' && (
          <div
            className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center overflow-visible"
            aria-hidden="true"
          >
            {/* Heart 1: floats up-left */}
            <Heart className="absolute w-3 h-3 text-[#BC1D1A] fill-[#BC1D1A] stroke-[#BC1D1A] animate-float-heart-1" />
            {/* Heart 2: floats up-center */}
            <Heart className="absolute w-3.5 h-3.5 text-[#BC1D1A] fill-[#BC1D1A] stroke-[#BC1D1A] animate-float-heart-2" />
            {/* Heart 3: floats up-right */}
            <Heart className="absolute w-2.5 h-2.5 text-[#BC1D1A] fill-[#BC1D1A] stroke-[#BC1D1A] animate-float-heart-3" />
            {/* Heart 4: floats up-center-right */}
            <Heart className="absolute w-3 h-3 text-[#BC1D1A] fill-[#BC1D1A] stroke-[#BC1D1A] animate-float-heart-4" />
          </div>
        )}

        {/* Heart Break Effect (when unliking): 💔 irregular zig-zag crack into 2 complementary pieces */}
        {isAnimating && animationType === 'unlike' && (
          <div
            className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center overflow-visible"
            aria-hidden="true"
          >
            {/* Left Piece (💔): complementary zig-zag crack, moves left & down, rotates CCW, fades out */}
            <div
              className="absolute w-[21px] h-[21px] animate-heart-break-left"
              style={{
                clipPath: 'polygon(0% 0%, 50% 0%, 38% 38%, 60% 54%, 42% 72%, 50% 100%, 0% 100%)',
              }}
            >
              <Heart className="w-[21px] h-[21px] text-[#BC1D1A] fill-[#BC1D1A] stroke-[#BC1D1A]" />
            </div>
            {/* Right Piece (💔): complementary zig-zag crack, moves right & down, rotates CW, fades out */}
            <div
              className="absolute w-[21px] h-[21px] animate-heart-break-right"
              style={{
                clipPath:
                  'polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%, 42% 72%, 60% 54%, 38% 38%)',
              }}
            >
              <Heart className="w-[21px] h-[21px] text-[#BC1D1A] fill-[#BC1D1A] stroke-[#BC1D1A]" />
            </div>
          </div>
        )}

        {/* Main Heart Icon:
            UNLIKED: transparent background, red outline #BC1D1A, no surrounding circle
            LIKED: transparent background, solid fill heart #BC1D1A, no surrounding circle
        */}
        <Heart
          className={cn(
            'w-[21px] h-[21px] transition-transform duration-150 transform-gpu',
            showLiked
              ? 'text-[#BC1D1A] fill-[#BC1D1A] stroke-[#BC1D1A]'
              : 'text-[#BC1D1A] stroke-[#BC1D1A] stroke-[1.8] fill-transparent',
            isAnimating && animationType === 'like' && 'animate-like-pop',
            isAnimating && animationType === 'unlike' && 'animate-heart-fade-in',
          )}
        />
      </button>

      {/* Like Count:
          Only visible when count > 0.
          Positioned absolutely directly below the heart so it NEVER pushes the card's bottom boundary downward!
      */}
      {displayCount !== null && (
        <span
          className="absolute top-[calc(100%-2px)] left-1/2 -translate-x-1/2 text-[10px] md:text-[11px] font-sans font-bold text-brand-dark/80 select-none pointer-events-none leading-none tracking-tight"
          aria-label={`${displayCount} likes`}
        >
          {displayCount}
        </span>
      )}
    </div>
  );
}
