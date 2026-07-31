/**
 * Sort direction for queries.
 * Intended to be used in list/grid API queries.
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Query parameters for paginated requests.
 * Intended to be used by frontend clients requesting lists.
 */
export interface PaginationQuery {
  /** Page number, 1-indexed */
  page?: number;
  /** Number of items per page */
  limit?: number;
  /** Field to sort by */
  sortBy?: string;
  /** Direction to sort */
  sortOrder?: SortDirection;
}

/**
 * Metadata for paginated responses.
 * Intended to be used by UI pagination components.
 */
export interface PaginationMeta {
  /** Current page number */
  currentPage: number;
  /** Number of items per page */
  limit: number;
  /** Total number of items across all pages */
  totalItems: number;
  /** Total number of pages */
  totalPages: number;
  /** True if there is a next page */
  hasNextPage: boolean;
  /** True if there is a previous page */
  hasPrevPage: boolean;
}
