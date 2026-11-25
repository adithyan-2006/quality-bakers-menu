'use client';

import * as React from 'react';

export function ScrollCue() {
  const [opacity, setOpacity] = React.useState(1);

  React.useEffect(() => {
    let rafId: number | null = null;
    let lastOpacity = 1;
    let lastViewportWidth = typeof window !== 'undefined' ? window.innerWidth : 0;

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

    const syncHeroFitHeight = (force = false) => {
      const homeSection = document.getElementById('home');
      if (!homeSection) return;

      const currentWidth = window.innerWidth;
      const widthChanged = Math.abs(currentWidth - lastViewportWidth) > 1;
      const scrollY = getScrollY();

      // Update while at top of page (before user scrolls & hides mobile URL bar)
      // or whenever orientation / width changes, preventing layout shifts mid-scroll.
      if (!force && !widthChanged && scrollY > 20) return;

      lastViewportWidth = currentWidth;
      const header = document.querySelector('header');
      const headerHeight = header ? header.getBoundingClientRect().height : 64;
      const vpHeight = window.visualViewport?.height || window.innerHeight;
      if (vpHeight > 200) {
        const fitHeight = Math.max(240, Math.floor(vpHeight - headerHeight));
        homeSection.style.setProperty('--hero-fit-height', `${fitHeight}px`);
      }
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

    const handleResize = () => {
      syncHeroFitHeight();
      handleScroll();
    };

    // Immediate sync & opacity check at mount
    syncHeroFitHeight(true);
    update();

    // Check multiple intervals to guarantee visibility after any loading gates,
    // scroll-to-top resets, or browser chrome UI / restoration adjustments.
    const t1 = setTimeout(() => {
      syncHeroFitHeight();
      update();
    }, 100);
    const t2 = setTimeout(() => {
      syncHeroFitHeight();
      update();
    }, 400);
    const t3 = setTimeout(() => {
      syncHeroFitHeight();
      update();
    }, 1000);
    const t4 = setTimeout(() => {
      syncHeroFitHeight();
      update();
    }, 2100); // After HomeLoadingGate mandatory 2000ms timer
    const t5 = setTimeout(() => {
      syncHeroFitHeight();
      update();
    }, 2600); // After HomeLoadingGate 400ms fade transition finishes

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    window.visualViewport?.addEventListener('resize', handleResize);
    document.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
      window.visualViewport?.removeEventListener('resize', handleResize);
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
      className="group flex flex-col items-center justify-center cursor-pointer outline-none focus-visible:ring-1 focus-visible:ring-[#FDFADB]/60 rounded-full py-1.5 px-4 select-none animate-scroll-jump transition-opacity duration-150 will-change-[opacity]"
    >
      <span className="font-sans font-bold text-xs min-[360px]:text-[13px] tracking-[0.26em] pl-[0.26em] uppercase text-[#FDFADB] leading-none select-none block text-center drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)]">
        SCROLL
      </span>
      <svg
        className="w-4 h-4 text-[#FDFADB] mt-1 shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)] transition-transform group-hover:translate-y-0.5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </button>
  );
}
