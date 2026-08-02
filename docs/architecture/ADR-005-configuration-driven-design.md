# ADR-005 — Configuration-Driven Design

**Status:** Accepted  
**Date:** 2026-07-31  
**Author:** Engineering

---

## Context

The menu has 11 categories, each with a distinct personality — luxurious falooda, minimal lime, cafe-style coffee, vibrant smoothies. Each category should feel different while sharing the same underlying architecture.

The naive approach is to write separate, category-specific components. The scalable approach is to write one generic rendering system that reads per-category configuration to vary its output.

---

## Decision

Every visual and behavioral decision for a category is encoded in `MenuCategoryConfig`:

```ts
interface MenuCategoryConfig {
  // Identity
  id;
  name;
  slug;
  description;
  coverImage;

  // Ordering (Admin-controlled)
  displayOrder;

  // Presentation (design-system controlled)
  layoutType; // → LayoutEngine
  displayStyle; // → ThemeEngine
  accentColor; // → CSS custom property
  animationPreset; // → AnimationEngine
  scrollBehavior; // → future Level 2 scroll effects

  // Content (Admin-controlled)
  heroProductId;

  // Visibility (Admin-controlled)
  isVisible;
  isFeatured;
  featuredOnHome;

  // Timestamps
  createdAt;
  updatedAt;
}
```

Every rendering component is completely generic. No component contains hardcoded category names, slugs, or category-specific styling.

---

## Rationale

**Hardcoded category logic creates linear maintenance cost.**  
If a developer writes `if (category.slug === 'falooda') { renderLuxuryLayout() }`, then every new category requires a code change. With configuration-driven rendering, a new category is a new config object. Code does not change.

**Configuration separates business decisions from technical decisions.**  
The category name, description, and display order are business decisions — owned by the bakery. The layout type, display style, and animation preset are design decisions — owned by engineering. `MenuCategoryConfig` separates these cleanly by documenting which fields are Admin-controlled and which are design-system-controlled.

**Configuration is a stable API surface for the Admin panel.**  
When the Admin panel is built, it interacts with the business fields of `MenuCategoryConfig` via the API. The Admin panel never modifies layout types or animation presets. This is documented in the type definition itself.

**Every field has exactly one responsibility.**  
`layoutType` only determines which layout component renders. `displayStyle` only determines which theme class set applies. `animationPreset` only determines how elements enter the viewport. These responsibilities do not overlap. Changing one does not affect the others.

---

## Alternatives Considered

**Alternative A: Per-category component files.**  
Rejected. Scales linearly with category count. Adding a category requires writing and maintaining a new component.

**Alternative B: Category-specific theme props passed to a shared component.**  
A weaker version of the registry approach. The issue is that "category-specific" logic eventually leaks into the shared component as special cases. The registry enforces that no category-specific logic exists anywhere in the engine.

**Alternative C: Derive presentation from category name.**  
Rejected. Couples presentation to content. If the category is renamed, its visual behavior changes — an unexpected side effect.

---

## Trade-offs

| Trade-off                                                                    | Accepted Because                                                                           |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| New layout or display style requires both a type update and a registry entry | TypeScript enforces the registry entry — the process is safe and explicit                  |
| Config file must be edited to add or reorder categories (today)              | This is explicitly temporary; the repository layer isolates this to one file               |
| Design-system config fields are not editable by Admin                        | This is intentional — visual consistency is a developer responsibility, not a business one |

---

## Consequences

- Adding a new category: add one object to `config/categories.ts`. Zero component changes.
- Reordering categories: change `displayOrder` values. Zero component changes.
- Hiding a category: set `isVisible: false`. Zero component changes.
- Changing a category's visual personality: change `displayStyle` or `layoutType`. Zero component changes.

---

## Future Considerations

- When the Admin API ships, the business fields (`displayOrder`, `isVisible`, `isFeatured`, `name`, `description`) are editable via the Admin panel. Design-system fields remain in code.
- If the bakery later wants to introduce seasonal themes (different `displayStyle` for holiday periods), this can be implemented as a time-based resolver in `ThemeEngine` without changing any category config.
- If multi-language support is added, `name` and `description` in `MenuCategoryConfig` will become locale-keyed objects. The rendering pipeline consumes `string` — the localization layer sits in the repository, not the renderer.
