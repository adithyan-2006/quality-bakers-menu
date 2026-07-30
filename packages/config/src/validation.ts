/**
 * Shared validation constants used by Zod schemas and UI forms.
 * Intended to be used by @qbm/validators, API payloads, and frontend form inputs.
 */
export const VALIDATION_CONFIG = {
  CATEGORY_NAME_MIN_LENGTH: 2,
  CATEGORY_NAME_MAX_LENGTH: 100,
  CATEGORY_DESCRIPTION_MAX_LENGTH: 500,
  PRODUCT_NAME_MIN_LENGTH: 2,
  PRODUCT_NAME_MAX_LENGTH: 100,
  PRODUCT_DESCRIPTION_MAX_LENGTH: 1000,
  PRICE_MIN: 0.01,
  PRICE_MAX: 10000.00,
  PRICE_DECIMAL_PRECISION: 2,
  PASSWORD_MIN_LENGTH: 12,
  PASSWORD_MAX_LENGTH: 128,
} as const;
