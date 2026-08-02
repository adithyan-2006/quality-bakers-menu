# ADR-002 — Server-First Rendering Strategy

**Status:** Accepted  
**Date:** 2026-07-31  
**Author:** Engineering

---

## Context

The customer application serves users who arrive via QR code on mobile devices in a real bakery environment. Mobile network conditions are variable, and device hardware ranges widely.

The content of this application — category headings, descriptions, product names — is not user-specific. It is shared across all visitors. It does not change per request.

Next.js 15 with the App Router supports React Server Components (RSC), which allow components to run on the server and ship zero JavaScript to the client.

---

## Decision

**All components are Server Components by default.** Client Components are introduced only when a component requires browser-only APIs (`IntersectionObserver`, `window.matchMedia`) or stateful interactivity.

The current client component boundary is limited to two components in the entire engine:

| Client Component | Browser API Required                                             |
| ---------------- | ---------------------------------------------------------------- |
| `CategoryNav`    | `IntersectionObserver` (scroll tracking), `Element.scrollTo`     |
| `MotionWrapper`  | `IntersectionObserver` (viewport detection), `window.matchMedia` |

All other components — `MenuEngine`, `CategorySection`, `CategoryIntro`, `LayoutEngine`, all layout components, and `ProductCard` — are Server Components.

---

## Rationale

**Time-to-content is the most important performance metric for QR code users.**  
A customer scanning a QR code is standing in the bakery, waiting to see the menu. Every millisecond of delay before the menu is visible erodes the experience. Server-rendered HTML arrives before any JavaScript executes, making the content immediately readable.

**The menu is public content — server rendering is the correct model.**  
Unlike a user dashboard, the menu is identical for every visitor. Server rendering means this content can be statically generated at build time (or incrementally regenerated with ISR), eliminating server computation per request entirely.

**JavaScript bundle size directly impacts mobile performance.**  
Each Client Component increases the JavaScript that must be parsed and executed before the page is interactive. With only two client boundaries in the engine, the interactive payload is minimal. The `first load JS` for `/categories` is approximately 121 kB, of which 99 kB is Next.js framework code shared by all routes. The menu engine itself adds approximately 2 kB of client JavaScript.

**Server Components allow direct data access without an API layer.**  
Server Components can read from files, environment variables, or databases directly. During the current static phase, `CategoryRepository` reads from a config array with zero network overhead.

---

## Alternatives Considered

**Alternative A: Client-side rendering (CSR) with a useEffect data fetch.**  
Rejected. Requires an extra round-trip after the page loads. The menu would be blank until JavaScript runs and the fetch completes — unacceptable for a QR code use case.

**Alternative B: Full SSR (getServerSideProps pattern).**  
Rejected. Per-request server rendering is unnecessary for content that does not change per user. Static generation is superior.

**Alternative C: Use Client Components for all menu content to simplify state management.**  
Rejected. The menu has no per-user state. Client Components would add bundle weight with no benefit.

---

## Trade-offs

| Trade-off                                            | Accepted Because                                                              |
| ---------------------------------------------------- | ----------------------------------------------------------------------------- |
| Engineers must understand RSC boundary rules         | Investment in understanding is one-time; the performance benefit is permanent |
| `"use client"` directive requires deliberate thought | Forces correct architecture decisions at component creation time              |
| Some third-party libraries do not support RSC        | The engine uses no third-party UI libraries inside server components          |

---

## Consequences

- New components should be Server Components by default.
- Before adding `"use client"`, the developer must confirm the component genuinely requires browser APIs or interactivity.
- Animation libraries (e.g., Framer Motion) must be wrapped in isolated client boundaries — never imported into server component trees.
- When the API is connected, data fetching moves into repository methods using `fetch()` with Next.js caching — no component architecture changes required.

---

## Future Considerations

- When `CategoryRepository` becomes async, `MenuEngine` and `CategorySection` will be `async` Server Components. This is supported natively and requires no architectural change.
- If a category requires a client-side interactive product configurator (e.g., flavour selection), that specific sub-component will be a Client Component, isolated within the otherwise server-rendered `CategorySection`.
- ISR (`export const revalidate = 60`) will be added to `app/categories/page.tsx` at the same time the Admin API is connected, ensuring category changes appear within 60 seconds without a deployment.
