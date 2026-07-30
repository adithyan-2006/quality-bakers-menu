/**
 * Environment configuration constants.
 * Intended to be used to validate allowed environment string values.
 */
export const ENV_CONFIG = {
  ALLOWED_ENVIRONMENTS: ['development', 'test', 'production'],
} as const;
