# ADR-001 — Menu Experience Engine

**Status:** Accepted  
**Date:** 2026-07-31  
**Author:** Engineering

---

## Context

Quality Bakers Menu requires a customer-facing digital menu. The primary use case is a customer scanning a QR code at the bakery and browsing the full menu on a mobile device.

The experience must feel premium and editorial — not a conventional restaurant catalogue. The menu itself is the product. Browsing must be effortless, fast, and visually compelling.

The initial version has no backend. Categories and products are configured statically. A backend will be introduced in a later sprint.

---

## Decision

Build a **Menu Experience Engine**: a composed, configuration-driven system that renders the full menu browsing experience as a server-rendered React application.

The engine is organized as a set of independent, composable layers:

```
MenuEngine (root orchestrator)
  ├── CategoryRepository     (data access)
  ├── ProductRepository      (data access)
  ├── CategoryNav            (client: scroll navigation)
  └── CategorySection        (per-category orchestrator)
       ├── ThemeEngine        (pure fn: visual style)
       ├── AnimationEngine    (pure fn: entrance animation)
       ├── CategoryIntro      (editorial header)
       └── LayoutEngine       (layout dispatcher)
            └── Layout Component
                 └── MotionWrapper + ProductCard
```

---

## Rationale

**Single orchestrator, composable engines.**  
A single root component (`MenuEngine`) is responsible for fetching data and producing the rendered sequence of categories. It delegates all presentation decisions to independent engines. This means the root component never needs to change when visual behavior changes.

**Configuration drives rendering, not component logic.**  
Every visual decision — layout, theme, animation — originates from `MenuCategoryConfig`. Components are completely generic. A layout component does not know what category it is rendering. This means new categories can be added to the config with zero code changes.

**Categories are ordered by `displayOrder`, never by array index.**  
The rendering order can be changed by updating a single number on a config object. The Admin panel will later change this number via API. No component or layout is aware of category position.

---

## Alternatives Considered

**Alternative A: Single large page component with hardcoded categories.**  
Rejected. This would require code changes for every new category, reorder, or visibility toggle. Not maintainable over time.

**Alternative B: CMS-driven content (Contentful, Sanity).**  
Rejected for Sprint 2. Introduces infrastructure complexity before the core experience is validated. The repository pattern means a CMS can be added later with no rendering changes.

**Alternative C: Client-side rendering with a JSON data file.**  
Rejected. Client-side rendering increases time-to-content on mobile — the primary device. The menu is content-heavy and benefits significantly from server rendering.

---

## Trade-offs

| Trade-off                                      | Accepted Because                                              |
| ---------------------------------------------- | ------------------------------------------------------------- |
| More files than a simple page component        | Complexity is managed; each file has one job                  |
| Configuration requires developer changes today | Repository layer isolates this; Admin panel resolves it later |
| Multiple engines to understand                 | Each engine is independently readable in under 2 minutes      |

---

## Consequences

- Any new category requires only a new entry in `config/categories.ts`.
- Any new layout requires only a new component registered in `LAYOUT_REGISTRY`.
- Any new theme requires only a new entry in `THEME_REGISTRY`.
- The rendering pipeline is stable and does not need to change when content changes.

---

## Future Considerations

- When the Admin API ships, `CategoryRepository._source()` becomes an async fetch. No rendering code changes.
- When ISR is needed (after Admin integration), `export const revalidate = 60` is added to `app/categories/page.tsx`.
- Premium scroll sections (Level 2 animations) can be introduced as lazily loaded components without affecting the existing engine.
