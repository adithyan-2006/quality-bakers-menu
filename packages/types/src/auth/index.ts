import type { UserId, UnixTimestamp } from '../common';

/**
 * Role of a user in the system.
 * Intended to be used for coarse-grained access control.
 */
export type UserRole = 'ADMIN' | 'MANAGER' | 'EDITOR';

/**
 * Granular permissions for the admin portal.
 * Intended to be used for fine-grained authorization checks.
 */
export type Permissions =
  | 'CREATE_PRODUCT'
  | 'UPDATE_PRODUCT'
  | 'DELETE_PRODUCT'
  | 'CREATE_CATEGORY'
  | 'UPDATE_CATEGORY'
  | 'DELETE_CATEGORY'
  | 'MANAGE_USERS';

/**
 * Request payload for login.
 * Intended to be used by the admin login form.
 */
export interface LoginRequest {
  /** User's email address */
  email: string;
  /** User's password */
  password: string;
}

/**
 * Response payload upon successful login.
 * Intended to be used to store the session on the client.
 */
export interface LoginResponse {
  /** JWT Access Token */
  accessToken: string;
  /** Basic user information */
  user: {
    id: UserId;
    email: string;
    role: UserRole;
  };
}

/**
 * Standard payload contained within the JWT.
 * Intended to be decoded and verified by backend middleware.
 */
export interface JwtPayload {
  /** User ID */
  sub: UserId;
  /** User email */
  email: string;
  /** User role */
  role: UserRole;
  /** Issued at timestamp (epoch seconds) */
  iat: UnixTimestamp;
  /** Expiration timestamp (epoch seconds) */
  exp: UnixTimestamp;
}
