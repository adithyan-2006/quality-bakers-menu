import { z } from 'zod';
import { CategoryNameSchema, CategoryDescriptionSchema, SlugSchema } from '../common/schema';
import { BaseQuerySchema } from '../api/schema';

/** 
 * Validation schema for creating a new category.
 * Safe for both frontend forms and backend API bodies.
 */
export const CreateCategorySchema = z.object({
  name: CategoryNameSchema,
  slug: SlugSchema,
  description: CategoryDescriptionSchema,
  isActive: z.boolean({ invalid_type_error: "isActive must be a boolean" }).default(true),
  sortOrder: z.number({ invalid_type_error: "sortOrder must be a number" }).int().default(0),
}).strict();

/** 
 * Validation schema for updating an existing category.
 * Makes all fields optional for partial PATCH requests.
 */
export const UpdateCategorySchema = CreateCategorySchema.partial().strict();

/** 
 * Validation schema for listing/querying categories.
 * Extends the reusable base query schema. Coerces URL string queries.
 */
export const CategoryQuerySchema = BaseQuerySchema.extend({
  isActive: z.coerce.boolean().optional(),
}).strict();
