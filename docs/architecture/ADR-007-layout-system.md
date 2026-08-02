# ADR-007 — Reusable Layout System

**Status:** Accepted  
**Date:** 2026-07-31  
**Author:** Engineering

---

## Context

Different categories have different visual personalities. Falooda is luxurious and deserves a dominant spotlight presentation. Coffee and Tea are narrative categories suited to an alternating editorial layout. Smoothies are image-rich and benefit from a Pinterest-style masonry grid.

The challenge is implementing these different presentations without category-specific code.

---

## Decision

Build a set of **reusable, category-agnostic layout components** dispatched by `LayoutEngine` based on `layoutType` from the category configuration.

**Implemented layouts:**

| Layout               | Description                                | Best For                                            |
| -------------------- | ------------------------------------------ | --------------------------------------------------- |
| `editorial-grid`     | Classic 2–3 column grid                    | General categories                                  |
| `magazine-split`     | One large featured item + side grid        | High-personality categories (Nuts Shake, Avil Milk) |
| `spotlight`          | Dominant hero item + secondary row         | Signature items (Falooda)                           |
| `pinterest-grid`     | Offset masonry two-column grid             | Image-rich categories (Smoothies)                   |
| `gallery-wall`       | Asymmetric tile mosaic with variable sizes | Visual categories (Ice Cream, Fruit Salad)          |
| `alternating-layout` | Image-left / image-right alternation       | Narrative categories (Coffee, Mojito)               |

**Every layout component has exactly the same props contract:**

```ts
interface LayoutComponentProps {
  products: MenuProduct[];
  themeClasses: ThemeClasses;
  animationConfig: AnimationConfig;
}
```

---

## Rationale

**Layouts must not know what they are rendering.**  
A layout component's job is to arrange a list of products in a specific visual pattern. It does not know whether it is rendering Falooda or Lime. This is enforced by the `LayoutComponentProps` contract — `MenuCategoryConfig` is intentionally excluded from layout props.

**Category-agnosticism enables reuse.**  
Any layout can be assigned to any category. If "Mojito" is currently using `alternating-layout` and the design team decides it would work better with `magazine-split`, the change is a single field in the config. No code change, no new component.

**The `LayoutEngine` is the only component that maps category to layout.**  
The dispatch happens at one point in the tree — `LayoutEngine`. Layout components never need to know about this dispatch; they just receive their props and render.

**The shared contract enables future lazy loading.**  
Because all layouts share `LayoutComponentProps`, the `LAYOUT_REGISTRY` entries can be wrapped in `React.lazy()` without changing any layout component's code. The `LayoutEngine` API is stable regardless of whether loading is eager or lazy.

---

## Alternatives Considered

**Alternative A: Per-category layout files.**  
Rejected. Creates N files for N categories. When a layout pattern changes (e.g., grid gap increases), N files must be updated.

**Alternative B: A single layout with conditional rendering.**  
Rejected. Leads to a single component with growing conditional complexity. Each new layout adds another branch. Testing any layout requires rendering the full component.

**Alternative C: Compound layout system where parents define grid and children define cells.**  
Considered but rejected as over-engineering for the current category count. The current approach is sufficient and extensible.

---

## Trade-offs

| Trade-off                                                        | Accepted Because                                                                                                         |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Each layout is a separate file                                   | Each file is independently readable, testable, and replaceable                                                           |
| All layouts are eagerly imported                                 | Acceptable at current scale; lazy loading is available when needed                                                       |
| Some layouts (`gallery-wall`) use hardcoded tile sizing patterns | The pattern (large at index 0, 5; tall at index 2, 7) is configurable if needed; it does not depend on category identity |

---

## Consequences

- All layout components are Server Components — zero client JavaScript for layout rendering.
- Adding a new layout: create the component implementing `LayoutComponentProps`, add to `LAYOUT_REGISTRY`, add to `LayoutType` union. Three files, zero logic changes.
- Removing an unused layout: remove from registry and union. TypeScript will flag any config using the removed type.
- The `priority` prop on `ProductCard` is reserved for future `next/image` above-the-fold optimization — layouts that place the first product above the fold should pass `priority={true}`.

---

## Future Considerations

- A `masonry` layout using CSS grid `auto-rows` with variable `grid-row-end` can be added for large product collections.
- When real product images are introduced (using `next/image`), layouts should pass `priority={idx === 0}` to ensure the first product image loads with high priority.
- A future `carousel` layout for mobile-optimized horizontal scrolling is a natural addition.
- Layout selection could eventually be surfaced to Admin panel for a subset of categories, if the business requires it.
