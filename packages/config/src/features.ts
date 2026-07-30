/**
 * Feature flags for toggling application capabilities.
 * Intended to be used conditionally in UI rendering and API logic.
 */
export const FEATURE_FLAGS = {
  ENABLE_SEARCH: true,
  ENABLE_ALLERGENS: true,
  ENABLE_NUTRITIONAL_INFO: false,
} as const;
