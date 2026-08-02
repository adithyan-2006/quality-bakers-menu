# Menu Experience Engine — Architecture Documentation

This directory contains the Architecture Decision Records (ADRs) for the Quality Bakers Menu customer application. These documents explain the design decisions made during Sprint 1 and Sprint 2, and serve as the authoritative reference for all future development.

---

## Table of Contents

| Document                                            | Title                           |
| --------------------------------------------------- | ------------------------------- |
| [ADR-001](./ADR-001-menu-engine.md)                 | Menu Experience Engine Overview |
| [ADR-002](./ADR-002-server-first-rendering.md)      | Server-First Rendering Strategy |
| [ADR-003](./ADR-003-registry-pattern.md)            | Registry Pattern for Engines    |
| [ADR-004](./ADR-004-repository-layer.md)            | Repository Layer                |
| [ADR-005](./ADR-005-configuration-driven-design.md) | Configuration-Driven Design     |
| [ADR-006](./ADR-006-animation-philosophy.md)        | Hybrid Animation Philosophy     |
| [ADR-007](./ADR-007-layout-system.md)               | Reusable Layout System          |
| [ADR-008](./ADR-008-theme-engine.md)                | Theme Engine                    |
| [ADR-009](./ADR-009-admin-integration.md)           | Future Admin Panel Integration  |
| [ADR-010](./ADR-010-future-roadmap.md)              | Long-Term Roadmap               |

---

## High-Level Architecture Overview

The Menu Experience Engine is the core of the customer application. It renders the complete menu browsing experience — all categories and their products — as a premium, editorial, scroll-driven digital menu.

The engine is deliberately built as a **pure presentation system**. It has no backend dependency today. When a backend is introduced, only the data-access layer (repositories) changes. No rendering code requires modification.

```
apps/customer/features/menu/
├── config/           Static category configuration (temporary data source)
├── engines/          Pure resolution functions: Layout, Theme, Animation
├── layouts/          Six reusable category-agnostic layout components
├── navigation/       Sticky category navigator (Client Component)
├── animations/       MotionWrapper (Client Component)
├── product/          ProductCard (Server Component)
├── repository/       CategoryRepository + ProductRepository (data access)
├── sections/         CategorySection + CategoryIntro (Server Components)
├── types/            Presentation-layer type definitions
└── menu-engine.tsx   Root orchestrator (Server Component)
```

---

## Rendering Pipeline

```
MenuEngine (Server Component)
│
│  CategoryRepository.getVisible()
│  → sorts by displayOrder
│  → filters isVisible === true
│
├── CategoryNav (Client Component)
│   → receives: { id, name, slug }[] only
│   → single IntersectionObserver for all sections
│   → highlights active category on scroll
│
└── [categories].map → CategorySection (Server Component)
    │
    │  ProductRepository.getProductsForCategory(slug)
    │  resolveTheme(displayStyle)   → ThemeClasses
    │  resolveAnimation(preset)     → AnimationConfig
    │
    ├── CategoryIntro (Server Component)
    │   → editorial heading, description, accent
    │   → receives animationConfig from parent
    │
    └── LayoutEngine (Server Component)
         → LAYOUT_REGISTRY[layoutType]
         → Layout Component(products, themeClasses, animationConfig)
              → MotionWrapper (Client Component) per item
                   → ProductCard (Server Component)
```

---

## Engine Responsibilities

| Engine               | Responsibility                             | Type                    |
| -------------------- | ------------------------------------------ | ----------------------- |
| `LayoutEngine`       | Maps `layoutType` → Layout Component       | Server Component        |
| `ThemeEngine`        | Maps `displayStyle` → `ThemeClasses`       | Pure function           |
| `AnimationEngine`    | Maps `animationPreset` → `AnimationConfig` | Pure function           |
| `CategoryRepository` | Data access for category config            | Synchronous (API-ready) |
| `ProductRepository`  | Data access for product data               | Synchronous (API-ready) |

Each engine has **exactly one responsibility**. No engine has any knowledge of another engine's domain.

---

## Server vs Client Responsibilities

### Server Components (default)

Everything that does not require browser APIs or user interaction runs on the server:

- `MenuEngine` — root orchestrator
- `CategorySection` — per-category orchestrator
- `CategoryIntro` — editorial header
- `LayoutEngine` — layout dispatcher
- All six layout components
- `ProductCard` — product rendering

### Client Components (minimal, isolated)

Only two client boundaries exist in the entire engine:

| Component       | Why Client                                                        |
| --------------- | ----------------------------------------------------------------- |
| `CategoryNav`   | Needs `IntersectionObserver` to track active category             |
| `MotionWrapper` | Needs `IntersectionObserver` + `window.matchMedia` for animations |

---

## Data Flow

```
CATEGORIES array (config/categories.ts)
  ↓
CategoryRepository.getVisible()
  ↓ sorted by displayOrder, filtered by isVisible
MenuEngine
  ↓ config per category
CategorySection
  ↓ resolveTheme(config.displayStyle) → ThemeClasses
  ↓ resolveAnimation(config.animationPreset) → AnimationConfig
  ↓
ProductRepository.getProductsForCategory(config.slug)
  ↓ products[]
LayoutEngine → Layout Component → MotionWrapper → ProductCard
```

---

## Configuration Flow

Every visual decision originates from `MenuCategoryConfig`:

```
MenuCategoryConfig.layoutType       → LayoutEngine → which layout renders
MenuCategoryConfig.displayStyle     → ThemeEngine  → which class set applies
MenuCategoryConfig.animationPreset  → AnimationEngine → how elements enter
MenuCategoryConfig.accentColor      → CSS custom property on <section>
MenuCategoryConfig.displayOrder     → CategoryRepository sort order
MenuCategoryConfig.isVisible        → CategoryRepository filter
```

No component contains hardcoded category-specific logic.

---

## Future Backend Flow

When the API is connected, only the repositories change:

```diff
// category-repository.ts
- function _source(): MenuCategoryConfig[] { return CATEGORIES; }
+ async function _source(): Promise<MenuCategoryConfig[]> {
+   const res = await fetch('/api/categories', { next: { revalidate: 60 } });
+   return res.json();
+ }
```

**The rendering pipeline — engines, layouts, sections, components — requires zero modification.**

---

## Future Admin Flow

The Admin panel will update business properties via the API:

```
Admin Panel → PATCH /api/categories/:id
  → { displayOrder, isVisible, isFeatured, featuredOnHome, name, description }

Customer app → CategoryRepository.getVisible()
  → fetches updated data → renders automatically
```

Design-system properties (`layoutType`, `displayStyle`, `animationPreset`) remain developer-controlled and are not exposed to the Admin panel.

---

## Frozen Architecture

> **The architecture documented in this directory is considered stable.**

The following principles govern future development:

1. **Build within the existing architecture.** New features — additional categories, product variants, image galleries, search — should be implemented using the existing engines, registries, and repositories. No new abstractions should be introduced unless a real feature demonstrates a genuine limitation.

2. **Architectural changes require justification.** A proposed structural change must identify a concrete limitation in the current design, not a theoretical improvement. Premature abstraction is a form of technical debt.

3. **The current architecture is designed for incremental, multi-year growth.** The registry pattern, repository abstraction, and engine separation were chosen specifically to allow the project to grow without requiring structural refactoring.

4. **When in doubt, keep it simple.** The goal of this project is a premium menu experience for bakery customers. Every engineering decision should serve that goal directly or indirectly.
