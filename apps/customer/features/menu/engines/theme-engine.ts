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
  heading: 'font-serif text-stone-900 dark:text-stone-50 tracking-tight',
  subheading:
    'font-sans text-stone-600 dark:text-stone-400 font-medium uppercase tracking-widest text-sm',
  description: 'text-stone-600 dark:text-stone-400 font-light leading-relaxed',
  card: 'bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-sm',
  cardHover:
    'hover:shadow-lg hover:-translate-y-1 hover:border-stone-300 dark:hover:border-stone-700 transition-all duration-300',
  badge:
    'bg-transparent border border-stone-900/20 dark:border-stone-50/20 text-stone-900 dark:text-stone-50 uppercase tracking-[0.2em] font-semibold text-[11px]',
  divider: 'border-stone-200 dark:border-stone-800',
  price: 'text-amber-600 dark:text-amber-500', // Premium warm gold
};

const THEME_REGISTRY: Record<DisplayStyle, ThemeClasses> = {
  luxury: {
    section: 'bg-stone-50 dark:bg-stone-950',
    accent: 'text-amber-700 dark:text-amber-400',
    ...SHARED_TOKENS,
  },
  fresh: {
    section: 'bg-emerald-50/50 dark:bg-emerald-950/20',
    accent: 'text-emerald-600 dark:text-emerald-400',
    ...SHARED_TOKENS,
  },
  minimal: {
    section: 'bg-background',
    accent: 'text-foreground',
    ...SHARED_TOKENS,
  },
  cafe: {
    section: 'bg-amber-50/30 dark:bg-amber-950/10',
    accent: 'text-amber-700 dark:text-amber-400',
    ...SHARED_TOKENS,
  },
  classic: {
    section: 'bg-neutral-50 dark:bg-neutral-950',
    accent: 'text-neutral-700 dark:text-neutral-300',
    ...SHARED_TOKENS,
  },
  healthy: {
    section: 'bg-lime-50/40 dark:bg-lime-950/10',
    accent: 'text-lime-600 dark:text-lime-400',
    ...SHARED_TOKENS,
  },
  warm: {
    section: 'bg-orange-50/30 dark:bg-orange-950/10',
    accent: 'text-orange-600 dark:text-orange-400',
    ...SHARED_TOKENS,
  },
  modern: {
    section: 'bg-background',
    accent: 'text-primary',
    ...SHARED_TOKENS,
  },
  dark: {
    section: 'bg-neutral-900 dark:bg-neutral-950',
    accent: 'text-neutral-200',
    ...SHARED_TOKENS,
  },
};

export function resolveTheme(displayStyle: DisplayStyle): ThemeClasses {
  return THEME_REGISTRY[displayStyle] ?? THEME_REGISTRY.minimal;
}
