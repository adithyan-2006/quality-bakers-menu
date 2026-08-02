# ADR-004 — Repository Layer

**Status:** Accepted  
**Date:** 2026-07-31  
**Author:** Engineering

---

## Context

The Menu Experience Engine requires access to two types of data: category configuration and product data. Initially, both come from static TypeScript arrays in `config/categories.ts`. A backend API will be introduced in a later sprint.

The question is how to structure data access so that the rendering pipeline does not depend on whether data comes from a file, a database, or an external API.

---

## Decision

Introduce a **repository layer** that abstracts all data access behind stable method contracts:

```
features/menu/repository/
├── category-repository.ts
└── product-repository.ts
```

`CategoryRepository` exposes: `getAll()`, `getVisible()`, `getFeatured()`, `getFeaturedOnHome()`, `getBySlug()`, `getById()`

`ProductRepository` exposes: `getProductsForCategory()`, `getHeroProduct()`, `getFeaturedProducts()`

`MenuEngine` and `CategorySection` call these methods. They never import from `config/categories.ts` directly.

---

## Rationale

**The rendering pipeline must not know where data comes from.**  
If `MenuEngine` imports directly from `config/categories.ts`, then migrating to an API requires modifying `MenuEngine`. The repository layer means `MenuEngine` calls `CategoryRepository.getVisible()` — a stable method that can be backed by any data source.

**The API migration is a one-file change per repository.**  
When the backend is ready:

```ts
// Before
function _source(): MenuCategoryConfig[] {
  return CATEGORIES;
}

// After
async function _source(): Promise<MenuCategoryConfig[]> {
  const res = await fetch('/api/categories', { next: { revalidate: 60 } });
  return res.json();
}
```

`MenuEngine`, `CategorySection`, all layouts, and all components are unaffected.

**Data transformation is centralized.**  
The `_sortByOrder()` helper exists in one place. Category visibility filtering exists in one place. When the sort or filter logic needs to change, there is exactly one place to change it.

**Repositories act as a stable contract for testing.**  
When unit tests are introduced, test utilities can mock `CategoryRepository.getVisible()` without affecting any other module. The rendering pipeline tests against the repository interface, not the underlying data format.

---

## Alternatives Considered

**Alternative A: Import config directly in each component.**  
Rejected. Creates tight coupling between rendering code and data format. Every component that imports the config directly must be updated when the data source changes.

**Alternative B: React Context for data distribution.**  
Rejected. Context introduces client-side state management where server-side data access is more appropriate. Server Components can call repository methods directly without a provider tree.

**Alternative C: Next.js `generateStaticParams` with file-based data.**  
Considered for product detail pages. The repository pattern is compatible with this approach — `generateStaticParams` will call `CategoryRepository.getAll()` to enumerate categories.

---

## Trade-offs

| Trade-off                                                       | Accepted Because                                                                                     |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Extra indirection layer                                         | The indirection cost is one import; the decoupling benefit is permanent                              |
| `as const` on repository objects prevents class-based extension | The repositories have no state and need no inheritance; `as const` is appropriate                    |
| Both repositories are synchronous today                         | The method signatures are already documented to become async; the transition is a single-file change |

---

## Consequences

- `MenuEngine` and all rendering components are completely decoupled from the data source.
- The API migration requires changes to `category-repository.ts` and `product-repository.ts` only.
- Sort order (`displayOrder`), visibility (`isVisible`), and featured state are all enforced at the repository level — not in components.
- Future repositories (e.g., `SearchRepository`, `AnalyticsRepository`) follow the same pattern.

---

## Future Considerations

- When the backend API ships, repository methods become `async`. `MenuEngine` and `CategorySection` become `async` Server Components. This is a supported pattern in Next.js App Router with no architectural changes.
- A `SearchRepository` will be introduced when the search feature is built. It will follow the identical pattern.
- The `ProductRepository.getHeroProduct()` method supports the `heroProductId` field in `MenuCategoryConfig` — when real products exist, this will resolve to the specific product a category owner has designated as the feature item.
