import { z } from 'zod';
import { PaginationSchema, SearchSchema, SortSchema, BaseQuerySchema } from './schema';

export type Pagination = z.infer<typeof PaginationSchema>;
export type Search = z.infer<typeof SearchSchema>;
export type Sort = z.infer<typeof SortSchema>;
export type BaseQuery = z.infer<typeof BaseQuerySchema>;
