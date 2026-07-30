/**
 * Configuration for the search system.
 * Intended to be used by search endpoints and input validation.
 */
export const SEARCH_CONFIG = {
  MIN_QUERY_LENGTH: 3,
  MAX_QUERY_LENGTH: 100,
  DEFAULT_RESULTS_LIMIT: 10,
} as const;
