import { z } from 'zod';
import { VALIDATION_CONFIG } from '@qbm/config';

/** 
 * Generic branded ID schema.
 * Safe for both frontend and backend validation of plain string IDs.
 */
export const IDSchema = z.string({ required_error: "ID is required" }).min(1, "ID cannot be empty");

/** 
 * Standard UUID v4 schema.
 * Safe for both frontend and backend validation of UUIDs.
 */
export const UUIDSchema = z.string({ required_error: "UUID is required" }).uuid("Invalid UUID format");

/** Branded ProductId schema primitive */
export const ProductIdSchema = UUIDSchema;
/** Branded CategoryId schema primitive */
export const CategoryIdSchema = UUIDSchema;
/** Branded ImageId schema primitive */
export const ImageIdSchema = IDSchema;

/** 
 * URL-friendly slug schema.
 * Enforces lowercase alphanumeric and hyphens only.
 * Safe for both frontend and backend.
 */
export const SlugSchema = z
  .string({ required_error: "Slug is required" })
  .min(1, "Slug cannot be empty")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain only lowercase letters, numbers, and hyphens");

/** 
 * Decimal price schema bounded by application limits.
 * Safe for both frontend and backend.
 */
export const PriceSchema = z
  .number({ required_error: "Price is required", invalid_type_error: "Price must be a number" })
  .min(VALIDATION_CONFIG.PRICE_MIN, `Price must be at least ${VALIDATION_CONFIG.PRICE_MIN}`)
  .max(VALIDATION_CONFIG.PRICE_MAX, `Price cannot exceed ${VALIDATION_CONFIG.PRICE_MAX}`)
  .multipleOf(Math.pow(10, -VALIDATION_CONFIG.PRICE_DECIMAL_PRECISION), `Price can only have ${VALIDATION_CONFIG.PRICE_DECIMAL_PRECISION} decimal places`);

/** 
 * Standard email format schema.
 * Safe for both frontend and backend.
 */
export const EmailSchema = z
  .string({ required_error: "Email is required" })
  .email("Invalid email address format");

/** 
 * Secure password schema bounded by application limits.
 * Safe for both frontend and backend.
 */
export const PasswordSchema = z
  .string({ required_error: "Password is required" })
  .min(VALIDATION_CONFIG.PASSWORD_MIN_LENGTH, `Password must be at least ${VALIDATION_CONFIG.PASSWORD_MIN_LENGTH} characters`)
  .max(VALIDATION_CONFIG.PASSWORD_MAX_LENGTH, `Password cannot exceed ${VALIDATION_CONFIG.PASSWORD_MAX_LENGTH} characters`);

/** Category name primitive schema */
export const CategoryNameSchema = z
  .string({ required_error: "Category name is required" })
  .min(VALIDATION_CONFIG.CATEGORY_NAME_MIN_LENGTH, `Category name must be at least ${VALIDATION_CONFIG.CATEGORY_NAME_MIN_LENGTH} characters`)
  .max(VALIDATION_CONFIG.CATEGORY_NAME_MAX_LENGTH, `Category name cannot exceed ${VALIDATION_CONFIG.CATEGORY_NAME_MAX_LENGTH} characters`);

/** Category description primitive schema */
export const CategoryDescriptionSchema = z
  .string()
  .max(VALIDATION_CONFIG.CATEGORY_DESCRIPTION_MAX_LENGTH, `Category description cannot exceed ${VALIDATION_CONFIG.CATEGORY_DESCRIPTION_MAX_LENGTH} characters`)
  .optional()
  .nullable();

/** Product name primitive schema */
export const ProductNameSchema = z
  .string({ required_error: "Product name is required" })
  .min(VALIDATION_CONFIG.PRODUCT_NAME_MIN_LENGTH, `Product name must be at least ${VALIDATION_CONFIG.PRODUCT_NAME_MIN_LENGTH} characters`)
  .max(VALIDATION_CONFIG.PRODUCT_NAME_MAX_LENGTH, `Product name cannot exceed ${VALIDATION_CONFIG.PRODUCT_NAME_MAX_LENGTH} characters`);

/** Product description primitive schema */
export const ProductDescriptionSchema = z
  .string()
  .max(VALIDATION_CONFIG.PRODUCT_DESCRIPTION_MAX_LENGTH, `Product description cannot exceed ${VALIDATION_CONFIG.PRODUCT_DESCRIPTION_MAX_LENGTH} characters`)
  .optional()
  .nullable();
