import type { DisplayStyle, ThemeClasses } from '../types';

/**
 * Theme Registry — Fully Declarative
 *
 * Every display style is defined as a static ThemeClasses object.
 * NO switch statements. NO imperative logic.
 *
 * ThemeEngine never decides behavior — it only resolves class sets.
 * Layout components consume ThemeClasses and are responsible for applying them.
 *
 * To add a new display style:
 *   1. Add the key to the DisplayStyle union type
 *   2. Add the ThemeClasses entry here
 *   That is all.
 *
 * accentColor override: if provided, it is used as an inline CSS custom
/**
 * Shared Design System Tokens
 * Enforces visual uniformity across all categories.
 */
const SHARED_TOKENS = {
  heading: 'font-serif text-[#FDFADB] tracking-tight',
  subheading: 'font-sans text-brand-cream/60 font-bold uppercase tracking-[0.15em] text-xs',
  description: 'font-sans text-[#FDFADB]/90 leading-relaxed',
  card: 'bg-[#FDFADB] border-0 border-transparent rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.06)]',
  cardHover:
    'hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-300',
  badge:
    'bg-[#FDFADB] border border-[#BC1D1A]/10 text-[#BC1D1A] uppercase tracking-widest font-bold text-[10px] px-3 py-1 rounded-full',
  divider: 'border-black/10',
  price: 'font-sans text-brand-dark font-medium',
};

const THEME_REGISTRY: Record<DisplayStyle, ThemeClasses> = {
  luxury: {
    section: 'bg-[#BC1D1A]',
    accent: 'text-brand-cream',
    ...SHARED_TOKENS,
  },
  fresh: {
    section: 'bg-[#BC1D1A]',
    accent: 'text-brand-cream',
    ...SHARED_TOKENS,
  },
  minimal: {
    section: 'bg-[#BC1D1A]',
    accent: 'text-brand-cream',
    ...SHARED_TOKENS,
  },
  cafe: {
    section: 'bg-[#BC1D1A]',
    accent: 'text-brand-cream',
    ...SHARED_TOKENS,
  },
  classic: {
    section: 'bg-[#BC1D1A]',
    accent: 'text-brand-cream',
    ...SHARED_TOKENS,
  },
  healthy: {
    section: 'bg-[#BC1D1A]',
    accent: 'text-brand-cream',
    ...SHARED_TOKENS,
  },
  warm: {
    section: 'bg-[#BC1D1A]',
    accent: 'text-brand-cream',
    ...SHARED_TOKENS,
  },
  modern: {
    section: 'bg-[#BC1D1A]',
    accent: 'text-brand-cream',
    ...SHARED_TOKENS,
  },
  dark: {
    section: 'bg-[#BC1D1A]',
    accent: 'text-brand-cream',
    ...SHARED_TOKENS,
  },
};

export function resolveTheme(displayStyle: DisplayStyle): ThemeClasses {
  return THEME_REGISTRY[displayStyle] ?? THEME_REGISTRY.minimal;
}
