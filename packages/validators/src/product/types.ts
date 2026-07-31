import { z } from 'zod';
import { CreateProductSchema, UpdateProductSchema, ProductQuerySchema } from './schema';

export type CreateProduct = z.infer<typeof CreateProductSchema>;
export type UpdateProduct = z.infer<typeof UpdateProductSchema>;
export type ProductQuery = z.infer<typeof ProductQuerySchema>;
