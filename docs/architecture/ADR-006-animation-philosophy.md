# ADR-006 — Hybrid Animation Philosophy

**Status:** Accepted  
**Date:** 2026-07-31  
**Author:** Engineering

---

## Context

The menu experience is intended to feel premium and editorial. Animation is part of that feeling. However, animation implementations vary dramatically in their performance cost, JavaScript bundle impact, and accessibility implications.

Two extremes exist: pure CSS (near-zero cost, limited capability) and Framer Motion everywhere (full capability, ~45 kB bundle addition, hydration required). Neither extreme is appropriate.

---

## Decision

Implement a **three-level hybrid animation architecture**:

### Level 1 — Default: CSS + IntersectionObserver

The default animation system for the entire application. Implemented in `MotionWrapper` (Client Component) and `AnimationEngine` (pure function).

- All motion is CSS-based (`animate-in`, `fade-in`, `slide-in-from-bottom`, `zoom-in`)
- `IntersectionObserver` fires once per element to add the animation class
- After the animation completes, the element is at its final state; the observer unobserves
- JavaScript payload: approximately 0.3 kB per `MotionWrapper` instance
- Supported presets: `fade`, `reveal`, `slide`, `scale`, `stagger`, `none`
- Covers approximately 90% of animation needs

### Level 2 — Premium: Isolated scroll-linked effects (future)

For sections requiring scroll-linked parallax, layered transitions, or immersive editorial effects:

- Implemented as standalone, dynamically imported section components: `next/dynamic(() => import('./premium-scroll-section'), { ssr: false })`
- Framer Motion (or equivalent) is scoped to these components only
- The Framer Motion bundle (~45 kB) is only downloaded when the user reaches a section that uses it
- The main bundle is unaffected
- Triggered by `scrollBehavior: 'immersive'` in `MenuCategoryConfig`
- `MotionWrapper` and `AnimationEngine` are not involved

### Level 3 — Micro-interactions: CSS only

Hover effects, button transitions, card interactions, focus states:

- Implemented entirely in CSS (`transition-all`, `hover:scale-105`, `group-hover:translate-y-1`)
- Zero JavaScript
- Zero hydration cost

---

## Rationale

**The audience is mobile-first.**  
The primary users arrive via QR code on mid-to-low-end mobile devices with variable network conditions. Framer Motion's JavaScript execution cost on a slow CPU is measurable. CSS transitions are GPU-accelerated and execute at no CPU cost after the first render.

**Bundle isolation is the key insight.**  
The critical engineering insight is that Framer Motion does not need to be excluded from the project — it needs to be isolated. Using `next/dynamic` with code-splitting means Framer Motion is only downloaded by users who scroll to a section that uses it. Users on fast connections get the premium experience; users on slow connections get the efficient CSS version.

**`prefers-reduced-motion` is an accessibility requirement, not a nice-to-have.**  
Users who set this preference often have vestibular disorders where motion causes physical discomfort. The implementation reads this preference synchronously before the first render to ensure no animated content is initially hidden. Reduced-motion users see content immediately, with no flash.

**Stagger animations use CSS `animation-delay`, not JavaScript timers.**  
The `stagger` preset applies incremental `animation-delay` values as inline CSS styles. The browser handles the timing entirely in CSS. No `setTimeout` or JavaScript timing is involved.

---

## Alternatives Considered

**Alternative A: Framer Motion for all animations.**  
Rejected. Adds ~45 kB to the main bundle. Requires all animated components to be Client Components. Hydration cost on mobile is significant for a content-heavy page.

**Alternative B: CSS-only animations for everything, including premium effects.**  
Rejected. CSS alone cannot implement scroll-linked effects such as parallax or content that moves in response to scroll position. These effects require JavaScript. The hybrid approach enables premium effects while isolating their cost.

**Alternative C: React Spring instead of Framer Motion for Level 2.**  
Viable alternative. React Spring has a smaller bundle. If Framer Motion proves too costly when Level 2 is implemented, React Spring is the recommended alternative. The isolation architecture means the swap is a single component change.

---

## Trade-offs

| Trade-off                                   | Accepted Because                                               |
| ------------------------------------------- | -------------------------------------------------------------- |
| `MotionWrapper` is a Client Component       | The isolation is minimal — one `div` wrapper per animated item |
| CSS animation classes are Tailwind-specific | The project uses Tailwind throughout; this is consistent       |
| Level 2 effects are deferred                | The core experience is premium without them                    |

---

## Consequences

- All new components that need entrance animations should use `MotionWrapper` with an `AnimationConfig`.
- `MotionWrapper` must never import Framer Motion.
- Level 2 sections are always dynamically imported. They are never part of the main bundle.
- `prefers-reduced-motion` compliance is automatic for all `MotionWrapper` instances.

---

## Future Considerations

- When `scrollBehavior: 'immersive'` is consumed by `CategorySection`, it will dynamically import a `PremiumScrollSection` that wraps the standard `LayoutEngine` in scroll-linked motion.
- If the animation preset list grows, entries are added to `ANIMATION_REGISTRY` only. No component changes.
- A future `AnimationConfig.duration` field can be added to allow per-category animation speed tuning without changing any CSS classes.
