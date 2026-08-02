# ADR-009 — Future Admin Panel Integration

**Status:** Accepted (Design Decision for Future Sprint)  
**Date:** 2026-07-31  
**Author:** Engineering

---

## Context

The Admin panel will be built in a future sprint. It will allow bakery staff to manage the menu without requiring engineering involvement for routine changes. The customer application must be designed so that Admin panel changes are reflected immediately — without code changes or redeployments.

The Admin panel should allow management of business content. It should not expose design-system decisions.

---

## Decision

The customer application is designed to be **fully Admin-compatible without architectural changes**. The integration requires changes to only the repository layer and the Next.js revalidation strategy.

### What the Admin can control

| Field            | Effect in Customer App                                   |
| ---------------- | -------------------------------------------------------- |
| `displayOrder`   | Changes category sequence in `MenuEngine`                |
| `isVisible`      | Hides/shows category across the entire experience        |
| `isFeatured`     | Used by `CategoryRepository.getFeatured()`               |
| `featuredOnHome` | Used by `CategoryRepository.getFeaturedOnHome()`         |
| `name`           | Updated everywhere the category name appears             |
| `slug`           | Requires care — affects URLs (see Future Considerations) |
| `description`    | Updated in `CategoryIntro`                               |
| `coverImage`     | Used as the category hero image                          |
| `heroProductId`  | Resolves via `ProductRepository.getHeroProduct()`        |

### What the Admin cannot control

| Field             | Reason                                                                  |
| ----------------- | ----------------------------------------------------------------------- |
| `layoutType`      | Design-system decision; visual consistency requires developer oversight |
| `displayStyle`    | Design-system decision                                                  |
| `animationPreset` | Design-system decision                                                  |
| `scrollBehavior`  | Design-system decision                                                  |
| `accentColor`     | Design-system decision (could be exposed in future with validation)     |

### Integration Architecture

```
Admin Panel (apps/admin)
  ↓ PATCH /api/categories/:id { displayOrder, isVisible, ... }

API (apps/api — future)
  ↓ Updates database (PostgreSQL via Prisma)
  ↓ Triggers Next.js on-demand revalidation

Customer App
  ↓ CategoryRepository.getVisible() fetches updated data
  ↓ Page re-renders with new content within one revalidation cycle
```

**On-demand revalidation** (Next.js `revalidateTag` or `revalidatePath`) is preferred over time-based ISR for Admin changes. This allows changes to appear instantly after the Admin saves, without waiting for a cache expiry window.

---

## Rationale

**The rendering pipeline is already Admin-compatible.**  
Every category-specific rendering decision is derived from config, not hardcoded. Changing `displayOrder` from 1 to 5 in the database will cause `CategoryRepository.getVisible()` to return categories in the new order. `MenuEngine` will render them in the new order. No component changes.

**Repository isolation is the key.**  
The Admin integration requires changing `_source()` in `CategoryRepository` from a static array read to a `fetch()` call. The 5 lines that change are documented in the repository file itself:

```ts
// category-repository.ts (future)
async function _source(): Promise<MenuCategoryConfig[]> {
  const res = await fetch(`${process.env.API_URL}/categories`, {
    next: { tags: ['categories'] },
  });
  return res.json();
}
```

`MenuEngine` and every downstream component are unchanged.

**Design-system fields remain developer-controlled.**  
This is a deliberate product decision. `layoutType` and `displayStyle` are chosen by the design team to match each category's personality. Exposing these to the Admin risks visual inconsistency — a staff member could accidentally assign an incompatible layout or theme. If this restriction needs to change in the future, it can be relaxed with appropriate UI validation in the Admin panel.

---

## Alternatives Considered

**Alternative A: Store all config (including layout type) in the database.**  
Viable but requires careful Admin UI design to prevent invalid combinations (e.g., `spotlight` layout assigned to a category with only 1 product). The current separation — business fields in DB, design fields in code — is safer and simpler for now.

**Alternative B: Webhook-triggered redeployment instead of ISR.**  
Rejected. Redeployment takes minutes. ISR or on-demand revalidation takes seconds. For a live menu, redeployment latency is unacceptable.

**Alternative C: Admin panel directly modifies `config/categories.ts` via a Git commit.**  
Rejected. A Git-based CMS is appropriate for infrequently changing content, not for day-to-day menu management.

---

## Trade-offs

| Trade-off                                                                 | Accepted Because                                                  |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Design-system fields not editable by Admin                                | Prevents visual inconsistency; can be relaxed later               |
| `slug` changes require URL redirect planning                              | This is an application-layer concern, not an architecture concern |
| On-demand revalidation requires API to call Next.js revalidation endpoint | This is standard Next.js practice; the pattern is well-documented |

---

## Consequences

- The Admin panel can be built independently of the customer app.
- The customer app will display Admin panel changes after on-demand revalidation.
- The Admin API only needs to expose the business fields listed above.
- Category drag-and-drop reordering in the Admin panel writes `displayOrder` values. The customer app automatically reflects the new order.

---

## Future Considerations

- **Slug changes:** If a category slug is changed, existing URLs (e.g., `/categories/falooda`) will 404. The admin should be warned, and 301 redirects should be created via `next.config.ts` redirects or a database-backed redirect table.
- **Product ordering:** `displayOrder` on `MenuProduct` (equivalent field in the product entity) will be managed via the Admin panel in a future sprint. `ProductRepository.getProductsForCategory()` will sort by this field.
- **Real-time preview:** The Admin panel may offer a preview mode that renders the customer app in an iframe with draft content. This could be implemented using Next.js Draft Mode.
