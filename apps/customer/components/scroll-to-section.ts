let activeRetryTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Authoritative smooth scroll helper for page navigation.
 * Accounts for the dynamic sticky header height across desktop and mobile.
 */
export function scrollToSection(id: string, options?: { behavior?: ScrollBehavior }): boolean {
  if (typeof window === 'undefined') return false;

  const behavior = options?.behavior ?? 'smooth';

  if (id === 'home') {
    window.scrollTo({ top: 0, behavior });
    if (window.location.hash !== '#home') {
      window.history.replaceState(null, '', '/#home');
    }
    return true;
  }

  const el = document.getElementById(id);
  if (!el) return false;

  const headerEl = document.querySelector('header');
  const isMobile = window.innerWidth < 768;
  const isLg = window.innerWidth >= 1024;
  const fallbackHeaderH = isMobile ? 64 : isLg ? 76 : 72;
  const headerH = headerEl ? headerEl.getBoundingClientRect().height : fallbackHeaderH;

  const currentElementTop = el.getBoundingClientRect().top + window.scrollY;
  const targetY = Math.max(0, currentElementTop - headerH);

  window.scrollTo({ top: targetY, behavior });
  if (window.location.hash !== `#${id}`) {
    window.history.replaceState(null, '', `/#${id}`);
  }
  return true;
}

/**
 * Retries scrolling to an element hash until it is rendered in the DOM.
 * Essential for client-side cross-page transitions in Next.js App Router.
 */
export function scrollToHashWithRetry(
  id: string,
  options?: { behavior?: ScrollBehavior; maxAttempts?: number; intervalMs?: number },
) {
  if (typeof window === 'undefined') return;

  const cleanId = id.replace('#', '');
  if (!cleanId) return;

  if (activeRetryTimer) {
    clearTimeout(activeRetryTimer);
    activeRetryTimer = null;
  }

  const maxAttempts = options?.maxAttempts ?? 40; // Poll up to 2 seconds
  const intervalMs = options?.intervalMs ?? 50;
  let attempts = 0;

  const attemptScroll = () => {
    attempts++;
    const success = scrollToSection(cleanId, { behavior: options?.behavior ?? 'smooth' });
    if (success) {
      activeRetryTimer = null;
      // Secondary adjustment after images or dynamic layouts stabilize
      setTimeout(() => {
        scrollToSection(cleanId, { behavior: 'smooth' });
      }, 180);
      return;
    }

    if (attempts < maxAttempts) {
      activeRetryTimer = setTimeout(attemptScroll, intervalMs);
    } else {
      activeRetryTimer = null;
    }
  };

  attemptScroll();
}
