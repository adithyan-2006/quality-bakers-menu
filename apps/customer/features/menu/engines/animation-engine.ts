import type { AnimationPreset, AnimationConfig } from '../types';

/**
 * Animation Presets Registry — Fully Declarative
 *
 * Every animation is defined as a static configuration object.
 * NO switch statements. NO imperative logic.
 *
 * AnimationEngine never decides behavior — it only resolves config.
 * MotionWrapper consumes this config and is responsible for applying it.
 *
 * To add a new preset:
 *   1. Add the key to the AnimationPreset union type
 *   2. Add the config entry here
 *   That is all.
 *
 * ─── Level 1: CSS + IntersectionObserver ────────────────────────────────────
 *   All presets below are implemented with CSS classes + IntersectionObserver.
 *   Zero Framer Motion dependency.
 *
 * ─── Level 2: Immersive scroll effects (future) ─────────────────────────────
 *   Will be loaded via next/dynamic in isolated section components.
 *   This registry is not involved.
 */
const ANIMATION_REGISTRY: Record<AnimationPreset, AnimationConfig> = {
  fade: {
    enterClass: 'animate-in fade-in duration-700 ease-out fill-mode-forwards',
    initialOpacity: 0,
    staggerDelayMs: 0,
    isStaggered: false,
  },

  reveal: {
    enterClass:
      'animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out fill-mode-forwards',
    initialOpacity: 0,
    staggerDelayMs: 0,
    isStaggered: false,
  },

  slide: {
    enterClass: 'animate-in fade-in slide-in-from-left-8 duration-700 ease-out fill-mode-forwards',
    initialOpacity: 0,
    staggerDelayMs: 0,
    isStaggered: false,
  },

  scale: {
    enterClass: 'animate-in fade-in zoom-in-[0.97] duration-700 ease-out fill-mode-forwards',
    initialOpacity: 0,
    staggerDelayMs: 0,
    isStaggered: false,
  },

  stagger: {
    enterClass:
      'animate-in fade-in slide-in-from-bottom-6 duration-700 ease-out fill-mode-forwards',
    initialOpacity: 0,
    staggerDelayMs: 100,
    isStaggered: true,
  },

  none: {
    enterClass: '',
    initialOpacity: 1,
    staggerDelayMs: 0,
    isStaggered: false,
  },
};

/**
 * Resolves an AnimationPreset to its AnimationConfig.
 * Falls back to 'fade' for any unregistered preset.
 */
export function resolveAnimation(preset: AnimationPreset): AnimationConfig {
  return ANIMATION_REGISTRY[preset] ?? ANIMATION_REGISTRY.fade;
}
