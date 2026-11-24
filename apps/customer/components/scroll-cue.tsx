'use client';

import * as React from 'react';

export function ScrollCue() {
  const [opacity, setOpacity] = React.useState(1);

  React.useEffect(() => {
    let rafId: number | null = null;
    let lastOpacity = 1;

    const getScrollY = (): number => {
      if (typeof window === 'undefined') return 0;
      return (
        window.scrollY ||
        window.pageYOffset ||
        document.documentElement?.scrollTop ||
        document.body?.scrollTop ||
        0
      );
    };

    const update = () => {
      rafId = null;
      const scrollY = getScrollY();
      const fadeDistance = 120;
      // When at or near the top (<= 15px), opacity is strictly 1
      const nextOpacity = scrollY <= 15 ? 1 : Math.max(0, Math.min(1, 1 - scrollY / fadeDistance));

      // Avoid unnecessary re-renders when already fully faded or unchanged
      if (
        Math.abs(nextOpacity - lastOpacity) > 0.01 ||
        (nextOpacity === 0 && lastOpacity !== 0) ||
        (nextOpacity === 1 && lastOpacity !== 1)
      ) {
        lastOpacity = nextOpacity;
        setOpacity(nextOpacity);
      }
    };

    const handleScroll = () => {
      if (rafId === null) {
        rafId = window.requestAnimationFrame(update);
      }
    };

    // Immediate check at mount
    update();

    // Check multiple intervals to guarantee visibility after any loading gates,
    // scroll-to-top resets, or browser scroll restoration adjustments.
    const t1 = setTimeout(update, 100);
    const t2 = setTimeout(update, 400);
    const t3 = setTimeout(update, 1000);
    const t4 = setTimeout(update, 2100); // After HomeLoadingGate mandatory 2000ms timer
    const t5 = setTimeout(update, 2600); // After HomeLoadingGate 400ms fade transition finishes

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    document.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      document.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleClick = () => {
    const nextSection =
      document.querySelector('.featured-categories-section') ||
      document.getElementById('signature');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollBy({ top: window.innerHeight * 0.85, behavior: 'smooth' });
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Scroll to explore"
      aria-hidden={opacity <= 0.05}
      style={{
        opacity,
        pointerEvents: opacity <= 0.05 ? 'none' : 'auto',
      }}
      className="group flex flex-col items-center justify-center cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-[#FDFADB]/60 rounded-full py-1.5 px-3.5 select-none animate-scroll-jump transition-opacity duration-150 will-change-[opacity]"
    >
      <span className="font-sans font-semibold text-xs sm:text-[13px] tracking-[0.25em] pl-[0.25em] uppercase text-[#FDFADB] leading-none select-none block text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)]">
        SCROLL
      </span>
      <svg
        className="w-4 h-4 text-[#FDFADB] mt-1 shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)] transition-transform group-hover:translate-y-0.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </button>
  );
}
