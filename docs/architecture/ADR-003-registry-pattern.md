# ADR-003 — Registry Pattern for Engines

**Status:** Accepted  
**Date:** 2026-07-31  
**Author:** Engineering

---

## Context

The Menu Experience Engine needs to dispatch to multiple implementations of the same concept: multiple layout components, multiple visual themes, multiple animation presets. The naive implementation for each is a `switch` statement.

As the project grows, new layouts, themes, and animations will be added. The question is how to make these additions safe, predictable, and isolated.

---

## Decision

All three engines — `LayoutEngine`, `ThemeEngine`, and `AnimationEngine` — use a **registry pattern** instead of `switch` statements.

A registry is a plain object that maps a typed key to a value:

```ts
// Layout registry example
const LAYOUT_REGISTRY: Record<LayoutType, LayoutComponent> = {
  'editorial-grid': EditorialGrid,
  'magazine-split': MagazineSplit,
  'spotlight': Spotlight,
  // ...
};

// Resolution
const Layout = LAYOUT_REGISTRY[layoutType] ?? DEFAULT_LAYOUT;
return <Layout {...props} />;
```

The same pattern applies to theme and animation registries, where values are configuration objects rather than components.

---

## Rationale

**Open/Closed Principle.**  
With a `switch` statement, adding a new layout requires modifying the `LayoutEngine` function body — opening existing, tested code to modification. With a registry, adding a new layout requires only:

1. Creating the new layout component.
2. Adding an entry to `LAYOUT_REGISTRY`.

The `LayoutEngine` function itself is never modified.

**TypeScript exhaustiveness is enforced by the registry type.**  
`Record<LayoutType, LayoutComponent>` guarantees that every value in the `LayoutType` union has a registered implementation. If a developer adds `'masonry'` to the union but forgets to register it, TypeScript raises a compile error. A `switch` statement with a `default` case silently hides missing implementations.

**Registries are inspectable.**  
At any point, a developer can look at `LAYOUT_REGISTRY` and see every registered layout in one place. A `switch` statement buries this same information inside a function body mixed with dispatch logic.

**Fallback behavior is explicit.**

```ts
const Layout = LAYOUT_REGISTRY[layoutType] ?? DEFAULT_LAYOUT;
```

This single line defines the fallback. With a `switch` default case, fallback and dispatch logic are interleaved.

---

## Alternatives Considered

**Alternative A: `switch` statement.**  
Rejected. Requires editing engine logic to add new entries. Does not leverage TypeScript's type system for exhaustiveness checking. Mixes dispatch logic with implementation references.

**Alternative B: Dynamic `import()` per layout at the registry level.**  
Not implemented now, but the registry structure supports this future change without modifying the public `LayoutEngine` API. Each registry entry can be wrapped in `React.lazy()` independently.

**Alternative C: A class hierarchy with a factory pattern.**  
Rejected as over-engineering for this use case. Plain objects and pure functions are sufficient and more readable.

---

## Trade-offs

| Trade-off                                                         | Accepted Because                                                                                         |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| All layouts are eagerly imported at module load                   | For the current category count this is negligible; lazy loading can be added to the registry when needed |
| New layout type requires updating the union type AND the registry | The union type update is desirable — it triggers TypeScript to enforce the registry entry                |

---

## Consequences

- The `LayoutType`, `DisplayStyle`, and `AnimationPreset` union types are the authoritative list of supported values.
- Adding a new layout: add to union → add to `LAYOUT_REGISTRY` → done. `LayoutEngine` unchanged.
- Adding a new theme: add to union → add to `THEME_REGISTRY` → done. `ThemeEngine` unchanged.
- Adding a new animation: add to union → add to `ANIMATION_REGISTRY` → done. `AnimationEngine` unchanged.
- TypeScript will catch missing registry entries at compile time.

---

## Future Considerations

- When the category count grows significantly, layout components can be lazily loaded by wrapping registry entries in `React.lazy()`. The public `LayoutEngine` API — `{ layoutType, products, themeClasses, animationConfig }` — does not change.
- A future Admin panel could theoretically allow selection of `layoutType` and `displayStyle` per category. Since these values are typed string literals, the Admin API can validate against the registered set.
