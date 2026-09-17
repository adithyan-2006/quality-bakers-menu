'use client';

import * as React from 'react';

const STORAGE_KEY = 'qbm_liked_products';
const ANONYMOUS_USER_ID_KEY = 'qbm_anonymous_user_id';
const LIKES_CHANGED_EVENT = 'qbm_likes_changed';

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
  // Lazy initializer: reads localStorage once on mount (SSR-safe — getLocalLikedMap returns {} on server).
  const [isLiked, setIsLiked] = React.useState<boolean>(() => {
    const map = getLocalLikedMap();
    return Boolean(map[productId]);
  });
  const [globalLikeCount, setGlobalLikeCount] = React.useState<number | null>(
    initialGlobalCount ?? null,
  );
  const [isLoading, setIsLoading] = React.useState(false);
  // Lazy initializer: on the client, starts hydrated immediately (localStorage was already read above).
  // On the server, starts false since window is undefined. setIsHydrated is never called after mount.
  const [isHydrated] = React.useState<boolean>(() => typeof window !== 'undefined');

  // Refs always shadow the latest committed values — updated only inside effects and callbacks,
  // never during render, to satisfy react-hooks/react-compiler constraints.
  const isLikedRef = React.useRef(false);
  const globalLikeCountRef = React.useRef<number | null>(initialGlobalCount ?? null);

  const abortControllerRef = React.useRef<AbortController | null>(null);
  const requestIdRef = React.useRef(0);
  const hookInstanceId = React.useId();

  // Register cross-card/tab sync listeners.
  React.useEffect(() => {
    // Seed the isLiked ref from the lazy-initialized state value on mount
    isLikedRef.current = isLiked;
    globalLikeCountRef.current = globalLikeCount;

    const syncState = (e?: Event) => {
      // Check if custom event with detail for this product
      if (e instanceof CustomEvent && e.detail && e.detail.productId === productId) {
        if (e.detail.senderId && e.detail.senderId === hookInstanceId) {
          return;
        }
        if (typeof e.detail.isLiked === 'boolean') {
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
      isLikedRef.current = updatedLiked;
      setIsLiked(updatedLiked);
    };

    window.addEventListener(LIKES_CHANGED_EVENT, syncState);
    window.addEventListener('storage', syncState);

    return () => {
      window.removeEventListener(LIKES_CHANGED_EVENT, syncState);
      window.removeEventListener('storage', syncState);
    };
    // isLiked and globalLikeCount are intentionally excluded from the dep array:
    // we only seed refs on mount, not on every state change (which would re-register listeners).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, hookInstanceId]);

  const toggleLike = React.useCallback(async () => {
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
