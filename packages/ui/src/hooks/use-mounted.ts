import { useState, useEffect } from 'react';

/**
 * Hook to check if component has mounted on the client.
 * Intended to be used to prevent hydration mismatches during SSR.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
