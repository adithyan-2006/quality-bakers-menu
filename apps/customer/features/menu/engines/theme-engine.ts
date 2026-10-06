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
  description: 'font-sans text-[#FDFADB] font-light leading-relaxed',
  card: 'bg-[#FDFADB] border-2 border-brand-cream/80 rounded-2xl sm:rounded-3xl shadow-sm',
  cardHover: 'hover:shadow-xl hover:-translate-y-1 transition-all duration-500',
  badge:
    'bg-brand-cream/80 border border-brand-dark/10 text-brand-dark uppercase tracking-widest font-bold text-[10px] px-3 py-1 rounded-full backdrop-blur-md',
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
