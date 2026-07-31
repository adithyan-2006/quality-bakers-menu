import { z } from 'zod';
import { EmailSchema, PasswordSchema } from '../common/schema';

/** 
 * Schema for user login requests.
 * Used by admin portal frontend forms and backend authentication endpoints.
 */
export const LoginSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
}).strict();

/** 
 * Schema for refresh token requests.
 * Used by backend endpoints for session renewal.
 */
export const RefreshTokenSchema = z.object({
  refreshToken: z.string({ required_error: "Refresh token is required" }).min(1, "Refresh token cannot be empty"),
}).strict();
