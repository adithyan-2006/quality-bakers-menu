/**
 * Authoritative smooth scroll helper for page navigation.
 * Accounts for the dynamic sticky header height across desktop and mobile:
 * - At rest: 80px (desktop), 64px (mobile)
 * - Compact (scrolled): 64px (desktop), 52px (mobile)
 */
export function scrollToSection(id: string) {
  if (typeof window === 'undefined') return;

  if (id === 'home') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.history.pushState(null, '', '/#home');
    return;
  }

  const el = document.getElementById(id);
  if (!el) return;

  const isMobile = window.innerWidth < 768;
  const compactHeaderH = isMobile ? 52 : 64;
  const expandedHeaderH = isMobile ? 64 : 80;
  const headerDelta = expandedHeaderH - compactHeaderH;

  // If currently near the top (scrollY < 50), the header is currently in its expanded state.
  // When scrolling begins, the header will shrink by headerDelta (16px desktop, 12px mobile).
  // Because the sticky header is in-flow, its shrink moves all subsequent content up by headerDelta.
  // We deduct this delta to land precisely flush below the compact header.
  const isCurrentlyExpanded = window.scrollY < 50;
  const currentElementTop = el.getBoundingClientRect().top + window.scrollY;
  const adjustedElementTop = isCurrentlyExpanded
    ? currentElementTop - headerDelta
    : currentElementTop;

  const targetY = Math.max(0, adjustedElementTop - compactHeaderH);

  window.scrollTo({ top: targetY, behavior: 'smooth' });
  window.history.pushState(null, '', `/#${id}`);
}
