# ADR-008 — Theme Engine

**Status:** Accepted  
**Date:** 2026-07-31  
**Author:** Engineering

---

## Context

The menu has 11 categories with distinct visual personalities. Each needs a different color palette, typography treatment, and spacing feel. These visual differences must be applied consistently — to headings, descriptions, cards, badges, accents, and dividers — across all layout components.

The question is: where does visual style live, and how is it applied?

---

## Decision

Visual style is resolved by `ThemeEngine` — a pure function that maps a `DisplayStyle` enum value to a `ThemeClasses` object:

```ts
function resolveTheme(displayStyle: DisplayStyle): ThemeClasses;
```

`ThemeClasses` is a map of semantic slot names to Tailwind class strings:

```ts
interface ThemeClasses {
  section: string; // Background for the full section
  heading: string; // Primary category heading
  subheading: string; // Secondary / italic heading
  description: string; // Body text
  card: string; // Product card base styles
  cardHover: string; // Product card hover state
  badge: string; // Badge pill styling
  accent: string; // Accent color (links, decorative elements)
  divider: string; // Horizontal separator
}
```

`accentColor` (an optional CSS color string from `MenuCategoryConfig`) is applied separately as a CSS custom property (`--accent-color`) on the `<section>` element, allowing child components to consume it via `var(--accent-color)` without needing it as a prop.

---

## Rationale

**Separation of concerns: layout and theme are independent.**  
A layout component does not know which display style it is rendering. It receives `themeClasses` and applies them to its elements. If the theme of a category changes from `luxury` to `cafe`, only the config entry changes — the layout component is unaffected.

**Semantic slot names, not utility classes.**  
Layout components reference `themeClasses.heading`, not `text-stone-900 dark:text-stone-50 tracking-tight`. This means a layout component is readable without knowing the specific theme — it says "apply heading styles here," and the theme decides what those styles are.

**ThemeEngine is a pure function with no React dependency.**  
It has no JSX, no hooks, no side effects. It runs synchronously at render time on the server. Its output is a plain object of strings. This makes it trivially testable and zero-cost at runtime.

**The `ThemeClasses` contract is stable.**  
Layout components are written against the `ThemeClasses` interface. As long as the interface does not change, any theme can be modified without affecting any layout. New themes can be added without changing any layout.

**`accentColor` uses a CSS custom property to avoid prop drilling.**  
Rather than passing `accentColor` through `CategorySection → LayoutEngine → Layout → MotionWrapper → ProductCard`, it is applied once as `style={{ '--accent-color': accentColor }}` on the `<section>` element. Any descendant can reference it. This avoids coupling the `ThemeClasses` interface to a dynamic value.

---

## Alternatives Considered

**Alternative A: Per-category CSS files.**  
Rejected. Requires a new CSS file per category. Managing specificity and dark mode across many files is error-prone.

**Alternative B: Inline styles on every element.**  
Rejected. Inline styles bypass Tailwind's responsive modifiers and dark mode classes. They also make visual scanning of component markup harder.

**Alternative C: CSS variables for the entire theme.**  
Partially adopted via `accentColor`. Using CSS variables for the full theme would require defining variables at the `:root` level (or on a wrapping element) and maintaining them in sync with the Tailwind design tokens. The current approach (Tailwind classes for static values, CSS variables for dynamic overrides) is simpler and sufficient.

**Alternative D: Return `ThemeClasses & { accentColorOverride?: string }` (intersection type).**  
Implemented briefly, then rejected. The intersection type leaked a non-`ThemeClasses` property into the interface, breaking the clean contract and requiring downstream components to understand an additional field that they should not be responsible for applying.

---

## Trade-offs

| Trade-off                                               | Accepted Because                                                                                         |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| All theme values are Tailwind class strings             | The project is Tailwind-based throughout; this is consistent                                             |
| Each theme entry duplicates dark mode suffixes          | Explicit dark mode classes are more readable than computed values                                        |
| `ThemeClasses` must be extended if a new slot is needed | Extending the interface is a deliberate, visible change that forces all themes to implement the new slot |

---

## Consequences

- All styling decisions for a category originate from `THEME_REGISTRY[displayStyle]`.
- Layout components do not contain hardcoded colors or font classes — only semantic slot references.
- Adding a new theme: add to `DisplayStyle` union → add entry to `THEME_REGISTRY`. TypeScript enforces completeness.
- Changing an existing theme: modify the registry entry. All layouts automatically reflect the change.
- `accentColor` in `MenuCategoryConfig` is the only per-instance override supported. It cascades via CSS to all descendants.

---

## Future Considerations

- A future `season` field in `MenuCategoryConfig` could allow time-based theme switching (e.g., a warm theme during winter months). The resolver would consult the current date and return a modified `ThemeClasses` object.
- Dark mode is currently handled via Tailwind's `dark:` prefix. If the user preferences system is introduced, a user-selected theme variant could be applied by passing a different `displayStyle` from the repository.
- If the design system grows significantly, `ThemeClasses` slots could be split into `typography`, `surfaces`, and `interactions` sub-objects for better organization.
