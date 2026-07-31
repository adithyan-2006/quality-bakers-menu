import { z } from 'zod';
import { CreateCategorySchema, UpdateCategorySchema, CategoryQuerySchema } from './schema';

export type CreateCategory = z.infer<typeof CreateCategorySchema>;
export type UpdateCategory = z.infer<typeof UpdateCategorySchema>;
export type CategoryQuery = z.infer<typeof CategoryQuerySchema>;
