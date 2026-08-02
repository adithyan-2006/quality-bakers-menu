# ADR-010 — Long-Term Roadmap

**Status:** Accepted  
**Date:** 2026-07-31  
**Author:** Engineering

---

## Context

This document describes the planned evolution of the Quality Bakers Menu system beyond Sprint 2. It is intended to help future contributors understand how new features should be introduced within the existing architecture.

This is a roadmap, not a specification. Individual features will be designed in detail when they are scheduled.

---

## Planned Evolutions

### 1. API Integration

**Trigger:** Admin panel sprint begins.

**Changes required:**

- `CategoryRepository._source()` → async `fetch()` call
- `ProductRepository` methods → async `fetch()` calls
- `MenuEngine` and `CategorySection` → `async` Server Components
- `app/categories/page.tsx` → `export const revalidate = 60` or on-demand revalidation via `revalidateTag`

**Architecture impact:** None. The rendering pipeline is already designed for this transition.

---

### 2. Product Management

**Trigger:** Admin panel can create, edit, and reorder products.

**Changes required:**

- `ProductRepository.getProductsForCategory()` → fetches from API sorted by `sortOrder`
- `ProductCard` → replaces placeholder `div` with real `next/image`
- `MenuProduct` type → may gain `images[]`, `variants[]`, `allergens[]`

**Architecture impact:** None. `ProductCard` is already isolated. Layout components already receive `MenuProduct[]` without caring about its shape beyond the current fields.

**Note on pricing:** The customer application intentionally does not display prices. This is a product decision. The `MenuProduct` type does not include a `price` field. If pricing is introduced in future, it should be added to a separate type or a `PricedMenuProduct` extension.

---

### 3. Image Management

**Trigger:** Real product images are available from the Admin panel.

**Changes required:**

- `ProductCard` → replace placeholder `<div>` with `<Image src={product.image} alt={product.name} fill />` from `next/image`
- Layout components that render their own image wrappers (`Spotlight`, `GalleryWall`, `MagazineSplit`) → replace `<div className="bg-muted">` with `<Image>`
- Upload infrastructure (S3 or equivalent) required on the backend

**Architecture impact:** None. Image slots are already designed as isolated `<div>` blocks with clear `// Image placeholder` comments. The migration is a find-and-replace within each layout.

**Performance note:** `next/image` handles `srcset`, WebP conversion, and lazy loading automatically. The `priority` prop on `ProductCard` is already defined for above-the-fold items.

---

### 4. Performance Optimization

**Trigger:** Real user traffic data is available.

**Planned optimizations:**

- **ISR:** `export const revalidate = 60` on the categories page ensures cache is fresh without per-request computation.
- **On-demand revalidation:** `revalidatePath('/categories')` called by the Admin API after a change ensures instant updates.
- **Image optimization:** `next/image` handles this automatically once real images are used.
- **Font optimization:** Already implemented via `next/font` (`Inter`, `Playfair Display`).
- **Layout components as lazy-loaded:** `LAYOUT_REGISTRY` entries can be wrapped in `React.lazy()` when the category count grows significantly.

---

### 5. Premium Scroll Interactions (Level 2 Animations)

**Trigger:** Design team requests immersive editorial scroll effects for flagship categories.

**Implementation:**

- Create `features/menu/sections/premium-scroll-section.tsx`
- Use `next/dynamic(() => import('./premium-scroll-section'), { ssr: false })`
- Import and isolate Framer Motion within this component
- `CategorySection` reads `config.scrollBehavior === 'immersive'` and renders `PremiumScrollSection` instead of `LayoutEngine`

**Architecture impact:** None. `scrollBehavior` is already in `MenuCategoryConfig`. The integration point in `CategorySection` is documented. The main bundle is unaffected.

---

### 6. Search and Filtering

**Trigger:** User research shows that QR code users want to search by name or browse by ingredient.

**Implementation:**

- `apps/customer/app/search/page.tsx` already scaffolded
- `SearchRepository` (following the same pattern as `CategoryRepository`) will expose `search(query: string): MenuProduct[]`
- Today this filters placeholder data; with API, it calls `GET /api/products?q=...`
- The search page uses the same `ProductCard` component from `features/menu/product/product-card.tsx`

**Architecture impact:** None. The search feature reuses existing components and introduces one new repository.

---

### 7. Analytics

**Trigger:** Business wants to understand which categories and products are most viewed.

**Implementation:**

- Analytics events are a client-side concern and live in isolated client components
- Page view tracking: Next.js middleware or a wrapper in `app/layout.tsx`
- Product card click tracking: `ProductCard` can be wrapped in a client `AnalyticsLink` component that fires an event before navigation
- Category scroll depth: `CategoryNav`'s existing `activeSlug` state can emit events

**Architecture impact:** None. Analytics is additive. No existing Server Components are affected.

---

### 8. Multi-Language Support

**Trigger:** The bakery expands to serve non-English-speaking customers.

**Implementation:**

- Next.js App Router supports locale-based routing (`/en/categories`, `/ar/categories`)
- `MenuCategoryConfig` fields `name` and `description` become locale-keyed objects in the database: `{ en: 'Falooda', ar: 'فالوده' }`
- `CategoryRepository.getVisible()` accepts a `locale` parameter and returns localized strings
- The rendering pipeline consumes `string` — the localization layer sits entirely in the repository
- `next-intl` or equivalent handles `useTranslations()` in client components

**Architecture impact:** Minimal. Repository method signatures gain an optional `locale` parameter. No rendering component changes.

---

### 9. Category Detail Pages (`/categories/[slug]`)

**Trigger:** Sprint 2 continuation.

**Implementation:**

- `app/categories/[slug]/page.tsx` already scaffolded
- `CategoryRepository.getBySlug(slug)` already implemented
- `ProductRepository.getProductsForCategory(slug)` already implemented
- `generateStaticParams()` calls `CategoryRepository.getAll()` to enumerate slugs at build time
- The page renders a full `CategorySection` for the selected category

**Architecture impact:** None. All required methods already exist.

---

### 10. Product Detail Pages (`/products/[slug]`)

**Trigger:** Sprint 2 continuation.

**Implementation:**

- `app/products/[slug]/page.tsx` already scaffolded
- `ProductRepository` gains `getBySlug(slug): MenuProduct | undefined`
- The page renders a detailed product view — larger image, full description, allergens, ingredients
- `generateStaticParams()` enumerates all product slugs across all categories

**Architecture impact:** None. The repository pattern already anticipates this method.

---

## Architecture Stability Commitment

The architecture documented in this ADR set is designed to support all of the above features without structural refactoring. Each new feature:

1. Is **additive** — new files, new methods, new registry entries
2. Does not require **modifying existing rendering components**
3. Does not require **changing the public API** of any engine or repository
4. Follows the established patterns: **Server-first, configuration-driven, registry-based, repository-abstracted**

When a future feature cannot be implemented within this framework without significant friction, that friction is the signal to revisit the architecture with a specific, justified ADR.
