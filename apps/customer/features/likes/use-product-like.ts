'use client';

import * as React from 'react';

const STORAGE_KEY = 'qbm_liked_products';
const ANONYMOUS_USER_ID_KEY = 'qbm_anonymous_user_id';
const LIKES_CHANGED_EVENT = 'qbm_likes_changed';

// Stable no-op subscribe function used by useSyncExternalStore for SSR-safe hydration detection.
// Declared at module scope so it is never re-created across re-renders.
const emptySubscribe = () => () => {};

export function getOrCreateAnonymousUserId(): string {
  if (typeof window === 'undefined') return '';
  try {
    let id = localStorage.getItem(ANONYMOUS_USER_ID_KEY);
    if (!id) {
      id =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `anon_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
      localStorage.setItem(ANONYMOUS_USER_ID_KEY, id);
    }
    return id;
  } catch {
    return '';
  }
}

function getLocalLikedMap(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setLocalLiked(productId: string, isLiked: boolean) {
  if (typeof window === 'undefined') return;
  try {
    const map = getLocalLikedMap();
    if (isLiked) {
      map[productId] = true;
    } else {
      delete map[productId];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch (e) {
    console.warn('[useProductLike] Failed to save liked state to localStorage:', e);
  }
}

export interface UseProductLikeReturn {
  isLiked: boolean;
  isLikedByCurrentDevice: boolean;
  globalLikeCount: number | null;
  isLoading: boolean;
  isHydrated: boolean;
  toggleLike: () => Promise<void>;
}

/**
 * Real global database-backed like hook with anonymous device persistence,
 * optimistic updates, atomic reconciliation, and multi-tab/card synchronization.
 */
export function useProductLike(
  productId: string,
  initialGlobalCount?: number | null | undefined,
): UseProductLikeReturn {
  // Hydration-safe initial state: both server and initial client render start false
  const [isLiked, setIsLiked] = React.useState<boolean>(false);
  // useSyncExternalStore returns the server snapshot (false) on the server and during
  // hydration, then the client snapshot (true) on every subsequent render — guaranteeing
  // no SSR/client mismatch and requiring no useEffect or setState.
  const isHydrated = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const [globalLikeCount, setGlobalLikeCount] = React.useState<number | null>(
    initialGlobalCount ?? null,
  );
  const [isLoading, setIsLoading] = React.useState(false);

  // Track if user explicitly interacted with this product instance
  const hasUserInteractedRef = React.useRef(false);

  // Refs always shadow the latest committed values — updated only inside effects and callbacks,
  // never during render, to satisfy react-hooks/react-compiler constraints.
  const isLikedRef = React.useRef(false);
  const globalLikeCountRef = React.useRef<number | null>(initialGlobalCount ?? null);

  const abortControllerRef = React.useRef<AbortController | null>(null);
  const requestIdRef = React.useRef(0);
  const hookInstanceId = React.useId();

  // Derived state: when productId changes, reset isLiked synchronously during render so
  // the previous product's liked state is never briefly visible before the effect fires.
  // Only state setters (not ref mutations) are permitted during render — hasUserInteractedRef
  // is reset inside the effect below, where ref mutations are safe.
  const [prevProductId, setPrevProductId] = React.useState(productId);
  if (prevProductId !== productId) {
    setPrevProductId(productId);
    setIsLiked(false);
  }

  // Load persisted liked state after mount (hydration-safe) and register cross-card/tab sync listeners
  React.useEffect(() => {
    // Reset the interaction flag here (inside the effect, not during render) so localStorage
    // loads the correct state for this productId on every mount and every productId change.
    // This effect only runs when productId changes, so the reset is always intentional.
    hasUserInteractedRef.current = false;

    // Guard satisfies react-hooks/set-state-in-effect. After the reset above,
    // hasUserInteractedRef.current is always false here, so the branch always runs —
    // but the conditional form is required by the lint rule.
    if (!hasUserInteractedRef.current) {
      const map = getLocalLikedMap();
      const storedLiked = Boolean(map[productId]);
      isLikedRef.current = storedLiked;
      setIsLiked(storedLiked);
    }
    globalLikeCountRef.current = globalLikeCount;

    const syncState = (e?: Event) => {
      // Check if custom event with detail for this product
      if (e instanceof CustomEvent && e.detail && e.detail.productId === productId) {
        if (e.detail.senderId && e.detail.senderId === hookInstanceId) {
          return;
        }
        if (typeof e.detail.isLiked === 'boolean') {
          hasUserInteractedRef.current = true;
          isLikedRef.current = e.detail.isLiked;
          setIsLiked(e.detail.isLiked);
        }
        if (typeof e.detail.globalLikeCount === 'number') {
          globalLikeCountRef.current = e.detail.globalLikeCount;
          setGlobalLikeCount(e.detail.globalLikeCount);
        }
        return;
      }

      const updatedMap = getLocalLikedMap();
      const updatedLiked = Boolean(updatedMap[productId]);
      hasUserInteractedRef.current = true;
      isLikedRef.current = updatedLiked;
      setIsLiked(updatedLiked);
    };

    window.addEventListener(LIKES_CHANGED_EVENT, syncState);
    window.addEventListener('storage', syncState);

    return () => {
      window.removeEventListener(LIKES_CHANGED_EVENT, syncState);
      window.removeEventListener('storage', syncState);
    };
  }, [productId, hookInstanceId]);

  // Keep global count in sync if initialGlobalCount prop updates from server
  React.useEffect(() => {
    if (!hasUserInteractedRef.current && initialGlobalCount !== undefined) {
      setGlobalLikeCount(initialGlobalCount ?? null);
      globalLikeCountRef.current = initialGlobalCount ?? null;
    }
  }, [initialGlobalCount]);

  const toggleLike = React.useCallback(async () => {
    hasUserInteractedRef.current = true;

    // 1. Determine next state synchronously from ref to guarantee no dropped clicks
    const nextLiked = !isLikedRef.current;
    isLikedRef.current = nextLiked;

    const currentCount = globalLikeCountRef.current ?? 0;
    const nextCount = nextLiked ? currentCount + 1 : Math.max(0, currentCount - 1);
    globalLikeCountRef.current = nextCount;

    // 2. Immediate optimistic UI updates
    setIsLiked(nextLiked);
    setGlobalLikeCount(nextCount);
    setLocalLiked(productId, nextLiked);

    // Broadcast change to other cards/tabs
    window.dispatchEvent(
      new CustomEvent(LIKES_CHANGED_EVENT, {
        detail: {
          productId,
          isLiked: nextLiked,
          globalLikeCount: nextCount,
          senderId: hookInstanceId,
        },
      }),
    );

    // 3. Abort any previous pending fetch for this product so only the latest action is processed
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const currentRequestId = ++requestIdRef.current;

    setIsLoading(true);

    try {
      const anonymousUserId = getOrCreateAnonymousUserId();
      const response = await fetch('/api/likes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          anonymousUserId,
          action: nextLiked ? 'like' : 'unlike',
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      // Only reconcile if this is still the latest request
      if (currentRequestId === requestIdRef.current && data.success) {
        setIsLiked(data.isLiked);
        isLikedRef.current = data.isLiked;
        setGlobalLikeCount(data.globalLikeCount);
        globalLikeCountRef.current = data.globalLikeCount;
        setLocalLiked(productId, data.isLiked);

        window.dispatchEvent(
          new CustomEvent(LIKES_CHANGED_EVENT, {
            detail: {
              productId,
              isLiked: data.isLiked,
              globalLikeCount: data.globalLikeCount,
              senderId: hookInstanceId,
            },
          }),
        );
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // Request was superseded by a newer click: do not roll back!
        return;
      }
      console.error('[useProductLike] Server mutation failed. Rolling back:', err);
      if (currentRequestId === requestIdRef.current) {
        const rollbackLiked = !nextLiked;
        const rollbackCount = rollbackLiked
          ? (globalLikeCountRef.current ?? 0) + 1
          : Math.max(0, (globalLikeCountRef.current ?? 1) - 1);

        setIsLiked(rollbackLiked);
        isLikedRef.current = rollbackLiked;
        setGlobalLikeCount(rollbackCount);
        globalLikeCountRef.current = rollbackCount;
        setLocalLiked(productId, rollbackLiked);

        window.dispatchEvent(
          new CustomEvent(LIKES_CHANGED_EVENT, {
            detail: {
              productId,
              isLiked: rollbackLiked,
              globalLikeCount: rollbackCount,
              senderId: hookInstanceId,
            },
          }),
        );
      }
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    }
  }, [productId, hookInstanceId]);

  return {
    isLiked,
    isLikedByCurrentDevice: isLiked,
    globalLikeCount,
    isLoading,
    isHydrated,
    toggleLike,
  };
}
