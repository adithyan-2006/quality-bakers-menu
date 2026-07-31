import type { ApiErrorCode, ValidationError } from '../errors';
import type { PaginationMeta } from '../pagination';

/**
 * A standard error payload from the API.
 */
export interface ApiErrorPayload {
  /** High level error code */
  code: ApiErrorCode;
  /** Human-readable error message */
  message: string;
  /** Optional validation details */
  details?: ValidationError;
}

/**
 * A standard error response from the API.
 * Intended to be returned on failed requests (e.g. 400, 500 status codes).
 */
export interface ApiErrorResponse {
  success: false;
  error: ApiErrorPayload;
}

/**
 * A successful API response containing data.
 * Intended to be returned on successful requests.
 */
export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
}

/**
 * A successful paginated API response.
 * Intended to be returned when fetching lists of entities.
 */
export interface ApiPaginationResponse<T> {
  success: true;
  data: T[];
  meta: PaginationMeta;
}

/**
 * Discriminated union type for all API responses.
 * Enforces checking `success` before accessing `data` or `error`.
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
