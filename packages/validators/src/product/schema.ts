import { z } from 'zod';
import { CategoryIdSchema, ProductNameSchema, ProductDescriptionSchema, SlugSchema, PriceSchema } from '../common/schema';
import { BaseQuerySchema } from '../api/schema';
import { ImageUploadSchema } from '../image/schema';

/** 
 * Validation schema for creating a new product.
 * Safe for both frontend forms and backend API bodies.
 */
export const CreateProductSchema = z.object({
  categoryId: CategoryIdSchema,
  name: ProductNameSchema,
  slug: SlugSchema,
  description: ProductDescriptionSchema,
  price: PriceSchema,
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED'], { invalid_type_error: "Invalid product status" }).default('DRAFT'),
  ingredients: z.array(z.string({ invalid_type_error: "Ingredient must be a string" })).optional().nullable(),
  allergens: z.array(z.string({ invalid_type_error: "Allergen must be a string" })).optional().nullable(),
  sortOrder: z.number({ invalid_type_error: "sortOrder must be a number" }).int().default(0),
  images: z.array(ImageUploadSchema).optional().nullable(),
}).strict();

/** 
 * Validation schema for updating an existing product.
 * Makes all fields optional for partial PATCH requests.
 */
export const UpdateProductSchema = CreateProductSchema.partial().strict();

/** 
 * Validation schema for listing/querying products.
 * Extends the reusable base query schema.
 */
export const ProductQuerySchema = BaseQuerySchema.extend({
  categoryId: CategoryIdSchema.optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED'], { invalid_type_error: "Invalid product status" }).optional(),
}).strict();
