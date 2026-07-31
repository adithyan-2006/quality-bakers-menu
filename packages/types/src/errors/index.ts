/**
 * API error codes used across the system.
 * Intended to be used by backend to standardize error types.
 */
export type ApiErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'INTERNAL_SERVER_ERROR'
  | 'BAD_REQUEST'
  | 'CONFLICT';

/**
 * Represents a specific field validation error.
 * Intended to be used by UI forms to map errors to specific inputs.
 */
export interface FieldError {
  /** The field that caused the error */
  field: string;
  /** Human-readable error message */
  message: string;
  /** Internal error code for the specific field */
  code?: string;
}

/**
 * A detailed validation error containing multiple field errors.
 * Intended to be attached to ApiError details for form validation failures.
 */
export interface ValidationError {
  /** Array of specific field errors */
  errors: FieldError[];
}
