import { z } from 'zod';
import { PAGINATION_CONFIG, SEARCH_CONFIG } from '@qbm/config';

/** 
 * Schema for pagination parameters (e.g., query strings).
 * Coerces URL strings to numbers safely.
 * Intended for API query parameter validation.
 */
export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(PAGINATION_CONFIG.MAX_LIMIT, `Limit cannot exceed ${PAGINATION_CONFIG.MAX_LIMIT}`)
    .default(PAGINATION_CONFIG.DEFAULT_LIMIT),
}).strict();

/** 
 * Schema for search query parameters.
 * Intended for API query parameter validation.
 */
export const SearchSchema = z.object({
  q: z
    .string()
    .min(SEARCH_CONFIG.MIN_QUERY_LENGTH, `Search query must be at least ${SEARCH_CONFIG.MIN_QUERY_LENGTH} characters`)
    .max(SEARCH_CONFIG.MAX_QUERY_LENGTH, `Search query cannot exceed ${SEARCH_CONFIG.MAX_QUERY_LENGTH} characters`)
    .optional(),
}).strict();

/** 
 * Schema for sort parameters.
 * Intended for API query parameter validation.
 */
export const SortSchema = z.object({
  sortBy: z.string().min(1).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
}).strict();

/** 
 * Reusable base query schema combining pagination, search, and sorting.
 * Intended to be extended by entity-specific query schemas.
 */
export const BaseQuerySchema = PaginationSchema.merge(SearchSchema).merge(SortSchema).strict();
